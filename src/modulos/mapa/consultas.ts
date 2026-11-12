import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { ColecaoMapa } from "./tipos";

export async function obterColecaoMapa(): Promise<ColecaoMapa> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.rpc("mapa_geojson");
  if (error) throw error;
  return data as unknown as ColecaoMapa;
}
