import { useRef, useState } from "react"
import {
    Coins,
    Flame,
    Sword,
    Trophy
} from "lucide-react"

import { useGame } from "../context/useGame"
import { uploadAvatarFile } from "../services/profile"
import { xpNeededForLevel } from "../utils/levelSystem"

function Character() {
    const { player, updateProfile, achievements, busy } = useGame()
    const [editing, setEditing] = useState(false)
    const [username, setUsername] = useState(player.name)
    const [avatarError, setAvatarError] = useState("")
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef(null)

    const requiredXP = xpNeededForLevel(player.level)
    const photoUrl = player.avatar && player.avatar.startsWith("http") ? player.avatar : null

    async function submit(event) {
        event.preventDefault()

        const clean = username.trim()
        if (!clean) return
        if (clean === player.name) { setEditing(false); return }

        if (await updateProfile({ username: clean })) {
            setUsername(clean)
            setEditing(false)
        }
    }

    const unlocked = achievements.filter(achievement => achievement.unlocked).length

    async function handleAvatar(event) {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file) return
        setAvatarError("")
        setUploading(true)
        try {
            const url = await uploadAvatarFile(file)
            await updateProfile({ avatar: url })
        } catch (failure) {
            setAvatarError(failure.message || "No se pudo subir la foto")
        } finally {
            setUploading(false)
        }
    }

    async function removeAvatar() {
        setAvatarError("")
        await updateProfile({ avatar: "user" })
    }

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <span className="eyebrow">
                        PERFIL
                    </span>

                    <h1>
                        Personaje
                    </h1>
                </div>
            </header>

            <div className="character-card">
                <div className="character-avatar">
                    {photoUrl ? <img src={photoUrl} alt={player.name} /> : player.name.charAt(0).toUpperCase()}
                </div>

                <div className="avatar-actions">
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        hidden
                        aria-label="Cambiar foto de perfil"
                        onChange={handleAvatar}
                    />
                    <button type="button" disabled={busy || uploading} onClick={() => fileRef.current?.click()}>
                        {uploading ? "Subiendo…" : photoUrl ? "Cambiar foto" : "Subir foto"}
                    </button>
                    {photoUrl && (
                        <button type="button" disabled={busy || uploading} onClick={removeAvatar}>
                            Quitar foto
                        </button>
                    )}
                </div>
                {avatarError && <p role="alert" className="auth-error">{avatarError}</p>}

                {editing ? <form className="creation-form" onSubmit={submit}>
                    <input
                        required maxLength={30}
                        aria-label="Nombre de personaje"
                        value={username}
                        onChange={event => setUsername(event.target.value)}
                    />

                    <button type="submit" disabled={busy}>Guardar</button>
                    <button type="button" onClick={() => { setUsername(player.name); setEditing(false) }}>Cancelar</button>
                </form> : <h2>{player.name}</h2>}

                <span>
                    Aventurero nivel {player.level}
                </span>

                {!editing && <button type="button" disabled={busy} onClick={() => setEditing(true)}>
                    Editar nombre
                </button>}

                <div className="character-stats">
                    <div>
                        <Sword />

                        <strong>
                            {player.completedTasks}
                        </strong>

                        <span>
                            Misiones
                        </span>
                    </div>

                    <div>
                        <Flame />

                        <strong>
                            {player.streak}
                        </strong>

                        <span>
                            Racha
                        </span>
                    </div>

                    <div>
                        <Coins />

                        <strong>
                            {player.coins}
                        </strong>

                        <span>
                            Oro
                        </span>
                    </div>
                </div>

                <p>
                    {player.xp} / {requiredXP} XP
                </p>
            </div>

            <div className="achievements-section">
                <h2>
                    <Trophy size={18} />
                    Logros {unlocked}/{achievements.length}
                </h2>

                <div className="achievements-grid">
                    {achievements.map(achievement => (
                        <article
                            className={achievement.unlocked ? "achievement-card unlocked" : "achievement-card"}
                            key={achievement.code}
                        >
                            <strong>{achievement.title}</strong>

                            <p>{achievement.description}</p>

                            <span>
                                +{achievement.xp_reward} XP · +{achievement.coin_reward} oro
                            </span>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Character