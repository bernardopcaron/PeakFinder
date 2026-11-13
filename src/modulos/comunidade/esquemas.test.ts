import { describe, expect, it } from "vitest";
import { esquemaArea, esquemaComentario, esquemaSetor, esquemaVia } from "./esquemas";
import { esquemaReporte } from "../moderacao/esquemas";

const AREA = { nome: "Falésia Nova", estado: "SP", municipio: "São Bento do Sapucaí", lat: "-22.68", lng: "-45.65" };
const UUID = "3b241101-e2bb-4255-8caf-4136c566a962";
const VIA = { setor_id: UUID, nome: "Via Nova", modalidade: "esportiva", grau: "7a" };

const erro = (r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }, campo: string) =>
  r.error?.issues.find((i) => i.path[0] === campo)?.message;

describe("esquemaArea", () => {
  it("aceita uma área no Brasil e converte as coordenadas em número", () => {
    const r = esquemaArea.safeParse(AREA);
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({ lat: -22.68, lng: -45.65, estado: "SP" });
  });

  it("recusa ponto fora do Brasil", () => {
    const r = esquemaArea.safeParse({ ...AREA, lat: "48.85", lng: "2.35" });
    expect(r.success).toBe(false);
    expect(erro(r, "lat")).toBe("O ponto precisa estar no Brasil.");
  });

  it("recusa latitude e longitude trocadas", () => {
    const r = esquemaArea.safeParse({ ...AREA, lat: "-45.65", lng: "-22.68" });
    expect(r.success).toBe(false);
    expect(erro(r, "lat")).toBe("O ponto precisa estar no Brasil.");
  });

  it("aceita vírgula decimal nas coordenadas", () => {
    const r = esquemaArea.safeParse({ ...AREA, lat: "-22,68", lng: "-45,65" });
    expect(r.data).toMatchObject({ lat: -22.68, lng: -45.65 });
  });

  it("exige coordenadas, UF válida e nome com pelo menos 3 letras", () => {
    expect(erro(esquemaArea.safeParse({ ...AREA, lat: "", lng: "" }), "lat")).toBe("Marque o ponto no mapa ou informe a latitude.");
    expect(erro(esquemaArea.safeParse({ ...AREA, lat: "abc" }), "lat")).toBe("Informe um número válido.");
    expect(erro(esquemaArea.safeParse({ ...AREA, estado: "XX" }), "estado")).toBe("Escolha o estado.");
    expect(erro(esquemaArea.safeParse({ ...AREA, nome: "ab" }), "nome")).toBeDefined();
  });
});

describe("esquemaSetor", () => {
  it("aceita setor sem ponto e recusa ponto incompleto ou fora do Brasil", () => {
    expect(esquemaSetor.safeParse({ area_id: UUID, nome: "Setor A" }).success).toBe(true);
    expect(esquemaSetor.safeParse({ area_id: UUID, nome: "Setor A", lat: "", lng: "" }).success).toBe(true);
    expect(erro(esquemaSetor.safeParse({ area_id: UUID, nome: "Setor A", lat: "-22.68", lng: "" }), "lng")).toBe("Informe também a longitude.");
    expect(erro(esquemaSetor.safeParse({ area_id: UUID, nome: "Setor A", lat: "48.85", lng: "2.35" }), "lat")).toBe("O ponto precisa estar no Brasil.");
  });

  it("limita o tempo de aproximação a 0–600 minutos", () => {
    expect(esquemaSetor.safeParse({ area_id: UUID, nome: "Setor A", tempo_aproximacao_min: "45" }).data?.tempo_aproximacao_min).toBe(45);
    expect(esquemaSetor.safeParse({ area_id: UUID, nome: "Setor A", tempo_aproximacao_min: "601" }).success).toBe(false);
  });
});

describe("esquemaVia", () => {
  it("aceita grau da escala da modalidade e calcula a ordem", () => {
    const r = esquemaVia.safeParse(VIA);
    expect(r.success).toBe(true);
    expect(r.data!.grau_ordem).toBe(13);
    expect(esquemaVia.safeParse({ ...VIA, modalidade: "boulder", grau: "V5" }).data!.grau_ordem).toBe(6);
  });

  it("recusa grau que não pertence à modalidade", () => {
    for (const [modalidade, grau] of [["esportiva", "V5"], ["boulder", "7a"], ["tradicional", "7A"], ["mista", ""]]) {
      const r = esquemaVia.safeParse({ ...VIA, modalidade, grau });
      expect(r.success, `${modalidade} ${grau}`).toBe(false);
      expect(erro(r, "grau")).toBe("Grau inválido para esta modalidade.");
    }
  });

  it("valida os campos numéricos opcionais", () => {
    expect(esquemaVia.safeParse({ ...VIA, costuras: "", altura_m: "", extensao_m: "" }).success).toBe(true);
    expect(esquemaVia.safeParse({ ...VIA, costuras: "12", altura_m: "30", extensao_m: "32,5" }).data).toMatchObject({ costuras: 12, altura_m: 30, extensao_m: 32.5 });
    expect(esquemaVia.safeParse({ ...VIA, costuras: "-1" }).success).toBe(false);
    expect(esquemaVia.safeParse({ ...VIA, costuras: "101" }).success).toBe(false);
    expect(esquemaVia.safeParse({ ...VIA, costuras: "2.5" }).success).toBe(false);
    expect(esquemaVia.safeParse({ ...VIA, altura_m: "0" }).success).toBe(false);
    expect(esquemaVia.safeParse({ ...VIA, altura_m: "2001" }).success).toBe(false);
  });
});

describe("comentários e reportes", () => {
  it("comentário precisa de texto e de exatamente um alvo", () => {
    expect(esquemaComentario.safeParse({ via_id: UUID, texto: "Boa via" }).success).toBe(true);
    expect(esquemaComentario.safeParse({ via_id: UUID, texto: "   " }).success).toBe(false);
    expect(esquemaComentario.safeParse({ texto: "Sem alvo" }).success).toBe(false);
    expect(esquemaComentario.safeParse({ via_id: UUID, area_id: UUID, texto: "Dois alvos" }).success).toBe(false);
  });

  it("reporte exige descrição de 10 a 2000 caracteres", () => {
    expect(esquemaReporte.safeParse({ area_id: UUID, tipo: "interdicao", descricao: "Acesso fechado pelo proprietário." }).success).toBe(true);
    expect(erro(esquemaReporte.safeParse({ area_id: UUID, tipo: "erro", descricao: "curto" }), "descricao")).toBe("Descreva com pelo menos 10 caracteres.");
    expect(esquemaReporte.safeParse({ area_id: UUID, tipo: "outro", descricao: "Descrição suficiente" }).success).toBe(false);
  });
});
