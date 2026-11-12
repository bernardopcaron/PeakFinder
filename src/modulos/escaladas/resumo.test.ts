import { describe, expect, it } from "vitest";
import { calcularResumo } from "./resumo";

const asc = (modalidade: "esportiva" | "boulder" | "tradicional" | "mista", grau: string, grau_ordem: number) => ({
  via: { modalidade, grau, grau_ordem },
});

describe("calcularResumo", () => {
  it("lista vazia não tem máximos", () => {
    expect(calcularResumo([])).toEqual({ total: 0, maximoPorModalidade: {} });
  });

  it("usa a ordem do grau, não a ordem alfabética", () => {
    const r = calcularResumo([asc("esportiva", "9c", 21), asc("esportiva", "10a", 22), asc("esportiva", "VIsup", 12)]);
    expect(r.total).toBe(3);
    expect(r.maximoPorModalidade).toEqual({ esportiva: "10a" });
  });

  it("separa o máximo por modalidade", () => {
    const r = calcularResumo([asc("esportiva", "7a", 13), asc("boulder", "V4", 5), asc("boulder", "V2", 3)]);
    expect(r.maximoPorModalidade).toEqual({ esportiva: "7a", boulder: "V4" });
  });
});
