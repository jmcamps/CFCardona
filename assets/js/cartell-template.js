(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./jornada-data'));
    else root.CartellTemplate = factory(root.JornadaData);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (D) {
    'use strict';
    const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
    const assets = '../assets/images/';
    function image(file, alt, className = '') { return `<img src="${assets}${encodeURIComponent(file)}" alt="${esc(alt)}" class="${className}">`; }
    function lockerIcon() {
        return '<svg class="locker-icon" viewBox="0 0 32 28" aria-hidden="true"><path d="M13 7a3 3 0 1 1 4 3c-1 1-1 2-1 3L3 23c-1 1 0 2 1 2h24c1 0 2-1 1-2L16 13" fill="none" stroke="#991b1b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    function locker(value) {
        return `<div class="locker-assignment">${lockerIcon()}<span class="locker-tag ${value ? '' : 'pending'}">${value ? `Vestidor ${esc(value)}` : 'Vestidor pendent'}</span></div>`;
    }
    function team(name, value, notes) {
        return `<div class="poster-team"><div class="team-heading"><strong>${esc(name)}</strong></div>${locker(value)}${notes ? `<p class="team-notes">${esc(notes)}</p>` : ''}</div>`;
    }
    function fullPitch() {
        return '<svg class="pitch-full" viewBox="0 0 54 70" role="img" aria-label="Camp complet F11"><rect width="54" height="70" rx="5" fill="#137b37"/><g fill="none" stroke="white" stroke-width="1.4"><rect x="4" y="4" width="46" height="62"/><path d="M4 35h46M15 4v12h24V4M15 66V54h24v12M22 4v5h10V4M22 66v-5h10v5"/><circle cx="27" cy="35" r="7"/></g></svg>';
    }
    function pitch(field) {
        const number = field === 'esquerre' ? '2' : '1';
        return `<span class="pitch-badge" role="img" aria-label="Camp ${field}, ${number}">${image('camp_dret.png', '', `pitch-half ${field === 'esquerre' ? 'mirror' : ''}`)}<strong>${number}</strong></span>`;
    }
    function formatIcon(format) {
        const number = format === 'F7' ? '7' : '11';
        return `<svg class="format-icon" viewBox="0 0 44 28" role="img" aria-label="${esc(format)}"><rect x="1" y="1" width="42" height="26" rx="5" fill="#f8fafc" stroke="#94a3b8"/><g stroke="#475569" fill="none" stroke-width="1"><circle cx="11" cy="14" r="7"/><path d="m11 10 4 3-2 5H9l-2-5zM11 7v3M18 14l-3-1M4 14l3-1M7 20l2-2M15 20l-2-2"/></g><text x="30" y="19" text-anchor="middle" fill="#0f172a" font-family="Arial,sans-serif" font-weight="bold" font-size="14">${number}</text></svg>`;
    }
    function options(match) {
        const field = match.format === 'F11' ? fullPitch() : match.field ? pitch(match.field)
            : '<svg class="pitch-pending" viewBox="0 0 24 28" role="img" aria-label="Camp pendent"><rect x="1" y="1" width="22" height="26" rx="3" fill="#f8fafc" stroke="#94a3b8" stroke-dasharray="3 2"/><text x="12" y="19" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#64748b">?</text></svg>';
        return `<div class="poster-options">${match.veo ? `<span class="veo-mark">${image('veo.jpeg', 'Gravació VEO')}</span>` : ''}${field}${formatIcon(match.format)}</div>`;
    }
    function weekendLabel(weekend) {
        const sunday = D.addDays(weekend, 1);
        const fmt = value => new Intl.DateTimeFormat('ca-ES', { timeZone:'UTC', day:'numeric', month:'long', year:'numeric' }).format(D.date(value));
        if (weekend.slice(0, 7) === sunday.slice(0, 7)) return fmt(sunday).replace(/^\d+/, `${D.date(weekend).getUTCDate()} i ${D.date(sunday).getUTCDate()}`);
        return `${fmt(weekend)} – ${fmt(sunday)}`;
    }
    function render(weekend, matches, teams) {
        const rows = D.withSharedLockerNotes(matches, teams).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
        return `<div class="poster-watermark" aria-hidden="true">${image('ESCUT CF CARDONA.jpeg', '')}</div>
            <header class="poster-header">${image('ESCUT CF CARDONA.jpeg', 'Escut CF Cardona', 'club-crest')}<div><p class="club-name">CF CARDONA</p><h1>PARTITS <span>A CASA</span></h1><p class="weekend-banner">${esc(weekendLabel(weekend))}</p></div></header>
            <div class="column-labels"><span>Equip local</span><span>Dia i hora</span><span>Equip visitant</span></div>
            <div class="poster-matches">${rows.map(match => {
                const name = teams.find(team => String(team.id) === match.team_id)?.name || `Equip ${match.team_id}`;
                const day = new Intl.DateTimeFormat('ca-ES', { timeZone:'UTC', weekday:'long' }).format(D.date(match.date));
                return `<section class="poster-match" aria-label="${esc(name)} contra ${esc(match.rival)}">
                    ${team(name, match.local_locker, D.teamNotes(match, 'local'))}
                    <div class="poster-time"><strong class="weekday">${esc(day)}</strong><span class="match-date">${esc(D.formatDate(match.date).slice(0, 5))}</span><strong class="kickoff">${esc(match.time)}<small>h</small></strong>${options(match)}</div>
                    ${team(match.rival, match.visitor_locker, D.teamNotes(match, 'visitor'))}
                    ${match.comments ? `<p class="match-comments"><strong>Observacions del partit:</strong> ${esc(match.comments)}</p>` : ''}
                </section>`;
            }).join('')}</div>
            <footer class="poster-footer"><div class="legend"><div>${image('veo.jpeg', '', 'legend-veo')}<span>Gravació<br><strong>VEO</strong></span></div><div>${pitch('dret')}<span>Camp<br><strong>dret</strong></span></div><div>${pitch('esquerre')}<span>Camp<br><strong>esquerre</strong></span></div><div>${formatIcon('F7')}${formatIcon('F11')}<span><strong>F7 / F11</strong></span></div><div>${lockerIcon()}<span><strong>Vestidor</strong></span></div></div><p class="poster-note">Vestidors 1+2: assignació conjunta dels dos vestidors. En cas de dubte, consulteu el responsable de la jornada.</p><p class="club-footer">CLUB DE FUTBOL CARDONA · ENS VEIEM AL CAMP!</p></footer>`;
    }
    return { render, weekendLabel };
});
