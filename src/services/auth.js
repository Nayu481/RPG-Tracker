import { supabase } from "./supabase"

function getAuthRedirectUrl() {
    if (typeof window === "undefined") {
        return undefined
    }

    const base = import.meta.env.BASE_URL || "/"

    return new URL(base, window.location.origin).href
}

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

export async function requestPasswordReset({ email }) {
    const { data, error } =
        await supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: getAuthRedirectUrl()
            }
        )

    if (error) {
        throw error
    }

    return data
}

export async function updatePassword({ password }) {
    const { data, error } =
        await supabase.auth.updateUser({ password })

    if (error) {
        throw error
    }

    return data
}