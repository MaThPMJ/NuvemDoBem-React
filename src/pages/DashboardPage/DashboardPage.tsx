import { useState, useEffect } from 'react'
import DentistasTab from './tabs/DentistasTab'
import BeneficiariosTab from './tabs/BeneficiariosTab'
import PatrocinadoresTab from './tabs/PatrocinadoresTab'
import { getDentistas } from '../../services/dentistaService'
import { getBeneficiarios } from '../../services/beneficiarioService'
import { getPatrocinadores } from '../../services/patrocinadorService'

type TabId = 'dentistas' | 'beneficiarios' | 'patrocinadores'

const tabs: { id: TabId; label: string; icon: string; color: string; bg: string }[] = [
  { id: 'dentistas',     label: 'Dentistas',     icon: 'fa-tooth',             color: 'text-[#1E4E8C]', bg: 'bg-[#EAF2FF]' },
  { id: 'beneficiarios', label: 'Beneficiários', icon: 'fa-user',              color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { id: 'patrocinadores',label: 'Patrocinadores',icon: 'fa-hand-holding-heart',color: 'text-amber-700',  bg: 'bg-amber-50' },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dentistas')
  const [counts, setCounts] = useState({ dentistas: 0, beneficiarios: 0, patrocinadores: 0 })

  useEffect(() => {
    Promise.allSettled([getDentistas(), getBeneficiarios(), getPatrocinadores()])
      .then(([d, b, p]) => setCounts({
        dentistas:     d.status === 'fulfilled' ? d.value.length : 0,
        beneficiarios: b.status === 'fulfilled' ? b.value.length : 0,
        patrocinadores:p.status === 'fulfilled' ? p.value.length : 0,
      }))
  }, [])

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[#0F172A] mb-6">Painel de Gestão</h1>

      {/* Abas visuais */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {tabs.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-2 rounded-2xl px-4 py-4 border-2 transition-all cursor-pointer ${
                active
                  ? 'border-[#1E4E8C] bg-white shadow-sm'
                  : 'border-[#E2E8F0] bg-white hover:border-[#1E4E8C]/40'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${active ? tab.bg : 'bg-[#F1F5F9]'}`}>
                <i className={`fa-solid ${tab.icon} text-lg ${active ? tab.color : 'text-[#94A3B8]'}`} />
              </div>
              <span className={`text-xs font-semibold ${active ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                {tab.label}
              </span>
              <span className={`text-lg font-bold leading-none ${active ? 'text-[#1E4E8C]' : 'text-[#94A3B8]'}`}>
                {counts[tab.id]}
              </span>
            </button>
          )
        })}
      </div>

      {activeTab === 'dentistas' && <DentistasTab />}
      {activeTab === 'beneficiarios' && <BeneficiariosTab />}
      {activeTab === 'patrocinadores' && <PatrocinadoresTab />}
    </div>
  )
}
