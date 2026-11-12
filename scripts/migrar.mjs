// Aplica, em ordem, as migrações de supabase/migrations ainda não registradas.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { sql } from "./supabase-api.mjs";

const pasta = "supabase/migrations";

await sql(`create schema if not exists interno;
create table if not exists interno.migracoes (nome text primary key, aplicada_em timestamptz not null default now());`);

const aplicadas = new Set((await sql("select nome from interno.migracoes")).map((l) => l.nome));
const arquivos = readdirSync(pasta).filter((a) => a.endsWith(".sql")).sort();

for (const arquivo of arquivos) {
  if (aplicadas.has(arquivo)) continue;
  const conteudo = readFileSync(path.join(pasta, arquivo), "utf8");
  process.stdout.write(`Aplicando ${arquivo}... `);
  await sql(`begin;\n${conteudo}\ninsert into interno.migracoes (nome) values ('${arquivo}');\ncommit;`);
  console.log("ok");
}
await sql("notify pgrst, 'reload schema'");
console.log("Migrações em dia.");
