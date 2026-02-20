const fs = require('fs');
const path = require('path');

const seccions = [
    { file: 'direccio-esportiva', title: 'Direcci\u00f3 Esportiva', icon: '\u{1F464}', fields: ['Directrius', 'Funcions', 'Perfil'] },
    { file: 'horari-entrenaments', title: 'Horari Entrenaments', icon: '\u{1F5D3}', fields: ['Horari Primer Equip', 'Horari Filial', 'Horari Futbol Base', 'Observacions'] },
    { file: 'distribucio-camp', title: 'Distribuci\u00f3 del Camp', icon: '\u{1F3DF}', fields: ['Camp Principal', 'Camp Secundari', 'Vestuaris', 'Observacions'] },
    { file: 'senior', title: 'Senior', icon: '\u26BD', fields: ['Objectius', 'Planificaci\u00f3', 'Observacions'] },
    { file: 'comissio-esportiva', title: 'Comissi\u00f3 Esportiva', icon: '\u{1F3DB}', fields: ['Membres', 'Funcions', 'Reunions', 'Acords'] },
    { file: 'filial', title: 'Filial', icon: '\u{1F3C6}', fields: ['Situaci\u00f3 Actual', 'Objectius', 'Plantilla', 'Observacions'] },
    { file: 'futbol-base', title: 'Futbol Base', icon: '\u{1F393}', fields: ['Coordinador', 'Objectius Generals', 'Observacions'] },
    { file: 'futbol-base-masculi', title: 'Futbol Base Mascul\u00ED', icon: '\u{1F466}', fields: ['Coordinador', 'Equips', 'Objectius', 'Observacions'] },
    { file: 'futbol-base-femeni', title: 'Futbol Base Femen\u00ED', icon: '\u{1F467}', fields: ['Coordinadora', 'Equips', 'Objectius', 'Observacions'] },
    { file: 'f7', title: 'Futbol 7 (F7)', icon: '\u26BD', fields: ['Coordinador', 'Objectius', 'Observacions'] },
    { file: 'f11', title: 'Futbol 11 (F11)', icon: '\u26BD', fields: ['Coordinador', 'Objectius', 'Observacions'] },
    { file: 'minis', title: 'Minis', icon: '\u2B50', fields: ['Entrenador', 'Horari', 'Jugadors', 'Observacions'] },
    { file: 's7', title: 'S7', icon: '\u2B50', fields: ['Entrenador', 'Horari', 'Jugadors', 'Observacions'] },
    { file: 's8', title: 'S8', icon: '\u2B50', fields: ['Entrenador', 'Horari', 'Jugadors', 'Observacions'] },
    { file: 's9', title: 'S9', icon: '\u2B50', fields: ['Entrenador', 'Horari', 'Jugadors', 'Observacions'] },
    { file: 's10', title: 'S10', icon: '\u2B50', fields: ['Entrenador', 'Horari', 'Jugadors', 'Observacions'] },
    { file: 's11', title: 'S11', icon: '\u2B50', fields: ['Entrenador', 'Horari', 'Jugadors', 'Observacions'] },
    { file: 's12', title: 'S12', icon: '\u2B50', fields: ['Entrenador', 'Horari', 'Jugadors', 'Observacions'] },
    { file: 's16', title: 'S16 (Cadet)', icon: '\u2B50', fields: ['Entrenador', 'Horari', 'Jugadors', 'Objectius', 'Observacions'] },
    { file: 'juvenil-masculi', title: 'Juvenil Mascul\u00ED', icon: '\u2B50', fields: ['Entrenador', 'Horari', 'Jugadors', 'Objectius', 'Observacions'] },
    { file: 'alevi-femeni', title: 'Alev\u00ED Femen\u00ED', icon: '\u2B50', fields: ['Entrenadora', 'Horari', 'Jugadores', 'Observacions'] },
    { file: 'cadet-femeni', title: 'Cadet Femen\u00ED', icon: '\u2B50', fields: ['Entrenadora', 'Horari', 'Jugadores', 'Objectius', 'Observacions'] },
    { file: 'juvenil-femeni', title: 'Juvenil Femen\u00ED', icon: '\u2B50', fields: ['Entrenadora', 'Horari', 'Jugadores', 'Objectius', 'Observacions'] },
];

