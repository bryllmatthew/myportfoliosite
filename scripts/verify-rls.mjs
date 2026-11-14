#!/usr/bin/env node
/**
 * RLS verification suite.
 *
 * Applies every migration in supabase/migrations plus supabase/seed.sql to an
 * in-process Postgres (PGlite) with minimal stand-ins for Supabase's `auth`
 * and `storage` schemas, then exercises the policies as `anon`, a signed-in
 * non-admin user, and an allowlisted admin.
 *
 * Run: npm run test:rls
 *
 * The stand-ins model only what the policies rely on (auth.uid(), the
 * anon/authenticated roles, storage.objects). Re-run the same checks against
 * a real project before launch — see docs/RLS_VERIFICATION.md.
 */
import { PGlite } from "@electric-sql/pglite";
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const db = new PGlite();

const ADMIN = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const DRAFT_PROJECT = "22222222-2222-4222-8222-000000000001";
const DRAFT_CASE = "33333333-3333-4333-8333-000000000001";
const SERVICE = "11111111-1111-4111-8111-000000000001";
const HIDDEN_BRAND = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

const SUPABASE_STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;

  create schema storage;
  create table storage.buckets (
    id text primary key, name text not null, public boolean default false,
    file_size_limit bigint, allowed_mime_types text[]
  );
  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets (id),
    name text, owner uuid, metadata jsonb
  );
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon, authenticated;
  grant select, insert, update, delete on storage.objects to anon, authenticated;
`;

let passed = 0;
let failed = 0;

function report(ok, name, detail = "") {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ""}`);
  }
}

/** Run SQL inside a transaction as a given role/JWT subject; always rolls back. */
async function as(role, sub, sql, params = []) {
  await db.exec("begin");
  try {
    await db.query(`select set_config('request.jwt.claim.sub', $1, true)`, [sub ?? ""]);
    await db.exec(`set local role ${role}`);
    const res = await db.query(sql, params);
    return { rows: res.rows, affected: res.affectedRows ?? 0, error: null };
  } catch (error) {
    return { rows: [], affected: 0, error };
  } finally {
    await db.exec("rollback");
  }
}

/** Same as `as` but commits (used to build up state like rate-limit history). */
async function asCommit(role, sub, sql, params = []) {
  await db.exec("begin");
  try {
    await db.query(`select set_config('request.jwt.claim.sub', $1, true)`, [sub ?? ""]);
    await db.exec(`set local role ${role}`);
    const res = await db.query(sql, params);
    await db.exec("commit");
    return { rows: res.rows, error: null };
  } catch (error) {
    await db.exec("rollback");
    return { rows: [], error };
  }
}

const anon = (sql, params) => as("anon", null, sql, params);
const user = (sql, params) => as("authenticated", USER, sql, params);
const admin = (sql, params) => as("authenticated", ADMIN, sql, params);

async function setup() {
  await db.exec(SUPABASE_STUBS);
  const dir = join(root, "supabase", "migrations");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    await db.exec(await readFile(join(dir, file), "utf8"));
    console.log(`  applied ${file}`);
  }
  await db.exec(await readFile(join(root, "supabase", "seed.sql"), "utf8"));
  console.log("  applied seed.sql");
  // Re-running the seed must be harmless.
  await db.exec(await readFile(join(root, "supabase", "seed.sql"), "utf8"));
  console.log("  re-applied seed.sql (idempotency)");

  await db.exec(`
    insert into auth.users (id, email) values
      ('${ADMIN}', 'admin@example.test'), ('${USER}', 'user@example.test');
    insert into public.admin_users (user_id, role) values ('${ADMIN}', 'admin');

    -- Draft fixtures (the seed itself only contains published content).
    insert into public.projects (id, title, slug, status) values ('${DRAFT_PROJECT}', 'Draft project', 'draft-project', 'draft');
    insert into public.case_studies (id, title, slug, status) values ('${DRAFT_CASE}', 'Draft case study', 'draft-case-study', 'draft');
    insert into public.case_study_metrics (case_study_id, label, value_numeric, value_text) values ('${DRAFT_CASE}', 'ROAS', 1, '1');
    insert into public.brands (id, name, is_active) values ('${HIDDEN_BRAND}', 'Hidden brand', false);
  `);
}

