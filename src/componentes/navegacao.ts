export const ITENS_NAVEGACAO = [
  { rotulo: "Explorar", caminho: "/", icone: "explorar" },
  { rotulo: "Mapa", caminho: "/mapa", icone: "mapa" },
  { rotulo: "Contribuir", caminho: "/contribuir", icone: "contribuir" },
  { rotulo: "Escaladas", caminho: "/minhas-escaladas", icone: "escaladas" },
  { rotulo: "Perfil", caminho: "/perfil", icone: "perfil" },
] as const;

export type IconeNavegacao = (typeof ITENS_NAVEGACAO)[number]["icone"];

export function estaAtivo(caminhoAtual: string, caminho: string): boolean {
  return caminho === "/" ? caminhoAtual === "/" : caminhoAtual.startsWith(caminho);
}
