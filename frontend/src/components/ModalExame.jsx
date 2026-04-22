import { useState, useEffect, useRef } from 'react'
import { X, Upload, FileText, Image } from 'lucide-react'
import api from '../services/api'

export default function ModalExame({ pacienteId, onClose, onSalvo }) {
  const [tipos, setTipos] = useState([])
  const [form, setForm] = useState({ tipo_exame_id: '', data_realizacao: '', observacoes: '' })
  const [arquivo, setArquivo] = useState(null)
  const [drag, setDrag] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    api.get('/api/tipos-exame').then(r => setTipos(r.data))
  }, [])

  const handleFile = (file) => {
    if (!file) return
    const TIPOS_OK = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!TIPOS_OK.includes(file.type)) {
      setErro('Tipo inválido. Use PDF ou imagem (JPG, PNG, GIF, WEBP).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErro('Arquivo muito grande. Máximo 5MB.')
      return
    }
    setErro('')
    setArquivo(file)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!arquivo) { setErro('Selecione um arquivo.'); return }
    setErro(''); setLoading(true)
    try {
      const fd = new FormData()
      fd.append('tipo_exame_id', form.tipo_exame_id)
      fd.append('data_realizacao', form.data_realizacao)
      if (form.observacoes) fd.append('observacoes', form.observacoes)
      fd.append('arquivo', arquivo)

      await api.post(`/api/pacientes/${pacienteId}/exames`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onSalvo()
    } catch (err) {
      const detail = err.response?.data?.detail
      setErro(Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : detail || 'Erro ao salvar exame')
    } finally {
      setLoading(false)
    }
  }

  const isPDF = arquivo?.type === 'application/pdf'

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Adicionar Exame</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {erro && <div className="alert alert-error">{erro}</div>}

            <div className="form-group">
              <label className="form-label">Tipo de Exame <span className="req">*</span></label>
              <select className="form-control" value={form.tipo_exame_id} required
                onChange={e => setForm(f => ({ ...f, tipo_exame_id: e.target.value }))}>
                <option value="">Selecione o tipo...</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data de Realização <span className="req">*</span></label>
              <input type="date" className="form-control" value={form.data_realizacao} required
                onChange={e => setForm(f => ({ ...f, data_realizacao: e.target.value }))}
                style={{ maxWidth: 220 }} />
            </div>

            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea className="form-control" rows={2} value={form.observacoes}
                onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                placeholder="Observações opcionais..." style={{ resize: 'vertical' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Arquivo <span className="req">*</span></label>
              <div
                className={`upload-area ${drag ? 'drag' : ''}`}
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
              >
                {arquivo ? (
                  <>
                    {isPDF ? <FileText size={32} style={{ color: 'var(--primary)', marginBottom: 8 }} />
                      : <Image size={32} style={{ color: 'var(--primary)', marginBottom: 8 }} />}
                    <div className="upload-preview">{arquivo.name}</div>
                    <small>{(arquivo.size / 1024).toFixed(1)} KB · Clique para trocar</small>
                  </>
                ) : (
                  <>
                    <Upload size={32} />
                    <p>Arraste o arquivo aqui ou clique para selecionar</p>
                    <small>PDF ou imagem · Máximo 5MB</small>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" hidden
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                onChange={e => handleFile(e.target.files[0])} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Salvando...</> : 'Salvar Exame'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
