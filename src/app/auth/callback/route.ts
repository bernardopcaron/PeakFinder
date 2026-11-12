import { NextResponse, type NextRequest } from "next/server";
import { retornoSeguro } from "@/lib/retorno";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Recebe o link enviado por e-mail (confirmação ou recuperação), abre a sessão e segue para o destino. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const codigo = url.searchParams.get("code");
  const destino = retornoSeguro(url.searchParams.get("destino"));
  if (codigo) {
    const supabase = await criarClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(new URL(destino, url.origin));
  }
  return NextResponse.redirect(new URL("/entrar?erro=link", url.origin));
}
