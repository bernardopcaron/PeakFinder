const BASE = "http://interno.invalid";

/** Aceita apenas caminhos internos do site como destino após o login. */
export function retornoSeguro(valor: string | null | undefined): string {
  // Espaços, tabulações e quebras de linha são descartados pelos navegadores ao interpretar a URL
  // ("/\t/site.com" vira "//site.com"), então qualquer um deles invalida o destino.
  if (!valor || !valor.startsWith("/") || valor.startsWith("//") || /[\u0000- \\]/.test(valor)) return "/";
  try {
    const url = new URL(valor, BASE);
    return url.origin === BASE ? url.pathname + url.search + url.hash : "/";
  } catch {
    return "/";
  }
}
