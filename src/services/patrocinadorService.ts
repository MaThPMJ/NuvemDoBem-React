import { apiFetch } from './api'
import type { Patrocinador } from '../types'

export const getPatrocinadores = (): Promise<Patrocinador[]> =>
  apiFetch('/patrocinadores') as Promise<Patrocinador[]>

export const getPatrocinador = (id: number): Promise<Patrocinador> =>
  apiFetch(`/patrocinadores/${id}`) as Promise<Patrocinador>

export const createPatrocinador = (data: Omit<Patrocinador, 'id'>): Promise<Patrocinador> =>
  apiFetch('/patrocinadores', { method: 'POST', body: JSON.stringify(data) }) as Promise<Patrocinador>

export const updatePatrocinador = (id: number, data: Partial<Patrocinador>): Promise<Patrocinador> =>
  apiFetch(`/patrocinadores/${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Patrocinador>
