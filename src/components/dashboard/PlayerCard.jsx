import { Sparkles } from "lucide-react"

import { useGame } from "../../context/useGame"
import { xpNeededForLevel } from "../../utils/levelSystem"

function PlayerCard() {
    const { player } = useGame()

    const requiredXP =
        xpNeededForLevel(player.level)

    const percentage = Math.min(
        100,
        (player.xp / requiredXP) * 100
    )

    return (
        <section className="level-card">
            <div className="level-card-header">
                <span>
                    NIVEL
                </span>

                <Sparkles />
            </div>

            <div className="level-card-content">
                <strong>
                    {player.level}
                </strong>

                <div className="level-progress">
                    <div className="level-progress-info">
                        <span>
                            Progreso
                        </span>

                        <span>
                            {player.xp} / {requiredXP} XP
                        </span>
                    </div>

                    <div className="xp-bar">
                        <div
                            className="xp-fill"
                            style={{
                                width: `${percentage}%`
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PlayerCard