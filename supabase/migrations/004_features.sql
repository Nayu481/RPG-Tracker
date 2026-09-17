begin;

-- ============================================================
-- 004_features.sql
-- Historial de completados, frecuencia de hábitos, fecha límite
-- de misiones, recompensas (oro), logros y eventos de actividad.
-- Idempotente y compatible con datos existentes.
-- ============================================================

alter table public.profiles
    add column if not exists best_streak integer not null default 0 check (best_streak >= 0),
    add column if not exists completed_objectives integer not null default 0 check (completed_objectives >= 0),
    add column if not exists avatar text not null default 'user';

alter table public.tasks
    add column if not exists due_at timestamptz,
    add column if not exists last_completed_at timestamptz;

alter table public.habits
    add column if not exists frequency text not null default 'daily'
        check (frequency in ('daily', 'weekly', 'custom')),
    add column if not exists weekdays integer[] not null default '{0,1,2,3,4,5,6}',
    add column if not exists weekly_target integer not null default 1 check (weekly_target >= 1);

create table if not exists public.task_completions (
    id uuid primary key default gen_random_uuid(),
    task_id uuid not null references public.tasks(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    completed_at timestamptz not null default now(),
    xp_earned integer not null default 0 check (xp_earned >= 0),
    coins_earned integer not null default 0 check (coins_earned >= 0)
);

create table if not exists public.habit_completions (
    id uuid primary key default gen_random_uuid(),
    habit_id uuid not null references public.habits(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    completed_at timestamptz not null default now(),
    xp_earned integer not null default 0 check (xp_earned >= 0),
    coins_earned integer not null default 0 check (coins_earned >= 0)
);

create table if not exists public.rewards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null check (char_length(title) between 1 and 120),
    description text not null default '',
    cost integer not null default 20 check (cost >= 1),
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.reward_redemptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    reward_id uuid not null references public.rewards(id) on delete cascade,
    cost integer not null check (cost >= 0),
    redeemed_at timestamptz not null default now()
);

create table if not exists public.achievements (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    title text not null,
    description text not null default '',
    icon text not null default 'trophy',
    xp_reward integer not null default 0 check (xp_reward >= 0),
    coin_reward integer not null default 0 check (coin_reward >= 0),
    target integer not null default 1 check (target >= 1)
);

create table if not exists public.user_achievements (
    user_id uuid not null references auth.users(id) on delete cascade,
    achievement_code text not null references public.achievements(code) on delete cascade,
    unlocked_at timestamptz not null default now(),
    xp_earned integer not null default 0,
    coins_earned integer not null default 0,
    primary key (user_id, achievement_code)
);

create table if not exists public.player_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    kind text not null check (kind in ('task', 'habit', 'objective', 'reward', 'achievement')),
    source_id uuid,
    xp integer not null default 0 check (xp >= 0),
    coins integer not null default 0 check (coins >= 0),
    created_at timestamptz not null default now()
);

create index if not exists task_completions_task_idx on public.task_completions(task_id, completed_at);
create index if not exists task_completions_user_idx on public.task_completions(user_id, completed_at);
create index if not exists habit_completions_habit_idx on public.habit_completions(habit_id, completed_at);
create index if not exists habit_completions_user_idx on public.habit_completions(user_id, completed_at);
create index if not exists player_events_user_idx on public.player_events(user_id, created_at desc);
create index if not exists rewards_user_idx on public.rewards(user_id);
create index if not exists redemption_user_idx on public.reward_redemptions(user_id, redeemed_at desc);

-- ------------------------- RLS -------------------------

alter table public.task_completions enable row level security;
alter table public.habit_completions enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.player_events enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "Users can read own task completions" on public.task_completions;
create policy "Users can read own task completions"
on public.task_completions for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own habit completions" on public.habit_completions;
create policy "Users can read own habit completions"
on public.habit_completions for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own rewards" on public.rewards;
create policy "Users can read own rewards"
on public.rewards for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create own rewards" on public.rewards;
create policy "Users can create own rewards"
on public.rewards for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own rewards" on public.rewards;
create policy "Users can update own rewards"
on public.rewards for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own rewards" on public.rewards;
create policy "Users can delete own rewards"
on public.rewards for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own redemptions" on public.reward_redemptions;
create policy "Users can read own redemptions"
on public.reward_redemptions for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own events" on public.player_events;
create policy "Users can read own events"
on public.player_events for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own achievements" on public.user_achievements;
create policy "Users can read own achievements"
on public.user_achievements for select to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.task_completions, public.habit_completions, public.rewards,
    public.reward_redemptions, public.player_events, public.user_achievements
