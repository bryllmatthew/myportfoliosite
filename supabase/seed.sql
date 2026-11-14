-- =============================================================================
-- Portfolio CMS — initial seed content
--
-- Safe, replaceable starter content. Everything here is editable in /admin.
--   * Services are published (they describe real offerings — edit the copy).
--   * Sample projects and the sample case study are DRAFTS and clearly labeled.
--     Their metric values are placeholders, not real results. Replace or delete
--     them before publishing. Never publish invented performance claims.
--   * No testimonials or social links are seeded: those must be real.
--
-- Idempotent: re-running will not duplicate rows.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Singletons
-- ---------------------------------------------------------------------------
insert into public.site_settings (
  site_name, site_description, default_seo_title, default_seo_description,
  primary_cta_label, primary_cta_url, footer_text
) values (
  'Your Name',
  'Full-stack software, AI automation, performance advertising and creative production from one partner.',
  'Your Name — Software, AI automation and performance marketing',
  'I build web applications, automate operations with AI, run Meta and TikTok advertising, and produce the creative that feeds it.',
  'Start a project',
  '/contact',
  'Software, automation, advertising and creative, built as one system.'
) on conflict (singleton) do nothing;

insert into public.profiles (
  display_name, headline, short_bio, long_bio, location_label, availability_label, is_available,
  skills, stack_groups, experience
) values (
  'Your Name',
  'Full-stack developer, AI automation specialist and performance marketer',
  'I help businesses grow by building the software they run on, automating the work that slows them down, and running the campaigns and creative that bring customers in.',
  E'Replace this with your story.\n\nA good long bio covers how you got here, the kinds of problems you like solving, and why working across software, automation, advertising and creative makes you more useful than four separate vendors.\n\nKeep paragraphs short. Visitors skim.',
  'Remote, worldwide',
  'Taking new projects',
  true,
  array['Full-stack development', 'Workflow automation', 'AI assistants', 'Meta Ads', 'TikTok Ads', 'Conversion tracking', 'Video editing', 'Graphic design'],
  '[
    {"category": "Development", "items": ["TypeScript", "Next.js", "React", "Node.js", "PostgreSQL", "Supabase"]},
    {"category": "Automation and AI", "items": ["GoHighLevel", "n8n", "Make", "Zapier", "OpenAI API", "Claude API"]},
    {"category": "Advertising and analytics", "items": ["Meta Ads Manager", "TikTok Ads Manager", "Meta Pixel and CAPI", "Google Tag Manager", "GA4"]},
    {"category": "Creative", "items": ["Premiere Pro", "After Effects", "CapCut", "Photoshop", "Figma"]}
  ]'::jsonb,
  '[]'::jsonb
) on conflict (singleton) do nothing;

insert into public.contact_settings (
  primary_email, location_label, contact_intro, response_time_text, show_budget, budget_ranges
) values (
  '',
  'Remote, worldwide',
  'Tell me what you are building, automating or trying to sell. A few sentences is enough to start.',
  'I reply within one business day.',
  true,
  array['Under $2,500', '$2,500 to $5,000', '$5,000 to $15,000', '$15,000 and up', 'Not sure yet']
) on conflict (singleton) do nothing;

-- ---------------------------------------------------------------------------
-- Navigation
-- ---------------------------------------------------------------------------
insert into public.navigation_items (id, area, label, url, sort_order) values
  ('44444444-4444-4444-8444-000000000001', 'header', 'Home', '/', 1),
  ('44444444-4444-4444-8444-000000000002', 'header', 'Services', '/services', 2),
  ('44444444-4444-4444-8444-000000000003', 'header', 'My Work', '/work', 3),
  ('44444444-4444-4444-8444-000000000004', 'header', 'Advertising Case Studies', '/case-studies', 4),
  ('44444444-4444-4444-8444-000000000005', 'header', 'Contact', '/contact', 5),
  ('44444444-4444-4444-8444-000000000011', 'footer', 'About', '/about', 1),
  ('44444444-4444-4444-8444-000000000012', 'footer', 'Services', '/services', 2),
  ('44444444-4444-4444-8444-000000000013', 'footer', 'My Work', '/work', 3),
  ('44444444-4444-4444-8444-000000000014', 'footer', 'Case studies', '/case-studies', 4),
  ('44444444-4444-4444-8444-000000000015', 'footer', 'Contact', '/contact', 5)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Static page copy & SEO
