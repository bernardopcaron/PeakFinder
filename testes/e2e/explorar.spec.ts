import { test, expect } from "@playwright/test";

test("a página inicial mostra áreas em destaque e vias populares", async ({ page }) => {
  await page.goto("/");
  const destaques = page.getByRole("region", { name: "Áreas em destaque" });
  await expect(destaques.getByRole("link")).toHaveCount(4);
  await expect(destaques.getByRole("link", { name: /Pedra do Baú/ })).toHaveAttribute("href", "/areas/pedra-do-bau");
  const populares = page.getByRole("region", { name: "Vias populares" });
  expect(await populares.getByRole("link").count()).toBeGreaterThan(0);
  await expect(page.getByRole("link", { name: "Abrir o mapa" })).toHaveAttribute("href", "/mapa");
});

for (const termo of ["sao bento", "ITATIAIA"]) {
  test(`a busca por "${termo}" ignora acentos e maiúsculas`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Buscar áreas, vias ou municípios" }).fill(termo);
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(/\/buscar\?q=/);
    const esperado = termo === "sao bento" ? "/areas/pedra-do-bau" : "/areas/itatiaia";
    await expect(page.locator(`main a[href="${esperado}"]`)).toBeVisible();
  });
}

test("busca sem resultado avisa que nada foi encontrado", async ({ page }) => {
  await page.goto("/buscar?q=zzzzqqqq");
  await expect(page.getByText("Nada encontrado")).toBeVisible();
});

test("a busca encontra vias pelo nome", async ({ page }) => {
  await page.goto("/buscar?q=granito%20quente");
  await page.getByRole("link", { name: /Granito Quente/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Granito Quente" })).toBeVisible();
});

test("a página da área mostra setores, vias, selo e aviso de dados demonstrativos", async ({ page }) => {
  await page.goto("/areas/pedra-do-bau");
  await expect(page.getByRole("heading", { level: 1, name: "Pedra do Baú" })).toBeVisible();
  await expect(page.locator('[data-origem="demonstrativo"]').first()).toHaveText("Dados demonstrativos");
  await expect(page.getByText("Dados demonstrativos — não use para planejar uma escalada real.")).toBeVisible();
  await expect(page.getByText("São Bento do Sapucaí · SP").first()).toBeVisible();
  const setores = page.getByRole("region", { name: "Setores" });
  await expect(setores.getByRole("link", { name: /Face Norte/ })).toHaveAttribute("href", "/areas/pedra-do-bau/face-norte");
  await expect(setores.getByRole("link", { name: /Bauzinho/ })).toBeVisible();
  await expect(page.getByTestId("linha-via")).toHaveCount(6);
});

test("a lista de vias ordena por grau e filtra por modalidade", async ({ page }) => {
  await page.goto("/areas/pedra-do-bau");
  const linhas = page.getByTestId("linha-via");
  await page.getByLabel("Ordenar por").selectOption("grau-asc");
  await expect(linhas.first()).toContainText("Primeiro Passo");
  await page.getByLabel("Ordenar por").selectOption("grau-desc");
  await expect(linhas.first()).toContainText("Granito Quente");
  await page.getByLabel("Modalidade").selectOption("tradicional");
  await expect(linhas).toHaveCount(1);
  await expect(linhas.first()).toContainText("Aresta do Sol");
  await page.getByLabel("Modalidade").selectOption("boulder");
  await expect(page.getByText("Nenhuma via com esse filtro.")).toBeVisible();
});

test("a página do setor lista só as vias do setor", async ({ page }) => {
  await page.goto("/areas/pedra-do-bau/bauzinho");
  await expect(page.getByRole("heading", { level: 1, name: "Bauzinho" })).toBeVisible();
  await expect(page.getByTestId("linha-via")).toHaveCount(3);
  await expect(page.getByText("15 min")).toBeVisible();
});

test("a página da via mostra a ficha técnica completa", async ({ page }) => {
  await page.goto("/areas/pedra-do-bau");
  await page.getByTestId("linha-via").filter({ hasText: "Granito Quente" }).getByRole("link").click();
  await expect(page.getByRole("heading", { level: 1, name: "Granito Quente" })).toBeVisible();
  const ficha = page.getByRole("region", { name: "Ficha técnica" });
  for (const [termo, valor] of [
    ["Grau", "7b"],
    ["Modalidade", "Esportiva"],
    ["Altura", "30 m"],
    ["Extensão", "32 m"],
    ["Costuras", "11"],
    ["Proteção", "Chapeletas e parada dupla com argola (ilustrativo)."],
    ["Crux", "Sequência de regletes na metade da via."],
    ["Conquistadores", "—"],
  ]) {
    await expect(ficha.locator("div").filter({ has: page.getByText(termo, { exact: true }) }).last()).toContainText(valor);
  }
  await expect(page.locator('[data-origem="demonstrativo"]').first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Pedra do Baú" })).toHaveAttribute("href", "/areas/pedra-do-bau");
});

test("endereços inexistentes mostram a página de não encontrado", async ({ page }) => {
  for (const caminho of ["/areas/nao-existe", "/areas/pedra-do-bau/nao-existe", "/vias/00000000-0000-0000-0000-000000000000", "/vias/abc"]) {
    const resposta = await page.goto(caminho);
    expect(resposta!.status(), caminho).toBe(404);
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  }
});
