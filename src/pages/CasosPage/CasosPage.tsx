import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCasos } from '../../services/casoService'
import { getHistoricosStatus } from '../../services/historicoStatusService'
import { getDiagnosticos } from '../../services/diagnosticoService'
import { getPedidosEncaminhamento, createPedidoEncaminhamento } from '../../services/pedidoEncaminhamentoService'
import { useAuth } from '../../context/AuthContext'
import type { Caso, HistoricoStatus, Diagnostico, PedidoEncaminhamento } from '../../types'

function formatDate(iso: string): string {
  const d = iso.split('T')[0].split('-')
  return `${d[2]}/${d[1]}/${d[0]}`
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    EM_ANDAMENTO: 'Em andamento',
    PENDENTE: 'Pendente',
    CONCLUIDO: 'Concluído',
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

interface DetailState {
  historicos: HistoricoStatus[]
  diagnosticos: Diagnostico[]
  pedidos: PedidoEncaminhamento[]
  loading: boolean
}

export default function CasosPage() {
  const { user } = useAuth()
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selectedCaso, setSelectedCaso] = useState<Caso | null>(null)
  const [detail, setDetail] = useState<DetailState>({ historicos: [], diagnosticos: [], pedidos: [], loading: false })
  const [showEncModal, setShowEncModal] = useState(false)
  const [encLoading, setEncLoading] = useState(false)
  const [encSuccess, setEncSuccess] = useState(false)

  useEffect(() => {
    getCasos()
      .then(todos => {
        // Dentista só vê os casos atribuídos a ele
        if (user?.tipo === 'dentista') {
          setCasos(todos.filter(c => c.dentista?.email === user.email))
        } else {
          setCasos(todos)
        }
      })
      .catch(() => setError('Não foi possível carregar os casos.'))
      .finally(() => setLoading(false))
  }, [user])

  function openCaso(caso: Caso) {
    setSelectedCaso(caso)
    setDetail({ historicos: [], diagnosticos: [], pedidos: [], loading: true })
    setEncSuccess(false)
    Promise.all([getHistoricosStatus(), getDiagnosticos(), getPedidosEncaminhamento()])
      .then(([h, d, p]) => {
        setDetail({
          historicos: h.filter(x => x.caso?.idCaso === caso.idCaso),
          diagnosticos: d.filter(x => x.caso?.idCaso === caso.idCaso),
          pedidos: p.filter(x => x.caso?.idCaso === caso.idCaso),
          loading: false,
        })
      })
      .catch(() => setDetail(s => ({ ...s, loading: false })))
  }

  async function handleEncaminhar() {
    if (!selectedCaso) return
    setEncLoading(true)
    try {
      const novo = await createPedidoEncaminhamento({ caso: { idCaso: selectedCaso.idCaso } })
      setDetail(s => ({ ...s, pedidos: [...s.pedidos, novo] }))
      setEncSuccess(true)
    } catch {
      // silently fail
    } finally {
      setEncLoading(false)
      setShowEncModal(false)
    }
  }

  const filtered = casos.filter(c => {
    const nome = c.beneficiario?.nome ?? ''
    const status = c.status ?? ''
    return (
      nome.toLowerCase().includes(query.toLowerCase()) ||
      status.toLowerCase().includes(query.toLowerCase())
    )
  })

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
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Casos Clínicos</h1>
        <Link
          to="/prontuario"
          className="bg-[#F29E1F] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#d98b0d] transition-colors no-underline"
        >
          + Novo Prontuário
        </Link>
      </div>

      <input
        type="search"
        placeholder="Buscar por beneficiário ou status..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full max-w-sm border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C] mb-6"
      />

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
              {caso.dataFechamento && (
                <p className="text-sm text-[#475569] flex items-center gap-1">
                  <i className="fa-solid fa-calendar-check text-xs text-green-600" />
                  Fechamento: {formatDate(caso.dataFechamento)}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Modal de detalhes */}
      {selectedCaso && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) setSelectedCaso(null) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[560px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
              <div>
                <h2 className="font-bold text-[#0F172A]">{selectedCaso.beneficiario?.nome ?? '—'}</h2>
                <StatusPill status={selectedCaso.status} />
              </div>
              <button onClick={() => setSelectedCaso(null)} className="text-[#475569] hover:text-[#0F172A] cursor-pointer text-2xl leading-none">×</button>
            </div>

            <div className="p-5 grid gap-5">
              {detail.loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C]" />
                </div>
              ) : (
                <>
                  <Section title="Diagnósticos">
                    {detail.diagnosticos.length === 0
                      ? <p className="text-sm text-[#475569]">Nenhum diagnóstico registrado.</p>
                      : detail.diagnosticos.map(d => (
                        <div key={d.idDiagnostico} className="border-l-2 border-[#1E4E8C] pl-3 py-1">
                          <p className="text-sm text-[#0F172A]">{d.descricao}</p>
                          {d.procedimento && <p className="text-xs text-[#1E4E8C] font-medium mt-0.5">{d.procedimento}</p>}
                          <p className="text-xs text-[#475569] mt-0.5">{formatDate(d.dataDiagnostico)}</p>
                        </div>
                      ))}
                  </Section>

                  <Section title="Histórico de Status">
                    {detail.historicos.length === 0
                      ? <p className="text-sm text-[#475569]">Nenhum histórico registrado.</p>
                      : detail.historicos.map(h => (
                        <div key={h.idHistorico} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#1E4E8C] shrink-0" />
                          <StatusPill status={h.status} />
                          <span className="text-xs text-[#475569]">{formatDate(h.dataAlteracao)}</span>
                        </div>
                      ))}
                  </Section>

                  <Section title="Encaminhamentos">
                    {detail.pedidos.length === 0
                      ? <p className="text-sm text-[#475569]">Nenhum encaminhamento registrado.</p>
                      : detail.pedidos.map(p => (
                        <div key={p.idPedido} className="flex items-center gap-2">
                          <StatusPill status={p.status} />
                          <span className="text-xs text-[#475569]">{p.dentista?.nome ?? `Pedido #${p.idPedido}`}</span>
                        </div>
                      ))}
                    {encSuccess && (
                      <p className="text-sm text-green-700 font-medium mt-1">Encaminhamento criado com sucesso!</p>
                    )}
                  </Section>

                  <button
                    onClick={() => setShowEncModal(true)}
                    className="w-full bg-[#1E4E8C] text-white font-semibold py-2.5 rounded-lg hover:bg-[#163d70] transition-colors cursor-pointer text-sm"
                  >
                    Encaminhar Caso
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmação encaminhamento */}
      {showEncModal && selectedCaso && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-[360px]">
            <h3 className="font-bold text-[#0F172A] mb-3">Confirmar Encaminhamento</h3>
            <p className="text-sm text-[#475569] mb-5">
              Deseja criar um pedido para o caso de{' '}
              <strong>{selectedCaso.beneficiario?.nome}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowEncModal(false)} className="flex-1 border border-[#E2E8F0] text-[#475569] py-2 rounded-lg text-sm font-medium hover:bg-[#F7F9FC] cursor-pointer">Cancelar</button>
              <button onClick={handleEncaminhar} disabled={encLoading} className="flex-1 bg-[#1E4E8C] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#163d70] cursor-pointer disabled:opacity-60">
                {encLoading ? 'Enviando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#475569] mb-2">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </div>
  )
}
