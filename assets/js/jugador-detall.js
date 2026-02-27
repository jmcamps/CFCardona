const API_JUGADORS = '/api/jugadors';
const API_POSICIONS = '/api/posicions';
const API_ROLS = '/api/rols';
const API_JUGADORS_SEGUIMENT = '/api/jugadors-seguiment';
const DEFAULT_POSITIONS_LIST = ['Porter', 'Lateral Dret', 'Lateral Esquerre', 'Central', 'Pivot Defensiu', 'Interior', 'Mitja Punta', 'Extrem Dret', 'Extrem Esquerre', 'Davanter Centre'];

let currentPlayerName = '';
let currentPlayerId = '';
let currentEquipId = 1;
let isCreateMode = false;
let currentConversations = [];
let currentComentaris = [];
let currentPlayerData = null;
let positionsCatalog = [...DEFAULT_POSITIONS_LIST];
let rolesCatalog = [];
let captacioCandidates = [];

const headerName = document.getElementById('header-name');
const emptyState = document.getElementById('empty-state');
const playerForm = document.getElementById('player-form');
const btnSave = document.getElementById('btn-save');
const btnBackTeam = document.getElementById('btn-back-team');
const breadcrumbTeamLink = document.getElementById('breadcrumb-team-link');
const convListEl = document.getElementById('conv_list');
const obsListEl = document.getElementById('obs_list');
const captacioSuggestionsEl = document.getElementById('captacio_suggestions');

function getTeamNavConfig(equipId) {
    const normalized = Number(equipId) || 1;
    if (normalized === 2) {
        return {
            href: 'filial.html',
            label: 'Filial',
            backText: 'TORNAR A FILIAL'
        };
    }

    return {
        href: 'primer-equip.html',
        label: 'Primer Equip',
        backText: 'TORNAR A PRIMER EQUIP'
    };
}

function applyTeamNavigation(equipId) {
    const config = getTeamNavConfig(equipId);
    if (breadcrumbTeamLink) {
        breadcrumbTeamLink.href = config.href;
        breadcrumbTeamLink.textContent = config.label;
    }
    if (btnBackTeam) {
        btnBackTeam.href = config.href;
        btnBackTeam.textContent = config.backText;
        btnBackTeam.style.display = 'inline-flex';
    }
}

function escHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function initPositionsGrid() {
    const grid = document.getElementById('posicions_grid');
    if (!grid) return;
    grid.innerHTML = positionsCatalog.map(pos => `
        <label class="pos-check">
            <input type="checkbox" name="player_pos" value="${pos}"> ${pos}
        </label>
    `).join('');
}

function initRoleSelects() {
    const currentRoleSelect = document.getElementById('rol_actual');
    const futureRoleSelect = document.getElementById('rol_previst');
    const options = ['<option value="">Selecciona...</option>']
        .concat(
            rolesCatalog.map(role => `<option value="${escHtml(role.id)}">${escHtml(role.nom)}</option>`)
        )
        .join('');

    if (currentRoleSelect) currentRoleSelect.innerHTML = options;
    if (futureRoleSelect) futureRoleSelect.innerHTML = options;
}

async function loadRolesCatalog() {
    try {
        const response = await fetch(API_ROLS);
        if (!response.ok) throw new Error('No s\'ha pogut carregar el catàleg de rols');
        const rows = await response.json();
        rolesCatalog = Array.isArray(rows)
            ? rows
                .map(r => ({ id: String(r && r.id ? r.id : ''), nom: String(r && r.nom ? r.nom : '').trim() }))
                .filter(r => r.id && r.nom)
            : [];
    } catch (_) {
        rolesCatalog = [];
    }
}

async function loadPositionsCatalog() {
    try {
        const response = await fetch(API_POSICIONS);
        if (!response.ok) throw new Error('No s\'ha pogut carregar el catàleg de posicions');
        const rows = await response.json();
        const names = Array.isArray(rows)
            ? rows.map(r => String(r && r.nom ? r.nom : '').trim()).filter(Boolean)
            : [];
        if (names.length) {
            positionsCatalog = names;
        }
    } catch (_) {
        positionsCatalog = [...DEFAULT_POSITIONS_LIST];
    }
}

