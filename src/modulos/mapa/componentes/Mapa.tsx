"use client";

import dynamic from "next/dynamic";
import type { ColecaoMapa } from "../tipos";

const MapaCliente = dynamic(() => import("./MapaCliente"), {
  ssr: false,
  loading: () => <p className="p-6 text-sm text-grafite-600">Carregando o mapa…</p>,
});

export function Mapa(props: { colecao: ColecaoMapa; areaInicial?: string }) {
  return <MapaCliente {...props} />;
}