function makeId(f) { return f.toLowerCase().replace(/ /g, '_'); }

function template(s) {
    const fieldInputs = s.fields.map(f => `
        <div class="input-group">
            <label>${f}</label>
            <textarea id="${makeId(f)}" placeholder="${f}..."></textarea>
        </div>`).join('');
    const fieldIds = JSON.stringify(s.fields.map(makeId));
    return `<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${s.title} | CF Cardona</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #d91d1d; --bg: #f1f5f9; --border: #e2e8f0; }
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter',sans-serif; }
        body { background:var(--bg); min-height:100vh; padding:2rem; }
        body::before { content:""; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:600px; height:600px; background-image:url('/Web jugadors/ESCUT CF CARDONA.jpeg'); background-size:contain; background-repeat:no-repeat; opacity:0.04; filter:blur(2px); z-index:0; pointer-events:none; }
        header { max-width:800px; margin:0 auto 2rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
        h1 { color:var(--primary); font-weight:800; font-size:1.5rem; }
        .breadcrumb { font-size:0.85rem; color:#64748b; margin-top:0.25rem; }
        .breadcrumb a { color:var(--primary); text-decoration:none; font-weight:600; }
        .card { background:white; border-radius:1rem; padding:2rem; box-shadow:0 4px 6px -1px rgb(0 0 0/0.1); border:1px solid var(--border); max-width:800px; margin:0 auto; position:relative; z-index:1; }
        .card h2 { color:var(--primary); font-size:1.25rem; margin-bottom:1.5rem; border-bottom:2px solid #fee2e2; padding-bottom:0.75rem; }
        .input-group { margin-bottom:1.5rem; }
        .input-group label { display:block; font-weight:700; font-size:0.85rem; color:#475569; margin-bottom:0.5rem; }
        textarea { width:100%; min-height:100px; padding:0.75rem; border:1px solid var(--border); border-radius:0.5rem; font-size:0.9rem; outline:none; resize:vertical; line-height:1.5; }
        textarea:focus { border-color:var(--primary); }
        .btn-save { background:var(--primary); color:white; border:none; padding:0.75rem 2rem; border-radius:0.5rem; font-weight:700; cursor:pointer; font-size:0.95rem; }
        .btn-save:hover { background:#b91c1c; }
    </style>
</head>
<body>
    <header>
        <div>
            <h1>${s.icon} ${s.title}</h1>
            <div class="breadcrumb">
                <a href="../index.html">Direcci&oacute; Esportiva</a> &rarr;
                <a href="../estructura.html">Estructura</a> &rarr; ${s.title}
            </div>
        </div>
        <button class="btn-save" id="btn-save">GUARDAR</button>
    </header>
    <div class="card">
        <h2>${s.icon} ${s.title}</h2>
        ${fieldInputs}
    </div>
    <script>
        const API = '/api/players';
        const fields = ${fieldIds};
        const key = 'seccio_${s.file}';
        async function load() {
            try { const r = await fetch(API); const db = await r.json(); const data = db[key] || {}; fields.forEach(f => { const el = document.getElementById(f); if (el) el.value = data[f] || ''; }); } catch(e) {}
        }
        document.getElementById('btn-save').addEventListener('click', async () => {
            const btn = document.getElementById('btn-save');
            try {
                const r = await fetch(API); const db = await r.json(); db[key] = {};
                fields.forEach(f => { const el = document.getElementById(f); if (el) db[key][f] = el.value; });
                const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(db) });
                if (res.ok) { btn.innerText = 'GUARDAT!'; btn.style.background = '#16a34a'; }
            } catch(e) { btn.innerText = 'ERROR'; }
            setTimeout(() => { btn.innerText = 'GUARDAR'; btn.style.background = '#d91d1d'; }, 2000);
        });
        load();
    </script>
</body>
</html>`;
}

const outDir = path.join(__dirname, 'seccions');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
seccions.forEach(s => {
    fs.writeFileSync(path.join(outDir, s.file + '.html'), template(s), { encoding: 'utf8' });
    process.stdout.write('OK: ' + s.file + '\n');
});
process.stdout.write('Done: ' + seccions.length + ' pages\n');