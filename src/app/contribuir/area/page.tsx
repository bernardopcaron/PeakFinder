import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ehUuid } from "@/lib/formato";
import { exigirUsuario } from "@/lib/sessao";
import { FormArea } from "@/modulos/comunidade";
import { obterContribuicaoParaEdicao } from "@/modulos/comunidade/consultas";
import { MolduraContribuir } from "../MolduraContribuir";

export const metadata: Metadata = { title: "Contribuir: área" };

const texto = (valor: string | string[] | undefined) => (typeof valor === "string" && ehUuid(valor) ? valor : undefined);

export default async function Pagina({ searchParams }: PageProps<"/contribuir/area">) {
  const parametros = await searchParams;
  const editar = texto(parametros.editar);
  await exigirUsuario(editar ? `/contribuir/area?editar=${editar}` : "/contribuir/area");
  const inicial = editar ? await obterContribuicaoParaEdicao("area", editar) : undefined;
  if (editar && !inicial) notFound();
  return (
    <MolduraContribuir titulo={inicial ? "Editar área" : "Nova área"}>
      <FormArea  inicial={inicial ?? undefined} />
    </MolduraContribuir>
  );
}
