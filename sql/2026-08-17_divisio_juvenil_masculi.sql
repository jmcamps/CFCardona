begin;

-- L'equip existent passa a ser l'A, de manera que conserva jugadors,
-- staff, competició, partits i comentaris relacionats pel seu equip_id.
update equip
set nom = 'Juvenil Masculí - A'
where nom in ('Juvenil Masculí', 'Juvenil Masculi')
  and not exists (
    select 1
    from equip equip_a
    where equip_a.temporada_id = equip.temporada_id
      and equip_a.nom in ('Juvenil Masculí - A', 'Juvenil Masculi - A')
  );

-- El B hereta la temporada i la categoria de l'A.
insert into equip (temporada_id, nom, categoria, url_fcf)
select temporada_id, 'Juvenil Masculí - B', categoria, null
from equip
where nom in ('Juvenil Masculí - A', 'Juvenil Masculi - A')
on conflict (temporada_id, nom) do nothing;

-- Inicialment tots els jugadors de l'A també formen part del B. Es creen
-- registres independents perquè més endavant es puguin moure o eliminar
-- jugadors d'una plantilla sense modificar l'altra.
insert into jugador (
  equip_id,
  nom,
  telefon,
  club_actual,
  any_naixement,
  data_naixement,
  residencia,
  any_final_revisio_medica,
  revisio_medica,
  renovara,
  rol_actual_id,
  rol_previst_id,
  edat,
  conv_situacio,
  val_forts,
  val_millorar,
  val_lesions,
  val_compromis,
  observacions,
  inscripcio_feta,
  pagament_fcf_fet,
  vinculat_club
)
select
  equip_b.id,
  jugador_a.nom,
  jugador_a.telefon,
  jugador_a.club_actual,
  jugador_a.any_naixement,
  jugador_a.data_naixement,
  jugador_a.residencia,
  jugador_a.any_final_revisio_medica,
  jugador_a.revisio_medica,
  jugador_a.renovara,
  jugador_a.rol_actual_id,
  jugador_a.rol_previst_id,
  jugador_a.edat,
  jugador_a.conv_situacio,
  jugador_a.val_forts,
  jugador_a.val_millorar,
  jugador_a.val_lesions,
  jugador_a.val_compromis,
  jugador_a.observacions,
  jugador_a.inscripcio_feta,
  jugador_a.pagament_fcf_fet,
  jugador_a.vinculat_club
from equip equip_a
join equip equip_b
  on equip_b.temporada_id = equip_a.temporada_id
 and equip_b.nom in ('Juvenil Masculí - B', 'Juvenil Masculi - B')
join jugador jugador_a on jugador_a.equip_id = equip_a.id
where equip_a.nom in ('Juvenil Masculí - A', 'Juvenil Masculi - A')
on conflict (equip_id, nom) do nothing;

-- Es repliquen també les posicions esportives dels jugadors clonats.
insert into jugador_posicio (jugador_id, posicio_id)
select jugador_b.id, jugador_posicio_a.posicio_id
from equip equip_a
join equip equip_b
  on equip_b.temporada_id = equip_a.temporada_id
 and equip_b.nom in ('Juvenil Masculí - B', 'Juvenil Masculi - B')
join jugador jugador_a on jugador_a.equip_id = equip_a.id
join jugador jugador_b
  on jugador_b.equip_id = equip_b.id
 and jugador_b.nom = jugador_a.nom
join jugador_posicio jugador_posicio_a
  on jugador_posicio_a.jugador_id = jugador_a.id
where equip_a.nom in ('Juvenil Masculí - A', 'Juvenil Masculi - A')
on conflict (jugador_id, posicio_id) do nothing;

-- Les dades de secció existents corresponen a l'equip A.
insert into seccions_data (scope, payload)
select 'seccio_juvenil-masculi-a', payload
from seccions_data
where scope = 'seccio_juvenil-masculi'
on conflict (scope) do update
set payload = excluded.payload;

delete from seccions_data
where scope = 'seccio_juvenil-masculi';

update observacions
set scope = 'seccio_juvenil-masculi-a'
where scope = 'seccio_juvenil-masculi';

update horarios_entrenaments
set team_id = 'seccio_juvenil-masculi-a'
where team_id = 'seccio_juvenil-masculi';

commit;
