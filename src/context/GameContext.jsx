import { useEffect, useState } from "react"
import { GameContext } from "./gameContext"

import {
    initialPlayer,
    initialTasks,
    initialHabits,
    initialObjectives
} from "../data/initialData"

import { processLevelUp } from "../utils/levelSystem"
import { getDifficultyReward } from "../utils/rewards"

export function GameProvider({ children }) {
    const [player, setPlayer] = useState(() => {
        const saved = localStorage.getItem("rpg-player")

        return saved
            ? JSON.parse(saved)
            : initialPlayer
    })

    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem("rpg-tasks")

        return saved
            ? JSON.parse(saved)
            : initialTasks
    })

    const [habits, setHabits] = useState(() => {
        const saved = localStorage.getItem("rpg-habits")

        return saved
            ? JSON.parse(saved)
            : initialHabits
    })

    const [objectives, setObjectives] = useState(() => {
        const saved = localStorage.getItem("rpg-objectives")

        return saved
            ? JSON.parse(saved)
            : initialObjectives
    })

    useEffect(() => {
        localStorage.setItem(
            "rpg-player",
            JSON.stringify(player)
        )
    }, [player])

    useEffect(() => {
        localStorage.setItem(
            "rpg-tasks",
            JSON.stringify(tasks)
        )
    }, [tasks])

    useEffect(() => {
        localStorage.setItem(
            "rpg-habits",
            JSON.stringify(habits)
        )
    }, [habits])

    useEffect(() => {
        localStorage.setItem(
            "rpg-objectives",
            JSON.stringify(objectives)
        )
    }, [objectives])

    function giveReward(xp, coins) {
        setPlayer(current => {
            const rewardedPlayer = {
                ...current,
                xp: current.xp + xp,
                coins: current.coins + coins
            }

            return processLevelUp(rewardedPlayer)
        })
    }

    function completeTask(id) {
        const task = tasks.find(
            task => task.id === id
        )

        if (!task || task.completed) {
            return
        }

        setTasks(current =>
            current.map(currentTask =>
                currentTask.id === id
                    ? {
                        ...currentTask,
                        completed: true,
                        completedAt: new Date().toISOString()
                    }
                    : currentTask
            )
        )

        setPlayer(current => {
            const rewardedPlayer = {
                ...current,
                xp: current.xp + task.xp,
                coins: current.coins + task.coins,
                completedTasks:
                    current.completedTasks + 1
            }

            return processLevelUp(rewardedPlayer)
        })
    }

    function addTask({
        title,
        description = "",
        difficulty = "normal",
        type = "single",
        objectiveId = null
    }) {
        const reward =
            getDifficultyReward(difficulty)

        const newTask = {
            id: crypto.randomUUID(),

            title,
            description,

            difficulty,
            type,

            objectiveId:
                objectiveId || null,

            xp: reward.xp,
            coins: reward.coins,

            completed: false,

            createdAt:
                new Date().toISOString(),

            completedAt: null
        }

        setTasks(current => [
            newTask,
            ...current
        ])
    }

    function editTask(id, changes) {
        setTasks(current =>
            current.map(task => {
                if (
                    task.id !== id ||
                    task.completed
                ) {
                    return task
                }

                const difficulty =
                    changes.difficulty ??
                    task.difficulty

                const reward =
                    getDifficultyReward(
                        difficulty
                    )

                return {
                    ...task,
                    ...changes,

                    difficulty,

                    xp: reward.xp,
                    coins: reward.coins
                }
            })
        )
    }

    function deleteTask(id) {
        setTasks(current =>
            current.filter(
                task => task.id !== id
            )
        )
    }

    function completeHabit(id) {
        const habit = habits.find(
            habit => habit.id === id
        )

        if (
            !habit ||
            habit.completedToday
        ) {
            return
        }

        setHabits(current =>
            current.map(currentHabit =>
                currentHabit.id === id
                    ? {
                        ...currentHabit,
                        completedToday: true,
                        streak:
                            currentHabit.streak + 1
                    }
                    : currentHabit
            )
        )

        giveReward(
            habit.xp,
            habit.coins
        )
    }

    function addHabit(
        title,
        xp = 20,
        coins = 5
    ) {
        const newHabit = {
            id: crypto.randomUUID(),

            title,

            streak: 0,

            xp,
            coins,

            completedToday: false
        }

        setHabits(current => [
            newHabit,
            ...current
        ])
    }

    function addObjective(
        title,
        description = ""
    ) {
        const newObjective = {
            id: crypto.randomUUID(),

            title,
            description,

            progress: 0,

            xp: 300,
            coins: 100,

            completed: false
        }

        setObjectives(current => [
            newObjective,
            ...current
        ])
    }

    function updateObjectiveProgress(
        id,
        progress
    ) {
        const safeProgress = Math.min(
            100,
            Math.max(0, progress)
        )

        setObjectives(current =>
            current.map(objective =>
                objective.id === id
                    ? {
                        ...objective,
                        progress:
                            safeProgress
                    }
                    : objective
            )
        )
    }

    const value = {
        player,

        tasks,
        habits,
        objectives,

        completeTask,
        addTask,
        editTask,
        deleteTask,

        completeHabit,
        addHabit,

        addObjective,
        updateObjectiveProgress
    }

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    )
}