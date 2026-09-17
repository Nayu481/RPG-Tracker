import { useState } from "react"
import { MailCheck } from "lucide-react"

import { requestPasswordReset } from "../../services/auth"

function ForgotPasswordForm({ onLogin }) {
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()

        setError("")
        setMessage("")
        setLoading(true)

        try {
            await requestPasswordReset({
                email: email.trim()
            })

            setMessage(
                "Si el correo existe, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja y la carpeta de spam."
            )
        } catch (error) {
            setError(
                error.message ||
                "No se pudo enviar el enlace."
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
                    RECUPERAR ACCESO
                </span>

                <h1>
                    ¿Olvidaste tu contraseña?
                </h1>

                <p>
                    Te enviaremos un enlace para
                    crear una nueva.
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
                <MailCheck size={14} />

                {loading
                    ? "Enviando..."
                    : "Enviar enlace"}
            </button>

            <button
                type="button"
                className="auth-switch"
                onClick={onLogin}
            >
                Volver a iniciar sesión
            </button>
        </form>
    )
}

export default ForgotPasswordForm
