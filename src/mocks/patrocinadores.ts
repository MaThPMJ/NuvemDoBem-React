export interface Patrocinador {
  id: number
  nome: string
  empresa: string
  tipoApoio: string
  contato: string
}

export const patrocinadores: Patrocinador[] = [
  { id: 1, nome: 'Roberto Dias', empresa: 'Odonto Tech', tipoApoio: 'Materiais odontológicos', contato: 'roberto@odotech.com.br' },
  { id: 2, nome: 'Cláudia Ramos', empresa: 'Sorriso Solidário LTDA', tipoApoio: 'Financeiro mensal', contato: 'claudia@sorrisosolidario.com.br' },
  { id: 3, nome: 'Henrique Lopes', empresa: 'MedDent Suprimentos', tipoApoio: 'Equipamentos', contato: 'hlopes@meddent.com.br' },
  { id: 4, nome: 'Tatiana Borges', empresa: 'Instituto Sorrir', tipoApoio: 'Financeiro pontual', contato: 'tatiana@institutosorrir.org' },
  { id: 5, nome: 'André Figueiredo', empresa: 'Farma Oral', tipoApoio: 'Medicamentos', contato: 'andre@farmaoral.com.br' },
  { id: 6, nome: 'Priscila Nunes', empresa: 'Grupo Saúde SP', tipoApoio: 'Infraestrutura', contato: 'priscila@saudesp.com.br' },
  { id: 7, nome: 'Vinícius Castro', empresa: 'Dente de Leite Associados', tipoApoio: 'Voluntariado técnico', contato: 'vcastro@dentedeleite.com.br' },
  { id: 8, nome: 'Marina Teixeira', empresa: 'Prime Dental', tipoApoio: 'Financeiro mensal', contato: 'marina@primedental.com.br' },
]