-- Crea taula per guardar snapshots de configuracions d'horaris entrenaments
-- Permet guardar, restaurar i gestionar versions anteriors de les planificacions

CREATE TABLE IF NOT EXISTS horarios_snapshots (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índex per buscar ràpidament per nom
CREATE INDEX IF NOT EXISTS idx_horarios_snapshots_name ON horarios_snapshots(name);

-- Índex per ordenar per data
CREATE INDEX IF NOT EXISTS idx_horarios_snapshots_created_at ON horarios_snapshots(created_at DESC);

-- Comentari descriptiu de la taula
COMMENT ON TABLE horarios_snapshots IS 'Snapshots de configuracions completes d''horaris d''entrenament per a control de versions';
COMMENT ON COLUMN horarios_snapshots.name IS 'Nom descriptiu del snapshot (ex: "Config inicial", "Després canvi S14")';
COMMENT ON COLUMN horarios_snapshots.description IS 'Descripció opcional dels canvis o raó del snapshot';
COMMENT ON COLUMN horarios_snapshots.data IS 'Dades completes dels horarios_entrenaments en format JSON';
COMMENT ON COLUMN horarios_snapshots.created_at IS 'Data i hora de creació del snapshot';
COMMENT ON COLUMN horarios_snapshots.updated_at IS 'Data i hora de l''última actualització';
