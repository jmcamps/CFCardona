const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const SEC = path.join(ROOT, 'seccions');

function w(file, content) {
    fs.writeFileSync(file, content, { encoding: 'utf8' });
    process.stdout.write('OK: ' + path.basename(file) + '\n');
}

function bc(parts) {
    const links = parts.slice(0, -1).map(p => `<a href="${p.h}">${p.l}</a>`).join(' &rarr; ');
    return links + ' &rarr; ' + parts[parts.length - 1].l;
}

// ?? CSS ??????????????????????????????????????????????????????????????????????

const CSS_SEC = `
        :root{--primary:#d91d1d;--bg:#f1f5f9;--border:#e2e8f0;}
        *{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',sans-serif;}
        body{background:var(--bg);min-height:100vh;padding:2rem;overflow-x:auto;}
        header{max-width:960px;margin:0 auto 2rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;position:relative;z-index:1;}
        h1{color:var(--primary);font-weight:800;font-size:1.5rem;}
        .breadcrumb{font-size:0.85rem;color:#64748b;margin-top:0.25rem;}
        .breadcrumb a{color:var(--primary);text-decoration:none;font-weight:600;}
        .breadcrumb a:hover{text-decoration:underline;}
        .card{background:white;border-radius:1rem;padding:2rem;box-shadow:0 4px 6px -1px rgb(0 0 0/0.1);border:1px solid var(--border);max-width:960px;margin:0 auto 2rem;position:relative;z-index:1;}
        .card h2{color:var(--primary);font-size:1.1rem;font-weight:800;margin-bottom:1.5rem;border-bottom:2px solid #fee2e2;padding-bottom:0.75rem;}
        label{display:block;font-weight:700;font-size:0.82rem;color:#475569;margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.05em;}
        textarea{width:100%;min-height:120px;padding:0.75rem;border:1px solid var(--border);border-radius:0.5rem;font-size:0.9rem;outline:none;resize:vertical;line-height:1.6;}
        textarea:focus{border-color:var(--primary);}
        input[type=text],input[type=tel],input[type=date],input[type=time],input[type=url]{width:100%;padding:0.6rem 0.8rem;border:1px solid var(--border);border-radius:0.5rem;font-size:0.9rem;outline:none;}
        input:focus,select:focus{border-color:var(--primary);}
        select{width:100%;padding:0.6rem 0.8rem;border:1px solid var(--border);border-radius:0.5rem;font-size:0.9rem;outline:none;background:white;}
        .staff-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem;}
        .staff-member{background:#fffafa;border:1px solid #fecaca;border-radius:0.75rem;padding:1.25rem;}
        .role-title{font-size:0.78rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:var(--primary);margin-bottom:0.75rem;}
        .staff-fields{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;}
        .horari-form{background:#f8fafc;border:1px solid var(--border);border-radius:0.75rem;padding:1.25rem;margin-top:1rem;}
        .horari-form-title{font-size:0.82rem;font-weight:800;text-transform:uppercase;color:#475569;margin-bottom:1rem;}
        .horari-form-row{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr 1fr auto;gap:0.6rem;align-items:end;}
        .horari-table{width:100%;border-collapse:collapse;font-size:0.88rem;}
        .horari-table thead tr{background:#fee2e2;color:var(--primary);}
        .horari-table th{padding:0.6rem 1rem;text-align:left;font-weight:700;}
        .horari-table td{padding:0.65rem 1rem;border-bottom:1px solid var(--border);}
        .horari-table tr:last-child td{border-bottom:none;}
        .dia-badge{font-weight:800;color:var(--primary);}
        .comp-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;}
        .comp-link-box{background:#fff5f5;border:1px solid #fecaca;border-radius:0.75rem;padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem;}
        .fed-link{display:inline-flex;align-items:center;gap:0.5rem;background:var(--primary);color:white;text-decoration:none;padding:0.6rem 1.2rem;border-radius:0.5rem;font-weight:700;font-size:0.85rem;width:fit-content;transition:all 0.2s;}
        .fed-link:hover{background:#b91c1c;}
        .partit-list{margin-bottom:1rem;}
        .partit-item{background:#fffafa;border:1px solid #fecaca;border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:0.75rem;display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;}
        .partit-info{flex:1;}
        .partit-header{display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;margin-bottom:0.3rem;}
        .partit-date{font-weight:800;color:var(--primary);}
        .type-amisto{background:#dbeafe;color:#1d4ed8;font-size:0.75rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:1rem;}
        .type-torneig{background:#fef9c3;color:#854d0e;font-size:0.75rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:1rem;}
        .partit-rival{font-weight:700;}
        .partit-lloc{font-size:0.82rem;color:#64748b;}
        .partit-result{font-size:0.82rem;color:#475569;}
        .add-form-box{background:#f8fafc;border:1px solid var(--border);border-radius:0.75rem;padding:1.25rem;}
        .add-form-title{font-size:0.82rem;font-weight:800;text-transform:uppercase;color:#475569;margin-bottom:1rem;}
        .form-row-4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;}
        .form-row-3{display:grid;grid-template-columns:1fr 1fr auto;gap:0.75rem;margin-bottom:0.75rem;}
        .plantilla-placeholder{text-align:center;padding:3rem 2rem;background:#f8fafc;border-radius:0.75rem;border:2px dashed var(--border);}
        .plantilla-placeholder span{font-size:2.5rem;display:block;margin-bottom:1rem;}
        .plantilla-placeholder p{color:#94a3b8;font-size:0.95rem;margin-bottom:0.5rem;}
        .obs-list{margin-bottom:1rem;}
        .obs-item{background:#fffafa;border:1px solid #fecaca;border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:0.75rem;}
        .obs-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;}
        .obs-meta{font-size:0.82rem;color:#64748b;}
        .obs-meta strong{color:var(--primary);}
        .obs-text{font-size:0.9rem;line-height:1.6;white-space:pre-wrap;}
        .add-obs-form{background:#f8fafc;border:1px solid var(--border);border-radius:0.75rem;padding:1.25rem;}
        .form-title{font-size:0.82rem;font-weight:800;text-transform:uppercase;color:#475569;margin-bottom:1rem;}
        .obs-form-row{display:grid;grid-template-columns:1fr 1fr auto;gap:0.75rem;margin-bottom:0.75rem;align-items:end;}
        .btn{padding:0.65rem 1.5rem;border-radius:0.5rem;font-weight:700;cursor:pointer;border:none;font-size:0.88rem;}
        .btn-primary{background:var(--primary);color:white;}
        .btn-primary:hover{background:#b91c1c;}
        .btn-save-main{background:var(--primary);color:white;border:none;padding:0.75rem 2rem;border-radius:0.5rem;font-weight:700;cursor:pointer;font-size:0.95rem;}
        .btn-remove{background:none;border:none;color:var(--primary);font-size:1.2rem;cursor:pointer;padding:0 0.25rem;}
        .empty-msg{color:#94a3b8;font-size:0.85rem;padding:0.5rem;}
        .coord-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
        .link-card{text-align:center;padding:2rem;background:linear-gradient(135deg,#fff,#fff5f5);border-radius:0.75rem;border:2px dashed #fca5a5;}
        .link-card p{color:#64748b;font-size:0.9rem;margin-bottom:1.2rem;}
        .btn-link{display:inline-flex;align-items:center;gap:0.5rem;background:var(--primary);color:white;text-decoration:none;padding:0.75rem 1.5rem;border-radius:0.5rem;font-weight:700;font-size:0.9rem;transition:all 0.2s;}
        .btn-link:hover{background:#b91c1c;transform:translateY(-2px);box-shadow:0 4px 12px rgba(217,29,29,0.2);}
        .tree{display:flex;flex-direction:column;align-items:center;padding:1rem 0;min-width:max-content;margin:0 auto;}
        
        /* Scouting Styles */
        .scouting-container { display: flex; gap: 2rem; align-items: flex-start; }
        .scouting-sidebar { width: 350px; flex-shrink: 0; background: white; border-radius: 1rem; border: 1px solid var(--border); padding: 1.5rem; max-height: 800px; overflow-y: auto; }
        .scouting-content { flex: 1; min-width: 0; }
        
        .scouting-list { display: grid; gap: 0.75rem; }
        .scouting-list-item { padding: 1rem; background: #fffafa; border: 1px solid #fecaca; border-radius: 0.75rem; cursor: pointer; transition: all 0.2s; position: relative; }
        .scouting-list-item:hover { transform: translateX(5px); background: #fee2e2; }
        .scouting-list-item.active { border-left: 5px solid var(--primary); background: #fee2e2; }
        .scouting-list-name { font-weight: 800; color: var(--primary); font-size: 1rem; }
        .scouting-list-meta { font-size: 0.75rem; color: #64748b; margin-top: 0.2rem; }

        .scouting-detail-card { background: white; border-radius: 1rem; padding: 2rem; border: 1px solid var(--border); box-shadow: 0 4px 6px -1px rgb(0 0 0/0.1); }
        .scouting-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid #fee2e2; padding-bottom: 1rem; }
        .scouting-header-actions h2 { margin: 0; border: none; padding: 0; }
        
        .contact-item { background: white; border: 1px solid #e2e8f0; padding: 0.8rem 1rem; border-radius: 0.5rem; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.5rem; }
        .contact-content { flex: 1; }
        .contact-meta { font-weight: 700; color: var(--primary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.25rem; display: block; }
        .btn-delete-small { color: #94a3b8; background: none; border: none; cursor: pointer; padding: 0.2rem; font-size: 1rem; }
        .btn-delete-small:hover { color: var(--primary); }

        .pos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; padding: 0.5rem; background: #fff5f5; border: 1px solid #fecaca; border-radius: 0.5rem; margin-top: 0.4rem; }
        .pos-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
        .pos-item input { width: auto; }
        .scouting-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem; }

        .v-line{width:2px;height:20px;background:#fca5a5;margin:0 auto;}
        .children-row{display:flex;gap:2rem;justify-content:center;position:relative;}
        .children-row::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);height:2px;background:#fca5a5;width:calc(100% - 60px);}
        .child-col{display:flex;flex-direction:column;align-items:center;}
        .tree-node{display:inline-flex;align-items:center;justify-content:center;padding:0.6rem 1.4rem;border-radius:0.5rem;font-weight:700;font-size:0.85rem;text-decoration:none;color:var(--primary);background:white;border:2px solid var(--primary);box-shadow:0 2px 8px rgba(217,29,29,0.1);transition:all 0.2s;white-space:nowrap;}
        .tree-node:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(217,29,29,0.2);background:#fff5f5;}
        .tree-node.root{background:#fee2e2;}
        @media(max-width:640px){.staff-fields,.comp-grid,.form-row-4,.form-row-3,.coord-grid{grid-template-columns:1fr;}.horari-form-row{grid-template-columns:1fr 1fr;}.obs-form-row{grid-template-columns:1fr;}}`;

