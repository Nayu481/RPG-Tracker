import { Check, Coins, Sparkles } from "lucide-react"

function TaskCard({ task, onComplete }) {
    return (
        <article
            className={
                task.completed
                    ? "task-card completed"
                    : "task-card"
            }
        >
            <button
                className="task-check"
                onClick={() => onComplete(task.id)}
                disabled={task.completed}
            >
                {task.completed && <Check size={17} />}
            </button>

            <div className="task-content">
                <h3>{task.title}</h3>

                {task.description && (
                    <p>{task.description}</p>
                )}
            </div>

            <div className="task-rewards">
                <span>
                    <Sparkles size={14} />
                    +{task.xp} XP
                </span>

                <span>
                    <Coins size={14} />
                    +{task.coins}
                </span>
            </div>
        </article>
    )
}

export default TaskCard