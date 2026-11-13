import { exigirAdmin } from "@/lib/sessao";
import { ItemUsuario } from "@/modulos/admin";
import { listarUsuarios } from "@/modulos/admin/consultas";

export default async function PaginaUsuarios() {
  const admin = await exigirAdmin();
  const usuarios = await listarUsuarios();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
      <p className="text-sm text-grafite-600">Administradores aprovam cadastros, moderam conteúdo e definem outros administradores.</p>
      <ul className="space-y-2">
        {usuarios.map((item) => (
          <ItemUsuario key={`${item.id}-${item.papel}`} item={item} euMesmo={item.id === admin.id} />
        ))}
      </ul>
    </div>
  );
}
