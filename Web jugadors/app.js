const playersData = {
    "Porters": [
        "LLUÍS MARTÍNEZ, LLUÍS",
        "ROVIRA DE PAZ, JOAN",
        "CASALS ASENSIO, ALBERT"
    ],
    "Defenses": [
        "GONZÁLEZ TRISTANY, VICENÇ",
        "RATERA VILLEGAS, XAVIER",
        "ROLDAN GIMENEZ, ANTONIO",
        "LIRIA RUIZ, ANTONIO",
        "MOLINA BEA, VICTOR",
        "GALERA ARNAU, URIEL",
        "LORCA PARRA, AITOR"
    ],
    "Migcampistes": [
        "SEGURA URRUTIA, AITOR",
        "LORCA CORTADA, MARC",
        "SERRA SEGUÉS, ANIOL",
        "SANZ GARCIA, GUILLEM",
        "BIGI PARROT SILVA, LORENÇO",
        "GUIJARRO IGLESIAS, MARC",
        "PALOMO RAYA, RUBEN"
    ],
    "Davanters": [
        "COTS OLIVÉ, BIEL",
        "VILADOMAT SALLES, JOAN",
        "PÉREZ FONTAN, RAFEL",
        "NAVARRO PEREZ, IKER",
        "TORRES GONZALEZ, ALEJANDRO"
    ]
};

const POSITIONS_LIST = ['Porter', 'Lateral Dret', 'Lateral Esquerre', 'Central', 'Pivot Defensiu', 'Interior', 'Mitja Punta', 'Extrem Dret', 'Extrem Esquerre', 'Davanter Centre'];

let currentPlayerId = null;
let currentConversations = [];
let currentSubstitutes = [];
let globalDatabase = {}; // Cache de la BBDD del servidor

const API_URL = '/api/players';
const IS_FILE = window.location.protocol === 'file:';

const sidebarContent = document.getElementById('sidebar-content');
const headerName = document.getElementById('header-name');
const emptyState = document.getElementById('empty-state');
const playerForm = document.getElementById('player-form');
const btnSave = document.getElementById('btn-save');
const convListEl = document.getElementById('conv_list');
const subsListEl = document.getElementById('subs_list');

// Carregar des de localStorage
function loadFromLocalStorage() {
    const scoutingKey = 'scouting_database_local';
    try {
        const raw = localStorage.getItem(scoutingKey);
        if (raw) {
            const data = JSON.parse(raw);
            // Fusionar dades de scouting a globalDatabase
            if (data.scouting_database) {
                globalDatabase['scouting_database'] = data.scouting_database;
            }
        }
    } catch (e) {
        console.warn("Error carregant localStorage:", e);
    }
}

// Carregar tota la BBDD des del servidor JSON al principi
async function init() {
    initSidebar();
    initPositionsGrid();
    
    if (IS_FILE) {
        // Mode file:// - carregar des de localStorage
        loadFromLocalStorage();
    } else {
        // Mode servidor - carregar des de l'API
        try {
            const response = await fetch(API_URL);
            globalDatabase = await response.json();
        } catch (e) {
            console.warn("Servidor de BBDD no disponible. Intentant localStorage...");
            loadFromLocalStorage();
        }
    }
}

function initPositionsGrid() {
    const grid = document.getElementById('posicions_grid');
    if (!grid) return;
    grid.innerHTML = POSITIONS_LIST.map(pos => `
        <label class="pos-check">
            <input type="checkbox" name="player_pos" value="${pos}" onchange="renderSubstitutes(); autoSave();"> ${pos}
        </label>
    `).join('');
}

