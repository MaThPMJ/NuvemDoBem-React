import { useState } from 'react'
import SectionTitle from '../ui/SectionTitle'

interface FaqItem {
  question: string
  answer: string
}

interface FaqSectionProps {
  title?: string
  faqs: FaqItem[]
}

export default function FaqSection({ title = 'Perguntas frequentes', faqs }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i))

  return (
    <section className="py-12">
      <SectionTitle>{title}</SectionTitle>
      <div className="grid gap-3">
        {faqs.map(({ question, answer }, i) => (
          <div key={i}>
            <button
              onClick={() => toggle(i)}
              className="w-full text-left bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 font-[inherit] cursor-pointer flex justify-between items-center hover:bg-[#EAF2FF] transition-colors focus:outline-2 focus:outline-[#F29E1F] focus:outline-offset-2"
            >
              <span>{question}</span>
              <i className={`fa-solid fa-chevron-down transition-transform duration-200 text-[#475569] ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === i && (
              <div className="bg-white border border-t-0 border-[#E2E8F0] rounded-b-lg px-4 py-3">
                <p className="text-[#475569]">{answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
