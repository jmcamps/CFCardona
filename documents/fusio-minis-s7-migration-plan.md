# Pla d'unificació de Minis i S7 (CF Cardona) - Destí S7

Aquest document descriu l'estratègia per unificar els equips **Minis** i **S7** en una única secció combinada (**Minis-S7**), utilitzant **S7** com a equip base de destí i **s7.html** com la pàgina final de la interfície. Els horaris d'entrenament que es conserven són els de **S7**.

> **Nota prèvia:** La base de dades ja té l'equip unificat com a `Minis-S7` (id: 4), creat prèviament. Això simplifica el Pas 1. Cal verificar si els jugadors dels Minis ja estan assignats a l'equip id=4 o si continuen en un equip separat.

---

## 1. Nivell de Base de Dades (Migració SQL)

### Pas 1.1: Verificar l'estat actual dels equips
Comprovar si existeix encara un equip `Minis` separat o si ja estan tots a `Minis-S7` (id=4).

```sql
SELECT id, nom, categoria FROM equip WHERE nom IN ('Minis', 'S7', 'Minis-S7');
```

*L'equip destí és `Minis-S7` (id=4). Si hi ha un equip `Minis` separat, cal continuar amb els passos següents.*

### Pas 1.2: Renombrar el nom de la BD (si cal)
L'equip `Minis-S7` ja existeix (id=4) i ja té el nom correcte. Si cal, confirmar categoria:
```sql
UPDATE equip
SET nom = 'Minis-S7',
    categoria = 'Minis-S7'
WHERE id = 4;
```

### Pas 1.3: Transferir Jugadors de Minis cap a Minis-S7
Reasignar tots els jugadors que quedin en un equip `Minis` separat a l'equip unificat (id=4):
```sql
UPDATE jugador
SET equip_id = 4
WHERE equip_id = <id_minis_separat>;
```

### Pas 1.4: Resoldre conflictes de Staff
* **Estratègia proposada**:
  1. Eliminar temporalment les assignacions de staff de l'equip Minis separat:
     ```sql
     DELETE FROM equip_staff_assignacio WHERE equip_id = <id_minis_separat>;
     ```
  2. Reasignar des del panell de control web (o via SQL) els tècnics dels Minis als nous rols en l'equip unificat (id=4).

### Pas 1.5: Conservar els horaris de S7 — Eliminar els de Minis
Tal com indica el pla, els horaris d'entrenament de l'equip unificat seran els de **S7**, que ja estan associats a l'equip id=4 (Minis-S7). Si hi ha horaris de Minis separats, cal eliminar-los per evitar duplicats:

```sql
-- Verificar horaris existents de l'equip id=4
SELECT * FROM horari_entrenaments WHERE equip_id = 4;

-- Si existís un equip Minis separat amb horaris propis, eliminar-los:
DELETE FROM horari_entrenaments WHERE equip_id = <id_minis_separat>;

-- NO cal transferir els de S7 perquè ja estan a l'equip id=4
```

### Pas 1.6: Transferir Partits i Observacions de Minis cap a S7
```sql
-- Transferir partits amistosos i torneigs
UPDATE amistos SET equip_id = 4 WHERE equip_id = <id_minis_separat>;

-- Transferir comentaris/observacions d'equip
UPDATE comentari SET equip_id = 4 WHERE equip_id = <id_minis_separat>;
```

### Pas 1.7: Eliminar l'equip Minis separat (si existia)
Un cop tota la informació dependent s'ha traslladat, eliminar el registre Minis separat:
```sql
DELETE FROM equip WHERE id = <id_minis_separat>;
```

### Pas 1.8: Unificar seccions_data de Minis i S7
A la taula `seccions_data`, existeixen dos registres:
- `scope = 'seccio_minis'` → dades guardades de la pàgina Minis
- `scope = 'seccio_s7'` → dades guardades de la pàgina S7

**Estratègia**: Mantenir `seccio_s7` com a scope de destí (perquè la pàgina destí és `s7.html`), fusionant les dades JSON de `seccio_minis` (partits, observacions) cap a `seccio_s7`. Els **horaris** de `seccio_minis` es **descarten** (es conserven els de `seccio_s7`).

```javascript
// Script de fusió a executar via node:
// 1. Llegir seccio_minis i seccio_s7
// 2. Fusionar partits de minis → s7 (concatenar)
// 3. Fusionar observacions de minis → s7 (concatenar)
// 4. Conservar horaris de s7 intactes (no copiar els de minis)
// 5. Esborrar o buidar seccio_minis
```

---

## 2. Nivell d'Interfície (Arxius i Navegació)

