import { useState } from "react"
import { Flame } from "lucide-react"

import { useGame } from "../context/useGame"

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

const FREQUENCY_LABELS = {
    daily: "Diario",
    weekly: "Semanal",
    custom: "Personalizado"
}

function Habits() {
    const { habits, addHabit, editHabit, deleteHabit, completeHabit, busy } = useGame()

    const [title, setTitle] = useState("")
    const [frequency, setFrequency] = useState("daily")
    const [weeklyTarget, setWeeklyTarget] = useState(1)
    const [weekdays, setWeekdays] = useState([0, 1, 2, 3, 4, 5, 6])
    const [editing, setEditing] = useState(null)

    const weekdaysError = frequency === "custom" && weekdays.length === 0

    function startEditing(habit) {
        setEditing(habit.id)
        setTitle(habit.title)
        setFrequency(habit.frequency ?? "daily")
        setWeeklyTarget(habit.weekly_target ?? 1)
        setWeekdays(habit.weekdays?.length ? habit.weekdays : [0, 1, 2, 3, 4, 5, 6])
    }

    function reset() {
        setEditing(null)
        setTitle("")
        setFrequency("daily")
        setWeeklyTarget(1)
        setWeekdays([0, 1, 2, 3, 4, 5, 6])
    }

    function toggleWeekday(day) {
        setWeekdays(current => current.includes(day) ? current.filter(d => d !== day) : [...current, day].sort())
    }

    async function handleSubmit(event) {
        event.preventDefault()

        const cleanTitle = title.trim()
        if (!cleanTitle || weekdaysError) return

        const values = {
            title: cleanTitle,
            frequency,
            weeklyTarget: frequency === "weekly" ? Math.max(1, Number(weeklyTarget)) : 1,
            weekdays: frequency === "custom" ? weekdays : [0, 1, 2, 3, 4, 5, 6]
        }

        const saved = editing ? await editHabit(editing, values) : await addHabit(values)
        if (!saved) return
        reset()
    }

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <span className="eyebrow">
                        RUTINAS
                    </span>

                    <h1>
                        Hábitos
                    </h1>

                    <p>
                        Construye rachas y fortalece
                        a tu personaje.
                    </p>
                </div>
            </header>

            <form
                className="creation-form"
                onSubmit={handleSubmit}
            >
                <input
                    required maxLength={120}
                    aria-label="Nuevo hábito"
                    value={title}
                    placeholder="Nuevo hábito"
                    onChange={event =>
                        setTitle(event.target.value)
                    }
                />

                <select
                    aria-label="Frecuencia"
                    value={frequency}
                    onChange={event =>
                        setFrequency(event.target.value)
                    }
                >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="custom">Personalizado</option>
                </select>

                {frequency === "weekly" && <input
                    type="number"
                    min="1"
                    max="7"
                    aria-label="Meta semanal"
                    value={weeklyTarget}
                    onChange={event =>
                        setWeeklyTarget(event.target.value)
                    }
                />}

                {frequency === "custom" && <div className="weekday-picker">
                    {WEEKDAY_LABELS.map((label, day) => (
                        <button
                            type="button"
                            key={day}
                            aria-pressed={weekdays.includes(day)}
                            className={weekdays.includes(day) ? "chip active" : "chip"}
                            onClick={() => toggleWeekday(day)}
                        >
                            {label}
                        </button>
                    ))}
                </div>}

                {weekdaysError && <span className="hint warning">Elige al menos un día.</span>}

                <button type="submit" disabled={busy}>
                    {editing ? "Guardar hábito" : "Crear hábito"}
                </button>

                {editing && <button type="button" onClick={reset}>Cancelar</button>}
            </form>

            <div className="habit-grid">
                {habits.map(habit => (
                    <article
                        className="habit-card"
                        key={habit.id}
                    >
                        <Flame />

                        <h3>
                            {habit.title}
                        </h3>

                        <strong>
                            {habit.streak} días
                        </strong>

                        <span>
                            +{habit.xp} XP · +{habit.coins} oro
                        </span>

                        {habit.frequency !== "daily" && <span className="habit-frequency">
                            {FREQUENCY_LABELS[habit.frequency]}
                            {habit.frequency === "weekly" && ` · ${habit.weekly_target}/semana`}
                            {habit.frequency === "custom" && ` · ${habit.weekdays?.map(day => WEEKDAY_LABELS[day]).join(" ")}`}
                        </span>}

                        <button
                            disabled={
                                habit.completedToday || busy
                            }
                            onClick={() =>
                                completeHabit(
                                    habit.id
                                )
                            }
                        >
                            {habit.completedToday
                                ? "Completado"
                                : "Completar"}
                        </button>

                        {!habit.completedToday && <div className="card-actions">
                            <button
                                disabled={busy}
                                onClick={() => startEditing(habit)}
                            >
                                Editar
                            </button>

                            <button
                                disabled={busy}
                                onClick={() => deleteHabit(habit.id)}
                            >
                                Eliminar
                            </button>
                        </div>}
                    </article>
                ))}
            </div>
        </div>
    )
}

export default Habits