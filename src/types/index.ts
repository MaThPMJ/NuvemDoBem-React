export interface Dentista {
  idDentista: number
  nome: string
  email: string
  cro?: string
  especialidade: string
  telefone?: string
  dataCadastro?: string
}

export interface Beneficiario {
  idBeneficiario: number
  nome: string
  email: string
  cpf?: string
  dataNascimento?: string
  telefone?: string
  endereco?: string
  dataCadastro: string
}

export interface Integrante {
  idIntegrante: number
  nome: string
  email: string
  cargo: string
  dataCadastro?: string
  senha?: string
}

export interface Patrocinador {
  idPatrocinador: number
  nome: string | null
  email: string | null
  anonimo: 'S' | 'N'
}

export interface Caso {
  idCaso: number
  dataAbertura: string
  dataFechamento?: string | null
  status: string
  beneficiario?: Beneficiario | null
  dentista?: Dentista | null
  integrante?: Integrante | null
  temDiagnostico?: boolean
}

export interface Diagnostico {
  idDiagnostico: number
  descricao: string
  dataDiagnostico: string
  procedimento?: string
  caso?: Caso
  beneficiario?: Beneficiario | null
  dentista?: Dentista | null
}

export interface HistoricoStatus {
  idHistorico: number
  status: string
  dataAlteracao: string
  caso?: Caso
  integrante?: Integrante
}

export interface PedidoEncaminhamento {
  idPedido: number
  dataPedido: string
  status: string
  caso?: Caso
  dentista?: Dentista
}

export interface Doacao {
  idDoacao: number
  tipo: string
  valor: number | null
  descricaoEquipamento?: string | null
  dataDoacao: string
  patrocinador?: Patrocinador
}
