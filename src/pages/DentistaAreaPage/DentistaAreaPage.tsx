import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCasos, updateCaso } from '../../services/casoService'
import { getDiagnosticos } from '../../services/diagnosticoService'
import { getPedidosEncaminhamento, aceitarPedido, recusarPedido } from '../../services/pedidoEncaminhamentoService'
import { apiFetch } from '../../services/api'
import type { Caso, Diagnostico, PedidoEncaminhamento } from '../../types'

const procedimentos = ['Ortodontia', 'Endodontia', 'Implantodontia', 'Cirurgia', 'Clínica Geral', 'Odontopediatria', 'Periodontia', 'Outro']

const STATUS_LABELS: Record<string, string> = {
  EM_ANDAMENTO: 'Em andamento',
  PENDENTE: 'Pendente',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
  ACEITO: 'Aceito',
  RECUSADO: 'Recusado',
}

const STATUS_STYLE: Record<string, string> = {
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
  PENDENTE: 'bg-yellow-100 text-yellow-700',
  CONCLUIDO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-gray-100 text-gray-600',
  ACEITO: 'bg-green-100 text-green-700',
  RECUSADO: 'bg-red-100 text-red-600',
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function formatDate(iso: string) {
  const d = iso.split('T')[0].split('-')
  return `${d[2]}/${d[1]}/${d[0]}`
}

const inputClass = 'w-full border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C]'

interface CasoModal {
  caso: Caso
  diagnosticos: Diagnostico[]
  loading: boolean
}

export default function DentistaAreaPage() {
  const { user } = useAuth()
  const [casos, setCasos] = useState<Caso[]>([])
  const [pedidos, setPedidos] = useState<PedidoEncaminhamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal do caso
  const [modal, setModal] = useState<CasoModal | null>(null)

  // Diagnóstico
  const [diagProcedimento, setDiagProcedimento] = useState('')
  const [diagDescricao, setDiagDescricao] = useState('')
  const [diagError, setDiagError] = useState('')
  const [diagLoading, setDiagLoading] = useState(false)
  const [diagSuccess, setDiagSuccess] = useState(false)

  // Alterar status
  const [novoStatus, setNovoStatus] = useState('')
  const [statusError, setStatusError] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusSuccess, setStatusSuccess] = useState(false)

  // Aceitar/Recusar pedido
  const [pedidoLoading, setPedidoLoading] = useState<number | null>(null)
  const [pedidoError, setPedidoError] = useState('')

  useEffect(() => {
    Promise.all([getCasos(), getPedidosEncaminhamento()])
      .then(([c, p]) => {
        const meusCasos = c.filter(x => x.dentista?.email === user?.email)
        const meusPedidos = p.filter(x => x.dentista?.email === user?.email && x.status === 'PENDENTE')
        setCasos(meusCasos)
        setPedidos(meusPedidos)
      })
      .catch(() => setError('Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [user?.email])

  async function openModal(caso: Caso) {
    setModal({ caso, diagnosticos: [], loading: true })
    setDiagProcedimento('')
    setDiagDescricao('')
    setDiagError('')
    setDiagSuccess(false)
    setNovoStatus('')
    setStatusError('')
    setStatusSuccess(false)
    try {
      const todos = await getDiagnosticos()
      setModal(m => m ? { ...m, diagnosticos: todos.filter(d => d.caso?.idCaso === caso.idCaso), loading: false } : null)
    } catch {
      setModal(m => m ? { ...m, loading: false } : null)
    }
  }

  async function handleAceitar(pedido: PedidoEncaminhamento) {
    setPedidoLoading(pedido.idPedido)
    setPedidoError('')
    try {
      await aceitarPedido(pedido.idPedido)
      setPedidos(prev => prev.filter(p => p.idPedido !== pedido.idPedido))
      const atualizados = await getCasos()
      setCasos(atualizados.filter(c => c.dentista?.email === user?.email))
    } catch (err) {
      setPedidoError(err instanceof Error ? err.message : 'Erro ao aceitar pedido.')
    } finally {
      setPedidoLoading(null)
    }
  }

  async function handleRecusar(pedido: PedidoEncaminhamento) {
    setPedidoLoading(pedido.idPedido)
    setPedidoError('')
    try {
      await recusarPedido(pedido.idPedido)
      setPedidos(prev => prev.filter(p => p.idPedido !== pedido.idPedido))
    } catch (err) {
      setPedidoError(err instanceof Error ? err.message : 'Erro ao recusar pedido.')
    } finally {
      setPedidoLoading(null)
    }
  }

  async function handleAddDiag() {
    if (!modal) return
    if (!diagProcedimento) { setDiagError('Selecione o procedimento.'); return }
    if (!diagDescricao.trim()) { setDiagError('Descrição é obrigatória.'); return }
    setDiagError('')
    setDiagLoading(true)
    try {
      const novo = await apiFetch('/diagnosticos', {
        method: 'POST',
        body: JSON.stringify({
          descricao: diagDescricao,
          procedimento: diagProcedimento,
          dataDiagnostico: new Date().toISOString().split('T')[0],
          caso: { idCaso: modal.caso.idCaso },
          beneficiario: { idBeneficiario: modal.caso.beneficiario?.idBeneficiario },
        }),
      }) as Diagnostico
      setModal(m => m ? { ...m, diagnosticos: [...m.diagnosticos, novo] } : null)
      setDiagSuccess(true)
      setDiagProcedimento('')
      setDiagDescricao('')
    } catch (err) {
      setDiagError(err instanceof Error ? err.message : 'Erro ao registrar diagnóstico.')
    } finally {
      setDiagLoading(false)
    }
  }

  async function handleAlterarStatus() {
    if (!modal || !novoStatus) { setStatusError('Selecione o novo status.'); return }
    setStatusError('')
    setStatusLoading(true)
    try {
      // Atualiza o status do caso no banco (BO exige beneficiario e integrante)
      await updateCaso(modal.caso.idCaso, {
        status: novoStatus,
        dataAbertura: modal.caso.dataAbertura,
        beneficiario: modal.caso.beneficiario,
        integrante: modal.caso.integrante,
        dentista: modal.caso.dentista,
      })
      // Registra a transição no histórico
      await apiFetch('/historicos-status', {
        method: 'POST',
        body: JSON.stringify({
          status: novoStatus,
          dataAlteracao: new Date().toISOString().split('T')[0],
          caso: { idCaso: modal.caso.idCaso },
        }),
      })
      setCasos(prev => prev.map(c =>
        c.idCaso === modal.caso.idCaso ? { ...c, status: novoStatus } : c,
      ))
      setModal(m => m ? { ...m, caso: { ...m.caso, status: novoStatus } } : null)
      setStatusSuccess(true)
      setNovoStatus('')
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Erro ao alterar status.')
    } finally {
      setStatusLoading(false)
    }
  }

  const ativos = casos.filter(c => c.status === 'EM_ANDAMENTO').length
  const concluidos = casos.filter(c => c.status === 'CONCLUIDO').length

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Bem-vindo, {user?.nome}</h1>
        <p className="text-sm text-[#475569] mt-1">Gerencie seus casos e pedidos de encaminhamento.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total de Casos', value: casos.length, icon: 'fa-folder-open', color: 'text-[#1E4E8C]' },
          { label: 'Em Andamento', value: ativos, icon: 'fa-clock', color: 'text-blue-600' },
          { label: 'Concluídos', value: concluidos, icon: 'fa-circle-check', color: 'text-green-600' },
          { label: 'Pedidos Pendentes', value: pedidos.length, icon: 'fa-bell', color: 'text-yellow-600' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-4 flex items-center gap-3">
            <i className={`fa-solid ${icon} ${color} text-xl`} />
            <div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-[#475569]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pedidos de encaminhamento pendentes */}
      {pedidos.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
            <i className="fa-solid fa-bell text-yellow-500" />
            Pedidos de Encaminhamento Pendentes
          </h2>
          {pedidoError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{pedidoError}</p>
          )}
          <div className="grid gap-3">
            {pedidos.map(p => (
              <div key={p.idPedido} className="bg-white border border-yellow-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-[#0F172A]">
                    {p.caso?.beneficiario?.nome ?? `Caso #${p.caso?.idCaso ?? p.idPedido}`}
                  </p>
                  <p className="text-sm text-[#475569] mt-0.5">
                    <i className="fa-solid fa-calendar-day mr-1 text-xs text-[#1E4E8C]" />
                    Pedido em {formatDate(p.dataPedido)}
                  </p>
                  {p.caso?.status && (
                    <div className="mt-1">
                      <StatusPill status={p.caso.status} />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAceitar(p)}
                    disabled={pedidoLoading === p.idPedido}
                    className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {pedidoLoading === p.idPedido ? '...' : 'Aceitar'}
                  </button>
                  <button
                    onClick={() => handleRecusar(p)}
                    disabled={pedidoLoading === p.idPedido}
                    className="border border-red-200 text-red-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {pedidoLoading === p.idPedido ? '...' : 'Recusar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Meus Casos */}
      <section>
        <h2 className="text-base font-semibold text-[#0F172A] mb-3">Meus Casos</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C]" />
          </div>
        ) : casos.length === 0 ? (
          <p className="text-sm text-[#475569]">Nenhum caso atribuído a você ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {casos.map(c => (
              <button
                key={c.idCaso}
                onClick={() => openModal(c)}
                className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-2 text-left hover:border-[#1E4E8C] hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-[#0F172A]">{c.beneficiario?.nome ?? '—'}</p>
                  <StatusPill status={c.status} />
                </div>
                <p className="text-sm text-[#475569] flex items-center gap-1">
                  <i className="fa-solid fa-calendar text-xs text-[#1E4E8C]" />
                  Abertura: {formatDate(c.dataAbertura)}
                </p>
                {c.temDiagnostico && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 w-fit">
                    <i className="fa-solid fa-stethoscope mr-1" />Diagnóstico registrado
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Modal do caso */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-[#E2E8F0]">
              <div>
                <h2 className="font-bold text-[#0F172A] text-lg">
                  {modal.caso.beneficiario?.nome ?? '—'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusPill status={modal.caso.status} />
                  <span className="text-xs text-[#475569]">Aberto em {formatDate(modal.caso.dataAbertura)}</span>
                </div>
              </div>
              <button
                onClick={() => setModal(null)}
                className="text-[#475569] hover:text-[#0F172A] cursor-pointer text-2xl leading-none ml-4 shrink-0"
              >
                ×
              </button>
            </div>

            <div className="p-5 grid gap-6">
              {modal.loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C]" />
                </div>
              ) : (
                <>
                  {/* Diagnósticos existentes */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#475569] mb-3">Diagnósticos</h3>
                    {modal.diagnosticos.length === 0 ? (
                      <p className="text-sm text-[#475569]">Nenhum diagnóstico registrado ainda.</p>
                    ) : (
                      <div className="grid gap-3">
                        {modal.diagnosticos.map(d => (
                          <div key={d.idDiagnostico} className="bg-[#F7F9FC] rounded-xl p-4 grid gap-1">
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

                  {/* Adicionar diagnóstico */}
                  {modal.caso.status !== 'CONCLUIDO' && modal.caso.status !== 'CANCELADO' && (
                    <div className="border-t border-[#E2E8F0] pt-4 grid gap-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#475569]">Adicionar Diagnóstico</h3>
                      <div>
                        <select
                          value={diagProcedimento}
                          onChange={e => { setDiagProcedimento(e.target.value); setDiagError('') }}
                          className={`${inputClass} bg-white`}
                        >
                          <option value="">Selecione o procedimento...</option>
                          {procedimentos.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <textarea
                          value={diagDescricao}
                          onChange={e => { setDiagDescricao(e.target.value); setDiagError('') }}
                          rows={3}
                          placeholder="Descreva o diagnóstico..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                      {diagError && <p className="text-xs text-red-600">{diagError}</p>}
                      {diagSuccess && (
                        <p className="text-xs text-green-700 flex items-center gap-1">
                          <i className="fa-solid fa-circle-check" /> Diagnóstico registrado com sucesso!
                        </p>
                      )}
                      <button
                        onClick={handleAddDiag}
                        disabled={diagLoading}
                        className="w-full bg-[#1E4E8C] text-white font-semibold py-2 rounded-lg hover:bg-[#163d70] transition-colors cursor-pointer disabled:opacity-60 text-sm"
                      >
                        {diagLoading ? 'Salvando...' : 'Salvar Diagnóstico'}
                      </button>
                    </div>
                  )}

                  {/* Alterar status */}
                  {modal.caso.status !== 'CONCLUIDO' && modal.caso.status !== 'CANCELADO' && (
                    <div className="border-t border-[#E2E8F0] pt-4 grid gap-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#475569]">Alterar Status do Caso</h3>
                      <div className="flex gap-2">
                        <select
                          value={novoStatus}
                          onChange={e => { setNovoStatus(e.target.value); setStatusError('') }}
                          className={`${inputClass} bg-white flex-1`}
                        >
                          <option value="">Selecione o novo status...</option>
                          {modal.caso.status !== 'EM_ANDAMENTO' && (
                            <option value="EM_ANDAMENTO">Em Andamento</option>
                          )}
                          <option value="CONCLUIDO">Concluído</option>
                          <option value="CANCELADO">Cancelado</option>
                        </select>
                        <button
                          onClick={handleAlterarStatus}
                          disabled={statusLoading || !novoStatus}
                          className="bg-[#F29E1F] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#d98b0d] transition-colors cursor-pointer disabled:opacity-60 text-sm shrink-0"
                        >
                          {statusLoading ? '...' : 'Confirmar'}
                        </button>
                      </div>
                      {statusError && <p className="text-xs text-red-600">{statusError}</p>}
                      {statusSuccess && (
                        <p className="text-xs text-green-700 flex items-center gap-1">
                          <i className="fa-solid fa-circle-check" /> Status atualizado!
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
