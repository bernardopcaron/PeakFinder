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
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page.getByRole("link", { name: "Entrar", exact: true })).toBeVisible();
}

const ESTILO_SIMULADO = {
  version: 8,
  sources: {},
  layers: [{ id: "fundo", type: "background", paint: { "background-color": "#e6e8ea" } }],
};

/** Troca o mapa-base externo por um estilo vazio, para os testes não dependerem da rede. */
export async function simularMapaBase(page: Page) {
  await page.route("**/tiles.openfreemap.org/**", (rota) =>
    rota.request().url().includes("/styles/")
      ? rota.fulfill({ contentType: "application/json", body: JSON.stringify(ESTILO_SIMULADO) })
      : rota.abort(),
  );
}

export async function bloquearMapaBase(page: Page) {
  await page.route("**/tiles.openfreemap.org/**", (rota) => rota.abort());
}

export async function esperarMapa(page: Page) {
  await page.waitForFunction(() => (window as unknown as { __mapaPronto?: boolean }).__mapaPronto === true, null, { timeout: 30000 });
}

/** Aproxima o mapa clicando nos agrupamentos até o marcador da área aparecer, e clica nele. */
export async function abrirAreaNoMapa(page: Page, nome: string) {
  const marcador = page.getByRole("button", { name: nome, exact: true });
  for (let tentativa = 0; tentativa < 8 && !(await marcador.isVisible()); tentativa++) {
    const grupos = page.getByRole("button", { name: /áreas — aproximar$/ });
    const total = await grupos.count();
    let clicou = false;
    for (let i = 0; i < total && !clicou; i++) {
      const grupo = grupos.nth(i);
      if ((await grupo.getAttribute("data-areas"))?.split("|").includes(nome)) {
        await grupo.click();
        clicou = true;
      }
    }
    await page.waitForTimeout(900);
  }
  await marcador.click();
}

/** Abre a página de uma via demonstrativa a partir da página da área. */
export async function abrirVia(page: Page, areaSlug: string, nomeVia: string) {
  await page.goto(`/areas/${areaSlug}`);
  await page.getByTestId("linha-via").filter({ hasText: nomeVia }).getByRole("link").click();
  await expect(page.getByRole("heading", { level: 1, name: nomeVia })).toBeVisible();
}

export function hojeSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
