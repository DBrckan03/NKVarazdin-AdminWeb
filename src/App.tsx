import { Navigate, Route, Routes, useLocation } from 'react-router'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { isAuthenticated } from './utils/auth'

function App() {
  const location = useLocation()
  const auth = isAuthenticated()

  return (
    <Routes>
      <Route
        path="/login"
        element={!auth ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/"
        element={auth ? <DashboardPage /> : <Navigate to="/login" replace state={{ from: location }} />}
      />
    </Routes>
  )
}

export default App