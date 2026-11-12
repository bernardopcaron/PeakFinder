import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { grauParaOrdem, type Modalidade } from "../../src/lib/graus";
import { AREAS_SEED } from "../../supabase/seed/dados";
import { MODELOS_DEMO } from "../../supabase/seed/gerar-modelos";
import { semear } from "../../supabase/seed/semear";
import { clienteAnonimo, clienteServico } from "../apoio/usuarios";

const db = clienteServico();

beforeAll(async () => {
  await semear();
  await semear();
}, 180000);

describe("seed demonstrativo", () => {
  it("define 7 áreas, 4 delas em destaque e 3 com modelo 3D", () => {
    expect(AREAS_SEED).toHaveLength(7);
    expect(AREAS_SEED.filter((a) => a.destaque)).toHaveLength(4);
    expect(AREAS_SEED.filter((a) => a.modelo)).toHaveLength(3);
    for (const area of AREAS_SEED) {
      expect(area.setores.length).toBeGreaterThanOrEqual(1);
      expect(area.setores.length).toBeLessThanOrEqual(3);
      const vias = area.setores.flatMap((s) => s.vias);
      expect(vias.length).toBeGreaterThanOrEqual(4);
      expect(vias.length).toBeLessThanOrEqual(8);
    }
  });

  it("rodar duas vezes não duplica: 7 áreas demonstrativas aprovadas", async () => {
    const { data, error } = await db.from("areas").select("slug, situacao, lat, lng").eq("origem", "demonstrativo");
    expect(error).toBeNull();
    expect(data).toHaveLength(7);
    for (const area of data!) {
      expect(area.situacao).toBe("aprovado");
      expect(area.slug).not.toMatch(/-\d+$/);
      expect(area.lat).toBeGreaterThan(-34);
      expect(area.lat).toBeLessThan(6);
      expect(area.lng).toBeGreaterThan(-74);
      expect(area.lng).toBeLessThan(-34);
    }
  });

  it("nenhum conteúdo do seed é marcado como verificado", async () => {
    const total = AREAS_SEED.flatMap((a) => a.setores).flatMap((s) => s.vias).length;
    const vias = await db.from("vias").select("id", { count: "exact", head: true }).eq("origem", "demonstrativo");
    expect(vias.count).toBe(total);
    const setores = await db.from("setores").select("id", { count: "exact", head: true }).eq("origem", "demonstrativo");
    expect(setores.count).toBe(AREAS_SEED.flatMap((a) => a.setores).length);
    for (const tabela of ["areas", "setores", "vias"]) {
      const { count } = await db.from(tabela).select("id", { count: "exact", head: true }).eq("origem", "verificado");
      expect(count, tabela).toBe(0);
    }
  });

  it("toda via tem grau válido para a modalidade e ordem coerente", async () => {
    const { data } = await db.from("vias").select("nome, grau, grau_ordem, modalidade").eq("origem", "demonstrativo");
    for (const via of data!) {
      expect(grauParaOrdem(via.grau, via.modalidade as Modalidade), via.nome).toBe(via.grau_ordem);
    }
  });

  it("cada área tem uma trilha e as três áreas com modelo apontam para um GLB público", async () => {
    const trilhas = await db.from("trilhas_acesso").select("id", { count: "exact", head: true });
    expect(trilhas.count).toBe(7);
    const { data } = await db.from("modelos_3d").select("caminho, demonstrativo");
    expect(data).toHaveLength(3);
    for (const modelo of data!) {
      expect(modelo.demonstrativo).toBe(true);
      const url = clienteAnonimo().storage.from("modelos").getPublicUrl(modelo.caminho).data.publicUrl;
      const resposta = await fetch(url);
      expect(resposta.status).toBe(200);
      const bytes = new Uint8Array(await resposta.arrayBuffer());
      expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("glTF");
    }
  });

  it("os GLB gerados são válidos e têm menos de 2 MB", () => {
    expect(MODELOS_DEMO.map((m) => m.arquivo)).toEqual(["parede-vertical.glb", "parede-negativa.glb", "bloco-boulder.glb"]);
    for (const { arquivo } of MODELOS_DEMO) {
      const glb = readFileSync(`supabase/seed/modelos/${arquivo}`);
      expect(glb.subarray(0, 4).toString("latin1")).toBe("glTF");
      expect(glb.readUInt32LE(4)).toBe(2);
      expect(glb.readUInt32LE(8)).toBe(glb.length);
      expect(glb.length).toBeLessThan(2 * 1024 * 1024);
      const tamanhoJson = glb.readUInt32LE(12);
      const json = JSON.parse(glb.subarray(20, 20 + tamanhoJson).toString("utf8"));
      expect(json.asset.version).toBe("2.0");
      expect(json.meshes).toHaveLength(1);
      const posicao = json.accessors[json.meshes[0].primitives[0].attributes.POSITION];
      expect(posicao.count).toBeGreaterThan(500);
      expect(posicao.min).toHaveLength(3);
    }
  });

  it("o conteúdo demonstrativo aparece no mapa e na busca pública", async () => {
    const mapa = await clienteAnonimo().rpc("mapa_geojson");
    const tipos = (mapa.data.features as { properties: { tipo: string } }[]).map((f) => f.properties.tipo);
    expect(tipos.filter((t) => t === "area")).toHaveLength(7);
    expect(tipos.filter((t) => t === "trilha")).toHaveLength(7);
    const busca = await clienteAnonimo().rpc("buscar", { termo: "sao bento" });
    expect(busca.data.map((r: { caminho: string }) => r.caminho)).toContain("/areas/pedra-do-bau");
  });
});
