import { useState } from "react"

import { useGame } from "../context/useGame"

function Objectives() {
    const {
        objectives,
        addObjective,
        updateObjectiveProgress
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

        addObjective(cleanTitle)

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
                    value={title}
                    placeholder="Nuevo objetivo"
                    onChange={event =>
                        setTitle(
                            event.target.value
                        )
                    }
                />

                <button type="submit">
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

                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={
                                    objective.progress
                                }
                                onChange={event =>
                                    updateObjectiveProgress(
                                        objective.id,
                                        Number(
                                            event.target.value
                                        )
                                    )
                                }
                            />
                        </article>
                    )
                )}
            </div>
        </div>
    )
}

export default Objectives