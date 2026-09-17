import { useState } from "react"
import { Flame } from "lucide-react"

import { useGame } from "../context/useGame"

function Habits() {
    const {
        habits,
        addHabit,
        completeHabit
    } = useGame()

    const [title, setTitle] =
        useState("")

    function handleSubmit(event) {
        event.preventDefault()

        const cleanTitle =
            title.trim()

        if (!cleanTitle) {
            return
        }

        addHabit(cleanTitle)

        setTitle("")
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
                    value={title}
                    placeholder="Nuevo hábito"
                    onChange={event =>
                        setTitle(
                            event.target.value
                        )
                    }
                />

                <button type="submit">
                    Crear hábito
                </button>
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

                        <button
                            disabled={
                                habit.completedToday
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
                    </article>
                ))}
            </div>
        </div>
    )
}

export default Habits