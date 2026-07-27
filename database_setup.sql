-- Roles & Permissions
CREATE TABLE IF NOT EXISTS roles_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT UNIQUE NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role_id UUID REFERENCES roles_permissions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (Website Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  designation TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Super Admin Role
INSERT INTO roles_permissions (id, role_name, permissions) VALUES 
('00000000-0000-0000-0000-000000000001', 'Super Admin', '{"all": true}')
ON CONFLICT (role_name) DO NOTHING;

-- RLS
ALTER TABLE roles_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users au
    JOIN roles_permissions rp ON au.role_id = rp.id
    WHERE au.id = auth.uid() AND rp.role_name = 'Super Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND status = 'Active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admin users can view all roles" ON roles_permissions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Super Admins can manage roles" ON roles_permissions FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Admin users can view all admins" ON admin_users FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Super Admins can manage admins" ON admin_users FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Admins can update themselves" ON admin_users FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admin users can view all profiles" ON profiles FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Super Admins can manage profiles" ON profiles FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Users can view and update their own profile" ON profiles FOR ALL TO authenticated USING (auth.uid() = id);
-- Hero Slides
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  background_media TEXT,
  button_text TEXT,
  button_link TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stats Counters
CREATE TABLE IF NOT EXISTS stats_counters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- About Page (Singleton)
CREATE TABLE IF NOT EXISTS about_page (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  heading TEXT NOT NULL,
  description TEXT,
  side_image_1 TEXT,
  side_image_2 TEXT,
  highlights JSONB DEFAULT '[]',
  vision_title TEXT,
  vision_text TEXT,
  mission_title TEXT,
  mission_text TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core Values
CREATE TABLE IF NOT EXISTS core_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leadership Team
CREATE TABLE IF NOT EXISTS team (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infrastructure: Facilities & Machines
CREATE TABLE IF NOT EXISTS facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  specifications JSONB DEFAULT '{}',
  image TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quality: Certifications, Standards, Testing
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  certificate_media TEXT,
  issuing_authority TEXT,
  valid_from DATE,
  valid_until DATE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quality_standards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testing_procedures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  media TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tool Room
CREATE TABLE IF NOT EXISTS tool_room_machines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  specifications JSONB DEFAULT '{}',
  image TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tool_room_facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tool_room_team (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE testing_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_room_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_room_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_room_team ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all content
CREATE POLICY "Public read hero_slides" ON hero_slides FOR SELECT USING (true);
CREATE POLICY "Public read stats_counters" ON stats_counters FOR SELECT USING (true);
CREATE POLICY "Public read about_page" ON about_page FOR SELECT USING (true);
CREATE POLICY "Public read core_values" ON core_values FOR SELECT USING (true);
CREATE POLICY "Public read team" ON team FOR SELECT USING (true);
CREATE POLICY "Public read facilities" ON facilities FOR SELECT USING (true);
CREATE POLICY "Public read machines" ON machines FOR SELECT USING (true);
CREATE POLICY "Public read certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Public read quality_standards" ON quality_standards FOR SELECT USING (true);
CREATE POLICY "Public read testing_procedures" ON testing_procedures FOR SELECT USING (true);
CREATE POLICY "Public read tool_room_machines" ON tool_room_machines FOR SELECT USING (true);
CREATE POLICY "Public read tool_room_facilities" ON tool_room_facilities FOR SELECT USING (true);
CREATE POLICY "Public read tool_room_team" ON tool_room_team FOR SELECT USING (true);

-- Allow admins to manage all content
CREATE POLICY "Admin manage hero_slides" ON hero_slides FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage stats_counters" ON stats_counters FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage about_page" ON about_page FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage core_values" ON core_values FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage team" ON team FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage facilities" ON facilities FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage machines" ON machines FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage certificates" ON certificates FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage quality_standards" ON quality_standards FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage testing_procedures" ON testing_procedures FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage tool_room_machines" ON tool_room_machines FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage tool_room_facilities" ON tool_room_facilities FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage tool_room_team" ON tool_room_team FOR ALL TO authenticated USING (public.is_admin());

INSERT INTO about_page (heading, vision_title, mission_title) VALUES ('About Deepali Engineering', 'Our Vision', 'Our Mission');
-- Products
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  parent_id UUID REFERENCES product_categories(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES product_categories(id),
  short_description TEXT,
  full_description TEXT,
  specifications JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  industry_tags JSONB DEFAULT '[]',
  pdf_catalog TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Industries
CREATE TABLE IF NOT EXISTS industries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  related_products JSONB DEFAULT '[]',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery & Clients
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image TEXT NOT NULL,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blogs
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author TEXT,
  featured_image TEXT,
  summary TEXT,
  content TEXT,
  category_id UUID REFERENCES blog_categories(id),
  tags JSONB DEFAULT '[]',
  publish_date TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Downloads
CREATE TABLE IF NOT EXISTS download_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  category_id UUID REFERENCES download_categories(id),
  description TEXT,
  download_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Careers
CREATE TABLE IF NOT EXISTS careers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  job_type TEXT,
  experience TEXT,
  salary_range TEXT,
  description TEXT,
  responsibilities TEXT,
  requirements TEXT,
  deadline DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES careers(id),
  applicant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'New',
  applied_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  website_url TEXT,
  partner_type TEXT DEFAULT 'Domestic',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read product_categories" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read industries" ON industries FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public read clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Public read blog_categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Public read download_categories" ON download_categories FOR SELECT USING (true);
CREATE POLICY "Public read downloads" ON downloads FOR SELECT USING (true);
CREATE POLICY "Public read careers" ON careers FOR SELECT USING (true);
CREATE POLICY "Public read faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Public read partners" ON partners FOR SELECT USING (true);

-- Job Applications Submission Policy
CREATE POLICY "Public can insert job_applications" ON job_applications FOR INSERT WITH CHECK (true);

-- Admin Manage Policies
CREATE POLICY "Admin manage product_categories" ON product_categories FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage products" ON products FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage industries" ON industries FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage gallery" ON gallery FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage clients" ON clients FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage blog_categories" ON blog_categories FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage articles" ON articles FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage download_categories" ON download_categories FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage downloads" ON downloads FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage careers" ON careers FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage job_applications" ON job_applications FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage faqs" ON faqs FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage partners" ON partners FOR ALL TO authenticated USING (public.is_admin());
-- Chatbot Knowledge Base
CREATE TABLE IF NOT EXISTS chatbot_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  keywords TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  fts_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', question || ' ' || answer || ' ' || COALESCE(keywords, ''))
  ) STORED
);
CREATE INDEX IF NOT EXISTS chatbot_knowledge_fts_idx ON chatbot_knowledge USING GIN (fts_vector);

-- Chatbot Documents
CREATE TABLE IF NOT EXISTS chatbot_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fts_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || content)
  ) STORED
);
CREATE INDEX IF NOT EXISTS chatbot_documents_fts_idx ON chatbot_documents USING GIN (fts_vector);

