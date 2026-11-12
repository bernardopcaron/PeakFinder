# PeakFinder MVP — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar um web app em que o usuário cria conta, acha uma área no mapa, consulta vias e modelo 3D, favorita, registra ascensão e envia um cadastro que um admin aprova.

**Architecture:** Projeto único Next.js (App Router) que lê por componentes de servidor e escreve por Server Actions direto no Supabase; a autorização vive no banco (RLS + gatilho). Mapa e visualizador 3D são componentes de cliente carregados sob demanda. Código organizado por módulo de domínio em `src/modulos/*`.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Supabase (Auth, Postgres + PostGIS, Storage), `@supabase/ssr`, MapLibre GL JS, Three.js, Zod, Vitest, Playwright, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-12-peakfinder-mvp-design.md`

## Global Constraints

- Interface em português (Brasil); nomes de tabela, coluna, pasta e função em português sem acentos.
- Enums exatamente como na spec, seção 4: `situacao` (`pendente`, `aprovado`, `rejeitado`), `origem` (`comunidade`, `verificado`, `demonstrativo`), `modalidade` (`esportiva`, `tradicional`, `boulder`, `mista`), `papel` (`usuario`, `admin`), `estilo_ascensao` (`a_vista`, `flash`, `encadenada`, `trabalhada`, `top_rope`), `tipo_reporte` (`erro`, `restricao`, `interdicao`), `situacao_reporte` (`aberto`, `confirmado`, `descartado`, `resolvido`).
- Nenhum código do site usa `SUPABASE_SERVICE_ROLE_KEY`; ela existe só em `supabase/seed/` e `testes/`.
- Toda escrita passa por Server Action validada com Zod e retorna `ResultadoAcao` (Tarefa 5).
- Um módulo só importa de outro módulo os arquivos `consultas.ts`, `acoes.ts`, `tipos.ts` e componentes exportados em `index.ts`.
- Conteúdo do seed tem `origem = demonstrativo` e nunca `verificado`.
- Limites de upload: fotos 5 MB (JPEG, PNG, WebP), avatares 2 MB, modelos 50 MB (`.glb`, `.gltf`).
- Tiles do mapa: estilo OpenFreeMap `https://tiles.openfreemap.org/styles/liberty`.
- Áreas de toque de no mínimo 44 px; contraste AA.
- O desenvolvimento acontece no workspace em nuvem do Claude; o GitHub é a fonte da verdade e a pasta PeakFinder do Bernardo recebe um clone. Um commit por tarefa, no mínimo.
- Variáveis de ambiente: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`.

## Review Focus

1. Usuário comum chama a API do Supabase diretamente tentando gravar `situacao = aprovado`, `origem = verificado` ou `papel = admin` → a gravação é recusada ou os campos são ignorados. Teste na Tarefa 4.
2. Busca digitada sem acento ou em caixa diferente ("sao bento", "ITATIAIA") → encontra "São Bento do Sapucaí" e "Itatiaia". Teste na Tarefa 7.
3. Contribuição com coordenadas fora do Brasil ou com latitude e longitude trocadas → erro no campo, nada é gravado. Teste na Tarefa 12.
4. Via com grau que não pertence à modalidade (ex.: `V5` em `esportiva`, `7a` em `boulder`) → erro no campo. Testes nas Tarefas 2 e 12.
5. Duas áreas ou duas vias com o mesmo nome → ambas são gravadas, a segunda com slug sufixado (`-2`), sem erro de unicidade para o usuário. Teste na Tarefa 12.

---

### Task 0: Contas e acesso (com o Bernardo)

Sem código. Bloqueia as Tarefas 3 em diante.

- [ ] **Step 1:** Guiar o Bernardo na criação da conta Supabase e do projeto `PeakFinder`, região South America (São Paulo). Receber: URL do projeto, chave `anon`, chave `service_role`, senha do banco.
- [ ] **Step 2:** Em Authentication → Providers → Email, desligar "Confirm email" (decisão do MVP: o cadastro entra direto; religar antes de divulgar amplamente). Em Database → Extensions, ligar `postgis` e `unaccent`.
- [ ] **Step 3:** Guiar a criação da conta GitHub e do repositório privado `peakfinder`; obter um meio de push (token de acesso restrito ao repositório).
- [ ] **Step 4:** Receber o e-mail do primeiro administrador (`ADMIN_EMAIL`).
- [ ] **Step 5:** Verificar, do workspace em nuvem, o acesso a `<projeto>.supabase.co` e a `github.com`.
  Esperado: HTTP 200 na API REST do Supabase com a chave `anon`. Se o workspace não alcançar o Supabase, as migrações e os testes de banco rodam pelo computador do Bernardo e isso é registrado aqui antes de seguir.

A conta Vercel fica para a Tarefa 14.

### Task 1: Projeto, identidade visual e casca de navegação

**Files:**
- Create: projeto via `npx create-next-app@latest peakfinder --typescript --tailwind --app --src-dir --eslint --import-alias "@/*"`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/componentes/NavInferior.tsx`, `src/componentes/BarraSuperior.tsx`, `src/componentes/Selo.tsx`, `src/componentes/Botao.tsx`, `src/componentes/Cartao.tsx`
- Create: `vitest.config.ts`, `playwright.config.ts`, `.env.example`, `README.md`
- Test: `testes/e2e/casca.spec.ts`

