-- Afegeix suport natiu per entrenaments de porters a horarios_entrenaments.
-- També converteix valors legacy guardats a camp amb prefix PORTERIA:...

ALTER TABLE IF EXISTS horarios_entrenaments
    ADD COLUMN IF NOT EXISTS tipus TEXT;

ALTER TABLE IF EXISTS horarios_entrenaments
    ADD COLUMN IF NOT EXISTS porteria TEXT;

UPDATE horarios_entrenaments
SET tipus = 'equip'
WHERE COALESCE(BTRIM(tipus), '') = '';

UPDATE horarios_entrenaments
SET
    tipus = 'porters',
    porteria = NULLIF(BTRIM(regexp_replace(camp, '^PORTERIA:[[:space:]]*', '', 'i')), ''),
    camp = ''
WHERE camp ~* '^PORTERIA:[[:space:]]*';

UPDATE horarios_entrenaments
SET
    team_id = '',
    vestidor = NULL
WHERE tipus = 'porters';

UPDATE horarios_entrenaments
SET fi = '19:30'
WHERE tipus = 'porters'
    AND inici = '18:45'
    AND fi = '20:30';

ALTER TABLE IF EXISTS horarios_entrenaments
    ALTER COLUMN tipus SET DEFAULT 'equip';

ALTER TABLE IF EXISTS horarios_entrenaments
    ALTER COLUMN tipus SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_horarios_tipus ON horarios_entrenaments(tipus);
