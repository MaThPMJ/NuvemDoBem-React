import { apiFetch } from './api'
import type { Caso } from '../types'

export const getCasos = (): Promise<Caso[]> =>
  apiFetch('/casos') as Promise<Caso[]>

export const getCaso = (id: number): Promise<Caso> =>
  apiFetch(`/casos/${id}`) as Promise<Caso>

export const createCaso = (data: Omit<Caso, 'id' | 'beneficiario' | 'dentista'>): Promise<Caso> =>
  apiFetch('/casos', { method: 'POST', body: JSON.stringify(data) }) as Promise<Caso>

export const updateCaso = (id: number, data: Partial<Caso>): Promise<Caso> =>
  apiFetch(`/casos/${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Caso>

export const deleteCaso = (id: number): Promise<null> =>
  apiFetch(`/casos/${id}`, { method: 'DELETE' }) as Promise<null>
