import { apiFetch } from './api'
import type { Diagnostico } from '../types'

export const getDiagnosticos = (): Promise<Diagnostico[]> =>
  apiFetch('/diagnosticos') as Promise<Diagnostico[]>

export const createDiagnostico = (data: Omit<Diagnostico, 'id'>): Promise<Diagnostico> =>
  apiFetch('/diagnosticos', { method: 'POST', body: JSON.stringify(data) }) as Promise<Diagnostico>
