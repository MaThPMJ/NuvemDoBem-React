import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserTipo } from '../../context/AuthContext'

interface NavItem {
  to: string
  label: string
}

const navByTipo: Record<UserTipo, NavItem[]> = {
  integrante: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/casos', label: 'Casos' },
    { to: '/relatorios', label: 'Relatórios' },
    { to: '/integracoes', label: 'Integrações' },
    { to: '/chat', label: 'Chat' },
  ],
  dentista: [
    { to: '/area-dentista', label: 'Início' },
    { to: '/casos', label: 'Meus Casos' },
    { to: '/prontuario', label: 'Novo Prontuário' },
  ],
  beneficiario: [
    { to: '/area-beneficiario', label: 'Meu Histórico' },
  ],
  patrocinador: [
    { to: '/area-patrocinador', label: 'Minhas Doações' },
  ],
}

const homeByTipo: Record<UserTipo, string> = {
  integrante: '/dashboard',
  dentista: '/area-dentista',
  beneficiario: '/area-beneficiario',
  patrocinador: '/area-patrocinador',
}

const roleLabelByTipo: Record<UserTipo, string> = {
  integrante: 'Funcionário',
  dentista: 'Dentista',
  beneficiario: 'Beneficiário',
  patrocinador: 'Patrocinador',
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline ${
    isActive
      ? 'bg-[#EAF2FF] text-[#1E4E8C]'
      : 'text-[#475569] hover:bg-[#EAF2FF] hover:text-[#1E4E8C]'
  }`

export default function AppHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const tipo = user?.tipo ?? 'integrante'
  const navItems = navByTipo[tipo]
  const homeUrl = homeByTipo[tipo]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-20">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <NavLink to={homeUrl} className="text-[#1E4E8C] font-bold text-lg no-underline shrink-0">
          Nuvem do Bem
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* Badge de papel e modo demo */}
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#EAF2FF] text-[#1E4E8C] font-medium px-2 py-0.5 rounded-full">
              {roleLabelByTipo[tipo]}
            </span>
            {user?.isDemo && (
              <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                DEMO
              </span>
            )}
          </div>

          <NavLink
            to="/perfil"
            className="text-sm text-[#475569] hover:text-[#1E4E8C] transition-colors no-underline"
          >
            <span className="font-semibold text-[#0F172A]">{user?.nome}</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="bg-[#1E4E8C] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#163d70] transition-colors cursor-pointer shrink-0"
          >
            Sair
          </button>
        </div>

        <button
          className="md:hidden border border-[#E2E8F0] bg-white rounded-lg px-2.5 py-2 cursor-pointer"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-expanded={menuOpen}
        >
          <span className="block w-[22px] h-[2px] bg-[#0F172A] my-[5px]" />
          <span className="block w-[22px] h-[2px] bg-[#0F172A] my-[5px]" />
          <span className="block w-[22px] h-[2px] bg-[#0F172A] my-[5px]" />
          <span className="sr-only">Menu</span>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 pb-4">
          <div className="flex items-center gap-2 pt-3 pb-2">
            <span className="text-xs bg-[#EAF2FF] text-[#1E4E8C] font-medium px-2 py-0.5 rounded-full">
              {roleLabelByTipo[tipo]}
            </span>
            {user?.isDemo && (
              <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                DEMO
              </span>
            )}
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkClass} onClick={() => setMenuOpen(false)}>
                {label}
              </NavLink>
            ))}
            <NavLink to="/perfil" className={linkClass} onClick={() => setMenuOpen(false)}>
              Perfil ({user?.nome})
            </NavLink>
          </nav>
          <button
            onClick={handleLogout}
            className="mt-3 w-full bg-[#1E4E8C] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#163d70] transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      )}
    </header>
  )
}
