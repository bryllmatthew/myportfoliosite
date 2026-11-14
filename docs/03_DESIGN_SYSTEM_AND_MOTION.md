# Design System & Motion Specification

## Design Goal
Create a portfolio that visually proves both technical and creative competence.

The design should feel:
- modern
- premium
- intelligent
- precise
- creative
- conversion-aware

It should NOT feel like a generic developer template.

## Visual Direction
Recommended default:
- dark neutral background
- high-contrast typography
- one controlled accent system
- subtle luminous/gradient accents
- fine grid/technical texture
- occasional editorial oversized type
- high-quality media presentation
- rounded geometry used consistently

Use CSS variables for all theme tokens.

## Typography
Use a modern sans-serif family through next/font.
Create a strong type scale:
- display
- h1
- h2
- h3
- body large
- body
- small/meta

Headings should be visually strong but remain readable on mobile.

## Layout
- max-width content containers
- wide visual sections for project imagery
- consistent section spacing
- responsive 12-column mental model
- avoid excessive card nesting

## Core Components
- Header
- MobileNav
- Footer
- SectionHeader
- CTAButton
- ServiceCard
- ProjectCard
- CaseStudyCard
- MetricCard
- TestimonialCard
- TechnologyBadge
- MediaGallery
- VideoEmbed
- RichTextRenderer
- ContactForm
- FilterBar
- EmptyState
- Breadcrumbs
- Share/ExternalLink
- ParallaxMedia
- Reveal
- MouseGlow

## Home Hero
The hero should immediately communicate the combined positioning.

Suggested hierarchy:
1. name / identity
2. large professional positioning statement
3. short explanation
4. primary + secondary CTA
5. dynamic visual that implies software + automation + growth + creative

Do not make the hero dependent on a huge portrait.

## Mouse Tracking
Desktop fine-pointer devices only.

Possible effects:
- ambient radial glow follows cursor with interpolation
- hero visual has extremely subtle x/y depth response
- selected project cards can respond to pointer position
- optional magnetic CTA with low displacement

Rules:
- never interfere with click targets
- no custom cursor required
- avoid constant React state rerenders for raw pointer coordinates
- prefer MotionValues/requestAnimationFrame/CSS variables
- disable for prefers-reduced-motion
- disable for touch/coarse pointers

## Parallax
Use only in visually important sections:
- hero layers
- selected project imagery
- service visual separator
- case study media
- final CTA background

Parallax amplitude must be subtle.
Do not scroll-jack.
Avoid layout thrashing.
Prefer transforms.

## Scroll Reveals
Create reusable Reveal components:
- fade + translate
- stagger children
- masked image reveal where appropriate

Animations should run once by default.

## Accessibility
Respect:
prefers-reduced-motion: reduce

When reduced:
- eliminate parallax
- eliminate mouse-follow effects
- remove large transforms
- keep simple opacity transitions or no animation

## Responsive Motion
Desktop: full tasteful motion system.
Tablet: reduced pointer-dependent effects.
Mobile: scroll reveal only, minimal parallax.

## Performance Budget
- lazy load below-fold media
- responsive images
- avoid autoplaying multiple videos
- dynamically import heavy animation code when appropriate
- prevent CLS
- avoid huge unoptimized background assets
