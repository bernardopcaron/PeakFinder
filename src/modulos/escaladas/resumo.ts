import type { Modalidade } from "@/lib/graus";

export type ViaDaAscensao = { modalidade: Modalidade; grau: string; grau_ordem: number };

export type ResumoEscaladas = { total: number; maximoPorModalidade: Partial<Record<Modalidade, string>> };

export function calcularResumo(ascensoes: { via: ViaDaAscensao }[]): ResumoEscaladas {
  const maximos: Partial<Record<Modalidade, ViaDaAscensao>> = {};
  for (const { via } of ascensoes) {
    const atual = maximos[via.modalidade];
    if (!atual || via.grau_ordem > atual.grau_ordem) maximos[via.modalidade] = via;
  }
  const maximoPorModalidade: ResumoEscaladas["maximoPorModalidade"] = {};
  for (const [modalidade, via] of Object.entries(maximos)) {
    maximoPorModalidade[modalidade as Modalidade] = via.grau;
  }
  return { total: ascensoes.length, maximoPorModalidade };
}
