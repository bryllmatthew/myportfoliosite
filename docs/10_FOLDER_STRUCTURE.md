# Recommended Folder Structure

```text
app/
  (public)/
    page.tsx
    about/
    services/
      page.tsx
      [slug]/
    work/
      page.tsx
      [slug]/
    case-studies/
      page.tsx
      [slug]/
    contact/
  admin/
    login/
    (protected)/
      layout.tsx
      page.tsx
      home/
      profile/
      services/
      projects/
      case-studies/
      testimonials/
      media/
      contact/
      navigation/
      seo/
      settings/
  api/                 # only where route handlers are justified
  sitemap.ts
  robots.ts

components/
  public/
  admin/
  motion/
  forms/
  media/
  ui/

lib/
  supabase/
    client.ts
    server.ts
    middleware.ts
  auth/
  queries/
  actions/
  validations/
  seo/
  analytics/
  utils/

types/

supabase/
  migrations/
  seed.sql

public/

docs/
```

## Rules
- Do not put all database logic in page files.
- Separate reads, mutations, and validation.
- Keep animation primitives reusable.
- Keep public and admin components clearly separated.
- Prefer feature-oriented organization if the project grows.
