const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const D = require('../assets/js/jornada-data');
const root = path.resolve(__dirname, '..');
const weekend = '2026-10-17';
const match = { id:'test-match', team_id:'1', rival:'CF Rival', date:weekend, time:'16:00', format:'F11', local_locker:'6', visitor_locker:'1+2', local_notes:'', visitor_notes:'Dues dutxes', veo:true, field:'', comments:'Arribada a les 15 h' };

test('Caps de setmana, canvi de mes/any i zona horària de Madrid', () => {
    assert.equal(D.nextWeekend(new Date('2026-10-14T08:00:00Z')), weekend);
    assert.equal(D.nextWeekend(new Date('2026-10-17T10:00:00Z')), '2026-10-24');
    assert.equal(D.nextWeekend(new Date('2026-10-18T10:00:00Z')), '2026-10-24');
    assert.equal(D.today(new Date('2026-10-16T22:30:00Z')), '2026-10-17');
    assert.equal(D.nextWeekend(new Date('2026-12-31T10:00:00Z')), '2027-01-02');
    assert.deepEqual(D.weekends(weekend), [weekend, '2026-10-10', '2026-10-03']);
    assert.equal(D.weekendFor('2026-10-18'), weekend);
    assert.throws(() => D.validateWeekend('2026-09-26'));
    assert.throws(() => D.validateWeekend('2026-10-18'));
    assert.throws(() => D.date('2026-02-30'));
});

test('Assignacions F11 conjuntes, dates, hora, ordenació i modalitat', () => {
    assert.equal(D.normalizeMatches([match], weekend)[0].visitor_locker, '1+2');
    for (const patch of [{ visitor_locker:'1' }, { date:'2026-10-19' }, { time:'24:00' }, { veo:'sí' }]) {
        assert.throws(() => D.normalizeMatches([{ ...match, ...patch }], weekend));
    }
    assert.throws(() => D.normalizeMatches([match, match], weekend));
    const f7 = { ...match, format:'F7', visitor_locker:'1', field:'dret' };
    assert.equal(D.normalizeMatches([f7], weekend)[0].field, 'dret');
    assert.equal(D.normalizeMatches([{ ...match, field:'dret' }], weekend)[0].field, '');
    assert.equal(D.inferFormat('Cadet Femení'), 'F7');
    assert.equal(D.inferFormat('Juvenil Femení'), 'F11');
    assert.equal(D.inferFormat('S12 (Aleví)'), 'F7');
    assert.deepEqual(D.normalizeMatches([{ ...match, id:'late', date:'2026-10-18' }, match], weekend).map(row => row.id), ['test-match','late']);
});

function serverFixture() {
    let handler;
    const storage = new Map();
    const context = {
        URL, Buffer, console, setTimeout, clearTimeout, __dirname:root,
        process:{ env:{ SUPABASE_URL:'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY:'sb_secret_test', SUPABASE_ANON_KEY:'sb_publishable_test' } },
        require(name) {
            if (name === 'dotenv') return { config() {} };
            if (name === 'http') return { createServer(callback) { handler = callback; return { listen() {} }; } };
            if (name === './assets/js/jornada-data') return D;
            return require(name);
        },
        __verify:async token => token === 'missing' ? null : ({ id:'test-user', app_metadata:{ roles:[token] } }),
        __teams:async () => [{ id:'1', name:'Juvenil Femení' }],
        __rest:async (method, endpoint, body) => {
            const url = new URL(endpoint, 'https://example.invalid');
            const scope = (url.searchParams.get('scope') || '').replace(/^eq\./, '');
            if (method === 'GET') return storage.has(scope) ? [{ payload:storage.get(scope) }] : [];
            if (method === 'POST') {
                if (storage.has(body[0].scope)) throw new Error('HTTP 409 duplicate 23505');
                storage.set(body[0].scope, body[0].payload);
                return null;
            }
            if (method === 'PATCH') {
                const expected = url.searchParams.get('payload->>revision').replace(/^eq\./, '');
                if (storage.get(scope)?.revision !== expected) return [];
                storage.set(scope, body.payload);
                return [{ payload:body.payload }];
            }
            throw new Error('Unexpected persistence operation');
        }
    };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'server.js'), 'utf8') + '\nverifySupabaseSession = __verify; readEquips = __teams; supabaseRestRequest = __rest;', context);
    function call(method, url, body, role = 'direccio') {
        return new Promise((resolve, reject) => {
            const req = new EventEmitter();
            Object.assign(req, { method, url, headers:{ authorization:`Bearer ${role}` } });
            const timer = setTimeout(() => reject(new Error('API timeout')), 2000);
            const res = { status:200, setHeader() {}, writeHead(status) { this.status = status; }, end(value) {
                clearTimeout(timer);
                resolve({ status:this.status, body:value ? JSON.parse(value) : null });
            } };
            handler(req, res).catch(reject);
            setImmediate(() => { if (body !== undefined) req.emit('data', JSON.stringify(body)); req.emit('end'); });
        });
    }
    return { call, storage };
}

