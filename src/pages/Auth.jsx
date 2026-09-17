import { useState } from "react"

import AuthBrand from "../components/auth/AuthBrand"
import LoginForm from "../components/auth/LoginForm"
import RegisterForm from "../components/auth/RegisterForm"
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm"

import { useAuth } from "../context/useAuth"

function Auth() {
    const { authLinkError } = useAuth()
    const [mode, setMode] = useState("login")

    function renderForm() {
        switch (mode) {
            case "register":
                return (
                    <RegisterForm
                        onLogin={() =>
                            setMode("login")
                        }
                    />
                )

            case "forgot":
                return (
                    <ForgotPasswordForm
                        onLogin={() =>
                            setMode("login")
                        }
                    />
                )

            default:
                return (
                    <LoginForm
                        onRegister={() =>
                            setMode("register")
                        }
                        onForgot={() =>
                            setMode("forgot")
                        }
                        externalError={authLinkError}
                    />
                )
        }
    }

    return (
        <main className="auth-page">
            <AuthBrand />

            <section className="auth-content">
                {renderForm()}
            </section>
        </main>
    )
}

export default Auth
