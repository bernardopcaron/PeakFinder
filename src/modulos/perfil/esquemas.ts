import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido."));
const senha = z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(72, "A senha pode ter no máximo 72 caracteres.");

export const esquemaCadastro = z.object({
  nome: z.string().trim().min(2, "Informe seu nome (mínimo de 2 letras).").max(80, "O nome pode ter no máximo 80 caracteres."),
  email,
  senha,
});

export const esquemaEntrada = z.object({
  email,
  senha: z.string().min(1, "Informe a senha."),
});

export const esquemaRecuperacao = z.object({ email });

export const esquemaNovaSenha = z.object({ senha });
