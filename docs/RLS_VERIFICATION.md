# Security model and RLS verification

## Model

| Actor | Can read | Can write |
| --- | --- | --- |
| Anonymous visitor (`anon`) | Published services/projects/case studies/testimonials and their child rows; active navigation and social links; site settings, profile, contact settings, homepage modules, page settings, taxonomies | Nothing directly. Inquiries only through `submit_inquiry()` |
| Signed-in user **not** in `admin_users` | Same as anonymous | Nothing |
| Admin (`admin_users` row) | Everything except other users' allowlist rows | All CMS tables, media, inquiry status. Audit log is append-only and stamped with their own user id |

Enforcement layers:

1. **Postgres grants.** `anon` has `SELECT` on public content tables only. It has no privileges on
   `inquiries`, `media_library`, `audit_logs` or `admin_users`.
2. **Row Level Security** on every table, with `public.is_admin()` (a `security definer` lookup in `admin_users`).
3. **Server-side checks.** Every admin page calls `requireAdmin()`, and every admin Server Action runs through
   `runAdmin()` → `assertAdmin()`, before touching data.
4. **Storage policies.** `public-media` is publicly readable. Insert, update and delete require `is_admin()`. The
   bucket enforces file size and MIME types.
5. **Inquiry function.** `submit_inquiry()` validates and trims input, ignores unknown or unpublished service ids,
   forces `status = 'new'`, and rate-limits to 3 per visitor per 10 minutes and 60 site-wide per hour.

## Automated tests

```bash
npm run test:rls
```

`scripts/verify-rls.mjs` loads every migration and the seed into an in-process Postgres (PGlite), with minimal
stand-ins for Supabase's `auth.uid()`, the `anon`/`authenticated` roles, and `storage.objects`. It then runs these
checks as each actor:

| # | Required by spec | Check |
| --- | --- | --- |
| 1 | anon cannot read draft project | ✓ |
| 2 | anon can read published project | ✓ |
| 3 | anon can insert inquiry | ✓ via `submit_inquiry()`. Direct `INSERT` is denied. |
| 4 | anon cannot list inquiries | ✓ |
| 5 | authenticated unauthorized user cannot mutate CMS | ✓ update/insert/delete on services, projects, settings; no self-promotion into `admin_users`; no uploads; no audit writes |
| 6 | authorized admin can CRUD CMS | ✓ create (with children), read drafts, publish, archive, delete, manage inquiries, upload |

Also covered: draft child rows hidden (metrics), invalid email rejected, forged service id dropped, rate limit,
audit log forgery blocked and append-only, slug format enforced, and the seed is idempotent.

Also covered: brands (public sees active only; only admins can write), the imported content counts, and the
homepage module order.

Last run: **49 passed, 0 failed.**

## Verifying against the real project

The PGlite stand-ins model only what the policies depend on. After deploying, confirm on the real project with
the Supabase SQL editor (it runs as `postgres`, so impersonate roles explicitly):

```sql
-- As anonymous: should return 0 rows for drafts, and error on inquiries
begin;
set local role anon;
select count(*) from public.projects where status = 'draft';   -- 0
select * from public.inquiries;                                -- permission denied
rollback;

-- As a signed-in non-admin (replace with a real non-admin user id)
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}', true);
update public.services set title = title;                       -- UPDATE 0
rollback;
```

Also check **Advisors → Security** in the Supabase dashboard after applying the migrations.