test('API: persisteix per jornada, actualitza, elimina i impedeix sobreescriptures concurrents', async () => {
    const { call } = serverFixture();
    const url = `/api/planificacio-jornada?weekend=${weekend}`;
    assert.deepEqual((await call('GET', url)).body.matches, []);
    const created = await call('PUT', url, { matches:[match], revision:null });
    assert.equal(created.status, 200);
    assert.equal((await call('GET', url)).body.matches[0].comments, match.comments);
    assert.deepEqual((await call('GET', '/api/planificacio-jornada?weekend=2026-10-10')).body.matches, []);
    assert.equal((await call('PUT', url, { matches:[], revision:null })).status, 409);
    const changed = await call('PUT', url, { matches:[{ ...match, comments:'Canvi desat' }], revision:created.body.revision });
    assert.equal(changed.status, 200);
    assert.equal((await call('PUT', url, { matches:[], revision:created.body.revision })).status, 409);
    const deleted = await call('PUT', url, { matches:[], revision:changed.body.revision });
    assert.equal(deleted.status, 200);
    assert.deepEqual((await call('GET', url)).body.matches, []);
});

test('API: permisos i validacions abans d’escriure', async () => {
    const { call, storage } = serverFixture();
    const url = `/api/planificacio-jornada?weekend=${weekend}`;
    assert.equal((await call('GET', url, undefined, 'missing')).status, 401);
    for (const role of ['viewer','senior','futbol_base','scouting']) {
        assert.equal((await call('GET', url, undefined, role)).status, 200);
        assert.equal((await call('PUT', url, { matches:[match], revision:null }, role)).status, 403);
    }
    assert.equal((await call('PUT', url, { matches:[{ ...match, team_id:'unknown' }], revision:null })).status, 400);
    assert.equal((await call('PUT', url, { matches:[{ ...match, visitor_locker:'1' }], revision:null })).status, 400);
    assert.equal((await call('PUT', url, null)).status, 400);
    assert.equal((await call('GET', '/api/planificacio-jornada?weekend=2026-10-18')).status, 400);
    assert.equal(storage.size, 0);
    assert.equal((await call('PUT', url, { matches:[match], revision:null }, 'admin')).status, 200);
});

async function pageFixture(manage, role = 'direccio', initialMatches = [{ ...match, rival:'<script>alert(1)</script>' }]) {
    const elements = new Map();
    const element = id => {
        if (!elements.has(id)) elements.set(id, { value:'', hidden:false, disabled:false, innerHTML:'', textContent:'', listeners:{},
            options:(['local_locker','visitor_locker'].includes(id) ? D.LOCKERS : id === 'field' ? ['', 'dret', 'esquerre'] : []).map(value => ({ value, disabled:false })),
            addEventListener(type, callback) { this.listeners[type] = callback; }, reset() {}, focus() {}, scrollIntoView() {} });
        return elements.get(id);
    };
    const writes = [];
    const context = {
        window:{ JornadaData:{ ...D, nextWeekend:() => weekend }, addEventListener() {} },
        document:{ body:{ dataset:{ mode:manage ? 'manage' : '' } }, getElementById:element, querySelectorAll:() => [] },
        location:{ search:'' }, history:{ replaceState() {} }, URLSearchParams, crypto:require('node:crypto'), confirm:() => true,
        fetch:async (url, options) => {
            let data;
            if (url === '/api/auth/session') data = { user:{ roles:[role] } };
            else if (url === '/api/equips') data = [{ id:'1', name:'Juvenil Femení' }];
            else if (options?.method === 'PUT') {
                const body = JSON.parse(options.body);
                writes.push({ url, body });
                data = { matches:body.matches, revision:'updated' };
            } else data = { matches:new URL(url, 'http://localhost').searchParams.get('weekend') === weekend ? initialMatches : [], revision:'original' };
            return { ok:true, json:async () => data };
        }
    };
    await vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/js/planificacio-jornada.js'), 'utf8'), context);
    return { element, writes };
}

