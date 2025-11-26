import { Routes, Route, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import Navigation from "./components/Navigation"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import GameDetail from "./pages/GameDetail"
import Profile from "./pages/Profile"
import CreateReview from "./pages/CreateReview"
import ProtectedRoute from "./components/ProtectedRoute"
import LightRays from "./components/Background"
import "./App.css"

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <div className="app-shell">
      <div className="background-wrapper">
        <LightRays
          raysOrigin="top-center"
          raysColor="#1a4bff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays app-background"
        />
      </div>

      <div className="app-content">
        <Navigation />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" /> : <Login />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/" /> : <Register />}
            />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/profile/:userId" element={<Profile />} />

            {/* Protected Routes */}
            <Route
              path="/game/:id/review"
              element={
                <ProtectedRoute>
                  <CreateReview />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
