begin;

create table if not exists material_sessio (
  id bigserial primary key,
  data_recollida timestamptz not null default now(),
  data_retorn timestamptz,
  equip_id bigint not null references equip(id) on delete restrict,
  staff_membre_id bigint not null references staff_membre(id) on delete restrict,
  staff_retorn_id bigint references staff_membre(id) on delete restrict,
  kit_entreno_id bigint not null references kit_entreno(id) on delete restrict,
  estat text not null default 'oberta' check (estat in ('oberta', 'incidencia', 'tancada', 'tancada_incidencia')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_material_sessio_kit_actiu
  on material_sessio(kit_entreno_id)
  where estat in ('oberta', 'incidencia');

create index if not exists idx_material_sessio_equip_estat
  on material_sessio(equip_id, estat);

create table if not exists material_sessio_kit_item (
  sessio_id bigint not null references material_sessio(id) on delete cascade,
  material_id bigint not null references material(id) on delete restrict,
  cantidad_esperada integer not null check (cantidad_esperada >= 0),
  cantidad_recollida integer not null check (cantidad_recollida >= 0),
  cantidad_retornada integer not null default 0 check (cantidad_retornada >= 0),
  cantidad_no_retornada integer not null default 0 check (cantidad_no_retornada >= 0),
  incidencia_recollida text,
  incidencia_retorn text,
  primary key (sessio_id, material_id),
  check (cantidad_recollida <= cantidad_esperada),
  check (cantidad_retornada <= cantidad_recollida),
  check (cantidad_no_retornada <= cantidad_recollida)
);

create table if not exists material_sessio_compartit (
  sessio_id bigint not null references material_sessio(id) on delete cascade,
  material_id bigint not null references material(id) on delete restrict,
  cantidad_recollida integer not null check (cantidad_recollida > 0),
  cantidad_retornada integer not null default 0 check (cantidad_retornada >= 0),
  cantidad_no_retornada integer not null default 0 check (cantidad_no_retornada >= 0),
  incidencia_retorn text,
  primary key (sessio_id, material_id),
  check (cantidad_retornada <= cantidad_recollida),
  check (cantidad_no_retornada <= cantidad_recollida)
);

create index if not exists idx_material_sessio_compartit_material
  on material_sessio_compartit(material_id);

create or replace function validar_stock_total_material()
returns trigger
language plpgsql
as $$
declare
  stock_assignat integer;
begin
  select
    coalesce((select sum(cantidad) from kit_entreno_material where material_id=new.id),0)
    + coalesce((select sum(cantidad_recollida-cantidad_retornada) from material_sessio_compartit where material_id=new.id),0)
  into stock_assignat;
  if new.cantidad < stock_assignat then
    raise exception 'L''estoc total (%) no pot ser inferior al material assignat o prestat (%)', new.cantidad, stock_assignat;
  end if;
  new.updated_at=now();
  return new;
end;
$$;

create or replace function validar_stock_material_kit()
returns trigger
language plpgsql
as $$
declare
  stock_total integer;
  stock_assignat integer;
  stock_prestat integer;
begin
  select cantidad into stock_total from material where id=new.material_id for update;
  if tg_op='INSERT' then
    select coalesce(sum(cantidad),0) into stock_assignat from kit_entreno_material where material_id=new.material_id;
  else
    select coalesce(sum(cantidad),0) into stock_assignat from kit_entreno_material
    where material_id=new.material_id and not (kit_entreno_id=old.kit_entreno_id and material_id=old.material_id);
  end if;
  select coalesce(sum(cantidad_recollida-cantidad_retornada),0) into stock_prestat
  from material_sessio_compartit where material_id=new.material_id;
  if stock_assignat+stock_prestat+new.cantidad > stock_total then
    raise exception 'Les unitats assignades o prestades superen l''estoc total';
  end if;
  new.updated_at=now();
  return new;
end;
$$;

create or replace function recollir_material_entreno(
  p_equip_id bigint,
  p_staff_membre_id bigint,
  p_kit_entreno_id bigint,
  p_kit_items jsonb default '[]'::jsonb,
  p_material_compartit jsonb default '[]'::jsonb
)
returns bigint
language plpgsql
as $$
declare
  v_sessio_id bigint;
  v_item record;
  v_input jsonb;
  v_recollida integer;
  v_incidencia text;
  v_disponible integer;
  v_material_id bigint;
  v_te_incidencia boolean := false;
begin
  perform 1 from equip where id = p_equip_id;
  if not found then raise exception 'Equip no trobat'; end if;
  perform 1 from staff_membre where id = p_staff_membre_id and actiu = true;
  if not found then raise exception 'Membre del staff no trobat o inactiu'; end if;
  perform 1 from kit_entreno where id = p_kit_entreno_id for update;
  if not found then raise exception 'Kit no trobat'; end if;
  if exists(select 1 from material_sessio where kit_entreno_id = p_kit_entreno_id and estat in ('oberta','incidencia')) then
    raise exception 'Aquest kit ja està recollit';
  end if;

  insert into material_sessio(equip_id, staff_membre_id, kit_entreno_id)
  values(p_equip_id, p_staff_membre_id, p_kit_entreno_id)
  returning id into v_sessio_id;

  for v_item in
    select material_id, cantidad from kit_entreno_material where kit_entreno_id = p_kit_entreno_id
  loop
    select value into v_input from jsonb_array_elements(coalesce(p_kit_items, '[]'::jsonb))
      where (value->>'material_id')::bigint = v_item.material_id limit 1;
    v_recollida := coalesce((v_input->>'cantidad_recollida')::integer, v_item.cantidad);
    v_incidencia := nullif(trim(coalesce(v_input->>'incidencia', '')), '');
    if v_recollida < 0 or v_recollida > v_item.cantidad then raise exception 'Quantitat de kit invàlida'; end if;
    if v_recollida < v_item.cantidad and v_incidencia is null then raise exception 'Cal indicar què falta del kit'; end if;
    if v_recollida < v_item.cantidad then v_te_incidencia := true; end if;
    insert into material_sessio_kit_item(sessio_id,material_id,cantidad_esperada,cantidad_recollida,incidencia_recollida)
    values(v_sessio_id,v_item.material_id,v_item.cantidad,v_recollida,v_incidencia);
  end loop;

  for v_input in select value from jsonb_array_elements(coalesce(p_material_compartit, '[]'::jsonb))
  loop
    v_material_id := (v_input->>'material_id')::bigint;
    v_recollida := (v_input->>'cantidad')::integer;
    if v_recollida <= 0 then raise exception 'La quantitat compartida ha de ser superior a zero'; end if;
    perform 1 from material where id = v_material_id for update;
    select m.cantidad
      - coalesce((select sum(km.cantidad) from kit_entreno_material km where km.material_id=m.id),0)
      - coalesce((select sum(sc.cantidad_recollida-sc.cantidad_retornada) from material_sessio_compartit sc where sc.material_id=m.id),0)
    into v_disponible from material m where m.id=v_material_id;
    if v_recollida > coalesce(v_disponible,0) then raise exception 'No hi ha prou unitats disponibles'; end if;
    insert into material_sessio_compartit(sessio_id,material_id,cantidad_recollida)
    values(v_sessio_id,v_material_id,v_recollida);
  end loop;

  if v_te_incidencia then
    update material_sessio set estat='incidencia',updated_at=now() where id=v_sessio_id;
  end if;

  return v_sessio_id;
end;
$$;

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
  v_incidencia text;
  v_te_incidencia boolean := false;
begin
  select * into v_sessio from material_sessio where id=p_sessio_id for update;
  if not found or v_sessio.estat='tancada' then raise exception 'Sessió no trobada o ja tancada'; end if;
  perform 1 from staff_membre where id=p_staff_retorn_id and actiu=true;
  if not found then raise exception 'Membre del staff no trobat o inactiu'; end if;

  for v_item in select * from material_sessio_kit_item where sessio_id=p_sessio_id for update
  loop
    v_pendent := v_item.cantidad_recollida-v_item.cantidad_retornada;
    select value into v_input from jsonb_array_elements(coalesce(p_kit_items,'[]'::jsonb))
      where (value->>'material_id')::bigint=v_item.material_id limit 1;
    v_ara := coalesce((v_input->>'cantidad_retornada')::integer,0);
    v_incidencia := nullif(trim(coalesce(v_input->>'incidencia','')), '');
    if v_ara < 0 or v_ara > v_pendent then raise exception 'Quantitat retornada del kit invàlida'; end if;
    if v_ara < v_pendent and v_incidencia is null then raise exception 'Cal indicar el motiu del material de kit pendent'; end if;
    update material_sessio_kit_item set cantidad_retornada=cantidad_retornada+v_ara,
      incidencia_retorn=case when v_incidencia is null then incidencia_retorn else concat_ws(E'\n',incidencia_retorn,v_incidencia) end
    where sessio_id=p_sessio_id and material_id=v_item.material_id;
    if v_ara < v_pendent then v_te_incidencia := true; end if;
  end loop;

  for v_item in select * from material_sessio_compartit where sessio_id=p_sessio_id for update
  loop
    v_pendent := v_item.cantidad_recollida-v_item.cantidad_retornada;
    select value into v_input from jsonb_array_elements(coalesce(p_material_compartit,'[]'::jsonb))
      where (value->>'material_id')::bigint=v_item.material_id limit 1;
    v_ara := coalesce((v_input->>'cantidad_retornada')::integer,0);
    v_incidencia := nullif(trim(coalesce(v_input->>'incidencia','')), '');
    if v_ara < 0 or v_ara > v_pendent then raise exception 'Quantitat compartida retornada invàlida'; end if;
    if v_ara < v_pendent and v_incidencia is null then raise exception 'Cal indicar el motiu del material compartit pendent'; end if;
    update material_sessio_compartit set cantidad_retornada=cantidad_retornada+v_ara,
      incidencia_retorn=case when v_incidencia is null then incidencia_retorn else concat_ws(E'\n',incidencia_retorn,v_incidencia) end
    where sessio_id=p_sessio_id and material_id=v_item.material_id;
    if v_ara < v_pendent then v_te_incidencia := true; end if;
  end loop;

  update material_sessio set staff_retorn_id=p_staff_retorn_id,
    estat=case when v_te_incidencia then 'incidencia' else 'tancada' end,
    data_retorn=case when v_te_incidencia then null else now() end, updated_at=now()
  where id=p_sessio_id;
  return case when v_te_incidencia then 'incidencia' else 'tancada' end;
end;
$$;

commit;
