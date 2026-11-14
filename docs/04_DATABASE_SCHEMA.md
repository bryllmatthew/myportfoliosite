# Supabase Database Specification

Use UUID primary keys unless there is a strong reason not to.

All tables should have created_at and updated_at where relevant.

## profiles
Admin/profile information.
- id uuid
- auth_user_id uuid unique
- display_name text
- headline text
- short_bio text
- long_bio text
- avatar_url text
- resume_url text
- location_label text
- availability_label text
- email_public text
- phone_public text nullable
- created_at
- updated_at

## services
- id
- title
- slug unique
- short_description
- overview
- icon
- hero_media_url
- accent_key nullable
- status: draft|published|archived
- sort_order integer
- is_featured boolean
- seo_title
- seo_description
- og_image_url
- created_at
- updated_at

## service_capabilities
- id
- service_id FK
- title
- description
- icon nullable
- sort_order

## service_process_steps
- id
- service_id FK
- step_number
- title
- description
- sort_order

## service_faqs
- id
- service_id FK
- question
- answer
- sort_order

## projects
- id
- title
- slug unique
- short_description
- client_name nullable
- client_display_mode: public|anonymized|hidden
- cover_image_url
- hero_media_url nullable
- project_type
- challenge
- solution
- role_description
- outcome
- status draft|published|archived
- is_featured
- featured_order nullable
- project_date nullable
- external_url nullable
- github_url nullable
- seo_title
- seo_description
- og_image_url
- created_at
- updated_at

## project_services
- project_id FK
- service_id FK
Composite unique key.

## project_categories
- id
- name
- slug unique

## project_category_map
- project_id
- category_id

## technologies
- id
- name
- slug unique
- icon_url nullable

## project_technologies
- project_id
- technology_id

## project_media
- id
- project_id
- media_type image|video|embed
- url
- thumbnail_url nullable
- alt_text
- caption nullable
- sort_order

## case_studies
Advertising-focused.
- id
- title
- slug unique
- short_description
- client_name nullable
- client_display_mode public|anonymized|hidden
- cover_image_url
- hero_media_url nullable
- campaign_objective
- challenge
- strategy
- creative_approach
- targeting_summary
- tracking_setup
- execution_summary
- optimization_summary
- results_summary
- learnings
- date_start nullable
- date_end nullable
- currency_code nullable
- status draft|published|archived
- is_featured
- featured_order nullable
- seo_title
- seo_description
- og_image_url
- created_at
- updated_at

## case_study_services
- case_study_id
- service_id

## ad_platforms
- id
- name
- slug
Examples: Meta Ads, TikTok Ads.

## case_study_platforms
- case_study_id
- platform_id

## case_study_metrics
Flexible metric model.
- id
- case_study_id
- metric_key
- label
- value_numeric nullable
- value_text
- prefix nullable
- suffix nullable
- description nullable
- is_primary boolean
- sort_order

Examples:
ROAS -> 5.2 -> suffix "x"
Revenue -> numeric -> prefix "₱"
CTR -> numeric -> suffix "%"
CPA -> numeric -> prefix "₱"
Leads -> numeric
GMV -> numeric

## case_study_media
Same concept as project_media.

## testimonials
- id
- name
- role nullable
- company nullable
- quote
- avatar_url nullable
- status
- is_featured
- sort_order

## social_links
- id
- platform
- label
- url
- icon
- is_active
- sort_order

## contact_settings
Singleton.
- id
- primary_email
- phone nullable
- location_label nullable
- calendar_url nullable
- contact_intro
- response_time_text nullable

## inquiries
- id
- name
- email
- company nullable
- service_id nullable
- budget_range nullable
- message
- status new|read|replied|archived
- source_page nullable
- created_at

## home_sections
Controls homepage modularity.
- id
- section_key unique
- heading nullable
- eyebrow nullable
- description nullable
- is_visible
- sort_order
- config jsonb

## site_settings
Singleton or key/value configuration.
Include:
- site_name
- site_description
- default_seo_title
- default_seo_description
- default_og_image
- primary_cta_label
- primary_cta_url
- footer_text

## navigation_items
- id
- area header|footer
- label
- url
- is_external
- is_active
- sort_order

## media_library
- id
- storage_path
- public_url
- file_name
- mime_type
- file_size
- width nullable
- height nullable
- alt_text nullable
- uploaded_by
- created_at

## audit_logs
Recommended for admin mutations.
- id
- user_id
- action
- entity_type
- entity_id nullable
- metadata jsonb
- created_at

## Indexes
Add indexes for:
- slug
- status
- is_featured
- sort_order
- created_at
- foreign keys
- inquiry status

## Updated At
Implement updated_at trigger or application-level equivalent consistently.

## Slugs
Generate slug from title but allow admin override.
Prevent duplicate slugs.
Do not change published slug silently.
