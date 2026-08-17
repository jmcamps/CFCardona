begin;

create table if not exists material_sessio_ampliacio (
  id bigserial primary key,
  sessio_id bigint not null references material_sessio(id) on delete cascade,
  material_id bigint not null references material(id) on delete restrict,
  staff_membre_id bigint not null references staff_membre(id) on delete restrict,
  cantidad integer not null check (cantidad > 0),
  data_recollida timestamptz not null default now()
);

create index if not exists idx_material_sessio_ampliacio_sessio
  on material_sessio_ampliacio(sessio_id, data_recollida);

create or replace function afegir_material_compartit_sessio(
  p_sessio_id bigint,
  p_staff_membre_id bigint,
  p_material_compartit jsonb default '[]'::jsonb
)
returns integer
language plpgsql
as $$
declare
  v_sessio material_sessio%rowtype;
  v_input jsonb;
  v_material_id bigint;
  v_cantidad integer;
  v_disponible integer;
  v_total integer := 0;
begin
  select * into v_sessio
  from material_sessio
  where id = p_sessio_id and estat in ('oberta', 'incidencia')
  for update;
  if not found then raise exception 'Sessió no trobada o ja tancada'; end if;

  perform 1 from staff_membre where id = p_staff_membre_id and actiu = true;
  if not found then raise exception 'Membre del staff no trobat o inactiu'; end if;
  perform 1 from equip_staff_assignacio
  where equip_id = v_sessio.equip_id and staff_membre_id = p_staff_membre_id;
  if not found then raise exception 'El membre del staff no està assignat a l''equip de la sessió'; end if;

  for v_input in select value from jsonb_array_elements(coalesce(p_material_compartit, '[]'::jsonb))
  loop
    v_material_id := (v_input->>'material_id')::bigint;
    v_cantidad := (v_input->>'cantidad')::integer;
    if v_cantidad <= 0 then raise exception 'La quantitat ha de ser superior a zero'; end if;

    perform 1 from material where id = v_material_id for update;
    if not found then raise exception 'Material no trobat'; end if;
    select m.cantidad
      - coalesce((select sum(km.cantidad) from kit_entreno_material km where km.material_id = m.id), 0)
      - coalesce((select sum(sc.cantidad_recollida - sc.cantidad_retornada) from material_sessio_compartit sc where sc.material_id = m.id), 0)
    into v_disponible
    from material m where m.id = v_material_id;
    if v_cantidad > coalesce(v_disponible, 0) then raise exception 'No hi ha prou unitats disponibles'; end if;

    insert into material_sessio_compartit(sessio_id, material_id, cantidad_recollida)
    values(p_sessio_id, v_material_id, v_cantidad)
    on conflict (sessio_id, material_id) do update
      set cantidad_recollida = material_sessio_compartit.cantidad_recollida + excluded.cantidad_recollida;

    insert into material_sessio_ampliacio(sessio_id, material_id, staff_membre_id, cantidad)
    values(p_sessio_id, v_material_id, p_staff_membre_id, v_cantidad);
    v_total := v_total + v_cantidad;
  end loop;

  if v_total = 0 then raise exception 'Cal indicar almenys un material'; end if;
  update material_sessio set updated_at = now() where id = p_sessio_id;
  return v_total;
end;
$$;

commit;
