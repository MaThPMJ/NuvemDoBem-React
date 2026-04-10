import FaqSection from '../../Components/sections/FaqSection'

const faqs = [
  {
    question: 'O site é responsivo?',
    answer: 'Sim. O site foi desenvolvido com layout responsivo para funcionar em celulares, tablets e desktops.',
  },
  {
    question: 'Quais páginas compõem o projeto?',
    answer: 'O projeto inclui as páginas: Início, Sobre, A ONG, FAQ, Contato, Integrantes e Login.',
  },
  {
    question: 'Posso usar frameworks externos?',
    answer: 'Não. O desafio exige o uso de HTML, CSS e JavaScript puros, sem frameworks.',
  },
  {
    question: 'Há validação nos formulários?',
    answer: 'Sim. Os formulários de Contato e Login têm validações feitas com JavaScript nativo.',
  },
  {
    question: 'O menu funciona no celular?',
    answer: 'Sim. Um botão do tipo "hambúrguer" aparece no mobile e permite abrir/fechar o menu de navegação.',
  },
  {
    question: 'Qual o propósito do projeto?',
    answer: 'Desenvolver um site funcional e informativo que simule uma plataforma de gestão social para a ONG Turma do Bem.',
  },
]

export default function FaqPage() {
  return <FaqSection faqs={faqs} />
}
