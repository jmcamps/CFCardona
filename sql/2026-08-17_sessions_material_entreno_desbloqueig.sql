begin;

create or replace function desbloquejar_material_entreno(
  p_sessio_id bigint,
  p_material_id bigint default null,
  p_actor text default 'Administració',
  p_motiu text default 'Retorn no registrat per l''equip'
)
returns text
language plpgsql
as $$
declare
  v_sessio material_sessio%rowtype;
  v_nota text;
  v_afectats integer := 0;
  v_files integer := 0;
  v_pendents boolean := false;
begin
  select * into v_sessio
  from material_sessio
  where id = p_sessio_id
  for update;

  if not found or v_sessio.estat = 'tancada' then
    raise exception 'Sessió no trobada o ja tancada';
  end if;

  v_nota := concat(
    '[Desbloqueig administratiu · ',
    coalesce(nullif(trim(p_actor), ''), 'Administració'),
    '] ',
    coalesce(nullif(trim(p_motiu), ''), 'Retorn no registrat per l''equip')
  );

  update material_sessio_kit_item
  set cantidad_retornada = cantidad_recollida,
      incidencia_retorn = concat_ws(E'\n', nullif(incidencia_retorn, ''), v_nota)
  where sessio_id = p_sessio_id
    and cantidad_retornada < cantidad_recollida
    and (p_material_id is null or material_id = p_material_id);
  get diagnostics v_files = row_count;
  v_afectats := v_afectats + v_files;

  update material_sessio_compartit
  set cantidad_retornada = cantidad_recollida,
      incidencia_retorn = concat_ws(E'\n', nullif(incidencia_retorn, ''), v_nota)
  where sessio_id = p_sessio_id
    and cantidad_retornada < cantidad_recollida
    and (p_material_id is null or material_id = p_material_id);
  get diagnostics v_files = row_count;
  v_afectats := v_afectats + v_files;

  if p_material_id is not null and v_afectats = 0 then
    raise exception 'Aquest material no té unitats bloquejades en la sessió';
  end if;

  select exists(
    select 1 from material_sessio_kit_item
    where sessio_id = p_sessio_id and cantidad_retornada < cantidad_recollida
    union all
    select 1 from material_sessio_compartit
    where sessio_id = p_sessio_id and cantidad_retornada < cantidad_recollida
  ) into v_pendents;

  update material_sessio
  set estat = case when v_pendents then 'incidencia' else 'tancada' end,
      data_retorn = case when v_pendents then null else now() end,
      updated_at = now()
  where id = p_sessio_id;

  return case when v_pendents then 'incidencia' else 'tancada' end;
end;
$$;

commit;