function loadPlayerData() {
    const data = currentPlayerData || {};
    const fields = [
        'edat', 'poblacio',
        'fitxa_mensual', 'primes_partit', 'prima_permanencia', 'altres_incentius',
        'conv_situacio',
        'val_forts', 'val_millorar', 'val_lesions', 'val_compromis'
    ];

    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.value = data[field] || '';
    });

    const anyNaixementEl = document.getElementById('any_naixement');
    if (anyNaixementEl) {
        const anyValue = data.any_naixement !== null && data.any_naixement !== undefined
            ? String(data.any_naixement)
            : '';
        anyNaixementEl.value = anyValue;
    }

    const revisioEl = document.getElementById('revisio_medica');
    if (revisioEl) {
        revisioEl.value = data.revisio ? 'true' : 'false';
    }

    const rolActualEl = document.getElementById('rol_actual');
    if (rolActualEl) {
        const roleId = data.rol_actual_id !== null && data.rol_actual_id !== undefined
            ? String(data.rol_actual_id)
            : '';
        rolActualEl.value = roleId;
    }

    const rolPrevistEl = document.getElementById('rol_previst');
    if (rolPrevistEl) {
        const roleId = data.rol_previst_id !== null && data.rol_previst_id !== undefined
            ? String(data.rol_previst_id)
            : '';
        rolPrevistEl.value = roleId;
    }

    const checkboxes = document.querySelectorAll('input[name="player_pos"]');
    const playerPositions = Array.isArray(data.posicions) ? data.posicions : [];
    checkboxes.forEach(cb => {
        cb.checked = playerPositions.includes(cb.value);
    });

    currentConversations = Array.isArray(data.conversations) ? data.conversations : [];
    currentComentaris = Array.isArray(data.comentaris) ? data.comentaris : [];

    renderConversations();
    renderObs();
    renderCaptacioSuggestions();
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr || '-';
    return d.toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function renderConversations() {
    if (!currentConversations.length) {
        convListEl.innerHTML = '<div style="color:#94a3b8; font-size:0.8rem; padding:0.5rem;">Sense converses registrades.</div>';
        return;
    }

    convListEl.innerHTML = currentConversations.map((c, index) => `
        <div class="conv-entry">
            <span class="date">${escHtml(formatDate(c.date))}</span>
            <span class="text">${escHtml(c.text)}</span>
            <button type="button" class="btn-remove" onclick="removeConversation(${index})">×</button>
        </div>
    `).join('');
}

function renderObs() {
    if (!obsListEl) return;
    if (!currentComentaris.length) {
        obsListEl.innerHTML = '<div class="empty-msg">Sense observacions registrades.</div>';
        return;
    }

    obsListEl.innerHTML = currentComentaris.map((o, i) => `
        <div class="obs-item">
            <div class="obs-header">
                <div class="obs-meta"><strong>${escHtml(o.autor || 'Anònim')}</strong> &mdash; ${escHtml(formatDate(o.data || ''))}</div>
                <button type="button" class="btn-remove" onclick="removeObs(${i})">×</button>
            </div>
            <div class="obs-text">${escHtml(o.text || '')}</div>
        </div>
    `).join('');
}

window.addConversation = async function () {
    const dateInput = document.getElementById('new_conv_date');
    const textInput = document.getElementById('new_conv_text');
    if (!dateInput.value || !textInput.value.trim()) return;

    currentConversations.push({ date: dateInput.value, text: textInput.value.trim() });
    currentConversations.sort((a, b) => new Date(b.date) - new Date(a.date));
    dateInput.value = '';
    textInput.value = '';
    renderConversations();
    await savePlayerData({ silentValidation: true });
};

