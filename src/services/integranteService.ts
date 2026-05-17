import { apiFetch } from './api'
import type { Integrante } from '../types'

export const getIntegrantes = (): Promise<Integrante[]> =>
  apiFetch('/integrantes') as Promise<Integrante[]>

export const createIntegrante = (data: Omit<Integrante, 'id'>): Promise<Integrante> =>
  apiFetch('/integrantes', { method: 'POST', body: JSON.stringify(data) }) as Promise<Integrante>
