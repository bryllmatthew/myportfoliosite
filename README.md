# Portfolio + CMS

A professional portfolio and lead-generation site with its own admin CMS, for one person working across
**software development, AI automation, performance advertising and creative production**.

Everything visitors see (services, projects, advertising case studies, testimonials, homepage modules,
navigation, contact details, SEO) is managed from `/admin` and stored in Supabase.

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage, RLS) · Motion for React · React Hook Form + Zod · Vercel
- **Specification:** [`CLAUDE.md`](CLAUDE.md) and [`docs/`](docs/) (the original requirement pack)
- **Deployment guide:** [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- **Security model and RLS tests:** [`docs/RLS_VERIFICATION.md`](docs/RLS_VERIFICATION.md)

---

## Quick start (local)

Requirements: Node.js 20.9+ and a Supabase project (free tier is fine).

```bash
npm install
cp .env.example .env.local        # then fill in the values (see below)
```

1. **Create the database schema.** Apply the three files in `supabase/migrations/` in order, then
   `supabase/seed.sql`. Either:
   - Supabase CLI: `npx supabase link --project-ref <ref>` then `npx supabase db push`, then run
     `supabase/seed.sql` in the SQL editor; or
   - Dashboard: paste each migration into **SQL Editor → New query → Run**, in filename order, then the seed.
2. **Turn off public sign-ups:** Supabase dashboard → Authentication → Sign In / Providers → disable
   "Allow new users to sign up". (Even if left on, new accounts get no CMS access.)
3. **Create your admin account:**
   ```bash
   npm run admin:create -- --email you@example.com --password "a-long-unique-password"
   ```
4. **Run it:**
   ```bash
   npm run dev
   ```
   Site: http://localhost:3000 · Admin: http://localhost:3000/admin

Without Supabase variables the site still builds and renders, with empty states and default navigation.

## Environment variables

| Name | Where | Required | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | app | yes (prod) | Canonical URLs, sitemap, Open Graph. No trailing slash. |
| `NEXT_PUBLIC_SUPABASE_URL` | app | yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | app | yes | Public anon key (safe in the browser; RLS protects data). |
| `INQUIRY_HASH_SALT` | server | recommended | Random string for hashing visitor IPs used in contact-form rate limiting. |
| `INQUIRY_WEBHOOK_URL` | server | optional | Each new inquiry is POSTed here as JSON (Zapier, Make, n8n, GoHighLevel, Slack…). |
| `SUPABASE_SERVICE_ROLE_KEY` | your machine only | for `admin:create` | Never add this to Vercel. The web app never reads it. |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint (Next.js core web vitals + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | lint + typecheck + build |
| `npm run test:rls` | Applies all migrations + seed to an in-process Postgres and verifies 41 RLS/security rules |
| `npm run admin:create` | Creates or promotes a CMS admin (uses the service-role key from `.env.local`) |

## Architecture

```
app/
  (public)/            Public site: home, services, work, case studies, about, contact (ISR, revalidate 1h)
  admin/login          Sign-in (no public sign-up)
  admin/(protected)/   CMS; every page calls requireAdmin() server-side
  api/preview          Draft Mode entry/exit for admin previews
  sitemap.ts robots.ts
components/
  public/ admin/ motion/ media/ forms/ ui/ analytics/
lib/
  supabase/            env, public (cookie-free anon), server (session), client (browser), middleware (proxy)
  auth/                getAdminContext / requireAdmin / assertAdmin, safe redirects
  queries/             public reads, admin reads, row mappers, homepage config parsing
  actions/             Server Actions: contact form, auth, admin CRUD (all Zod-validated)
  validations/         Zod schemas shared by forms and actions
  seo/ analytics/ notifications/ utils/
supabase/
  migrations/          schema, RLS + grants + submit_inquiry(), storage bucket + policies
  seed.sql             starter content (idempotent)
scripts/
  verify-rls.mjs       RLS test suite (PGlite)
  create-admin.mjs     admin bootstrap
proxy.ts               Session refresh + redirect for /admin (Next 16 "proxy", formerly middleware)
```

**Rendering and caching.** Public pages are statically generated and revalidated hourly. They read through a
cookie-free anonymous Supabase client, so RLS only ever returns published rows. Its fetches are tagged `cms`.
Every admin mutation calls `updateTag("cms")` and `revalidatePath("/", "layout")`, so edits appear on the live
site immediately. After changing data directly in Supabase (SQL editor, seed), use
**Settings → Refresh the live site**.

**Preview.** "Preview" in an editor opens `/api/preview`, which checks admin authorization server-side, enables
Next.js Draft Mode, and redirects to the page. Draft reads use the admin's session. Visitors never see drafts.

**Authorization.** Supabase Auth handles identity. CMS access requires a row in `public.admin_users`. That's
checked by the `is_admin()` SQL function in every RLS policy *and* again server-side in every admin page and
Server Action.

**Contact form.** Zod validation, a honeypot, and a minimum fill time run in the Server Action. Rows are written
only through the `submit_inquiry()` database function, which re-validates input, accepts only published
service IDs, and rate-limits per visitor (salted IP hash) and site-wide. Anonymous users cannot read inquiries.
Notifications run after the response via `after()` (see `lib/notifications/inquiry.ts` to add email).

**Media.** The admin uploads straight from the browser to the `public-media` bucket. Storage RLS allows only
admins to write, and the bucket enforces size and MIME limits. Uploads are recorded in `media_library`, and
deletion is blocked while a file is still referenced.

**Motion.** Scroll reveals, staggered lists, subtle parallax, an interpolated cursor glow, pointer-depth on the
hero canvas, magnetic primary CTAs, and count-up metrics. Pointer effects run only on desktop fine-pointer
devices. `prefers-reduced-motion` disables parallax, pointer effects, large transforms and looping motion.
There is no scroll-jacking.

**Analytics.** `lib/analytics` exposes `track()` and a delegated listener for `data-track="cta_click"` etc.
Events go to `window.dataLayer` (GTM/GA4) and a `portfolio:analytics` DOM event any vendor can subscribe to.

## Content guidelines

- The seeded **services** are published. Rewrite their copy in `/admin/services`.
- The seeded **sample projects** and **sample case study** are drafts titled "Sample:". Their metrics are
  placeholders (`0`). Replace them with your real work or delete them. **Never publish invented results.**
- No testimonials or social links are seeded, because those must be real. Add them in the admin.
- Replace "Your Name" in **Profile** and **Settings** before launch.
