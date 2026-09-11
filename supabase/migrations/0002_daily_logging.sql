-- Module 2: Daily logging. See docs/data-model.md and docs/domain-rules.md.

create table if not exists food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  label text not null,
  calories integer not null check (calories >= 0),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists activity_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  label text not null,
  calories_burned integer not null check (calories_burned >= 0),
  note text,
  created_at timestamptz not null default now()
);

-- Both tables are queried by (user, date) constantly — the today screen and, later, the weekly view.
create index if not exists food_entries_user_date_idx on food_entries (user_id, entry_date);
create index if not exists activity_entries_user_date_idx on activity_entries (user_id, entry_date);

alter table food_entries enable row level security;
alter table activity_entries enable row level security;

create policy "Users can view their own food entries"
  on food_entries for select
  using (auth.uid() = user_id);
create policy "Users can insert their own food entries"
  on food_entries for insert
  with check (auth.uid() = user_id);
create policy "Users can update their own food entries"
  on food_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete their own food entries"
  on food_entries for delete
  using (auth.uid() = user_id);

create policy "Users can view their own activity entries"
  on activity_entries for select
  using (auth.uid() = user_id);
create policy "Users can insert their own activity entries"
  on activity_entries for insert
  with check (auth.uid() = user_id);
create policy "Users can update their own activity entries"
  on activity_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete their own activity entries"
  on activity_entries for delete
  using (auth.uid() = user_id);
