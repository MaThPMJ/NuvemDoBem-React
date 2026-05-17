import { apiFetch } from './api'
import type { Doacao } from '../types'

export const getDoacoes = (): Promise<Doacao[]> =>
  apiFetch('/doacoes') as Promise<Doacao[]>

export const createDoacao = (data: Omit<Doacao, 'id'>): Promise<Doacao> =>
  apiFetch('/doacoes', { method: 'POST', body: JSON.stringify(data) }) as Promise<Doacao>
