import { test, expect } from "@playwright/test";
import { abrirVia, cadastrar, hojeSaoPaulo, sair, simularMapaBase } from "./apoio";

// PNG de 1x1 pixel
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

test.beforeEach(async ({ page }) => simularMapaBase(page));

test("editar nome e biografia persiste", async ({ page }) => {
  await cadastrar(page, "Lia Perfil");
  await page.goto("/perfil");
  await page.getByLabel("Nome", { exact: true }).fill("Lia Montanha");
  await page.getByLabel("Biografia").fill("Escalo desde 2015, principalmente esportiva.");
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(page.getByText("Perfil atualizado.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue("Lia Montanha");
  await expect(page.getByLabel("Biografia")).toHaveValue("Escalo desde 2015, principalmente esportiva.");
  await expect(page.getByTestId("usuario-nome")).toHaveText("Lia");
});

test("enviar foto de perfil mostra a imagem e arquivo grande é recusado antes do envio", async ({ page }) => {
  await cadastrar(page, "Mara Foto");
  await page.goto("/perfil");
  await page.getByLabel("Foto de perfil").setInputFiles({ name: "grande.png", mimeType: "image/png", buffer: Buffer.alloc(3 * 1024 * 1024) });
  await expect(page.getByText("Arquivo muito grande (máx. 2 MB).")).toBeVisible();
  await page.getByLabel("Foto de perfil").setInputFiles({ name: "doc.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF") });
  await expect(page.getByText("Formato não aceito.")).toBeVisible();

  await page.getByLabel("Foto de perfil").setInputFiles({ name: "eu.png", mimeType: "image/png", buffer: PNG });
  const foto = page.getByRole("img", { name: "Foto de Mara Foto" });
  await expect(foto).toHaveAttribute("src", /\/avatares\//);
  await page.reload();
  await expect(foto).toHaveAttribute("src", /\/avatares\//);
  expect(await foto.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
});

test("nome de usuário repetido ou inválido mostra erro no campo", async ({ page }) => {
  await cadastrar(page, "Nina Primeira");
  await page.goto("/perfil");
  const ocupado = await page.getByLabel("Nome de usuário").inputValue();
  await sair(page);

  await cadastrar(page, "Olga Segunda");
  await page.goto("/perfil");
  await page.getByLabel("Nome de usuário").fill(ocupado);
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(page.getByText("Este nome de usuário já está em uso.")).toBeVisible();

  await page.getByLabel("Nome de usuário").fill("Com Espaço!");
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(page.getByText("Use de 3 a 30 letras minúsculas, números ou _.")).toBeVisible();
});

test("o perfil público mostra biografia e ascensões, sem favoritos", async ({ page }) => {
  await cadastrar(page, "Paula Pública");
  await abrirVia(page, "pedra-do-bau", "Vento Sul");
  await page.getByRole("button", { name: "Favoritar" }).click();
  await expect(page.getByRole("button", { name: "Favoritada" })).toHaveAttribute("aria-busy", "false");
  await page.getByRole("button", { name: "Registrar ascensão" }).click();
  await page.getByLabel("Data").fill(hojeSaoPaulo());
  await page.getByRole("button", { name: "Salvar ascensão" }).click();
  await expect(page.getByText("Ascensão registrada.")).toBeVisible();

  await page.goto("/perfil");
  await page.getByLabel("Biografia").fill("Gosto de vias longas.");
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(page.getByText("Perfil atualizado.")).toBeVisible();
  const usuario = await page.getByLabel("Nome de usuário").inputValue();
  await sair(page);

  await page.goto(`/u/${usuario}`);
  await expect(page.getByRole("heading", { level: 1, name: "Paula Pública" })).toBeVisible();
  await expect(page.getByText("Gosto de vias longas.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Ascensões recentes" }).getByRole("link", { name: /Vento Sul/ })).toBeVisible();
  await expect(page.getByText(/favorit/i)).toHaveCount(0);
});

test("perfil público inexistente responde não encontrado", async ({ page }) => {
  const resposta = await page.goto("/u/usuario_que_nao_existe_123");
  expect(resposta!.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
});
