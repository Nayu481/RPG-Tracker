import {
    Flame,
    Coins,
    ScrollText
} from "lucide-react"

import { useGame } from "../../context/useGame"

function StatsGrid() {
    const { player } = useGame()

    return (
        <div className="stats-grid">
            <article className="stat-card">
                <div className="stat-card-header">
                    <span>
                        RACHA
                    </span>

                    <Flame />
                </div>

                <strong>
                    {player.streak}

                    <small>
                        {" "}días
                    </small>
                </strong>
            </article>

            <article className="stat-card gold">
                <div className="stat-card-header">
                    <span>
                        ORO
                    </span>

                    <Coins />
                </div>

                <strong>
                    {player.coins}
                </strong>
            </article>

            <article className="stat-card">
                <div className="stat-card-header">
                    <span>
                        MISIONES
                    </span>

                    <ScrollText />
                </div>

                <strong>
                    {player.completedTasks}
                </strong>
            </article>
        </div>
    )
}

export default StatsGrid