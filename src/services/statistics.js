import { supabase } from "./supabase"
import { result } from "./gameData"

export async function getStatistics() {
    return result(supabase.rpc("get_statistics"))
}

export async function getEvents(fromDate, toDate) {
    return result(supabase.rpc("get_events", { start_date: fromDate, end_date: toDate }))
}