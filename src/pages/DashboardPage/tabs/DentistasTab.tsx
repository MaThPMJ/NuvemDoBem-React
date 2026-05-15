import { useState } from 'react'
import { dentistas, type Dentista } from '../../../mocks/dentistas'

function StatusBadge({ status }: { status: Dentista['status'] }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
        status === 'ativo'
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-600'
      }`}
    >
      {status === 'ativo' ? 'Ativo' : 'Inativo'}
    </span>
  )
}

export default function DentistasTab() {
  const [query, setQuery] = useState('')

  const filtered = dentistas.filter(d =>
    d.nome.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
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
          {filtered.map(dentista => (
            <div
              key={dentista.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-[#0F172A]">{dentista.nome}</p>
                <StatusBadge status={dentista.status} />
              </div>
              <p className="text-sm text-[#1E4E8C] font-medium">{dentista.especialidade}</p>
              <p className="text-sm text-[#475569] flex items-center gap-1">
                <i className="fa-solid fa-location-dot text-xs" />
                {dentista.cidade}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