// ?? HTML COMPONENTS ???????????????????????????????????????????????????????????

function headHtml(title, css) {
    return `<!DOCTYPE html>\n<html lang="ca">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${title} | CF Cardona</title>\n    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">\n    <style>${css}\n    </style>\n</head>`;
}

function hdr(icon, title, breadcrumbHtml) {
    return `\n    <header>\n        <div>\n            <h1>${icon} ${title}</h1>\n            <div class="breadcrumb">${breadcrumbHtml}</div>\n        </div>\n    </header>`;
}

function descCard(ph) {
    return `
    <div class="card">
        <h2>&#x1F4DD; Descripci&oacute;</h2>
        <textarea id="descripcio" style="min-height:130px;" placeholder="${ph}" onchange="saveAll(true)"></textarea>
    </div>`;
}

function staticCard(title, icon, content) {
    return `
    <div class="card">
        <h2>${icon} ${title}</h2>
        <div style="color:#334155; line-height:1.75;">${content}</div>
    </div>`;
}

function scoutingCard() {
    const positions = ['Porter', 'Lateral Dret', 'Lateral Esquerre', 'Central', 'Pivot Defensiu', 'Interior', 'Mitja Punta', 'Extrem Dret', 'Extrem Esquerre', 'Davanter Centre'];
    const posCheckboxes = positions.map(p => `
        <label class="pos-item">
            <input type="checkbox" name="sc_pos" value="${p}"> ${p}
        </label>
    `).join('');

    return `
    <div class="scouting-container">
        <!-- Sidebar: Llista de jugadors -->
        <div class="scouting-sidebar">
            <h2 style="color:var(--primary); font-size:1rem; margin-bottom:1rem; border-bottom:1px solid #fee2e2; padding-bottom:0.5rem;">&#x1F465; Jugadors en Cartera</h2>
            <div id="scouting_list" class="scouting-list">
                <!-- Injected by JS -->
            </div>
            <button class="btn btn-primary" onclick="showAddForm()" style="width:100%; margin-top:1.5rem; font-size:0.8rem;">+ NOU JUGADOR</button>
        </div>

        <!-- Main: Detalls o Formulari -->
        <div class="scouting-content">
            <div id="scouting_main_view">
                <div class="card" style="text-align:center; padding:5rem 2rem;">
                    <span style="font-size:3rem;">&#x1F50E;</span>
                    <p style="color:#94a3b8; margin-top:1rem;">Selecciona un jugador per veure'n els detalls o afegeix-ne un de nou.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Hidden Template per al formulari d'alta -->
    <template id="tpl_add_form">
        <div class="card">
            <h2>&#x2728; Nou Jugador a la Cartera</h2>
            <div class="scouting-form-grid">
                <div><label>Nom i Cognoms</label><input type="text" id="sc_nom" placeholder="Ex: Joan Ferran..."></div>
                <div><label>Club Actual</label><input type="text" id="sc_club" placeholder="Ex: CE Manresa..."></div>
                <div><label>Tel&egrave;fon</label><input type="tel" id="sc_tel" placeholder="Ex: 600 000 000..."></div>
                <div><label>Poblaci&oacute;</label><input type="text" id="sc_poblacio" placeholder="Ex: Manresa..."></div>
            </div>
            <div style="margin-bottom:1.5rem;">
                <label>Posicionament (pots marcar varies)</label>
                <div class="pos-grid">${posCheckboxes}</div>
            </div>
            <div style="margin-bottom:1rem;">
                <label>Situaci&oacute; de mercat / Perfil r&agrave;pid</label>
                <textarea id="sc_situacio" style="min-height:80px;" placeholder="Ex: Acaba contracte al juny..."></textarea>
            </div>
            <div style="display:flex; gap:1rem;">
                <button class="btn btn-primary" onclick="addScoutingPlayer()" style="flex:2;">GUARDAR JUGADOR</button>
                <button class="btn" onclick="clearMainView()" style="background:#e2e8f0; flex:1;">CANCEL·LAR</button>
            </div>
        </div>
    </template>
    `;
}

function scoutingJS() {
    return `
    <script>
        const API='/api/players';
        const KEY='scouting_database';
        const ALL_POSITIONS = ['Porter', 'Lateral Dret', 'Lateral Esquerre', 'Central', 'Pivot Defensiu', 'Interior', 'Mitja Punta', 'Extrem Dret', 'Extrem Esquerre', 'Davanter Centre'];
        let db={}, players=[], selectedId=null;

        async function load(){
            try {
                const r=await fetch(API); db=await r.json();
                players = db[KEY] || [];
                renderList();
            } catch(e) { console.warn('Servidor no disponible'); }
        }

        async function save(){
            db[KEY] = players;
            try {
                await fetch(API, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(db)});
            } catch(e) { console.error('Error al guardar'); }
        }

        window.showAddForm = function() {
            selectedId = null;
            renderList();
            const tpl = document.getElementById('tpl_add_form');
            document.getElementById('scouting_main_view').innerHTML = tpl.innerHTML;
        };

        window.clearMainView = function() {
            selectedId = null;
            renderList();
            document.getElementById('scouting_main_view').innerHTML = \`
                <div class="card" style="text-align:center; padding:5rem 2rem;">
                    <span style="font-size:3rem;">&#x1F50E;</span>
                    <p style="color:#94a3b8; margin-top:1rem;">Selecciona un jugador per veure'n els detalls o afegeix-ne un de nou.</p>
                </div>\`;
        };

        window.addScoutingPlayer = async function() {
            const nom = document.getElementById('sc_nom').value.trim();
            const club = document.getElementById('sc_club').value.trim();
            const tel = document.getElementById('sc_tel').value.trim();
            const poblacio = document.getElementById('sc_poblacio').value.trim();
            const situacio = document.getElementById('sc_situacio').value.trim();
            const posCheckboxes = document.querySelectorAll('input[name="sc_pos"]:checked');
            const posicions = Array.from(posCheckboxes).map(cb => cb.value);

            if(!nom) { alert('El nom és obligatori'); return; }

            const newPlayer = {
                id: Date.now(),
                nom, club, tel, poblacio, posicions, situacio,
                perfil: '',
                contactes: []
            };
            players.push(newPlayer);
            await save();
            selectPlayer(newPlayer.id);
        };

        window.selectPlayer = function(id) {
            selectedId = id;
            renderList();
            renderDetails();
        };

        window.deletePlayer = async function(id) {
            if(!confirm('Segur que vols eliminar aquest jugador de la cartera?')) return;
            players = players.filter(p => p.id !== id);
            await save();
            clearMainView();
        };

        window.updateField = async function(id, field, val) {
            const p = players.find(x => x.id === id);
            if(p) { 
                p[field] = val; 
                await save(); 
                if(field === 'nom') renderList();
            }
        };

        window.updatePositions = async function(id) {
            const p = players.find(x => x.id === id);
            if(p) {
                const checks = document.querySelectorAll('input[name="detail_pos"]:checked');
                p.posicions = Array.from(checks).map(cb => cb.value);
                await save();
                renderList();
            }
        };

        window.updatePerfil = async function(id, val) {
            const p = players.find(x => x.id === id);
            if(p) { p.perfil = val; await save(); }
        };

        window.addContact = async function(pid) {
            const data = document.getElementById(\`c_data_\${pid}\`).value;
            const autor = document.getElementById(\`c_autor_\${pid}\`).value.trim();
            const resultat = document.getElementById(\`c_res_\${pid}\`).value.trim();
            
            if(!data || !autor || !resultat) { alert('Omple tots els camps del contacte'); return; }
            
            const p = players.find(x => x.id === pid);
            if(p) {
                p.contactes.unshift({ id: Date.now(), data, autor, resultat });
                await save();
                renderDetails();
            }
        };

        window.deleteContact = async function(pid, cid) {
            if(!confirm('Vols eliminar aquest contacte?')) return;
            const p = players.find(x => x.id === pid);
            if(p) {
                p.contactes = p.contactes.filter(c => {
                    const currentId = String(c.id || (c.data + c.autor + c.resultat));
                    return currentId !== String(cid);
                });
                await save();
                renderDetails();
            }
        };

        function renderList() {
            const el = document.getElementById('scouting_list');
            if(!players.length) { el.innerHTML = '<div class="empty-msg">No hi ha jugadors.</div>'; return; }
            
            el.innerHTML = players.map(p => \`
                <div class="scouting-list-item \${p.id === selectedId ? 'active' : ''}" onclick="selectPlayer(\${p.id})">
                    <div class="scouting-list-name">\${esc(p.nom)}</div>
                    <div class="scouting-list-meta">\${esc(p.club) || 'Lliure'} &middot; \${(p.posicions || []).slice(0,2).join(', ')}</div>
                </div>
            \`).join('');
        }

        function renderDetails() {
            const p = players.find(x => x.id === selectedId);
            if(!p) return;
            
            const today = new Date().toISOString().split('T')[0];
            const main = document.getElementById('scouting_main_view');

            const posHTML = ALL_POSITIONS.map(pos => \`
                <label class="pos-item">
                    <input type="checkbox" name="detail_pos" value="\${pos}" 
                        \${(p.posicions || []).includes(pos) ? 'checked' : ''} 
                        onchange="updatePositions(\${p.id})"> \${pos}
                </label>
            \`).join('');

            main.innerHTML = \`
                <div class="scouting-detail-card">
                    <div class="scouting-header-actions" style="align-items: flex-start; margin-bottom: 1.5rem;">
                        <div style="flex:1;">
                            <label style="font-size:0.65rem; margin-bottom:0.2rem;">Nom del Jugador</label>
                            <input type="text" value="\${esc(p.nom)}" 
                                style="font-size:1.4rem; font-weight:800; color:var(--primary); padding:0.4rem; border:1px solid transparent; width:100%;"
                                onchange="updateField(\${p.id}, 'nom', this.value)"
                                onfocus="this.style.borderColor='#fee2e2'"
                                onblur="this.style.borderColor='transparent'">
                        </div>
                        <button class="btn" onclick="deletePlayer(\${p.id})" style="color:var(--primary); font-size:0.75rem; border:1px solid var(--primary); padding:0.4rem 0.8rem;">ELIMINAR</button>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
                        <div>
                            <label style="font-size:0.7rem;">Club Actual</label>
                            <input type="text" value="\${esc(p.club)}" placeholder="Lliure"
                                onchange="updateField(\${p.id}, 'club', this.value)">
                        </div>
                        <div>
                            <label style="font-size:0.7rem;">Tel&egrave;fon Contacte</label>
                            <input type="tel" value="\${esc(p.tel)}" placeholder="600 000 000"
                                onchange="updateField(\${p.id}, 'tel', this.value)">
                        </div>
                        <div>
                            <label style="font-size:0.7rem;">Poblaci&oacute;</label>
                            <input type="text" value="\${esc(p.poblacio)}" placeholder="Poblaci&oacute;..."
                                onchange="updateField(\${p.id}, 'poblacio', this.value)">
                        </div>
                    </div>

                    <div style="margin-bottom:1.5rem;">
                        <label style="font-size:0.7rem;">Posicions</label>
                        <div class="pos-grid" style="margin-top:0.4rem;">
                            \${posHTML}
                        </div>
                    </div>

                    <div style="margin-bottom:1.5rem;">
                        <label style="font-size:0.7rem;">Situaci&oacute; de Mercat / Estat actual</label>
                        <textarea style="min-height:60px; font-size:0.85rem; padding:0.6rem;" 
                            placeholder="Situaci&oacute; actual del jugador..."
                            onchange="updateField(\${p.id}, 'situacio', this.value)">\${p.situacio || ''}</textarea>
                    </div>

                    <div class="card" style="padding:1.5rem; margin:0 0 2rem 0; border-color:#fecaca; background:#fffafa;">
                        <h3 style="font-size:0.9rem; color:var(--primary); margin-bottom:0.75rem;">&#x1F4DD; Perfil T\u00e8cnic / Informe</h3>
                        <textarea style="min-height:100px; font-size:0.85rem;" 
                            placeholder="Escriu aqu\u00ed el perfil detallat del jugador..." 
                            onchange="updateField(\${p.id}, 'perfil', this.value)">\${p.perfil || ''}</textarea>
                    </div>

                    <div>
                        <h3 style="font-size:1rem; margin-bottom:1rem; border-bottom:1px solid #fee2e2; padding-bottom:0.5rem;">&#x1F4DE; Seguiment de Contactes</h3>
                        
                        <div class="add-form-box" style="padding:1rem; margin-bottom:1.5rem; background:#f8fafc;">
                            <div class="add-form-title" style="font-size:0.7rem;">Nou Contacte</div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr 2fr auto; gap:0.5rem; align-items:end;">
                                <div><label style="font-size:0.65rem;">Data</label><input type="date" id="c_data_\${p.id}" value="\${today}"></div>
                                <div><label style="font-size:0.65rem;">Responsable</label><input type="text" id="c_autor_\${p.id}" placeholder="Qui..."></div>
                                <div><label style="font-size:0.65rem;">Resultat</label><input type="text" id="c_res_\${p.id}" placeholder="Detalls..."></div>
                                <button class="btn btn-primary" onclick="addContact(\${p.id})" style="padding:0.5rem 1rem; font-size:0.75rem;">AFEGIR</button>
                            </div>
                        </div>

                        <div class="contact-log">
                            \${p.contactes && p.contactes.length ? p.contactes.map(c => {
                                const cid = c.id || (c.data+c.autor+c.resultat);
                                return \`
                                <div class="contact-item">
                                    <div class="contact-content">
                                        <span class="contact-meta">\${fmtDate(c.data)} &mdash; \${esc(c.autor)}</span>
                                        <div>\${esc(c.resultat)}</div>
                                    </div>
                                    <button class="btn-delete-small" onclick="deleteContact(\${p.id}, '\${cid}')">&#x00D7;</button>
                                </div>\`;
                            }).join('') : '<div class="empty-msg">Sense contactes registrats.</div>'}
                        </div>
                    </div>
                </div>\`;
        }

        function fmtDate(d){if(!d)return'-';return new Date(d+'T12:00:00').toLocaleDateString('ca-ES',{day:'2-digit',month:'2-digit',year:'numeric'});}
        function esc(t){if(!t)return'';return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
        load();
    <\/script>`;
}

