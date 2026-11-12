import type { Metadata } from "next";
import { Mapa } from "@/modulos/mapa";
import { obterColecaoMapa } from "@/modulos/mapa/consultas";

export const metadata: Metadata = { title: "Mapa" };

export default async function PaginaMapa({ searchParams }: PageProps<"/mapa">) {
  const { area } = await searchParams;
  const colecao = await obterColecaoMapa();
  return (
    <>
      <h1 className="sr-only">Mapa de áreas de escalada</h1>
      <Mapa colecao={colecao} areaInicial={typeof area === "string" ? area : undefined} />
    </>
  );
}