function initSidebar() {
    let html = `
        <h2 style="color:var(--primary); font-size:1rem; margin-bottom:1.5rem; border-bottom:1px solid #fee2e2; padding-bottom:0.5rem; padding-left:0.5rem;">
            &#x1F465; Plantilla Actual
        </h2>
    `;
    for (const [category, names] of Object.entries(playersData)) {
        html += `
            <div class="category-group">
                <div class="category-title">${category}</div>
                ${names.map(name => {
                    const data = globalDatabase[name] || {};
                    const pos = (data.posicions || []).join(', ') || category.slice(0, -1);
                    return `
                        <div class="player-item" data-id="${name}" onclick="selectPlayer('${name}')">
                            <div style="display:flex; flex-direction:column; gap:0.2rem;">
                                <span>${name}</span>
                                <span style="font-size:0.7rem; color:#64748b; font-weight:500;">${pos}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    sidebarContent.innerHTML = html;
}

window.selectPlayer = function (id) {
    currentPlayerId = id;
    document.querySelectorAll('.player-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
    });

    // Cercar categoria
    let cat = 'Plantilla';
    for (const [c, names] of Object.entries(playersData)) {
        if (names.includes(id)) { cat = c; break; }
    }

    headerName.innerText = id;
    const nomDisplay = document.getElementById('nom_display');
    if (nomDisplay) nomDisplay.value = id;

    const bc = document.getElementById('breadcrumb');
    if (bc) {
        bc.innerHTML = `
            <a href="../index.html">Inici</a> &rarr; 
            <a href="../seccions/direccio-esportiva.html">Direcció Esportiva</a> &rarr; 
            <a href="../seccions/senior.html">Senior</a> &rarr; 
            <a href="../seccions/primer-equip.html">Primer Equip</a> &rarr; 
            <span style="cursor:pointer; color:var(--primary); font-weight:700;" onclick="location.reload()">Plantilla</span> &rarr; ${cat}`;
    }

    emptyState.style.display = 'none';
    playerForm.style.display = 'block';
    btnSave.style.display = 'block';
    loadPlayerData(id);
};

function loadPlayerData(id) {
    const data = globalDatabase[id] || {};
    const fields = [
        'edat', 'poblacio', 'rol_actual',
        'fitxa_mensual', 'primes_partit', 'prima_permanencia', 'altres_incentius',
        'rol_previst', 'conv_situacio',
        'val_forts', 'val_millorar', 'val_lesions', 'val_compromis',
        'observacions'
    ];

    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.value = data[field] || '';
    });

    const checkboxes = document.querySelectorAll('input[name="player_pos"]');
    const playerPositions = data.posicions || [];
    checkboxes.forEach(cb => {
        cb.checked = playerPositions.includes(cb.value);
    });

    currentConversations = data.conversations || [];
    currentSubstitutes = data.substitutes || [];
    renderConversations();
    renderSubstitutes();
}

window.addConversation = function () {
    const dateInput = document.getElementById('new_conv_date');
    const textInput = document.getElementById('new_conv_text');
    if (!dateInput.value || !textInput.value) return;
    currentConversations.push({ date: dateInput.value, text: textInput.value });
    currentConversations.sort((a, b) => new Date(b.date) - new Date(a.date));
    dateInput.value = ''; textInput.value = '';
    renderConversations();
    autoSave();
};

window.removeConversation = function (index) {
    currentConversations.splice(index, 1);
    renderConversations();
    autoSave();
};

function renderConversations() {
    if (currentConversations.length === 0) {
        convListEl.innerHTML = '<div style="color:#94a3b8; font-size:0.8rem; padding:0.5rem;">Sense converses registrades.</div>';
        return;
    }
    convListEl.innerHTML = currentConversations.map((c, index) => `
        <div class="conv-entry">
            <span class="date">${formatDate(c.date)}</span>
            <span class="text">${c.text}</span>
            <button type="button" class="btn-remove" onclick="removeConversation(${index})">×</button>
        </div>
    `).join('');
}

window.addSubstitute = function () {
    const nameInput = document.getElementById('new_sub_name');
    const clubInput = document.getElementById('new_sub_club');
    const phoneInput = document.getElementById('new_sub_phone');
    if (!nameInput.value) return;
    currentSubstitutes.push({
        name: nameInput.value, club: clubInput.value, phone: phoneInput.value
    });
    nameInput.value = ''; clubInput.value = ''; phoneInput.value = '';
    renderSubstitutes();
    autoSave();
};

window.removeSubstitute = function (index) {
    currentSubstitutes.splice(index, 1);
    renderSubstitutes();
    autoSave();
};

