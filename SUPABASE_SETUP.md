# Configuración Supabase (Local + Render)

## 1) Crear tabla en Supabase
En el SQL Editor de Supabase ejecuta:

```sql
create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb
);
```

## 2) Variables en local
1. Copia `.env.example` a `.env`.
2. Rellena:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 3) Variables en Render
En tu servicio de Render, añade en **Environment**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 4) Verificación rápida
- Arranca local: `npm start`
- Debe aparecer en logs: `Persistència activa a Supabase (app_state.cfcardona_main)`
- Haz cambios en la app y comprueba en Supabase que existe/actualiza la fila `id = 'cfcardona_main'`.