from public, anon;
grant select on public.task_completions, public.habit_completions, public.rewards,
    public.reward_redemptions, public.player_events, public.user_achievements
to authenticated;
grant insert (user_id, title, description, cost, active),
      update (title, description, cost, active),
      delete on public.rewards to authenticated;
grant select on public.achievements to authenticated;
revoke all on public.achievements from public, anon;

-- Nuevas columnas editables de 004 dentro de las restricciones de 003.
grant insert (user_id, title, description, difficulty, task_type, objective_id, due_at),
      update (title, description, difficulty, task_type, objective_id, due_at)
    on public.tasks to authenticated;
grant insert (user_id, title, description, difficulty, objective_id, frequency, weekdays, weekly_target),
      update (title, description, difficulty, objective_id, frequency, weekdays, weekly_target)
    on public.habits to authenticated;
grant update (username, avatar) on public.profiles to authenticated;

-- ------------------------- Catálogo de logros -------------------------

insert into public.achievements (code, title, description, icon, xp_reward, coin_reward, target) values
    ('first_step', 'Primera misión', 'Completa tu primera misión.', 'sword', 20, 5, 1),
    ('ten_missions', 'Diez misiones', 'Completa 10 misiones.', 'sword', 50, 20, 10),
    ('fifty_missions', 'Cincuenta misiones', 'Completa 50 misiones.', 'sword', 150, 50, 50),
    ('hundred_missions', 'Cien misiones', 'Completa 100 misiones.', 'sword', 300, 100, 100),
    ('first_habit', 'Primer hábito', 'Completa un hábito por primera vez.', 'repeat', 20, 5, 1),
    ('streak_week', 'Racha de 7 días', 'Alcanza una racha de 7 días en cualquier hábito.', 'flame', 80, 30, 7),
    ('streak_month', 'Racha de 30 días', 'Alcanza una racha de 30 días en cualquier hábito.', 'flame', 300, 100, 30),
    ('first_objective', 'Primer objetivo', 'Completa tu primer objetivo.', 'target', 100, 40, 1),
    ('level_five', 'Nivel 5', 'Alcanza el nivel 5.', 'sparkles', 100, 30, 5),
    ('level_ten', 'Nivel 10', 'Alcanza el nivel 10.', 'sparkles', 250, 80, 10)
on conflict (code) do nothing;

-- ------------------------- Triggers de updated_at -------------------------

drop trigger if exists rewards_set_updated_at on public.rewards;
create trigger rewards_set_updated_at
before update on public.rewards
for each row execute function public.set_updated_at();

-- ------------------------- Funciones auxiliares -------------------------

-- Indica si una misión se considera completada en su período actual.
-- single: completed; daily: completada hoy; weekly: completada esta semana.
create or replace function public.is_task_done(
    task public.tasks
)
returns boolean
language plpgsql
stable
set search_path = ''
as $$
declare
    today date := (now() at time zone 'America/Santiago')::date;
    week_start date := date_trunc('week', (now() at time zone 'America/Santiago'))::date;
begin
    if task.completed then
        return true;
    end if;
    if task.task_type = 'daily'
        and task.last_completed_at is not null
        and (task.last_completed_at at time zone 'America/Santiago')::date = today then
        return true;
    end if;
    if task.task_type = 'weekly'
        and task.last_completed_at is not null
        and (task.last_completed_at at time zone 'America/Santiago')::date >= week_start then
        return true;
    end if;
    return false;
end;
$$;

