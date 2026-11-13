import { test, expect, type Page } from "@playwright/test";
import { abrirVia, cadastrar, sair, simularMapaBase } from "./apoio";

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const sufixo = () => Math.random().toString(36).slice(2, 7).toUpperCase();

test.beforeEach(async ({ page }) => simularMapaBase(page));

async function preencherArea(page: Page, nome: string) {
  await page.goto("/contribuir/area");
  await page.getByLabel("Nome da área").fill(nome);
  await page.getByLabel("Estado").selectOption("SP");
  await page.getByLabel("Município").fill("São Bento do Sapucaí");
  await page.getByLabel("Latitude").fill("-22.70");
  await page.getByLabel("Longitude").fill("-45.70");
  await page.getByLabel("Descrição").fill("Falésia de teste enviada pela comunidade.");
}

async function preencherVia(page: Page, nome: string) {
  await page.goto("/contribuir/via");
  await page.getByLabel("Área").selectOption({ label: "Pedra do Baú" });
  await page.getByLabel("Setor").selectOption({ label: "Bauzinho" });
  await page.getByLabel("Nome da via").fill(nome);
  await page.getByLabel("Modalidade").selectOption("esportiva");
  await page.getByLabel("Grau").selectOption("VIsup");
  await page.getByLabel("Costuras").fill("7");
}

test("visitante precisa entrar para contribuir", async ({ page }) => {
  await page.goto("/contribuir/area");
  await expect(page).toHaveURL("/entrar?retorno=%2Fcontribuir%2Farea");
});

test("área enviada fica em análise para o autor e invisível para os demais", async ({ page }) => {
  const nome = `Falésia E2E ${sufixo()}`;
  await cadastrar(page, "Quim Contribui");
  await preencherArea(page, nome);
  await page.getByRole("button", { name: "Enviar para análise" }).click();

  await expect(page).toHaveURL(/\/minhas-escaladas\?enviado=area/);
  await expect(page.getByText("Enviado para análise. Você verá aqui quando for aprovado.")).toBeVisible();
  const item = page.getByRole("region", { name: "Minhas contribuições" }).getByRole("listitem").filter({ hasText: nome });
  await expect(item).toContainText("Em análise");
  await item.getByRole("link", { name: nome }).click();
  await expect(page.getByRole("heading", { level: 1, name: nome })).toBeVisible();
  const url = page.url();

  await sair(page);
  await page.goto(`/buscar?q=${encodeURIComponent(nome)}`);
  await expect(page.getByText("Nada encontrado")).toBeVisible();
  expect((await page.goto(url))!.status()).toBe(404);
});

test("coordenadas trocadas mostram erro no campo e preservam o que foi digitado", async ({ page }) => {
  const nome = `Falésia Trocada ${sufixo()}`;
  await cadastrar(page, "Rita Trocada");
  await preencherArea(page, nome);
  await page.getByLabel("Latitude").fill("-45.70");
  await page.getByLabel("Longitude").fill("-22.70");
  await page.getByRole("button", { name: "Enviar para análise" }).click();
  await expect(page.getByText("O ponto precisa estar no Brasil.")).toBeVisible();
  await expect(page.getByLabel("Nome da área")).toHaveValue(nome);
  await expect(page.getByLabel("Município")).toHaveValue("São Bento do Sapucaí");
  await expect(page.getByLabel("Descrição")).toHaveValue("Falésia de teste enviada pela comunidade.");
  await expect(page).toHaveURL(/\/contribuir\/area/);

  await page.goto("/minhas-escaladas");
  await expect(page.getByText("Você ainda não enviou nenhuma contribuição.")).toBeVisible();
});

test("via enviada para área aprovada fica em análise e o autor pode editar", async ({ page }) => {
  const nome = `Via E2E ${sufixo()}`;
  await cadastrar(page, "Sara Via");
  await preencherVia(page, nome);
  await page.getByRole("button", { name: "Enviar para análise" }).click();
  await expect(page).toHaveURL(/\/minhas-escaladas\?enviado=via/);
  const item = page.getByRole("region", { name: "Minhas contribuições" }).getByRole("listitem").filter({ hasText: nome });
  await expect(item).toContainText("Em análise");

  await item.getByRole("link", { name: "Editar" }).click();
  await expect(page.getByLabel("Nome da via")).toHaveValue(nome);
  await expect(page.getByLabel("Grau")).toHaveValue("VIsup");
  await page.getByLabel("Grau").selectOption("7a");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page).toHaveURL(/\/minhas-escaladas\?enviado=edicao/);
  await page.getByRole("region", { name: "Minhas contribuições" }).getByRole("link", { name: nome }).click();
  await expect(page.getByRole("region", { name: "Ficha técnica" })).toContainText("7a");

  await sair(page);
  await page.goto("/areas/pedra-do-bau/bauzinho");
  await expect(page.getByTestId("linha-via")).toHaveCount(3);
});

