-- =============================================================================
-- Portfolio CMS — initial seed content
--
-- Starter content for Bryll Matthew's portfolio. Everything is editable in /admin.
--   * Services are published starter copy: review and edit them.
--   * Projects, case studies, brands, the testimonial, social links and contact
--     details are imported from the previous portfolio
--     (bryllmsark.wixstudio.com/portfolio). Case study figures are exactly as
--     published there.
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
  'Bryll Matthew',
  'Full-stack web development, digital marketing and creative production from one partner.',
  'Bryll Matthew | Web development, digital marketing and creative',
  'Bryll Matthew builds websites and web apps, runs Google, Meta and TikTok ad campaigns, and designs and edits the creative behind them.',
  'Start a project',
  '/contact',
  'Software, automation, advertising and creative, built as one system.'
) on conflict (singleton) do nothing;

-- Databases seeded before the owner's details were added: replace untouched placeholders only.
update public.site_settings set
  site_name = 'Bryll Matthew',
  site_description = 'Full-stack web development, digital marketing and creative production from one partner.',
  default_seo_title = 'Bryll Matthew | Web development, digital marketing and creative',
  default_seo_description = 'Bryll Matthew builds websites and web apps, runs Google, Meta and TikTok ad campaigns, and designs and edits the creative behind them.'
where site_name = 'Your Name';

insert into public.profiles (
  display_name, headline, short_bio, long_bio, avatar_url, location_label, availability_label, is_available,
  email_public, phone_public, skills, stack_groups, experience
) values (
  'Bryll Matthew',
  'Full-stack web developer, digital marketer and creative',
  'I build websites and web apps, run Google, Meta and TikTok ad campaigns, and design and edit the creative behind them, backed by more than 10 years in digital marketing.',
  E'I''m a full-stack web developer who builds dynamic, user-friendly websites, online stores and web applications.\n\nBeyond code, I bring more than 10 years of experience in digital marketing: planning and managing high-performance Google Ads and social media campaigns that drive measurable results.\n\nI''m also an advanced graphic designer and video editor, so the visuals, ads and videos that support each project are made with the same care as the product itself.\n\nWhether you need a robust digital solution, better-performing campaigns, or creative that stops the scroll, I deliver work tailored to your goals. Let''s create something extraordinary together.',
  '/images/bryll-matthew.jpg',
  'Davao City, Philippines',
  'Taking new projects',
  true,
  'bryllmsark@gmail.com',
  '+63 936 669 4978',
  array['Full-stack web development', 'E-commerce stores', 'Google Ads', 'Meta Ads', 'TikTok Ads', 'LinkedIn Ads', 'SEO and content marketing', 'Social media strategy', 'Email marketing and automation', 'Conversion rate optimisation', 'Analytics and performance tracking', 'Graphic design', 'Video editing', 'Presentation design'],
  '[
    {"category": "Development", "items": ["TypeScript", "Next.js", "React", "Node.js", "Supabase", "Shopify"]},
    {"category": "Advertising and analytics", "items": ["Google Ads", "Meta Ads Manager", "TikTok Ads Manager", "LinkedIn Ads", "Google Business Profile", "GA4"]},
    {"category": "Automation and AI", "items": ["GoHighLevel", "n8n", "Make", "Zapier", "OpenAI API", "Claude API"]},
    {"category": "Creative", "items": ["Premiere Pro", "After Effects", "CapCut", "Photoshop", "Figma"]}
  ]'::jsonb,
  '[]'::jsonb
) on conflict (singleton) do nothing;

update public.profiles set
  display_name = 'Bryll Matthew',
  headline = 'Full-stack web developer, digital marketer and creative',
  short_bio = 'I build websites and web apps, run Google, Meta and TikTok ad campaigns, and design and edit the creative behind them, backed by more than 10 years in digital marketing.',
  long_bio = E'I''m a full-stack web developer who builds dynamic, user-friendly websites, online stores and web applications.\n\nBeyond code, I bring more than 10 years of experience in digital marketing: planning and managing high-performance Google Ads and social media campaigns that drive measurable results.\n\nI''m also an advanced graphic designer and video editor, so the visuals, ads and videos that support each project are made with the same care as the product itself.\n\nWhether you need a robust digital solution, better-performing campaigns, or creative that stops the scroll, I deliver work tailored to your goals. Let''s create something extraordinary together.',
  avatar_url = coalesce(avatar_url, '/images/bryll-matthew.jpg'),
  location_label = 'Davao City, Philippines',
  email_public = coalesce(email_public, 'bryllmsark@gmail.com'),
  phone_public = coalesce(phone_public, '+63 936 669 4978')
where display_name = 'Your Name';

insert into public.contact_settings (
  primary_email, phone, location_label, contact_intro, response_time_text, show_budget, budget_ranges
) values (
  'bryllmsark@gmail.com',
  '+63 936 669 4978',
  'Davao City, Philippines',
  'Tell me what you are building, automating or trying to sell. A few sentences is enough to start.',
  'I reply within one business day.',
  true,
  array['Under $2,500', '$2,500 to $5,000', '$5,000 to $15,000', '$15,000 and up', 'Not sure yet']
) on conflict (singleton) do nothing;

update public.contact_settings set
  primary_email = 'bryllmsark@gmail.com',
  phone = coalesce(phone, '+63 936 669 4978'),
  location_label = 'Davao City, Philippines'
where primary_email = '';

-- ---------------------------------------------------------------------------
-- Social links & testimonial (from the previous portfolio)
-- ---------------------------------------------------------------------------
insert into public.social_links (id, platform, label, url, sort_order) values
  (md5('social:linkedin')::uuid, 'linkedin', 'LinkedIn', 'https://www.linkedin.com/in/bryll-matthew-casals-dagook-1027261a9/', 1),
  (md5('social:facebook')::uuid, 'facebook', 'Facebook', 'https://www.facebook.com/bryll.matthew/', 2)
on conflict (id) do nothing;

insert into public.testimonials (id, name, role, company, quote, avatar_url, status, is_featured, sort_order) values (
  md5('testimonial:maricor-flores')::uuid,
  'Maricor Flores', 'CEO', 'South Care Cosmetics',
  'Bryll did an outstanding job running the digital marketing campaign for South Care Cosmetics. His strategic approach, focus on performance metrics, and expertise in optimizing ads led to a significant boost in sales and a strong return on ad spend. Bryll''s dedication and data-driven strategies truly made a difference. I highly recommend him for anyone looking to achieve real business results.',
  'https://static.wixstatic.com/media/1b7e01_323f2159cc434e32bcdb6036abdbcd3e~mv2.jpg',
  'published', true, 1
) on conflict (id) do nothing;

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
  ('Creative', 'creative', 5),
  ('Websites', 'websites', 6),
  ('Video', 'video', 7),
  ('Graphic design', 'graphic-design', 8),
  ('Presentations', 'presentations', 9)
on conflict (slug) do nothing;

insert into public.technologies (name, slug) values
  ('TypeScript', 'typescript'), ('Next.js', 'nextjs'), ('React', 'react'), ('Node.js', 'nodejs'),
  ('PostgreSQL', 'postgresql'), ('Supabase', 'supabase'), ('Tailwind CSS', 'tailwind-css'),
  ('GoHighLevel', 'gohighlevel'), ('n8n', 'n8n'), ('Make', 'make'), ('Zapier', 'zapier'),
  ('OpenAI API', 'openai-api'), ('Claude API', 'claude-api'),
  ('Meta Ads', 'meta-ads'), ('TikTok Ads', 'tiktok-ads'), ('Google Tag Manager', 'google-tag-manager'),
  ('Premiere Pro', 'premiere-pro'), ('After Effects', 'after-effects'), ('Figma', 'figma'), ('CapCut', 'capcut'),
  ('Shopify', 'shopify'), ('Google Ads', 'google-ads')
on conflict (slug) do nothing;

insert into public.ad_platforms (name, slug) values
  ('Meta Ads', 'meta-ads'),
  ('TikTok Ads', 'tiktok-ads'),
  ('Google Ads', 'google-ads'),
  ('LinkedIn Ads', 'linkedin-ads')
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
  ('brands', null, 'Brands I''ve worked with', null, true, 2, '{}'::jsonb),
  ('expertise', null, null, null, true, 3,
   '{"items": [
      {"key": "build", "label": "Development", "description": "Web apps, internal systems and SaaS"},
      {"key": "automate", "label": "Automation", "description": "GoHighLevel, workflows and AI assistants"},
      {"key": "grow", "label": "Advertising", "description": "Meta and TikTok campaigns that are tracked properly"},
      {"key": "create", "label": "Creative", "description": "Video and design made for the feed"}
   ]}'::jsonb),
  ('services', null, 'One partner from first commit to final cut',
   'Each service stands on its own. Together they remove the handoffs where most projects slow down.',
   true, 5, '{"service_ids": []}'::jsonb),
  ('work', null, 'Selected work',
   'Products, systems, campaigns and creative across different industries.',
   true, 6, '{"project_ids": [], "limit": 6}'::jsonb),
  ('case_study', 'Featured advertising case study', 'Results with the context behind them',
   null, true, 7, '{"case_study_id": null}'::jsonb),
  ('intro', null, 'Hi, I''m Bryll Matthew', null, true, 4,
   '{"cta": {"label": "More about me", "url": "/about"}}'::jsonb),
  ('process', null, 'How a project runs', null, true, 8,
   '{"steps": [
      {"title": "Understand", "description": "We start with the business goal and how work happens today, not with a tool."},
      {"title": "Architect", "description": "I design the system: software, automations, campaigns and creative, and how they connect."},
      {"title": "Execute", "description": "Work ships in reviewable stages, so you see progress every week."},
      {"title": "Optimize", "description": "We measure what changed and improve what matters most."}
   ]}'::jsonb),
  ('stack', null, 'Tools I work in',
   'Chosen for reliability and for how well they connect to each other.', true, 9, '{}'::jsonb),
  ('testimonials', null, 'What clients say', null, true, 10, '{"testimonial_ids": []}'::jsonb),
  ('cta', null, 'Have something to build, automate or sell?',
   'Tell me where you are stuck. I will reply with a clear next step.',
   true, 11, '{"primary_cta": {"label": "Let''s work together", "url": "/contact"}, "secondary_cta": {"label": "See services", "url": "/services"}}'::jsonb)
on conflict (section_key) do nothing;

-- ---------------------------------------------------------------------------
-- Imported from the previous portfolio (bryllmsark.wixstudio.com/portfolio).
-- Media is linked from the Wix CDN. Run `npm run media:import` after setup to
-- copy every file into your own Supabase Storage.
-- ---------------------------------------------------------------------------

-- Remove the original sample drafts if they are still untouched.
delete from public.projects where id in (
  '22222222-2222-4222-8222-000000000001', '22222222-2222-4222-8222-000000000002', '22222222-2222-4222-8222-000000000003'
) and title like 'Sample:%';
delete from public.case_studies where id = '33333333-3333-4333-8333-000000000001' and title like 'Sample:%';

