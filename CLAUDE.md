# Professional Portfolio — Claude Code Master Instructions

## Project Goal
Build a production-ready, modern, responsive professional portfolio and personal services website for a multidisciplinary professional specializing in:

1. Full-Stack Software Development
2. AI Automation
3. Digital Marketing, Social Media Marketing & Paid Advertising
4. Creative Services: Video Editing & Graphic Design

This is NOT a static portfolio. Build it as a dynamic portfolio + lightweight CMS with a secure admin dashboard so all important public-facing content can be updated without editing code.

## Core Stack
- Next.js 15+ using App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui where appropriate
- Supabase:
  - PostgreSQL
  - Auth
  - Storage
  - Row Level Security
- Vercel deployment
- Framer Motion / Motion for React for UI animation
- GSAP + ScrollTrigger only where it adds clear value for premium parallax/scroll sequences
- React Hook Form + Zod
- Lucide icons
- next/image
- next/font

Do not introduce unnecessary infrastructure.

## Product Principles
- Premium, modern, technical, creative, and conversion-focused.
- The site should communicate "developer + automation specialist + marketer + creative" without feeling fragmented.
- Motion should enhance hierarchy, not distract.
- Strong visual storytelling and case-study presentation.
- Mobile-first and responsive.
- Fast despite visual richness.
- Accessibility and reduced-motion support are mandatory.
- Content must come from Supabase wherever practical.
- Avoid hard-coded portfolio content except safe initial seed/demo content.
- Admin must be usable by a non-developer.

## Public Information Architecture
- /
- /services
- /services/[slug]
- /work
- /work/[slug]
- /case-studies
- /case-studies/[slug]
- /about (recommended)
- /contact

## Admin Information Architecture
- /admin/login
- /admin
- /admin/home
- /admin/profile
- /admin/services
- /admin/services/new
- /admin/services/[id]
- /admin/projects
- /admin/projects/new
- /admin/projects/[id]
- /admin/case-studies
- /admin/case-studies/new
- /admin/case-studies/[id]
- /admin/testimonials
- /admin/media
- /admin/contact
- /admin/navigation
- /admin/seo
- /admin/settings

## Main Public Navigation
Home
Services
My Work
Advertising Case Studies
Contact

## Services
Seed these four services:
- Software Development
- Digital Marketing
- AI Automation
- Creative Services

Services must be database-driven and support adding new services without new frontend code.

## Design Direction
Use a sophisticated dark-first visual system with optional light sections if they improve contrast.

Visual personality:
- editorial typography
- large headings
- generous whitespace
- restrained gradients/glows
- subtle grid/noise/technical accents
- glass effects only where appropriate
- crisp cards
- premium SaaS/creative studio feel
- strong project imagery
- strong metrics presentation

Avoid:
- excessive neon
- generic AI imagery
- constant floating objects
- overuse of glassmorphism
- animation on every element
- giant blocks of text
- template-like portfolio layouts

## Motion System
Implement:
- subtle mouse-following ambient glow on desktop
- pointer-reactive hero visual
- layered parallax in selected sections
- scroll reveal animations
- staggered cards
- image scale/reveal on scroll
- smooth number/metric reveals
- subtle magnetic behavior on selected primary CTA buttons
- tasteful page transitions if they do not harm navigation
- reduced-motion mode
- disable/limit pointer tracking on touch devices

Do not make the cursor difficult to use.
Do not hijack scrolling.
Do not create scroll-jacking.
Keep animation transforms GPU-friendly.

## CMS / Admin Requirement
Every major section must be manageable through /admin:
- homepage content and section visibility/order
- profile/bio
- services
- work/projects
- advertising case studies
- testimonials
- contact information
- social links
- CTA labels/URLs
- navigation
- SEO defaults and per-page SEO
- media uploads
- featured content
- draft/published state

Use Supabase Auth. Public signup must NOT create admin users.

## Engineering Standards
- Strict TypeScript.
- Prefer Server Components for data-heavy/public content.
- Client Components only where interaction requires them.
- Server Actions or secure route handlers for mutations.
- Validate all writes with Zod.
- Never expose service-role secrets to the browser.
- RLS is mandatory.
- Sanitize/validate rich text.
- Use reusable components.
- Use loading, error, empty, and success states.
- Use optimistic UI only where safe.
- Use semantic HTML.
- Keyboard accessibility is required.
- Aim for WCAG 2.2 AA.
- Lighthouse-oriented performance decisions.
- No fake functionality.

## SEO
Implement:
- Next.js metadata API
- dynamic metadata for services/projects/case studies
- canonical URLs
- Open Graph/Twitter cards
- sitemap.xml
- robots.txt
- JSON-LD Person/ProfessionalService where appropriate
- Project/CreativeWork or Article schema where appropriate
- clean slugs
- alt text management in admin

## Analytics Readiness
Create an abstraction for analytics events:
- CTA click
- contact click
- service view
- project view
- case study view
- external portfolio link
- email click
- phone click

Do not require a specific analytics vendor to complete the core build.

## Contact
Build a functional contact form with:
- name
- email
- company
- service interest
- budget range (optional/configurable)
- message
- anti-spam strategy
- validation
- success/error states

Store inquiries in Supabase. Structure the code so transactional email notification can be added easily.

## Implementation Order
1. Foundation and design system
2. Supabase schema/RLS/storage
3. Admin auth and layout
4. CMS CRUD
5. Public pages
6. Motion/parallax
7. Contact/inquiries
8. SEO/performance/accessibility
9. Seed content
10. QA and deployment documentation

## Definition of Done
Do not call the project complete until:
- public pages are responsive
- admin CRUD works
- image upload works
- publish/draft works
- content updates appear on frontend
- RLS is implemented
- public cannot access admin data/mutations
- mobile animations are appropriate
- reduced-motion works
- SEO metadata works
- contact form persists inquiry
- empty/loading/error states exist
- build passes
- lint/typecheck passes
- deployment documentation exists

Read all markdown specifications in /docs before implementation.
