import { useState } from "react"
import { Coins, Gift } from "lucide-react"

import { useGame } from "../context/useGame"

function Rewards() {
    const { rewards, player, addReward, editReward, deleteReward, redeemReward, busy } = useGame()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [cost, setCost] = useState("")
    const [editing, setEditing] = useState(null)

    function startEditing(reward) {
        setEditing(reward.id)
        setTitle(reward.title)
        setDescription(reward.description ?? "")
        setCost(String(reward.cost))
    }

    function reset() {
        setEditing(null)
        setTitle("")
        setDescription("")
        setCost("")
    }

    async function handleSubmit(event) {
        event.preventDefault()

        const cleanTitle = title.trim()
        const cleanCost = Number(cost)
        if (!cleanTitle || !Number.isInteger(cleanCost) || cleanCost < 1) return

        const values = { title: cleanTitle, description: description.trim(), cost: cleanCost }
        const saved = editing ? await editReward(editing, values) : await addReward(values)
        if (!saved) return
        reset()
    }

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <span className="eyebrow">
                        RECOMPENSAS
                    </span>

                    <h1>
                        Tienda
                    </h1>

                    <p>
                        Canjea tu oro por pequeños lujos de la vida real.
                    </p>
                </div>

                <div className="coins-balance">
                    <Coins size={16} />
                    {player?.coins ?? 0} oro
                </div>
            </header>

            <form
                className="creation-form"
                onSubmit={handleSubmit}
            >
                <input
                    type="text"
                    placeholder="Recompensa" aria-label="Recompensa"
                    required maxLength={120}
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

                <input
                    type="number"
                    min="1"
                    placeholder="Costo" aria-label="Costo"
                    value={cost}
                    onChange={event =>
                        setCost(event.target.value)
                    }
                />

                <button type="submit" disabled={busy}>
                    {editing ? "Guardar recompensa" : "Crear recompensa"}
                </button>

                {editing && <button type="button" onClick={reset}>Cancelar</button>}
            </form>

            <div className="reward-list">
                {rewards.map(reward => (
                    <article
                        className={reward.active ? "reward-card" : "reward-card inactive"}
                        key={reward.id}
                    >
                        <Gift />

                        <div className="reward-content">
                            <h3>{reward.title}</h3>

                            {reward.description && <p>{reward.description}</p>}

                            <strong>
                                <Coins size={14} />
                                {reward.cost} oro
                            </strong>
                        </div>

                        {(!busy && reward.active) && <>
                            <button
                                disabled={busy || (player?.coins ?? 0) < reward.cost}
                                onClick={() => redeemReward(reward.id)}
                            >
                                Canjear
                            </button>

                            <div className="card-actions">
                                <button disabled={busy} onClick={() => startEditing(reward)}>Editar</button>
                                <button disabled={busy} onClick={() => deleteReward(reward.id)}>Eliminar</button>
                            </div>
                        </>}
                    </article>
                ))}

                {!rewards.length && <p className="empty-state">
                    No hay recompensas todavía. ¡Crea la primera!
                </p>}
            </div>
        </div>
    )
}

export default Rewards