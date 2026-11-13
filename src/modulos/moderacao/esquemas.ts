import { z } from "zod";

const alvoOpcional = z.preprocess((v) => (v === "" ? undefined : v), z.uuid().optional());

export const TIPOS_REPORTE = ["erro", "restricao", "interdicao"] as const;

export const ROTULOS_REPORTE: Record<(typeof TIPOS_REPORTE)[number], string> = {
  erro: "Erro nas informações",
  restricao: "Restrição de acesso",
  interdicao: "Interdição de acesso",
};

export const esquemaReporte = z
  .object({
    area_id: alvoOpcional,
    setor_id: alvoOpcional,
    via_id: alvoOpcional,
    tipo: z.enum(TIPOS_REPORTE, "Escolha o tipo de reporte."),
    descricao: z.string().trim().min(10, "Descreva com pelo menos 10 caracteres.").max(2000, "A descrição pode ter no máximo 2000 caracteres."),
  })
  .refine((r) => [r.area_id, r.setor_id, r.via_id].filter(Boolean).length === 1, { path: ["descricao"], message: "Reporte sem destino." });
