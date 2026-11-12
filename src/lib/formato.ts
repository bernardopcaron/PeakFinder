export const VAZIO = "—";

export function metros(valor: number | null | undefined): string {
  return valor == null ? VAZIO : `${Number(valor).toLocaleString("pt-BR")} m`;
}

export function texto(valor: string | number | null | undefined): string {
  return valor == null || valor === "" ? VAZIO : String(valor);
}

export function dataCurta(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

export function plural(n: number, singular: string, pluralizado: string): string {
  return `${n} ${n === 1 ? singular : pluralizado}`;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const ehUuid = (valor: string) => UUID.test(valor);
