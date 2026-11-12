# PeakFinder MVP — Especificação de Design

Data: 2026-11-12
Situação: aguardando revisão do Bernardo

## 1. Objetivo

O PeakFinder permite que o escalador conheça a parede antes de chegar até ela. O MVP é um web app responsivo (mobile-first), em português do Brasil, focado em áreas de escalada brasileiras, no qual o usuário descobre locais, explora setores, consulta vias, vê modelos 3D e registra e compartilha sua experiência.

### Critério de conclusão

O MVP está pronto quando, no site publicado, um usuário consegue em sequência:

1. criar uma conta e entrar;
2. encontrar uma área no mapa;
3. abrir a área e consultar suas vias;
4. ver as informações técnicas de uma via;
5. abrir e manipular um modelo 3D demonstrativo;
6. favoritar uma via;
7. registrar uma ascensão;
8. enviar o cadastro de uma nova via ou área;

e um administrador consegue aprovar esse cadastro, que passa então a aparecer publicamente. Todos os dados persistem no banco.

### Fora do escopo

App nativo iOS/Android, modo offline, processamento de voos de drone ou fotogrametria, desenho de vias sobre o modelo 3D, seguir usuários e feed social, notificações (e-mail ou push), outros idiomas, pagamentos, login social (Google, Apple) e edição colaborativa de registros já aprovados por não administradores.

## 2. Decisões tomadas

| Tema | Decisão |
|---|---|
| Forma do produto | Web app responsivo, sem app nativo |
| Arquitetura | Projeto único Next.js (App Router) acessando o Supabase diretamente, com regras de acesso no banco (RLS) |
| Hospedagem | Vercel (plano gratuito) + Supabase na nuvem (plano gratuito) |
| Login | E-mail e senha via Supabase Auth |
| Moderação | Cadastros de áreas, setores e vias só ficam públicos após aprovação de um administrador |
| Mapa base | MapLibre GL JS com tiles OpenFreeMap (sem chave de API) |
| Graduação | Sistema brasileiro para vias; escala V para boulder |
| Dados iniciais | Seed com áreas brasileiras conhecidas, sinalizado como "Dados demonstrativos" |
| Idioma | Português (Brasil) na interface; código e nomes de tabela em português sem acentos |

## 3. Arquitetura

### Tecnologias

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Supabase: Auth, PostgreSQL com PostGIS, Storage
- `@supabase/ssr` para sessão em cookies
- MapLibre GL JS (mapa) e Three.js com `GLTFLoader` e `OrbitControls` (3D)
- Zod para validar formulários
- Vitest (unitários) e Playwright (ponta a ponta)

### Fluxo de dados

- Leitura: componentes de servidor consultam o Supabase com a sessão do usuário; o RLS decide o que cada um vê.
- Escrita: Server Actions validam a entrada com Zod e gravam no Supabase com a sessão do usuário. Nenhuma escrita usa a chave de serviço, exceto o script de seed, que roda fora do site.
- Mapa: um endpoint devolve áreas, setores e trilhas aprovados em GeoJSON por meio de funções SQL (PostGIS). Os filtros de grau e modalidade são aplicados no cliente sobre esse GeoJSON, pois o volume do MVP é pequeno.
- Arquivos: fotos, croquis e modelos 3D são enviados do navegador direto ao Supabase Storage; o banco guarda apenas o caminho.
- Mapa e visualizador 3D são componentes de cliente carregados sob demanda, para não pesar as demais páginas.

### Estrutura de pastas

```
src/
  app/
    (publico)/            Explorar, mapa, áreas, setores, vias
    (conta)/              entrar, cadastrar, perfil, minhas-escaladas
    contribuir/           formulários de nova área, setor e via
    admin/                painel administrativo
    api/mapa/             GeoJSON para o mapa
  modulos/
    areas/  vias/  mapa/  visualizador3d/  comunidade/
    escaladas/  perfil/  admin/  moderacao/
      (cada módulo: componentes, consultas, acoes, esquemas, tipos)
  lib/
    supabase/             clientes de servidor e de navegador
    graus/                escalas e ordenação de graus
  componentes/            componentes de interface compartilhados
supabase/
  migrations/             esquema, RLS, funções
  seed/                   dados e modelos demonstrativos
testes/
  e2e/                    Playwright
```

