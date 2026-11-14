# Deployment guide (Supabase + Vercel)

Plan for about 20 minutes the first time.

## 1. Supabase (production project)

1. Create a project at https://supabase.com/dashboard (or use the existing one linked to this repository).
2. **Apply the schema**, in this order:
   1. `supabase/migrations/20261114000001_schema.sql`
   2. `supabase/migrations/20261114000002_rls.sql`
   3. `supabase/migrations/20261114000003_storage.sql`

   Choose one method:
   - **GitHub integration** (if the Supabase project is connected to this repo): merging to the production
     branch applies new files in `supabase/migrations/` automatically. Check **Database → Migrations**.
   - **CLI:** `npx supabase link --project-ref <project-ref>` then `npx supabase db push`.
   - **SQL Editor:** paste each file and run it.
3. **Seed starter content:** run `supabase/seed.sql` in the SQL Editor. It is safe to run more than once.
   (The GitHub integration and `db push` do not run the seed on production.)
4. **Auth settings** (Authentication):
   - Sign In / Providers → Email: enabled. **Disable "Allow new users to sign up".**
   - URL Configuration → Site URL: `https://your-domain.com`. Add `https://*.vercel.app` to the redirect URLs
     if you want to sign in on preview deployments.
5. **Storage:** the migration creates the public `public-media` bucket (50 MB limit; images, MP4/WebM, PDF).
   Nothing else is needed.
6. **Keys:** Project Settings → API. Copy the project URL, the `anon` public key, and (for step 3 below only)
   the `service_role` key.

## 2. Create the first admin

On your machine, with `.env.local` holding `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`:

```bash
npm run admin:create -- --email you@example.com --password "a-long-unique-password"
```

Without the script: create the user in **Authentication → Users → Add user** (auto-confirm), then run in the
SQL Editor:

```sql
insert into public.admin_users (user_id, role)
select id, 'admin' from auth.users where email = 'you@example.com'
on conflict (user_id) do nothing;
```

To remove access: `delete from public.admin_users where user_id = '<uuid>';`

## 3. Vercel

1. Import the GitHub repository at https://vercel.com/new (framework preset: Next.js, defaults are fine).
2. Environment variables (Production and Preview):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` (Production). For Preview you can omit it, and the Vercel URL is used. |
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
   | `INQUIRY_HASH_SALT` | any long random string, e.g. `openssl rand -hex 32` |
   | `INQUIRY_WEBHOOK_URL` | optional |

   **Do not add `SUPABASE_SERVICE_ROLE_KEY` to Vercel.** The app does not use it.
3. Deploy. `NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them.

## 4. Custom domain

Vercel → Project → Settings → Domains → add `your-domain.com` (and `www`). Follow the DNS records shown
(an A record `76.76.21.21` for the apex, a CNAME `cname.vercel-dns.com` for `www`, or use Vercel nameservers).
Then update `NEXT_PUBLIC_SITE_URL` and the Supabase Site URL, and redeploy.

## 5. Post-deployment checklist

> If you ran `seed.sql` (or any SQL) *after* the first deploy, open **Admin → Settings → Refresh the live site**
> once. Public pages are cached and only refresh automatically on admin saves or after an hour.

- [ ] `/` loads, and services appear (seed applied, env vars correct).
- [ ] `/admin` redirects to `/admin/login`. Sign in works, and a non-admin account is refused.
- [ ] Edit a service title, then save. The change shows on `/services` immediately.
- [ ] Upload an image in **Media library**, then use it as a project cover.
- [ ] Create a project as **draft**. It is *not* visible at `/work/<slug>` in a private window. **Preview**
      shows it to you. **Publish** makes it public.
- [ ] Submit the contact form. The inquiry appears in **Contact and inquiries**.
- [ ] `/sitemap.xml` and `/robots.txt` use your real domain.
- [ ] Replace "Your Name", the sample projects, and the sample case study. Add real social links.
- [ ] Optional: run Lighthouse on `/` and a project page (mobile).
- [ ] Optional: Supabase → Advisors → Security / Performance shows no critical issues.

## Updating the schema later

Add a new file to `supabase/migrations/` named `YYYYMMDDHHMMSS_description.sql`. Never edit a migration that
has already been applied. Run `npm run test:rls` before pushing.
