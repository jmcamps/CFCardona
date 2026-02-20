const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, 'seccions');

function baseHead(title) {
    return `<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | CF Cardona</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #d91d1d; --bg: #f1f5f9; --border: #e2e8f0; }
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter',sans-serif; }
        body { background:var(--bg); min-height:100vh; padding:2rem; overflow-x:auto; }
        body::before { content:""; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:600px; height:600px; background-image:url('/Web jugadors/ESCUT CF CARDONA.jpeg'); background-size:contain; background-repeat:no-repeat; opacity:0.04; filter:blur(2px); z-index:0; pointer-events:none; }
        header { max-width:960px; margin:0 auto 2rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; position:relative; z-index:1; }
        h1 { color:var(--primary); font-weight:800; font-size:1.5rem; }
        .breadcrumb { font-size:0.85rem; color:#64748b; margin-top:0.25rem; }
        .breadcrumb a { color:var(--primary); text-decoration:none; font-weight:600; }
        .breadcrumb a:hover { text-decoration:underline; }
        .card { background:white; border-radius:1rem; padding:2rem; box-shadow:0 4px 6px -1px rgb(0 0 0/0.1); border:1px solid var(--border); max-width:960px; margin:0 auto 2rem; position:relative; z-index:1; }
        .card h2 { color:var(--primary); font-size:1.1rem; font-weight:800; margin-bottom:1.5rem; border-bottom:2px solid #fee2e2; padding-bottom:0.75rem; }
        label { display:block; font-weight:700; font-size:0.82rem; color:#475569; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.05em; }
        textarea { width:100%; min-height:120px; padding:0.75rem; border:1px solid var(--border); border-radius:0.5rem; font-size:0.9rem; outline:none; resize:vertical; line-height:1.6; }
        textarea:focus { border-color:var(--primary); }
        input[type=text], input[type=tel], input[type=date], input[type=time], input[type=url] { width:100%; padding:0.6rem 0.8rem; border:1px solid var(--border); border-radius:0.5rem; font-size:0.9rem; outline:none; }
        input:focus, select:focus { border-color:var(--primary); }
        select { width:100%; padding:0.6rem 0.8rem; border:1px solid var(--border); border-radius:0.5rem; font-size:0.9rem; outline:none; background:white; }
        /* Staff */
        .staff-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px,1fr)); gap:1.25rem; }
        .staff-member { background:#fffafa; border:1px solid #fecaca; border-radius:0.75rem; padding:1.25rem; }
        .staff-member .role-title { font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:var(--primary); margin-bottom:0.75rem; }
        .staff-fields { display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; }
        /* Horari */
        .horari-form { background:#f8fafc; border:1px solid var(--border); border-radius:0.75rem; padding:1.25rem; margin-top:1rem; }
        .horari-form-title { font-size:0.82rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:#475569; margin-bottom:1rem; }
        .horari-form-row { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr 1fr auto; gap:0.6rem; align-items:end; }
        .horari-table { width:100%; border-collapse:collapse; font-size:0.88rem; }
        .horari-table thead tr { background:#fee2e2; color:var(--primary); }
        .horari-table th { padding:0.6rem 1rem; text-align:left; font-weight:700; }
        .horari-table td { padding:0.65rem 1rem; border-bottom:1px solid var(--border); }
        .horari-table tr:last-child td { border-bottom:none; }
        .dia-badge { font-weight:800; color:var(--primary); }
        /* Competicio */
        .comp-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem; }
        .comp-link-box { background:#fff5f5; border:1px solid #fecaca; border-radius:0.75rem; padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem; }
        .comp-link-box a.fed-link { display:inline-flex; align-items:center; gap:0.5rem; background:var(--primary); color:white; text-decoration:none; padding:0.6rem 1.2rem; border-radius:0.5rem; font-weight:700; font-size:0.85rem; width:fit-content; transition:all 0.2s; }
        .comp-link-box a.fed-link:hover { background:#b91c1c; transform:translateY(-1px); }
        /* Partits */
        .partit-list { margin-bottom:1rem; }
        .partit-item { background:#fffafa; border:1px solid #fecaca; border-radius:0.75rem; padding:1rem 1.25rem; margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; }
        .partit-info { flex:1; }
        .partit-header { display:flex; align-items:center; gap:1rem; margin-bottom:0.4rem; flex-wrap:wrap; }
        .partit-date { font-weight:800; color:var(--primary); font-size:0.9rem; }
        .partit-type { font-size:0.75rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:1rem; }
        .type-amisto { background:#dbeafe; color:#1d4ed8; }
        .type-torneig { background:#fef9c3; color:#854d0e; }
        .partit-rival { font-weight:700; color:#0f172a; }
        .partit-lloc { font-size:0.82rem; color:#64748b; }
        .partit-result { font-size:0.82rem; color:#475569; margin-top:0.25rem; }
        .add-form-box { background:#f8fafc; border:1px solid var(--border); border-radius:0.75rem; padding:1.25rem; }
        .add-form-title { font-size:0.82rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:#475569; margin-bottom:1rem; }
        .form-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:0.75rem; }
        .form-row-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.75rem; margin-bottom:0.75rem; }
        .form-row-4 { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:0.75rem; margin-bottom:0.75rem; }
        /* Plantilla */
        .plantilla-placeholder { text-align:center; padding:3rem 2rem; background:#f8fafc; border-radius:0.75rem; border:2px dashed var(--border); }
        .plantilla-placeholder p { color:#94a3b8; font-size:0.95rem; margin-bottom:0.5rem; }
        .plantilla-placeholder span { font-size:2.5rem; display:block; margin-bottom:1rem; }
        /* Obs */
        .obs-list { margin-bottom:1rem; }
        .obs-item { background:#fffafa; border:1px solid #fecaca; border-radius:0.75rem; padding:1rem 1.25rem; margin-bottom:0.75rem; }
        .obs-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; }
        .obs-meta { font-size:0.82rem; color:#64748b; }
        .obs-meta strong { color:var(--primary); }
        .obs-text { font-size:0.9rem; line-height:1.6; white-space:pre-wrap; }
        .add-obs-form { background:#f8fafc; border:1px solid var(--border); border-radius:0.75rem; padding:1.25rem; }
        .form-title { font-size:0.82rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:#475569; margin-bottom:1rem; }
        .obs-form-row { display:grid; grid-template-columns:1fr 1fr auto; gap:0.75rem; margin-bottom:0.75rem; align-items:end; }
        /* Btns */
        .btn { padding:0.65rem 1.5rem; border-radius:0.5rem; font-weight:700; cursor:pointer; border:none; font-size:0.88rem; }
        .btn-primary { background:var(--primary); color:white; }
        .btn-primary:hover { background:#b91c1c; }
        .btn-save-main { background:var(--primary); color:white; border:none; padding:0.75rem 2rem; border-radius:0.5rem; font-weight:700; cursor:pointer; font-size:0.95rem; }
        .btn-remove { background:none; border:none; color:var(--primary); font-size:1.2rem; cursor:pointer; padding:0 0.25rem; }
        .empty-msg { color:#94a3b8; font-size:0.85rem; padding:0.5rem; }
        @media(max-width:640px) { .staff-fields,.comp-grid,.form-row-2,.form-row-3,.form-row-4 { grid-template-columns:1fr; } .horari-form-row { grid-template-columns:1fr 1fr; } }
    </style>
</head>`;
}

