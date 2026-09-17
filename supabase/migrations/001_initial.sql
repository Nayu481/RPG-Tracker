create extension if not exists pgcrypto;

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text not null default 'Aventurero',
    level integer not null default 1 check (level >= 1),
    xp integer not null default 0 check (xp >= 0),
    coins integer not null default 0 check (coins >= 0),
    completed_tasks integer not null default 0 check (completed_tasks >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.objectives (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null check (char_length(title) between 1 and 120),
    description text not null default '',
    xp_reward integer not null default 300 check (xp_reward >= 0),
    coin_reward integer not null default 100 check (coin_reward >= 0),
    completed boolean not null default false,
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    objective_id uuid references public.objectives(id) on delete set null,

    title text not null check (char_length(title) between 1 and 120),
    description text not null default '',

    difficulty text not null default 'normal'
        check (difficulty in ('easy', 'normal', 'hard', 'epic')),

    task_type text not null default 'single'
        check (task_type in ('single', 'daily', 'weekly')),

    xp_reward integer not null default 30 check (xp_reward >= 0),
    coin_reward integer not null default 10 check (coin_reward >= 0),

    completed boolean not null default false,

    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.habits (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    objective_id uuid references public.objectives(id) on delete set null,

    title text not null check (char_length(title) between 1 and 120),
    description text not null default '',

    difficulty text not null default 'normal'
        check (difficulty in ('easy', 'normal', 'hard', 'epic')),

    xp_reward integer not null default 20 check (xp_reward >= 0),
    coin_reward integer not null default 5 check (coin_reward >= 0),

    streak integer not null default 0 check (streak >= 0),

    last_completed_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index tasks_user_id_idx
on public.tasks(user_id);

create index tasks_objective_id_idx
on public.tasks(objective_id);

create index objectives_user_id_idx
on public.objectives(user_id);

create index habits_user_id_idx
on public.habits(user_id);

create index habits_objective_id_idx
on public.habits(objective_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger objectives_set_updated_at
before update on public.objectives
for each row
execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

create trigger habits_set_updated_at
before update on public.habits
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (
        id,
        username
    )
    values (
        new.id,
        coalesce(
            nullif(new.raw_user_meta_data ->> 'username', ''),
            'Aventurero'
        )
    );

    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.objectives enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can read own objectives"
on public.objectives
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create own objectives"
on public.objectives
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own objectives"
on public.objectives
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own objectives"
on public.objectives
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read own tasks"
on public.tasks
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create own tasks"
on public.tasks
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
    and (
        objective_id is null
        or exists (
            select 1
            from public.objectives
            where objectives.id = objective_id
            and objectives.user_id = (select auth.uid())
        )
    )
);

create policy "Users can update own tasks"
on public.tasks
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and (
        objective_id is null
        or exists (
            select 1
            from public.objectives
            where objectives.id = objective_id
            and objectives.user_id = (select auth.uid())
        )
    )
);

create policy "Users can delete own tasks"
on public.tasks
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read own habits"
on public.habits
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create own habits"
on public.habits
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
    and (
        objective_id is null
        or exists (
            select 1
            from public.objectives
            where objectives.id = objective_id
            and objectives.user_id = (select auth.uid())
        )
    )
);

create policy "Users can update own habits"
on public.habits
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and (
        objective_id is null
        or exists (
            select 1
            from public.objectives
            where objectives.id = objective_id
            and objectives.user_id = (select auth.uid())
        )
    )
);

create policy "Users can delete own habits"
on public.habits
for delete
to authenticated
using ((select auth.uid()) = user_id);