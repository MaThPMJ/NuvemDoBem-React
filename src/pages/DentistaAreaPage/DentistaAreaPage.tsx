import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getCasos } from '../../services/casoService'
import type { Caso } from '../../types'

const mockCasos: Caso[] = [
  { idCaso: 1, dataAbertura: '2025-03-10T00:00:00', status: 'EM_ANDAMENTO', beneficiario: { idBeneficiario: 1, nome: 'Ana Paula Santos', email: 'ana@demo.com', dataCadastro: '2025-03-01' } },
  { idCaso: 2, dataAbertura: '2025-04-02T00:00:00', status: 'PENDENTE', beneficiario: { idBeneficiario: 4, nome: 'Pedro Henrique Silva', email: 'pedro@demo.com', dataCadastro: '2025-03-20' } },
  { idCaso: 3, dataAbertura: '2025-04-20T00:00:00', status: 'CONCLUIDO', dataFechamento: '2025-05-01T00:00:00', beneficiario: { idBeneficiario: 2, nome: 'Lucas Oliveira', email: 'lucas@demo.com', dataCadastro: '2025-03-14' } },
]

const statusStyle: Record<string, string> = {
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
  PENDENTE: 'bg-yellow-100 text-yellow-700',
  CONCLUIDO: 'bg-green-100 text-green-700',
}

const statusLabel: Record<string, string> = {
  EM_ANDAMENTO: 'Em andamento',
  PENDENTE: 'Pendente',
  CONCLUIDO: 'Concluído',
}

function formatDate(iso: string) {
  const d = iso.split('T')[0].split('-')
  return `${d[2]}/${d[1]}/${d[0]}`
}

export default function DentistaAreaPage() {
  const { user } = useAuth()
  const [casos, setCasos] = useState<Caso[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCasos()
      .then(todos => {
        const meus = todos.filter(c => c.dentista?.email === user?.email)
        if (meus.length > 0) {
          setCasos(meus)
        } else {
          setCasos(mockCasos)
          setIsDemo(true)
        }
      })
      .catch(() => { setCasos(mockCasos); setIsDemo(true) })
      .finally(() => setLoading(false))
  }, [user?.email])

  const ativos = casos.filter(c => c.status === 'EM_ANDAMENTO').length
  const pendentes = casos.filter(c => c.status === 'PENDENTE').length

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Bem-vindo, {user?.nome}</h1>
        <p className="text-sm text-[#475569] mt-1">Aqui estão os casos sob sua responsabilidade.</p>
      </div>

      {isDemo && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-lg px-3 py-2 mb-5">
          <i className="fa-solid fa-triangle-exclamation" />
          Exibindo casos demonstrativos — nenhum caso encontrado para o seu e-mail na API.
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon="fa-solid fa-folder-open" label="Total de Casos" value={casos.length} color="blue" />
        <StatCard icon="fa-solid fa-clock" label="Em Andamento" value={ativos} color="yellow" />
        <StatCard icon="fa-solid fa-circle-check" label="Pendentes" value={pendentes} color="green" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[#0F172A]">Meus Casos</h2>
        <Link to="/casos" className="text-sm text-[#1E4E8C] font-medium hover:underline no-underline">
          Ver todos →
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C]" />
        </div>
      ) : casos.length === 0 ? (
        <p className="text-sm text-[#475569]">Nenhum caso encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {casos.map(c => (
            <div key={c.idCaso} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-[#0F172A]">{c.beneficiario?.nome ?? '—'}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusStyle[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {statusLabel[c.status] ?? c.status}
                </span>
              </div>
              <p className="text-sm text-[#475569] flex items-center gap-1">
                <i className="fa-solid fa-calendar text-xs text-[#1E4E8C]" />
                Abertura: {formatDate(c.dataAbertura)}
              </p>
              {c.dataFechamento && (
                <p className="text-sm text-[#475569] flex items-center gap-1">
                  <i className="fa-solid fa-calendar-check text-xs text-green-600" />
                  Fechamento: {formatDate(c.dataFechamento)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: 'blue' | 'yellow' | 'green' }) {
  const bg = { blue: 'bg-[#EAF2FF]', yellow: 'bg-yellow-50', green: 'bg-green-50' }
  const text = { blue: 'text-[#1E4E8C]', yellow: 'text-yellow-600', green: 'text-green-600' }
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg[color]} flex items-center justify-center shrink-0`}>
        <i className={`${icon} ${text[color]} text-xl`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
        <p className="text-sm text-[#475569]">{label}</p>
      </div>
    </div>
  )
}
