const playersData = {
    "Filial": [
        "DE LA PAZ BELMONTE, PEDRO CARLOS",
        "TOMAS FLORES, LLUÍS",
        "MALPICA HARO, CARLOS",
        "VILA RODRIGEZ, JOSEP",
        "ALARAN , QUADRI BOLAJI",
        "CUGUERÓ MUIXÍ, MARC",
        "GONZÁLEZ BERRUEZO, VÍCTOR",
        "CARREÑO DELGADO, ARAN",
        "JURADO RUIZ, ARTUR",
        "GRIFUL ARRIETA, GABRIEL",
        "VIDAL ROCA, ROGER",
        "VILÀ SALVADOR, FÈLIX",
        "HERNANDEZ PONS, IZAN",
        "PEREZ ARJONA, XAVIER",
        "FONTAN SANCHEZ, POL",
        "RIVERA TORRENTS, POL",
        "DEIG ESTRUCH, ROGER",
        "TOLEDO SANCHEZ, IVAN",
        "TREMP MORDIK, ADRIAN",
        "VILARMAU MURRAY, MARC",
        "SANCHEZ PEREIRA, MIQUEL",
        "MONTOYA XANDRI, NOEL",
        "COTS OLIVE, BIEL",
        "BENAIGES SOTO, RUBEN",
        "JANE VILA, LLUC"
    ]
};

const POSITIONS_LIST = [
    'Porter', 'Lateral Dret', 'Lateral Esquerre', 'Central',
    'Pivot Defensiu', 'Interior', 'Mitja Punta',
    'Extrem Dret', 'Extrem Esquerre', 'Davanter Centre'
];

const API_URL = '/api/players';
const IS_FILE = window.location.protocol === 'file:';
let globalDatabase = {};
let currentPlayerId = null;

const sidebarContent = document.getElementById('sidebar-content');
const headerName = document.getElementById('header-name');
const editorContainer = document.getElementById('editor-container');
const emptyState = document.getElementById('empty-state');
const playerForm = document.getElementById('player-form');
const btnSave = document.getElementById('btn-save');

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

async function init() {
    if (IS_FILE) {
        // Mode file:// - carregar des de localStorage
        loadFromLocalStorage();
        initSidebar();
        initPositionsGrid();
    } else {
        // Mode servidor - carregar des de l'API
        try {
            const response = await fetch(API_URL);
            globalDatabase = await response.json();
            initSidebar();
            initPositionsGrid();
        } catch (error) {
            console.error('Error carregant dades:', error);
            loadFromLocalStorage();
            initSidebar();
            initPositionsGrid();
        }
    }
}

function initPositionsGrid() {
    const grid = document.getElementById('posicions_grid');
    if (!grid) return;
    grid.innerHTML = POSITIONS_LIST.map(pos => `
        <label class="pos-check">
            <input type="checkbox" name="player_pos" value="${pos}" onchange="autoSave()"> ${pos}
        </label>
    `).join('');
}

function initSidebar() {
    let html = `
        <h2 style="color:var(--primary); font-size:1rem; margin-bottom:1.5rem; border-bottom:1px solid #fee2e2; padding-bottom:0.5rem; padding-left:0.5rem;">
            &#x1F465; Plantilla Filial
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

    headerName.innerText = id;
    const nomDisplay = document.getElementById('nom_display');
    if (nomDisplay) nomDisplay.value = id;

    const bc = document.getElementById('breadcrumb');
    if (bc) {
        bc.innerHTML = `
            <a href="../index.html">Inici</a> &rarr; 
            <a href="../seccions/direccio-esportiva.html">Direcció Esportiva</a> &rarr; 
            <a href="../seccions/senior.html">Senior</a> &rarr; 
            <a href="../seccions/filial.html">Filial</a> &rarr; 
            <span style="cursor:pointer; color:var(--primary); font-weight:700;" onclick="location.reload()">Plantilla</span> &rarr; Jugador`;
    }

    emptyState.style.display = 'none';
    playerForm.style.display = 'block';
    btnSave.style.display = 'block';
    loadPlayerData(id);
};

function loadPlayerData(id) {
    const data = globalDatabase[id] || {};
    const fields = ['edat', 'poblacio', 'rol_actual', 'rol_previst', 'conv_situacio', 'observacions'];

    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.value = data[field] || '';
    });

    const checkboxes = document.querySelectorAll('input[name="player_pos"]');
    const playerPositions = data.posicions || [];
    checkboxes.forEach(cb => {
        cb.checked = playerPositions.includes(cb.value);
    });
}

// Funció de desat automàtic
async function autoSave() {
    if (!currentPlayerId) return;

    const data = globalDatabase[currentPlayerId] || {};
    
    // Camps a recollir
    const fields = ['edat', 'poblacio', 'rol_actual', 'rol_previst', 'conv_situacio', 'observacions'];
    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) data[field] = el.value;
    });

    data.posicions = Array.from(document.querySelectorAll('input[name="player_pos"]:checked')).map(cb => cb.value);

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

// Afegir event listeners a tots els camps del formulari per a l'autosave
playerForm.addEventListener('change', () => autoSave());

btnSave.addEventListener('click', () => autoSave());

init();
