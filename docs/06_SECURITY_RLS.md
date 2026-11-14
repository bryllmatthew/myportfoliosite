# Security & Supabase RLS

## Principle
The admin dashboard is a privileged application surface. Hiding buttons is not security.

## Authentication
Use Supabase Auth.

Create a reliable authorization model. For a single-owner portfolio, an allowlisted admin user/profile is sufficient. Structure it so roles can be expanded later.

Possible profile field:
role: admin|editor

For v1, admin is enough.

## Public Read Rules
Public/anon may read ONLY:
- published services
- published projects
- published case studies
- active navigation
- active social links
- published testimonials
- public site/profile/settings needed for rendering

Public must not read:
- drafts
- archived private content
- audit logs
- admin-only profile fields
- all inquiry records

## Admin Rules
Authenticated authorized admin may CRUD CMS content.

## Inquiries
Anonymous users may INSERT valid contact inquiries.
Anonymous users may NOT SELECT/UPDATE/DELETE inquiries.
Only authorized admin can read/update inquiries.

Add rate-limiting/anti-spam at application layer where practical.

## Storage Buckets
Recommended:
- public-media
- private-assets if needed later

Public media:
- public read
- admin write/delete only

Use unique paths:
{entity}/{uuid}/{filename}

Validate:
- MIME type
- size
- allowed extension

## Service Role
Never expose SUPABASE_SERVICE_ROLE_KEY to client code.

## Server-Side Enforcement
All sensitive admin mutations must verify authenticated authorized user server-side even when RLS also protects the table.

## Forms
- Zod validation server-side
- validate URL schemes
- validate slug format
- trim strings
- sensible max lengths
- do not trust client-provided foreign IDs blindly

## XSS
If Markdown/rich text is used:
- render using a safe parser
- sanitize unsafe HTML
- do not allow arbitrary script/style/event attributes

## Secrets
Use environment variables.
Provide .env.example with names only, no secrets.

## Security Headers
Configure sensible headers where compatible:
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Content-Security-Policy when implementation is stable
- frame-ancestors via CSP

Do not break required third-party embeds with an overly strict CSP.

## Logging
Never log secrets or sensitive inquiry content unnecessarily.

## Admin Login
- generic auth errors where practical
- no user enumeration
- secure redirect handling
- preserve intended admin destination safely

## RLS Verification
Create documentation/tests proving:
1. anon cannot read draft project
2. anon can read published project
3. anon can insert inquiry
4. anon cannot list inquiries
5. authenticated unauthorized user cannot mutate CMS
6. authorized admin can CRUD CMS