Cada módulo expõe consultas e ações próprias e não importa internals de outro módulo; a comunicação entre eles passa por essas funções.

## 4. Modelo de dados

Todas as tabelas têm `id` (uuid), `criado_em` e, quando editáveis, `atualizado_em`.

### Tipos enumerados

- `situacao`: `pendente`, `aprovado`, `rejeitado`
- `origem`: `comunidade`, `verificado`, `demonstrativo`
- `modalidade`: `esportiva`, `tradicional`, `boulder`, `mista`
- `papel`: `usuario`, `admin`
- `estilo_ascensao`: `a_vista`, `flash`, `encadenada`, `trabalhada`, `top_rope`
- `tipo_reporte`: `erro`, `restricao`, `interdicao`
- `situacao_reporte`: `aberto`, `confirmado`, `descartado`, `resolvido`

### Tabelas

**perfis** — um por usuário do Auth, criado por gatilho no cadastro.
`id` (igual ao do Auth), `nome`, `nome_usuario` (único), `bio`, `foto_caminho`, `papel` (padrão `usuario`).

**areas**
`nome`, `slug` (único), `descricao`, `estado` (UF), `municipio`, `localizacao` (geography Point), `tipo_rocha`, `condicoes_acesso`, `melhor_epoca`, `destaque` (boolean), `capa_caminho`, `situacao`, `origem`, `criado_por`, `moderado_por`, `moderado_em`, `motivo_rejeicao`.

**setores**
`area_id`, `nome`, `slug`, `descricao`, `localizacao` (Point), `orientacao`, `tempo_aproximacao_min`, `situacao`, `origem`, `criado_por`, campos de moderação.

**vias**
`setor_id`, `nome`, `slug`, `modalidade`, `grau` (texto exibido), `grau_ordem` (inteiro para ordenar e filtrar), `altura_m`, `extensao_m`, `costuras`, `protecao`, `crux`, `descricao`, `conquistadores`, `ano_conquista`, `situacao`, `origem`, `criado_por`, campos de moderação.

**trilhas_acesso**
`area_id`, `setor_id` (opcional), `nome`, `tracado` (geography LineString), `distancia_m`, `desnivel_m`, `descricao`.

**fotos**
`area_id` | `setor_id` | `via_id` (exatamente um preenchido), `caminho`, `legenda`, `tipo` (`foto` ou `croqui`), `enviado_por`, `oculta` (boolean, para moderação).

**modelos_3d**
`area_id` | `setor_id` (exatamente um), `nome`, `caminho` (GLB/GLTF no Storage), `demonstrativo` (boolean), `descricao`.

**favoritos** — `usuario_id`, `via_id`; único por par.

**ascensoes** — `usuario_id`, `via_id`, `data`, `estilo`, `notas`, `grau_sugerido` (opcional).

**comentarios** — `usuario_id`, `via_id` | `area_id` (exatamente um), `texto`, `oculto` (boolean), `ocultado_por`.

**avaliacoes** — `usuario_id`, `via_id`, `nota` (1 a 5); única por par. Uma view expõe média e contagem por via.

**reportes** — `usuario_id`, `area_id` | `setor_id` | `via_id`, `tipo`, `descricao`, `situacao`, `resolvido_por`, `nota_admin`, `vigente_ate` (opcional).

### Graus

`lib/graus` define as escalas e converte grau em `grau_ordem`:

- Vias (brasileiro): I, Isup, II, IIsup, III, IIIsup, IV, IVsup, V, Vsup, VI, VIsup, 7a, 7b, 7c, 8a, 8b, 8c, 9a, 9b, 9c, 10a, 10b, 10c, 11a, 11b, 11c, 12a, 12b, 12c.
- Boulder: V0 a V16.

