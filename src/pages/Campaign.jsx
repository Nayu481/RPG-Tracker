import { useState } from "react"
import { Compass, Gift, Repeat2, Sword, Target } from "lucide-react"

import { useGame } from "../context/useGame"
import { campaignTemplates } from "../data/campaignTemplates"
import { instantiateCampaign } from "../services/campaigns"

function Campaign() {
    const { reload } = useGame()
    const [expanded, setExpanded] = useState(null)
    const [copyingId, setCopyingId] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    async function copy(template) {
        setCopyingId(template.id)
        setMessage("")
        setError("")
        try {
            const counts = await instantiateCampaign(template)
            await reload()
            setMessage(
                `¡${template.title} copiada! ${counts.objectives} objetivo(s), ` +
                `${counts.tasks} misión(es), ${counts.habits} hábito(s) y ` +
                `${counts.rewards} recompensa(s). Ya puedes modificarla en Objetivos, Misiones, Hábitos y Tienda.`
            )
        } catch (failure) {
            setError(failure.message || "No se pudo copiar la campaña")
        } finally {
            setCopyingId("")
        }
    }

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <span className="eyebrow">RUTAS GUIADAS</span>
                    <h1>Campaña</h1>
                    <p>
                        ¿Flojera de partir desde cero? Copia una ruta preestablecida
                        y después modifícala a tu gusto: todo queda editable en tu cuenta.
                    </p>
                </div>
            </header>

            {message && <p role="status" className="campaign-success">{message}</p>}
            {error && <p role="alert" className="auth-error">{error}</p>}

            <div className="campaign-list">
                {campaignTemplates.map(template => {
                    const open = expanded === template.id
                    const copying = copyingId === template.id
                    const totalMissions = template.objectives.reduce((sum, o) => sum + (o.tasks?.length ?? 0), 0)
                    const totalHabits = template.objectives.reduce((sum, o) => sum + (o.habits?.length ?? 0), 0)

                    return (
                        <article key={template.id} className="campaign-card">
                            <div className="campaign-header">
                                <span className="campaign-icon"><Compass size={18} /></span>
                                <div>
                                    <h3>{template.title}</h3>
                                    <span>{template.tagline}</span>
                                </div>
                            </div>

                            <p>{template.description}</p>

                            <div className="campaign-meta">
                                <span>{template.duration}</span>
                                <span>{template.difficulty}</span>
                                <span>{totalMissions} misiones · {totalHabits} hábitos</span>
                            </div>

                            <div className="campaign-actions">
                                <button
                                    type="button"
                                    disabled={copying || copyingId !== ""}
                                    onClick={() => copy(template)}
                                >
                                    {copying ? "Copiando…" : "Copiar a mi cuenta"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setExpanded(open ? null : template.id)}
                                >
                                    {open ? "Ocultar guía" : "Ver guía"}
                                </button>
                            </div>

                            {open && (
                                <div className="campaign-preview">
                                    {template.objectives.map(objective => (
                                        <section key={objective.title}>
                                            <h4><Target size={14} /> {objective.title}</h4>
                                            <p>{objective.description}</p>
                                            <ul>
                                                {(objective.tasks ?? []).map(task => (
                                                    <li key={task.title}>
                                                        <Sword size={12} /> {task.title}
                                                        <em> · {task.type} · {task.difficulty}</em>
                                                    </li>
                                                ))}
                                                {(objective.habits ?? []).map(habit => (
                                                    <li key={habit.title}>
                                                        <Repeat2 size={12} /> {habit.title}
                                                        <em> · {habit.frequency}</em>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    ))}
                                    {(template.rewards ?? []).length > 0 && (
                                        <section>
                                            <h4><Gift size={14} /> Recompensas incluidas</h4>
                                            <ul>
                                                {template.rewards.map(reward => (
                                                    <li key={reward.title}>
                                                        {reward.title}<em> · {reward.cost} oro</em>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}
                                    <p className="muted">
                                        Al copiar, todo esto se crea en tu cuenta y puedes
                                        editarlo o borrarlo libremente.
                                    </p>
                                </div>
                            )}
                        </article>
                    )
                })}
            </div>
        </div>
    )
}

export default Campaign
