import {
    ArrowRight,
    ScrollText
} from "lucide-react"

import { useGame } from "../../context/useGame"
import TaskCard from "../tasks/TaskCard"

function DailyMissions() {
    const {
        tasks,
        objectives,
        completeTask
    } = useGame()

    const visibleTasks = tasks
        .filter(task => !task.completed)
        .slice(0, 4)

    function getObjective(objectiveId) {
        if (!objectiveId) {
            return null
        }

        return (
            objectives.find(
                objective =>
                    objective.id === objectiveId
            ) ?? null
        )
    }

    return (
        <section className="dashboard-panel missions-panel">
            <div className="panel-header">
                <div>
                    <span className="eyebrow">
                        QUEST LOG
                    </span>

                    <h2>
                        Misiones de hoy
                    </h2>
                </div>

                <button
                    className="panel-link"
                    type="button"
                >
                    Ver todas

                    <ArrowRight size={13} />
                </button>
            </div>

            <div className="task-list">
                {visibleTasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        objective={getObjective(
                            task.objectiveId
                        )}
                        onComplete={completeTask}
                        onEdit={() => {}}
                        onDelete={() => {}}
                    />
                ))}

                {visibleTasks.length === 0 && (
                    <div className="dashboard-empty">
                        <ScrollText />

                        <span>
                            No quedan misiones pendientes.
                        </span>
                    </div>
                )}
            </div>
        </section>
    )
}

export default DailyMissions