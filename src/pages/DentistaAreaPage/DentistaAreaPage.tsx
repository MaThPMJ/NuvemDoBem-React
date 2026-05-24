import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
}

const STATUS_STYLE: Record<string, string> = {
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
  PENDENTE: 'bg-yellow-100 text-yellow-700',
  CONCLUIDO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-gray-100 text-gray-500',
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

  // Modal do caso
  const [modal, setModal] = useState<CasoModal | null>(null)
  const [diagProcedimento, setDiagProcedimento] = useState('')
  const [diagDescricao, setDiagDescricao] = useState('')
  const [diagError, setDiagError] = useState('')
  const [diagLoading, setDiagLoading] = useState(false)
  const [diagSuccess, setDiagSuccess] = useState(false)
  const [novoStatus, setNovoStatus] = useState('')
  const [statusError, setStatusError] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusSuccess, setStatusSuccess] = useState(false)

  // Pedidos
  const [pedidoLoading, setPedidoLoading] = useState<number | null>(null)
  const [pedidoError, setPedidoError] = useState('')
  const [pedidoDiags, setPedidoDiags] = useState<Record<number, Diagnostico[]>>({})

  useEffect(() => {
    Promise.allSettled([getCasos(), getPedidosEncaminhamento(), getDiagnosticos()])
      .then(([cr, pr, dr]) => {
        const c = cr.status === 'fulfilled' ? cr.value : []
        const p = pr.status === 'fulfilled' ? pr.value : []
        const diags = dr.status === 'fulfilled' ? dr.value : []
        const filteredPedidos = p.filter(x => x.dentista?.email === user?.email && x.status === 'PENDENTE')
        setCasos(c.filter(x => x.dentista?.email === user?.email))
        setPedidos(filteredPedidos)
        const diagMap: Record<number, Diagnostico[]> = {}
        filteredPedidos.forEach(ped => {
          if (ped.caso?.idCaso) {
            diagMap[ped.idPedido] = diags.filter(d => d.caso?.idCaso === ped.caso?.idCaso)
          }
        })
        setPedidoDiags(diagMap)
      })
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
      if (pedido.caso?.idCaso) {
        await updateCaso(pedido.caso.idCaso, {
          status: 'EM_ANDAMENTO',
          dataAbertura: pedido.caso.dataAbertura,
          beneficiario: pedido.caso.beneficiario,
          integrante: pedido.caso.integrante,
          dentista: pedido.dentista,
        })
      }
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
      await updateCaso(modal.caso.idCaso, {
        status: novoStatus,
        dataAbertura: modal.caso.dataAbertura,
        beneficiario: modal.caso.beneficiario,
        integrante: modal.caso.integrante,
        dentista: modal.caso.dentista,
      })
      await apiFetch('/historicos-status', {
        method: 'POST',
        body: JSON.stringify({
          status: novoStatus,
          dataAlteracao: new Date().toISOString().split('T')[0],
          caso: { idCaso: modal.caso.idCaso },
        }),
      })
      setCasos(prev => prev.map(c => c.idCaso === modal.caso.idCaso ? { ...c, status: novoStatus } : c))
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
  const casosRecentes = casos.filter(c => c.status !== 'CONCLUIDO' && c.status !== 'CANCELADO').slice(0, 3)

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6">

      {/* Banner de boas-vindas */}
      <div className="bg-gradient-to-r from-[#1E4E8C] to-[#2563EB] rounded-2xl px-6 py-6 mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-blue-200 text-sm font-medium mb-0.5">Bem-vindo de volta</p>
          <h1 className="text-white text-2xl font-bold">{user?.nome}</h1>
          <p className="text-blue-200 text-sm mt-1">
            <i className="fa-solid fa-tooth mr-1.5" />
            Dentista Voluntário · Nuvem do Bem
          </p>
        </div>
        <div className="hidden sm:flex w-16 h-16 rounded-full bg-white/10 items-center justify-center shrink-0">
          <i className="fa-solid fa-user-doctor text-white text-3xl" />
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <MetricCard
          icon="fa-folder-open" label="Total de Casos"
          value={loading ? '—' : String(casos.length)}
          color="blue"
        />
        <MetricCard
          icon="fa-clock" label="Em Andamento"
          value={loading ? '—' : String(ativos)}
          color="indigo"
        />
        <MetricCard
          icon="fa-circle-check" label="Concluídos"
          value={loading ? '—' : String(concluidos)}
          color="green"
        />
        <MetricCard
          icon="fa-bell" label="Aguardando"
          value={loading ? '—' : String(pedidos.length)}
          color="yellow"
          highlight={pedidos.length > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Coluna principal */}
        <div className="lg:col-span-3 grid gap-6">

          {/* Pedidos de encaminhamento pendentes */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">
                Pedidos Aguardando Resposta
              </h2>
              {pedidos.length > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">
                  {pedidos.length}
                </span>
              )}
            </div>

            {pedidoError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{pedidoError}</p>
            )}

            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E4E8C]" />
              </div>
            ) : pedidos.length === 0 ? (
              <div className="flex items-center gap-3 bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl px-4 py-4">
                <i className="fa-solid fa-circle-check text-green-500 text-lg" />
                <p className="text-sm text-[#475569]">Nenhum pedido pendente. Tudo em dia!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {pedidos.map(p => (
                  <div key={p.idPedido} className="bg-white border-l-4 border-l-yellow-400 border border-[#E2E8F0] rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-[#0F172A]">
                          {p.caso?.beneficiario?.nome ?? `Caso #${p.caso?.idCaso}`}
                        </p>
                        <p className="text-xs text-[#475569] mt-0.5">
                          <i className="fa-solid fa-calendar-day mr-1" />
                          Pedido em {formatDate(p.dataPedido)}
                        </p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full shrink-0">
                        Pendente
                      </span>
                    </div>
                    {(pedidoDiags[p.idPedido] ?? []).length > 0 ? (
                      <div className="mb-3 bg-[#EAF2FF] rounded-xl p-3 grid gap-2">
                        <p className="text-xs font-bold text-[#1E4E8C] uppercase tracking-wide flex items-center gap-1.5">
                          <i className="fa-solid fa-stethoscope text-[10px]" />
                          Diagnóstico do paciente
                        </p>
                        {(pedidoDiags[p.idPedido] ?? []).map(d => (
                          <div key={d.idDiagnostico} className="bg-white rounded-lg px-3 py-2">
                            {d.procedimento && (
                              <span className="text-xs font-bold text-[#1E4E8C]">{d.procedimento} · </span>
                            )}
                            <span className="text-xs text-[#0F172A]">{d.descricao}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-3 bg-[#F7F9FC] rounded-xl px-3 py-2">
                        <p className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                          <i className="fa-solid fa-stethoscope text-[10px]" />
                          Nenhum diagnóstico registrado para este paciente.
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAceitar(p)}
                        disabled={pedidoLoading === p.idPedido}
                        className="flex-1 bg-green-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <i className="fa-solid fa-check mr-1.5" />
                        {pedidoLoading === p.idPedido ? 'Aguarde...' : 'Aceitar'}
                      </button>
                      <button
                        onClick={() => handleRecusar(p)}
                        disabled={pedidoLoading === p.idPedido}
                        className="flex-1 border border-red-200 text-red-600 text-sm font-semibold py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <i className="fa-solid fa-xmark mr-1.5" />
                        {pedidoLoading === p.idPedido ? 'Aguarde...' : 'Recusar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Casos em aberto recentes */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">Casos em Aberto</h2>
              <Link to="/casos" className="text-xs text-[#1E4E8C] font-semibold hover:underline no-underline">
                Ver todos →
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E4E8C]" />
              </div>
            ) : casosRecentes.length === 0 ? (
              <div className="flex items-center gap-3 bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl px-4 py-4">
                <i className="fa-solid fa-folder-open text-[#1E4E8C] text-lg" />
                <p className="text-sm text-[#475569]">Nenhum caso ativo no momento.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {casosRecentes.map(c => (
                  <button
                    key={c.idCaso}
                    onClick={() => openModal(c)}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 text-left hover:border-[#1E4E8C] hover:shadow-sm transition-all cursor-pointer w-full"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EAF2FF] flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-user text-[#1E4E8C]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate">{c.beneficiario?.nome ?? '—'}</p>
                      <p className="text-xs text-[#475569]">Abertura: {formatDate(c.dataAbertura)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <StatusPill status={c.status} />
                      {c.temDiagnostico && (
                        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                          <i className="fa-solid fa-stethoscope mr-1 text-[10px]" />Diagnóstico
                        </span>
                      )}
                    </div>
                    <i className="fa-solid fa-chevron-right text-[#CBD5E1] text-xs shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Coluna lateral — resumo rápido */}
        <div className="lg:col-span-2 grid gap-4 content-start">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide mb-4">Visão Geral</h3>
            <div className="grid gap-3">
              {[
                { label: 'Pendentes', count: casos.filter(c => c.status === 'PENDENTE').length, color: 'bg-yellow-400' },
                { label: 'Em andamento', count: ativos, color: 'bg-blue-500' },
                { label: 'Concluídos', count: concluidos, color: 'bg-green-500' },
                { label: 'Cancelados', count: casos.filter(c => c.status === 'CANCELADO').length, color: 'bg-gray-400' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                  <span className="text-sm text-[#475569] flex-1">{label}</span>
                  <span className="text-sm font-bold text-[#0F172A]">{loading ? '—' : count}</span>
                </div>
              ))}
              <div className="border-t border-[#E2E8F0] pt-3 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#1E4E8C]" />
                <span className="text-sm text-[#475569] flex-1">Total</span>
                <span className="text-sm font-bold text-[#0F172A]">{loading ? '—' : casos.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#EAF2FF] border border-[#BFDBFE] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#1E4E8C] mb-2">
              <i className="fa-solid fa-circle-info mr-1.5" />
              Ações disponíveis
            </h3>
            <ul className="text-sm text-[#1E4E8C] grid gap-2 mt-3">
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check-circle mt-0.5 text-xs" />
                Aceite ou recuse pedidos de encaminhamento
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check-circle mt-0.5 text-xs" />
                Clique num caso para adicionar o diagnóstico
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check-circle mt-0.5 text-xs" />
                Atualize o status conforme o tratamento avança
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal do caso */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between p-5 border-b border-[#E2E8F0]">
              <div>
                <h2 className="font-bold text-[#0F172A] text-lg">{modal.caso.beneficiario?.nome ?? '—'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusPill status={modal.caso.status} />
                  <span className="text-xs text-[#475569]">Aberto em {formatDate(modal.caso.dataAbertura)}</span>
                </div>
              </div>
              <button onClick={() => setModal(null)} className="text-[#475569] hover:text-[#0F172A] cursor-pointer text-2xl leading-none ml-4 shrink-0">×</button>
            </div>

            <div className="p-5 grid gap-6">
              {modal.loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C]" />
                </div>
              ) : (
                <>
                  {/* Diagnósticos */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#475569] mb-3">Diagnósticos</h3>
                    {modal.diagnosticos.length === 0 ? (
                      <p className="text-sm text-[#475569]">Nenhum diagnóstico registrado ainda.</p>
                    ) : (
                      <div className="grid gap-3">
                        {modal.diagnosticos.map(d => (
                          <div key={d.idDiagnostico} className="bg-[#F7F9FC] rounded-xl p-4 grid gap-1">
                            {d.procedimento && (
                              <span className="text-xs font-bold text-[#1E4E8C] bg-[#EAF2FF] rounded-full px-2 py-0.5 w-fit">{d.procedimento}</span>
                            )}
                            <p className="text-sm text-[#0F172A] leading-relaxed">{d.descricao}</p>
                            <p className="text-xs text-[#475569]"><i className="fa-solid fa-calendar-day mr-1" />{formatDate(d.dataDiagnostico)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {modal.caso.status !== 'CONCLUIDO' && modal.caso.status !== 'CANCELADO' && (
                    <>
                      {/* Adicionar diagnóstico */}
                      <div className="border-t border-[#E2E8F0] pt-4 grid gap-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#475569]">Adicionar Diagnóstico</h3>
                        <select value={diagProcedimento} onChange={e => { setDiagProcedimento(e.target.value); setDiagError('') }} className={`${inputClass} bg-white`}>
                          <option value="">Selecione o procedimento...</option>
                          {procedimentos.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <textarea value={diagDescricao} onChange={e => { setDiagDescricao(e.target.value); setDiagError('') }} rows={3} placeholder="Descreva o diagnóstico..." className={`${inputClass} resize-none`} />
                        {diagError && <p className="text-xs text-red-600">{diagError}</p>}
                        {diagSuccess && <p className="text-xs text-green-700 flex items-center gap-1"><i className="fa-solid fa-circle-check" /> Diagnóstico registrado!</p>}
                        <button onClick={handleAddDiag} disabled={diagLoading} className="w-full bg-[#1E4E8C] text-white font-semibold py-2 rounded-lg hover:bg-[#163d70] transition-colors cursor-pointer disabled:opacity-60 text-sm">
                          {diagLoading ? 'Salvando...' : 'Salvar Diagnóstico'}
                        </button>
                      </div>

                      {/* Alterar status */}
                      <div className="border-t border-[#E2E8F0] pt-4 grid gap-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#475569]">Alterar Status do Caso</h3>
                        <div className="flex gap-2">
                          <select value={novoStatus} onChange={e => { setNovoStatus(e.target.value); setStatusError('') }} className={`${inputClass} bg-white flex-1`}>
                            <option value="">Selecione o novo status...</option>
                            {modal.caso.status !== 'EM_ANDAMENTO' && <option value="EM_ANDAMENTO">Em Andamento</option>}
                            <option value="CONCLUIDO">Concluído</option>
                            <option value="CANCELADO">Cancelado</option>
                          </select>
                          <button onClick={handleAlterarStatus} disabled={statusLoading || !novoStatus} className="bg-[#F29E1F] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#d98b0d] transition-colors cursor-pointer disabled:opacity-60 text-sm shrink-0">
                            {statusLoading ? '...' : 'Confirmar'}
                          </button>
                        </div>
                        {statusError && <p className="text-xs text-red-600">{statusError}</p>}
                        {statusSuccess && <p className="text-xs text-green-700 flex items-center gap-1"><i className="fa-solid fa-circle-check" /> Status atualizado!</p>}
                      </div>
                    </>
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

function MetricCard({ icon, label, value, color, highlight }: {
  icon: string; label: string; value: string; color: 'blue' | 'indigo' | 'green' | 'yellow'; highlight?: boolean
}) {
  const palette = {
    blue:   { bg: 'bg-[#EAF2FF]', text: 'text-[#1E4E8C]', val: 'text-[#1E4E8C]' },
    indigo: { bg: 'bg-indigo-50',  text: 'text-indigo-600', val: 'text-indigo-700' },
    green:  { bg: 'bg-green-50',   text: 'text-green-600',  val: 'text-green-700' },
    yellow: { bg: 'bg-yellow-50',  text: 'text-yellow-600', val: 'text-yellow-700' },
  }
  const p = palette[color]
  return (
    <div className={`bg-white border rounded-xl px-4 py-4 flex items-center gap-3 ${highlight ? 'border-yellow-300 shadow-sm' : 'border-[#E2E8F0]'}`}>
      <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center shrink-0`}>
        <i className={`fa-solid ${icon} ${p.text}`} />
      </div>
      <div>
        <p className={`text-xl font-bold ${p.val}`}>{value}</p>
        <p className="text-xs text-[#475569] leading-tight">{label}</p>
      </div>
    </div>
  )
}
