import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { clienteServico } from "../apoio/usuarios";

const db = clienteServico();
const PONTO = { lat: -22.68, lng: -45.65 };
let usuarioId: string;
let viaId: string;
let areaId: string;

async function limpar() {
  await db.from("areas").delete().like("slug", "teste-slug%");
  if (usuarioId) await db.auth.admin.deleteUser(usuarioId);
}

beforeAll(async () => {
  await db.from("areas").delete().like("slug", "teste-slug%");
  const email = `e2e+esquema${Date.now()}@peakfinder.test`;
  const { data, error } = await db.auth.admin.createUser({
    email,
    password: "senha-de-teste-123",
    email_confirm: true,
    user_metadata: { nome: "Teste Esquema" },
  });
  if (error) throw error;
  usuarioId = data.user.id;
});

afterAll(limpar);

describe("esquema do banco", () => {
  it("gerar_slug remove acentos e usa hífens", async () => {
    const { data, error } = await db.rpc("gerar_slug", { texto: "Pedra do Baú" });
    expect(error).toBeNull();
    expect(data).toBe("pedra-do-bau");
  });

  it("o cadastro no Auth cria o perfil com nome e nome de usuário", async () => {
    const { data, error } = await db.from("perfis").select("nome, nome_usuario, papel").eq("id", usuarioId).single();
    expect(error).toBeNull();
    expect(data!.nome).toBe("Teste Esquema");
    expect(data!.nome_usuario).toMatch(/^[a-z0-9_]{3,30}$/);
    expect(data!.papel).toBe("usuario");
  });

  it("áreas com o mesmo nome recebem slugs distintos", async () => {
    const nova = { nome: "Teste Slug", estado: "SP", municipio: "Teste", ...PONTO };
    const a = await db.from("areas").insert(nova).select("id, slug").single();
    const b = await db.from("areas").insert(nova).select("id, slug").single();
    expect(a.error).toBeNull();
    expect(b.error).toBeNull();
    expect(a.data!.slug).toBe("teste-slug");
    expect(b.data!.slug).toBe("teste-slug-2");
    areaId = a.data!.id;
  });

  it("setor e via são criados com slug e a via aparece em vias_resumo", async () => {
    const setor = await db.from("setores").insert({ area_id: areaId, nome: "Setor Único" }).select("id, slug").single();
    expect(setor.error).toBeNull();
    expect(setor.data!.slug).toBe("setor-unico");
    const via = await db
      .from("vias")
      .insert({ setor_id: setor.data!.id, nome: "Via de Teste", modalidade: "esportiva", grau: "7a", grau_ordem: 13 })
      .select("id, slug")
      .single();
    expect(via.error).toBeNull();
    viaId = via.data!.id;
    const resumo = await db.from("vias_resumo").select("*").eq("id", viaId).single();
    expect(resumo.error).toBeNull();
    expect(resumo.data).toMatchObject({
      area_id: areaId,
      area_slug: "teste-slug",
      setor_slug: "setor-unico",
      total_avaliacoes: 0,
      total_ascensoes: 0,
      total_favoritos: 0,
      nota_media: null,
    });
  });

  it("recusa foto ligada a dois alvos ao mesmo tempo", async () => {
    const { error } = await db.from("fotos").insert({ area_id: areaId, via_id: viaId, caminho: "x/y.jpg", tipo: "foto" });
    expect(error).not.toBeNull();
  });

  it("recusa foto sem alvo", async () => {
    const { error } = await db.from("fotos").insert({ caminho: "x/y.jpg", tipo: "foto" });
    expect(error).not.toBeNull();
  });

  it("recusa nota fora de 1 a 5 e aceita 5", async () => {
    const ruim = await db.from("avaliacoes").insert({ usuario_id: usuarioId, via_id: viaId, nota: 6 });
    expect(ruim.error).not.toBeNull();
    const boa = await db.from("avaliacoes").insert({ usuario_id: usuarioId, via_id: viaId, nota: 5 });
    expect(boa.error).toBeNull();
  });

  it("recusa favorito duplicado", async () => {
    const um = await db.from("favoritos").insert({ usuario_id: usuarioId, via_id: viaId });
    const dois = await db.from("favoritos").insert({ usuario_id: usuarioId, via_id: viaId });
    expect(um.error).toBeNull();
    expect(dois.error).not.toBeNull();
  });

  it("mapa_geojson devolve uma FeatureCollection só com aprovados", async () => {
    const { data, error } = await db.rpc("mapa_geojson");
    expect(error).toBeNull();
    expect(data.type).toBe("FeatureCollection");
    expect(Array.isArray(data.features)).toBe(true);
    const slugs = data.features.map((f: { properties: { slug: string } }) => f.properties.slug);
    expect(slugs).not.toContain("teste-slug");

    await db.from("areas").update({ situacao: "aprovado" }).eq("id", areaId);
    await db.from("vias").update({ situacao: "aprovado" }).eq("id", viaId);
    await db.from("setores").update({ situacao: "aprovado" }).eq("area_id", areaId);
    const depois = await db.rpc("mapa_geojson");
    const area = depois.data.features.find((f: { properties: { slug: string } }) => f.properties.slug === "teste-slug");
    expect(area.geometry).toEqual({ type: "Point", coordinates: [PONTO.lng, PONTO.lat] });
    expect(area.properties).toMatchObject({ tipo: "area", nome: "Teste Slug", total_vias: 1 });
    expect(area.properties.vias).toEqual([{ m: "esportiva", o: 13 }]);
  });

  it("buscar ignora acentos e maiúsculas e só devolve aprovados", async () => {
    const { data, error } = await db.rpc("buscar", { termo: "TESTE SLUG" });
    expect(error).toBeNull();
    const caminhos = data.map((r: { caminho: string }) => r.caminho);
    expect(caminhos).toContain("/areas/teste-slug");
    expect(caminhos).not.toContain("/areas/teste-slug-2");
    const via = await db.rpc("buscar", { termo: "via de teste" });
    expect(via.data.map((r: { caminho: string }) => r.caminho)).toContain(`/vias/${viaId}`);
  });
});
