import { test, expect } from "@playwright/test";
import { clienteServico, criarUsuarioTeste } from "../apoio/usuarios";
import { abrirAreaNoMapa, cadastrar, entrar, esperarMapa, hojeSaoPaulo, sair, simularMapaBase } from "./apoio";

// A via criada pelo teste é aprovada numa área do seed; removê-la logo evita que outros testes a enxerguem.
test.afterEach(async () => {
  await clienteServico().from("vias").delete().like("nome", "Via do Fluxo %");
});

// Percorre o critério de conclusão do MVP (spec, seção 1) de ponta a ponta.
test("do cadastro à aprovação: o fluxo completo do MVP", async ({ page }) => {
  test.setTimeout(240000);
  const nomeVia = `Via do Fluxo ${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  // Contra o site publicado, o mapa-base real é usado; localmente ele é simulado.
  if (!process.env.PLAYWRIGHT_BASE_URL) await simularMapaBase(page);

  await test.step("1. criar conta e entrar", async () => {
    await cadastrar(page, "Zeca Fluxo");
  });

  await test.step("2. encontrar uma área no mapa", async () => {
    await page.getByRole("navigation").getByRole("link", { name: "Mapa", exact: true }).click();
    await esperarMapa(page);
    await abrirAreaNoMapa(page, "Pedra do Baú");
    await page.getByTestId("cartao-marcador").getByRole("link", { name: "Ver área" }).click();
    await expect(page).toHaveURL("/areas/pedra-do-bau");
  });

  await test.step("3. consultar as vias da área", async () => {
    await expect(page.getByRole("heading", { level: 1, name: "Pedra do Baú" })).toBeVisible();
    await expect(page.getByTestId("linha-via").filter({ hasText: "Linha do Horizonte" })).toHaveCount(1);
    await expect(page.getByTestId("linha-via").filter({ hasText: "Granito Quente" })).toContainText("7b");
  });

  await test.step("5. abrir e manipular o modelo 3D demonstrativo", async () => {
    const visualizador = page.getByTestId("visualizador-3d");
    await visualizador.scrollIntoViewIfNeeded();
    await expect(visualizador).toHaveAttribute("data-estado", "pronto", { timeout: 45000 });
    await expect(visualizador.getByText("Modelo demonstrativo")).toBeVisible();
    const inicial = await visualizador.getAttribute("data-camera");
    const caixa = (await visualizador.locator("canvas").boundingBox())!;
    await page.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
    await page.mouse.down();
    await page.mouse.move(caixa.x + caixa.width / 2 + 100, caixa.y + caixa.height / 2 + 20, { steps: 6 });
    await page.mouse.up();
    await expect(visualizador).not.toHaveAttribute("data-camera", inicial!);
  });

  await test.step("4. ver as informações técnicas de uma via", async () => {
    await page.getByTestId("linha-via").filter({ hasText: "Linha do Horizonte" }).getByRole("link").click();
    const ficha = page.getByRole("region", { name: "Ficha técnica" });
    await expect(ficha).toContainText("VIsup");
    await expect(ficha).toContainText("Mista");
    await expect(ficha).toContainText("12");
    await expect(ficha).toContainText("Chapeletas espaçadas");
    await expect(ficha).toContainText("Passagem de aderência acima do platô.");
  });

  await test.step("6. favoritar a via", async () => {
    await page.getByRole("button", { name: "Favoritar" }).click();
    await expect(page.getByRole("button", { name: "Favoritada" })).toHaveAttribute("aria-busy", "false");
  });

  await test.step("7. registrar uma ascensão", async () => {
    await page.getByRole("button", { name: "Registrar ascensão" }).click();
    await page.getByLabel("Data").fill(hojeSaoPaulo());
    await page.getByLabel("Estilo").selectOption("flash");
    await page.getByRole("button", { name: "Salvar ascensão" }).click();
    await expect(page.getByText("Ascensão registrada.")).toBeVisible();
  });

  await test.step("8. enviar o cadastro de uma nova via", async () => {
    await page.goto("/contribuir/via");
    await page.getByLabel("Área").selectOption({ label: "Pedra do Baú" });
    await page.getByLabel("Setor").selectOption({ label: "Face Norte" });
    await page.getByLabel("Nome da via").fill(nomeVia);
    await page.getByLabel("Modalidade").selectOption("tradicional");
    await page.getByLabel("Grau").selectOption("V");
    await page.getByLabel("Proteção").fill("Proteção móvel, um jogo de friends.");
    await page.getByRole("button", { name: "Enviar para análise" }).click();
    await expect(page).toHaveURL(/\/minhas-escaladas\?enviado=via/);
  });

  await test.step("os dados persistem em Minhas escaladas", async () => {
    await page.reload();
    await expect(page.getByRole("region", { name: "Ascensões" }).getByRole("link", { name: /Linha do Horizonte/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "Vias favoritas" }).getByRole("link", { name: /Linha do Horizonte/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "Minhas contribuições" }).getByRole("listitem").filter({ hasText: nomeVia })).toContainText("Em análise");
    await sair(page);
  });

  await test.step("antes da aprovação, a nova via não é pública", async () => {
    await page.goto(`/buscar?q=${encodeURIComponent(nomeVia)}`);
    await expect(page.getByText("Nada encontrado")).toBeVisible();
  });

  await test.step("o administrador aprova o cadastro", async () => {
    const admin = await criarUsuarioTeste("admin", "Admin do Fluxo");
    await page.goto("/entrar");
    await entrar(page, admin.email, admin.senha);
    await expect(page.getByTestId("usuario-nome")).toBeVisible();
    await page.goto("/admin/pendentes");
    const item = page.getByRole("listitem").filter({ hasText: nomeVia });
    await expect(item).toContainText("Zeca Fluxo");
    await item.getByRole("button", { name: "Aprovar" }).click();
    await expect(item).toHaveCount(0);
    await sair(page);
  });

  await test.step("depois da aprovação, qualquer visitante encontra a via", async () => {
    await page.goto(`/buscar?q=${encodeURIComponent(nomeVia)}`);
    await page.getByRole("link", { name: new RegExp(nomeVia) }).click();
    await expect(page.getByRole("heading", { level: 1, name: nomeVia })).toBeVisible();
    await expect(page.locator('[data-origem="comunidade"]').first()).toHaveText("Comunidade");
    await page.goto("/areas/pedra-do-bau/face-norte");
    await expect(page.getByTestId("linha-via").filter({ hasText: nomeVia })).toHaveCount(1);
  });
});
