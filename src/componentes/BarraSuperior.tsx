"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ITENS_NAVEGACAO, estaAtivo } from "./navegacao";

export function BarraSuperior({ children }: { children?: React.ReactNode }) {
  const caminhoAtual = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-grafite-800 bg-grafite-900 text-areia-50">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" aria-label="PeakFinder, página inicial" className="flex min-h-11 items-center gap-2 font-semibold tracking-tight">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-terracota-400" fill="currentColor" aria-hidden="true">
            <path d="m2 20 7.5-13 3.5 6 2-3.2L22 20H2Z" />
          </svg>
          <span aria-hidden="true">PeakFinder</span>
        </Link>
        <nav aria-label="Navegação principal" className="hidden md:block">
          <ul className="flex gap-1">
            {ITENS_NAVEGACAO.map((item) => {
              const ativo = estaAtivo(caminhoAtual, item.caminho);
              return (
                <li key={item.caminho}>
                  <Link
                    href={item.caminho}
                    aria-current={ativo ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-md px-3 text-sm font-medium ${
                      ativo ? "bg-grafite-700 text-white" : "text-pedra-200 hover:bg-grafite-800 hover:text-white"
                    }`}
                  >
                    {item.rotulo}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">{children}</div>
      </div>
    </header>
  );
}
