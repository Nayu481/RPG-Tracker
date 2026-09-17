import { supabase } from "./supabase"
import { result } from "./gameData"

export async function getAchievements() {
    return result(supabase.rpc("get_achievements"))
}