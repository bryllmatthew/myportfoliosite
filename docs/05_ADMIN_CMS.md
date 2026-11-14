# Admin Dashboard / CMS Specification

## Goal
A secure, polished content dashboard that lets the portfolio owner maintain the website without touching code.

## Authentication
- Supabase Auth
- email/password is sufficient for v1
- no public admin registration
- admin route protection
- validate authorization server-side, not only in UI

## Admin Layout
Desktop:
- collapsible sidebar
- topbar
- breadcrumbs
- page title/actions
- content workspace

Mobile:
- drawer navigation
- responsive forms/tables

## Dashboard
Cards:
- published services
- published projects
- published case studies
- draft count
- new inquiries

Sections:
- recent inquiries
- recently edited content
- quick actions

## Content Editing UX
Every content editor should have:
- Save Draft
- Publish
- Archive
- Preview
- delete only with explicit confirmation where allowed
- unsaved changes warning
- validation errors next to fields
- image preview
- loading state
- toast/feedback

## Homepage Editor
Allow:
- edit hero eyebrow
- hero heading
- hero description
- primary CTA
- secondary CTA
- select featured services
- select featured projects
- select featured case study
- select testimonials
- edit section headings
- visibility toggle
- reorder modular homepage sections

Do not make layout infinitely customizable in v1. Controlled modules are safer and faster.

## Service Editor
Fields:
- title
- slug
- short description
- overview
- hero media
- icon
- capabilities repeater
- process repeater
- FAQ repeater
- featured
- sort order
- status
- SEO

## Project Editor
Fields:
- title
- slug
- short description
- client
- privacy/display mode
- cover
- hero media
- categories
- related services
- technologies
- project type
- challenge
- solution
- role
- outcome
- project date
- gallery
- external URL
- GitHub URL
- featured/order
- status
- SEO

Support drag/reorder for gallery.

## Advertising Case Study Editor
Fields:
- title
- slug
- summary
- client/display mode
- cover/hero
- platform(s)
- related services
- campaign objective
- campaign dates
- challenge
- strategy
- creative approach
- targeting summary
- tracking setup
- execution
- optimization
- results
- learnings
- dynamic metrics
- media/gallery
- featured/order
- status
- SEO

Metrics UI must allow Add Metric:
- label
- value
- prefix
- suffix
- primary toggle
- description
- order

## Media Library
- upload images
- show thumbnails
- search
- copy URL
- edit alt text
- delete only when safe
- display file type/size
- prevent unsupported files
- unique storage paths

## Inquiries
Table:
- date
- name
- email
- company
- service
- status

Detail:
- full message
- status update
- mailto reply action
- archive

## Preview
Preferred:
- preview draft using secure preview mode or admin preview route
- never expose drafts through normal public queries

## Rich Text
Keep content model structured where possible.
For long narrative fields, use a controlled rich text editor or Markdown-based editor with safe rendering.
Do not store arbitrary unsafe HTML.

## Autosave
Optional for v1.
Reliable explicit save is preferred over fragile autosave.

## Audit
Record important create/update/publish/archive actions in audit_logs.
