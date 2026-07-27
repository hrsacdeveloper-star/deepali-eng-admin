-- Enable UUID extension

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. site_settings

CREATE TABLE site_settings (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

company_name TEXT NOT NULL,

about_text TEXT,

vision_text TEXT,

mission_text TEXT,

infrastructure_text TEXT,

address TEXT,

phone TEXT,

email TEXT,

map_embed_url TEXT,

facebook_url TEXT,

linkedin_url TEXT,

twitter_url TEXT,

instagram_url TEXT,

footer_text TEXT,

created_at TIMESTAMPTZ DEFAULT now(),

updated_at TIMESTAMPTZ DEFAULT now()

);

-- 2. hero_slides

CREATE TABLE hero_slides (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

title TEXT NOT NULL,

subtitle TEXT,

image_url TEXT,

button_text TEXT,

button_link TEXT,

order_index INT DEFAULT 0,

is_active BOOLEAN DEFAULT true,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 3. product_categories

CREATE TABLE product_categories (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

name TEXT NOT NULL,

slug TEXT UNIQUE NOT NULL,

description TEXT,

image_url TEXT,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);


CREATE TABLE products (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,

name TEXT NOT NULL,

slug TEXT UNIQUE NOT NULL,

brief_description TEXT,

full_description TEXT,

technical_parameters JSONB,

applications TEXT,

image_url TEXT,

order_index INT DEFAULT 0,

is_active BOOLEAN DEFAULT true,

created_at TIMESTAMPTZ DEFAULT now(),

updated_at TIMESTAMPTZ DEFAULT now()

);

-- 5. industries

CREATE TABLE industries (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

name TEXT NOT NULL,

slug TEXT UNIQUE NOT NULL,

description TEXT,

image_url TEXT,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 6. machines

CREATE TABLE machines (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

name TEXT NOT NULL,

description TEXT,

image_url TEXT,

specifications JSONB,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 7. gallery

CREATE TABLE gallery (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

title TEXT,

category TEXT,

image_url TEXT NOT NULL,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 8. certificates

CREATE TABLE certificates (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

name TEXT NOT NULL,

image_url TEXT NOT NULL,

description TEXT,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 9. clients

CREATE TABLE clients (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

name TEXT NOT NULL,

logo_url TEXT NOT NULL,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 10. testimonials

CREATE TABLE testimonials (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

client_name TEXT NOT NULL,

company TEXT,

content TEXT NOT NULL,

rating INT DEFAULT 5,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 11. team

CREATE TABLE team (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

name TEXT NOT NULL,

position TEXT NOT NULL,

bio TEXT,

image_url TEXT,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 12. articles

CREATE TABLE articles (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

type TEXT CHECK (type IN ('blog', 'news')) DEFAULT 'blog',

title TEXT NOT NULL,

slug TEXT UNIQUE NOT NULL,

excerpt TEXT,

content TEXT NOT NULL,

image_url TEXT,

author TEXT,

published_at TIMESTAMPTZ DEFAULT now(),

is_published BOOLEAN DEFAULT true,

created_at TIMESTAMPTZ DEFAULT now(),

updated_at TIMESTAMPTZ DEFAULT now()

);

-- 13. faqs

CREATE TABLE faqs (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

category TEXT,

question TEXT NOT NULL,

answer TEXT NOT NULL,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 14. downloads

CREATE TABLE downloads (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

title TEXT NOT NULL,

file_url TEXT NOT NULL,

file_type TEXT,

file_size TEXT,

category TEXT,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 15. careers

CREATE TABLE careers (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

title TEXT NOT NULL,

location TEXT,

department TEXT,

description TEXT,

requirements TEXT,

is_active BOOLEAN DEFAULT true,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 16. form_submissions

CREATE TABLE form_submissions (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

type TEXT CHECK (type IN ('contact', 'rfq', 'job_application',
'callback', 'complaint', 'feedback', 'vendor')) NOT NULL,

payload JSONB NOT NULL,

status TEXT CHECK (status IN ('new', 'read', 'archived')) DEFAULT 'new',

created_at TIMESTAMPTZ DEFAULT now()

);

-- 18. seo_meta

CREATE TABLE seo_meta (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

page_path TEXT UNIQUE NOT NULL,

title TEXT,

description TEXT,

keywords TEXT,

og_image_url TEXT,

created_at TIMESTAMPTZ DEFAULT now(),

updated_at TIMESTAMPTZ DEFAULT now()

);

-- Storage buckets

-- 17. newsletter_subscribers

CREATE TABLE IF NOT EXISTS newsletter_subscribers (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

email TEXT UNIQUE NOT NULL,

is_active BOOLEAN DEFAULT true,

created_at TIMESTAMPTZ DEFAULT now()

);


INSERT INTO storage.buckets (id, name, public) VALUES ('images',
'images', true) ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('documents',
'documents', true) ON CONFLICT DO NOTHING;

-- Enable RLS

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

ALTER TABLE team ENABLE ROW LEVEL SECURITY;

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

ALTER TABLE careers ENABLE ROW LEVEL SECURITY;

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

ALTER TABLE seo_meta ENABLE ROW LEVEL SECURITY;

-- Public READ policies (for content tables)

CREATE POLICY "Public can read site_settings" ON site_settings FOR
SELECT USING (true);

CREATE POLICY "Public can read hero_slides" ON hero_slides FOR SELECT
USING (true);

CREATE POLICY "Public can read product_categories" ON
product_categories FOR SELECT USING (true);

CREATE POLICY "Public can read products" ON products FOR SELECT USING
(true);

CREATE POLICY "Public can read industries" ON industries FOR SELECT
USING (true);

CREATE POLICY "Public can read machines" ON machines FOR SELECT USING
(true);

CREATE POLICY "Public can read gallery" ON gallery FOR SELECT USING
(true);

CREATE POLICY "Public can read certificates" ON certificates FOR
SELECT USING (true);

CREATE POLICY "Public can read clients" ON clients FOR SELECT USING
(true);

CREATE POLICY "Public can read testimonials" ON testimonials FOR
SELECT USING (true);

CREATE POLICY "Public can read team" ON team FOR SELECT USING (true);

CREATE POLICY "Public can read articles" ON articles FOR SELECT USING
(true);

CREATE POLICY "Public can read faqs" ON faqs FOR SELECT USING (true);

CREATE POLICY "Public can read downloads" ON downloads FOR SELECT
USING (true);

CREATE POLICY "Public can read careers" ON careers FOR SELECT USING
(true);

CREATE POLICY "Public can read seo_meta" ON seo_meta FOR SELECT USING
(true);

-- Authenticated READ policies (for private tables)

CREATE POLICY "Auth can read form_submissions" ON form_submissions FOR
SELECT TO authenticated USING (true);

CREATE POLICY "Auth can read newsletter_subscribers" ON
newsletter_subscribers FOR SELECT TO authenticated USING (true);

-- Authenticated WRITE policies (Admin roles)

CREATE POLICY "Auth can manage site_settings" ON site_settings FOR ALL
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage hero_slides" ON hero_slides FOR ALL TO
authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage product_categories" ON
product_categories FOR ALL TO authenticated USING (true) WITH CHECK
(true);

CREATE POLICY "Auth can manage products" ON products FOR ALL TO
authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage industries" ON industries FOR ALL TO
authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage machines" ON machines FOR ALL TO
authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage gallery" ON gallery FOR ALL TO
authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage certificates" ON certificates FOR ALL
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage clients" ON clients FOR ALL TO
authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage testimonials" ON testimonials FOR ALL
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage team" ON team FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage articles" ON articles FOR ALL TO
authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage faqs" ON faqs FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage downloads" ON downloads FOR ALL TO
authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage careers" ON careers FOR ALL TO
authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage seo_meta" ON seo_meta FOR ALL TO
authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage form_submissions" ON form_submissions
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage newsletter_subscribers" ON
newsletter_subscribers FOR ALL TO authenticated USING (true) WITH CHECK
(true);

-- Public INSERT policies

CREATE POLICY "Public can insert form_submissions" ON form_submissions
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public can insert newsletter_subscribers" ON
newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK
(true);

-- Storage Policies

CREATE POLICY "Public can read images" ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Auth can insert images" ON storage.objects FOR INSERT
TO authenticated WITH CHECK (bucket_id = 'images');

CREATE POLICY "Auth can update images" ON storage.objects FOR UPDATE
TO authenticated USING (bucket_id = 'images');

CREATE POLICY "Auth can delete images" ON storage.objects FOR DELETE
TO authenticated USING (bucket_id = 'images');

CREATE POLICY "Public can read documents" ON storage.objects FOR
SELECT USING (bucket_id = 'documents');

CREATE POLICY "Auth can insert documents" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Auth can update documents" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'documents');

CREATE POLICY "Auth can delete documents" ON storage.objects FOR
DELETE TO authenticated USING (bucket_id = 'documents');

-- Seed site_settings

INSERT INTO site_settings (company_name, about_text, address, phone,
email)

VALUES ('Deepali Engineering', 'A professional industrial
manufacturing company manufacturing engineering components for export
and domestic markets.', 'Industrial Estate, Mumbai, India', '+91
98765 43210', 'info@deepaliengineering.com');

-- Seed hero_slides

INSERT INTO hero_slides (title, subtitle, image_url, button_text,
button_link) VALUES

('Precision Engineering Solutions', 'Manufacturing high-quality
engineering components for global markets.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_9d8e42f5-8212-4d92-a70b-62f57f773445.jpg',
'Explore Products', '/products'),

('Advanced Manufacturing Facility', 'State-of-the-art machinery and
rigorous quality control.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0d8d4398-c58c-4a45-8669-e722ec34d8ca.jpg',
'View Infrastructure', '/infrastructure');

-- Seed product_categories

INSERT INTO product_categories (name, slug, description, image_url)
VALUES

('Couplings', 'couplings', 'High-performance steel couplings for
power transmission.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7a13c699-0728-4bed-a2ca-fb3cf44d3665.jpg'),

('Flanges', 'flanges', 'Stainless steel industrial flanges.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0d155152-b505-4898-8fd3-7e947ac1dc17.jpg'),

('Pipe Fittings', 'pipe-fittings', 'Durable industrial steel pipe
fittings.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0ac6928d-52fe-4918-9121-2deab1d9df49.jpg'),

('Forgings', 'forgings', 'Heavy steel forging blocks for industrial
use.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8945601b-acd3-403c-acfd-5c90533d87ef.jpg');

-- Seed industries

INSERT INTO industries (name, slug, description, image_url) VALUES

('Oil & Gas', 'oil-and-gas', 'Refineries and petrochemical
plants.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_70a713d6-73bf-40a2-97f7-227d6344fae3.jpg'),

('Power Generation', 'power-generation', 'Modern power plant
infrastructure.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d93f9b5a-d954-4e54-8e2f-6c77c1292373.jpg'),

('Chemical', 'chemical', 'Chemical processing facilities.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7311a97b-51a7-4d6a-9a14-f0d2b9cfa9e8.jpg'),

('Maritime', 'maritime', 'Shipbuilding and maritime equipment.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ce656356-52ac-497e-892f-34bcbf027b79.jpg');

-- Seed certificates

INSERT INTO certificates (name, image_url, description) VALUES

('ISO 9001:2015',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_9b0acbed-939c-46db-b9fb-8936ea3515c7.jpg',
'Quality Management System Certification');

-- Seed machines

INSERT INTO machines (name, description, image_url) VALUES

('CNC Machining Center', 'High-precision computer numerical control
machining center.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0d8d4398-c58c-4a45-8669-e722ec34d8ca.jpg'),

('Heavy Forging Press', 'Industrial forging press for heavy metal
components.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_1755b145-1e1b-4c68-b292-e01cc3dc1932.jpg'),

('Industrial Lathe', 'Precision turning and shaping machine tool.',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a2c36066-c2bf-4fad-9be2-748045c981bf.jpg');ALTER
TABLE form_submissions ADD COLUMN user_id UUID REFERENCES auth.users(id)
ON DELETE SET NULL;

ALTER TABLE form_submissions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT
now();

CREATE POLICY "Users can read own submissions" ON form_submissions FOR
SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own submissions" ON form_submissions
FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK
(user_id = auth.uid());

CREATE POLICY "Users can delete own submissions" ON form_submissions
FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Table: profiles

CREATE TABLE IF NOT EXISTS profiles (

id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

name TEXT,

designation TEXT,

contact_number TEXT,

email TEXT,

created_at TIMESTAMPTZ DEFAULT now(),

updated_at TIMESTAMPTZ DEFAULT now()

);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read profiles" ON profiles FOR SELECT USING
(true);

CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
USING (auth.uid() = id);ALTER TABLE products ADD COLUMN IF NOT EXISTS
price numeric;

ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity integer
DEFAULT 0;INSERT INTO product_categories (id, name, slug) VALUES

('11111111-1111-1111-1111-111111111111', 'Materials & Piping',
'materials-piping'),

('22222222-2222-2222-2222-222222222222', 'Power & Energy Systems',
'power-energy'),

('33333333-3333-3333-3333-333333333333', 'Petroleum Refinery
Components', 'petroleum-refinery'),

('44444444-4444-4444-4444-444444444444', 'Automotive Manufacturing
Parts', 'automotive-manufacturing')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, category_id, name, slug, brief_description, full_description, technical_parameters, applications, image_url, order_index, is_active, price, stock_quantity) VALUES

('10000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Materials & Piping','materials-piping','Constant and reliable supplier of pipe, sheet, rolled profiles, elbows, fittings, flanges, studs, assemblies and fittings used in the petrochemical, energetic, petroleum, chemical and naval industries.','Constant and reliable supplier of pipe, sheet, rolled profiles, elbows, fittings, flanges, studs, assemblies and fittings used in the petrochemical, energetic, petroleum, chemical and naval industries. Our materials and piping components meet the highest industry standards for durability and performance.','{"Material":"Carbon Steel, Stainless Steel","Standard":"ASTM, ASME, API","Size":"1/2 inch to 48 inch"}','Petrochemical, Power Generation, Naval Industries','https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0ac6928d-52fe-4918-9121-2deab1d9df49.jpg',1,true,0,100),

('20000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','Power & Energy Systems','power-energy','High-quality energy transfer solutions and pipeline systems engineered to withstand extreme conditions in power generation plants and facilities.','High-quality energy transfer solutions and pipeline systems engineered to withstand extreme conditions in power generation plants and facilities. Built for extreme pressures and high temperatures.','{"Pressure Rating":"Up to 2500 lbs","Temperature":"Up to 600°C","Testing":"Hydrostatic, NDT"}','Power Plants, Nuclear Facilities, Renewable Energy','https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d93f9b5a-d954-4e54-8e2f-6c77c1292373.jpg',2,true,0,100),

('30000000-0000-0000-0000-000000000003','33333333-3333-3333-3333-333333333333','Petroleum Refinery Components','petroleum-refinery','Precision engineered components providing strong connections and safe operations for various industrial piping networks and oil refinery systems.','Precision engineered components providing strong connections and safe operations for various industrial piping networks and oil refinery systems.','{"Corrosion Resistance":"High","Type":"Heavy Duty","Certification":"ISO 9001"}','Oil & Gas, Offshore Platforms, Refineries','https://miaoda-site-img.s3cdn.medo.dev/images/KLing_995eb554-c2af-4e90-9183-26e2b85e8af2.jpg',3,true,0,100),

('40000000-0000-0000-0000-000000000004','44444444-4444-4444-4444-444444444444','Automotive Manufacturing Parts','automotive-manufacturing','Durable and highly precise automotive manufacturing parts ensuring optimal performance and seamless integration in modern assembly lines.','Durable and highly precise automotive manufacturing parts ensuring optimal performance and seamless integration in modern assembly lines.','{"Tolerance":"±0.01mm","Surface Finish":"Polished, Coated","Durability":"Extended Lifecycle"}','Automotive Assembly, Heavy Machinery','https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7311a97b-51a7-4d6a-9a14-f0d2b9cfa9e8.jpg',4,true,0,100)

ON CONFLICT (id) DO NOTHING;

insert into storage.buckets (id, name, public) values ('product_images', 'product_images', true) on conflict do nothing;

create policy "Public Access" on storage.objects for select using
(bucket_id = 'product_images');

create policy "Auth Insert" on storage.objects for insert with check
(bucket_id = 'product_images' and auth.role() = 'authenticated');

create policy "Auth Update" on storage.objects for update using
(bucket_id = 'product_images' and auth.role() =
'authenticated');

INSERT INTO certificates (id, name, image_url,
description, order_index) VALUES

(gen_random_uuid(), 'ISO 9001:2015',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_23fe3c9f-84c6-4d94-a07a-42ccc98322f8.jpg',
'Quality Management System Certification', 1),

(gen_random_uuid(), 'API Spec Q1',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_74e540ad-c585-4f02-bc39-b5d224a9f73f.jpg',
'Quality Specification for Petroleum and Natural Gas', 2),

(gen_random_uuid(), 'ASME U Stamp',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_542b5e36-c54a-4c92-822a-a389d40cbeb5.jpg',
'Pressure Vessel Certification', 3),

(gen_random_uuid(), 'CE Marking',
'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3edf3618-f2a1-4ea0-a405-3d87674d7aa0.jpg',
'European Conformity Standards', 4)

ON CONFLICT DO NOTHING;-- CMS Content Tables for Deepali Engineering
-- Website

-- All tables use UUID primary keys with auto-generation (no manual ID
-- required)

-- 1. Home Page Sections (editable content blocks)

-- Table: home_sections

CREATE TABLE IF NOT EXISTS home_sections (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

section_key TEXT UNIQUE NOT NULL,

title TEXT,

subtitle TEXT,

content TEXT,

image_url TEXT,

secondary_image_url TEXT,

button_text TEXT,

button_link TEXT,

is_active BOOLEAN DEFAULT true,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now(),

updated_at TIMESTAMPTZ DEFAULT now()

);

-- 2. Home Page Stats / Counters

-- Table: home_stats

CREATE TABLE IF NOT EXISTS home_stats (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

label TEXT NOT NULL,

value TEXT NOT NULL,

suffix TEXT,

icon TEXT,

is_active BOOLEAN DEFAULT true,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 3. Featured Items on Home Page

-- Table: featured_items

CREATE TABLE IF NOT EXISTS featured_items (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

section TEXT NOT NULL CHECK (section IN ('products', 'industries',
'clients')),

item_id UUID,

item_type TEXT,

is_active BOOLEAN DEFAULT true,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 4. About Us Page Sections

-- Table: about_us_sections

CREATE TABLE IF NOT EXISTS about_us_sections (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

section_key TEXT UNIQUE NOT NULL,

title TEXT,

heading TEXT,

content TEXT,

image_url TEXT,

secondary_image_url TEXT,

highlights JSONB DEFAULT '[]',

button_text TEXT,

button_link TEXT,

is_active BOOLEAN DEFAULT true,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now(),

updated_at TIMESTAMPTZ DEFAULT now()

);

-- 5. Core Values

-- Table: core_values

CREATE TABLE IF NOT EXISTS core_values (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

title TEXT NOT NULL,

description TEXT,

icon TEXT,

is_active BOOLEAN DEFAULT true,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 6. Extend Industries table with more details

ALTER TABLE industries ADD COLUMN IF NOT EXISTS applications TEXT;

ALTER TABLE industries ADD COLUMN IF NOT EXISTS key_benefits JSONB
DEFAULT '[]';

ALTER TABLE industries ADD COLUMN IF NOT EXISTS specifications TEXT;

ALTER TABLE industries ADD COLUMN IF NOT EXISTS is_featured BOOLEAN
DEFAULT false;

ALTER TABLE industries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ
DEFAULT now();

-- 7. Quality Page Sections

-- Table: quality_sections

CREATE TABLE IF NOT EXISTS quality_sections (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

section_key TEXT UNIQUE NOT NULL,

title TEXT,

heading TEXT,

content TEXT,

image_url TEXT,

is_active BOOLEAN DEFAULT true,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now(),

updated_at TIMESTAMPTZ DEFAULT now()

);

-- 8. Testing Procedures

-- Table: testing_procedures

CREATE TABLE IF NOT EXISTS testing_procedures (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

title TEXT NOT NULL,

description TEXT,

image_url TEXT,

video_url TEXT,

is_active BOOLEAN DEFAULT true,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 9. Quality Standards

-- Table: quality_standards

CREATE TABLE IF NOT EXISTS quality_standards (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

name TEXT NOT NULL,

description TEXT,

icon TEXT,

is_active BOOLEAN DEFAULT true,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- 10. Extend site_settings for Contact page and more

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_heading TEXT;

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_description
TEXT;

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS working_hours TEXT;

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS emergency_phone TEXT;

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS latitude TEXT;

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS longitude TEXT;

-- 11. Tool Room Sections

-- Table: tool_room_sections

CREATE TABLE IF NOT EXISTS tool_room_sections (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

section_key TEXT UNIQUE NOT NULL,

title TEXT,

heading TEXT,

content TEXT,

image_url TEXT,

is_active BOOLEAN DEFAULT true,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now(),

updated_at TIMESTAMPTZ DEFAULT now()

);

-- 12. Tool Room Machines

-- Table: tool_room_machines

CREATE TABLE IF NOT EXISTS tool_room_machines (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

name TEXT NOT NULL,

description TEXT,

specifications JSONB DEFAULT '{}',

image_url TEXT,

is_active BOOLEAN DEFAULT true,

order_index INT DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT now()

);

-- Enable RLS on new tables

ALTER TABLE home_sections ENABLE ROW LEVEL SECURITY;

ALTER TABLE home_stats ENABLE ROW LEVEL SECURITY;

ALTER TABLE featured_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE about_us_sections ENABLE ROW LEVEL SECURITY;

ALTER TABLE core_values ENABLE ROW LEVEL SECURITY;

ALTER TABLE quality_sections ENABLE ROW LEVEL SECURITY;

ALTER TABLE testing_procedures ENABLE ROW LEVEL SECURITY;

ALTER TABLE quality_standards ENABLE ROW LEVEL SECURITY;

ALTER TABLE tool_room_sections ENABLE ROW LEVEL SECURITY;

ALTER TABLE tool_room_machines ENABLE ROW LEVEL SECURITY;

-- Public READ policies

CREATE POLICY "Public can read home_sections" ON home_sections FOR
SELECT USING (true);

CREATE POLICY "Public can read home_stats" ON home_stats FOR SELECT
USING (true);

CREATE POLICY "Public can read featured_items" ON featured_items FOR
SELECT USING (true);

CREATE POLICY "Public can read about_us_sections" ON about_us_sections
FOR SELECT USING (true);

CREATE POLICY "Public can read core_values" ON core_values FOR SELECT
USING (true);

CREATE POLICY "Public can read quality_sections" ON quality_sections
FOR SELECT USING (true);

CREATE POLICY "Public can read testing_procedures" ON
testing_procedures FOR SELECT USING (true);

CREATE POLICY "Public can read quality_standards" ON quality_standards
FOR SELECT USING (true);

CREATE POLICY "Public can read tool_room_sections" ON
tool_room_sections FOR SELECT USING (true);

CREATE POLICY "Public can read tool_room_machines" ON
tool_room_machines FOR SELECT USING (true);

-- Authenticated WRITE policies (admin management)

CREATE POLICY "Auth can manage home_sections" ON home_sections FOR ALL
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage home_stats" ON home_stats FOR ALL TO
authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage featured_items" ON featured_items FOR
ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage about_us_sections" ON about_us_sections
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage core_values" ON core_values FOR ALL TO
authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage quality_sections" ON quality_sections
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage testing_procedures" ON
testing_procedures FOR ALL TO authenticated USING (true) WITH CHECK
(true);

CREATE POLICY "Auth can manage quality_standards" ON quality_standards
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can manage tool_room_sections" ON
tool_room_sections FOR ALL TO authenticated USING (true) WITH CHECK
(true);

CREATE POLICY "Auth can manage tool_room_machines" ON
tool_room_machines FOR ALL TO authenticated USING (true) WITH CHECK
(true);

-- Seed default CMS content

INSERT INTO home_sections (section_key, title, subtitle, content,
button_text, button_link, order_index) VALUES

('about', 'About Deepali Engineering', 'Excellence Since 1995',
'A professional industrial manufacturing company established in 1995,
producing precision-engineered couplings, flanges, pipe fittings, and
custom forgings for export and domestic markets.', 'Learn More',
'/about', 1),

('why_choose_us', 'Why Choose Us', 'Quality & Precision', 'We
combine advanced manufacturing with strict quality control to deliver
components that meet global standards.', 'Explore', '/quality', 2)

ON CONFLICT (section_key) DO NOTHING;

INSERT INTO home_stats (label, value, suffix, icon, order_index) VALUES

('Years of Experience', '25', '+', 'calendar', 1),

('Products Manufactured', '500', '+', 'cog', 2),

('Countries Served', '50', '+', 'globe', 3),

('Quality Certifications', '5', '+', 'award', 4)

ON CONFLICT DO NOTHING;

INSERT INTO about_us_sections (section_key, title, heading, content,
order_index) VALUES

('story', 'Our Story', 'Legacy of Engineering Excellence',
'Deepali Engineering has been serving domestic and international
markets since 1995 with precision-engineered components.', 1),

('vision_mission', 'Vision & Mission', 'Our Commitment', 'To
deliver zero-defect engineering components while maintaining global
standards and building long-term partnerships.', 2)

ON CONFLICT (section_key) DO NOTHING;

INSERT INTO core_values (title, description, icon, order_index) VALUES

('Quality First', 'Uncompromising dedication to precision and
zero-defect products.', 'shield-check', 1),

('Customer Centric', 'Building long-term partnerships through
reliable service.', 'users', 2),

('Global Standards', 'Investing in cutting-edge machinery and
training.', 'globe', 3)

ON CONFLICT DO NOTHING;

INSERT INTO quality_sections (section_key, title, heading, content,
order_index) VALUES

('policy', 'Quality Policy', 'Commitment to Excellence', 'We are
committed to delivering products that meet or exceed customer
expectations through continuous improvement and rigorous quality
control.', 1),

('process', 'Quality Process', 'Rigorous Control', 'Every product
undergoes strict inspection at multiple stages of manufacturing.', 2)

ON CONFLICT (section_key) DO NOTHING;

INSERT INTO quality_standards (name, description, icon, order_index)
VALUES

('ISO 9001:2015', 'Quality Management System standard for consistent
product quality.', 'certificate', 1),

('API Spec Q1', 'Specification for quality programs in petroleum and
natural gas industries.', 'droplet', 2),

('ASME Standards', 'American Society of Mechanical Engineers
certification for pressure equipment.', 'gauge', 3)

ON CONFLICT DO NOTHING;

INSERT INTO testing_procedures (title, description, order_index) VALUES

('Dimensional Inspection', 'Precision measurement of all critical
dimensions.', 1),

('Material Testing', 'Chemical and mechanical testing of raw
materials.', 2),

('Pressure Testing', 'Hydrostatic and pneumatic pressure testing.',
3)

ON CONFLICT DO NOTHING;

INSERT INTO tool_room_sections (section_key, title, heading, content,
order_index) VALUES

('overview', 'Tool Room Overview', 'Precision Tooling', 'Our tool
room is equipped with advanced measuring and machining equipment.', 1)

ON CONFLICT (section_key) DO NOTHING;
