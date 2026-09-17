create or replace function public.xp_required_for_level(
    current_level integer
)
returns integer
language sql
immutable
set search_path = ''
as $$
    select 100 + greatest(current_level - 1, 0) * 50;
$$;


create or replace function public.apply_player_reward(
    target_user_id uuid,
    reward_xp integer,
    reward_coins integer,
    task_increment integer default 0
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
        required_xp :=
            public.xp_required_for_level(current_level);

        exit when current_xp < required_xp;

        current_xp :=
            current_xp - required_xp;

        current_level :=
            current_level + 1;
    end loop;

    update public.profiles
    set
        level = current_level,
        xp = current_xp
    where id = target_user_id;
end;
$$;


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
begin
    current_user_id := auth.uid();

    if current_user_id is null then
        raise exception 'No autenticado';
    end if;

    select *
    into selected_task
    from public.tasks
    where
        id = target_task_id
        and user_id = current_user_id
    for update;

    if not found then
        raise exception 'Misión no encontrada';
    end if;

    if selected_task.completed then
        raise exception 'La misión ya fue completada';
    end if;

    update public.tasks
    set
        completed = true,
        completed_at = now()
    where id = selected_task.id;

    perform public.apply_player_reward(
        current_user_id,
        selected_task.xp_reward,
        selected_task.coin_reward,
        1
    );

    select *
    into updated_profile
    from public.profiles
    where id = current_user_id;

    return jsonb_build_object(
        'task_id', selected_task.id,
        'xp_reward', selected_task.xp_reward,
        'coin_reward', selected_task.coin_reward,
        'profile', to_jsonb(updated_profile)
    );
end;
$$;


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
    today_start timestamptz;
begin
    current_user_id := auth.uid();

    if current_user_id is null then
        raise exception 'No autenticado';
    end if;

    select *
    into selected_habit
    from public.habits
    where
        id = target_habit_id
        and user_id = current_user_id
    for update;

    if not found then
        raise exception 'Hábito no encontrado';
    end if;

    today_start := date_trunc(
        'day',
        now() at time zone 'America/Santiago'
    ) at time zone 'America/Santiago';

    if
        selected_habit.last_completed_at is not null
        and selected_habit.last_completed_at >= today_start
    then
        raise exception 'El hábito ya fue completado hoy';
    end if;

    update public.habits
    set
        streak = case
            when selected_habit.last_completed_at is null then
                1

            when selected_habit.last_completed_at >=
                today_start - interval '1 day'
            then
                selected_habit.streak + 1

            else
                1
        end,

        last_completed_at = now()

    where id = selected_habit.id

    returning *
    into updated_habit;

    perform public.apply_player_reward(
        current_user_id,
        selected_habit.xp_reward,
        selected_habit.coin_reward,
        0
    );

    select *
    into updated_profile
    from public.profiles
    where id = current_user_id;

    return jsonb_build_object(
        'habit', to_jsonb(updated_habit),
        'xp_reward', selected_habit.xp_reward,
        'coin_reward', selected_habit.coin_reward,
        'profile', to_jsonb(updated_profile)
    );
end;
$$;


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
    total_tasks integer;
    completed_tasks integer;
    updated_profile public.profiles%rowtype;
begin
    current_user_id := auth.uid();

    if current_user_id is null then
        raise exception 'No autenticado';
    end if;

    select *
    into selected_objective
    from public.objectives
    where
        id = target_objective_id
        and user_id = current_user_id
    for update;

    if not found then
        raise exception 'Objetivo no encontrado';
    end if;

    if selected_objective.completed then
        raise exception 'El objetivo ya fue completado';
    end if;

    select
        count(*),
        count(*) filter (where completed = true)
    into
        total_tasks,
        completed_tasks
    from public.tasks
    where
        objective_id = selected_objective.id
        and user_id = current_user_id;

    if total_tasks = 0 then
        raise exception
            'El objetivo necesita al menos una misión';
    end if;

    if completed_tasks < total_tasks then
        raise exception
            'Todavía quedan misiones pendientes';
    end if;

    update public.objectives
    set
        completed = true,
        completed_at = now()
    where id = selected_objective.id;

    perform public.apply_player_reward(
        current_user_id,
        selected_objective.xp_reward,
        selected_objective.coin_reward,
        0
    );

    select *
    into updated_profile
    from public.profiles
    where id = current_user_id;

    return jsonb_build_object(
        'objective_id', selected_objective.id,
        'xp_reward', selected_objective.xp_reward,
        'coin_reward', selected_objective.coin_reward,
        'profile', to_jsonb(updated_profile)
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

        count(t.id)
            filter (where t.completed = true)
            as completed_tasks,

        case
            when count(t.id) = 0 then 0
            else round(
                (
                    count(t.id)
                        filter (where t.completed = true)::numeric
                    / count(t.id)::numeric
                ) * 100
            )::integer
        end as progress

    from public.objectives o

    left join public.tasks t
        on t.objective_id = o.id

    where o.user_id = auth.uid()

    group by o.id

    order by o.created_at desc;
$$;


revoke all
on function public.apply_player_reward(
    uuid,
    integer,
    integer,
    integer
)
from public, anon, authenticated;

revoke all
on function public.complete_task(uuid)
from public, anon;

revoke all
on function public.complete_habit(uuid)
from public, anon;

revoke all
on function public.complete_objective(uuid)
from public, anon;

revoke all
on function public.get_objectives_with_progress()
from public, anon;


grant execute
on function public.complete_task(uuid)
to authenticated;

grant execute
on function public.complete_habit(uuid)
to authenticated;

grant execute
on function public.complete_objective(uuid)
to authenticated;

grant execute
on function public.get_objectives_with_progress()
to authenticated;