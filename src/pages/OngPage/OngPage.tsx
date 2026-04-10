import turmadobem from '../../assets/turmadobem.jpg'
import Card from '../../Components/ui/Card'
import Button from '../../Components/ui/Button'
import SectionTitle from '../../Components/ui/SectionTitle'

const impactos = [
  { title: 'Dentistas voluntários', description: 'Uma das maiores redes de voluntariado odontológico do mundo.' },
  { title: 'Jovens atendidos', description: 'Crianças e adolescentes recebem tratamento completo até os 18 anos.' },
  { title: 'Presença internacional', description: 'Atuação em diversos países e centenas de cidades brasileiras.' },
]

export default function OngPage() {
  return (
    <>
      <section className="py-12">
        <SectionTitle>Conheça a Turma do Bem</SectionTitle>
        <img src={turmadobem} alt="Ações sociais da Turma do Bem" className="max-w-full h-auto block rounded-xl mb-6" />
        <p className="text-[#475569] mb-4">
          A <strong className="font-bold text-[#0F172A]">Turma do Bem</strong> é uma organização sem fins
          lucrativos que promove inclusão social por meio da saúde bucal, reunindo milhares de dentistas
          voluntários que oferecem atendimentos gratuitos a quem mais precisa.
        </p>
        <p className="text-[#475569]">
          Criada com o propósito de levar sorrisos e oportunidades, a ONG atua com projetos que transformam
          vidas, como o <strong className="font-bold text-[#0F172A]">Dentista do Bem</strong> e o{' '}
          <strong className="font-bold text-[#0F172A]">Apolônias do Bem</strong>.
        </p>
      </section>

      <section className="py-12">
        <SectionTitle>Impacto Social</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {impactos.map(({ title, description }) => (
            <Card key={title}>
              <h3 className="text-xl font-bold mb-2 text-[#0F172A]">{title}</h3>
              <p className="text-[#475569]">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-8 text-center">
        <SectionTitle center>Quer saber mais?</SectionTitle>
        <p className="text-[#475569] mb-6">
          Acesse o site oficial da Turma do Bem e conheça os projetos sociais, ações e campanhas que
          transformam vidas todos os dias.
        </p>
        <Button href="https://www.turmadobem.org.br/" target="_blank" rel="noopener noreferrer">
          Site oficial da TdB
        </Button>
      </section>
    </>
  )
}
