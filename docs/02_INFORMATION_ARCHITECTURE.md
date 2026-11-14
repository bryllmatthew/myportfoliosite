# Information Architecture & Routes

## Public Routes

### /
Homepage.

### /services
All active/published services.

### /services/[slug]
Dynamic service detail page.

Recommended layout:
- hero
- service summary
- problems solved
- capabilities
- deliverables
- process
- tools/technology
- related work
- related case studies
- FAQ
- CTA

### /work
Portfolio index.

Features:
- featured work
- category filter
- service filter
- technology/tag filter if useful
- responsive project grid

### /work/[slug]
Project detail.

Suggested fields/sections:
- project title
- cover
- short summary
- client/brand (optional)
- project type
- challenge
- solution
- role
- responsibilities
- technologies/tools
- gallery/video
- outcome
- links
- related work
- CTA

### /case-studies
Advertising/performance marketing case study index.

Filters:
- Meta
- TikTok
- e-commerce
- lead generation
- awareness
- other database-driven categories

### /case-studies/[slug]
Case study detail.

Sections:
- hero/result headline
- campaign snapshot
- challenge
- strategy
- creative approach
- audience/targeting summary
- funnel/tracking setup
- execution
- metrics
- optimization process
- results
- learnings
- gallery
- CTA

Do not expose confidential information when a case study is marked anonymized.

### /about
Professional story, expertise, stack, values/process, experience timeline.

### /contact
Contact information and inquiry form.

## Admin Routes

### /admin/login
Email/password authentication.

### /admin
Overview:
- content counts
- drafts
- recent updates
- unread/new inquiries
- quick create actions

### /admin/home
Homepage CMS:
- hero
- section ordering
- visibility toggles
- section headings
- CTA
- featured selections

### /admin/profile
- name
- professional headline
- short bio
- long bio
- avatar/headshot
- resume URL/file
- location display
- availability
- skills
- technologies

### /admin/services
CRUD + reorder + publish.

### /admin/projects
CRUD + filtering + publish.

### /admin/case-studies
CRUD + publish.

### /admin/testimonials
CRUD.

### /admin/media
Media library.

### /admin/contact
Contact details + inquiries.

### /admin/navigation
Header/footer links and CTA.

### /admin/seo
Global SEO settings.

### /admin/settings
Brand/site settings.

## Navigation Behavior
Desktop:
- clean sticky/floating header
- subtle background transition after scroll
- active route state
- prominent contact CTA

Mobile:
- accessible menu drawer
- no heavy mouse effects
- tap-friendly targets
- body scroll lock while menu is open
