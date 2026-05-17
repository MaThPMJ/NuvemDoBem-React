import { apiFetch } from './api'
import type { Beneficiario } from '../types'

export const getBeneficiarios = (): Promise<Beneficiario[]> =>
  apiFetch('/beneficiarios') as Promise<Beneficiario[]>

export const getBeneficiario = (id: number): Promise<Beneficiario> =>
  apiFetch(`/beneficiarios/${id}`) as Promise<Beneficiario>

export const createBeneficiario = (data: Omit<Beneficiario, 'id'>): Promise<Beneficiario> =>
  apiFetch('/beneficiarios', { method: 'POST', body: JSON.stringify(data) }) as Promise<Beneficiario>

export const updateBeneficiario = (id: number, data: Partial<Beneficiario>): Promise<Beneficiario> =>
  apiFetch(`/beneficiarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Beneficiario>

export const deleteBeneficiario = (id: number): Promise<null> =>
  apiFetch(`/beneficiarios/${id}`, { method: 'DELETE' }) as Promise<null>
