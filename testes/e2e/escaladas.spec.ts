import { test, expect } from "@playwright/test";
import { abrirVia, cadastrar, entrar, hojeSaoPaulo, sair, simularMapaBase } from "./apoio";

test.beforeEach(async ({ page }) => simularMapaBase(page));

test("visitante é levado ao login ao favoritar e volta para a via", async ({ page }) => {
  const email = await cadastrar(page, "Fabi Favorita");
  await sair(page);
  await abrirVia(page, "pedra-do-bau", "Vento Sul");
  const urlVia = page.url();
  await page.getByRole("link", { name: "Favoritar" }).click();
  await expect(page).toHaveURL(/\/entrar\?retorno=%2Fvias%2F/);
  await entrar(page, email);
  await expect(page).toHaveURL(urlVia);
  await expect(page.getByRole("button", { name: "Favoritar" })).toBeVisible();
});

test("favoritar persiste, aparece em Minhas escaladas e pode ser desfeito", async ({ page }) => {
  await cadastrar(page, "Gabi Favorita");
  await abrirVia(page, "pedra-do-bau", "Mantiqueira");
  await page.getByRole("button", { name: "Favoritar" }).click();
  await expect(page.getByRole("button", { name: "Favoritada" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Favoritada" })).toBeVisible();

  await page.goto("/minhas-escaladas");
  const favoritas = page.getByRole("region", { name: "Vias favoritas" });
  await expect(favoritas.getByRole("link", { name: /Mantiqueira/ })).toBeVisible();

  await favoritas.getByRole("link", { name: /Mantiqueira/ }).click();
  await page.getByRole("button", { name: "Favoritada" }).click();
  await expect(page.getByRole("button", { name: "Favoritar" })).toBeVisible();
  await page.goto("/minhas-escaladas");
  await expect(page.getByText("Você ainda não favoritou nenhuma via.")).toBeVisible();
});

test("dois cliques rápidos em favoritar deixam um estado consistente", async ({ page }) => {
  await cadastrar(page, "Hugo Rápido");
  await abrirVia(page, "pedra-do-bau", "Primeiro Passo");
  await page.getByRole("button", { name: "Favoritar" }).dblclick();
  await expect(page.getByRole("button", { name: /^Favorita(r|da)$/ })).toHaveAttribute("aria-busy", "false");
  const rotulo = await page.getByRole("button", { name: /^Favorita(r|da)$/ }).innerText();
  await page.reload();
  await expect(page.getByRole("button", { name: rotulo, exact: true })).toBeVisible();
});

test("registra ascensão, mostra no histórico e no resumo, e permite remover", async ({ page }) => {
  await cadastrar(page, "Iara Ascensão");
  await abrirVia(page, "pedra-do-bau", "Granito Quente");
  await page.getByRole("button", { name: "Registrar ascensão" }).click();
  await page.getByLabel("Data").fill(hojeSaoPaulo());
  await page.getByLabel("Estilo").selectOption("a_vista");
  await page.getByLabel("Notas").fill("Crux mais duro do que parece.");
  await page.getByRole("button", { name: "Salvar ascensão" }).click();
  await expect(page.getByText("Ascensão registrada.")).toBeVisible();
  await expect(page.getByText("Você registrou 1 ascensão nesta via.")).toBeVisible();

  await page.goto("/minhas-escaladas");
  const historico = page.getByRole("region", { name: "Ascensões" });
  await expect(historico.getByRole("link", { name: /Granito Quente/ })).toBeVisible();
  await expect(historico.getByText("À vista")).toBeVisible();
  await expect(historico.getByText("Crux mais duro do que parece.")).toBeVisible();
  const resumo = page.getByRole("region", { name: "Resumo" });
  await expect(resumo.getByText("1 ascensão")).toBeVisible();
  await expect(resumo.getByText("7b")).toBeVisible();

  await page.reload();
  await expect(historico.getByRole("link", { name: /Granito Quente/ })).toBeVisible();
  await historico.getByRole("button", { name: "Remover ascensão de Granito Quente" }).click();
  await expect(page.getByText("Você ainda não registrou nenhuma ascensão.")).toBeVisible();
});

test("ascensão com data futura ou sem data mostra erro no campo", async ({ page }) => {
  await cadastrar(page, "João Futuro");
  await abrirVia(page, "pedra-do-bau", "Granito Quente");
  await page.getByRole("button", { name: "Registrar ascensão" }).click();
  await page.getByLabel("Data").fill("2099-01-01");
  await page.getByLabel("Notas").fill("Do futuro");
  await page.getByRole("button", { name: "Salvar ascensão" }).click();
  await expect(page.getByText("A data não pode ser no futuro.")).toBeVisible();
  await expect(page.getByLabel("Notas")).toHaveValue("Do futuro");

  await page.getByLabel("Data").fill("");
  await page.getByRole("button", { name: "Salvar ascensão" }).click();
  await expect(page.getByText("Informe a data da ascensão.")).toBeVisible();
});

test("avaliar a via atualiza a média e a nota do usuário persiste", async ({ page }) => {
  await cadastrar(page, "Kiko Nota");
  await abrirVia(page, "morro-do-anhangava", "Cristal");
  await page.getByRole("radio", { name: "4 estrelas" }).click();
  // O grupo fica desabilitado enquanto a nota é gravada; só então a página é recarregada.
  await expect(page.getByRole("radio", { name: "4 estrelas" })).toBeEnabled();
  await expect(page.getByTestId("nota-media")).toContainText("4,0");
  await page.reload();
  await expect(page.getByRole("radio", { name: "4 estrelas" })).toBeChecked();
  await expect(page.getByTestId("nota-media")).toContainText("4,0");
});
