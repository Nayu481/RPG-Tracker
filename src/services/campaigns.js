import { createObjective } from "./objectives"
import { createTask } from "./tasks"
import { createHabit } from "./habits"
import { createReward } from "./rewards"

// Copia una ruta preestablecida a la cuenta del usuario.
// Todo lo creado queda editable/borrable desde Misiones, Hábitos, Objetivos y Tienda.
export async function instantiateCampaign(template) {
    if (!template) throw new Error("Campaña no encontrada")

    const counts = { objectives: 0, tasks: 0, habits: 0, rewards: 0 }

    for (const objective of template.objectives ?? []) {
        const created = await createObjective({
            title: objective.title,
            description: objective.description ?? ""
        })
        counts.objectives += 1

        for (const task of objective.tasks ?? []) {
            await createTask({
                title: task.title,
                description: task.description ?? "",
                difficulty: task.difficulty ?? "normal",
                type: task.type ?? "single",
                objectiveId: created.id
            })
            counts.tasks += 1
        }

        for (const habit of objective.habits ?? []) {
            await createHabit({
                title: habit.title,
                description: habit.description ?? "",
                difficulty: habit.difficulty ?? "normal",
                frequency: habit.frequency ?? "daily",
                ...(habit.frequency === "weekly" && habit.weeklyTarget
                    ? { weeklyTarget: habit.weeklyTarget }
                    : {}),
                objectiveId: created.id
            })
            counts.habits += 1
        }
    }

    for (const reward of template.rewards ?? []) {
        await createReward({
            title: reward.title,
            description: reward.description ?? "",
            cost: reward.cost ?? 20,
            active: true
        })
        counts.rewards += 1
    }

    return counts
}