test('Consulta: proper cap de setmana, enllaç de gestió, camps visibles i escapament de text', async () => {
    const { element } = await pageFixture(false);
    assert.equal(element('weekend').value, weekend);
    assert.equal(element('manageMatchesBtn').hidden, false);
    assert.match(element('manageMatchesBtn').href, /weekend=2026-10-17/);
    assert.match(element('matches').innerHTML, /Vestidor 1\+2/);
    assert.match(element('matches').innerHTML, /VEO · Sí/);
    assert.match(element('matches').innerHTML, /Arribada a les 15 h/);
    assert.match(element('matches').innerHTML, /&lt;script&gt;/);
    assert.doesNotMatch(element('matches').innerHTML, /<script>/);
    assert.doesNotMatch(element('matches').innerHTML, /Camp pendent/);
    assert.equal((await pageFixture(false, 'viewer')).element('manageMatchesBtn').hidden, true);
});

test('Gestió: editar un partit, desar-lo amb revisió i navegar a una jornada futura', async () => {
    const { element, writes } = await pageFixture(true);
    await element('matches').listeners.click({ target:{ closest:() => ({ dataset:{ edit:match.id } }) } });
    assert.equal(element('editor').hidden, false);
    assert.equal(element('visitor_locker').value, '1+2');
    assert.equal(element('fieldLabel').hidden, true);
    element('comments').value = 'Nou comentari';
    await element('matchForm').listeners.submit({ preventDefault() {} });
    assert.equal(writes[0].body.revision, 'original');
    assert.equal(writes[0].body.matches[0].comments, 'Nou comentari');
    assert.equal(element('editor').hidden, true);
    assert.equal(element('status').textContent, 'Jornada desada.');
    await element('weekend').listeners.change({ target:{ value:'2026-10-24' } });
    assert.equal(element('weekend').value, '2026-10-24');
    assert.match(element('viewMatchesBtn').href, /weekend=2026-10-24/);
});

const f7Match = (id, time = '10:00', patch = {}) => ({ ...match, id, time, format:'F7', local_locker:'', visitor_locker:'', veo:false, field:'dret', ...patch });

test('Franges: durades, solapament parcial, límits exactes i canvi de dia', () => {
    const f7 = f7Match('first');
    assert.deepEqual(D.endTime(f7), { date:weekend, time:'11:30' });
    assert.deepEqual(D.endTime(match), { date:weekend, time:'18:00' });
    assert.equal(D.overlaps(f7, f7Match('second', '11:29')), true);
    assert.equal(D.overlaps(f7, f7Match('second', '11:30')), false);
    assert.equal(D.overlaps(match, { ...match, id:'second', time:'17:59' }), true);
    assert.equal(D.overlaps(match, { ...match, id:'second', time:'18:00' }), false);
    assert.equal(D.overlaps(f7, { ...f7, date:'2026-10-18' }), false);
    const late = f7Match('late', '23:30');
    assert.deepEqual(D.endTime(late), { date:'2026-10-18', time:'01:00' });
    assert.equal(D.overlaps(late, f7Match('next-day', '00:30', { date:'2026-10-18' })), true);
});