function coordCard() {
    return `
    <div class="card">
        <h2>&#x1F464; Coordinador/a</h2>
        <div class="coord-grid">
            <div><label>Nom i Cognoms</label><input type="text" id="coord_nom" placeholder="Nom..." onchange="saveAll(true)"></div>
            <div><label>Tel&egrave;fon</label><input type="tel" id="coord_tel" placeholder="Tel&egrave;fon..." onchange="saveAll(true)"></div>
        </div>
    </div>`;
}

function treeCard(title, children, isRoot = false) {
    const homeLink = isRoot ? 'index.html' : '../index.html';
    const cols = children.map(c =>
        `\n                <div class="child-col"><div class="v-line"></div><a href="${c.h}" class="tree-node">${c.l}</a></div>`
    ).join('');
    
    return `
    <div class="card">
        <h2>&#x1F4CA; Estructura</h2>
        <div style="overflow-x:auto;">
            <div class="tree">
                <a href="${homeLink}" class="tree-node root">CF Cardona</a>
                <div class="v-line"></div>
                <div class="children-row">
                    <div class="child-col">
                        <div class="v-line"></div>
                        <div class="tree-node" style="background:#fee2e2;">${title}</div>
                        <div class="v-line"></div>
                        <div class="children-row">${cols}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function staffCard(roles) {
    const m = roles.map(r => {
        const id = r.toLowerCase().replace(/ /g, '_');
        return `
            <div class="staff-member">
                <div class="role-title">${r}</div>
                <div class="staff-fields">
                    <div><label>Nom i Cognoms</label><input type="text" id="s_${id}_nom" placeholder="Nom..." onchange="saveAll(true)"></div>
                    <div><label>Tel&egrave;fon</label><input type="tel" id="s_${id}_tel" placeholder="Tel&egrave;fon..." onchange="saveAll(true)"></div>
                </div>
            </div>`;
    }).join('');
    return `
    <div class="card">
        <h2>&#x1F91D; Staff T&egrave;cnic</h2>
        <div class="staff-grid">${m}
        </div>
    </div>`;
}

function sfIds(roles) {
    return roles.flatMap(r => {
        const id = r.toLowerCase().replace(/ /g, '_');
        return [`s_${id}_nom`, `s_${id}_tel`];
    });
}

function horariCard() {
    return `
    <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:2px solid #fee2e2; padding-bottom:0.75rem;">
            <h2 style="margin-bottom:0; border-bottom:none; padding-bottom:0;">&#x1F5D3; Horari d&apos;Entrenaments</h2>
            <a href="horari-entrenaments.html" class="fed-link" style="font-size:0.75rem; padding:0.4rem 0.8rem;">GESTIONAR HORARIS</a>
        </div>
        <div id="horari_list" class="empty-msg">Sense sessions registrades.</div>
    </div>`;
}

function competicioCard() {
    return `
    <div class="card">
        <h2>&#x1F3C6; Competici&oacute;</h2>
        <div class="comp-grid">
            <div><label>Categoria / Grup</label><input type="text" id="comp_categoria" placeholder="Ex: Quarta Catalana Grup 17" onchange="saveAll(true)"></div>
            <div><label>Temporada</label><input type="text" id="comp_temporada" placeholder="Ex: 2024-2025" onchange="saveAll(true)"></div>
        </div>
        <div class="comp-link-box">
            <div><label>Enlla&ccedil; Federaci&oacute; Catalana de Futbol</label><input type="url" id="comp_url" placeholder="https://www.fcf.cat/..." onchange="saveAll(true)"></div>
            <div><a id="comp_link_btn" href="#" target="_blank" class="fed-link" onclick="openFedLink(event)">&#x1F517; Obrir classificaci&oacute; a la FCF</a></div>
        </div>
    </div>`;
}

function partitsCard() {
    return `\n    <div class="card">\n        <h2>&#x1F4C5; Partits Amistosos i Tornejos</h2>\n        <div id="partits_list" class="partit-list"><div class="empty-msg">Sense partits registrats.</div></div>\n        <div class="add-form-box">\n            <div class="add-form-title">Afegir Partit / Torneig</div>\n            <div class="form-row-4">\n                <div><label>Data</label><input type="date" id="p_data"></div>\n                <div><label>Tipus</label><select id="p_tipus"><option value="Amist\u00f3s">Amist\u00f3s</option><option value="Torneig">Torneig</option></select></div>\n                <div><label>Rival</label><input type="text" id="p_rival" placeholder="Nom del rival..."></div>\n                <div><label>Lloc</label><select id="p_lloc"><option value="Casa">Casa</option><option value="Fora">Fora</option><option value="Neutral">Neutral</option></select></div>\n            </div>\n            <div class="form-row-3">\n                <div><label>Resultat (opcional)</label><input type="text" id="p_resultat" placeholder="Ex: 2-1"></div>\n                <div><label>Nom torneig (si escau)</label><input type="text" id="p_torneig" placeholder="Ex: Torneig Festa Major"></div>\n                <div style="display:flex;align-items:flex-end;"><button class="btn btn-primary" style="width:100%;" onclick="addPartit()">AFEGIR PARTIT</button></div>\n            </div>\n        </div>\n    </div>`;
}

