import type { Metadata } from "next";
import { exigirUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Minhas escaladas" };

export default async function Pagina() {
  await exigirUsuario("/minhas-escaladas");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Minhas escaladas</h1>
    </div>
  );
}
