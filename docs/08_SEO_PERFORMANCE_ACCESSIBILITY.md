# SEO, Performance & Accessibility

## SEO
Use Next.js Metadata API.

Per content item:
- title
- description
- OG image
- canonical

Generate:
- sitemap
- robots
- Open Graph
- Twitter metadata

Structured data:
- Person
- ProfessionalService where appropriate
- BreadcrumbList
- CreativeWork/Article/SoftwareApplication only when semantically appropriate

## Performance
Target a fast portfolio despite animation.

Rules:
- next/image
- correct image sizes
- AVIF/WebP where Next.js handles it
- lazy load below fold
- priority only for critical hero imagery
- limit client components
- avoid large client-side CMS fetches
- use server rendering/static regeneration/caching appropriately
- optimize fonts
- avoid importing entire icon libraries
- lazy-load video
- poster images for video
- dynamic import heavy animation modules if beneficial

## Core Web Vitals
Avoid:
- layout shift from media
- animation causing main-thread stalls
- giant JS bundles
- unbounded DOM from galleries

## Accessibility
Aim WCAG 2.2 AA.

Required:
- semantic landmarks
- one logical H1 per page
- proper heading order
- visible focus
- keyboard navigation
- accessible mobile menu
- form labels
- errors associated with fields
- alt text
- sufficient contrast
- no color-only meaning
- reduced motion
- skip-to-content
- accessible dialogs
- meaningful link text

## Motion Accessibility
prefers-reduced-motion must disable:
- pointer parallax
- decorative looping motion
- large scroll transforms
- magnetic buttons

## Admin Accessibility
Admin forms and tables must also be keyboard accessible.

## QA
Before completion run:
- npm run lint
- npm run typecheck if configured separately
- npm run build

Test:
- mobile widths
- tablet
- desktop
- keyboard-only navigation
- reduced motion
- empty CMS
- slow loading
- failed image
- failed contact submission
