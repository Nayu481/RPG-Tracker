import { supabase } from "./supabase"
import { currentUserId, result, editableFields } from "./gameData"

const fields = [["title"], ["description"], ["difficulty"], ["objectiveId", "objective_id"], ["type", "task_type"], ["dueAt", "due_at"]]

export async function getTasks() {
    return result(supabase.from("tasks").select("*").eq("user_id", await currentUserId()).order("created_at", { ascending: false }))
}

export async function createTask(values) {
    return result(supabase.from("tasks").insert({
        ...editableFields(values, fields), user_id: await currentUserId()
    }).select().single())
}

export async function updateTask(id, values) {
    return result(supabase.from("tasks").update(editableFields(values, fields))
        .eq("id", id).eq("user_id", await currentUserId()).select().single())
}

export async function deleteTask(id) {
    return result(supabase.from("tasks").delete()
        .eq("id", id).eq("user_id", await currentUserId()).select("id").single())
}

export async function completeTask(id) {
    return result(supabase.rpc("complete_task", { target_task_id: id }))
}