function breadcrumb(parts) {
    const links = parts.slice(0,-1).map(p=>`<a href="${p.href}">${p.label}</a>`).join(' &rarr; ');
    const last = parts[parts.length-1].label;
    return links + (links?' &rarr; ':'') + last;
}

function header(title, icon, bc) {
    return `
    <header>
        <div>
            <h1>${icon} ${title}</h1>
            <div class="breadcrumb">${bc}</div>
        </div>
        <button class="btn-save-main" id="btn-save">GUARDAR TOT</button>
    </header>`;
}

function descCard(ph) {
    return `
    <div class="card">
        <h2>&#x1F4DD; Descripci&oacute;</h2>
        <textarea id="descripcio" style="min-height:130px;" placeholder="${ph}"></textarea>
    </div>`;
}

function staffCard(roles) {
    const members = roles.map(r => {
        const id = r.toLowerCase().replace(/ /g,'_');
        return `
            <div class="staff-member">
                <div class="role-title">${r}</div>
                <div class="staff-fields">
                    <div><label>Nom i Cognoms</label><input type="text" id="s_${id}_nom" placeholder="Nom..."></div>
                    <div><label>Tel&egrave;fon</label><input type="tel" id="s_${id}_tel" placeholder="Tel&egrave;fon..."></div>
                </div>
            </div>`;
    }).join('');
    return `
    <div class="card">
        <h2>&#x1F91D; Staff T&egrave;cnic</h2>
        <div class="staff-grid">${members}
        </div>
    </div>`;
}

