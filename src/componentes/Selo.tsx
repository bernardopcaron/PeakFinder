export type Origem = "verificado" | "comunidade" | "demonstrativo";

const SELOS: Record<Origem, { texto: string; classes: string }> = {
  verificado: { texto: "Verificado", classes: "bg-mata-100 text-mata-800 ring-mata-300" },
  comunidade: { texto: "Comunidade", classes: "bg-areia-100 text-areia-900 ring-areia-300" },
  demonstrativo: { texto: "Dados demonstrativos", classes: "bg-pedra-100 text-pedra-800 ring-pedra-300" },
};

export function Selo({ origem }: { origem: Origem }) {
  const { texto, classes } = SELOS[origem];
  return (
    <span data-origem={origem} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${classes}`}>
      {texto}
    </span>
  );
}
