import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ehUuid } from "@/lib/formato";
import { exigirUsuario } from "@/lib/sessao";
import { FormSetor } from "@/modulos/comunidade";
import { listarDestinos, obterContribuicaoParaEdicao } from "@/modulos/comunidade/consultas";
import { MolduraContribuir } from "../MolduraContribuir";

export const metadata: Metadata = { title: "Contribuir: setor" };

const texto = (valor: string | string[] | undefined) => (typeof valor === "string" && ehUuid(valor) ? valor : undefined);

export default async function Pagina({ searchParams }: PageProps<"/contribuir/setor">) {
  const parametros = await searchParams;
  const editar = texto(parametros.editar);
  await exigirUsuario(editar ? `/contribuir/setor?editar=${editar}` : "/contribuir/setor");
  const inicial = editar ? await obterContribuicaoParaEdicao("setor", editar) : undefined;
  if (editar && !inicial) notFound();
  const destinos = await listarDestinos();
  return (
    <MolduraContribuir titulo={inicial ? "Editar setor" : "Novo setor"}>
      <FormSetor destinos={destinos} areaInicial={texto(parametros.area)} inicial={inicial ?? undefined} />
    </MolduraContribuir>
  );
}