-- ---------------------------------------------------------------------------
insert into public.page_settings (page_key, heading, intro, seo_title, seo_description) values
  ('home', null, null, null, null),
  ('services', 'Four disciplines, one connected system',
   'Most growth problems cross the line between software, operations, marketing and creative. I work across all four so nothing gets lost in the handoff.',
   'Services', 'Software development, AI automation, Meta and TikTok advertising, and creative production.'),
  ('work', 'Work across software, automation, marketing and creative',
   'A selection of products, systems, campaigns and creative. Filter by discipline to see what is relevant to you.',
   'My work', 'Selected software, automation, marketing and creative projects.'),
  ('case_studies', 'Advertising case studies',
   'Campaigns with the context that makes the numbers meaningful: objective, platform, timeframe, and what changed along the way.',
   'Advertising case studies', 'Meta and TikTok advertising case studies with objectives, strategy and measured results.'),
  ('about', 'About me', null, 'About', 'Background, experience and the tools I work with.'),
  ('contact', 'Start a project',
   'Tell me where you are and where you want to be. I will reply with next steps, not a sales script.',
   'Contact', 'Start a software, automation, advertising or creative project.')
on conflict (page_key) do nothing;

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------
insert into public.services (
  id, title, slug, short_description, overview, icon, accent_key, outcomes, deliverables, tools,
  cta_label, status, sort_order, is_featured, seo_title, seo_description
) values
(
  '11111111-1111-4111-8111-000000000001',
  'Software Development', 'software-development',
  'Custom web applications, internal systems, SaaS products, dashboards, and integrations designed around real business workflows.',
  E'Off-the-shelf tools get a business started. Eventually the spreadsheets, copy-paste and workarounds cost more than building the right system.\n\nI design and build full-stack web applications that match how your team actually works: from customer-facing products to the internal dashboards that run operations behind them.\n\n- Typed, tested code you own outright\n- Databases designed for the reports you will need later\n- Integrations with the tools you already pay for',
  'code', 'build',
  array['Teams running operations from spreadsheets and chat threads', 'Products stuck at prototype stage', 'Data spread across tools that do not talk to each other', 'Slow, hard-to-change legacy websites'],
  array['Production web application', 'Database schema and documentation', 'Admin dashboard', 'Deployment and handover'],
  array['TypeScript', 'Next.js', 'React', 'Node.js', 'PostgreSQL', 'Supabase'],
  'Discuss a software project', 'published', 1, true,
  'Software development', 'Custom web applications, internal systems, SaaS, dashboards and API integrations.'
),
(
  '11111111-1111-4111-8111-000000000002',
  'AI Automation', 'ai-automation',
  'Automations and AI-powered internal tools that reduce repetitive work and improve response speed, visibility, and operations.',
  E'Every business has work that follows the same steps every time: qualifying leads, sending follow-ups, moving data between tools, writing the same report every Monday.\n\nI map those workflows, then automate them with GoHighLevel, workflow platforms, or custom AI applications when off-the-shelf tools are not enough.\n\n- Faster response to every lead\n- Fewer manual handoffs and dropped tasks\n- Clear visibility into what the automations are doing',
  'workflow', 'automate',
  array['Leads waiting hours for a first reply', 'Staff time spent on copy-paste and data entry', 'Follow-ups that depend on someone remembering', 'Reports assembled by hand'],
  array['Workflow map and automation plan', 'Configured automations and AI assistants', 'Monitoring and error alerts', 'Team training and documentation'],
  array['GoHighLevel', 'n8n', 'Make', 'Zapier', 'OpenAI API', 'Claude API'],
  'Automate my workflow', 'published', 2, true,
  'AI automation', 'GoHighLevel automation, workflow automation, AI assistants and custom AI applications.'
),
(
  '11111111-1111-4111-8111-000000000003',
  'Digital Marketing', 'digital-marketing',
  'Performance-focused social media marketing and advertising across Meta and TikTok.',
  E'Advertising works when strategy, tracking and creative are planned together. When they are handled by different people, budgets leak.\n\nI plan, launch and optimize Meta and TikTok campaigns, set up the tracking that tells you what is actually working, and test creative systematically.\n\n- Campaign structure matched to your objective\n- Server-side and pixel tracking you can trust\n- Plain-language reporting tied to revenue or leads',
  'megaphone', 'grow',
  array['Ad spend without clear attribution', 'Campaigns that plateau after the first winning ad', 'Creative fatigue and rising costs', 'Reports full of metrics but no decisions'],
  array['Campaign strategy and structure', 'Tracking and conversion setup', 'Creative testing plan', 'Weekly optimization and reporting'],
  array['Meta Ads Manager', 'TikTok Ads Manager', 'Meta Pixel and CAPI', 'Google Tag Manager', 'GA4'],
  'Improve my advertising', 'published', 3, true,
  'Digital marketing and paid advertising', 'Meta and TikTok advertising, media buying, conversion tracking, creative testing and reporting.'
),
(
  '11111111-1111-4111-8111-000000000004',
  'Creative Services', 'creative-services',
  'Performance-minded video and graphic creative for advertising, social media, and digital brands.',
  E'On paid social, the creative is the targeting. The ad that stops the scroll decides who sees the rest.\n\nI edit short-form video, design ad creative and social assets, and build variations for testing, informed by what the campaign data says is working.\n\n- Hooks and formats built for each placement\n- Variations designed to be tested, not just published\n- Consistent brand assets across channels',
  'clapperboard', 'create',
  array['Ads that look like everyone else in the feed', 'Not enough creative volume to test properly', 'Raw footage with no time to edit it', 'Inconsistent brand visuals across channels'],
  array['Short-form video edits', 'Static and motion ad creative', 'Social media asset kits', 'Testing variations by hook and format'],
  array['Premiere Pro', 'After Effects', 'CapCut', 'Photoshop', 'Figma'],
  'Build creative that converts', 'published', 4, true,
  'Creative services', 'Video editing, short-form content, ad creative, graphic design, motion graphics and UGC-style editing.'
)
on conflict (id) do nothing;

