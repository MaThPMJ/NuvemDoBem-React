import { apiFetch } from './api'

export const getEnderecoPorCep = (cep: string): Promise<unknown> =>
  apiFetch(`/enderecos/cep/${cep}`)

export const getEnderecoFormatadoPorCep = (cep: string): Promise<string> =>
  apiFetch(`/enderecos/cep/${cep}/formatado`) as Promise<string>
