"use client";

import { FAIXAS_BOULDER, FAIXAS_VIA, MODALIDADES, ROTULOS_MODALIDADE, type FaixaGrau, type Modalidade } from "@/lib/graus";
import { temFiltro } from "../filtros";
import type { FiltrosMapa } from "../tipos";

function Alternador({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={`min-h-11 rounded-full px-4 text-sm font-medium ring-1 ring-inset transition-colors ${
        ativo ? "bg-grafite-900 text-white ring-grafite-900" : "bg-white text-grafite-800 ring-pedra-300 hover:bg-pedra-50"
      }`}
    >
      {children}
    </button>
  );
}

function alternar<T>(lista: T[], item: T): T[] {
  return lista.includes(item) ? lista.filter((i) => i !== item) : [...lista, item];
}

export function PainelFiltros({ filtros, onChange }: { filtros: FiltrosMapa; onChange: (f: FiltrosMapa) => void }) {
  const grupoFaixas = (titulo: string, faixas: FaixaGrau[]) => (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-grafite-600">{titulo}</legend>
      <div className="flex flex-wrap gap-2">
        {faixas.map((faixa) => (
          <Alternador key={faixa.id} ativo={filtros.faixas.includes(faixa.id)} onClick={() => onChange({ ...filtros, faixas: alternar(filtros.faixas, faixa.id) })}>
            {faixa.rotulo}
          </Alternador>
        ))}
      </div>
    </fieldset>
  );
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-grafite-600">Modalidade</legend>
        <div className="flex flex-wrap gap-2">
          {MODALIDADES.map((m: Modalidade) => (
            <Alternador key={m} ativo={filtros.modalidades.includes(m)} onClick={() => onChange({ ...filtros, modalidades: alternar(filtros.modalidades, m) })}>
              {ROTULOS_MODALIDADE[m]}
            </Alternador>
          ))}
        </div>
      </fieldset>
      {grupoFaixas("Dificuldade — vias", FAIXAS_VIA)}
      {grupoFaixas("Dificuldade — boulder", FAIXAS_BOULDER)}
      {temFiltro(filtros) && (
        <button type="button" onClick={() => onChange({ modalidades: [], faixas: [] })} className="min-h-11 text-sm font-semibold text-terracota-700 underline-offset-2 hover:underline">
          Limpar filtros
        </button>
      )}
    </div>
  );
}