window.removeConversation = async function (index) {
    currentConversations.splice(index, 1);
    renderConversations();
    await savePlayerData({ silentValidation: true });
};

const today = new Date().toISOString().split('T')[0];
const obsDataInput = document.getElementById('obs_data');
if (obsDataInput) obsDataInput.value = today;

window.addObs = async function () {
    const textEl = document.getElementById('obs_text');
    const autorEl = document.getElementById('obs_autor');
    const dataEl = document.getElementById('obs_data');
    if (!textEl || !textEl.value.trim()) return;

    currentComentaris.unshift({
        autor: (autorEl && autorEl.value.trim()) || 'Anònim',
        data: (dataEl && dataEl.value) || today,
        text: textEl.value.trim()
    });

    textEl.value = '';
    if (autorEl) autorEl.value = '';
    if (dataEl) dataEl.value = today;
    renderObs();
    await savePlayerData({ silentValidation: true });
};

window.removeObs = async function (index) {
    currentComentaris.splice(index, 1);
    renderObs();
    await savePlayerData({ silentValidation: true });
};

async function loadCaptacioCandidates() {
    try {
        const response = await fetch(API_JUGADORS_SEGUIMENT);
        if (!response.ok) throw new Error('No s\'ha pogut carregar captació');
        const rows = await response.json();
        captacioCandidates = Array.isArray(rows) ? rows : [];
    } catch (_) {
        captacioCandidates = [];
    }
}

function getSelectedPlayerPositions() {
    return Array.from(document.querySelectorAll('input[name="player_pos"]:checked'))
        .map(cb => String(cb.value || '').trim())
        .filter(Boolean);
}

function renderCaptacioSuggestions() {
    if (!captacioSuggestionsEl) return;

    const selectedPositions = getSelectedPlayerPositions();
    if (!selectedPositions.length) {
        captacioSuggestionsEl.innerHTML = '<div class="empty-msg">Selecciona alguna posició del jugador per veure suggeriments.</div>';
        return;
    }

    const selectedSet = new Set(selectedPositions);
    const currentYear = new Date().getFullYear();

    const suggestions = captacioCandidates
        .map(candidate => {
            const candidatePositions = Array.isArray(candidate && candidate.posicions)
                ? candidate.posicions.map(p => String(p || '').trim()).filter(Boolean)
                : [];
            const matches = candidatePositions.filter(pos => selectedSet.has(pos));
            const birthYear = Number(candidate && candidate.any_naixement);
            const age = Number.isFinite(birthYear) ? (currentYear - birthYear) : null;

            return {
                raw: candidate,
                matches,
                age,
                birthYear: Number.isFinite(birthYear) ? birthYear : null
            };
        })
        .filter(item => item.matches.length > 0)
        .filter(item => item.age !== null && item.age >= 19)
        .sort((a, b) => {
            if (b.matches.length !== a.matches.length) return b.matches.length - a.matches.length;
            return String(a.raw && a.raw.nom ? a.raw.nom : '').localeCompare(String(b.raw && b.raw.nom ? b.raw.nom : ''));
        });

    if (!suggestions.length) {
        captacioSuggestionsEl.innerHTML = '<div class="empty-msg">Sense coincidències per posició en majors de 19 anys.</div>';
        return;
    }

    captacioSuggestionsEl.innerHTML = suggestions.map(item => {
        const candidate = item.raw || {};
        const nom = escHtml(candidate.nom || 'Sense nom');
        const club = candidate.club ? `<strong>Club:</strong> ${escHtml(candidate.club)}<br>` : '';
        const tel = candidate.tel ? `<strong>Tel:</strong> ${escHtml(candidate.tel)}<br>` : '';
        const poblacio = candidate.poblacio ? `<strong>Població:</strong> ${escHtml(candidate.poblacio)}<br>` : '';
        const situacio = candidate.situacio ? `<strong>Situació:</strong> ${escHtml(candidate.situacio)}` : '';
        const posicions = Array.isArray(candidate.posicions) ? candidate.posicions.join(', ') : '';
        const gender = String(candidate.genere || '').trim();
        const genderBadge = gender === 'Masculí'
            ? `<span class="gender-masculi" style="font-size:0.7rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:1rem;background:#dbeafe;color:#1d4ed8;margin-left:0.5rem;">${escHtml(gender)}</span>`
            : `<span class="gender-femeni" style="font-size:0.7rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:1rem;background:#fce7f3;color:#be185d;margin-left:0.5rem;">${escHtml(gender || 'N/D')}</span>`;
        const yearText = item.birthYear !== null ? String(item.birthYear) : 'N/D';
        const yearBadge = `<span class="year-badge" style="font-size:0.7rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:1rem;background:#fef3c7;color:#92400e;margin-left:0.5rem;">${escHtml(yearText)}</span>`;

        return `<div class="obs-item" style="background:#f0fdf4;border:1px solid #86efac;"><div class="obs-header"><div style="font-size:0.95rem;"><strong style="color:#059669;">${nom}</strong>${genderBadge}${yearBadge}</div></div><div style="font-size:0.82rem;color:#475569;line-height:1.6;">${club}${tel}${poblacio}<strong>Posicions:</strong> ${escHtml(posicions)}<br>${situacio}</div></div>`;
    }).join('');
}

