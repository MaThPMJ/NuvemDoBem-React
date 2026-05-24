import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCasos } from '../../services/casoService'
import { getDiagnosticos } from '../../services/diagnosticoService'
import type { Caso, Diagnostico } from '../../types'

const STATUS_LABEL: Record<string, string> = {
  EM_ANDAMENTO: 'Em andamento',
  PENDENTE: 'Aguardando',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
}

const STATUS_STYLE: Record<string, string> = {
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
  PENDENTE: 'bg-yellow-100 text-yellow-700',
  CONCLUIDO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-gray-100 text-gray-500',
}

const STATUS_ICON: Record<string, string> = {
  EM_ANDAMENTO: 'fa-clock',
  PENDENTE: 'fa-hourglass-half',
  CONCLUIDO: 'fa-circle-check',
  CANCELADO: 'fa-ban',
}

function formatDate(iso: string) {
  const d = iso.split('T')[0].split('-')
  return `${d[2]}/${d[1]}/${d[0]}`
}

function initials(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const FILTERS = ['TODOS', 'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'] as const
const FILTER_LABELS: Record<string, string> = {
  TODOS: 'Todos',
  PENDENTE: 'Aguardando',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluídos',
}

export default function BeneficiarioAreaPage() {
  const { user } = useAuth()
  const [casos, setCasos] = useState<Caso[]>([])
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('TODOS')
  const [expandido, setExpandido] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([getCasos(), getDiagnosticos()])
      .then(([todosCasos, todosDiag]) => {
        const meusCasos = todosCasos
          .filter(c => c.beneficiario?.email === user?.email)
          .sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura))
        const meusDiag = todosDiag.filter(d => d.beneficiario?.email === user?.email || meusCasos.some(c => c.idCaso === d.caso?.idCaso))
        setCasos(meusCasos)
        setDiagnosticos(meusDiag)
      })
      .catch(() => setError('Não foi possível carregar seus dados. Tente novamente.'))
      .finally(() => setLoading(false))
  }, [user?.email])

  function diagsDoCaso(idCaso: number) {
    return diagnosticos.filter(d => d.caso?.idCaso === idCaso)
  }

  const filtrados = filtro === 'TODOS' ? casos : casos.filter(c => c.status === filtro)
  const concluidos = casos.filter(c => c.status === 'CONCLUIDO').length
  const ativos = casos.filter(c => c.status === 'EM_ANDAMENTO').length
  const procedimentosFeitos = diagnosticos.filter(d => casos.some(c => c.idCaso === d.caso?.idCaso && c.status === 'CONCLUIDO')).length

  return (
    <div className="max-w-[780px] mx-auto px-4 py-6">

      {/* Banner de boas-vindas */}
      <div className="bg-gradient-to-r from-[#0F4C81] to-[#1E4E8C] rounded-2xl px-6 py-6 mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-32 opacity-10">
          <i className="fa-solid fa-tooth text-white" style={{ fontSize: '9rem', position: 'absolute', right: '-1rem', top: '-1rem' }} />
        </div>
        <p className="text-blue-200 text-sm mb-1">Olá,</p>
        <h1 className="text-white text-2xl font-bold">{user?.nome}</h1>
        <p className="text-blue-200 text-sm mt-2">
          Aqui você acompanha todos os seus atendimentos odontológicos.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>
      )}

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-4 text-center">
          <p className="text-2xl font-bold text-[#1E4E8C]">{loading ? '—' : casos.length}</p>
          <p className="text-xs text-[#475569] mt-0.5">Atendimentos</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{loading ? '—' : ativos}</p>
          <p className="text-xs text-[#475569] mt-0.5">Em andamento</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-4 text-center">
          <p className="text-2xl font-bold text-green-600">{loading ? '—' : concluidos}</p>
          <p className="text-xs text-[#475569] mt-0.5">Concluídos</p>
        </div>
      </div>

      {/* Procedimentos realizados (destaque) */}
      {!loading && procedimentosFeitos > 0 && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
          <i className="fa-solid fa-stethoscope text-emerald-600 text-lg shrink-0" />
          <p className="text-sm text-emerald-700">
            Você realizou <strong>{procedimentosFeitos} procedimento{procedimentosFeitos > 1 ? 's' : ''}</strong> com sucesso pela Nuvem do Bem.
          </p>
        </div>
      )}

      {/* Histórico */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#0F172A]">Meu Histórico</h2>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap mb-5">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                filtro === f
                  ? 'bg-[#1E4E8C] text-white border-[#1E4E8C]'
                  : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#1E4E8C] hover:text-[#1E4E8C]'
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C]" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#E2E8F0] rounded-2xl">
            <i className="fa-solid fa-folder-open text-3xl text-[#CBD5E1] mb-3 block" />
            <p className="text-sm text-[#475569]">
              {filtro === 'TODOS' ? 'Nenhum atendimento registrado ainda.' : `Nenhum atendimento "${FILTER_LABELS[filtro]}".`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtrados.map(caso => {
              const diags = diagsDoCaso(caso.idCaso)
              const aberto = expandido === caso.idCaso

              return (
                <div
                  key={caso.idCaso}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                    aberto ? 'border-[#1E4E8C] shadow-sm' : 'border-[#E2E8F0]'
                  }`}
                >
                  {/* Cabeçalho do card */}
                  <button
                    className="w-full text-left px-5 py-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => setExpandido(aberto ? null : caso.idCaso)}
                  >
                    {/* Ícone de status */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${STATUS_STYLE[caso.status] ?? 'bg-gray-100'}`}>
                      <i className={`fa-solid ${STATUS_ICON[caso.status] ?? 'fa-circle'} text-sm`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[caso.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABEL[caso.status] ?? caso.status}
                        </span>
                        {diags.length > 0 && diags[0].procedimento && (
                          <span className="text-xs font-semibold text-[#1E4E8C] bg-[#EAF2FF] px-2 py-0.5 rounded-full">
                            {diags[0].procedimento}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#475569] mt-1">
                        <i className="fa-solid fa-calendar text-[10px] mr-1 text-[#1E4E8C]" />
                        Aberto em {formatDate(caso.dataAbertura)}
                        {caso.dataFechamento && ` · Concluído em ${formatDate(caso.dataFechamento)}`}
                      </p>
                    </div>

                    <i className={`fa-solid fa-chevron-down text-[#CBD5E1] text-xs transition-transform shrink-0 ${aberto ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Conteúdo expandido */}
                  {aberto && (
                    <div className="px-5 pb-5 border-t border-[#F1F5F9] pt-4 grid gap-4">

                      {/* Dentista */}
                      {caso.dentista ? (
                        <div className="flex items-center gap-3 bg-[#F7F9FC] rounded-xl px-4 py-3">
                          <div className="w-9 h-9 rounded-full bg-[#1E4E8C] flex items-center justify-center shrink-0 text-white text-xs font-bold">
                            {initials(caso.dentista.nome)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">{caso.dentista.nome}</p>
                            <p className="text-xs text-[#475569]">{caso.dentista.especialidade}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
                          <i className="fa-solid fa-hourglass-half text-yellow-600 text-sm" />
                          <p className="text-sm text-yellow-700">Aguardando atribuição de dentista.</p>
                        </div>
                      )}

                      {/* Procedimentos e diagnósticos */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#475569] mb-2">
                          Procedimento{diags.length !== 1 ? 's' : ''}
                        </p>
                        {diags.length === 0 ? (
                          <div className="flex items-center gap-2 bg-[#F7F9FC] rounded-xl px-4 py-3">
                            <i className="fa-solid fa-clock text-[#94A3B8] text-sm" />
                            <p className="text-sm text-[#475569]">Nenhum procedimento registrado ainda.</p>
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {diags.map(d => (
                              <div key={d.idDiagnostico} className="rounded-xl border border-[#E2E8F0] overflow-hidden">
                                {d.procedimento && (
                                  <div className="bg-[#EAF2FF] px-4 py-2 flex items-center gap-2">
                                    <i className="fa-solid fa-tooth text-[#1E4E8C] text-sm" />
                                    <span className="text-sm font-bold text-[#1E4E8C]">{d.procedimento}</span>
                                  </div>
                                )}
                                <div className="px-4 py-3">
                                  <p className="text-sm text-[#0F172A] leading-relaxed">{d.descricao}</p>
                                  <p className="text-xs text-[#475569] mt-2">
                                    <i className="fa-solid fa-calendar-day mr-1" />
                                    {formatDate(d.dataDiagnostico)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Rodapé informativo */}
      {!loading && casos.length > 0 && (
        <div className="mt-8 flex items-start gap-3 bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl px-4 py-4">
          <i className="fa-solid fa-heart text-[#F29E1F] mt-0.5 shrink-0" />
          <p className="text-sm text-[#475569]">
            Todos os seus atendimentos são realizados por dentistas voluntários da <strong>Nuvem do Bem</strong>, gratuitamente.
          </p>
        </div>
      )}
    </div>
  )
}
