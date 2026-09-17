import AuthBrand from "../components/auth/AuthBrand"
import ResetPasswordForm from "../components/auth/ResetPasswordForm"

import { useAuth } from "../context/useAuth"

function ResetPassword() {
    const { clearRecovery } = useAuth()

    return (
        <main className="auth-page">
            <AuthBrand />

            <section className="auth-content">
                <ResetPasswordForm onDone={clearRecovery} />
            </section>
        </main>
    )
}

export default ResetPassword
