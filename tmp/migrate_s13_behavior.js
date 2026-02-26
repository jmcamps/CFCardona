const fs = require('fs');
const path = require('path');

const base = 'c:/Work/CFCardona/seccions';
const files = [
  { file: 'minis.html', key: 'seccio_minis', year: 2021, minPlayers: 9, minLabel: 'F7' },
  { file: 's7.html', key: 'seccio_s7', year: 2020, minPlayers: 9, minLabel: 'F7' },
  { file: 's8.html', key: 'seccio_s8', year: 2019, minPlayers: 9, minLabel: 'F7' },
  { file: 's9.html', key: 'seccio_s9', year: 2018, minPlayers: 9, minLabel: 'F7' },
  { file: 's10.html', key: 'seccio_s10', year: 2017, minPlayers: 9, minLabel: 'F7' },
  { file: 's11.html', key: 'seccio_s11', year: 2016, minPlayers: 9, minLabel: 'F7' },
  { file: 's12.html', key: 'seccio_s12', year: 2015, minPlayers: 9, minLabel: 'F7' },
  { file: 's14.html', key: 'seccio_s14', year: 2013, minPlayers: 15, minLabel: 'F11' },
  { file: 's16.html', key: 'seccio_s16', year: 2011, minPlayers: 15, minLabel: 'F11' }
];

