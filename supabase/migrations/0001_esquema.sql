-- PeakFinder: esquema inicial (spec seção 4)
create extension if not exists postgis with schema extensions;
create extension if not exists unaccent with schema extensions;

create type public.situacao as enum ('pendente', 'aprovado', 'rejeitado');
create type public.origem as enum ('comunidade', 'verificado', 'demonstrativo');
create type public.modalidade as enum ('esportiva', 'tradicional', 'boulder', 'mista');
create type public.papel as enum ('usuario', 'admin');
create type public.estilo_ascensao as enum ('a_vista', 'flash', 'encadenada', 'trabalhada', 'top_rope');
create type public.tipo_reporte as enum ('erro', 'restricao', 'interdicao');
create type public.situacao_reporte as enum ('aberto', 'confirmado', 'descartado', 'resolvido');

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 80),
  nome_usuario text not null unique check (nome_usuario ~ '^[a-z0-9_]{3,30}$'),
  bio text check (char_length(bio) <= 300),
  foto_caminho text,
  papel public.papel not null default 'usuario',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.areas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 3 and 120),
  slug text not null unique,
  descricao text,
  estado char(2) not null,
  municipio text not null,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  localizacao extensions.geography(Point, 4326)
    generated always as (extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography) stored,
  tipo_rocha text,
  condicoes_acesso text,
  melhor_epoca text,
  destaque boolean not null default false,
  capa_caminho text,
  situacao public.situacao not null default 'pendente',
  origem public.origem not null default 'comunidade',
  criado_por uuid references public.perfis (id) on delete set null default auth.uid(),
  moderado_por uuid references public.perfis (id) on delete set null,
  moderado_em timestamptz,
  motivo_rejeicao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.setores (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.areas (id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 120),
  slug text not null,
  descricao text,
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  localizacao extensions.geography(Point, 4326)
    generated always as (
      case when lat is null or lng is null then null
      else extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography end
    ) stored,
  orientacao text,
  tempo_aproximacao_min integer check (tempo_aproximacao_min between 0 and 600),
  situacao public.situacao not null default 'pendente',
  origem public.origem not null default 'comunidade',
  criado_por uuid references public.perfis (id) on delete set null default auth.uid(),
  moderado_por uuid references public.perfis (id) on delete set null,
  moderado_em timestamptz,
  motivo_rejeicao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (area_id, slug),
  check ((lat is null) = (lng is null))
);

create table public.vias (
  id uuid primary key default gen_random_uuid(),
  setor_id uuid not null references public.setores (id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 120),
  slug text not null,
  modalidade public.modalidade not null,
  grau text not null,
  grau_ordem integer not null check (grau_ordem between 1 and 30),
  altura_m numeric check (altura_m between 1 and 2000),
  extensao_m numeric check (extensao_m between 1 and 2000),
  costuras integer check (costuras between 0 and 100),
  protecao text,
  crux text,
  descricao text,
  conquistadores text,
  ano_conquista integer check (ano_conquista between 1800 and 2100),
  situacao public.situacao not null default 'pendente',
  origem public.origem not null default 'comunidade',
  criado_por uuid references public.perfis (id) on delete set null default auth.uid(),
  moderado_por uuid references public.perfis (id) on delete set null,
  moderado_em timestamptz,
  motivo_rejeicao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (setor_id, slug)
);

create table public.trilhas_acesso (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.areas (id) on delete cascade,
  setor_id uuid references public.setores (id) on delete set null,
  nome text not null,
  tracado extensions.geography(LineString, 4326) not null,
  distancia_m numeric,
  desnivel_m numeric,
  descricao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.fotos (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references public.areas (id) on delete cascade,
  setor_id uuid references public.setores (id) on delete cascade,
  via_id uuid references public.vias (id) on delete cascade,
  caminho text not null,
  legenda text check (char_length(legenda) <= 300),
  tipo text not null default 'foto' check (tipo in ('foto', 'croqui')),
  enviado_por uuid references public.perfis (id) on delete set null default auth.uid(),
  oculta boolean not null default false,
  criado_em timestamptz not null default now(),
  check (num_nonnulls(area_id, setor_id, via_id) = 1)
);

create table public.modelos_3d (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references public.areas (id) on delete cascade,
  setor_id uuid references public.setores (id) on delete cascade,
  nome text not null,
  caminho text not null,
  demonstrativo boolean not null default false,
  descricao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (num_nonnulls(area_id, setor_id) = 1)
);

create table public.favoritos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis (id) on delete cascade default auth.uid(),
  via_id uuid not null references public.vias (id) on delete cascade,
  criado_em timestamptz not null default now(),
  unique (usuario_id, via_id)
);

create table public.ascensoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis (id) on delete cascade default auth.uid(),
  via_id uuid not null references public.vias (id) on delete cascade,
  data date not null,
  estilo public.estilo_ascensao not null,
  notas text check (char_length(notas) <= 1000),
  grau_sugerido text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.comentarios (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis (id) on delete cascade default auth.uid(),
  via_id uuid references public.vias (id) on delete cascade,
  area_id uuid references public.areas (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 2000),
  oculto boolean not null default false,
  ocultado_por uuid references public.perfis (id) on delete set null,
  criado_em timestamptz not null default now(),
  check (num_nonnulls(via_id, area_id) = 1)
);

create table public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis (id) on delete cascade default auth.uid(),
  via_id uuid not null references public.vias (id) on delete cascade,
  nota smallint not null check (nota between 1 and 5),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (usuario_id, via_id)
);

create table public.reportes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis (id) on delete cascade default auth.uid(),
  area_id uuid references public.areas (id) on delete cascade,
  setor_id uuid references public.setores (id) on delete cascade,
  via_id uuid references public.vias (id) on delete cascade,
  tipo public.tipo_reporte not null,
  descricao text not null check (char_length(descricao) between 10 and 2000),
  situacao public.situacao_reporte not null default 'aberto',
  resolvido_por uuid references public.perfis (id) on delete set null,
  nota_admin text,
  vigente_ate date,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (num_nonnulls(area_id, setor_id, via_id) = 1)
);

create index areas_localizacao_idx on public.areas using gist (localizacao);
create index setores_localizacao_idx on public.setores using gist (localizacao);
create index trilhas_tracado_idx on public.trilhas_acesso using gist (tracado);
create index areas_situacao_idx on public.areas (situacao);
create index setores_area_idx on public.setores (area_id);
create index vias_setor_idx on public.vias (setor_id);
create index vias_situacao_idx on public.vias (situacao);
create index fotos_area_idx on public.fotos (area_id);
create index fotos_setor_idx on public.fotos (setor_id);
create index fotos_via_idx on public.fotos (via_id);
create index ascensoes_usuario_idx on public.ascensoes (usuario_id);
create index ascensoes_via_idx on public.ascensoes (via_id);
create index favoritos_via_idx on public.favoritos (via_id);
create index comentarios_via_idx on public.comentarios (via_id);
create index comentarios_area_idx on public.comentarios (area_id);
create index reportes_area_idx on public.reportes (area_id);

-- RLS ligado desde já: sem políticas, só service_role acessa. As políticas vêm em 0003.
do $$
declare t text;
begin
  foreach t in array array['perfis','areas','setores','vias','trilhas_acesso','fotos','modelos_3d',
                           'favoritos','ascensoes','comentarios','avaliacoes','reportes'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
