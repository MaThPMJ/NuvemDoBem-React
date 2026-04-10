export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-12 py-8 text-[#475569]">
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-6">
        <div>
          <strong className="font-bold text-[#0F172A]">Nuvem do Bem – Projeto de Atendimento</strong>
          <p className="text-[#475569] mt-1">Inclusão social através da saúde bucal.</p>
          <small className="text-[#475569]">Projeto acadêmico (FIAP) — Sprint 2</small>
        </div>
        <div>
          <strong className="font-bold text-[#0F172A]">Navegação</strong>
          <p className="mt-1">
            <a href="/tdb" className="text-inherit underline">A ONG</a><br />
            <a href="/faq" className="text-inherit underline">Perguntas frequentes</a>
          </p>
        </div>
        <div>
          <strong className="font-bold text-[#0F172A]">Contato</strong>
          <p className="text-[#475569] mt-1">
            E-mail institucional (projeto)<br />
            Telefone (projeto)
          </p>
        </div>
      </div>
    </footer>
  )
}
