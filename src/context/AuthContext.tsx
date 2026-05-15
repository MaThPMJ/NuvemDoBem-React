/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

interface User {
  nome: string
  cargo: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function parseNome(email: string): string {
  return email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
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

  function login(email: string): boolean {
    const mockUser: User = { nome: parseNome(email), cargo: 'Funcionário', email }
    setUser(mockUser)
    localStorage.setItem('nuvem_user', JSON.stringify(mockUser))
    return true
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('nuvem_user')
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
