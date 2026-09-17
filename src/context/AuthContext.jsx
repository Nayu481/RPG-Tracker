import { useEffect, useState } from "react"

import { supabase } from "../services/supabase"
import { AuthContext } from "./authContext"

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        async function loadSession() {
            const { data, error } =
                await supabase.auth.getSession()

            if (error) {
                console.error(
                    "Error obteniendo la sesión:",
                    error
                )
            }

            if (active) {
                setSession(data.session ?? null)
                setLoading(false)
            }
        }

        loadSession()

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                if (!active) {
                    return
                }

                setSession(newSession ?? null)
                setLoading(false)
            }
        )

        return () => {
            active = false
            subscription.unsubscribe()
        }
    }, [])

    const value = {
        session,
        user: session?.user ?? null,
        authenticated: Boolean(session),
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}