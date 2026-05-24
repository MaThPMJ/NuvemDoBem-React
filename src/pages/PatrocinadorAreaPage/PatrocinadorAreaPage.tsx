import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDoacoes, createDoacao } from '../../services/doacaoService'
import { getPatrocinadores } from '../../services/patrocinadorService'
import type { Doacao } from '../../types'

function formatDate(iso: string) {
  const d = iso.split('T')[0].split('-')
  return `${d[2]}/${d[1]}/${d[0]}`
}

function tipoLabel(tipo: string) {
  return tipo === 'MONETARIO' ? 'Monetário' : 'Equipamento'
}

const inputClass = 'w-full border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C] bg-white'

export default function PatrocinadorAreaPage() {
  const { user } = useAuth()
  const [doacoes, setDoacoes] = useState<Doacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [patrocinadorId, setPatrocinadorId] = useState<number | null>(null)

  // Formulário de nova doação
  const [showForm, setShowForm] = useState(false)
  const [tipo, setTipo] = useState<'MONETARIO' | 'EQUIPAMENTO'>('MONETARIO')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [descricao, setDescricao] = useState('')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const valorRef = useRef('')

  useEffect(() => {
    Promise.allSettled([getDoacoes(), getPatrocinadores()])
      .then(([dr, pr]) => {
        if (dr.status === 'fulfilled') {
          setDoacoes(dr.value.filter(d => d.patrocinador?.email === user?.email))
        } else {
          setError('Não foi possível carregar suas doações. Tente novamente mais tarde.')
        }
        if (pr.status === 'fulfilled') {
          const found = pr.value.find(p => p.email === user?.email)
          if (found) setPatrocinadorId(found.idPatrocinador)
        }
      })
      .finally(() => setLoading(false))
  }, [user?.email])

  function resetForm() {
    setTipo('MONETARIO')
    setData(new Date().toISOString().split('T')[0])
    setDescricao('')
    valorRef.current = ''
    setFormError('')
    setFormSuccess(false)
    const el = document.getElementById('doac-valor') as HTMLInputElement | null
    if (el) el.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormSuccess(false)

    if (!patrocinadorId) {
      setFormError('Não foi possível identificar seu cadastro de patrocinador.')
      return
    }
    if (tipo === 'MONETARIO') {
      const raw = parseFloat(valorRef.current.replace(',', '.'))
      if (!valorRef.current || isNaN(raw) || raw <= 0) {
        setFormError('Informe um valor monetário válido.')
        return
      }
    }
    if (tipo === 'EQUIPAMENTO' && !descricao.trim()) {
      setFormError('Descreva o equipamento doado.')
      return
    }
    if (!data) {
      setFormError('Informe a data da doação.')
      return
    }

    setFormLoading(true)
    try {
      const raw = parseFloat(valorRef.current.replace(',', '.'))
      const nova = await createDoacao({
        idDoacao: 0,
        tipo,
        valor: tipo === 'MONETARIO' ? raw : null,
        descricaoEquipamento: tipo === 'EQUIPAMENTO' ? descricao.trim() : null,
        dataDoacao: data,
        patrocinador: { idPatrocinador: patrocinadorId, nome: user?.nome ?? null, email: user?.email ?? null, anonimo: 'N' },
      })
      setDoacoes(prev => [nova, ...prev])
      setFormSuccess(true)
      resetForm()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao registrar doação.')
    } finally {
      setFormLoading(false)
    }
  }

  const totalMonetario = doacoes
    .filter(d => d.tipo === 'MONETARIO' && d.valor !== null)
    .reduce((acc, d) => acc + (d.valor ?? 0), 0)

  const totalEquipamentos = doacoes.filter(d => d.tipo !== 'MONETARIO').length

  return (
    <div className="max-w-[780px] mx-auto px-4 py-6">

      {/* Banner de boas-vindas */}
      <div className="bg-gradient-to-r from-[#0F4C81] to-[#1E4E8C] rounded-2xl px-6 py-6 mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-32 opacity-10">
          <i className="fa-solid fa-hand-holding-heart text-white" style={{ fontSize: '9rem', position: 'absolute', right: '-1rem', top: '-1rem' }} />
        </div>
        <p className="text-blue-200 text-sm mb-1">Olá,</p>
        <h1 className="text-white text-2xl font-bold">{user?.nome}</h1>
        <p className="text-blue-200 text-sm mt-2">
          Obrigado pelo seu apoio à <strong className="text-white">Nuvem do Bem</strong>. Veja aqui o impacto das suas doações.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg px-3 py-2 mb-5">
          <i className="fa-solid fa-circle-exclamation" />
          {error}
        </div>
      )}

      {/* Resumo de impacto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
            <i className="fa-solid fa-hand-holding-heart text-[#1E4E8C] text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0F172A]">{doacoes.length}</p>
            <p className="text-sm text-[#475569]">Doações realizadas</p>
          </div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-money-bill-wave text-green-600 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0F172A]">
              R$ {totalMonetario.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-[#475569]">Total monetário</p>
          </div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-box text-purple-600 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0F172A]">{totalEquipamentos}</p>
            <p className="text-sm text-[#475569]">Doações em equipamentos</p>
          </div>
        </div>
      </div>

      {/* Botão registrar doação */}
      <button
        onClick={() => { setShowForm(v => !v); setFormError(''); setFormSuccess(false) }}
        className="w-full mb-6 flex items-center justify-center gap-2 bg-[#1E4E8C] hover:bg-[#163d70] text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer text-sm"
      >
        <i className={`fa-solid ${showForm ? 'fa-chevron-up' : 'fa-plus'}`} />
        {showForm ? 'Fechar formulário' : 'Registrar Nova Doação'}
      </button>

      {/* Formulário de nova doação */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-6 grid gap-5">
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">Nova Doação</h2>

          {/* Tipo */}
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wide">Tipo de doação</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setTipo('MONETARIO'); setFormError('') }}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all cursor-pointer ${
                  tipo === 'MONETARIO'
                    ? 'border-green-500 bg-green-50'
                    : 'border-[#E2E8F0] bg-white hover:border-green-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tipo === 'MONETARIO' ? 'bg-green-500' : 'bg-[#F1F5F9]'}`}>
                  <i className={`fa-solid fa-money-bill-wave text-sm ${tipo === 'MONETARIO' ? 'text-white' : 'text-[#94A3B8]'}`} />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-semibold ${tipo === 'MONETARIO' ? 'text-green-700' : 'text-[#64748B]'}`}>Monetário</p>
                  <p className="text-xs text-[#94A3B8]">Valor em R$</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setTipo('EQUIPAMENTO'); setFormError('') }}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all cursor-pointer ${
                  tipo === 'EQUIPAMENTO'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-[#E2E8F0] bg-white hover:border-purple-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tipo === 'EQUIPAMENTO' ? 'bg-purple-500' : 'bg-[#F1F5F9]'}`}>
                  <i className={`fa-solid fa-box text-sm ${tipo === 'EQUIPAMENTO' ? 'text-white' : 'text-[#94A3B8]'}`} />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-semibold ${tipo === 'EQUIPAMENTO' ? 'text-purple-700' : 'text-[#64748B]'}`}>Equipamento</p>
                  <p className="text-xs text-[#94A3B8]">Material/aparelho</p>
                </div>
              </button>
            </div>
          </div>

          {/* Campo específico por tipo */}
          {tipo === 'MONETARIO' ? (
            <div className="grid gap-1.5">
              <label htmlFor="doac-valor" className="text-xs font-semibold text-[#475569] uppercase tracking-wide">
                Valor (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#475569] font-medium">R$</span>
                <input
                  id="doac-valor"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  className={`${inputClass} pl-9`}
                  onChange={e => {
                    let v = e.target.value.replace(/[^0-9,\.]/g, '')
                    e.target.value = v
                    valorRef.current = v
                    if (formError) setFormError('')
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-1.5">
              <label htmlFor="doac-desc" className="text-xs font-semibold text-[#475569] uppercase tracking-wide">
                Descrição do Equipamento
              </label>
              <textarea
                id="doac-desc"
                rows={3}
                placeholder="Ex: Cadeira odontológica, kit de instrumentos, raio-X portátil..."
                value={descricao}
                onChange={e => { setDescricao(e.target.value); if (formError) setFormError('') }}
                className={`${inputClass} resize-none`}
              />
            </div>
          )}

          {/* Data */}
          <div className="grid gap-1.5">
            <label htmlFor="doac-data" className="text-xs font-semibold text-[#475569] uppercase tracking-wide">
              Data da Doação
            </label>
            <input
              id="doac-data"
              type="date"
              value={data}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => { setData(e.target.value); if (formError) setFormError('') }}
              className={inputClass}
            />
          </div>

          {formError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg px-3 py-2">
              <i className="fa-solid fa-circle-exclamation" />
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-lg px-3 py-2">
              <i className="fa-solid fa-circle-check" />
              Doação registrada com sucesso!
            </div>
          )}

          <button
            type="submit"
            disabled={formLoading}
            className="w-full bg-[#1E4E8C] hover:bg-[#163d70] text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-60 text-sm"
          >
            {formLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Registrando...
              </span>
            ) : (
              <span>
                <i className="fa-solid fa-check mr-2" />
                Confirmar Doação
              </span>
            )}
          </button>
        </form>
      )}

      {/* Histórico */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-[#0F172A]">Histórico de Doações</h2>
        {doacoes.length > 0 && (
          <span className="text-xs bg-[#EAF2FF] text-[#1E4E8C] font-bold px-2 py-0.5 rounded-full">
            {doacoes.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C]" />
        </div>
      ) : doacoes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl py-10">
          <i className="fa-solid fa-hand-holding-heart text-[#CBD5E1] text-3xl" />
          <p className="text-sm text-[#475569]">Nenhuma doação registrada ainda.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-[#1E4E8C] font-semibold hover:underline cursor-pointer"
          >
            Fazer minha primeira doação →
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          {doacoes.map((d, i) => (
            <div
              key={d.idDoacao}
              className={`flex items-center justify-between px-5 py-4 gap-4 ${i < doacoes.length - 1 ? 'border-b border-[#E2E8F0]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  d.tipo === 'MONETARIO' ? 'bg-green-50' : 'bg-purple-50'
                }`}>
                  <i className={`text-sm ${d.tipo === 'MONETARIO' ? 'fa-solid fa-dollar-sign text-green-600' : 'fa-solid fa-box text-purple-600'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    {d.tipo === 'MONETARIO'
                      ? `R$ ${(d.valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : d.descricaoEquipamento ?? 'Equipamento'}
                  </p>
                  <p className="text-xs text-[#475569]">{tipoLabel(d.tipo)}</p>
                </div>
              </div>
              <span className="text-xs text-[#475569] shrink-0">{formatDate(d.dataDoacao)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
