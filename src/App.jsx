import { useState } from "react"

import Sidebar from "./components/layout/Sidebar"
import LoadingScreen from "./components/ui/LoadingScreen"

import Dashboard from "./pages/Dashboard"
import Tasks from "./pages/Tasks"
import Habits from "./pages/Habits"
import Objectives from "./pages/Objectives"
import Rewards from "./pages/Rewards"
import History from "./pages/History"
import Character from "./pages/Character"
import Auth from "./pages/Auth"

import { useAuth } from "./context/useAuth"
import { useGame } from "./context/useGame"
import { GameProvider } from "./context/GameContext"

function App() {
    const { user, loading } = useAuth()
    if (loading) return <LoadingScreen />
    if (!user) return <Auth />
    return <GameProvider key={user.id}><GameApp /></GameProvider>
}

function GameApp() {
    const [page, setPage] = useState("dashboard")
    const { player, loading, error, busy, reload } = useGame()
    if (loading) return <LoadingScreen />

    function renderPage() {
        switch (page) {
            case "tasks":
                return <Tasks />

            case "habits":
                return <Habits />

            case "objectives":
                return <Objectives />

            case "rewards":
                return <Rewards />

            case "history":
                return <History />

            case "character":
                return <Character />

            default:
                return <Dashboard />
        }
    }

    return (
        <div className="app-layout">
            <Sidebar
                page={page}
                setPage={setPage}
            />

            <main className="main-content">
                {error && <div className="auth-error" role="alert">
                    {error}
                    <button type="button" disabled={busy} onClick={reload}>Reintentar carga</button>
                </div>}
                {player && renderPage()}
            </main>
        </div>
    )
}

export default App