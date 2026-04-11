import sobre1 from '../../assets/Sobre1.webp'
import sobre2 from '../../assets/Sobre2.jpg'
import SectionTitle from '../../Components/ui/SectionTitle'
import Card from '../../Components/ui/Card'

const technologies = [
  { icon: 'fa-brands fa-react',      name: 'React 19',            desc: 'Biblioteca para construção de interfaces' },
  { icon: 'fa-solid fa-code',        name: 'TypeScript',          desc: 'Tipagem estática para JavaScript' },
  { icon: 'fa-solid fa-bolt',        name: 'Vite 6',              desc: 'Bundler e servidor de desenvolvimento' },
  { icon: 'fa-solid fa-palette',     name: 'Tailwind CSS v4',     desc: 'Estilização utilitária via classes' },
  { icon: 'fa-solid fa-route',       name: 'React Router DOM v7', desc: 'Roteamento entre páginas' },
  { icon: 'fa-solid fa-clipboard-check', name: 'React Hook Form', desc: 'Gerenciamento e validação de formulários' },
  { icon: 'fa-solid fa-icons',       name: 'Font Awesome 6',      desc: 'Ícones vetoriais via CDN' },
]

const roadmap = [
  {
    sprint: 'Sprint 1',
    label: 'Concluído',
    desc: 'Estrutura base em HTML5, CSS3 e JavaScript com páginas principais e layout responsivo.',
  },
  {
    sprint: 'Sprint 2',
    label: 'Concluído',
    desc: 'Responsividade, validações de formulário e interatividade com JavaScript.',
  },
  {
    sprint: 'Sprint 3',
    label: 'Atual',
    desc: 'Migração para React + TypeScript, componentização, roteamento e validação com React Hook Form.',
  },
]

export default function SobrePage() {
  return (
    <>
      {/* Hero */}
      <section className="py-14 text-center border-b border-[#E2E8F0] mb-4">
        <span className="inline-block bg-[#EAF2FF] text-[#1E4E8C] text-sm font-semibold px-4 py-1 rounded-full mb-4 tracking-wide uppercase">
          Sobre o Projeto
        </span>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0F172A] leading-tight mb-4">
          Nuvem do Bem — CRM Social
        </h1>
        <p className="text-[#475569] max-w-2xl mx-auto text-lg">
          Uma plataforma digital desenvolvida para centralizar a gestão da{' '}
          <strong className="text-[#0F172A]">Turma do Bem</strong>, reunindo dentistas
          voluntários, beneficiários e patrocinadores em um único sistema moderno.
        </p>
      </section>

      {/* Problema */}
      <section className="py-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <SectionTitle>O Problema</SectionTitle>
          <p className="text-[#475569] mb-4 leading-relaxed">
            A <strong className="text-[#0F172A]">Turma do Bem</strong> é uma das maiores redes
            de voluntariado odontológico do mundo, reunindo milhares de dentistas que realizam
            atendimentos gratuitos a pessoas em situação de vulnerabilidade social.
          </p>
          <p className="text-[#475569] leading-relaxed">
            Com o crescimento da organização e a expansão para diferentes cidades e países, a
            gestão passou a depender de planilhas, formulários físicos e documentos
            descentralizados — gerando perda de dados, retrabalho e atrasos no acompanhamento
            dos casos.
          </p>
        </div>
        <img
          src={sobre1}
          alt="Pessoas sorrindo representando inclusão social"
          className="w-full max-h-[420px] object-cover rounded-2xl shadow-md"
        />
      </section>

      {/* Solução */}
      <section className="py-12 grid md:grid-cols-2 gap-10 items-center">
        <img
          src={sobre2}
          alt="Voluntários da Turma do Bem em ação"
          className="w-full max-h-[420px] object-cover rounded-2xl shadow-md order-last md:order-first"
        />
        <div>
          <SectionTitle>A Solução</SectionTitle>
          <p className="text-[#475569] mb-4 leading-relaxed">
            O <strong className="text-[#0F172A]">CRM Social — Nuvem do Bem</strong> centraliza
            todas as informações da ONG em uma única plataforma digital, acessível e intuitiva.
          </p>
          <p className="text-[#475569] leading-relaxed">
            Com ele, é possível cadastrar dentistas voluntários, beneficiários e patrocinadores,
            além de registrar cada atendimento realizado — transformando a gestão social em um
            processo simples, moderno e colaborativo.
          </p>
        </div>
      </section>

      {/* Tecnologias */}
      <section className="py-12">
        <SectionTitle center>Tecnologias Utilizadas</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {technologies.map(({ name, desc }) => (
            <Card key={name} className="flex flex-col items-center text-center gap-1 p-6">
              <p className="font-semibold text-[#0F172A] text-sm">{name}</p>
              <p className="text-[#475569] text-xs mt-1 leading-snug">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-12">
        <SectionTitle>Roadmap</SectionTitle>
        <div className="relative pl-6 border-l-2 border-[#E2E8F0] space-y-8">
          {roadmap.map(({ sprint, label, desc }) => {
            const isAtual = label === 'Atual'
            return (
              <div key={sprint} className="relative">
                {/* dot */}
                <span
                  className={`absolute -left-[1.45rem] top-1 w-4 h-4 rounded-full border-2 border-white ${
                    isAtual ? 'bg-[#F29E1F]' : 'bg-[#1E4E8C]'
                  }`}
                />
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-[#0F172A]">{sprint}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isAtual
                        ? 'bg-[#FFF3E0] text-[#F29E1F]'
                        : 'bg-[#EAF2FF] text-[#1E4E8C]'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-[#475569] text-sm leading-relaxed">{desc}</p>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
