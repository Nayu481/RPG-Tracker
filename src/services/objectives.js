import { supabase } from "./supabase"
import { currentUserId, result, editableFields } from "./gameData"

const fields = [["title"], ["description"]]

export async function getObjectives() {
    return result(supabase.rpc("get_objectives_with_progress"))
}

export async function createObjective(values) {
    return result(supabase.from("objectives").insert({
        ...editableFields(values, fields), user_id: await currentUserId()
    }).select().single())
}

export async function updateObjective(id, values) {
    return result(supabase.from("objectives").update(editableFields(values, fields))
        .eq("id", id).eq("user_id", await currentUserId()).select().single())
}

export async function deleteObjective(id) {
    return result(supabase.from("objectives").delete()
        .eq("id", id).eq("user_id", await currentUserId()).select("id").single())
}

export async function completeObjective(id) {
    return result(supabase.rpc("complete_objective", { target_objective_id: id }))
}