insert into public.service_capabilities (service_id, title, description, sort_order)
select v.service_id::uuid, v.title, v.description, v.sort_order
from (values
  ('11111111-1111-4111-8111-000000000001', 'Full-stack web applications', 'Customer-facing products with authentication, payments and admin tools.', 1),
  ('11111111-1111-4111-8111-000000000001', 'Internal business systems', 'CRM, operations and inventory tools built around your process.', 2),
  ('11111111-1111-4111-8111-000000000001', 'SaaS development', 'Multi-tenant products from MVP to paying customers.', 3),
  ('11111111-1111-4111-8111-000000000001', 'API integrations', 'Connect payment, CRM, marketing and logistics platforms.', 4),
  ('11111111-1111-4111-8111-000000000001', 'Dashboards', 'Live reporting on the numbers your team makes decisions with.', 5),
  ('11111111-1111-4111-8111-000000000001', 'E-commerce solutions', 'Storefronts and custom commerce features that convert.', 6),
  ('11111111-1111-4111-8111-000000000001', 'Database architecture', 'Schemas, security rules and migrations designed to scale.', 7),
  ('11111111-1111-4111-8111-000000000002', 'GoHighLevel automation', 'Pipelines, workflows, calendars and follow-up sequences.', 1),
  ('11111111-1111-4111-8111-000000000002', 'Workflow automation', 'Multi-step automations across the tools you already use.', 2),
  ('11111111-1111-4111-8111-000000000002', 'AI assistants and agents', 'Assistants that answer, qualify, summarize and route.', 3),
  ('11111111-1111-4111-8111-000000000002', 'Custom AI applications', 'Internal tools built on large language models and your data.', 4),
  ('11111111-1111-4111-8111-000000000002', 'CRM automation', 'Keep records, stages and tasks updated without manual entry.', 5),
  ('11111111-1111-4111-8111-000000000002', 'Lead and follow-up automation', 'Instant first replies and consistent nurture sequences.', 6),
  ('11111111-1111-4111-8111-000000000002', 'API and webhook integrations', 'Reliable data flow between systems, with error handling.', 7),
  ('11111111-1111-4111-8111-000000000003', 'Meta Ads', 'Facebook and Instagram campaigns from structure to scale.', 1),
  ('11111111-1111-4111-8111-000000000003', 'TikTok Ads', 'Native-feeling campaigns built for the For You feed.', 2),
  ('11111111-1111-4111-8111-000000000003', 'Media buying', 'Budget allocation and bidding tied to your margins.', 3),
  ('11111111-1111-4111-8111-000000000003', 'Campaign strategy', 'Objectives, audiences, offers and funnel stages planned together.', 4),
  ('11111111-1111-4111-8111-000000000003', 'Creative testing', 'Structured tests of hooks, formats and angles.', 5),
  ('11111111-1111-4111-8111-000000000003', 'Conversion tracking', 'Pixel, Conversions API and analytics you can trust.', 6),
  ('11111111-1111-4111-8111-000000000003', 'Optimization and reporting', 'Weekly decisions, explained in plain language.', 7),
  ('11111111-1111-4111-8111-000000000004', 'Video editing', 'Clean, paced edits for ads, social and brand content.', 1),
  ('11111111-1111-4111-8111-000000000004', 'Short-form content', 'Reels, TikToks and Shorts edited for retention.', 2),
  ('11111111-1111-4111-8111-000000000004', 'Ad creative', 'Static and video ads designed around a clear hook.', 3),
  ('11111111-1111-4111-8111-000000000004', 'Graphic design', 'Social graphics, banners and marketing visuals.', 4),
  ('11111111-1111-4111-8111-000000000004', 'Motion graphics', 'Animated text, product callouts and explainer elements.', 5),
  ('11111111-1111-4111-8111-000000000004', 'UGC-style editing', 'Creator-style footage shaped into ads that perform.', 6),
  ('11111111-1111-4111-8111-000000000004', 'Social media assets', 'Templates and kits that keep your brand consistent.', 7)
) as v(service_id, title, description, sort_order)
where not exists (select 1 from public.service_capabilities c where c.service_id = v.service_id::uuid);