function plantillaCard(link) {
    if (link) {
        return `
    <div class="card">
        <h2>&#x1F4CB; Plantilla de Jugadors</h2>
        <div class="link-card">
            <p>Accés a la gestió de les fitxes individuals dels jugadors d'aquest equip (dades personals, seguiment i estadístiques).</p>
            <a href="${link}" class="btn-link">&#x1F464; ANAR A LA PLANTILLA &rarr;</a>
        </div>
    </div>`;
    }
    return `
    <div class="card">
        <h2>&#x1F4CB; Plantilla de Jugadors</h2>
        <div class="plantilla-placeholder"><span>&#x1F6A7;</span><p><strong>Plantilla pendent de configurar</strong></p><p>Quan tinguis els jugadors, aqu&iacute; podras gestionar les seves fitxes individuals.</p></div>
    </div>`;
}

function horariGlobalCard() {
    return `
    <div class="card">
        <h2>&#x1F5D3; Gestionar Horaris d'Entrenament</h2>
        <div class="horari-form">
            <div class="horari-form-title">Afegir Franja d'Entrenament</div>
            <div class="horari-form-row" style="grid-template-columns: 1.2fr 1fr 0.8fr 0.8fr 1fr 1fr auto;">
                <div><label>Equip</label><select id="h_team"></select></div>
                <div><label>Dia</label><select id="h_dia"><option value="">Selecciona...</option><option>Dilluns</option><option>Dimarts</option><option>Dimecres</option><option>Dijous</option><option>Divendres</option></select></div>
                <div><label>Inici</label><input type="time" id="h_inici"></div>
                <div><label>Fi</label><input type="time" id="h_fi"></div>
                <div><label>Vestidor</label><select id="h_vestidor"><option value="">Selecciona...</option><option>Vestidor 1</option><option>Vestidor 2</option><option>Vestidor 3</option><option>Vestidor 4</option><option>Vestidor 5</option><option>Vestidor 6</option></select></div>
                <div><label>Camp</label><select id="h_camp"><option value="">Selecciona...</option><option>Espai 1</option><option>Espai 2</option><option>Espai 3</option><option>Espai 4</option></select></div>
                <div><button class="btn btn-primary" onclick="addHorariGlobal()" style="white-space:nowrap;">AFEGIR</button></div>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="view-toggle">
            <button class="tab-btn active" id="btn_view_day" onclick="switchView('day')">VISIÓ PER DIES</button>
            <button class="tab-btn" id="btn_view_team" onclick="switchView('team')">VISIÓ PER EQUIPS</button>
        </div>
        
        <div id="view_by_day"></div>
        <div id="view_by_team" style="display:none;"></div>
    </div>`;
}

function horariGlobalJS(teamsJson) {
    return `
    <script>
        const API='/api/players';
        const DIES=['Dilluns','Dimarts','Dimecres','Dijous','Divendres'];
        const TEAMS = ${teamsJson};
        let db = {};

        async function load() {
            try {
                const r = await fetch(API);
                db = await r.json();
                renderAll();
            } catch(e) { console.warn('Servidor no disponible'); }
        }

        function renderAll() {
            renderByDay();
            renderByTeam();
            populateTeamSelect();
        }

        function populateTeamSelect() {
            const sel = document.getElementById('h_team');
            if(!sel) return;
            const current = sel.value;
            sel.innerHTML = '<option value="">Selecciona Equip...</option>' + 
                TEAMS.map(t => \`<option value="\${t.id}">\${t.name}</option>\`).join('');
            if(current) sel.value = current;
        }

        window.addHorariGlobal = async function() {
            const teamId = document.getElementById('h_team').value;
            const dia = document.getElementById('h_dia').value;
            const h_inici = document.getElementById('h_inici').value;
            const h_fi = document.getElementById('h_fi').value;
            const h_vestidor = document.getElementById('h_vestidor').value;
            const h_camp = document.getElementById('h_camp').value;

            if(!teamId || !dia || !h_inici || !h_fi || !h_camp) { 
                alert('Tots els camps són obligatoris (Equip, Dia, Inici, Fi, Camp).'); 
                return; 
            }

            // Control de col·lisions
            let collision = false;
            let collisionMsg = '';
            
            TEAMS.forEach(t => {
                const teamData = db[t.id] || {};
                const horaris = teamData.horaris || [];
                
                horaris.forEach(h => {
                    if (h.dia === dia && h.camp === h_camp) {
                        // Check time overlap: (StartA < EndB) and (EndA > StartB)
                        if (h_inici < h.fi && h_fi > h.inici) {
                            collision = true;
                            collisionMsg = \`Col·lisió detectada: L'equip \${t.name} ja ocupa \${h_camp} de \${h.inici} a \${h.fi}.\`;
                        }
                    }
                });
            });

            if (collision) {
                alert(collisionMsg);
                return;
            }
            
            if(!db[teamId]) db[teamId] = {};
            if(!db[teamId].horaris) db[teamId].horaris = [];
            
            db[teamId].horaris.push({
                dia,
                inici: h_inici,
                fi: h_fi,
                vestidor: h_vestidor,
                camp: h_camp
            });
            
            db[teamId].horaris.sort((a,b) => DIES.indexOf(a.dia) - DIES.indexOf(b.dia) || (a.inici || '').localeCompare(b.inici || ''));
            
            try {
                await fetch(API, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(db)
                });
                renderAll();
                ['h_inici','h_fi','h_vestidor','h_camp'].forEach(id => document.getElementById(id).value = '');
            } catch(e) { alert('Error al guardar'); }
        };

        window.removeHorariGlobal = async function(teamId, index) {
            if(!confirm('Segur que vols eliminar aquesta franja?')) return;
            db[teamId].horaris.splice(index, 1);
            try {
                await fetch(API, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(db)
                });
                renderAll();
            } catch(e) { alert('Error al eliminar'); }
        };

        function renderByDay() {
            const el = document.getElementById('view_by_day');
            if(!el) return;
            let html = '';
            DIES.forEach(dia => {
                let sessions = [];
                TEAMS.forEach(t => {
                    const h = (db[t.id] || {}).horaris || [];
                    h.forEach((s, idx) => {
                        if(s.dia === dia) sessions.push({...s, teamName: t.name, teamId: t.id, originalIndex: idx});
                    });
                });
                sessions.sort((a,b) => (a.inici || '').localeCompare(b.inici || ''));
                
                html += \`<div class="day-section">
                    <h3 class="dia-badge" style="display:inline-block; margin-bottom:1rem; font-size:1.2rem;">\${dia}</h3>
                    <table class="horari-table">
                        <thead><tr><th>Hora</th><th>Equip</th><th>Camp</th><th>Vestidor</th><th style="width:50px"></th></tr></thead>
                        <tbody>
                            \${sessions.length ? sessions.map(s => \`
                                <tr>
                                    <td><strong>\${s.inici || '-'}</strong> - \${s.fi || '-'}</td>
                                    <td>\${s.teamName}</td>
                                    <td>\${s.camp || '-'}</td>
                                    <td>\${s.vestidor || '-'}</td>
                                    <td><button class="btn-remove" onclick="removeHorariGlobal('\${s.teamId}', \${s.originalIndex})">&#x00D7;</button></td>
                                </tr>
                            \`).join('') : '<tr><td colspan="5" class="empty-msg">Sense entrenaments</td></tr>'}
                        </tbody>
                    </table>
                </div>\`;
            });
            el.innerHTML = html;
        }

        function renderByTeam() {
            const el = document.getElementById('view_by_team');
            if(!el) return;
            let html = '';
            TEAMS.forEach(t => {
                const h = (db[t.id] || {}).horaris || [];
                if(h.length === 0) return;
                html += \`<div class="team-section">
                    <h3>\${t.name}</h3>
                    <table class="horari-table">
                        <thead><tr><th>Dia</th><th>Hora</th><th>Camp</th><th>Vestidor</th><th style="width:50px"></th></tr></thead>
                        <tbody>
                            \${h.map((s, idx) => \`
                                <tr>
                                    <td class="dia-badge">\${s.dia}</td>
                                    <td><strong>\${s.inici || '-'}</strong> - \${s.fi || '-'}</td>
                                    <td>\${s.camp || '-'}</td>
                                    <td>\${s.vestidor || '-'}</td>
                                    <td><button class="btn-remove" onclick="removeHorariGlobal('\${t.id}', \${idx})">&#x00D7;</button></td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                </div>\`;
            });
            el.innerHTML = html || '<div class="empty-msg">Cap equip té horaris registrats.</div>';
        }

        window.switchView = function(type) {
            document.getElementById('btn_view_day').classList.toggle('active', type === 'day');
            document.getElementById('btn_view_team').classList.toggle('active', type === 'team');
            document.getElementById('view_by_day').style.display = type === 'day' ? 'block' : 'none';
            document.getElementById('view_by_team').style.display = type === 'team' ? 'block' : 'none';
        }

        function esc(t){if(!t)return'';return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
        load();
    <\/script>
    <style>
        .day-section, .team-section { margin-bottom: 2.5rem; }
        .day-section h3, .team-section h3 { color: var(--primary); border-bottom: 2px solid #fee2e2; padding-bottom: 0.5rem; margin-bottom: 1rem; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .view-toggle { display: flex; gap: 0.5rem; margin-bottom: 2rem; background: #f1f5f9; padding: 0.4rem; border-radius: 0.6rem; width: fit-content; }
        .tab-btn { padding: 0.6rem 1.2rem; border-radius: 0.4rem; border: none; background: transparent; color: #64748b; cursor: pointer; font-weight: 700; font-size: 0.85rem; transition: all 0.2s; }
        .tab-btn.active { background: white; color: var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    </style>
    `;
}