function buildScript({ key, year, minPlayers, minLabel }) {
  return `    <script>
        const API='/api/players';
        const API_JUGADORS='/api/jugadors';
        const API_JUGADORS_SEGUIMENT='/api/jugadors-seguiment';
        const API_EQUIP_CONFIG='/api/equip-config';
        const API_HORARIOS='/api/horarios';
        const API_EQUIPS='/api/equips';
        const KEY='${key}';
        const STORAGE_KEY=\`${'${KEY}_local'}\`;
        const IS_FILE=window.location.protocol==='file:';
        const TARGET_YEAR=${year};
        const TARGET_GENDER='Masculí';
        const MIN_PLAYERS=${minPlayers};
        const MIN_LABEL='${minLabel}';
        const PAGE_SLUG=((window.location.pathname||'').split('/').pop()||'').replace(/\\.html$/i,'').trim().toLowerCase();
        const TEAM_NAME=(function resolveTeamNameFromPage(){
            if(PAGE_SLUG==='minis') return 'Minis';
            if(/^s\\d+$/i.test(PAGE_SLUG)) return PAGE_SLUG.toUpperCase();
            const fromKey=String(KEY||'').replace(/^seccio_/,'').replace(/-/g,' ').trim();
            if(/^s\\d+$/i.test(fromKey)) return fromKey.toUpperCase();
            return fromKey.charAt(0).toUpperCase()+fromKey.slice(1);
        })();

        let EQUIP_ID=null;
        let db={},observacions=[],horaris=[],partits=[],plantilla=[],captacioSuggestions=[];
        const SF=["s_primer_entrenador_nom","s_primer_entrenador_tel","s_segon_entrenador_nom","s_segon_entrenador_tel","s_tercer_entrenador_nom","s_tercer_entrenador_tel"];

        function normalizeDate(value){
            if(!value) return '';
            if(/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return value;
            if(/^\\d{2}-\\d{2}-\\d{4}$/.test(value)){
                const parts=value.split('-');
                return \`${'${parts[2]}-${parts[1]}-${parts[0]}'}\`;
            }
            return '';
        }

        function normalizeBirthYear(value){
            if(value===null||value===undefined) return '';
            const raw=String(value).trim();
            if(!raw) return '';
            if(/^\\d{4}$/.test(raw)) return raw;
            if(/^\\d{4}-\\d{2}-\\d{2}$/.test(raw)) return raw.slice(0,4);
            if(/^\\d{2}-\\d{2}-\\d{4}$/.test(raw)) return raw.slice(-4);
            return '';
        }

        function isValidBirthYear(yearValue){
            const yearText=normalizeBirthYear(yearValue);
            if(!yearText) return false;
            const year=Number(yearText);
            return Number.isInteger(year) && year>=1900 && year<=2100;
        }

        function isNumericId(value){
            return /^\\d+$/.test(String(value||'').trim());
        }

        function normalizeName(value){
            return String(value||'')
                .normalize('NFD')
                .replace(/[\\u0300-\\u036f]/g,'')
                .toLowerCase()
                .trim()
                .replace(/\\s+/g,' ');
        }

        function normalizeGender(value){
            return String(value||'')
                .normalize('NFD')
                .replace(/[\\u0300-\\u036f]/g,'')
                .toLowerCase()
                .trim();
        }

        async function resolveEquipId(){
            if(IS_FILE){
                EQUIP_ID=null;
                return;
            }
            try{
                const r=await fetch(API_EQUIPS);
                if(!r.ok){
                    const errorText=await r.text();
                    throw new Error(\`GET equips ${'${r.status}'}: ${'${errorText}'}\`);
                }
                const equips=await r.json();
                if(!Array.isArray(equips)){
                    EQUIP_ID=null;
                    return;
                }
                const expected=normalizeName(TEAM_NAME);
                let match=equips.find(e=>normalizeName(e.name||e.nom||'')===expected);
                if(!match){
                    match=equips.find(e=>normalizeName(e.name||e.nom||'').includes(expected) || expected.includes(normalizeName(e.name||e.nom||'')));
                }
                EQUIP_ID=match ? String(match.id ?? match.equip_id ?? '').trim() || null : null;
            }catch(e){
                console.warn('No s\\'ha pogut resoldre l\\'equip:', e);
                EQUIP_ID=null;
            }
        }

        function isHorariForEquip(horari){
            if(!EQUIP_ID) return false;
            const rawId = horari && (horari.team_id ?? horari.equip_id ?? '');
            const id = String(rawId || '').trim();
            return id === String(EQUIP_ID);
        }

        function loadFromStorage(){
            try{
                const raw=localStorage.getItem(STORAGE_KEY);
                return raw?JSON.parse(raw):{};
            }catch(e){
                return {};
            }
        }

        function saveToStorage(){
            try{
                localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
            }catch(e){
                console.warn('No es pot guardar a localStorage');
            }
        }

        async function loadCaptacioSuggestions(){
            captacioSuggestions=[];
            try{
                let players=[];
                if(!IS_FILE){
                    const r=await fetch(API_JUGADORS_SEGUIMENT);
                    if(!r.ok){
                        const errorText=await r.text();
                        throw new Error(\`GET jugadors-seguiment ${'${r.status}'}: ${'${errorText}'}\`);
                    }
                    players=await r.json();
                }else if(Array.isArray(db.captacio_futbol_base) && db.captacio_futbol_base.length){
                    players=db.captacio_futbol_base;
                }else{
                    const raw=localStorage.getItem('captacio_futbol_base_local');
                    if(raw){
                        const localData=JSON.parse(raw);
                        players=localData.captacio_futbol_base||[];
                    }
                }
                const targetGender=normalizeGender(TARGET_GENDER);
                captacioSuggestions=(Array.isArray(players)?players:[]).filter(p=>{
                    const year=Number(normalizeBirthYear(p.any_naixement ?? p.naixement ?? ''));
                    const yearMatch=Number.isFinite(year) && year===TARGET_YEAR;
                    const genderMatch=normalizeGender(p.genere)===targetGender;
                    return yearMatch && genderMatch;
                });
                captacioSuggestions.sort((a,b)=>String(a.nom||'').localeCompare(String(b.nom||'')));
            }catch(e){
                console.warn('Error carregant captació:',e);
            }
        }

        async function load(){
            try{
                await resolveEquipId();
                if(!IS_FILE){
                    const r=await fetch(API);
                    if(!r.ok){
                        const errorText=await r.text();
                        throw new Error(\`GET ${'${r.status}'}: ${'${errorText}'}\`);
                    }
                    db=await r.json();
                }else{
                    db=loadFromStorage();
                }
                const d=db[KEY]||{};
                if(document.getElementById('descripcio')) document.getElementById('descripcio').value=d.descripcio||'';

                if(!IS_FILE && EQUIP_ID){
                    const rc=await fetch(\`${'${API_EQUIP_CONFIG}'}?equipId=${'${encodeURIComponent(EQUIP_ID)}'}\`);
                    if(!rc.ok){
                        const errorText=await rc.text();
                        throw new Error(\`GET equip-config ${'${rc.status}'}: ${'${errorText}'}\`);
                    }
                    const cfg=await rc.json();
                    SF.forEach(f=>{const el=document.getElementById(f);if(el)el.value=cfg[f]||'';});
                    ['comp_categoria','comp_temporada','comp_url'].forEach(f=>{
                        const el=document.getElementById(f); if(el) el.value=cfg[f]||'';
                    });
                }else{
                    SF.forEach(f=>{const el=document.getElementById(f);if(el)el.value=d[f]||'';});
                    ['comp_categoria','comp_temporada','comp_url','coord_nom','coord_tel'].forEach(f=>{
                        const el=document.getElementById(f); if(el) el.value=d[f]||'';
                    });
                }

                partits=d.partits||[];
                observacions=d.observacions||[];

                if(!IS_FILE && EQUIP_ID){
                    const rh=await fetch(API_HORARIOS);
                    if(!rh.ok){
                        const errorText=await rh.text();
                        throw new Error(\`GET horarios ${'${rh.status}'}: ${'${errorText}'}\`);
                    }
                    const allHoraris=await rh.json();
                    horaris=Array.isArray(allHoraris) ? allHoraris.filter(isHorariForEquip) : [];
                }else if(IS_FILE){
                    horaris=d.horaris||[];
                }else{
                    horaris=[];
                }

                if(!IS_FILE && EQUIP_ID){
                    const rp=await fetch(\`${'${API_JUGADORS}'}?equipId=${'${encodeURIComponent(EQUIP_ID)}'}\`);
                    if(!rp.ok){
                        const errorText=await rp.text();
                        throw new Error(\`GET jugadors ${'${rp.status}'}: ${'${errorText}'}\`);
                    }
                    const jugadors=await rp.json();
                    plantilla=Array.isArray(jugadors)?jugadors.map(j=>({
                        id:j.id,
                        nom:j.nom||'',
                        naixement:normalizeBirthYear(j.any_naixement||j.naixement||''),
                        revisio:!!j.revisio
                    })):[];
                }else if(IS_FILE && Object.prototype.hasOwnProperty.call(d,'plantilla')){
                    plantilla=Array.isArray(d.plantilla)?d.plantilla:[];
                }else{
                    plantilla=[];
                }
            }catch(e){
                console.warn('Servidor no disponible');
                if(IS_FILE){
                    const d=db[KEY]||{};
                    horaris=d.horaris||[];
                    partits=d.partits||[];
                    observacions=d.observacions||[];
                    plantilla=Array.isArray(d.plantilla)?d.plantilla:[];
                }
            }
            renderHorari(); renderPartits(); renderObs(); renderPlantilla();
            await loadCaptacioSuggestions(); renderCaptacioSuggestions();
        }

        async function saveAll(silent = false){
            renderPlantilla();
            db[KEY]={horaris,partits,observacions};
            if(document.getElementById('descripcio')) db[KEY].descripcio=document.getElementById('descripcio').value;

            if(IS_FILE){
                SF.forEach(f=>{const el=document.getElementById(f);if(el)db[KEY][f]=el.value;});
                ['comp_categoria','comp_temporada','comp_url','coord_nom','coord_tel'].forEach(f=>{
                    const el=document.getElementById(f); if(el) db[KEY][f]=el.value;
                });
                saveToStorage();
                return;
            }

            try{
                const requests=[
                    fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(db)})
                ];

                if(EQUIP_ID){
                    const equipPayload={
                        s_primer_entrenador_nom:(document.getElementById('s_primer_entrenador_nom')||{}).value||'',
                        s_primer_entrenador_tel:(document.getElementById('s_primer_entrenador_tel')||{}).value||'',
                        s_segon_entrenador_nom:(document.getElementById('s_segon_entrenador_nom')||{}).value||'',
                        s_segon_entrenador_tel:(document.getElementById('s_segon_entrenador_tel')||{}).value||'',
                        s_tercer_entrenador_nom:(document.getElementById('s_tercer_entrenador_nom')||{}).value||'',
                        s_tercer_entrenador_tel:(document.getElementById('s_tercer_entrenador_tel')||{}).value||'',
                        comp_categoria:(document.getElementById('comp_categoria')||{}).value||'',
                        comp_temporada:(document.getElementById('comp_temporada')||{}).value||'',
                        comp_url:(document.getElementById('comp_url')||{}).value||''
                    };
                    requests.push(fetch(\`${'${API_EQUIP_CONFIG}'}?equipId=${'${encodeURIComponent(EQUIP_ID)}'}\`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(equipPayload)}));
                }

                const responses=await Promise.all(requests);
                if(!responses[0].ok){
                    const errorText=await responses[0].text();
                    throw new Error(\`POST players ${'${responses[0].status}'}: ${'${errorText}'}\`);
                }
                if(responses[1] && !responses[1].ok){
                    const errorText=await responses[1].text();
                    throw new Error(\`POST equip-config ${'${responses[1].status}'}: ${'${errorText}'}\`);
                }
                if(!silent) console.log('Guardat automàtic correcte');
            }catch(e){
                console.error('Error en el guardat automàtic:', e.message || e);
            }
        }

        window.openFedLink=function(e){
            const url=document.getElementById('comp_url')?document.getElementById('comp_url').value.trim():'';
            if(!url){e.preventDefault();alert("Introdueix primer l'enllaç de la FCF.");return;}
            document.getElementById('comp_link_btn').href=url;
        };

        function renderHorari(){
            const el=document.getElementById('horari_list'); if(!el)return;
            if(!horaris.length){el.innerHTML='<div class="empty-msg">Sense sessions registrades.</div>';return;}
            const ordreDies=['Dilluns','Dimarts','Dimecres','Dijous','Divendres','Dissabte','Diumenge'];
            const sessions=[...horaris].sort((a,b)=>{
                const diaA=ordreDies.indexOf(a.dia||'');
                const diaB=ordreDies.indexOf(b.dia||'');
                const idxA=diaA===-1?99:diaA;
                const idxB=diaB===-1?99:diaB;
                if(idxA!==idxB) return idxA-idxB;
                return String(a.inici||'').localeCompare(String(b.inici||''));
            });
            el.innerHTML='<table class="horari-table"><thead><tr><th>Dia</th><th>Inici</th><th>Fi</th><th>Vestidor</th><th>Camp</th></tr></thead><tbody>'
                +sessions.map(h=>'<tr><td class="dia-badge">'+h.dia+'</td><td>'+(h.inici||'-')+'</td><td>'+(h.fi||'-')+'</td><td>'+(esc(h.vestidor)||'-')+'</td><td>'+(esc(h.camp)||'-')+'</td></tr>').join('')
                +'</tbody></table>';
        }

        window.addPartit=async function(){
            const rival=document.getElementById('p_rival').value.trim();
            if(!rival){alert('Introdueix el nom del rival.');return;}
            partits.push({data:document.getElementById('p_data').value,tipus:document.getElementById('p_tipus').value,
                rival,lloc:document.getElementById('p_lloc').value,
                resultat:document.getElementById('p_resultat').value,torneig:document.getElementById('p_torneig').value});
            partits.sort((a,b)=>a.data.localeCompare(b.data));
            ['p_data','p_rival','p_resultat','p_torneig'].forEach(id=>document.getElementById(id).value='');
            renderPartits();
            await saveAll(true);
        };

        window.removePartit=async function(i){
            if(!confirm('Segur que vols eliminar aquest partit?')) return;
            partits.splice(i,1);
            renderPartits();
            await saveAll(true);
        };

        function renderPartits(){
            const el=document.getElementById('partits_list'); if(!el)return;
            if(!partits.length){el.innerHTML='<div class="empty-msg">Sense partits registrats.</div>';return;}
            el.innerHTML=partits.map((p,i)=>{
                const tc=p.tipus==='Torneig'?'type-torneig':'type-amisto';
                const tt=p.torneig?' &mdash; <em>'+esc(p.torneig)+'</em>':'';
                const rt=p.resultat?'<div class="partit-result">Resultat: <strong>'+esc(p.resultat)+'</strong></div>':'';
                return '<div class="partit-item"><div class="partit-info"><div class="partit-header"><span class="partit-date">'+fmtDate(p.data)+'</span><span class="'+tc+'">'+p.tipus+'</span><span class="partit-rival">vs '+esc(p.rival)+'</span><span class="partit-lloc">'+p.lloc+tt+'</span></div>'+rt+'</div><button class="btn-remove" onclick="removePartit('+i+')">&#x00D7;</button></div>';
            }).join('');
        }

        function renderPlantilla(){
            const body=document.getElementById('plantilla_tbody');
            if(!body) return;
            const alertBox=document.getElementById('plantilla_alert');
            const alertText=document.getElementById('plantilla_alert_text');
            const staffAlert=document.getElementById('staff_alert');
            const staffAlertText=document.getElementById('staff_alert_text');
            if(alertBox && alertText){
                if(plantilla.length < MIN_PLAYERS){
                    alertText.textContent=\`Equip amb ${'${plantilla.length}'} jugadors, el mínim recomanable son ${'${MIN_PLAYERS}'} jugadors per les plantilles de ${'${MIN_LABEL}'}!\`;
                    alertBox.style.display='flex';
                }else{
                    alertBox.style.display='none';
                }
            }
            if(staffAlert && staffAlertText){
                const primerNom=(document.getElementById('s_primer_entrenador_nom')||{}).value||'';
                const segonNom=(document.getElementById('s_segon_entrenador_nom')||{}).value||'';
                const missing=[];
                if(!primerNom.trim()) missing.push('primer entrenador');
                if(!segonNom.trim()) missing.push('segon entrenador');
                if(missing.length){
                    staffAlertText.textContent=\`Falta ${'${missing.join(\' i \' )}'} a l'equip!\`;
                    staffAlert.style.display='flex';
                }else{
                    staffAlert.style.display='none';
                }
            }
            if(!plantilla.length){
                body.innerHTML='<tr><td colspan="4" class="empty-msg">Sense jugadors registrats.</td></tr>';
                return;
            }
            body.innerHTML=plantilla.map((p,i)=>{
                const checked=p.revisio?'checked':'';
                const birthYear=normalizeBirthYear(p.naixement||'');
                return '<tr>'
                    +'<td><input type="text" value="'+esc(p.nom||'')+'" onchange="updatePlayer('+i+',\\'nom\\',this.value)"></td>'
                    +'<td><input type="number" min="1990" max="2030" value="'+birthYear+'" onchange="updatePlayer('+i+',\\'naixement\\',this.value)"></td>'
                    +'<td style="text-align:center;"><input type="checkbox" '+checked+' onchange="updatePlayer('+i+',\\'revisio\\',this.checked)"></td>'
                    +'<td class="plantilla-actions"><button class="btn-remove" onclick="removePlayer('+i+')">&#x00D7;</button></td>'
                    +'</tr>';
            }).join('');
        }

        window.addPlayer=async function(){
            const nom=document.getElementById('p_nom').value.trim();
            const naixement=normalizeBirthYear(document.getElementById('p_naixement').value);
            const revisio=document.getElementById('p_revisio').checked;
            if(!nom){alert('Introdueix el nom del jugador.');return;}
            if(!isValidBirthYear(naixement)){alert('Introdueix un any de naixement vàlid (format YYYY).');return;}

            if(IS_FILE){
                plantilla.push({id:\`local_${'${Date.now()}'}\`,nom,naixement,revisio});
                document.getElementById('p_nom').value='';
                document.getElementById('p_naixement').value='';
                document.getElementById('p_revisio').checked=false;
                renderPlantilla();
                await saveAll(true);
                return;
            }

            if(!EQUIP_ID){
                alert('No s\\'ha pogut resoldre l\\'equip d\\'aquesta pàgina.');
                return;
            }

            try{
                const r=await fetch(API_JUGADORS,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({equip_id:EQUIP_ID,nom,any_naixement:naixement,revisio_medica:revisio})});
                if(!r.ok){
                    const errorText=await r.text();
                    throw new Error(\`POST jugadors ${'${r.status}'}: ${'${errorText}'}\`);
                }
                const payload=await r.json();
                const created=payload&&payload.jugador?payload.jugador:null;
                if(created){
                    plantilla.push({id:String(created.id),nom:created.nom||nom,naixement:normalizeBirthYear(created.any_naixement||created.naixement||naixement),revisio:!!created.revisio});
                    plantilla.sort((a,b)=>(a.nom||'').localeCompare(b.nom||''));
                }
                document.getElementById('p_nom').value='';
                document.getElementById('p_naixement').value='';
                document.getElementById('p_revisio').checked=false;
                renderPlantilla();
            }catch(e){
                alert('Error al crear jugador');
            }
        };

        function renderCaptacioSuggestions(){
            const container=document.getElementById('captacio_suggestions');
            if(!container) return;
            if(!captacioSuggestions||!captacioSuggestions.length){
                container.innerHTML='<div class="empty-msg">No hi ha jugadors en captació que coincideixin amb aquest equip.</div>';
                return;
            }
            container.innerHTML=captacioSuggestions.map(p=>{
                const posicions=Array.isArray(p.posicions)?p.posicions.join(', '):'';
                const club=p.club?\`<strong>Club:</strong> ${'${esc(p.club)}'}<br>\`:'';
                const tel=p.tel?\`<strong>Tel:</strong> ${'${esc(p.tel)}'}<br>\`:'';
                const poblacio=p.poblacio?\`<strong>Població:</strong> ${'${esc(p.poblacio)}'}<br>\`:'';
                const situacio=p.situacio?\`<strong>Situació:</strong> ${'${esc(p.situacio)}'}\`:'';
                const genderBadge=p.genere==='Masculí'?'<span class="gender-masculi" style="font-size:0.7rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:1rem;background:#dbeafe;color:#1d4ed8;margin-left:0.5rem;">'+esc(p.genere)+'</span>':'<span class="gender-femeni" style="font-size:0.7rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:1rem;background:#fce7f3;color:#be185d;margin-left:0.5rem;">'+esc(p.genere)+'</span>';
                const yearBadge='<span class="year-badge" style="font-size:0.7rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:1rem;background:#fef3c7;color:#92400e;margin-left:0.5rem;">'+esc(normalizeBirthYear(p.any_naixement||p.naixement||''))+'</span>';
                return '<div class="obs-item" style="background:#f0fdf4;border:1px solid #86efac;"><div class="obs-header"><div style="font-size:0.95rem;"><strong style="color:#059669;">'+esc(p.nom||'Sense nom')+'</strong>'+genderBadge+yearBadge+'</div></div><div style="font-size:0.82rem;color:#475569;line-height:1.6;">'+club+tel+poblacio+'<strong>Posicions:</strong> '+esc(posicions)+'<br>'+situacio+'</div></div>';
            }).join('');
        }

        window.updatePlayer=function(index,field,value){
            if(!plantilla[index]) return;
            if(field==='revisio') plantilla[index].revisio=!!value;
            if(field==='nom') plantilla[index].nom=value;
            if(field==='naixement') plantilla[index].naixement=normalizeBirthYear(value);

            if(field==='naixement' && !isValidBirthYear(plantilla[index].naixement)){
                renderPlantilla();
                return;
            }

            if(IS_FILE){
                saveAll(true);
                return;
            }

            const player=plantilla[index];
            if(!isNumericId(player.id)) return;
            const body={id:player.id};
            if(field==='nom') body.nom=player.nom;
            if(field==='naixement') body.any_naixement=player.naixement;
            if(field==='revisio') body.revisio_medica=player.revisio;

            fetch(API_JUGADORS,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
                .then(async r=>{if(!r.ok){const errorText=await r.text();throw new Error(errorText);}})
                .catch(()=>{console.warn('No s\\'ha pogut actualitzar el jugador');});
        };

        window.removePlayer=async function(index){
            if(!confirm('Segur que vols eliminar aquest jugador?')) return;
            if(!plantilla[index]) return;
            const player=plantilla[index];

            if(IS_FILE || !isNumericId(player.id)){
                plantilla.splice(index,1);
                renderPlantilla();
                if(IS_FILE) await saveAll(true);
                return;
            }

            try{
                const r=await fetch(\`${'${API_JUGADORS}'}?id=${'${encodeURIComponent(player.id)}'}\`,{method:'DELETE'});
                if(!r.ok){
                    const errorText=await r.text();
                    throw new Error(\`DELETE jugadors ${'${r.status}'}: ${'${errorText}'}\`);
                }
                plantilla.splice(index,1);
                renderPlantilla();
            }catch(e){
                alert('Error al eliminar jugador');
            }
        };

        const today=new Date().toISOString().split('T')[0];
        if(document.getElementById('obs_data')) document.getElementById('obs_data').value=today;
        window.addObs=async function(){
            const text=document.getElementById('obs_text').value.trim(); if(!text)return;
            observacions.unshift({autor:document.getElementById('obs_autor').value||'Anònim',
                data:document.getElementById('obs_data').value,text});
            document.getElementById('obs_text').value='';
            document.getElementById('obs_autor').value='';
            document.getElementById('obs_data').value=today;
            renderObs();
            await saveAll(true);
        };

        window.removeObs=async function(i){
            if(!confirm('Segur que vols eliminar aquest comentari?')) return;
            observacions.splice(i,1);
            renderObs();
            await saveAll(true);
        };

        function renderObs(){
            const el=document.getElementById('obs_list'); if(!el)return;
            if(!observacions.length){el.innerHTML='<div class="empty-msg">Sense observacions registrades.</div>';return;}
            el.innerHTML=observacions.map((o,i)=>'<div class="obs-item"><div class="obs-header"><div class="obs-meta"><strong>'+esc(o.autor)+'</strong> &mdash; '+fmtDate(o.data)+'</div><button class="btn-remove" onclick="removeObs('+i+')">&#x00D7;</button></div><div class="obs-text">'+esc(o.text)+'</div></div>').join('');
        }

        function fmtDate(d){if(!d)return'-';return new Date(d+'T12:00:00').toLocaleDateString('ca-ES',{day:'2-digit',month:'2-digit',year:'numeric'});}
        function esc(t){if(!t && t!==0)return'';return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
        load();
    </script>`;
}

for (const cfg of files) {
  const filePath = path.join(base, cfg.file);
  let html = fs.readFileSync(filePath, 'utf8');

  html = html.replace('.plantilla-table td input[type=date]{margin:0;}', '.plantilla-table td input[type=number]{margin:0;}');
  html = html.replace('<th>Data de naixement</th>', '<th>Any de naixement</th>');
  html = html.replace('<div><label>Data de naixement</label><input type="date" id="p_naixement"></div>', '<div><label>Any de naixement</label><input type="number" id="p_naixement" min="1990" max="2030" placeholder="Ex: 2014"></div>');

  html = html.replace(/<script>[\s\S]*?<\/script>/, buildScript(cfg));

  fs.writeFileSync(filePath, html, 'utf8');
}

console.log('Updated files:', files.map(f=>f.file).join(', '));
