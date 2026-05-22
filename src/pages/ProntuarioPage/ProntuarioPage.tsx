import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBeneficiarios } from '../../services/beneficiarioService'
import { apiFetch } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { maskCPF, maskPhone } from '../../utils/masks'
import type { Beneficiario, Caso } from '../../types'

interface NovoBenef {
  nome: string
  email: string
  cpf: string
  dataNascimento: string
  telefone: string
}

type BeneficiarioMode = 'existente' | 'novo'
type StepStatus = 'idle' | 'loading' | 'done' | 'error'

interface StepState {
  beneficiario: StepStatus
  caso: StepStatus
  diagnostico: StepStatus
  historico: StepStatus
}

const procedimentos = ['Ortodontia', 'Endodontia', 'Implantodontia', 'Cirurgia', 'Clínica Geral', 'Odontopediatria', 'Periodontia', 'Outro']

const inputClass =
  'w-full border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C]'

export default function ProntuarioPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([])
  const [suggestions, setSuggestions] = useState<Beneficiario[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [beneficiarioMode, setBeneficiarioMode] = useState<BeneficiarioMode>('existente')
  const [nomeBusca, setNomeBusca] = useState('')
  const [beneficiarioId, setBeneficiarioId] = useState('')
  const [novoBenef, setNovoBenef] = useState<NovoBenef>({ nome: '', email: '', cpf: '', dataNascimento: '', telefone: '' })
  const [novoBenefErrors, setNovoBenefErrors] = useState<Partial<NovoBenef>>({})
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [procedimento, setProcedimento] = useState('')
  const [descricao, setDescricao] = useState('')
  const [diagErrors, setDiagErrors] = useState({ procedimento: '', descricao: '' })
  const [submitting, setSubmitting] = useState(false)
  const [steps, setSteps] = useState<StepState>({ beneficiario: 'idle', caso: 'idle', diagnostico: 'idle', historico: 'idle' })
  const [showStepper, setShowStepper] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [formError, setFormError] = useState('')
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getBeneficiarios().then(setBeneficiarios).catch(() => {})
  }, [])

  useEffect(() => {
    if (beneficiarioMode === 'existente' && nomeBusca.length >= 2) {
      const matches = beneficiarios.filter(b =>
        b.nome.toLowerCase().includes(nomeBusca.toLowerCase()),
      )
      setSuggestions(matches.slice(0, 5))
      setShowSuggestions(matches.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [nomeBusca, beneficiarios, beneficiarioMode])

  function handleModeSwitch(mode: BeneficiarioMode) {
    setBeneficiarioMode(mode)
    setNomeBusca('')
    setBeneficiarioId('')
    setShowSuggestions(false)
    setNovoBenefErrors({})
    setFormError('')
  }

  function validateNovoBenef(): boolean {
    const errs: Partial<NovoBenef> = {}
    if (!novoBenef.nome.trim()) errs.nome = 'Nome é obrigatório.'
    if (!novoBenef.email.trim()) errs.email = 'E-mail é obrigatório.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoBenef.email)) errs.email = 'Informe um e-mail válido.'
    if (!novoBenef.cpf.trim()) errs.cpf = 'CPF é obrigatório.'
    if (!novoBenef.dataNascimento) errs.dataNascimento = 'Data de nascimento é obrigatória.'
    if (!novoBenef.telefone.trim()) errs.telefone = 'Telefone é obrigatório.'
    setNovoBenefErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setFormError('')

    if (beneficiarioMode === 'existente' && !beneficiarioId) {
      setFormError('Selecione um beneficiário da lista antes de continuar.')
      return
    }
    if (beneficiarioMode === 'novo' && !validateNovoBenef()) return

    const errs = { procedimento: '', descricao: '' }
    if (!procedimento) errs.procedimento = 'Selecione o procedimento.'
    if (!descricao.trim()) errs.descricao = 'Descrição é obrigatória.'
    setDiagErrors(errs)
    if (errs.procedimento || errs.descricao) return

    setSubmitting(true)
    setShowStepper(true)
    setSubmitError('')

    const dataAbertura = data
    let idBeneficiarioNum: number | null = null

    // Passo 1 — Cadastrar novo beneficiário (se modo for "novo")
    if (beneficiarioMode === 'novo') {
      setSteps({ beneficiario: 'loading', caso: 'idle', diagnostico: 'idle', historico: 'idle' })
      try {
        await apiFetch('/beneficiarios', {
          method: 'POST',
          body: JSON.stringify({
            nome: novoBenef.nome,
            email: novoBenef.email,
            cpf: novoBenef.cpf,
            dataNascimento: novoBenef.dataNascimento,
            telefone: novoBenef.telefone,
            dataCadastro: dataAbertura,
          }),
        })
        const todosbenef = await apiFetch('/beneficiarios') as Beneficiario[]
        const criado = todosbenef.find(b => b.email === novoBenef.email)
        if (!criado) throw new Error('Beneficiário criado mas não encontrado.')
        idBeneficiarioNum = criado.idBeneficiario
        setSteps(s => ({ ...s, beneficiario: 'done' }))
      } catch (err) {
        setSteps({ beneficiario: 'error', caso: 'idle', diagnostico: 'idle', historico: 'idle' })
        setSubmitError('Erro ao cadastrar beneficiário: ' + (err instanceof Error ? err.message : String(err)))
        setSubmitting(false)
        return
      }
    } else {
      idBeneficiarioNum = Number(beneficiarioId)
    }

    // Passo 2 — Abrir caso (Oracle ignora idCaso e usa SEQUENCE)
    setSteps(s => ({ ...s, caso: 'loading' }))
    let idCasoReal: number
    try {
      await apiFetch('/casos', {
        method: 'POST',
        body: JSON.stringify({
          idCaso: 1,
          dataAbertura,
          status: 'PENDENTE',
          beneficiario: { idBeneficiario: idBeneficiarioNum },
          integrante: { idIntegrante: user?.id },
        }),
      })

      const todosCasos = await apiFetch('/casos') as Caso[]
      const meuCaso = todosCasos
        .filter(c =>
          c.integrante?.idIntegrante === user?.id &&
          c.dataAbertura === dataAbertura &&
          c.status === 'PENDENTE',
        )
        .sort((a, b) => b.idCaso - a.idCaso)[0]
      if (!meuCaso) throw new Error('Caso criado mas não encontrado no banco.')
      idCasoReal = meuCaso.idCaso
      setSteps(s => ({ ...s, caso: 'done' }))
    } catch (err) {
      setSteps(s => ({ ...s, caso: 'error' }))
      setSubmitError('Erro ao abrir caso: ' + (err instanceof Error ? err.message : String(err)))
      setSubmitting(false)
      return
    }

    // Passo 3 — Diagnóstico
    setSteps(s => ({ ...s, diagnostico: 'loading' }))
    try {
      await apiFetch('/diagnosticos', {
        method: 'POST',
        body: JSON.stringify({
          descricao,
          procedimento,
          dataDiagnostico: dataAbertura,
          caso: { idCaso: idCasoReal },
          beneficiario: { idBeneficiario: idBeneficiarioNum },
        }),
      })
      setSteps(s => ({ ...s, diagnostico: 'done' }))
    } catch (err) {
      setSteps(s => ({ ...s, diagnostico: 'error' }))
      setSubmitError('Erro ao registrar diagnóstico: ' + (err instanceof Error ? err.message : String(err)))
      setSubmitting(false)
      return
    }

    // Passo 4 — Histórico de status inicial
    setSteps(s => ({ ...s, historico: 'loading' }))
    try {
      await apiFetch('/historicos-status', {
        method: 'POST',
        body: JSON.stringify({
          status: 'PENDENTE',
          dataAlteracao: dataAbertura,
          caso: { idCaso: idCasoReal },
          integrante: { idIntegrante: user?.id },
        }),
      })
      setSteps(s => ({ ...s, historico: 'done' }))
    } catch (err) {
      setSteps(s => ({ ...s, historico: 'error' }))
      setSubmitError('Erro no histórico: ' + (err instanceof Error ? err.message : String(err)))
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setTimeout(() => navigate('/casos'), 1200)
  }

  return (
    <div className="max-w-[600px] mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-[#0F172A] mb-2">Abrir Novo Caso</h1>
      <p className="text-sm text-[#475569] mb-6">
        Registre um novo caso clínico para um beneficiário. Após abrir, você poderá encaminhar para um dentista.
      </p>

      {showStepper ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-[#0F172A] mb-2">Abrindo caso...</h2>
          {beneficiarioMode === 'novo' && (
            <StepItem status={steps.beneficiario} label="Beneficiário cadastrado" pending="Cadastrando beneficiário..." />
          )}
          <StepItem status={steps.caso} label="Caso aberto com sucesso" pending="Abrindo caso clínico..." />
          <StepItem status={steps.diagnostico} label="Diagnóstico registrado" pending="Registrando diagnóstico..." />
          <StepItem status={steps.historico} label="Histórico de status criado" pending="Registrando histórico..." />
          {submitError && (
            <div className="grid gap-2">
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{submitError}</p>
              <button
                type="button"
                onClick={() => { setShowStepper(false); setSubmitError('') }}
                className="text-sm text-[#1E4E8C] font-semibold hover:underline text-left cursor-pointer"
              >
                ← Voltar ao formulário
              </button>
            </div>
          )}
          {steps.historico === 'done' && (
            <p className="text-sm text-green-700 font-medium text-center mt-2">
              <i className="fa-solid fa-circle-check mr-1" />
              Caso aberto! Redirecionando para casos...
            </p>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E2E8F0] rounded-2xl p-6 grid gap-5"
          noValidate
        >
          {/* Seção beneficiário */}
          <div>
            <p className="block text-sm font-semibold text-[#0F172A] mb-2">Beneficiário</p>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleModeSwitch('existente')}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg border transition-colors cursor-pointer ${
                  beneficiarioMode === 'existente'
                    ? 'bg-[#1E4E8C] text-white border-[#1E4E8C]'
                    : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#1E4E8C] hover:text-[#1E4E8C]'
                }`}
              >
                <i className="fa-solid fa-magnifying-glass mr-1.5" />
                Buscar cadastrado
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('novo')}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg border transition-colors cursor-pointer ${
                  beneficiarioMode === 'novo'
                    ? 'bg-[#1E4E8C] text-white border-[#1E4E8C]'
                    : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#1E4E8C] hover:text-[#1E4E8C]'
                }`}
              >
                <i className="fa-solid fa-user-plus mr-1.5" />
                Novo paciente
              </button>
            </div>

            {beneficiarioMode === 'existente' ? (
              <div className="relative">
                <input
                  value={nomeBusca}
                  onChange={e => {
                    setNomeBusca(e.target.value)
                    setBeneficiarioId('')
                  }}
                  placeholder="Digite o nome para buscar..."
                  autoComplete="off"
                  className={inputClass}
                />
                {beneficiarioId && (
                  <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-circle-check" /> Beneficiário selecionado
                  </p>
                )}
                {showSuggestions && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 top-full left-0 right-0 bg-white border border-[#E2E8F0] rounded-lg shadow-md mt-1 overflow-hidden"
                  >
                    {suggestions.map(s => (
                      <button
                        key={s.idBeneficiario}
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-[#EAF2FF] text-[#0F172A] cursor-pointer"
                        onMouseDown={() => {
                          setNomeBusca(s.nome)
                          setBeneficiarioId(String(s.idBeneficiario))
                          setShowSuggestions(false)
                        }}
                      >
                        {s.nome}
                        {s.cpf ? <span className="text-[#475569] ml-2 text-xs">CPF: {s.cpf}</span> : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-3 p-4 bg-[#F7F9FC] rounded-xl border border-[#E2E8F0]">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Nome completo *</label>
                  <input
                    value={novoBenef.nome}
                    onChange={e => setNovoBenef(s => ({ ...s, nome: e.target.value }))}
                    placeholder="Nome do paciente"
                    className={inputClass}
                  />
                  {novoBenefErrors.nome && <p className="text-xs text-red-600 mt-1">{novoBenefErrors.nome}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">E-mail *</label>
                  <input
                    type="email"
                    value={novoBenef.email}
                    onChange={e => setNovoBenef(s => ({ ...s, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    className={inputClass}
                  />
                  {novoBenefErrors.email && <p className="text-xs text-red-600 mt-1">{novoBenefErrors.email}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">CPF *</label>
                    <input
                      value={novoBenef.cpf}
                      onChange={e => setNovoBenef(s => ({ ...s, cpf: maskCPF(e.target.value) }))}
                      placeholder="000.000.000-00"
                      className={inputClass}
                    />
                    {novoBenefErrors.cpf && <p className="text-xs text-red-600 mt-1">{novoBenefErrors.cpf}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">Data de nascimento *</label>
                    <input
                      type="date"
                      value={novoBenef.dataNascimento}
                      onChange={e => setNovoBenef(s => ({ ...s, dataNascimento: e.target.value }))}
                      className={inputClass}
                    />
                    {novoBenefErrors.dataNascimento && <p className="text-xs text-red-600 mt-1">{novoBenefErrors.dataNascimento}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Telefone *</label>
                  <input
                    type="tel"
                    value={novoBenef.telefone}
                    onChange={e => setNovoBenef(s => ({ ...s, telefone: maskPhone(e.target.value) }))}
                    placeholder="(11) 90000-0000"
                    className={inputClass}
                  />
                  {novoBenefErrors.telefone && <p className="text-xs text-red-600 mt-1">{novoBenefErrors.telefone}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Data de abertura */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1">Data de abertura</label>
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Diagnóstico */}
          <div className="grid gap-4 border-t border-[#E2E8F0] pt-5">
            <p className="text-sm font-semibold text-[#0F172A]">Diagnóstico</p>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">Procedimento *</label>
              <select
                value={procedimento}
                onChange={e => { setProcedimento(e.target.value); setDiagErrors(s => ({ ...s, procedimento: '' })) }}
                className={`${inputClass} bg-white`}
              >
                <option value="">Selecione...</option>
                {procedimentos.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {diagErrors.procedimento && <p className="text-xs text-red-600 mt-1">{diagErrors.procedimento}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">Descrição do diagnóstico *</label>
              <textarea
                value={descricao}
                onChange={e => { setDescricao(e.target.value); setDiagErrors(s => ({ ...s, descricao: '' })) }}
                rows={4}
                placeholder="Descreva o caso clínico e diagnóstico inicial..."
                className={`${inputClass} resize-none`}
              />
              {diagErrors.descricao && <p className="text-xs text-red-600 mt-1">{diagErrors.descricao}</p>}
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 bg-[#EAF2FF] rounded-xl px-4 py-3">
            <i className="fa-solid fa-circle-info text-[#1E4E8C] mt-0.5 shrink-0" />
            <p className="text-sm text-[#1E4E8C]">
              O caso será aberto com status <strong>Pendente</strong>. Após a criação, acesse o caso para encaminhar ao dentista.
            </p>
          </div>

          {formError && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1E4E8C] text-white font-semibold py-2.5 rounded-lg hover:bg-[#163d70] transition-colors cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'Abrindo caso...' : 'Abrir Caso'}
          </button>
        </form>
      )}
    </div>
  )
}

function StepItem({ status, label, pending }: { status: StepStatus; label: string; pending?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 w-8 h-8 flex items-center justify-center">
        {status === 'idle' && <span className="w-4 h-4 rounded-full border-2 border-[#E2E8F0]" />}
        {status === 'loading' && (
          <div className="animate-spin w-5 h-5 rounded-full border-2 border-[#1E4E8C] border-t-transparent" />
        )}
        {status === 'done' && (
          <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <i className="fa-solid fa-check text-white text-xs" />
          </span>
        )}
        {status === 'error' && (
          <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
            <i className="fa-solid fa-xmark text-white text-xs" />
          </span>
        )}
      </span>
      <span className={`text-sm font-medium ${
        status === 'done' ? 'text-green-700'
        : status === 'loading' ? 'text-[#1E4E8C]'
        : status === 'error' ? 'text-red-600'
        : 'text-[#475569]'
      }`}>
        {status === 'loading' && pending ? pending : label}
      </span>
    </div>
  )
}
