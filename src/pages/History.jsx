import { useEffect, useState } from "react"
import { CalendarDays, CheckCircle2, Flame, Gift, Repeat2, Trophy } from "lucide-react"

import { useAuth } from "../context/useAuth"
import { getEvents, getStatistics } from "../services/statistics"
import { santiagoDay } from "../utils/gameMapping"

const KIND_ICON = {
    task: CheckCircle2,
    habit: Repeat2,
    objective: Trophy,
    reward: Gift
}

const KIND_LABEL = {
    task: "Misión",
    habit: "Hábito",
    objective: "Objetivo",
    reward: "Recompensa"
}

function History() {
    const { user } = useAuth()
    const [events, setEvents] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const daysAgo = 29

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            setError("")
            try {
                const today = new Date()
                const from = new Date(today)
                from.setUTCDate(from.getUTCDate() - daysAgo)
                const [eventRows, statsRow] = await Promise.all([
                    getEvents(santiagoDay(from), santiagoDay(today)),
                    getStatistics()
                ])
                if (cancelled) return
                setEvents(eventRows)
                setStats(statsRow)
            } catch (failure) {
                if (!cancelled) setError(failure.message || "No se pudo cargar el historial")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        if (user?.id) load()
        return () => { cancelled = true }
    }, [user?.id])

    const totals = stats?.totals ?? {}

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <span className="eyebrow">
                        HISTORIAL
                    </span>

                    <h1>
                        Actividad
                    </h1>

                    <p>
                        Tu progreso de los últimos {daysAgo + 1} días.
                    </p>
                </div>
            </header>

            {error && <p className="hint warning" role="alert">{error}</p>}
            {loading && <p className="empty-state">Cargando…</p>}

            {!loading && !error && <div className="history-section">
                <div className="stats-history">
                    <span><CheckCircle2 size={14} /> {totals.total_tasks ?? 0} misiones</span>
                    <span><Repeat2 size={14} /> {totals.total_habits ?? 0} hábitos</span>
                    <span><Trophy size={14} /> {totals.total_objectives ?? 0} objetivos</span>
                    <span><Gift size={14} /> {totals.total_rewards ?? 0} recompensas</span>
                </div>

                <div className="history-list">
                    {events.length === 0 && <p className="empty-state">
                        Sin actividad todavía. Empieza completando tu primera misión.
                    </p>}
                    {events.map(event => {
                        const Icon = KIND_ICON[event.kind] ?? Flame
                        return (
                            <article className="history-row" key={event.id}>
                                <span className="history-icon"><Icon size={16} /></span>
                                <div>
                                    <strong>{KIND_LABEL[event.kind] ?? event.kind}</strong>
                                    <p className="hint">{santiagoDay(event.created_at)} · +{event.xp} XP · +{event.coins} oro</p>
                                </div>
                            </article>
                        )
                    })}
                </div>

                {stats?.daily?.length > 0 && <div className="history-calendar">
                    <h2><CalendarDays size={16} /> Energía diaria</h2>
                    {stats.daily.map(day => (
                        <div className="history-day" key={day.day}>
                            <span>{day.day}</span>
                            <strong>{day.tasks} tareas · {day.habits} hábitos · +{day.xp} XP</strong>
                        </div>
                    ))}
                </div>}
            </div>}
        </div>
    )
}

export default History