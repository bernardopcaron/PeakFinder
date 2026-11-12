-- PeakFinder: regras de acesso (spec seção 4, "Regras de acesso (RLS)")

-- Chamadas vindas do site usam os papéis anon/authenticated. Seed, migrações e
-- administração do banco usam outros papéis e ficam isentos da proteção.
create or replace function public.chamada_de_usuario()
returns boolean
language sql
stable
as $$ select current_user in ('anon', 'authenticated'); $$;

create or replace function public.proteger_campos_moderacao()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not public.chamada_de_usuario() or public.eh_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.situacao := 'pendente';
    new.origem := 'comunidade';
    new.criado_por := auth.uid();
    new.moderado_por := null;
    new.moderado_em := null;
    new.motivo_rejeicao := null;
    if tg_table_name = 'areas' then
      new := jsonb_populate_record(new, jsonb_build_object('destaque', false));
    end if;
    return new;
  end if;
  if new.situacao is distinct from old.situacao
     or new.origem is distinct from old.origem
     or new.criado_por is distinct from old.criado_por
     or new.moderado_por is distinct from old.moderado_por
     or new.moderado_em is distinct from old.moderado_em
     or new.motivo_rejeicao is distinct from old.motivo_rejeicao
     or new.slug is distinct from old.slug
     or (tg_table_name = 'areas' and (to_jsonb(new) -> 'destaque') is distinct from (to_jsonb(old) -> 'destaque')) then
    raise exception 'Somente administradores podem alterar campos de moderação.' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger proteger_campos_moderacao before insert or update on public.areas
  for each row execute function public.proteger_campos_moderacao();
create trigger proteger_campos_moderacao before insert or update on public.setores
  for each row execute function public.proteger_campos_moderacao();
create trigger proteger_campos_moderacao before insert or update on public.vias
  for each row execute function public.proteger_campos_moderacao();

create or replace function public.proteger_papel()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.chamada_de_usuario() and not public.eh_admin() and new.papel is distinct from old.papel then
    raise exception 'Somente administradores podem alterar o papel de um usuário.' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger proteger_papel before update on public.perfis
  for each row execute function public.proteger_papel();

create or replace function public.proteger_reporte()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.chamada_de_usuario() and not public.eh_admin() then
    new.usuario_id := auth.uid();
    new.situacao := 'aberto';
    new.resolvido_por := null;
    new.nota_admin := null;
    new.vigente_ate := null;
  end if;
  return new;
end $$;

create trigger proteger_reporte before insert on public.reportes
  for each row execute function public.proteger_reporte();

-- perfis
create policy perfis_leitura on public.perfis for select using (true);
create policy perfis_edicao on public.perfis for update to authenticated
  using (id = auth.uid() or public.eh_admin())
  with check (id = auth.uid() or public.eh_admin());

-- areas
create policy areas_leitura on public.areas for select
  using (situacao = 'aprovado' or criado_por = auth.uid() or public.eh_admin());
create policy areas_insercao on public.areas for insert to authenticated with check (true);
create policy areas_edicao on public.areas for update to authenticated
  using ((criado_por = auth.uid() and situacao = 'pendente') or public.eh_admin())
  with check ((criado_por = auth.uid() and situacao = 'pendente') or public.eh_admin());
create policy areas_remocao on public.areas for delete to authenticated
  using ((criado_por = auth.uid() and situacao = 'pendente') or public.eh_admin());

-- setores: só em área aprovada ou do próprio autor (a subconsulta respeita o RLS de areas)
create policy setores_leitura on public.setores for select
  using (situacao = 'aprovado' or criado_por = auth.uid() or public.eh_admin());
create policy setores_insercao on public.setores for insert to authenticated
  with check (exists (select 1 from public.areas a where a.id = area_id and a.situacao <> 'rejeitado'));
create policy setores_edicao on public.setores for update to authenticated
  using ((criado_por = auth.uid() and situacao = 'pendente') or public.eh_admin())
  with check ((criado_por = auth.uid() and situacao = 'pendente') or public.eh_admin());
