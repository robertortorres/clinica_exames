import { useState, useEffect } from 'react'
import { Plus, X, Pencil, UserCheck, UserX } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const PERFIS = ['admin', 'enfermagem', 'atendimento']
const PERFIL_LABEL = { admin: 'Administrador', enfermagem: 'Enfermagem', atendimento: 'Atendimento' }
const BADGE = { admin: 'badge-admin', enfermagem: 'badge-enfermagem', atendimento: 'badge-atendimento' }

export default function Usuarios() {
  const { usuario: eu } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'atendimento' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const carregar = () => api.get('/api/usuarios').then(r => setUsuarios(r.data))
  useEffect(() => { carregar() }, [])

  const abrirModal = (u = null) => {
    setEditando(u)
    setForm(u ? { nome: u.nome, email: u.email, senha: '', perfil: u.perfil } : { nome: '', email: '', senha: '', perfil: 'atendimento' })
    setErro('')
    setModal(true)
  }

  const salvar = async (e) => {
    e.preventDefault(); setErro(''); setLoading(true)
    try {
      if (editando) {
        const dados = { nome: form.nome, perfil: form.perfil }
        if (form.senha) dados.senha = form.senha
        await api.put(`/api/usuarios/${editando.id}`, dados)
      } else {
        await api.post('/api/usuarios', form)
      }
      setModal(false); carregar()
    } catch (err) {
      const d = err.response?.data?.detail
      setErro(Array.isArray(d) ? d.map(x => x.msg).join(', ') : d || 'Erro ao salvar')
    } finally { setLoading(false) }
  }

  const toggleAtivo = async (u) => {
    if (u.id === eu.id) return
    await api.put(`/api/usuarios/${u.id}`, { ativo: u.ativo === 1 ? 0 : 1 })
    carregar()
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Usuários</h2>
          <p>Gerencie os acessos ao sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}><Plus size={16} /> Novo Usuário</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th><th>Email</th><th>Perfil</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td className="font-bold">{u.nome}</td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`badge ${BADGE[u.perfil]}`}>{PERFIL_LABEL[u.perfil]}</span></td>
                  <td>
                    <span className={`badge ${u.ativo ? 'badge-atendimento' : ''}`}
                      style={!u.ativo ? { background: '#f5f5f5', color: '#999' } : {}}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => abrirModal(u)}><Pencil size={14} /></button>
                      {u.id !== eu.id && (
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleAtivo(u)} title={u.ativo ? 'Desativar' : 'Ativar'}>
                          {u.ativo ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editando ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="modal-body">
                {erro && <div className="alert alert-error">{erro}</div>}
                <div className="form-group">
                  <label className="form-label">Nome <span className="req">*</span></label>
                  <input className="form-control" value={form.nome} required onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                </div>
                {!editando && (
                  <div className="form-group">
                    <label className="form-label">Email <span className="req">*</span></label>
                    <input className="form-control" type="email" value={form.email} required onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Senha {editando ? '(deixe em branco para manter)' : <span className="req">*</span>}</label>
                  <input className="form-control" type="password" value={form.senha} required={!editando}
                    onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">Perfil <span className="req">*</span></label>
                  <select className="form-control" value={form.perfil} onChange={e => setForm(f => ({ ...f, perfil: e.target.value }))}>
                    {PERFIS.map(p => <option key={p} value={p}>{PERFIL_LABEL[p]}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
