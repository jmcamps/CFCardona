with source as (
    select
        s.id,
        btrim(s.nom) as nom,
        nullif(btrim(coalesce(s.telefon, '')), '') as telefon,
        coalesce(s.carnet, false) as carnet,
        lower(btrim(s.nom)) as nom_key,
        coalesce(nullif(regexp_replace(coalesce(s.telefon, ''), '\\s+', '', 'g'), ''), '') as tel_key
    from staff s
    where s.nom is not null
      and btrim(s.nom) <> ''
),
member_ranked as (
    select
        nom_key,
        tel_key,
        nom,
        telefon,
        id,
        row_number() over (partition by nom_key, tel_key order by id desc) as rn
    from source
),
member_latest as (
    select
        nom_key,
        tel_key,
        nom,
        telefon
    from member_ranked
    where rn = 1
),
member_flags as (
    select
        nom_key,
        tel_key,
        max(case when carnet then 1 else 0 end) = 1 as carnet
    from source
    group by nom_key, tel_key
),
member_candidates as (
    select
        l.nom_key,
        l.tel_key,
        l.nom,
        l.telefon,
        f.carnet
    from member_latest l
    join member_flags f using (nom_key, tel_key)
)
insert into staff_membre (nom, telefon, carnet, actiu)
select
    c.nom,
    c.telefon,
    c.carnet,
    true
from member_candidates c
where not exists (
    select 1
    from staff_membre m
    where lower(btrim(m.nom)) = c.nom_key
      and coalesce(nullif(regexp_replace(coalesce(m.telefon, ''), '\\s+', '', 'g'), ''), '') = c.tel_key
);

with role_rows_ranked as (
    select
        s.equip_id,
        s.rol_id,
        lower(btrim(s.nom)) as nom_key,
        coalesce(nullif(regexp_replace(coalesce(s.telefon, ''), '\\s+', '', 'g'), ''), '') as tel_key,
        row_number() over (partition by s.equip_id, s.rol_id order by s.id desc) as rn
    from staff s
    where s.equip_id is not null
      and s.rol_id is not null
      and s.nom is not null
      and btrim(s.nom) <> ''
),
role_rows as (
    select
        equip_id,
        rol_id,
        nom_key,
        tel_key
    from role_rows_ranked
    where rn = 1
),
member_lookup_ranked as (
    select
        m.id as staff_membre_id,
        lower(btrim(m.nom)) as nom_key,
        coalesce(nullif(regexp_replace(coalesce(m.telefon, ''), '\\s+', '', 'g'), ''), '') as tel_key,
        row_number() over (
            partition by lower(btrim(m.nom)), coalesce(nullif(regexp_replace(coalesce(m.telefon, ''), '\\s+', '', 'g'), ''), '')
            order by m.id asc
        ) as rn
    from staff_membre m
),
member_lookup as (
    select
        staff_membre_id,
        nom_key,
        tel_key
    from member_lookup_ranked
    where rn = 1
),
assignments as (
    select
        r.equip_id,
        r.rol_id,
        ml.staff_membre_id
    from role_rows r
    join member_lookup ml
      on ml.nom_key = r.nom_key
     and ml.tel_key = r.tel_key
)
insert into equip_staff_assignacio (equip_id, rol_id, staff_membre_id)
select
    a.equip_id,
    a.rol_id,
    a.staff_membre_id
from assignments a
on conflict (equip_id, rol_id)
do update set
    staff_membre_id = excluded.staff_membre_id;
