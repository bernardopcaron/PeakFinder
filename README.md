# PeakFinder

Plataforma de mapeamento e planejamento de escaladas no Brasil: áreas, setores, vias, mapa, modelos 3D e contribuições da comunidade.

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Auth, Postgres + PostGIS, Storage) · MapLibre GL JS · Three.js

## Rodar na sua máquina

```bash
cp .env.example .env.local   # preencha com as chaves do projeto Supabase
npm install
npm run dev                  # http://localhost:3000
```

| Variável | Onde é usada |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | site, scripts e testes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | site e testes (chave pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | **somente** seed e testes; nunca configure no site publicado |
| `SUPABASE_ACCESS_TOKEN` | scripts `db:migrar` e `db:tipos` (token pessoal do Supabase com escrita) |
| `ADMIN_EMAIL` | o seed promove esta conta a administrador |

## Banco de dados

```bash
npm run db:migrar   # aplica as migrações de supabase/migrations ainda não registradas
npm run db:tipos    # regenera src/lib/supabase/tipos-banco.ts
npm run seed        # carrega o conteúdo demonstrativo e promove o ADMIN_EMAIL
```

As migrações são aplicadas pela Management API do Supabase (HTTPS). Toda a autorização fica no banco: políticas RLS em `0003_rls.sql` e gatilhos que impedem não administradores de alterar situação, origem ou papel.

O seed é marcado como **Dados demonstrativos**: as áreas existem, mas setores, vias, graus e trilhas são ilustrativos.

## Testes

```bash
npm test            # unidade e banco (Vitest)
npm run test:e2e    # navegador, em celular e desktop (Playwright)
```

Os testes de banco e de navegador usam o projeto Supabase configurado em `.env.local`. Eles criam usuários `e2e+...@peakfinder.test` e removem tudo ao final. Para testar o site publicado: `PLAYWRIGHT_BASE_URL=https://seu-site npm run test:e2e -- fluxo-mvp`.

## Publicar (Vercel)

1. Importe o repositório na Vercel.
2. Defina `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Não defina a chave de serviço.
3. No Supabase, em Authentication → URL Configuration, ponha o endereço do site em **Site URL** e em **Redirect URLs**.
4. Recuperação de senha: com o e-mail padrão do Supabase (plano gratuito), o link só funciona no mesmo navegador que fez o pedido. Para funcionar em qualquer aparelho, configure um SMTP próprio no Supabase e aponte os modelos de e-mail para `/auth/confirm`:
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/nova-senha` (Reset Password) e
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/` (Confirm signup).
5. Crie a conta do administrador no site e rode `npm run seed`.

## Estrutura

```
src/app/            rotas: (publico), (conta), contribuir, admin, api/mapa, auth
src/modulos/        um módulo por domínio: areas, vias, mapa, visualizador3d, escaladas,
                    perfil, comunidade, moderacao, admin (consultas, acoes, esquemas, componentes)
src/lib/            Supabase, sessão, graus, validações e utilitários
supabase/           migrações SQL e seed
testes/             banco (Vitest) e e2e (Playwright)
docs/superpowers/   especificação e plano do MVP
```

## Decisões que valem conhecer

- **Confirmação de e-mail desligada** no Supabase durante o MVP. Religue antes de divulgar amplamente.
- **Cadastros da comunidade** só ficam públicos após aprovação; o selo distingue Verificado, Comunidade e Dados demonstrativos.
- **Mapa-base** OpenFreeMap, sem chave de API.
