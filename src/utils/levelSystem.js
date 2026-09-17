export function xpNeededForLevel(level) {
    return 100 + (level - 1) * 50
}

export function processLevelUp(player) {
    let updatedPlayer = { ...player }

    let requiredXP = xpNeededForLevel(updatedPlayer.level)

    while (updatedPlayer.xp >= requiredXP) {
        updatedPlayer.xp -= requiredXP
        updatedPlayer.level += 1

        requiredXP = xpNeededForLevel(updatedPlayer.level)
    }

    return updatedPlayer
}