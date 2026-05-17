import { useState, useEffect } from 'react'
import { getDentistas } from '../../../services/dentistaService'
import { mockDentistas } from '../../../mocks/dentistas'
import type { Dentista } from '../../../types'

export default function DentistasTab() {
  const [dentistas, setDentistas] = useState<Dentista[]>([])
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    getDentistas()
      .then(data => { setDentistas(data); setIsOffline(false) })
      .catch(() => { setDentistas(mockDentistas); setIsOffline(true) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = dentistas.filter(d =>
    d.nome.toLowerCase().includes(query.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C]" />
      </div>
    )
  }

  return (
    <div>
      {isOffline && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-lg px-3 py-2 mb-4">
          <i className="fa-solid fa-triangle-exclamation" />
          API indisponível — exibindo dados demonstrativos
        </div>
      )}

      <p className="text-sm text-[#475569] mb-4">
        <span className="font-semibold text-[#1E4E8C]">{dentistas.length}</span> dentista{dentistas.length !== 1 ? 's' : ''} cadastrado{dentistas.length !== 1 ? 's' : ''}
      </p>

      <input
        type="search"
        placeholder="Buscar dentista por nome..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full max-w-sm border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C] mb-6"
      />

      {filtered.length === 0 ? (
        <p className="text-[#475569] text-sm">Nenhum dentista encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => (
            <div key={d.idDentista} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-2">
              <p className="font-semibold text-[#0F172A]">{d.nome}</p>
              <p className="text-sm text-[#1E4E8C] font-medium">{d.especialidade}</p>
              {d.cro && (
                <p className="text-sm text-[#475569] flex items-center gap-1">
                  <i className="fa-solid fa-id-card text-xs" />
                  {d.cro}
                </p>
              )}
              <p className="text-sm text-[#475569] flex items-center gap-1 break-all">
                <i className="fa-solid fa-envelope text-xs" />
                {d.email}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
