ALTER TABLE public.admin_accounts
ADD COLUMN IF NOT EXISTS password_hash TEXT;

ALTER TABLE public.admin_accounts
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.admin_accounts
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

ALTER TABLE public.admin_accounts
ADD COLUMN IF NOT EXISTS last_failed_login_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_admin_accounts_locked_until ON public.admin_accounts(locked_until);
