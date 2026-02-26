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
  rol_id bigint references rol(id) on delete set null
);

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
