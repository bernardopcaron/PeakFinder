import type { Metadata } from "next";
import { exigirUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Perfil" };

export default async function Pagina() {
  await exigirUsuario("/perfil");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
    </div>
  );
}
