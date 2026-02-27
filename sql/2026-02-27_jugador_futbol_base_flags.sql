alter table public.jugador
    add column if not exists inscripcio_feta boolean default false,
    add column if not exists pagament_fcf_fet boolean default false,
    add column if not exists vinculat_club boolean default false;

update public.jugador
set
    inscripcio_feta = coalesce(inscripcio_feta, false),
    pagament_fcf_fet = coalesce(pagament_fcf_fet, false),
    vinculat_club = coalesce(vinculat_club, false)
where
    inscripcio_feta is null
    or pagament_fcf_fet is null
    or vinculat_club is null;

alter table public.jugador
    alter column inscripcio_feta set default false,
    alter column inscripcio_feta set not null,
    alter column pagament_fcf_fet set default false,
    alter column pagament_fcf_fet set not null,
    alter column vinculat_club set default false,
    alter column vinculat_club set not null;
