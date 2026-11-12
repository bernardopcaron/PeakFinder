import { describe, expect, it } from "vitest";
import {
  ESCALA_BOULDER,
  ESCALA_VIA,
  FAIXAS_BOULDER,
  FAIXAS_VIA,
  faixaDoGrau,
  grauParaOrdem,
  grausDaModalidade,
} from "./index";

describe("escalas", () => {
  it("a escala de vias tem os 30 graus brasileiros em ordem", () => {
    expect(ESCALA_VIA.length).toBe(30);
    expect(ESCALA_VIA[0]).toBe("I");
    expect(ESCALA_VIA[11]).toBe("VIsup");
    expect(ESCALA_VIA[12]).toBe("7a");
    expect(ESCALA_VIA[29]).toBe("12c");
  });

  it("a escala de boulder vai de V0 a V16", () => {
    expect(ESCALA_BOULDER.length).toBe(17);
    expect(ESCALA_BOULDER[0]).toBe("V0");
    expect(ESCALA_BOULDER[16]).toBe("V16");
  });

  it("boulder usa a escala V e as demais modalidades a brasileira", () => {
    expect(grausDaModalidade("boulder")).toBe(ESCALA_BOULDER);
    for (const m of ["esportiva", "tradicional", "mista"] as const) {
      expect(grausDaModalidade(m)).toBe(ESCALA_VIA);
    }
  });
});

describe("grauParaOrdem", () => {
  it("ordena VIsup antes de 7a", () => {
    expect(grauParaOrdem("VIsup", "esportiva")).toBe(12);
    expect(grauParaOrdem("VIsup", "esportiva")!).toBeLessThan(grauParaOrdem("7a", "esportiva")!);
  });

  it("recusa grau que não pertence à modalidade", () => {
    expect(grauParaOrdem("V5", "esportiva")).toBeNull();
    expect(grauParaOrdem("7a", "boulder")).toBeNull();
  });

  it("aceita grau de boulder na modalidade boulder", () => {
    expect(grauParaOrdem("V5", "boulder")).toBe(6);
  });

  it("é sensível a maiúsculas e minúsculas", () => {
    expect(grauParaOrdem("7A", "esportiva")).toBeNull();
  });
});

describe("faixas", () => {
  it("cada grau de via cai em exatamente uma faixa", () => {
    for (let ordem = 1; ordem <= 30; ordem++) {
      expect(FAIXAS_VIA.filter((f) => ordem >= f.min && ordem <= f.max)).toHaveLength(1);
    }
  });

  it("cada grau de boulder cai em exatamente uma faixa", () => {
    for (let ordem = 1; ordem <= 17; ordem++) {
      expect(FAIXAS_BOULDER.filter((f) => ordem >= f.min && ordem <= f.max)).toHaveLength(1);
    }
  });

  it("os limites das faixas de via seguem os graus da spec", () => {
    const rotulo = (grau: string) =>
      FAIXAS_VIA.find((f) => f.id === faixaDoGrau(grauParaOrdem(grau, "esportiva")!, "esportiva"))!.rotulo;
    expect(rotulo("IVsup")).toBe("Até IV");
    expect(rotulo("V")).toBe("V a VIsup");
    expect(rotulo("7c")).toBe("7º grau");
    expect(rotulo("8a")).toBe("8º grau");
    expect(rotulo("9a")).toBe("9º grau ou mais");
    expect(rotulo("12c")).toBe("9º grau ou mais");
  });

  it("os limites das faixas de boulder seguem a spec", () => {
    const rotulo = (grau: string) =>
      FAIXAS_BOULDER.find((f) => f.id === faixaDoGrau(grauParaOrdem(grau, "boulder")!, "boulder"))!.rotulo;
    expect(rotulo("V2")).toBe("V0–V2");
    expect(rotulo("V3")).toBe("V3–V5");
    expect(rotulo("V8")).toBe("V6–V8");
    expect(rotulo("V16")).toBe("V9+");
  });
});
