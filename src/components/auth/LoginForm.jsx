import { useState } from "react"
import { LogIn } from "lucide-react"

import { loginUser } from "../../services/auth"

function LoginForm({ onRegister }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()

        setError("")
        setLoading(true)

        try {
            await loginUser({
                email: email.trim(),
                password
            })
        } catch (error) {
            setError(
                error.message ||
                "No se pudo iniciar sesión."
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
                    BIENVENIDO DE VUELTA
                </span>

                <h1>
                    Continúa tu aventura.
                </h1>

                <p>
                    Tu progreso te espera.
                </p>
            </div>

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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={event =>
                        setPassword(event.target.value)
                    }
                    placeholder="••••••••"
                />
            </label>

            {error && (
                <p className="auth-error">
                    {error}
                </p>
            )}

            <button
                type="submit"
                className="primary-button auth-submit"
                disabled={loading}
            >
                <LogIn size={14} />

                {loading
                    ? "Entrando..."
                    : "Entrar"}
            </button>

            <button
                type="button"
                className="auth-switch"
                onClick={onRegister}
            >
                ¿No tienes cuenta? Crear cuenta
            </button>
        </form>
    )
}

export default LoginForm