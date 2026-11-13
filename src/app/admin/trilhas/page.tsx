import { Cartao } from "@/componentes/Cartao";
import { exigirAdmin } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormTrilha, RemoverTrilha } from "@/modulos/admin";
import { listarAreas } from "@/modulos/areas/consultas";

export default async function PaginaTrilhas() {
  await exigirAdmin();
  const supabase = await criarClienteServidor();
  const [areas, trilhas] = await Promise.all([
    listarAreas(),
    supabase.from("trilhas_acesso").select("id, nome, distancia_m, area:areas(nome)").order("criado_em", { ascending: false }).limit(200),
  ]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">Trilhas de acesso</h1>
        <Cartao className="p-5">
          <FormTrilha areas={areas} />
        </Cartao>
      </div>
      <ul className="space-y-2">
        {(trilhas.data ?? []).map((t) => (
          <li key={t.id} className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-pedra-200">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t.nome}</p>
              <p className="text-sm text-grafite-600">
                {t.area?.nome} · {t.distancia_m != null ? `${Number(t.distancia_m).toLocaleString("pt-BR")} m` : "distância não informada"}
              </p>
            </div>
            <RemoverTrilha id={t.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