function obsCard() {
    return `\n    <div class="card">\n        <h2>&#x1F4AC; Observacions i Comentaris</h2>\n        <div id="obs_list" class="obs-list"><div class="empty-msg">Sense observacions registrades.</div></div>\n        <div class="add-obs-form">\n            <div class="form-title">Nou Comentari</div>\n            <div class="obs-form-row">\n                <div><label>Autor</label><input type="text" id="obs_autor" placeholder="Qui fa el comentari..."></div>\n                <div><label>Data</label><input type="date" id="obs_data"></div>\n                <div><button class="btn btn-primary" onclick="addObs()">AFEGIR</button></div>\n            </div>\n            <div><label>Comentari</label><textarea id="obs_text" style="min-height:100px;" placeholder="Escriu el comentari..."></textarea></div>\n        </div>\n    </div>`;
}

// ?? JAVASCRIPT ????????????????????????????????????????????????????????????????

function fullJS(key, sf) {
    return `
    <script>
        const API='/api/players';
        const KEY='${key}';
        let db={},observacions=[],horaris=[],partits=[];
        const SF=${JSON.stringify(sf)};
        const DIES=['Dilluns','Dimarts','Dimecres','Dijous','Divendres'];
        const TEAMS=[
            {id:'seccio_primer-equip', name:'Primer Equip'},
            {id:'seccio_filial', name:'Filial'},
            {id:'seccio_minis', name:'Minis'}, {id:'seccio_s7', name:'S7'},
            {id:'seccio_s8', name:'S8'}, {id:'seccio_s9', name:'S9'},
            {id:'seccio_s10', name:'S10'}, {id:'seccio_s11', name:'S11'},
            {id:'seccio_s12', name:'S12'}, {id:'seccio_s16', name:'S16 (Cadet)'},
            {id:'seccio_juvenil-masculi', name:'Juvenil Masculí'},
            {id:'seccio_alevi-femeni', name:'Aleví Femení'},
            {id:'seccio_cadet-femeni', name:'Cadet Femení'},
            {id:'seccio_juvenil-femeni', name:'Juvenil Femení'}
        ];

        async function load(){
            try{
                const r=await fetch(API); db=await r.json();
                const d=db[KEY]||{};
                if(document.getElementById('descripcio')) document.getElementById('descripcio').value=d.descripcio||'';
                SF.forEach(f=>{const el=document.getElementById(f);if(el)el.value=d[f]||'';});
                ['comp_categoria','comp_temporada','comp_url','coord_nom','coord_tel'].forEach(f=>{
                    const el=document.getElementById(f); if(el) el.value=d[f]||'';
                });
                horaris=d.horaris||[]; partits=d.partits||[]; observacions=d.observacions||[];
                renderHorari(); renderPartits(); renderObs();
            }catch(e){ console.warn('Servidor no disponible'); }
        }

        async function saveAll(silent = false){
            db[KEY]={horaris,partits,observacions};
            if(document.getElementById('descripcio')) db[KEY].descripcio=document.getElementById('descripcio').value;
            SF.forEach(f=>{const el=document.getElementById(f);if(el)db[KEY][f]=el.value;});
            ['comp_categoria','comp_temporada','comp_url','coord_nom','coord_tel'].forEach(f=>{
                const el=document.getElementById(f); if(el) db[KEY][f]=el.value;
            });
            try{
                await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(db)});
                if(!silent) console.log('Guardat automàtic correcte');
            }catch(e){ console.error('Error en el guardat automàtic'); }
        }

        window.openFedLink=function(e){
            const url=document.getElementById('comp_url')?document.getElementById('comp_url').value.trim():'';
            if(!url){e.preventDefault();alert("Introdueix primer l'enlla\u00e7 de la FCF.");return;}
            document.getElementById('comp_link_btn').href=url;
        };

        function renderHorari(){
            const el=document.getElementById('horari_list'); if(!el)return;
            if(!horaris.length){el.innerHTML='<div class="empty-msg">Sense sessions registrades.</div>';return;}
            el.innerHTML='<table class="horari-table"><thead><tr><th>Dia</th><th>Inici</th><th>Fi</th><th>Vestidor</th><th>Camp</th></tr></thead><tbody>'
                +horaris.map((h,i)=>'<tr><td class="dia-badge">'+h.dia+'</td><td>'+(h.inici||'-')+'</td><td>'+(h.fi||'-')+'</td><td>'+(esc(h.vestidor)||'-')+'</td><td>'+(esc(h.camp)||'-')+'</td></tr>').join('')
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

        const today=new Date().toISOString().split('T')[0];
        if(document.getElementById('obs_data')) document.getElementById('obs_data').value=today;
        window.addObs=async function(){
            const text=document.getElementById('obs_text').value.trim(); if(!text)return;
            observacions.unshift({autor:document.getElementById('obs_autor').value||'An\u00f2nim',
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
        function esc(t){if(!t)return'';return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
        load();
    <\/script>`;
}

// ?? INDEX.HTML ????????????????????????????????????????????????????????????????

const indexCSS = `
        :root{--primary:#d91d1d;--bg:#f1f5f9;--border:#e2e8f0;}
        *{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',sans-serif;}
        body{background:var(--bg);min-height:100vh;padding:2rem;}
        body::before{content:"";position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:600px;background-image:url('/Web jugadors/ESCUT CF CARDONA.jpeg');background-size:contain;background-repeat:no-repeat;opacity:0.04;filter:blur(2px);z-index:0;pointer-events:none;}
        header{max-width:960px;margin:0 auto 2rem;display:flex;align-items:center;gap:1rem;position:relative;z-index:1;}
        .logo{height:60px;width:60px;object-fit:contain;border-radius:50%;background:white;padding:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);}
        h1{color:var(--primary);font-weight:800;font-size:1.6rem;}
        .subtitle{font-size:0.88rem;color:#64748b;margin-top:0.2rem;}
        .card{background:white;border-radius:1rem;padding:2rem;box-shadow:0 4px 6px -1px rgb(0 0 0/0.1);border:1px solid var(--border);max-width:960px;margin:0 auto 2rem;position:relative;z-index:1;}
        .card h2{color:var(--primary);font-size:1.1rem;font-weight:800;margin-bottom:1.25rem;border-bottom:2px solid #fee2e2;padding-bottom:0.75rem;}
        .card p{color:#334155;line-height:1.75;margin-bottom:1rem;}
        .card p:last-child{margin-bottom:0;}
        .card ul{color:#334155;line-height:1.9;padding-left:1.5rem;}
        .card ul li{margin-bottom:0.25rem;}
        .link-card{text-align:center;padding:2.5rem;background:linear-gradient(135deg,#fff,#fff5f5);border-radius:0.75rem;border:2px dashed #fca5a5;}
        .link-card p{color:#64748b;font-size:0.95rem;margin-bottom:1.5rem;}
        .btn-link{display:inline-flex;align-items:center;gap:0.5rem;background:var(--primary);color:white;text-decoration:none;padding:0.9rem 2.2rem;border-radius:0.5rem;font-weight:800;font-size:1rem;transition:all 0.2s;}
        .btn-link:hover{background:#b91c1c;transform:translateY(-2px);box-shadow:0 8px 20px rgba(217,29,29,0.3);}`;

const indexHtml = `<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Direcci\u00f3 Esportiva | CF Cardona</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>${indexCSS}
    </style>
</head>
<body>
    <header>
        <img src="/Web jugadors/ESCUT CF CARDONA.jpeg" alt="CF Cardona" class="logo">
        <div>
            <h1>Direcci\u00f3 Esportiva</h1>
            <div class="subtitle">CF Cardona &mdash; Gesti\u00f3 i Estrat\u00e8gia</div>
        </div>
    </header>

    <div class="card">
        <h2>&#x1F3DB; Filosofia de Club</h2>
        <p>El CF Cardona \u00e9s un club arrelat al territori amb una clara vocaci\u00f3 de servei a la comunitat i de formaci\u00f3 de jugadors i persones. La nostra filosofia es basa en la <strong>formaci\u00f3 integral</strong>, la <strong>identitat territorial</strong> i la <strong>sostenibilitat</strong>.</p>
    </div>

    ${direccioEsportivaContent()}

    <div class="card">
        <h2>&#x1F4CB; Estructura</h2>
        <div class="link-card">
            <p>Acc\u00e9s a l\u2019organigrama interactiu per gestionar equips, staffs, horaris i competicions.</p>
            <a href="estructura.html" class="btn-link">&#x1F4CA; VEURE ESTRUCTURA &rarr;</a>
        </div>
    </div>

</body>
</html>`;
w(path.join(ROOT, 'index.html'), indexHtml);

// ?? ESTRUCTURA.HTML ???????????????????????????????????????????????????????????

