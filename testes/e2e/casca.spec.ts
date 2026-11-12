import { test, expect } from "@playwright/test";

const LINKS = [
  ["Explorar", "/"],
  ["Mapa", "/mapa"],
  ["Contribuir", "/contribuir"],
  ["Escaladas", "/minhas-escaladas"],
  ["Perfil", "/perfil"],
] as const;

test("a página declara o idioma pt-BR", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});

test("mostra os cinco links na navegação certa para o tamanho de tela", async ({ page }, info) => {
  await page.goto("/");
  const inferior = page.getByRole("navigation", { name: "Navegação inferior" });
  const superior = page.getByRole("navigation", { name: "Navegação principal" });
  const visivel = info.project.name === "celular" ? inferior : superior;
  const oculta = info.project.name === "celular" ? superior : inferior;

  await expect(visivel).toBeVisible();
  await expect(oculta).toBeHidden();
  for (const [rotulo, caminho] of LINKS) {
    await expect(visivel.getByRole("link", { name: rotulo, exact: true })).toHaveAttribute("href", caminho);
  }
});
