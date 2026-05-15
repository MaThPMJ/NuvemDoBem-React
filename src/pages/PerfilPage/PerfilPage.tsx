import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PerfilPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/dashboard" className="text-[#1E4E8C] font-bold text-lg no-underline">
            Nuvem do Bem
          </Link>
          <Link
            to="/dashboard"
            className="text-sm text-[#475569] hover:text-[#1E4E8C] transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            Voltar ao painel
          </Link>
        </div>
      </header>

      <main className="max-w-[480px] mx-auto px-4 py-10">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#EAF2FF] flex items-center justify-center text-[#1E4E8C]">
            <i className="fa-solid fa-user text-4xl" />
          </div>

          <div className="w-full text-center">
            <h1 className="text-xl font-bold text-[#0F172A]">{user?.nome}</h1>
            <p className="text-sm text-[#1E4E8C] font-medium mt-1">{user?.cargo}</p>
          </div>

          <div className="w-full border-t border-[#E2E8F0] pt-4 grid gap-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#EAF2FF] flex items-center justify-center shrink-0">
                <i className="fa-solid fa-envelope text-sm text-[#1E4E8C]" />
              </span>
              <div>
                <p className="text-xs text-[#475569]">E-mail</p>
                <p className="text-sm font-medium text-[#0F172A] break-all">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#EAF2FF] flex items-center justify-center shrink-0">
                <i className="fa-solid fa-briefcase text-sm text-[#1E4E8C]" />
              </span>
              <div>
                <p className="text-xs text-[#475569]">Cargo</p>
                <p className="text-sm font-medium text-[#0F172A]">{user?.cargo}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Encerrar sessão
          </button>
        </div>
      </main>
    </div>
  )
}