insert into public.service_process_steps (service_id, step_number, title, description, sort_order)
select s.id, v.step_number, v.title, v.description, v.step_number
from public.services s
cross join (values
  (1, 'Understand', 'We map the goal, the constraints, and how work happens today.'),
  (2, 'Plan', 'I propose the approach, scope and timeline before anything is built.'),
  (3, 'Deliver', 'Work ships in reviewable stages so you see progress early.'),
  (4, 'Improve', 'We measure what changed and refine based on real results.')
) as v(step_number, title, description)
where s.id in (
  '11111111-1111-4111-8111-000000000001', '11111111-1111-4111-8111-000000000002',
  '11111111-1111-4111-8111-000000000003', '11111111-1111-4111-8111-000000000004'
)
and not exists (select 1 from public.service_process_steps p where p.service_id = s.id);

insert into public.service_faqs (service_id, question, answer, sort_order)
select v.service_id::uuid, v.question, v.answer, v.sort_order
from (values
  ('11111111-1111-4111-8111-000000000001', 'Do I own the code?', 'Yes. You own the repository, the database and every account the project runs on.', 1),
  ('11111111-1111-4111-8111-000000000001', 'Can you work with an existing codebase?', 'Yes. I start with a short review so we agree on what to keep, fix or replace.', 2),
  ('11111111-1111-4111-8111-000000000002', 'Do I need GoHighLevel?', 'No. I use GoHighLevel when it fits, and other platforms or custom code when it does not.', 1),
  ('11111111-1111-4111-8111-000000000002', 'What happens when an automation fails?', 'Automations include error handling and alerts, so failures are visible and recoverable.', 2),
  ('11111111-1111-4111-8111-000000000003', 'What budget do I need to start?', 'It depends on your offer and margins. We set a test budget that can produce a clear answer.', 1),
  ('11111111-1111-4111-8111-000000000003', 'Do you produce the ad creative too?', 'Yes. Creative and campaigns can be handled together, which makes testing faster.', 2),
  ('11111111-1111-4111-8111-000000000004', 'Can you edit footage we already have?', 'Yes. Send raw footage and I will turn it into ads, reels or brand content.', 1),
  ('11111111-1111-4111-8111-000000000004', 'How many variations do you deliver?', 'Enough to test properly. Packages are scoped around hooks, formats and placements.', 2)
) as v(service_id, question, answer, sort_order)
where not exists (select 1 from public.service_faqs f where f.service_id = v.service_id::uuid);

