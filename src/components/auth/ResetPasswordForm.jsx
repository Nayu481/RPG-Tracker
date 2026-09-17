import { useState } from "react"
import { KeyRound, ShieldCheck } from "lucide-react"

import { updatePassword } from "../../services/auth"

function ResetPasswordForm({ onDone }) {
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()

        if (password.length < 6) {
            setError(
                "La contraseña debe tener al menos 6 caracteres."
            )

            return
        }

        if (password !== confirm) {
            setError(
                "Las contraseñas no coinciden."
            )

            return
        }

        setError("")
        setLoading(true)

        try {
            await updatePassword({ password })
            setDone(true)
        } catch (error) {
            setError(
                error.message ||
                "No se pudo actualizar la contraseña."
            )
        } finally {
            setLoading(false)
        }
    }

    if (done) {
        return (
            <div className="auth-form">
                <div className="auth-heading">
                    <span className="eyebrow">
                        LISTO
                    </span>

                    <h1>
                        Contraseña actualizada.
                    </h1>

                    <p>
                        Ya puedes continuar con
                        tu aventura.
                    </p>
                </div>

                <button
                    type="button"
                    className="primary-button auth-submit"
                    onClick={onDone}
                >
                    <ShieldCheck size={14} />
                    Ir a mi aventura
                </button>
            </div>
        )
    }

    return (
        <form
            className="auth-form"
            onSubmit={handleSubmit}
        >
            <div className="auth-heading">
                <span className="eyebrow">
                    NUEVA CONTRASEÑA
                </span>

                <h1>
                    Restablece tu acceso.
                </h1>

                <p>
                    Elige una contraseña nueva
                    para tu cuenta.
                </p>
            </div>

            <label>
                Nueva contraseña

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

            <label>
                Repite la contraseña

                <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength="6"
                    value={confirm}
                    onChange={event =>
                        setConfirm(event.target.value)
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
                <KeyRound size={14} />

                {loading
                    ? "Guardando..."
                    : "Guardar contraseña"}
            </button>
        </form>
    )
}

export default ResetPasswordForm
