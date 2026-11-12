import { MODALIDADES, ROTULOS_MODALIDADE } from "@/lib/graus";
import { plural } from "@/lib/formato";
import type { ResumoEscaladas as Resumo } from "../resumo";

export function ResumoEscaladas({ resumo }: { resumo: Resumo }) {
  const maximos = MODALIDADES.filter((m) => resumo.maximoPorModalidade[m]);
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-pedra-200 ring-1 ring-pedra-200 sm:grid-cols-5">
      <div className="bg-white p-4">
        <dt className="text-xs font-semibold uppercase tracking-wide text-grafite-600">Total</dt>
        <dd className="mt-1 text-xl font-bold">{plural(resumo.total, "ascensão", "ascensões")}</dd>
      </div>
      {maximos.map((m) => (
        <div key={m} className="bg-white p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-grafite-600">Máximo · {ROTULOS_MODALIDADE[m]}</dt>
          <dd className="mt-1 text-xl font-bold text-terracota-700">{resumo.maximoPorModalidade[m]}</dd>
        </div>
      ))}
    </dl>
  );
}
