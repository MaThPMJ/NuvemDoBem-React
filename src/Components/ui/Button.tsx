import type { ReactNode } from 'react'

type Variant = 'primary' | 'outline'

interface Props {
  variant?: Variant
  href?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
}

const base = 'inline-block rounded-lg px-5 py-3 font-semibold no-underline transition-all cursor-pointer'
const variants: Record<Variant, string> = {
  primary: 'bg-[#1E4E8C] text-white hover:brightness-90',
  outline: 'border border-[#1E4E8C] text-[#1E4E8C] bg-white hover:bg-[#EAF2FF]',
}

export default function Button({ variant = 'primary', href, target, rel, type = 'button', children }: Props) {
  const cls = `${base} ${variants[variant]}`
  if (href) {
    return <a href={href} target={target} rel={rel} className={cls}>{children}</a>
  }
  return <button type={type} className={cls}>{children}</button>
}
