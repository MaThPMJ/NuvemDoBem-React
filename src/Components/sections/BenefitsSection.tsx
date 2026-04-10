import Card from '../ui/Card'
import SectionTitle from '../ui/SectionTitle'

interface Benefit {
  icon: string
  title: string
  description: string
}

interface BenefitsSectionProps {
  title?: string
  benefits: Benefit[]
}

export default function BenefitsSection({ title = 'O que sua equipe ganha', benefits }: BenefitsSectionProps) {
  return (
    <section className="py-12">
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {benefits.map(({ icon, title: cardTitle, description }) => (
          <Card key={cardTitle}>
            <i className={`${icon} block pb-5 text-[#1E4E8C] text-2xl`} />
            <h3 className="text-xl font-bold mb-2 text-[#0F172A]">{cardTitle}</h3>
            <p className="text-[#475569]">{description}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
