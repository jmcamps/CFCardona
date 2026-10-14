(async function () {
    'use strict';
    const D = window.JornadaData;
    const $ = id => document.getElementById(id);
    const manage = document.body.dataset.mode === 'manage';
    const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
    let teams = [], matches = [], revision = null, selected, ready = false, saving = false, dirty = false, editId = null;
    const upcoming = D.nextWeekend();
    const fields = ['team_id','rival','date','time','format','local_locker','visitor_locker','local_notes','visitor_notes','field','comments'];
    function status(message, type = '') { $('status').textContent = message; $('status').className = type; }
    async function request(url, options) {
        const response = await fetch(url, { credentials:'same-origin', ...options });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No s’han pogut carregar les dades.');
        return payload;
    }
    const api = () => `/api/planificacio-jornada?weekend=${encodeURIComponent(selected)}`;
    function teamName(id) { return teams.find(team => String(team.id) === id)?.name || `Equip ${id}`; }
    function links() {
        const target = manage ? $('viewMatchesBtn') : $('manageMatchesBtn');
        target.href = `${manage ? 'planificacio-jornada' : 'gestionar-partits-local'}.html?weekend=${selected}`;
        history.replaceState(null, '', `?weekend=${selected}`);
    }
    function picker() {
        const last = selected > upcoming ? selected : upcoming;
        $('weekend').innerHTML = D.weekends(last).map(value => `<option value="${value}">${D.label(value)}${value === upcoming ? ' · Proper cap de setmana' : ''}</option>`).join('');
        $('weekend').value = selected;
        if (manage) $('weekendDate').value = selected;
        links();
    }
    function render() {
        $('weekendTitle').textContent = `Cap de setmana del ${D.label(selected)}`;
        $('matchCount').textContent = `${matches.length} ${matches.length === 1 ? 'partit a casa' : 'partits a casa'}`;
        if (!matches.length) { $('matches').innerHTML = '<div class="empty">No hi ha partits locals planificats per a aquest cap de setmana.</div>'; return; }
        const teamCell = (name, locker, notes) => `<strong class="team-name">${esc(name)}</strong><span class="tag ${locker ? '' : 'neutral'}">${locker ? `Vestidor ${esc(locker)}` : 'Vestidor pendent'}</span>${notes ? `<p class="notes">${esc(notes)}</p>` : ''}`;
        $('matches').innerHTML = `<div class="table-scroll"><table><caption class="muted">Partits locals ordenats per data i hora</caption><thead><tr><th scope="col">Equip local</th><th scope="col">Data i hora</th><th scope="col">Equip rival</th><th scope="col">Opcions</th>${manage ? '<th scope="col">Gestió</th>' : ''}</tr></thead><tbody>${matches.map(match => `<tr>
            <td>${teamCell(teamName(match.team_id), match.local_locker, D.teamNotes(match, 'local'))}</td>
            <td>${esc(D.formatDate(match.date))}<time class="match-time" datetime="${esc(match.date)}T${esc(match.time)}">${esc(match.time)} – ${esc(D.endTime(match).time)}</time><span class="muted">${match.format === 'F7' ? '1 h 30 min' : '2 h'}${D.endTime(match).date !== match.date ? ' · acaba l’endemà' : ''}</span></td>
            <td>${teamCell(match.rival, match.visitor_locker, D.teamNotes(match, 'visitor'))}</td>
            <td><span class="tag neutral">${esc(match.format)}</span><span class="tag ${match.veo ? '' : 'neutral'}">${match.veo ? 'VEO · Sí' : 'VEO · No'}</span>${match.format === 'F7' ? `<span class="tag neutral">${match.field ? `Camp ${esc(match.field)}` : 'Camp pendent'}</span>` : ''}</td>
            ${manage ? `<td><div class="actions"><button class="btn" data-edit="${esc(match.id)}" type="button">Editar</button><button class="btn danger" data-delete="${esc(match.id)}" type="button">Eliminar</button></div></td>` : ''}
            </tr>${match.comments ? `<tr class="comments"><td colspan="${manage ? 5 : 4}"><strong>Comentaris globals del partit</strong><p class="notes">${esc(match.comments)}</p></td></tr>` : ''}`).join('')}</tbody></table></div>`;
    }
    function controls() {
        $('weekend').disabled = saving || !ready;
        if (!manage) $('generatePosterBtn').disabled = !ready || matches.length === 0;
        if (manage) {
            $('newMatch').disabled = saving || !ready;
            $('weekendDate').disabled = saving || !ready;
            $('formFields').disabled = saving || !ready;
            document.querySelectorAll('[data-edit],[data-delete]').forEach(button => { button.disabled = saving || !ready; });
        }
    }
    async function load() {
        ready = false;
        controls();
        $('matches').textContent = 'Carregant partits…';
        $('weekendTitle').textContent = `Cap de setmana del ${D.label(selected)}`;
        $('matchCount').textContent = '';
        status('Carregant dades…');
        try {
            const data = await request(api());
            matches = D.withSharedLockerNotes(D.normalizeMatches(data.matches, selected), teams);
            revision = data.revision;
            ready = true;
            render();
            status('');
        } catch (error) {
            $('matches').innerHTML = '<div class="empty">No s’han pogut carregar els partits. <button class="btn" id="retry" type="button">Tornar-ho a provar</button></div>';
            $('retry').addEventListener('click', load);
            // La selecció continua disponible per consultar una altra jornada.
            $('weekend').disabled = false;
            status(error.message, 'error');
        }
        controls();
        if (!ready) { $('weekend').disabled = false; if (manage) $('weekendDate').disabled = false; }
    }
    function discard() { return !dirty || confirm('Vols descartar els canvis del partit que encara no has desat?'); }
    async function changeWeekend(value) {
        if (saving) return;
        try { D.validateWeekend(value); } catch (error) { status(error.message, 'error'); picker(); return; }
        if (value === selected) { picker(); return; }
        if (!discard()) { picker(); return; }
        if (manage) closeEditor();
        selected = value;
        picker();
        await load();
    }
    function closeEditor() { $('editor').hidden = true; dirty = false; editId = null; }
    function formatChanged() {
        const f7 = $('format').value === 'F7';
        $('fieldLabel').hidden = !f7;
        $('field').disabled = !f7;
        if (!f7) $('field').value = '';
        availability();
    }
    function draft() {
        const row = { id:editId || '__draft__', veo:$('veo').checked };
        fields.forEach(field => { row[field] = $(field).value; });
        return row;
    }
    function availability() {
        if (!manage || $('editor').hidden) return;
        const row = draft();
        const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(row.time);
        let validDate = false;
        try { D.date(row.date); validDate = true; } catch (_) {}
        const peers = validTime && validDate ? matches.filter(match => match.id !== editId && D.overlaps(row, match)) : [];
        const occupied = validTime && validDate ? D.occupiedLockers(row, matches) : [];
        ['local_locker','visitor_locker'].forEach(id => {
            Array.from($(id).options).forEach(option => {
                const numbers = D.lockerNumbers(option.value);
                const booked = numbers.some(number => occupied.includes(number));
                const smallF11 = row.format === 'F11' && ['1','2'].includes(option.value);
                option.disabled = smallF11;
                option.textContent = option.value ? `Vestidor ${option.value}${smallF11 ? ' · F11: cal 1+2' : booked ? ' · Compartit' : ''}` : 'Pendent d’assignar';
            });
        });
        Array.from($('field').options).forEach(option => {
            option.disabled = row.format === 'F7' && peers.length > 0 && (!option.value || peers.some(match => match.format === 'F11' || match.field === option.value));
        });
        const veoBusy = peers.some(match => match.veo);
        // Si ja estava marcada, es permet desmarcar-la per resoldre el conflicte.
        $('veo').disabled = saving || (veoBusy && !row.veo);
        $('veo').title = veoBusy ? 'La VEO està ocupada en aquesta franja.' : '';
        $('scheduleFeedback').className = 'muted help';
        $('localSharedNotes').textContent = $('visitorSharedNotes').textContent = '';
        if (!validTime || !validDate) {
            $('scheduleFeedback').textContent = 'Indica la data i l’hora per consultar la disponibilitat.';
            return;
        }
        const end = D.endTime(row);
        const annotated = D.withSharedLockerNotes([...matches.filter(match => match.id !== editId), row], teams).find(match => match.id === row.id);
        $('localSharedNotes').textContent = annotated.local_shared_notes.join('\n');
        $('visitorSharedNotes').textContent = annotated.visitor_shared_notes.join('\n');
        const message = `Franja: ${row.time} – ${end.time}${end.date !== row.date ? ' (l’endemà)' : ''}. Durada: ${row.format === 'F7' ? '1 h 30 min' : '2 h'}.`;
        try {
            D.validateSchedule([...matches.filter(match => match.id !== editId), row]);
            $('scheduleFeedback').textContent = `${message}${veoBusy ? ' La VEO està ocupada.' : ''}`;
        } catch (error) {
            $('scheduleFeedback').className = 'muted help error';
            $('scheduleFeedback').textContent = `${message} ${error.message}`;
        }
    }
    function edit(match) {
        if (!ready || saving || !discard()) return;
        $('matchForm').reset();
        editId = match?.id || null;
        $('date').min = selected;
        $('date').max = D.addDays(selected, 1);
        fields.forEach(field => { $(field).value = match?.[field] ?? ''; });
        $('veo').checked = match?.veo || false;
        if (!match) {
            $('date').value = selected;
            $('format').value = D.inferFormat(teamName($('team_id').value));
            const last = matches[matches.length - 1];
            if (last) {
                const end = D.endTime(last);
                if (end.date <= D.addDays(selected, 1)) { $('date').value = end.date; $('time').value = end.time; }
            }
        }
        $('editorTitle').textContent = match ? 'Editar partit' : 'Afegir partit';
        $('editor').hidden = false;
        dirty = false;
        formatChanged();
        $('editor').scrollIntoView({ behavior:'smooth', block:'start' });
        $('team_id').focus({ preventScroll:true });
    }
    async function persist(next) {
        saving = true;
        controls();
        status('Desant la jornada…');
        try {
            const data = await request(api(), { method:'PUT', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ matches:next, revision }) });
            matches = D.withSharedLockerNotes(data.matches, teams);
            revision = data.revision;
            render();
            closeEditor();
            status('Jornada desada.', 'success');
        } catch (error) { status(error.message, 'error'); }
        finally { saving = false; controls(); formatChanged(); }
    }
    try {
        const raw = new URLSearchParams(location.search).get('weekend');
        selected = raw ? D.validateWeekend(raw) : upcoming;
    } catch (_) { selected = upcoming; }
    picker();
    if (!manage) $('generatePosterBtn').addEventListener('click', () => {
        if (ready && matches.length) location.href = `cartell-jornada.html?weekend=${encodeURIComponent(selected)}`;
    });
    $('weekend').addEventListener('change', event => changeWeekend(event.target.value));
    try {
        const [session, data] = await Promise.all([request('/api/auth/session'), request('/api/equips')]);
        teams = Array.isArray(data) ? data : [];
        const roles = session.user?.roles || [];
        const canManage = roles.includes('admin') || roles.includes('direccio');
        if (!manage) $('manageMatchesBtn').hidden = !canManage;
        if (manage && !canManage) { status('No tens permisos per gestionar els partits locals.', 'error'); return; }
        if (manage) {
            $('team_id').innerHTML = '<option value="">Selecciona un equip</option>' + teams.map(team => `<option value="${esc(team.id)}">${esc(team.name)}</option>`).join('');
            ['local_locker','visitor_locker'].forEach(id => {
                $(id).innerHTML = D.LOCKERS.map(value => `<option value="${value}">${value ? `Vestidor ${value}` : 'Pendent d’assignar'}</option>`).join('');
            });
            $('weekendDate').addEventListener('change', event => {
                if (event.target.value) changeWeekend(D.weekendFor(event.target.value));
            });
            $('newMatch').addEventListener('click', () => edit());
            $('cancelEdit').addEventListener('click', () => { if (discard()) closeEditor(); });
            $('matchForm').addEventListener('input', () => { dirty = true; availability(); });
            $('matchForm').addEventListener('change', () => { dirty = true; availability(); });
            $('format').addEventListener('change', formatChanged);
            $('team_id').addEventListener('change', () => { $('format').value = D.inferFormat(teamName($('team_id').value)); formatChanged(); });
            $('matchForm').addEventListener('submit', async event => {
                event.preventDefault();
                if (!ready || saving) return;
                const row = { id:editId || crypto.randomUUID(), veo:$('veo').checked };
                fields.forEach(field => { row[field] = $(field).value; });
                try {
                    const next = D.normalizeMatches([...matches.filter(match => match.id !== row.id), row], selected);
                    D.validateSchedule(next);
                    await persist(next);
                } catch (error) { status(error.message, 'error'); }
            });
            $('matches').addEventListener('click', async event => {
                const button = event.target.closest('[data-edit],[data-delete]');
                if (!button || !ready || saving) return;
                const match = matches.find(row => row.id === (button.dataset.edit || button.dataset.delete));
                if (!match) return;
                if (button.dataset.edit) edit(match);
                else if (discard() && confirm(`Vols eliminar el partit ${teamName(match.team_id)} – ${match.rival}?`)) await persist(matches.filter(row => row.id !== match.id));
            });
            window.addEventListener('beforeunload', event => { if (dirty || saving) { event.preventDefault(); event.returnValue = ''; } });
        }
        await load();
    } catch (error) {
        status(error.message, 'error');
        $('matches').textContent = 'No s’han pogut carregar les dades inicials. Recarrega la pàgina per tornar-ho a provar.';
    }
})();
