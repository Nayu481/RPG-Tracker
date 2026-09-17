begin;

-- RLS isolates rows; column privileges protect rewards and completion state.
-- See https://supabase.com/docs/guides/database/postgres/column-level-security
revoke all on public.profiles, public.tasks, public.habits, public.objectives from public;
grant select on public.profiles, public.tasks, public.habits, public.objectives to authenticated;
grant delete on public.tasks, public.habits, public.objectives to authenticated;
revoke all on public.profiles, public.tasks, public.habits, public.objectives from public, anon;
revoke insert, update, delete on public.profiles from authenticated;
grant update (username) on public.profiles to authenticated;
revoke insert, update on public.tasks, public.habits, public.objectives from authenticated;
grant insert (user_id, title, description, difficulty, task_type, objective_id),
      update (title, description, difficulty, task_type, objective_id)
    on public.tasks to authenticated;
grant insert (user_id, title, description, difficulty, objective_id),
      update (title, description, difficulty, objective_id)
    on public.habits to authenticated;
grant insert (user_id, title, description), update (title, description)
    on public.objectives to authenticated;

create or replace function public.set_game_reward()
returns trigger language plpgsql set search_path = '' as $$
begin
    if tg_table_name = 'objectives' then
        new.xp_reward := 300;
        new.coin_reward := 100;
    elsif tg_table_name = 'habits' then
        new.xp_reward := case new.difficulty when 'easy' then 10 when 'normal' then 20 when 'hard' then 40 when 'epic' then 70 end;
        new.coin_reward := case new.difficulty when 'easy' then 3 when 'normal' then 5 when 'hard' then 10 when 'epic' then 20 end;
    else
        new.xp_reward := case new.difficulty when 'easy' then 15 when 'normal' then 30 when 'hard' then 60 when 'epic' then 100 end;
        new.coin_reward := case new.difficulty when 'easy' then 5 when 'normal' then 10 when 'hard' then 20 when 'epic' then 35 end;
    end if;
    return new;
end;
$$;
create trigger tasks_reward before insert or update on public.tasks
for each row execute function public.set_game_reward();
create trigger habits_reward before insert or update on public.habits
for each row execute function public.set_game_reward();
create trigger objectives_reward before insert or update on public.objectives
for each row execute function public.set_game_reward();

-- Normalize rewards that may have been supplied before column protection existed.
update public.tasks set difficulty = difficulty;
update public.habits set difficulty = difficulty;
update public.objectives set title = title;

create or replace function public.guard_game_edit()
returns trigger language plpgsql set search_path = '' as $$
declare
    objective public.objectives%rowtype;
    objective_ids uuid[];
begin
    if tg_table_name = 'objectives' then
        if old.completed then raise exception 'El objetivo ya fue completado'; end if;
    elsif tg_table_name = 'tasks' then
        if tg_op = 'UPDATE' and old.completed and not (
            new.objective_id is null and old.objective_id is not null
            and not exists (select 1 from public.objectives where id = old.objective_id)
        ) then
            raise exception 'La misión ya fue completada';
        end if;
        if tg_op <> 'INSERT' then objective_ids := array[old.objective_id]; end if;
        if tg_op <> 'DELETE' then objective_ids := array_append(objective_ids, new.objective_id); end if;
        -- Serialize membership changes with complete_objective, including deletions.
        for objective in select * from public.objectives
            where id = any(objective_ids) order by id for update
        loop
            if objective.user_id is distinct from auth.uid() then raise exception 'No autorizado'; end if;
            if objective.completed then raise exception 'El objetivo ya fue completado'; end if;
        end loop;
    end if;
    if tg_op = 'DELETE' then return old; end if;
    return new;
end;
$$;
create trigger tasks_guard before insert or update or delete on public.tasks
for each row execute function public.guard_game_edit();
create trigger objectives_guard before update on public.objectives
for each row execute function public.guard_game_edit();

-- Calendar dates are necessary across daylight-saving transitions in Chile.
create or replace function public.complete_habit(target_habit_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
    uid uuid := auth.uid();
    habit public.habits%rowtype;
    profile public.profiles%rowtype;
    today date := (now() at time zone 'America/Santiago')::date;
    last_day date;
begin
    if uid is null then raise exception 'No autenticado'; end if;
    select * into habit from public.habits where id = target_habit_id and user_id = uid for update;
    if not found then raise exception 'Hábito no encontrado'; end if;
    last_day := (habit.last_completed_at at time zone 'America/Santiago')::date;
    if last_day >= today then raise exception 'El hábito ya fue completado hoy'; end if;
    update public.habits set
        streak = case when last_day = today - 1 then streak + 1 else 1 end,
        last_completed_at = now()
    where id = habit.id returning * into habit;
    perform public.apply_player_reward(uid, habit.xp_reward, habit.coin_reward, 0);
    select * into profile from public.profiles where id = uid;
    return jsonb_build_object('habit', to_jsonb(habit), 'profile', to_jsonb(profile),
        'xp_reward', habit.xp_reward, 'coin_reward', habit.coin_reward);
end;
$$;

revoke all on function public.set_game_reward(), public.guard_game_edit() from public, anon, authenticated;
commit;
