import { Cartao } from "@/componentes/Cartao";
import { exigirAdmin } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormModelo, RemoverModelo } from "@/modulos/admin";
import { listarAreas } from "@/modulos/areas/consultas";

export default async function PaginaModelos() {
  const admin = await exigirAdmin();
  const supabase = await criarClienteServidor();
  const [areas, modelos] = await Promise.all([
    listarAreas(),
    supabase.from("modelos_3d").select("id, nome, demonstrativo, area:areas(nome), setor:setores(nome)").order("criado_em", { ascending: false }).limit(200),
  ]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">Modelos 3D</h1>
        <Cartao className="p-5">
          <FormModelo areas={areas} usuarioId={admin.id} />
        </Cartao>
      </div>
      <ul className="space-y-2">
        {(modelos.data ?? []).map((m) => (
          <li key={m.id} className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-pedra-200">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{m.nome}</p>
              <p className="text-sm text-grafite-600">
                {m.area?.nome ?? m.setor?.nome} {m.demonstrativo ? "· demonstrativo" : ""}
              </p>
            </div>
            <RemoverModelo id={m.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
