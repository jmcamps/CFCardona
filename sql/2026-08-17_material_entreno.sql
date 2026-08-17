begin;

create table if not exists material (
  id bigserial primary key,
  nom text not null,
  descripcio text not null default '',
  cantidad integer not null default 0 check (cantidad >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (nom)
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

-- Garanteix que les unitats repartides entre kits no superin l'estoc total.
create or replace function validar_stock_material_kit()
returns trigger
language plpgsql
as $$
declare
  stock_total integer;
  stock_assignat integer;
begin
  select cantidad into stock_total
  from material
  where id = new.material_id
  for update;

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
    raise exception 'Les unitats assignades (%) superen l''estoc total (%)',
      stock_assignat + new.cantidad, stock_total;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_validar_stock_material_kit on kit_entreno_material;
create trigger trg_validar_stock_material_kit
before insert or update on kit_entreno_material
for each row execute function validar_stock_material_kit();

-- Impedeix reduir l'estoc total per sota de les unitats ja assignades.
create or replace function validar_stock_total_material()
returns trigger
language plpgsql
as $$
declare
  stock_assignat integer;
begin
  select coalesce(sum(cantidad), 0) into stock_assignat
  from kit_entreno_material
  where material_id = new.id;

  if new.cantidad < stock_assignat then
    raise exception 'L''estoc total (%) no pot ser inferior a l''assignat (%)',
      new.cantidad, stock_assignat;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_validar_stock_total_material on material;
create trigger trg_validar_stock_total_material
before update on material
for each row execute function validar_stock_total_material();

commit;
