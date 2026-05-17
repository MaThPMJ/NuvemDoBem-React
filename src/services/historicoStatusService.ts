import { apiFetch } from './api'
import type { HistoricoStatus } from '../types'

export const getHistoricosStatus = (): Promise<HistoricoStatus[]> =>
  apiFetch('/historicos-status') as Promise<HistoricoStatus[]>

export const createHistoricoStatus = (data: Omit<HistoricoStatus, 'id'>): Promise<HistoricoStatus> =>
  apiFetch('/historicos-status', { method: 'POST', body: JSON.stringify(data) }) as Promise<HistoricoStatus>
