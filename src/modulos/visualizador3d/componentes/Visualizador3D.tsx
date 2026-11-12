"use client";

import dynamic from "next/dynamic";

const Cena = dynamic(() => import("./Cena"), {
  ssr: false,
  loading: () => <p className="grid h-80 place-items-center rounded-xl bg-grafite-800 text-sm text-areia-50">Carregando o visualizador…</p>,
});

/** Visualizador de modelos GLB/GLTF com rotação, zoom e deslocamento por mouse e toque. */
export function Visualizador3D(props: { url: string; nome: string; demonstrativo: boolean; fotosReserva?: string[] }) {
  return <Cena {...props} />;
}