async function resolvePlayerNameById(playerId) {
    if (!playerId) return '';
    try {
        const response = await fetch(`${API_JUGADORS}?id=${encodeURIComponent(String(playerId))}`);
        if (!response.ok) return '';
        const player = await response.json();
        if (player && typeof player === 'object') {
            currentPlayerData = player;
        }
        return player && player.nom ? String(player.nom) : '';
    } catch (e) {
        return '';
    }
}

function buildPlayerPayload() {
    const payload = {
        nom: String((document.getElementById('nom_display') || {}).value || '').trim(),
        any_naixement: String((document.getElementById('any_naixement') || {}).value || '').trim(),
        revisio_medica: ((document.getElementById('revisio_medica') || {}).value || 'false') === 'true',
        rol_actual_id: (() => {
            const raw = String((document.getElementById('rol_actual') || {}).value || '').trim();
            return raw ? Number(raw) : null;
        })(),
        rol_previst_id: (() => {
            const raw = String((document.getElementById('rol_previst') || {}).value || '').trim();
            return raw ? Number(raw) : null;
        })(),
        conversations: currentConversations,
        comentaris: currentComentaris,
        posicions: Array.from(document.querySelectorAll('input[name="player_pos"]:checked')).map(cb => cb.value)
    };

    const roleById = rolesCatalog.reduce((acc, role) => {
        acc[String(role.id)] = role.nom;
        return acc;
    }, {});
    payload.rol_actual = payload.rol_actual_id ? (roleById[String(payload.rol_actual_id)] || '') : '';
    payload.rol_previst = payload.rol_previst_id ? (roleById[String(payload.rol_previst_id)] || '') : '';

    const fields = [
        'edat', 'poblacio',
        'fitxa_mensual', 'primes_partit', 'prima_permanencia', 'altres_incentius',
        'conv_situacio',
        'val_forts', 'val_millorar', 'val_lesions', 'val_compromis'
    ];

    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) payload[field] = el.value;
    });

    return payload;
}

