ALTER TABLE IF EXISTS public.global_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read global_partners" ON public.global_partners;
CREATE POLICY "Public can read global_partners"
  ON public.global_partners FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage global_partners" ON public.global_partners;
CREATE POLICY "Authenticated users can manage global_partners"
  ON public.global_partners FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
