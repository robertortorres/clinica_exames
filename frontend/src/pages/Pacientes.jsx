import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, ChevronLeft, ChevronRight, UserRound, X } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const POR_PAGINA = 10
const PERIODOS = [
  { label: 'Hoje', value: 'hoje' },
  { label: 'Ontem', value: 'ontem' },
  { label: 'Últimos 7 dias', value: '7dias' },
  { label: 'Personalizado', value: 'custom' },
]

function getPeriodo(valor) {
  const hoje = new Date()
  const fmt = (d) => format(d, 'yyyy-MM-dd')
  if (valor === 'hoje') return { inicio: fmt(hoje), fim: fmt(hoje) }
  if (valor === 'ontem') return { inicio: fmt(subDays(hoje, 1)), fim: fmt(subDays(hoje, 1)) }
  if (valor === '7dias') return { inicio: fmt(subDays(hoje, 6)), fim: fmt(hoje) }
  return null
}

export default function Pacientes() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(0)
  const [busca, setBusca] = useState('')
  const [buscaInput, setBuscaInput] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [loading, setLoading] = useState(true)

  const datasEfetivas = periodo && periodo !== 'custom'
    ? getPeriodo(periodo)
    : periodo === 'custom'
    ? { inicio: dataInicio, fim: dataFim }
    : { inicio: '', fim: '' }

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limite: POR_PAGINA, offset: pagina * POR_PAGINA }
      if (busca) params.busca = busca
      if (datasEfetivas?.inicio) params.data_inicio = datasEfetivas.inicio
      if (datasEfetivas?.fim) params.data_fim = datasEfetivas.fim
      const [listRes, totalRes] = await Promise.all([
        api.get('/api/pacientes', { params }),
        api.get('/api/pacientes/total', { params })
      ])
      setPacientes(listRes.data)
      setTotal(totalRes.data.total)
    } finally { setLoading(false) }
  }, [pagina, busca, datasEfetivas?.inicio, datasEfetivas?.fim])

  useEffect(() => { carregar() }, [carregar])

  const handleBusca = (e) => { e.preventDefault(); setPagina(0); setBusca(buscaInput); setPeriodo(''); setDataInicio(''); setDataFim('') }
  const handlePeriodo = (val) => { setPeriodo(p => p === val ? '' : val); setPagina(0); setBusca(''); setBuscaInput('') }
  const limpar = () => { setBusca(''); setBuscaInput(''); setPeriodo(''); setDataInicio(''); setDataFim(''); setPagina(0) }

  const fmt = (d) => { try { return format(new Date(d + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR }) } catch { return d } }
  const fmtH = (d) => { try { return format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: ptBR }) } catch { return d } }
  const totalPaginas = Math.ceil(total / POR_PAGINA)
  const temFiltro = busca || periodo

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h2>Pacientes</h2><p>Gerencie os pacientes cadastrados</p></div>
        {['admin', 'enfermagem'].includes(usuario?.perfil) && (
          <button className="btn btn-primary" onClick={() => navigate('/pacientes/novo')}><Plus size={16} /> Novo Paciente</button>
        )}
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <form onSubmit={handleBusca} style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} />
            <input className="form-control" placeholder="Busca parcial por nome..." value={buscaInput}
              onChange={e => setBuscaInput(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary"><Search size={15} /> Buscar</button>
          {temFiltro && <button type="button" className="btn btn-secondary" onClick={limpar}><X size={15} /> Limpar</button>}
        </form>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Período:</span>
          {PERIODOS.map(p => (
            <button key={p.value} className={`btn btn-sm ${periodo === p.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handlePeriodo(p.value)}>{p.label}</button>
          ))}
        </div>

        {periodo === 'custom' && (
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <div><label className="form-label">De</label>
              <input type="date" className="form-control" value={dataInicio}
                onChange={e => { setDataInicio(e.target.value); setPagina(0) }} style={{ width: 170 }} /></div>
            <div><label className="form-label">Até</label>
              <input type="date" className="form-control" value={dataFim}
                onChange={e => { setDataFim(e.target.value); setPagina(0) }} style={{ width: 170 }} /></div>
          </div>
        )}
        {periodo && periodo !== 'custom' && datasEfetivas?.inicio && (
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text2)' }}>
            📅 {fmt(datasEfetivas.inicio)}{datasEfetivas.inicio !== datasEfetivas.fim && ` até ${fmt(datasEfetivas.fim)}`}
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">{loading ? 'Carregando...' : `${total} paciente${total !== 1 ? 's' : ''}`}</span>
        </div>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner" /></div>
        ) : pacientes.length === 0 ? (
          <div className="empty-state"><UserRound /><p>Nenhum paciente encontrado</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nome</th><th>CPF</th><th>Nascimento</th><th>Telefone</th><th>Exames</th><th>Cadastrado em</th><th></th></tr></thead>
              <tbody>
                {pacientes.map(p => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/pacientes/${p.id}`)}>
                    <td className="font-bold">{p.nome_completo}</td>
                    <td className="text-muted text-sm">{p.cpf || '—'}</td>
                    <td>{fmt(p.data_nascimento)}</td>
                    <td>{p.telefone || <span className="text-muted">—</span>}</td>
                    <td><span className="badge badge-exame">{p.total_exames} exame{p.total_exames !== 1 ? 's' : ''}</span></td>
                    <td className="text-muted text-sm">{fmtH(p.criado_em)}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); navigate(`/pacientes/${p.id}`) }}>Ver →</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPaginas > 1 && (
          <div className="pagination" style={{ padding: '16px 0' }}>
            <button className="page-btn" disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(totalPaginas, 7) }, (_, i) => {
              const p = pagina < 4 ? i : pagina - 3 + i
              if (p >= totalPaginas) return null
              return <button key={p} className={`page-btn ${p === pagina ? 'active' : ''}`} onClick={() => setPagina(p)}>{p + 1}</button>
            })}
            <button className="page-btn" disabled={pagina >= totalPaginas - 1} onClick={() => setPagina(p => p + 1)}><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  )
}