Os formulários só aceitam graus dessas listas. O filtro de dificuldade do mapa e das listagens usa faixas sobre `grau_ordem`, separadas por modalidade.

### Regras de acesso (RLS)

| Tabela | Leitura | Escrita |
|---|---|---|
| perfis | todos | o próprio usuário (exceto `papel`); admin altera `papel` |
| areas, setores, vias | aprovados: todos; pendentes e rejeitados: autor e admin | usuário logado insere sempre como `pendente` + `comunidade`; autor edita enquanto pendente; admin edita tudo |
| trilhas_acesso, modelos_3d | todos (de áreas aprovadas) | admin |
| fotos | não ocultas: todos | usuário logado insere; autor remove a sua; admin oculta ou remove |
| favoritos, ascensoes | favoritos: o dono; ascensões: todos | o dono |
| comentarios | não ocultos: todos | usuário logado insere; autor remove o seu; admin oculta |
| avaliacoes | todos | o dono |
| reportes | autor e admin; interdições e restrições `confirmado`: todos | usuário logado insere; admin altera |

Um gatilho impede que não administradores definam `situacao`, `origem` ou `papel`, mesmo chamando a API diretamente.

### Storage

Buckets `fotos` (leitura pública, imagens até 5 MB), `avatares` (leitura pública, até 2 MB) e `modelos` (leitura pública, GLB/GLTF até 50 MB, escrita só por admin). O caminho inclui o id do usuário, e a política só permite gravar na própria pasta.

## 5. Telas e módulos

**Explorar (`/`)** — busca por nome de área, via ou município; áreas em destaque; vias populares (mais ascensões e favoritos); atalho para o mapa.

**Mapa (`/mapa`)** — marcadores de áreas com agrupamento; ao aproximar, setores e trilhas de acesso; filtros por faixa de grau e modalidade; ao tocar num marcador, cartão com resumo e link para a página. No celular, mapa em tela cheia com painel inferior deslizante.

**Área (`/areas/[slug]`)** — capa, localização com minimapa, descrição, tipo de rocha, melhor época, condições de acesso, alertas de restrição ou interdição vigentes no topo, lista de setores, vias com filtro e ordenação por grau, fotos, modelo 3D quando houver, comentários, botão "Reportar".

**Setor (`/areas/[slug]/[setor]`)** — descrição, orientação, tempo de aproximação, lista de vias, croquis, modelo 3D quando houver.

**Via (`/vias/[id]`)** — ficha técnica (grau, modalidade, altura, extensão, costuras, proteção, crux, conquistadores), descrição, croquis e fotos, avaliação média, comentários, botões Favoritar, Registrar ascensão, Avaliar e Reportar. Selo de origem sempre visível.

**Visualizador 3D** — componente usado nas páginas de área e setor; carrega GLB/GLTF; rotacionar, aproximar e deslocar por mouse e toque; botão de reenquadrar; indicador de carregamento; mensagem de erro com opção de tentar de novo; aviso "Modelo demonstrativo" quando aplicável. Os modelos demonstrativos são paredes rochosas geradas proceduralmente por um script do projeto e gravadas como GLB.

**Contribuir (`/contribuir`)** — formulários de nova área (com escolha do ponto no mapa), novo setor e nova via; envio de fotos e croquis. Após o envio, o usuário vê o registro como "Em análise" em "Minhas contribuições", com o motivo caso seja rejeitado.

**Minhas escaladas (`/minhas-escaladas`)** — histórico de ascensões com filtros, vias favoritas, resumo simples (total de ascensões, grau máximo por modalidade) e minhas contribuições.

**Perfil (`/perfil` e `/u/[nome_usuario]`)** — cadastro, login, recuperação de senha, foto, biografia e atividade recente pública (ascensões e contribuições aprovadas).

