import sobre1 from '../../assets/Sobre1.webp'
import sobre2 from '../../assets/Sobre2.jpg'
import SectionTitle from '../../Components/ui/SectionTitle'

export default function SobrePage() {
  return (
    <>
      <section className="py-12">
        <SectionTitle>Problema</SectionTitle>
        <p className="text-[#475569] mb-4">
          A ONG <strong className="font-bold text-[#0F172A]">Turma do Bem</strong> é uma das maiores redes de
          voluntariado odontológico do mundo, reunindo milhares de dentistas que realizam atendimentos gratuitos
          a pessoas em situação de vulnerabilidade social. Com o crescimento da organização e a expansão para
          diferentes cidades e países, a gestão das informações se tornou um grande desafio.
        </p>
        <p className="text-[#475569] mb-6">
          O excesso de planilhas, formulários físicos e documentos descentralizados dificultava o controle de
          voluntários, beneficiários e atendimentos realizados. Muitos dados eram perdidos no processo de
          comunicação entre as equipes, gerando retrabalho, inconsistências e atrasos no acompanhamento dos casos.
        </p>
        <img src={sobre1} alt="Pessoas sorrindo representando inclusão social" className="max-h-[600px] max-w-full mx-auto block rounded-xl" />
      </section>

      <section className="py-12">
        <SectionTitle>Solução</SectionTitle>
        <p className="text-[#475569] mb-4">
          Para resolver esses desafios, o grupo desenvolveu o{' '}
          <strong className="font-bold text-[#0F172A]">CRM Social — Nuvem do Bem</strong>, uma plataforma
          digital que centraliza e organiza todas as informações da Turma do Bem em um único sistema.
        </p>
        <p className="text-[#475569] mb-6">
          Com o sistema, é possível cadastrar dentistas voluntários, beneficiários e patrocinadores, além de
          registrar cada atendimento realizado. A proposta é transformar a gestão da ONG em um processo simples,
          moderno e colaborativo.
        </p>
        <img src={sobre2} alt="Voluntários da Turma do Bem em ação" className="max-h-[600px] max-w-full mx-auto block rounded-xl" />
      </section>

      <section className="py-12">
        <SectionTitle>Tecnologias Utilizadas</SectionTitle>
        <p className="text-[#475569] mb-4">
          O desenvolvimento foi realizado com <strong className="font-bold text-[#0F172A]">HTML5</strong>,{' '}
          <strong className="font-bold text-[#0F172A]">CSS3</strong> e{' '}
          <strong className="font-bold text-[#0F172A]">JavaScript</strong>, com interface responsiva para todos
          os dispositivos.
        </p>
        <p className="text-[#475569]">
          O código segue boas práticas de organização, separando arquivos em pastas específicas e utilizando
          apenas classes no CSS, o que facilita manutenção e escalabilidade.
        </p>
      </section>

      <section className="py-12">
        <SectionTitle>Roadmap</SectionTitle>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-[#475569]"><strong className="font-bold text-[#0F172A]">Sprint 1:</strong> Criação da estrutura base e páginas principais.</li>
          <li className="text-[#475569]"><strong className="font-bold text-[#0F172A]">Sprint 2:</strong> Responsividade, validações e interatividade.</li>
          <li className="text-[#475569]"><strong className="font-bold text-[#0F172A]">Sprint 3:</strong> Integrações e melhorias futuras.</li>
        </ul>
      </section>
    </>
  )
}
