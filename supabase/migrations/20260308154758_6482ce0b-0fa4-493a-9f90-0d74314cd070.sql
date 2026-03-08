
-- Visitor logs table for capturing full visitor intelligence
CREATE TABLE public.visitor_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  country TEXT,
  country_code TEXT,
  region TEXT,
  city TEXT,
  isp TEXT,
  asn TEXT,
  user_agent TEXT,
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  device_type TEXT,
  is_mobile BOOLEAN DEFAULT false,
  is_bot BOOLEAN DEFAULT false,
  screen_width INTEGER,
  screen_height INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  color_depth INTEGER,
  pixel_ratio NUMERIC,
  timezone TEXT,
  timezone_offset INTEGER,
  language TEXT,
  languages TEXT[],
  page_url TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  connection_type TEXT,
  hardware_concurrency INTEGER,
  device_memory NUMERIC,
  do_not_track TEXT,
  cookies_enabled BOOLEAN DEFAULT true,
  fingerprint TEXT,
  raw_headers JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visitor logs"
  ON public.visitor_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read visitor logs"
  ON public.visitor_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_visitor_logs_visited_at ON public.visitor_logs (visited_at DESC);
CREATE INDEX idx_visitor_logs_ip ON public.visitor_logs (ip_address);
CREATE INDEX idx_visitor_logs_country ON public.visitor_logs (country);
CREATE INDEX idx_visitor_logs_fingerprint ON public.visitor_logs (fingerprint);