test('Franges: capacitat F7/F11, camps, VEO i vestidors inclòs 1+2', () => {
    const first = f7Match('first', '10:00', { local_locker:'3', visitor_locker:'1+2', veo:true });
    const second = f7Match('second', '10:30', { local_locker:'5', visitor_locker:'6', field:'esquerre' });
    assert.doesNotThrow(() => D.validateSchedule([first, second]));
    assert.throws(() => D.validateSchedule([first, { ...second, field:'dret' }]), /camps diferents/);
    assert.throws(() => D.validateSchedule([first, { ...second, field:'' }]), /camps diferents/);
    assert.throws(() => D.validateSchedule([first, { ...second, veo:true }]), /VEO/);
    assert.doesNotThrow(() => D.validateSchedule([first, { ...second, visitor_locker:'2' }]));
    assert.throws(() => D.validateSchedule([first, second, f7Match('third', '11:00')]), /dos partits de F7/);
    assert.throws(() => D.validateSchedule([first, { ...match, time:'11:00' }]), /F11 ocupa tot/);
    assert.throws(() => D.validateSchedule([match, { ...match, id:'second', time:'17:00' }]), /F11 ocupa tot/);
    assert.doesNotThrow(() => D.validateSchedule([match, { ...match, id:'second', time:'18:00' }]));
    assert.doesNotThrow(() => D.validateSchedule([first, { ...first, id:'second', time:'11:30' }]));
    // Un partit pot solapar-ne dos successius sense que hi hagi mai tres simultanis.
    assert.doesNotThrow(() => D.validateSchedule([
        f7Match('early', '09:00'), f7Match('middle', '10:00', { field:'esquerre' }), f7Match('late', '10:30')
    ]));
    assert.deepEqual(D.occupiedLockers(second, [first, second]).sort(), ['1','2','3']);
    assert.deepEqual(D.occupiedLockers({ ...second, time:'11:30' }, [first]), []);
});

test('API: rebutja conflictes de creació i modificació sense alterar la jornada desada', async () => {
    const { call } = serverFixture();
    const url = `/api/planificacio-jornada?weekend=${weekend}`;
    const first = f7Match('first', '10:00', { local_locker:'3', visitor_locker:'1+2', veo:true });
    const second = f7Match('second', '10:30', { local_locker:'5', visitor_locker:'6', field:'esquerre' });
    const created = await call('PUT', url, { matches:[first, second], revision:null });
    assert.equal(created.status, 200);
    for (const invalid of [
        [first, { ...second, veo:true }],
        [first, { ...second, field:'dret' }],
        [first, second, f7Match('third', '11:00')],
        [first, { ...match, time:'11:00' }]
    ]) {
        const result = await call('PUT', url, { matches:invalid, revision:created.body.revision });
        assert.equal(result.status, 400);
        assert.deepEqual((await call('GET', url)).body, created.body);
    }
});

test('Formulari: permet vestidors compartits, avisa i manté les altres restriccions', async () => {
    const peer = f7Match('peer', '10:00', { local_locker:'3', visitor_locker:'1+2', veo:true });
    const { element, writes } = await pageFixture(true, 'direccio', [peer]);
    element('newMatch').listeners.click();
    assert.equal(element('time').value, '11:30');
    element('format').value = 'F7';
    element('time').value = '10:30';
    element('team_id').value = '1';
    element('rival').value = 'Rival';
    element('field').value = 'esquerre';
    element('matchForm').listeners.input();
    const disabled = id => element(id).options.filter(option => option.disabled).map(option => option.value);
    assert.deepEqual(disabled('local_locker'), []);
    assert.deepEqual(disabled('field').sort(), ['', 'dret']);
    assert.equal(element('veo').disabled, true);
    element('visitor_locker').value = '2';
    element('matchForm').listeners.input();
    assert.match(element('visitorSharedNotes').textContent, /Vestidor 2 compartit amb CF Rival/);
    await element('matchForm').listeners.submit({ preventDefault() {} });
    assert.equal(writes.length, 1);
    // En editar, els recursos del mateix partit no es consideren ocupats.
    await element('matches').listeners.click({ target:{ closest:() => ({ dataset:{ edit:'peer' } }) } });
    element('time').value = '08:00';
    element('matchForm').listeners.input();
    assert.equal(element('local_locker').options.find(option => option.value === '3').disabled, false);
    assert.equal(element('veo').disabled, false);
});

