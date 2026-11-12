import type { ReactNode } from "react";

const TONS = {
  erro: "border-terracota-300 bg-terracota-50 text-terracota-900",
  sucesso: "border-mata-300 bg-mata-50 text-mata-900",
  neutro: "border-pedra-300 bg-pedra-50 text-grafite-800",
  alerta: "border-areia-400 bg-areia-100 text-areia-900",
};

export function Aviso({ tom = "neutro", children, className = "" }: { tom?: keyof typeof TONS; children: ReactNode; className?: string }) {
  return (
    <div role={tom === "erro" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${TONS[tom]} ${className}`}>
      {children}
    </div>
  );
}
