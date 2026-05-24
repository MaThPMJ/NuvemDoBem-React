import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Integrante, Dentista, Beneficiario, Patrocinador } from '../types'

export type UserTipo = 'integrante' | 'dentista' | 'beneficiario' | 'patrocinador'

interface User {
  nome: string
  cargo: string
  email: string
  tipo: UserTipo
  id: number
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

async function postLogin(path: string, email: string, senha: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  })
  if (!res.ok) {
    let msg = 'E-mail ou senha incorretos.'
    try {
      const body = await res.json()
      if (body?.mensagem) msg = body.mensagem
    } catch { /* ignore */ }
    throw new Error(msg)
  }
  return res.json()
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
    if (tipo === 'integrante') {
      const data = await postLogin('/integrantes/login', email, senha) as Integrante
      const userData: User = {
        nome: data.nome,
        cargo: data.cargo,
        email: data.email,
        tipo: 'integrante',
        id: data.idIntegrante,
      }
      setUser(userData)
      localStorage.setItem('nuvem_user', JSON.stringify(userData))
      localStorage.setItem('token', `integrante-${data.idIntegrante}`)
      return
    }

    if (tipo === 'dentista') {
      const data = await postLogin('/dentistas/login', email, senha) as Dentista
      const userData: User = {
        nome: data.nome,
        cargo: 'Dentista',
        email: data.email,
        tipo: 'dentista',
        id: data.idDentista,
      }
      setUser(userData)
      localStorage.setItem('nuvem_user', JSON.stringify(userData))
      localStorage.setItem('token', `dentista-${data.idDentista}`)
      return
    }

    if (tipo === 'beneficiario') {
      const data = await postLogin('/beneficiarios/login', email, senha) as Beneficiario
      const userData: User = {
        nome: data.nome,
        cargo: 'Beneficiário',
        email: data.email,
        tipo: 'beneficiario',
        id: data.idBeneficiario,
      }
      setUser(userData)
      localStorage.setItem('nuvem_user', JSON.stringify(userData))
      localStorage.setItem('token', `beneficiario-${data.idBeneficiario}`)
      return
    }

    if (tipo === 'patrocinador') {
      // Patrocinador não tem endpoint /login — busca por e-mail na lista
      const res = await fetch(`${BASE_URL}/patrocinadores`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Não foi possível conectar à API.')
      const lista = (await res.json()) as Patrocinador[]
      const encontrado = lista.find(p => p.email === email)
      if (!encontrado) throw new Error('E-mail não encontrado.')
      const userData: User = {
        nome: encontrado.nome ?? parseNome(email),
        cargo: 'Patrocinador',
        email: encontrado.email ?? email,
        tipo: 'patrocinador',
        id: encontrado.idPatrocinador,
      }
      setUser(userData)
      localStorage.setItem('nuvem_user', JSON.stringify(userData))
      localStorage.setItem('token', `patrocinador-${encontrado.idPatrocinador}`)
      return
    }

    throw new Error('Tipo de usuário inválido.')
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