function staffFieldIds(roles) {
    return roles.flatMap(r => { const id=r.toLowerCase().replace(/ /g,'_'); return [`s_${id}_nom`,`s_${id}_tel`]; });
}

function horariCard() {
    return `
    <div class="card">
        <h2>&#x1F5D3; Horari d&apos;Entrenaments</h2>
        <div id="horari_list" class="empty-msg">Sense sessions registrades.</div>
        <div class="horari-form">
            <div class="horari-form-title">Afegir Sessi&oacute;</div>
            <div class="horari-form-row">
                <div><label>Dia</label>
                    <select id="h_dia"><option value="">Selecciona...</option><option>Dilluns</option><option>Dimarts</option><option>Dimecres</option><option>Dijous</option><option>Divendres</option><option>Dissabte</option><option>Diumenge</option></select>
                </div>
                <div><label>Inici</label><input type="time" id="h_inici"></div>
                <div><label>Fi</label><input type="time" id="h_fi"></div>
                <div><label>Vestidor</label><input type="text" id="h_vestidor" placeholder="Ex: A"></div>
                <div><label>Camp</label><input type="text" id="h_camp" placeholder="Ex: Principal"></div>
                <div><button class="btn btn-primary" onclick="addHorari()" style="white-space:nowrap;">AFEGIR</button></div>
            </div>
        </div>
    </div>`;
}

function competicioCard() {
    return `
    <div class="card">
        <h2>&#x1F3C6; Competici&oacute;</h2>
        <div class="comp-grid">
            <div><label>Categoria / Grup</label><input type="text" id="comp_categoria" placeholder="Ex: Quarta Catalana Grup 17"></div>
            <div><label>Temporada</label><input type="text" id="comp_temporada" placeholder="Ex: 2024-2025"></div>
        </div>
        <div class="comp-link-box">
            <div>
                <label>Enlla&ccedil; Federaci&oacute; Catalana de Futbol</label>
                <input type="url" id="comp_url" placeholder="https://www.fcf.cat/...">
            </div>
            <div>
                <a id="comp_link_btn" href="#" target="_blank" class="fed-link" onclick="openFedLink(event)">
                    &#x1F517; Obrir classificaci&oacute; a la FCF
                </a>
            </div>
        </div>
    </div>`;
}

function partitsCard() {
    return `
    <div class="card">
        <h2>&#x1F4C5; Partits Amistosos i Tornejos</h2>
        <div id="partits_list" class="partit-list">
            <div class="empty-msg">Sense partits registrats.</div>
        </div>
        <div class="add-form-box">
            <div class="add-form-title">Afegir Partit / Torneig</div>
            <div class="form-row-4">
                <div><label>Data</label><input type="date" id="p_data"></div>
                <div><label>Tipus</label>
                    <select id="p_tipus">
                        <option value="Amist&oacute;s">Amist&oacute;s</option>
                        <option value="Torneig">Torneig</option>
                    </select>
                </div>
                <div><label>Rival</label><input type="text" id="p_rival" placeholder="Nom del rival..."></div>
                <div><label>Lloc (C/F)</label>
                    <select id="p_lloc">
                        <option value="Casa">Casa</option>
                        <option value="Fora">Fora</option>
                        <option value="Neutral">Neutral</option>
                    </select>
                </div>
            </div>
            <div class="form-row-3">
                <div><label>Resultat (opcional)</label><input type="text" id="p_resultat" placeholder="Ex: 2-1"></div>
                <div><label>Nom torneig (si escau)</label><input type="text" id="p_torneig" placeholder="Ex: Torneig Festa Major"></div>
                <div style="display:flex;align-items:flex-end;"><button class="btn btn-primary" style="width:100%;" onclick="addPartit()">AFEGIR PARTIT</button></div>
            </div>
        </div>
    </div>`;
}

