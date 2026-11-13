import { z } from "zod";

/** Converte o texto de um campo de formulário em número; vazio vira undefined e aceita vírgula decimal. */
function numeroDe(valor: unknown): unknown {
  if (valor == null) return undefined;
  if (typeof valor === "number") return valor;
  const texto = String(valor).trim().replace(",", ".");
  if (texto === "") return undefined;
  const numero = Number(texto);
  return Number.isNaN(numero) ? texto : numero;
}

const INVALIDO = "Informe um número válido.";

export const numeroObrigatorio = (faltando: string) =>
  z.preprocess(numeroDe, z.number({ error: (problema) => (problema.input === undefined ? faltando : INVALIDO) }));

export const numeroOpcional = (min: number, max: number, mensagem: string) =>
  z.preprocess(numeroDe, z.number(INVALIDO).min(min, mensagem).max(max, mensagem).optional());

export const inteiroOpcional = (min: number, max: number, mensagem: string) =>
  z.preprocess(numeroDe, z.number(INVALIDO).int(mensagem).min(min, mensagem).max(max, mensagem).optional());

export const coordenadaOpcional = z.preprocess(numeroDe, z.number(INVALIDO).optional());

/** Texto opcional: vazio vira undefined. */
export const textoOpcional = (max: number, mensagem: string) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max, mensagem).optional());

const BRASIL = { latMin: -34, latMax: 6, lngMin: -74, lngMax: -34 };

export function estaNoBrasil(lat: number, lng: number): boolean {
  return lat >= BRASIL.latMin && lat <= BRASIL.latMax && lng >= BRASIL.lngMin && lng <= BRASIL.lngMax;
}

export const FORA_DO_BRASIL = "O ponto precisa estar no Brasil.";
