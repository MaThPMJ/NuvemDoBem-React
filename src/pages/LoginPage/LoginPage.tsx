import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import SectionTitle from '../../Components/ui/SectionTitle'
import Input from '../../Components/ui/Input'
import Button from '../../Components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import type { UserTipo } from '../../context/AuthContext'

interface LoginFormData {
  email: string
  senha: string
}

type ApiStatus = 'checking' | 'online' | 'offline'

const homeByTipo: Record<UserTipo, string> = {
  integrante: '/dashboard',
  dentista: '/area-dentista',
  beneficiario: '/area-beneficiario',
  patrocinador: '/area-patrocinador',
}

const tipoOptions: { value: UserTipo; label: string; icon: string }[] = [
  { value: 'integrante', label: 'Funcionário', icon: 'fa-solid fa-user-tie' },
  { value: 'dentista', label: 'Dentista', icon: 'fa-solid fa-user-doctor' },
  { value: 'beneficiario', label: 'Beneficiário', icon: 'fa-solid fa-user' },
  { value: 'patrocinador', label: 'Patrocinador', icon: 'fa-solid fa-building' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  const [tipo, setTipo] = useState<UserTipo>('integrante')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('https://javasprint.onrender.com/integrantes')
      .then(r => setApiStatus(r.ok ? 'online' : 'offline'))
      .catch(() => setApiStatus('offline'))
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()

  async function onSubmit(data: LoginFormData) {
    setError('')
    setLoading(true)
    try {
      await login(data.email, data.senha, tipo)
      navigate(homeByTipo[tipo])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-12 max-w-[420px] mx-auto">
      <SectionTitle>Acesse sua conta</SectionTitle>

      <div className={`flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-2 mb-4 border ${
        apiStatus === 'checking'
          ? 'bg-gray-50 border-gray-200 text-gray-500'
          : apiStatus === 'online'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
      }`}>
        <span className={`w-2 h-2 rounded-full shrink-0 ${
          apiStatus === 'checking' ? 'bg-gray-400 animate-pulse'
          : apiStatus === 'online' ? 'bg-green-500'
          : 'bg-red-500'
        }`} />
        {apiStatus === 'checking' && 'Verificando conexão com a API...'}
        {apiStatus === 'online' && 'API conectada'}
        {apiStatus === 'offline' && 'API temporariamente indisponível — tente novamente mais tarde'}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-[#E2E8F0] rounded-xl p-6 grid gap-4"
        noValidate
      >
        <div>
          <p className="text-sm font-medium text-[#0F172A] mb-2">Entrar como:</p>
          <div className="grid grid-cols-2 gap-2">
            {tipoOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setTipo(opt.value); setError('') }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                  tipo === opt.value
                    ? 'border-[#1E4E8C] bg-[#EAF2FF] text-[#1E4E8C]'
                    : 'border-[#E2E8F0] text-[#475569] hover:border-[#1E4E8C]'
                }`}
              >
                <i className={`${opt.icon} text-xs`} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="E-mail"
          name="email"
          type="email"
          registration={register('email', {
            required: 'E-mail é obrigatório.',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Informe um e-mail válido.' },
          })}
          error={errors.email?.message}
        />
        <Input
          label="Senha"
          name="senha"
          type="password"
          registration={register('senha', {
            required: 'Senha é obrigatória.',
            minLength: { value: 4, message: 'A senha deve ter pelo menos 4 caracteres.' },
          })}
          error={errors.senha?.message}
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit">{loading ? 'Entrando...' : 'Entrar'}</Button>
      </form>

      <p className="text-sm text-[#475569] mt-6 text-center">
        Não tem conta?{' '}
        <Link to="/cadastro" className="text-[#1E4E8C] font-semibold hover:underline">
          Cadastre-se
        </Link>
      </p>
    </section>
  )
}
