import { supabase } from "./supabase"
import { currentUserId, result, editableFields } from "./gameData"

const fields = [["title"], ["description"], ["cost"], ["active"]]

export async function getRewards() {
    return result(supabase.from("rewards").select("*").eq("user_id", await currentUserId()).order("created_at", { ascending: false }))
}

export async function createReward(values) {
    return result(supabase.from("rewards").insert({
        ...editableFields(values, fields), user_id: await currentUserId()
    }).select().single())
}

export async function updateReward(id, values) {
    return result(supabase.from("rewards").update(editableFields(values, fields))
        .eq("id", id).eq("user_id", await currentUserId()).select().single())
}

export async function deleteReward(id) {
    return result(supabase.from("rewards").delete()
        .eq("id", id).eq("user_id", await currentUserId()).select("id").single())
}

export async function redeemReward(id) {
    return result(supabase.rpc("redeem_reward", { target_reward_id: id }))
}