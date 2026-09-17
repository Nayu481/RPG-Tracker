import {
    Coins,
    Flame,
    Sword
} from "lucide-react"

import { useGame } from "../context/useGame"
import { xpNeededForLevel } from "../utils/levelSystem"

function Character() {
    const { player } = useGame()

    const requiredXP =
        xpNeededForLevel(player.level)

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
                    {player.name.charAt(0)}
                </div>

                <h2>
                    {player.name}
                </h2>

                <span>
                    Aventurero nivel {player.level}
                </span>

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
        </div>
    )
}

export default Character