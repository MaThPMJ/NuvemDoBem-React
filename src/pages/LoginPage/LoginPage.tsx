import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import SectionTitle from '../../Components/ui/SectionTitle'
import Input from '../../Components/ui/Input'
import Button from '../../Components/ui/Button'
import { useAuth } from '../../context/AuthContext'

interface LoginFormData {
  email: string
  senha: string
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()

  function onSubmit(data: LoginFormData) {
    login(data.email)
    navigate('/dashboard')
  }

  return (
    <section className="py-12 max-w-[420px] mx-auto">
      <SectionTitle>Acesse sua conta</SectionTitle>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-[#E2E8F0] rounded-xl p-6 grid gap-4"
        noValidate
      >
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
            minLength: { value: 6, message: 'A senha deve ter pelo menos 6 caracteres.' },
          })}
          error={errors.senha?.message}
        />

        <Button type="submit">Entrar</Button>
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
