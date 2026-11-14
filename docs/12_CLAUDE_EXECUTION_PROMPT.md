# One-Shot Claude Code Execution Prompt

Use this prompt after placing CLAUDE.md and the /docs files in the repository root.

---

Read `CLAUDE.md` and every Markdown file inside `/docs` before writing implementation code.

Your task is to build the complete production-ready professional portfolio specified by those documents using Next.js, TypeScript, Supabase, Tailwind, and Vercel-compatible architecture.

Work autonomously and make sensible engineering decisions without asking me to approve routine implementation choices.

Important priorities:

1. This must be a dynamic portfolio with a secure admin CMS, not a static site.
2. Public content must be database-driven.
3. Services, projects, advertising case studies, testimonials, homepage content, contact details, navigation, media, and SEO must be manageable from `/admin`.
4. Use Supabase Auth, Database, Storage, and Row Level Security.
5. Implement the four initial services:
   - Software Development
   - Digital Marketing
   - AI Automation
   - Creative Services
6. Treat general portfolio projects and advertising case studies as separate content models.
7. Make the frontend visually premium, modern, responsive, and conversion-focused.
8. Implement tasteful parallax scrolling and subtle desktop mouse-tracking effects, but never scroll-jack.
9. Respect `prefers-reduced-motion` and reduce effects on mobile/touch devices.
10. Keep animation performant.
11. Implement proper loading, empty, validation, error, and success states.
12. Build secure contact inquiry handling and admin inquiry management.
13. Implement dynamic SEO metadata, sitemap, robots, canonical URLs, Open Graph, and appropriate structured data.
14. Create Supabase migrations and RLS policies in the repository.
15. Create seed data, but never invent real case-study performance claims.
16. Create `.env.example`.
17. Update README with local setup, Supabase setup, admin bootstrap, migration, seed, and Vercel deployment instructions.
18. Do not leave fake buttons or unfinished placeholder interactions.
19. Run lint, typecheck, and production build. Fix issues before considering the implementation complete.

Follow the implementation phases in `/docs/09_IMPLEMENTATION_PHASES.md`.

Before coding, inspect the existing repository and preserve anything valuable that already exists. If this is a new/empty project, scaffold it appropriately.

Do not stop after generating a plan. Implement the application.

At the end, provide:
- concise architecture summary
- database/RLS summary
- implemented routes
- admin capabilities
- required environment variables
- any manual Supabase/Vercel steps I must perform
- test/build results
- remaining optional enhancements, clearly separated from required functionality
