import { describe, expect, it } from "vitest";
import { filtrarAreas } from "./filtros";
import type { ColecaoMapa } from "./tipos";

function area(slug: string, vias: { m: string; o: number }[]) {
  return {
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [-45, -22] },
    properties: { tipo: "area" as const, id: slug, slug, nome: slug, municipio: "X", estado: "SP", origem: "demonstrativo", total_vias: vias.length, vias },
  };
}
const setor = (areaSlug: string) => ({
  type: "Feature" as const,
  geometry: { type: "Point" as const, coordinates: [-45, -22] },
  properties: { tipo: "setor" as const, id: `s-${areaSlug}`, slug: "s", nome: "S", area_slug: areaSlug, area_nome: areaSlug },
});
const trilha = (areaSlug: string) => ({
  type: "Feature" as const,
  geometry: { type: "LineString" as const, coordinates: [[-45, -22], [-45.01, -22.01]] },
  properties: { tipo: "trilha" as const, id: `t-${areaSlug}`, nome: "T", area_slug: areaSlug, distancia_m: 100 },
});

const colecao = {
  type: "FeatureCollection",
  features: [
    area("esportiva-facil", [{ m: "esportiva", o: 5 }]),
    area("boulder-duro", [{ m: "boulder", o: 10 }]),
    // tem boulder fácil e esportiva de 8º grau, mas nenhuma via que seja boulder E difícil
    area("mista", [{ m: "boulder", o: 2 }, { m: "esportiva", o: 16 }]),
    area("sem-vias", []),
    setor("esportiva-facil"), trilha("esportiva-facil"),
    setor("boulder-duro"), trilha("boulder-duro"),
  ],
} as ColecaoMapa;

const slugs = (c: ColecaoMapa) => c.features.filter((f) => f.properties.tipo === "area").map((f) => f.properties.id);

describe("filtrarAreas", () => {
  it("sem filtros devolve tudo, inclusive áreas sem vias", () => {
    expect(filtrarAreas(colecao, { modalidades: [], faixas: [] }).features).toHaveLength(colecao.features.length);
  });

  it("filtra por modalidade", () => {
    expect(slugs(filtrarAreas(colecao, { modalidades: ["boulder"], faixas: [] }))).toEqual(["boulder-duro", "mista"]);
  });

  it("filtra por faixa de grau", () => {
    expect(slugs(filtrarAreas(colecao, { modalidades: [], faixas: ["via-8"] }))).toEqual(["mista"]);
  });

  it("modalidade e faixa precisam ser satisfeitas pela mesma via", () => {
    const r = filtrarAreas(colecao, { modalidades: ["boulder"], faixas: ["boulder-v9-mais"] });
    expect(slugs(r)).toEqual(["boulder-duro"]);
  });

  it("setores e trilhas de áreas removidas também saem", () => {
    const r = filtrarAreas(colecao, { modalidades: ["boulder"], faixas: [] });
    const outros = r.features.filter((f) => f.properties.tipo !== "area").map((f) => f.properties.id);
    expect(outros).toEqual(["s-boulder-duro", "t-boulder-duro"]);
  });

  it("não altera a coleção original", () => {
    const antes = colecao.features.length;
    filtrarAreas(colecao, { modalidades: ["boulder"], faixas: [] });
    expect(colecao.features).toHaveLength(antes);
  });
});
