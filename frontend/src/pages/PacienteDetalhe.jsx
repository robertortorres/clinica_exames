import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, FileText, Image, Download, Trash2, Edit, Send, CheckSquare, Square } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import ModalExame from '../components/ModalExame'

export default function PacienteDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [paciente, setPaciente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalExame, setModalExame] = useState(false)
  const [selecionados, setSelecionados] = useState([])

  const carregar = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/pacientes/${id}`)
      setPaciente(res.data)
      setSelecionados([])
    } catch { navigate('/pacientes') }
    finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [id])

  const toggleSelecionar = (exameId) => {
    setSelecionados(sel =>
      sel.includes(exameId) ? sel.filter(s => s !== exameId) : [...sel, exameId]
    )
  }

  const enviarWhatsApp = () => {
    if (!paciente.telefone) {
      alert('Este paciente não possui telefone cadastrado.')
      return
    }
    if (selecionados.length === 0) {
      alert('Selecione pelo menos um exame para enviar.')
      return
    }

    // Montar mensagem com links dos exames selecionados
    const examesSel = paciente.exames.filter(e => selecionados.includes(e.id))
    const baseUrl = window.location.origin

    let msg = `🏥 *Clínica — Resultados de Exames*\n\n`
    msg += `Paciente: *${paciente.nome_completo}*\n\n`

    examesSel.forEach((e, i) => {
      const dataFmt = format(new Date(e.data_realizacao + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })
      msg += `📋 *${e.tipo_exame.nome}* — ${dataFmt}\n`
      msg += `🔗 ${baseUrl}/api/exames/${e.id}/arquivo\n\n`
    })

    msg += `_Enviado pelo sistema de gestão da clínica_`

    // Formatar telefone (remover não numéricos, adicionar 55 se necessário)
    let tel = paciente.telefone.replace(/\D/g, '')
    if (!tel.startsWith('55')) tel = '55' + tel

    const url = `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  const deletarExame = async (exameId) => {
    if (!confirm('Excluir este exame? Esta ação não pode ser desfeita.')) return
    try { await api.delete(`/api/exames/${exameId}`); carregar() }
    catch (err) { alert(err.response?.data?.detail || 'Erro ao excluir exame') }
  }

  const fmt = (d) => { try { return format(new Date(d + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) } catch { return d } }
  const fmtShort = (d) => { try { return format(new Date(d + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR }) } catch { return d } }
  const fmtTam = (b) => b < 1024 ? `${b}B` : b < 1024*1024 ? `${(b/1024).toFixed(1)}KB` : `${(b/1024/1024).toFixed(1)}MB`
  const isPDF = (t) => t === 'application/pdf'

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner" /></div>
  if (!paciente) return null

  const podeEditar = ['admin', 'enfermagem'].includes(usuario?.perfil)
  const podeExcluir = usuario?.perfil === 'admin'

  return (
    <div>
      <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={() => navigate('/pacientes')}>
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Dados do paciente */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Dados do Paciente</span>
          {podeEditar && (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/pacientes/${id}/editar`)}>
              <Edit size={15} /> Editar
            </button>
          )}
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 20 }}>
            <Campo label="Nome Completo" valor={paciente.nome_completo} destaque />
            <Campo label="Data de Nascimento" valor={fmt(paciente.data_nascimento)} />
            <Campo label="CPF" valor={paciente.cpf} />
            <Campo label="Telefone" valor={paciente.telefone} />
            <Campo label="Email" valor={paciente.email} />
          </div>
          {paciente.endereco && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginBottom: 4 }}>Endereço</div>
              <div style={{ fontSize: 14 }}>{paciente.endereco}</div>
            </div>
          )}
          {paciente.observacoes && (
            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 14px', marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginBottom: 4 }}>📝 Observações</div>
              <div style={{ fontSize: 14, color: 'var(--text)' }}>{paciente.observacoes}</div>
            </div>
          )}
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
            Cadastrado em: {fmtShort(paciente.criado_em)}
          </div>
        </div>
      </div>

      {/* Exames */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            Exames <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 14 }}>({paciente.exames.length})</span>
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {selecionados.length > 0 && (
              <button className="btn btn-sm" style={{ background: '#25d366', color: '#fff' }} onClick={enviarWhatsApp}>
                <Send size={14} /> WhatsApp ({selecionados.length})
              </button>
            )}
            {podeEditar && (
              <button className="btn btn-primary btn-sm" onClick={() => setModalExame(true)}>
                <Plus size={15} /> Adicionar Exame
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          {selecionados.length > 0 && (
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
              ✅ {selecionados.length} exame{selecionados.length > 1 ? 's' : ''} selecionado{selecionados.length > 1 ? 's' : ''} — clique em <strong>WhatsApp</strong> para enviar
            </div>
          )}

          {paciente.exames.length === 0 ? (
            <div className="empty-state">
              <FileText />
              <p>Nenhum exame cadastrado ainda</p>
              {podeEditar && (
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModalExame(true)}>
                  <Plus size={15} /> Adicionar primeiro exame
                </button>
              )}
            </div>
          ) : (
            paciente.exames.map(exame => {
              const sel = selecionados.includes(exame.id)
              return (
                <div key={exame.id} className="exame-item"
                  style={{ cursor: 'pointer', border: sel ? '2px solid var(--primary)' : '1px solid var(--border)', background: sel ? 'var(--primary-light)' : 'var(--surface)' }}
                  onClick={() => toggleSelecionar(exame.id)}
                >
                  <div style={{ color: sel ? 'var(--primary)' : 'var(--text3)', flexShrink: 0 }}>
                    {sel ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                  <div className="exame-icon">
                    {isPDF(exame.arquivo_tipo) ? <FileText size={20} /> : <Image size={20} />}
                  </div>
                  <div className="exame-info">
                    <div className="exame-tipo">{exame.tipo_exame.nome}</div>
                    <div className="exame-data">{fmtShort(exame.data_realizacao)} · {fmtTam(exame.arquivo_tamanho)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{exame.arquivo_nome}</div>
                    {exame.observacoes && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>📝 {exame.observacoes}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                    <a href={`/api/exames/${exame.id}/arquivo`} target="_blank" rel="noreferrer"
                      className="btn btn-secondary btn-sm">
                      <Download size={14} /> Abrir
                    </a>
                    {podeExcluir && (
                      <button className="btn btn-danger btn-sm" onClick={() => deletarExame(exame.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {modalExame && (
        <ModalExame pacienteId={id} onClose={() => setModalExame(false)} onSalvo={() => { setModalExame(false); carregar() }} />
      )}
    </div>
  )
}

function Campo({ label, valor, destaque }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: destaque ? 16 : 14, fontWeight: destaque ? 600 : 400 }}>
        {valor || <span style={{ color: 'var(--text3)' }}>—</span>}
      </div>
    </div>
  )
}
