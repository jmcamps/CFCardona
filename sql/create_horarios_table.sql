-- Copia i executa aquest script al SQL Editor de Supabase (Dashboard > SQL Editor > New Query)
-- Això crea la taula horarios_entrenaments per a la pàgina horari-entrenaments.html

CREATE TABLE IF NOT EXISTS horarios_entrenaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id TEXT NOT NULL,
    dia TEXT NOT NULL,
    inici TEXT NOT NULL,
    fi TEXT NOT NULL,
    vestidor TEXT,
    camp TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índex per a queries més ràpides
CREATE INDEX IF NOT EXISTS idx_horarios_team_id ON horarios_entrenaments(team_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia ON horarios_entrenaments(dia);

-- Enable RLS (Row Level Security) per permetre accés sense autenticació
ALTER TABLE horarios_entrenaments ENABLE ROW LEVEL SECURITY;

-- Policy per a SELECT (permitir accés públic)
CREATE POLICY "Allow public read access on horarios_entrenaments" 
    ON horarios_entrenaments FOR SELECT 
    USING (true);

-- Policy per a INSERT/UPDATE/DELETE (permitir accés públic)
-- ⚠️ ATENCIÓ: Això és permisor (producció hauria de usar JWT)
CREATE POLICY "Allow public write access on horarios_entrenaments" 
    ON horarios_entrenaments FOR ALL 
    USING (true) 
    WITH CHECK (true);
