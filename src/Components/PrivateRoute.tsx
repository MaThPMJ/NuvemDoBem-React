import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute() {
  const { isAuthenticated } = useAuth()
  // localStorage é síncrono — garante acesso mesmo antes do React state ser processado
  const localAuth = !!(localStorage.getItem('token') && localStorage.getItem('nuvem_user'))
  return (isAuthenticated || localAuth) ? <Outlet /> : <Navigate to="/login" replace />
}
