"use client";

import dynamic from "next/dynamic";
import type { Ponto } from "./SeletorPontoCliente";

const SeletorPontoCliente = dynamic(() => import("./SeletorPontoCliente"), { ssr: false });

/** Mapa em que um toque marca o ponto. Os campos de latitude e longitude ficam por conta do formulário. */
export function SeletorPonto(props: { valor: Ponto | null; onChange: (p: Ponto) => void }) {
  return <SeletorPontoCliente {...props} />;
}

export type { Ponto };
