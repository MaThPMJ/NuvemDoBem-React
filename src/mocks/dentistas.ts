export interface Dentista {
  id: number
  nome: string
  especialidade: string
  cidade: string
  status: 'ativo' | 'inativo'
}

export const dentistas: Dentista[] = [
  { id: 1, nome: 'Dr. Carlos Andrade', especialidade: 'Ortodontia', cidade: 'São Paulo', status: 'ativo' },
  { id: 2, nome: 'Dra. Fernanda Lima', especialidade: 'Endodontia', cidade: 'Campinas', status: 'ativo' },
  { id: 3, nome: 'Dr. Rafael Souza', especialidade: 'Implantodontia', cidade: 'Ribeirão Preto', status: 'inativo' },
  { id: 4, nome: 'Dra. Juliana Costa', especialidade: 'Odontopediatria', cidade: 'Santo André', status: 'ativo' },
  { id: 5, nome: 'Dr. Marcelo Ferreira', especialidade: 'Periodontia', cidade: 'São Bernardo', status: 'ativo' },
  { id: 6, nome: 'Dra. Patrícia Oliveira', especialidade: 'Cirurgia Bucomaxilofacial', cidade: 'Guarulhos', status: 'inativo' },
  { id: 7, nome: 'Dr. Thiago Mendes', especialidade: 'Dentística', cidade: 'Osasco', status: 'ativo' },
  { id: 8, nome: 'Dra. Amanda Carvalho', especialidade: 'Prótese Dentária', cidade: 'São Paulo', status: 'ativo' },
  { id: 9, nome: 'Dr. Bruno Alves', especialidade: 'Ortodontia', cidade: 'Sorocaba', status: 'inativo' },
  { id: 10, nome: 'Dra. Isabela Rocha', especialidade: 'Odontologia Preventiva', cidade: 'São José dos Campos', status: 'ativo' },
]