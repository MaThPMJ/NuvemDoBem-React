import type { UseFormRegisterReturn } from 'react-hook-form'

const fieldClass =
  'w-full px-3 py-3 border border-[#E2E8F0] rounded-lg font-[inherit] text-[#0F172A] bg-white focus:outline-2 focus:outline-[#F29E1F] focus:outline-offset-2'

interface InputProps {
  label: string
  name: string
  type?: string
  as?: 'input' | 'textarea'
  rows?: number
  registration?: UseFormRegisterReturn
  error?: string
}

export default function Input({ label, name, type = 'text', as = 'input', rows, registration, error }: InputProps) {
  return (
    <div>
      <label htmlFor={name} className="font-semibold text-[#0F172A] mb-1.5 block">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea id={name} rows={rows} className={fieldClass} {...registration} />
      ) : (
        <input id={name} type={type} className={fieldClass} {...registration} />
      )}
      {error && <p className="text-red-700 text-sm mt-1">{error}</p>}
    </div>
  )
}
