import type { IconeNavegacao } from "./navegacao";

const TRACOS: Record<IconeNavegacao, string> = {
  explorar: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.3-4.3",
  mapa: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14",
  contribuir: "M12 5v14M5 12h14",
  escaladas: "m3 20 6-11 4 6 2-3 6 8H3Z",
  perfil: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
};

export function Icone({ nome, className }: { nome: IconeNavegacao; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "h-6 w-6"}
    >
      <path d={TRACOS[nome]} />
    </svg>
  );
}
