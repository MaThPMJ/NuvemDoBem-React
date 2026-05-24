import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import SectionTitle from '../../Components/ui/SectionTitle'
import Input from '../../Components/ui/Input'
import Button from '../../Components/ui/Button'
import { apiFetch } from '../../services/api'
import { maskCPF, maskPhone, maskCNPJCPF } from '../../utils/masks'

const inputClass = 'w-full px-3 py-3 border border-[#E2E8F0] rounded-lg font-[inherit] text-[#0F172A] bg-white focus:outline-2 focus:outline-[#F29E1F] focus:outline-offset-2'

type TipoCadastro = 'dentista' | 'patrocinador' | 'beneficiario' | 'funcionario'

interface DentistaForm {
  nome: string
  email: string
  senha: string
  cro: string
  especialidade: string
  telefone: string
}

interface PatrocinadorForm {
  nome: string
  email: string
  senha: string
  cnpjCpf: string
  telefone: string
}

interface BeneficiarioForm {
  nome: string
  email: string
  senha: string
  cpf: string
  dataNascimento: string
  telefone: string
  endereco: string
}

interface FuncionarioForm {
  nome: string
  email: string
  cargo: string
  senha: string
}

const tipos = [
  {
    id: 'dentista' as TipoCadastro,
    icon: 'fa-solid fa-tooth',
    titulo: 'Dentista Voluntário',
    descricao: 'Profissional que deseja oferecer atendimento gratuito.',
  },
  {
    id: 'patrocinador' as TipoCadastro,
    icon: 'fa-solid fa-hand-holding-heart',
    titulo: 'Patrocinador',
    descricao: 'Empresa ou pessoa que apoia financeiramente a ONG.',
  },
  {
    id: 'beneficiario' as TipoCadastro,
    icon: 'fa-solid fa-user',
    titulo: 'Beneficiário',
    descricao: 'Pessoa que busca atendimento odontológico gratuito.',
  },
  {
    id: 'funcionario' as TipoCadastro,
    icon: 'fa-solid fa-id-badge',
    titulo: 'Funcionário TDB',
    descricao: 'Membro da equipe interna da organização.',
  },
]

