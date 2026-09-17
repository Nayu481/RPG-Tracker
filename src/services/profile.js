import { supabase } from "./supabase"
import { currentUserId, result } from "./gameData"

export async function getProfile() {
    return result(supabase.from("profiles").select("*").eq("id", await currentUserId()).single())
}