function plantillaPlaceholder() {
    return `
    <div class="card">
        <h2>&#x1F4CB; Plantilla de Jugadors</h2>
        <div class="plantilla-placeholder">
            <span>&#x1F6A7;</span>
            <p><strong>Plantilla pendent de configurar</strong></p>
            <p>Quan tinguis els jugadors, aqu&iacute; podras gestionar les seves fitxes individuals.</p>
        </div>
    </div>`;
}

function obsCard() {
    return `
    <div class="card">
        <h2>&#x1F4AC; Observacions i Comentaris</h2>
        <div id="obs_list" class="obs-list"><div class="empty-msg">Sense observacions registrades.</div></div>
        <div class="add-obs-form">
            <div class="form-title">Nou Comentari</div>
            <div class="obs-form-row">
                <div><label>Autor</label><input type="text" id="obs_autor" placeholder="Qui fa el comentari..."></div>
                <div><label>Data</label><input type="date" id="obs_data"></div>
                <div><button class="btn btn-primary" onclick="addObs()">AFEGIR</button></div>
            </div>
            <div><label>Comentari</label><textarea id="obs_text" style="min-height:100px;" placeholder="Escriu el comentari..."></textarea></div>
        </div>
    </div>`;
}

function fullJS(key, staffFields) {
    return `
    <script>
        const API = '/api/players';
        const KEY = '${key}';
        let db = {}, observacions = [], horaris = [], partits = [];
        const SF = ${JSON.stringify(staffFields)};
        const DIES = ['Dilluns','Dimarts','Dimecres','Dijous','Divendres','Dissabte','Diumenge'];

        async function load() {
            try {
                const r = await fetch(API); db = await r.json();
                const d = db[KEY] || {};
                if (document.getElementById('descripcio')) document.getElementById('descripcio').value = d.descripcio||'';
                SF.forEach(f => { const el=document.getElementById(f); if(el) el.value=d[f]||''; });
                if (document.getElementById('comp_categoria')) document.getElementById('comp_categoria').value = d.comp_categoria||'';
                if (document.getElementById('comp_temporada')) document.getElementById('comp_temporada').value = d.comp_temporada||'';
                if (document.getElementById('comp_url')) document.getElementById('comp_url').value = d.comp_url||'';
                horaris = d.horaris||[]; partits = d.partits||[]; observacions = d.observacions||[];
                renderHorari(); renderPartits(); renderObs();
            } catch(e) { console.warn('Servidor no disponible'); }
        }

        async function saveAll() {
            const btn = document.getElementById('btn-save');
            db[KEY] = { horaris, partits, observacions };
            if (document.getElementById('descripcio')) db[KEY].descripcio = document.getElementById('descripcio').value;
            SF.forEach(f => { const el=document.getElementById(f); if(el) db[KEY][f]=el.value; });
            ['comp_categoria','comp_temporada','comp_url'].forEach(f => { const el=document.getElementById(f); if(el) db[KEY][f]=el.value; });
            try {
                const res = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(db) });
                if (res.ok) { btn.innerText='GUARDAT!'; btn.style.background='#16a34a'; }
            } catch(e) { btn.innerText='ERROR'; }
            setTimeout(() => { btn.innerText='GUARDAR TOT'; btn.style.background='#d91d1d'; }, 2000);
        }
        document.getElementById('btn-save').addEventListener('click', saveAll);

        // Federacio link
        window.openFedLink = function(e) {
            const url = document.getElementById('comp_url').value.trim();
            if (!url) { e.preventDefault(); alert('Introdueix primer l\\'enlla\u00e7 de la FCF.'); return; }
            document.getElementById('comp_link_btn').href = url;
        };

        // HORARI
        window.addHorari = function() {
            const dia = document.getElementById('h_dia').value;
            if (!dia) { alert('Selecciona un dia.'); return; }
            horaris.push({ dia, inici:document.getElementById('h_inici').value, fi:document.getElementById('h_fi').value, vestidor:document.getElementById('h_vestidor').value, camp:document.getElementById('h_camp').value });
            horaris.sort((a,b)=>DIES.indexOf(a.dia)-DIES.indexOf(b.dia));
            ['h_dia','h_inici','h_fi','h_vestidor','h_camp'].forEach(id=>document.getElementById(id).value='');
            renderHorari();
        };
        window.removeHorari = function(i) { horaris.splice(i,1); renderHorari(); };
        function renderHorari() {
            const el=document.getElementById('horari_list'); if(!el) return;
            if(!horaris.length){el.innerHTML='<div class="empty-msg">Sense sessions registrades.</div>';return;}
            el.innerHTML='<table class="horari-table"><thead><tr><th>Dia</th><th>Inici</th><th>Fi</th><th>Vestidor</th><th>Camp</th><th></th></tr></thead><tbody>'
                +horaris.map((h,i)=>'<tr><td class="dia-badge">'+h.dia+'</td><td>'+(h.inici||'-')+'</td><td>'+(h.fi||'-')+'</td><td>'+(esc(h.vestidor)||'-')+'</td><td>'+(esc(h.camp)||'-')+'</td><td><button class="btn-remove" onclick="removeHorari('+i+')">&#x00D7;</button></td></tr>').join('')
                +'</tbody></table>';
        }

        // PARTITS
        window.addPartit = function() {
            const rival = document.getElementById('p_rival').value.trim();
            if (!rival) { alert('Introdueix el nom del rival.'); return; }
            partits.push({
                data: document.getElementById('p_data').value,
                tipus: document.getElementById('p_tipus').value,
                rival, lloc: document.getElementById('p_lloc').value,
                resultat: document.getElementById('p_resultat').value,
                torneig: document.getElementById('p_torneig').value
            });
            partits.sort((a,b)=>a.data.localeCompare(b.data));
            ['p_data','p_rival','p_resultat','p_torneig'].forEach(id=>document.getElementById(id).value='');
            renderPartits();
        };
        window.removePartit = function(i) { partits.splice(i,1); renderPartits(); };
        function renderPartits() {
            const el=document.getElementById('partits_list'); if(!el) return;
            if(!partits.length){el.innerHTML='<div class="empty-msg">Sense partits registrats.</div>';return;}
            el.innerHTML=partits.map((p,i)=>{
                const typeCls = p.tipus==='Torneig'?'type-torneig':'type-amisto';
                const torneigTxt = p.torneig ? ' &mdash; <em>'+esc(p.torneig)+'</em>' : '';
                const resultatTxt = p.resultat ? '<div class="partit-result">Resultat: <strong>'+esc(p.resultat)+'</strong></div>' : '';
                return '<div class="partit-item"><div class="partit-info"><div class="partit-header"><span class="partit-date">'+fmtDate(p.data)+'</span><span class="partit-type '+typeCls+'">'+p.tipus+'</span><span class="partit-rival">vs '+esc(p.rival)+'</span><span class="partit-lloc">'+p.lloc+torneigTxt+'</span></div>'+resultatTxt+'</div><button class="btn-remove" onclick="removePartit('+i+')">&#x00D7;</button></div>';
            }).join('');
        }

        // OBS
        const today=new Date().toISOString().split('T')[0];
        if(document.getElementById('obs_data')) document.getElementById('obs_data').value=today;
        window.addObs=function(){
            const text=document.getElementById('obs_text').value.trim(); if(!text) return;
            observacions.unshift({autor:document.getElementById('obs_autor').value||'An\u00f2nim',data:document.getElementById('obs_data').value,text});
            document.getElementById('obs_text').value=''; document.getElementById('obs_autor').value=''; document.getElementById('obs_data').value=today;
            renderObs();
        };
        window.removeObs=function(i){observacions.splice(i,1);renderObs();};
        function renderObs(){
            const el=document.getElementById('obs_list'); if(!el) return;
            if(!observacions.length){el.innerHTML='<div class="empty-msg">Sense observacions registrades.</div>';return;}
            el.innerHTML=observacions.map((o,i)=>'<div class="obs-item"><div class="obs-header"><div class="obs-meta"><strong>'+esc(o.autor)+'</strong> &mdash; '+fmtDate(o.data)+'</div><button class="btn-remove" onclick="removeObs('+i+')">&#x00D7;</button></div><div class="obs-text">'+esc(o.text)+'</div></div>').join('');
        }

        function fmtDate(d){if(!d)return'-';return new Date(d+'T12:00:00').toLocaleDateString('ca-ES',{day:'2-digit',month:'2-digit',year:'numeric'});}
        function esc(t){if(!t)return'';return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
        load();
    <\/script>`;
}

