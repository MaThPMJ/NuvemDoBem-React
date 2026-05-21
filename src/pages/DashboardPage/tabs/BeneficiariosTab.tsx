import { useState, useEffect } from 'react'
import { getBeneficiarios } from '../../../services/beneficiarioService'
import type { Beneficiario } from '../../../types'

function formatDate(iso: string): string {
  const d = iso.split('T')[0].split('-')
  return `${d[2]}/${d[1]}/${d[0]}`
}

export default function BeneficiariosTab() {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    getBeneficiarios()
      .then(data => setBeneficiarios(data))
      .catch(() => setError('Não foi possível carregar os beneficiários. Tente novamente mais tarde.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = beneficiarios.filter(b =>
    b.nome.toLowerCase().includes(query.toLowerCase()),
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

      <div className="mb-4">
        <input
          type="search"
          placeholder="Buscar beneficiário por nome..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full max-w-sm border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C]"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-[#475569] text-sm">Nenhum beneficiário encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => (
            <div key={b.idBeneficiario} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-2">
              <p className="font-semibold text-[#0F172A]">{b.nome}</p>
              {b.endereco && (
                <p className="text-sm text-[#475569] flex items-center gap-1">
                  <i className="fa-solid fa-location-dot text-xs" />
                  {b.endereco}
                </p>
              )}
              <p className="text-sm text-[#475569] flex items-center gap-1">
                <i className="fa-solid fa-calendar-check text-xs text-[#1E4E8C]" />
                Cadastro: {formatDate(b.dataCadastro)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
