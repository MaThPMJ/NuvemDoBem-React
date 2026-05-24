import { useState, useEffect } from 'react'
import { getPatrocinadores } from '../../../services/patrocinadorService'
import type { Patrocinador } from '../../../types'

export default function PatrocinadoresTab() {
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    getPatrocinadores()
      .then(data => setPatrocinadores(data))
      .catch(() => setError('Não foi possível carregar os patrocinadores. Tente novamente mais tarde.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = patrocinadores.filter(p =>
    (p.nome ?? 'Anônimo').toLowerCase().includes(query.toLowerCase()),
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
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg px-3 py-2 mb-4">
          <i className="fa-solid fa-circle-exclamation" />
          {error}
        </div>
      )}

      <p className="text-sm text-[#475569] mb-4">
        <span className="font-semibold text-[#1E4E8C]">{patrocinadores.length}</span> patrocinador{patrocinadores.length !== 1 ? 'es' : ''} cadastrado{patrocinadores.length !== 1 ? 's' : ''}
      </p>

      <input
        type="search"
        placeholder="Buscar patrocinador por nome..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full max-w-sm border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C] mb-6"
      />

      {filtered.length === 0 ? (
        <p className="text-[#475569] text-sm">Nenhum patrocinador encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.idPatrocinador} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-[#0F172A]">{p.nome ?? 'Anônimo'}</p>
                {p.anonimo === 'S' && (
                  <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full shrink-0">
                    Anônimo
                  </span>
                )}
              </div>
              {p.email && (
                <p className="text-sm text-[#475569] flex items-center gap-1 break-all">
                  <i className="fa-solid fa-envelope text-xs" />
                  {p.email}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
