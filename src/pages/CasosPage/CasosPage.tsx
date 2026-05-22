import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCasos, deleteCaso } from '../../services/casoService'
import { getDiagnosticos, deleteDiagnostico } from '../../services/diagnosticoService'
import { getPedidosEncaminhamento, createPedidoEncaminhamento, deletePedidoEncaminhamento } from '../../services/pedidoEncaminhamentoService'
import { getHistoricosStatus, deleteHistoricoStatus } from '../../services/historicoStatusService'
import { getDentistas } from '../../services/dentistaService'
import { useAuth } from '../../context/AuthContext'
import type { Caso, Diagnostico, PedidoEncaminhamento, Dentista, HistoricoStatus } from '../../types'

function formatDate(iso: string): string {
  const d = iso.split('T')[0].split('-')
  return `${d[2]}/${d[1]}/${d[0]}`
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    EM_ANDAMENTO: 'Em andamento',
    PENDENTE: 'Pendente',
    CONCLUIDO: 'Concluído',
    ACEITO: 'Aceito',
    RECUSADO: 'Recusado',
  }
  return map[s] ?? s
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
    PENDENTE: 'bg-yellow-100 text-yellow-700',
    CONCLUIDO: 'bg-green-100 text-green-700',
    ACEITO: 'bg-green-100 text-green-700',
    RECUSADO: 'bg-red-100 text-red-600',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {statusLabel(status)}
    </span>
  )
}

const STATUS_FILTERS = ['TODOS', 'EM_ANDAMENTO', 'PENDENTE', 'CONCLUIDO'] as const
const STATUS_FILTER_LABELS: Record<string, string> = {
  TODOS: 'Todos',
  EM_ANDAMENTO: 'Em andamento',
  PENDENTE: 'Pendente',
  CONCLUIDO: 'Concluído',
}

interface DetailState {
  diagnosticos: Diagnostico[]
  pedidos: PedidoEncaminhamento[]
  historicos: HistoricoStatus[]
  loading: boolean
}