**Interfaces:**
- Produces: tokens de cor Tailwind `grafite`, `pedra`, `areia`, `mata`, `terracota` (cada um com tons 50–900); `<Selo origem="verificado" | "comunidade" | "demonstrativo" />` com os textos "Verificado", "Comunidade", "Dados demonstrativos"; `<Botao variante="primario" | "secundario" | "fantasma">`; `<Cartao>`. Scripts npm: `dev`, `build`, `lint`, `test` (Vitest), `test:e2e` (Playwright).
- Playwright roda dois projetos: `celular` (Pixel 7) e `desktop` (1280×800).

- [ ] **Step 1:** Criar o projeto, instalar `vitest`, `@playwright/test`, `zod`, e configurar os dois runners.
- [ ] **Step 2: Teste que falha** — `casca.spec.ts`:
  - `celular`: a home mostra navegação inferior com os links "Explorar", "Mapa", "Contribuir", "Escaladas", "Perfil", apontando para `/`, `/mapa`, `/contribuir`, `/minhas-escaladas`, `/perfil`.
  - `desktop`: os mesmos cinco links na barra superior e a navegação inferior não está visível.
  - `<html lang="pt-BR">`.
- [ ] **Step 3:** Rodar `npm run test:e2e -- casca` → FALHA.
- [ ] **Step 4:** Implementar tokens, layout, navegação e componentes base. Fonte: Inter via `next/font`. `terracota-600` é a cor de ação primária; fundo `areia-50`; texto `grafite-900`.
- [ ] **Step 5:** Rodar `npm run test:e2e -- casca` → PASSA; `npm run build` → sem erros.
- [ ] **Step 6:** Commit `feat: projeto base, identidade visual e navegação`.

### Task 2: Biblioteca de graus

**Files:**
- Create: `src/lib/graus/graus.ts`, `src/lib/graus/index.ts`
- Test: `src/lib/graus/graus.test.ts`

**Interfaces:**
- Produces:
  - `type Modalidade = 'esportiva' | 'tradicional' | 'boulder' | 'mista'`
  - `ESCALA_VIA: readonly string[]` — exatamente a lista da spec, seção 4 "Graus", de `I` a `12c` (30 itens).
  - `ESCALA_BOULDER: readonly string[]` — `V0` a `V16` (17 itens).
  - `grausDaModalidade(m: Modalidade): readonly string[]` — `boulder` → `ESCALA_BOULDER`; as demais → `ESCALA_VIA`.
  - `grauParaOrdem(grau: string, m: Modalidade): number | null` — índice na escala da modalidade (base 1), `null` se não pertence.
  - `FAIXAS_VIA` e `FAIXAS_BOULDER: { id: string; rotulo: string; min: number; max: number }[]` — vias: "Até IV" (I–IVsup), "V a VIsup", "7º grau", "8º grau", "9º grau ou mais"; boulder: "V0–V2", "V3–V5", "V6–V8", "V9+".
  - `faixaDoGrau(ordem: number, m: Modalidade): string` — id da faixa.

- [ ] **Step 1: Testes que falham:**
  - `ESCALA_VIA.length === 30`, `ESCALA_VIA[0] === 'I'`, `ESCALA_VIA[11] === 'VIsup'`, `ESCALA_VIA[12] === '7a'`, `ESCALA_VIA[29] === '12c'`.
  - `grauParaOrdem('VIsup','esportiva') === 12` e `< grauParaOrdem('7a','esportiva')`.
  - `grauParaOrdem('V5','esportiva') === null`; `grauParaOrdem('7a','boulder') === null`; `grauParaOrdem('V5','boulder') === 6`.
  - `grauParaOrdem('7A','esportiva') === null` (sensível a caixa; o formulário usa select).
  - Toda ordem de 1 a 30 cai em exatamente uma faixa de `FAIXAS_VIA`; idem 1 a 17 em `FAIXAS_BOULDER`.
- [ ] **Step 2:** `npm test -- graus` → FALHA.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** `npm test -- graus` → PASSA.
- [ ] **Step 5:** Commit `feat: escalas e ordenação de graus`.

### Task 3: Esquema do banco

**Files:**
- Create: `supabase/migrations/0001_esquema.sql`, `supabase/migrations/0002_funcoes.sql`
- Create: `src/lib/supabase/tipos-banco.ts` (gerado por `supabase gen types typescript`)
- Test: `testes/banco/esquema.test.ts`

**Interfaces:**
- Produces (SQL): todas as tabelas, colunas e enums da spec, seção 4, com esses nomes exatos. Restrições:
  - `fotos`, `modelos_3d`, `comentarios`, `reportes`: `CHECK (num_nonnulls(...) = 1)` sobre as colunas de alvo.
  - `favoritos unique (usuario_id, via_id)`; `avaliacoes unique (usuario_id, via_id)`, `nota between 1 and 5`.
  - `areas.slug` único; `setores unique (area_id, slug)`; `vias unique (setor_id, slug)`.
  - Índices GIST em `areas.localizacao`, `setores.localizacao`, `trilhas_acesso.tracado`.
