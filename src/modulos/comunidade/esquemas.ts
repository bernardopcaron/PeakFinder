import { z } from "zod";
import { FORA_DO_BRASIL, coordenadaOpcional, estaNoBrasil, inteiroOpcional, numeroObrigatorio, numeroOpcional, textoOpcional } from "@/lib/campos";
import { MODALIDADES, grauParaOrdem } from "@/lib/graus";
import { UFS } from "@/lib/ufs";

const nome = (min: number) => z.string().trim().min(min, `Informe um nome com pelo menos ${min} letras.`).max(120, "O nome pode ter no máximo 120 caracteres.");

export const esquemaArea = z
  .object({
    nome: nome(3),
    estado: z.enum(UFS, "Escolha o estado."),
    municipio: z.string().trim().min(2, "Informe o município.").max(120, "O município pode ter no máximo 120 caracteres."),
    lat: numeroObrigatorio("Marque o ponto no mapa ou informe a latitude."),
    lng: numeroObrigatorio("Marque o ponto no mapa ou informe a longitude."),
    descricao: textoOpcional(5000, "A descrição pode ter no máximo 5000 caracteres."),
    tipo_rocha: textoOpcional(80, "Use no máximo 80 caracteres."),
    melhor_epoca: textoOpcional(120, "Use no máximo 120 caracteres."),
    condicoes_acesso: textoOpcional(2000, "As condições de acesso podem ter no máximo 2000 caracteres."),
  })
  .superRefine((area, contexto) => {
    if (!estaNoBrasil(area.lat, area.lng)) contexto.addIssue({ code: "custom", path: ["lat"], message: FORA_DO_BRASIL });
  });

export const esquemaSetor = z
  .object({
    area_id: z.uuid("Escolha a área."),
    nome: nome(2),
    descricao: textoOpcional(5000, "A descrição pode ter no máximo 5000 caracteres."),
    orientacao: textoOpcional(40, "Use no máximo 40 caracteres."),
    tempo_aproximacao_min: inteiroOpcional(0, 600, "Informe um tempo entre 0 e 600 minutos."),
    lat: coordenadaOpcional,
    lng: coordenadaOpcional,
  })
  .superRefine((setor, contexto) => {
    if (setor.lat === undefined && setor.lng === undefined) return;
    if (setor.lat === undefined) contexto.addIssue({ code: "custom", path: ["lat"], message: "Informe também a latitude." });
    else if (setor.lng === undefined) contexto.addIssue({ code: "custom", path: ["lng"], message: "Informe também a longitude." });
    else if (!estaNoBrasil(setor.lat, setor.lng)) contexto.addIssue({ code: "custom", path: ["lat"], message: FORA_DO_BRASIL });
  });

export const esquemaVia = z
  .object({
    setor_id: z.uuid("Escolha o setor."),
    nome: nome(2),
    modalidade: z.enum(MODALIDADES as [string, ...string[]], "Escolha a modalidade.").transform((m) => m as (typeof MODALIDADES)[number]),
    grau: z.string().default(""),
    altura_m: numeroOpcional(1, 2000, "Informe um valor entre 1 e 2000 metros."),
    extensao_m: numeroOpcional(1, 2000, "Informe um valor entre 1 e 2000 metros."),
    costuras: inteiroOpcional(0, 100, "Informe um número inteiro entre 0 e 100."),
    protecao: textoOpcional(500, "Use no máximo 500 caracteres."),
    crux: textoOpcional(500, "Use no máximo 500 caracteres."),
    descricao: textoOpcional(5000, "A descrição pode ter no máximo 5000 caracteres."),
    conquistadores: textoOpcional(200, "Use no máximo 200 caracteres."),
    ano_conquista: inteiroOpcional(1800, 2100, "Informe um ano válido."),
  })
  .superRefine((via, contexto) => {
    if (grauParaOrdem(via.grau, via.modalidade) === null) contexto.addIssue({ code: "custom", path: ["grau"], message: "Grau inválido para esta modalidade." });
  })
  .transform((via) => ({ ...via, grau_ordem: grauParaOrdem(via.grau, via.modalidade)! }));

const alvoOpcional = z.preprocess((v) => (v === "" ? undefined : v), z.uuid().optional());

export const esquemaComentario = z
  .object({
    via_id: alvoOpcional,
    area_id: alvoOpcional,
    texto: z.string().trim().min(1, "Escreva o comentário.").max(2000, "O comentário pode ter no máximo 2000 caracteres."),
  })
  .refine((c) => Number(Boolean(c.via_id)) + Number(Boolean(c.area_id)) === 1, { path: ["texto"], message: "Comentário sem destino." });

export const esquemaFoto = z
  .object({
    area_id: alvoOpcional,
    setor_id: alvoOpcional,
    via_id: alvoOpcional,
    caminho: z.string().min(1),
    legenda: textoOpcional(300, "A legenda pode ter no máximo 300 caracteres."),
    tipo: z.enum(["foto", "croqui"]),
  })
  .refine((f) => [f.area_id, f.setor_id, f.via_id].filter(Boolean).length === 1, { path: ["caminho"], message: "Foto sem destino." });
