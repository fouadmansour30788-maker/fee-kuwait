-- FEE Kuwait — editable impact-page figures
-- Additive & idempotent. Stores the impact page's headline counters, growth
-- chart, and global-context tiles as a JSON blob on the single site_settings row.

alter table public.site_settings add column if not exists impact jsonb;
