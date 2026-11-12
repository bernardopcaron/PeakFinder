export type Bucket = "fotos" | "avatares" | "modelos";

export function urlPublica(bucket: Bucket, caminho: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${caminho.split("/").map(encodeURIComponent).join("/")}`;
}
