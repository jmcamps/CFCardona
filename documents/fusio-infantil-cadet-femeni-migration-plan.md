# Pla d'unificacio d'Infantil Femeni i Cadet Femeni (CF Cardona) - Desti Cadet Femeni

Aquest document descriu l'estrategia per unificar els equips **Infantil Femeni** i **Cadet Femeni** en una unica seccio combinada (**Infantil-Cadet Femeni**), utilitzant **Cadet Femeni** com a equip base de desti i **cadet-femeni.html** com la pagina final de la interficie.

> **Nota previa:** A les pagines actuals, `cadet-femeni.html` treballa amb `EQUIP_ID=15` i `KEY='seccio_cadet-femeni'`, mentre que `infantil-femeni.html` treballa amb `EQUIP_ID=16` i `KEY='seccio_infantil-femeni'`.

---

## 1. Nivell de Base de Dades (Migracio SQL)

Transferirem tota la informacio dependent de l'equip Infantil Femeni cap al Cadet Femeni, reanomenarem el Cadet Femeni i eliminarem l'equip Infantil Femeni separat.

### Pas 1.1: Verificar IDs dels equips
Confirmar els identificadors reals dels dos equips abans d'executar cap canvi:

```sql
SELECT id, nom, categoria
FROM equip
WHERE id IN (15, 16)
   OR nom IN ('Infantil Femení', 'Infantil Femeni', 'Cadet Femení', 'Cadet Femeni', 'Infantil-Cadet Femení', 'Infantil-Cadet Femeni');
```

*Segons el codi actual, assumim que `id_cadet_femeni = 15` i `id_infantil_femeni = 16`. Si la consulta retorna IDs diferents, cal substituir-los als passos seguents.*

### Pas 1.2: Renombrar l'equip Cadet Femeni
Modificar el nom i la categoria del Cadet Femeni per reflectir la unio:

```sql
UPDATE equip
SET nom = 'Infantil-Cadet Femení',
    categoria = 'Infantil-Cadet Femení'
WHERE id = 15;
```

### Pas 1.3: Transferir jugadores d'Infantil Femeni cap a Cadet Femeni
Reassignar totes les jugadores de l'Infantil Femeni a l'equip unificat:

```sql
UPDATE jugador
SET equip_id = 15
WHERE equip_id = 16;
```

### Pas 1.4: Resoldre conflictes de staff
* **Estrategia proposada**:
  1. Eliminar temporalment les assignacions de staff de l'Infantil Femeni:
     ```sql
     DELETE FROM equip_staff_assignacio WHERE equip_id = 16;
     ```
  2. Reassignar des del panell de control web (o via SQL) les entrenadores i entrenadors sobrants als nous rols de l'equip unificat (id=15).

### Pas 1.5: Transferir partits, horaris i observacions d'Infantil Femeni cap a Cadet Femeni
```sql
-- Transferir partits amistosos i torneigs
UPDATE amistos SET equip_id = 15 WHERE equip_id = 16;

-- Transferir horaris d'entrenament
UPDATE horari_entrenaments SET equip_id = 15 WHERE equip_id = 16;

-- Transferir comentaris/observacions d'equip
UPDATE comentari SET equip_id = 15 WHERE equip_id = 16;
```

> Si es vol conservar nomes els horaris del Cadet Femeni, substituir l'`UPDATE horari_entrenaments` per una revisio manual i eliminar els horaris duplicats de l'equip id=16.

### Pas 1.6: Eliminar l'equip Infantil Femeni separat
Un cop tota la informacio dependent s'ha traslladat, eliminar el registre Infantil Femeni:

```sql
DELETE FROM equip WHERE id = 16;
```

### Pas 1.7: Unificar `seccions_data`
A la taula `seccions_data`, hi pot haver dos registres:
- `scope = 'seccio_infantil-femeni'` -> dades guardades de la pagina Infantil Femeni
- `scope = 'seccio_cadet-femeni'` -> dades guardades de la pagina Cadet Femeni

**Estrategia**: mantenir `seccio_cadet-femeni` com a scope de desti, perque la pagina final sera `cadet-femeni.html`, i fusionar-hi les dades de `seccio_infantil-femeni`.

```javascript
// Script de fusio a executar via node:
// 1. Llegir seccio_infantil-femeni i seccio_cadet-femeni
// 2. Fusionar partits d'infantil -> cadet (concatenar i ordenar per data)
// 3. Fusionar observacions d'infantil -> cadet (concatenar)
// 4. Fusionar horaris si es volen conservar tots; si no, mantenir els de cadet
// 5. Revisar camps de staff i competicio manualment per evitar sobreescriure dades bones
// 6. Esborrar o arxivar seccio_infantil-femeni
```

---

## 2. Nivell d'Interficie (Arxius i Navegacio)

### Pas 2.1: Consolidacio de pagines
1. **Mantenir pagina**: `cadet-femeni.html` com la pagina de desti unificada (**Infantil-Cadet Femeni**).
2. **Eliminar pagina**: `infantil-femeni.html` com a pagina obsoleta.

### Pas 2.2: Actualitzar la navegacio global (`assets/js/top-nav.js`)
Modificar `top-nav.js`:

