import { test, expect } from "@playwright/test";
import { cadastrar, emailTeste, entrar, sair, SENHA } from "./apoio";

test("cadastra, sai e entra de novo", async ({ page }) => {
  const email = await cadastrar(page, "Ana Escaladora");
  await expect(page).toHaveURL("/");
  await sair(page);

  await page.goto("/entrar");
  await entrar(page, email);
  await expect(page.getByTestId("usuario-nome")).toContainText("Ana");
  await expect(page).toHaveURL("/");
});

test("página protegida leva ao login e volta ao destino", async ({ page }) => {
  const email = await cadastrar(page, "Bia Retorno");
  await sair(page);

  await page.goto("/minhas-escaladas");
  await expect(page).toHaveURL("/entrar?retorno=%2Fminhas-escaladas");
  await entrar(page, email);
  await expect(page).toHaveURL("/minhas-escaladas");
});

test("senha curta mostra erro no campo e preserva o que foi digitado", async ({ page }) => {
  await page.goto("/cadastrar");
  const email = emailTeste();
  await page.getByLabel("Nome").fill("Caio Curto");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("12345");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByText("A senha precisa ter pelo menos 8 caracteres.")).toBeVisible();
  await expect(page.getByLabel("Nome")).toHaveValue("Caio Curto");
  await expect(page.getByLabel("E-mail")).toHaveValue(email);
  await expect(page).toHaveURL(/\/cadastrar/);
});

test("credenciais erradas e e-mail repetido mostram mensagens claras", async ({ page }) => {
  const email = await cadastrar(page, "Davi Duplicado");
  await sair(page);

  await page.goto("/entrar");
  await entrar(page, email, "senha-errada-999");
  await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();

  await page.goto("/cadastrar");
  await page.getByLabel("Nome").fill("Outro Davi");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(SENHA);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByText("Já existe uma conta com este e-mail.")).toBeVisible();
});

test("retorno para site externo é ignorado", async ({ page }) => {
  const email = await cadastrar(page, "Eva Externa");
  await sair(page);

  await page.goto("/entrar?retorno=https://externo.com");
  await entrar(page, email);
  await expect(page.getByTestId("usuario-nome")).toBeVisible();
  await expect(page).toHaveURL("/");
});

test("pedido de recuperação de senha confirma o envio sem revelar se o e-mail existe", async ({ page }) => {
  await page.goto("/recuperar-senha");
  await page.getByLabel("E-mail").fill(emailTeste("naoexiste"));
  await page.getByRole("button", { name: "Enviar link" }).click();
  await expect(page.getByText("Se houver uma conta com este e-mail, enviaremos um link para redefinir a senha.")).toBeVisible();
});

test("link de e-mail inválido ou adulterado leva de volta ao login com aviso", async ({ page }) => {
  for (const caminho of ["/auth/confirm?token_hash=invalido&type=recovery&next=/nova-senha", "/auth/confirm?type=recovery", "/auth/confirm?token_hash=x&type=outro", "/auth/callback?code=invalido"]) {
    await page.goto(caminho);
    await expect(page, caminho).toHaveURL("/entrar?erro=link");
    await expect(page.getByText("O link é inválido ou expirou. Peça um novo.")).toBeVisible();
  }
});