-- Form Submissions (Contact Enquiries & RFQ)
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'Contact' or 'RFQ'
  name TEXT,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT,
  product_interest TEXT,
  quantity TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_date TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  company TEXT,
  designation TEXT,
  quote TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT DEFAULT 'Deepali Engineering',
  logo TEXT,
  favicon TEXT,
  address TEXT DEFAULT 'Plot No. 1, Gat No. 341, Chintamani Industrial Estate, MIDC Bhosari, Pune - 411026, India',
  phone TEXT DEFAULT '+91 9922432890',
  email TEXT DEFAULT 'deepaliengg.info@gmail.com',
  about_text TEXT DEFAULT 'A professional industrial manufacturing company established in 1995, producing precision-engineered couplings, flanges, pipe fittings, and custom forgings for export and domestic markets.',
  working_hours TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_media_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS footer_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  copyright_text TEXT,
  footer_columns JSONB DEFAULT '[]',
  contact_info JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_meta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_name TEXT UNIQUE NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  og_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nav_menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  parent_id UUID REFERENCES nav_menu_items(id),
  display_order INTEGER DEFAULT 0,
  open_in_new_tab BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE chatbot_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_menu_items ENABLE ROW LEVEL SECURITY;

-- Public Read & Insert
CREATE POLICY "Public read chatbot_knowledge" ON chatbot_knowledge FOR SELECT USING (true);
CREATE POLICY "Public read chatbot_documents" ON chatbot_documents FOR SELECT USING (true);
CREATE POLICY "Public insert form_submissions" ON form_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert newsletter_subscribers" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read social_media_links" ON social_media_links FOR SELECT USING (true);
CREATE POLICY "Public read footer_content" ON footer_content FOR SELECT USING (true);
CREATE POLICY "Public read seo_meta" ON seo_meta FOR SELECT USING (true);
CREATE POLICY "Public read nav_menu_items" ON nav_menu_items FOR SELECT USING (true);