test('Avisos de vestidors: simètrics, múltiples, 1+2, observacions manuals i recàlcul', () => {
    const teams = [{ id:'1', name:'S12' }, { id:'2', name:'S9' }];
    const first = f7Match('first', '10:00', { team_id:'1', rival:'CF A', local_locker:'1+2', visitor_locker:'3', local_notes:'Entrada lateral' });
    const second = f7Match('second', '10:30', { team_id:'2', rival:'CF B', local_locker:'2', visitor_locker:'3', field:'esquerre' });
    const shared = D.withSharedLockerNotes([first, second], teams);
    assert.deepEqual(shared[0].local_shared_notes, ['Vestidor 2 compartit amb S9']);
    assert.deepEqual(shared[1].local_shared_notes, ['Vestidor 2 compartit amb S12']);
    assert.deepEqual(shared[0].visitor_shared_notes, ['Vestidor 3 compartit amb CF B']);
    assert.deepEqual(shared[1].visitor_shared_notes, ['Vestidor 3 compartit amb CF A']);
    assert.equal(D.teamNotes(shared[0], 'local'), 'Entrada lateral\nVestidor 2 compartit amb S9');
    assert.deepEqual(D.withSharedLockerNotes(shared, teams), shared);
    const moved = D.withSharedLockerNotes([shared[0], { ...shared[1], time:'11:30' }], teams);
    assert.deepEqual(moved[0].local_shared_notes, []);
    assert.deepEqual(moved[1].visitor_shared_notes, []);
    assert.equal(moved[0].local_notes, 'Entrada lateral');
    assert.deepEqual(D.withSharedLockerNotes([shared[0]], teams)[0].local_shared_notes, []);
    const sameMatch = D.withSharedLockerNotes([{ ...first, visitor_locker:'2' }], teams)[0];
    assert.deepEqual(sameMatch.local_shared_notes, ['Vestidor 2 compartit amb CF A']);
    assert.deepEqual(sameMatch.visitor_shared_notes, ['Vestidor 2 compartit amb S12']);
    // Una reserva conjunta pot compartir els dos vestidors amb diversos equips.
    const multi = D.withSharedLockerNotes([first, { ...second, local_locker:'1', visitor_locker:'2' }], teams);
    assert.deepEqual(multi[0].local_shared_notes, ['Vestidor 1 compartit amb S9', 'Vestidor 2 compartit amb CF B']);
});

test('API: desa avisos als dos equips i els elimina en canviar o esborrar l’assignació', async () => {
    const { call } = serverFixture();
    const url = `/api/planificacio-jornada?weekend=${weekend}`;
    const first = f7Match('first', '10:00', { local_locker:'3', local_notes:'Nota manual' });
    const second = f7Match('second', '10:30', { rival:'CF B', visitor_locker:'3', field:'esquerre' });
    const created = await call('PUT', url, { matches:[first, second], revision:null });
    assert.equal(created.status, 200);
    assert.deepEqual(created.body.matches[0].local_shared_notes, ['Vestidor 3 compartit amb CF B']);
    assert.deepEqual(created.body.matches[1].visitor_shared_notes, ['Vestidor 3 compartit amb Juvenil Femení']);
    const changed = await call('PUT', url, { matches:[created.body.matches[0], { ...created.body.matches[1], visitor_locker:'5' }], revision:created.body.revision });
    assert.equal(changed.status, 200);
    assert.deepEqual(changed.body.matches[0].local_shared_notes, []);
    assert.equal(changed.body.matches[0].local_notes, 'Nota manual');
    const reshared = await call('PUT', url, { matches:[first, second], revision:changed.body.revision });
    const deleted = await call('PUT', url, { matches:[reshared.body.matches[0]], revision:reshared.body.revision });
    assert.equal(deleted.status, 200);
    assert.deepEqual(deleted.body.matches[0].local_shared_notes, []);
    assert.equal(deleted.body.matches[0].local_notes, 'Nota manual');
});
