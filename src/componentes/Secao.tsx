import type { ReactNode } from "react";

export function Secao({ titulo, children, acao, className = "" }: { titulo: string; children: ReactNode; acao?: ReactNode; className?: string }) {
  return (
    <section aria-label={titulo} className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

export const AVISO_DEMONSTRATIVO = "Dados demonstrativos — não use para planejar uma escalada real.";
