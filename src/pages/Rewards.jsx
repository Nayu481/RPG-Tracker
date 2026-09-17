import { useState } from "react"
import { Coins, Gift } from "lucide-react"

import { useGame } from "../context/useGame"
import { campaignTemplates } from "../data/campaignTemplates"

function Rewards() {
    const { rewards, player, addReward, editReward, deleteReward, redeemReward, busy } = useGame()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [cost, setCost] = useState("")
    const [editing, setEditing] = useState(null)
    const [addingKey, setAddingKey] = useState("")
    const [presetMessage, setPresetMessage] = useState("")
    const [presetError, setPresetError] = useState("")

    const ownedTitles = new Set(rewards.map(reward => reward.title.trim().toLowerCase()))

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

    async function addPreset(template, preset) {
        const key = `${template.id}:${preset.title}`
        setAddingKey(key)
        setPresetMessage("")
        setPresetError("")
        const saved = await addReward({ title: preset.title, description: preset.description ?? "", cost: preset.cost })
        if (saved) setPresetMessage(`“${preset.title}” añadido a tu tienda.`)
        else setPresetError("No se pudo añadir el objeto")
        setAddingKey("")
    }

    async function addPack(template) {
        const missing = (template.rewards ?? []).filter(preset => !ownedTitles.has(preset.title.trim().toLowerCase()))
        if (!missing.length) return
        setAddingKey(`${template.id}:pack`)
        setPresetMessage("")
        setPresetError("")
        let added = 0
        for (const preset of missing) {
            const saved = await addReward({ title: preset.title, description: preset.description ?? "", cost: preset.cost })
            if (saved) added += 1
            else break
        }
        if (added === missing.length) setPresetMessage(`Pack “${template.title}” añadido (${added} objetos).`)
        else if (added > 0) setPresetMessage(`Se añadieron ${added} de ${missing.length} objetos del pack.`)
        else setPresetError("No se pudo añadir el pack")
        setAddingKey("")
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

            <section className="store-presets">
                <h2>
                    <Gift size={18} />
                    Objetos preestablecidos por campaña
                </h2>
                <p className="muted">
                    Packs temáticos listos para añadir a tu tienda sin copiar la campaña completa.
                </p>

                {presetMessage && <p role="status" className="campaign-success">{presetMessage}</p>}
                {presetError && <p role="alert" className="auth-error">{presetError}</p>}

                {campaignTemplates.map(template => {
                    const presets = template.rewards ?? []
                    const missing = presets.filter(preset => !ownedTitles.has(preset.title.trim().toLowerCase()))
                    return (
                        <article key={template.id} className="campaign-card">
                            <div className="campaign-header">
                                <div>
                                    <h3>{template.title}</h3>
                                    <span>{template.tagline}</span>
                                </div>
                            </div>

                            <div className="campaign-actions">
                                <button
                                    type="button"
                                    disabled={busy || addingKey !== "" || !missing.length}
                                    onClick={() => addPack(template)}
                                >
                                    {addingKey === `${template.id}:pack`
                                        ? "Añadiendo…"
                                        : missing.length
                                            ? `Añadir pack (${missing.length})`
                                            : "Pack completo en tu tienda"}
                                </button>
                            </div>

                            <ul className="store-preset-list">
                                {presets.map(preset => {
                                    const owned = ownedTitles.has(preset.title.trim().toLowerCase())
                                    const key = `${template.id}:${preset.title}`
                                    return (
                                        <li key={preset.title} className="store-preset-row">
                                            <span className="store-preset-main">
                                                <strong>{preset.title}</strong>
                                                <span>{preset.description} · {preset.cost} oro</span>
                                            </span>
                                            <button
                                                type="button"
                                                disabled={busy || owned || addingKey !== ""}
                                                onClick={() => addPreset(template, preset)}
                                            >
                                                {owned ? "En tu tienda" : addingKey === key ? "Añadiendo…" : "Añadir"}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </article>
                    )
                })}
            </section>
        </div>
    )
}

export default Rewards