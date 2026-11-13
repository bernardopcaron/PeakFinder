import { exigirAdmin } from "@/lib/sessao";
import { ItemReporte } from "@/modulos/admin";
import { listarReportes } from "@/modulos/admin/consultas";

const ORDEM = { aberto: 0, confirmado: 1, resolvido: 2, descartado: 3 };

export default async function PaginaReportes() {
  await exigirAdmin();
  const reportes = (await listarReportes()).sort((a, b) => ORDEM[a.situacao] - ORDEM[b.situacao]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
      <p className="text-sm text-grafite-600">Restrições e interdições confirmadas viram alerta público na área até serem resolvidas ou até a data de vigência. Reportes de erro nunca são públicos.</p>
      {reportes.length === 0 ? (
        <p className="rounded-lg bg-pedra-100 px-4 py-8 text-center text-grafite-700">Nenhum reporte.</p>
      ) : (
        <ul className="space-y-3">
          {reportes.map((item) => (
            <ItemReporte key={`${item.id}-${item.situacao}`} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