**Admin (`/admin`)** — acessível apenas a `papel = admin`:
- fila de áreas, setores e vias pendentes, com aprovar, rejeitar com motivo, editar antes de aprovar;
- alterar a origem entre Comunidade e Verificado;
- comentários e fotos: ocultar e restaurar;
- reportes: confirmar, descartar, resolver; interdições e restrições confirmadas viram alerta na área até a data de vigência ou a resolução;
- usuários: listar, promover ou rebaixar admin;
- cadastrar trilhas (envio de GeoJSON ou GPX) e modelos 3D.

### Selos de origem

- **Verificado** — conferido por um administrador.
- **Comunidade** — enviado por usuário e aprovado, sem conferência técnica.
- **Dados demonstrativos** — conteúdo do seed, usado para demonstrar o produto.

## 6. Identidade visual

Paleta: grafite (texto e fundos escuros), pedra (cinzas quentes), areia (fundos claros), verde-mata (elementos de natureza e confirmações) e terracota como cor de destaque para ações principais. Tipografia sem serifa, de boa leitura em telas pequenas. Fotografias e mapa ocupam a maior parte da tela; cartões com cantos suaves e pouca ornamentação. Navegação inferior no celular (Explorar, Mapa, Contribuir, Escaladas, Perfil) e barra superior no desktop. Contraste mínimo AA e áreas de toque de pelo menos 44 px.

## 7. Dados iniciais (seed)

De 6 a 8 áreas brasileiras conhecidas, cada uma com 1 a 3 setores e 4 a 8 vias, mais trilhas de acesso ilustrativas e 2 a 3 modelos 3D demonstrativos. Grau, proteção e número de costuras são informação de segurança; por isso todo o conteúdo do seed recebe `origem = demonstrativo`, é exibido com o selo "Dados demonstrativos" e um aviso de que não deve ser usado para planejar uma escalada real. Nenhum conteúdo do seed recebe o selo "Verificado". O seed pode ser reexecutado sem duplicar registros.

## 8. Erros e casos-limite

- Formulários mostram o erro ao lado do campo; falhas de servidor mostram mensagem clara e preservam o que foi digitado.
- Ações que exigem login (favoritar, registrar ascensão, comentar, contribuir, reportar) levam à tela de entrada e retornam à página de origem.
- Páginas de registros pendentes ou rejeitados respondem "não encontrado" para quem não é autor nem admin.
- Se o WebGL não estiver disponível ou o modelo falhar, a página mostra as fotos e um aviso, sem quebrar.
- Se os tiles do mapa não carregarem, a lista de áreas permanece acessível.
- Uploads validam tipo e tamanho antes do envio.

## 9. Testes

- **Unitários (Vitest):** ordenação e validação de graus, filtros, esquemas Zod.
- **Banco:** testes das políticas RLS para cada papel (anônimo, usuário, autor, admin), incluindo a tentativa de se autopromover ou autoaprovar.
- **Ponta a ponta (Playwright):** o critério de conclusão da seção 1, do cadastro à aprovação pelo admin, em viewport de celular e de desktop.
- **Verificação final:** o mesmo roteiro executado manualmente no site publicado.

## 10. Ordem de construção

1. Fundação: projeto, esquema do banco, RLS, login, layout e identidade visual.
2. Áreas, setores e vias (leitura) + Explorar + seed.
3. Mapa com filtros e trilhas.
4. Visualizador 3D e modelos demonstrativos.
5. Favoritos, ascensões, Minhas escaladas e Perfil.
6. Comunidade: contribuições, comentários, avaliações, fotos.
7. Admin: aprovação, moderação, reportes, usuários.
8. Testes de ponta a ponta e publicação.

## 11. Pré-requisitos do Bernardo

- Conta gratuita no Supabase e criação do projeto "PeakFinder" (região São Paulo).
- Conta gratuita na Vercel.
- E-mail que será o primeiro administrador.
- Conta no GitHub, usada pela Vercel para publicar o código.
