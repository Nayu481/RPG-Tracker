import { useEffect, useRef, useState } from "react"
import { GameContext } from "./gameContext"
import { useAuth } from "./useAuth"
import { getProfile } from "../services/profile"
import * as taskService from "../services/tasks"
import * as habitService from "../services/habits"
import * as objectiveService from "../services/objectives"
import { mapHabit, mapPlayer, mapReward } from "../utils/gameMapping"

async function fetchGameData() {
    const [profile, tasks, habits, objectives] = await Promise.all([
        getProfile(), taskService.getTasks(), habitService.getHabits(), objectiveService.getObjectives()
    ])
    return { profile, tasks, habits, objectives }
}

export function GameProvider({ children }) {
    const { user } = useAuth()
    const userId = user?.id
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)
    const [now, setNow] = useState(() => new Date())
    const active = useRef(false)
    const pending = useRef(false)
    const request = useRef(0)

    async function loadGameData() {
        if (!active.current) return false
        const version = ++request.current
        try {
            const nextData = await fetchGameData()
            if (active.current && version === request.current) {
                setData(nextData)
                setError("")
            }
            return true
        } catch (failure) {
            if (active.current && version === request.current) setError(failure.message || "No se pudieron cargar tus datos")
            return false
        } finally {
            if (active.current && version === request.current) setLoading(false)
        }
    }

    useEffect(() => {
        if (!userId) return
        active.current = true
        let cancelled = false
        fetchGameData().then(nextData => {
            if (!cancelled) { setData(nextData); setLoading(false) }
        }).catch(failure => {
            if (!cancelled) { setError(failure.message || "No se pudieron cargar tus datos"); setLoading(false) }
        })
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => {
            active.current = false
            cancelled = true
            clearInterval(timer)
        }
    }, [userId])

    async function mutate(operation) {
        if (!active.current || pending.current) return false
        pending.current = true
        setBusy(true)
        setError("")
        let saved = false
        try {
            await operation()
            saved = true
            if (active.current && !await loadGameData() && active.current) {
                setError("El cambio se guardó, pero no se pudieron actualizar los datos. Reintenta la carga.")
            }
        } catch (failure) {
            if (active.current) setError(failure.message || "No se pudo guardar el cambio")
        } finally {
            pending.current = false
            if (active.current) setBusy(false)
        }
        return saved
    }

    const habits = data?.habits.map(habit => mapHabit(habit, now)) ?? []
    const value = {
        player: data ? mapPlayer(data.profile, habits) : null,
        tasks: data?.tasks.map(mapReward) ?? [], habits,
        objectives: data?.objectives.map(mapReward) ?? [],
        loading, error, busy, reload: loadGameData,
        addTask: values => mutate(() => taskService.createTask(values)),
        editTask: (id, values) => mutate(() => taskService.updateTask(id, values)),
        deleteTask: id => mutate(() => taskService.deleteTask(id)),
        completeTask: id => mutate(() => taskService.completeTask(id)),
        addHabit: title => mutate(() => habitService.createHabit({ title })),
        editHabit: (id, values) => mutate(() => habitService.updateHabit(id, values)),
        deleteHabit: id => mutate(() => habitService.deleteHabit(id)),
        completeHabit: id => mutate(() => habitService.completeHabit(id)),
        addObjective: (title, description = "") => mutate(() => objectiveService.createObjective({ title, description })),
        editObjective: (id, values) => mutate(() => objectiveService.updateObjective(id, values)),
        deleteObjective: id => mutate(() => objectiveService.deleteObjective(id)),
        completeObjective: id => mutate(() => objectiveService.completeObjective(id))
    }
    return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
