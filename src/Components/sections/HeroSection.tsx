import Button from '../ui/Button'

interface Action {
  label: string
  href: string
  variant?: 'primary' | 'outline'
}

interface HeroSectionProps {
  title: string
  subtitle: string
  image: string
  imageAlt: string
  actions?: Action[]
}

export default function HeroSection({ title, subtitle, image, imageAlt, actions = [] }: HeroSectionProps) {
  return (
    <section className="py-12 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 items-center">
      <div>
        <h1 className="text-[clamp(2rem,3vw,2.75rem)] font-bold leading-tight mb-4 text-[#0F172A]">
          {title}
        </h1>
        <p className="text-[#475569] mb-6">{subtitle}</p>
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {actions.map(({ label, href, variant = 'primary' }) => (
              <Button key={href} href={href} variant={variant}>{label}</Button>
            ))}
          </div>
        )}
      </div>
      <div>
        <img src={image} alt={imageAlt} className="max-w-full h-auto block rounded-xl" />
      </div>
    </section>
  )
}
