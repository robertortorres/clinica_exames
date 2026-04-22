import { useState, useEffect } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import api from '../services/api'

export default function TiposExame() {
  const [tipos, setTipos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nome: '', descricao: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const carregar = () => api.get('/api/tipos-exame').then(r => setTipos(r.data))
  useEffect(() => { carregar() }, [])

  const salvar = async (e) => {
    e.preventDefault(); setErro(''); setLoading(true)
    try {
      await api.post('/api/tipos-exame', form)
      setModal(false); setForm({ nome: '', descricao: '' }); carregar()
    } catch (err) {
      const d = err.response?.data?.detail
      setErro(Array.isArray(d) ? d.map(x => x.msg).join(', ') : d || 'Erro ao salvar')
    } finally { setLoading(false) }
  }

  const deletar = async (id) => {
    if (!confirm('Excluir este tipo de exame?')) return
    try { await api.delete(`/api/tipos-exame/${id}`); carregar() }
    catch (err) { alert(err.response?.data?.detail || 'Erro ao excluir') }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Tipos de Exame</h2>
          <p>Categorias disponíveis para classificar os exames</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setModal(true); setErro('') }}>
          <Plus size={16} /> Novo Tipo
        </button>
      </div>

      <div className="card">
        {tipos.length === 0 ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <p>Nenhum tipo de exame cadastrado</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal(true)}>
              <Plus size={15} /> Cadastrar primeiro tipo
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Nome</th><th>Descrição</th><th></th></tr>
              </thead>
              <tbody>
                {tipos.map(t => (
                  <tr key={t.id}>
                    <td className="font-bold">{t.nome}</td>
                    <td className="text-muted">{t.descricao || '—'}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deletar(t.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Novo Tipo de Exame</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="modal-body">
                {erro && <div className="alert alert-error">{erro}</div>}
                <div className="form-group">
                  <label className="form-label">Nome <span className="req">*</span></label>
                  <input className="form-control" value={form.nome} required placeholder="Ex: Hemograma, Raio-X, Ultrassom..."
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Descrição</label>
                  <textarea className="form-control" rows={2} value={form.descricao}
                    onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                    placeholder="Descrição opcional..." style={{ resize: 'vertical' }} />
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
