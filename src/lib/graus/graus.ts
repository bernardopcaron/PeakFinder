export type Modalidade = "esportiva" | "tradicional" | "boulder" | "mista";

export const MODALIDADES: readonly Modalidade[] = ["esportiva", "tradicional", "boulder", "mista"];

export const ROTULOS_MODALIDADE: Record<Modalidade, string> = {
  esportiva: "Esportiva",
  tradicional: "Tradicional",
  boulder: "Boulder",
  mista: "Mista",
};

const ROMANOS = ["I", "II", "III", "IV", "V", "VI"].flatMap((g) => [g, `${g}sup`]);
const NUMERICOS = [7, 8, 9, 10, 11, 12].flatMap((n) => ["a", "b", "c"].map((l) => `${n}${l}`));

/** Graduação brasileira, de I a 12c. */
export const ESCALA_VIA: readonly string[] = [...ROMANOS, ...NUMERICOS];

/** Escala V de boulder, de V0 a V16. */
export const ESCALA_BOULDER: readonly string[] = Array.from({ length: 17 }, (_, i) => `V${i}`);

export type FaixaGrau = { id: string; rotulo: string; min: number; max: number };

export const FAIXAS_VIA: FaixaGrau[] = [
  { id: "via-ate-iv", rotulo: "Até IV", min: 1, max: 8 },
  { id: "via-v-vi", rotulo: "V a VIsup", min: 9, max: 12 },
  { id: "via-7", rotulo: "7º grau", min: 13, max: 15 },
  { id: "via-8", rotulo: "8º grau", min: 16, max: 18 },
  { id: "via-9-mais", rotulo: "9º grau ou mais", min: 19, max: 30 },
];

export const FAIXAS_BOULDER: FaixaGrau[] = [
  { id: "boulder-v0-v2", rotulo: "V0–V2", min: 1, max: 3 },
  { id: "boulder-v3-v5", rotulo: "V3–V5", min: 4, max: 6 },
  { id: "boulder-v6-v8", rotulo: "V6–V8", min: 7, max: 9 },
  { id: "boulder-v9-mais", rotulo: "V9+", min: 10, max: 17 },
];

export function grausDaModalidade(m: Modalidade): readonly string[] {
  return m === "boulder" ? ESCALA_BOULDER : ESCALA_VIA;
}

/** Posição do grau na escala da modalidade (base 1), ou null se o grau não pertence a ela. */
export function grauParaOrdem(grau: string, m: Modalidade): number | null {
  const indice = grausDaModalidade(m).indexOf(grau);
  return indice === -1 ? null : indice + 1;
}

export function faixasDaModalidade(m: Modalidade): FaixaGrau[] {
  return m === "boulder" ? FAIXAS_BOULDER : FAIXAS_VIA;
}

export function faixaDoGrau(ordem: number, m: Modalidade): string {
  const faixa = faixasDaModalidade(m).find((f) => ordem >= f.min && ordem <= f.max);
  if (!faixa) throw new Error(`Ordem de grau fora da escala: ${ordem}`);
  return faixa.id;
}
