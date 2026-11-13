import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { clienteServico, criarUsuarioTeste, type UsuarioTeste } from "../apoio/usuarios";
import { entrar, sair, simularMapaBase } from "./apoio";

const servico = clienteServico();
const sufixo = () => Math.random().toString(36).slice(2, 7).toUpperCase();
const PONTO = { estado: "MG", municipio: "Teste Admin", lat: -19.9, lng: -43.9 };

async function entrarComo(page: Page, usuario: UsuarioTeste) {
  await page.goto("/entrar");
  await entrar(page, usuario.email, usuario.senha);
  await expect(page.getByTestId("usuario-nome")).toBeVisible();
}

/** Área criada por `autor`; aprovada (via chave de serviço) quando pedido. */
async function criarArea(autor: UsuarioTeste, nome: string, aprovada = false) {
  const { data, error } = await autor.cliente.from("areas").insert({ nome, ...PONTO }).select("id, slug").single();
  if (error) throw error;
  if (aprovada) await servico.from("areas").update({ situacao: "aprovado" }).eq("id", data.id);
  return data as { id: string; slug: string };
}

test.beforeEach(async ({ page }) => simularMapaBase(page));

test("usuário comum e visitante não acessam o painel", async ({ page }) => {
  expect((await page.goto("/admin"))!.status()).toBe(404);
  const comum = await criarUsuarioTeste("usuario", "Comum Sem Painel");
  await entrarComo(page, comum);
  for (const caminho of ["/admin", "/admin/pendentes", "/admin/usuarios"]) {
    expect((await page.goto(caminho))!.status(), caminho).toBe(404);
  }
});

test("admin aprova uma área, que passa a ser pública com selo Comunidade, e depois a verifica", async ({ page }) => {
  const nome = `Área Aprovar ${sufixo()}`;
  const autor = await criarUsuarioTeste("usuario", "Autora Aprovada");
  const area = await criarArea(autor, nome);
  const admin = await criarUsuarioTeste("admin", "Admin Aprova");
  await entrarComo(page, admin);

  await page.goto("/admin/pendentes");
  const item = page.getByRole("listitem").filter({ hasText: nome });
  await expect(item).toContainText("Autora Aprovada");
  await item.getByRole("button", { name: "Aprovar" }).click();
  await expect(item).toHaveCount(0);

  await page.goto("/admin/conteudo");
  const linha = page.getByRole("listitem").filter({ hasText: nome });
  await linha.getByLabel(`Origem de ${nome}`).selectOption("verificado");
  await expect(linha.getByText("Salvo")).toBeVisible();
  await sair(page);

  await page.goto(`/buscar?q=${encodeURIComponent(nome)}`);
  await page.locator(`main a[href="/areas/${area.slug}"]`).click();
  await expect(page.locator('[data-origem="verificado"]').first()).toHaveText("Verificado");
  const { data } = await servico.from("areas").select("situacao, origem, moderado_por, moderado_em").eq("id", area.id).single();
  expect(data).toMatchObject({ situacao: "aprovado", origem: "verificado", moderado_por: admin.id });
  expect(data!.moderado_em).not.toBeNull();
});

test("rejeitar exige motivo, e o autor vê o motivo em Minhas contribuições", async ({ page }) => {
  const nome = `Área Rejeitar ${sufixo()}`;
  const autor = await criarUsuarioTeste("usuario", "Autor Rejeitado");
  await criarArea(autor, nome);
  const admin = await criarUsuarioTeste("admin", "Admin Rejeita");
  await entrarComo(page, admin);

  await page.goto("/admin/pendentes");
  const item = page.getByRole("listitem").filter({ hasText: nome });
  await item.getByRole("button", { name: "Rejeitar" }).click();
  await item.getByRole("button", { name: "Confirmar rejeição" }).click();
  await expect(item.getByText("Explique o motivo (mínimo de 5 caracteres).")).toBeVisible();
  await item.getByLabel("Motivo da rejeição").fill("Área duplicada: já existe no mapa.");
  await item.getByRole("button", { name: "Confirmar rejeição" }).click();
  await expect(item).toHaveCount(0);
  await sair(page);

  await entrarComo(page, autor);
  await page.goto("/minhas-escaladas");
  const contribuicao = page.getByRole("region", { name: "Minhas contribuições" }).getByRole("listitem").filter({ hasText: nome });
  await expect(contribuicao).toContainText("Rejeitada");
  await expect(contribuicao).toContainText("Motivo: Área duplicada: já existe no mapa.");
});

