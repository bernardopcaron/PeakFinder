import { describe, expect, it } from "vitest";
import { calcularEnquadramento } from "./enquadrar";

describe("calcularEnquadramento", () => {
  it("mira no centro da caixa", () => {
    const r = calcularEnquadramento({ min: [0, 0, 0], max: [10, 20, 4] }, 45);
    expect(r.alvo).toEqual([5, 10, 2]);
  });

  it("afasta a câmera conforme o tamanho da caixa", () => {
    const pequena = calcularEnquadramento({ min: [0, 0, 0], max: [1, 1, 1] }, 45);
    const grande = calcularEnquadramento({ min: [0, 0, 0], max: [50, 50, 50] }, 45);
    expect(grande.distancia).toBeGreaterThan(pequena.distancia);
  });

  it("a posição fica à distância calculada do alvo", () => {
    const r = calcularEnquadramento({ min: [-5, 0, -5], max: [5, 30, 5] }, 45);
    const d = Math.hypot(r.posicao[0] - r.alvo[0], r.posicao[1] - r.alvo[1], r.posicao[2] - r.alvo[2]);
    expect(d).toBeCloseTo(r.distancia, 5);
  });

  it("a esfera que envolve a caixa cabe no campo de visão", () => {
    const r = calcularEnquadramento({ min: [0, 0, 0], max: [10, 10, 10] }, 45);
    const raio = Math.hypot(10, 10, 10) / 2;
    expect(r.distancia).toBeGreaterThanOrEqual(raio / Math.sin((45 * Math.PI) / 360));
  });

  it("caixa de volume zero devolve distância finita e positiva", () => {
    const r = calcularEnquadramento({ min: [3, 3, 3], max: [3, 3, 3] }, 45);
    expect(Number.isFinite(r.distancia)).toBe(true);
    expect(r.distancia).toBeGreaterThan(0);
    expect(r.posicao.every(Number.isFinite)).toBe(true);
  });
});
