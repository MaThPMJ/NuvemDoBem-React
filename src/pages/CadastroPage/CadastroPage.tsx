import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import SectionTitle from '../../Components/ui/SectionTitle'
import Input from '../../Components/ui/Input'
import Button from '../../Components/ui/Button'
import { apiFetch } from '../../services/api'
import { maskCPF, maskPhone, maskCNPJCPF } from '../../utils/masks'

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
  const { register, handleSubmit, formState: { errors } } = useForm<DentistaForm>()

  async function onSubmit(data: DentistaForm) {
    setError('')
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
          telefone: data.telefone,
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
      <Input label="Telefone" name="telefone" type="tel"
        registration={register('telefone', { required: 'Telefone é obrigatório.' })}
        mask={maskPhone}
        error={errors.telefone?.message} />
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
  const { register, handleSubmit, formState: { errors } } = useForm<PatrocinadorForm>()

  async function onSubmit(data: PatrocinadorForm) {
    setError('')
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
          cnpjCpf: data.cnpjCpf,
          telefone: data.telefone,
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
      <Input label="CNPJ / CPF" name="cnpjCpf"
        registration={register('cnpjCpf', { required: 'CNPJ ou CPF é obrigatório.' })}
        mask={maskCNPJCPF}
        error={errors.cnpjCpf?.message} />
      <Input label="Telefone" name="telefone" type="tel"
        registration={register('telefone', { required: 'Telefone é obrigatório.' })}
        mask={maskPhone}
        error={errors.telefone?.message} />
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
  const { register, handleSubmit, formState: { errors } } = useForm<BeneficiarioForm>()

  async function onSubmit(data: BeneficiarioForm) {
    setError('')
    setLoading(true)
    try {
      await apiFetch('/beneficiarios', {
        method: 'POST',
        body: JSON.stringify({
          idBeneficiario: Date.now() % 100000,
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          cpf: data.cpf,
          dataNascimento: data.dataNascimento,
          telefone: data.telefone,
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
      <Input label="CPF" name="cpf"
        registration={register('cpf', { required: 'CPF é obrigatório.' })}
        mask={maskCPF}
        error={errors.cpf?.message} />
      <Input label="Data de nascimento" name="dataNascimento" type="date"
        registration={register('dataNascimento', { required: 'Data de nascimento é obrigatória.' })}
        error={errors.dataNascimento?.message} />
      <Input label="Telefone" name="telefone" type="tel"
        registration={register('telefone', { required: 'Telefone é obrigatório.' })}
        mask={maskPhone}
        error={errors.telefone?.message} />
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
