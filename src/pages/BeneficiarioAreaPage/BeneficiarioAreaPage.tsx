import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCasos } from '../../services/casoService'
import { getDiagnosticos } from '../../services/diagnosticoService'
import type { Caso, Diagnostico } from '../../types'

const mockCasos: Caso[] = [
  {
    idCaso: 1, dataAbertura: '2025-03-10T00:00:00', status: 'EM_ANDAMENTO',
    dentista: { idDentista: 1, nome: 'Dr. Carlos Andrade', especialidade: 'Ortodontia', email: 'carlos@demo.com' },
  },
  {
    idCaso: 2, dataAbertura: '2025-01-15T00:00:00', status: 'CONCLUIDO', dataFechamento: '2025-02-20T00:00:00',
    dentista: { idDentista: 2, nome: 'Dra. Fernanda Lima', especialidade: 'Endodontia', email: 'fernanda@demo.com' },
  },
]

const mockDiagnosticos: Diagnostico[] = [
  { idDiagnostico: 1, descricao: 'Cárie molar inferior direito', dataDiagnostico: '2025-03-12T00:00:00', procedimento: 'Restauração' },
  { idDiagnostico: 2, descricao: 'Avaliação ortodôntica inicial', dataDiagnostico: '2025-01-18T00:00:00', procedimento: 'Aparelho fixo' },
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

export default function BeneficiarioAreaPage() {
  const { user } = useAuth()
  const [casos, setCasos] = useState<Caso[]>([])
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCasos(), getDiagnosticos()])
      .then(([todosCasos, todosDiag]) => {
        const meusCasos = todosCasos.filter(c => c.beneficiario?.email === user?.email)
        const meusDiag = todosDiag.filter(d => d.beneficiario?.email === user?.email)
        if (meusCasos.length > 0) {
          setCasos(meusCasos)
          setDiagnosticos(meusDiag)
        } else {
          setCasos(mockCasos)
          setDiagnosticos(mockDiagnosticos)
          setIsDemo(true)
        }
      })
      .catch(() => { setCasos(mockCasos); setDiagnosticos(mockDiagnosticos); setIsDemo(true) })
      .finally(() => setLoading(false))
  }, [user?.email])

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Olá, {user?.nome}</h1>
        <p className="text-sm text-[#475569] mt-1">Seu histórico de atendimentos e diagnósticos.</p>
      </div>

      {isDemo && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-lg px-3 py-2 mb-5">
          <i className="fa-solid fa-triangle-exclamation" />
          Exibindo dados demonstrativos — nenhum histórico encontrado para o seu e-mail.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C]" />
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Casos */}
          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-3">Meus Casos</h2>
            {casos.length === 0 ? (
              <p className="text-sm text-[#475569]">Nenhum caso registrado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {casos.map(c => (
                  <div key={c.idCaso} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {statusLabel[c.status] ?? c.status}
                      </span>
                      <span className="text-xs text-[#475569]">{formatDate(c.dataAbertura)}</span>
                    </div>
                    {c.dentista && (
                      <p className="text-sm text-[#475569] flex items-center gap-1">
                        <i className="fa-solid fa-user-doctor text-xs text-[#1E4E8C]" />
                        {c.dentista.nome} — {c.dentista.especialidade}
                      </p>
                    )}
                    {c.dataFechamento && (
                      <p className="text-sm text-green-700 flex items-center gap-1">
                        <i className="fa-solid fa-circle-check text-xs" />
                        Concluído em {formatDate(c.dataFechamento)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Diagnósticos */}
          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-3">Diagnósticos</h2>
            {diagnosticos.length === 0 ? (
              <p className="text-sm text-[#475569]">Nenhum diagnóstico registrado.</p>
            ) : (
              <div className="grid gap-3">
                {diagnosticos.map(d => (
                  <div key={d.idDiagnostico} className="bg-white border border-[#E2E8F0] rounded-xl p-4 border-l-4 border-l-[#1E4E8C]">
                    <p className="font-medium text-[#0F172A]">{d.descricao}</p>
                    {d.procedimento && (
                      <p className="text-sm text-[#1E4E8C] font-medium mt-1">{d.procedimento}</p>
                    )}
                    <p className="text-xs text-[#475569] mt-1">{formatDate(d.dataDiagnostico)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
