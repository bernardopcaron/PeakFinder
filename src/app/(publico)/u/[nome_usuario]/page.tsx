import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/componentes/Avatar";
import { Secao } from "@/componentes/Secao";
import { ListaAscensoes } from "@/modulos/escaladas";
import { obterPerfilPublico } from "@/modulos/perfil/consultas";

export async function generateMetadata({ params }: PageProps<"/u/[nome_usuario]">): Promise<Metadata> {
  const perfil = await obterPerfilPublico((await params).nome_usuario);
  return perfil ? { title: perfil.nome } : {};
}

export default async function PaginaPerfilPublico({ params }: PageProps<"/u/[nome_usuario]">) {
  const perfil = await obterPerfilPublico((await params).nome_usuario);
  if (!perfil) notFound();
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header className="flex items-center gap-4">
        <Avatar nome={perfil.nome} fotoCaminho={perfil.foto_caminho} tamanho="g" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">{perfil.nome}</h1>
          <p className="text-sm text-grafite-600">
            @{perfil.nome_usuario} · no PeakFinder desde {new Date(perfil.criado_em).getFullYear()}
          </p>
        </div>
      </header>
      {perfil.bio && <p className="whitespace-pre-line leading-relaxed text-grafite-800">{perfil.bio}</p>}
      <Secao titulo="Ascensões recentes">
        <ListaAscensoes ascensoes={perfil.ascensoes} editavel={false} />
      </Secao>
      <Secao titulo="Contribuições aprovadas">
        {perfil.contribuicoes.length === 0 ? (
          <p className="text-sm text-grafite-600">Nenhuma contribuição aprovada ainda.</p>
        ) : (
          <ul className="divide-y divide-pedra-200 overflow-hidden rounded-xl bg-white ring-1 ring-pedra-200">
            {perfil.contribuicoes.map((c) => (
              <li key={`${c.tipo}-${c.id}`}>
                <Link href={c.caminho} className="flex min-h-12 items-center gap-3 px-4 py-2 hover:bg-areia-50">
                  <span className="w-12 shrink-0 rounded bg-pedra-100 py-1 text-center text-xs font-semibold uppercase text-grafite-700">{c.tipo === "area" ? "Área" : "Via"}</span>
                  <span className="font-medium">{c.nome}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Secao>
    </div>
  );
}
