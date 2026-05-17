import { apiFetch } from './api'
import type { Dentista } from '../types'

export const getDentistas = (): Promise<Dentista[]> =>
  apiFetch('/dentistas') as Promise<Dentista[]>

export const getDentista = (id: number): Promise<Dentista> =>
  apiFetch(`/dentistas/${id}`) as Promise<Dentista>

export const createDentista = (data: Omit<Dentista, 'id'>): Promise<Dentista> =>
  apiFetch('/dentistas', { method: 'POST', body: JSON.stringify(data) }) as Promise<Dentista>

export const updateDentista = (id: number, data: Partial<Dentista>): Promise<Dentista> =>
  apiFetch(`/dentistas/${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Dentista>

export const deleteDentista = (id: number): Promise<null> =>
  apiFetch(`/dentistas/${id}`, { method: 'DELETE' }) as Promise<null>