-- Otorga XP/monedas, registra el evento y dispara la subida de nivel.
create or replace function public.reward_player(
    target_user_id uuid,
    reward_xp integer,
    reward_coins integer,
    task_increment integer default 0,
    event_kind text default null,
    source_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_level integer;
    current_xp integer;
    required_xp integer;
begin
    if target_user_id <> auth.uid() then
        raise exception 'No autorizado';
    end if;
    if reward_xp < 0 or reward_coins < 0 or task_increment < 0 then
        raise exception 'La recompensa no puede ser negativa';
    end if;

    update public.profiles
    set
        xp = xp + reward_xp,
        coins = coins + reward_coins,
        completed_tasks = completed_tasks + task_increment
    where id = target_user_id
    returning level, xp
    into current_level, current_xp;

    if not found then
        raise exception 'Perfil no encontrado';
    end if;

    loop
        required_xp := public.xp_required_for_level(current_level);
        exit when current_xp < required_xp;
        current_xp := current_xp - required_xp;
        current_level := current_level + 1;
    end loop;

    update public.profiles
    set
        level = current_level,
        xp = current_xp
    where id = target_user_id;

    if event_kind is not null then
        insert into public.player_events (user_id, kind, source_id, xp, coins)
        values (target_user_id, event_kind, source_id, reward_xp, reward_coins);
    end if;
end;
$$;

-- ------------------------- Misiones -------------------------

create or replace function public.complete_task(
    target_task_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
    selected_task public.tasks%rowtype;
    updated_profile public.profiles%rowtype;
    task_done boolean;
    now_permanent boolean := false;
    unlocked jsonb;
    today date := (now() at time zone 'America/Santiago')::date;
    week_start date := date_trunc('week', (now() at time zone 'America/Santiago'))::date;
begin
    current_user_id := auth.uid();
    if current_user_id is null then
        raise exception 'No autenticado';
    end if;

    select *
    into selected_task
    from public.tasks
    where id = target_task_id and user_id = current_user_id
    for update;

    if not found then
        raise exception 'Misión no encontrada';
    end if;

    if selected_task.task_type = 'single' then
        if selected_task.completed then
            raise exception 'La misión ya fue completada';
        end if;
        now_permanent := true;
    elsif selected_task.task_type = 'daily' then
        if selected_task.last_completed_at is not null
            and (selected_task.last_completed_at at time zone 'America/Santiago')::date = today then
            raise exception 'La misión ya fue completada hoy';
        end if;
    elsif selected_task.task_type = 'weekly' then
        if selected_task.last_completed_at is not null
            and (selected_task.last_completed_at at time zone 'America/Santiago')::date >= week_start then
            raise exception 'La misión ya fue completada esta semana';
        end if;
    end if;

    if selected_task.due_at is not null
        and today > (selected_task.due_at at time zone 'America/Santiago')::date then
        raise exception 'La misión venció y ya no puede completarse';
    end if;

    if now_permanent then
        update public.tasks
        set
            completed = true,
            completed_at = now(),
            last_completed_at = now()
        where id = selected_task.id;
    else
        update public.tasks
        set last_completed_at = now()
        where id = selected_task.id;
    end if;

    insert into public.task_completions (task_id, user_id, completed_at, xp_earned, coins_earned)
    values (selected_task.id, current_user_id, now(), selected_task.xp_reward, selected_task.coin_reward);

    perform public.reward_player(
        current_user_id,
        selected_task.xp_reward,
        selected_task.coin_reward,
        case when now_permanent then 1 else 0 end,
        'task',
        selected_task.id
    );

    unlocked := public.check_achievements();

    select *
    into updated_profile
    from public.profiles
    where id = current_user_id;

    return jsonb_build_object(
        'task_id', selected_task.id,
        'xp_reward', selected_task.xp_reward,
        'coin_reward', selected_task.coin_reward,
        'permanent', now_permanent,
        'profile', to_jsonb(updated_profile),
        'achievements', unlocked
    );
end;
$$;

-- ------------------------- Hábitos -------------------------

create or replace function public.complete_habit(
    target_habit_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
    selected_habit public.habits%rowtype;
    updated_habit public.habits%rowtype;
    updated_profile public.profiles%rowtype;
    unlocked jsonb;
    today date := (now() at time zone 'America/Santiago')::date;
    today_dow integer := extract(isodow from (now() at time zone 'America/Santiago')) - 1;
    week_start date := date_trunc('week', (now() at time zone 'America/Santiago'))::date;
    previous_due_date date;
    same_week_count integer;
    new_streak integer;
begin
    current_user_id := auth.uid();
    if current_user_id is null then
        raise exception 'No autenticado';
    end if;

    select *
    into selected_habit
    from public.habits
    where id = target_habit_id and user_id = current_user_id
    for update;

    if not found then
        raise exception 'Hábito no encontrado';
    end if;

    if selected_habit.frequency = 'custom' and not (today_dow = any (selected_habit.weekdays)) then
        raise exception 'El hábito no corresponde hoy';
    end if;

    if exists (
        select 1 from public.habit_completions
        where habit_id = selected_habit.id
          and (completed_at at time zone 'America/Santiago')::date = today
    ) then
        raise exception 'El hábito ya fue completado hoy';
    end if;

    if selected_habit.frequency = 'weekly' then
        select count(*)
        into same_week_count
        from public.habit_completions
        where habit_id = selected_habit.id
          and (completed_at at time zone 'America/Santiago')::date >= week_start;

        if same_week_count >= selected_habit.weekly_target then
            raise exception 'El hábito ya alcanzó su meta semanal';
        end if;
    end if;

    -- Racha: días (o semanas) consecutivos programados cumplidos.
    if selected_habit.frequency = 'weekly' then
        new_streak := 1;
        if exists (
            select 1 from public.habit_completions
            where habit_id = selected_habit.id
              and (completed_at at time zone 'America/Santiago')::date >= week_start - 7
              and (completed_at at time zone 'America/Santiago')::date < week_start
        ) then
            new_streak := selected_habit.streak + 1;
        end if;
    else
        previous_due_date := today - 1;
        if selected_habit.frequency = 'custom' then
            loop
                exit when previous_due_date < today - 8;
                exit when (extract(isodow from previous_due_date) - 1) = any (selected_habit.weekdays);
                previous_due_date := previous_due_date - 1;
            end loop;
        end if;

        if not (
            previous_due_date >= today - 8
            and exists (
                select 1 from public.habit_completions
                where habit_id = selected_habit.id
                  and (completed_at at time zone 'America/Santiago')::date = previous_due_date
            )
        ) then
            new_streak := 1;
        else
            new_streak := selected_habit.streak + 1;
        end if;
    end if;

    update public.habits
    set
        streak = new_streak,
        last_completed_at = now()
    where id = selected_habit.id
    returning * into updated_habit;

    insert into public.habit_completions (habit_id, user_id, completed_at, xp_earned, coins_earned)
    values (selected_habit.id, current_user_id, now(), selected_habit.xp_reward, selected_habit.coin_reward);

    update public.profiles
    set best_streak = greatest(best_streak, new_streak)
    where id = current_user_id;

    perform public.reward_player(
        current_user_id,
        selected_habit.xp_reward,
        selected_habit.coin_reward,
        0,
        'habit',
        selected_habit.id
    );

    unlocked := public.check_achievements();

    select *
    into updated_profile
    from public.profiles
    where id = current_user_id;

    return jsonb_build_object(
        'habit', to_jsonb(updated_habit),
        'xp_reward', selected_habit.xp_reward,
        'coin_reward', selected_habit.coin_reward,
        'profile', to_jsonb(updated_profile),
        'achievements', unlocked
    );
end;
$$;

-- ------------------------- Objetivos -------------------------

create or replace function public.complete_objective(
    target_objective_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
    selected_objective public.objectives%rowtype;
    updated_profile public.profiles%rowtype;
    unlocked jsonb;
    total_tasks integer;
    done_tasks integer;
    task_record public.tasks;
begin
    current_user_id := auth.uid();
    if current_user_id is null then
        raise exception 'No autenticado';
    end if;

    select *
    into selected_objective
    from public.objectives
    where id = target_objective_id and user_id = current_user_id
    for update;

    if not found then
        raise exception 'Objetivo no encontrado';
    end if;

    if selected_objective.completed then
        raise exception 'El objetivo ya fue completado';
    end if;

    select count(*)
    into total_tasks
    from public.tasks
    where objective_id = selected_objective.id and user_id = current_user_id;

    if total_tasks = 0 then
        raise exception 'El objetivo necesita al menos una misión';
    end if;

    done_tasks := 0;
    for task_record in
        select * from public.tasks
        where objective_id = selected_objective.id and user_id = current_user_id
    loop
        if public.is_task_done(task_record) then
            done_tasks := done_tasks + 1;
        end if;
    end loop;

    if done_tasks < total_tasks then
        raise exception 'Todavía quedan misiones pendientes';
    end if;

    update public.objectives
    set completed = true, completed_at = now()
    where id = selected_objective.id;

    update public.profiles
    set completed_objectives = (
        select count(*) from public.objectives
        where user_id = current_user_id and completed = true
    )
    where id = current_user_id;

    perform public.reward_player(
        current_user_id,
        selected_objective.xp_reward,
        selected_objective.coin_reward,
        0,
        'objective',
        selected_objective.id
    );

    unlocked := public.check_achievements();

    select *
    into updated_profile
    from public.profiles
    where id = current_user_id;

    return jsonb_build_object(
        'objective_id', selected_objective.id,
        'xp_reward', selected_objective.xp_reward,
        'coin_reward', selected_objective.coin_reward,
        'profile', to_jsonb(updated_profile),
        'achievements', unlocked
    );
end;
$$;

create or replace function public.get_objectives_with_progress()
returns table (
    id uuid,
    user_id uuid,
    title text,
    description text,
    xp_reward integer,
    coin_reward integer,
    completed boolean,
    completed_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    total_tasks bigint,
    completed_tasks bigint,
    progress integer
)
language sql
security invoker
set search_path = ''
as $$
    select
        o.id,
        o.user_id,
        o.title,
        o.description,
        o.xp_reward,
        o.coin_reward,
        o.completed,
        o.completed_at,
        o.created_at,
        o.updated_at,
        count(t.id) as total_tasks,
        count(*) filter (where t.id is not null and public.is_task_done(t)) as completed_tasks,
        case
            when count(t.id) = 0 then 0
            else round((count(*) filter (where t.id is not null and public.is_task_done(t))::numeric
                / count(t.id)::numeric) * 100)::integer
        end as progress
    from public.objectives o
    left join public.tasks t on t.objective_id = o.id
    where o.user_id = auth.uid()
    group by o.id
    order by o.created_at desc;
$$;

-- ------------------------- Recompensas (oro) -------------------------

create or replace function public.redeem_reward(
    target_reward_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
    selected_reward public.rewards%rowtype;
    updated_profile public.profiles%rowtype;
    unlocked jsonb;
    current_coins integer;
begin
    current_user_id := auth.uid();
    if current_user_id is null then
        raise exception 'No autenticado';
    end if;

    select *
    into selected_reward
    from public.rewards
    where id = target_reward_id and user_id = current_user_id
    for update;

    if not found then
        raise exception 'Recompensa no encontrada';
    end if;

    if not selected_reward.active then
        raise exception 'La recompensa está inactiva';
    end if;

    select coins into current_coins
    from public.profiles where id = current_user_id;

    if current_coins < selected_reward.cost then
        raise exception 'No tienes suficiente oro';
    end if;

    update public.profiles
    set coins = coins - selected_reward.cost
    where id = current_user_id
    returning * into updated_profile;

    insert into public.reward_redemptions (user_id, reward_id, cost)
    values (current_user_id, selected_reward.id, selected_reward.cost);

    perform public.reward_player(
        current_user_id,
        0,
        0,
        0,
        'reward',
        selected_reward.id
    );

    unlocked := public.check_achievements();

    select *
    into updated_profile
    from public.profiles
    where id = current_user_id;

    return jsonb_build_object(
        'reward_id', selected_reward.id,
        'cost', selected_reward.cost,
        'profile', to_jsonb(updated_profile),
        'achievements', unlocked
    );
end;
$$;

-- ------------------------- Logros -------------------------

create or replace function public.achievement_met(
    target_user_id uuid,
    code text
)
returns boolean
language plpgsql
stable
set search_path = ''
as $$
declare
    profile public.profiles%rowtype;
    result boolean := false;
begin
    select * into profile from public.profiles where id = target_user_id;
    if not found then
        return false;
    end if;

    case code
        when 'first_step' then result := profile.completed_tasks >= 1;
        when 'ten_missions' then result := profile.completed_tasks >= 10;
        when 'fifty_missions' then result := profile.completed_tasks >= 50;
        when 'hundred_missions' then result := profile.completed_tasks >= 100;
        when 'first_habit' then
            result := exists (
                select 1 from public.habit_completions where user_id = target_user_id
            );
        when 'streak_week' then result := profile.best_streak >= 7;
        when 'streak_month' then result := profile.best_streak >= 30;
        when 'first_objective' then result := profile.completed_objectives >= 1;
        when 'level_five' then result := profile.level >= 5;
        when 'level_ten' then result := profile.level >= 10;
    end case;

    return result;
end;
$$;

create or replace function public.check_achievements()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid := auth.uid();
    record_row record;
    newly jsonb := '[]'::jsonb;
begin
    if current_user_id is null then
        raise exception 'No autenticado';
    end if;

    for record_row in
        select code, title, xp_reward, coin_reward, icon
        from public.achievements
        order by code
    loop
        if public.achievement_met(current_user_id, record_row.code)
            and not exists (
                select 1 from public.user_achievements
                where user_id = current_user_id and achievement_code = record_row.code
            ) then

            insert into public.user_achievements (user_id, achievement_code, xp_earned, coins_earned)
            values (current_user_id, record_row.code, record_row.xp_reward, record_row.coin_reward);

            perform public.reward_player(
                current_user_id,
                record_row.xp_reward,
                record_row.coin_reward,
                0,
                'achievement',
                (select id from public.achievements where code = record_row.code)
            );

            newly := newly || jsonb_build_object(
                'code', record_row.code,
                'title', record_row.title,
                'icon', record_row.icon,
                'xp_reward', record_row.xp_reward,
                'coin_reward', record_row.coin_reward
            );
        end if;
    end loop;

    return newly;
end;
$$;

create or replace function public.get_achievements()
returns table (
    code text,
    title text,
    description text,
    icon text,
    xp_reward integer,
    coin_reward integer,
    target integer,
    unlocked boolean,
    unlocked_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
    select
        a.code,
        a.title,
        a.description,
        a.icon,
        a.xp_reward,
        a.coin_reward,
        a.target,
        (ua.achievement_code is not null) as unlocked,
        ua.unlocked_at
    from public.achievements a
    left join public.user_achievements ua
        on ua.achievement_code = a.code and ua.user_id = auth.uid()
    order by a.code;
$$;

-- ------------------------- Estadísticas -------------------------

create or replace function public.get_statistics()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid := auth.uid();
    result jsonb;
begin
    if current_user_id is null then
        raise exception 'No autenticado';
    end if;

    with daily as (
        select
            (e.created_at at time zone 'America/Santiago')::date as day,
            sum(e.xp) as xp,
            count(*) filter (where e.kind = 'task') as tasks,
            count(*) filter (where e.kind = 'habit') as habits
        from public.player_events e
        where e.user_id = current_user_id
          and e.created_at >= now() - interval '60 days'
        group by day
    ),
    totals as (
        select
            count(*) filter (where kind = 'task') as total_tasks,
            count(*) filter (where kind = 'habit') as total_habits,
            count(*) filter (where kind = 'objective') as total_objectives,
            count(*) filter (where kind = 'reward') as total_rewards
        from public.player_events
        where user_id = current_user_id
    ),
    profile_row as (
        select * from public.profiles where id = current_user_id
    )
    select jsonb_build_object(
        'daily', coalesce(jsonb_agg(jsonb_build_object(
            'day', to_char(day, 'YYYY-MM-DD'),
            'xp', xp,
            'tasks', tasks,
            'habits', habits
        ) order by day), '[]'::jsonb),
        'totals', coalesce(
            (select to_jsonb(t) from totals t),
            '{}'::jsonb
        )
    )
    into result
    from daily;

    return result;
end;
$$;

create or replace function public.get_events(
    start_date date,
    end_date date
)
returns setof public.player_events
language sql
security invoker
set search_path = ''
as $$
    select *
    from public.player_events
    where user_id = auth.uid()
      and (created_at at time zone 'America/Santiago')::date between start_date and end_date
    order by created_at desc;
$$;

-- ------------------------- Permisos de funciones -------------------------

revoke all on function public.achievement_met(uuid, text) from public, anon, authenticated;
revoke all on function public.is_task_done(public.tasks) from public, anon, authenticated;
grant execute on function public.is_task_done(public.tasks) to authenticated;

revoke all on function public.reward_player(uuid, integer, integer, integer, text, uuid) from public, anon, authenticated;
revoke all on function public.redeem_reward(uuid) from public, anon;
revoke all on function public.check_achievements() from public, anon;
revoke all on function public.get_achievements() from public, anon;
revoke all on function public.get_statistics() from public, anon;
revoke all on function public.complete_task(uuid) from public, anon;
revoke all on function public.complete_habit(uuid) from public, anon;
revoke all on function public.complete_objective(uuid) from public, anon;
revoke all on function public.get_objectives_with_progress() from public, anon;
revoke all on function public.get_events(date, date) from public, anon;

grant execute on function public.redeem_reward(uuid) to authenticated;
grant execute on function public.check_achievements() to authenticated;
grant execute on function public.get_achievements() to authenticated;
grant execute on function public.get_statistics() to authenticated;
grant execute on function public.complete_task(uuid) to authenticated;
grant execute on function public.complete_habit(uuid) to authenticated;
grant execute on function public.complete_objective(uuid) to authenticated;
grant execute on function public.get_objectives_with_progress() to authenticated;
grant execute on function public.get_events(date, date) to authenticated;

commit;