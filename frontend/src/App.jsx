import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import LawyerDashboard from './pages/LawyerDashboard'
import ClerkDashboard from './pages/ClerkDashboard'
import JudgeDashboard from './pages/JudgeDashboard'
import PublicSearch from './pages/PublicSearch'

function PrivateRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const token = localStorage.getItem('token')
  if (!token || !user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<PublicSearch />} />
        <Route path="/lawyer" element={
          <PrivateRoute role="lawyer"><LawyerDashboard /></PrivateRoute>
        } />
        <Route path="/clerk" element={
          <PrivateRoute role="clerk"><ClerkDashboard /></PrivateRoute>
        } />
        <Route path="/judge" element={
          <PrivateRoute role="judge"><JudgeDashboard /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}