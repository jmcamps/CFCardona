const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, 'seccions');

// ── Helpers ──────────────────────────────────────────────────────────────────

function breadcrumb(parts) {
    // parts: [{label, href}]  last one has no href
    const links = parts.slice(0, -1).map(p => `<a href="${p.href}">${p.label}</a>`).join(' &rarr; ');
    const last = parts[parts.length - 1].label;
    return links + (links ? ' &rarr; ' : '') + last;
}

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
        input[type=text], input[type=tel], input[type=date], input[type=time] { width:100%; padding:0.6rem 0.8rem; border:1px solid var(--border); border-radius:0.5rem; font-size:0.9rem; outline:none; }
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
        /* Org tree */
        .tree { display:flex; flex-direction:column; align-items:center; padding:1rem 0; min-width:max-content; margin:0 auto; }
        .v-line { width:2px; height:20px; background:#fca5a5; margin:0 auto; }
        .children-row { display:flex; gap:2rem; justify-content:center; position:relative; }
        .children-row::before { content:''; position:absolute; top:0; left:50%; transform:translateX(-50%); height:2px; background:#fca5a5; width:calc(100% - 60px); }
        .child-col { display:flex; flex-direction:column; align-items:center; }
        .node { display:inline-flex; align-items:center; justify-content:center; padding:0.6rem 1.4rem; border-radius:0.5rem; font-weight:700; font-size:0.85rem; text-decoration:none; color:var(--primary); background:white; border:2px solid var(--primary); box-shadow:0 2px 8px rgba(217,29,29,0.1); transition:all 0.2s; white-space:nowrap; }
        .node:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(217,29,29,0.2); background:#fff5f5; }
        .node.root-node { background:#fee2e2; font-size:0.9rem; }
        /* Btns */
        .btn { padding:0.65rem 1.5rem; border-radius:0.5rem; font-weight:700; cursor:pointer; border:none; font-size:0.88rem; }
        .btn-primary { background:var(--primary); color:white; }
        .btn-primary:hover { background:#b91c1c; }
        .btn-save-main { background:var(--primary); color:white; border:none; padding:0.75rem 2rem; border-radius:0.5rem; font-weight:700; cursor:pointer; font-size:0.95rem; }
        .btn-remove { background:none; border:none; color:var(--primary); font-size:1.2rem; cursor:pointer; padding:0 0.25rem; }
        .empty-msg { color:#94a3b8; font-size:0.85rem; padding:0.5rem; }
        .coord-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    </style>
</head>`;
}

function obsAndHorariJS(key) {
    return `
        const API = '/api/players';
        const KEY = '${key}';
        let db = {}, observacions = [], horaris = [];
        const DIES_ORDER = ['Dilluns','Dimarts','Dimecres','Dijous','Divendres','Dissabte','Diumenge'];

        async function load() {
            try {
                const r = await fetch(API); db = await r.json();
                const data = db[KEY] || {};
                if (document.getElementById('descripcio')) document.getElementById('descripcio').value = data.descripcio || '';
                (window._staffFields||[]).forEach(f => { const el=document.getElementById(f); if(el) el.value=data[f]||''; });
                horaris = data.horaris || []; observacions = data.observacions || [];
                renderHorari(); renderObs();
            } catch(e) { console.warn('Servidor no disponible'); }
        }

        async function saveAll() {
            const btn = document.getElementById('btn-save');
            db[KEY] = { horaris, observacions };
            if (document.getElementById('descripcio')) db[KEY].descripcio = document.getElementById('descripcio').value;
            (window._staffFields||[]).forEach(f => { const el=document.getElementById(f); if(el) db[KEY][f]=el.value; });
            try {
                const res = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(db) });
                if (res.ok) { btn.innerText='GUARDAT!'; btn.style.background='#16a34a'; }
            } catch(e) { btn.innerText='ERROR'; }
            setTimeout(() => { btn.innerText='GUARDAR TOT'; btn.style.background='#d91d1d'; }, 2000);
        }
        document.getElementById('btn-save').addEventListener('click', saveAll);

        window.addHorari = function() {
            const dia = document.getElementById('h_dia').value;
            if (!dia) { alert('Selecciona un dia.'); return; }
            horaris.push({ dia, inici:document.getElementById('h_inici').value, fi:document.getElementById('h_fi').value, vestidor:document.getElementById('h_vestidor').value, camp:document.getElementById('h_camp').value });
            horaris.sort((a,b) => DIES_ORDER.indexOf(a.dia)-DIES_ORDER.indexOf(b.dia));
            ['h_dia','h_inici','h_fi','h_vestidor','h_camp'].forEach(id => document.getElementById(id).value='');
            renderHorari();
        };
        window.removeHorari = function(i) { horaris.splice(i,1); renderHorari(); };
        function renderHorari() {
            const el = document.getElementById('horari_list');
            if (!el) return;
            if (horaris.length===0) { el.innerHTML='<div class="empty-msg">Sense sessions registrades.</div>'; return; }
            el.innerHTML = '<table class="horari-table"><thead><tr><th>Dia</th><th>Inici</th><th>Fi</th><th>Vestidor</th><th>Camp</th><th></th></tr></thead><tbody>'
                + horaris.map((h,i) => '<tr><td class="dia-badge">'+h.dia+'</td><td>'+(h.inici||'-')+'</td><td>'+(h.fi||'-')+'</td><td>'+(esc(h.vestidor)||'-')+'</td><td>'+(esc(h.camp)||'-')+'</td><td><button class="btn-remove" onclick="removeHorari('+i+')">&#x00D7;</button></td></tr>').join('')
                + '</tbody></table>';
        }

        const today = new Date().toISOString().split('T')[0];
        if (document.getElementById('obs_data')) document.getElementById('obs_data').value = today;
        window.addObs = function() {
            const text = document.getElementById('obs_text').value.trim(); if (!text) return;
            observacions.unshift({ autor:document.getElementById('obs_autor').value||'An\u00f2nim', data:document.getElementById('obs_data').value, text });
            document.getElementById('obs_text').value=''; document.getElementById('obs_autor').value=''; document.getElementById('obs_data').value=today;
            renderObs();
        };
        window.removeObs = function(i) { observacions.splice(i,1); renderObs(); };
        function renderObs() {
            const el = document.getElementById('obs_list'); if (!el) return;
            if (observacions.length===0) { el.innerHTML='<div class="empty-msg">Sense observacions registrades.</div>'; return; }
            el.innerHTML = observacions.map((o,i) => '<div class="obs-item"><div class="obs-header"><div class="obs-meta"><strong>'+esc(o.autor)+'</strong> &mdash; '+fmtDate(o.data)+'</div><button class="btn-remove" onclick="removeObs('+i+')">&#x00D7;</button></div><div class="obs-text">'+esc(o.text)+'</div></div>').join('');
        }
        function fmtDate(d) { if(!d) return '-'; return new Date(d+'T12:00:00').toLocaleDateString('ca-ES',{day:'2-digit',month:'2-digit',year:'numeric'}); }
        function esc(t) { if(!t) return ''; return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        load();`;
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

function staffCard(roles) {
    const members = roles.map(r => `
            <div class="staff-member">
                <div class="role-title">${r}</div>
                <div class="staff-fields">
                    <div><label>Nom i Cognoms</label><input type="text" id="s_${r.toLowerCase().replace(/ /g,'_')}_nom" placeholder="Nom..."></div>
                    <div><label>Tel&egrave;fon</label><input type="tel" id="s_${r.toLowerCase().replace(/ /g,'_')}_tel" placeholder="Tel&egrave;fon..."></div>
                </div>
            </div>`).join('');
    return `
    <div class="card">
        <h2>&#x1F91D; Staff T&egrave;cnic</h2>
        <div class="staff-grid">${members}
        </div>
    </div>`;
}

function staffFieldIds(roles) {
    return roles.flatMap(r => {
        const id = r.toLowerCase().replace(/ /g,'_');
        return [`s_${id}_nom`, `s_${id}_tel`];
    });
}

function treeCard(title, children) {
    // children: [{label, href}]
    const childCols = children.map(c => `
                <div class="child-col">
                    <div class="v-line"></div>
                    <a href="${c.href}" class="node">${c.label}</a>
                </div>`).join('');
    return `
    <div class="card">
        <h2>&#x1F4CA; Estructura</h2>
        <div style="overflow-x:auto;">
            <div class="tree">
                <div class="node root-node">${title}</div>
                <div class="v-line"></div>
                <div class="children-row">${childCols}
                </div>
            </div>
        </div>
    </div>`;
}

function coordCard() {
    return `
    <div class="card">
        <h2>&#x1F464; Coordinador/a</h2>
        <div class="coord-grid">
            <div><label>Nom i Cognoms</label><input type="text" id="coord_nom" placeholder="Nom..."></div>
            <div><label>Tel&egrave;fon</label><input type="tel" id="coord_tel" placeholder="Tel&egrave;fon..."></div>
        </div>
    </div>`;
}

function descCard(placeholder) {
    return `
    <div class="card">
        <h2>&#x1F4DD; Descripci&oacute;</h2>
        <textarea id="descripcio" style="min-height:130px;" placeholder="${placeholder}"></textarea>
    </div>`;
}

function page(head, headerHtml, body, key, extraStaffFields) {
    const sf = extraStaffFields || [];
    return head + `
<body>
    ${headerHtml}
    ${body}
    <script>
        window._staffFields = ${JSON.stringify(sf)};
        ${obsAndHorariJS(key)}
    </script>
</body>
</html>`;
}

function header(title, icon, bc, key) {
    return `
    <header>
        <div>
            <h1>${icon} ${title}</h1>
            <div class="breadcrumb">${bc}</div>
        </div>
        <button class="btn-save-main" id="btn-save">GUARDAR TOT</button>
    </header>`;
}

// ── FUTBOL BASE ───────────────────────────────────────────────────────────────
const fbBC = breadcrumb([
    {label:'Direcci\u00f3 Esportiva', href:'../index.html'},
    {label:'Estructura', href:'../estructura.html'},
    {label:'Futbol Base'}
]);
const fbBody = descCard('Descripci\u00f3 general del futbol base del CF Cardona...')
    + treeCard('Futbol Base', [
        {label:'Futbol Base Mascul\u00ed', href:'futbol-base-masculi.html'},
        {label:'Futbol Base Femen\u00ed', href:'futbol-base-femeni.html'}
    ])
    + obsCard();
fs.writeFileSync(path.join(out,'futbol-base.html'), page(baseHead('Futbol Base'), header('Futbol Base','&#x1F393;',fbBC,'seccio_futbol-base'), fbBody, 'seccio_futbol-base', []), {encoding:'utf8'});
console.log('OK: futbol-base.html');

// ── FUTBOL BASE MASCULI ───────────────────────────────────────────────────────
const fbmBC = breadcrumb([
    {label:'Direcci\u00f3 Esportiva', href:'../index.html'},
    {label:'Estructura', href:'../estructura.html'},
    {label:'Futbol Base', href:'futbol-base.html'},
    {label:'Futbol Base Mascul\u00ed'}
]);
const fbmBody = descCard('Descripci\u00f3 general del futbol base mascul\u00ed...')
    + coordCard()
    + treeCard('Futbol Base Mascul\u00ed', [
        {label:'F7', href:'f7.html'},
        {label:'F11', href:'f11.html'}
    ])
    + obsCard();
fs.writeFileSync(path.join(out,'futbol-base-masculi.html'), page(baseHead('Futbol Base Mascul\u00ed'), header('Futbol Base Mascul\u00ed','&#x1F466;',fbmBC,'seccio_futbol-base-masculi'), fbmBody, 'seccio_futbol-base-masculi', ['coord_nom','coord_tel']), {encoding:'utf8'});
console.log('OK: futbol-base-masculi.html');

// ── FUTBOL BASE FEMENI ────────────────────────────────────────────────────────
const fbfBC = breadcrumb([
    {label:'Direcci\u00f3 Esportiva', href:'../index.html'},
    {label:'Estructura', href:'../estructura.html'},
    {label:'Futbol Base', href:'futbol-base.html'},
    {label:'Futbol Base Femen\u00ed'}
]);
const fbfBody = descCard('Descripci\u00f3 general del futbol base femen\u00ed...')
    + coordCard()
    + treeCard('Futbol Base Femen\u00ed', [
        {label:'Alev\u00ed', href:'alevi-femeni.html'},
        {label:'Cadet', href:'cadet-femeni.html'},
        {label:'Juvenil', href:'juvenil-femeni.html'}
    ])
    + obsCard();
fs.writeFileSync(path.join(out,'futbol-base-femeni.html'), page(baseHead('Futbol Base Femen\u00ed'), header('Futbol Base Femen\u00ed','&#x1F467;',fbfBC,'seccio_futbol-base-femeni'), fbfBody, 'seccio_futbol-base-femeni', ['coord_nom','coord_tel']), {encoding:'utf8'});
console.log('OK: futbol-base-femeni.html');

// ── F7 ────────────────────────────────────────────────────────────────────────
const f7BC = breadcrumb([
    {label:'Direcci\u00f3 Esportiva', href:'../index.html'},
    {label:'Estructura', href:'../estructura.html'},
    {label:'Futbol Base Mascul\u00ed', href:'futbol-base-masculi.html'},
    {label:'F7'}
]);
const f7Body = descCard('Descripci\u00f3 general de la categoria F7...')
    + treeCard('F7', [
        {label:'Minis', href:'minis.html'},
        {label:'S7', href:'s7.html'},
        {label:'S8', href:'s8.html'},
        {label:'S9', href:'s9.html'},
        {label:'S10', href:'s10.html'},
        {label:'S11', href:'s11.html'},
        {label:'S12', href:'s12.html'}
    ])
    + obsCard();
fs.writeFileSync(path.join(out,'f7.html'), page(baseHead('F7'), header('Futbol 7 (F7)','&#x26BD;',f7BC,'seccio_f7'), f7Body, 'seccio_f7', []), {encoding:'utf8'});
console.log('OK: f7.html');

// ── F11 ───────────────────────────────────────────────────────────────────────
const f11BC = breadcrumb([
    {label:'Direcci\u00f3 Esportiva', href:'../index.html'},
    {label:'Estructura', href:'../estructura.html'},
    {label:'Futbol Base Mascul\u00ed', href:'futbol-base-masculi.html'},
    {label:'F11'}
]);
const f11Body = descCard('Descripci\u00f3 general de la categoria F11...')
    + treeCard('F11', [
        {label:'S16', href:'s16.html'},
        {label:'Juvenil Mascul\u00ed', href:'juvenil-masculi.html'}
    ])
    + obsCard();
fs.writeFileSync(path.join(out,'f11.html'), page(baseHead('F11'), header('Futbol 11 (F11)','&#x26BD;',f11BC,'seccio_f11'), f11Body, 'seccio_f11', []), {encoding:'utf8'});
console.log('OK: f11.html');

// ── EQUIPS INDIVIDUALS ────────────────────────────────────────────────────────
const equipRoles = ['Primer Entrenador', 'Segon Entrenador', 'Tercer Entrenador'];

const equips = [
    { file:'minis', title:'Minis', icon:'&#x2B50;', parent:'F7', parentHref:'f7.html', parentParent:'Futbol Base Mascul\u00ed', parentParentHref:'futbol-base-masculi.html' },
    { file:'s7',    title:'S7',    icon:'&#x2B50;', parent:'F7', parentHref:'f7.html', parentParent:'Futbol Base Mascul\u00ed', parentParentHref:'futbol-base-masculi.html' },
    { file:'s8',    title:'S8',    icon:'&#x2B50;', parent:'F7', parentHref:'f7.html', parentParent:'Futbol Base Mascul\u00ed', parentParentHref:'futbol-base-masculi.html' },
    { file:'s9',    title:'S9',    icon:'&#x2B50;', parent:'F7', parentHref:'f7.html', parentParent:'Futbol Base Mascul\u00ed', parentParentHref:'futbol-base-masculi.html' },
    { file:'s10',   title:'S10',   icon:'&#x2B50;', parent:'F7', parentHref:'f7.html', parentParent:'Futbol Base Mascul\u00ed', parentParentHref:'futbol-base-masculi.html' },
    { file:'s11',   title:'S11',   icon:'&#x2B50;', parent:'F7', parentHref:'f7.html', parentParent:'Futbol Base Mascul\u00ed', parentParentHref:'futbol-base-masculi.html' },
    { file:'s12',   title:'S12',   icon:'&#x2B50;', parent:'F7', parentHref:'f7.html', parentParent:'Futbol Base Mascul\u00ed', parentParentHref:'futbol-base-masculi.html' },
    { file:'s16',   title:'S16 (Cadet)', icon:'&#x2B50;', parent:'F11', parentHref:'f11.html', parentParent:'Futbol Base Mascul\u00ed', parentParentHref:'futbol-base-masculi.html' },
    { file:'juvenil-masculi', title:'Juvenil Mascul\u00ed', icon:'&#x2B50;', parent:'F11', parentHref:'f11.html', parentParent:'Futbol Base Mascul\u00ed', parentParentHref:'futbol-base-masculi.html' },
    { file:'alevi-femeni',   title:'Alev\u00ed Femen\u00ed',  icon:'&#x2B50;', parent:'Futbol Base Femen\u00ed', parentHref:'futbol-base-femeni.html', parentParent:'Futbol Base', parentParentHref:'futbol-base.html' },
    { file:'cadet-femeni',   title:'Cadet Femen\u00ed',   icon:'&#x2B50;', parent:'Futbol Base Femen\u00ed', parentHref:'futbol-base-femeni.html', parentParent:'Futbol Base', parentParentHref:'futbol-base.html' },
    { file:'juvenil-femeni', title:'Juvenil Femen\u00ed', icon:'&#x2B50;', parent:'Futbol Base Femen\u00ed', parentHref:'futbol-base-femeni.html', parentParent:'Futbol Base', parentParentHref:'futbol-base.html' },
];

equips.forEach(e => {
    const bc = breadcrumb([
        {label:'Direcci\u00f3 Esportiva', href:'../index.html'},
        {label:'Estructura', href:'../estructura.html'},
        {label:e.parentParent, href:e.parentParentHref},
        {label:e.parent, href:e.parentHref},
        {label:e.title}
    ]);
    const sf = staffFieldIds(equipRoles);
    const body = descCard('Descripci\u00f3 de l\'equip ' + e.title + '...')
        + staffCard(equipRoles)
        + horariCard()
        + plantillaPlaceholder()
        + obsCard();
    fs.writeFileSync(path.join(out, e.file+'.html'), page(baseHead(e.title), header(e.title, e.icon, bc, 'seccio_'+e.file), body, 'seccio_'+e.file, sf), {encoding:'utf8'});
    console.log('OK: ' + e.file + '.html');
});

console.log('\nDone!');