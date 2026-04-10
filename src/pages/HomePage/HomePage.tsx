import heroImg from '../../assets/Imagem_Principal.jpg'
import HeroSection from '../../Components/sections/HeroSection'
import BenefitsSection from '../../Components/sections/BenefitsSection'

const benefits = [
  {
    icon: 'fa-solid fa-sitemap',
    title: 'Centralização',
    description: 'Todos os contatos em uma plataforma única.',
  },
  {
    icon: 'fa-solid fa-square-up-right',
    title: 'Encaminhamento automático',
    description: 'Direcione mensagens para as áreas responsáveis.',
  },
  {
    icon: 'fa-solid fa-file',
    title: 'Status e relatórios',
    description: 'Acompanhe em aberto, andamento e concluído e gere insights.',
  },
]

export default function HomePage() {
  return (
    <>
      <HeroSection
        title="Centralize atendimentos. Responda com agilidade."
        subtitle="Uma plataforma única para organizar contatos de dentistas voluntários, beneficiados, doadores e pessoas que solicitam ajuda."
        image={heroImg}
        imageAlt="Pessoa sorrindo em consultório"
        actions={[
          { label: 'Conheça a solução', href: '/sobre' },
          { label: 'Conheça a TdB', href: '/tdb', variant: 'outline' },
        ]}
      />
      <BenefitsSection benefits={benefits} />
    </>
  )
}