- Produces (funções e views):
  - gatilho `criar_perfil_ao_cadastrar` em `auth.users` → insere em `perfis` com `nome` de `raw_user_meta_data->>'nome'` e `nome_usuario` derivado do e-mail, sufixado se já existir.
  - `gerar_slug(texto text) returns text` — minúsculas, `unaccent`, hífens.
  - gatilhos `definir_slug_*` em `areas`, `setores`, `vias`: slug a partir do nome, acrescentando `-2`, `-3`… dentro do escopo de unicidade.
  - view `vias_resumo`: colunas de `vias` + `nota_media numeric`, `total_avaliacoes int`, `total_ascensoes int`, `total_favoritos int`, `area_id`, `area_nome`, `area_slug`, `setor_nome`, `setor_slug`. A view usa `security_invoker = true`.
  - `mapa_geojson() returns jsonb` — FeatureCollection com features de `tipo` = `area` | `setor` | `trilha`; áreas trazem `slug`, `nome`, `municipio`, `estado`, `total_vias`, `modalidades text[]`, `ordens_grau int[]`; apenas registros aprovados.
  - `buscar(termo text) returns table (tipo text, id uuid, titulo text, subtitulo text, caminho text)` — `unaccent` + `ilike` em nome de área, município e nome de via; apenas aprovados; limite 20.
  - `eh_admin() returns boolean` — `security definer`, lê `perfis.papel` de `auth.uid()`.

- [ ] **Step 1: Teste que falha** — `esquema.test.ts` (cliente `service_role`): `gerar_slug('Pedra do Baú') = 'pedra-do-bau'`; inserir duas áreas "Teste Slug" gera `teste-slug` e `teste-slug-2`; inserir foto com `area_id` e `via_id` ao mesmo tempo falha; `nota = 6` falha; `mapa_geojson()` devolve `type = 'FeatureCollection'`. O teste remove o que criou.
- [ ] **Step 2:** `npm test -- esquema` → FALHA (relação inexistente).
- [ ] **Step 3:** Escrever as migrações e aplicar com `supabase db push`.
- [ ] **Step 4:** Gerar `tipos-banco.ts`.
- [ ] **Step 5:** `npm test -- esquema` → PASSA.
- [ ] **Step 6:** Commit `feat: esquema do banco, funções e views`.

### Task 4: Regras de acesso (RLS), gatilho de proteção e Storage

**Files:**
- Create: `supabase/migrations/0003_rls.sql`, `supabase/migrations/0004_storage.sql`
- Create: `testes/apoio/usuarios.ts`
- Test: `testes/banco/rls.test.ts`

**Interfaces:**
- Consumes: `eh_admin()` (Tarefa 3).
- Produces:
  - Políticas exatamente conforme a tabela "Regras de acesso (RLS)" da spec.
  - Gatilho `proteger_campos_moderacao` (before insert/update em `areas`, `setores`, `vias`): se não `eh_admin()`, força `situacao = 'pendente'`, `origem = 'comunidade'` no insert e levanta exceção em update que altere `situacao`, `origem` ou campos `moderado_*`. Gatilho análogo em `perfis` para `papel`. Conexões `service_role` ficam isentas (seed).
  - Buckets `fotos`, `avatares`, `modelos` com limites e tipos das Global Constraints; política de escrita: primeiro segmento do caminho = `auth.uid()`; `modelos` só admin.
  - `testes/apoio/usuarios.ts`: `criarUsuarioTeste(papel: 'usuario' | 'admin'): Promise<{ cliente: SupabaseClient; id: string; email: string; senha: string }>` (e-mails `e2e+<aleatório>@peakfinder.test`), `clienteAnonimo(): SupabaseClient`, `clienteServico(): SupabaseClient`, `limparDadosTeste(): Promise<void>` (remove usuários `e2e+` e tudo que criaram).

- [ ] **Step 1: Testes que falham** — `rls.test.ts`:
  - Usuário insere área com `situacao: 'aprovado', origem: 'verificado'` → lida de volta como `pendente` / `comunidade`.
  - Usuário faz update `situacao = 'aprovado'` na própria área → erro.
  - Usuário faz update `papel = 'admin'` no próprio perfil → erro.
  - Anônimo e outro usuário não leem a área pendente; o autor e o admin leem.
  - Admin aprova → anônimo passa a ler.
  - Autor edita `descricao` enquanto pendente → ok; depois de aprovada → recusado.
  - Usuário A não lê favoritos de B; lê ascensões de B.
  - Comentário `oculto = true` some para anônimo; admin lê.
  - Reporte `interdicao` aberto: só autor e admin leem; após `confirmado`: anônimo lê.
  - Anônimo não insere em nenhuma tabela.
  - Storage: usuário grava em `fotos/<seu id>/x.jpg` → ok; em `fotos/<outro id>/x.jpg` → recusado; usuário comum em `modelos/` → recusado.
- [ ] **Step 2:** `npm test -- rls` → FALHA.
- [ ] **Step 3:** Escrever e aplicar as migrações.
- [ ] **Step 4:** `npm test -- rls` → PASSA.
- [ ] **Step 5:** Commit `feat: RLS, proteção de campos de moderação e buckets`.

### Task 5: Clientes Supabase e autenticação

