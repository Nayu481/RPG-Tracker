import { supabase } from "./supabase"

export async function registerUser({
    email,
    password,
    username
}) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username
            }
        }
    })

    if (error) {
        throw error
    }

    return data
}

export async function loginUser({
    email,
    password
}) {
    const { data, error } =
        await supabase.auth.signInWithPassword({
            email,
            password
        })

    if (error) {
        throw error
    }

    return data
}

export async function logoutUser() {
    const { error } = await supabase.auth.signOut()

    if (error) {
        throw error
    }
}