export interface Beneficiario {
  id: number
  nome: string
  idade: number
  cidade: string
  dataAtendimento: string
}

export const beneficiarios: Beneficiario[] = [
  { id: 1, nome: 'Ana Paula Santos', idade: 9, cidade: 'São Paulo', dataAtendimento: '2025-03-10' },
  { id: 2, nome: 'Lucas Oliveira', idade: 12, cidade: 'Campinas', dataAtendimento: '2025-03-14' },
  { id: 3, nome: 'Maria Clara Ferreira', idade: 7, cidade: 'Guarulhos', dataAtendimento: '2025-03-20' },
  { id: 4, nome: 'Pedro Henrique Silva', idade: 11, cidade: 'Osasco', dataAtendimento: '2025-04-02' },
  { id: 5, nome: 'Beatriz Almeida', idade: 8, cidade: 'São Bernardo', dataAtendimento: '2025-04-08' },
  { id: 6, nome: 'Gabriel Costa', idade: 10, cidade: 'Santo André', dataAtendimento: '2025-04-15' },
  { id: 7, nome: 'Larissa Mendes', idade: 13, cidade: 'Sorocaba', dataAtendimento: '2025-04-22' },
  { id: 8, nome: 'Mateus Carvalho', idade: 6, cidade: 'Ribeirão Preto', dataAtendimento: '2025-05-05' },
  { id: 9, nome: 'Sofia Lima', idade: 9, cidade: 'São José dos Campos', dataAtendimento: '2025-05-09' },
  { id: 10, nome: 'Enzo Martins', idade: 11, cidade: 'São Paulo', dataAtendimento: '2025-05-12' },
]