insert into public.brands (id, name, logo_url, sort_order) values
  (md5('brand:vivo')::uuid, 'vivo', 'https://static.wixstatic.com/media/1b7e01_f7cf05e97578410e8a9ade685db34c46~mv2.png', 1),
  (md5('brand:huawei')::uuid, 'HUAWEI', 'https://static.wixstatic.com/media/1b7e01_842dee62929a4f76b16c7b7fec7a4371~mv2.png', 2),
  (md5('brand:mistine')::uuid, 'Mistine', 'https://static.wixstatic.com/media/1b7e01_667075d234924548aa8960f5ceb064a1~mv2.png', 3),
  (md5('brand:wosado')::uuid, 'Wosado', 'https://static.wixstatic.com/media/1b7e01_ce28643b891e472aac7caa94b41c9e49~mv2.png', 4),
  (md5('brand:chillab')::uuid, 'Chillab', 'https://static.wixstatic.com/media/1b7e01_5993ae7bb4db453ebda96e7281a7c700~mv2.png', 5),
  (md5('brand:xiaomi')::uuid, 'Xiaomi', 'https://static.wixstatic.com/media/1b7e01_6eb21a05f8d04576a59fe62b42ac96b9~mv2.png', 6),
  (md5('brand:honor')::uuid, 'HONOR', 'https://static.wixstatic.com/media/1b7e01_cbe9b88376984863b7b7834bbe047b6c~mv2.png', 7),
  (md5('brand:jisulife')::uuid, 'JisuLife', 'https://static.wixstatic.com/media/1b7e01_cdfad99255464df286e43854feeb4b16~mv2.png', 8),
  (md5('brand:spark perfume')::uuid, 'Spark Perfume', 'https://static.wixstatic.com/media/1b7e01_e242658483524cffb1942f9d6397e1ce~mv2.png', 9),
  (md5('brand:aukey')::uuid, 'AUKEY', 'https://static.wixstatic.com/media/1b7e01_76c92c48cd28459cbbe0ce48cb879c5b~mv2.png', 10),
  (md5('brand:tjean')::uuid, 'TJean', 'https://static.wixstatic.com/media/1b7e01_5e4b0677bc1c4dd38d05d1ea11f013e5~mv2.png', 11),
  (md5('brand:oppo')::uuid, 'OPPO', 'https://static.wixstatic.com/media/1b7e01_056ebb1cad9a41c081759c6e35c25a50~mv2.png', 12),
  (md5('brand:roborock')::uuid, 'Roborock', 'https://static.wixstatic.com/media/1b7e01_ccadc7d1d7834113a46d84be3bc82cb7~mv2.png', 13),
  (md5('brand:tessan')::uuid, 'TESSAN', 'https://static.wixstatic.com/media/1b7e01_ea999fd4603d48ff8a870db5f502681d~mv2.png', 14),
  (md5('brand:hodekt')::uuid, 'Hodekt', 'https://static.wixstatic.com/media/1b7e01_c9e25a04796a4496b91f2ba33fdde7cf~mv2.png', 15),
  (md5('brand:ugreen')::uuid, 'UGREEN', 'https://static.wixstatic.com/media/1b7e01_4a0906c3ae7f4ffb8ad516a4cd5b1ac4~mv2.png', 16),
  (md5('brand:airbot')::uuid, 'Airbot', 'https://static.wixstatic.com/media/1b7e01_955077412f0044a2915ea357f3d1dd54~mv2.png', 17),
  (md5('brand:deerma')::uuid, 'Deerma', 'https://static.wixstatic.com/media/1b7e01_c175a11eb3ce40e085f8a3f7c4b988c2~mv2.png', 18),
  (md5('brand:eureka')::uuid, 'Eureka', 'https://static.wixstatic.com/media/1b7e01_f0ec8416f765466c8ccf9850b4f9060e~mv2.png', 19)
on conflict (id) do nothing;

-- iPlast AI
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:iplast-ai')::uuid, 'iPlast AI', 'iplast-ai', 'Corporate website for iPlast, a TikTok agency (TAP) based in Singapore.', 'iPlast AI', 'public', 'https://static.wixstatic.com/media/1b7e01_cca742ba6d1b48eeb3996edb28737cdf~mv2.png', 'iPlast AI corporate website homepage',
  'Corporate website', '', '', 'Website design and development.', '', 'published', true, 1, 'https://www.iplast.ai/')
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:iplast-ai')::uuid, id from public.services where slug = 'software-development' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:iplast-ai')::uuid, id from public.project_categories where slug = 'websites' on conflict do nothing;

-- Innovative SG
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:innovative-sg')::uuid, 'Innovative SG', 'innovative-sg', 'Corporate website and online store, including a dedicated product page for the MIST-ME nano atomiser.', 'Innovative SG', 'public', 'https://static.wixstatic.com/media/1b7e01_caa8111fcbcd4465ad82df6929501165~mv2.png', 'Innovative SG MIST-ME product page',
  'Corporate website and e-commerce store', '', '', 'Website and store design and development, with a separate product page style for MIST-ME.', '', 'published', true, 2, 'https://innovativesg.me/products/mist-me-nano-atomiser')
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:innovative-sg')::uuid, id from public.services where slug = 'software-development' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:innovative-sg')::uuid, id from public.project_categories where slug = 'websites' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:innovative-sg')::uuid, id from public.project_categories where slug = 'e-commerce' on conflict do nothing;
insert into public.project_technologies (project_id, technology_id) select md5('project:innovative-sg')::uuid, id from public.technologies where slug = 'shopify' on conflict do nothing;

-- Spark Perfume
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:spark-perfume')::uuid, 'Spark Perfume', 'spark-perfume', 'A Shopify dropshipping store for a perfume brand, built for a client in Lithuania.', 'Spark Perfume', 'public', 'https://static.wixstatic.com/media/1b7e01_102f212721ac4d3a8e5380ed1bdb0ba8~mv2.png', 'Spark Perfume store homepage',
  'E-commerce store (Shopify)', '', '', 'Store design and development.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:spark-perfume')::uuid, id from public.services where slug = 'software-development' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:spark-perfume')::uuid, id from public.project_categories where slug = 'websites' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:spark-perfume')::uuid, id from public.project_categories where slug = 'e-commerce' on conflict do nothing;
insert into public.project_technologies (project_id, technology_id) select md5('project:spark-perfume')::uuid, id from public.technologies where slug = 'shopify' on conflict do nothing;

-- Waveeworks PH
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:waveeworks-ph')::uuid, 'Waveeworks PH', 'waveeworks-ph', 'A Shopify store built on the Prestige theme.', 'Waveeworks PH', 'public', 'https://static.wixstatic.com/media/1b7e01_5e87e0e85a5b49318ef956a39f806396~mv2.png', 'Waveeworks PH store homepage',
  'E-commerce store (Shopify)', '', '', 'Store design and development.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:waveeworks-ph')::uuid, id from public.services where slug = 'software-development' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:waveeworks-ph')::uuid, id from public.project_categories where slug = 'websites' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:waveeworks-ph')::uuid, id from public.project_categories where slug = 'e-commerce' on conflict do nothing;
insert into public.project_technologies (project_id, technology_id) select md5('project:waveeworks-ph')::uuid, id from public.technologies where slug = 'shopify' on conflict do nothing;

-- Glam PH
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:glam-ph')::uuid, 'Glam PH', 'glam-ph', 'A beauty and cosmetics e-commerce store.', 'Glam PH', 'public', 'https://static.wixstatic.com/media/1b7e01_6392bb0f82e94875ae12b22161f56c9a~mv2.png', 'Glam PH skincare and cosmetics store',
  'E-commerce store (Shopify)', '', '', 'Store design and development.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:glam-ph')::uuid, id from public.services where slug = 'software-development' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:glam-ph')::uuid, id from public.project_categories where slug = 'websites' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:glam-ph')::uuid, id from public.project_categories where slug = 'e-commerce' on conflict do nothing;
insert into public.project_technologies (project_id, technology_id) select md5('project:glam-ph')::uuid, id from public.technologies where slug = 'shopify' on conflict do nothing;

-- Burrow
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:burrow')::uuid, 'Burrow', 'burrow', 'Store and design for a furniture brand.', 'Burrow', 'public', 'https://static.wixstatic.com/media/1b7e01_5c3d3d3ce057404d9f582490d1f68dfc~mv2.png', 'Burrow furniture store homepage',
  'E-commerce store (Shopify)', '', '', 'Store design and development.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:burrow')::uuid, id from public.services where slug = 'software-development' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:burrow')::uuid, id from public.project_categories where slug = 'websites' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:burrow')::uuid, id from public.project_categories where slug = 'e-commerce' on conflict do nothing;
insert into public.project_technologies (project_id, technology_id) select md5('project:burrow')::uuid, id from public.technologies where slug = 'shopify' on conflict do nothing;

-- Scentos
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:scentos')::uuid, 'Scentos', 'scentos', 'An e-commerce store for art.', 'Scentos', 'public', 'https://static.wixstatic.com/media/1b7e01_c8328af1939c4085a38a3eeda45ead96~mv2.png', 'Scentos art store homepage',
  'E-commerce store (Shopify)', '', '', 'Store design and development.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:scentos')::uuid, id from public.services where slug = 'software-development' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:scentos')::uuid, id from public.project_categories where slug = 'websites' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:scentos')::uuid, id from public.project_categories where slug = 'e-commerce' on conflict do nothing;
insert into public.project_technologies (project_id, technology_id) select md5('project:scentos')::uuid, id from public.technologies where slug = 'shopify' on conflict do nothing;

-- Greenlight Taxes
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:greenlight-taxes')::uuid, 'Greenlight Taxes', 'greenlight-taxes', 'Website for a company that provides tax preparation services.', 'Greenlight Taxes', 'public', 'https://static.wixstatic.com/media/1b7e01_632bfbc302074e5a921d6ec0a6c7c0a3~mv2.png', 'Greenlight Taxes website homepage',
  'Corporate website', '', '', 'Website design and development.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:greenlight-taxes')::uuid, id from public.services where slug = 'software-development' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:greenlight-taxes')::uuid, id from public.project_categories where slug = 'websites' on conflict do nothing;

-- WSA Studio
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:wsa-studio')::uuid, 'WSA Studio', 'wsa-studio', 'Corporate website for a company based in the United States.', 'WSA Studio', 'public', 'https://static.wixstatic.com/media/1b7e01_04706a722ae9483286d0fbe8f0910536~mv2.png', 'WSA Studio corporate website',
  'Corporate website', '', '', 'Website design and development.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:wsa-studio')::uuid, id from public.services where slug = 'software-development' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:wsa-studio')::uuid, id from public.project_categories where slug = 'websites' on conflict do nothing;

-- 8990 Holdings Inc.
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:8990-holdings')::uuid, '8990 Holdings Inc.', '8990-holdings', 'Corporate website for a Philippine company.', '8990 Holdings Inc.', 'public', 'https://static.wixstatic.com/media/1b7e01_e4a75d9d2f414f18954a9edbb372f6ee~mv2.png', '8990 Holdings corporate website',
  'Corporate website', '', '', 'Website design and development.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:8990-holdings')::uuid, id from public.services where slug = 'software-development' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:8990-holdings')::uuid, id from public.project_categories where slug = 'websites' on conflict do nothing;

-- Rockwell Cebu
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:rockwell-cebu')::uuid, 'Rockwell Cebu', 'rockwell-cebu', 'Brand awareness and sales campaigns on Meta for a premium real estate development in Cebu.', 'Rockwell Land', 'public', 'https://static.wixstatic.com/media/1b7e01_1958e0168a7e4baa96ae6c1f9cb0c620f003.jpg', 'Rockwell Cebu cover',
  'Meta Ads: brand awareness and sales', 'Rockwell Cebu needed two things at once: more people aware of the development as a premier real estate destination, and a steady flow of qualified leads for the sales team.', 'I ran two Meta Ads objectives side by side. The awareness campaign used strong visuals and messaging to reach a wider audience. The sales campaign was optimised for lead generation and conversions, with data-driven targeting, retargeting and continuous ad optimisation.', 'Campaign strategy, targeting, creative direction and optimisation.', 'The awareness campaign generated high engagement and strong recall, and the sales campaign delivered a solid return on ad spend with a steady flow of high-quality leads.', 'published', true, 3, 'https://www.facebook.com/rockwelllandcorporation')
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:rockwell-cebu')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:rockwell-cebu')::uuid, id from public.project_categories where slug = 'digital-marketing' on conflict do nothing;
insert into public.project_technologies (project_id, technology_id) select md5('project:rockwell-cebu')::uuid, id from public.technologies where slug = 'meta-ads' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:rockwell-cebu')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('image', 'https://static.wixstatic.com/media/1b7e01_1958e0168a7e4baa96ae6c1f9cb0c620f003.jpg', null, 'Rockwell Cebu campaign creative 1', null, 0),
  ('image', 'https://static.wixstatic.com/media/1b7e01_4fa01b60327a4a9d9acbef1168c46b1e~mv2.png', null, 'Rockwell Cebu campaign creative 2', null, 1),
  ('image', 'https://static.wixstatic.com/media/1b7e01_773fdcce283843d7831b056c4f06a843~mv2.png', null, 'Rockwell Cebu campaign creative 3', null, 2),
  ('image', 'https://static.wixstatic.com/media/1b7e01_ca3684fcadb548f3bb02c6fb06dc71b0~mv2.png', null, 'Rockwell Cebu campaign creative 4', null, 3),
  ('image', 'https://static.wixstatic.com/media/1b7e01_52cb6d61488e466288929f63f7761267~mv2.png', null, 'Rockwell Cebu campaign creative 5', null, 4),
  ('image', 'https://static.wixstatic.com/media/1b7e01_5474f6dbda7045cda30d45bd7ac30288~mv2.png', null, 'Rockwell Cebu campaign creative 6', null, 5),
  ('image', 'https://static.wixstatic.com/media/1b7e01_2d7f73e6ee884c6aaeefc5cc2f7224c1~mv2.png', null, 'Rockwell Cebu campaign creative 7', null, 6)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:rockwell-cebu')::uuid);

