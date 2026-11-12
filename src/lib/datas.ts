/** Data de hoje (AAAA-MM-DD) no fuso de Brasília. */
export function hojeNoBrasil(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
