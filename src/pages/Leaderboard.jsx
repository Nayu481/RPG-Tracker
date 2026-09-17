import { useEffect, useState } from "react"
import { Trophy } from "lucide-react"

import { useAuth } from "../context/useAuth"
import { getLeaderboard } from "../services/leaderboard"

function avatarContent(entry) {
    if (entry.avatar && entry.avatar.startsWith("http")) {
        return <img src={entry.avatar} alt={entry.username} loading="lazy" />
    }
    return <span aria-hidden="true">{(entry.username || "?").charAt(0).toUpperCase()}</span>
}

function Leaderboard() {
    const { user } = useAuth()
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                const rows = await getLeaderboard(50)
                if (!cancelled) setEntries(rows ?? [])
            } catch (failure) {
                if (!cancelled) setError(failure.message || "No se pudo cargar el ranking")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <span className="eyebrow">COMPETENCIA</span>
                    <h1>Leaderboard</h1>
                </div>
            </header>

            {loading && <p className="muted">Cargando ranking…</p>}
            {error && <p role="alert" className="auth-error">{error}</p>}

            {!loading && !error && entries.length === 0 && (
                <p className="muted">Todavía no hay aventureros en el ranking.</p>
            )}

            {!loading && !error && entries.length > 0 && (
                <ol className="leaderboard-list">
                    {entries.map((entry, index) => {
                        const isMe = user && entry.user_id === user.id
                        return (
                            <li
                                key={entry.user_id}
                                className={isMe ? "leaderboard-row is-me" : "leaderboard-row"}
                            >
                                <span className="leaderboard-rank">#{index + 1}</span>
                                <span className="leaderboard-avatar">{avatarContent(entry)}</span>
                                <span className="leaderboard-main">
                                    <strong>
                                        {entry.username}{isMe ? " (tú)" : ""}
                                        {index === 0 && " 👑"}
                                    </strong>
                                    <span>
                                        Nivel {entry.level} · {entry.xp} XP · {entry.completed_tasks} misiones
                                    </span>
                                </span>
                                <span className="leaderboard-level">Nv {entry.level}</span>
                            </li>
                        )
                    })}
                </ol>
            )}

            <p className="muted leaderboard-note">
                <Trophy size={14} /> El ranking ordena por nivel, luego XP y misiones completadas.
            </p>
        </div>
    )
}

export default Leaderboard