-- South Care Cosmetics
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:south-care-cosmetics')::uuid, 'South Care Cosmetics', 'south-care-cosmetics', 'A Meta Ads sales campaign built to hold a return on ad spend of at least 2.', 'South Care Cosmetics', 'public', 'https://static.wixstatic.com/media/1b7e01_c58513a374c54a81935ad63903eb471e~mv2.jpg', 'South Care Cosmetics cover',
  'Meta Ads: sales conversion', 'South Care Cosmetics wanted to drive sales profitably, with every ad dollar returning at least two.', 'I built conversion-optimised Meta Ads across Facebook and Instagram, with precise audience segmentation, focused creatives and messaging, and retargeting to bring back high-intent buyers. Performance was reviewed continuously to lower acquisition costs and refine what was working.', 'Campaign strategy, targeting, creative and optimisation.', 'The campaign increased sales while keeping a strong return on ad spend. In the CEO''s words, it led to "a significant boost in sales and a strong return on ad spend."', 'published', true, 4, 'https://www.facebook.com/SouthCareCosmeticsManufacturing')
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:south-care-cosmetics')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:south-care-cosmetics')::uuid, id from public.project_categories where slug = 'digital-marketing' on conflict do nothing;
insert into public.project_technologies (project_id, technology_id) select md5('project:south-care-cosmetics')::uuid, id from public.technologies where slug = 'meta-ads' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:south-care-cosmetics')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('image', 'https://static.wixstatic.com/media/1b7e01_c58513a374c54a81935ad63903eb471e~mv2.jpg', null, 'South Care Cosmetics ad creative 1', null, 0),
  ('image', 'https://static.wixstatic.com/media/1b7e01_b598d8c1bb6e48d38dd5c48fc3eb7948~mv2.jpg', null, 'South Care Cosmetics ad creative 2', null, 1),
  ('image', 'https://static.wixstatic.com/media/1b7e01_a3c7f09d4c4d410188e4971e4a30389e~mv2.jpg', null, 'South Care Cosmetics ad creative 3', null, 2),
  ('image', 'https://static.wixstatic.com/media/1b7e01_f1934678ee724433bab30e2a106d7f09~mv2.jpg', null, 'South Care Cosmetics ad creative 4', null, 3),
  ('image', 'https://static.wixstatic.com/media/1b7e01_05dbfb409ed449f08900f1cc15748b18~mv2.jpg', null, 'South Care Cosmetics ad creative 5', null, 4),
  ('image', 'https://static.wixstatic.com/media/1b7e01_21a0f134c9ee460cb963f6488bae55c6~mv2.jpg', null, 'South Care Cosmetics ad creative 6', null, 5),
  ('image', 'https://static.wixstatic.com/media/1b7e01_8412a586a6724c7f84d9523e97d89c36~mv2.jpg', null, 'South Care Cosmetics ad creative 7', null, 6),
  ('image', 'https://static.wixstatic.com/media/1b7e01_c05a4e7939de404b8b0d3f1671cdb52a~mv2.jpg', null, 'South Care Cosmetics ad creative 8', null, 7)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:south-care-cosmetics')::uuid);

-- Real Perfection PH
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:real-perfection-ph')::uuid, 'Real Perfection PH', 'real-perfection-ph', 'Led a team of social media and creative specialists, and ran Facebook and Instagram campaigns to build brand awareness.', 'Real Perfection PH', 'public', 'https://static.wixstatic.com/media/1b7e01_da79a04989af4aeea8f0ed55ebd0e5b2~mv2.jpg', 'Real Perfection PH cover',
  'Social media marketing and Meta Ads', 'Real Perfection PH needed a stronger online presence and more trust in the brand.', 'I led the social media marketing and creative team: curating and scheduling content across Facebook and Instagram to keep the brand consistent, and running data-driven ad campaigns to increase awareness, drive traffic and boost conversions. Audience analysis, creative ad design and continuous optimisation kept reach and return improving.', 'Team lead for social media marketing and creative; ad campaign management.', '', 'published', false, null, 'https://www.facebook.com/realperfectionph')
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:real-perfection-ph')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:real-perfection-ph')::uuid, id from public.project_categories where slug = 'digital-marketing' on conflict do nothing;
insert into public.project_technologies (project_id, technology_id) select md5('project:real-perfection-ph')::uuid, id from public.technologies where slug = 'meta-ads' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:real-perfection-ph')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('image', 'https://static.wixstatic.com/media/1b7e01_da79a04989af4aeea8f0ed55ebd0e5b2~mv2.jpg', null, 'Real Perfection PH creative 1', null, 0),
  ('image', 'https://static.wixstatic.com/media/1b7e01_70c5ca93b6f345c79c64ecdaa4977130~mv2.jpg', null, 'Real Perfection PH creative 2', null, 1),
  ('image', 'https://static.wixstatic.com/media/1b7e01_ac9f46e3833d46c6bfb00147d85d2ba5~mv2.jpg', null, 'Real Perfection PH creative 3', null, 2),
  ('image', 'https://static.wixstatic.com/media/1b7e01_f650c28026d24231af0699208cf3c1fa~mv2.jpg', null, 'Real Perfection PH creative 4', null, 3),
  ('image', 'https://static.wixstatic.com/media/1b7e01_1be3f52869d743719c3ea3cec8555ef6~mv2.jpg', null, 'Real Perfection PH creative 5', null, 4),
  ('image', 'https://static.wixstatic.com/media/1b7e01_12366f26b9ca415bbcc6702cc9a0642c~mv2.jpg', null, 'Real Perfection PH creative 6', null, 5),
  ('image', 'https://static.wixstatic.com/media/1b7e01_91fa660326984542b00cd7390689660a~mv2.jpg', null, 'Real Perfection PH creative 7', null, 6)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:real-perfection-ph')::uuid);

-- Scarllete Snow Skin
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:scarllete-snow-skin')::uuid, 'Scarllete Snow Skin', 'scarllete-snow-skin', 'Facebook and TikTok sales campaigns built on Reels and short-form video.', 'Scarllete Snow Skin', 'public', 'https://static.wixstatic.com/media/1b7e01_f33861aace9a47bf8355308beb46ba4af003.jpg', 'Scarllete Snow Skin cover',
  'Facebook and TikTok sales', 'Scarllete Snow Skin wanted to grow sales on Facebook and TikTok in a crowded skincare market.', 'I ran the campaigns myself, using Reels and TikTok short-form videos that showed product benefits, customer testimonials and trending formats. Data-driven targeting, influencer collaborations and continuous A/B testing improved engagement, ad efficiency and conversions.', 'Campaign management, short-form video strategy and optimisation.', 'The campaigns increased brand awareness and drove a clear rise in conversions and sales.', 'published', false, null, 'https://www.facebook.com/ScarlleteSnowSkin')
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:scarllete-snow-skin')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:scarllete-snow-skin')::uuid, id from public.project_categories where slug = 'digital-marketing' on conflict do nothing;
insert into public.project_technologies (project_id, technology_id) select md5('project:scarllete-snow-skin')::uuid, id from public.technologies where slug = 'meta-ads' on conflict do nothing;
insert into public.project_technologies (project_id, technology_id) select md5('project:scarllete-snow-skin')::uuid, id from public.technologies where slug = 'tiktok-ads' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:scarllete-snow-skin')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('image', 'https://static.wixstatic.com/media/1b7e01_f33861aace9a47bf8355308beb46ba4af003.jpg', null, 'Scarllete Snow Skin creative 1', null, 0),
  ('image', 'https://static.wixstatic.com/media/1b7e01_1724b2607f9a41b9817213e707d6c523~mv2.jpg', null, 'Scarllete Snow Skin creative 2', null, 1),
  ('image', 'https://static.wixstatic.com/media/1b7e01_f81d3876cad04fe1af177bfa07a57e08~mv2.jpg', null, 'Scarllete Snow Skin creative 3', null, 2),
  ('image', 'https://static.wixstatic.com/media/1b7e01_312054b85ae544e59905cbb68b1837d7~mv2.jpg', null, 'Scarllete Snow Skin creative 4', null, 3),
  ('image', 'https://static.wixstatic.com/media/1b7e01_c05e6d1a05bd46f287f7740bc5bc0751~mv2.jpg', null, 'Scarllete Snow Skin creative 5', null, 4),
  ('image', 'https://static.wixstatic.com/media/1b7e01_acedde2a1e3843aa818f4bab8016de3e~mv2.jpg', null, 'Scarllete Snow Skin creative 6', null, 5),
  ('image', 'https://static.wixstatic.com/media/1b7e01_044f350487d64952b87be04a3cb91139~mv2.jpg', null, 'Scarllete Snow Skin creative 7', null, 6),
  ('image', 'https://static.wixstatic.com/media/1b7e01_c3e3ab739bff492d96a8fc45655f98ec~mv2.jpg', null, 'Scarllete Snow Skin creative 8', null, 7)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:scarllete-snow-skin')::uuid);

-- MDY Skin Care
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:mdy-skin-care')::uuid, 'MDY Skin Care', 'mdy-skin-care', 'A Facebook and Instagram brand awareness campaign for a skincare brand.', 'MDY Skin Care', 'public', 'https://static.wixstatic.com/media/1b7e01_cbc370a8a3cb46838d3342690992b4c4~mv2.jpg', 'MDY Skin Care cover',
  'Facebook and Instagram brand awareness', 'MDY Skin Care needed visibility and recognition as a trusted skincare brand.', 'I launched a brand awareness campaign on Facebook and Instagram with targeted placements and creatives highlighting MDY''s formulations and benefits.', 'Campaign strategy, creative and management.', 'The campaign reached a wide audience and grew followers, engagement and website traffic.', 'published', false, null, 'https://www.instagram.com/mdyskincare/')
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:mdy-skin-care')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:mdy-skin-care')::uuid, id from public.project_categories where slug = 'digital-marketing' on conflict do nothing;
insert into public.project_technologies (project_id, technology_id) select md5('project:mdy-skin-care')::uuid, id from public.technologies where slug = 'meta-ads' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:mdy-skin-care')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('image', 'https://static.wixstatic.com/media/1b7e01_cbc370a8a3cb46838d3342690992b4c4~mv2.jpg', null, 'MDY Skin Care ad creative 1', null, 0),
  ('image', 'https://static.wixstatic.com/media/1b7e01_ba1ec13956f040b3902ee14ea7280add~mv2.png', null, 'MDY Skin Care ad creative 2', null, 1),
  ('image', 'https://static.wixstatic.com/media/1b7e01_c4352854fc324380adbf5f906a5323f0~mv2.jpg', null, 'MDY Skin Care ad creative 3', null, 2),
  ('image', 'https://static.wixstatic.com/media/1b7e01_d5a81a04cde1463b80a95ad89b4b0df4~mv2.jpg', null, 'MDY Skin Care ad creative 4', null, 3),
  ('image', 'https://static.wixstatic.com/media/1b7e01_4dd6f40f8c1944ccae8f560d86d5c1c7~mv2.png', null, 'MDY Skin Care ad creative 5', null, 4),
  ('image', 'https://static.wixstatic.com/media/1b7e01_4ef8dd9e57e24d0fbafcce1d84648ecf~mv2.jpg', null, 'MDY Skin Care ad creative 6', null, 5),
  ('image', 'https://static.wixstatic.com/media/1b7e01_bc708588b43e48e09690b65e0349af3c~mv2.jpg', null, 'MDY Skin Care ad creative 7', null, 6)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:mdy-skin-care')::uuid);

