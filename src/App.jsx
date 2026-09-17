import { useState } from "react"

import Sidebar from "./components/layout/Sidebar"
import LoadingScreen from "./components/ui/LoadingScreen"

import Dashboard from "./pages/Dashboard"
import Tasks from "./pages/Tasks"
import Habits from "./pages/Habits"
import Objectives from "./pages/Objectives"
import Character from "./pages/Character"
import Auth from "./pages/Auth"

import { useAuth } from "./context/useAuth"

function App() {
    const {
        authenticated,
        loading
    } = useAuth()

    const [page, setPage] = useState("dashboard")

    if (loading) {
        return <LoadingScreen />
    }

    if (!authenticated) {
        return <Auth />
    }

    function renderPage() {
        switch (page) {
            case "tasks":
                return <Tasks />

            case "habits":
                return <Habits />

            case "objectives":
                return <Objectives />

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
                {renderPage()}
            </main>
        </div>
    )
}

export default App