function FormDentista({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [telError, setTelError] = useState('')
  const telRef = useRef('')
  const { register, handleSubmit, formState: { errors } } = useForm<DentistaForm>()

  async function onSubmit(data: DentistaForm) {
    setError('')
    if (!telRef.current) { setTelError('Telefone é obrigatório.'); return }
    setTelError('')
    setLoading(true)
    try {
      await apiFetch('/dentistas', {
        method: 'POST',
        body: JSON.stringify({
          idDentista: Date.now() % 100000,
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          cro: data.cro,
          especialidade: data.especialidade,
          telefone: telRef.current,
        }),
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <Input label="Nome completo" name="nome"
        registration={register('nome', { required: 'Nome é obrigatório.' })}
        error={errors.nome?.message} />
      <Input label="E-mail" name="email" type="email"
        registration={register('email', {
          required: 'E-mail é obrigatório.',
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Informe um e-mail válido.' },
        })}
        error={errors.email?.message} />
      <Input label="Senha" name="senha" type="password"
        registration={register('senha', {
          required: 'Senha é obrigatória.',
          minLength: { value: 6, message: 'Mínimo de 6 caracteres.' },
        })}
        error={errors.senha?.message} />
      <Input label="CRO (ex: SP-12345)" name="cro"
        registration={register('cro', { required: 'CRO é obrigatório.' })}
        error={errors.cro?.message} />
      <Input label="Especialidade" name="especialidade"
        registration={register('especialidade', { required: 'Especialidade é obrigatória.' })}
        error={errors.especialidade?.message} />
      <div>
        <label htmlFor="telD" className="font-semibold text-[#0F172A] mb-1.5 block">Telefone</label>
        <input id="telD" type="tel" className={inputClass}
          onChange={(e) => { const m = maskPhone(e.target.value); e.target.value = m; telRef.current = m.replace(/\D/g, ''); if (telError) setTelError('') }} />
        {telError && <p className="text-red-700 text-sm mt-1">{telError}</p>}
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      <Button type="submit">{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
    </form>
  )
}

function FormPatrocinador({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cnpjError, setCnpjError] = useState('')
  const [telError, setTelError] = useState('')
  const cnpjRef = useRef('')
  const telRef = useRef('')
  const { register, handleSubmit, formState: { errors } } = useForm<PatrocinadorForm>()

  async function onSubmit(data: PatrocinadorForm) {
    setError('')
    let hasErr = false
    if (!cnpjRef.current) { setCnpjError('CNPJ ou CPF é obrigatório.'); hasErr = true } else setCnpjError('')
    if (!telRef.current) { setTelError('Telefone é obrigatório.'); hasErr = true } else setTelError('')
    if (hasErr) return
    setLoading(true)
    try {
      await apiFetch('/patrocinadores', {
        method: 'POST',
        body: JSON.stringify({
          idPatrocinador: Date.now() % 100000,
          nome: data.nome,
          contato: data.email,
          email: data.email,
          senha: data.senha,
          cpfCnpj: cnpjRef.current,
          telefone: telRef.current,
          anonimo: 'N',
        }),
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <Input label="Nome / Razão Social" name="nome"
        registration={register('nome', { required: 'Nome ou Razão Social é obrigatório.' })}
        error={errors.nome?.message} />
      <Input label="E-mail" name="email" type="email"
        registration={register('email', {
          required: 'E-mail é obrigatório.',
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Informe um e-mail válido.' },
        })}
        error={errors.email?.message} />
      <Input label="Senha" name="senha" type="password"
        registration={register('senha', {
          required: 'Senha é obrigatória.',
          minLength: { value: 6, message: 'Mínimo de 6 caracteres.' },
        })}
        error={errors.senha?.message} />
      <div>
        <label htmlFor="cnpjCpf" className="font-semibold text-[#0F172A] mb-1.5 block">CNPJ / CPF</label>
        <input id="cnpjCpf" type="text" className={inputClass}
          onChange={(e) => { const m = maskCNPJCPF(e.target.value); e.target.value = m; cnpjRef.current = m.replace(/\D/g, ''); if (cnpjError) setCnpjError('') }} />
        {cnpjError && <p className="text-red-700 text-sm mt-1">{cnpjError}</p>}
      </div>
      <div>
        <label htmlFor="telP" className="font-semibold text-[#0F172A] mb-1.5 block">Telefone</label>
        <input id="telP" type="tel" className={inputClass}
          onChange={(e) => { const m = maskPhone(e.target.value); e.target.value = m; telRef.current = m.replace(/\D/g, ''); if (telError) setTelError('') }} />
        {telError && <p className="text-red-700 text-sm mt-1">{telError}</p>}
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      <Button type="submit">{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
    </form>
  )
}

function FormBeneficiario({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [telError, setTelError] = useState('')
  const cpfRef = useRef('')
  const telRef = useRef('')
  const { register, handleSubmit, formState: { errors } } = useForm<BeneficiarioForm>()

  async function onSubmit(data: BeneficiarioForm) {
    setError('')
    let hasErr = false
    if (!cpfRef.current) { setCpfError('CPF é obrigatório.'); hasErr = true } else setCpfError('')
    if (!telRef.current) { setTelError('Telefone é obrigatório.'); hasErr = true } else setTelError('')
    if (hasErr) return
    setLoading(true)
    try {
      await apiFetch('/beneficiarios', {
        method: 'POST',
        body: JSON.stringify({
          idBeneficiario: Date.now() % 100000,
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          cpf: cpfRef.current,
          dataNascimento: data.dataNascimento,
          telefone: telRef.current,
          endereco: data.endereco || undefined,
        }),
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <Input label="Nome completo" name="nome"
        registration={register('nome', { required: 'Nome é obrigatório.' })}
        error={errors.nome?.message} />
      <Input label="E-mail" name="email" type="email"
        registration={register('email', {
          required: 'E-mail é obrigatório.',
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Informe um e-mail válido.' },
        })}
        error={errors.email?.message} />
      <Input label="Senha" name="senha" type="password"
        registration={register('senha', {
          required: 'Senha é obrigatória.',
          minLength: { value: 6, message: 'Mínimo de 6 caracteres.' },
        })}
        error={errors.senha?.message} />
      <div>
        <label htmlFor="cpfB" className="font-semibold text-[#0F172A] mb-1.5 block">CPF</label>
        <input id="cpfB" type="text" className={inputClass}
          onChange={(e) => { const m = maskCPF(e.target.value); e.target.value = m; cpfRef.current = m.replace(/\D/g, ''); if (cpfError) setCpfError('') }} />
        {cpfError && <p className="text-red-700 text-sm mt-1">{cpfError}</p>}
      </div>
      <Input label="Data de nascimento" name="dataNascimento" type="date"
        registration={register('dataNascimento', { required: 'Data de nascimento é obrigatória.' })}
        error={errors.dataNascimento?.message} />
      <div>
        <label htmlFor="telB" className="font-semibold text-[#0F172A] mb-1.5 block">Telefone</label>
        <input id="telB" type="tel" className={inputClass}
          onChange={(e) => { const m = maskPhone(e.target.value); e.target.value = m; telRef.current = m.replace(/\D/g, ''); if (telError) setTelError('') }} />
        {telError && <p className="text-red-700 text-sm mt-1">{telError}</p>}
      </div>
      <Input label="Endereço" name="endereco"
        registration={register('endereco', { required: 'Endereço é obrigatório.' })}
        error={errors.endereco?.message} />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      <Button type="submit">{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
    </form>
  )
}

function FormFuncionario({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<FuncionarioForm>()

  async function onSubmit(data: FuncionarioForm) {
    setError('')
    setLoading(true)
    try {
      await apiFetch('/integrantes', {
        method: 'POST',
        body: JSON.stringify({
          idIntegrante: Date.now() % 100000,
          nome: data.nome,
          email: data.email,
          cargo: data.cargo,
          senha: data.senha,
        }),
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <Input label="Nome completo" name="nome"
        registration={register('nome', { required: 'Nome é obrigatório.' })}
        error={errors.nome?.message} />
      <Input label="E-mail" name="email" type="email"
        registration={register('email', {
          required: 'E-mail é obrigatório.',
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Informe um e-mail válido.' },
        })}
        error={errors.email?.message} />
      <Input label="Cargo" name="cargo"
        registration={register('cargo', { required: 'Cargo é obrigatório.' })}
        error={errors.cargo?.message} />
      <Input label="Senha" name="senha" type="password"
        registration={register('senha', {
          required: 'Senha é obrigatória.',
          minLength: { value: 6, message: 'Mínimo de 6 caracteres.' },
        })}
        error={errors.senha?.message} />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      <Button type="submit">{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
    </form>
  )
}

export default function CadastroPage() {
  const [tipo, setTipo] = useState<TipoCadastro | null>(null)
  const [success, setSuccess] = useState(false)

  if (success) {
    return (
      <section className="py-12 max-w-[480px] mx-auto text-center">
        <i className="fa-solid fa-circle-check text-5xl text-green-600 mb-4 block" />
        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Cadastro realizado!</h2>
        <p className="text-[#475569] mb-2">Seu cadastro foi concluído com sucesso.</p>
        <div className="mt-4">
          <Link to="/login" className="inline-block rounded-lg px-5 py-3 font-semibold bg-[#1E4E8C] text-white no-underline hover:brightness-90 transition-all">
            Ir para o login
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 max-w-[560px] mx-auto">
      <SectionTitle>Criar conta</SectionTitle>

      {!tipo ? (
        <>
          <p className="text-[#475569] mb-6">Selecione o tipo de cadastro:</p>
          <div className="grid gap-4">
            {tipos.map(({ id, icon, titulo, descricao }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTipo(id)}
                className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-xl p-5 text-left cursor-pointer hover:border-[#1E4E8C] hover:bg-[#EAF2FF] transition-all"
              >
                <i className={`${icon} text-2xl text-[#1E4E8C] w-8 shrink-0`} />
                <div>
                  <p className="font-bold text-[#0F172A] mb-0.5">{titulo}</p>
                  <p className="text-sm text-[#475569]">{descricao}</p>
                </div>
                <i className="fa-solid fa-chevron-right text-[#1E4E8C] ml-auto" />
              </button>
            ))}
          </div>
          <p className="text-sm text-[#475569] mt-6 text-center">
            Já tem conta?{' '}
            <Link to="/login" className="text-[#1E4E8C] font-semibold hover:underline">
              Faça login
            </Link>
          </p>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setTipo(null)}
            className="flex items-center gap-2 text-[#1E4E8C] text-sm font-semibold mb-6 bg-transparent border-none cursor-pointer p-0 hover:underline"
          >
            <i className="fa-solid fa-arrow-left" /> Voltar
          </button>

          <div className="flex items-center gap-3 mb-6 p-4 bg-[#EAF2FF] rounded-xl">
            <i className={`${tipos.find(t => t.id === tipo)!.icon} text-xl text-[#1E4E8C]`} />
            <span className="font-bold text-[#1E4E8C]">
              {tipos.find(t => t.id === tipo)!.titulo}
            </span>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
            {tipo === 'dentista' && <FormDentista onSuccess={() => setSuccess(true)} />}
            {tipo === 'patrocinador' && <FormPatrocinador onSuccess={() => setSuccess(true)} />}
            {tipo === 'beneficiario' && <FormBeneficiario onSuccess={() => setSuccess(true)} />}
            {tipo === 'funcionario' && <FormFuncionario onSuccess={() => setSuccess(true)} />}
          </div>

          <p className="text-sm text-[#475569] mt-6 text-center">
            Já tem conta?{' '}
            <Link to="/login" className="text-[#1E4E8C] font-semibold hover:underline">
              Faça login
            </Link>
          </p>
        </>
      )}
    </section>
  )
}
