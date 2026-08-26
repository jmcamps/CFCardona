begin;

alter table equip
  add column if not exists kit_entreno_defecte_id bigint
  references kit_entreno(id) on delete set null;

with assignacions(nom_equip, tipus, color) as (
  values
    ('Minis-S7', 'F7', 'Vermell'),
    ('Minis', 'F7', 'Vermell'),
    ('S7', 'F7', 'Vermell'),
    ('S8', 'F7', 'Vermell'),
    ('S9', 'F7', 'Blau'),
    ('S10', 'F7', 'Verd'),
    ('S11', 'F7', 'Groc'),
    ('S12', 'F7', 'Blau'),
    ('S13-S14', 'F11', 'Negre'),
    ('S13', 'F11', 'Negre'),
    ('S14', 'F11', 'Negre'),
    ('S15-S16', 'F11', 'Blanc'),
    ('S15', 'F11', 'Blanc'),
    ('S16', 'F11', 'Blanc'),
    ('S16 (Cadet)', 'F11', 'Blanc'),
    ('Juvenil Masculí - A', 'F11', 'Blanc'),
    ('Juvenil Masculi - A', 'F11', 'Blanc'),
    ('Juvenil Masculí - B', 'F11', 'Negre'),
    ('Juvenil Masculi - B', 'F11', 'Negre'),
    ('Aleví Femení', 'F7', 'Vermell'),
    ('Alevi Femeni', 'F7', 'Vermell'),
    ('Infantil-Cadet Femení', 'F7', 'Groc'),
    ('Infantil-Cadet Femeni', 'F7', 'Groc'),
    ('Juvenil Femení', 'F11', 'Blanc'),
    ('Juvenil Femeni', 'F11', 'Blanc')
), resoltes as (
  select e.id equip_id, (
    select k.id
    from kit_entreno k
    where upper(k.tipus) = a.tipus
      and lower(trim(k.color)) = lower(a.color)
    order by k.id
    limit 1
  ) kit_id
  from equip e
  join assignacions a on lower(trim(e.nom)) = lower(a.nom_equip)
)
update equip e
set kit_entreno_defecte_id = r.kit_id
from resoltes r
where e.id = r.equip_id
  and r.kit_id is not null;

commit;
