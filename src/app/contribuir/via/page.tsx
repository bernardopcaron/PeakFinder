import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ehUuid } from "@/lib/formato";
import { exigirUsuario } from "@/lib/sessao";
import { FormVia } from "@/modulos/comunidade";
import { listarDestinos, obterContribuicaoParaEdicao } from "@/modulos/comunidade/consultas";
import { MolduraContribuir } from "../MolduraContribuir";

export const metadata: Metadata = { title: "Contribuir: via" };

const texto = (valor: string | string[] | undefined) => (typeof valor === "string" && ehUuid(valor) ? valor : undefined);

export default async function Pagina({ searchParams }: PageProps<"/contribuir/via">) {
  const parametros = await searchParams;
  const editar = texto(parametros.editar);
  await exigirUsuario(editar ? `/contribuir/via?editar=${editar}` : "/contribuir/via");
  const inicial = editar ? await obterContribuicaoParaEdicao("via", editar) : undefined;
  if (editar && !inicial) notFound();
  const destinos = await listarDestinos();
  return (
    <MolduraContribuir titulo={inicial ? "Editar via" : "Nova via"}>
      <FormVia destinos={destinos} setorInicial={texto(parametros.setor)} inicial={inicial ?? undefined} />
    </MolduraContribuir>
  );
}