function renderSubstitutes() {
    const scoutingPlayers = globalDatabase['scouting_database'] || [];
    const playerCheckboxes = document.querySelectorAll('input[name="player_pos"]:checked');
    const playerPositions = Array.from(playerCheckboxes).map(cb => cb.value);

    // Suggeriments automàtics per scouting (coincidència de posició)
    const suggestions = scoutingPlayers.filter(sp => {
        return (sp.posicions || []).some(p => playerPositions.includes(p));
    });

    if (currentSubstitutes.length === 0 && suggestions.length === 0) {
        subsListEl.innerHTML = '<div style="color:#94a3b8; font-size:0.8rem; padding:1rem; text-align:center;">Sense substituts registrats.</div>';
        return;
    }

    let html = '';

    // Llista manual
    html += currentSubstitutes.map((s, index) => `
        <div class="conv-entry">
            <div class="sub-info">
                <span class="name"><strong>${s.name}</strong></span>
                <span class="club">${s.club || '-'}</span>
                <span class="phone"><a href="tel:${s.phone}" style="color:inherit; text-decoration:none;">${s.phone || '-'}</a></span>
            </div>
            <button type="button" class="btn-remove" onclick="removeSubstitute(${index})">×</button>
        </div>
    `).join('');

    // Llista automàtica (Scouting)
    if (suggestions.length > 0) {
        html += '<div style="font-size:0.75rem; font-weight:800; color:var(--primary); margin:1.5rem 0 0.75rem 0.5rem; text-transform:uppercase; border-bottom:1px solid #fee2e2; padding-bottom:0.25rem;">Suggerits per Scouting (Coincidència)</div>';
        html += suggestions.map(s => `
            <div class="conv-entry" style="background:#fff5f5; border-color:#fecaca;">
                <div class="sub-info">
                    <span class="name"><strong>${s.nom}</strong> <span style="font-size:0.6rem; background:var(--primary); color:white; padding:2px 6px; border-radius:10px; margin-left:5px;">SCOUTING ACTIVE</span></span>
                    <span class="club">${s.club || 'Lliure'} &middot; <span style="color:var(--primary); font-weight:600;">${(s.posicions || []).join(', ')}</span></span>
                    <span class="phone"><a href="tel:${s.tel}" style="color:inherit; text-decoration:none; font-weight:600;">${s.tel || '-'}</a></span>
                </div>
            </div>
        `).join('');
    }

    subsListEl.innerHTML = html;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// Funció de desat automàtic
async function autoSave() {
    if (!currentPlayerId) return;

    const data = {
        conversations: currentConversations,
        substitutes: currentSubstitutes,
        posicions: Array.from(document.querySelectorAll('input[name="player_pos"]:checked')).map(cb => cb.value)
    };

    const fields = [
        'edat', 'poblacio', 'rol_actual',
        'fitxa_mensual', 'primes_partit', 'prima_permanencia', 'altres_incentius',
        'rol_previst', 'conv_situacio',
        'val_forts', 'val_millorar', 'val_lesions', 'val_compromis',
        'observacions'
    ];

    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) data[field] = el.value;
    });

    // Actualitzar localment el cache
    globalDatabase[currentPlayerId] = data;

    // Indicar visualment que s'està desant
    btnSave.innerText = '⏳ DESANT...';
    btnSave.style.background = '#64748b';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(globalDatabase)
        });

        if (response.ok) {
            btnSave.innerText = '✅ GUARDAT';
            btnSave.style.background = 'var(--success)';
        } else {
            throw new Error();
        }
    } catch (e) {
        btnSave.innerText = '❌ ERROR';
        btnSave.style.background = 'var(--secondary)';
    }

    setTimeout(() => {
        btnSave.innerText = 'GUARDAR FITXA (AUTO)';
        btnSave.style.background = 'var(--primary)';
    }, 1500);
}

// Afegir event listeners a tots els camps del formulari
playerForm.addEventListener('change', (e) => {
    // Si canvia qualsevol input o select del form, desem
    autoSave();
});

// Per a les conversacions i substituts, ja criden a les funcions de render,
// afegirem el desat automàtic a dins d'aquestes accions.

btnSave.addEventListener('click', () => autoSave());

init();