**Files:**
- Create: `src/lib/supabase/servidor.ts`, `src/lib/supabase/navegador.ts`, `src/middleware.ts`
- Create: `src/lib/acoes.ts`, `src/lib/sessao.ts`
- Create: `src/modulos/perfil/acoes-auth.ts`, `src/modulos/perfil/esquemas.ts`
- Create: `src/app/(conta)/entrar/page.tsx`, `cadastrar/page.tsx`, `recuperar-senha/page.tsx`, `nova-senha/page.tsx`, `src/app/auth/callback/route.ts`
- Test: `testes/e2e/auth.spec.ts`

**Interfaces:**
- Produces:
  - `criarClienteServidor(): Promise<SupabaseClient<Database>>`, `criarClienteNavegador(): SupabaseClient<Database>`.
  - `type ResultadoAcao<T = void> = { ok: true; dados: T } | { ok: false; erro: string; campos?: Record<string, string> }`.
  - `obterUsuario(): Promise<{ id: string; email: string; perfil: Perfil } | null>`.
  - `exigirUsuario(retorno?: string): Promise<Usuario>` — redireciona para `/entrar?retorno=<caminho>` se não logado.
  - `exigirAdmin(): Promise<Usuario>` — `notFound()` se não for admin.
  - Ações: `cadastrar(form)`, `entrar(form)`, `sair()`, `pedirRecuperacao(form)`, `definirNovaSenha(form)`; todas `Promise<ResultadoAcao>`.
  - Esquema de cadastro: `nome` 2–80, `email` válido, `senha` mínimo 8.
  - `retorno` só é aceito se começar com `/` e não com `//`; caso contrário, vai para `/`.
  - Mensagens de erro: credenciais inválidas → "E-mail ou senha incorretos."; e-mail já usado → "Já existe uma conta com este e-mail."

- [ ] **Step 1: Teste que falha** — `auth.spec.ts`: cadastrar com e-mail `e2e+…` → vai para `/` e a navegação mostra o nome; sair; entrar de novo; `/minhas-escaladas` deslogado redireciona para `/entrar?retorno=/minhas-escaladas` e, após entrar, volta para lá; senha de 5 caracteres mostra erro no campo; `/entrar?retorno=https://externo.com` leva a `/` após login.
- [ ] **Step 2:** `npm run test:e2e -- auth` → FALHA.
- [ ] **Step 3:** Implementar clientes, middleware de renovação de sessão, ações e telas.
- [ ] **Step 4:** `npm run test:e2e -- auth` → PASSA.
- [ ] **Step 5:** Commit `feat: autenticação por e-mail e senha`.

### Task 6: Seed e modelos 3D demonstrativos

**Files:**
- Create: `supabase/seed/dados.ts`, `supabase/seed/semear.ts`, `supabase/seed/gerar-modelos.ts`
- Create: `supabase/seed/modelos/parede-vertical.glb`, `parede-negativa.glb`, `bloco-boulder.glb` (gerados)
- Test: `testes/banco/seed.test.ts`

**Interfaces:**
- Produces:
  - `npm run seed` — idempotente (upsert por `slug`), usa `service_role`.
  - `npm run seed:modelos` — gera os três GLB com Three.js + `GLTFExporter` em Node: malha de parede com relevo por ruído, cor de rocha por vértice, menos de 2 MB cada.
  - 7 áreas: Pedra do Baú (São Bento do Sapucaí, SP), Serra do Cipó (Santana do Riacho, MG), Itatiaia (RJ), Morro do Anhangava (Quatro Barras, PR), Pão de Açúcar (Rio de Janeiro, RJ), Salinas (Nova Friburgo, RJ), Itacolomi (Gravataí, RS). Cada uma com 1–3 setores, 4–8 vias, 1 trilha ilustrativa; 3 áreas com modelo 3D; 4 áreas com `destaque = true`.
  - Tudo com `situacao = 'aprovado'`, `origem = 'demonstrativo'`; `modelos_3d.demonstrativo = true`.
  - O usuário de `ADMIN_EMAIL`, se existir, recebe `papel = 'admin'`.

- [ ] **Step 1: Teste que falha** — `seed.test.ts`: após rodar `semear()` duas vezes, há exatamente 7 áreas com `origem = 'demonstrativo'`; nenhuma linha em `areas`, `setores` ou `vias` com `origem = 'verificado'`; toda via tem `grau_ordem === grauParaOrdem(grau, modalidade)`; todas as áreas têm latitude entre −34 e 6 e longitude entre −74 e −34; os três GLB existem no bucket `modelos`.
- [ ] **Step 2:** `npm test -- seed` → FALHA.
- [ ] **Step 3:** Implementar gerador de modelos, dados e script.
- [ ] **Step 4:** `npm run seed:modelos && npm run seed && npm test -- seed` → PASSA.
- [ ] **Step 5:** Commit `feat: seed demonstrativo e modelos 3D`.

### Task 7: Áreas, setores, vias e Explorar

**Files:**
- Create: `src/modulos/areas/consultas.ts`, `tipos.ts`, `index.ts`, `componentes/{CartaoArea,ListaSetores,AlertaAcesso,FichaArea}.tsx`
- Create: `src/modulos/vias/consultas.ts`, `tipos.ts`, `index.ts`, `componentes/{CartaoVia,TabelaVias,FichaTecnica,FiltroVias}.tsx`
- Create: `src/modulos/comunidade/componentes/Galeria.tsx`
- Create: `src/app/(publico)/page.tsx`, `buscar/page.tsx`, `areas/[slug]/page.tsx`, `areas/[slug]/[setor]/page.tsx`, `vias/[id]/page.tsx`, `not-found.tsx`
- Test: `testes/e2e/explorar.spec.ts`

