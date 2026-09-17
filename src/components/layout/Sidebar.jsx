import { useState } from "react"
import { logoutUser } from "../../services/auth"
import {
    LayoutDashboard,
    Sword,
    Repeat2,
    Target,
    Gift,
    ScrollText,
    UserRound,
    Trophy
} from "lucide-react"

function Sidebar({ page, setPage }) {
    const [error, setError] = useState("")
    const [leaving, setLeaving] = useState(false)
    async function logout() {
        setLeaving(true)
        try { await logoutUser() }
        catch (failure) { setError(failure.message); setLeaving(false) }
    }
    const items = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard
        },
        {
            id: "tasks",
            label: "Misiones",
            icon: Sword
        },
        {
            id: "habits",
            label: "Hábitos",
            icon: Repeat2
        },
        {
            id: "objectives",
            label: "Objetivos",
            icon: Target
        },
        {
            id: "rewards",
            label: "Tienda",
            icon: Gift
        },
        {
            id: "history",
            label: "Actividad",
            icon: ScrollText
        },
        {
            id: "character",
            label: "Personaje",
            icon: UserRound
        },
        {
            id: "leaderboard",
            label: "Ranking",
            icon: Trophy
        }
    ]

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="sidebar-brand">
                    RPG TRACKER
                </span>

                <span className="sidebar-subtitle">
                    TU VIDA · TU AVENTURA
                </span>

                <div className="sidebar-line" />
            </div>

            <nav className="sidebar-nav">
                {items.map(item => {
                    const Icon = item.icon

                    return (
                        <button
                            key={item.id}
                            className={
                                page === item.id
                                    ? "nav-item active"
                                    : "nav-item"
                            }
                            onClick={() => setPage(item.id)}
                        >
                            <Icon />

                            <span>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
                <button className="nav-item" disabled={leaving} onClick={logout}>Cerrar sesión</button>
                {error && <p role="alert">{error}</p>}
            </nav>

            <div className="sidebar-quote">
                <p>
                    “Pequeños pasos,
                    <br />
                    grandes destinos.”
                </p>
            </div>
        </aside>
    )
}

export default Sidebar