import { Link } from 'react-router-dom'
import { integrantes } from '../../data/integrantes'
import Card from '../../Components/ui/Card'
import SectionTitle from '../../Components/ui/SectionTitle'
import { usePageTitle } from '../../hooks/usePageTitle'

export default function IntegrantesListPage() {
  usePageTitle('Integrantes')

  return (
    <section className="py-12">
      <SectionTitle>Quem somos</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {integrantes.map(({ id, nome, rm, turma, foto, papel }) => (
          <Card key={rm} className="flex flex-col">
            <img src={foto} alt={nome} className="max-w-full h-auto block rounded-xl mb-4" />
            <h3 className="text-xl font-bold mt-3 mb-1 text-[#0F172A]">{nome}</h3>
            <p className="text-[#1E4E8C] text-sm font-semibold mb-1">{papel}</p>
            <p className="text-[#475569] mb-4">RM: {rm} • Turma: {turma}</p>
            <Link
              to={`/integrantes/${id}`}
              className="mt-auto inline-block text-center rounded-lg px-4 py-2 border border-[#1E4E8C] text-[#1E4E8C] hover:bg-[#EAF2FF] transition-colors no-underline text-sm font-semibold"
            >
              Ver perfil
            </Link>
          </Card>
        ))}
      </div>
    </section>
  )
}