-- Giardini del Sole
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:giardini-del-sole')::uuid, 'Giardini del Sole', 'giardini-del-sole', 'Hyperlocal marketing and local SEO to bring more foot traffic to a furniture store.', 'Giardini del Sole', 'public', 'https://static.wixstatic.com/media/1b7e01_2694b35f4ee644fa8941be96344204a6~mv2.png', 'Giardini del Sole cover',
  'Hyperlocal marketing and local SEO', 'Giardini del Sole wanted more people nearby to find the store and visit in person.', 'I ran a local SEO campaign: optimising the Google Business Profile, location-based keywords and local directory listings, plus localised content, review generation, link building and geo-targeted ads.', 'Local SEO and hyperlocal campaign management.', 'The store ranked higher in local search and saw more store visits, more positive reviews and stronger local visibility.', 'published', false, null, 'https://www.facebook.com/GiardiniDelSoleFurniture')
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:giardini-del-sole')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:giardini-del-sole')::uuid, id from public.project_categories where slug = 'digital-marketing' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:giardini-del-sole')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('image', 'https://static.wixstatic.com/media/1b7e01_2694b35f4ee644fa8941be96344204a6~mv2.png', null, 'Giardini del Sole creative 1', null, 0),
  ('image', 'https://static.wixstatic.com/media/1b7e01_cd3f872c24154be9a3b8531460025a3a~mv2.png', null, 'Giardini del Sole creative 2', null, 1),
  ('image', 'https://static.wixstatic.com/media/1b7e01_f34271e8344144a194c9a23b7e986275~mv2.png', null, 'Giardini del Sole creative 3', null, 2),
  ('image', 'https://static.wixstatic.com/media/1b7e01_21742f24cbd9456192dd35517e70559f~mv2.png', null, 'Giardini del Sole creative 4', null, 3),
  ('image', 'https://static.wixstatic.com/media/1b7e01_5a498a3bade94e63923a7c557b60145c~mv2.png', null, 'Giardini del Sole creative 5', null, 4),
  ('image', 'https://static.wixstatic.com/media/1b7e01_b3e911b7411847d0aa748dd613834fa4~mv2.png', null, 'Giardini del Sole creative 6', null, 5),
  ('image', 'https://static.wixstatic.com/media/1b7e01_4220f6347d3a4c92a14b02d49dd9d8f9~mv2.png', null, 'Giardini del Sole creative 7', null, 6)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:giardini-del-sole')::uuid);

-- AI video commercials
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:ai-video-commercials')::uuid, 'AI video commercials', 'ai-video-commercials', 'AI-assisted commercials and UGC-style videos for consumer tech brands.', null, 'public', 'https://static.wixstatic.com/media/1b7e01_9498c8e5e57a4af5a3ba662eb86fee67f001.jpg', 'AI video commercials cover',
  'Video editing', '', '', 'Concept, AI video generation and editing.', '', 'published', true, 5, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:ai-video-commercials')::uuid, id from public.services where slug = 'creative-services' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:ai-video-commercials')::uuid, id from public.project_categories where slug = 'creative' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:ai-video-commercials')::uuid, id from public.project_categories where slug = 'video' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:ai-video-commercials')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('video', 'https://video.wixstatic.com/video/1b7e01_9498c8e5e57a4af5a3ba662eb86fee67/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_9498c8e5e57a4af5a3ba662eb86fee67f001.jpg', 'EMEET commercial', 'EMEET commercial', 0),
  ('video', 'https://video.wixstatic.com/video/1b7e01_04d607866b2e46a39de28fff464695ab/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_04d607866b2e46a39de28fff464695abf001.jpg', 'Anker commercial', 'Anker commercial', 1),
  ('video', 'https://video.wixstatic.com/video/1b7e01_096dde5e49b0446ebd9b6d70723e801d/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_096dde5e49b0446ebd9b6d70723e801df001.jpg', 'Yoole AI UGC video', 'Yoole AI UGC video', 2)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:ai-video-commercials')::uuid);

-- Brand and product videos
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:brand-and-product-videos')::uuid, 'Brand and product videos', 'brand-and-product-videos', 'Product videos, motion graphics, hero video ads and YouTube content for clients.', null, 'public', 'https://static.wixstatic.com/media/1b7e01_bee1a11f5ad946f38fda2793c0c44aeff001.jpg', 'Brand and product videos cover',
  'Video editing', '', '', 'Editing, colour, motion graphics and sound.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:brand-and-product-videos')::uuid, id from public.services where slug = 'creative-services' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:brand-and-product-videos')::uuid, id from public.project_categories where slug = 'creative' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:brand-and-product-videos')::uuid, id from public.project_categories where slug = 'video' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:brand-and-product-videos')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('video', 'https://video.wixstatic.com/video/1b7e01_bee1a11f5ad946f38fda2793c0c44aef/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_bee1a11f5ad946f38fda2793c0c44aeff001.jpg', 'Innovative SG product video', 'Innovative SG product video', 0),
  ('video', 'https://video.wixstatic.com/video/1b7e01_38471d82de514a8880f6a35225676f0f/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_38471d82de514a8880f6a35225676f0ff001.jpg', 'Jisulife outdoor fan', 'Jisulife outdoor fan', 1),
  ('embed', 'https://www.youtube.com/watch?v=oM6BfVbJ4OU', null, 'YouTube video for a client', 'YouTube video for a client', 2),
  ('video', 'https://video.wixstatic.com/video/1b7e01_17ba5d6e28434ad0a5c878143b31f4ab/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_17ba5d6e28434ad0a5c878143b31f4abf001.jpg', 'Motion graphics', 'Motion graphics', 3),
  ('video', 'https://video.wixstatic.com/video/1b7e01_0d7cfb99589741f2a7249cea9760c6ed/1080p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_0d7cfb99589741f2a7249cea9760c6edf001.jpg', 'Hero video ad', 'Hero video ad', 4),
  ('video', 'https://video.wixstatic.com/video/1b7e01_8449f9db2bf14aebb658c23979af44ca/1080p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_8449f9db2bf14aebb658c23979af44caf001.jpg', 'Local video ad', 'Local video ad', 5)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:brand-and-product-videos')::uuid);

-- Social video ads
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:social-video-ads')::uuid, 'Social video ads', 'social-video-ads', 'Fast-cut ads, reels and product teasers for TikTok, Facebook and e-commerce.', null, 'public', 'https://static.wixstatic.com/media/1b7e01_62154f36d5c64bbebe56cab3b9e44df9f001.jpg', 'Social video ads cover',
  'Video editing', '', '', 'Editing for paid social.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:social-video-ads')::uuid, id from public.services where slug = 'creative-services' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:social-video-ads')::uuid, id from public.project_categories where slug = 'creative' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:social-video-ads')::uuid, id from public.project_categories where slug = 'video' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:social-video-ads')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('video', 'https://video.wixstatic.com/video/1b7e01_62154f36d5c64bbebe56cab3b9e44df9/1080p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_62154f36d5c64bbebe56cab3b9e44df9f001.jpg', 'Real estate Facebook ad', 'Real estate Facebook ad', 0),
  ('video', 'https://video.wixstatic.com/video/1b7e01_440d5e7f93064d1aa354ca70e75461fe/1080p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_440d5e7f93064d1aa354ca70e75461fef001.jpg', 'Product teaser', 'Product teaser', 1),
  ('video', 'https://video.wixstatic.com/video/1b7e01_2014bd5e05d246d2935734cb9aefb053/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_2014bd5e05d246d2935734cb9aefb053f001.jpg', 'Rockwell reel', 'Rockwell reel', 2),
  ('video', 'https://video.wixstatic.com/video/1b7e01_cd7d32a8ffaf4f19bc933050d0f2a7db/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_cd7d32a8ffaf4f19bc933050d0f2a7dbf001.jpg', 'TikTok fast cut', 'TikTok fast cut', 3),
  ('video', 'https://video.wixstatic.com/video/1b7e01_d6de76ebee5d46b7a3dbb0d328328bb9/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_d6de76ebee5d46b7a3dbb0d328328bb9f001.jpg', 'E-commerce video', 'E-commerce video', 4),
  ('video', 'https://video.wixstatic.com/video/1b7e01_657e78a33dea4449ac438455151b595b/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_657e78a33dea4449ac438455151b595bf001.jpg', 'Dropshipping ad', 'Dropshipping ad', 5),
  ('video', 'https://video.wixstatic.com/video/1b7e01_addbf904ca2e4aeea10b656aa4b1d001/480p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_addbf904ca2e4aeea10b656aa4b1d001f001.jpg', 'TikTok e-commerce ad', 'TikTok e-commerce ad', 6),
  ('video', 'https://video.wixstatic.com/video/1b7e01_e3e9599452d84262b4e84c89b36aaed4/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_e3e9599452d84262b4e84c89b36aaed4f001.jpg', 'Xiaomi smartwatch ad', 'Xiaomi smartwatch ad', 7)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:social-video-ads')::uuid);

-- TikTok videos from product images
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:tiktok-videos-from-product-images')::uuid, 'TikTok videos from product images', 'tiktok-videos-from-product-images', 'Short-form product videos built entirely from images on the client''s website and shop.', null, 'public', 'https://static.wixstatic.com/media/1b7e01_518be56056d340d58b2de71a0c4aa17af001.jpg', 'TikTok videos from product images cover',
  'Video editing', 'The clients did not provide raw footage. I was asked to use only the product images available on their website or shop.', '', 'Motion design and editing from still images.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:tiktok-videos-from-product-images')::uuid, id from public.services where slug = 'creative-services' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:tiktok-videos-from-product-images')::uuid, id from public.project_categories where slug = 'creative' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:tiktok-videos-from-product-images')::uuid, id from public.project_categories where slug = 'video' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:tiktok-videos-from-product-images')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('video', 'https://video.wixstatic.com/video/1b7e01_518be56056d340d58b2de71a0c4aa17a/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_518be56056d340d58b2de71a0c4aa17af001.jpg', 'Torriden', 'Torriden', 0),
  ('video', 'https://video.wixstatic.com/video/1b7e01_37c4497b0732404c801e0c66b1e5d24a/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_37c4497b0732404c801e0c66b1e5d24af001.jpg', 'Wosado', 'Wosado', 1),
  ('video', 'https://video.wixstatic.com/video/1b7e01_2522b05a29514be69b9df9677f4d8604/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_2522b05a29514be69b9df9677f4d8604f001.jpg', 'Round Lab', 'Round Lab', 2),
  ('video', 'https://video.wixstatic.com/video/1b7e01_41953275e5d9447bb71006751789592d/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_41953275e5d9447bb71006751789592df001.jpg', 'English Pear', 'English Pear', 3),
  ('video', 'https://video.wixstatic.com/video/1b7e01_25fc4b477e0248a28b0f83ea83d95cb8/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_25fc4b477e0248a28b0f83ea83d95cb8f001.jpg', 'Floral Scent', 'Floral Scent', 4),
  ('video', 'https://video.wixstatic.com/video/1b7e01_2e29c17600ac4708801abd5cb1953215/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_2e29c17600ac4708801abd5cb1953215f001.jpg', 'Green Mint', 'Green Mint', 5),
  ('video', 'https://video.wixstatic.com/video/1b7e01_d12266a7ccfa4a9ca5e9f3150ada443d/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_d12266a7ccfa4a9ca5e9f3150ada443df001.jpg', 'Redbeat, images to video', 'Redbeat, images to video', 6),
  ('video', 'https://video.wixstatic.com/video/1b7e01_6eaedc02dc014f21a4c2c34dd80b62b9/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_6eaedc02dc014f21a4c2c34dd80b62b9f001.jpg', 'Redbeat, images to video', 'Redbeat, images to video', 7),
  ('video', 'https://video.wixstatic.com/video/1b7e01_34602c84464a4f8092ddcefa546c0a86/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_34602c84464a4f8092ddcefa546c0a86f001.jpg', 'Redbeat, images to video', 'Redbeat, images to video', 8)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:tiktok-videos-from-product-images')::uuid);