**Interfaces:**
- Consumes: `criarClienteServidor`, `vias_resumo`, `buscar()`, `<Selo>`, `FAIXAS_*`.
- Produces:
  - `areas/consultas.ts`: `listarAreasDestaque(): Promise<AreaResumo[]>`, `obterAreaPorSlug(slug): Promise<AreaDetalhe | null>` (inclui setores, alertas vigentes, modelo 3D), `obterSetor(areaSlug, setorSlug): Promise<SetorDetalhe | null>`.
  - `vias/consultas.ts`: `listarViasPopulares(limite = 8): Promise<ViaResumo[]>` (ordem: `total_ascensoes + total_favoritos` desc), `listarViasDaArea(areaId): Promise<ViaResumo[]>`, `listarViasDoSetor(setorId)`, `obterVia(id): Promise<ViaDetalhe | null>`.
  - `buscarTudo(termo: string): Promise<ResultadoBusca[]>` em `areas/consultas.ts`.
  - `<AlertaAcesso>`: mostra reportes `restricao`/`interdicao` com `situacao = 'confirmado'` e `vigente_ate` nulo ou futuro.
  - Páginas com `origem = 'demonstrativo'` exibem o aviso: "Dados demonstrativos — não use para planejar uma escalada real."
  - Campos técnicos vazios aparecem como "—".

- [ ] **Step 1: Teste que falha** — `explorar.spec.ts`: home lista áreas em destaque e vias populares; buscar "sao bento" e "ITATIAIA" devolve as áreas certas (Review Focus 2); busca sem resultado mostra "Nada encontrado"; abrir Pedra do Baú mostra setores, tabela de vias e selo "Dados demonstrativos"; ordenar por grau muda a primeira linha; filtrar modalidade reduz a lista; abrir via mostra ficha com grau, modalidade, altura, extensão, costuras, proteção e crux; `/areas/nao-existe` → página "não encontrado".
- [ ] **Step 2:** `npm run test:e2e -- explorar` → FALHA.
- [ ] **Step 3:** Implementar consultas, componentes e páginas.
- [ ] **Step 4:** `npm run test:e2e -- explorar` → PASSA.
- [ ] **Step 5:** Commit `feat: explorar, áreas, setores e vias`.

### Task 8: Mapa

**Files:**
- Create: `src/app/api/mapa/route.ts`
- Create: `src/modulos/mapa/filtros.ts`, `tipos.ts`, `index.ts`, `componentes/{Mapa,MapaCliente,PainelFiltros,CartaoMarcador,MiniMapa,SeletorPonto}.tsx`
- Create: `src/app/(publico)/mapa/page.tsx`
- Test: `src/modulos/mapa/filtros.test.ts`, `testes/e2e/mapa.spec.ts`

**Interfaces:**
- Consumes: `mapa_geojson()`, `FAIXAS_VIA`, `FAIXAS_BOULDER`, `faixaDoGrau`.
- Produces:
  - `GET /api/mapa` → FeatureCollection de `mapa_geojson()`, cache de 60 s.
  - `type FiltrosMapa = { modalidades: Modalidade[]; faixas: string[] }` (vazio = sem filtro).
  - `filtrarAreas(fc: FeatureCollection, f: FiltrosMapa): FeatureCollection` — mantém a área se alguma via dela satisfaz modalidade E faixa; setores e trilhas seguem a área.
  - `<Mapa>` (carrega `MapaCliente` com `next/dynamic`, `ssr: false`): agrupamento de marcadores; setores e trilhas a partir do zoom 11; `window.__mapaPronto = true` e `data-testid="mapa"` quando carregado; se os tiles falharem, mostra a lista de áreas com o texto "Não foi possível carregar o mapa".
  - `<MiniMapa lat lng />` para páginas de área; `<SeletorPonto valor onChange />` para a Tarefa 12, devolvendo `{ lat: number; lng: number }`.
  - Vista inicial: centro `[-51.9, -14.2]`, zoom 3.6.

- [ ] **Step 1: Testes que falham** — `filtros.test.ts`: sem filtros devolve tudo; `modalidades: ['boulder']` mantém só áreas com boulder; modalidade + faixa exige a mesma via satisfazendo as duas; trilha de área removida também é removida. `mapa.spec.ts`: `/mapa` carrega; tocar no marcador da Pedra do Baú abre cartão com nome e link que leva a `/areas/pedra-do-bau`; aplicar filtro "boulder" reduz o contador "N áreas"; com as requisições de tiles bloqueadas, a lista de áreas aparece.
- [ ] **Step 2:** `npm test -- filtros` e `npm run test:e2e -- mapa` → FALHAM.
- [ ] **Step 3:** Implementar. No celular, painel inferior deslizante; no desktop, painel lateral.
- [ ] **Step 4:** Rodar ambos → PASSAM.
- [ ] **Step 5:** Commit `feat: mapa interativo com filtros e trilhas`.

### Task 9: Visualizador 3D

