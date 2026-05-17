import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Integrante, Dentista, Beneficiario, Patrocinador } from '../types'

export type UserTipo = 'integrante' | 'dentista' | 'beneficiario' | 'patrocinador'

interface User {
  nome: string
  cargo: string
  email: string
  tipo: UserTipo
  isDemo: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, senha: string, tipo: UserTipo) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const BASE_URL = 'https://javasprint.onrender.com'

function parseNome(email: string): string {
  return email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

const cargoByTipo: Record<UserTipo, string> = {
  integrante: 'Funcionário',
  dentista: 'Dentista',
  beneficiario: 'Beneficiário',
  patrocinador: 'Patrocinador',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('nuvem_user')
      return stored ? (JSON.parse(stored) as User) : null
    } catch {
      return null
    }
  })

  async function login(email: string, senha: string, tipo: UserTipo): Promise<void> {
    // Integrantes: autenticação real possível (única entidade com senha na API)
    if (tipo === 'integrante') {
      try {
        const res = await fetch(`${BASE_URL}/integrantes`, {
          headers: { 'Content-Type': 'application/json' },
        })
        if (res.ok) {
          const lista = (await res.json()) as Integrante[]
          const encontrado = lista.find(i => i.email === email && i.senha === senha)
          if (encontrado) {
            const userData: User = {
              nome: encontrado.nome,
              cargo: encontrado.cargo,
              email: encontrado.email,
              tipo: 'integrante',
              isDemo: false,
            }
            setUser(userData)
            localStorage.setItem('nuvem_user', JSON.stringify(userData))
            localStorage.setItem('token', `integrante-${encontrado.idIntegrante}`)
            return
          }
        }
      } catch { /* API offline */ }
    }

    // Dentistas: tenta encontrar pelo email para mostrar nome real (sem verificar senha)
    if (tipo === 'dentista') {
      try {
        const res = await fetch(`${BASE_URL}/dentistas`, {
          headers: { 'Content-Type': 'application/json' },
        })
        if (res.ok) {
          const lista = (await res.json()) as Dentista[]
          const encontrado = lista.find(d => d.email === email)
          if (encontrado) {
            const userData: User = {
              nome: encontrado.nome,
              cargo: 'Dentista',
              email: encontrado.email,
              tipo: 'dentista',
              isDemo: true,
            }
            setUser(userData)
            localStorage.setItem('nuvem_user', JSON.stringify(userData))
            localStorage.setItem('token', `dentista-${encontrado.idDentista}`)
            return
          }
        }
      } catch { /* API offline */ }
    }

    // Beneficiários: tenta encontrar pelo email
    if (tipo === 'beneficiario') {
      try {
        const res = await fetch(`${BASE_URL}/beneficiarios`, {
          headers: { 'Content-Type': 'application/json' },
        })
        if (res.ok) {
          const lista = (await res.json()) as Beneficiario[]
          const encontrado = lista.find(b => b.email === email)
          if (encontrado) {
            const userData: User = {
              nome: encontrado.nome,
              cargo: 'Beneficiário',
              email: encontrado.email,
              tipo: 'beneficiario',
              isDemo: true,
            }
            setUser(userData)
            localStorage.setItem('nuvem_user', JSON.stringify(userData))
            localStorage.setItem('token', `beneficiario-${encontrado.idBeneficiario}`)
            return
          }
        }
      } catch { /* API offline */ }
    }

    // Patrocinadores: tenta encontrar pelo email
    if (tipo === 'patrocinador') {
      try {
        const res = await fetch(`${BASE_URL}/patrocinadores`, {
          headers: { 'Content-Type': 'application/json' },
        })
        if (res.ok) {
          const lista = (await res.json()) as Patrocinador[]
          const encontrado = lista.find(p => p.email === email)
          if (encontrado) {
            const userData: User = {
              nome: encontrado.nome ?? parseNome(email),
              cargo: 'Patrocinador',
              email: encontrado.email ?? email,
              tipo: 'patrocinador',
              isDemo: true,
            }
            setUser(userData)
            localStorage.setItem('nuvem_user', JSON.stringify(userData))
            localStorage.setItem('token', `patrocinador-${encontrado.idPatrocinador}`)
            return
          }
        }
      } catch { /* API offline */ }
    }

    // Fallback demonstrativo: qualquer email/senha funciona para qualquer papel
    const userData: User = {
      nome: parseNome(email),
      cargo: cargoByTipo[tipo],
      email,
      tipo,
      isDemo: true,
    }
    setUser(userData)
    localStorage.setItem('nuvem_user', JSON.stringify(userData))
    localStorage.setItem('token', `demo-${tipo}`)
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('nuvem_user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
