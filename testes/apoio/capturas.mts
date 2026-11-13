// Gera capturas de tela das principais telas para revisão visual: npx tsx testes/apoio/capturas.mts
import { chromium, devices } from "@playwright/test";
import { criarUsuarioTeste, limparDadosTeste } from "./usuarios.ts";

const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const pasta = process.argv[2] ?? "capturas";
const admin = await criarUsuarioTeste("admin", "Revisão Visual");
const navegador = await chromium.launch();
const telas: [string, string][] = [
  ["explorar", "/"],
  ["mapa", "/mapa?area=serra-do-cipo"],
  ["area", "/areas/serra-do-cipo"],
  ["setor", "/areas/serra-do-cipo/grupo-3"],
  ["minhas-escaladas", "/minhas-escaladas"],
  ["contribuir-area", "/contribuir/area"],
  ["contribuir-via", "/contribuir/via"],
  ["perfil", "/perfil"],
  ["admin-pendentes", "/admin/pendentes"],
  ["admin-conteudo", "/admin/conteudo"],
];
for (const [nome, opcoes] of [["celular", { ...devices["Pixel 7"], deviceScaleFactor: 1 }], ["desktop", { viewport: { width: 1280, height: 800 } }]] as const) {
  const contexto = await navegador.newContext(opcoes);
  const pagina = await contexto.newPage();
  await pagina.goto(`${base}/entrar`);
  await pagina.getByLabel("E-mail").fill(admin.email);
  await pagina.getByLabel("Senha").fill(admin.senha);
  await pagina.getByRole("button", { name: "Entrar", exact: true }).click();
  await pagina.getByTestId("usuario-nome").waitFor();
  for (const [tela, caminho] of telas) {
    await pagina.goto(base + caminho, { waitUntil: "networkidle" }).catch(() => {});
    await pagina.waitForTimeout(1500);
    await pagina.screenshot({ path: `${pasta}/${nome}-${tela}.png`, fullPage: nome === "celular" });
  }
  await pagina.goto(`${base}/areas/serra-do-cipo`);
  await pagina.getByTestId("linha-via").first().getByRole("link").click();
  await pagina.waitForTimeout(1500);
  await pagina.screenshot({ path: `${pasta}/${nome}-via.png`, fullPage: true });
  await contexto.close();
}
await navegador.close();
await limparDadosTeste();