-- ---------------------------------------------------------------------------
-- Taxonomies
-- ---------------------------------------------------------------------------
insert into public.project_categories (name, slug, sort_order) values
  ('Software', 'software', 1),
  ('AI Automation', 'ai-automation', 2),
  ('E-commerce', 'e-commerce', 3),
  ('Digital Marketing', 'digital-marketing', 4),
  ('Creative', 'creative', 5)
on conflict (slug) do nothing;

insert into public.technologies (name, slug) values
  ('TypeScript', 'typescript'), ('Next.js', 'nextjs'), ('React', 'react'), ('Node.js', 'nodejs'),
  ('PostgreSQL', 'postgresql'), ('Supabase', 'supabase'), ('Tailwind CSS', 'tailwind-css'),
  ('GoHighLevel', 'gohighlevel'), ('n8n', 'n8n'), ('Make', 'make'), ('Zapier', 'zapier'),
  ('OpenAI API', 'openai-api'), ('Claude API', 'claude-api'),
  ('Meta Ads', 'meta-ads'), ('TikTok Ads', 'tiktok-ads'), ('Google Tag Manager', 'google-tag-manager'),
  ('Premiere Pro', 'premiere-pro'), ('After Effects', 'after-effects'), ('Figma', 'figma'), ('CapCut', 'capcut')
on conflict (slug) do nothing;

insert into public.ad_platforms (name, slug) values
  ('Meta Ads', 'meta-ads'),
  ('TikTok Ads', 'tiktok-ads')
on conflict (slug) do nothing;

insert into public.case_study_categories (name, slug, sort_order) values
  ('E-commerce', 'e-commerce', 1),
  ('Lead generation', 'lead-generation', 2),
  ('Awareness', 'awareness', 3)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Homepage modules
-- ---------------------------------------------------------------------------
insert into public.home_sections (section_key, eyebrow, heading, description, is_visible, sort_order, config) values
  ('hero', null,
   'Software, automation, campaigns and creative, built as one system.',
   'I build the product, automate the busywork, run the ads and cut the creative, so your growth is not split across four vendors who never talk to each other.',
   true, 1,
   '{"primary_cta": {"label": "Start a project", "url": "/contact"}, "secondary_cta": {"label": "View my work", "url": "/work"}, "show_availability": true}'::jsonb),
  ('expertise', null, null, null, true, 2,
   '{"items": [
      {"key": "build", "label": "Development", "description": "Web apps, internal systems and SaaS"},
      {"key": "automate", "label": "Automation", "description": "GoHighLevel, workflows and AI assistants"},
      {"key": "grow", "label": "Advertising", "description": "Meta and TikTok campaigns that are tracked properly"},
      {"key": "create", "label": "Creative", "description": "Video and design made for the feed"}
   ]}'::jsonb),
  ('services', null, 'One partner from first commit to final cut',
   'Each service stands on its own. Together they remove the handoffs where most projects slow down.',
   true, 3, '{"service_ids": []}'::jsonb),
  ('work', null, 'Selected work',
   'Products, systems, campaigns and creative across different industries.',
   true, 4, '{"project_ids": [], "limit": 6}'::jsonb),
  ('case_study', 'Featured advertising case study', 'Results with the context behind them',
   null, true, 5, '{"case_study_id": null}'::jsonb),
  ('process', null, 'How a project runs', null, true, 6,
   '{"steps": [
      {"title": "Understand", "description": "We start with the business goal and how work happens today, not with a tool."},
      {"title": "Architect", "description": "I design the system: software, automations, campaigns and creative, and how they connect."},
      {"title": "Execute", "description": "Work ships in reviewable stages, so you see progress every week."},
      {"title": "Optimize", "description": "We measure what changed and improve what matters most."}
   ]}'::jsonb),
  ('stack', null, 'Tools I work in',
   'Chosen for reliability and for how well they connect to each other.', true, 7, '{}'::jsonb),
  ('testimonials', null, 'What clients say', null, true, 8, '{"testimonial_ids": []}'::jsonb),
  ('cta', null, 'Have something to build, automate or sell?',
   'Tell me where you are stuck. I will reply with a clear next step.',
   true, 9, '{"primary_cta": {"label": "Let''s work together", "url": "/contact"}, "secondary_cta": {"label": "See services", "url": "/services"}}'::jsonb)
