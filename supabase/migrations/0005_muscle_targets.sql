-- Module 5: Weekly training view. See docs/domain-rules.md and docs/open-questions.md for how
-- the default-target decision was made.

create table if not exists muscle_targets (
  user_id uuid not null references auth.users (id) on delete cascade,
  muscle_id uuid not null references muscles (id) on delete cascade,
  weekly_target smallint not null check (weekly_target >= 0),
  primary key (user_id, muscle_id)
);

alter table muscle_targets enable row level security;
create policy "Users can view their own muscle targets"
  on muscle_targets for select
  using (auth.uid() = user_id);
create policy "Users can insert their own muscle targets"
  on muscle_targets for insert
  with check (auth.uid() = user_id);
create policy "Users can update their own muscle targets"
  on muscle_targets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Bootstrap the flat default (2x/week) for whoever already has an account. The app also falls
-- back to this same default in code for any muscle/user combination that ends up missing a row
-- (a new account created after this migration, say), so this seed is a convenience, not a
-- correctness requirement.
insert into muscle_targets (user_id, muscle_id, weekly_target)
select u.id, m.id, 2
from auth.users u
cross join muscles m
on conflict (user_id, muscle_id) do nothing;
