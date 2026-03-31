-- RoutineLog initial schema: profiles, habits, completions with RLS

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Anyone can read profiles"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Habits table
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  emoji text not null default '✅',
  schedule_type text not null default 'daily' check (schedule_type in ('daily', 'specific_days')),
  schedule_days int[] default null,
  is_public boolean not null default true,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now() not null
);

alter table public.habits enable row level security;

create policy "Users can read own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Anyone can read public habits"
  on public.habits for select
  using (is_public = true);

create policy "Users can insert own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on public.habits for update
  using (auth.uid() = user_id);

create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- Completions table
create table public.completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  completed_date date not null,
  created_at timestamptz default now() not null,
  unique (habit_id, completed_date)
);

alter table public.completions enable row level security;

create policy "Users can read own completions"
  on public.completions for select
  using (auth.uid() = user_id);

create policy "Anyone can read completions for public habits"
  on public.completions for select
  using (
    exists (
      select 1 from public.habits
      where habits.id = completions.habit_id
      and habits.is_public = true
    )
  );

create policy "Users can insert own completions"
  on public.completions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own completions"
  on public.completions for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index idx_habits_user_id on public.habits (user_id);
create index idx_habits_user_active on public.habits (user_id, is_active);
create index idx_completions_habit_id on public.completions (habit_id);
create index idx_completions_user_date on public.completions (user_id, completed_date);
create index idx_completions_habit_date on public.completions (habit_id, completed_date);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
