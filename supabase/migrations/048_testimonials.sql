-- FEE Kuwait — editable homepage testimonials ("Voices From Our Community")
-- Additive & idempotent. Stored as a JSON array on the single site_settings row.

alter table public.site_settings add column if not exists testimonials jsonb;
