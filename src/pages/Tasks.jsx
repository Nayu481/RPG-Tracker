import { useState } from "react"
import { useGame } from "../context/useGame"
import TaskCard from "../components/tasks/TaskCard"

function toSantiagoDueDate(dateValue) {
    if (!dateValue) return null
    const [year, month, day] = dateValue.split("-").map(Number)
    return new Date(Date.UTC(year, month - 1, day, 12)).toISOString()
}

function toDateInput(iso) {
    if (!iso) return ""
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit"
    }).format(new Date(iso))
}

function Tasks() {
    const {
        tasks,
        addTask,
        completeTask,
        objectives, busy, editTask, deleteTask
    } = useGame()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    const [difficulty, setDifficulty] = useState("normal")
    const [type, setType] = useState("single")
    const [objectiveId, setObjectiveId] = useState("")
    const [dueAt, setDueAt] = useState("")
    const [editing, setEditing] = useState(null)

    function startEditing(task) {
        setEditing(task.id)
        setTitle(task.title)
        setDescription(task.description)
        setDifficulty(task.difficulty)
        setType(task.type)
        setObjectiveId(task.objectiveId ?? "")
        setDueAt(toDateInput(task.dueAt))
    }

    function reset() {
        setEditing(null)
        setTitle("")
        setDescription("")
        setDueAt("")
    }

    function dueLabel(task) {
        if (task.completed || !task.dueAt) return null
        const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit"
        }).format(new Date())
        const dueDay = toDateInput(task.dueAt)
        return dueDay < today ? `Vencida (${dueDay})` : `Para el ${dueDay}`
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (!title.trim()) {
            return
        }

        const values = {
            title: title.trim(), description: description.trim(),
            difficulty, type, objectiveId: objectiveId || null,
            dueAt: toSantiagoDueDate(dueAt)
        }
        const saved = editing ? await editTask(editing, values) : await addTask(values)
        if (!saved) return
        reset()
    }

    const withDue = tasks.map(task => ({
        ...task,
        dueLabel: dueLabel(task)
    }))

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <span className="eyebrow">
                        QUEST LOG
                    </span>

                    <h1>Misiones</h1>

                    <p>
                        Convierte tus tareas en misiones y gana recompensas.
                    </p>
                </div>
            </header>

            <form
                className="creation-form"
                onSubmit={handleSubmit}
            >
                <input
                    type="text"
                    placeholder="Nombre de la misión"
                    aria-label="Nombre de la misión" required maxLength={120}
                    value={title}
                    onChange={event =>
                        setTitle(event.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Descripción" aria-label="Descripción"
                    value={description}
                    onChange={event =>
                        setDescription(event.target.value)
                    }
                />

                <select aria-label="Dificultad" value={difficulty} onChange={event => setDifficulty(event.target.value)}>
                    <option value="easy">Fácil</option><option value="normal">Normal</option>
                    <option value="hard">Difícil</option><option value="epic">Épica</option>
                </select>
                <select aria-label="Tipo de misión" value={type} onChange={event => setType(event.target.value)}>
                    <option value="single">Única</option><option value="daily">Diaria</option><option value="weekly">Semanal</option>
                </select>
                <input
                    type="date"
                    aria-label="Fecha límite"
                    value={dueAt}
                    onChange={event =>
                        setDueAt(event.target.value)
                    }
                />
                <select aria-label="Objetivo" value={objectiveId} onChange={event => setObjectiveId(event.target.value)}>
                    <option value="">Sin objetivo</option>
                    {objectives.filter(objective => !objective.completed).map(objective => <option key={objective.id} value={objective.id}>{objective.title}</option>)}
                </select>
                <button type="submit" disabled={busy}>{editing ? "Guardar misión" : "Crear misión"}</button>
                {editing && <button type="button" onClick={reset}>Cancelar</button>}
            </form>

            <div className="task-list">
                {withDue.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={completeTask}
                        busy={busy}
                        onEdit={startEditing}
                        onDelete={deleteTask}
                    />
                ))}
            </div>
        </div>
    )
}

export default Tasks