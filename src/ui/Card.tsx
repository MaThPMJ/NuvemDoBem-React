import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <article className={`bg-white border border-[#E2E8F0] rounded-xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] ${className}`}>
      {children}
    </article>
  )
}
