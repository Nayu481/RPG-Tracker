import { useState } from "react"
import { UserPlus } from "lucide-react"

import { registerUser } from "../../services/auth"

function RegisterForm({ onLogin }) {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()

        const cleanUsername = username.trim()
        const cleanEmail = email.trim()

        if (cleanUsername.length < 2) {
            setError(
                "El nombre debe tener al menos 2 caracteres."
            )

            return
        }

        setError("")
        setMessage("")
        setLoading(true)

        try {
            const data = await registerUser({
                username: cleanUsername,
                email: cleanEmail,
                password
            })

            if (!data.session) {
                setMessage(
                    "Cuenta creada. Revisa tu correo para confirmar tu cuenta."
                )
            }
        } catch (error) {
            setError(
                error.message ||
                "No se pudo crear la cuenta."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            className="auth-form"
            onSubmit={handleSubmit}
        >
            <div className="auth-heading">
                <span className="eyebrow">
                    NUEVA AVENTURA
                </span>

                <h1>
                    Crea tu personaje.
                </h1>

                <p>
                    Convierte tus objetivos diarios
                    en progreso.
                </p>
            </div>

            <label>
                Nombre

                <input
                    type="text"
                    autoComplete="username"
                    required
                    minLength="2"
                    maxLength="30"
                    value={username}
                    onChange={event =>
                        setUsername(event.target.value)
                    }
                    placeholder="Aventurero"
                />
            </label>

            <label>
                Correo

                <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={event =>
                        setEmail(event.target.value)
                    }
                    placeholder="tu@correo.com"
                />
            </label>

            <label>
                Contraseña

                <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength="6"
                    value={password}
                    onChange={event =>
                        setPassword(event.target.value)
                    }
                    placeholder="Mínimo 6 caracteres"
                />
            </label>

            {error && (
                <p className="auth-error">
                    {error}
                </p>
            )}

            {message && (
                <p className="auth-success">
                    {message}
                </p>
            )}

            <button
                type="submit"
                className="primary-button auth-submit"
                disabled={loading}
            >
                <UserPlus size={14} />

                {loading
                    ? "Creando..."
                    : "Crear cuenta"}
            </button>

            <button
                type="button"
                className="auth-switch"
                onClick={onLogin}
            >
                Ya tengo una cuenta
            </button>
        </form>
    )
}

export default RegisterForm