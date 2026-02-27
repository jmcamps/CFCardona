-- Executa aquest script al SQL Editor de Supabase
-- Insereix franges base de Dilluns a Divendres sense duplicar registres existents

WITH seeds(dia, inici, fi, vestidor, camp, team_id) AS (
    VALUES
        ('Dilluns',  '17:15', '18:45', 'Vestidor 1', 'Espai 1', ''),
        ('Dilluns',  '17:15', '18:45', 'Vestidor 2', 'Espai 2', ''),
        ('Dilluns',  '17:15', '18:45', 'Vestidor 3', 'Espai 3', ''),
        ('Dilluns',  '17:15', '18:45', 'Vestidor 4', 'Espai 4', ''),
        ('Dilluns',  '18:45', '20:15', 'Vestidor 5', 'Espai 1/2 (F11)', ''),
        ('Dilluns',  '18:45', '20:15', 'Vestidor 6', 'Espai 3/4 (F11)', ''),

        ('Dimarts',  '17:15', '18:45', 'Vestidor 1', 'Espai 1', ''),
        ('Dimarts',  '17:15', '18:45', 'Vestidor 2', 'Espai 2', ''),
        ('Dimarts',  '17:15', '18:45', 'Vestidor 3', 'Espai 3', ''),
        ('Dimarts',  '17:15', '18:45', 'Vestidor 4', 'Espai 4', ''),
        ('Dimarts',  '18:45', '20:15', 'Vestidor 5', 'Espai 1/2 (F11)', ''),
        ('Dimarts',  '18:45', '20:15', 'Vestidor 6', 'Espai 3/4 (F11)', ''),

        ('Dimecres', '17:15', '18:45', 'Vestidor 1', 'Espai 1', ''),
        ('Dimecres', '17:15', '18:45', 'Vestidor 2', 'Espai 2', ''),
        ('Dimecres', '17:15', '18:45', 'Vestidor 3', 'Espai 3', ''),
        ('Dimecres', '17:15', '18:45', 'Vestidor 4', 'Espai 4', ''),
        ('Dimecres', '18:45', '20:15', 'Vestidor 5', 'Espai 1/2 (F11)', ''),
        ('Dimecres', '18:45', '20:15', 'Vestidor 6', 'Espai 3/4 (F11)', ''),

        ('Dijous',   '17:15', '18:45', 'Vestidor 1', 'Espai 1', ''),
        ('Dijous',   '17:15', '18:45', 'Vestidor 2', 'Espai 2', ''),
        ('Dijous',   '17:15', '18:45', 'Vestidor 3', 'Espai 3', ''),
        ('Dijous',   '17:15', '18:45', 'Vestidor 4', 'Espai 4', ''),
        ('Dijous',   '18:45', '20:15', 'Vestidor 5', 'Espai 1/2 (F11)', ''),
        ('Dijous',   '18:45', '20:15', 'Vestidor 6', 'Espai 3/4 (F11)', ''),

        ('Divendres','17:15', '18:45', 'Vestidor 1', 'Espai 1', ''),
        ('Divendres','17:15', '18:45', 'Vestidor 2', 'Espai 2', ''),
        ('Divendres','17:15', '18:45', 'Vestidor 3', 'Espai 3', ''),
        ('Divendres','17:15', '18:45', 'Vestidor 4', 'Espai 4', ''),
        ('Divendres','18:45', '20:15', 'Vestidor 5', 'Espai 1/2 (F11)', ''),
        ('Divendres','18:45', '20:15', 'Vestidor 6', 'Espai 3/4 (F11)', '')
)
INSERT INTO horarios_entrenaments (team_id, dia, inici, fi, vestidor, camp)
SELECT s.team_id, s.dia, s.inici, s.fi, s.vestidor, s.camp
FROM seeds s
WHERE NOT EXISTS (
    SELECT 1
    FROM horarios_entrenaments h
    WHERE h.dia = s.dia
      AND h.inici = s.inici
      AND h.fi = s.fi
      AND COALESCE(h.vestidor, '') = COALESCE(s.vestidor, '')
      AND h.camp = s.camp
);
