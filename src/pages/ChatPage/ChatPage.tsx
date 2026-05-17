import { useState, useEffect, useRef } from 'react'
import { getDentistas } from '../../services/dentistaService'
import { useAuth } from '../../context/AuthContext'
import { mockDentistas } from '../../mocks/dentistas'
import type { Dentista } from '../../types'

interface Mensagem {
  id: number
  texto: string
  de: 'eu' | 'dentista'
  hora: string
}

const autoRespostas = [
  'Entendido! Vou verificar o prontuário do paciente em breve.',
  'Certo, podemos agendar para essa semana. Qual horário fica melhor?',
  'Já analisei o caso, podemos prosseguir com o tratamento.',
  'Obrigado pela informação. Vou preparar o material necessário.',
  'Perfeito, estarei disponível nesse horário.',
  'Recebi! Já estou ciente do caso.',
  'Pode deixar, cuido disso ainda hoje.',
  'Vou entrar em contato com o paciente para confirmar.',
]

function horaAtual() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

type Conversas = Record<number, Mensagem[]>

export default function ChatPage() {
  const { user } = useAuth()
  const [dentistas, setDentistas] = useState<Dentista[]>([])
  const [query, setQuery] = useState('')
  const [dentistaSelecionado, setDentistaSelecionado] = useState<Dentista | null>(null)
  const [conversas, setConversas] = useState<Conversas>({})
  const [texto, setTexto] = useState('')
  const [digitando, setDigitando] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getDentistas()
      .then(setDentistas)
      .catch(() => setDentistas(mockDentistas))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversas, digitando])

  const dentistasFiltered = dentistas.filter(d =>
    d.nome.toLowerCase().includes(query.toLowerCase()) ||
    d.especialidade.toLowerCase().includes(query.toLowerCase()),
  )

  const mensagensAtivas = dentistaSelecionado
    ? (conversas[dentistaSelecionado.idDentista] ?? [])
    : []

  function enviarMensagem() {
    if (!texto.trim() || !dentistaSelecionado) return
    const id = dentistaSelecionado.idDentista

    const novaMensagem: Mensagem = {
      id: Date.now(),
      texto: texto.trim(),
      de: 'eu',
      hora: horaAtual(),
    }

    setConversas(prev => ({
      ...prev,
      [id]: [...(prev[id] ?? []), novaMensagem],
    }))
    setTexto('')
    inputRef.current?.focus()

    // Auto-resposta do dentista após delay
    setDigitando(true)
    const delay = 1000 + Math.random() * 1500
    setTimeout(() => {
      const resposta: Mensagem = {
        id: Date.now() + 1,
        texto: autoRespostas[Math.floor(Math.random() * autoRespostas.length)],
        de: 'dentista',
        hora: horaAtual(),
      }
      setConversas(prev => ({
        ...prev,
        [id]: [...(prev[id] ?? []), resposta],
      }))
      setDigitando(false)
    }, delay)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensagem()
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[#0F172A] mb-6">Chat com Dentistas</h1>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex" style={{ height: '600px' }}>
        {/* Sidebar — lista de dentistas */}
        <div className="w-72 shrink-0 border-r border-[#E2E8F0] flex flex-col">
          <div className="p-3 border-b border-[#E2E8F0]">
            <input
              type="search"
              placeholder="Buscar dentista..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C]"
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {dentistasFiltered.length === 0 ? (
              <p className="text-sm text-[#475569] text-center py-6 px-4">Nenhum dentista encontrado.</p>
            ) : (
              dentistasFiltered.map(d => {
                const msgs = conversas[d.idDentista] ?? []
                const ultima = msgs[msgs.length - 1]
                const temMensagem = msgs.length > 0
                return (
                  <button
                    key={d.idDentista}
                    onClick={() => setDentistaSelecionado(d)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[#F7F9FC] transition-colors cursor-pointer border-b border-[#E2E8F0] ${
                      dentistaSelecionado?.idDentista === d.idDentista ? 'bg-[#EAF2FF]' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#1E4E8C] flex items-center justify-center shrink-0 text-white text-sm font-bold">
                      {d.nome.split(' ').filter(w => w.match(/^[A-Z]/)).slice(0, 2).map(w => w[0]).join('') || d.nome[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">{d.nome}</p>
                      <p className="text-xs text-[#475569] truncate">
                        {temMensagem ? ultima.texto : d.especialidade}
                      </p>
                    </div>
                    {temMensagem && (
                      <span className="text-xs text-[#475569] shrink-0">{ultima.hora}</span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Área de conversa */}
        {dentistaSelecionado ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header do chat */}
            <div className="px-5 py-3 border-b border-[#E2E8F0] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1E4E8C] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {dentistaSelecionado.nome.split(' ').filter(w => w.match(/^[A-Z]/)).slice(0, 2).map(w => w[0]).join('') || dentistaSelecionado.nome[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{dentistaSelecionado.nome}</p>
                <p className="text-xs text-[#475569]">{dentistaSelecionado.especialidade}</p>
              </div>
              <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
                DEMO
              </span>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {mensagensAtivas.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full bg-[#EAF2FF] flex items-center justify-center mb-3">
                    <i className="fa-solid fa-comments text-[#1E4E8C] text-2xl" />
                  </div>
                  <p className="text-sm font-medium text-[#0F172A]">Inicie a conversa</p>
                  <p className="text-xs text-[#475569] mt-1 max-w-[220px]">
                    Envie uma mensagem para {dentistaSelecionado.nome}
                  </p>
                </div>
              )}

              {mensagensAtivas.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.de === 'eu' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${msg.de === 'eu' ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                    {msg.de === 'dentista' && (
                      <span className="text-xs text-[#475569] ml-1">{dentistaSelecionado.nome.split(' ')[0]}</span>
                    )}
                    {msg.de === 'eu' && (
                      <span className="text-xs text-[#475569] mr-1">{user?.nome?.split(' ')[0]}</span>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      msg.de === 'eu'
                        ? 'bg-[#1E4E8C] text-white rounded-tr-sm'
                        : 'bg-[#F1F5F9] text-[#0F172A] rounded-tl-sm'
                    }`}>
                      {msg.texto}
                    </div>
                    <span className="text-xs text-[#94A3B8] px-1">{msg.hora}</span>
                  </div>
                </div>
              ))}

              {digitando && (
                <div className="flex justify-start">
                  <div className="bg-[#F1F5F9] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#475569] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#475569] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#475569] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[#E2E8F0] flex gap-3 items-center">
              <input
                ref={inputRef}
                type="text"
                value={texto}
                onChange={e => setTexto(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite uma mensagem..."
                className="flex-1 border border-[#E2E8F0] rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4E8C]"
              />
              <button
                onClick={enviarMensagem}
                disabled={!texto.trim()}
                className="w-10 h-10 rounded-full bg-[#1E4E8C] text-white flex items-center justify-center hover:bg-[#163d70] transition-colors cursor-pointer disabled:opacity-40 shrink-0"
              >
                <i className="fa-solid fa-paper-plane text-sm" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-[#EAF2FF] flex items-center justify-center mb-4">
              <i className="fa-solid fa-user-doctor text-[#1E4E8C] text-2xl" />
            </div>
            <p className="text-base font-semibold text-[#0F172A]">Selecione um dentista</p>
            <p className="text-sm text-[#475569] mt-1 max-w-[240px]">
              Escolha um dentista na lista ao lado para iniciar a conversa.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
