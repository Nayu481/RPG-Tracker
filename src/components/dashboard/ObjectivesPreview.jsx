import {
    ArrowRight,
    Target
} from "lucide-react"

import { useGame } from "../../context/useGame"

function ObjectivesPreview() {
    const { objectives } = useGame()

    const visibleObjectives = objectives
        .filter(
            objective =>
                !objective.completed
        )
        .slice(0, 3)

    return (
        <section className="dashboard-panel objectives-panel">
            <div className="panel-header">
                <div>
                    <span className="eyebrow">
                        CAMPAÑA
                    </span>

                    <h2>
                        Objetivos
                    </h2>
                </div>

                <button
                    className="panel-link"
                    type="button"
                >
                    Ver todos

                    <ArrowRight size={13} />
                </button>
            </div>

            <div className="objective-list">
                {visibleObjectives.map(
                    objective => (
                        <article
                            className="objective-preview"
                            key={objective.id}
                        >
                            <div className="objective-icon">
                                <Target />
                            </div>

                            <div className="objective-content">
                                <div className="objective-header">
                                    <strong>
                                        {objective.title}
                                    </strong>

                                    <span>
                                        {objective.progress}%
                                    </span>
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
                            </div>
                        </article>
                    )
                )}
            </div>
        </section>
    )
}

export default ObjectivesPreview