import {
    LayoutDashboard,
    Sword,
    Repeat2,
    Target,
    UserRound
} from "lucide-react"

function Sidebar({ page, setPage }) {
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
            id: "character",
            label: "Personaje",
            icon: UserRound
        }
    ]

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="sidebar-brand">
                    NAYU
                </span>

                <span className="sidebar-subtitle">
                    RPG Tracker
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