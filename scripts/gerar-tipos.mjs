import { writeFileSync } from "node:fs";
import { api } from "./supabase-api.mjs";

const { types } = await api("/types/typescript?included_schemas=public");
writeFileSync("src/lib/supabase/tipos-banco.ts", types);
console.log("Tipos gravados em src/lib/supabase/tipos-banco.ts");
