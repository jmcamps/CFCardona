create table if not exists temporada (
  id bigserial primary key,
  nom text not null unique
);

create table if not exists rol (
  id bigserial primary key,
  nom text not null unique,
  descripcio text
);

create table if not exists posicio (
  id bigserial primary key,
  nom text not null unique,
  descripcio text
);

create table if not exists equip (
  id bigserial primary key,
  temporada_id bigint not null references temporada(id) on delete restrict,
  nom text not null,
  categoria text not null,
  url_fcf text,
  comp_categoria text,
  comp_temporada text,
  comp_url text,
  coord_nom text,
  coord_tel text,
  descripcio text,
  unique (temporada_id, nom)
);

create table if not exists material (
  id bigserial primary key,
  nom text not null unique,
  descripcio text not null default '',
  cantidad integer not null default 0 check (cantidad >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kit_entreno (
  id bigserial primary key,
  tipus text not null check (tipus in ('F7', 'F11')),
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tipus, color)
);

create table if not exists kit_entreno_material (
  kit_entreno_id bigint not null references kit_entreno(id) on delete cascade,
  material_id bigint not null references material(id) on delete cascade,
  cantidad integer not null check (cantidad > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (kit_entreno_id, material_id)
);

create index if not exists idx_kit_entreno_material_material
  on kit_entreno_material(material_id);

create or replace function validar_stock_material_kit()
returns trigger
language plpgsql
as $$
declare
  stock_total integer;
  stock_assignat integer;
begin
  select cantidad into stock_total from material where id = new.material_id for update;
  if tg_op = 'INSERT' then
    select coalesce(sum(cantidad), 0) into stock_assignat
    from kit_entreno_material
    where material_id = new.material_id;
  else
    select coalesce(sum(cantidad), 0) into stock_assignat
    from kit_entreno_material
    where material_id = new.material_id
      and not (kit_entreno_id = old.kit_entreno_id and material_id = old.material_id);
  end if;
  if stock_assignat + new.cantidad > stock_total then
    raise exception 'Les unitats assignades superen l''estoc total';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_validar_stock_material_kit on kit_entreno_material;
create trigger trg_validar_stock_material_kit
before insert or update on kit_entreno_material
for each row execute function validar_stock_material_kit();

create or replace function validar_stock_total_material()
returns trigger
language plpgsql
as $$
declare
  stock_assignat integer;
begin
  select coalesce(sum(cantidad), 0) into stock_assignat
  from kit_entreno_material where material_id = new.id;
  if new.cantidad < stock_assignat then
    raise exception 'L''estoc total no pot ser inferior a l''assignat';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_validar_stock_total_material on material;
create trigger trg_validar_stock_total_material
before update on material
for each row execute function validar_stock_total_material();

create table if not exists condicions_economiques (
  id bigserial primary key,
  fitxa_mensual numeric(10,2),
  prima_partit_guanyat numeric(10,2),
  prima_permanencia numeric(10,2),
  altres text
);

create table if not exists jugador (
  id bigserial primary key,
  equip_id bigint references equip(id) on delete set null,
  nom text not null,
  telefon text,
  club_actual text,
  any_naixement int,
  data_naixement date,
  residencia text,
  any_final_revisio_medica int,
  revisio_medica boolean,
  renovara boolean,
  rol_actual_id bigint references rol(id) on delete set null,
  rol_previst_id bigint references rol(id) on delete set null,
  edat text,
  conv_situacio text,
  val_forts text,
  val_millorar text,
  val_lesions text,
  val_compromis text,
  observacions text,
  condicions_economiques_id bigint unique references condicions_economiques(id) on delete set null,
  unique (equip_id, nom)
);

create table if not exists jugador_posicio (
  jugador_id bigint not null references jugador(id) on delete cascade,
  posicio_id bigint not null references posicio(id) on delete restrict,
  primary key (jugador_id, posicio_id)
);

create table if not exists jugador_en_seguiment (
  id bigserial primary key,
  nom text not null,
  telefon text,
  club_actual text,
  any_naixement int,
  genere text,
  residencia text,
  origen text,
  informe_tecnic text,
  observacions text
);

create table if not exists jugador_en_seguiment_posicio (
  jugador_en_seguiment_id bigint not null references jugador_en_seguiment(id) on delete cascade,
  posicio_id bigint not null references posicio(id) on delete restrict,
  primary key (jugador_en_seguiment_id, posicio_id)
);

create table if not exists staff (
  id bigserial primary key,
  equip_id bigint references equip(id) on delete set null,
  nom text not null,
  telefon text,
  carnet boolean not null default false,
  rol_id bigint references rol(id) on delete set null
);

create table if not exists staff_membre (
  id bigserial primary key,
  nom text not null,
  telefon text,
  carnet boolean not null default false,
  actiu boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists equip_staff_assignacio (
  id bigserial primary key,
  equip_id bigint not null references equip(id) on delete cascade,
  rol_id bigint not null references rol(id) on delete cascade,
  staff_membre_id bigint not null references staff_membre(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (equip_id, rol_id)
);

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
  select * into v_sessio from material_sessio
  where id = p_sessio_id and estat in ('oberta', 'incidencia') for update;
  if not found then raise exception 'Sessió no trobada o ja tancada'; end if;
  perform 1 from staff_membre where id = p_staff_membre_id and actiu = true;
  if not found then raise exception 'Membre del staff no trobat o inactiu'; end if;
  perform 1 from equip_staff_assignacio
  where equip_id = v_sessio.equip_id and staff_membre_id = p_staff_membre_id;
  if not found then raise exception 'El membre del staff no està assignat a l''equip de la sessió'; end if;

  for v_input in select value from jsonb_array_elements(coalesce(p_material_compartit, '[]'::jsonb)) loop
    v_material_id := (v_input->>'material_id')::bigint;
    v_cantidad := (v_input->>'cantidad')::integer;
    if v_cantidad <= 0 then raise exception 'La quantitat ha de ser superior a zero'; end if;
    perform 1 from material where id = v_material_id for update;
    if not found then raise exception 'Material no trobat'; end if;
    select m.cantidad
      - coalesce((select sum(km.cantidad) from kit_entreno_material km where km.material_id = m.id), 0)
      - coalesce((select sum(sc.cantidad_recollida - sc.cantidad_retornada) from material_sessio_compartit sc where sc.material_id = m.id), 0)
    into v_disponible from material m where m.id = v_material_id;
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
  select * into v_sessio from material_sessio where id = p_sessio_id for update;
  if not found or v_sessio.estat = 'tancada' then
    raise exception 'Sessió no trobada o ja tancada';
  end if;

  v_nota := concat('[Desbloqueig administratiu · ',
    coalesce(nullif(trim(p_actor), ''), 'Administració'), '] ',
    coalesce(nullif(trim(p_motiu), ''), 'Retorn no registrat per l''equip'));

  update material_sessio_kit_item
  set cantidad_retornada = cantidad_recollida,
      incidencia_retorn = concat_ws(E'\n', nullif(incidencia_retorn, ''), v_nota)
  where sessio_id = p_sessio_id and cantidad_retornada < cantidad_recollida
    and (p_material_id is null or material_id = p_material_id);
  get diagnostics v_files = row_count;
  v_afectats := v_afectats + v_files;

  update material_sessio_compartit
  set cantidad_retornada = cantidad_recollida,
      incidencia_retorn = concat_ws(E'\n', nullif(incidencia_retorn, ''), v_nota)
  where sessio_id = p_sessio_id and cantidad_retornada < cantidad_recollida
    and (p_material_id is null or material_id = p_material_id);
  get diagnostics v_files = row_count;
  v_afectats := v_afectats + v_files;

  if p_material_id is not null and v_afectats = 0 then
    raise exception 'Aquest material no té unitats bloquejades en la sessió';
  end if;

  select exists(
    select 1 from material_sessio_kit_item where sessio_id = p_sessio_id and cantidad_retornada < cantidad_recollida
    union all
    select 1 from material_sessio_compartit where sessio_id = p_sessio_id and cantidad_retornada < cantidad_recollida
  ) into v_pendents;

  update material_sessio
  set estat = case when v_pendents then 'incidencia' else 'tancada' end,
      data_retorn = case when v_pendents then null else now() end,
      updated_at = now()
  where id = p_sessio_id;
  return case when v_pendents then 'incidencia' else 'tancada' end;
end;
$$;

-- Versió final de les validacions, incloent el material prestat en sessions.
create or replace function validar_stock_total_material()
returns trigger language plpgsql as $$
declare stock_assignat integer;
begin
  select coalesce((select sum(cantidad) from kit_entreno_material where material_id=new.id),0)
    + coalesce((select sum(cantidad_recollida-cantidad_retornada) from material_sessio_compartit where material_id=new.id),0)
  into stock_assignat;
  if new.cantidad < stock_assignat then raise exception 'L''estoc total no pot ser inferior al material assignat o prestat'; end if;
  new.updated_at=now(); return new;
end; $$;

create or replace function validar_stock_material_kit()
returns trigger language plpgsql as $$
declare stock_total integer; stock_assignat integer; stock_prestat integer;
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
  if stock_assignat+stock_prestat+new.cantidad > stock_total then raise exception 'Les unitats assignades o prestades superen l''estoc total'; end if;
  new.updated_at=now(); return new;
end; $$;

create table if not exists comunicacions (
  id bigserial primary key,
  data date,
  responsable text,
  resultat text,
  jugador_id bigint references jugador(id) on delete cascade,
  jugador_en_seguiment_id bigint references jugador_en_seguiment(id) on delete cascade
);

create table if not exists comentari (
  id bigserial primary key,
  data date,
  responsable text,
  comentari text,
  equip_id bigint references equip(id) on delete cascade,
  jugador_id bigint references jugador(id) on delete cascade,
  jugador_en_seguiment_id bigint references jugador_en_seguiment(id) on delete cascade
);

create table if not exists horari_entrenaments (
  id bigserial primary key,
  equip_id bigint not null references equip(id) on delete cascade,
  dia text,
  inici time,
  fi time,
  vestidor text,
  camp text
);

create table if not exists amistos (
  id bigserial primary key,
  equip_id bigint not null references equip(id) on delete cascade,
  data date,
  tipus text,
  rival text,
  lloc text,
  resultat text,
  torneig text
);

create table if not exists direccio_esportiva (
  id bigserial primary key,
  directrius text,
  funcions text,
  perfil text,
  staff_info text,
  filial_info text,
  juvenil_info text
);

create table if not exists direccio_candidat (
  id bigserial primary key,
  direccio_id bigint not null references direccio_esportiva(id) on delete cascade,
  nom text,
  telefon text,
  situacio text
);