-- VSL and UGC edits
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:vsl-and-ugc-edits')::uuid, 'VSL and UGC edits', 'vsl-and-ugc-edits', 'Video sales letters and UGC-style edits assembled without supplied raw footage.', null, 'public', 'https://static.wixstatic.com/media/1b7e01_8455a4ae5f334d61a9df05d36bc15567f001.jpg', 'VSL and UGC edits cover',
  'Video editing', 'No raw footage was provided, so each video was assembled from sourced clips.', '', 'Scripting support and editing.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:vsl-and-ugc-edits')::uuid, id from public.services where slug = 'creative-services' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:vsl-and-ugc-edits')::uuid, id from public.project_categories where slug = 'creative' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:vsl-and-ugc-edits')::uuid, id from public.project_categories where slug = 'video' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:vsl-and-ugc-edits')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('video', 'https://video.wixstatic.com/video/1b7e01_8455a4ae5f334d61a9df05d36bc15567/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_8455a4ae5f334d61a9df05d36bc15567f001.jpg', 'Li Mo Cha', 'Li Mo Cha', 0),
  ('video', 'https://video.wixstatic.com/video/1b7e01_a7c0424af73946159a84469c608da847/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_a7c0424af73946159a84469c608da847f001.jpg', 'Cemoy Rejuv 21 Days', 'Cemoy Rejuv 21 Days', 1),
  ('video', 'https://video.wixstatic.com/video/1b7e01_2c19bb69d4844ebebc59e0158bf2745d/720p/mp4/file.mp4', 'https://static.wixstatic.com/media/1b7e01_2c19bb69d4844ebebc59e0158bf2745df001.jpg', 'Deerma CF50W', 'Deerma CF50W', 2)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:vsl-and-ugc-edits')::uuid);

-- Logo and brand identity
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:logo-and-brand-identity')::uuid, 'Logo and brand identity', 'logo-and-brand-identity', 'Logos and brand marks for retail, food, real estate and lifestyle brands.', null, 'public', 'https://static.wixstatic.com/media/1b7e01_64daebdaa5a64c30bb8c0bf0df38c383~mv2.webp', 'Logo and brand identity cover',
  'Graphic design', '', '', 'Logo and identity design.', '', 'published', true, 6, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:logo-and-brand-identity')::uuid, id from public.services where slug = 'creative-services' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:logo-and-brand-identity')::uuid, id from public.project_categories where slug = 'creative' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:logo-and-brand-identity')::uuid, id from public.project_categories where slug = 'graphic-design' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:logo-and-brand-identity')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('image', 'https://static.wixstatic.com/media/1b7e01_64daebdaa5a64c30bb8c0bf0df38c383~mv2.webp', null, 'Logo design 1', null, 0),
  ('image', 'https://static.wixstatic.com/media/1b7e01_117891679f0b4194830595da96fef250~mv2.jpeg', null, 'Logo design 2', null, 1),
  ('image', 'https://static.wixstatic.com/media/1b7e01_a38a7ab9e987496498065f83df0e29a8~mv2.png', null, 'Logo design 3', null, 2),
  ('image', 'https://static.wixstatic.com/media/1b7e01_6a05a67039a44a28bd599848dab4639d~mv2.png', null, 'Logo design 4', null, 3),
  ('image', 'https://static.wixstatic.com/media/1b7e01_a3dc944895444fe2bb6e58b354be9063~mv2.png', null, 'Logo design 5', null, 4),
  ('image', 'https://static.wixstatic.com/media/1b7e01_3693c2b71fc242039c2ef93b333332cd~mv2.jpeg', null, 'Logo design 6', null, 5),
  ('image', 'https://static.wixstatic.com/media/1b7e01_20ea4e04e7b04296bbb5da5d7f0adff4~mv2.webp', null, 'Logo design 7', null, 6),
  ('image', 'https://static.wixstatic.com/media/1b7e01_5b32c892ba744557bf6bdd53d9f88952~mv2.png', null, 'Logo design 8', null, 7),
  ('image', 'https://static.wixstatic.com/media/1b7e01_1ecf43c2d56148b0bc4039a9e9853201~mv2.png', null, 'Logo design 9', null, 8),
  ('image', 'https://static.wixstatic.com/media/1b7e01_d072e7184bad4401ac882ac461a52853~mv2.png', null, 'Logo design 10', null, 9),
  ('image', 'https://static.wixstatic.com/media/1b7e01_19b7fd4a10754bd1b900bcea8fa3a3e9~mv2.png', null, 'Logo design 11', null, 10),
  ('image', 'https://static.wixstatic.com/media/1b7e01_cc356d8b269a4d7e907d4d262dd1c816~mv2.png', null, 'Logo design 12', null, 11),
  ('image', 'https://static.wixstatic.com/media/1b7e01_c3f0fc2a18ef4c1cbfbcefa13a5f4e04~mv2.png', null, 'Logo design 13', null, 12),
  ('image', 'https://static.wixstatic.com/media/1b7e01_532ab586c16c422b92264d710e5afbf5~mv2.png', null, 'Logo design 14', null, 13),
  ('image', 'https://static.wixstatic.com/media/1b7e01_b4b19309d92a4f0c900b9e589d8e0d96~mv2.png', null, 'Logo design 15', null, 14),
  ('image', 'https://static.wixstatic.com/media/1b7e01_29ac5c003f8f4955925fd9cc55d8c1f5~mv2.png', null, 'Logo design 16', null, 15),
  ('image', 'https://static.wixstatic.com/media/1b7e01_5d73ab7872624c13b2059e9011c256a2~mv2.png', null, 'Logo design 17', null, 16),
  ('image', 'https://static.wixstatic.com/media/1b7e01_b498f5c405ae45f28433a2dc61c6c023~mv2.png', null, 'Logo design 18', null, 17),
  ('image', 'https://static.wixstatic.com/media/1b7e01_b281279b74b644b398bc39a2153e1a62~mv2.png', null, 'Logo design 19', null, 18),
  ('image', 'https://static.wixstatic.com/media/1b7e01_7bfa1562432648a799f8315b28445e2e~mv2.png', null, 'Logo design 20', null, 19),
  ('image', 'https://static.wixstatic.com/media/1b7e01_7092f22c9ffe41bcba38d6cf16de3732~mv2.png', null, 'Logo design 21', null, 20),
  ('image', 'https://static.wixstatic.com/media/1b7e01_9f509292e1b14160a0d6f47f4276fe39~mv2.png', null, 'Logo design 22', null, 21),
  ('image', 'https://static.wixstatic.com/media/1b7e01_d491224acf074dfab9154ddd5139b8a0~mv2.png', null, 'Logo design 23', null, 22),
  ('image', 'https://static.wixstatic.com/media/1b7e01_43c1acd211604371b969d2260cdc0555~mv2.png', null, 'Logo design 24', null, 23)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:logo-and-brand-identity')::uuid);

-- E-commerce product graphics
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:e-commerce-product-graphics')::uuid, 'E-commerce product graphics', 'e-commerce-product-graphics', 'Product listing images and promotional graphics for online stores and marketplaces.', null, 'public', 'https://static.wixstatic.com/media/1b7e01_c2ac54c360e24350885a77be36df2381~mv2.jpg', 'E-commerce product graphics cover',
  'Graphic design', '', '', 'Product graphics and layout.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:e-commerce-product-graphics')::uuid, id from public.services where slug = 'creative-services' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:e-commerce-product-graphics')::uuid, id from public.project_categories where slug = 'creative' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:e-commerce-product-graphics')::uuid, id from public.project_categories where slug = 'graphic-design' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:e-commerce-product-graphics')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('image', 'https://static.wixstatic.com/media/1b7e01_c2ac54c360e24350885a77be36df2381~mv2.jpg', null, 'E-commerce product graphic 1', null, 0),
  ('image', 'https://static.wixstatic.com/media/1b7e01_7a412613c48146c4a692fb2f86f27242~mv2.jpg', null, 'E-commerce product graphic 2', null, 1),
  ('image', 'https://static.wixstatic.com/media/1b7e01_0f29ac45f42e46b3ad29473416600d6a~mv2.jpg', null, 'E-commerce product graphic 3', null, 2),
  ('image', 'https://static.wixstatic.com/media/1b7e01_f285e950e2ad456cb342ebe4394ec229~mv2.jpg', null, 'E-commerce product graphic 4', null, 3),
  ('image', 'https://static.wixstatic.com/media/1b7e01_0ca2c217799e40ec9e9e2deb82e35c07~mv2.jpg', null, 'E-commerce product graphic 5', null, 4),
  ('image', 'https://static.wixstatic.com/media/1b7e01_1936d3be75ba48e0b690b5394ddb8f7c~mv2.jpg', null, 'E-commerce product graphic 6', null, 5),
  ('image', 'https://static.wixstatic.com/media/1b7e01_71f173c5b72a4c0cab0b23b4a80afe11~mv2.jpg', null, 'E-commerce product graphic 7', null, 6),
  ('image', 'https://static.wixstatic.com/media/1b7e01_5c91ed569cd344aa8871804e6dddaed5~mv2.jpg', null, 'E-commerce product graphic 8', null, 7),
  ('image', 'https://static.wixstatic.com/media/1b7e01_4a36b83d9c4d41a593057b775246abf3~mv2.jpg', null, 'E-commerce product graphic 9', null, 8),
  ('image', 'https://static.wixstatic.com/media/1b7e01_7acbc2293d7e421a8b7c90fedd95a9c6~mv2.jpg', null, 'E-commerce product graphic 10', null, 9),
  ('image', 'https://static.wixstatic.com/media/1b7e01_25b24d0916a340a98c80920244ce6205~mv2.jpg', null, 'E-commerce product graphic 11', null, 10),
  ('image', 'https://static.wixstatic.com/media/1b7e01_e258e8848b874496a8c4750cdc6cd1c0~mv2.jpg', null, 'E-commerce product graphic 12', null, 11),
  ('image', 'https://static.wixstatic.com/media/1b7e01_efd1b0bcd5174f54a13caffce306bac9~mv2.jpg', null, 'E-commerce product graphic 13', null, 12),
  ('image', 'https://static.wixstatic.com/media/1b7e01_d8c484923d97447a828b2f541d634c72~mv2.jpg', null, 'E-commerce product graphic 14', null, 13),
  ('image', 'https://static.wixstatic.com/media/1b7e01_3d0049fe938c4cbbae9b5eb5bb94924a~mv2.jpg', null, 'E-commerce product graphic 15', null, 14),
  ('image', 'https://static.wixstatic.com/media/1b7e01_bd18c17eae914de5a38a46e9b6c51c49~mv2.jpg', null, 'E-commerce product graphic 16', null, 15),
  ('image', 'https://static.wixstatic.com/media/1b7e01_25d2a3cd1b14416dac0651adc3f1e22d~mv2.jpg', null, 'E-commerce product graphic 17', null, 16),
  ('image', 'https://static.wixstatic.com/media/1b7e01_467418aa61dd4440b2b2e06774f077c9~mv2.jpg', null, 'E-commerce product graphic 18', null, 17),
  ('image', 'https://static.wixstatic.com/media/1b7e01_cddac99e32da4422a8e6ecb1e653d3f0~mv2.jpg', null, 'E-commerce product graphic 19', null, 18),
  ('image', 'https://static.wixstatic.com/media/1b7e01_246495140b9b4dc79e2b081d5033a09b~mv2.jpg', null, 'E-commerce product graphic 20', null, 19),
  ('image', 'https://static.wixstatic.com/media/1b7e01_3a53bae4e1d7470bb6bf28e98a391d08~mv2.jpg', null, 'E-commerce product graphic 21', null, 20),
  ('image', 'https://static.wixstatic.com/media/1b7e01_60e9402bc3b14b63ad3dd73348580d4c~mv2.jpg', null, 'E-commerce product graphic 22', null, 21),
  ('image', 'https://static.wixstatic.com/media/1b7e01_98ef025a0e914498b39077ca3569aa29~mv2.jpg', null, 'E-commerce product graphic 23', null, 22),
  ('image', 'https://static.wixstatic.com/media/1b7e01_46fc0b022a704d10877cde872090086a~mv2.jpg', null, 'E-commerce product graphic 24', null, 23)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:e-commerce-product-graphics')::uuid);

