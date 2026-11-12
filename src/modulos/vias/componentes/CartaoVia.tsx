import Link from "next/link";
import { ROTULOS_MODALIDADE } from "@/lib/graus";
import type { ViaResumo } from "../tipos";

export function CartaoVia({ via }: { via: ViaResumo }) {
  return (
    <Link href={`/vias/${via.id}`} className="flex min-h-16 items-center gap-3 rounded-lg bg-white px-4 py-3 ring-1 ring-pedra-200 hover:ring-terracota-400">
      <span className="w-14 shrink-0 text-center text-lg font-bold text-terracota-700">{via.grau}</span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{via.nome}</span>
        <span className="block truncate text-sm text-grafite-600">
          {ROTULOS_MODALIDADE[via.modalidade]} · {via.area_nome}
        </span>
      </span>
    </Link>
  );
}
