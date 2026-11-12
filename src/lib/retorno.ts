/** Aceita apenas caminhos internos do site como destino após o login. */
export function retornoSeguro(valor: string | null | undefined): string {
  if (!valor || !valor.startsWith("/") || valor.startsWith("//") || valor.includes("\\")) return "/";
  return valor;
}
