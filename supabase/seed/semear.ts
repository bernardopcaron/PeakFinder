// Carrega o conteúdo demonstrativo. Pode ser executado várias vezes sem duplicar registros.
// Usa a chave de serviço: rode apenas na sua máquina, nunca a partir do site.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { grauParaOrdem } from "../../src/lib/graus";
import { AREAS_SEED, type AreaSeed } from "./dados";
import { MODELOS_DEMO, PASTA_MODELOS, gerarModelos } from "./gerar-modelos";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const DEMO = { situacao: "aprovado", origem: "demonstrativo" } as const;

export function slugDe(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function conferir<T>({ data, error }: { data: T | null; error: { message: string } | null }, contexto: string): T {
  if (error) throw new Error(`${contexto}: ${error.message}`);
  return data as T;
}

/** Atualiza o registro que casa com `chave` ou insere um novo; devolve o id. */
async function gravar(db: SupabaseClient, tabela: string, chave: Record<string, string>, valores: Record<string, unknown>): Promise<string> {
  let consulta = db.from(tabela).select("id");
  for (const [coluna, valor] of Object.entries(chave)) consulta = consulta.eq(coluna, valor);
  const existente = conferir(await consulta.maybeSingle(), `buscar em ${tabela}`) as { id: string } | null;
  if (existente) {
    conferir(await db.from(tabela).update(valores).eq("id", existente.id), `atualizar ${tabela}`);
    return existente.id;
  }
  const novo = conferir(await db.from(tabela).insert(valores).select("id").single(), `inserir em ${tabela}`) as { id: string };
  return novo.id;
}

async function enviarModelos(db: SupabaseClient): Promise<void> {
  if (!MODELOS_DEMO.every((m) => existsSync(path.join(PASTA_MODELOS, m.arquivo)))) gerarModelos();
  for (const { arquivo } of MODELOS_DEMO) {
    const { error } = await db.storage
      .from("modelos")
      .upload(`demonstrativo/${arquivo}`, readFileSync(path.join(PASTA_MODELOS, arquivo)), { contentType: "model/gltf-binary", upsert: true });
    if (error) throw new Error(`enviar ${arquivo}: ${error.message}`);
  }
}

function tracadoIlustrativo(area: AreaSeed): string {
  // Linha curta, em zigue-zague, de um ponto de partida fictício até a área.
  const pontos: [number, number][] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    pontos.push([area.lng - 0.006 * (1 - t) + (i % 2 ? 0.0006 : -0.0004), area.lat - 0.005 * (1 - t)]);
  }
  return `SRID=4326;LINESTRING(${pontos.map(([lng, lat]) => `${lng.toFixed(6)} ${lat.toFixed(6)}`).join(",")})`;
}

async function semearArea(db: SupabaseClient, area: AreaSeed): Promise<void> {
  const { setores, modelo, ...dadosArea } = area;
  const areaId = await gravar(db, "areas", { slug: slugDe(area.nome) }, { ...dadosArea, ...DEMO });

  for (const setor of setores) {
    const { vias, deslocamento, ...dadosSetor } = setor;
    const setorId = await gravar(
      db,
      "setores",
      { area_id: areaId, slug: slugDe(setor.nome) },
      { ...dadosSetor, area_id: areaId, lat: area.lat + deslocamento[0], lng: area.lng + deslocamento[1], ...DEMO },
    );
    for (const via of vias) {
      const ordem = grauParaOrdem(via.grau, via.modalidade);
      if (ordem === null) throw new Error(`Grau inválido no seed: ${via.nome} (${via.grau}, ${via.modalidade})`);
      await gravar(db, "vias", { setor_id: setorId, slug: slugDe(via.nome) }, { ...via, setor_id: setorId, grau_ordem: ordem, ...DEMO });
    }
  }

  await gravar(
    db,
    "trilhas_acesso",
    { area_id: areaId, nome: "Trilha de acesso (ilustrativa)" },
    {
      area_id: areaId,
      nome: "Trilha de acesso (ilustrativa)",
      tracado: tracadoIlustrativo(area),
      distancia_m: 900,
      desnivel_m: 120,
      descricao: "Traçado ilustrativo, sem valor para navegação.",
    },
  );

  if (!modelo) {
    conferir(await db.from("modelos_3d").delete().eq("area_id", areaId).eq("demonstrativo", true), "remover modelo demonstrativo");
  } else {
    const nome = MODELOS_DEMO.find((m) => m.arquivo === modelo)!.nome;
    await gravar(db, "modelos_3d", { area_id: areaId, nome }, {
      area_id: areaId,
      nome,
      caminho: `demonstrativo/${modelo}`,
      demonstrativo: true,
      descricao: "Modelo gerado por computador para demonstrar o visualizador. Não representa a parede real.",
    });
  }
}

async function promoverAdmin(db: SupabaseClient): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) return;
  for (let pagina = 1; ; pagina++) {
    const { data, error } = await db.auth.admin.listUsers({ page: pagina, perPage: 200 });
    if (error) throw new Error(`listar usuários: ${error.message}`);
    const usuario = data.users.find((u) => u.email?.toLowerCase() === email);
    if (usuario) {
      conferir(await db.from("perfis").update({ papel: "admin" }).eq("id", usuario.id), "promover admin");
      console.log(`Administrador definido: ${email}`);
      return;
    }
    if (data.users.length < 200) break;
  }
  console.log(`ADMIN_EMAIL (${email}) ainda não tem conta; crie a conta no site e rode o seed de novo.`);
}

export async function semear(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local");
  const db = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
  await enviarModelos(db);
  for (const area of AREAS_SEED) await semearArea(db, area);
  await promoverAdmin(db);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  semear()
    .then(() => console.log("Seed concluído."))
    .catch((erro) => {
      console.error(erro);
      process.exit(1);
    });
}
