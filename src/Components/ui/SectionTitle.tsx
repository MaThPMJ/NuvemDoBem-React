import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  center?: boolean
}

export default function SectionTitle({ children, center = false }: Props) {
  return (
    <h2 className={`text-[clamp(1.5rem,2.2vw,2rem)] font-bold mb-6 text-[#0F172A] ${center ? 'text-center' : ''}`}>
      {children}
    </h2>
  )
}
