import { supabase } from "./supabase"
import { result } from "./gameData"

export async function getLeaderboard(limit = 20) {
    return result(supabase.rpc("get_leaderboard", { limit_count: limit }))
}
