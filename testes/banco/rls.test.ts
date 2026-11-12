import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { clienteAnonimo, clienteServico, criarUsuarioTeste, limparDadosTeste, type UsuarioTeste } from "../apoio/usuarios";

const servico = clienteServico();
const anonimo = clienteAnonimo();
let autor: UsuarioTeste;
let outro: UsuarioTeste;
let admin: UsuarioTeste;
let areaId: string;
let setorId: string;
let viaId: string;

const AREA = { nome: "Área RLS", estado: "SP", municipio: "Teste", lat: -22.68, lng: -45.65 };

beforeAll(async () => {
  await limparDadosTeste();
  [autor, outro, admin] = await Promise.all([criarUsuarioTeste("usuario"), criarUsuarioTeste("usuario"), criarUsuarioTeste("admin")]);
});

afterAll(limparDadosTeste);

describe("moderação de áreas", () => {
  it("usuário não consegue se autoaprovar nem se autoverificar ao inserir", async () => {
    const { data, error } = await autor.cliente
      .from("areas")
      .insert({ ...AREA, situacao: "aprovado", origem: "verificado", destaque: true, criado_por: outro.id })
      .select("id, situacao, origem, destaque, criado_por")
      .single();
    expect(error).toBeNull();
    expect(data).toMatchObject({ situacao: "pendente", origem: "comunidade", destaque: false, criado_por: autor.id });
    areaId = data!.id;
  });

  it("usuário não consegue aprovar a própria área por update", async () => {
    const { error } = await autor.cliente.from("areas").update({ situacao: "aprovado" }).eq("id", areaId);
    expect(error).not.toBeNull();
    const { data } = await servico.from("areas").select("situacao, origem").eq("id", areaId).single();
    expect(data).toEqual({ situacao: "pendente", origem: "comunidade" });
  });

  it("usuário não consegue mudar a origem para verificado", async () => {
    const { error } = await autor.cliente.from("areas").update({ origem: "verificado" }).eq("id", areaId);
    expect(error).not.toBeNull();
  });

  it("área pendente só é visível para o autor e o admin", async () => {
    const ler = (c: typeof anonimo) => c.from("areas").select("id").eq("id", areaId);
    expect((await ler(anonimo)).data).toEqual([]);
    expect((await ler(outro.cliente)).data).toEqual([]);
    expect((await ler(autor.cliente)).data).toHaveLength(1);
    expect((await ler(admin.cliente)).data).toHaveLength(1);
  });

  it("autor edita a descrição enquanto pendente", async () => {
    const { data, error } = await autor.cliente.from("areas").update({ descricao: "Editada" }).eq("id", areaId).select("descricao");
    expect(error).toBeNull();
    expect(data).toEqual([{ descricao: "Editada" }]);
  });

  it("outro usuário não edita a área alheia", async () => {
    const { data } = await outro.cliente.from("areas").update({ descricao: "Invasão" }).eq("id", areaId).select("id");
    expect(data ?? []).toEqual([]);
  });

  it("autor cria setor e via na própria área pendente; outro usuário não", async () => {
    const setor = await autor.cliente.from("setores").insert({ area_id: areaId, nome: "Setor RLS" }).select("id, situacao").single();
    expect(setor.error).toBeNull();
    expect(setor.data!.situacao).toBe("pendente");
    setorId = setor.data!.id;
    const via = await autor.cliente
      .from("vias")
      .insert({ setor_id: setorId, nome: "Via RLS", modalidade: "esportiva", grau: "7a", grau_ordem: 13, situacao: "aprovado" })
      .select("id, situacao, origem")
      .single();
    expect(via.error).toBeNull();
    expect(via.data).toMatchObject({ situacao: "pendente", origem: "comunidade" });
    viaId = via.data!.id;
    const invasor = await outro.cliente.from("setores").insert({ area_id: areaId, nome: "Setor Invasor" });
    expect(invasor.error).not.toBeNull();
  });

  it("admin aprova e o anônimo passa a ler", async () => {
    for (const [tabela, id] of [["areas", areaId], ["setores", setorId], ["vias", viaId]] as const) {
      const { error } = await admin.cliente.from(tabela).update({ situacao: "aprovado" }).eq("id", id);
      expect(error).toBeNull();
    }
    expect((await anonimo.from("areas").select("id").eq("id", areaId)).data).toHaveLength(1);
    expect((await anonimo.from("vias_resumo").select("id, area_id").eq("id", viaId)).data).toEqual([{ id: viaId, area_id: areaId }]);
  });

  it("depois de aprovada, o autor não edita mais", async () => {
    const { data } = await autor.cliente.from("areas").update({ descricao: "Tarde demais" }).eq("id", areaId).select("id");
    expect(data ?? []).toEqual([]);
  });

  it("admin promove a verificado", async () => {
    const { data, error } = await admin.cliente.from("areas").update({ origem: "verificado" }).eq("id", areaId).select("origem");
    expect(error).toBeNull();
    expect(data).toEqual([{ origem: "verificado" }]);
  });
});

