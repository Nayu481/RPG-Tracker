import { Check, Coins, Sparkles } from "lucide-react"

function TaskCard({ task, onComplete, busy, onEdit, onDelete }) {
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
                disabled={task.completed || busy}
                aria-label={`Completar ${task.title}`}
            >
                {task.completed && <Check size={17} />}
            </button>

            <div className="task-content">
                <h3>{task.title}</h3>

                {task.description && (
                    <p>{task.description}</p>
                )}
            </div>

            {(onEdit || onDelete) && <div className="task-actions">
                {onEdit && !task.completed && <button disabled={busy} onClick={() => onEdit(task)}>Editar</button>}
                {onDelete && <button disabled={busy} onClick={() => onDelete(task.id)}>Eliminar</button>}
            </div>}
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