test("duas vias com o mesmo nome no mesmo setor são aceitas", async ({ page }) => {
  const nome = `Via Repetida ${sufixo()}`;
  await cadastrar(page, "Tico Repetido");
  for (let i = 0; i < 2; i++) {
    await preencherVia(page, nome);
    await page.getByRole("button", { name: "Enviar para análise" }).click();
    await expect(page).toHaveURL(/\/minhas-escaladas\?enviado=via/);
  }
  await expect(page.getByRole("region", { name: "Minhas contribuições" }).getByRole("listitem").filter({ hasText: nome })).toHaveCount(2);
});

test("os graus oferecidos acompanham a modalidade", async ({ page }) => {
  await cadastrar(page, "Uli Grau");
  await page.goto("/contribuir/via");
  await page.getByLabel("Modalidade").selectOption("boulder");
  await expect(page.getByLabel("Grau").locator("option", { hasText: /^V5$/ })).toHaveCount(1);
  await expect(page.getByLabel("Grau").locator("option", { hasText: /^7a$/ })).toHaveCount(0);
  await page.getByLabel("Modalidade").selectOption("tradicional");
  await expect(page.getByLabel("Grau").locator("option", { hasText: /^7a$/ })).toHaveCount(1);
  await expect(page.getByLabel("Grau").locator("option", { hasText: /^V5$/ })).toHaveCount(0);
});

test("comentar em uma via mostra o comentário e o autor pode removê-lo", async ({ page }) => {
  const texto = `Excelente via, proteção boa. ${sufixo()}`;
  await cadastrar(page, "Vera Comenta");
  await abrirVia(page, "serra-do-cipo", "Veredito");
  await page.getByLabel("Seu comentário").fill(texto);
  await page.getByRole("button", { name: "Comentar" }).click();
  const comentario = page.getByRole("region", { name: "Comentários" }).getByRole("listitem").filter({ hasText: texto });
  await expect(comentario).toContainText("Vera Comenta");
  await expect(page.getByLabel("Seu comentário")).toHaveValue("");
  await page.reload();
  await expect(comentario).toBeVisible();
  await comentario.getByRole("button", { name: "Remover" }).click();
  await expect(comentario).toHaveCount(0);
});

test("enviar foto mostra a imagem na galeria; arquivo grande é recusado antes do envio", async ({ page }) => {
  const legenda = `Vista da base ${sufixo()}`;
  await cadastrar(page, "Wal Foto");
  await abrirVia(page, "serra-do-cipo", "Testemunha");
  await page.getByLabel("Arquivo da foto").setInputFiles({ name: "grande.jpg", mimeType: "image/jpeg", buffer: Buffer.alloc(6 * 1024 * 1024) });
  await expect(page.getByText("Arquivo muito grande (máx. 5 MB).")).toBeVisible();

  await page.getByLabel("Arquivo da foto").setInputFiles({ name: "base.png", mimeType: "image/png", buffer: PNG });
  await page.getByLabel("Legenda").fill(legenda);
  await page.getByRole("button", { name: "Enviar foto" }).click();
  const foto = page.getByTestId("galeria").getByRole("img", { name: legenda });
  await expect(foto).toBeVisible();
  await page.reload();
  await expect(foto).toBeVisible();
  expect(await foto.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
});

test("reportar interdição confirma o envio e não vira alerta público antes da análise", async ({ page }) => {
  await cadastrar(page, "Xico Reporta");
  await page.goto("/areas/salinas");
  await page.getByRole("button", { name: "Reportar erro ou restrição" }).click();
  await page.getByLabel("Tipo", { exact: true }).selectOption("interdicao");
  await page.getByLabel("O que aconteceu?").fill("curto");
  await page.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(page.getByText("Descreva com pelo menos 10 caracteres.")).toBeVisible();
  await page.getByLabel("O que aconteceu?").fill("Porteira fechada com cadeado e placa de proibido entrar.");
  await page.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(page.getByText("Reporte enviado para análise.")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("alerta-acesso")).toHaveCount(0);
});
