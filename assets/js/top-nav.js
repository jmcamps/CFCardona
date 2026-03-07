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
        'juvenil-femeni.html': 'Juvenil Femení'
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
        if (!Object.keys(carnetPayload).length) return init;

        return Object.assign({}, options, {
            body: JSON.stringify(Object.assign({}, parsedBody, carnetPayload))
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
        } catch (_) {}
    }

    function initStaffCarnetFeature() {
        injectStaffCarnetColumn();
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
        return normalizedRoles.length === 0 || (normalizedRoles.length === 1 && normalizedRoles[0] === 'viewer');
    }

    (async function applyRoleVisibility() {
        try {
            const res = await fetch(`${base}/api/auth/session`, { credentials: 'same-origin' });
            if (!res.ok) return;

            const data = await res.json();
            const roles = data && data.user ? normalizeRoleList(data.user.roles) : [];

            if (isViewerOnly(roles)) {
                enableReadOnlyMode();
                return;
            }

            const seniorAllowed = hasAnyRole(roles, ['direccio', 'senior']);
            const baseAllowed = hasAnyRole(roles, ['direccio', 'futbol_base']);
            const scoutingAllowed = hasAnyRole(roles, ['direccio', 'scouting']);

            if (seniorDrop && !seniorAllowed) seniorDrop.style.display = 'none';
            if (fbDrop && !baseAllowed) fbDrop.style.display = 'none';

            const scoutingSeniorEntry = document.getElementById('cf-scouting-senior-entry');
            if (scoutingSeniorEntry && !scoutingAllowed) scoutingSeniorEntry.style.display = 'none';

            const scoutingBaseEntry = document.getElementById('cf-scouting-base-entry');
            if (scoutingBaseEntry && !scoutingAllowed) scoutingBaseEntry.style.display = 'none';
        } catch (_) {}
    })();
})();
