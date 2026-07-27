ALTER TABLE IF EXISTS public.global_partners
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE IF EXISTS public.global_partners
ALTER COLUMN is_active SET DEFAULT true;