on conflict (section_key) do nothing;

-- ---------------------------------------------------------------------------
-- SAMPLE projects (draft). Replace with your own work before publishing.
-- ---------------------------------------------------------------------------
insert into public.projects (
  id, title, slug, short_description, client_display_mode, project_type, challenge, solution,
  role_description, responsibilities, outcome, status, is_featured, featured_order
) values
(
  '22222222-2222-4222-8222-000000000001',
  'Sample: Operations dashboard for a property business', 'sample-operations-dashboard',
  'Sample project. Replace with a real one. An internal system that replaced spreadsheets for bookings, maintenance and owner reporting.',
  'anonymized', 'Internal system',
  'Describe the problem the client had, in their words.',
  'Describe what you built and the key decisions behind it.',
  'Describe your role on the project.',
  array['Product design', 'Full-stack development', 'Database design'],
  'Describe the outcome. Only include numbers you can stand behind.',
  'draft', true, 1
),
(
  '22222222-2222-4222-8222-000000000002',
  'Sample: Lead follow-up automation', 'sample-lead-follow-up-automation',
  'Sample project. Replace with a real one. An automation that answers new leads instantly and books qualified calls.',
  'anonymized', 'Automation',
  'Describe the problem the client had, in their words.',
  'Describe the workflow you designed and the tools it used.',
  'Describe your role on the project.',
  array['Workflow mapping', 'GoHighLevel configuration', 'AI assistant setup'],
  'Describe the outcome. Only include numbers you can stand behind.',
  'draft', true, 2
),
(
  '22222222-2222-4222-8222-000000000003',
  'Sample: Short-form ad creative series', 'sample-short-form-ad-creative',
  'Sample project. Replace with a real one. A batch of short-form video ads built for hook testing.',
  'public', 'Creative production',
  'Describe the brief.',
  'Describe the creative approach and formats.',
  'Describe your role on the project.',
  array['Editing', 'Motion graphics', 'Variation planning'],
  'Describe the outcome.',
  'draft', true, 3
)
on conflict (id) do nothing;

insert into public.project_services (project_id, service_id) values
  ('22222222-2222-4222-8222-000000000001', '11111111-1111-4111-8111-000000000001'),
  ('22222222-2222-4222-8222-000000000002', '11111111-1111-4111-8111-000000000002'),
  ('22222222-2222-4222-8222-000000000003', '11111111-1111-4111-8111-000000000004')
on conflict do nothing;

insert into public.project_category_map (project_id, category_id)
select v.project_id::uuid, c.id
from (values
  ('22222222-2222-4222-8222-000000000001', 'software'),
  ('22222222-2222-4222-8222-000000000002', 'ai-automation'),
  ('22222222-2222-4222-8222-000000000003', 'creative')
) as v(project_id, category_slug)
join public.project_categories c on c.slug = v.category_slug
on conflict do nothing;

