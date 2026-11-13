import { faixasDaModalidade } from "@/lib/graus";
import type { ColecaoMapa, FiltrosMapa, ViaNoMapa } from "./tipos";

function viaPassa(via: ViaNoMapa, f: FiltrosMapa): boolean {
  if (f.modalidades.length > 0 && !f.modalidades.includes(via.m)) return false;
  if (f.faixas.length > 0) {
    // Uma ordem fora da escala (dado inconsistente) simplesmente não casa com nenhuma faixa.
    const faixa = faixasDaModalidade(via.m).find((x) => via.o >= x.min && via.o <= x.max);
    if (!faixa || !f.faixas.includes(faixa.id)) return false;
  }
  return true;
}

export function temFiltro(f: FiltrosMapa): boolean {
  return f.modalidades.length > 0 || f.faixas.length > 0;
}

/**
 * Mantém a área quando alguma via dela satisfaz, ao mesmo tempo, a modalidade e a faixa de grau.
 * Setores e trilhas acompanham a área a que pertencem.
 */
export function filtrarAreas(fc: ColecaoMapa, f: FiltrosMapa): ColecaoMapa {
  if (!temFiltro(f)) return { type: "FeatureCollection", features: [...fc.features] };
  const mantidas = new Set<string>();
  for (const feature of fc.features) {
    const p = feature.properties;
    if (p.tipo === "area" && p.vias.some((via) => viaPassa(via, f))) mantidas.add(p.slug);
  }
  return {
    type: "FeatureCollection",
    features: fc.features.filter((feature) => {
      const p = feature.properties;
      return mantidas.has(p.tipo === "area" ? p.slug : p.area_slug);
    }),
  };
}
