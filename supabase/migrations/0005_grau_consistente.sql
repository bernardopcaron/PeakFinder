-- O grau precisa pertencer à escala da modalidade e a ordem é sempre calculada aqui,
-- para que nenhuma gravação (site, API ou seed) deixe os dois em desacordo.
create or replace function public.ordem_do_grau(grau text, modalidade public.modalidade)
returns integer
language sql
immutable
as $$
  select array_position(
    case when modalidade = 'boulder' then
      array['V0','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16']
    else
      array['I','Isup','II','IIsup','III','IIIsup','IV','IVsup','V','Vsup','VI','VIsup',
            '7a','7b','7c','8a','8b','8c','9a','9b','9c','10a','10b','10c','11a','11b','11c','12a','12b','12c']
    end,
    grau
  );
$$;

create or replace function public.validar_grau()
returns trigger
language plpgsql
set search_path = public
as $$
declare ordem integer := public.ordem_do_grau(new.grau, new.modalidade);
begin
  if ordem is null then
    raise exception 'Grau inválido para esta modalidade.' using errcode = '23514';
  end if;
  new.grau_ordem := ordem;
  return new;
end $$;

create trigger validar_grau before insert or update of grau, modalidade, grau_ordem on public.vias
  for each row execute function public.validar_grau();

grant execute on function public.ordem_do_grau(text, public.modalidade) to anon, authenticated, service_role;