// ── EQUIPS ────────────────────────────────────────────────────────────────────
const equipRoles = ['Primer Entrenador', 'Segon Entrenador', 'Tercer Entrenador'];

const equips = [
    { file:'minis',          title:'Minis',            icon:'&#x2B50;', parent:'F7',                  parentHref:'f7.html',                  pp:'Futbol Base Mascul\u00ed', ppHref:'futbol-base-masculi.html' },
    { file:'s7',             title:'S7',               icon:'&#x2B50;', parent:'F7',                  parentHref:'f7.html',                  pp:'Futbol Base Mascul\u00ed', ppHref:'futbol-base-masculi.html' },
    { file:'s8',             title:'S8',               icon:'&#x2B50;', parent:'F7',                  parentHref:'f7.html',                  pp:'Futbol Base Mascul\u00ed', ppHref:'futbol-base-masculi.html' },
    { file:'s9',             title:'S9',               icon:'&#x2B50;', parent:'F7',                  parentHref:'f7.html',                  pp:'Futbol Base Mascul\u00ed', ppHref:'futbol-base-masculi.html' },
    { file:'s10',            title:'S10',              icon:'&#x2B50;', parent:'F7',                  parentHref:'f7.html',                  pp:'Futbol Base Mascul\u00ed', ppHref:'futbol-base-masculi.html' },
    { file:'s11',            title:'S11',              icon:'&#x2B50;', parent:'F7',                  parentHref:'f7.html',                  pp:'Futbol Base Mascul\u00ed', ppHref:'futbol-base-masculi.html' },
    { file:'s12',            title:'S12',              icon:'&#x2B50;', parent:'F7',                  parentHref:'f7.html',                  pp:'Futbol Base Mascul\u00ed', ppHref:'futbol-base-masculi.html' },
    { file:'s16',            title:'S16 (Cadet)',       icon:'&#x2B50;', parent:'F11',                 parentHref:'f11.html',                 pp:'Futbol Base Mascul\u00ed', ppHref:'futbol-base-masculi.html' },
    { file:'juvenil-masculi',title:'Juvenil Mascul\u00ed', icon:'&#x2B50;', parent:'F11',             parentHref:'f11.html',                 pp:'Futbol Base Mascul\u00ed', ppHref:'futbol-base-masculi.html' },
    { file:'alevi-femeni',   title:'Alev\u00ed Femen\u00ed',  icon:'&#x2B50;', parent:'Futbol Base Femen\u00ed', parentHref:'futbol-base-femeni.html', pp:'Futbol Base',             ppHref:'futbol-base.html' },
    { file:'cadet-femeni',   title:'Cadet Femen\u00ed',   icon:'&#x2B50;', parent:'Futbol Base Femen\u00ed', parentHref:'futbol-base-femeni.html', pp:'Futbol Base',             ppHref:'futbol-base.html' },
    { file:'juvenil-femeni', title:'Juvenil Femen\u00ed', icon:'&#x2B50;', parent:'Futbol Base Femen\u00ed', parentHref:'futbol-base-femeni.html', pp:'Futbol Base',             ppHref:'futbol-base.html' },
];

equips.forEach(e => {
    const bc = breadcrumb([
        {label:'Direcci\u00f3 Esportiva', href:'../index.html'},
        {label:'Estructura', href:'../estructura.html'},
        {label:e.pp, href:e.ppHref},
        {label:e.parent, href:e.parentHref},
        {label:e.title}
    ]);
    const sf = staffFieldIds(equipRoles);
    const body = descCard('Descripci\u00f3 de l\'equip '+e.title+'...')
        + staffCard(equipRoles)
        + horariCard()
        + competicioCard()
        + partitsCard()
        + plantillaPlaceholder()
        + obsCard();
    const html = baseHead(e.title) + '\n<body>\n' + header(e.title, e.icon, bc) + body + fullJS('seccio_'+e.file, sf) + '\n</body>\n</html>';
    fs.writeFileSync(path.join(out, e.file+'.html'), html, {encoding:'utf8'});
    process.stdout.write('OK: '+e.file+'\n');
});

// Actualitza tambe primer-equip i filial afegint competicio i partits
['primer-equip', 'filial'].forEach(f => {
    process.stdout.write('('+f+' te estructura propia, afegeix manualment si cal)\n');
});

process.stdout.write('Done!\n');