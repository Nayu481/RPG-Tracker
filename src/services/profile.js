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

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

export async function uploadAvatarFile(file) {
    if (!file) throw new Error("Elige una imagen")
    if (!file.type.startsWith("image/")) throw new Error("El archivo debe ser una imagen")
    if (file.size > MAX_AVATAR_BYTES) throw new Error("La imagen no puede superar 2 MB")

    const userId = await currentUserId()
    const extension = (file.name.split(".").pop() || "png").toLowerCase().slice(0, 5)
    const path = `${userId}/${Date.now()}.${extension}`

    const { error } = await supabase.storage.from("avatars").upload(path, file, {
        contentType: file.type,
        upsert: true
    })
    if (error) throw error

    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
    return data.publicUrl
}