const estructuraHtml = `<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estructura Esportiva | CF Cardona</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root{
            --primary: #d91d1d;
            --primary-dark: #b91c1c;
            --primary-light: #fee2e2;
            --bg: #f8fafc;
            --border: #e2e8f0;
            --text-main: #1e293b;
            --text-muted: #64748b;
            --line-color: #cbd5e1;
        }
        *{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',sans-serif;}
        body{
            background: var(--bg);
            background-image: 
                radial-gradient(#cbd5e1 1px, transparent 1px);
            background-size: 40px 40px;
            min-height: 100vh;
            padding: 3rem 1rem;
            color: var(--text-main);
        }
        body::before{
            content:"";
            position:fixed;
            top:50%;
            left:50%;
            transform:translate(-50%,-50%);
            width:700px;
            height:700px;
            background-image:url('/Web jugadors/ESCUT CF CARDONA.jpeg');
            background-size:contain;
            background-repeat:no-repeat;
            opacity:0.03;
            filter:grayscale(1) blur(1px);
            z-index:0;
            pointer-events:none;
        }
        header{
            max-width:1400px;
            margin:0 auto 4rem;
            text-align: center;
            position:relative;
            z-index:1;
        }
        h1{
            color:var(--primary);
            font-weight:900;
            font-size:2.2rem;
            letter-spacing: -0.02em;
            margin-bottom: 1rem;
            text-transform: uppercase;
        }
        .subtitle {
            color: var(--text-muted);
            font-weight: 500;
            font-size: 1rem;
            margin-bottom: 2rem;
        }
        .back-link{
            display: inline-flex;
            align-items: center;
            color: var(--text-muted);
            text-decoration: none;
            font-weight: 700;
            font-size: 0.85rem;
            padding: 0.6rem 1.2rem;
            border-radius: 2rem;
            background: white;
            border: 1px solid var(--border);
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            transition: all 0.2s;
        }
        .back-link:hover{
            color: var(--primary);
            border-color: var(--primary);
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .tree-container {
            width: 100%;
            overflow-x: auto;
            padding: 2rem;
        }

        .tree {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: max-content;
        }

        /* Línies Verticals */
        .v-line {
            width: 2px;
            height: 30px;
            background: var(--line-color);
        }

        /* Files de Fills */
        .children-row {
            display: flex;
            justify-content: center;
            position: relative;
            padding-top: 30px;
        }

        .children-row.vertical {
            flex-direction: column;
            align-items: flex-start;
            padding-left: 40px;
            padding-top: 0;
            margin-top: 20px;
            border-left: 2px solid var(--line-color);
        }

        .children-row.vertical::before { display: none; }

        .child-col.vertical-item {
            padding: 0.5rem 0;
            align-items: flex-start;
        }

        .child-col.vertical-item::before {
            content: '';
            position: absolute;
            top: 50%;
            left: -40px;
            width: 40px;
            height: 2px;
            background: var(--line-color);
        }

        /* Línia Horitzontal Connectora */
        .children-row::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            height: 2px;
            background: var(--line-color);
            width: calc(100% - 60px); /* Ajustat per no sobresortir */
        }

        .child-col {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0 1rem;
        }

        /* Línia que puja de cada fill fins a la horitzontal */
        .child-col::before {
            content: '';
            position: absolute;
            top: -30px;
            left: 50%;
            width: 2px;
            height: 30px;
            background: var(--line-color);
        }

        /* Nodes */
        .node {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: 180px;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            text-decoration: none;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            z-index: 2;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            background: white;
            color: var(--primary);
            border: 2px solid var(--primary);
            font-weight: 600;
        }

        .node:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 12px 24px rgba(0,0,0,0.1);
            background: var(--primary-light);
        }

        /* Nivells */
        .node.l0 {
            padding: 1.5rem 2.5rem;
            font-size: 1.2rem;
            font-weight: 800;
            gap: 1rem;
        }
        .node.l0 img {
            height: 60px;
            width: auto;
        }

        .node.l1 {
            font-weight: 700;
            font-size: 1rem;
        }

        .node.l2 {
            font-weight: 700;
            font-size: 0.9rem;
        }

        .node.leaf {
            font-weight: 600;
            font-size: 0.85rem;
            padding: 0.8rem 1.2rem;
            min-width: 140px;
        }

        .subtree {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        /* Marcant més les connexions verticals */
        .children-row.vertical {
            border-left: 3px solid var(--primary);
            margin-left: 20px;
        }
        .child-col.vertical-item::before {
            height: 3px;
            background: var(--primary);
        }

        @media (max-width: 768px) {
            h1 { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <header>
        <h1>Organigrama Esportiu</h1>
        <p class="subtitle">Temporada 2026/2027 | CF Cardona</p>
        <a href="index.html" class="back-link">
            <span style="margin-right:0.5rem;">&larr;</span> Tornar a la Direcci&oacute; Esportiva
        </a>
    </header>

    <div class="tree-container">
        <div class="tree">
            <!-- Nivell 0 -->
            <a href="index.html" class="node l0">
                <img src="/Web jugadors/ESCUT CF CARDONA.jpeg" alt="Escut CF Cardona">
                Direcci&oacute; esportiva
            </a>
            <div class="v-line"></div>

            <!-- Nivell 1 -->
            <div class="children-row">
                
                <div class="child-col">
                    <a href="seccions/horari-entrenaments.html" class="node leaf" style="border-color: #3b82f6; color: #3b82f6;">
                        Horaris
                    </a>
                </div>

                <div class="child-col">
                    <a href="seccions/comissio-esportiva.html" class="node leaf" style="border-color: #ef4444; color: #ef4444;">
                        Comissi&oacute; esportiva
                    </a>
                </div>

                <div class="child-col">
                    <div class="subtree">
                        <a href="seccions/senior.html" class="node l1">
                            S&egrave;nior
                        </a>
                        <div class="v-line"></div>
                        <div class="children-row">
                            <div class="child-col">
                                <a href="seccions/primer-equip.html" class="node leaf">Primer equip</a>
                            </div>
                            <div class="child-col">
                                <a href="seccions/filial.html" class="node leaf">Filial</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="child-col">
                    <div class="subtree">
                        <a href="seccions/futbol-base.html" class="node l1">
                            Futbol base
                        </a>
                        <div class="v-line"></div>
                        <div class="children-row">
                            
                            <!-- Masculí -->
                            <div class="child-col">
                                <div class="subtree">
                                    <a href="seccions/futbol-base-masculi.html" class="node l2">Mascul&iacute;</a>
                                    <div class="v-line"></div>
                                    <div class="children-row">
                                        <div class="child-col">
                                            <div class="subtree" style="align-items: flex-start;">
                                                <a href="seccions/f7.html" class="node leaf" style="min-width:140px;">Futbol 7</a>
                                                <div class="children-row vertical">
                                                    <div class="child-col vertical-item"><a href="seccions/minis.html" class="node leaf">Minis</a></div>
                                                    <div class="child-col vertical-item"><a href="seccions/s7.html" class="node leaf">S7</a></div>
                                                    <div class="child-col vertical-item"><a href="seccions/s8.html" class="node leaf">S8</a></div>
                                                    <div class="child-col vertical-item"><a href="seccions/s9.html" class="node leaf">S9</a></div>
                                                    <div class="child-col vertical-item"><a href="seccions/s10.html" class="node leaf">S10</a></div>
                                                    <div class="child-col vertical-item"><a href="seccions/s11.html" class="node leaf">S11</a></div>
                                                    <div class="child-col vertical-item"><a href="seccions/s12.html" class="node leaf">S12</a></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="child-col">
                                            <div class="subtree" style="align-items: flex-start;">
                                                <a href="seccions/f11.html" class="node leaf" style="min-width:140px;">Futbol 11</a>
                                                <div class="children-row vertical">
                                                    <div class="child-col vertical-item"><a href="seccions/s16.html" class="node leaf">S16</a></div>
                                                    <div class="child-col vertical-item"><a href="seccions/juvenil-masculi.html" class="node leaf">Juvenil</a></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Femení -->
                            <div class="child-col">
                                <div class="subtree" style="align-items: flex-start;">
                                    <a href="seccions/futbol-base-femeni.html" class="node l2">Femen&iacute;</a>
                                    <div class="children-row vertical">
                                        <div class="child-col vertical-item"><a href="seccions/alevi-femeni.html" class="node leaf">Alev&iacute;</a></div>
                                        <div class="child-col vertical-item"><a href="seccions/cadet-femeni.html" class="node leaf">Cadet</a></div>
                                        <div class="child-col vertical-item"><a href="seccions/juvenil-femeni.html" class="node leaf">Juvenil</a></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</body>
</html>`;
w(path.join(ROOT, 'estructura.html'), estructuraHtml);

