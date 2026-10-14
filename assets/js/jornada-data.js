(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.JornadaData = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const FIRST_WEEKEND = '2026-10-03';
    const LOCKERS = ['', '1', '2', '1+2', '3', '4', '5', '6'];
    function date(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) throw new Error('Data invàlida');
        const parsed = new Date(value + 'T12:00:00Z');
        if (!Number.isFinite(parsed.getTime()) || iso(parsed) !== value) throw new Error('Data invàlida');
        return parsed;
    }
    function iso(value) { return value.toISOString().slice(0, 10); }
    function addDays(value, days) {
        const parsed = date(value);
        parsed.setUTCDate(parsed.getUTCDate() + days);
        return iso(parsed);
    }
    function today(now = new Date()) {
        const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
        const get = type => parts.find(part => part.type === type).value;
        return `${get('year')}-${get('month')}-${get('day')}`;
    }
    // Dissabte d'aquesta setmana; durant el cap de setmana, el següent.
    function nextWeekend(now) {
        const current = today(now);
        const day = date(current).getUTCDay();
        return addDays(current, day === 6 ? 7 : day === 0 ? 6 : 6 - day);
    }
    function validateWeekend(value) {
        if (date(value).getUTCDay() !== 6 || value < FIRST_WEEKEND) throw new Error('Cal seleccionar un cap de setmana a partir del 3/10/2026');
        return value;
    }
    function weekendFor(value) {
        return addDays(value, -((date(value).getUTCDay() + 1) % 7));
    }
    function weekends(last) {
        validateWeekend(last);
        const values = [];
        for (let value = last; value >= FIRST_WEEKEND; value = addDays(value, -7)) values.push(value);
        return values;
    }
    function formatDate(value) {
        return new Intl.DateTimeFormat('ca-ES', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date(value));
    }
    function label(value) { return `${formatDate(value)} – ${formatDate(addDays(value, 1))}`; }
    function inferFormat(name) {
        const clean = String(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return /\bs(?:8|9|10|11|12)\b/.test(clean) || (/(alevi|cadet)/.test(clean) && /femen/.test(clean)) ? 'F7' : 'F11';
    }
    function duration(match) { return match.format === 'F7' ? 90 : 120; }
    function interval(match) {
        const [hours, minutes] = match.time.split(':').map(Number);
        const start = date(match.date).getTime() - 12 * 60 * 60 * 1000 + (hours * 60 + minutes) * 60000;
        return { start, end: start + duration(match) * 60000 };
    }
    function endTime(match) {
        const end = new Date(interval(match).end);
        return { date: iso(end), time: end.toISOString().slice(11, 16) };
    }
    // L'instant de final queda lliure per al següent partit.
    function overlaps(a, b) {
        const left = interval(a), right = interval(b);
        return left.start < right.end && right.start < left.end;
    }
    function lockerNumbers(value) { return value ? value.split('+') : []; }
    function occupiedLockers(candidate, matches) {
        return [...new Set(matches.filter(match => match.id !== candidate.id && overlaps(candidate, match))
            .flatMap(match => [...lockerNumbers(match.local_locker), ...lockerNumbers(match.visitor_locker)]))];
    }
    function validateSchedule(matches) {
        for (const current of matches) {
            // Comptar a cada inici evita confondre solapaments successius amb tres partits simultanis.
            const start = interval(current).start;
            const active = matches.filter(match => {
                const range = interval(match);
                return range.start <= start && start < range.end;
            });
            if (active.filter(match => match.format === 'F7').length > 2) throw new Error('Només hi pot haver dos partits de F7 simultanis.');
        }
        for (let i = 0; i < matches.length; i++) {
            const current = matches[i];
            for (let j = i + 1; j < matches.length; j++) {
                const other = matches[j];
                if (!overlaps(current, other)) continue;
                if (current.format === 'F11' || other.format === 'F11') throw new Error('Un partit de F11 ocupa tot el camp durant dues hores i no pot coincidir amb cap altre partit.');
                if (!current.field || !other.field || current.field === other.field) throw new Error('Dos partits de F7 simultanis han de tenir assignats camps diferents: dret i esquerre.');
                if (current.veo && other.veo) throw new Error('Només un dels partits simultanis pot gravar-se amb la VEO.');
            }
        }
        return matches;
    }
    // Els avisos automàtics es desen separats de les observacions manuals.
    function withSharedLockerNotes(matches, teams) {
        const result = matches.map(match => ({ ...match, local_shared_notes:[], visitor_shared_notes:[] }));
        const participants = result.flatMap(match => [
            { match, side:'local', name:teams.find(team => String(team.id) === match.team_id)?.name || `Equip ${match.team_id}`, lockers:lockerNumbers(match.local_locker) },
            { match, side:'visitor', name:match.rival, lockers:lockerNumbers(match.visitor_locker) }
        ]);
        for (let i = 0; i < participants.length; i++) {
            const current = participants[i];
            for (let j = i + 1; j < participants.length; j++) {
                const other = participants[j];
                if (current.match.id !== other.match.id && !overlaps(current.match, other.match)) continue;
                for (const locker of current.lockers.filter(value => other.lockers.includes(value))) {
                    current.match[`${current.side}_shared_notes`].push(`Vestidor ${locker} compartit amb ${other.name}`);
                    other.match[`${other.side}_shared_notes`].push(`Vestidor ${locker} compartit amb ${current.name}`);
                }
            }
        }
        result.forEach(match => {
            match.local_shared_notes = [...new Set(match.local_shared_notes)];
            match.visitor_shared_notes = [...new Set(match.visitor_shared_notes)];
        });
        return result;
    }
    function teamNotes(match, side) {
        return [match[`${side}_notes`], ...(match[`${side}_shared_notes`] || [])].filter(Boolean).join('\n');
    }
    function normalizeMatches(rows, weekend) {
        validateWeekend(weekend);
        if (!Array.isArray(rows) || rows.length > 100) throw new Error('Llista de partits invàlida (màxim 100)');
        const ids = new Set();
        const text = (value, max = 2000) => {
            if (typeof value !== 'string' || value.length > max) throw new Error('Text invàlid o massa llarg');
            return value.trim();
        };
        return rows.map(row => {
            if (!row || typeof row !== 'object') throw new Error('Partit invàlid');
            const id = text(row.id, 100);
            if (!id || ids.has(id)) throw new Error('Identificador de partit duplicat o buit');
            ids.add(id);
            const team_id = text(row.team_id, 100);
            const rival = text(row.rival, 200);
            if (!team_id || !rival) throw new Error('Cal indicar equip local i rival');
            const matchDate = text(row.date, 10);
            if (![weekend, addDays(weekend, 1)].includes(matchDate)) throw new Error('El partit ha de ser dissabte o diumenge de la jornada seleccionada');
            const time = text(row.time, 5);
            if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Hora invàlida');
            if (!['F7', 'F11'].includes(row.format)) throw new Error('Modalitat invàlida');
            if (!LOCKERS.includes(row.local_locker) || !LOCKERS.includes(row.visitor_locker)) throw new Error('Vestidor invàlid');
            if (row.format === 'F11' && [row.local_locker, row.visitor_locker].some(locker => ['1', '2'].includes(locker))) throw new Error('Per a F11 cal assignar els vestidors petits conjuntament: 1+2');
            if (typeof row.veo !== 'boolean') throw new Error('Opció VEO invàlida');
            if (!['', 'dret', 'esquerre'].includes(row.field)) throw new Error('Camp invàlid');
            return { id, team_id, rival, date: matchDate, time, format: row.format,
                local_locker: row.local_locker, visitor_locker: row.visitor_locker,
                local_notes: text(row.local_notes), visitor_notes: text(row.visitor_notes),
                veo: row.veo, field: row.format === 'F7' ? row.field : '', comments: text(row.comments) };
        }).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    }
    return { FIRST_WEEKEND, LOCKERS, date, addDays, today, nextWeekend, weekendFor, validateWeekend, weekends, formatDate, label, inferFormat, normalizeMatches,
        duration, interval, endTime, overlaps, lockerNumbers, occupiedLockers, validateSchedule, withSharedLockerNotes, teamNotes };
});
