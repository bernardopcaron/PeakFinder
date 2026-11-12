const ROTULOS = { pendente: "Em análise", rejeitado: "Rejeitada", aprovado: "Aprovada" } as const;

/** Mostra a situação de moderação; registros aprovados não recebem marca nas páginas públicas. */
export function SeloSituacao({ situacao, sempre = false }: { situacao: keyof typeof ROTULOS; sempre?: boolean }) {
  if (situacao === "aprovado" && !sempre) return null;
  const classes =
    situacao === "aprovado" ? "bg-mata-100 text-mata-800" : situacao === "rejeitado" ? "bg-terracota-100 text-terracota-800" : "bg-areia-200 text-areia-900";
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${classes}`}>{ROTULOS[situacao]}</span>;
}