-- Social media graphics
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:social-media-graphics')::uuid, 'Social media graphics', 'social-media-graphics', 'Social posts and campaign graphics for brands across industries.', null, 'public', 'https://static.wixstatic.com/media/1b7e01_e20e9cc7892942b7b3b6ab50fd5406c0~mv2.png', 'Social media graphics cover',
  'Graphic design', '', '', 'Social media design.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:social-media-graphics')::uuid, id from public.services where slug = 'creative-services' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:social-media-graphics')::uuid, id from public.project_categories where slug = 'creative' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:social-media-graphics')::uuid, id from public.project_categories where slug = 'graphic-design' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:social-media-graphics')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('image', 'https://static.wixstatic.com/media/1b7e01_e20e9cc7892942b7b3b6ab50fd5406c0~mv2.png', null, 'Social media graphic 1', null, 0),
  ('image', 'https://static.wixstatic.com/media/1b7e01_abda617acce44942951bec243deb1eb2~mv2.png', null, 'Social media graphic 2', null, 1),
  ('image', 'https://static.wixstatic.com/media/1b7e01_7dc2e9484996436196cf4b84c3018d88~mv2.png', null, 'Social media graphic 3', null, 2),
  ('image', 'https://static.wixstatic.com/media/1b7e01_9e702aeb80094dc8afdf653dc1cb2e6f~mv2.png', null, 'Social media graphic 4', null, 3),
  ('image', 'https://static.wixstatic.com/media/1b7e01_fcac4c93ee2a40aa9a4660c4144d6174~mv2.png', null, 'Social media graphic 5', null, 4),
  ('image', 'https://static.wixstatic.com/media/1b7e01_198fde211e664c53998f7fb9c3faea1a~mv2.png', null, 'Social media graphic 6', null, 5),
  ('image', 'https://static.wixstatic.com/media/1b7e01_7479b48a937b40db9f5b333d43500719~mv2.png', null, 'Social media graphic 7', null, 6),
  ('image', 'https://static.wixstatic.com/media/1b7e01_c5ba6c13c4f247e8abc4ec29dc8f62f5~mv2.png', null, 'Social media graphic 8', null, 7),
  ('image', 'https://static.wixstatic.com/media/1b7e01_e2d46f94f5b84b308753897375ada5fd~mv2.png', null, 'Social media graphic 9', null, 8),
  ('image', 'https://static.wixstatic.com/media/1b7e01_4e56651335854a92a6be75476e8550c6~mv2.png', null, 'Social media graphic 10', null, 9),
  ('image', 'https://static.wixstatic.com/media/1b7e01_2552bb8369db482c9275fa1de43c47da~mv2.jpg', null, 'Social media graphic 11', null, 10),
  ('image', 'https://static.wixstatic.com/media/1b7e01_9a80c5da0ccf4acb913ccc3ee74c626c~mv2.jpg', null, 'Social media graphic 12', null, 11),
  ('image', 'https://static.wixstatic.com/media/1b7e01_332fceca4fa8486b96da1fd02b544d2b~mv2.jpg', null, 'Social media graphic 13', null, 12),
  ('image', 'https://static.wixstatic.com/media/1b7e01_f3a47ad6cf104635abf911f9bd3f113d~mv2.jpg', null, 'Social media graphic 14', null, 13),
  ('image', 'https://static.wixstatic.com/media/1b7e01_97da9afe19c54bdabc138e781cfe968c~mv2.jpg', null, 'Social media graphic 15', null, 14),
  ('image', 'https://static.wixstatic.com/media/1b7e01_856f252ee8134548b4a9901ff93e6740~mv2.jpg', null, 'Social media graphic 16', null, 15),
  ('image', 'https://static.wixstatic.com/media/1b7e01_d1ab677db984413e98baece6f59c080a~mv2.png', null, 'Social media graphic 17', null, 16),
  ('image', 'https://static.wixstatic.com/media/1b7e01_e5ac5789733b4c78bdf6815eb67045e2~mv2.png', null, 'Social media graphic 18', null, 17),
  ('image', 'https://static.wixstatic.com/media/1b7e01_e1c4557ea9174b2584cbd783db50475a~mv2.png', null, 'Social media graphic 19', null, 18),
  ('image', 'https://static.wixstatic.com/media/1b7e01_df80cd7a10864b6a95d32a389b4b3a96~mv2.png', null, 'Social media graphic 20', null, 19),
  ('image', 'https://static.wixstatic.com/media/1b7e01_39f95ac6764040deab1c5d73b0b9d112~mv2.png', null, 'Social media graphic 21', null, 20),
  ('image', 'https://static.wixstatic.com/media/1b7e01_003ebafe22ca424eb3d943a1ae57c6e7~mv2.png', null, 'Social media graphic 22', null, 21),
  ('image', 'https://static.wixstatic.com/media/1b7e01_0233308b5d824b68bcf73916c225ace0~mv2.png', null, 'Social media graphic 23', null, 22),
  ('image', 'https://static.wixstatic.com/media/1b7e01_a0bec557b4a541ca91759bade83cf731~mv2.png', null, 'Social media graphic 24', null, 23)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:social-media-graphics')::uuid);

-- 3D renders and packaging mockups
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:3d-renders-and-packaging-mockups')::uuid, '3D renders and packaging mockups', '3d-renders-and-packaging-mockups', '3D product renders and packaging mockups for product launches and listings.', null, 'public', 'https://static.wixstatic.com/media/1b7e01_4b9ad92131034653811be6abf49d8267~mv2.jpg', '3D renders and packaging mockups cover',
  'Graphic design', '', '', '3D rendering and packaging visualisation.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:3d-renders-and-packaging-mockups')::uuid, id from public.services where slug = 'creative-services' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:3d-renders-and-packaging-mockups')::uuid, id from public.project_categories where slug = 'creative' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:3d-renders-and-packaging-mockups')::uuid, id from public.project_categories where slug = 'graphic-design' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:3d-renders-and-packaging-mockups')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('image', 'https://static.wixstatic.com/media/1b7e01_4b9ad92131034653811be6abf49d8267~mv2.jpg', null, '3D render or packaging mockup 1', null, 0),
  ('image', 'https://static.wixstatic.com/media/1b7e01_831897ac65e243a2879690e5907c1383~mv2.png', null, '3D render or packaging mockup 2', null, 1),
  ('image', 'https://static.wixstatic.com/media/1b7e01_a064ed3b840643128c1ec912b0a0c7bd~mv2.png', null, '3D render or packaging mockup 3', null, 2),
  ('image', 'https://static.wixstatic.com/media/1b7e01_bc01e51c62d743b6aa551fd43a3def20~mv2.png', null, '3D render or packaging mockup 4', null, 3),
  ('image', 'https://static.wixstatic.com/media/1b7e01_0a8b737586344765933037ded36ff70a~mv2.jpg', null, '3D render or packaging mockup 5', null, 4),
  ('image', 'https://static.wixstatic.com/media/1b7e01_e2ab29c0e48c44f9a6c349ed30856332~mv2.png', null, '3D render or packaging mockup 6', null, 5),
  ('image', 'https://static.wixstatic.com/media/1b7e01_91016c7e51fd4525aa05194cf34a5b6a~mv2.png', null, '3D render or packaging mockup 7', null, 6),
  ('image', 'https://static.wixstatic.com/media/1b7e01_8a91ec68268f408fb4a3b62d4ff8c596~mv2.png', null, '3D render or packaging mockup 8', null, 7),
  ('image', 'https://static.wixstatic.com/media/1b7e01_ccd65a7ee8e643a7ac38cfaf9972be56~mv2.png', null, '3D render or packaging mockup 9', null, 8),
  ('image', 'https://static.wixstatic.com/media/1b7e01_a6dd58be55b44a72b601ad4d3dfdec0a~mv2.png', null, '3D render or packaging mockup 10', null, 9),
  ('image', 'https://static.wixstatic.com/media/1b7e01_259a87bc47e949f082b7913e7ce11b44~mv2.png', null, '3D render or packaging mockup 11', null, 10),
  ('image', 'https://static.wixstatic.com/media/1b7e01_445627cf3a484be795652d92aba18b44~mv2.png', null, '3D render or packaging mockup 12', null, 11),
  ('image', 'https://static.wixstatic.com/media/1b7e01_22bc254d1583452ca95daa0d2719eb40~mv2.png', null, '3D render or packaging mockup 13', null, 12),
  ('image', 'https://static.wixstatic.com/media/1b7e01_968d295ccb0846ebb8cf423ad85f62e7~mv2.png', null, '3D render or packaging mockup 14', null, 13),
  ('image', 'https://static.wixstatic.com/media/1b7e01_aa8943ec070f4243a85cd5c109d45711~mv2.png', null, '3D render or packaging mockup 15', null, 14),
  ('image', 'https://static.wixstatic.com/media/1b7e01_1d03925080d64dffb8d8ecfbebe7c0bd~mv2.png', null, '3D render or packaging mockup 16', null, 15),
  ('image', 'https://static.wixstatic.com/media/1b7e01_5e150b7456464b4e8b5effc4018df751~mv2.png', null, '3D render or packaging mockup 17', null, 16),
  ('image', 'https://static.wixstatic.com/media/1b7e01_5d69ce2abfc54c0a9ca799f13e63db47~mv2.png', null, '3D render or packaging mockup 18', null, 17),
  ('image', 'https://static.wixstatic.com/media/1b7e01_276cbd6529a34fde9b2d80a7747a4f4b~mv2.png', null, '3D render or packaging mockup 19', null, 18),
  ('image', 'https://static.wixstatic.com/media/1b7e01_95510c64a66340b2ad1a03ba2e272139~mv2.png', null, '3D render or packaging mockup 20', null, 19),
  ('image', 'https://static.wixstatic.com/media/1b7e01_4aef1b257e1f45a48302d2048518a6fa~mv2.png', null, '3D render or packaging mockup 21', null, 20),
  ('image', 'https://static.wixstatic.com/media/1b7e01_768e46abd71d4aea99166f376662b406~mv2.png', null, '3D render or packaging mockup 22', null, 21),
  ('image', 'https://static.wixstatic.com/media/1b7e01_6020b1a42b444806a8c2ff69fc52b86a~mv2.png', null, '3D render or packaging mockup 23', null, 22),
  ('image', 'https://static.wixstatic.com/media/1b7e01_29c5d54656c944debd727790bac2c070~mv2.png', null, '3D render or packaging mockup 24', null, 23)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:3d-renders-and-packaging-mockups')::uuid);

-- Posters and mood boards
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:posters-and-mood-boards')::uuid, 'Posters and mood boards', 'posters-and-mood-boards', 'Vertical campaign posters and brand mood boards.', null, 'public', 'https://static.wixstatic.com/media/1b7e01_793f016843664b13821195951b3c3e9c~mv2.png', 'Posters and mood boards cover',
  'Graphic design', '', '', 'Poster design and art direction.', '', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:posters-and-mood-boards')::uuid, id from public.services where slug = 'creative-services' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:posters-and-mood-boards')::uuid, id from public.project_categories where slug = 'creative' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:posters-and-mood-boards')::uuid, id from public.project_categories where slug = 'graphic-design' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:posters-and-mood-boards')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('image', 'https://static.wixstatic.com/media/1b7e01_793f016843664b13821195951b3c3e9c~mv2.png', null, 'Vertical poster 1', null, 0),
  ('image', 'https://static.wixstatic.com/media/1b7e01_8d606c353bc64237b630ecfc3b32de1d~mv2.png', null, 'Vertical poster 2', null, 1),
  ('image', 'https://static.wixstatic.com/media/1b7e01_6ba4239865344d20b617637032541567~mv2.png', null, 'Vertical poster 3', null, 2),
  ('image', 'https://static.wixstatic.com/media/1b7e01_8db0620f819844f0b9611b762eabe3f5~mv2.png', null, 'Mood board 1', null, 3),
  ('image', 'https://static.wixstatic.com/media/1b7e01_06e4151aced74b59a92d019ce352ced4~mv2.png', null, 'Mood board 2', null, 4)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:posters-and-mood-boards')::uuid);

