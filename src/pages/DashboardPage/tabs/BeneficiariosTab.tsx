import { useState } from 'react'
import { beneficiarios } from '../../../mocks/beneficiarios'

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export default function BeneficiariosTab() {
  const [query, setQuery] = useState('')

  const filtered = beneficiarios.filter(b =>
    b.nome.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <input
        type="search"
        placeholder="Buscar beneficiário por nome..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full max-w-sm border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C] mb-6"
      />

      {filtered.length === 0 ? (
        <p className="text-[#475569] text-sm">Nenhum beneficiário encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(beneficiario => (
            <div
              key={beneficiario.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-2"
            >
              <p className="font-semibold text-[#0F172A]">{beneficiario.nome}</p>
              <div className="flex gap-4 text-sm text-[#475569]">
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-cake-candles text-xs" />
                  {beneficiario.idade} anos
                </span>
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-location-dot text-xs" />
                  {beneficiario.cidade}
                </span>
              </div>
              <p className="text-sm text-[#475569] flex items-center gap-1">
                <i className="fa-solid fa-calendar-check text-xs text-[#1E4E8C]" />
                Atendimento: {formatDate(beneficiario.dataAtendimento)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
