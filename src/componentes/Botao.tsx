import type { ButtonHTMLAttributes } from "react";

export type VarianteBotao = "primario" | "secundario" | "fantasma";

const VARIANTES: Record<VarianteBotao, string> = {
  primario: "bg-terracota-600 text-white hover:bg-terracota-700",
  secundario: "bg-white text-grafite-900 ring-1 ring-inset ring-pedra-300 hover:bg-pedra-50",
  fantasma: "text-grafite-700 hover:bg-pedra-100",
};

export function classesBotao(variante: VarianteBotao = "primario"): string {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTES[variante]}`;
}

export function Botao({
  variante = "primario",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: VarianteBotao }) {
  return <button {...props} className={`${classesBotao(variante)} ${className}`} />;
}
