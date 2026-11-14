#!/usr/bin/env node
/**
 * Bootstrap (or promote) a CMS admin.
 *
 *   npm run admin:create -- --email you@example.com --password "a-long-password"
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * - Creates the Supabase Auth user (email pre-confirmed) if it does not exist.
 * - Adds the user to public.admin_users (role "admin").
 * The service-role key is used only here, on your machine, never in the web app.
 * Existing users keep their password unless --password is passed.
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (arg("email") ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
let password = arg("password") ?? process.env.ADMIN_PASSWORD;
const role = arg("role") ?? "admin";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run admin:create -- --email you@example.com [--password "..."] [--role admin|editor]');
  process.exit(1);
}
if (!["admin", "editor"].includes(role)) {
  console.error('--role must be "admin" or "editor".');
  process.exit(1);
}
if (password && password.length < 12) {
  console.error("Use a password of at least 12 characters.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUser(target) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

let user = await findUser(email);
let generated = false;

if (!user) {
  if (!password) {
    password = randomBytes(18).toString("base64url");
    generated = true;
  }
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    console.error(`Could not create the user: ${error.message}`);
    process.exit(1);
  }
  user = data.user;
  console.log(`Created auth user ${email}.`);
} else {
  console.log(`Found existing auth user ${email}.`);
  if (password) {
    const { error } = await supabase.auth.admin.updateUserById(user.id, { password });
    if (error) {
      console.error(`Could not update the password: ${error.message}`);
      process.exit(1);
    }
    console.log("Password updated.");
  }
}

const { error: adminError } = await supabase.from("admin_users").upsert({ user_id: user.id, role }, { onConflict: "user_id" });
if (adminError) {
  console.error(`Could not add the user to admin_users: ${adminError.message}`);
  console.error("Have the migrations been applied? See docs/DEPLOYMENT.md.");
  process.exit(1);
}

console.log(`${email} is now a CMS ${role}. Sign in at /admin/login.`);
if (generated) {
  console.log(`\nGenerated password (shown once, store it in a password manager):\n  ${password}\n`);
}
