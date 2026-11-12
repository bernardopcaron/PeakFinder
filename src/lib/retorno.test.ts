import { describe, expect, it } from "vitest";
import { retornoSeguro } from "./retorno";

describe("retornoSeguro", () => {
  it("aceita caminhos internos", () => {
    expect(retornoSeguro("/minhas-escaladas")).toBe("/minhas-escaladas");
    expect(retornoSeguro("/vias/abc?x=1")).toBe("/vias/abc?x=1");
  });
  it("troca destinos externos ou malformados pela página inicial", () => {
    for (const ruim of ["https://externo.com", "//externo.com", "/\\externo.com", "externo", "", null, undefined, "javascript:alert(1)"]) {
      expect(retornoSeguro(ruim)).toBe("/");
    }
  });
});
