import { expect, type Page } from "@playwright/test";

export const SENHA = "senha-forte-123";

export function emailTeste(prefixo = "ui"): string {
  return `e2e+${prefixo}${Date.now()}${Math.random().toString(36).slice(2, 7)}@peakfinder.test`;
}

export async function cadastrar(page: Page, nome = "Ana Escaladora", email = emailTeste()): Promise<string> {
  await page.goto("/cadastrar");
  await page.getByLabel("Nome").fill(nome);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(SENHA);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByTestId("usuario-nome")).toContainText(nome.split(" ")[0]);
  return email;
}

export async function entrar(page: Page, email: string, senha = SENHA) {
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

export async function sair(page: Page) {
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page.getByRole("link", { name: "Entrar", exact: true })).toBeVisible();
}
