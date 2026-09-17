import assert from 'node:assert/strict'
import { mapHabit, mapPlayer, mapReward, santiagoDay } from '../src/utils/gameMapping.js'

const habit = { last_completed_at: '2026-09-16T23:00:00Z', streak: 4, xp_reward: 20, coin_reward: 5 }
assert.equal(santiagoDay('2026-09-17T02:30:00Z'), '2026-09-16')
assert.equal(mapHabit(habit, new Date('2026-09-17T02:30:00Z')).completedToday, true)
assert.equal(mapHabit(habit, new Date('2026-09-17T04:00:00Z')).completedToday, false)
assert.equal(mapHabit(habit, new Date('2026-09-17T04:00:00Z')).streak, 4)
assert.equal(mapHabit(habit, new Date('2026-09-18T04:00:00Z')).streak, 0)
assert.equal(mapHabit({ ...habit, last_completed_at: null }).streak, 0)
// Chile skips midnight on September 6: use calendar dates, not elapsed hours.
assert.equal(mapHabit({ ...habit, last_completed_at: '2026-09-06T03:30:00Z' }, new Date('2026-09-07T02:30:00Z')).streak, 4)
assert.equal(mapReward({ xp_reward: 30, coin_reward: 10, objective_id: 'goal', task_type: 'single' }).objectiveId, 'goal')
assert.deepEqual(mapPlayer({ username: 'A', completed_tasks: 3 }, [{ streak: 4 }, { streak: 2 }]),
    { username: 'A', completed_tasks: 3, name: 'A', completedTasks: 3, streak: 4 })
console.log('OK: mappings, midnight, broken streak and Chile DST')
