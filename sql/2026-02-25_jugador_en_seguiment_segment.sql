-- Afegir segment per separar cartera base/senior
alter table if exists public.jugador_en_seguiment
add column if not exists segment text;

-- Normalitzar valors existents
update public.jugador_en_seguiment
set segment = lower(trim(segment))
where segment is not null;

-- Valor per defecte (pots canviar-lo segons criteri)
alter table if exists public.jugador_en_seguiment
alter column segment set default 'base';

-- Backfill dels NULL
update public.jugador_en_seguiment
set segment = 'base'
where segment is null;

-- Constraint de domini
alter table if exists public.jugador_en_seguiment
drop constraint if exists jugador_en_seguiment_segment_chk;

alter table if exists public.jugador_en_seguiment
add constraint jugador_en_seguiment_segment_chk
check (segment in ('base','senior'));

-- Índex per filtres ràpids
create index if not exists idx_jugador_en_seguiment_segment
on public.jugador_en_seguiment(segment);
