CREATE TABLE IF NOT EXISTS chatbot_knowledge (

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  question TEXT NOT NULL,

  answer TEXT NOT NULL,

  category TEXT,

  keywords TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  fts_vector TSVECTOR

);