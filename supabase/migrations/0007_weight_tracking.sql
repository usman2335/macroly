-- Module 8: Weight tracking. See docs/data-model.md and docs/roadmap.md.

create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  weight_kg numeric(5, 1) not null check (weight_kg > 0),
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

-- One weigh-in a day is the normal case; queried by (user, date) for the day-switcher and by
-- user alone (ordered by date) for the trend view.
create index if not exists weight_logs_user_date_idx on weight_logs (user_id, entry_date);

alter table weight_logs enable row level security;

create policy "Users can view their own weight logs"
  on weight_logs for select
  using (auth.uid() = user_id);
create policy "Users can insert their own weight logs"
  on weight_logs for insert
  with check (auth.uid() = user_id);
create policy "Users can update their own weight logs"
  on weight_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete their own weight logs"
  on weight_logs for delete
  using (auth.uid() = user_id);