function direccioEsportivaContent() {
    return `
    <div class="card">
        <h2>&#x1F4CD; Context i Realitat Geogr&agrave;fica</h2>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div>
                <p style="line-height:1.6;">Cardona (4.5k habitants) competeix en una categoria (1a Catalana) on el 90% dels rivals provenen de grans nuclis urbans. Per competir en igualtat, hem de transcendir la nostra frontera municipal.</p>
                <div style="margin-top:1.2rem; padding:1.2rem; background:linear-gradient(to right, #fef2f2, #fff); border:1px solid #fee2e2; border-radius:0.75rem; position:relative; overflow:hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="position:absolute; right:-10px; top:-10px; font-size:4rem; opacity:0.1;">&#x1F4CD;</div>
                    <p style="font-weight:800; color:var(--primary); font-size:0.75rem; margin-bottom:0.6rem; letter-spacing:0.05em;">SOLUCI&Oacute;: ESTRAT&Egrave;GIA "ZONA 1"</p>
                    <p style="font-size:0.85rem; line-height:1.5; position:relative; z-index:1;">
                        Convertim els 4.5k de Cardona en <strong>40.000 habitants</strong> actuant com a pol d'atracci&oacute; de Solsona, S&uacute;ria i l'entorn de Manresa. Aquesta &eacute;s la nostra aut&egrave;ntica base de captaci&oacute;.
                    </p>
                </div>
            </div>
            <div style="background:#f8fafc; padding:1.5rem; border-radius:1rem; border:1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <p style="font-weight:800; color:var(--primary); margin-bottom:1.5rem; text-transform:uppercase; font-size:0.7rem; letter-spacing:0.1em; text-align:center;">Desavantatge Democr&agrave;fic (Poblaci&oacute;)</p>
                <div style="display:flex; flex-direction:column; gap:1.2rem;">
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.75rem; color:#64748b;"><span>Rivals Mitjana (Sants, Igualada...)</span><span style="font-weight:700;">~42.000</span></div>
                        <div style="background:#e2e8f0; height:12px; border-radius:6px; overflow:hidden;">
                            <div style="background:#94a3b8; width:100%; height:100%;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.75rem; color:var(--primary); font-weight:800;"><span>CF CARDONA</span><span>4.500</span></div>
                        <div style="background:#e2e8f0; height:12px; border-radius:6px; overflow:hidden; border:1px solid #fee2e2;">
                            <div style="background:var(--primary); width:10.7%; height:100%; box-shadow: 0 0 8px rgba(217,29,29,0.3);"></div>
                        </div>
                    </div>
                    <div style="margin-top:0.5rem; padding:0.8rem; background:#fff; border-radius:0.6rem; border:1px dashed #cbd5e1; font-size:0.74rem; text-align:center; color:#475569; line-height:1.4;">
                        &#x26A0;&#xFE0F; Cardona competeix contra ciutats <br><strong>10 vegades m&eacute;s grans</strong>.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card">
        <h2>&#x1F3AF; Objectius Temporada 2026/2027</h2>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem;">
            <div style="border-left:4px solid var(--primary); padding-left:1rem;">
                <h3 style="font-size:0.9rem; margin-bottom:0.5rem;">PRIMER EQUIP</h3>
                <p style="font-size:0.88rem;"><strong>Mantenir la categoria</strong> a Primera Catalana. L'objectiu &eacute;s la perman&egrave;ncia per consolidar el projecte a l'elit territorial.</p>
            </div>
            <div style="border-left:4px solid #3b82f6; padding-left:1rem;">
                <h3 style="font-size:0.9rem; margin-bottom:0.5rem;">FILIAL</h3>
                <p style="font-size:0.88rem;"><strong>Mantenir la categoria</strong> a Tercera Catalana i consolidar l'equip com a pas previ al futbol amateur d'alt nivell.</p>
            </div>
        </div>
        <div style="margin-top:1.5rem; padding:1.2rem; background:linear-gradient(to right, #f8fafc, #fff); border-radius:0.75rem; border:1px solid var(--border); display:flex; align-items:center; gap:1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="font-size:1.8rem;">&#x1F393;</div>
            <p style="font-size:0.92rem; color:#1e293b; font-weight:700;">FUTBOL BASE: Definir una estructura potent mascul&iacute; i femen&iacute;.</p>
        </div>
    </div>

    <div class="card" style="border-top:5px solid var(--primary);">
        <h2>&#x1F3DB; Comissi&oacute; Esportiva</h2>
        <p style="font-size:0.95rem; margin-bottom:1.2rem;">Es crea una nova <strong>Comissi&oacute; Esportiva</strong> col&middot;legiada per a la gesti&oacute; dels equips senior, amb les seg&uuml;ents funcions principals:</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.85rem;">
            <div style="padding:1.2rem; border:1px solid var(--border); border-radius:0.75rem; background:#f8fafc; border-left:4px solid var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <strong style="display:block; margin-bottom:0.4rem; color:var(--primary);">&#x1F4CB; Gesti&oacute; Integral Senior</strong>
                Planificaci&oacute; de plantilles (1r Equip i Filial), renovacions i coordinaci&oacute; amb els staffs t&egrave;cnics.
            </div>
            <div style="padding:1.2rem; border:1px solid var(--border); border-radius:0.75rem; background:#f8fafc; border-left:4px solid var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <strong style="display:block; margin-bottom:0.4rem; color:var(--primary);">&#x1F4D1; Seguiment Estrat&egrave;gic</strong>
                An&agrave;lisi del rendiment de la categoria amateur i informes continus a la Junta Directiva.
            </div>
        </div>
    </div>

    <div class="card" style="border-top:5px solid #10b981;">
        <h2>&#x1F393; Futbol Base: Model de Futur</h2>
        <p style="font-size:0.95rem; margin-bottom:1.2rem;">Apostem per un <strong>Futbol Base Mascul&iacute; i Femen&iacute;</strong> potent i modern, basat en el creixement qualitatiu de l'escola:</p>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.2rem; font-size: 0.85rem;">
            <div style="padding:1.5rem; background:#f0fdf4; border-radius:1rem; border:1px solid #bbf7d0; box-shadow: 0 4px 6px -1px rgba(16,185,129,0.1);">
                <h3 style="font-size:0.95rem; color:#166534; margin-bottom:0.6rem; display:flex; align-items:center; gap:0.5rem;">&#x1F539; Identitat de Joc</h3>
                <p style="line-height:1.5;">Definici&oacute; d'un model de joc uniforme a totes les categories per facilitar la progressi&oacute; del futbolista.</p>
            </div>
            <div style="padding:1.5rem; background:#f0fdf4; border-radius:1rem; border:1px solid #bbf7d0; box-shadow: 0 4px 6px -1px rgba(16,185,129,0.1);">
                <h3 style="font-size:0.95rem; color:#166534; margin-bottom:0.6rem; display:flex; align-items:center; gap:0.5rem;">&#x1F539; Excel&middot;l&egrave;ncia T&egrave;cnica</h3>
                <p style="line-height:1.5;">Entrenadors formats i en aprenentatge continu per oferir la millor doc&egrave;ncia esportiva.</p>
            </div>
            <div style="padding:1.5rem; background:#f0fdf4; border-radius:1rem; border:1px solid #bbf7d0; box-shadow: 0 4px 6px -1px rgba(16,185,129,0.1);">
                <h3 style="font-size:0.95rem; color:#166534; margin-bottom:0.6rem; display:flex; align-items:center; gap:0.5rem;">&#x1F539; Desenvolupament Individual</h3>
                <p style="line-height:1.5;">Grau d'exig&egrave;ncia i suport per treure de cada futbolista la seva millor versi&oacute;.</p>
            </div>
            <div style="padding:1.5rem; background:#f0fdf4; border-radius:1rem; border:1px solid #bbf7d0; box-shadow: 0 4px 6px -1px rgba(16,185,129,0.1);">
                <h3 style="font-size:0.95rem; color:#166534; margin-bottom:0.6rem; display:flex; align-items:center; gap:0.5rem;">&#x1F539; Igualtat i Creixement</h3>
                <p style="line-height:1.5;">Desenvolupament paral&middot;lel del futbol mascul&iacute; i femen&iacute; amb la mateixa exig&egrave;ncia i recursos.</p>
            </div>
        </div>
    </div>`;
}

// ?? SECCIONS SIMPLES ??????????????????????????????????????????????????????????

const RBC = [{ l: 'Inici', h: '../index.html' }];

function simplePage(file, icon, title, key, bcParts, extra, sf) {
    const html = headHtml(title, CSS_SEC) + '\n<body>'
        + hdr(icon, title, bc(bcParts))
        + (extra || '')
        + obsCard()
        + fullJS(key, sf || [])
        + '\n</body>\n</html>';
    w(path.join(SEC, file), html);
}

// La pàgina de direcció esportiva s'ha integrat a la home


const comissioContent = `
    <p>La <strong>Comissi&oacute; Esportiva</strong> del CF Cardona &eacute;s un &ograve;rgan col&middot;legiat que assumeix les compet&egrave;ncies de la <strong>Direcci&oacute; T&egrave;cnica</strong>. La seva missi&oacute; &eacute;s garantir la coher&egrave;ncia esportiva i el creixement de l'entitat, actuant com a pont entre la Junta Directiva i els cossos t&egrave;cnics.</p>
    <p style="margin-top:1rem;">Aquest &ograve;rgan se centra especialment en la gesti&oacute; dels equips Senior (Primer Equip i Filial) amb les seg&uuml;ents funcions:</p>
    <ul style="margin-top:1rem; padding-left:1.5rem;">
        <li><strong>Planificaci&oacute; de Plantilles:</strong> Gesti&oacute; d'altes, baixes i renovacions del Primer Equip i Filial.</li>
        <li><strong>Coordinaci&oacute; Senior:</strong> Definir els fluxos de jugadors entre el Filial i el Primer Equip.</li>
        <li><strong>Captaci&oacute; de Talent:</strong> Recerca activa de jugadors de l'entorn amb identitat Cardonina.</li>
        <li><strong>Avaluaci&oacute; T&egrave;cnica:</strong> Seguiment i suport constant als staffs t&egrave;cnics senior.</li>
        <li><strong>Visi&oacute; Estrat&egrave;gica:</strong> Implementaci&oacute; del model de joc i valors del club a l'alta competici&oacute;.</li>
    </ul>
`;

const comissioHtml = headHtml('Comissi&oacute; Esportiva', CSS_SEC) + '\n<body>'
    + hdr('&#x1F46A;', 'Comissi&oacute; Esportiva', bc([...RBC, { l: 'Comissi&oacute; Esportiva' }]))
    + staticCard('Context i Traject&ograve;ria Senior', '&#x1F3DF;', `
        <div style="background:#fef2f2; border:1px solid #fee2e2; padding:1.5rem; border-radius:0.75rem; margin-bottom:1.5rem;">
            <p style="margin-bottom:1rem;">El primer equip ha viscut <strong>dos ascensos seguits</strong> les temporades 2023/2024 a segona catalana i la temporada 2024/2025 a primera catalana (al grup de Lleida que &eacute;s una mica m&eacute;s fluix que l\u2019equivalent de la prov&iacute;ncia de Barcelona).</p>
            <p style="margin-bottom:1rem;">La temporada 2025/2026 el primer equip t&eacute; per objectiu mantenir la categoria de primera catalana, objectiu que a dia d\u2019avui es factible ja que l\u2019equip a la jornada 18 est&agrave; onz&egrave; a 7 punts del descens.</p>
            <p style="margin-bottom:1rem;">El filial a la jornada 18 es l&iacute;der del grup 17 de la quarta catalana a 5 punts del segon i podria aconseguir l\u2019ascens directe.</p>
            <p style="font-weight:700; color:var(--primary);">L\u2019objectiu principal del primer equip &eacute;s mantenir la categoria i del filial es pujar a tercera i consolidar-se a la categoria.</p>
        </div>
    `)
    + staticCard('Compet&egrave;ncies i Funcions', '&#x1F4CB;', comissioContent)
    + `
    <div class="card">
        <h2>&#x1F50E; Scouting i Captaci&oacute;</h2>
        <div class="link-card">
            <p>Gesti&oacute; centralitzada del mercat, seguiment de jugadors externs i base de dades de contactes (Cartera del Club).</p>
            <a href="scouting.html" class="btn-link">&#x1F50E; ACCEDIR A LA CARTERA DE JUGADORS &rarr;</a>
        </div>
    </div>`
    + obsCard()
    + fullJS('seccio_comissio')
    + '\n</body>\n</html>';
w(path.join(SEC, 'comissio-esportiva.html'), comissioHtml);