**Files:**
- Create: `src/modulos/visualizador3d/index.ts`, `componentes/{Visualizador3D,Cena}.tsx`, `enquadrar.ts`
- Modify: `src/app/(publico)/areas/[slug]/page.tsx`, `areas/[slug]/[setor]/page.tsx`
- Test: `src/modulos/visualizador3d/enquadrar.test.ts`, `testes/e2e/visualizador.spec.ts`

**Interfaces:**
- Produces:
  - `<Visualizador3D url: string nome: string demonstrativo: boolean fotosReserva?: string[] />` — `next/dynamic`, `ssr: false`; `OrbitControls` com rotação, zoom e deslocamento por mouse e toque; botão "Reenquadrar"; estados em `data-estado`: `carregando` | `pronto` | `erro`; em `erro` mostra "Não foi possível carregar o modelo 3D", botão "Tentar de novo" e as fotos de reserva; sem WebGL, vai direto para `erro`; com `demonstrativo`, mostra o texto "Modelo demonstrativo". Libera geometrias, materiais e renderer ao desmontar.
  - `calcularEnquadramento(caixa: { min: [number,number,number]; max: [number,number,number] }, fovGraus: number): { posicao: [number,number,number]; alvo: [number,number,number]; distancia: number }`.

- [ ] **Step 1: Testes que falham** — `enquadrar.test.ts`: o alvo é o centro da caixa; a distância cresce com o tamanho da caixa; caixa de volume zero devolve distância finita e maior que zero. `visualizador.spec.ts`: na Pedra do Baú o visualizador chega a `data-estado="pronto"` e mostra "Modelo demonstrativo"; arrastar muda a posição da câmera (exposta em `data-camera`); "Reenquadrar" restaura; com a URL do GLB respondendo 404, aparece a mensagem de erro e o restante da página continua utilizável.
- [ ] **Step 2:** Rodar → FALHAM.
- [ ] **Step 3:** Implementar e encaixar nas páginas de área e setor.
- [ ] **Step 4:** Rodar → PASSAM.
- [ ] **Step 5:** Commit `feat: visualizador 3D de modelos GLB/GLTF`.

### Task 10: Favoritos, ascensões, avaliações e Minhas escaladas

**Files:**
- Create: `src/modulos/escaladas/acoes.ts`, `consultas.ts`, `esquemas.ts`, `resumo.ts`, `tipos.ts`, `index.ts`, `componentes/{BotaoFavoritar,FormAscensao,ListaAscensoes,ListaFavoritos,Avaliar,ResumoEscaladas}.tsx`
- Create: `src/app/(conta)/minhas-escaladas/page.tsx`
- Modify: `src/app/(publico)/vias/[id]/page.tsx`
- Test: `src/modulos/escaladas/resumo.test.ts`, `testes/e2e/escaladas.spec.ts`

**Interfaces:**
- Consumes: `exigirUsuario`, `ResultadoAcao`.
- Produces:
  - `alternarFavorito(viaId: string): Promise<ResultadoAcao<{ favoritada: boolean }>>` — idempotente sob duplo clique (upsert / delete).
  - `registrarAscensao(form): Promise<ResultadoAcao<{ id: string }>>` — `data` obrigatória e não futura; `estilo` do enum; `notas` até 1000; `grau_sugerido` opcional e válido para a modalidade da via.
  - `removerAscensao(id)`, `avaliarVia(viaId: string, nota: 1|2|3|4|5): Promise<ResultadoAcao>` (upsert).
  - `listarMinhasAscensoes()`, `listarMeusFavoritos()`, `estadoDaViaParaUsuario(viaId): Promise<{ favoritada: boolean; minhaNota: number | null; ascensoes: number }>`.
  - `calcularResumo(ascensoes: AscensaoComVia[]): { total: number; maximoPorModalidade: Partial<Record<Modalidade, string>> }`.
  - Rótulos de estilo: "À vista", "Flash", "Encadenada", "Trabalhada", "Top rope".

- [ ] **Step 1: Testes que falham** — `resumo.test.ts`: lista vazia → `total 0`, sem máximos; máximo por modalidade usa `grau_ordem`, não ordem alfabética (`10a` > `9c`). `escaladas.spec.ts`: deslogado, "Favoritar" leva a `/entrar` e volta à via; logado, favoritar muda o botão para "Favoritada" e a via aparece em Minhas escaladas; dois cliques rápidos deixam um estado consistente; registrar ascensão com data de hoje e estilo "À vista" aparece no histórico; data futura mostra erro; avaliar com 4 estrelas atualiza a média exibida; após recarregar a página, tudo persiste.
- [ ] **Step 2:** Rodar → FALHAM.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Rodar → PASSAM.
- [ ] **Step 5:** Commit `feat: favoritos, ascensões, avaliações e minhas escaladas`.

### Task 11: Perfil

**Files:**
- Create: `src/modulos/perfil/acoes.ts`, `consultas.ts`, `index.ts`, `componentes/{FormPerfil,EnvioAvatar,AtividadeRecente}.tsx`
- Create: `src/lib/upload.ts`
- Create: `src/app/(conta)/perfil/page.tsx`, `src/app/(publico)/u/[nome_usuario]/page.tsx`
- Test: `src/lib/upload.test.ts`, `testes/e2e/perfil.spec.ts`