-- Pitch decks and proposals
insert into public.projects (id, title, slug, short_description, client_name, client_display_mode, cover_image_url, cover_image_alt,
  project_type, challenge, solution, role_description, outcome, status, is_featured, featured_order, external_url)
values (md5('project:pitch-decks-and-proposals')::uuid, 'Pitch decks and proposals', 'pitch-decks-and-proposals', 'Investor pitch decks and client proposals that communicate a vision clearly.', null, 'public', 'https://static.wixstatic.com/media/1b7e01_5ceafd34688b46a5952e2a751c28c36f~mv2.png', 'Pitch decks and proposals cover',
  'Presentation design', '', '', 'Story structure, slide design and proposal writing.', 'View the full decks:

- [Marketly app pitch deck](https://drive.google.com/file/d/12M3_Tqd9CtQKnksCHQuuxd0zcaVHPHd5/view?usp=sharing)
- [Carman app pitch deck](https://drive.google.com/file/d/1RFe9u7JY8NCbaECqIVNK4qz8v72DCzMa/view?usp=sharing)
- [Sunflowers app](https://drive.google.com/file/d/1UIiwIITqm1obIOKWv9Lu4RsR2YwNUak7/view?usp=sharing)
- [Trupe Traveling](https://drive.google.com/file/d/1yOf4M-cg3hdPxyawa0ofspJaJGNKC0xw/view?usp=sharing)
- [Shakepeers Digital Solutions](https://drive.google.com/file/d/1NUv6_8Kse__wt0HJRayS3ho3lv1ZgLEv/view?usp=sharing)
- [MSP](https://drive.google.com/file/d/1txeD6OJj5gXJX3_myCoA-7sjNml8NfF7/view?usp=sharing)', 'published', false, null, null)
on conflict (id) do nothing;
insert into public.project_services (project_id, service_id) select md5('project:pitch-decks-and-proposals')::uuid, id from public.services where slug = 'creative-services' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:pitch-decks-and-proposals')::uuid, id from public.project_categories where slug = 'creative' on conflict do nothing;
insert into public.project_category_map (project_id, category_id) select md5('project:pitch-decks-and-proposals')::uuid, id from public.project_categories where slug = 'presentations' on conflict do nothing;
insert into public.project_media (project_id, media_type, url, thumbnail_url, alt_text, caption, sort_order)
select md5('project:pitch-decks-and-proposals')::uuid, v.media_type::public.media_kind, v.url, v.thumb, v.alt, v.caption, v.ord from (values
  ('image', 'https://static.wixstatic.com/media/1b7e01_5ceafd34688b46a5952e2a751c28c36f~mv2.png', null, 'Marketly app pitch deck cover', 'Marketly app pitch deck', 0),
  ('image', 'https://static.wixstatic.com/media/1b7e01_2fcbc4299508402380628dbfa3a67bf1~mv2.png', null, 'Carman app pitch deck cover', 'Carman app pitch deck', 1),
  ('image', 'https://static.wixstatic.com/media/1b7e01_edd8c5d981a644d58ad69a549266fd27~mv2.png', null, 'Sunflowers app deck cover', 'Sunflowers app', 2),
  ('image', 'https://static.wixstatic.com/media/1b7e01_2802e1c9fd0d46b39a600dd80b9e3e7e~mv2.png', null, 'Trupe Traveling deck cover', 'Trupe Traveling', 3),
  ('image', 'https://static.wixstatic.com/media/1b7e01_51244a8a93074df8974e60e8606d7225~mv2.png', null, 'Shakepeers Digital Solutions deck cover', 'Shakepeers Digital Solutions', 4),
  ('image', 'https://static.wixstatic.com/media/1b7e01_3ac6b3745b1a4bcd853f2d3bbfd9e6ad~mv2.png', null, 'MSP deck cover', 'MSP', 5)
) as v(media_type, url, thumb, alt, caption, ord)
where not exists (select 1 from public.project_media pm where pm.project_id = md5('project:pitch-decks-and-proposals')::uuid);

-- 43-day e-commerce campaign: 4.67 ROAS
insert into public.case_studies (id, title, slug, short_description, result_headline, client_display_mode, client_descriptor,
  campaign_objective, challenge, strategy, execution_summary, results_summary, currency_code, status, is_featured, featured_order)
values (md5('case-study:43-day-campaign-4-67-roas')::uuid, '43-day e-commerce campaign: 4.67 ROAS', '43-day-campaign-4-67-roas', 'Facebook ads for an e-commerce startup, targeted with third-party data, that also brought in 1,427 first-time customers.', '$1,046,438 in sales from $224,005 in ad spend over 43 days', 'anonymized', 'E-commerce startup',
  'Sales', 'In a highly competitive e-commerce market, an innovative startup needed to break through the noise, connect with its audience and maximise product sales.', 'We worked with a trusted third-party data provider to identify and target the startup''s ideal customers, and designed ads built to capture attention and prompt a purchase.', 'Over 43 days we monitored and optimised the campaign closely.', 'The startup invested $224,005 in ad spend and generated $1,046,438 in sales, a 4.67 return on ad spend. The campaign also brought in more than 1,427 first-time customers, with an average order value of $733.31.', 'USD', 'published', true, 1)
on conflict (id) do nothing;
insert into public.case_study_services (case_study_id, service_id) select md5('case-study:43-day-campaign-4-67-roas')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.case_study_platforms (case_study_id, platform_id) select md5('case-study:43-day-campaign-4-67-roas')::uuid, id from public.ad_platforms where slug = 'meta-ads' on conflict do nothing;
insert into public.case_study_category_map (case_study_id, category_id) select md5('case-study:43-day-campaign-4-67-roas')::uuid, id from public.case_study_categories where slug = 'e-commerce' on conflict do nothing;
insert into public.case_study_metrics (case_study_id, metric_key, label, value_numeric, value_text, prefix, suffix, description, is_primary, sort_order)
select md5('case-study:43-day-campaign-4-67-roas')::uuid, v.k, v.label, v.num, v.txt, v.prefix, v.suffix, v.descr, v.is_primary, v.ord from (values
  ('roas', 'ROAS', 4.67::numeric, '4.67', null, 'x', 'Return on ad spend over 43 days', true, 0),
  ('sales', 'Sales', 1046438::numeric, '1046438', '$', null, null, false, 1),
  ('ad_spend', 'Ad spend', 224005::numeric, '224005', '$', null, null, false, 2),
  ('new_customers', 'New customers', 1427::numeric, '1427', null, null, null, false, 3),
  ('average_order_value', 'Average order value', 733.31::numeric, '733.31', '$', null, null, false, 4)
) as v(k, label, num, txt, prefix, suffix, descr, is_primary, ord)
where not exists (select 1 from public.case_study_metrics m where m.case_study_id = md5('case-study:43-day-campaign-4-67-roas')::uuid);
insert into public.case_study_media (case_study_id, media_type, url, alt_text, caption, sort_order)
select md5('case-study:43-day-campaign-4-67-roas')::uuid, 'image', 'https://static.wixstatic.com/media/1b7e01_bce9f90365ab4cf6a1a74bacab171f1f~mv2.png', '43-day e-commerce campaign: 4.67 ROAS: results', 'Campaign results', 0
where not exists (select 1 from public.case_study_media m where m.case_study_id = md5('case-study:43-day-campaign-4-67-roas')::uuid);

-- 12,280% ROI from an inbound strategy
insert into public.case_studies (id, title, slug, short_description, result_headline, client_display_mode, client_descriptor,
  campaign_objective, challenge, strategy, execution_summary, results_summary, currency_code, status, is_featured, featured_order)
values (md5('case-study:12280-roi-inbound-strategy')::uuid, '12,280% ROI from an inbound strategy', '12280-roi-inbound-strategy', 'Shifting an AI email automation company from outbound prospecting to inbound demand.', '$700,000+ in revenue from $5,654 in ad spend over 3 months', 'anonymized', 'AI email automation platform for retailers',
  'Lead generation', 'The client built an AI email automation platform that increases retailers'' return on email marketing. They targeted Fortune 500 retailers but struggled to get a foot in the door: the sales team''s calls and emails to a large prospect base got no engagement.', 'We used their existing prospects and shifted marketing from outbound to inbound, so the sales team could spend its time on hot and warm leads instead of trying to get someone to raise their hand.', '', 'The new strategy generated over $700,000 in revenue from only $5,654 in ad spend over three months, a 12,280% return on investment.', 'USD', 'published', true, 2)
on conflict (id) do nothing;
insert into public.case_study_services (case_study_id, service_id) select md5('case-study:12280-roi-inbound-strategy')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.case_study_category_map (case_study_id, category_id) select md5('case-study:12280-roi-inbound-strategy')::uuid, id from public.case_study_categories where slug = 'lead-generation' on conflict do nothing;
insert into public.case_study_metrics (case_study_id, metric_key, label, value_numeric, value_text, prefix, suffix, description, is_primary, sort_order)
select md5('case-study:12280-roi-inbound-strategy')::uuid, v.k, v.label, v.num, v.txt, v.prefix, v.suffix, v.descr, v.is_primary, v.ord from (values
  ('roi', 'ROI', 12280::numeric, '12280', null, '%', 'Return on investment over 3 months', true, 0),
  ('revenue', 'Revenue', null::numeric, '700,000+', '$', null, null, false, 1),
  ('ad_spend', 'Ad spend', 5654::numeric, '5654', '$', null, null, false, 2)
) as v(k, label, num, txt, prefix, suffix, descr, is_primary, ord)
where not exists (select 1 from public.case_study_metrics m where m.case_study_id = md5('case-study:12280-roi-inbound-strategy')::uuid);
insert into public.case_study_media (case_study_id, media_type, url, alt_text, caption, sort_order)
select md5('case-study:12280-roi-inbound-strategy')::uuid, 'image', 'https://static.wixstatic.com/media/1b7e01_41762e9184374d5fafd39a2a1ac76bdc~mv2.png', '12,280% ROI from an inbound strategy: results', 'Campaign results', 0
where not exists (select 1 from public.case_study_media m where m.case_study_id = md5('case-study:12280-roi-inbound-strategy')::uuid);

-- High-ticket consultant: 1,117% ROI
insert into public.case_studies (id, title, slug, short_description, result_headline, client_display_mode, client_descriptor,
  campaign_objective, challenge, strategy, execution_summary, results_summary, currency_code, status, is_featured, featured_order)
values (md5('case-study:high-ticket-consultant-1117-roi')::uuid, 'High-ticket consultant: 1,117% ROI', 'high-ticket-consultant-1117-roi', 'Helping a consultant whose in-person business was hit by the pandemic move online with Facebook ads.', '$349,495 in consulting income from $28,705.14 in ad spend', 'anonymized', 'High-ticket business consultant',
  'Sales', 'The COVID-19 pandemic hit a high-ticket consultant''s in-person business hard. He asked for help taking his offers online.', 'We built on his existing brand loyalty with a persuasive direct-response sales letter, shown to carefully selected third-party data audiences through Facebook ads. The focus was quality of audience over quantity.', '', 'The campaign generated $349,495 in consulting income from $28,705.14 in ad spend: a 1,117% ROI and a 12.17 return on ad spend.', 'USD', 'published', false, null)
on conflict (id) do nothing;
insert into public.case_study_services (case_study_id, service_id) select md5('case-study:high-ticket-consultant-1117-roi')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.case_study_platforms (case_study_id, platform_id) select md5('case-study:high-ticket-consultant-1117-roi')::uuid, id from public.ad_platforms where slug = 'meta-ads' on conflict do nothing;
insert into public.case_study_category_map (case_study_id, category_id) select md5('case-study:high-ticket-consultant-1117-roi')::uuid, id from public.case_study_categories where slug = 'lead-generation' on conflict do nothing;
insert into public.case_study_metrics (case_study_id, metric_key, label, value_numeric, value_text, prefix, suffix, description, is_primary, sort_order)
select md5('case-study:high-ticket-consultant-1117-roi')::uuid, v.k, v.label, v.num, v.txt, v.prefix, v.suffix, v.descr, v.is_primary, v.ord from (values
  ('roi', 'ROI', 1117::numeric, '1117', null, '%', null, true, 0),
  ('roas', 'ROAS', 12.17::numeric, '12.17', null, 'x', null, false, 1),
  ('consulting_income', 'Consulting income', 349495::numeric, '349495', '$', null, null, false, 2),
  ('ad_spend', 'Ad spend', 28705.14::numeric, '28705.14', '$', null, null, false, 3)
) as v(k, label, num, txt, prefix, suffix, descr, is_primary, ord)
where not exists (select 1 from public.case_study_metrics m where m.case_study_id = md5('case-study:high-ticket-consultant-1117-roi')::uuid);
insert into public.case_study_media (case_study_id, media_type, url, alt_text, caption, sort_order)
select md5('case-study:high-ticket-consultant-1117-roi')::uuid, 'image', 'https://static.wixstatic.com/media/1b7e01_d4e7d831be1d4e3da257a8c65c3124db~mv2.png', 'High-ticket consultant: 1,117% ROI: results', 'Campaign results', 0
where not exists (select 1 from public.case_study_media m where m.case_study_id = md5('case-study:high-ticket-consultant-1117-roi')::uuid);

-- E-commerce holiday store: 11.7 ROAS
insert into public.case_studies (id, title, slug, short_description, result_headline, client_display_mode, client_descriptor,
  campaign_objective, challenge, strategy, execution_summary, results_summary, currency_code, status, is_featured, featured_order)
values (md5('case-study:e-commerce-holiday-store-11-7-roas')::uuid, 'E-commerce holiday store: 11.7 ROAS', 'e-commerce-holiday-store-11-7-roas', 'Responsive HTML5 banner ads that turned a holiday store''s peak season into its best.', '$101,493 in holiday sales from $8,661 in ad spend', 'anonymized', 'Online holiday store',
  'Seasonal sales', 'The festive season is critical for holiday stores. This store wanted to capitalise on peak demand and significantly increase online sales.', 'We designed HTML5 banners that showcased the store''s unique selling points, optimised to perform on any device: smartphone, tablet or desktop.', '', 'With $8,661 in ad spend, the store generated $101,493 in sales during its busiest season, an 11.7 return on ad spend.', 'USD', 'published', false, null)
on conflict (id) do nothing;
insert into public.case_study_services (case_study_id, service_id) select md5('case-study:e-commerce-holiday-store-11-7-roas')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.case_study_category_map (case_study_id, category_id) select md5('case-study:e-commerce-holiday-store-11-7-roas')::uuid, id from public.case_study_categories where slug = 'e-commerce' on conflict do nothing;
insert into public.case_study_metrics (case_study_id, metric_key, label, value_numeric, value_text, prefix, suffix, description, is_primary, sort_order)
select md5('case-study:e-commerce-holiday-store-11-7-roas')::uuid, v.k, v.label, v.num, v.txt, v.prefix, v.suffix, v.descr, v.is_primary, v.ord from (values
  ('roas', 'ROAS', 11.7::numeric, '11.7', null, 'x', null, true, 0),
  ('sales', 'Sales', 101493::numeric, '101493', '$', null, null, false, 1),
  ('ad_spend', 'Ad spend', 8661::numeric, '8661', '$', null, null, false, 2)
) as v(k, label, num, txt, prefix, suffix, descr, is_primary, ord)
where not exists (select 1 from public.case_study_metrics m where m.case_study_id = md5('case-study:e-commerce-holiday-store-11-7-roas')::uuid);
insert into public.case_study_media (case_study_id, media_type, url, alt_text, caption, sort_order)
select md5('case-study:e-commerce-holiday-store-11-7-roas')::uuid, 'image', 'https://static.wixstatic.com/media/1b7e01_5ddfa2e6a97a4d3cb249b6fb96b96170~mv2.jpg', 'E-commerce holiday store: 11.7 ROAS: results', 'Campaign results', 0
where not exists (select 1 from public.case_study_media m where m.case_study_id = md5('case-study:e-commerce-holiday-store-11-7-roas')::uuid);

-- Webinar launch: 11.44 ROAS
insert into public.case_studies (id, title, slug, short_description, result_headline, client_display_mode, client_descriptor,
  campaign_objective, challenge, strategy, execution_summary, results_summary, currency_code, status, is_featured, featured_order)
values (md5('case-study:webinar-launch-11-44-roas')::uuid, 'Webinar launch: 11.44 ROAS', 'webinar-launch-11-44-roas', 'Facebook ads for a free live webinar with $55 and $295 upsells.', '$171,375 in revenue from $14,984.97 in ad spend', 'anonymized', 'High-ticket consultant',
  'Webinar sign-ups and upsells', 'A high-ticket consultant was launching a free live webinar with upsell offers at $55 and $295, and needed the right business owners to sign up and take both offers.', 'We built a targeted Facebook ad campaign designed to attract ideal participants and lead them toward the upsells.', '', 'The campaign turned $14,984.97 in ad spend into $171,375 in revenue, an 11.44 return on ad spend.', 'USD', 'published', false, null)
on conflict (id) do nothing;
insert into public.case_study_services (case_study_id, service_id) select md5('case-study:webinar-launch-11-44-roas')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.case_study_platforms (case_study_id, platform_id) select md5('case-study:webinar-launch-11-44-roas')::uuid, id from public.ad_platforms where slug = 'meta-ads' on conflict do nothing;
insert into public.case_study_category_map (case_study_id, category_id) select md5('case-study:webinar-launch-11-44-roas')::uuid, id from public.case_study_categories where slug = 'lead-generation' on conflict do nothing;
insert into public.case_study_metrics (case_study_id, metric_key, label, value_numeric, value_text, prefix, suffix, description, is_primary, sort_order)
select md5('case-study:webinar-launch-11-44-roas')::uuid, v.k, v.label, v.num, v.txt, v.prefix, v.suffix, v.descr, v.is_primary, v.ord from (values
  ('roas', 'ROAS', 11.44::numeric, '11.44', null, 'x', null, true, 0),
  ('revenue', 'Revenue', 171375::numeric, '171375', '$', null, null, false, 1),
  ('ad_spend', 'Ad spend', 14984.97::numeric, '14984.97', '$', null, null, false, 2)
) as v(k, label, num, txt, prefix, suffix, descr, is_primary, ord)
where not exists (select 1 from public.case_study_metrics m where m.case_study_id = md5('case-study:webinar-launch-11-44-roas')::uuid);
insert into public.case_study_media (case_study_id, media_type, url, alt_text, caption, sort_order)
select md5('case-study:webinar-launch-11-44-roas')::uuid, 'image', 'https://static.wixstatic.com/media/1b7e01_5ee825654b28425aba23b286378579b8~mv2.png', 'Webinar launch: 11.44 ROAS: results', 'Campaign results', 0
where not exists (select 1 from public.case_study_media m where m.case_study_id = md5('case-study:webinar-launch-11-44-roas')::uuid);

-- Facebook Shop ads: 5.91 ROAS
insert into public.case_studies (id, title, slug, short_description, result_headline, client_display_mode, client_descriptor,
  campaign_objective, challenge, strategy, execution_summary, results_summary, currency_code, status, is_featured, featured_order)
values (md5('case-study:facebook-shop-ads-5-91-roas')::uuid, 'Facebook Shop ads: 5.91 ROAS', 'facebook-shop-ads-5-91-roas', 'Shop-style Facebook ads that let customers buy in-app or go straight to the Shopify store.', '$192,433.60 in sales from $32,540.63 in ad spend', 'anonymized', 'E-commerce brand',
  'Sales', 'An e-commerce client wanted a higher return on ad spend from Facebook.', 'We built a campaign using Facebook Shop-style ads, which let customers complete purchases in-app or go directly to the client''s Shopify store.', '', 'The client generated $192,433.60 in sales from $32,540.63 in ad spend, a 5.91 return on ad spend.', 'USD', 'published', false, null)
on conflict (id) do nothing;
insert into public.case_study_services (case_study_id, service_id) select md5('case-study:facebook-shop-ads-5-91-roas')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.case_study_platforms (case_study_id, platform_id) select md5('case-study:facebook-shop-ads-5-91-roas')::uuid, id from public.ad_platforms where slug = 'meta-ads' on conflict do nothing;
insert into public.case_study_category_map (case_study_id, category_id) select md5('case-study:facebook-shop-ads-5-91-roas')::uuid, id from public.case_study_categories where slug = 'e-commerce' on conflict do nothing;
insert into public.case_study_metrics (case_study_id, metric_key, label, value_numeric, value_text, prefix, suffix, description, is_primary, sort_order)
select md5('case-study:facebook-shop-ads-5-91-roas')::uuid, v.k, v.label, v.num, v.txt, v.prefix, v.suffix, v.descr, v.is_primary, v.ord from (values
  ('roas', 'ROAS', 5.91::numeric, '5.91', null, 'x', null, true, 0),
  ('sales', 'Sales', 192433.6::numeric, '192433.6', '$', null, null, false, 1),
  ('ad_spend', 'Ad spend', 32540.63::numeric, '32540.63', '$', null, null, false, 2)
) as v(k, label, num, txt, prefix, suffix, descr, is_primary, ord)
where not exists (select 1 from public.case_study_metrics m where m.case_study_id = md5('case-study:facebook-shop-ads-5-91-roas')::uuid);
insert into public.case_study_media (case_study_id, media_type, url, alt_text, caption, sort_order)
select md5('case-study:facebook-shop-ads-5-91-roas')::uuid, 'image', 'https://static.wixstatic.com/media/1b7e01_55bb1f655233411a9450b403da4abc8d~mv2.png', 'Facebook Shop ads: 5.91 ROAS: results', 'Campaign results', 0
where not exists (select 1 from public.case_study_media m where m.case_study_id = md5('case-study:facebook-shop-ads-5-91-roas')::uuid);

-- SaaS remarketing: 566% ROAS
insert into public.case_studies (id, title, slug, short_description, result_headline, client_display_mode, client_descriptor,
  campaign_objective, challenge, strategy, execution_summary, results_summary, currency_code, status, is_featured, featured_order)
values (md5('case-study:saas-remarketing-566-roas')::uuid, 'SaaS remarketing: 566% ROAS', 'saas-remarketing-566-roas', 'A remarketing-led strategy for a SaaS company serving publishers.', 'Cost per acquisition cut from $28.92 to $19.69', 'anonymized', 'SaaS company for publishers',
  'Sales', 'A SaaS company serving publishers already had a healthy return on ad spend but believed there was more to gain.', 'We overhauled the strategy with a much stronger emphasis on remarketing.', '', 'Cost per acquisition dropped from $28.92 to $19.69, and the client is now seeing a 566% return on ad spend as it scales.', 'USD', 'published', false, null)
on conflict (id) do nothing;
insert into public.case_study_services (case_study_id, service_id) select md5('case-study:saas-remarketing-566-roas')::uuid, id from public.services where slug = 'digital-marketing' on conflict do nothing;
insert into public.case_study_category_map (case_study_id, category_id) select md5('case-study:saas-remarketing-566-roas')::uuid, id from public.case_study_categories where slug = 'lead-generation' on conflict do nothing;
insert into public.case_study_metrics (case_study_id, metric_key, label, value_numeric, value_text, prefix, suffix, description, is_primary, sort_order)
select md5('case-study:saas-remarketing-566-roas')::uuid, v.k, v.label, v.num, v.txt, v.prefix, v.suffix, v.descr, v.is_primary, v.ord from (values
  ('roas', 'ROAS', 566::numeric, '566', null, '%', null, true, 0),
  ('cpa', 'CPA', 19.69::numeric, '19.69', '$', null, 'Down from $28.92', false, 1)
) as v(k, label, num, txt, prefix, suffix, descr, is_primary, ord)
where not exists (select 1 from public.case_study_metrics m where m.case_study_id = md5('case-study:saas-remarketing-566-roas')::uuid);
insert into public.case_study_media (case_study_id, media_type, url, alt_text, caption, sort_order)
select md5('case-study:saas-remarketing-566-roas')::uuid, 'image', 'https://static.wixstatic.com/media/1b7e01_0cbb3ef783344c95ad5cd7eb6ed0ccdd~mv2.png', 'SaaS remarketing: 566% ROAS: results', 'Campaign results', 0
where not exists (select 1 from public.case_study_media m where m.case_study_id = md5('case-study:saas-remarketing-566-roas')::uuid);

