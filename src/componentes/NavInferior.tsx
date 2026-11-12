"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icone } from "./Icone";
import { ITENS_NAVEGACAO, estaAtivo } from "./navegacao";

export function NavInferior() {
  const caminhoAtual = usePathname();
  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-pedra-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {ITENS_NAVEGACAO.map((item) => {
          const ativo = estaAtivo(caminhoAtual, item.caminho);
          return (
            <li key={item.caminho} className="flex-1">
              <Link
                href={item.caminho}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                  ativo ? "text-terracota-700" : "text-grafite-600"
                }`}
              >
                <Icone nome={item.icone} />
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
