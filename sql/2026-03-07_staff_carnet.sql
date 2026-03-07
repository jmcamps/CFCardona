alter table if exists staff
  add column if not exists carnet boolean not null default false;
