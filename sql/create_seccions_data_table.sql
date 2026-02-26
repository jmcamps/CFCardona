-- Taula de seccions (substitueix app_state)
-- Guarda una fila per scope: seccio_primer-equip, seccio_filial, etc.

CREATE TABLE IF NOT EXISTS seccions_data (
    scope TEXT PRIMARY KEY,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seccions_data_scope ON seccions_data(scope);

ALTER TABLE seccions_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on seccions_data"
    ON seccions_data FOR SELECT
    USING (true);

CREATE POLICY "Allow public write access on seccions_data"
    ON seccions_data FOR ALL
    USING (true)
    WITH CHECK (true);

-- MIGRACIÓ opcional des de app_state (si existeix)
-- Copia dades del payload JSON en files separades per scope
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'app_state'
    ) THEN
        INSERT INTO seccions_data (scope, payload)
        SELECT kv.key AS scope,
               (kv.value::jsonb - 'observacions') AS payload
        FROM app_state a,
             LATERAL jsonb_each(a.payload::jsonb) kv
        WHERE kv.key LIKE 'seccio_%'
        ON CONFLICT (scope) DO UPDATE
        SET payload = EXCLUDED.payload;
    END IF;
END $$;
