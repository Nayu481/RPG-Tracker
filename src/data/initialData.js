export const initialPlayer = {
    name: "Aventurero",
    level: 1,
    xp: 0,
    coins: 0,
    streak: 0,
    completedTasks: 0
}

export const initialTasks = [
    {
        id: 1,
        title: "Completar primera misión",
        description: "Termina una tarea para comenzar tu aventura.",
        xp: 25,
        coins: 10,
        completed: false
    },
    {
        id: 2,
        title: "Trabajar en un proyecto",
        description: "Dedica tiempo a uno de tus proyectos.",
        xp: 40,
        coins: 15,
        completed: false
    }
]

export const initialHabits = [
    {
        id: 1,
        title: "Estudiar",
        streak: 0,
        xp: 20,
        coins: 5,
        completedToday: false
    },
    {
        id: 2,
        title: "Ejercicio",
        streak: 0,
        xp: 25,
        coins: 8,
        completedToday: false
    }
]

export const initialObjectives = [
    {
        id: 1,
        title: "Aprender React",
        description: "Completar mi aprendizaje inicial de React.",
        progress: 35,
        xp: 300,
        coins: 100,
        completed: false
    }
]