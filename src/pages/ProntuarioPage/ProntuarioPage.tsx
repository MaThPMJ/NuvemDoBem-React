import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { getBeneficiarios } from '../../services/beneficiarioService'
import { getDentistas } from '../../services/dentistaService'
import { getEnderecoFormatadoPorCep } from '../../services/enderecoService'
import { apiFetch } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { maskCPF, maskPhone, maskCEP } from '../../utils/masks'
import type { Beneficiario, Dentista, Caso } from '../../types'

interface FormData {
  nomeBeneficiario: string
  beneficiarioId: string
  cep: string
  endereco: string
  procedimento: string
  descricao: string
  dentistaId: string
  data: string
}

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

const inputClass = 'w-full border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C]'

export default function ProntuarioPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([])
  const [dentistas, setDentistas] = useState<Dentista[]>([])
  const [suggestions, setSuggestions] = useState<Beneficiario[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [beneficiarioMode, setBeneficiarioMode] = useState<BeneficiarioMode>('existente')
  const [novoBenef, setNovoBenef] = useState<NovoBenef>({ nome: '', email: '', cpf: '', dataNascimento: '', telefone: '' })
  const [novoBenefErrors, setNovoBenefErrors] = useState<Partial<NovoBenef>>({})
  const [submitting, setSubmitting] = useState(false)
  const [steps, setSteps] = useState<StepState>({ beneficiario: 'idle', caso: 'idle', diagnostico: 'idle', historico: 'idle' })
  const [showStepper, setShowStepper] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { data: new Date().toISOString().split('T')[0] },
  })

  const nomeBeneficiario = watch('nomeBeneficiario')
  const cep = watch('cep') ?? ''

  useEffect(() => {
    getBeneficiarios().then(setBeneficiarios).catch(() => {})
    getDentistas().then(setDentistas).catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.tipo === 'dentista' && dentistas.length > 0) {
      const meu = dentistas.find(d => d.email === user.email)
      if (meu) setValue('dentistaId', String(meu.idDentista))
    }
  }, [dentistas, user, setValue])

  useEffect(() => {
    if (beneficiarioMode === 'existente' && nomeBeneficiario && nomeBeneficiario.length >= 2) {
      const matches = beneficiarios.filter(b =>
        b.nome.toLowerCase().includes(nomeBeneficiario.toLowerCase()),
      )
      setSuggestions(matches.slice(0, 5))
      setShowSuggestions(matches.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [nomeBeneficiario, beneficiarios, beneficiarioMode])

  useEffect(() => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length === 8) {
      getEnderecoFormatadoPorCep(clean)
        .then(formatted => {
          if (typeof formatted === 'string') setValue('endereco', formatted)
        })
        .catch(() => {})
    }
  }, [cep, setValue])

  function handleModeSwitch(mode: BeneficiarioMode) {
    setBeneficiarioMode(mode)
    setShowSuggestions(false)
    setNovoBenefErrors({})
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

  async function onSubmit(data: FormData) {
    if (beneficiarioMode === 'novo' && !validateNovoBenef()) return

    // Validar que um beneficiário foi selecionado no modo existente
    if (beneficiarioMode === 'existente' && !data.beneficiarioId) {
      setSubmitError('Selecione um beneficiário da lista antes de continuar.')
      return
    }

    setSubmitError('')
    setSubmitting(true)
    setShowStepper(true)

    const dataAbertura = new Date().toISOString().split('T')[0]
    const idDentistaNum = Number(data.dentistaId)
    let idBeneficiarioNum: number | null = null

    // Passo 1 — Cadastrar novo beneficiário (se modo for "novo")
    if (beneficiarioMode === 'novo') {
      setSteps({ beneficiario: 'loading', caso: 'idle', diagnostico: 'idle', historico: 'idle' })
      try {
        const benefBody: Record<string, unknown> = {
          nome: novoBenef.nome,
          email: novoBenef.email,
          dataCadastro: dataAbertura,
        }
        if (novoBenef.cpf) benefBody.cpf = novoBenef.cpf
        if (novoBenef.dataNascimento) benefBody.dataNascimento = novoBenef.dataNascimento
        if (novoBenef.telefone) benefBody.telefone = novoBenef.telefone
        if (data.endereco) benefBody.endereco = data.endereco
        await apiFetch('/beneficiarios', { method: 'POST', body: JSON.stringify(benefBody) })

        // Oracle usa sequence — buscar o ID real pelo e-mail cadastrado
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
      idBeneficiarioNum = Number(data.beneficiarioId)
    }

    // Passo 2 — Caso clínico
    // Oracle usa SEQUENCE e ignora o idCaso que enviamos.
    // Enviamos qualquer valor > 0 para passar a validação do BO,
    // depois buscamos o ID real gerado pelo banco.
    setSteps(s => ({ ...s, caso: 'loading' }))
    let idCasoReal: number
    try {
      const casoBody: Record<string, unknown> = {
        idCaso: 1,
        dataAbertura,
        status: 'EM_ANDAMENTO',
        dentista: { idDentista: idDentistaNum },
        integrante: { idIntegrante: user?.id },
        beneficiario: { idBeneficiario: idBeneficiarioNum },
      }
      await apiFetch('/casos', { method: 'POST', body: JSON.stringify(casoBody) })

      // Buscar o idCaso real gerado pelo Oracle
      const todosCasos = await apiFetch('/casos') as Caso[]
      const meuCaso = todosCasos
        .filter(c =>
          c.integrante?.idIntegrante === user?.id &&
          c.dentista?.idDentista === idDentistaNum &&
          c.dataAbertura === dataAbertura,
        )
        .sort((a, b) => b.idCaso - a.idCaso)[0]
      if (!meuCaso) throw new Error('Caso criado mas não encontrado no banco.')
      idCasoReal = meuCaso.idCaso
      setSteps(s => ({ ...s, caso: 'done' }))
    } catch (err) {
      setSteps(s => ({ ...s, caso: 'error' }))
      setSubmitError('Erro no caso: ' + (err instanceof Error ? err.message : String(err)))
      setSubmitting(false)
      return
    }

    // Passo 3 — Diagnóstico (usa idCasoReal do Oracle)
    setSteps(s => ({ ...s, diagnostico: 'loading' }))
    try {
      await apiFetch('/diagnosticos', {
        method: 'POST',
        body: JSON.stringify({
          descricao: data.descricao,
          procedimento: data.procedimento,
          dataDiagnostico: dataAbertura,
          caso: { idCaso: idCasoReal },
          dentista: { idDentista: idDentistaNum },
          beneficiario: { idBeneficiario: idBeneficiarioNum },
        }),
      })
      setSteps(s => ({ ...s, diagnostico: 'done' }))
    } catch (err) {
      setSteps(s => ({ ...s, diagnostico: 'error' }))
      setSubmitError('Erro no diagnóstico: ' + (err instanceof Error ? err.message : String(err)))
      setSubmitting(false)
      return
    }

    // Passo 4 — Histórico de status (usa idCasoReal do Oracle)
    setSteps(s => ({ ...s, historico: 'loading' }))
    try {
      await apiFetch('/historicos-status', {
        method: 'POST',
        body: JSON.stringify({
          status: 'EM_ANDAMENTO',
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
    const destino = user?.tipo === 'dentista' ? '/area-dentista' : '/casos'
    setTimeout(() => navigate(destino), 1200)
  }

  return (
    <div className="max-w-[680px] mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-[#0F172A] mb-6">Novo Prontuário / Caso Clínico</h1>

      {showStepper ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-[#0F172A] mb-2">Registrando prontuário...</h2>
          {beneficiarioMode === 'novo' && (
            <StepItem status={steps.beneficiario} label="Beneficiário cadastrado" pending="Cadastrando beneficiário..." />
          )}
          <StepItem status={steps.caso} label="Caso clínico criado" pending="Criando caso clínico..." />
          <StepItem status={steps.diagnostico} label="Diagnóstico registrado" pending="Registrando diagnóstico..." />
          <StepItem status={steps.historico} label="Histórico de status criado" pending="Criando histórico..." />
          {submitError && (
            <div className="grid gap-2">
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{submitError}</p>
              <button
                type="button"
                onClick={() => { setShowStepper(false); setSubmitError('') }}
                className="text-sm text-[#1E4E8C] font-semibold hover:underline text-left"
              >
                ← Voltar ao formulário
              </button>
            </div>
          )}
          {steps.historico === 'done' && (
            <p className="text-sm text-green-700 font-medium text-center mt-2">Redirecionando...</p>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white border border-[#E2E8F0] rounded-2xl p-6 grid gap-5"
          noValidate
        >
          {/* Seção beneficiário */}
          <div>
            <p className="block text-sm font-medium text-[#0F172A] mb-2">Beneficiário</p>
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
                  {...register('nomeBeneficiario')}
                  placeholder="Digite o nome para buscar..."
                  autoComplete="off"
                  className={inputClass}
                />
                <input type="hidden" {...register('beneficiarioId')} />
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
                          setValue('nomeBeneficiario', s.nome)
                          setValue('beneficiarioId', String(s.idBeneficiario))
                          if (s.endereco) setValue('endereco', s.endereco)
                          setShowSuggestions(false)
                        }}
                      >
                        {s.nome}{s.endereco ? ` — ${s.endereco}` : ''}
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

          {/* CEP + Endereço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">CEP</label>
              <input
                value={maskCEP(cep)}
                onChange={e => setValue('cep', maskCEP(e.target.value))}
                placeholder="00000-000"
                maxLength={9}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">Endereço</label>
              <input
                {...register('endereco')}
                placeholder={beneficiarioMode === 'existente' ? 'Preenchido pelo beneficiário ou CEP' : 'Preenchido pelo CEP'}
                className={`${inputClass} bg-[#F7F9FC]`}
                readOnly
              />
            </div>
          </div>

          {/* Procedimento */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Procedimento</label>
            <select
              {...register('procedimento', { required: 'Selecione o procedimento.' })}
              className={`${inputClass} bg-white`}
            >
              <option value="">Selecione...</option>
              {procedimentos.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.procedimento && <p className="text-xs text-red-600 mt-1">{errors.procedimento.message}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Descrição do diagnóstico</label>
            <textarea
              {...register('descricao', { required: 'Descrição é obrigatória.' })}
              rows={4}
              placeholder="Descreva o caso clínico e diagnóstico..."
              className={`${inputClass} resize-none`}
            />
            {errors.descricao && <p className="text-xs text-red-600 mt-1">{errors.descricao.message}</p>}
          </div>

          {/* Dentista responsável */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Dentista responsável</label>
            <select
              {...register('dentistaId', { required: 'Selecione um dentista.' })}
              className={`${inputClass} bg-white`}
            >
              <option value="">Selecione...</option>
              {dentistas.map(d => (
                <option key={d.idDentista} value={d.idDentista}>
                  {d.nome} — {d.especialidade}
                </option>
              ))}
            </select>
            {errors.dentistaId && <p className="text-xs text-red-600 mt-1">{errors.dentistaId.message}</p>}
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Data do atendimento</label>
            <input
              {...register('data', { required: 'Data é obrigatória.' })}
              type="date"
              className={inputClass}
            />
            {errors.data && <p className="text-xs text-red-600 mt-1">{errors.data.message}</p>}
          </div>

          {submitError && !showStepper && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1E4E8C] text-white font-semibold py-2.5 rounded-lg hover:bg-[#163d70] transition-colors cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'Registrando...' : 'Registrar Caso'}
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