describe("perfis", () => {
  it("usuário não consegue se promover a admin", async () => {
    const { error } = await autor.cliente.from("perfis").update({ papel: "admin" }).eq("id", autor.id);
    expect(error).not.toBeNull();
    const { data } = await servico.from("perfis").select("papel").eq("id", autor.id).single();
    expect(data!.papel).toBe("usuario");
  });

  it("usuário edita a própria bio, mas não o perfil de outro", async () => {
    const meu = await autor.cliente.from("perfis").update({ bio: "Escalo aos domingos" }).eq("id", autor.id).select("bio");
    expect(meu.data).toEqual([{ bio: "Escalo aos domingos" }]);
    const alheio = await autor.cliente.from("perfis").update({ bio: "x" }).eq("id", outro.id).select("id");
    expect(alheio.data ?? []).toEqual([]);
  });

  it("admin altera o papel de outro usuário", async () => {
    const { data, error } = await admin.cliente.from("perfis").update({ papel: "admin" }).eq("id", outro.id).select("papel");
    expect(error).toBeNull();
    expect(data).toEqual([{ papel: "admin" }]);
    await servico.from("perfis").update({ papel: "usuario" }).eq("id", outro.id);
  });
});

describe("atividade do usuário", () => {
  it("favoritos são privados e ascensões são públicas", async () => {
    expect((await autor.cliente.from("favoritos").insert({ via_id: viaId })).error).toBeNull();
    expect((await autor.cliente.from("ascensoes").insert({ via_id: viaId, data: "2026-01-10", estilo: "a_vista" })).error).toBeNull();
    expect((await outro.cliente.from("favoritos").select("id").eq("usuario_id", autor.id)).data).toEqual([]);
    expect((await autor.cliente.from("favoritos").select("id")).data).toHaveLength(1);
    expect((await outro.cliente.from("ascensoes").select("id").eq("usuario_id", autor.id)).data).toHaveLength(1);
    expect((await anonimo.from("vias_resumo").select("total_favoritos, total_ascensoes").eq("id", viaId).single()).data).toEqual({
      total_favoritos: 1,
      total_ascensoes: 1,
    });
  });

  it("usuário não grava favorito, ascensão ou avaliação em nome de outro", async () => {
    expect((await autor.cliente.from("favoritos").insert({ via_id: viaId, usuario_id: outro.id })).error).not.toBeNull();
    expect((await autor.cliente.from("ascensoes").insert({ via_id: viaId, usuario_id: outro.id, data: "2026-01-10", estilo: "flash" })).error).not.toBeNull();
    expect((await autor.cliente.from("avaliacoes").insert({ via_id: viaId, usuario_id: outro.id, nota: 5 })).error).not.toBeNull();
  });

  it("comentário oculto some para o público e continua visível ao admin", async () => {
    const { data, error } = await autor.cliente.from("comentarios").insert({ via_id: viaId, texto: "Via excelente" }).select("id").single();
    expect(error).toBeNull();
    expect((await anonimo.from("comentarios").select("id").eq("id", data!.id)).data).toHaveLength(1);
    expect((await outro.cliente.from("comentarios").update({ oculto: true }).eq("id", data!.id).select("id")).data ?? []).toEqual([]);
    expect((await admin.cliente.from("comentarios").update({ oculto: true }).eq("id", data!.id)).error).toBeNull();
    expect((await anonimo.from("comentarios").select("id").eq("id", data!.id)).data).toEqual([]);
    expect((await admin.cliente.from("comentarios").select("id").eq("id", data!.id)).data).toHaveLength(1);
  });

  it("usuário não insere comentário já oculto nem reporte já confirmado", async () => {
    expect((await autor.cliente.from("comentarios").insert({ via_id: viaId, texto: "x", oculto: true })).error).not.toBeNull();
    const { data, error } = await autor.cliente
      .from("reportes")
      .insert({ area_id: areaId, tipo: "interdicao", descricao: "Acesso fechado pelo proprietário.", situacao: "confirmado" })
      .select("id, situacao")
      .single();
    expect(error).toBeNull();
    expect(data!.situacao).toBe("aberto");
  });

  it("reporte de interdição só fica público depois de confirmado", async () => {
    const { data } = await autor.cliente.from("reportes").select("id").eq("area_id", areaId).single();
    const id = data!.id;
    expect((await anonimo.from("reportes").select("id").eq("id", id)).data).toEqual([]);
    expect((await outro.cliente.from("reportes").select("id").eq("id", id)).data).toEqual([]);
    expect((await admin.cliente.from("reportes").select("id").eq("id", id)).data).toHaveLength(1);
    expect((await outro.cliente.from("reportes").update({ situacao: "confirmado" }).eq("id", id).select("id")).data ?? []).toEqual([]);
    expect((await admin.cliente.from("reportes").update({ situacao: "confirmado" }).eq("id", id)).error).toBeNull();
    expect((await anonimo.from("reportes").select("id").eq("id", id)).data).toHaveLength(1);
  });

  it("reporte de erro confirmado continua privado", async () => {
    const { data } = await autor.cliente
      .from("reportes")
      .insert({ via_id: viaId, tipo: "erro", descricao: "O grau informado está errado." })
      .select("id")
      .single();
    await admin.cliente.from("reportes").update({ situacao: "confirmado" }).eq("id", data!.id);
    expect((await anonimo.from("reportes").select("id").eq("id", data!.id)).data).toEqual([]);
  });
});

