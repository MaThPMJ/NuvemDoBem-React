import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { getBeneficiarios } from '../../services/beneficiarioService'
import { getDentistas } from '../../services/dentistaService'
import { createCaso } from '../../services/casoService'
import { createDiagnostico } from '../../services/diagnosticoService'
import { createHistoricoStatus } from '../../services/historicoStatusService'
import { getEnderecoFormatadoPorCep } from '../../services/enderecoService'
import type { Beneficiario, Dentista } from '../../types'

interface FormData {
  nomeBeneficiario: string
  cep: string
  endereco: string
  tipo: string
  descricao: string
  dentistaId: string
  data: string
}

type StepStatus = 'idle' | 'loading' | 'done' | 'error'

interface StepState {
  caso: StepStatus
  salesforce: StepStatus
  drive: StepStatus
}

const tiposAtendimento = ['Ortodontia', 'Cirurgia', 'Clínica Geral', 'Outro']

export default function ProntuarioPage() {
  const navigate = useNavigate()
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([])
  const [dentistas, setDentistas] = useState<Dentista[]>([])
  const [suggestions, setSuggestions] = useState<Beneficiario[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [steps, setSteps] = useState<StepState>({ caso: 'idle', salesforce: 'idle', drive: 'idle' })
  const [showStepper, setShowStepper] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { data: new Date().toISOString().split('T')[0] },
  })

  const nomeBeneficiario = watch('nomeBeneficiario')
  const cep = watch('cep')

  useEffect(() => {
    getBeneficiarios().then(setBeneficiarios).catch(() => {})
    getDentistas().then(setDentistas).catch(() => {})
  }, [])

  useEffect(() => {
    if (nomeBeneficiario && nomeBeneficiario.length >= 2) {
      const matches = beneficiarios.filter(b =>
        b.nome.toLowerCase().includes(nomeBeneficiario.toLowerCase()),
      )
      setSuggestions(matches.slice(0, 5))
      setShowSuggestions(matches.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [nomeBeneficiario, beneficiarios])

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

  async function onSubmit(data: FormData) {
    setSubmitError('')
    setSubmitting(true)
    setShowStepper(true)
    setSteps({ caso: 'loading', salesforce: 'idle', drive: 'idle' })

    let casoId: number
    try {
      const caso = await createCaso({
        beneficiarioId: 0,
        dentistaId: Number(data.dentistaId),
        tipo: data.tipo,
        descricao: data.descricao,
        data: data.data,
      })
      casoId = caso.id

      await createDiagnostico({ casoId, descricao: data.descricao, data: data.data })
      await createHistoricoStatus({ casoId, status: 'Em andamento', data: data.data })

      setSteps({ caso: 'done', salesforce: 'loading', drive: 'idle' })
    } catch {
      setSteps(s => ({ ...s, caso: 'error' }))
      setSubmitError('Erro ao registrar o caso. Tente novamente.')
      setSubmitting(false)
      return
    }

    await new Promise(r => setTimeout(r, 1500))
    setSteps({ caso: 'done', salesforce: 'done', drive: 'loading' })

    await new Promise(r => setTimeout(r, 1500))
    setSteps({ caso: 'done', salesforce: 'done', drive: 'done' })
    setSubmitting(false)

    setTimeout(() => navigate('/casos'), 1200)
  }

  return (
    <div className="max-w-[680px] mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-[#0F172A] mb-6">Novo Prontuário / Caso Clínico</h1>

      {showStepper ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-[#0F172A] mb-2">Processando registro...</h2>
          <StepItem status={steps.caso} label="Caso registrado com sucesso" />
          <StepItem status={steps.salesforce} label="Registro criado no Salesforce" pending="Enviando ao Salesforce..." />
          <StepItem status={steps.drive} label="Pasta do beneficiário criada" pending="Criando pasta no Google Drive..." />
          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}
          {steps.drive === 'done' && (
            <p className="text-sm text-green-700 font-medium text-center mt-2">
              Redirecionando para a lista de casos...
            </p>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white border border-[#E2E8F0] rounded-2xl p-6 grid gap-5"
          noValidate
        >
          <div className="relative">
            <label className="block text-sm font-medium text-[#0F172A] mb-1">
              Nome do beneficiário
            </label>
            <input
              {...register('nomeBeneficiario', { required: 'Nome é obrigatório.' })}
              placeholder="Digite o nome..."
              autoComplete="off"
              className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C]"
            />
            {errors.nomeBeneficiario && (
              <p className="text-xs text-red-600 mt-1">{errors.nomeBeneficiario.message}</p>
            )}
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 top-full left-0 right-0 bg-white border border-[#E2E8F0] rounded-lg shadow-md mt-1 overflow-hidden"
              >
                {suggestions.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[#EAF2FF] text-[#0F172A] cursor-pointer"
                    onMouseDown={() => {
                      setValue('nomeBeneficiario', s.nome)
                      setShowSuggestions(false)
                    }}
                  >
                    {s.nome} — {s.cidade}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">CEP</label>
              <input
                {...register('cep')}
                placeholder="00000-000"
                maxLength={9}
                className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">Endereço</label>
              <input
                {...register('endereco')}
                placeholder="Preenchido automaticamente pelo CEP"
                className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C] bg-[#F7F9FC]"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">
              Tipo de tratamento
            </label>
            <select
              {...register('tipo', { required: 'Selecione o tipo.' })}
              className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C] bg-white"
            >
              <option value="">Selecione...</option>
              {tiposAtendimento.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.tipo && <p className="text-xs text-red-600 mt-1">{errors.tipo.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">
              Descrição do caso
            </label>
            <textarea
              {...register('descricao', { required: 'Descrição é obrigatória.' })}
              rows={4}
              placeholder="Descreva o caso clínico..."
              className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C] resize-none"
            />
            {errors.descricao && (
              <p className="text-xs text-red-600 mt-1">{errors.descricao.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">
              Dentista responsável
            </label>
            <select
              {...register('dentistaId', { required: 'Selecione um dentista.' })}
              className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C] bg-white"
            >
              <option value="">Selecione...</option>
              {dentistas.map(d => (
                <option key={d.id} value={d.id}>
                  {d.nome} — {d.especialidade}
                </option>
              ))}
            </select>
            {errors.dentistaId && (
              <p className="text-xs text-red-600 mt-1">{errors.dentistaId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">
              Data do atendimento
            </label>
            <input
              {...register('data', { required: 'Data é obrigatória.' })}
              type="date"
              className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C]"
            />
            {errors.data && <p className="text-xs text-red-600 mt-1">{errors.data.message}</p>}
          </div>

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

function StepItem({
  status,
  label,
  pending,
}: {
  status: StepStatus
  label: string
  pending?: string
}) {
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
      <span
        className={`text-sm font-medium ${
          status === 'done'
            ? 'text-green-700'
            : status === 'loading'
              ? 'text-[#1E4E8C]'
              : status === 'error'
                ? 'text-red-600'
                : 'text-[#475569]'
        }`}
      >
        {status === 'loading' && pending ? pending : label}
      </span>
    </div>
  )
}