create policy setores_remocao on public.setores for delete to authenticated
  using ((criado_por = auth.uid() and situacao = 'pendente') or public.eh_admin());

-- vias
create policy vias_leitura on public.vias for select
  using (situacao = 'aprovado' or criado_por = auth.uid() or public.eh_admin());
create policy vias_insercao on public.vias for insert to authenticated
  with check (exists (select 1 from public.setores s where s.id = setor_id and s.situacao <> 'rejeitado'));
create policy vias_edicao on public.vias for update to authenticated
  using ((criado_por = auth.uid() and situacao = 'pendente') or public.eh_admin())
  with check ((criado_por = auth.uid() and situacao = 'pendente') or public.eh_admin());
create policy vias_remocao on public.vias for delete to authenticated
  using ((criado_por = auth.uid() and situacao = 'pendente') or public.eh_admin());

-- trilhas e modelos 3D: leitura de áreas visíveis; escrita só por admin
create policy trilhas_leitura on public.trilhas_acesso for select
  using (exists (select 1 from public.areas a where a.id = area_id));
create policy trilhas_admin on public.trilhas_acesso for all to authenticated
  using (public.eh_admin()) with check (public.eh_admin());

create policy modelos_leitura on public.modelos_3d for select
  using (
    (area_id is not null and exists (select 1 from public.areas a where a.id = area_id))
    or (setor_id is not null and exists (select 1 from public.setores s where s.id = setor_id))
  );
create policy modelos_admin on public.modelos_3d for all to authenticated
  using (public.eh_admin()) with check (public.eh_admin());

-- fotos
create policy fotos_leitura on public.fotos for select
  using (not oculta or enviado_por = auth.uid() or public.eh_admin());
create policy fotos_insercao on public.fotos for insert to authenticated
  with check (enviado_por = auth.uid() and not oculta);
create policy fotos_admin on public.fotos for update to authenticated
  using (public.eh_admin()) with check (public.eh_admin());
create policy fotos_remocao on public.fotos for delete to authenticated
  using (enviado_por = auth.uid() or public.eh_admin());

-- favoritos (privados)
create policy favoritos_dono on public.favoritos for all to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

-- ascensões (públicas, escritas pelo dono)
create policy ascensoes_leitura on public.ascensoes for select using (true);
create policy ascensoes_insercao on public.ascensoes for insert to authenticated with check (usuario_id = auth.uid());
create policy ascensoes_edicao on public.ascensoes for update to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
create policy ascensoes_remocao on public.ascensoes for delete to authenticated using (usuario_id = auth.uid());

-- comentários
create policy comentarios_leitura on public.comentarios for select
  using (not oculto or usuario_id = auth.uid() or public.eh_admin());
create policy comentarios_insercao on public.comentarios for insert to authenticated
  with check (usuario_id = auth.uid() and not oculto and ocultado_por is null);
create policy comentarios_admin on public.comentarios for update to authenticated
  using (public.eh_admin()) with check (public.eh_admin());
create policy comentarios_remocao on public.comentarios for delete to authenticated
  using (usuario_id = auth.uid() or public.eh_admin());

-- avaliações
create policy avaliacoes_leitura on public.avaliacoes for select using (true);
create policy avaliacoes_insercao on public.avaliacoes for insert to authenticated with check (usuario_id = auth.uid());
create policy avaliacoes_edicao on public.avaliacoes for update to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
create policy avaliacoes_remocao on public.avaliacoes for delete to authenticated using (usuario_id = auth.uid());

-- reportes: autor e admin; restrições e interdições confirmadas são públicas
create policy reportes_leitura on public.reportes for select
  using (
    usuario_id = auth.uid()
    or public.eh_admin()
    or (tipo in ('restricao', 'interdicao') and situacao = 'confirmado')
  );
create policy reportes_insercao on public.reportes for insert to authenticated with check (true);
create policy reportes_admin on public.reportes for update to authenticated
  using (public.eh_admin()) with check (public.eh_admin());

-- anon só lê
revoke insert, update, delete on all tables in schema public from anon;
