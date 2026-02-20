const API_URL = '/api/players';
let globalData = {};

const defaults = {
    directrius: "• Construir una plantilla competitiva però equilibrada.\n• Prioritzar jugadors fiables i compromesos.\n• Ajustar-se al pressupost (sostenibilitat).\n• Escollir l'entrenador ideal ( David Andreu).\n• Anticipar-se als problemes i fer seguiment del rendiment.\n• Mantenir la cohesió del vestidor.\n• Connexió directa amb el futbol base.",
    funcions: "• Planificació esportiva i definició del model de joc.\n• Confecció de la plantilla (fitxatges, renovacions, baixes).\n• Coordinació amb el cos tècnic.\n• Gestió del pressupost esportiu.\n• Coordinació amb el futbol base.\n• Representació i relacions externes.\n• Seguiment i anàlisi continu del rendiment.",
    perfil: "• Coneixedor del futbol territorial català (1a, 2a i 3a Catalana).\n• Amb xarxa de contactes àmplia.\n• Pragmàtic i realista.\n• Bon gestor de persones i capacitat de lideratge."
};

async function loadData() {
    try {
        const response = await fetch(API_URL);
        globalData = await response.json();
    } catch (e) {
        console.warn("Servidor no disponible");
    }

    const ed = globalData.esportiva || {};

    document.getElementById('dir_directrius').value = ed.directrius || defaults.directrius;
    document.getElementById('dir_funcions').value = ed.funcions || defaults.funcions;
    document.getElementById('dir_perfil').value = ed.perfil || defaults.perfil;
    document.getElementById('staff_info').value = ed.staff_info || "";
    document.getElementById('filial_info').value = ed.filial_info || "";
    document.getElementById('juvenil_info').value = ed.juvenil_info || "";

    renderCandidates(ed.candidates || []);
}

function renderCandidates(list) {
    const container = document.getElementById('candidates_list');
    if (list.length === 0) {
        container.innerHTML = '<div style="color: #94a3b8; font-size: 0.85rem;">Sense candidats registrats.</div>';
        return;
    }

    container.innerHTML = list.map((c, i) => `
        <div class="list-item">
            <div class="list-item-info">
                <span class="item-name">${c.name}</span>
                <span class="item-secondary">${c.phone}</span>
                <span>${c.situation}</span>
            </div>
            <button class="btn" style="background:none; color:var(--primary); font-size:1.25rem; padding:0" onclick="removeCandidate(${i})">×</button>
        </div>
    `).join('');
}

window.addCandidate = function () {
    const name = document.getElementById('cand_name');
    const phone = document.getElementById('cand_phone');
    const sit = document.getElementById('cand_sit');
    if (!name.value) return;
    if (!globalData.esportiva) globalData.esportiva = {};
    if (!globalData.esportiva.candidates) globalData.esportiva.candidates = [];
    globalData.esportiva.candidates.push({ name: name.value, phone: phone.value, situation: sit.value });
    name.value = ''; phone.value = ''; sit.value = '';
    renderCandidates(globalData.esportiva.candidates);
};

window.removeCandidate = function (index) {
    globalData.esportiva.candidates.splice(index, 1);
    renderCandidates(globalData.esportiva.candidates);
};

document.getElementById('btn-save-global').addEventListener('click', async () => {
    if (!globalData.esportiva) globalData.esportiva = {};

    globalData.esportiva.directrius = document.getElementById('dir_directrius').value;
    globalData.esportiva.funcions = document.getElementById('dir_funcions').value;
    globalData.esportiva.perfil = document.getElementById('dir_perfil').value;
    globalData.esportiva.staff_info = document.getElementById('staff_info').value;
    globalData.esportiva.filial_info = document.getElementById('filial_info').value;
    globalData.esportiva.juvenil_info = document.getElementById('juvenil_info').value;

    const btn = document.getElementById('btn-save-global');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(globalData)
        });
        if (response.ok) {
            btn.innerText = '✅ CAMBIS GUARDATS';
            btn.style.background = '#16a34a';
        }
    } catch (e) {
        btn.innerText = '❌ ERROR';
        btn.style.background = '#d91d1d';
    }
    setTimeout(() => {
        btn.innerText = 'GUARDAR CANVIS GENERALS';
        btn.style.background = '#d91d1d';
    }, 2000);
});

loadData();
