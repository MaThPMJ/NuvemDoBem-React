import matheus from '../assets/Matheus.png'
import davi from '../assets/Davi.jpg'
import pedro from '../assets/Pedro.jpg'

export interface Integrante {
  id: string
  nome: string
  rm: string
  turma: string
  foto: string
  github: string
  linkedin: string
  bio: string
  papel: string
}

export const integrantes: Integrante[] = [
  {
    id: 'matheus',
    nome: 'Matheus Peres',
    rm: '567300',
    turma: '1TDSPR',
    foto: matheus,
    github: 'https://github.com/MaThPMJ',
    linkedin: 'https://www.linkedin.com/in/matheus10122002/',
    papel: 'Desenvolvedor Front-end',
    bio: 'Responsável pela estrutura, estilização e componentização do projeto. Focado em boas práticas de organização de código e acessibilidade.',
  },
  {
    id: 'davi',
    nome: 'Davi Isac',
    rm: '567265',
    turma: '1TDSPR',
    foto: davi,
    github: 'https://github.com/klaanyz',
    linkedin: '#',
    papel: 'Desenvolvedor Front-end',
    bio: 'Atuou no desenvolvimento das páginas e na lógica de interação com o usuário, contribuindo para a experiência responsiva do projeto.',
  },
  {
    id: 'pedro',
    nome: 'Pedro Gonçalves',
    rm: '567651',
    turma: '1TDSPR',
    foto: pedro,
    github: 'https://github.com/PxdroGoncalves',
    linkedin: 'https://www.linkedin.com/in/pedro-gonçalves-23561b389',
    papel: 'Desenvolvedor Front-end',
    bio: 'Colaborou na construção das funcionalidades de navegação e validação de formulários, garantindo a integridade dos dados inseridos.',
  },
]