test("não aprova setor de área ainda pendente", async ({ page }) => {
  const nome = `Área Pai ${sufixo()}`;
  const autor = await criarUsuarioTeste("usuario", "Autor Hierarquia");
  const area = await criarArea(autor, nome);
  const nomeSetor = `Setor Filho ${sufixo()}`;
  const { error } = await autor.cliente.from("setores").insert({ area_id: area.id, nome: nomeSetor });
  expect(error).toBeNull();
  const admin = await criarUsuarioTeste("admin", "Admin Hierarquia");
  await entrarComo(page, admin);

  await page.goto("/admin/pendentes");
  const setor = page.getByRole("listitem").filter({ hasText: nomeSetor });
  await setor.getByRole("button", { name: "Aprovar" }).click();
  await expect(setor.getByText("Aprove primeiro a área deste setor.")).toBeVisible();
  await page.getByRole("listitem").filter({ hasText: nome }).filter({ hasNotText: nomeSetor }).getByRole("button", { name: "Aprovar" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: nome }).filter({ hasNotText: nomeSetor })).toHaveCount(0);
  await setor.getByRole("button", { name: "Aprovar" }).click();
  await expect(setor).toHaveCount(0);
});

test("admin edita um cadastro pendente antes de aprovar", async ({ page }) => {
  const nome = `Área Editar ${sufixo()}`;
  const autor = await criarUsuarioTeste("usuario", "Autor Editado");
  const area = await criarArea(autor, nome);
  const admin = await criarUsuarioTeste("admin", "Admin Edita");
  await entrarComo(page, admin);
  await page.goto("/admin/pendentes");
  await page.getByRole("listitem").filter({ hasText: nome }).getByRole("link", { name: "Editar" }).click();
  await expect(page.getByLabel("Nome da área")).toHaveValue(nome);
  await page.getByLabel("Tipo de rocha").fill("Quartzito");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page).toHaveURL(/\/admin\/pendentes/);
  const { data } = await servico.from("areas").select("tipo_rocha, situacao, criado_por").eq("id", area.id).single();
  expect(data).toEqual({ tipo_rocha: "Quartzito", situacao: "pendente", criado_por: autor.id });
});

test("ocultar comentário o tira da página pública e restaurar o devolve", async ({ page }) => {
  const nome = `Área Comentada ${sufixo()}`;
  const autor = await criarUsuarioTeste("usuario", "Autor Comentário");
  const area = await criarArea(autor, nome, true);
  const texto = `Comentário a moderar ${sufixo()}`;
  await autor.cliente.from("comentarios").insert({ area_id: area.id, texto });
  const admin = await criarUsuarioTeste("admin", "Admin Modera");
  await entrarComo(page, admin);

  await page.goto("/admin/comentarios");
  const item = page.getByRole("listitem").filter({ hasText: texto });
  await item.getByRole("button", { name: "Ocultar" }).click();
  await expect(item.getByText("Oculto")).toBeVisible();
  await page.goto(`/areas/${area.slug}`);
  await expect(page.getByText(texto)).toHaveCount(0);

  await page.goto("/admin/comentarios");
  await item.getByRole("button", { name: "Restaurar" }).click();
  await expect(item.getByText("Oculto")).toHaveCount(0);
  await page.goto(`/areas/${area.slug}`);
  await expect(page.getByText(texto)).toBeVisible();
});

test("interdição confirmada vira alerta na área e some quando resolvida", async ({ page }) => {
  const nome = `Área Interditada ${sufixo()}`;
  const autor = await criarUsuarioTeste("usuario", "Autor Reporte");
  const area = await criarArea(autor, nome, true);
  const descricao = `Porteira trancada pelo proprietário ${sufixo()}`;
  await autor.cliente.from("reportes").insert({ area_id: area.id, tipo: "interdicao", descricao });
  const admin = await criarUsuarioTeste("admin", "Admin Reportes");
  await entrarComo(page, admin);

  await page.goto("/admin/reportes");
  const item = page.getByRole("listitem").filter({ hasText: descricao });
  await expect(item).toContainText(nome);
  await item.getByRole("button", { name: "Confirmar" }).click();
  await expect(item.getByText("Confirmado")).toBeVisible();
  await page.goto(`/areas/${area.slug}`);
  await expect(page.getByTestId("alerta-acesso")).toContainText("Acesso interditado");
  await expect(page.getByTestId("alerta-acesso")).toContainText(descricao);

  await page.goto("/admin/reportes");
  await item.getByRole("button", { name: "Marcar como resolvido" }).click();
  await expect(item.getByText("Resolvido")).toBeVisible();
  await page.goto(`/areas/${area.slug}`);
  await expect(page.getByTestId("alerta-acesso")).toHaveCount(0);
});

