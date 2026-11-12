import Link from "next/link";
import { Selo } from "@/componentes/Selo";
import type { AreaResumo } from "../tipos";
import { CapaArea } from "./CapaArea";

export function CartaoArea({ area }: { area: AreaResumo }) {
  return (
    <Link
      href={`/areas/${area.slug}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-pedra-200 transition hover:shadow-md hover:ring-pedra-300"
    >
      <CapaArea slug={area.slug} capaCaminho={area.capa_caminho} nome={area.nome} className="aspect-[16/9]" />
      <div className="space-y-1.5 p-4">
        <h3 className="text-lg font-semibold tracking-tight group-hover:text-terracota-700">{area.nome}</h3>
        <p className="text-sm text-grafite-600">
          {area.municipio} · {area.estado}
          {area.tipo_rocha ? ` · ${area.tipo_rocha}` : ""}
        </p>
        <Selo origem={area.origem} />
      </div>
    </Link>
  );
}
