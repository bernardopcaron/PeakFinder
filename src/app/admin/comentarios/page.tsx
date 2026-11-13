import { exigirAdmin } from "@/lib/sessao";
import { ItemComentario, ItemFoto } from "@/modulos/admin";
import { listarComentariosAdmin, listarFotosAdmin } from "@/modulos/admin/consultas";

export default async function PaginaComentarios() {
  await exigirAdmin();
  const [comentarios, fotos] = await Promise.all([listarComentariosAdmin(), listarFotosAdmin()]);
  return (
    <div className="space-y-8">
      <section aria-label="Comentários" className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">Comentários</h1>
        {comentarios.length === 0 ? (
          <p className="rounded-lg bg-pedra-100 px-4 py-8 text-center text-grafite-700">Nenhum comentário.</p>
        ) : (
          <ul className="space-y-2">
            {comentarios.map((item) => (
              <ItemComentario key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
      <section aria-label="Fotos" className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight">Fotos e croquis</h2>
        {fotos.length === 0 ? (
          <p className="rounded-lg bg-pedra-100 px-4 py-8 text-center text-grafite-700">Nenhuma foto enviada.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {fotos.map((item) => (
              <ItemFoto key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
