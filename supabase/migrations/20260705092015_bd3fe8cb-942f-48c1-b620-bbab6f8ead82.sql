
-- Extend lead_emails with OTP rate-limiting fields
ALTER TABLE public.lead_emails
  ADD COLUMN IF NOT EXISTS otp_attempts int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS otp_window_start timestamptz;

-- Licenses table
CREATE TABLE public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key text UNIQUE NOT NULL,
  user_email text NOT NULL,
  app_code text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_licenses_email_app ON public.licenses (lower(user_email), app_code);

GRANT ALL ON public.licenses TO service_role;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
-- No policies: only accessed server-side via service role.

-- PUK codes table
CREATE TABLE public.puk_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  code text NOT NULL,
  used boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (license_id, code)
);

GRANT ALL ON public.puk_codes TO service_role;
ALTER TABLE public.puk_codes ENABLE ROW LEVEL SECURITY;
-- No policies: only accessed server-side via service role.
