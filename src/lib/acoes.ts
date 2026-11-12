import type { ZodError } from "zod";

export type ResultadoAcao<T = void> =
  | { ok: true; dados: T; mensagem?: string }
  | { ok: false; erro: string; campos?: Record<string, string>; valores?: Record<string, string> };

/** Estado inicial para formulários com useActionState. */
export type EstadoFormulario<T = void> = ResultadoAcao<T> | null;

export const ERRO_GENERICO = "Não foi possível concluir. Tente de novo em instantes.";

export function sucesso(): ResultadoAcao<void>;
export function sucesso<T>(dados: T, mensagem?: string): ResultadoAcao<T>;
export function sucesso<T>(dados?: T, mensagem?: string): ResultadoAcao<T> {
  return { ok: true, dados: dados as T, mensagem };
}

export function falha(erro: string = ERRO_GENERICO, extras: { campos?: Record<string, string>; valores?: Record<string, string> } = {}): {
  ok: false;
  erro: string;
  campos?: Record<string, string>;
  valores?: Record<string, string>;
} {
  return { ok: false, erro, ...extras };
}

/** Primeiro erro de cada campo, para exibir ao lado do input. */
export function errosDeCampo(erro: ZodError): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const problema of erro.issues) {
    const campo = String(problema.path[0] ?? "");
    if (campo && !campos[campo]) campos[campo] = problema.message;
  }
  return campos;
}

/** Valores de texto de um FormData, para devolver ao formulário quando há erro. */
export function valoresDe(form: FormData, ignorar: string[] = ["senha"]): Record<string, string> {
  const valores: Record<string, string> = {};
  for (const [chave, valor] of form.entries()) {
    if (typeof valor === "string" && !ignorar.includes(chave)) valores[chave] = valor;
  }
  return valores;
}

export function falhaDeValidacao(erro: ZodError, form: FormData) {
  return falha("Confira os campos destacados.", { campos: errosDeCampo(erro), valores: valoresDe(form) });
}