-- Admin Manage
CREATE POLICY "Admin manage chatbot_knowledge" ON chatbot_knowledge FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage chatbot_documents" ON chatbot_documents FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage form_submissions" ON form_submissions FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage newsletter_subscribers" ON newsletter_subscribers FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage testimonials" ON testimonials FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage site_settings" ON site_settings FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage social_media_links" ON social_media_links FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage footer_content" ON footer_content FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage seo_meta" ON seo_meta FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin manage nav_menu_items" ON nav_menu_items FOR ALL TO authenticated USING (public.is_admin());

INSERT INTO site_settings (company_name) VALUES ('Deepali Engineering');
INSERT INTO footer_content (copyright_text) VALUES ('© 2026 Deepali Engineering. All rights reserved.');
CREATE OR REPLACE FUNCTION search_chatbot(query_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    formatted_query tsquery;
    matched_answer text;
    clean_query text;
    generic_answer text;
    company_keywords text[] := ARRAY[
        'deepali', 'engineering', 'company', 'companies', 'manufacturing', 'manufacturer',
        'industry', 'industrial', 'factory', 'works', 'plant', 'profile', 'about',
        'who', 'what', 'where', 'contact', 'phone', 'email', 'address', 'location',
        'team', 'director', 'managing', 'head', 'leader', 'leadership', 'md', 'ceo',
        'product', 'products', 'coupling', 'flange', 'fitting', 'forging', 'component',
        'client', 'partner', 'customer', 'certification', 'iso', 'quality',
        'service', 'oil', 'gas', 'power', 'chemical', 'maritime'
    ];
    has_company_word boolean := false;
    input_word text;
    query_words text[];
BEGIN
    -- 1. Clean input
    clean_query := trim(regexp_replace(query_text, '[^a-zA-Z0-9]+', ' ', 'g'));

    IF clean_query = '' THEN
      RETURN 'Sorry, I couldn''t find information related to your question.';
    END IF;

    query_words := string_to_array(lower(clean_query), ' ');

    -- Check if query contains any company-related keyword
    FOREACH input_word IN ARRAY query_words
    LOOP
        IF input_word = ANY(company_keywords) THEN
            has_company_word := true;
            EXIT;
        END IF;
    END LOOP;

    -- 2. Build OR-based tsquery
    SELECT string_agg(lexemes, ' | ') INTO clean_query
    FROM (
        SELECT array_to_string(tsvector_to_array(to_tsvector('english', w)), ' | ') as lexemes
        FROM unnest(query_words) as w
    ) sub
    WHERE lexemes <> '';

    IF clean_query IS NOT NULL AND clean_query <> '' THEN
        formatted_query := clean_query::tsquery;

        -- Step 1: Search knowledge base
        SELECT answer INTO matched_answer
        FROM chatbot_knowledge
        WHERE fts_vector @@ formatted_query
        ORDER BY ts_rank(fts_vector, formatted_query) DESC
        LIMIT 1;

        IF matched_answer IS NOT NULL THEN
            RETURN matched_answer;
        END IF;

        -- Step 2: Search documents
        SELECT content INTO matched_answer
        FROM chatbot_documents
        WHERE fts_vector @@ formatted_query
        ORDER BY ts_rank(fts_vector, formatted_query) DESC
        LIMIT 1;

        IF matched_answer IS NOT NULL THEN
            RETURN matched_answer;
        END IF;
    END IF;

    -- Step 3: Fallback for company-related questions
    IF has_company_word THEN
        SELECT answer INTO generic_answer
        FROM chatbot_knowledge
        WHERE category = 'Fallback'
        LIMIT 1;

        IF generic_answer IS NOT NULL THEN
            RETURN generic_answer;
        END IF;
    END IF;

    -- Step 4: No match
    RETURN 'Sorry, I couldn''t find information related to your question.';
END;
$$;

-- Storage Bucket setup for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'uploads');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads');

-- Seed Data for tool_room_machines
INSERT INTO tool_room_machines (name, description, specifications, is_active, order_index) VALUES
('CNC Milling Machine', 'High precision 5-axis CNC milling machine for complex tool room operations.', '{"accuracy": "±0.005mm", "spindle_speed": "12000 RPM", "table_size": "1000x500mm"}'::jsonb, true, 1),
('Surface Grinder', 'Hydraulic surface grinding machine for finishing operations.', '{"grinding_area": "600x300mm", "wheel_speed": "2800 RPM", "max_load": "300kg"}'::jsonb, true, 2),
('Wire Cut EDM', 'Advanced wire electrical discharge machining for precision cutting.', '{"cutting_speed": "300mm²/min", "max_workpiece": "800x600x300mm", "wire_diameter": "0.2mm"}'::jsonb, true, 3);
