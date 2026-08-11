-- FEE Kuwait — re-certification reminders
-- When a certificate is within 3 months of expiry the platform contacts the
-- establishment to begin re-certification. This column records that we already
-- reached out, so the daily job never emails the same certificate twice.
-- Additive migration — safe to run on the existing database (no reset).

alter table public.certificates
  add column if not exists renewal_reminded_at timestamptz;

-- Helps the daily sweep find soon-to-expire certificates quickly.
create index if not exists certificates_expires_at_idx on public.certificates (expires_at);