describe("anônimo", () => {
  it("não insere em nenhuma tabela", async () => {
    const tentativas: [string, Record<string, unknown>][] = [
      ["areas", AREA],
      ["setores", { area_id: areaId, nome: "Anon" }],
      ["vias", { setor_id: setorId, nome: "Anon", modalidade: "esportiva", grau: "7a", grau_ordem: 13 }],
      ["fotos", { via_id: viaId, caminho: "a/b.jpg" }],
      ["comentarios", { via_id: viaId, texto: "anon", usuario_id: autor.id }],
      ["favoritos", { via_id: viaId, usuario_id: autor.id }],
      ["ascensoes", { via_id: viaId, usuario_id: autor.id, data: "2026-01-01", estilo: "flash" }],
      ["avaliacoes", { via_id: viaId, usuario_id: autor.id, nota: 3 }],
      ["reportes", { via_id: viaId, usuario_id: autor.id, tipo: "erro", descricao: "anon anon anon" }],
      ["trilhas_acesso", { area_id: areaId, nome: "T", tracado: "SRID=4326;LINESTRING(-45 -22,-45.1 -22.1)" }],
      ["modelos_3d", { area_id: areaId, nome: "M", caminho: "x.glb" }],
    ];
    for (const [tabela, linha] of tentativas) {
      const { error } = await anonimo.from(tabela).insert(linha);
      expect(error, `insert anônimo em ${tabela}`).not.toBeNull();
    }
  });

  it("usuário comum não cadastra trilha nem modelo 3D; admin cadastra", async () => {
    const trilha = { area_id: areaId, nome: "Trilha", tracado: "SRID=4326;LINESTRING(-45.65 -22.68,-45.66 -22.69)" };
    expect((await autor.cliente.from("trilhas_acesso").insert(trilha)).error).not.toBeNull();
    expect((await autor.cliente.from("modelos_3d").insert({ area_id: areaId, nome: "M", caminho: "x.glb" })).error).not.toBeNull();
    expect((await admin.cliente.from("trilhas_acesso").insert(trilha)).error).toBeNull();
  });
});

describe("storage", () => {
  const imagem = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0])], { type: "image/jpeg" });

  it("usuário grava só na própria pasta do bucket fotos", async () => {
    const propria = await autor.cliente.storage.from("fotos").upload(`${autor.id}/teste.jpg`, imagem, { contentType: "image/jpeg" });
    expect(propria.error).toBeNull();
    const alheia = await autor.cliente.storage.from("fotos").upload(`${outro.id}/teste.jpg`, imagem, { contentType: "image/jpeg" });
    expect(alheia.error).not.toBeNull();
  });

  it("bucket fotos recusa arquivo que não é imagem", async () => {
    const pdf = new Blob(["%PDF-1.4"], { type: "application/pdf" });
    const { error } = await autor.cliente.storage.from("fotos").upload(`${autor.id}/doc.pdf`, pdf, { contentType: "application/pdf" });
    expect(error).not.toBeNull();
  });

  it("só admin grava no bucket modelos", async () => {
    const glb = new Blob([new Uint8Array([0x67, 0x6c, 0x54, 0x46])], { type: "model/gltf-binary" });
    const comum = await autor.cliente.storage.from("modelos").upload(`${autor.id}/m.glb`, glb, { contentType: "model/gltf-binary" });
    expect(comum.error).not.toBeNull();
    const doAdmin = await admin.cliente.storage.from("modelos").upload(`${admin.id}/m.glb`, glb, { contentType: "model/gltf-binary" });
    expect(doAdmin.error).toBeNull();
  });

  it("anônimo não grava e lê pela URL pública", async () => {
    const { error } = await anonimo.storage.from("fotos").upload(`${autor.id}/anon.jpg`, imagem, { contentType: "image/jpeg" });
    expect(error).not.toBeNull();
    const url = anonimo.storage.from("fotos").getPublicUrl(`${autor.id}/teste.jpg`).data.publicUrl;
    expect((await fetch(url)).status).toBe(200);
  });
});
