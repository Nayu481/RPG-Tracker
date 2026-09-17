import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App.jsx"

import { AuthProvider } from "./context/AuthContext.jsx"
import { GameProvider } from "./context/GameContext.jsx"

import "./styles/global.css"
import "./styles/layout.css"
import "./styles/dashboard.css"
import "./styles/cards.css"

createRoot(
    document.getElementById("root")
).render(
    <StrictMode>
        <AuthProvider>
            <GameProvider>
                <App />
            </GameProvider>
        </AuthProvider>
    </StrictMode>
)