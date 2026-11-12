import type { Metadata } from "next";
import Link from "next/link";
import { FormBusca } from "@/componentes/FormBusca";
import { buscarTudo } from "@/modulos/areas/consultas";

export const metadata: Metadata = { title: "Buscar" };

export default async function PaginaBusca({ searchParams }: PageProps<"/buscar">) {
  const { q } = await searchParams;
  const termo = typeof q === "string" ? q.trim() : "";
  const resultados = await buscarTudo(termo);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Buscar</h1>
      <div className="mt-4">
        <FormBusca valor={termo} />
      </div>
      {termo.length >= 2 && (
        <div className="mt-6">
          {resultados.length === 0 ? (
            <div className="rounded-lg bg-pedra-100 px-4 py-8 text-center">
              <p className="font-semibold">Nada encontrado</p>
              <p className="mt-1 text-sm text-grafite-600">Tente outro nome ou veja as áreas no mapa.</p>
            </div>
          ) : (
            <ul className="divide-y divide-pedra-200 overflow-hidden rounded-xl bg-white ring-1 ring-pedra-200">
              {resultados.map((r) => (
                <li key={`${r.tipo}-${r.id}`}>
                  <Link href={r.caminho} className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-areia-50">
                    <span className="w-14 shrink-0 rounded bg-pedra-100 py-1 text-center text-xs font-semibold uppercase text-grafite-700">
                      {r.tipo === "area" ? "Área" : "Via"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{r.titulo}</span>
                      <span className="block truncate text-sm text-grafite-600">{r.subtitulo}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
