import { supabase } from "./supabase"
import { currentUserId, result, editableFields } from "./gameData"

export async function getProfile() {
    return result(supabase.from("profiles").select("*").eq("id", await currentUserId()).single())
}

const fields = [["username"], ["avatar"]]

export async function updateProfile(values) {
    return result(supabase.from("profiles").update(editableFields(values, fields))
        .eq("id", await currentUserId()).select().single())
}
