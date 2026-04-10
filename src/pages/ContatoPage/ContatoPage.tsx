import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import SectionTitle from '../../Components/ui/SectionTitle'
import Input from '../../Components/ui/Input'
import Button from '../../Components/ui/Button'
import { usePageTitle } from '../../hooks/usePageTitle'

interface ContatoFormData {
  nome: string
  email: string
  assunto: string
  mensagem: string
}

export default function ContatoPage() {
  usePageTitle('Contato')

  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContatoFormData>()

  useEffect(() => {
    if (!success) return

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)

    const redirect = setTimeout(() => navigate('/'), 3000)

    return () => {
      clearInterval(timer)
      clearTimeout(redirect)
    }
  }, [success, navigate])

  function onSubmit() {
    setSuccess(true)
    reset()
  }

  return (
    <section className="py-12">
      <SectionTitle>Fale com a equipe</SectionTitle>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-[#E2E8F0] rounded-xl p-6 grid gap-4"
        noValidate
      >
        <Input
          label="Nome"
          name="nome"
          registration={register('nome', { required: 'Nome é obrigatório.' })}
          error={errors.nome?.message}
        />
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
          label="Assunto"
          name="assunto"
          registration={register('assunto', { required: 'Assunto é obrigatório.' })}
          error={errors.assunto?.message}
        />
        <Input
          label="Mensagem"
          name="mensagem"
          as="textarea"
          rows={6}
          registration={register('mensagem', { required: 'Mensagem é obrigatória.' })}
          error={errors.mensagem?.message}
        />

        <Button type="submit">Enviar</Button>

        {success && (
          <p className="text-green-800" aria-live="polite">
            Mensagem enviada! Redirecionando em {countdown}s...
          </p>
        )}
      </form>
    </section>
  )
}
