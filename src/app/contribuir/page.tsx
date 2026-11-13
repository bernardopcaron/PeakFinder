import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Contribuir" };

const OPCOES = [
  { href: "/contribuir/area", titulo: "Nova área", texto: "Uma falésia, um morro ou um conjunto de blocos que ainda não está no mapa." },
  { href: "/contribuir/setor", titulo: "Novo setor", texto: "Uma parede ou um grupo de vias dentro de uma área existente." },
  { href: "/contribuir/via", titulo: "Nova via", texto: "Uma via ou um problema de boulder em um setor existente." },
];

export default function PaginaContribuir() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Contribuir</h1>
        <p className="mt-2 text-grafite-600">
          O PeakFinder cresce com o que a comunidade cadastra. Cada envio é analisado antes de ser publicado e aparece com o selo “Comunidade”.
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-3">
        {OPCOES.map((opcao) => (
          <li key={opcao.href}>
            <Link href={opcao.href} className="block h-full rounded-xl bg-white p-5 ring-1 ring-pedra-200 hover:ring-terracota-400">
              <span className="text-lg font-semibold text-terracota-700">{opcao.titulo}</span>
              <span className="mt-2 block text-sm text-grafite-700">{opcao.texto}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-grafite-600">
        Fotos, croquis, comentários e reportes de acesso são enviados na própria página da área ou da via. Acompanhe seus envios em{" "}
        <Link href="/minhas-escaladas" className="font-semibold text-terracota-700 underline-offset-2 hover:underline">
          Minhas escaladas
        </Link>
        .
      </p>
    </div>
  );
}
