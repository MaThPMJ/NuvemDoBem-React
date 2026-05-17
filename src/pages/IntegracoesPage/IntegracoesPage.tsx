import { useState } from 'react'

interface FlowStep {
  id: string
  icon: string
  title: string
  description: string
  color: string
  bg: string
}

const steps: FlowStep[] = [
  {
    id: 'dentista',
    icon: 'fa-solid fa-user-doctor',
    title: 'Dentista',
    description: 'Voluntário preenche o prontuário do beneficiário no sistema.',
    color: 'text-[#1E4E8C]',
    bg: 'bg-[#EAF2FF]',
  },
  {
    id: 'prontuario',
    icon: 'fa-solid fa-file-medical',
    title: 'Prontuário no Site',
    description: 'Caso clínico é registrado na Nuvem do Bem com diagnóstico e histórico.',
    color: 'text-[#F29E1F]',
    bg: 'bg-orange-50',
  },
  {
    id: 'salesforce',
    icon: 'fa-solid fa-cloud',
    title: 'Salesforce',
    description: 'Registro do beneficiário é criado ou atualizado no CRM da ONG.',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
  {
    id: 'drive',
    icon: 'fa-brands fa-google-drive',
    title: 'Google Drive',
    description: 'Pasta com prontuários e documentos do beneficiário é criada automaticamente.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
]

export default function IntegracoesPage() {
  const [activeStep, setActiveStep] = useState(-1)
  const [running, setRunning] = useState(false)

  function simulateFlow() {
    if (running) return
    setRunning(true)
    setActiveStep(-1)

    steps.forEach((_, i) => {
      setTimeout(() => {
        setActiveStep(i)
        if (i === steps.length - 1) {
          setTimeout(() => {
            setRunning(false)
          }, 800)
        }
      }, i * 1200)
    })
  }

  function resetFlow() {
    setActiveStep(-1)
    setRunning(false)
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-[#0F172A] mb-2">Integrações</h1>
      <p className="text-sm text-[#475569] mb-8">
        Visualize o fluxo de dados desde o atendimento do dentista até os sistemas externos da ONG.
      </p>

      <div className="flex flex-col md:flex-row items-stretch gap-0 md:gap-0 mb-10 relative">
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-col md:flex-row items-center flex-1 min-w-0">
            <div
              className={`flex-1 w-full border-2 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-500 ${
                activeStep >= i
                  ? 'border-[#1E4E8C] shadow-md scale-[1.02]'
                  : 'border-[#E2E8F0] opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${step.bg} ${step.color}`}
              >
                <i className={step.icon} />
              </div>
              <div>
                <p className="font-semibold text-[#0F172A] text-sm">{step.title}</p>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">{step.description}</p>
              </div>
              {activeStep === i && running && (
                <div className="flex items-center gap-2 text-xs text-[#1E4E8C] font-medium">
                  <div className="animate-spin w-3 h-3 rounded-full border-2 border-[#1E4E8C] border-t-transparent" />
                  Processando...
                </div>
              )}
              {activeStep > i && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <i className="fa-solid fa-check" />
                  Concluído
                </div>
              )}
            </div>

            {i < steps.length - 1 && (
              <>
                <div
                  className={`hidden md:flex items-center justify-center w-10 shrink-0 transition-all duration-500 ${
                    activeStep > i ? 'text-[#1E4E8C]' : 'text-[#E2E8F0]'
                  }`}
                >
                  <i className="fa-solid fa-arrow-right text-xl" />
                </div>
                <div
                  className={`md:hidden flex items-center justify-center h-8 transition-all duration-500 ${
                    activeStep > i ? 'text-[#1E4E8C]' : 'text-[#E2E8F0]'
                  }`}
                >
                  <i className="fa-solid fa-arrow-down text-xl" />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={simulateFlow}
          disabled={running}
          className="bg-[#1E4E8C] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#163d70] transition-colors cursor-pointer disabled:opacity-60 text-sm"
        >
          {running ? 'Simulando...' : 'Simular fluxo completo'}
        </button>
        {activeStep >= 0 && !running && (
          <button
            onClick={resetFlow}
            className="border border-[#E2E8F0] text-[#475569] font-medium px-6 py-2.5 rounded-lg hover:bg-[#F7F9FC] transition-colors cursor-pointer text-sm"
          >
            Reiniciar
          </button>
        )}
      </div>

      <div className="mt-10 bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <h2 className="font-semibold text-[#0F172A] mb-4 text-sm">Sobre as integrações</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            icon="fa-solid fa-cloud"
            title="Salesforce CRM"
            description="Mantém o histórico completo de cada beneficiário, incluindo atendimentos, encaminhamentos e status."
          />
          <InfoCard
            icon="fa-brands fa-google-drive"
            title="Google Drive"
            description="Armazena prontuários digitalizados e documentos clínicos de forma organizada por beneficiário."
          />
        </div>
        <p className="text-xs text-[#475569] mt-4 italic">
          * As integrações com Salesforce e Google Drive são simuladas nesta versão do sistema.
        </p>
      </div>
    </div>
  )
}

function InfoCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
        <i className={`${icon} text-[#1E4E8C]`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
        <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
