import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DentistasTab from './tabs/DentistasTab'
import BeneficiariosTab from './tabs/BeneficiariosTab'
import PatrocinadoresTab from './tabs/PatrocinadoresTab'

type TabId = 'dentistas' | 'beneficiarios' | 'patrocinadores'

interface Tab {
  id: TabId
  label: string
  emoji: string
}

const tabs: Tab[] = [
  { id: 'dentistas', label: 'Dentistas', emoji: '🦷' },
  { id: 'beneficiarios', label: 'Beneficiários', emoji: '👤' },
  { id: 'patrocinadores', label: 'Patrocinadores', emoji: '💼' },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('dentistas')

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <span className="text-[#1E4E8C] font-bold text-lg shrink-0">Nuvem do Bem</span>

          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/perfil"
              className="text-sm text-[#475569] hover:text-[#1E4E8C] transition-colors truncate"
            >
              Olá, <span className="font-semibold text-[#0F172A]">{user?.nome}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="shrink-0 bg-[#1E4E8C] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#163d70] transition-colors cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-[#0F172A] mb-6">Painel de Gestão</h1>

        <div className="overflow-x-auto">
          <div className="flex border-b border-[#E2E8F0] mb-6 min-w-max sm:min-w-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#1E4E8C] text-[#1E4E8C]'
                    : 'border-transparent text-[#475569] hover:text-[#0F172A] hover:border-[#E2E8F0]'
                }`}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'dentistas' && <DentistasTab />}
        {activeTab === 'beneficiarios' && <BeneficiariosTab />}
        {activeTab === 'patrocinadores' && <PatrocinadoresTab />}
      </main>
    </div>
  )
}
