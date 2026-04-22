import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import api from '../services/api'

export default function PacienteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdicao = Boolean(id)
  const [form, setForm] = useState({
    nome_completo: '', data_nascimento: '', cpf: '',
    telefone: '', email: '', endereco: '', observacoes: ''
  })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [carregando, setCarregando] = useState(isEdicao)

  useEffect(() => {
    if (!isEdicao) return
    api.get(`/api/pacientes/${id}`).then(res => {
      const p = res.data
      setForm({
        nome_completo: p.nome_completo,
        data_nascimento: p.data_nascimento,
        cpf: p.cpf || '',
        telefone: p.telefone || '',
        email: p.email || '',
        endereco: p.endereco || '',
        observacoes: p.observacoes || '',
      })
      setCarregando(false)
    }).catch(() => navigate('/pacientes'))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault(); setErro(''); setLoading(true)
    try {
      const dados = { ...form }
      // Remover campos vazios opcionais
      ;['cpf', 'telefone', 'email', 'endereco', 'observacoes'].forEach(c => { if (!dados[c]) delete dados[c] })
      if (isEdicao) {
        await api.put(`/api/pacientes/${id}`, dados)
        navigate(`/pacientes/${id}`)
      } else {
        const res = await api.post('/api/pacientes', dados)
        navigate(`/pacientes/${res.data.id}`)
      }
    } catch (err) {
      const d = err.response?.data?.detail
      setErro(Array.isArray(d) ? d.map(x => x.msg).join(', ') : d || 'Erro ao salvar')
    } finally { setLoading(false) }
  }

  const set = (campo) => (e) => setForm(f => ({ ...f, [campo]: e.target.value }))

  if (carregando) return <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner" /></div>

  return (
    <div style={{ maxWidth: 720 }}>
      <button className="btn btn-ghost" style={{ marginBottom: 20 }}
        onClick={() => navigate(isEdicao ? `/pacientes/${id}` : '/pacientes')}>
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="page-header">
        <h2>{isEdicao ? 'Editar Paciente' : 'Novo Paciente'}</h2>
        <p>{isEdicao ? 'Atualize os dados do paciente' : 'Preencha os dados para cadastrar'}</p>
      </div>

      <div className="card">
        <div className="card-body">
          {erro && <div className="alert alert-error">{erro}</div>}
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label className="form-label">Nome Completo <span className="req">*</span></label>
              <input className="form-control" value={form.nome_completo} onChange={set('nome_completo')}
                placeholder="Nome completo do paciente" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Data de Nascimento <span className="req">*</span></label>
                <input className="form-control" type="date" value={form.data_nascimento}
                  onChange={set('data_nascimento')} required />
              </div>
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input className="form-control" value={form.cpf} onChange={set('cpf')}
                  placeholder="000.000.000-00" maxLength={14} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-control" value={form.telefone} onChange={set('telefone')}
                  placeholder="(11) 99999-9999" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email} onChange={set('email')}
                  placeholder="paciente@email.com" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Endereço</label>
              <input className="form-control" value={form.endereco} onChange={set('endereco')}
                placeholder="Rua, número, bairro, cidade..." />
            </div>

            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea className="form-control" value={form.observacoes} onChange={set('observacoes')}
                placeholder="Observações clínicas, alergias, informações relevantes..."
                rows={3} style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn btn-secondary"
                onClick={() => navigate(isEdicao ? `/pacientes/${id}` : '/pacientes')}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Salvando...</>
                  : <><Save size={15} /> {isEdicao ? 'Salvar Alterações' : 'Cadastrar Paciente'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
