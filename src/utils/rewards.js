export const difficultyConfig = {
    easy: {
        label: "Fácil",
        xp: 15,
        coins: 5
    },
    normal: {
        label: "Normal",
        xp: 30,
        coins: 10
    },
    hard: {
        label: "Difícil",
        xp: 60,
        coins: 20
    },
    epic: {
        label: "Épica",
        xp: 100,
        coins: 35
    }
}

export function getDifficultyReward(difficulty) {
    return difficultyConfig[difficulty] ?? difficultyConfig.normal
}