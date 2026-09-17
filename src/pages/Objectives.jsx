import { useState } from "react"

import { useGame } from "../context/useGame"

function Objectives() {
    const {
        objectives,
        addObjective,
        completeObjective, busy
    } = useGame()

    const [title, setTitle] =
        useState("")

    async function handleSubmit(event) {
        event.preventDefault()

        const cleanTitle =
            title.trim()

        if (!cleanTitle) {
            return
        }

        if (!await addObjective(cleanTitle)) return

        setTitle("")
    }

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <span className="eyebrow">
                        CAMPAÑAS
                    </span>

                    <h1>
                        Objetivos
                    </h1>

                    <p>
                        Grandes metas divididas
                        en pequeñas aventuras.
                    </p>
                </div>
            </header>

            <form
                className="creation-form"
                onSubmit={handleSubmit}
            >
                <input
                    required maxLength={120}
                    aria-label="Nuevo objetivo"
                    value={title}
                    placeholder="Nuevo objetivo"
                    onChange={event =>
                        setTitle(
                            event.target.value
                        )
                    }
                />

                <button type="submit" disabled={busy}>
                    Crear objetivo
                </button>
            </form>

            <div className="objective-list">
                {objectives.map(
                    objective => (
                        <article
                            className="objective-card"
                            key={objective.id}
                        >
                            <div className="objective-header">
                                <h3>
                                    {objective.title}
                                </h3>

                                <strong>
                                    {objective.progress}%
                                </strong>
                            </div>

                            <div className="objective-bar">
                                <div
                                    className="objective-fill"
                                    style={{
                                        width:
                                            `${objective.progress}%`
                                    }}
                                />
                            </div>

                            <p>{objective.completed_tasks} / {objective.total_tasks} misiones completadas</p>
                            <button disabled={busy || objective.completed || !objective.total_tasks || objective.completed_tasks !== objective.total_tasks}
                                onClick={() => completeObjective(objective.id)}>
                                {objective.completed ? "Completado" : "Completar objetivo"}
                            </button>
                        </article>
                    )
                )}
            </div>
        </div>
    )
}

export default Objectives