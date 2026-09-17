import { supabase } from "./supabase"

export async function currentUserId() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!data.user) throw new Error("Inicia sesión para continuar")
    return data.user.id
}

export async function result(request) {
    const { data, error } = await request
    if (error) throw error
    return data
}

const keepEmpty = new Set(["title", "description"])

export function editableFields(values, fields) {
    return Object.fromEntries(fields.filter(([key]) => values[key] !== undefined)
        .map(([key, column = key]) => [column, values[key] === "" && !keepEmpty.has(key) ? null : values[key]]))
}
