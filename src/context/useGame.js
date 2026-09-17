import { useContext } from "react"
import { GameContext } from "./gameContext"

export function useGame() {
    const context = useContext(GameContext)

    if (!context) {
        throw new Error(
            "useGame debe utilizarse dentro de GameProvider"
        )
    }

    return context
}