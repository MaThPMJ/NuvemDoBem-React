import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const navLinks = [
  { label: 'Início', to: '/', icon: 'fa-solid fa-house' },
  { label: 'Sobre', to: '/sobre' },
  { label: 'A ONG', to: '/tdb' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Integrantes', to: '/integrantes' },
  { label: 'Contato', to: '/contato' },
  { label: 'Login', to: '/login' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `no-underline px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
    isActive
      ? 'bg-[#EAF2FF] text-[#1E4E8C] font-semibold'
      : 'text-[#0F172A] hover:bg-[#EAF2FF]'
  }`

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
      <div className="max-w-[1200px] mx-auto px-4 flex flex-wrap items-center justify-between py-4">
        <NavLink to="/" className="flex gap-2 items-center no-underline text-[#1E4E8C] font-bold text-lg">
          Nuvem do Bem
        </NavLink>

        <button
          className="md:hidden border border-[#E2E8F0] bg-white rounded-lg px-2.5 py-2 cursor-pointer"
          aria-expanded={menuOpen}
          aria-controls="mainMenu"
          onClick={() => setMenuOpen(prev => !prev)}
        >
          <span className="block w-[22px] h-[2px] bg-[#0F172A] my-[5px]" />
          <span className="block w-[22px] h-[2px] bg-[#0F172A] my-[5px]" />
          <span className="block w-[22px] h-[2px] bg-[#0F172A] my-[5px]" />
          <span className="sr-only">Menu</span>
        </button>

        <nav id="mainMenu" className="w-full md:w-auto">
          <ul className={`list-none m-0 p-0 gap-2 ${
            menuOpen
              ? 'flex flex-col mt-4 p-4 bg-white border border-[#E2E8F0] rounded-lg'
              : 'hidden md:flex md:flex-row md:gap-1'
          }`}>
            {navLinks.map(({ label, to, icon }) => (
              <li key={to}>
                <NavLink to={to} className={linkClass} end={to === '/'}>
                  {icon && <i className={icon} />}
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
