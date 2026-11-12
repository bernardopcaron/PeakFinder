import type { ReactNode } from "react";
import { Cartao } from "@/componentes/Cartao";

export function MolduraConta({ titulo, subtitulo, children, rodape }: { titulo: string; subtitulo?: string; children: ReactNode; rodape?: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <Cartao className="p-6">
        <h1 className="text-xl font-bold tracking-tight">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-grafite-600">{subtitulo}</p>}
        <div className="mt-6">{children}</div>
      </Cartao>
      {rodape && <p className="mt-4 text-center text-sm text-grafite-700">{rodape}</p>}
    </div>
  );
}
