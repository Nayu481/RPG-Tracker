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
    for (const migration of ['001_initial', '002_game_backend', '003_secure_persistence']) {
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
            assert.equal(reward.result.profile.xp, 20)
            assert.equal(reward.result.profile.coins, 10)
            assert.equal(reward.result.profile.completed_tasks, 1)
        }
        const [progress] = await as(a, 'select * from get_objectives_with_progress()')
        assert.equal(progress.progress, (i + 1) * 25)
    }
    await assert.rejects(as(a, 'select complete_task($1)', [tasks[0].id]), /ya fue completada/)
    const [closed] = await as(a, 'select complete_objective($1) as result', [objective.id])
    assert.equal(closed.result.profile.level, 4)
    assert.equal(closed.result.profile.xp, 60)
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
        await db.query(`update habits set last_completed_at = (((now() at time zone 'America/Santiago')::date - $1::int) + time '12:00') at time zone 'America/Santiago' where id=$2`, [daysAgo, habit.id])
        const [next] = await as(a, 'select complete_habit($1) as result', [habit.id])
        assert.equal(next.result.habit.streak, expected)
    }
    console.log('OK: migrations, RLS, ownership, protected columns, rewards, repeated completions, multiple level-ups, objective progress/deletion, daily habits')
} finally {
    await db.close()
}