const seniorHtml = headHtml('Senior', CSS_SEC) + '\n<body>'
    + hdr('&#x26BD;', 'Senior', bc([...RBC, { l: 'Senior' }]))
    + staticCard('Traject&ograve;ria i Objectius', '&#x1F4C8;', `
        <div style="background:#fef2f2; border:1px solid #fee2e2; padding:1.5rem; border-radius:0.75rem; margin-bottom:1.5rem;">
            <p style="margin-bottom:1rem;">El primer equip ha viscut <strong>dos ascensos seguits</strong> les temporades 2023/2024 a segona catalana i la temporada 2024/2025 a primera catalana (al grup de Lleida que &eacute;s una mica m&eacute;s fluix que l\u2019equivalent de la prov&iacute;ncia de Barcelona).</p>
            <p style="margin-bottom:1rem;">La temporada 2025/2026 el primer equip t&eacute; per objectiu mantenir la categoria de primera catalana, objectiu que a dia d\u2019avui es factible ja que l\u2019equip a la jornada 18 est&agrave; onz&egrave; a 7 punts del descens.</p>
            <p style="margin-bottom:1rem;">El filial a la jornada 18 es l&iacute;der del grup 17 de la quarta catalana a 5 punts del segon i podria aconseguir l\u2019ascens directe.</p>
            <p style="font-weight:700; color:var(--primary);">L\u2019objectiu principal del primer equip &eacute;s mantenir la categoria i del filial es pujar a tercera i consolidar-se a la categoria.</p>
        </div>
    `)
    + treeCard('Senior', [{ l: 'Primer Equip', h: 'primer-equip.html' }, { l: 'Filial', h: 'filial.html' }])
    + obsCard()
    + fullJS('seccio_senior')
    + '\n</body>\n</html>';
w(path.join(SEC, 'senior.html'), seniorHtml);

simplePage('futbol-base.html', '&#x1F393;', 'Futbol Base', 'seccio_futbol-base', [...RBC, { l: 'Futbol Base' }],
    treeCard('Futbol Base', [{ l: 'Futbol Base Mascul\u00ed', h: 'futbol-base-masculi.html' }, { l: 'Futbol Base Femen\u00ed', h: 'futbol-base-femeni.html' }]));
simplePage('futbol-base-masculi.html', '&#x1F466;', 'Futbol Base Mascul\u00ed', 'seccio_fb-masculi',
    [...RBC, { l: 'Futbol Base', h: 'futbol-base.html' }, { l: 'Futbol Base Mascul\u00ed' }],
    coordCard() + treeCard('Futbol Base Mascul\u00ed', [{ l: 'F7', h: 'f7.html' }, { l: 'F11', h: 'f11.html' }]), ['coord_nom', 'coord_tel']);
simplePage('futbol-base-femeni.html', '&#x1F467;', 'Futbol Base Femen\u00ed', 'seccio_fb-femeni',
    [...RBC, { l: 'Futbol Base', h: 'futbol-base.html' }, { l: 'Futbol Base Femen\u00ed' }],
    coordCard() + treeCard('Futbol Base Femen\u00ed', [{ l: 'Alev\u00ed', h: 'alevi-femeni.html' }, { l: 'Cadet', h: 'cadet-femeni.html' }, { l: 'Juvenil Femen\u00ed', h: 'juvenil-femeni.html' }]), ['coord_nom', 'coord_tel']);
simplePage('f7.html', '&#x26BD;', 'Futbol 7 (F7)', 'seccio_f7',
    [...RBC, { l: 'Futbol Base Mascul\u00ed', h: 'futbol-base-masculi.html' }, { l: 'F7' }],
    treeCard('F7', [{ l: 'Minis', h: 'minis.html' }, { l: 'S7', h: 's7.html' }, { l: 'S8', h: 's8.html' }, { l: 'S9', h: 's9.html' }, { l: 'S10', h: 's10.html' }, { l: 'S11', h: 's11.html' }, { l: 'S12', h: 's12.html' }]));
simplePage('f11.html', '&#x26BD;', 'Futbol 11 (F11)', 'seccio_f11',
    [...RBC, { l: 'Futbol Base Mascul\u00ed', h: 'futbol-base-masculi.html' }, { l: 'F11' }],
    treeCard('F11', [{ l: 'S16', h: 's16.html' }, { l: 'Juvenil Mascul\u00ed', h: 'juvenil-masculi.html' }]));

// ?? PRIMER EQUIP i FILIAL (staff 2 entrenadors) ???????????????????????????????

const SENIOR_ROLES_PE = ['Primer Entrenador', 'Segon Entrenador', 'Preparador F\u00edsic', 'Delegat', 'Fisioterapeuta', 'Analista T\u00e0ctic'];
const SENIOR_ROLES_F = ['Primer Entrenador', 'Segon Entrenador'];

function seniorEquip(file, title, key, roles, bcParts, plantillaLink) {
    const sf = sfIds(roles);
    const html = headHtml(title, CSS_SEC) + '\n<body>'
        + hdr('&#x26BD;', title, bc(bcParts))
        + staffCard(roles)
        + plantillaCard(plantillaLink)
        + horariCard()
        + competicioCard()
        + partitsCard()
        + obsCard()
        + fullJS(key, sf)
        + '\n</body>\n</html>';
    w(path.join(SEC, file), html);
}

seniorEquip('primer-equip.html', 'Primer Equip', 'seccio_primer-equip', SENIOR_ROLES_PE,
    [...RBC, { l: 'Senior', h: 'senior.html' }, { l: 'Primer Equip' }], '../Web%20jugadors/index.html');
seniorEquip('filial.html', 'Filial', 'seccio_filial', SENIOR_ROLES_F,
    [...RBC, { l: 'Senior', h: 'senior.html' }, { l: 'Filial' }], '../Web%20filial/index.html');

// ?? EQUIPS BASE ???????????????????????????????????????????????????????????????

const BASE_ROLES = ['Primer Entrenador', 'Segon Entrenador', 'Tercer Entrenador'];

const EQUIPS = [
    { f: 'minis', t: 'Minis', p: 'F7', ph: 'f7.html', pp: 'Futbol Base Mascul\u00ed', pph: 'futbol-base-masculi.html' },
    { f: 's7', t: 'S7', p: 'F7', ph: 'f7.html', pp: 'Futbol Base Mascul\u00ed', pph: 'futbol-base-masculi.html' },
    { f: 's8', t: 'S8', p: 'F7', ph: 'f7.html', pp: 'Futbol Base Mascul\u00ed', pph: 'futbol-base-masculi.html' },
    { f: 's9', t: 'S9', p: 'F7', ph: 'f7.html', pp: 'Futbol Base Mascul\u00ed', pph: 'futbol-base-masculi.html' },
    { f: 's10', t: 'S10', p: 'F7', ph: 'f7.html', pp: 'Futbol Base Mascul\u00ed', pph: 'futbol-base-masculi.html' },
    { f: 's11', t: 'S11', p: 'F7', ph: 'f7.html', pp: 'Futbol Base Mascul\u00ed', pph: 'futbol-base-masculi.html' },
    { f: 's12', t: 'S12', p: 'F7', ph: 'f7.html', pp: 'Futbol Base Mascul\u00ed', pph: 'futbol-base-masculi.html' },
    { f: 's16', t: 'S16 (Cadet)', p: 'F11', ph: 'f11.html', pp: 'Futbol Base Mascul\u00ed', pph: 'futbol-base-masculi.html' },
    { f: 'juvenil-masculi', t: 'Juvenil Mascul\u00ed', p: 'F11', ph: 'f11.html', pp: 'Futbol Base Mascul\u00ed', pph: 'futbol-base-masculi.html' },
    { f: 'alevi-femeni', t: 'Alev\u00ed Femen\u00ed', p: 'Futbol Base Femen\u00ed', ph: 'futbol-base-femeni.html', pp: 'Futbol Base', pph: 'futbol-base.html' },
    { f: 'cadet-femeni', t: 'Cadet Femen\u00ed', p: 'Futbol Base Femen\u00ed', ph: 'futbol-base-femeni.html', pp: 'Futbol Base', pph: 'futbol-base.html' },
    { f: 'juvenil-femeni', t: 'Juvenil Femen\u00ed', p: 'Futbol Base Femen\u00ed', ph: 'futbol-base-femeni.html', pp: 'Futbol Base', pph: 'futbol-base.html' },
];

EQUIPS.forEach(e => {
    const bcParts = [
        { l: 'Inici', h: '../index.html' },
        { l: 'Estructura Esportiva', h: '../estructura.html' },
        { l: e.pp, h: e.pph },
        { l: e.p, h: e.ph },
        { l: e.t }
    ];
    const sf = sfIds(BASE_ROLES);
    const html = headHtml(e.t, CSS_SEC) + '\n<body>'
        + hdr('&#x2B50;', e.t, bc(bcParts))
        + staffCard(BASE_ROLES)
        + plantillaCard()
        + horariCard()
        + competicioCard()
        + partitsCard()
        + obsCard()
        + fullJS('seccio_' + e.f, sf)
        + '\n</body>\n</html>';
    w(path.join(SEC, e.f + '.html'), html);
});

// ?? PÀGINA D'HORARIS GLOBAL ??????????????????????????????????????????????????

const ALL_TEAMS = [
    { id: 'seccio_primer-equip', name: 'Primer Equip' },
    { id: 'seccio_filial', name: 'Filial' },
    ...EQUIPS.map(e => ({ id: 'seccio_' + e.f, name: e.t }))
];

const horariHtml = headHtml('Horaris d\'Entrenament', CSS_SEC) + '\n<body>'
    + hdr('&#x1F5D3;', 'Horaris d\'Entrenament', bc([...RBC, { l: 'Horari Entrenaments' }]))
    + horariGlobalCard()
    + horariGlobalJS(JSON.stringify(ALL_TEAMS))
    + '\n</body>\n</html>';
w(path.join(SEC, 'horari-entrenaments.html'), horariHtml);

const scoutingHtml = headHtml('Scouting & Captaci\u00f3', CSS_SEC) + '\n<body>'
    + hdr('&#x1F50E;', 'Scouting & Captaci\u00f3', bc([...RBC, { l: 'Comissi\u00f3 Esportiva', h: 'comissio-esportiva.html' }, { l: 'Scouting' }]))
    + scoutingCard()
    + scoutingJS()
    + '\n</body>\n</html>';
w(path.join(SEC, 'scouting.html'), scoutingHtml);

process.stdout.write('\nTot generat correctament!\n');
