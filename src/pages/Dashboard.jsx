import PlayerCard from "../components/dashboard/PlayerCard"
import StatsGrid from "../components/dashboard/StatsGrid"
import DailyMissions from "../components/dashboard/DailyMissions"
import ObjectivesPreview from "../components/dashboard/ObjectivesPreview"

function Dashboard() {
    const hour = new Date().getHours()

    let greeting = "Buenas noches"

    if (hour < 12) {
        greeting = "Buenos días"
    } else if (hour < 20) {
        greeting = "Buenas tardes"
    }

    return (
        <div className="page dashboard-page">
            <div className="dashboard-topline">
                <span>
                    DISCIPLINA · ENFOQUE · PROGRESO
                </span>

                <span>
                    RPG TRACKER
                </span>
            </div>

            <header className="dashboard-hero">
                <span className="hero-greeting">
                    {greeting},
                </span>

                <h1>
                    Aventurero.
                </h1>

                <p>
                    La disciplina de hoy construye
                    el protagonista del mañana.
                </p>
            </header>

            <PlayerCard />

            <StatsGrid />

            <div className="dashboard-grid">
                <DailyMissions />

                <ObjectivesPreview />
            </div>

            <blockquote className="dashboard-quote">
                <p>
                    “La consistencia convierte el esfuerzo
                    en resultados.”
                </p>

                <span>
                    — NAYU
                </span>
            </blockquote>
        </div>
    )
}

export default Dashboard