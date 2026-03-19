(function () {
    const pathnameRaw = window.location.pathname || '';
    const pathname = pathnameRaw.toLowerCase();
    const inSections = pathname.includes('/seccions/');
    const base = inSections ? '..' : '.';

    const links = {
        logo: `${base}/assets/images/ESCUT CF CARDONA.jpeg`,
        home: `${base}/index.html`,
        estructura: `${base}/index.html`,
        horaris: `${base}/seccions/horari-setmanal.html`,
        comissio: `${base}/seccions/comissio-esportiva.html`,
        staffClub: `${base}/seccions/staff-club.html`,
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

    const style = document.createElement('style');
    style.textContent = `
        body.cf-nav-open { overflow: hidden; }

        .cf-topnav-wrap {
            max-width: 960px;
            margin: 0 auto 1.25rem;
            position: sticky;
            top: 0.75rem;
            z-index: 40;
        }

        .cf-topnav,
        .cf-topnav * {
            box-sizing: border-box;
        }

        .cf-topnav {
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.9rem;
            background: rgba(15, 23, 42, 0.88);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 1rem;
            padding: 0.65rem 0.9rem;
            backdrop-filter: blur(10px);
            box-shadow: 0 12px 28px rgba(2,6,23,0.22);
        }

        .cf-brand {
            display: inline-flex;
            align-items: center;
            gap: 0.55rem;
            color: #fff;
            text-decoration: none;
            font-weight: 800;
            font-size: 0.9rem;
            margin-right: 0.2rem;
            flex-shrink: 0;
        }

        .cf-brand-logo {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            object-fit: cover;
            border: 2px solid rgba(255,255,255,0.35);
            background: #fff;
        }

        .cf-mobile-open-btn,
        .cf-mobile-backdrop {
            display: none;
        }

        .cf-nav {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            width: 100%;
            min-width: 0;
            flex-wrap: wrap;
        }

        .cf-nav-link,
        .cf-nav-drop-btn {
            color: rgba(255,255,255,0.92);
            text-decoration: none;
            font-weight: 700;
            font-size: 0.82rem;
            border-radius: 0.65rem;
            padding: 0.45rem 0.7rem;
            border: 1px solid transparent;
            background: transparent;
            line-height: 1.2;
        }

        .cf-nav-link:hover,
        .cf-nav-drop-btn:hover {
            background: rgba(255,255,255,0.08);
            color: #fff;
        }

        .cf-nav-link.active {
            background: rgba(239,68,68,0.22);
            border-color: rgba(239,68,68,0.3);
            color: #fff;
        }

        .cf-nav-dropdown.open > .cf-nav-drop-btn,
        .cf-nav-dropdown.has-active > .cf-nav-drop-btn {
            background: rgba(239,68,68,0.22);
            border-color: rgba(239,68,68,0.3);
            color: #fff;
        }

        .cf-nav-dropdown {
            position: relative;
        }

        #cf-nav-fb-dropdown {
            position: static;
        }

        .cf-nav-drop-btn {
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
        }

        .cf-caret {
            font-size: 0.72rem;
            opacity: 0.9;
        }

        .cf-nav-menu {
            position: absolute;
            left: 0;
            top: calc(100% + 0.5rem);
            min-width: 0;
            max-width: calc(100vw - 1rem);
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 0.8rem;
            box-shadow: 0 12px 30px rgba(2,6,23,0.18);
            padding: 0.7rem;
            display: none;
            z-index: 60;
        }

        .cf-nav-dropdown.open > .cf-nav-menu {
            display: block;
        }

        #cf-nav-menu {
            width: min(92vw, 540px);
        }

        #cf-nav-senior-menu {
            width: min(92vw, 500px);
        }

        #cf-nav-fb-menu {
            left: 0;
            right: 0;
            width: auto;
            max-width: none;
            max-height: min(78vh, 780px);
            overflow-y: auto;
        }

        .cf-nav-feature-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.7rem;
        }

        .cf-nav-feature {
            display: block;
            text-decoration: none;
            color: #0f172a;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            padding: 0.75rem 0.8rem;
            background: #fff;
            transition: all 0.2s;
            min-width: 0;
        }

        .cf-nav-feature:hover {
            border-color: #fecaca;
            background: #fff5f5;
            transform: translateY(-1px);
        }

        .cf-nav-feature-title {
            display: block;
            font-size: 0.86rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.25rem;
        }

        .cf-nav-feature-title .icon {
            margin-right: 0.35rem;
        }

        .cf-nav-feature-desc {
            display: block;
            font-size: 0.75rem;
            line-height: 1.4;
            color: #64748b;
        }

        .cf-nav-feature-list {
            margin-top: 0.55rem;
            display: grid;
            gap: 0.35rem;
        }

        .cf-nav-feature-sub {
            text-decoration: none;
            border: 1px solid #e2e8f0;
            border-radius: 0.6rem;
            padding: 0.5rem 0.55rem;
            background: #f8fafc;
            display: block;
            min-width: 0;
        }

        .cf-nav-feature-sub:hover {
            border-color: #fecaca;
            background: #fff5f5;
        }

        .cf-nav-feature-sub-title {
            display: block;
            font-size: 0.8rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.15rem;
            overflow-wrap: anywhere;
            word-break: break-word;
        }

        .cf-nav-feature-sub-desc {
            display: block;
            font-size: 0.72rem;
            color: #64748b;
            line-height: 1.35;
            overflow-wrap: anywhere;
            word-break: break-word;
        }

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

        .cf-logout-btn:hover {
            background: rgba(255,255,255,0.14);
        }

        .cf-page-title-wrap {
            max-width: 960px;
            margin: 0 auto 1.1rem;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 0.9rem;
            padding: 1rem 1.15rem;
            box-shadow: 0 4px 10px rgba(2,6,23,0.06);
        }

        .cf-page-title {
            color: #d91d1d;
            font-size: 1.35rem;
            font-weight: 800;
            line-height: 1.2;
            letter-spacing: 0.01em;
            margin: 0;
        }

        @media (min-width: 761px) {
            .card > h2 {
                margin-top: 0;
                margin-bottom: 1.35rem;
                padding-bottom: 0.72rem;
                line-height: 1.25;
            }

            .card > .section-head {
                margin-bottom: 1.35rem;
                padding-bottom: 0.72rem;
            }

            .card > .section-head h2 {
                margin-bottom: 0;
                padding-bottom: 0;
                line-height: 1.25;
            }

            .table-wrap,
            .players-table-wrap {
                overflow: auto;
                border-radius: 0.8rem;
                background: #fff;
            }

            .plantilla-table,
            .players-table {
                min-width: 760px;
            }

            .horari-table {
                min-width: 560px;
            }

            :is(.plantilla-table, .horari-table, .players-table) {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                background: #fff;
                border: 1px solid #e2e8f0;
                border-radius: 0.8rem;
            }

            .table-wrap :is(.plantilla-table, .horari-table, .players-table),
            .players-table-wrap :is(.plantilla-table, .horari-table, .players-table) {
                border-radius: 0;
            }

            :is(.plantilla-table, .horari-table, .players-table) th,
            :is(.plantilla-table, .horari-table, .players-table) td {
                border-bottom: 1px solid #e2e8f0;
                text-align: left;
                padding: 0.72rem 0.75rem;
                vertical-align: middle;
                font-size: 0.82rem;
                line-height: 1.25;
                white-space: normal;
            }

            :is(.plantilla-table, .horari-table) tbody tr {
                height: 3.05rem;
            }

            :is(.plantilla-table, .horari-table) td > :is(input[type=text], input[type=tel], input[type=date], input[type=time], input[type=number], input[type=url], select) {
                height: 2.1rem;
                min-height: 2.1rem;
                padding-top: 0.4rem;
                padding-bottom: 0.4rem;
                font-size: 0.82rem;
                line-height: 1.2;
            }

            :is(.plantilla-table, .horari-table) td input[type=checkbox] {
                width: 1rem;
                height: 1rem;
            }

            :is(.plantilla-table, .horari-table) th,
            .players-table th:not(.group-title) {
                background: #fee2e2;
                color: #d91d1d;
                font-weight: 700;
                font-size: 0.78rem;
            }

            :is(.plantilla-table, .horari-table, .players-table) tr:last-child td {
                border-bottom: 0;
            }

            :is(.plantilla-table, .horari-table) tbody tr:hover,
            .players-table tbody tr:not(.group-row):not(.group-empty-row):hover {
                background: #fff5f5;
            }

            :is(.plantilla-table, .horari-table, .players-table) th:first-child {
                border-top-left-radius: 0.8rem;
            }

            :is(.plantilla-table, .horari-table, .players-table) th:last-child {
                border-top-right-radius: 0.8rem;
            }
        }

        @media (max-width: 760px) {
            .cf-topnav-wrap {
                position: static;
                margin: 0 auto 1rem;
                top: auto;
            }

            .cf-topnav {
                gap: 0.6rem;
                padding: 0.6rem 0.75rem;
                z-index: 1190;
            }

            .cf-brand {
                font-size: 0.88rem;
            }

            .cf-brand-logo {
                width: 32px;
                height: 32px;
            }

            .cf-mobile-open-btn {
                display: inline-flex;
                margin-left: auto;
                border: 1px solid rgba(255,255,255,0.22);
                background: rgba(255,255,255,0.1);
                color: #fff;
                border-radius: 0.65rem;
                font-weight: 800;
                font-size: 0.82rem;
                padding: 0.45rem 0.68rem;
                cursor: pointer;
            }

            .cf-topnav-wrap.mobile-open .cf-mobile-open-btn {
                position: fixed;
                top: 0.95rem;
                left: 0.95rem;
                right: auto;
                margin-left: 0;
                z-index: 1210;
                border-color: #cbd5e1;
                background: #fff;
                color: #0f172a;
                font-weight: 800;
                font-size: 0.82rem;
                padding: 0.45rem 0.68rem;
                border-radius: 0.65rem;
            }

            .cf-mobile-backdrop {
                display: block;
                position: fixed;
                inset: 0;
                z-index: 1180;
                background: rgba(15,23,42,0.42);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.22s ease;
            }

            .cf-topnav-wrap.mobile-open .cf-mobile-backdrop {
                opacity: 1;
                pointer-events: auto;
            }

            .cf-nav {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100vw;
                max-width: 100vw;
                height: 100dvh;
                z-index: 1200;
                background: #f1f5f9;
                border: none;
                border-radius: 0;
                box-shadow: 0 18px 36px rgba(2,6,23,0.24);
                display: flex;
                flex-direction: column;
                align-items: stretch;
                gap: 0.55rem;
                padding: 3.7rem 0.95rem 0.95rem;
                overflow-y: auto;
                overflow-x: hidden;
                transform: translateX(100%);
                transition: transform 0.23s ease;
                pointer-events: none;
                flex-wrap: nowrap;
            }

            .cf-topnav-wrap.mobile-open .cf-nav {
                transform: translateX(0);
                pointer-events: auto;
            }

            .cf-nav-dropdown {
                width: 100%;
                position: relative;
            }

            #cf-nav-fb-dropdown {
                position: relative;
            }

            .cf-nav-link,
            .cf-nav-drop-btn,
            .cf-logout-btn {
                width: 100%;
                text-align: left;
                color: #1f2937;
                border: 1px solid #d1dbe6;
                background: #fff;
                border-radius: 0.7rem;
                padding: 0.7rem 0.75rem;
                font-size: 0.9rem;
            }

            .cf-nav-link:hover,
            .cf-nav-drop-btn:hover,
            .cf-logout-btn:hover {
                background: #e9eef5;
                color: #0f172a;
            }

            .cf-nav-link.active {
                background: #fee2e2;
                border-color: #fecaca;
                color: #991b1b;
            }

            .cf-nav-dropdown.open > .cf-nav-drop-btn,
            .cf-nav-dropdown.has-active > .cf-nav-drop-btn {
                background: #fee2e2;
                border-color: #fecaca;
                color: #991b1b;
            }

            .cf-nav-drop-btn {
                justify-content: space-between;
            }

            .cf-nav-menu {
                position: static;
                left: auto;
                right: auto;
                top: auto;
                min-width: 0;
                width: 100%;
                max-width: none;
                margin-top: 0.45rem;
                box-shadow: none;
                border-radius: 0.75rem;
                padding: 0.55rem;
                background: #f1f5f9;
                overflow-x: hidden;
                transform: none !important;
                max-height: none;
                overflow-y: visible;
            }

            #cf-nav-fb-menu {
                left: auto;
                right: auto;
                width: 100%;
                max-width: none;
            }

            .cf-nav-feature-grid {
                grid-template-columns: 1fr !important;
            }

            .cf-nav-feature:hover {
                transform: none;
            }

            .cf-nav-menu,
            .cf-nav-feature,
            .cf-nav-feature-list,
            .cf-nav-feature-sub {
                min-width: 0;
                max-width: 100%;
            }

            .cf-logout-btn {
                margin-left: 0;
                margin-top: 0.15rem;
                text-align: center;
            }

            .cf-page-title-wrap {
                margin: 0 auto 1rem;
                padding: 0.9rem 1rem;
            }

            .cf-page-title {
                font-size: 1.15rem;
            }
        }
    `;

    const wrap = document.createElement('div');
    wrap.className = 'cf-topnav-wrap';

    const nav = document.createElement('nav');
    nav.className = 'cf-topnav';

    const futbolBaseMenuHtml = `
        <div class="cf-nav-dropdown" id="cf-nav-fb-dropdown">
            <button class="cf-nav-drop-btn" type="button" id="cf-nav-fb-btn">Futbol base <span class="cf-caret">▾</span></button>
            <div class="cf-nav-menu" id="cf-nav-fb-menu">
                <div class="cf-nav-feature-grid">
                    <div class="cf-nav-feature">
                        <span class="cf-nav-feature-title"><span class="icon">🛡️</span>Base Masculí</span>
                        <span class="cf-nav-feature-desc">Accés a totes les categories masculines de formació.</span>
                        <div class="cf-nav-feature-list">
                            <a class="cf-nav-feature-sub" href="${links.minis}">
                                <span class="cf-nav-feature-sub-title">Minis</span>
                                <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2021 i 2022.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.s7}">
                                <span class="cf-nav-feature-sub-title">S7</span>
                                <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2020.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.s8}">
                                <span class="cf-nav-feature-sub-title">S8</span>
                                <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2019.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.s9}">
                                <span class="cf-nav-feature-sub-title">S9</span>
                                <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2018.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.s10}">
                                <span class="cf-nav-feature-sub-title">S10</span>
                                <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2017.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.s11}">
                                <span class="cf-nav-feature-sub-title">S11</span>
                                <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2016.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.s12}">
                                <span class="cf-nav-feature-sub-title">S12</span>
                                <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2015.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.s13}">
                                <span class="cf-nav-feature-sub-title">S13</span>
                                <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2014.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.s14}">
                                <span class="cf-nav-feature-sub-title">S14</span>
                                <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2013.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.s16}">
                                <span class="cf-nav-feature-sub-title">S16</span>
                                <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2011 i 2012.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.juvenilMasculi}">
                                <span class="cf-nav-feature-sub-title">Juvenil Masculí</span>
                                <span class="cf-nav-feature-sub-desc">Jugadors nascuts el 2008, 2009 i 2010.</span>
                            </a>
                        </div>
                    </div>
                    <div class="cf-nav-feature">
                        <span class="cf-nav-feature-title"><span class="icon">🌸</span>Base Femení</span>
                        <span class="cf-nav-feature-desc">Accés a totes les categories femenines de formació.</span>
                        <div class="cf-nav-feature-list">
                            <a class="cf-nav-feature-sub" href="${links.aleviFemeni}">
                                <span class="cf-nav-feature-sub-title">Aleví Femení</span>
                                <span class="cf-nav-feature-sub-desc">Jugadores nascudes el 2015 i 2016.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.infantilFemeni}">
                                <span class="cf-nav-feature-sub-title">Infantil Femení</span>
                                <span class="cf-nav-feature-sub-desc">Jugadores nascudes el 2013 i 2014.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.cadetFemeni}">
                                <span class="cf-nav-feature-sub-title">Cadet Femení</span>
                                <span class="cf-nav-feature-sub-desc">Jugadores nascudes el 2011 i 2012.</span>
                            </a>
                            <a class="cf-nav-feature-sub" href="${links.juvenilFemeni}">
                                <span class="cf-nav-feature-sub-title">Juvenil Femení</span>
                                <span class="cf-nav-feature-sub-desc">Jugadores nascudes el 2008, 2009 i 2010.</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const seniorMenuHtml = `
        <div class="cf-nav-dropdown" id="cf-nav-senior-dropdown">
            <button class="cf-nav-drop-btn" type="button" id="cf-nav-senior-btn">Senior <span class="cf-caret">▾</span></button>
            <div class="cf-nav-menu" id="cf-nav-senior-menu">
                <div class="cf-nav-feature-grid">
                    <a class="cf-nav-feature" href="${links.primerEquip}">
                        <span class="cf-nav-feature-title"><span class="icon">⚽</span>Primer equip</span>
                        <span class="cf-nav-feature-desc">Planificació de plantilla, staff i seguiment esportiu del primer equip.</span>
                    </a>
                    <a class="cf-nav-feature" href="${links.filial}">
                        <span class="cf-nav-feature-title"><span class="icon">🛡️</span>Filial</span>
                        <span class="cf-nav-feature-desc">Planificació de plantilla, staff i seguiment esportiu del filial.</span>
                    </a>
                </div>
            </div>
        </div>
    `;

    nav.innerHTML = `
        <a class="cf-brand" href="${links.home}">
            <img src="${links.logo}" alt="Escut CF Cardona" class="cf-brand-logo">
            <span>CF Cardona</span>
        </a>

        <button type="button" class="cf-mobile-open-btn" id="cf-mobile-open-btn" aria-expanded="false" aria-label="Obrir menú" aria-controls="cf-main-nav">Menú ☰</button>
        <button type="button" class="cf-mobile-backdrop" id="cf-mobile-backdrop" aria-label="Tancar menú"></button>

        <div class="cf-nav" id="cf-main-nav" aria-hidden="false">
            <a class="cf-nav-link cf-nav-link-home" href="${links.home}">Inici</a>

            <div class="cf-nav-dropdown" id="cf-nav-dropdown">
                <button class="cf-nav-drop-btn" type="button" id="cf-nav-drop-btn">Direcció esportiva <span class="cf-caret">▾</span></button>
                <div class="cf-nav-menu" id="cf-nav-menu">
                    <div class="cf-nav-feature-grid">
                        <a class="cf-nav-feature" href="${links.horaris}">
                            <span class="cf-nav-feature-title"><span class="icon">🗓️</span>Horaris</span>
                            <span class="cf-nav-feature-desc">Planifica franges d’entrenament, camps i vestidors per cada equip.</span>
                        </a>
                        <a class="cf-nav-feature" href="${links.comissio}">
                            <span class="cf-nav-feature-title"><span class="icon">👥</span>Comissió esportiva</span>
                            <span class="cf-nav-feature-desc">Coordina decisions esportives i seguiment de rendiment.</span>
                        </a>
                        <a class="cf-nav-feature" href="${links.staffClub}" id="cf-staff-club-entry">
                            <span class="cf-nav-feature-title"><span class="icon">🧩</span>Gestió staff club</span>
                            <span class="cf-nav-feature-desc">Alta, baixa i assignació dels membres del staff als equips.</span>
                        </a>
                        <a class="cf-nav-feature" href="${links.captacioSenior}" id="cf-scouting-senior-entry">
                            <span class="cf-nav-feature-title"><span class="icon">🔍</span>Captació Senior</span>
                            <span class="cf-nav-feature-desc">Cartera i seguiment de perfils per Primer Equip i Filial.</span>
                        </a>
                        <a class="cf-nav-feature" href="${links.captacioFutbolBase}" id="cf-scouting-base-entry">
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

    const filename = pathname.split('/').pop() || '';
    const teamPageTitles = {
        'primer-equip.html': 'Primer Equip',
        'filial.html': 'Filial',
        'minis.html': 'Minis',
        's7.html': 'S7',
        's8.html': 'S8',
        's9.html': 'S9',
        's10.html': 'S10',
        's11.html': 'S11',
        's12.html': 'S12',
        's13.html': 'S13',
        's14.html': 'S14',
        's16.html': 'S16',
        'juvenil-masculi.html': 'Juvenil Masculí',
        'alevi-femeni.html': 'Aleví Femení',
        'infantil-femeni.html': 'Infantil Femení',
        'cadet-femeni.html': 'Cadet Femení',
        'juvenil-femeni.html': 'Juvenil Femení',
        'staff-club.html': 'Gestió Staff Club'
    };

    const teamTitle = teamPageTitles[filename];
    if (teamTitle) {
        const titleWrap = document.createElement('div');
        titleWrap.className = 'cf-page-title-wrap';
        titleWrap.innerHTML = `<h1 class="cf-page-title">${teamTitle}</h1>`;
        wrap.insertAdjacentElement('afterend', titleWrap);
    }

    const drop = document.getElementById('cf-nav-dropdown');
    const btn = document.getElementById('cf-nav-drop-btn');
    const fbDrop = document.getElementById('cf-nav-fb-dropdown');
    const fbBtn = document.getElementById('cf-nav-fb-btn');
    const seniorDrop = document.getElementById('cf-nav-senior-dropdown');
    const seniorBtn = document.getElementById('cf-nav-senior-btn');
    const logoutBtn = document.getElementById('cf-logout-btn');

    const mainNav = document.getElementById('cf-main-nav');
    const mobileOpenBtn = document.getElementById('cf-mobile-open-btn');
    const mobileBackdrop = document.getElementById('cf-mobile-backdrop');
    const mobileQuery = window.matchMedia('(max-width: 760px)');
    const homePath = normalizePath(links.home);
    const READONLY_HIDE_SELECTOR = [
        '.btn-remove',
        '.btn-delete-small',
        '.delete-x',
        '[data-action="delete"]',
        '[data-comment-index]',
        '#btn-save',
        '#btn-save-global',
        '#playerForm button[type="submit"]',
        '#btnNewPlayer',
        '#btnAddComment',
        '#btnCancelForm',
        '#manageHorarisBtn',
        '#refreshBtn',
        '#refreshStatus',
        '.btn-save-main',
        '.add-obs-form',
        '.add-form-box',
        '.horari-form',
        '.section-head-link[href*="horari-entrenaments.html"]',
        'a[href*="horari-entrenaments.html"]',
        'a[href*="mode=create"]',
        'a[href*="jugador-detall.html?mode=create"]'
    ].join(',');
    const READONLY_LOCK_SELECTOR = [
        '.card input',
        '.card select',
        '.card textarea',
        '.horari-table input',
        '.horari-table select',
        '.plantilla-table input',
        '.plantilla-table select',
        '.plantilla-table textarea',
        '.players-table input[type="checkbox"]',
        '#player-form input',
        '#player-form select',
        '#player-form textarea',
        '#playerForm input:not(#filterName)',
        '#playerForm select:not(#filterPos):not(#filterClub)',
        '#playerForm textarea',
        '.scouting-detail-card input',
        '.scouting-detail-card select',
        '.scouting-detail-card textarea',
        '.scouting-form-grid input',
        '.scouting-form-grid select',
        '.scouting-form-grid textarea'
    ].join(',');
    let readOnlyObserver = null;
    let readOnlyFetchGuardApplied = false;
    let staffCarnetFetchEnhancerApplied = false;
    let staffCarnetEquipIdPromise = null;
    let staffCarnetConfigCache = null;
    let staffClubMembersCache = null;
    let staffClubMembersPromise = null;
    let staffClubAssignmentsCache = null;
    let staffClubAssignmentsPromise = null;
    let staffClubRolesCatalogCache = null;
    let staffClubRolesCatalogPromise = null;
    let staffClubRoleIdByNameCache = null;
    let staffClubRoleIdByNamePromise = null;

    const STAFF_ROLE_NAME_BY_FIELD_BASE = {
        s_primer_entrenador: 'Primer Entrenador',
        s_segon_entrenador: 'Segon Entrenador',
        s_tercer_entrenador: 'Tercer Entrenador',
        s_preparador_fisic: 'Preparador Físic',
        s_delegat: 'Delegat',
        s_fisioterapeuta: 'Fisioterapeuta',
        s_analista_tactic: 'Analista Tàctic'
    };

    function normalizePath(value) {
        try {
            const parsed = new URL(value, window.location.href);
            let normalized = (parsed.pathname || '/').toLowerCase();
            normalized = normalized.replace(/\\+/g, '/');
            normalized = normalized.replace(/\/{2,}/g, '/');
            if (normalized.length > 1 && normalized.endsWith('/')) {
                normalized = normalized.slice(0, -1);
            }
            return normalized || '/';
        } catch (_) {
            return '/';
        }
    }

    function normalizeBooleanValue(value) {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0;

        const text = String(value ?? '').trim().toLowerCase();
        if (!text) return false;
        if (['true', 't', '1', 'yes', 'si', 'sí'].includes(text)) return true;
        if (['false', 'f', '0', 'no'].includes(text)) return false;
        return !!value;
    }

    function normalizeLookupName(value) {
        return stripAccents(value)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ');
    }

    function getStaffTables() {
        return Array.from(document.querySelectorAll('table')).filter(function (tableEl) {
            return !!(
                tableEl.querySelector('input[id^="s_"][id$="_nom"]') &&
                tableEl.querySelector('input[id^="s_"][id$="_tel"]')
            );
        });
    }

    function normalizeStaffFieldBase(value) {
        const normalized = String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '')
            .replace(/^_+|_+$/g, '');
        if (!normalized) return '';
        return normalized.startsWith('s_') ? normalized : `s_${normalized}`;
    }

    function staffFieldBaseToRoleName(fieldBase) {
        const normalizedBase = normalizeStaffFieldBase(fieldBase);
        if (!normalizedBase) return 'Staff';

        if (Object.prototype.hasOwnProperty.call(STAFF_ROLE_NAME_BY_FIELD_BASE, normalizedBase)) {
            return STAFF_ROLE_NAME_BY_FIELD_BASE[normalizedBase];
        }

        const words = normalizedBase
            .replace(/^s_/, '')
            .split('_')
            .filter(Boolean)
            .map(function (word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            });

        return words.join(' ').trim() || 'Staff';
    }

    function normalizePositiveIdText(value) {
        const text = String(value ?? '').trim();
        if (!text) return '';

        const parsed = Number(text);
        if (!Number.isInteger(parsed) || parsed <= 0) return '';
        return String(parsed);
    }

    function compareRoleIdValues(a, b) {
        const rawA = String(a || '').trim();
        const rawB = String(b || '').trim();
        const numA = Number(rawA);
        const numB = Number(rawB);
        const isNumA = Number.isInteger(numA);
        const isNumB = Number.isInteger(numB);

        if (isNumA && isNumB) return numA - numB;
        if (isNumA) return -1;
        if (isNumB) return 1;
        return rawA.localeCompare(rawB, undefined, { numeric: true, sensitivity: 'base' });
    }

    function normalizeStaffRoleRows(rows) {
        const list = Array.isArray(rows) ? rows : [];
        return list
            .map(function (row) {
                const roleId = normalizePositiveIdText(row && (row.id ?? row.rol_id ?? row.rolId));
                if (!roleId) return null;
                const roleName = String(row && (row.nom ?? row.name ?? row.rol ?? '') || '').trim();
                return {
                    id: roleId,
                    nom: roleName
                };
            })
            .filter(Boolean)
            .sort(function (a, b) {
                return compareRoleIdValues(a.id, b.id);
            });
    }

    function getStaffMemberId(member) {
        const rawId = member && (member.id ?? member.staff_membre_id ?? member.staffMemberId ?? member.memberId ?? '');
        return String(rawId ?? '').trim();
    }

    function getStaffMemberName(member) {
        return String(member && (member.nom ?? member.name ?? '') || '').trim();
    }

    function getStaffMemberPhone(member) {
        return String(member && (member.telefon ?? member.tel ?? member.phone ?? '') || '').trim();
    }

    function getStaffMemberCarnet(member) {
        return normalizeBooleanValue(member && member.carnet);
    }

    function normalizePhoneLookup(value) {
        return String(value || '').replace(/\D+/g, '').trim();
    }

    function normalizeStaffMemberRows(rows) {
        const list = Array.isArray(rows) ? rows : [];
        return list
            .map(function (row) {
                const id = getStaffMemberId(row);
                const nom = getStaffMemberName(row);
                if (!id || !nom) return null;

                return {
                    id: id,
                    nom: nom,
                    telefon: getStaffMemberPhone(row),
                    carnet: getStaffMemberCarnet(row),
                    actiu: row && row.actiu === undefined ? true : normalizeBooleanValue(row.actiu)
                };
            })
            .filter(Boolean)
            .sort(function (a, b) {
                const inactiveA = a.actiu === false ? 1 : 0;
                const inactiveB = b.actiu === false ? 1 : 0;
                if (inactiveA !== inactiveB) return inactiveA - inactiveB;
                return String(a.nom || '').localeCompare(String(b.nom || ''));
            });
    }

    function normalizeStaffAssignmentRows(rows) {
        const list = Array.isArray(rows) ? rows : [];
        return list
            .map(function (row) {
                const equipId = normalizePositiveIdText(row && (row.equip_id ?? row.equipId));
                const rolId = normalizePositiveIdText(row && (row.rol_id ?? row.rolId));
                const staffMemberId = normalizePositiveIdText(row && (row.staff_membre_id ?? row.staffMemberId ?? row.memberId));
                if (!equipId || !rolId || !staffMemberId) return null;
                return { equipId: equipId, rolId: rolId, staffMemberId: staffMemberId };
            })
            .filter(Boolean);
    }

    function normalizeRoleIdByName(rows) {
        const list = Array.isArray(rows) ? rows : [];
        const roleMap = {};

        list.forEach(function (row) {
            const roleName = String(row && (row.nom ?? row.name ?? row.rol ?? '') || '').trim();
            const roleId = normalizePositiveIdText(row && (row.id ?? row.rol_id ?? row.rolId));
            if (!roleName || !roleId) return;
            roleMap[normalizeLookupName(roleName)] = roleId;
        });

        return roleMap;
    }

    function findStaffMemberById(members, memberId) {
        const targetId = String(memberId || '').trim();
        if (!targetId) return null;
        return (Array.isArray(members) ? members : []).find(function (member) {
            return getStaffMemberId(member) === targetId;
        }) || null;
    }

    function findStaffMemberByLegacyValues(members, nom, tel) {
        const list = Array.isArray(members) ? members : [];
        const lookupNom = normalizeLookupName(nom || '');
        const lookupTel = normalizePhoneLookup(tel || '');

        if (!lookupNom && !lookupTel) return null;

        return list.find(function (member) {
            const memberNom = normalizeLookupName(getStaffMemberName(member));
            const memberTel = normalizePhoneLookup(getStaffMemberPhone(member));

            if (lookupNom && lookupTel) {
                return memberNom === lookupNom && memberTel === lookupTel;
            }
            if (lookupNom) return memberNom === lookupNom;
            return memberTel === lookupTel;
        }) || null;
    }

    function setStaffFieldValues(fieldBase, values) {
        const nomEl = document.getElementById(`${fieldBase}_nom`);
        if (nomEl) {
            nomEl.value = String(values && values.nom || '').trim();
        }

        const telEl = document.getElementById(`${fieldBase}_tel`);
        if (telEl) {
            telEl.value = String(values && values.tel || '').trim();
        }

        const carnetEl = document.getElementById(`${fieldBase}_carnet`);
        if (carnetEl && carnetEl.type === 'checkbox') {
            carnetEl.checked = normalizeBooleanValue(values && values.carnet);
        }
    }

    function ensureLegacyStaffOption(selectEl, label) {
        if (!selectEl) return;
        const text = String(label || '').trim();
        if (!text) return;

        const optionText = `${text} (actual)`;
        const existing = Array.from(selectEl.options).find(function (option) {
            return option.value === '__legacy__';
        });

        if (existing) {
            existing.textContent = optionText;
            return;
        }

        const option = document.createElement('option');
        option.value = '__legacy__';
        option.textContent = optionText;
        selectEl.appendChild(option);
    }

    function populateStaffMemberSelect(selectEl, members, legacyLabel) {
        if (!selectEl) return;

        const sortedMembers = normalizeStaffMemberRows(members);

        selectEl.innerHTML = '';

        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '— Sense assignar —';
        selectEl.appendChild(emptyOption);

        sortedMembers.forEach(function (member) {
            const option = document.createElement('option');
            option.value = String(member.id);
            option.textContent = `${member.nom}${member.actiu === false ? ' (inactiu)' : ''}`;
            selectEl.appendChild(option);
        });

        ensureLegacyStaffOption(selectEl, legacyLabel);
    }

    function isPageManagedStaffSelect(selectEl) {
        if (!selectEl || typeof selectEl.getAttribute !== 'function') return false;
        const inlineHandler = String(selectEl.getAttribute('onchange') || '').trim();
        return /onstaffmemberselect\s*\(/i.test(inlineHandler);
    }

    function isPageManagedStaffRoleSelect(selectEl) {
        if (!selectEl || typeof selectEl.getAttribute !== 'function') return false;
        const inlineHandler = String(selectEl.getAttribute('onchange') || '').trim();
        return /onstaffroleselect\s*\(/i.test(inlineHandler);
    }

    function ensureStaffMemberSelectorForRow(rowEl, fieldBase, nomInput) {
        const selectId = `${fieldBase}_member`;
        let selectEl = rowEl ? rowEl.querySelector(`select#${selectId}`) : null;

        if (selectEl && isPageManagedStaffSelect(selectEl)) {
            return null;
        }

        if (!selectEl) {
            selectEl = document.createElement('select');
            selectEl.id = selectId;
            if (nomInput && nomInput.parentNode) {
                nomInput.insertAdjacentElement('afterend', selectEl);
            } else if (rowEl) {
                rowEl.appendChild(selectEl);
            }
        }

        if (nomInput) {
            nomInput.type = 'hidden';
            nomInput.setAttribute('data-cf-staff-hidden', '1');
        }

        selectEl.style.width = '100%';
        selectEl.setAttribute('data-cf-staff-member', '1');
        selectEl.dataset.fieldBase = fieldBase;

        if (!selectEl.dataset.cfStaffMemberBound) {
            selectEl.addEventListener('change', onStaffMemberSelectorChange);
            selectEl.dataset.cfStaffMemberBound = '1';
        }

        return selectEl;
    }

    function populateStaffRoleSelect(selectEl, rolesCatalog, preferredRoleId, fallbackRoleName) {
        if (!selectEl) return;

        const roles = normalizeStaffRoleRows(rolesCatalog);
        const normalizedPreferredRoleId = normalizePositiveIdText(preferredRoleId);
        const normalizedFallbackName = normalizeLookupName(fallbackRoleName || '');
        const fallbackRole = roles.find(function (role) {
            return normalizeLookupName(role.nom || '') === normalizedFallbackName;
        });
        const fallbackRoleId = normalizePositiveIdText(fallbackRole && fallbackRole.id);

        selectEl.innerHTML = '';

        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '— Rol —';
        selectEl.appendChild(emptyOption);

        roles.forEach(function (role) {
            const option = document.createElement('option');
            option.value = role.id;
            option.textContent = role.nom || `Rol ${role.id}`;
            selectEl.appendChild(option);
        });

        const desiredRoleId = normalizedPreferredRoleId || fallbackRoleId;
        const hasDesiredRole = Array.from(selectEl.options).some(function (option) {
            return option.value === desiredRoleId;
        });

        selectEl.value = hasDesiredRole ? desiredRoleId : '';
    }

    function ensureStaffRoleSelectorForRow(rowEl, fieldBase, roleCell, roleName) {
        const selectId = `${fieldBase}_role`;
        let selectEl = rowEl ? rowEl.querySelector(`select#${selectId}`) : null;

        if (selectEl && isPageManagedStaffRoleSelect(selectEl)) {
            return null;
        }

        const targetRoleCell = roleCell || (rowEl ? rowEl.querySelector('td') : null);
        if (!targetRoleCell) return selectEl;

        if (!selectEl) {
            selectEl = document.createElement('select');
            selectEl.id = selectId;
        }

        if (!targetRoleCell.contains(selectEl)) {
            targetRoleCell.textContent = '';
            targetRoleCell.appendChild(selectEl);
        }

        targetRoleCell.setAttribute('data-label', 'Rol');
        selectEl.style.width = '100%';
        selectEl.setAttribute('data-cf-staff-role', '1');
        selectEl.dataset.fieldBase = fieldBase;
        selectEl.dataset.defaultRoleName = String(roleName || '').trim();

        if (!selectEl.dataset.cfStaffRoleBound) {
            selectEl.addEventListener('change', onStaffRoleSelectorChange);
            selectEl.dataset.cfStaffRoleBound = '1';
        }

        return selectEl;
    }

    function collectStaffCarnetPayload() {
        const payload = {};

        document.querySelectorAll('input[type="checkbox"][data-cf-staff-carnet="1"]').forEach(function (checkboxEl) {
            if (!checkboxEl.id) return;
            payload[checkboxEl.id] = !!checkboxEl.checked;
        });

        return payload;
    }

    function applyStaffCarnetValues(config) {
        if (!config || typeof config !== 'object') return;
        staffCarnetConfigCache = config;

        Object.keys(config).forEach(function (fieldName) {
            const key = String(fieldName || '');
            if (!/^s_[a-z0-9_]+_carnet$/i.test(key)) return;

            const checkboxEl = document.getElementById(key);
            if (!checkboxEl || checkboxEl.type !== 'checkbox') return;
            checkboxEl.checked = normalizeBooleanValue(config[key]);
        });
    }

    function injectStaffCarnetColumn() {
        getStaffTables().forEach(function (tableEl) {
            const headerRow = tableEl.querySelector('thead tr');
            if (headerRow) {
                const hasCarnetHeader = Array.from(headerRow.querySelectorAll('th')).some(function (thEl) {
                    return stripAccents(thEl.textContent || '').trim().toLowerCase() === 'carnet';
                });

                if (!hasCarnetHeader) {
                    const carnetHeader = document.createElement('th');
                    carnetHeader.textContent = 'Carnet';
                    carnetHeader.style.textAlign = 'center';
                    headerRow.appendChild(carnetHeader);
                }
            }

            tableEl.querySelectorAll('tbody tr').forEach(function (rowEl) {
                const nomInput = rowEl.querySelector('input[id^="s_"][id$="_nom"]');
                if (!nomInput || !nomInput.id) return;

                const fieldBase = nomInput.id.replace(/_nom$/i, '');
                if (!fieldBase) return;

                const carnetId = `${fieldBase}_carnet`;
                const existingCheckbox = document.getElementById(carnetId);
                if (existingCheckbox && existingCheckbox.type === 'checkbox') {
                    existingCheckbox.setAttribute('data-cf-staff-carnet', '1');
                    if (staffCarnetConfigCache && Object.prototype.hasOwnProperty.call(staffCarnetConfigCache, carnetId)) {
                        existingCheckbox.checked = normalizeBooleanValue(staffCarnetConfigCache[carnetId]);
                    }
                    return;
                }

                const carnetCell = document.createElement('td');
                carnetCell.setAttribute('data-label', 'Carnet');
                carnetCell.style.textAlign = 'center';

                const carnetCheckbox = document.createElement('input');
                carnetCheckbox.type = 'checkbox';
                carnetCheckbox.id = carnetId;
                carnetCheckbox.setAttribute('data-cf-staff-carnet', '1');
                if (staffCarnetConfigCache && Object.prototype.hasOwnProperty.call(staffCarnetConfigCache, carnetId)) {
                    carnetCheckbox.checked = normalizeBooleanValue(staffCarnetConfigCache[carnetId]);
                }

                carnetCheckbox.addEventListener('change', function () {
                    if (typeof window.saveAll === 'function') {
                        window.saveAll(true);
                    }
                });

                carnetCell.appendChild(carnetCheckbox);
                rowEl.appendChild(carnetCell);
            });
        });
    }

    async function loadStaffClubMembers(forceRefresh) {
        if (forceRefresh) {
            staffClubMembersCache = null;
            staffClubMembersPromise = null;
        }

        if (Array.isArray(staffClubMembersCache)) {
            return staffClubMembersCache;
        }

        if (!staffClubMembersPromise) {
            staffClubMembersPromise = fetch(`${base}/api/staff-club/members`, {
                credentials: 'same-origin'
            }).then(async function (response) {
                if (!response || !response.ok) return [];
                const rows = await response.json();
                return normalizeStaffMemberRows(rows);
            }).catch(function () {
                return [];
            }).then(function (rows) {
                staffClubMembersCache = Array.isArray(rows) ? rows : [];
                staffClubMembersPromise = null;
                return staffClubMembersCache;
            });
        }

        return staffClubMembersPromise;
    }

    async function loadStaffClubAssignments(forceRefresh) {
        if (forceRefresh) {
            staffClubAssignmentsCache = null;
            staffClubAssignmentsPromise = null;
        }

        if (Array.isArray(staffClubAssignmentsCache)) {
            return staffClubAssignmentsCache;
        }

        if (!staffClubAssignmentsPromise) {
            staffClubAssignmentsPromise = fetch(`${base}/api/staff-club/assignments`, {
                credentials: 'same-origin'
            }).then(async function (response) {
                if (!response || !response.ok) return [];
                const rows = await response.json();
                return normalizeStaffAssignmentRows(rows);
            }).catch(function () {
                return [];
            }).then(function (rows) {
                staffClubAssignmentsCache = Array.isArray(rows) ? rows : [];
                staffClubAssignmentsPromise = null;
                return staffClubAssignmentsCache;
            });
        }

        return staffClubAssignmentsPromise;
    }

    async function loadStaffRolesCatalog(forceRefresh) {
        if (forceRefresh) {
            staffClubRolesCatalogCache = null;
            staffClubRolesCatalogPromise = null;
        }

        if (Array.isArray(staffClubRolesCatalogCache)) {
            return staffClubRolesCatalogCache;
        }

        if (!staffClubRolesCatalogPromise) {
            staffClubRolesCatalogPromise = fetch(`${base}/api/rols`, {
                credentials: 'same-origin'
            }).then(async function (response) {
                if (!response || !response.ok) return [];
                const rows = await response.json();
                return normalizeStaffRoleRows(rows);
            }).catch(function () {
                return [];
            }).then(function (roles) {
                staffClubRolesCatalogCache = Array.isArray(roles) ? roles : [];
                staffClubRolesCatalogPromise = null;
                return staffClubRolesCatalogCache;
            });
        }

        return staffClubRolesCatalogPromise;
    }

    async function loadStaffRoleIdByName(forceRefresh) {
        if (forceRefresh) {
            staffClubRoleIdByNameCache = null;
            staffClubRoleIdByNamePromise = null;
        }

        if (staffClubRoleIdByNameCache && typeof staffClubRoleIdByNameCache === 'object') {
            return staffClubRoleIdByNameCache;
        }

        if (!staffClubRoleIdByNamePromise) {
            staffClubRoleIdByNamePromise = loadStaffRolesCatalog(forceRefresh).then(function (rolesCatalog) {
                const roleMap = {};
                (Array.isArray(rolesCatalog) ? rolesCatalog : []).forEach(function (role) {
                    const roleName = String(role && role.nom || '').trim();
                    const roleId = normalizePositiveIdText(role && role.id);
                    if (!roleName || !roleId) return;
                    roleMap[normalizeLookupName(roleName)] = roleId;
                });
                return roleMap;
            }).catch(function () {
                return {};
            }).then(function (roleMap) {
                staffClubRoleIdByNameCache = roleMap && typeof roleMap === 'object' ? roleMap : {};
                staffClubRoleIdByNamePromise = null;
                return staffClubRoleIdByNameCache;
            });
        }

        return staffClubRoleIdByNamePromise;
    }

    function invalidateStaffAssignmentsCache() {
        staffClubAssignmentsCache = null;
        staffClubAssignmentsPromise = null;
    }

    function upsertStaffAssignmentCache(equipId, rolId, staffMemberId) {
        if (!Array.isArray(staffClubAssignmentsCache)) return;

        const normalizedEquipId = normalizePositiveIdText(equipId);
        const normalizedRolId = normalizePositiveIdText(rolId);
        const normalizedMemberId = normalizePositiveIdText(staffMemberId);
        if (!normalizedEquipId || !normalizedRolId || !normalizedMemberId) {
            invalidateStaffAssignmentsCache();
            return;
        }

        const nextAssignments = staffClubAssignmentsCache.filter(function (item) {
            return item.equipId !== normalizedEquipId || item.rolId !== normalizedRolId;
        });

        nextAssignments.push({
            equipId: normalizedEquipId,
            rolId: normalizedRolId,
            staffMemberId: normalizedMemberId
        });

        staffClubAssignmentsCache = nextAssignments;
    }

    function removeStaffAssignmentFromCache(equipId, rolId) {
        if (!Array.isArray(staffClubAssignmentsCache)) return;

        const normalizedEquipId = normalizePositiveIdText(equipId);
        const normalizedRolId = normalizePositiveIdText(rolId);
        if (!normalizedEquipId || !normalizedRolId) {
            invalidateStaffAssignmentsCache();
            return;
        }

        staffClubAssignmentsCache = staffClubAssignmentsCache.filter(function (item) {
            return item.equipId !== normalizedEquipId || item.rolId !== normalizedRolId;
        });
    }

    async function saveStaffInputsSilently() {
        if (typeof window.saveAll !== 'function') return;

        try {
            const result = window.saveAll(true);
            if (result && typeof result.then === 'function') {
                await result;
            }
        } catch (_) {}
    }

    async function deleteStaffAssignmentByRoleId(equipId, roleId) {
        const normalizedEquipId = normalizePositiveIdText(equipId);
        const normalizedRoleId = normalizePositiveIdText(roleId);
        if (!normalizedEquipId || !normalizedRoleId) return;

        const response = await fetch(`${base}/api/staff-club/assignments?equipId=${encodeURIComponent(normalizedEquipId)}&rolId=${encodeURIComponent(normalizedRoleId)}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP ${response.status}`);
        }

        removeStaffAssignmentFromCache(normalizedEquipId, normalizedRoleId);
    }

    function getSelectedRoleIdForFieldBase(fieldBase, fallbackRoleName) {
        const roleSelectEl = document.getElementById(`${fieldBase}_role`);
        const selectedRoleId = normalizePositiveIdText(roleSelectEl && roleSelectEl.value);
        if (selectedRoleId) return selectedRoleId;

        const fallbackFromSelect = normalizePositiveIdText(roleSelectEl && roleSelectEl.dataset.fallbackRoleId);
        if (fallbackFromSelect) return fallbackFromSelect;

        const lookupName = normalizeLookupName(fallbackRoleName || staffFieldBaseToRoleName(fieldBase));
        const fallbackFromMap = normalizePositiveIdText(
            staffClubRoleIdByNameCache && staffClubRoleIdByNameCache[lookupName]
        );
        return fallbackFromMap;
    }

    async function onStaffMemberSelectorChange(event) {
        const selectEl = event && event.target ? event.target : null;
        if (!selectEl) return;
        if (isPageManagedStaffSelect(selectEl)) return;
        if (selectEl.dataset.cfStaffMemberBusy === '1') return;

        const fieldBase = normalizeStaffFieldBase(
            selectEl.dataset.fieldBase || String(selectEl.id || '').replace(/_member$/i, '')
        );
        if (!fieldBase) return;

        const selectedValue = String(selectEl.value || '').trim();
        const previousValue = String(selectEl.dataset.prevValue || '').trim();
        const roleName = String(selectEl.dataset.roleName || staffFieldBaseToRoleName(fieldBase)).trim();
        const roleSelectEl = document.getElementById(`${fieldBase}_role`);
        const selectedRoleId = getSelectedRoleIdForFieldBase(fieldBase, roleName);
        const assignedRoleId = normalizePositiveIdText(selectEl.dataset.assignedRolId || '');

        let equipId = String(selectEl.dataset.equipId || '').trim();
        if (!equipId) {
            equipId = String(await resolveStaffCarnetEquipId() || '').trim();
            if (equipId) {
                selectEl.dataset.equipId = equipId;
            }
        }

        selectEl.dataset.cfStaffMemberBusy = '1';
        selectEl.disabled = true;
        if (roleSelectEl) {
            roleSelectEl.disabled = true;
        }

        try {
            if (selectedValue && selectedValue !== '__legacy__') {
                if (!selectedRoleId) {
                    throw new Error('Cal seleccionar un rol per assignar aquest membre');
                }

                const members = await loadStaffClubMembers(false);
                const selectedMember = findStaffMemberById(members, selectedValue);
                if (!selectedMember) {
                    throw new Error('Membre de staff no trobat');
                }

                setStaffFieldValues(fieldBase, {
                    nom: getStaffMemberName(selectedMember),
                    tel: getStaffMemberPhone(selectedMember),
                    carnet: getStaffMemberCarnet(selectedMember)
                });

                if (equipId) {
                    if (assignedRoleId && assignedRoleId !== selectedRoleId) {
                        await deleteStaffAssignmentByRoleId(equipId, assignedRoleId);
                    }

                    const assignmentResponse = await fetch(`${base}/api/staff-club/assignments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'same-origin',
                        body: JSON.stringify({
                            equip_id: equipId,
                            rol_id: selectedRoleId,
                            staff_membre_id: selectedValue
                        })
                    });

                    if (!assignmentResponse.ok) {
                        const errorText = await assignmentResponse.text();
                        throw new Error(errorText || `HTTP ${assignmentResponse.status}`);
                    }

                    const payload = await assignmentResponse.json().catch(function () { return null; });
                    const assignment = payload && payload.assignment ? payload.assignment : null;
                    const assignedRolIdResponse = normalizePositiveIdText(assignment && assignment.rol_id);
                    const nextAssignedRoleId = assignedRolIdResponse || selectedRoleId;

                    if (nextAssignedRoleId) {
                        selectEl.dataset.assignedRolId = nextAssignedRoleId;
                        upsertStaffAssignmentCache(equipId, nextAssignedRoleId, selectedValue);
                    } else {
                        invalidateStaffAssignmentsCache();
                    }
                }

                selectEl.dataset.prevValue = selectedValue;
                if (roleSelectEl) {
                    roleSelectEl.dataset.prevRoleId = String(roleSelectEl.value || '');
                }
                await saveStaffInputsSilently();
                return;
            }

            if (!selectedValue) {
                setStaffFieldValues(fieldBase, { nom: '', tel: '', carnet: false });

                if (equipId) {
                    const roleToDelete = assignedRoleId || selectedRoleId;
                    if (roleToDelete) {
                        await deleteStaffAssignmentByRoleId(equipId, roleToDelete);
                    } else {
                        invalidateStaffAssignmentsCache();
                    }
                }

                selectEl.dataset.assignedRolId = '';
                selectEl.dataset.prevValue = '';
                if (roleSelectEl) {
                    roleSelectEl.dataset.prevRoleId = String(roleSelectEl.value || '');
                }
                await saveStaffInputsSilently();
                return;
            }

            selectEl.dataset.prevValue = selectedValue;
            if (roleSelectEl) {
                roleSelectEl.dataset.prevRoleId = String(roleSelectEl.value || '');
            }
            await saveStaffInputsSilently();
        } catch (error) {
            console.warn('Error actualitzant assignació de staff:', error && error.message ? error.message : error);
            alert('No s\'ha pogut actualitzar l\'assignació de staff.');

            const canRestorePrevious = previousValue && Array.from(selectEl.options).some(function (option) {
                return option.value === previousValue;
            });
            selectEl.value = canRestorePrevious ? previousValue : '';
            selectEl.dataset.prevValue = selectEl.value;

            await syncStaffCarnetFromServer();
        } finally {
            selectEl.disabled = false;
            selectEl.dataset.cfStaffMemberBusy = '';
            if (roleSelectEl) {
                roleSelectEl.disabled = false;
            }
        }
    }

    async function onStaffRoleSelectorChange(event) {
        const roleSelectEl = event && event.target ? event.target : null;
        if (!roleSelectEl) return;
        if (isPageManagedStaffRoleSelect(roleSelectEl)) return;
        if (roleSelectEl.dataset.cfStaffRoleBusy === '1') return;

        const fieldBase = normalizeStaffFieldBase(
            roleSelectEl.dataset.fieldBase || String(roleSelectEl.id || '').replace(/_role$/i, '')
        );
        if (!fieldBase) return;

        const memberSelectEl = document.getElementById(`${fieldBase}_member`);
        if (!memberSelectEl) return;

        const selectedMemberId = String(memberSelectEl.value || '').trim();
        const selectedRoleId = normalizePositiveIdText(roleSelectEl.value);
        const previousRoleId = normalizePositiveIdText(roleSelectEl.dataset.prevRoleId || memberSelectEl.dataset.assignedRolId || '');
        const assignedRoleId = normalizePositiveIdText(memberSelectEl.dataset.assignedRolId || '');

        if (selectedMemberId && selectedMemberId !== '__legacy__' && !selectedRoleId) {
            alert('Selecciona un rol per mantenir aquesta assignació.');
            roleSelectEl.value = previousRoleId || '';
            return;
        }

        let equipId = String(memberSelectEl.dataset.equipId || '').trim();
        if (!equipId) {
            equipId = String(await resolveStaffCarnetEquipId() || '').trim();
            if (equipId) {
                memberSelectEl.dataset.equipId = equipId;
            }
        }

        roleSelectEl.dataset.cfStaffRoleBusy = '1';
        roleSelectEl.disabled = true;

        try {
            if (selectedMemberId && selectedMemberId !== '__legacy__' && equipId) {
                const roleToDelete = assignedRoleId || previousRoleId;
                if (roleToDelete && roleToDelete !== selectedRoleId) {
                    await deleteStaffAssignmentByRoleId(equipId, roleToDelete);
                }

                if (selectedRoleId) {
                    const assignmentResponse = await fetch(`${base}/api/staff-club/assignments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'same-origin',
                        body: JSON.stringify({
                            equip_id: equipId,
                            rol_id: selectedRoleId,
                            staff_membre_id: selectedMemberId
                        })
                    });

                    if (!assignmentResponse.ok) {
                        const errorText = await assignmentResponse.text();
                        throw new Error(errorText || `HTTP ${assignmentResponse.status}`);
                    }

                    memberSelectEl.dataset.assignedRolId = selectedRoleId;
                    upsertStaffAssignmentCache(equipId, selectedRoleId, selectedMemberId);
                } else {
                    memberSelectEl.dataset.assignedRolId = '';
                }
            }

            roleSelectEl.dataset.prevRoleId = String(roleSelectEl.value || '');
            await saveStaffInputsSilently();
        } catch (error) {
            console.warn('Error actualitzant rol de l\'assignació staff:', error && error.message ? error.message : error);
            alert('No s\'ha pogut actualitzar el rol de l\'assignació staff.');

            roleSelectEl.value = previousRoleId || '';
            roleSelectEl.dataset.prevRoleId = roleSelectEl.value;
            await syncStaffCarnetFromServer();
        } finally {
            roleSelectEl.disabled = false;
            roleSelectEl.dataset.cfStaffRoleBusy = '';
        }
    }

    async function syncStaffMemberSelectorsFromServer(options) {
        if (!getStaffTables().length) return;

        const sourceOptions = options && typeof options === 'object' ? options : {};
        const forceRefresh = !!sourceOptions.forceRefresh;
        const providedEquipId = String(sourceOptions.equipId || '').trim();

        const rowStates = [];

        getStaffTables().forEach(function (tableEl) {
            tableEl.querySelectorAll('tbody tr').forEach(function (rowEl) {
                const nomInput = rowEl.querySelector('input[id^="s_"][id$="_nom"]');
                const telInput = rowEl.querySelector('input[id^="s_"][id$="_tel"]');
                if (!nomInput || !nomInput.id || !telInput) return;

                const fieldBase = normalizeStaffFieldBase(nomInput.id.replace(/_nom$/i, ''));
                if (!fieldBase) return;

                const selectEl = ensureStaffMemberSelectorForRow(rowEl, fieldBase, nomInput);
                if (!selectEl) return;

                const roleCell = rowEl.querySelector('td');
                const roleName = String(
                    (roleCell && roleCell.dataset && roleCell.dataset.cfStaffRoleName) ||
                    (roleCell && roleCell.textContent) ||
                    staffFieldBaseToRoleName(fieldBase)
                ).trim();
                const roleSelectEl = ensureStaffRoleSelectorForRow(rowEl, fieldBase, roleCell, roleName);
                if (!roleSelectEl) return;

                if (roleCell && roleName) {
                    roleCell.dataset.cfStaffRoleName = roleName;
                }

                rowStates.push({
                    fieldBase: fieldBase,
                    nomInput: nomInput,
                    telInput: telInput,
                    selectEl: selectEl,
                    roleSelectEl: roleSelectEl,
                    roleName: roleName
                });
            });
        });

        if (!rowStates.length) return;

        const members = await loadStaffClubMembers(forceRefresh);
        const membersById = new Map();
        (Array.isArray(members) ? members : []).forEach(function (member) {
            const memberId = getStaffMemberId(member);
            if (!memberId) return;
            membersById.set(memberId, member);
        });

        let normalizedEquipId = normalizePositiveIdText(providedEquipId);
        if (!normalizedEquipId) {
            normalizedEquipId = normalizePositiveIdText(await resolveStaffCarnetEquipId());
        }

        const loaded = await Promise.all([
            loadStaffRoleIdByName(forceRefresh),
            loadStaffRolesCatalog(forceRefresh),
            normalizedEquipId ? loadStaffClubAssignments(forceRefresh) : Promise.resolve([])
        ]);

        const roleMap = loaded[0] && typeof loaded[0] === 'object' ? loaded[0] : {};
        const rolesCatalog = Array.isArray(loaded[1]) ? loaded[1] : [];
        const assignments = Array.isArray(loaded[2]) ? loaded[2] : [];

        rowStates.forEach(function (rowState) {
            const roleName = String(rowState.roleName || staffFieldBaseToRoleName(rowState.fieldBase)).trim();
            const roleLookup = normalizeLookupName(roleName);
            const fallbackRoleId = normalizePositiveIdText(roleMap[roleLookup]);
            const currentRoleId = normalizePositiveIdText(rowState.roleSelectEl && rowState.roleSelectEl.value);

            const currentNom = String(rowState.nomInput.value || '').trim();
            const currentTel = String(rowState.telInput.value || '').trim();

            let activeRoleId = currentRoleId || fallbackRoleId;
            let assignment = null;

            if (normalizedEquipId && activeRoleId) {
                assignment = assignments.find(function (item) {
                    return item.equipId === normalizedEquipId && item.rolId === activeRoleId;
                }) || null;
            }

            if (!assignment && normalizedEquipId && fallbackRoleId && fallbackRoleId !== activeRoleId) {
                assignment = assignments.find(function (item) {
                    return item.equipId === normalizedEquipId && item.rolId === fallbackRoleId;
                }) || null;
                if (assignment) {
                    activeRoleId = assignment.rolId;
                }
            }

            if (!activeRoleId && assignment && assignment.rolId) {
                activeRoleId = assignment.rolId;
            }

            populateStaffRoleSelect(rowState.roleSelectEl, rolesCatalog, activeRoleId, roleName);

            const selectedRoleId = normalizePositiveIdText(
                rowState.roleSelectEl && rowState.roleSelectEl.value
            ) || fallbackRoleId;

            if (rowState.roleSelectEl) {
                rowState.roleSelectEl.dataset.fallbackRoleId = fallbackRoleId;
                rowState.roleSelectEl.dataset.prevRoleId = String(rowState.roleSelectEl.value || '');
                rowState.roleSelectEl.dataset.defaultRoleName = roleName;
            }

            let selectedMember = null;

            if (assignment) {
                selectedMember = membersById.get(assignment.staffMemberId) || null;
            }

            if (!selectedMember) {
                selectedMember = findStaffMemberByLegacyValues(members, currentNom, currentTel);
            }

            populateStaffMemberSelect(rowState.selectEl, members, selectedMember ? '' : currentNom);

            if (selectedMember) {
                const selectedMemberId = getStaffMemberId(selectedMember);
                const hasMemberOption = Array.from(rowState.selectEl.options).some(function (option) {
                    return option.value === selectedMemberId;
                });

                rowState.selectEl.value = hasMemberOption ? selectedMemberId : '';

                if (hasMemberOption) {
                    setStaffFieldValues(rowState.fieldBase, {
                        nom: getStaffMemberName(selectedMember),
                        tel: getStaffMemberPhone(selectedMember),
                        carnet: getStaffMemberCarnet(selectedMember)
                    });
                }
            } else if (currentNom) {
                rowState.selectEl.value = '__legacy__';
            } else {
                rowState.selectEl.value = '';
            }

            rowState.selectEl.dataset.equipId = normalizedEquipId;
            rowState.selectEl.dataset.roleName = roleName;
            rowState.selectEl.dataset.assignedRolId = assignment ? assignment.rolId : '';
            rowState.selectEl.dataset.prevValue = rowState.selectEl.value;

            if (rowState.roleSelectEl && !rowState.roleSelectEl.dataset.prevRoleId) {
                rowState.roleSelectEl.dataset.prevRoleId = String(selectedRoleId || '');
            }
        });
    }

    function getRequestUrl(input) {
        if (typeof input === 'string') return input;
        if (input && typeof input === 'object' && input.url) return String(input.url);
        return '';
    }

    function getRequestMethod(input, init) {
        return String(
            (init && init.method) ||
            (input && typeof input === 'object' && input.method) ||
            'GET'
        ).toUpperCase();
    }

    function isEquipConfigRequest(requestUrl) {
        return /\/api\/equip-config(?:\?|$)/i.test(String(requestUrl || ''));
    }

    function withAugmentedEquipConfigBody(init) {
        const options = init && typeof init === 'object' ? init : {};
        if (typeof options.body !== 'string') return init;

        let parsedBody;
        try {
            parsedBody = JSON.parse(options.body);
        } catch (_) {
            return init;
        }

        if (!parsedBody || typeof parsedBody !== 'object') return init;

        const carnetPayload = collectStaffCarnetPayload();
        const shouldPreserveAssignments = getStaffTables().length > 0;
        const augmentPayload = Object.assign(
            {},
            shouldPreserveAssignments ? { __preserve_staff_assignments: true } : {},
            carnetPayload
        );
        if (!Object.keys(augmentPayload).length) return init;

        return Object.assign({}, options, {
            body: JSON.stringify(Object.assign({}, parsedBody, augmentPayload))
        });
    }

    function applyStaffCarnetFetchEnhancer() {
        if (staffCarnetFetchEnhancerApplied || typeof window.fetch !== 'function') return;

        const nativeFetch = window.fetch.bind(window);
        staffCarnetFetchEnhancerApplied = true;

        window.fetch = function (input, init) {
            const requestUrl = getRequestUrl(input);
            const requestMethod = getRequestMethod(input, init);
            const isEquipConfig = isEquipConfigRequest(requestUrl);
            let nextInit = init;

            if (isEquipConfig && requestMethod === 'POST') {
                nextInit = withAugmentedEquipConfigBody(init);
            }

            const requestPromise = nativeFetch(input, nextInit);

            if (!isEquipConfig || !isReadMethod(requestMethod)) {
                return requestPromise;
            }

            return requestPromise.then(function (response) {
                if (!response || !response.ok) return response;

                response.clone().json().then(function (config) {
                    applyStaffCarnetValues(config);
                    injectStaffCarnetColumn();
                    syncStaffMemberSelectorsFromServer().catch(function () {});
                }).catch(function () {});

                return response;
            });
        };
    }

    async function resolveStaffCarnetEquipId() {
        if (staffCarnetEquipIdPromise) {
            return staffCarnetEquipIdPromise;
        }

        staffCarnetEquipIdPromise = (async function () {
            const staffTables = getStaffTables();
            if (!staffTables.length || !teamTitle) return null;

            const expectedNames = [teamTitle]
                .map(normalizeLookupName)
                .filter(Boolean);
            if (!expectedNames.length) return null;

            try {
                const response = await fetch(`${base}/api/equips`, { credentials: 'same-origin' });
                if (!response.ok) return null;

                const equips = await response.json();
                if (!Array.isArray(equips)) return null;

                let match = equips.find(function (equip) {
                    const normalized = normalizeLookupName(equip && (equip.name || equip.nom || ''));
                    return expectedNames.includes(normalized);
                });

                if (!match) {
                    match = equips.find(function (equip) {
                        const normalized = normalizeLookupName(equip && (equip.name || equip.nom || ''));
                        return expectedNames.some(function (expected) {
                            return normalized.includes(expected) || expected.includes(normalized);
                        });
                    });
                }

                const rawId = match ? (match.id ?? match.equip_id ?? '') : '';
                const normalizedId = String(rawId || '').trim();
                return normalizedId || null;
            } catch (_) {
                return null;
            }
        })();

        return staffCarnetEquipIdPromise;
    }

    async function syncStaffCarnetFromServer() {
        if (!getStaffTables().length) return;

        const equipId = await resolveStaffCarnetEquipId();
        if (!equipId) return;

        try {
            const response = await fetch(`${base}/api/equip-config?equipId=${encodeURIComponent(equipId)}`, {
                credentials: 'same-origin'
            });
            if (!response.ok) return;

            const config = await response.json();
            applyStaffCarnetValues(config);
            injectStaffCarnetColumn();
            await syncStaffMemberSelectorsFromServer({
                equipId: equipId,
                forceRefresh: true
            });
        } catch (_) {}
    }

    function initStaffCarnetFeature() {
        injectStaffCarnetColumn();
        syncStaffMemberSelectorsFromServer().catch(function () {});
        applyStaffCarnetFetchEnhancer();
        syncStaffCarnetFromServer();
    }

    function extractHashRoutePath() {
        const rawHash = String(window.location.hash || '').trim();
        if (!rawHash) return '';

        let decodedHash = rawHash;
        try {
            decodedHash = decodeURIComponent(rawHash);
        } catch (_) {}

        const withoutHash = decodedHash.replace(/^#/, '').trim();
        if (!withoutHash) return '';

        const match = withoutHash.match(/([./a-zA-Z0-9_-]*seccions\/[a-zA-Z0-9_-]+\.html|[./a-zA-Z0-9_-]+\.html)/i);
        return match && match[1] ? match[1] : '';
    }

    function getCurrentRoutePath() {
        const hashPath = extractHashRoutePath();
        if (hashPath) return normalizePath(hashPath);
        return normalizePath(window.location.href);
    }

    function isSamePath(currentPath, targetPath) {
        if (currentPath === targetPath) return true;
        if ((currentPath === '/' || currentPath === '') && targetPath.endsWith('/index.html')) return true;
        if ((targetPath === '/' || targetPath === '') && currentPath.endsWith('/index.html')) return true;
        return false;
    }

    function applyActiveStates() {
        const currentPath = getCurrentRoutePath();
        const allLinks = nav.querySelectorAll('a[href]');
        const hashPath = normalizePath(extractHashRoutePath() || '');
        const inSections = currentPath.includes('/seccions/') || hashPath.includes('/seccions/');
        const hasOpenDropdown = [drop, fbDrop, seniorDrop].some(function (dropdownEl) {
            return !!(dropdownEl && dropdownEl.classList.contains('open'));
        });

        allLinks.forEach(function (anchor) {
            const targetPath = normalizePath(anchor.getAttribute('href'));
            let active = isSamePath(currentPath, targetPath);

            if (anchor.classList.contains('cf-nav-link-home')) {
                active = !inSections && isSamePath(currentPath, homePath) && !hasOpenDropdown;
            }

            anchor.classList.toggle('active', active);
        });

        if (drop) {
            drop.classList.toggle('has-active', !!drop.querySelector('a.active'));
        }
        if (fbDrop) {
            fbDrop.classList.toggle('has-active', !!fbDrop.querySelector('a.active'));
        }
        if (seniorDrop) {
            seniorDrop.classList.toggle('has-active', !!seniorDrop.querySelector('a.active'));
        }
    }

    function closeAllDropdowns() {
        let changed = false;

        if (drop && drop.classList.contains('open')) {
            drop.classList.remove('open');
            changed = true;
        }
        if (fbDrop && fbDrop.classList.contains('open')) {
            fbDrop.classList.remove('open');
            changed = true;
        }
        if (seniorDrop && seniorDrop.classList.contains('open')) {
            seniorDrop.classList.remove('open');
            changed = true;
        }

        if (changed) {
            applyActiveStates();
        }
    }

    function positionDropdownMenu(targetDropdown) {
        if (!targetDropdown || mobileQuery.matches) return;

        const menu = targetDropdown.querySelector('.cf-nav-menu');
        if (!menu) return;

        if (targetDropdown === fbDrop) {
            menu.style.left = '0';
            menu.style.right = '0';
            menu.style.transform = 'translateX(0)';
            return;
        }

        menu.style.left = '0';
        menu.style.right = 'auto';
        menu.style.transform = 'translateX(0)';

        const margin = 8;
        const rect = menu.getBoundingClientRect();
        let shift = 0;

        if (rect.right > (window.innerWidth - margin)) {
            shift -= (rect.right - (window.innerWidth - margin));
        }
        if ((rect.left + shift) < margin) {
            shift += (margin - (rect.left + shift));
        }

        if (shift !== 0) {
            menu.style.transform = `translateX(${Math.round(shift)}px)`;
        }
    }

    function toggleDropdown(targetDropdown) {
        if (!targetDropdown) return;
        const shouldOpen = !targetDropdown.classList.contains('open');
        closeAllDropdowns();
        if (shouldOpen) {
            targetDropdown.classList.add('open');
            requestAnimationFrame(function () {
                positionDropdownMenu(targetDropdown);
            });
        }
        applyActiveStates();
    }

    function syncMobileOpenButton(open) {
        if (!mobileOpenBtn) return;
        mobileOpenBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        mobileOpenBtn.setAttribute('aria-label', open ? 'Tancar menú' : 'Obrir menú');
        mobileOpenBtn.title = open ? 'Tancar menú' : 'Obrir menú';
        mobileOpenBtn.textContent = open ? 'Tancar »' : 'Menú ☰';
    }

    function setMobileMenuOpen(open) {
        const isMobile = mobileQuery.matches;
        if (!isMobile) {
            wrap.classList.remove('mobile-open');
            document.body.classList.remove('cf-nav-open');
            if (mainNav) mainNav.setAttribute('aria-hidden', 'false');
            syncMobileOpenButton(false);
            return;
        }

        wrap.classList.toggle('mobile-open', open);
        document.body.classList.toggle('cf-nav-open', open);
        if (mainNav) mainNav.setAttribute('aria-hidden', open ? 'false' : 'true');
        syncMobileOpenButton(open);
        if (!open) closeAllDropdowns();
    }

    function syncResponsiveMenuState() {
        if (mobileQuery.matches) {
            if (mainNav) {
                mainNav.setAttribute('aria-hidden', wrap.classList.contains('mobile-open') ? 'false' : 'true');
            }
            return;
        }

        setMobileMenuOpen(false);

        [drop, fbDrop, seniorDrop].forEach(function (dropdownEl) {
            if (dropdownEl && dropdownEl.classList.contains('open')) {
                positionDropdownMenu(dropdownEl);
            }
        });
    }

    if (btn) {
        btn.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleDropdown(drop);
        });
    }

    if (fbBtn) {
        fbBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleDropdown(fbDrop);
        });
    }

    if (seniorBtn) {
        seniorBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleDropdown(seniorDrop);
        });
    }

    if (mobileOpenBtn) {
        mobileOpenBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            setMobileMenuOpen(!wrap.classList.contains('mobile-open'));
        });
    }

    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', function () {
            setMobileMenuOpen(false);
        });
    }

    document.addEventListener('click', function (event) {
        let changed = false;

        if (drop && !drop.contains(event.target) && drop.classList.contains('open')) {
            drop.classList.remove('open');
            changed = true;
        }
        if (fbDrop && !fbDrop.contains(event.target) && fbDrop.classList.contains('open')) {
            fbDrop.classList.remove('open');
            changed = true;
        }
        if (seniorDrop && !seniorDrop.contains(event.target) && seniorDrop.classList.contains('open')) {
            seniorDrop.classList.remove('open');
            changed = true;
        }

        if (changed) {
            applyActiveStates();
        }

        if (!mobileQuery.matches || !wrap.classList.contains('mobile-open')) return;
        if (!mainNav || !mobileOpenBtn) return;

        const clickedInsideNav = mainNav.contains(event.target);
        const clickedOpenBtn = mobileOpenBtn.contains(event.target);
        if (!clickedInsideNav && !clickedOpenBtn) {
            setMobileMenuOpen(false);
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        closeAllDropdowns();
        setMobileMenuOpen(false);
    });

    if (mainNav) {
        mainNav.addEventListener('click', function (event) {
            const anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
            if (anchor && mobileQuery.matches) {
                setMobileMenuOpen(false);
            }
        });
    }

    window.addEventListener('hashchange', applyActiveStates);
    window.addEventListener('resize', syncResponsiveMenuState);

    if (mobileQuery && typeof mobileQuery.addEventListener === 'function') {
        mobileQuery.addEventListener('change', syncResponsiveMenuState);
    } else if (mobileQuery && typeof mobileQuery.addListener === 'function') {
        mobileQuery.addListener(syncResponsiveMenuState);
    }

    applyActiveStates();
    syncResponsiveMenuState();
    initStaffCarnetFeature();

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function () {
            try {
                await fetch(`${base}/api/auth/logout`, { method: 'POST', credentials: 'same-origin' });
            } catch (_) {}
            window.location.href = `${base}/login.html`;
        });
    }

    function stripAccents(value) {
        return String(value || '')
            .normalize('NFD')
            .split('')
            .filter(function (char) {
                const code = char.charCodeAt(0);
                return code < 768 || code > 879;
            })
            .join('');
    }

    function isReadMethod(method) {
        const normalizedMethod = String(method || 'GET').toUpperCase();
        return normalizedMethod === 'GET' || normalizedMethod === 'HEAD' || normalizedMethod === 'OPTIONS';
    }

    function ensureReadOnlyStyle() {
        if (document.getElementById('cf-readonly-style')) return;

        const readOnlyStyle = document.createElement('style');
        readOnlyStyle.id = 'cf-readonly-style';
        readOnlyStyle.textContent = `
            body.cf-readonly .cf-readonly-neutral-btn {
                pointer-events: none !important;
                cursor: default !important;
                text-decoration: none !important;
                color: inherit !important;
            }

            body.cf-readonly .cf-readonly-locked,
            body.cf-readonly .cf-readonly-locked:disabled,
            body.cf-readonly .cf-readonly-locked[readonly] {
                background: #f8fafc !important;
                color: #475569 !important;
                cursor: not-allowed !important;
            }
        `;

        document.head.appendChild(readOnlyStyle);
    }

    function hideReadOnlyElement(element) {
        if (!element || element.dataset.cfReadonlyHidden === '1') return;
        element.dataset.cfReadonlyHidden = '1';
        element.style.setProperty('display', 'none', 'important');
        element.setAttribute('aria-hidden', 'true');
    }

    function lockReadOnlyControl(control) {
        if (!control || control.dataset.cfReadonlyLocked === '1') return;
        const tagName = String(control.tagName || '').toUpperCase();
        const inputType = String(control.type || '').toLowerCase();

        if (tagName === 'INPUT') {
            if (inputType === 'hidden') return;
            if (inputType === 'checkbox' || inputType === 'radio' || inputType === 'file' || inputType === 'button' || inputType === 'submit' || inputType === 'reset' || inputType === 'date' || inputType === 'time' || inputType === 'datetime-local' || inputType === 'number' || inputType === 'range' || inputType === 'color') {
                control.disabled = true;
            } else {
                control.readOnly = true;
                control.tabIndex = -1;
            }
        } else if (tagName === 'TEXTAREA') {
            control.readOnly = true;
            control.tabIndex = -1;
        } else if (tagName === 'SELECT' || tagName === 'BUTTON') {
            control.disabled = true;
        }

        control.dataset.cfReadonlyLocked = '1';
        control.classList.add('cf-readonly-locked');
        control.setAttribute('aria-disabled', 'true');
    }

    function shouldHideOnclickAction(handlerText) {
        const handler = String(handlerText || '').toLowerCase();
        if (!handler) return false;

        return handler.includes('addplayer(') ||
            handler.includes('addpartit(') ||
            handler.includes('addobs(') ||
            handler.includes('addhorariglobal(') ||
            handler.includes('addcandidate(') ||
            handler.includes('addcontact(') ||
            handler.includes('addscoutingplayer(') ||
            handler.includes('removeplayer(') ||
            handler.includes('removepartit(') ||
            handler.includes('removeobs(') ||
            handler.includes('removehorariglobal(') ||
            handler.includes('removecandidate(') ||
            handler.includes('deleteplayer(') ||
            handler.includes('deletecontact(') ||
            handler.includes('showaddform(');
    }

    function shouldLockInlineChange(handlerText) {
        const handler = String(handlerText || '').toLowerCase();
        if (!handler) return false;

        return handler.includes('update') ||
            handler.includes('save') ||
            handler.includes('delete') ||
            handler.includes('remove') ||
            handler.includes('add');
    }

    function hideReadOnlyActionColumns() {
        document.querySelectorAll('table').forEach(function (tableEl) {
            const headerRows = tableEl.querySelectorAll('thead tr');
            if (!headerRows.length) return;
            const detailLinkSelector = 'a[href*="playerId="], a[href*="jugador-detall.html?playerId="], a.btn-edit';

            const hiddenIndexes = [];
            headerRows.forEach(function (rowEl) {
                Array.from(rowEl.cells || []).forEach(function (cellEl, index) {
                    const label = stripAccents(cellEl.textContent || '').trim().toLowerCase();
                    if (!label) return;
                    if (label === 'x' || label === '✕' || label.includes('accio')) {
                        hiddenIndexes.push(index);
                    }
                });
            });

            [...new Set(hiddenIndexes)].forEach(function (index) {
                const hasDetailNavigation = Array.from(tableEl.querySelectorAll('tr')).some(function (rowEl) {
                    const targetCell = rowEl.cells && rowEl.cells[index] ? rowEl.cells[index] : null;
                    return !!(targetCell && targetCell.querySelector(detailLinkSelector));
                });

                if (hasDetailNavigation) {
                    return;
                }

                tableEl.querySelectorAll('tr').forEach(function (rowEl) {
                    const targetCell = rowEl.cells && rowEl.cells[index] ? rowEl.cells[index] : null;
                    if (targetCell) {
                        targetCell.style.setProperty('display', 'none', 'important');
                    }
                });
            });
        });
    }

    function applyReadOnlyDomGuards() {
        if (!document.body || !document.body.classList.contains('cf-readonly')) return;

        document.querySelectorAll(READONLY_HIDE_SELECTOR).forEach(function (element) {
            hideReadOnlyElement(element);
        });

        document.querySelectorAll('[onclick]').forEach(function (element) {
            const handlerText = element.getAttribute('onclick') || '';
            if (shouldHideOnclickAction(handlerText)) {
                hideReadOnlyElement(element);
            }
        });

        document.querySelectorAll('[onchange],[oninput]').forEach(function (control) {
            const inlineHandler = `${control.getAttribute('onchange') || ''} ${control.getAttribute('oninput') || ''}`;
            if (shouldLockInlineChange(inlineHandler)) {
                lockReadOnlyControl(control);
            }
        });

        document.querySelectorAll('button[data-action="edit"], .name-link[data-action="edit"]').forEach(function (buttonEl) {
            const isCaptacioDetailTrigger = buttonEl.classList.contains('name-link') && buttonEl.hasAttribute('data-id');
            if (isCaptacioDetailTrigger) {
                return;
            }

            if (buttonEl.dataset.cfReadonlyNeutralized === '1') return;
            buttonEl.dataset.cfReadonlyNeutralized = '1';
            buttonEl.removeAttribute('data-action');
            buttonEl.setAttribute('tabindex', '-1');
            buttonEl.classList.add('cf-readonly-neutral-btn');
        });

        document.querySelectorAll(READONLY_LOCK_SELECTOR).forEach(function (control) {
            lockReadOnlyControl(control);
        });

        hideReadOnlyActionColumns();
    }

    function applyReadOnlyFetchGuard() {
        if (readOnlyFetchGuardApplied || typeof window.fetch !== 'function') return;

        const nativeFetch = window.fetch.bind(window);
        readOnlyFetchGuardApplied = true;

        window.fetch = function (input, init) {
            const requestUrl = typeof input === 'string'
                ? input
                : (input && typeof input === 'object' && input.url ? String(input.url) : '');
            const requestMethod = String(
                (init && init.method) ||
                (input && typeof input === 'object' && input.method) ||
                'GET'
            ).toUpperCase();

            const logoutCall = /\/api\/auth\/logout(?:\?|$)/i.test(requestUrl);
            if (!isReadMethod(requestMethod) && !logoutCall) {
                return Promise.resolve(new Response(
                    JSON.stringify({ error: 'Read-only mode' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                ));
            }

            return nativeFetch(input, init);
        };
    }

    function enableReadOnlyMode() {
        if (!document.body) return;

        document.body.classList.add('cf-readonly');
        ensureReadOnlyStyle();
        applyReadOnlyFetchGuard();
        applyReadOnlyDomGuards();

        if (!readOnlyObserver && typeof MutationObserver === 'function') {
            readOnlyObserver = new MutationObserver(function () {
                applyReadOnlyDomGuards();
            });
            readOnlyObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

    function normalizeRole(role) {
        const raw = stripAccents(role).trim().toLowerCase();
        if (!raw) return '';

        let compact = raw.split(' ').join('_').split('-').join('_');
        while (compact.includes('__')) compact = compact.split('__').join('_');

        if (compact === 'administrator' || compact === 'superadmin') return 'admin';
        if (compact === 'management' || compact === 'direccion') return 'direccio';
        if (compact === 'base') return 'futbol_base';
        if (compact === 'read' || compact === 'readonly' || compact === 'lectura') return 'viewer';
        return compact;
    }

    function normalizeRoleList(rawRoles) {
        if (Array.isArray(rawRoles)) {
            return [...new Set(rawRoles.map(normalizeRole).filter(Boolean))];
        }

        if (typeof rawRoles === 'string') {
            return [...new Set(rawRoles.split(',').map(function (part) {
                return normalizeRole(part);
            }).filter(Boolean))];
        }

        if (rawRoles && typeof rawRoles === 'object' && Array.isArray(rawRoles.roles)) {
            return [...new Set(rawRoles.roles.map(normalizeRole).filter(Boolean))];
        }

        return [];
    }

    function hasAnyRole(roles, required) {
        const normalizedRoles = normalizeRoleList(roles);
        if (!normalizedRoles.length) return false;
        if (normalizedRoles.includes('admin')) return true;
        return required.some(function (roleName) {
            return normalizedRoles.includes(roleName);
        });
    }

    function isViewerOnly(roles) {
        const normalizedRoles = normalizeRoleList(roles);
        if (!normalizedRoles.length) return false;
        return normalizedRoles.every(function (roleName) {
            return roleName === 'viewer';
        });
    }

    function decodeSafeUriComponent(value) {
        const raw = String(value || '');
        if (!raw) return '';
        try {
            return decodeURIComponent(raw);
        } catch (_) {
            return raw;
        }
    }

    async function refreshAfterCaptacioIncorporacio() {
        if (typeof window.load === 'function') {
            const maybePromise = window.load();
            if (maybePromise && typeof maybePromise.then === 'function') {
                await maybePromise;
            }
            return;
        }

        window.location.reload();
    }

    function getIncorporarEndpointCandidates() {
        const unique = new Set();
        [
            `${base}/api/jugadors-seguiment/incorporar`,
            '/api/jugadors-seguiment/incorporar',
            `${base}/api/jugadors-seguiment/incorporar/`,
            '/api/jugadors-seguiment/incorporar/'
        ].forEach(function (value) {
            const url = String(value || '').trim();
            if (!url) return;
            unique.add(url);
        });

        return [...unique];
    }

    async function postIncorporarJugador(payload) {
        const endpoints = getIncorporarEndpointCandidates();
        let lastError = null;

        for (const endpoint of endpoints) {
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json().catch(() => ({}));

                if (res.status === 404) {
                    lastError = new Error('Error 404');
                    continue;
                }

                return { res, data };
            } catch (err) {
                lastError = err;
            }
        }

        throw (lastError || new Error('No s\'ha pogut contactar amb el servidor.'));
    }

    window.cfIncorporarCaptacioJugador = async function (payload, triggerButton) {
        const rawPlayerId = payload && payload.playerId;
        const rawEquipId = payload && payload.equipId;
        const rawScope = payload && payload.scope;

        const playerId = decodeSafeUriComponent(rawPlayerId).trim();
        const equipIdText = decodeSafeUriComponent(rawEquipId).trim();
        const scope = decodeSafeUriComponent(rawScope).trim();
        const equipId = Number(equipIdText);

        if (!playerId || !scope || !Number.isInteger(equipId) || equipId <= 0) {
            alert('No s\'ha pogut resoldre el jugador o l\'equip per fer la incorporació.');
            return;
        }

        if (!window.confirm('Vols incorporar aquest jugador a la plantilla?')) {
            return;
        }

        const button = triggerButton && typeof triggerButton === 'object' ? triggerButton : null;
        const previousText = button ? String(button.textContent || '') : '';
        const previousDisabled = button ? !!button.disabled : false;

        if (button) {
            button.disabled = true;
            button.textContent = 'INCORPORANT...';
        }

        try {
            const { res, data } = await postIncorporarJugador({
                jugador_id: playerId,
                equip_id: equipId,
                scope
            });

            if (!res.ok) {
                throw new Error(data && (data.details || data.error) ? (data.details || data.error) : `Error ${res.status}`);
            }

            await refreshAfterCaptacioIncorporacio();

            const playerName = data && data.jugador && data.jugador.nom
                ? String(data.jugador.nom)
                : 'El jugador';
            alert(`${playerName} s'ha incorporat a la plantilla.`);
        } catch (err) {
            alert(err && err.message ? err.message : 'No s\'ha pogut incorporar el jugador.');
        } finally {
            if (button) {
                button.disabled = previousDisabled;
                button.textContent = previousText || 'INCORPORAR A PLANTILLA';
            }
        }
    };

    (async function applyRoleVisibility() {
        try {
            const res = await fetch(`${base}/api/auth/session`, { credentials: 'same-origin' });
            if (!res.ok) return;

            const data = await res.json();
            const roles = normalizeRoleList(
                (data && data.user && (data.user.roles ?? data.user.role)) ??
                (data ? (data.roles ?? data.role) : [])
            );

            if (isViewerOnly(roles)) {
                enableReadOnlyMode();
                return;
            }

            const direccioAllowed = hasAnyRole(roles, ['direccio']);
            const seniorAllowed = hasAnyRole(roles, ['direccio', 'senior']);
            const baseAllowed = hasAnyRole(roles, ['direccio', 'futbol_base']);
            const scoutingAllowed = hasAnyRole(roles, ['direccio', 'scouting']);

            if (seniorDrop) seniorDrop.style.display = seniorAllowed ? '' : 'none';
            if (fbDrop) fbDrop.style.display = baseAllowed ? '' : 'none';

            const staffClubEntry = document.getElementById('cf-staff-club-entry');
            if (staffClubEntry) staffClubEntry.style.display = direccioAllowed ? '' : 'none';

            const scoutingSeniorEntry = document.getElementById('cf-scouting-senior-entry');
            if (scoutingSeniorEntry) scoutingSeniorEntry.style.display = scoutingAllowed ? '' : 'none';

            const scoutingBaseEntry = document.getElementById('cf-scouting-base-entry');
            if (scoutingBaseEntry) scoutingBaseEntry.style.display = scoutingAllowed ? '' : 'none';
        } catch (_) {}
    })();
})();
