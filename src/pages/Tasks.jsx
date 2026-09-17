import { useState } from "react"
import { useGame } from "../context/useGame"
import TaskCard from "../components/tasks/TaskCard"

function Tasks() {
    const {
        tasks,
        addTask,
        completeTask
    } = useGame()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    function handleSubmit(event) {
        event.preventDefault()

        if (!title.trim()) {
            return
        }

        addTask(
            title.trim(),
            description.trim()
        )

        setTitle("")
        setDescription("")
    }

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
                    value={title}
                    onChange={event =>
                        setTitle(event.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Descripción"
                    value={description}
                    onChange={event =>
                        setDescription(event.target.value)
                    }
                />

                <button type="submit">
                    Crear misión
                </button>
            </form>

            <div className="task-list">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={completeTask}
                    />
                ))}
            </div>
        </div>
    )
}

export default Tasks