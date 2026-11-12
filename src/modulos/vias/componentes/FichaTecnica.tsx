import { ROTULOS_MODALIDADE } from "@/lib/graus";
import { metros, texto } from "@/lib/formato";
import type { ViaDetalhe } from "../tipos";

export function FichaTecnica({ via }: { via: ViaDetalhe }) {
  const itens: [string, string][] = [
    ["Grau", via.grau],
    ["Modalidade", ROTULOS_MODALIDADE[via.modalidade]],
    ["Altura", metros(via.altura_m)],
    ["Extensão", metros(via.extensao_m)],
    ["Costuras", texto(via.costuras)],
    ["Proteção", texto(via.protecao)],
    ["Crux", texto(via.crux)],
    ["Conquistadores", texto(via.conquistadores)],
    ["Ano da conquista", texto(via.ano_conquista)],
  ];
  return (
    <section aria-label="Ficha técnica">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-pedra-200 ring-1 ring-pedra-200 sm:grid-cols-3">
        {itens.map(([termo, valor]) => (
          <div key={termo} className={`bg-white p-4 ${["Proteção", "Crux"].includes(termo) ? "col-span-2 sm:col-span-3" : ""}`}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-grafite-600">{termo}</dt>
            <dd className={`mt-1 ${termo === "Grau" ? "text-2xl font-bold text-terracota-700" : "text-base font-medium"}`}>{valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
