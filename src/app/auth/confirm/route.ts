import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { retornoSeguro } from "@/lib/retorno";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const TIPOS: EmailOtpType[] = ["recovery", "signup", "email", "invite", "magiclink", "email_change"];

/**
 * Destino dos links enviados por e-mail (recuperação de senha e confirmação de conta).
 * O link carrega um token de uso único, então funciona em qualquer aparelho, não só
 * no navegador que fez o pedido. Os modelos de e-mail do Supabase apontam para cá.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;
  const destino = retornoSeguro(url.searchParams.get("next"));
  if (token && tipo && TIPOS.includes(tipo)) {
    const supabase = await criarClienteServidor();
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: token });
    if (!error) return NextResponse.redirect(new URL(destino, url.origin));
  }
  return NextResponse.redirect(new URL("/entrar?erro=link", url.origin));
}
