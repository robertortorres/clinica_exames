import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Users, UserRound, FileText, LogOut, Stethoscope, LayoutDashboard } from 'lucide-react'

const PERFIL_LABEL = { admin: 'Administrador', enfermagem: 'Enfermagem', atendimento: 'Atendimento' }

export default function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }
  const initials = usuario?.nome?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🏥 Clínica</h1>
          <p>Sistema de Exames</p>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/pacientes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <UserRound size={18} /> Pacientes
          </NavLink>
          {['admin', 'enfermagem'].includes(usuario?.perfil) && (
            <NavLink to="/pacientes/novo" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Stethoscope size={18} /> Novo Paciente
            </NavLink>
          )}
          {usuario?.perfil === 'admin' && (<>
            <NavLink to="/usuarios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={18} /> Usuários
            </NavLink>
            <NavLink to="/tipos-exame" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={18} /> Tipos de Exame
            </NavLink>
          </>)}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{usuario?.nome}</div>
              <div className="user-role">{PERFIL_LABEL[usuario?.perfil]}</div>
            </div>
          </div>
          <button className="btn btn-ghost w-full" style={{ justifyContent: 'center' }} onClick={handleLogout}>
            <LogOut size={15} /> Sair
          </button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  )
}
