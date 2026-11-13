import { exigirAdmin } from "@/lib/sessao";
import { ItemPendente } from "@/modulos/admin";
import { listarPendentes } from "@/modulos/admin/consultas";

export default async function PaginaPendentes() {
  await exigirAdmin();
  const pendentes = await listarPendentes();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Cadastros pendentes</h1>
      <p className="text-sm text-grafite-600">Os mais antigos aparecem primeiro. Aprove a área antes dos setores, e o setor antes das vias.</p>
      {pendentes.length === 0 ? (
        <p className="rounded-lg bg-pedra-100 px-4 py-8 text-center text-grafite-700">Nenhum cadastro aguardando análise.</p>
      ) : (
        <ul className="space-y-3">
          {pendentes.map((item) => (
            <ItemPendente key={`${item.tipo}-${item.id}`} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