**Interfaces:**
- Produces:
  - `validarArquivo(arquivo: { type: string; size: number; name: string }, tipo: 'foto' | 'avatar' | 'modelo'): { ok: true } | { ok: false; erro: string }` — limites das Global Constraints; erros "Arquivo muito grande (máx. N MB)." e "Formato não aceito.".
  - `enviarArquivo(bucket: 'fotos' | 'avatares' | 'modelos', arquivo: File, usuarioId: string): Promise<ResultadoAcao<{ caminho: string }>>` — caminho `<usuarioId>/<uuid>.<ext>`.
  - `urlPublica(bucket, caminho): string`.
  - `atualizarPerfil(form): Promise<ResultadoAcao>` — `nome` 2–80; `nome_usuario` 3–30, `[a-z0-9_]`, único ("Este nome de usuário já está em uso."); `bio` até 300.
  - `obterPerfilPublico(nomeUsuario): Promise<PerfilPublico | null>` — ascensões e contribuições aprovadas recentes; nunca favoritos.

- [ ] **Step 1: Testes que falham** — `upload.test.ts`: JPEG de 4 MB ok como foto; 6 MB falha; PDF falha; avatar de 3 MB falha; `.glb` de 40 MB ok como modelo; `.obj` falha. `perfil.spec.ts`: editar nome e bio persiste; enviar avatar mostra a imagem; nome de usuário já usado mostra erro; `/u/<nome>` mostra bio e ascensão registrada, sem favoritos; `/u/inexistente` → não encontrado.
- [ ] **Step 2:** Rodar → FALHAM.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Rodar → PASSAM.
- [ ] **Step 5:** Commit `feat: perfil, avatar e página pública`.

### Task 12: Comunidade — contribuições, comentários, fotos e reportes

**Files:**
- Create: `src/modulos/comunidade/acoes.ts`, `consultas.ts`, `esquemas.ts`, `index.ts`, `componentes/{FormArea,FormSetor,FormVia,EnvioFotos,Comentarios,MinhasContribuicoes}.tsx`
- Create: `src/modulos/moderacao/acoes.ts`, `esquemas.ts`, `index.ts`, `componentes/FormReporte.tsx`
- Create: `src/app/contribuir/page.tsx`, `contribuir/area/page.tsx`, `contribuir/setor/page.tsx`, `contribuir/via/page.tsx`
- Modify: páginas de área, setor, via e `minhas-escaladas`
- Test: `src/modulos/comunidade/esquemas.test.ts`, `testes/e2e/comunidade.spec.ts`

**Interfaces:**
- Consumes: `<SeletorPonto>`, `grausDaModalidade`, `grauParaOrdem`, `enviarArquivo`, `validarArquivo`, `exigirUsuario`.
- Produces:
  - `esquemaArea`: `nome` 3–120; `estado` UF válida; `municipio` 2–120; `lat` −34 a 6; `lng` −74 a −34 (erro: "O ponto precisa estar no Brasil."); `descricao` até 5000; `condicoes_acesso` até 2000.
  - `esquemaSetor`: `area_id`, `nome` 2–120, ponto opcional com a mesma regra, `tempo_aproximacao_min` 0–600.
  - `esquemaVia`: `setor_id`; `nome` 2–120; `modalidade`; `grau` pertencente a `grausDaModalidade(modalidade)` (erro: "Grau inválido para esta modalidade."); `altura_m` e `extensao_m` 1–2000 opcionais; `costuras` 0–100 opcional; `protecao`, `crux` até 500.
  - `enviarArea(form)`, `enviarSetor(form)`, `enviarVia(form)`: `Promise<ResultadoAcao<{ id: string }>>`; calculam `grau_ordem` no servidor; redirecionam para Minhas contribuições.
  - `editarContribuicao(tipo: 'area' | 'setor' | 'via', id, form)` — só enquanto pendente.
  - `listarMinhasContribuicoes(): Promise<Contribuicao[]>` com rótulos "Em análise", "Aprovada", "Rejeitada" e `motivo_rejeicao`.
  - Setor e via só podem ser enviados para área/setor aprovado ou do próprio autor.
  - `adicionarFoto({ alvo, caminho, legenda, tipo })`, `removerFoto(id)`; `comentar({ alvo, texto })` (1–2000), `removerComentario(id)`; `listarComentarios(alvo)`.
  - `reportar({ alvo, tipo, descricao })` — `descricao` 10–2000; confirmação "Reporte enviado para análise."

- [ ] **Step 1: Testes que falham** — `esquemas.test.ts`: `lat: 48.85, lng: 2.35` falha; `lat: -46.6, lng: -23.5` (trocados) falha; `lat: -22.68, lng: -45.65` passa (Review Focus 3); `V5` em `esportiva` e `7a` em `boulder` falham, `7a` em `esportiva` passa (Review Focus 4); `costuras: -1` falha. `comunidade.spec.ts`: enviar área nova → aparece "Em análise" em Minhas contribuições e não aparece na busca para outro usuário; enviar via em área aprovada → "Em análise"; enviar duas vias com o mesmo nome no mesmo setor → ambas gravadas, sem erro (Review Focus 5); formulário com erro preserva os campos digitados; comentar em uma via mostra o comentário; enviar foto mostra a imagem na galeria; arquivo acima do limite mostra erro antes do envio; reportar interdição mostra a confirmação.
- [ ] **Step 2:** Rodar → FALHAM.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Rodar → PASSAM.
- [ ] **Step 5:** Commit `feat: contribuições, comentários, fotos e reportes`.

