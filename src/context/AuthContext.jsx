import { useEffect, useState } from "react"

import { supabase } from "../services/supabase"
import { AuthContext } from "./authContext"

function getUrlParams() {
    if (typeof window === "undefined") {
        return new URLSearchParams()
    }

    return new URLSearchParams(
        window.location.hash.replace(/^#/, "")
    )
}

function readRecoveryError() {
    const description =
        getUrlParams().get("error_description") ||
        getUrlParams().get("error_code")

    return description
        ? description.replace(/\+/g, " ")
        : ""
}

function isRecoveryLink() {
    if (typeof window === "undefined") {
        return false
    }

    return getUrlParams().get("type") === "recovery"
}

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [recovering, setRecovering] =
        useState(isRecoveryLink)
    const [authLinkError] = useState(readRecoveryError)

    useEffect(() => {
        let active = true

        if (readRecoveryError()) {
            window.history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search
            )
        }

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
                if (!active) {
                    return
                }

                if (event === "PASSWORD_RECOVERY") {
                    setRecovering(true)
                }

                setSession(newSession ?? null)
                setLoading(false)
            }
        )

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

        return () => {
            active = false
            subscription.unsubscribe()
        }
    }, [])

    const value = {
        session,
        user: session?.user ?? null,
        authenticated: Boolean(session),
        loading,
        recovering,
        authLinkError,
        clearRecovery: () => setRecovering(false)
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
