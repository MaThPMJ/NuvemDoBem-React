import { apiFetch } from './api'
import type { PedidoEncaminhamento } from '../types'

export const getPedidosEncaminhamento = (): Promise<PedidoEncaminhamento[]> =>
  apiFetch('/pedidos-encaminhamento') as Promise<PedidoEncaminhamento[]>

export const createPedidoEncaminhamento = (
  data: {
    caso: { idCaso: number }
    dentista: { idDentista: number }
    integrante: { idIntegrante: number }
    dataPedido: string
    status: string
  },
): Promise<PedidoEncaminhamento> =>
  apiFetch('/pedidos-encaminhamento', { method: 'POST', body: JSON.stringify(data) }) as Promise<PedidoEncaminhamento>

export const aceitarPedido = (id: number): Promise<PedidoEncaminhamento> =>
  apiFetch(`/pedidos-encaminhamento/${id}/aceitar`, { method: 'PUT' }) as Promise<PedidoEncaminhamento>

export const recusarPedido = (id: number): Promise<PedidoEncaminhamento> =>
  apiFetch(`/pedidos-encaminhamento/${id}/recusar`, { method: 'PUT' }) as Promise<PedidoEncaminhamento>
