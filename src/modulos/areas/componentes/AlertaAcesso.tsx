import { dataCurta } from "@/lib/formato";
import type { AlertaAcesso as Alerta } from "../tipos";

const TITULOS = { interdicao: "Acesso interditado", restricao: "Restrição de acesso" };

export function AlertaAcesso({ alertas }: { alertas: Alerta[] }) {
  if (alertas.length === 0) return null;
  return (
    <div className="space-y-2">
      {alertas.map((alerta) => (
        <div
          key={alerta.id}
          role="alert"
          data-testid="alerta-acesso"
          className={`rounded-lg border-l-4 px-4 py-3 text-sm ${
            alerta.tipo === "interdicao" ? "border-terracota-600 bg-terracota-50 text-terracota-900" : "border-areia-500 bg-areia-100 text-areia-900"
          }`}
        >
          <p className="font-semibold">{TITULOS[alerta.tipo]}</p>
          <p className="mt-1">{alerta.nota_admin || alerta.descricao}</p>
          <p className="mt-1 text-xs opacity-80">
            Confirmado em {dataCurta(alerta.criado_em)}
            {alerta.vigente_ate ? ` · vigente até ${dataCurta(alerta.vigente_ate)}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
