begin;

with target as (
  select id
  from equip
  where id = 15
     or nom in ('Cadet Femení', 'Cadet Femeni', 'Infantil-Cadet Femení', 'Infantil-Cadet Femeni')
  order by case when id = 15 then 0 else 1 end
  limit 1
),
source as (
  select id
  from equip
  where id = 16
     or nom in ('Infantil Femení', 'Infantil Femeni')
  order by case when id = 16 then 0 else 1 end
  limit 1
)
update jugador
set equip_id = (select id from target)
where equip_id = (select id from source)
  and exists (select 1 from target)
  and exists (select 1 from source);

with target as (
  select id
  from equip
  where id = 15
     or nom in ('Cadet Femení', 'Cadet Femeni', 'Infantil-Cadet Femení', 'Infantil-Cadet Femeni')
  order by case when id = 15 then 0 else 1 end
  limit 1
),
source as (
  select id
  from equip
  where id = 16
     or nom in ('Infantil Femení', 'Infantil Femeni')
  order by case when id = 16 then 0 else 1 end
  limit 1
)
update amistos
set equip_id = (select id from target)
where equip_id = (select id from source)
  and exists (select 1 from target)
  and exists (select 1 from source);

with target as (
  select id
  from equip
  where id = 15
     or nom in ('Cadet Femení', 'Cadet Femeni', 'Infantil-Cadet Femení', 'Infantil-Cadet Femeni')
  order by case when id = 15 then 0 else 1 end
  limit 1
),
source as (
  select id
  from equip
  where id = 16
     or nom in ('Infantil Femení', 'Infantil Femeni')
  order by case when id = 16 then 0 else 1 end
  limit 1
)
update horarios_entrenaments
set team_id = 'seccio_cadet-femeni'
where team_id = 'seccio_infantil-femeni';

with target as (
  select id
  from equip
  where id = 15
     or nom in ('Cadet Femení', 'Cadet Femeni', 'Infantil-Cadet Femení', 'Infantil-Cadet Femeni')
  order by case when id = 15 then 0 else 1 end
  limit 1
),
source as (
  select id
  from equip
  where id = 16
     or nom in ('Infantil Femení', 'Infantil Femeni')
  order by case when id = 16 then 0 else 1 end
  limit 1
)
update comentari
set equip_id = (select id from target)
where equip_id = (select id from source)
  and exists (select 1 from target)
  and exists (select 1 from source);

delete from equip_staff_assignacio
where equip_id in (
  select id
  from equip
  where id = 16
     or nom in ('Infantil Femení', 'Infantil Femeni')
);

update equip
set nom = 'Infantil-Cadet Femení',
    categoria = 'Infantil-Cadet Femení'
where id = 15
   or nom in ('Cadet Femení', 'Cadet Femeni', 'Infantil-Cadet Femení', 'Infantil-Cadet Femeni');

delete from equip
where id = 16
   or nom in ('Infantil Femení', 'Infantil Femeni');

with infantil as (
  select payload
  from seccions_data
  where scope = 'seccio_infantil-femeni'
),
cadet as (
  select payload
  from seccions_data
  where scope = 'seccio_cadet-femeni'
),
merged as (
  select
    coalesce((select payload from cadet), '{}'::jsonb) ||
    jsonb_build_object(
      'partits',
      coalesce((select payload->'partits' from cadet), '[]'::jsonb) ||
      coalesce((select payload->'partits' from infantil), '[]'::jsonb),
      'observacions',
      coalesce((select payload->'observacions' from cadet), '[]'::jsonb) ||
      coalesce((select payload->'observacions' from infantil), '[]'::jsonb),
      'horaris',
      coalesce((select payload->'horaris' from cadet), '[]'::jsonb) ||
      coalesce((select payload->'horaris' from infantil), '[]'::jsonb)
    ) as payload
)
insert into seccions_data (scope, payload)
select 'seccio_cadet-femeni', payload from merged
on conflict (scope) do update
set payload = excluded.payload;

delete from seccions_data
where scope = 'seccio_infantil-femeni';

update observacions
set scope = 'seccio_cadet-femeni'
where scope = 'seccio_infantil-femeni';

commit;
