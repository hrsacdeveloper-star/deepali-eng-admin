CREATE TABLE IF NOT EXISTS chatbot_documents (

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,

  pdf_url TEXT NOT NULL,

  content TEXT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  fts_vector TSVECTOR

);
