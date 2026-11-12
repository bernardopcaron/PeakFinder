-- PeakFinder: funções, gatilhos e views

create or replace function public.gerar_slug(texto text)
returns text
language sql
stable
set search_path = public, extensions
as $$
  select trim(both '-' from regexp_replace(lower(extensions.unaccent(coalesce(texto, ''))), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.definir_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['perfis','areas','setores','vias','trilhas_acesso','modelos_3d','ascensoes','avaliacoes','reportes'] loop
    execute format('create trigger definir_atualizado_em before update on public.%I
                    for each row execute function public.definir_atualizado_em()', t);
  end loop;
end $$;

-- Slug a partir do nome, com sufixo -2, -3... dentro do escopo de unicidade.
create or replace function public.definir_slug()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  base text := public.gerar_slug(new.nome);
  candidato text;
  n integer := 1;
  existe boolean;
begin
  if base = '' then base := 'sem-nome'; end if;
  candidato := base;
  loop
    if tg_table_name = 'areas' then
      select exists (select 1 from public.areas where slug = candidato) into existe;
    elsif tg_table_name = 'setores' then
      select exists (select 1 from public.setores where area_id = new.area_id and slug = candidato) into existe;
    else
      select exists (select 1 from public.vias where setor_id = new.setor_id and slug = candidato) into existe;
    end if;
    exit when not existe;
    n := n + 1;
    candidato := base || '-' || n;
  end loop;
  new.slug := candidato;
  return new;
end $$;

create trigger definir_slug_areas before insert on public.areas
  for each row execute function public.definir_slug();
create trigger definir_slug_setores before insert on public.setores
  for each row execute function public.definir_slug();
create trigger definir_slug_vias before insert on public.vias
  for each row execute function public.definir_slug();

-- Perfil criado automaticamente no cadastro.
create or replace function public.criar_perfil_ao_cadastrar()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  base text;
  candidato text;
  n integer := 1;
  nome_exibido text;
begin
  base := regexp_replace(lower(extensions.unaccent(split_part(coalesce(new.email, ''), '@', 1))), '[^a-z0-9_]+', '_', 'g');
  base := trim(both '_' from base);
  if char_length(base) < 3 then base := 'escalador'; end if;
  base := left(base, 24);
  candidato := base;
  while exists (select 1 from public.perfis where nome_usuario = candidato) loop
    n := n + 1;
    candidato := base || '_' || n;
  end loop;
  nome_exibido := left(nullif(trim(coalesce(new.raw_user_meta_data ->> 'nome', '')), ''), 80);
  insert into public.perfis (id, nome, nome_usuario)
  values (new.id, coalesce(nome_exibido, candidato), candidato);
  return new;
end $$;

create trigger criar_perfil_ao_cadastrar after insert on auth.users
  for each row execute function public.criar_perfil_ao_cadastrar();

create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.perfis where id = auth.uid() and papel = 'admin');
$$;

-- Favoritos são privados; só a contagem é pública.
create or replace function public.contar_favoritos(via uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.favoritos where via_id = via;
$$;

create or replace view public.vias_resumo
with (security_invoker = true)
as
select
  v.*,
  s.nome as setor_nome,
  s.slug as setor_slug,
  a.id as area_id,
  a.nome as area_nome,
  a.slug as area_slug,
  a.municipio as area_municipio,
  a.estado as area_estado,
  (select round(avg(av.nota)::numeric, 1) from public.avaliacoes av where av.via_id = v.id) as nota_media,
  (select count(*)::integer from public.avaliacoes av where av.via_id = v.id) as total_avaliacoes,
  (select count(*)::integer from public.ascensoes asc_ where asc_.via_id = v.id) as total_ascensoes,
  public.contar_favoritos(v.id) as total_favoritos
from public.vias v
join public.setores s on s.id = v.setor_id
join public.areas a on a.id = s.area_id;

create or replace function public.mapa_geojson()
returns jsonb
language sql
stable
set search_path = public, extensions
as $$
  with vias_ok as (
    select s.area_id, v.modalidade, v.grau_ordem
    from public.vias v
    join public.setores s on s.id = v.setor_id
    where v.situacao = 'aprovado' and s.situacao = 'aprovado'
  ),
  f_areas as (
    select jsonb_build_object(
      'type', 'Feature',
      'geometry', jsonb_build_object('type', 'Point', 'coordinates', jsonb_build_array(a.lng, a.lat)),
      'properties', jsonb_build_object(
        'tipo', 'area', 'id', a.id, 'slug', a.slug, 'nome', a.nome,
        'municipio', a.municipio, 'estado', a.estado, 'origem', a.origem,
        'total_vias', (select count(*) from vias_ok vo where vo.area_id = a.id),
        'modalidades', coalesce((select jsonb_agg(distinct vo.modalidade) from vias_ok vo where vo.area_id = a.id), '[]'::jsonb),
        'ordens_grau', coalesce((select jsonb_agg(distinct vo.grau_ordem) from vias_ok vo where vo.area_id = a.id), '[]'::jsonb),
        'vias', coalesce((select jsonb_agg(jsonb_build_object('m', vo.modalidade, 'o', vo.grau_ordem)
                                          order by vo.grau_ordem) from vias_ok vo where vo.area_id = a.id), '[]'::jsonb)
      )
    ) as f
    from public.areas a
    where a.situacao = 'aprovado'
  ),
  f_setores as (
    select jsonb_build_object(
      'type', 'Feature',
      'geometry', jsonb_build_object('type', 'Point', 'coordinates', jsonb_build_array(s.lng, s.lat)),
      'properties', jsonb_build_object('tipo', 'setor', 'id', s.id, 'slug', s.slug, 'nome', s.nome,
                                       'area_slug', a.slug, 'area_nome', a.nome)
    ) as f
    from public.setores s
    join public.areas a on a.id = s.area_id
    where s.situacao = 'aprovado' and a.situacao = 'aprovado' and s.lat is not null
  ),
  f_trilhas as (
    select jsonb_build_object(
      'type', 'Feature',
      'geometry', extensions.st_asgeojson(t.tracado)::jsonb,
      'properties', jsonb_build_object('tipo', 'trilha', 'id', t.id, 'nome', t.nome,
                                       'area_slug', a.slug, 'distancia_m', t.distancia_m)
    ) as f
    from public.trilhas_acesso t
    join public.areas a on a.id = t.area_id
    where a.situacao = 'aprovado'
  )
  select jsonb_build_object(
    'type', 'FeatureCollection',
    'features', coalesce((select jsonb_agg(f) from (
      select f from f_areas union all select f from f_setores union all select f from f_trilhas
    ) todas), '[]'::jsonb)
  );
$$;

create or replace function public.buscar(termo text)
returns table (tipo text, id uuid, titulo text, subtitulo text, caminho text)
language sql
stable
set search_path = public, extensions
as $$
  with p as (
    select '%' || replace(replace(replace(lower(extensions.unaccent(trim(coalesce(termo, '')))), '\', '\\'), '%', '\%'), '_', '\_') || '%' as padrao,
           char_length(trim(coalesce(termo, ''))) as tamanho
  )
  select * from (
    select 'area'::text, a.id, a.nome, a.municipio || ' · ' || a.estado, '/areas/' || a.slug
    from public.areas a, p
    where p.tamanho >= 2 and a.situacao = 'aprovado'
      and (lower(extensions.unaccent(a.nome)) like p.padrao or lower(extensions.unaccent(a.municipio)) like p.padrao)
    union all
    select 'via'::text, v.id, v.nome, v.grau || ' · ' || v.area_nome, '/vias/' || v.id
    from public.vias_resumo v
    join public.setores s on s.id = v.setor_id
    join public.areas a on a.id = v.area_id, p
    where p.tamanho >= 2 and v.situacao = 'aprovado' and s.situacao = 'aprovado' and a.situacao = 'aprovado'
      and lower(extensions.unaccent(v.nome)) like p.padrao
  ) r (tipo, id, titulo, subtitulo, caminho)
  order by tipo, titulo
  limit 20;
$$;

grant select on public.vias_resumo to anon, authenticated, service_role;
grant execute on function public.gerar_slug(text), public.eh_admin(), public.contar_favoritos(uuid),
  public.mapa_geojson(), public.buscar(text) to anon, authenticated, service_role;
revoke execute on function public.definir_slug(), public.criar_perfil_ao_cadastrar(), public.definir_atualizado_em() from public, anon, authenticated;
