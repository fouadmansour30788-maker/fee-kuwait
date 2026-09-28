-- FEE Kuwait — let authors edit their own criterion comments
-- Additive migration — safe to run on the existing database (no reset).

alter table public.criterion_messages add column if not exists edited_at timestamptz;

-- Authors may update only their own messages (the server action also checks
-- the application lock for establishments).
drop policy if exists "Authors edit own messages" on public.criterion_messages;
create policy "Authors edit own messages" on public.criterion_messages
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());