test("admin promove e rebaixa outro usuário, mas não remove o próprio acesso", async ({ page }) => {
  const alvo = await criarUsuarioTeste("usuario", `Promovido ${sufixo()}`);
  const admin = await criarUsuarioTeste("admin", `Admin Papéis ${sufixo()}`);
  await entrarComo(page, admin);
  const papel = async (id: string) => (await servico.from("perfis").select("papel").eq("id", id).single()).data!.papel;

  await page.goto("/admin/usuarios");
  const linhaAlvo = page.getByRole("listitem").filter({ has: page.locator(`[data-usuario="${alvo.id}"]`) });
  await linhaAlvo.getByRole("button", { name: "Tornar administrador" }).click();
  await expect(linhaAlvo.getByRole("button", { name: "Remover administrador" })).toBeVisible();
  expect(await papel(alvo.id)).toBe("admin");
  await linhaAlvo.getByRole("button", { name: "Remover administrador" }).click();
  await expect(linhaAlvo.getByRole("button", { name: "Tornar administrador" })).toBeVisible();
  expect(await papel(alvo.id)).toBe("usuario");

  const propria = page.getByRole("listitem").filter({ has: page.locator(`[data-usuario="${admin.id}"]`) });
  await expect(propria.getByRole("button", { name: "Remover administrador" })).toHaveCount(0);
  await expect(propria.getByText("Você")).toBeVisible();
});

test("admin cadastra trilha por GPX e modelo 3D, e recusa arquivo sem traçado", async ({ page }) => {
  const nome = `Área Trilha ${sufixo()}`;
  const autor = await criarUsuarioTeste("usuario", "Autor Trilha");
  const area = await criarArea(autor, nome, true);
  const admin = await criarUsuarioTeste("admin", "Admin Trilhas");
  await entrarComo(page, admin);

  await page.goto("/admin/trilhas");
  await page.getByLabel("Área").selectOption({ label: nome });
  await page.getByLabel("Nome da trilha").fill("Trilha principal");
  await page.getByLabel("Arquivo GPX ou GeoJSON").setInputFiles({ name: "vazio.gpx", mimeType: "application/gpx+xml", buffer: Buffer.from('<gpx version="1.1"><trk><trkseg></trkseg></trk></gpx>') });
  await page.getByRole("button", { name: "Cadastrar trilha" }).click();
  await expect(page.getByText("Arquivo sem traçado.")).toBeVisible();

  const gpx = '<gpx version="1.1"><trk><trkseg><trkpt lat="-19.900" lon="-43.900"/><trkpt lat="-19.901" lon="-43.901"/><trkpt lat="-19.902" lon="-43.902"/></trkseg></trk></gpx>';
  await page.getByLabel("Arquivo GPX ou GeoJSON").setInputFiles({ name: "trilha.gpx", mimeType: "application/gpx+xml", buffer: Buffer.from(gpx) });
  await page.getByRole("button", { name: "Cadastrar trilha" }).click();
  await expect(page.getByText("Trilha cadastrada.")).toBeVisible();
  const trilhas = await servico.from("trilhas_acesso").select("nome, distancia_m").eq("area_id", area.id);
  expect(trilhas.data).toHaveLength(1);
  expect(Number(trilhas.data![0].distancia_m)).toBeGreaterThan(200);

  await page.goto("/admin/modelos");
  await page.getByLabel("Área").selectOption({ label: nome });
  await page.getByLabel("Nome do modelo").fill("Bloco de teste");
  await page.getByLabel("Arquivo GLB ou GLTF").setInputFiles({ name: "bloco.glb", mimeType: "model/gltf-binary", buffer: readFileSync("supabase/seed/modelos/bloco-boulder.glb") });
  await page.getByRole("button", { name: "Cadastrar modelo" }).click();
  await expect(page.getByText("Modelo cadastrado.")).toBeVisible({ timeout: 30000 });
  await page.goto(`/areas/${area.slug}`);
  await expect(page.getByTestId("visualizador-3d")).toHaveAttribute("data-estado", "pronto", { timeout: 30000 });
});
