import Link from "next/link";
import { plural } from "@/lib/formato";
import { exigirAdmin } from "@/lib/sessao";
import { contarFila } from "@/modulos/admin/consultas";

export default async function PaginaAdmin() {
  await exigirAdmin();
  const fila = await contarFila();
  const cartoes = [
    { href: "/admin/pendentes", titulo: plural(fila.pendentes, "cadastro pendente", "cadastros pendentes"), texto: "Áreas, setores e vias enviados pela comunidade aguardando aprovação." },
    { href: "/admin/reportes", titulo: plural(fila.reportes, "reporte aberto", "reportes abertos"), texto: "Erros, restrições e interdições de acesso informados pelos usuários." },
    { href: "/admin/conteudo", titulo: "Conteúdo publicado", texto: "Marque como Verificado o que foi conferido tecnicamente." },
    { href: "/admin/comentarios", titulo: "Comentários e fotos", texto: "Oculte conteúdo inadequado ou restaure o que foi ocultado." },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Visão geral</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {cartoes.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="block h-full rounded-xl bg-white p-5 ring-1 ring-pedra-200 hover:ring-terracota-400">
              <span className="text-lg font-semibold">{c.titulo}</span>
              <span className="mt-1 block text-sm text-grafite-600">{c.texto}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
