import { useState } from 'react'
import { patrocinadores } from '../../../mocks/patrocinadores'

export default function PatrocinadoresTab() {
  const [query, setQuery] = useState('')

  const filtered = patrocinadores.filter(p =>
    p.nome.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
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
          {filtered.map(patrocinador => (
            <div
              key={patrocinador.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-2"
            >
              <p className="font-semibold text-[#0F172A]">{patrocinador.nome}</p>
              <p className="text-sm text-[#1E4E8C] font-medium flex items-center gap-1">
                <i className="fa-solid fa-building text-xs" />
                {patrocinador.empresa}
              </p>
              <p className="text-sm text-[#475569] flex items-center gap-1">
                <i className="fa-solid fa-handshake text-xs" />
                {patrocinador.tipoApoio}
              </p>
              <p className="text-sm text-[#475569] flex items-center gap-1 break-all">
                <i className="fa-solid fa-envelope text-xs" />
                {patrocinador.contato}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
