import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FileText, UserRound, Plus, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dashboard').then(r => { setDados(r.data); setLoading(false) })
  }, [])

  const formatarData = (d) => {
    try { return format(new Date(d + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR }) }
    catch { return d }
  }

  const formatarHora = (d) => {
    try { return format(new Date(d), "dd/MM 'às' HH:mm", { locale: ptBR }) }
    catch { return d }
  }

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Olá, {usuario?.nome?.split(' ')[0]} 👋</h2>
          <p>{format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>
        {['admin', 'enfermagem'].includes(usuario?.perfil) && (
          <button className="btn btn-primary" onClick={() => navigate('/pacientes/novo')}>
            <Plus size={16} /> Novo Paciente
          </button>
        )}
      </div>

      {/* Cards de stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard
          icon={<Users size={22} />}
          label="Total de Pacientes"
          valor={dados.total_pacientes}
          cor="var(--primary)"
          corBg="var(--primary-light)"
          onClick={() => navigate('/pacientes')}
        />
        <StatCard
          icon={<FileText size={22} />}
          label="Total de Exames"
          valor={dados.total_exames}
          cor="#8b5cf6"
          corBg="#f3eeff"
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="Exames Hoje"
          valor={dados.exames_hoje}
          cor="var(--success)"
          corBg="var(--success-light)"
        />
        <StatCard
          icon={<UserRound size={22} />}
          label="Pacientes Cadastrados Hoje"
          valor={dados.pacientes_hoje}
          cor="var(--warning)"
          corBg="#fff3ee"
        />
      </div>

      {/* Últimos pacientes */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Últimos 10 Pacientes Cadastrados</span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/pacientes')}>
            Ver todos →
          </button>
        </div>

        {dados.ultimos_pacientes.length === 0 ? (
          <div className="empty-state">
            <UserRound />
            <p>Nenhum paciente cadastrado ainda</p>
            {['admin', 'enfermagem'].includes(usuario?.perfil) && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/pacientes/novo')}>
                <Plus size={15} /> Cadastrar primeiro paciente
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Nascimento</th>
                  <th>Telefone</th>
                  <th>Exames</th>
                  <th>Cadastrado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {dados.ultimos_pacientes.map(p => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/pacientes/${p.id}`)}>
                    <td className="font-bold">{p.nome_completo}</td>
                    <td>{formatarData(p.data_nascimento)}</td>
                    <td>{p.telefone || <span className="text-muted">—</span>}</td>
                    <td>
                      <span className="badge badge-exame">
                        {p.total_exames} exame{p.total_exames !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="text-muted text-sm">{formatarHora(p.criado_em)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); navigate(`/pacientes/${p.id}`) }}>
                        Ver →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, valor, cor, corBg, onClick }) {
  return (
    <div
      className="card"
      style={{ padding: '20px 24px', cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow 0.15s' }}
      onClick={onClick}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = 'var(--shadow)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: corBg, color: cor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: 'var(--text)' }}>{valor}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{label}</div>
        </div>
      </div>
    </div>
  )
}
