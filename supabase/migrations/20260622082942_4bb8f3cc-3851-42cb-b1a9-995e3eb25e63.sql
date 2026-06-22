CREATE TABLE IF NOT EXISTS public.lead_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  verification_code text,
  is_verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_emails_email_idx ON public.lead_emails (lower(email));

GRANT ALL ON public.lead_emails TO service_role;

ALTER TABLE public.lead_emails ENABLE ROW LEVEL SECURITY;

-- Nessuna policy: tutto l'accesso passa da server function con service_role.
