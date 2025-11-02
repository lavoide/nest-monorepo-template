import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/protected-route'
import Home from './pages/home'
import Login from './pages/login'
import Signup from './pages/signup'
import { useAuthStore } from './store/useAuthStore'

/* Theme variables */
import './theme/variables.css'

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router basename="/app">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <Signup />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
        </Route>

        {/* Default Route */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />} />
      </Routes>
    </Router>
  )
}

export default App
