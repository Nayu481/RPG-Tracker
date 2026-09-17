// PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite/dist/index.js node tests/database.test.mjs
// Runs real PostgreSQL in memory; never connects to the user's Supabase project.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite')
const db = new PGlite()
try {
    await db.exec(`
        create role anon; create role authenticated;
        create schema auth;
        create table auth.users (id uuid primary key, raw_user_meta_data jsonb);
        create function auth.uid() returns uuid language sql as
            $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
        grant usage on schema public, auth to authenticated, anon;
        grant execute on function auth.uid() to authenticated, anon;
        alter default privileges in schema public grant all on tables to authenticated, anon;
    `)
    for (const migration of ['001_initial', '002_game_backend', '003_secure_persistence', '004_features']) {
        const sql = await readFile(new URL(`../supabase/migrations/${migration}.sql`, import.meta.url), 'utf8')
        await db.exec(sql.replace('create extension if not exists pgcrypto;', ''))
    }
    const a = '00000000-0000-0000-0000-000000000001'
    const b = '00000000-0000-0000-0000-000000000002'
    await db.query(`insert into auth.users values ($1, '{"username":"A"}'), ($2, '{"username":"B"}')`, [a, b])
    async function as(user, sql, params = []) {
        await db.exec('begin; set local role authenticated;')
        try {
            await db.query("select set_config('request.jwt.claim.sub', $1, true)", [user])
            const result = await db.query(sql, params)
            await db.exec('commit')
            return result.rows
        } catch (error) {
            await db.exec('rollback')
            throw error
        }
    }
    const [objective] = await as(a, 'insert into objectives (user_id, title) values ($1, $2) returning *', [a, 'React'])
    const tasks = []
    for (let i = 0; i < 4; i++) {
        const [task] = await as(a, 'insert into tasks (user_id, title, objective_id) values ($1, $2, $3) returning *', [a, `Task ${i}`, objective.id])
        tasks.push(task)
        assert.equal(task.xp_reward, 30)
    }
    assert.equal((await as(b, 'select * from tasks')).length, 0)
    assert.equal((await as(b, 'select * from objectives')).length, 0)
    assert.equal((await as(b, 'select * from profiles'))[0].id, b)
    assert.equal((await as(b, 'update tasks set title=$1 where id=$2 returning id', ['Stolen', tasks[0].id])).length, 0)
    assert.equal((await as(b, 'delete from tasks where id=$1 returning id', [tasks[0].id])).length, 0)
    await assert.rejects(as(b, 'select complete_task($1)', [tasks[0].id]), /no encontrada/)
    await assert.rejects(as(b, 'insert into tasks(user_id,title,objective_id) values($1,$2,$3)', [b, 'Foreign', objective.id]))
    await assert.rejects(as(b, 'insert into habits(user_id,title,objective_id) values($1,$2,$3)', [b, 'Foreign', objective.id]))
    await assert.rejects(as(a, 'update profiles set xp=999999 where id=$1', [a]), /permission denied/)
    await assert.rejects(as(a, 'insert into profiles(id) values($1)', [a]), /permission denied/)
    await assert.rejects(as(a, 'insert into tasks(user_id,title,xp_reward) values($1,$2,99999)', [a, 'Cheat']), /permission denied/)
    await assert.rejects(as(a, 'update tasks set completed=true where id=$1', [tasks[0].id]), /permission denied/)
    await assert.rejects(as(a, 'select apply_player_reward($1,99999,99999,0)', [a]), /permission denied/)
    await assert.rejects(as(a, 'select complete_objective($1)', [objective.id]), /pendientes/)
    await db.query('update profiles set xp=90 where id=$1', [a])
    for (let i = 0; i < tasks.length; i++) {
        const [reward] = await as(a, 'select complete_task($1) as result', [tasks[i].id])
        if (i === 0) {
            assert.equal(reward.result.profile.level, 2)
            assert.equal(reward.result.profile.xp, 40)
            assert.equal(reward.result.profile.coins, 15)
            assert.equal(reward.result.profile.completed_tasks, 1)
            assert.equal(reward.result.achievements.length, 1)
            assert.equal(reward.result.achievements[0].code, 'first_step')
        }
        const [progress] = await as(a, 'select * from get_objectives_with_progress()')
        assert.equal(progress.progress, (i + 1) * 25)
    }
    await assert.rejects(as(a, 'select complete_task($1)', [tasks[0].id]), /ya fue completada/)
    const [closed] = await as(a, 'select complete_objective($1) as result', [objective.id])
    assert.equal(closed.result.profile.level, 4)
    assert.equal(closed.result.profile.xp, 180)
    assert.equal(closed.result.profile.coins, 185)
    await assert.rejects(as(a, 'select complete_objective($1)', [objective.id]), /ya fue completado/)
    await assert.rejects(as(a, 'insert into tasks(user_id,title,objective_id) values($1,$2,$3)', [a, 'Late', objective.id]), /ya fue completado/)
    await as(a, 'delete from objectives where id=$1', [objective.id])
    assert.equal((await as(a, 'select * from tasks where id=$1', [tasks[0].id]))[0].objective_id, null)
    const [habit] = await as(a, 'insert into habits(user_id,title) values($1,$2) returning *', [a, 'Study'])
    assert.equal((await as(b, 'select * from habits')).length, 0)
    await assert.rejects(as(b, 'select complete_habit($1)', [habit.id]), /no encontrado/)
    await assert.rejects(as(a, 'update habits set streak=100 where id=$1', [habit.id]), /permission denied/)
    const [first] = await as(a, 'select complete_habit($1) as result', [habit.id])
    assert.equal(first.result.habit.streak, 1)
    assert.equal(first.result.xp_reward, 20)
    await assert.rejects(as(a, 'select complete_habit($1)', [habit.id]), /ya fue completado hoy/)
    const [storedHabit] = await as(a, 'select * from habits where id=$1', [habit.id])
    assert.equal(storedHabit.streak, 1)
    assert.ok(storedHabit.last_completed_at)
    const [privateTask] = await as(b, 'insert into tasks(user_id,title) values($1,$2) returning *', [b, 'Misión privada B'])
    assert.equal((await as(a, 'select * from tasks where id=$1', [privateTask.id])).length, 0)
    await as(b, 'update tasks set title=$1, difficulty=$2 where id=$3', ['Updated', 'epic', privateTask.id])
    const [edited] = await as(b, 'select * from tasks where id=$1', [privateTask.id])
    assert.equal(edited.title, 'Updated')
    assert.equal(edited.xp_reward, 100)
    assert.equal(edited.coin_reward, 35)
    await assert.rejects(as(b, 'update tasks set coin_reward=99999 where id=$1', [privateTask.id]), /permission denied/)
    await assert.rejects(as(b, 'insert into tasks(user_id,title) values($1,$2)', [a, 'Wrong owner']))
    await as(b, 'delete from tasks where id=$1', [privateTask.id])
    assert.equal((await as(b, 'select * from tasks')).length, 0)
    await as(a, 'update habits set title=$1 where id=$2', ['Study daily', habit.id])
    assert.equal((await as(a, 'select * from habits where id=$1', [habit.id]))[0].title, 'Study daily')
    for (const [daysAgo, expected] of [[1, 2], [3, 1]]) {
        await db.query(`update habit_completions set completed_at = (((now() at time zone 'America/Santiago')::date - $1::int) + time '12:00') at time zone 'America/Santiago' where habit_id=$2`, [daysAgo, habit.id])
        const [next] = await as(a, 'select complete_habit($1) as result', [habit.id])
        assert.equal(next.result.habit.streak, expected)
    }

    // --- 004: fechas límite y recurrencia de misiones ---------------------
    const [daily] = await as(a, 'insert into tasks(user_id,title,task_type) values($1,$2,$3) returning *', [a, 'Diaria', 'daily'])
    const [daily2] = await as(a, 'insert into tasks(user_id,title,task_type) values($1,$2,$3) returning *', [a, 'Diaria 2', 'daily'])
    const [weekly] = await as(a, 'insert into tasks(user_id,title,task_type) values($1,$2,$3) returning *', [a, 'Semanal', 'weekly'])
    assert.equal(daily.last_completed_at, null)
    assert.equal(daily2.last_completed_at, null)
    assert.equal(weekly.last_completed_at, null)
    await as(a, `update tasks set due_at = (now() at time zone 'America/Santiago')::date + interval '2 days'
                 where id = $1`, [daily.id])
    const [dailyDueFixed] = await as(a, 'select complete_task($1) as result', [daily.id])
    assert.equal(dailyDueFixed.result.permanent, false)
    await assert.rejects(as(a, 'select complete_task($1)', [daily.id]), /completada hoy/)
    const [weeklyDone] = await as(a, 'select complete_task($1) as result', [weekly.id])
    assert.equal(weeklyDone.result.permanent, false)
    // Plazo vencido → rechazo.
    const [stale] = await as(a, 'insert into tasks(user_id,title) values($1,$2) returning *', [a, 'Vencida'])
    await db.query(`update tasks set due_at = (now() at time zone 'America/Santiago')::date - interval '1 day' where id = $1`, [stale.id])
    await assert.rejects(as(a, 'select complete_task($1)', [stale.id]), /venció/)
    // Tarea private no se puede completar por otro usuario.
    await assert.rejects(as(b, 'select complete_task($1)', [daily2.id]), /no encontrada/)

    // --- 004: frecuencia de hábitos y metacom · ---------------------------
    const [weeklyHabit] = await as(a, 'insert into habits(user_id,title,frequency,weekly_target) values($1,$2,$3,$4) returning *', [a, 'Entrenar', 'weekly', 2])
    const [wh1] = await as(a, 'select complete_habit($1) as result', [weeklyHabit.id])
    assert.equal(wh1.result.habit.streak, 1)
    // Trasladamos el completado a la semana pasada para poder completar de nuevo.
    await db.query(`update habit_completions set completed_at = completed_at - interval '7 days' where habit_id=$1`, [weeklyHabit.id])
    const [wh2] = await as(a, 'select complete_habit($1) as result', [weeklyHabit.id])
    assert.equal(wh2.result.habit.streak, 2)
    // La meta semanal se respeta: con 2 completados esta semana (ninguno hoy) se rechaza.
    // Para no depender del día en que corra el test usamos días de la semana actual
    // distintos de hoy; el RPC solo compara contra el inicio de semana, así que si hoy
    // es lunes o martes tomamos días posteriores de la misma semana.
    await db.query(`delete from habit_completions where habit_id=$1`, [weeklyHabit.id])
    await db.query(`
        insert into habit_completions (habit_id, user_id, completed_at)
        select $1::uuid, $2::uuid, ((week_start + offs) + time '12:00') at time zone 'America/Santiago'
        from (
            select date_trunc('week', now() at time zone 'America/Santiago')::date as week_start
        ) w, unnest(array[0, 1, 2]) as offs
        where week_start + offs <> (now() at time zone 'America/Santiago')::date
        limit 2
    `, [weeklyHabit.id, a])
    await assert.rejects(as(a, 'select complete_habit($1)', [weeklyHabit.id]), /meta semanal/)
    const [monTue] = await as(a, 'insert into habits(user_id,title,frequency,weekdays) values($1,$2,$3,$4) returning *', [a, 'Solo lunes y martes', 'custom', '{0,3}'])
    // isodow (Lun=1..Dom=7) - 1 para coincidir con la semana (Lun=0).
    const pgDow = ((new Date()).getDay() + 6) % 7
    // Cuando hoy es Lun(0) o Jue(3), se debe poder completar; si no, rechazar.
    if (pgDow === 0 || pgDow === 3) {
        const [custom] = await as(a, 'select complete_habit($1) as result', [monTue.id])
        assert.equal(custom.result.habit.streak, 1)
        await assert.rejects(as(a, 'select complete_habit($1)', [monTue.id]), /completado hoy/)
    } else {
        await assert.rejects(as(a, 'select complete_habit($1)', [monTue.id]), /no corresponde hoy/)
    }
    // Hábito "custom" con solo HOY: se completa bien y luego se niega repetir.
    const [todayOnly] = await as(a, 'insert into habits(user_id,title,frequency,weekdays) values($1,$2,$3,$4) returning *', [a, 'Solo hoy', 'custom', `{${pgDow}}`])
    await as(a, 'select complete_habit($1) as result', [todayOnly.id])
    await assert.rejects(as(a, 'select complete_habit($1)', [todayOnly.id]), /completado hoy/)

    // --- 004: recompensas con oro -----------------------------------------
    const [goldReward] = await as(a, 'insert into rewards(user_id,title,cost) values($1,$2,$3) returning *', [a, 'Ver una película', 50])
    const [beforeRedeem] = await as(a, 'select coins from profiles where id=$1', [a])
    assert.ok(beforeRedeem.coins >= 100, `coins suficientes (${beforeRedeem.coins})`)
    const [redeemed] = await as(a, 'select redeem_reward($1) as result', [goldReward.id])
    assert.equal(redeemed.result.profile.coins, beforeRedeem.coins - 50)
    await assert.rejects(as(a, 'insert into rewards(user_id,title,cost) values($1,$2,$3)', [b, 'Robo', 5]))
    await assert.rejects(as(a, 'update rewards set cost=0 where id=$1', [goldReward.id]), /violates check|new row for relation|check constraint/)
    await assert.rejects(as(a, 'insert into rewards(user_id,title,cost) values($1,$2,-5)', [a, 'Negativo']), /violates check|new row for relation|check constraint/)
    // Sin oro suficiente → rechazo y no descuenta.
    await db.query(`update profiles set coins=2 where id=$1`, [b])
    const [cheap] = await as(b, 'insert into rewards(user_id,title,cost) values($1,$2,10) returning *', [b, 'Café'])
    const [coinsB] = await as(b, 'select coins from profiles where id=$1', [b])
    assert.equal(coinsB.coins, 2)
    await assert.rejects(as(b, 'select redeem_reward($1)', [cheap.id]), /oro/)

    // --- 004: logros, eventos y estadísticas ------------------------------
    const achievements = await as(a, 'select * from get_achievements()')
    assert.ok(Array.isArray(achievements) && achievements.length >= 10)
    const events = await as(a, "select * from get_events((now() at time zone 'America/Santiago')::date - 1, (now() at time zone 'America/Santiago')::date + 1)")
    assert.ok(events.some((e) => e.kind === 'task'), 'debe existir un evento de tipo task')
    // get_statistics devuelve armazón JSON con totals/daily
    const [stats] = await as(a, 'select get_statistics() as result')
    assert.ok(stats.result.totals.total_tasks >= 2)
    assert.equal(stats.result.totals.total_objectives, 1)

    console.log('OK: migrations, RLS, ownership, protected columns, rewards, repeated completions, multiple level-ups, objective progress/deletion, daily habits, due dates, recurrence, habit frequency, rewards, achievements, events, statistics')
} finally {
    await db.close()
}
