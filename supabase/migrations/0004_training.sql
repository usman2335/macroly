-- Module 4: Training logging. See docs/data-model.md and docs/domain-rules.md.

create table if not exists muscles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  muscle_group text not null,
  sort_order smallint not null
);

-- Reference data, shared across users (not scoped by user_id) — readable by any signed-in user.
alter table muscles enable row level security;
create policy "Authenticated users can read muscles"
  on muscles for select
  to authenticated
  using (true);

insert into muscles (slug, name, muscle_group, sort_order) values
  ('upper-chest', 'Upper chest', 'chest', 1),
  ('mid-chest', 'Mid chest', 'chest', 2),
  ('lower-chest', 'Lower chest', 'chest', 3),
  ('front-delt', 'Front delt', 'shoulders', 4),
  ('side-delt', 'Side delt', 'shoulders', 5),
  ('rear-delt', 'Rear delt', 'shoulders', 6),
  ('lats', 'Lats', 'back', 7),
  ('mid-back', 'Mid back (traps/rhomboids)', 'back', 8),
  ('upper-traps', 'Upper traps', 'back', 9),
  ('lower-back', 'Lower back', 'back', 10),
  ('biceps', 'Biceps', 'arms', 11),
  ('triceps', 'Triceps', 'arms', 12),
  ('forearms', 'Forearms', 'arms', 13),
  ('quads', 'Quads', 'legs', 14),
  ('hamstrings', 'Hamstrings', 'legs', 15),
  ('glutes', 'Glutes', 'legs', 16),
  ('calves', 'Calves', 'legs', 17),
  ('adductors', 'Adductors', 'legs', 18),
  ('abs', 'Abs', 'core', 19),
  ('obliques', 'Obliques', 'core', 20)
on conflict (slug) do nothing;

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists workouts_user_date_idx on workouts (user_id, session_date);

alter table workouts enable row level security;
create policy "Users can view their own workouts"
  on workouts for select
  using (auth.uid() = user_id);
create policy "Users can insert their own workouts"
  on workouts for insert
  with check (auth.uid() = user_id);
create policy "Users can update their own workouts"
  on workouts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete their own workouts"
  on workouts for delete
  using (auth.uid() = user_id);

create table if not exists workout_muscles (
  workout_id uuid not null references workouts (id) on delete cascade,
  muscle_id uuid not null references muscles (id) on delete cascade,
  primary key (workout_id, muscle_id)
);

-- No user_id column here, so RLS checks ownership through the parent workout row.
alter table workout_muscles enable row level security;
create policy "Users can view their own workout muscles"
  on workout_muscles for select
  using (exists (
    select 1 from workouts
    where workouts.id = workout_muscles.workout_id and workouts.user_id = auth.uid()
  ));
create policy "Users can insert their own workout muscles"
  on workout_muscles for insert
  with check (exists (
    select 1 from workouts
    where workouts.id = workout_muscles.workout_id and workouts.user_id = auth.uid()
  ));
create policy "Users can delete their own workout muscles"
  on workout_muscles for delete
  using (exists (
    select 1 from workouts
    where workouts.id = workout_muscles.workout_id and workouts.user_id = auth.uid()
  ));