async function run() {
  console.log("\nSetup");
  await setup();

  console.log("\n1. Anonymous visitors");
  {
    const r = await anon(`select id from public.projects where id = $1`, [DRAFT_PROJECT]);
    report(!r.error && r.rows.length === 0, "anon cannot read a draft project");
  }
  {
    await db.query(`update public.projects set status = 'published' where id = $1`, [DRAFT_PROJECT]);
    const r = await anon(`select id, published_at from public.projects where id = $1`, [DRAFT_PROJECT]);
    report(!r.error && r.rows.length === 1, "anon can read a published project");
    report(r.rows[0]?.published_at != null, "publishing stamps published_at");
    await db.query(`update public.projects set status = 'draft' where id = $1`, [DRAFT_PROJECT]);
  }
  {
    const r = await anon(`select count(*)::int as n from public.services where status = 'published'`);
    report(r.rows[0]?.n === 4, "anon can read the 4 published services", JSON.stringify(r.rows));
  }
  {
    const r = await anon(`select
      (select count(*) from public.projects)::int as projects,
      (select count(*) from public.case_studies)::int as cases,
      (select count(*) from public.project_media)::int as media,
      (select count(*) from public.testimonials)::int as testimonials`);
    const row = r.rows[0] ?? {};
    report(row.projects === 27 && row.cases === 7 && row.media === 180 && row.testimonials === 1,
      "anon sees exactly the imported published content (seed ran twice)", JSON.stringify(row));
  }
  {
    const r = await anon(`select count(*)::int as n, bool_and(is_active) as all_active from public.brands`);
    report(r.rows[0]?.n === 19 && r.rows[0]?.all_active === true, "anon sees the 19 active brands but not hidden ones", JSON.stringify(r.rows[0]));
  }
  {
    const r = await anon(`insert into public.brands (name) values ('Evil')`);
    report(!!r.error, "anon cannot add brands");
  }
  {
    const r = await anon(`select count(*)::int as n from public.case_study_metrics where case_study_id = $1`, [DRAFT_CASE]);
    report(r.rows[0]?.n === 0, "anon cannot read metrics of a draft case study");
  }
  {
    const r = await anon(`select count(*)::int as n from public.project_media`);
    report(!r.error, "anon can query project_media (filtered by parent status)");
  }
  {
    const r = await anon(
      `select public.submit_inquiry($1, $2, $3, $4, $5, $6, $7, $8) as id`,
      ["Ada", "ada@example.test", "I need a dashboard for my team.", "Acme", SERVICE, "Not sure yet", "/contact", "hash-a"],
    );
    report(!r.error && typeof r.rows[0]?.id === "string", "anon can submit an inquiry", r.error?.message);
  }
  {
    const r = await anon(
      `insert into public.inquiries (name, email, message) values ('x', 'x@example.test', 'direct insert attempt')`,
    );
    report(!!r.error, "anon cannot insert into inquiries directly (only via submit_inquiry)");
  }
  {
    const r = await anon(`select * from public.inquiries`);
    report(!!r.error || r.rows.length === 0, "anon cannot list inquiries");
  }
  {
    const r = await anon(`select public.submit_inquiry('Bob', 'not-an-email', 'Long enough message here')`);
    report(!!r.error && /invalid_email/.test(r.error.message), "submit_inquiry rejects an invalid email");
  }
  {
    const r = await anon(
      `select i.status, i.service_id from public.inquiries i`,
    );
    report(!!r.error || r.rows.length === 0, "anon cannot read back inquiry rows");
  }
  {
    // Client-supplied foreign keys are not trusted: a draft/unknown service is dropped.
    const r = await asCommit(
      "anon", null,
      `select public.submit_inquiry('Cy', 'cy@example.test', 'Testing unknown service id', null, $1, null, null, 'hash-fk') as id`,
      ["99999999-9999-4999-8999-999999999999"],
    );
    const row = await db.query(`select service_id from public.inquiries where id = $1`, [r.rows[0]?.id]);
    report(!r.error && row.rows[0]?.service_id === null, "submit_inquiry ignores unknown/unpublished service ids");
  }
  {
    let lastError = null;
    for (let i = 0; i < 4; i++) {
      const r = await asCommit(
        "anon", null,
        `select public.submit_inquiry('Rate', 'rate@example.test', 'Rate limit test message', null, null, null, null, 'hash-rl')`,
      );
      lastError = r.error;
    }
    report(!!lastError && /rate_limited/.test(lastError.message), "submit_inquiry rate-limits a client after 3 in 10 minutes");
  }
  {
    const tables = ["audit_logs", "media_library", "admin_users"];
    for (const t of tables) {
      const r = await anon(`select * from public.${t}`);
      report(!!r.error || r.rows.length === 0, `anon cannot read ${t}`);
    }
  }
  {
    const r = await anon(`update public.services set title = 'Hacked' where id = $1`, [SERVICE]);
    report(!!r.error || r.affected === 0, "anon cannot update services");
  }
  {
    const r = await anon(`insert into storage.objects (bucket_id, name) values ('public-media', 'x/evil.png')`);
    report(!!r.error, "anon cannot upload to public-media");
  }

  console.log("\n2. Signed-in user who is NOT an admin");
  {
    const r = await user(`select id from public.projects where id = $1`, [DRAFT_PROJECT]);
    report(!r.error && r.rows.length === 0, "non-admin cannot read draft projects");
  }
  {
    const r = await user(`update public.projects set title = 'Hacked' where id = $1`, [DRAFT_PROJECT]);
    report(!r.error && r.affected === 0, "non-admin update affects 0 rows");
  }
  {
    const r = await user(`update public.services set title = 'Hacked' where id = $1`, [SERVICE]);
    report(!r.error && r.affected === 0, "non-admin cannot update a published service");
  }
  {
    const r = await user(
      `insert into public.services (title, slug, status) values ('Evil', 'evil', 'published')`,
    );
    report(!!r.error, "non-admin cannot create services");
  }
  {
    const r = await user(`delete from public.services where id = $1`, [SERVICE]);
    report(!r.error && r.affected === 0, "non-admin cannot delete services");
  }
  {
    const r = await user(`update public.site_settings set site_name = 'Hacked'`);
    report(!r.error && r.affected === 0, "non-admin cannot change site settings");
  }
  {
    const r = await user(`insert into public.brands (name) values ('Evil')`);
    report(!!r.error, "non-admin cannot add brands");
  }
  {
    const r = await user(`update public.brands set name = 'Hacked'`);
    report(!r.error && r.affected === 0, "non-admin cannot edit brands");
  }
  {
    const r = await user(`insert into public.admin_users (user_id) values ($1)`, [USER]);
    report(!!r.error, "non-admin cannot add themselves to admin_users");
  }
  {
    const r = await user(`select * from public.inquiries`);
    report(!r.error && r.rows.length === 0, "non-admin cannot read inquiries");
  }
  {
    const r = await user(`insert into storage.objects (bucket_id, name) values ('public-media', 'x/evil.png')`);
    report(!!r.error, "non-admin cannot upload to public-media");
  }
  {
    const r = await user(
      `insert into public.audit_logs (user_id, action, entity_type) values ($1, 'create', 'x')`,
      [USER],
    );
    report(!!r.error, "non-admin cannot write audit logs");
  }

  console.log("\n3. Allowlisted admin");
  {
    const r = await admin(`select public.is_admin() as ok`);
    report(r.rows[0]?.ok === true, "is_admin() is true for the admin");
  }
  {
    const r = await admin(`select id from public.projects where id = $1`, [DRAFT_PROJECT]);
    report(r.rows.length === 1, "admin can read drafts");
  }
  {
    const r = await admin(`
      with s as (
        insert into public.services (title, slug, status) values ('New service', 'new-service', 'draft') returning id
      ), c as (
        insert into public.service_capabilities (service_id, title) select id, 'Cap' from s returning id
      )
      select (select count(*) from s)::int as services, (select count(*) from c)::int as caps
    `);
    report(!r.error && r.rows[0]?.services === 1 && r.rows[0]?.caps === 1, "admin can create a service with children", r.error?.message);
  }
  {
    const r = await admin(`update public.projects set status = 'published' where id = $1`, [DRAFT_PROJECT]);
    report(!r.error && r.affected === 1, "admin can publish a project");
  }
  {
    const r = await admin(`update public.case_studies set status = 'archived' where id = $1`, [DRAFT_CASE]);
    report(!r.error && r.affected === 1, "admin can archive a case study");
  }
  {
    const r = await admin(`delete from public.projects where id = $1`, [DRAFT_PROJECT]);
    report(!r.error && r.affected === 1, "admin can delete a project");
  }
  {
    const r = await admin(`select count(*)::int as n from public.brands`);
    report(r.rows[0]?.n === 20, "admin sees hidden brands too");
  }
  {
    const r = await admin(`with b as (insert into public.brands (name, is_active) values ('New brand', true) returning id) delete from public.brands where id in (select id from b)`);
    report(!r.error, "admin can add and remove brands", r.error?.message);
  }
  {
    const r = await admin(`select section_key from public.home_sections order by sort_order`);
    const keys = r.rows.map((x) => x.section_key).join(",");
    report(keys === "hero,brands,expertise,intro,services,work,case_study,process,stack,video,testimonials,cta", "homepage modules are in the intended order", keys);
  }
  {
    const r = await admin(`select count(*)::int as n from public.inquiries`);
    report(!r.error && r.rows[0]?.n > 0, "admin can read inquiries");
  }
  {
    const r = await admin(`update public.inquiries set status = 'read'`);
    report(!r.error && r.affected > 0, "admin can update inquiry status");
  }
  {
    const r = await admin(
      `insert into public.audit_logs (user_id, action, entity_type) values ($1, 'create', 'service')`,
      [ADMIN],
    );
    report(!r.error, "admin can write their own audit entries");
  }
  {
    const r = await admin(
      `insert into public.audit_logs (user_id, action, entity_type) values ($1, 'create', 'service')`,
      [USER],
    );
    report(!!r.error, "admin cannot forge audit entries for another user");
  }
  {
    const r = await admin(`update public.audit_logs set action = 'tampered'`);
    report(!!r.error || r.affected === 0, "audit logs are append-only");
  }
  {
    const r = await admin(`insert into storage.objects (bucket_id, name) values ('public-media', 'projects/1/a.png')`);
    report(!r.error, "admin can upload to public-media");
  }
  {
    const r = await admin(`insert into public.services (title, slug) values ('Bad', 'Bad Slug!')`);
    report(!!r.error, "slug format is enforced by the database");
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