### Pas 2.1: Consolidació de Pàgines
1. **Mantenir pàgina**: `s7.html` com la pàgina de destí unificada (Minis-S7).
2. **Eliminar pàgina**: `minis.html` (pàgina obsoleta).

### Pas 2.2: Actualitzar la navegació global (`top-nav.js`)
Modificar `top-nav.js`:

1. **Eliminar la propietat `minis`** del mapa de links (línia 22 aprox.) i mantenir `s7`:
   ```diff
   - minis: `${base}/seccions/minis.html`,
     s7: `${base}/seccions/s7.html`,
   ```

2. **Unificar el botó** al menú desplegable de Futbol Base Masculí apuntant a `s7.html` com la secció Minis-S7:
   ```diff
   - <a class="cf-nav-feature-sub" href="${links.minis}">
   -     <span class="cf-nav-feature-sub-title">Minis</span>
   -     <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2021 i 2022.</span>
   - </a>
   - <a class="cf-nav-feature-sub" href="${links.s7}">
   -     <span class="cf-nav-feature-sub-title">S7</span>
   -     <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2020.</span>
   - </a>
   + <a class="cf-nav-feature-sub" href="${links.s7}">
   +     <span class="cf-nav-feature-sub-title">Minis-S7</span>
   +     <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2020, 2021 i 2022.</span>
   + </a>
   ```

3. **Actualitzar `teamPageTitles`** (línia 777-778 aprox.):
   ```diff
   - 'minis.html': 'Minis',
   - 's7.html': 'S7',
   + 's7.html': 'Minis-S7',
   ```

### Pas 2.3: Ajustos a la pàgina `s7.html` (pàgina de destí unificada)

En el `<script>` de `s7.html` (línia 388-402 aprox.):

1. **Actualitzar `TARGET_YEAR` per acceptar múltiples anys**:
   La captació ara buscarà jugadors nascuts en 2020, 2021 i 2022:
   ```diff
   - const TARGET_YEAR=2020;
   + const TARGET_YEARS=[2020, 2021, 2022];
   ```

2. **Actualitzar `TEAM_NAME`**:
   ```diff
   - if(PAGE_SLUG==='minis') return 'Minis';
   + if(PAGE_SLUG==='minis') return 'Minis-S7';
     if(/^s\d+$/i.test(PAGE_SLUG)) return PAGE_SLUG.toUpperCase();
     const fromKey=String(KEY||'').replace(/^seccio_/,'').replace(/-/g,' ').trim();
   ```
   Afegir gestió del slug `s7` per retornar `Minis-S7`:
   ```diff
     if(/^s\d+$/i.test(PAGE_SLUG)) return PAGE_SLUG.toUpperCase();
   + if(PAGE_SLUG==='s7') return 'Minis-S7';
   ```
   O millor, canviar directament el `TEAM_NAME` a un literal:
   ```javascript
   const TEAM_NAME='Minis-S7';
   ```

3. **Actualitzar `loadCaptacioSuggestions()`** per acceptar qualsevol dels tres anys:
   ```diff
   - const yearMatch=Number.isFinite(year) && year===TARGET_YEAR;
   + const yearMatch=Number.isFinite(year) && TARGET_YEARS.includes(year);
   ```

4. **Actualitzar el títol de la pàgina** (`<title>`):
   ```diff
   - <title>S7 | CF Cardona</title>
   + <title>Minis-S7 | CF Cardona</title>
   ```

---

## 3. Pla d'Execució

### Ordre recomanat:
1. **Verificar BD** → comprovar si Minis existeix com a equip separat o ja tot és Minis-S7 (id=4)
2. **Fusionar seccions_data** → script node per unir partits/obs de `seccio_minis` a `seccio_s7`
3. **Actualitzar s7.html** → canvis de codi (TARGET_YEARS, TEAM_NAME, títol)
4. **Actualitzar top-nav.js** → eliminar `minis`, unificar menú, actualitzar `teamPageTitles`
5. **Eliminar minis.html** → eliminar el fitxer obsolet
6. **Verificar** → obrir `s7.html` al navegador i confirmar que tot carrega correctament

---

## 4. Pla de Verificació

### Tests automàtics:
- Obrir `s7.html` i confirmar que el títol de pàgina mostra `Minis-S7`
- Verificar que la captació mostra jugadors dels anys 2020, 2021 i 2022
- Comprovar que els horaris d'entrenament carregats corresponen als de S7
- Comprovar que el menú desplegable no mostra `Minis` com a entrada separada

### Verificació manual:
- Confirmar que la URL `minis.html` ja no existeix (redirigir o mostrar 404)
- Revisar que `EQUIP_ID` resol correctament a `4` (`Minis-S7`)
- Confirmar que les dades de jugadors de Minis (si n'hi havia) apareixen a la plantilla