export default function CasosPage() {
  const { user } = useAuth()
  const [casos, setCasos] = useState<Caso[]>([])
  const [dentistas, setDentistas] = useState<Dentista[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [selectedCaso, setSelectedCaso] = useState<Caso | null>(null)
  const [detail, setDetail] = useState<DetailState>({ diagnosticos: [], pedidos: [], historicos: [], loading: false })
  const [showEncModal, setShowEncModal] = useState(false)
  const [encLoading, setEncLoading] = useState(false)
  const [encError, setEncError] = useState('')
  const [encSuccess, setEncSuccess] = useState(false)
  const [selectedDentistaId, setSelectedDentistaId] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    Promise.all([getCasos(), getDentistas()])
      .then(([todos, dents]) => {
        if (user?.tipo === 'dentista') {
          setCasos(todos.filter(c => c.dentista?.email === user.email))
        } else {
          setCasos(todos)
        }
        setDentistas(dents)
      })
      .catch(() => setError('Não foi possível carregar os casos.'))
      .finally(() => setLoading(false))
  }, [user])

  function openCaso(caso: Caso) {
    setSelectedCaso(caso)
    setDetail({ diagnosticos: [], pedidos: [], historicos: [], loading: true })
    setEncSuccess(false)
    setSelectedDentistaId('')
    Promise.all([getDiagnosticos(), getPedidosEncaminhamento(), getHistoricosStatus()])
      .then(([d, p, h]) => {
        setDetail({
          diagnosticos: d.filter(x => x.caso?.idCaso === caso.idCaso),
          pedidos: p.filter(x => x.caso?.idCaso === caso.idCaso),
          historicos: h.filter(x => x.caso?.idCaso === caso.idCaso),
          loading: false,
        })
      })
      .catch(() => setDetail(s => ({ ...s, loading: false })))
  }

  async function handleEncaminhar() {
    if (!selectedCaso || !selectedDentistaId) return
    setEncLoading(true)
    setEncError('')
    try {
      const novo = await createPedidoEncaminhamento({
        caso: { idCaso: selectedCaso.idCaso },
        dentista: { idDentista: Number(selectedDentistaId) },
        integrante: { idIntegrante: user!.id },
        dataPedido: new Date().toISOString().split('T')[0],
        status: 'PENDENTE',
      })
      setDetail(s => ({ ...s, pedidos: [...s.pedidos, novo] }))
      setEncSuccess(true)
      setShowEncModal(false)
    } catch (err) {
      setEncError(err instanceof Error ? err.message : 'Erro ao encaminhar. Tente novamente.')
    } finally {
      setEncLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedCaso) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      // Excluir filhos antes do caso (FK constraints do Oracle)
      await Promise.all([
        ...detail.diagnosticos.map(d => deleteDiagnostico(d.idDiagnostico)),
        ...detail.pedidos.map(p => deletePedidoEncaminhamento(p.idPedido)),
        ...detail.historicos.map(h => deleteHistoricoStatus(h.idHistorico)),
      ])
      await deleteCaso(selectedCaso.idCaso)
      setCasos(prev => prev.filter(c => c.idCaso !== selectedCaso.idCaso))
      setSelectedCaso(null)
      setShowDeleteConfirm(false)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir caso.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const filtered = casos.filter(c => {
    const nome = c.beneficiario?.nome ?? ''
    const matchesQuery = nome.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'TODOS' || c.status === statusFilter
    return matchesQuery && matchesStatus
  })

  const counts = casos.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1
    return acc
  }, {})

  const isIntegrante = user?.tipo === 'integrante'
  const diagAtual = detail.diagnosticos[0]

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E4E8C]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <h1 className="text-xl font-bold text-[#0F172A]">Casos Clínicos</h1>
        {isIntegrante && (
          <Link
            to="/prontuario"
            className="bg-[#F29E1F] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#d98b0d] transition-colors no-underline"
          >
            + Abrir Caso
          </Link>
        )}
      </div>

      {/* Contadores rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', value: casos.length, color: 'text-[#0F172A]' },
          { label: 'Em andamento', value: counts['EM_ANDAMENTO'] ?? 0, color: 'text-blue-600' },
          { label: 'Pendentes', value: counts['PENDENTE'] ?? 0, color: 'text-yellow-600' },
          { label: 'Concluídos', value: counts['CONCLUIDO'] ?? 0, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-[#475569] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input
          type="search"
          placeholder="Buscar por paciente..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full max-w-xs border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C]"
        />
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-[#1E4E8C] text-white border-[#1E4E8C]'
                  : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#1E4E8C] hover:text-[#1E4E8C]'
              }`}
            >
              {STATUS_FILTER_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de casos */}
      {filtered.length === 0 ? (
        <p className="text-[#475569] text-sm">Nenhum caso encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(caso => (
            <button
              key={caso.idCaso}
              onClick={() => openCaso(caso)}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-2 text-left hover:border-[#1E4E8C] hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-[#0F172A]">{caso.beneficiario?.nome ?? '—'}</p>
                <StatusPill status={caso.status} />
              </div>
              {caso.dentista && (
                <p className="text-sm text-[#475569] flex items-center gap-1">
                  <i className="fa-solid fa-user-doctor text-xs" />
                  {caso.dentista.nome}
                </p>
              )}
              <p className="text-sm text-[#475569] flex items-center gap-1">
                <i className="fa-solid fa-calendar text-xs text-[#1E4E8C]" />
                Abertura: {formatDate(caso.dataAbertura)}
              </p>
              {caso.temDiagnostico && (
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 w-fit">
                  <i className="fa-solid fa-stethoscope mr-1" />Diagnóstico registrado
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Modal de detalhes do caso */}
      {selectedCaso && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) setSelectedCaso(null) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[580px] max-h-[85vh] overflow-y-auto">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between p-5 border-b border-[#E2E8F0]">
              <div className="grid gap-1">
                <h2 className="font-bold text-[#0F172A] text-lg leading-tight">
                  {selectedCaso.beneficiario?.nome ?? '—'}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusPill status={selectedCaso.status} />
                  <span className="text-xs text-[#475569]">Aberto em {formatDate(selectedCaso.dataAbertura)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCaso(null)}
                className="text-[#475569] hover:text-[#0F172A] cursor-pointer text-2xl leading-none ml-4 shrink-0"
              >
                ×
              </button>
            </div>

            <div className="p-5 grid gap-6">
              {detail.loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C]" />
                </div>
              ) : (
                <>
                  {/* Info do dentista responsável */}
                  {selectedCaso.dentista && (
                    <div className="flex items-center gap-3 bg-[#F7F9FC] rounded-xl px-4 py-3">
                      <i className="fa-solid fa-user-doctor text-[#1E4E8C] text-lg" />
                      <div>
                        <p className="text-xs font-semibold text-[#475569] uppercase tracking-wide">Dentista responsável</p>
                        <p className="text-sm font-semibold text-[#0F172A]">{selectedCaso.dentista.nome}</p>
                        <p className="text-xs text-[#475569]">{selectedCaso.dentista.especialidade}</p>
                      </div>
                    </div>
                  )}

                  {/* Diagnóstico */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#475569] mb-3">Diagnóstico</h3>
                    {detail.diagnosticos.length === 0 ? (
                      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                        <i className="fa-solid fa-triangle-exclamation text-yellow-600 text-sm" />
                        <p className="text-sm text-yellow-700">Nenhum diagnóstico registrado para este caso.</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {detail.diagnosticos.map(d => (
                          <div key={d.idDiagnostico} className="bg-[#F7F9FC] rounded-xl p-4 grid gap-2">
                            {d.procedimento && (
                              <span className="text-xs font-bold text-[#1E4E8C] bg-[#EAF2FF] rounded-full px-2 py-0.5 w-fit">
                                {d.procedimento}
                              </span>
                            )}
                            <p className="text-sm text-[#0F172A] leading-relaxed">{d.descricao}</p>
                            <p className="text-xs text-[#475569]">
                              <i className="fa-solid fa-calendar-day mr-1" />
                              {formatDate(d.dataDiagnostico)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Encaminhamentos */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#475569] mb-3">Encaminhamentos</h3>
                    {detail.pedidos.length === 0 ? (
                      <p className="text-sm text-[#475569]">Nenhum encaminhamento registrado.</p>
                    ) : (
                      <div className="grid gap-2">
                        {detail.pedidos.map(p => (
                          <div key={p.idPedido} className="flex items-center gap-3 bg-[#F7F9FC] rounded-lg px-3 py-2.5">
                            <i className="fa-solid fa-paper-plane text-[#1E4E8C] text-sm shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#0F172A] truncate">
                                {p.dentista?.nome ?? `Pedido #${p.idPedido}`}
                              </p>
                              {p.dentista?.especialidade && (
                                <p className="text-xs text-[#475569]">{p.dentista.especialidade}</p>
                              )}
                            </div>
                            <StatusPill status={p.status} />
                          </div>
                        ))}
                      </div>
                    )}
                    {encSuccess && (
                      <p className="text-sm text-green-700 font-medium mt-2 flex items-center gap-1">
                        <i className="fa-solid fa-circle-check" />
                        Encaminhamento enviado com sucesso!
                      </p>
                    )}
                  </div>

                  {/* Histórico de status */}
                  {detail.historicos.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#475569] mb-3">Histórico de Status</h3>
                      <div className="grid gap-2">
                        {detail.historicos
                          .slice()
                          .sort((a, b) => a.dataAlteracao.localeCompare(b.dataAlteracao))
                          .map(h => {
                            const anterior = h.stAnterior ?? h.status ?? null
                            const novo = h.stNovo ?? h.status ?? '—'
                            return (
                              <div key={h.idHistorico} className="flex items-center gap-3 bg-[#F7F9FC] rounded-lg px-3 py-2">
                                <i className="fa-solid fa-clock-rotate-left text-[#475569] text-xs shrink-0" />
                                <div className="flex-1 flex items-center gap-2 flex-wrap">
                                  {anterior ? (
                                    <>
                                      <StatusPill status={anterior} />
                                      <i className="fa-solid fa-arrow-right text-[#475569] text-xs" />
                                    </>
                                  ) : null}
                                  <StatusPill status={novo} />
                                </div>
                                <span className="text-xs text-[#475569] shrink-0">{formatDate(h.dataAlteracao)}</span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}

                  {/* Ações — só para integrantes */}
                  {isIntegrante && (
                    <div className="grid gap-2">
                      {selectedCaso.status !== 'CONCLUIDO' && selectedCaso.status !== 'CANCELADO' && (
                        <button
                          onClick={() => { setShowEncModal(true); setEncError('') }}
                          className="w-full bg-[#1E4E8C] text-white font-semibold py-2.5 rounded-lg hover:bg-[#163d70] transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-share-from-square" />
                          Encaminhar para dentista
                        </button>
                      )}
                      <button
                        onClick={() => { setShowDeleteConfirm(true); setDeleteError('') }}
                        className="w-full border border-red-200 text-red-600 font-semibold py-2.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-trash" />
                        Excluir caso
                      </button>
                      {deleteError && (
                        <p className="text-xs text-red-600 text-center">{deleteError}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de seleção de dentista para encaminhamento */}
      {showEncModal && selectedCaso && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-[420px] grid gap-4">
            <div>
              <h3 className="font-bold text-[#0F172A] text-base">Encaminhar Caso</h3>
              <p className="text-sm text-[#475569] mt-1">
                Paciente: <strong>{selectedCaso.beneficiario?.nome}</strong>
              </p>
              {diagAtual?.procedimento && (
                <p className="text-xs text-[#1E4E8C] font-medium mt-1">
                  Procedimento necessário: {diagAtual.procedimento}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">
                Selecione o dentista
              </label>
              <select
                value={selectedDentistaId}
                onChange={e => setSelectedDentistaId(e.target.value)}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C] bg-white"
              >
                <option value="">Selecione um dentista...</option>
                {dentistas.map(d => (
                  <option key={d.idDentista} value={d.idDentista}>
                    {d.nome} — {d.especialidade}
                  </option>
                ))}
              </select>
            </div>

            {encError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{encError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowEncModal(false); setEncError('') }}
                className="flex-1 border border-[#E2E8F0] text-[#475569] py-2 rounded-lg text-sm font-medium hover:bg-[#F7F9FC] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleEncaminhar}
                disabled={encLoading || !selectedDentistaId}
                className="flex-1 bg-[#1E4E8C] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#163d70] cursor-pointer disabled:opacity-60 transition-colors"
              >
                {encLoading ? 'Enviando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && selectedCaso && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-[380px] grid gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-trash text-red-600" />
              </span>
              <div>
                <h3 className="font-bold text-[#0F172A]">Excluir caso</h3>
                <p className="text-sm text-[#475569]">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-sm text-[#475569]">
              Tem certeza que deseja excluir o caso de{' '}
              <strong className="text-[#0F172A]">{selectedCaso.beneficiario?.nome ?? 'paciente sem nome'}</strong>?
            </p>
            {deleteError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteError('') }}
                disabled={deleteLoading}
                className="flex-1 border border-[#E2E8F0] text-[#475569] py-2 rounded-lg text-sm font-medium hover:bg-[#F7F9FC] cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 cursor-pointer disabled:opacity-60 transition-colors"
              >
                {deleteLoading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
