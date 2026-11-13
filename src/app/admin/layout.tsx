import type { Metadata } from "next";
import Link from "next/link";
import { exigirAdmin } from "@/lib/sessao";
import { contarFila } from "@/modulos/admin/consultas";

export const metadata: Metadata = { title: "Administração" };

export default async function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  await exigirAdmin();
  const fila = await contarFila();
  const itens: [string, string, number?][] = [
    ["/admin", "Visão geral"],
    ["/admin/pendentes", "Pendentes", fila.pendentes],
    ["/admin/conteudo", "Conteúdo"],
    ["/admin/reportes", "Reportes", fila.reportes],
    ["/admin/comentarios", "Comentários e fotos"],
    ["/admin/usuarios", "Usuários"],
    ["/admin/trilhas", "Trilhas"],
    ["/admin/modelos", "Modelos 3D"],
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-terracota-700">Administração</p>
      <nav aria-label="Administração" className="mt-2 flex gap-1 overflow-x-auto border-b border-pedra-200 pb-2">
        {itens.map(([href, rotulo, contagem]) => (
          <Link key={href} href={href} className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium text-grafite-800 hover:bg-pedra-100">
            {rotulo}
            {contagem ? <span className="rounded-full bg-terracota-600 px-2 py-0.5 text-xs font-bold text-white">{contagem}</span> : null}
          </Link>
        ))}
      </nav>
      <div className="pt-6">{children}</div>
    </div>
  );
}