### Task 13: Painel administrativo

**Files:**
- Create: `src/modulos/admin/acoes.ts`, `consultas.ts`, `esquemas.ts`, `gpx.ts`, `index.ts`, `componentes/{FilaPendentes,ItemPendente,ListaReportes,ListaComentarios,ListaUsuarios,FormTrilha,FormModelo}.tsx`
- Create: `src/app/admin/layout.tsx`, `admin/page.tsx`, `admin/pendentes/page.tsx`, `admin/reportes/page.tsx`, `admin/comentarios/page.tsx`, `admin/usuarios/page.tsx`, `admin/trilhas/page.tsx`, `admin/modelos/page.tsx`
- Test: `src/modulos/admin/gpx.test.ts`, `testes/e2e/admin.spec.ts`

**Interfaces:**
- Consumes: `exigirAdmin` (chamado no layout e em toda ação).
- Produces:
  - `listarPendentes(): Promise<Pendente[]>` (áreas, setores e vias, mais antigos primeiro).
  - `aprovar(tipo, id)`, `rejeitar(tipo, id, motivo)` (motivo 5–500, obrigatório), `definirOrigem(tipo, id, origem: 'comunidade' | 'verificado')`, `editarRegistro(tipo, id, form)`; todas gravam `moderado_por` e `moderado_em`.
  - Aprovar um setor ou via cujo pai está pendente devolve erro "Aprove primeiro a área/setor.".
  - `ocultarComentario(id)`, `restaurarComentario(id)`, `ocultarFoto(id)`, `restaurarFoto(id)`.
  - `tratarReporte(id, situacao: 'confirmado' | 'descartado' | 'resolvido', nota?: string, vigenteAte?: string)`.
  - `definirPapel(usuarioId, papel)` — recusa rebaixar o último admin ("É preciso manter ao menos um administrador.").
  - `gpxParaLinha(conteudo: string): { coordenadas: [number, number][]; distancia_m: number }` e aceitação de GeoJSON LineString; arquivo sem pontos → erro "Arquivo sem traçado.".
  - `cadastrarTrilha(form)`, `cadastrarModelo(form)`.

- [ ] **Step 1: Testes que falham** — `gpx.test.ts`: GPX de 3 pontos devolve 3 coordenadas `[lng, lat]` e distância positiva; GPX sem `trkpt` lança "Arquivo sem traçado."; XML inválido lança erro. `admin.spec.ts`: usuário comum em `/admin` → não encontrado; admin vê a área pendente criada por um usuário de teste, aprova, e ela passa a aparecer na busca de um anônimo com selo "Comunidade"; promover a "Verificado" troca o selo; rejeitar sem motivo mostra erro; rejeitar com motivo aparece em Minhas contribuições do autor; ocultar comentário o remove da página pública; confirmar reporte de interdição faz o alerta aparecer no topo da área; resolver o reporte remove o alerta; rebaixar o único admin é recusado.
- [ ] **Step 2:** Rodar → FALHAM.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Rodar → PASSAM.
- [ ] **Step 5:** Commit `feat: painel administrativo e moderação`.

### Task 14: Fluxo completo, publicação e verificação

**Files:**
- Create: `testes/e2e/fluxo-mvp.spec.ts`
- Modify: `README.md` (como rodar, variáveis, seed, testes, publicação)

- [ ] **Step 1: Teste do critério de conclusão** — `fluxo-mvp.spec.ts`, um único cenário, em `celular` e `desktop`: (1) cadastrar conta; (2) abrir `/mapa` e tocar no marcador da Pedra do Baú; (3) abrir a área e ver a lista de vias; (4) abrir uma via e ver grau, costuras, proteção e crux; (5) voltar à área e esperar o visualizador em `data-estado="pronto"`; (6) favoritar a via; (7) registrar ascensão; (8) enviar nova via; (9) como admin, aprovar; (10) como anônimo, encontrar a nova via na busca; (11) recarregar Minhas escaladas e ver favorito e ascensão.
- [ ] **Step 2:** `npm run test:e2e -- fluxo-mvp` → PASSA. Corrigir o que falhar na tarefa dona do código.
- [ ] **Step 3:** Rodar tudo: `npm run lint && npm test && npm run test:e2e && npm run build` → tudo verde.
- [ ] **Step 4:** Revisão visual em 390 px e 1280 px de todas as telas da spec, seção 5, com capturas de tela; verificar contraste AA e áreas de toque.
- [ ] **Step 5:** Guiar o Bernardo na criação da conta Vercel, importar o repositório `peakfinder`, definir `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (a `service_role` não vai para a Vercel) e configurar no Supabase a Site URL e a Redirect URL de produção.
- [ ] **Step 6:** `PLAYWRIGHT_BASE_URL=<url de produção> npm run test:e2e -- fluxo-mvp` → PASSA.
- [ ] **Step 7:** Pedir ao Bernardo que crie a conta com `ADMIN_EMAIL` no site, rodar `npm run seed` para promovê-la a admin e conferir o acesso a `/admin`.
- [ ] **Step 8:** `limparDadosTeste()` na base; clonar o repositório na pasta PeakFinder do Bernardo; commit `docs: README e instruções de operação`.
