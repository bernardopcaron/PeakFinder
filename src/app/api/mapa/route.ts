import { NextResponse } from "next/server";
import { obterColecaoMapa } from "@/modulos/mapa/consultas";

/** Áreas, setores e trilhas aprovados, em GeoJSON. O conteúdo é o mesmo para qualquer visitante. */
export async function GET() {
  const colecao = await obterColecaoMapa();
  return NextResponse.json(colecao, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
