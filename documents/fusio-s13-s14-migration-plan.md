# Plan de unificación de S13 y S14 (CF Cardona) - Destino S14

Este documento describe la estrategia modificada para unificar los equipos **S13** y **S14** en una única sección combinada (**S13-S14**), utilizando **S14** como el equipo base de destino y **s14.html** como la página final de la interfaz.

---

## 1. Nivel de Base de Datos (Migración SQL)

Transferiremos toda la información (jugadores, staff, horarios y partidos) del equipo S13 al S14, renombraremos el S14 y eliminaremos el S13.

### Paso 1.1: Identificar IDs de los equipos
Localizaremos los identificadores únicos (`id`) de ambos equipos en la tabla `equip`.
```sql
SELECT id, nom FROM equip WHERE nom IN ('S13', 'S14');
```
*Asumiremos para los siguientes pasos que `id_s13` es el ID de S13 y `id_s14` es el ID de S14.*

### Paso 1.2: Renombrar el equipo S14
Modificaremos el nombre y la categoría del S14 para reflejar la unión:
```sql
UPDATE equip 
SET nom = 'S13-S14', 
    categoria = 'S13-S14' 
WHERE id = <id_s14>;
```

### Paso 1.3: Transferir Jugadores del S13 al S14
Reasignamos todos los jugadores pertenecientes al S13 al equipo unificado (S14):
```sql
UPDATE jugador 
SET equip_id = <id_s14> 
WHERE equip_id = <id_s13>;
```

### Paso 1.4: Resolver conflictos de Staff
* **Estrategia propuesta**: 
  1. Eliminar temporalmente las asignaciones de staff del S13:
     ```sql
     DELETE FROM equip_staff_assignacio WHERE equip_id = <id_s13>;
     ```
  2. Tras la fusión, desde el panel de control de la web (o mediante SQL), reasignar a los técnicos del S13 sobrantes a los nuevos roles en el equipo unificado S14.

### Paso 1.5: Transferir Partidos, Horarios y Observaciones del S13 al S14
```sql
-- Transferir partidos amistosos y torneos
UPDATE amistos SET equip_id = <id_s14> WHERE equip_id = <id_s13>;

-- Transferir horarios de entrenamientos
UPDATE horari_entrenaments SET equip_id = <id_s14> WHERE equip_id = <id_s13>;

-- Transferir comentarios/observaciones de equipo
UPDATE comentari SET equip_id = <id_s14> WHERE equip_id = <id_s13>;
```

### Paso 1.6: Eliminar el equipo S13 sobrante
Una vez que toda la información dependiente se ha trasladado, eliminamos el registro S13:
```sql
DELETE FROM equip WHERE id = <id_s13>;
```

---

## 2. Nivel de Interfaz (Archivos y Navegación)

### Paso 2.1: Consolidación de Páginas
1. **Mantener página**: Mantendremos y actualizaremos s14.html como la página de destino unificada.
2. **Eliminar página**: Eliminaremos el archivo obsoleto s13.html.

### Paso 2.2: Actualizar la navegación global (`top-nav.js`)
Modificaremos top-nav.js:
1. Eliminar la propiedad `s13` y mantener `s14` pero asociándole la etiqueta del grupo combinado:
   ```diff
   - s13: `${base}/seccions/s13.html`,
   - s14: `${base}/seccions/s14.html`,
   + s14: `${base}/seccions/s14.html`,
   ```
2. Unificar el botón en el menú desplegable de Futbol Base Masculí apuntando a `s14.html` como la sección de S13-S14:
   ```diff
   - <a class="cf-nav-feature-sub" href="${links.s13}">
   -     <span class="cf-nav-feature-sub-title">S13</span>
   -     <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2014.</span>
   - </a>
   - <a class="cf-nav-feature-sub" href="${links.s14}">
   -     <span class="cf-nav-feature-sub-title">S14</span>
   -     <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2013.</span>
   - </a>
   + <a class="cf-nav-feature-sub" href="${links.s14}">
   +     <span class="cf-nav-feature-sub-title">S13-S14</span>
   +     <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2013 i 2014.</span>
   + </a>
   ```

### Paso 2.3: Ajustes en la lógica de la página `s14.html`
En el script de la página `s14.html` (que ahora representa al grupo unificado):
1. **Configuración de clave**:
   Se mantendrá `KEY = 'seccio_s14'` (así no se rompe la persistencia local de los datos actuales que ya estuvieran bajo esta clave).
2. **Ajuste de años objetivos para Captación**:
   La captación ahora buscará nacidos en ambos años correspondientes:
   ```javascript
   const S13_14_TARGET_YEARS = [2013, 2014];
   ```
3. **Actualización de `loadCaptacioSuggestions()`**:
   Modificar la condición de filtrado de captación para que acepte cualquiera de los dos años:
   ```javascript
   captacioSuggestions = players.filter(p => {
       const year = Number(p.any_naixement);
       const yearMatch = Number.isFinite(year) && S13_14_TARGET_YEARS.includes(year);
       const genderMatch = normalizeGender(p.genere) === targetGender;
       return yearMatch && genderMatch;
   });
   ```
