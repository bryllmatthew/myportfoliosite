# Implementation Phases

## Phase 0 — Project Setup
- initialize Next.js TypeScript
- Tailwind
- shadcn/ui
- linting
- folder conventions
- env example
- Supabase clients
- README

Deliverable: clean build.

## Phase 1 — Design System & Shell
- theme tokens
- typography
- public header/footer
- admin shell
- buttons/cards/forms
- responsive container system

Do not spend time on advanced animation yet.

## Phase 2 — Supabase
- migrations
- tables
- enums/check constraints
- indexes
- triggers
- seed data
- RLS
- storage bucket/policies

Deliverable: schema reproducible from repository.

## Phase 3 — Admin Authentication
- login
- protected routes
- authorization
- logout
- admin dashboard

## Phase 4 — Core CMS
Implement in this order:
1. site/profile/settings
2. services
3. projects
4. case studies
5. testimonials/social/navigation
6. media library
7. homepage editor

## Phase 5 — Public Website
Implement:
- home
- services
- service detail
- work
- project detail
- case studies
- case study detail
- about
- contact

All public content must use CMS data.

## Phase 6 — Contact
- contact settings
- inquiry validation
- anonymous insert through secure application flow
- admin inquiry management
- spam mitigation

## Phase 7 — Motion
Add:
- Reveal
- stagger
- parallax media
- mouse glow
- pointer depth
- selective magnetic CTA
- metric reveals

Then test reduced motion and mobile.

## Phase 8 — SEO & Performance
- metadata
- sitemap
- robots
- JSON-LD
- caching/revalidation strategy
- image optimization
- bundle review

## Phase 9 — QA
Test all CRUD and publishing flows.
Test RLS.
Test broken/empty states.
Run build/lint/typecheck.
Fix warnings that indicate real issues.

## Phase 10 — Deployment
- Vercel documentation
- production environment variables
- Supabase production config
- admin bootstrap instructions
- custom domain instructions
- post-deployment checklist
