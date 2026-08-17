begin;

alter table material_sessio drop constraint if exists material_sessio_estat_check;
alter table material_sessio add constraint material_sessio_estat_check
  check (estat in ('oberta', 'incidencia', 'tancada', 'tancada_incidencia'));

alter table material_sessio_kit_item
  add column if not exists cantidad_no_retornada integer not null default 0 check (cantidad_no_retornada >= 0);
alter table material_sessio_compartit
  add column if not exists cantidad_no_retornada integer not null default 0 check (cantidad_no_retornada >= 0);
alter table material_sessio_kit_item drop constraint if exists material_sessio_kit_item_no_retornada_check;
alter table material_sessio_kit_item add constraint material_sessio_kit_item_no_retornada_check
  check (cantidad_no_retornada <= cantidad_recollida);
alter table material_sessio_compartit drop constraint if exists material_sessio_compartit_no_retornada_check;
alter table material_sessio_compartit add constraint material_sessio_compartit_no_retornada_check
  check (cantidad_no_retornada <= cantidad_recollida);

create or replace function tornar_material_entreno(
  p_sessio_id bigint,
  p_staff_retorn_id bigint,
  p_kit_items jsonb default '[]'::jsonb,
  p_material_compartit jsonb default '[]'::jsonb
)
returns text
language plpgsql
as $$
declare
  v_sessio material_sessio%rowtype;
  v_item record;
  v_input jsonb;
  v_ara integer;
  v_pendent integer;
  v_retorn_real integer;
  v_no_retornada integer;
  v_incidencia text;
  v_kit_actual integer;
  v_kit_nou integer;
  v_baixa integer;
  v_te_incidencia boolean := false;
begin
  select * into v_sessio from material_sessio
  where id = p_sessio_id and estat in ('oberta', 'incidencia') for update;
  if not found then raise exception 'Sessió no trobada o ja tancada'; end if;
  perform 1 from staff_membre where id = p_staff_retorn_id and actiu = true;
  if not found then raise exception 'Membre del staff no trobat o inactiu'; end if;

  for v_item in select * from material_sessio_kit_item where sessio_id = p_sessio_id for update loop
    v_pendent := v_item.cantidad_recollida - v_item.cantidad_retornada;
    select value into v_input from jsonb_array_elements(coalesce(p_kit_items, '[]'::jsonb))
      where (value->>'material_id')::bigint = v_item.material_id limit 1;
    v_ara := coalesce((v_input->>'cantidad_retornada')::integer, v_pendent);
    v_incidencia := nullif(trim(coalesce(v_input->>'incidencia', '')), '');
    if v_ara < 0 or v_ara > v_pendent then raise exception 'Quantitat retornada del kit invàlida'; end if;
    if v_ara < v_pendent and v_incidencia is null then raise exception 'Cal indicar el motiu del material de kit no retornat'; end if;

    v_retorn_real := v_item.cantidad_retornada + v_ara;
    v_no_retornada := v_item.cantidad_recollida - v_retorn_real;
    if v_item.cantidad_recollida < v_item.cantidad_esperada or v_no_retornada > 0 or v_item.incidencia_recollida is not null then
      v_te_incidencia := true;
    end if;

    update material_sessio_kit_item
    set cantidad_retornada = cantidad_recollida,
        cantidad_no_retornada = v_no_retornada,
        incidencia_retorn = case when v_incidencia is null then incidencia_retorn else concat_ws(E'\n', incidencia_retorn, v_incidencia) end
    where sessio_id = p_sessio_id and material_id = v_item.material_id;

    select cantidad into v_kit_actual from kit_entreno_material
    where kit_entreno_id = v_sessio.kit_entreno_id and material_id = v_item.material_id for update;
    v_kit_actual := coalesce(v_kit_actual, 0);
    v_kit_nou := greatest(0, v_retorn_real);
    v_baixa := greatest(0, v_kit_actual - v_kit_nou);
    if v_kit_nou = 0 then
      delete from kit_entreno_material where kit_entreno_id = v_sessio.kit_entreno_id and material_id = v_item.material_id;
    elsif v_kit_actual = 0 then
      insert into kit_entreno_material(kit_entreno_id, material_id, cantidad)
      values(v_sessio.kit_entreno_id, v_item.material_id, v_kit_nou);
    else
      update kit_entreno_material set cantidad = v_kit_nou, updated_at = now()
      where kit_entreno_id = v_sessio.kit_entreno_id and material_id = v_item.material_id;
    end if;
    if v_baixa > 0 then
      update material set cantidad = greatest(0, cantidad - v_baixa), updated_at = now() where id = v_item.material_id;
    end if;
  end loop;

  for v_item in select * from material_sessio_compartit where sessio_id = p_sessio_id for update loop
    v_pendent := v_item.cantidad_recollida - v_item.cantidad_retornada;
    select value into v_input from jsonb_array_elements(coalesce(p_material_compartit, '[]'::jsonb))
      where (value->>'material_id')::bigint = v_item.material_id limit 1;
    v_ara := coalesce((v_input->>'cantidad_retornada')::integer, v_pendent);
    v_incidencia := nullif(trim(coalesce(v_input->>'incidencia', '')), '');
    if v_ara < 0 or v_ara > v_pendent then raise exception 'Quantitat compartida retornada invàlida'; end if;
    if v_ara < v_pendent and v_incidencia is null then raise exception 'Cal indicar el motiu del material compartit no retornat'; end if;
    v_retorn_real := v_item.cantidad_retornada + v_ara;
    v_no_retornada := v_item.cantidad_recollida - v_retorn_real;
    if v_no_retornada > 0 then v_te_incidencia := true; end if;
    update material_sessio_compartit
    set cantidad_retornada = cantidad_recollida,
        cantidad_no_retornada = v_no_retornada,
        incidencia_retorn = case when v_incidencia is null then incidencia_retorn else concat_ws(E'\n', incidencia_retorn, v_incidencia) end
    where sessio_id = p_sessio_id and material_id = v_item.material_id;
    if v_no_retornada > 0 then
      update material set cantidad = greatest(0, cantidad - v_no_retornada), updated_at = now() where id = v_item.material_id;
    end if;
  end loop;

  update material_sessio
  set staff_retorn_id = p_staff_retorn_id,
      estat = case when v_te_incidencia then 'tancada_incidencia' else 'tancada' end,
      data_retorn = now(), updated_at = now()
  where id = p_sessio_id;
  return case when v_te_incidencia then 'tancada_incidencia' else 'tancada' end;
end;
$$;

commit;
