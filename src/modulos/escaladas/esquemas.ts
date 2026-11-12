import { z } from "zod";
import { hojeNoBrasil } from "@/lib/datas";
import { ESTILOS } from "./tipos";

export const esquemaAscensao = z.object({
  via_id: z.uuid("Via inválida."),
  data: z
    .string()
    .min(1, "Informe a data da ascensão.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.")
    .refine((d) => !Number.isNaN(Date.parse(d)), "Informe uma data válida.")
    .refine((d) => d <= hojeNoBrasil(), "A data não pode ser no futuro.")
    .refine((d) => d >= "1900-01-01", "Informe uma data válida."),
  estilo: z.enum(ESTILOS, "Escolha o estilo da ascensão."),
  notas: z.string().trim().max(1000, "As notas podem ter no máximo 1000 caracteres.").optional(),
  grau_sugerido: z.string().trim().optional(),
});

export const esquemaAvaliacao = z.object({
  via_id: z.uuid(),
  nota: z.number().int().min(1).max(5),
});
