import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDoacoes } from '../../services/doacaoService'
import type { Doacao } from '../../types'

function formatDate(iso: string) {
  const d = iso.split('T')[0].split('-')
  return `${d[2]}/${d[1]}/${d[0]}`
}

function tipoLabel(tipo: string) {
  return tipo === 'MONETARIO' ? 'Monetário' : 'Equipamento'
}

export default function PatrocinadorAreaPage() {
  const { user } = useAuth()
  const [doacoes, setDoacoes] = useState<Doacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDoacoes()
      .then(todas => setDoacoes(todas.filter(d => d.patrocinador?.email === user?.email)))
      .catch(() => setError('Não foi possível carregar suas doações. Tente novamente mais tarde.'))
      .finally(() => setLoading(false))
  }, [user?.email])

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

      <h2 className="text-base font-semibold text-[#0F172A] mb-3">Histórico de Doações</h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C]" />
        </div>
      ) : doacoes.length === 0 ? (
        <p className="text-sm text-[#475569]">Nenhuma doação registrada.</p>
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
                      ? `R$ ${(d.valor ?? 0).toLocaleString('pt-BR')}`
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
