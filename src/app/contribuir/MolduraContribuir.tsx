import Link from "next/link";
import type { ReactNode } from "react";
import { Cartao } from "@/componentes/Cartao";

export function MolduraContribuir({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <nav aria-label="Você está em" className="text-sm">
        <Link href="/contribuir" className="font-medium text-terracota-700 underline-offset-2 hover:underline">
          Contribuir
        </Link>
      </nav>
      <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
      <p className="text-sm text-grafite-600">
        O cadastro passa pela análise de um administrador antes de aparecer para todos. Informe apenas o que você conhece; dados de proteção e acesso são usados por outras pessoas para decidir se escalam.
      </p>
      <Cartao className="p-5">{children}</Cartao>
    </div>
  );
}
