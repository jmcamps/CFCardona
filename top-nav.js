(function () {
    const inSections = window.location.pathname.includes('/seccions/') || window.location.pathname.includes('\\seccions\\');
    const base = inSections ? '..' : '.';

    const links = {
        logo: `${base}/Web jugadors/ESCUT CF CARDONA.jpeg`,
        home: `${base}/index.html`,
        estructura: `${base}/estructura.html`,
        horaris: `${base}/seccions/horari-entrenaments.html`,
        comissio: `${base}/seccions/comissio-esportiva.html`,
        senior: `${base}/seccions/senior.html`,
        primerEquip: `${base}/seccions/primer-equip.html`,
        filial: `${base}/seccions/filial.html`,
        futbolBase: `${base}/seccions/futbol-base.html`,
        futbolBaseMasculi: `${base}/seccions/futbol-base-masculi.html`,
        futbolBaseFemeni: `${base}/seccions/futbol-base-femeni.html`,
        f7: `${base}/seccions/f7.html`,
        f11: `${base}/seccions/f11.html`,
        minis: `${base}/seccions/minis.html`,
        s7: `${base}/seccions/s7.html`,
        s8: `${base}/seccions/s8.html`,
        s9: `${base}/seccions/s9.html`,
        s10: `${base}/seccions/s10.html`,
        s11: `${base}/seccions/s11.html`,
        s12: `${base}/seccions/s12.html`,
        s13: `${base}/seccions/s13.html`,
        s14: `${base}/seccions/s14.html`,
        s16: `${base}/seccions/s16.html`,
        juvenilMasculi: `${base}/seccions/juvenil-masculi.html`,
        aleviFemeni: `${base}/seccions/alevi-femeni.html`,
        infantilFemeni: `${base}/seccions/infantil-femeni.html`,
        cadetFemeni: `${base}/seccions/cadet-femeni.html`,
        juvenilFemeni: `${base}/seccions/juvenil-femeni.html`,
        scouting: `${base}/seccions/scouting.html`,
        captacioSenior: `${base}/seccions/captacio-senior.html`,
        captacioFutbolBase: `${base}/seccions/captacio-futbol-base.html`
    };

    const pathname = window.location.pathname.toLowerCase();
    const style = document.createElement('style');
    style.textContent = `
        .cf-topnav-wrap { max-width: 1200px; margin: 0 auto 1.25rem; position: sticky; top: 0.75rem; z-index: 40; }
        .cf-topnav {
            display: flex; align-items: center; justify-content: flex-start; gap: 0.9rem;
            background: rgba(15, 23, 42, 0.85); color: #fff;
            border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem;
            padding: 0.65rem 0.9rem; backdrop-filter: blur(10px);
            box-shadow: 0 12px 28px rgba(2,6,23,0.22);
        }
        .cf-brand { display: inline-flex; align-items: center; gap: 0.55rem; color: #fff; text-decoration: none; font-weight: 800; font-size: 0.9rem; margin-right: 0.2rem; }
        .cf-brand-logo { width: 34px; height: 34px; border-radius: 999px; object-fit: cover; border: 2px solid rgba(255,255,255,0.35); background:#fff; }
        .cf-nav { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }
        .cf-nav-link, .cf-nav-drop-btn {
            color: rgba(255,255,255,0.92); text-decoration: none; font-weight: 700; font-size: 0.82rem;
            border-radius: 0.65rem; padding: 0.45rem 0.7rem; border: 1px solid transparent; background: transparent;
        }
        .cf-nav-link:hover, .cf-nav-drop-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .cf-nav-link.active { background: rgba(239,68,68,0.22); border-color: rgba(239,68,68,0.3); color: #fff; }

        .cf-nav-dropdown { position: relative; }
        .cf-nav-drop-btn { cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; }
        .cf-nav-menu {
            position: absolute; left: 0; top: calc(100% + 0.5rem); min-width: 860px;
            background: #fff; border: 1px solid #e2e8f0; border-radius: 0.8rem;
            box-shadow: 0 12px 30px rgba(2,6,23,0.18); padding: 0.7rem;
            display: none;
        }
        .cf-nav-feature-grid { display: grid; grid-template-columns: repeat(2, minmax(260px, 1fr)); gap: 0.7rem; }
        .cf-nav-feature {
            display: block; text-decoration: none; color: #0f172a; border: 1px solid #e2e8f0;
            border-radius: 0.75rem; padding: 0.75rem 0.8rem; background: #fff;
            transition: all 0.2s;
        }
        .cf-nav-feature:hover { border-color: #fecaca; background: #fff5f5; transform: translateY(-1px); }
        .cf-nav-feature-title { display: block; font-size: 0.86rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem; }
        .cf-nav-feature-title .icon { margin-right: 0.35rem; }
        .cf-nav-feature-desc { display: block; font-size: 0.75rem; line-height: 1.4; color: #64748b; }
        .cf-nav-menu a {
            display: block; text-decoration: none; color: #0f172a; font-weight: 700; font-size: 0.82rem;
            padding: 0.45rem 0.55rem; border-radius: 0.55rem;
        }
        .cf-nav-menu a:hover { background: #f1f5f9; color: #d91d1d; }
        .cf-nav-dropdown.open .cf-nav-menu { display: block; }
        .cf-logout-btn {
            margin-left: auto;
            color: #fff;
            border: 1px solid rgba(255,255,255,0.25);
            background: rgba(255,255,255,0.08);
            border-radius: 0.6rem;
            font-weight: 800;
            font-size: 0.78rem;
            padding: 0.42rem 0.65rem;
            cursor: pointer;
        }
        .cf-logout-btn:hover { background: rgba(255,255,255,0.14); }

        .cf-fb-menu { min-width: 640px; }
        .cf-fb-grid { display:grid; grid-template-columns: repeat(3, minmax(170px, 1fr)); gap: 0.6rem; }
        .cf-fb-group-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; font-weight: 800; padding: 0.3rem 0.55rem; }

        .cf-nav-feature-list { margin-top: 0.55rem; display: grid; gap: 0.35rem; }
        .cf-nav-feature-sub {
            text-decoration: none; border: 1px solid #e2e8f0; border-radius: 0.6rem;
            padding: 0.5rem 0.55rem; background: #f8fafc; display: block;
        }
        .cf-nav-feature-sub:hover { border-color: #fecaca; background: #fff5f5; }
        .cf-nav-feature-sub-title { display:block; font-size: 0.8rem; font-weight: 800; color:#0f172a; margin-bottom: 0.15rem; }
        .cf-nav-feature-sub-desc { display:block; font-size: 0.72rem; color:#64748b; line-height: 1.35; }

        @media (max-width: 720px) {
            .cf-topnav { align-items: flex-start; flex-direction: column; }
            .cf-nav-menu { left: 0; right: auto; min-width: 280px; max-width: calc(100vw - 2rem); }
            .cf-nav-feature-grid { grid-template-columns: 1fr; }
            .cf-fb-grid { grid-template-columns: 1fr; }
        }
    `;

    const wrap = document.createElement('div');
    wrap.className = 'cf-topnav-wrap';

    const nav = document.createElement('nav');
    nav.className = 'cf-topnav';

    const isActive = (needle) => pathname.includes(needle);

    const futbolBaseMenuHtml = `
        <div class="cf-nav-dropdown" id="cf-nav-fb-dropdown">
            <button class="cf-nav-drop-btn" type="button" id="cf-nav-fb-btn">Estructura Futbol Base ▾</button>
            <div class="cf-nav-menu cf-fb-menu" id="cf-nav-fb-menu">
                <div class="cf-fb-grid">
                    <div>
                        <div class="cf-fb-group-title">General</div>
                        <a href="${links.futbolBase}">Futbol base</a>
                        <a href="${links.futbolBaseMasculi}">Futbol base masculí</a>
                        <a href="${links.futbolBaseFemeni}">Futbol base femení</a>
                    </div>
                    <div>
                        <div class="cf-fb-group-title">Masculí</div>
                        <a href="${links.f7}">Futbol 7</a>
                        <a href="${links.minis}">Minis</a>
                        <a href="${links.s7}">S7</a>
                        <a href="${links.s8}">S8</a>
                        <a href="${links.s9}">S9</a>
                        <a href="${links.s10}">S10</a>
                        <a href="${links.s11}">S11</a>
                        <a href="${links.s12}">S12</a>
                        <a href="${links.f11}">Futbol 11</a>
                        <a href="${links.s13}">S13</a>
                        <a href="${links.s14}">S14</a>
                        <a href="${links.s16}">S16</a>
                        <a href="${links.juvenilMasculi}">Juvenil masculí</a>
                    </div>
                    <div>
                        <div class="cf-fb-group-title">Femení</div>
                        <a href="${links.aleviFemeni}">Aleví femení</a>
                        <a href="${links.infantilFemeni}">Infantil femení</a>
                        <a href="${links.cadetFemeni}">Cadet femení</a>
                        <a href="${links.juvenilFemeni}">Juvenil femení</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    const seniorMenuHtml = `
        <div class="cf-nav-dropdown" id="cf-nav-senior-dropdown">
            <button class="cf-nav-drop-btn" type="button" id="cf-nav-senior-btn">Estructura Senior ▾</button>
            <div class="cf-nav-menu cf-fb-menu" id="cf-nav-senior-menu">
                <div class="cf-fb-grid" style="grid-template-columns: repeat(2, minmax(170px, 1fr));">
                    <div>
                        <div class="cf-fb-group-title">Senior</div>
                        <a href="${links.senior}">Vista Senior</a>
                        <a href="${links.captacioSenior}">Captació Senior</a>
                    </div>
                    <div>
                        <div class="cf-fb-group-title">Equips</div>
                        <a href="${links.primerEquip}">Primer equip</a>
                        <a href="${links.filial}">Filial</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    nav.innerHTML = `
        <a class="cf-brand" href="${links.home}">
            <img src="${links.logo}" alt="Escut CF Cardona" class="cf-brand-logo">
            <span>CF Cardona</span>
        </a>
        <div class="cf-nav">
            <a class="cf-nav-link ${isActive('/index.html') ? 'active' : ''}" href="${links.home}">Inici</a>
            <a class="cf-nav-link ${isActive('/estructura.html') ? 'active' : ''}" href="${links.estructura}">Estructura</a>
            <div class="cf-nav-dropdown" id="cf-nav-dropdown">
                <button class="cf-nav-drop-btn" type="button" id="cf-nav-drop-btn">Direcció esportiva ▾</button>
                <div class="cf-nav-menu" id="cf-nav-menu">
                    <div class="cf-nav-feature-grid">
                        <a class="cf-nav-feature" href="${links.horaris}">
                            <span class="cf-nav-feature-title"><span class="icon">🗓️</span>Horaris</span>
                            <span class="cf-nav-feature-desc">Planifica franges d’entrenament, camps i vestidors per cada equip.</span>
                        </a>
                        <a class="cf-nav-feature" href="${links.comissio}">
                            <span class="cf-nav-feature-title"><span class="icon">👥</span>Comissió esportiva</span>
                            <span class="cf-nav-feature-desc">Coordina decisions esportives, seguiment de rendiment i captació senior.</span>
                        </a>
                        <a class="cf-nav-feature" href="${links.senior}" id="cf-senior-entry">
                            <span class="cf-nav-feature-title"><span class="icon">⚽</span>Senior</span>
                            <span class="cf-nav-feature-desc">Gestiona estructura i contingut del Primer Equip i Filial.</span>
                        </a>
                        <a class="cf-nav-feature" href="${links.futbolBase}" id="cf-futbolbase-entry">
                            <span class="cf-nav-feature-title"><span class="icon">🎓</span>Futbol base</span>
                            <span class="cf-nav-feature-desc">Accedeix al model de formació, categories masculines i femenines.</span>
                        </a>
                        <a class="cf-nav-feature" href="${links.captacioSenior}">
                            <span class="cf-nav-feature-title"><span class="icon">🔎</span>Captació Senior</span>
                            <span class="cf-nav-feature-desc">Cartera i seguiment de perfils per Primer Equip i Filial.</span>
                        </a>
                        <a class="cf-nav-feature" href="${links.captacioFutbolBase}">
                            <span class="cf-nav-feature-title"><span class="icon">🧭</span>Captació Futbol Base</span>
                            <span class="cf-nav-feature-desc">Prospecció de talent per a les categories de formació.</span>
                        </a>
                    </div>
                </div>
            </div>
            ${seniorMenuHtml}
            ${futbolBaseMenuHtml}
            <button type="button" class="cf-logout-btn" id="cf-logout-btn">Tancar sessió</button>
        </div>
    `;

    wrap.appendChild(nav);
    document.head.appendChild(style);
    document.body.prepend(wrap);

    const drop = document.getElementById('cf-nav-dropdown');
    const btn = document.getElementById('cf-nav-drop-btn');
    btn.addEventListener('click', function () {
        drop.classList.toggle('open');
    });

    const fbDrop = document.getElementById('cf-nav-fb-dropdown');
    const fbBtn = document.getElementById('cf-nav-fb-btn');
    if (fbDrop && fbBtn) {
        fbBtn.addEventListener('click', function () {
            fbDrop.classList.toggle('open');
        });
    }

    const seniorDrop = document.getElementById('cf-nav-senior-dropdown');
    const seniorBtn = document.getElementById('cf-nav-senior-btn');
    if (seniorDrop && seniorBtn) {
        seniorBtn.addEventListener('click', function () {
            seniorDrop.classList.toggle('open');
        });
    }

    document.addEventListener('click', function (e) {
        if (!drop.contains(e.target)) {
            drop.classList.remove('open');
        }
        if (fbDrop && !fbDrop.contains(e.target)) {
            fbDrop.classList.remove('open');
        }
        if (seniorDrop && !seniorDrop.contains(e.target)) {
            seniorDrop.classList.remove('open');
        }
    });

    const logoutBtn = document.getElementById('cf-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function () {
            try {
                await fetch(`${base}/api/auth/logout`, { method: 'POST', credentials: 'same-origin' });
            } catch (_) {}
            window.location.href = `${base}/login.html`;
        });
    }
})();
