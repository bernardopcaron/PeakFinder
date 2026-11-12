import { test, expect } from "@playwright/test";
import { abrirAreaNoMapa, bloquearMapaBase, esperarMapa, simularMapaBase } from "./apoio";

test("o mapa mostra as áreas e leva à página da área pelo marcador", async ({ page }) => {
  await simularMapaBase(page);
  await page.goto("/mapa");
  await esperarMapa(page);
  await expect(page.getByTestId("contador-areas")).toHaveText("7 áreas");

  await abrirAreaNoMapa(page, "Pedra do Baú");
  const cartao = page.getByTestId("cartao-marcador");
  await expect(cartao).toContainText("Pedra do Baú");
  await expect(cartao).toContainText("São Bento do Sapucaí · SP");
  await expect(cartao).toContainText("6 vias");
  await cartao.getByRole("link", { name: "Ver área" }).click();
  await expect(page).toHaveURL("/areas/pedra-do-bau");
});

test("os filtros de modalidade e de grau reduzem as áreas", async ({ page }) => {
  await simularMapaBase(page);
  await page.goto("/mapa");
  await esperarMapa(page);
  const abrir = page.getByRole("button", { name: "Filtros" });
  if (await abrir.isVisible()) await abrir.click();

  await page.getByRole("button", { name: "Boulder", exact: true }).click();
  await expect(page.getByTestId("contador-areas")).toHaveText("1 área");
  await page.getByRole("button", { name: "Boulder", exact: true }).click();
  await expect(page.getByTestId("contador-areas")).toHaveText("7 áreas");

  await page.getByRole("button", { name: "9º grau ou mais" }).click();
  await expect(page.getByTestId("contador-areas")).toHaveText("1 área");
  await page.getByRole("button", { name: "Tradicional", exact: true }).click();
  await expect(page.getByTestId("contador-areas")).toHaveText("0 áreas");
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page.getByTestId("contador-areas")).toHaveText("7 áreas");
});

test("sem o mapa-base, a lista de áreas continua acessível", async ({ page }) => {
  await bloquearMapaBase(page);
  await page.goto("/mapa");
  await expect(page.getByText("Não foi possível carregar o mapa")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("lista-areas").getByRole("link", { name: /Serra do Cipó/ })).toHaveAttribute("href", "/areas/serra-do-cipo");
});

test("a API do mapa devolve GeoJSON com áreas, setores e trilhas", async ({ request }) => {
  const resposta = await request.get("/api/mapa");
  expect(resposta.status()).toBe(200);
  const corpo = await resposta.json();
  expect(corpo.type).toBe("FeatureCollection");
  const tipos = new Set(corpo.features.map((f: { properties: { tipo: string } }) => f.properties.tipo));
  expect([...tipos].sort()).toEqual(["area", "setor", "trilha"]);
});

test("a página da área mostra o minimapa", async ({ page }) => {
  await simularMapaBase(page);
  await page.goto("/areas/pedra-do-bau");
  await expect(page.getByTestId("minimapa")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver no mapa" })).toHaveAttribute("href", "/mapa?area=pedra-do-bau");
});
