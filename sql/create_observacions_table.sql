-- Taula comuna d'observacions per reutilitzar a múltiples pàgines
-- Exemples de scope: 'seccio_comissio', 'seccio_senior', 'seccio_filial'

CREATE TABLE IF NOT EXISTS observacions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope TEXT NOT NULL,
    autor TEXT NOT NULL DEFAULT 'Anònim',
    data DATE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_observacions_scope ON observacions(scope);
CREATE INDEX IF NOT EXISTS idx_observacions_scope_data ON observacions(scope, data DESC);

ALTER TABLE observacions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on observacions"
    ON observacions FOR SELECT
    USING (true);

CREATE POLICY "Allow public write access on observacions"
    ON observacions FOR ALL
    USING (true)
    WITH CHECK (true);