insert into public.project_technologies (project_id, technology_id)
select v.project_id::uuid, t.id
from (values
  ('22222222-2222-4222-8222-000000000001', 'nextjs'),
  ('22222222-2222-4222-8222-000000000001', 'supabase'),
  ('22222222-2222-4222-8222-000000000001', 'typescript'),
  ('22222222-2222-4222-8222-000000000002', 'gohighlevel'),
  ('22222222-2222-4222-8222-000000000002', 'openai-api'),
  ('22222222-2222-4222-8222-000000000003', 'premiere-pro'),
  ('22222222-2222-4222-8222-000000000003', 'after-effects')
) as v(project_id, tech_slug)
join public.technologies t on t.slug = v.tech_slug
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- SAMPLE advertising case study (draft). Metric values are PLACEHOLDERS.
-- ---------------------------------------------------------------------------
insert into public.case_studies (
  id, title, slug, short_description, result_headline, client_display_mode, client_descriptor,
  campaign_objective, challenge, strategy, creative_approach, targeting_summary, tracking_setup,
  execution_summary, optimization_summary, results_summary, learnings, currency_code,
  status, is_featured, featured_order
) values (
  '33333333-3333-4333-8333-000000000001',
  'Sample: E-commerce scale-up on Meta and TikTok', 'sample-ecommerce-meta-tiktok',
  'Sample case study with placeholder numbers. Replace every value with real, verifiable results before publishing.',
  'Placeholder result headline: replace with your real outcome',
  'anonymized', 'Direct-to-consumer apparel brand',
  'Sales',
  'Describe the starting point: spend, results, and what was not working.',
  'Describe the campaign structure and why you chose it.',
  'Describe the creative angles, hooks and formats you tested.',
  'Summarize audiences without exposing anything confidential.',
  'Describe pixel, Conversions API and analytics setup.',
  'Describe how the campaigns were launched and managed.',
  'Describe what you changed based on the data, and why.',
  'Summarize the results with context: timeframe, spend, and what drove them.',
  'What would you repeat, and what would you do differently?',
  'USD', 'draft', true, 1
) on conflict (id) do nothing;

insert into public.case_study_platforms (case_study_id, platform_id)
select '33333333-3333-4333-8333-000000000001'::uuid, p.id
from public.ad_platforms p where p.slug in ('meta-ads', 'tiktok-ads')
on conflict do nothing;

insert into public.case_study_category_map (case_study_id, category_id)
select '33333333-3333-4333-8333-000000000001'::uuid, c.id
from public.case_study_categories c where c.slug = 'e-commerce'
on conflict do nothing;

insert into public.case_study_services (case_study_id, service_id) values
  ('33333333-3333-4333-8333-000000000001', '11111111-1111-4111-8111-000000000003'),
  ('33333333-3333-4333-8333-000000000001', '11111111-1111-4111-8111-000000000004')
on conflict do nothing;

insert into public.case_study_metrics (case_study_id, metric_key, label, value_numeric, value_text, prefix, suffix, description, is_primary, sort_order)
select '33333333-3333-4333-8333-000000000001'::uuid, v.metric_key, v.label, v.value_numeric, v.value_text, v.prefix, v.suffix, v.description, v.is_primary, v.sort_order
from (values
  ('roas', 'ROAS', 0::numeric, '0', null::text, 'x'::text, 'Placeholder. Replace with the real blended return on ad spend.'::text, true, 1),
  ('revenue', 'Revenue', 0::numeric, '0', '$', null, 'Placeholder. Attributed revenue for the campaign period.', false, 2),
  ('cpa', 'CPA', 0::numeric, '0', '$', null, 'Placeholder. Cost per purchase.', false, 3),
  ('ctr', 'CTR', 0::numeric, '0', null, '%', 'Placeholder. Link click-through rate.', false, 4)
) as v(metric_key, label, value_numeric, value_text, prefix, suffix, description, is_primary, sort_order)
where not exists (
  select 1 from public.case_study_metrics m where m.case_study_id = '33333333-3333-4333-8333-000000000001'
);