1. Eliminar la propietat `infantilFemeni` i mantenir `cadetFemeni` apuntant a `cadet-femeni.html`:
   ```diff
   - infantilFemeni: `${base}/seccions/infantil-femeni.html`,
     cadetFemeni: `${base}/seccions/cadet-femeni.html`,
   ```

2. Unificar els botons del menu de Futbol Femeni en una sola entrada:
   ```diff
   - <a class="cf-nav-feature-sub" href="${links.infantilFemeni}">
   -     <span class="cf-nav-feature-sub-title">Infantil Femení</span>
   - </a>
   - <a class="cf-nav-feature-sub" href="${links.cadetFemeni}">
   -     <span class="cf-nav-feature-sub-title">Cadet Femení</span>
   - </a>
   + <a class="cf-nav-feature-sub" href="${links.cadetFemeni}">
   +     <span class="cf-nav-feature-sub-title">Infantil-Cadet Femení</span>
   + </a>
   ```

3. Actualitzar `teamPageTitles`:
   ```diff
   - 'infantil-femeni.html': 'Infantil Femení',
   - 'cadet-femeni.html': 'Cadet Femení',
   + 'cadet-femeni.html': 'Infantil-Cadet Femení',
   ```

### Pas 2.3: Actualitzar altres llistats interns
Hi ha referencies a `seccio_cadet-femeni` com a `Cadet Femení` en aquests fitxers:
- `seccions/comissio-esportiva.html`
- `seccions/f11.html`
- `seccions/f7.html`
- `seccions/futbol-base-femeni.html`
- `seccions/futbol-base-masculi.html`
- `seccions/futbol-base.html`
- `seccions/senior.html`

Cal actualitzar l'etiqueta visible:

```diff
- { id: 'seccio_cadet-femeni', name: 'Cadet Femení' }
+ { id: 'seccio_cadet-femeni', name: 'Infantil-Cadet Femení' }
```

Si algun d'aquests llistats tambe conte `seccio_infantil-femeni`, cal eliminar aquesta entrada o substituir-la per `seccio_cadet-femeni`.

### Pas 2.4: Ajustos a `cadet-femeni.html`
En el `<script>` de `cadet-femeni.html`:

1. **Mantenir l'equip i scope de desti**:
   ```javascript
   const EQUIP_ID = 15;
   const KEY = 'seccio_cadet-femeni';
   ```

2. **Actualitzar els anys objectiu per captacio**:
   Actualment Cadet Femeni filtra 2011-2012 i Infantil Femeni filtra 2013-2014. La seccio unificada ha d'acceptar tots quatre anys:
   ```diff
   - const TARGET_MIN_YEAR=2011;
   - const TARGET_MAX_YEAR=2012;
   + const TARGET_YEARS=[2011, 2012, 2013, 2014];
   ```

3. **Actualitzar `loadCaptacioSuggestions()`**:
   ```diff
   - const yearMatch=Number.isFinite(year) && year>=TARGET_MIN_YEAR && year<=TARGET_MAX_YEAR;
   + const yearMatch=Number.isFinite(year) && TARGET_YEARS.includes(year);
   ```

4. **Actualitzar el titol HTML**:
   ```diff
   - <title>Cadet Femení | CF Cardona</title>
   + <title>Infantil-Cadet Femení | CF Cardona</title>
   ```

5. **Revisar textos visibles**:
   Canviar qualsevol text residual `Cadet Femení` per `Infantil-Cadet Femení`, mantenint les paraules en femeni (`jugadores`, `captacio`, etc.).

---

## 3. Pla d'Execucio

### Ordre recomanat:
1. **Verificar BD** -> confirmar que Infantil Femeni es id=16 i Cadet Femeni es id=15
2. **Fusionar dades de BD** -> jugadores, partits, horaris i observacions cap a id=15
3. **Fusionar `seccions_data`** -> migrar dades de `seccio_infantil-femeni` cap a `seccio_cadet-femeni`
4. **Actualitzar `cadet-femeni.html`** -> titol, anys de captacio i textos visibles
5. **Actualitzar navegacio** -> `top-nav.js` i llistats interns amb el nou nom
6. **Eliminar `infantil-femeni.html`** -> retirar la pagina obsoleta
7. **Verificar** -> obrir `cadet-femeni.html` i confirmar que la seccio unificada funciona

---

## 4. Pla de Verificacio

### Tests automatics:
- Obrir `cadet-femeni.html` i confirmar que el titol de pagina mostra `Infantil-Cadet Femení`
- Verificar que `EQUIP_ID` continua sent `15`
- Verificar que `KEY` continua sent `seccio_cadet-femeni`
- Comprovar que la captacio mostra jugadores nascudes el 2011, 2012, 2013 i 2014
- Comprovar que el menu desplegable ja no mostra `Infantil Femení` i `Cadet Femení` com a entrades separades

### Verificacio manual:
- Confirmar que les jugadores d'Infantil Femeni apareixen dins la plantilla unificada
- Confirmar que partits, tornejos, observacions i horaris s'han conservat o fusionat segons el criteri decidit
- Revisar staff i competicio manualment per evitar dades duplicades o sobreescrites
- Confirmar que `infantil-femeni.html` ja no queda enllacat des de cap punt de la navegacio
