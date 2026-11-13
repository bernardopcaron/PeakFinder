import { exigirAdmin } from "@/lib/sessao";
import { ItemConteudo } from "@/modulos/admin";
import { listarConteudo } from "@/modulos/admin/consultas";

export default async function PaginaConteudo({ searchParams }: PageProps<"/admin/conteudo">) {
  await exigirAdmin();
  const { q } = await searchParams;
  const termo = typeof q === "string" ? q : "";
  const itens = await listarConteudo(termo);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Conteúdo publicado</h1>
      <p className="text-sm text-grafite-600">“Verificado” indica que um administrador conferiu as informações técnicas. Sem busca, a lista mostra os cadastros mais recentes.</p>
      <form className="flex gap-2">
        <input type="search" name="q" defaultValue={termo} aria-label="Buscar por nome" placeholder="Buscar por nome" className="min-h-11 min-w-0 flex-1 rounded-lg border border-pedra-300 bg-white px-3" />
        <button type="submit" className="min-h-11 rounded-lg bg-grafite-900 px-4 text-sm font-semibold text-white">
          Buscar
        </button>
      </form>
      {itens.length === 0 ? (
        <p className="rounded-lg bg-pedra-100 px-4 py-8 text-center text-grafite-700">Nada encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {itens.map((item) => (
            <ItemConteudo key={`${item.tipo}-${item.id}`} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
