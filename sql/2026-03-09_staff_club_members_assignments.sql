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