async function savePlayerData(options = {}) {
    const { silentValidation = false } = options;
    const payload = buildPlayerPayload();

    if (!payload.nom) {
        if (!silentValidation) {
            alert('El nom del jugador és obligatori.');
        }
        return;
    }

    if (!currentPlayerId) {
        const createPayload = {
            equip_id: Number(currentEquipId) || 1,
            nom: payload.nom,
            any_naixement: payload.any_naixement,
            revisio_medica: payload.revisio_medica
        };

        try {
            const createResponse = await fetch(API_JUGADORS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createPayload)
            });

            if (!createResponse.ok) throw new Error('No s\'ha pogut crear el jugador');
            const createResult = await createResponse.json();
            const created = createResult && createResult.jugador ? createResult.jugador : null;
            if (!created || created.id === undefined || created.id === null) {
                throw new Error('No s\'ha rebut l\'ID del jugador creat');
            }

            currentPlayerId = String(created.id);
            currentPlayerName = created.nom || payload.nom;
            currentPlayerData = { ...(currentPlayerData || {}), ...created, equip_id: createPayload.equip_id };
            isCreateMode = false;

            const nextUrl = `jugador-detall.html?playerId=${encodeURIComponent(currentPlayerId)}&equipId=${encodeURIComponent(String(currentEquipId))}`;
            window.history.replaceState({}, '', nextUrl);
        } catch (e) {
            if (!silentValidation) {
                alert('No s\'ha pogut crear el jugador.');
            }
            return;
        }
    }

    payload.id = String(currentPlayerId);

    btnSave.innerText = '⏳ DESANT...';
    btnSave.style.background = '#64748b';

    try {
        const response = await fetch(API_JUGADORS, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('No s\'ha pogut guardar');
        btnSave.innerText = '✅ GUARDAT';
        btnSave.style.background = 'var(--success)';
        currentPlayerName = payload.nom;
        headerName.innerText = `📋 ${currentPlayerName}`;
    } catch (e) {
        btnSave.innerText = '❌ ERROR';
        btnSave.style.background = '#222';
    }

    setTimeout(() => {
        btnSave.innerText = 'GUARDAR FITXA';
        btnSave.style.background = 'var(--primary)';
    }, 1300);
}

async function init() {
    await loadRolesCatalog();
    initRoleSelects();
    await loadPositionsCatalog();
    initPositionsGrid();
    await loadCaptacioCandidates();

    const params = new URLSearchParams(window.location.search);
    currentPlayerId = params.get('playerId') || '';
    currentEquipId = Number(params.get('equipId')) || 1;
    isCreateMode = params.get('mode') === 'create' || !currentPlayerId;
    applyTeamNavigation(currentEquipId);

    if (isCreateMode) {
        currentPlayerData = {
            equip_id: currentEquipId,
            revisio: false,
            posicions: [],
            conversations: [],
            comentaris: []
        };

        headerName.innerText = '📋 Alta Nou Jugador';
        emptyState.style.display = 'none';
        playerForm.style.display = 'block';
        btnSave.style.display = 'inline-block';
        btnSave.innerText = 'CREAR JUGADOR';

        const nomDisplay = document.getElementById('nom_display');
        if (nomDisplay) nomDisplay.value = '';

        loadPlayerData();
        return;
    }

    currentPlayerName = await resolvePlayerNameById(currentPlayerId);

    if (!currentPlayerName) {
        emptyState.style.display = 'block';
        playerForm.style.display = 'none';
        btnSave.style.display = 'none';
        return;
    }

    headerName.innerText = `📋 ${currentPlayerName}`;
    const nomDisplay = document.getElementById('nom_display');
    if (nomDisplay) nomDisplay.value = currentPlayerName;

    if (!currentPlayerData) {
        emptyState.style.display = 'block';
        playerForm.style.display = 'none';
        btnSave.style.display = 'none';
        return;
    }

    currentEquipId = Number(currentPlayerData.equip_id) || currentEquipId;
    applyTeamNavigation(currentEquipId);

    currentPlayerName = currentPlayerData.nom || currentPlayerName;
    if (nomDisplay) nomDisplay.value = currentPlayerName;
    headerName.innerText = `📋 ${currentPlayerName}`;

    emptyState.style.display = 'none';
    playerForm.style.display = 'block';
    btnSave.style.display = 'inline-block';

    loadPlayerData();
}

btnSave.addEventListener('click', () => savePlayerData({ silentValidation: false }));
playerForm.addEventListener('change', () => {
    renderCaptacioSuggestions();
    // autosave suau
    savePlayerData({ silentValidation: true });
});

init();