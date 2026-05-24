# Nuvem do Bem — CRM Social

Plataforma digital desenvolvida para centralizar e organizar as informações da ONG **Turma do Bem**, reunindo dentistas voluntários, beneficiários e patrocinadores em um único sistema. O objetivo é transformar a gestão social em um processo simples, moderno e colaborativo.

---

## Tecnologias Utilizadas

| Tecnologia | Descrição |
|---|---|
| [React 19](https://react.dev/) | Biblioteca para construção de interfaces |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática para JavaScript |
| [Vite 8](https://vite.dev/) | Bundler e servidor de desenvolvimento |
| [Tailwind CSS v4](https://tailwindcss.com/) | Estilização utilitária via classes |
| [React Router DOM v7](https://reactrouter.com/) | Roteamento entre páginas |
| [React Hook Form](https://react-hook-form.com/) | Gerenciamento e validação de formulários |
| [Font Awesome](https://fontawesome.com/) | Ícones vetoriais |

---

## Estrutura de Pastas do Projeto

```
NuvemDoBem-React/
├── public/
├── src/
│   ├── assets/                      # Imagens do projeto
│   │   ├── Imagem_Principal.jpg
│   │   ├── Sobre1.webp
│   │   ├── Sobre2.jpg
│   │   ├── turmadobem.jpg
│   │   ├── Matheus.png
│   │   ├── Davi.jpg
│   │   └── Pedro.jpg
│   ├── Components/
│   │   ├── layout/                  # Componentes globais de layout
│   │   │   ├── Header.tsx           # Cabeçalho e menu de navegação
│   │   │   └── Footer.tsx           # Rodapé
│   │   ├── sections/                # Seções reutilizáveis de página
│   │   │   ├── HeroSection.tsx      # Seção hero com imagem e chamada
│   │   │   ├── BenefitsSection.tsx  # Grade de cards de benefícios
│   │   │   └── FaqSection.tsx       # Acordeão de perguntas frequentes
│   │   └── ui/                      # Componentes de interface atômicos
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── SectionTitle.tsx
│   ├── data/
│   │   └── integrantes.ts           # Dados dos membros da equipe
│   ├── hooks/
│   │   └── usePageTitle.ts          # Hook para atualizar o título da aba
│   ├── pages/                       # Uma pasta por rota da aplicação
│   │   ├── HomePage/
│   │   ├── SobrePage/
│   │   ├── OngPage/
│   │   ├── FaqPage/
│   │   ├── IntegrantesListPage/
│   │   ├── IntegranteDetailPage/
│   │   ├── ContatoPage/
│   │   ├── LoginPage/
│   │   └── CadastroPage/
│   ├── App.tsx                      # Roteamento principal
│   ├── main.tsx                     # Ponto de entrada da aplicação
│   └── index.css                    # Estilos globais e tema Tailwind
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Autores e Créditos

<table>
  <tr>
    <td align="center">
      <img src="src/assets/Matheus.png" width="100" height="100" style="border-radius:50%;object-fit:cover" alt="Matheus Peres"/><br/>
      <strong>Matheus Peres</strong><br/>
      RM: 567300 • Turma: 1TDSPR<br/>
      Desenvolvedor Front-end<br/>
      <a href="https://github.com/MaThPMJ">GitHub</a> •
      <a href="https://www.linkedin.com/in/matheus10122002/">LinkedIn</a>
    </td>
    <td align="center">
      <img src="src/assets/Davi.jpg" width="100" height="100" style="border-radius:50%;object-fit:cover" alt="Davi Isac"/><br/>
      <strong>Davi Isac</strong><br/>
      RM: 567265 • Turma: 1TDSPR<br/>
      Desenvolvedor Front-end<br/>
      <a href="https://github.com/klaanyz">GitHub</a>
    </td>
    <td align="center">
      <img src="src/assets/Pedro.jpg" width="100" height="100" style="border-radius:50%;object-fit:cover" alt="Pedro Gonçalves"/><br/>
      <strong>Pedro Gonçalves</strong><br/>
      RM: 567651 • Turma: 1TDSPR<br/>
      Desenvolvedor Front-end<br/>
      <a href="https://github.com/PxdroGoncalves">GitHub</a> •
      <a href="https://www.linkedin.com/in/pedro-gonçalves-23561b389">LinkedIn</a>
    </td>
  </tr>
</table>

---

## Imagens e Ícones do Projeto

### Imagens

| Arquivo | Uso |
|---|---|
| `Imagem_Principal.jpg` | Imagem hero da página inicial |
| `Sobre1.webp` | Ilustração da seção "Problema" |
| `Sobre2.jpg` | Ilustração da seção "Solução" |
| `turmadobem.jpg` | Banner da página sobre a ONG |
| `Matheus.png` | Foto do integrante Matheus Peres |
| `Davi.jpg` | Foto do integrante Davi Isac |
| `Pedro.jpg` | Foto do integrante Pedro Gonçalves |

### Ícones

O projeto utiliza a biblioteca **[Font Awesome 6](https://fontawesome.com/)** (via CDN) para todos os ícones da interface, incluindo:

| Ícone | Classe | Uso |
|---|---|---|
| Casa | `fa-solid fa-house` | Link "Início" no menu |
| Dente | `fa-solid fa-tooth` | Tipo de cadastro Dentista |
| Mão com coração | `fa-solid fa-hand-holding-heart` | Tipo de cadastro Patrocinador |
| Usuário | `fa-solid fa-user` | Tipo de cadastro Beneficiário |
| Seta para esquerda | `fa-solid fa-arrow-left` | Botão Voltar |
| Chevron baixo | `fa-solid fa-chevron-down` | Acordeão do FAQ |
| Círculo check | `fa-solid fa-circle-check` | Confirmação de cadastro |
| GitHub | `fa-brands fa-github` | Link para perfil GitHub |
| LinkedIn | `fa-brands fa-linkedin` | Link para perfil LinkedIn |

---

## Como Usar

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- npm (incluso com o Node.js)

### Instalação e execução

```bash
# 1. Clone o repositório
git clone https://github.com/MaThPMJ/NuvemDoBem-React

# 2. Acesse a pasta do projeto
cd NuvemDoBem-React

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no navegador.

### Build para produção

```bash
npm run build
```

Os arquivos gerados ficam na pasta `dist/`.

---

## Contato

Para entrar em contato com a equipe do projeto:

| Integrante | E-mail / Redes |
|---|---|
| **Matheus Peres** | [LinkedIn](https://www.linkedin.com/in/matheus10122002/) · [GitHub](https://github.com/MaThPMJ) |
| **Davi Isac** | [GitHub](https://github.com/klaanyz) |
| **Pedro Gonçalves** | [LinkedIn](https://www.linkedin.com/in/pedro-gonçalves-23561b389) · [GitHub](https://github.com/PxdroGoncalves) |

---

## Links

| | Link |
|---|---|
| Repositório | [github.com/MaThPMJ/NuvemDoBem-React](https://github.com/MaThPMJ/NuvemDoBem-React) |
| Vídeo de demonstração | [youtube.com/watch?v=fEgc4Rw-NvM](https://www.youtube.com/watch?v=fEgc4Rw-NvM) |
| Deploy (Vercel) | [nuvem-do-bem-react.vercel.app](https://nuvem-do-bem-react.vercel.app/) |

---

> Projeto acadêmico desenvolvido na **FIAP** — Sprint 3 · Turma 1TDSPR
