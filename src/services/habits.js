import { supabase } from "./supabase"
import { currentUserId, result, editableFields } from "./gameData"

const fields = [["title"], ["description"], ["difficulty"], ["objectiveId", "objective_id"], ["frequency"], ["weekdays"], ["weeklyTarget", "weekly_target"]]

export async function getHabits() {
    return result(supabase.from("habits").select("*").eq("user_id", await currentUserId()).order("created_at", { ascending: false }))
}

export async function createHabit(values) {
    return result(supabase.from("habits").insert({
        ...editableFields(values, fields), user_id: await currentUserId()
    }).select().single())
}

export async function updateHabit(id, values) {
    return result(supabase.from("habits").update(editableFields(values, fields))
        .eq("id", id).eq("user_id", await currentUserId()).select().single())
}

export async function deleteHabit(id) {
    return result(supabase.from("habits").delete()
        .eq("id", id).eq("user_id", await currentUserId()).select("id").single())
}

export async function completeHabit(id) {
    return result(supabase.rpc("complete_habit", { target_habit_id: id }))
}
