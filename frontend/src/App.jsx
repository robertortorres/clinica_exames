import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import PacienteDetalhe from './pages/PacienteDetalhe'
import PacienteForm from './pages/PacienteForm'
import Usuarios from './pages/Usuarios'
import TiposExame from './pages/TiposExame'

function PrivateRoute({ children, perfis }) {
  const { usuario, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" /></div>
  if (!usuario) return <Navigate to="/login" replace />
  if (perfis && !perfis.includes(usuario.perfil)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="pacientes" element={<Pacientes />} />
            <Route path="pacientes/novo" element={
              <PrivateRoute perfis={['admin', 'enfermagem']}><PacienteForm /></PrivateRoute>
            } />
            <Route path="pacientes/:id" element={<PacienteDetalhe />} />
            <Route path="pacientes/:id/editar" element={
              <PrivateRoute perfis={['admin', 'enfermagem']}><PacienteForm /></PrivateRoute>
            } />
            <Route path="usuarios" element={
              <PrivateRoute perfis={['admin']}><Usuarios /></PrivateRoute>
            } />
            <Route path="tipos-exame" element={
              <PrivateRoute perfis={['admin']}><TiposExame /></PrivateRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
