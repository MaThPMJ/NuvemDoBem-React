import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { integrantes } from '../../data/integrantes'
import { usePageTitle } from '../../hooks/usePageTitle'

export default function IntegranteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const membro = integrantes.find(i => i.id === id)

  usePageTitle(membro ? membro.nome : 'Integrante')

  useEffect(() => {
    if (!membro) navigate('/integrantes', { replace: true })
  }, [membro, navigate])

  if (!membro) return null

  return (
    <section className="py-12 max-w-[600px] mx-auto">
      <Link
        to="/integrantes"
        className="inline-flex items-center gap-2 text-[#1E4E8C] hover:underline mb-8 no-underline"
      >
        <i className="fa-solid fa-arrow-left" />
        Voltar para Integrantes
      </Link>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
        <img
          src={membro.foto}
          alt={membro.nome}
          className="w-36 h-36 object-cover rounded-full mx-auto mb-4 border-4 border-[#EAF2FF]"
        />
        <h1 className="text-2xl font-bold text-[#0F172A] mb-1">{membro.nome}</h1>
        <p className="text-[#1E4E8C] font-semibold mb-1">{membro.papel}</p>
        <p className="text-[#475569] text-sm mb-4">RM: {membro.rm} • Turma: {membro.turma}</p>
        <p className="text-[#475569] mb-6">{membro.bio}</p>
        <div className="flex justify-center gap-4">
          <a
            href={membro.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 border border-[#E2E8F0] text-[#0F172A] hover:bg-[#EAF2FF] transition-colors no-underline"
          >
            <i className="fa-brands fa-github" /> GitHub
          </a>
          <a
            href={membro.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 border border-[#E2E8F0] text-[#0F172A] hover:bg-[#EAF2FF] transition-colors no-underline"
          >
            <i className="fa-brands fa-linkedin" /> LinkedIn
          </a>
        </div>
      </div>
    </section>
  )
}
