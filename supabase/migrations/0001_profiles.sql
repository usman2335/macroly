-- Module 1: Profile & targets. See docs/data-model.md and docs/domain-rules.md.
--
-- One row per user. sedentary_maintenance / active_maintenance are computed by the app on
-- save (Mifflin-St Jeor, see src/lib/calorie.ts) but stored as plain editable columns — the
-- app never recomputes them silently, so a hand-typed override always sticks until the user
-- next asks it to recompute.

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  sex text not null check (sex in ('male', 'female')),
  birth_date date not null,
  height_cm numeric not null check (height_cm > 0),
  weight_kg numeric not null check (weight_kg > 0),
  gym_days_per_week smallint not null check (gym_days_per_week between 0 and 7),
  goal text not null default 'fat_loss',
  sedentary_maintenance integer not null,
  active_maintenance integer not null,
  week_starts_on text not null default 'monday' check (week_starts_on in ('monday', 'sunday')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
