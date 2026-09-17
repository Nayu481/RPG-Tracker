const dayFormat = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit"
})

export function santiagoDay(date = new Date()) {
    return dayFormat.format(new Date(date))
}

export function mapReward(row) {
    return {
        ...row, xp: row.xp_reward, coins: row.coin_reward,
        objectiveId: row.objective_id, type: row.task_type,
        createdAt: row.created_at, completedAt: row.completed_at
    }
}

export function mapHabit(row, now = new Date()) {
    const today = santiagoDay(now)
    const lastDay = row.last_completed_at ? santiagoDay(row.last_completed_at) : null
    // Calendar subtraction, independent of Chile's 23/25-hour DST days.
    const yesterday = new Date(`${today}T12:00:00Z`)
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    return {
        ...mapReward(row),
        completedToday: lastDay === today,
        streak: lastDay === today || lastDay === yesterday.toISOString().slice(0, 10) ? row.streak : 0
    }
}

export function mapPlayer(row, habits) {
    return {
        ...row, name: row.username, completedTasks: row.completed_tasks,
        streak: Math.max(0, ...habits.map(habit => habit.streak))
    }
}
