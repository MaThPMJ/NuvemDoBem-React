import { apiFetch } from './api'
import type { Mensagem } from '../types'

export const getMensagens = (): Promise<Mensagem[]> =>
  apiFetch('/mensagens') as Promise<Mensagem[]>

export const createMensagem = (data: Omit<Mensagem, 'id'>): Promise<Mensagem> =>
  apiFetch('/mensagens', { method: 'POST', body: JSON.stringify(data) }) as Promise<Mensagem>
