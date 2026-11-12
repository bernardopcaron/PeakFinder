import { test, expect } from "@playwright/test";
import { simularMapaBase } from "./apoio";

test.beforeEach(async ({ page }) => simularMapaBase(page));

test("carrega o modelo demonstrativo, gira com o arrasto e reenquadra", async ({ page }) => {
  await page.goto("/areas/pedra-do-bau");
  const visualizador = page.getByTestId("visualizador-3d");
  await visualizador.scrollIntoViewIfNeeded();
  await expect(visualizador).toHaveAttribute("data-estado", "pronto", { timeout: 30000 });
  await expect(visualizador.getByText("Modelo demonstrativo")).toBeVisible();

  const inicial = await visualizador.getAttribute("data-camera");
  expect(inicial).toMatch(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/);

  const caixa = (await visualizador.locator("canvas").boundingBox())!;
  const [cx, cy] = [caixa.x + caixa.width / 2, caixa.y + caixa.height / 2];
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 120, cy + 30, { steps: 8 });
  await page.mouse.up();
  await expect(visualizador).not.toHaveAttribute("data-camera", inicial!);

  await visualizador.getByRole("button", { name: "Reenquadrar" }).click();
  await expect(visualizador).toHaveAttribute("data-camera", inicial!);
});

test("o setor sem modelo não mostra o visualizador", async ({ page }) => {
  await page.goto("/areas/itatiaia");
  await expect(page.getByRole("heading", { level: 1, name: "Itatiaia" })).toBeVisible();
  await expect(page.getByTestId("visualizador-3d")).toHaveCount(0);
});

test("se o modelo não carrega, a página avisa e continua utilizável", async ({ page }) => {
  let bloquear = true;
  await page.route("**/storage/v1/object/public/modelos/**", (rota) => (bloquear ? rota.fulfill({ status: 404, body: "não encontrado" }) : rota.continue()));
  await page.goto("/areas/pedra-do-bau");
  const visualizador = page.getByTestId("visualizador-3d");
  await expect(visualizador).toHaveAttribute("data-estado", "erro", { timeout: 30000 });
  await expect(visualizador.getByText("Não foi possível carregar o modelo 3D")).toBeVisible();
  await expect(page.getByTestId("linha-via")).toHaveCount(6);
  await page.getByLabel("Ordenar por").selectOption("grau-desc");
  await expect(page.getByTestId("linha-via").first()).toContainText("Granito Quente");

  bloquear = false;
  await visualizador.getByRole("button", { name: "Tentar de novo" }).click();
  await expect(visualizador).toHaveAttribute("data-estado", "pronto", { timeout: 30000 });
});

test("arquivo corrompido também cai no aviso de erro", async ({ page }) => {
  await page.route("**/storage/v1/object/public/modelos/**", (rota) => rota.fulfill({ status: 200, contentType: "model/gltf-binary", body: "isto não é um glb" }));
  await page.goto("/areas/pedra-do-bau");
  await expect(page.getByTestId("visualizador-3d")).toHaveAttribute("data-estado", "erro", { timeout: 30000 });
});
