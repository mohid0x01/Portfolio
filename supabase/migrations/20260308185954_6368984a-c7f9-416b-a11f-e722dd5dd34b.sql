
CREATE TABLE public.bug_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'triaging', 'confirmed', 'resolved', 'wont-fix')),
  category TEXT NOT NULL DEFAULT 'other',
  reporter_name TEXT,
  reporter_contact TEXT,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  affected_url TEXT,
  proof_of_concept TEXT,
  cvss_score NUMERIC,
  bounty_amount NUMERIC,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit bug reports"
  ON public.bug_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read bug reports"
  ON public.bug_reports FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update bug reports"
  ON public.bug_reports FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete bug reports"
  ON public.bug_reports FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE TRIGGER update_bug_reports_updated_at
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.bug_reports;
