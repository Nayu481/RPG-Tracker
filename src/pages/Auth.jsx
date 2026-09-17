import { useState } from "react"

import LoginForm from "../components/auth/LoginForm"
import RegisterForm from "../components/auth/RegisterForm"

function Auth() {
    const [mode, setMode] = useState("login")

    return (
        <main className="auth-page">
            <section className="auth-brand">
                <div className="auth-brand-top">
                    <span className="auth-logo">
                        RPG TRACKER
                    </span>

                    <span className="auth-subtitle">
                        TU VIDA · TU AVENTURA
                    </span>
                </div>

                <div className="auth-brand-content">
                    <span className="eyebrow">
                        YOUR LIFE · YOUR JOURNEY
                    </span>

                    <h2>
                        Convierte tu vida
                        <br />
                        en una aventura.
                    </h2>

                    <p>
                        Completa misiones, construye
                        hábitos y alcanza objetivos
                        mientras desarrollas tu personaje.
                    </p>
                </div>

                <blockquote>
                    “Pequeños pasos,
                    grandes destinos.”
                </blockquote>
            </section>

            <section className="auth-content">
                {mode === "login" ? (
                    <LoginForm
                        onRegister={() =>
                            setMode("register")
                        }
                    />
                ) : (
                    <RegisterForm
                        onLogin={() =>
                            setMode("login")
                        }
                    />
                )}
            </section>
        </main>
    )
}

export default Auth