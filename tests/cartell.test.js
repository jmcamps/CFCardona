const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { chromium } = require('playwright');
const template = require('../assets/js/cartell-template');
const root = path.resolve(__dirname, '..');
const weekend = '2026-10-17';
const teams = [
    { id:'1', name:'S12 (Aleví)' }, { id:'2', name:'S9 (Benjamí)' }, { id:'3', name:'Infantil Masculí' },
    { id:'4', name:'Juvenil Femení' }, { id:'5', name:'Juvenil B' }, { id:'6', name:'Sènior A' }
];
const base = { date:weekend, time:'10:00', format:'F7', local_locker:'3', visitor_locker:'6',
    local_notes:'', visitor_notes:'', veo:false, field:'dret', comments:'' };
const matches = [
    { ...base, id:'1', team_id:'1', rival:'CF Pare Ignasi Puig', veo:true },
    { ...base, id:'2', team_id:'2', rival:'CF Santpedor', field:'esquerre', local_locker:'5', visitor_locker:'1' },
    { ...base, id:'3', team_id:'1', rival:'CF Navarcles', time:'11:30', local_notes:'Entrada per la porta lateral.', visitor_locker:'2' },
    { ...base, id:'4', team_id:'3', rival:'CF Sant Salvador', time:'14:30', format:'F11', field:'' },
    { ...base, id:'5', team_id:'4', rival:'FC Fruitosenc', time:'16:30', format:'F11', field:'', visitor_locker:'1+2', visitor_notes:'Canvi i dutxa als vestidors 1 i 2.', comments:'Accés als vestidors amb el responsable de la jornada.' },
    { ...base, id:'6', team_id:'5', rival:'CE Navàs', time:'18:30', format:'F11', field:'', veo:true },
    { ...base, id:'7', team_id:'6', rival:'CF Capellades', date:'2026-10-18', time:'16:30', format:'F11', field:'', local_locker:'4', comments:'Ens veiem al camp!' }
];

test('Plantilla: dates reals, ordre, camps, VEO, vestidors i escapament', () => {
    const html = template.render(weekend, [...matches].reverse(), teams);
    assert.match(html, /17 i 18 d’octubre del? 2026/);
    assert.match(html, /Vestidor 1\+2/);
    assert.match(html, /Canvi i dutxa als vestidors 1 i 2/);
    assert.match(html, /Camp esquerre/);
    assert.match(html, /Camp complet/);
    assert.match(html, /Observacions del partit/);
    assert.ok(html.indexOf('CF Pare Ignasi Puig') < html.indexOf('CF Capellades'));
    assert.equal((html.match(/class="veo-mark"/g) || []).length, 2);
    const escaped = template.render(weekend, [{ ...matches[0], rival:'<script>bad()</script>', local_locker:'', field:'' }], teams);
    assert.doesNotMatch(escaped, /<script>/);
    assert.match(escaped, /&lt;script&gt;/);
    assert.match(escaped, /Vestidor pendent/);
    assert.match(escaped, /Camp pendent/);
    assert.match(template.weekendLabel('2026-10-31'), /octubre.*novembre/);
});

const browserPath = process.env.CHROME_BIN || (process.platform === 'win32'
    ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : chromium.executablePath());

test('Navegador: botó, previsualització responsive, PNG real de 2700 px i impressió', {
    skip:!fs.existsSync(browserPath), timeout:60000
}, async t => {
    const server = http.createServer((req, res) => {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname.startsWith('/api/')) {
            res.setHeader('Content-Type', 'application/json');
            const data = url.pathname === '/api/auth/session' ? { authenticated:true, user:{ roles:['direccio'] } }
                : url.pathname === '/api/equips' ? teams
                : url.pathname === '/api/planificacio-jornada' ? { matches:url.searchParams.get('weekend') === weekend ? matches : [], revision:'test' } : [];
            res.end(JSON.stringify(data));
            return;
        }
        const file = url.pathname === '/assets/vendor/html-to-image.js'
            ? path.join(root, 'node_modules/html-to-image/dist/html-to-image.js') : path.join(root, decodeURIComponent(url.pathname));
        if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
        const mime = { '.js':'application/javascript', '.css':'text/css', '.html':'text/html; charset=utf-8', '.png':'image/png', '.jpeg':'image/jpeg' };
        res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
        fs.createReadStream(file).pipe(res);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
    const browser = await chromium.launch({ executablePath:browserPath, headless:true });
    t.after(() => browser.close());
    const page = await browser.newPage({ viewport:{ width:1000, height:1000 }, acceptDownloads:true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const origin = `http://127.0.0.1:${server.address().port}`;
    await page.goto(`${origin}/seccions/planificacio-jornada.html?weekend=${weekend}`);
    await page.waitForFunction(() => !document.getElementById('generatePosterBtn').disabled);
    await page.getByRole('button', { name:'Generar cartell' }).click();
    await page.waitForURL(/cartell-jornada/);
    await page.waitForFunction(() => !document.getElementById('downloadPoster').disabled);
    assert.equal(await page.locator('.poster-match').count(), 7);
    assert.equal(await page.locator('#poster').evaluate(node => node.scrollWidth), 900);
    const layout = await page.locator('.poster-match').first().evaluate(row => {
        const poster = document.getElementById('poster').getBoundingClientRect();
        const time = row.querySelector('.poster-time').getBoundingClientRect();
        const team = row.querySelector('.team-heading').getBoundingClientRect();
        const locker = row.querySelector('.locker-assignment').getBoundingClientRect();
        const kickoff = row.querySelector('.kickoff').getBoundingClientRect();
        const options = row.querySelector('.poster-options');
        return {
            centered:Math.abs((time.left + time.right) / 2 - (poster.left + poster.right) / 2) < 1,
            lockerBelow:locker.top >= team.bottom,
            iconsBelow:options.getBoundingClientRect().top >= kickoff.bottom,
            iconText:options.textContent.trim(),
            lockerIconText:row.querySelector('.locker-icon').textContent.trim(),
            largestIcon:Math.max(...Array.from(options.querySelectorAll('img,svg')).map(icon => icon.getBoundingClientRect().height))
        };
    });
    assert.equal(layout.centered, true);
    assert.equal(layout.lockerBelow, true);
    assert.equal(layout.iconsBelow, true);
    assert.equal(layout.iconText, '17');
    assert.equal(layout.lockerIconText, '');
    assert.ok(layout.largestIcon <= 28);
    const screenshotPath = path.join(os.tmpdir(), 'cfcardona-cartell-preview.png');
    await page.locator('#poster').screenshot({ path:screenshotPath });
    const downloading = page.waitForEvent('download');
    await page.getByRole('button', { name:'Descarregar PNG' }).click();
    const downloaded = await downloading;
    assert.equal(downloaded.suggestedFilename(), `CF-Cardona-partits-a-casa-${weekend}.png`);
    const pngPath = path.join(os.tmpdir(), 'cfcardona-cartell-export.png');
    await downloaded.saveAs(pngPath);
    const png = fs.readFileSync(pngPath);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 2700);
    assert.ok(png.readUInt32BE(20) >= 3819);
    await page.setViewportSize({ width:390, height:844 });
    await page.waitForFunction(() => document.getElementById('poster').getBoundingClientRect().width <= 366.01);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
    await page.emulateMedia({ media:'print' });
    assert.equal(await page.locator('.toolbar').isVisible(), false);
    const pdf = await page.pdf({ preferCSSPageSize:true, printBackground:true });
    assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
    assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length, 1);
    await page.emulateMedia({ media:'screen' });
    await page.goto(`${origin}/seccions/planificacio-jornada.html?weekend=2026-10-10`);
    await page.waitForSelector('.empty');
    assert.equal(await page.locator('#generatePosterBtn').isDisabled(), true);
    await page.goto(`${origin}/seccions/cartell-jornada.html?weekend=2026-10-10`);
    await page.waitForFunction(() => document.getElementById('posterStatus').textContent.includes('No hi ha partits'));
    assert.equal(await page.locator('#downloadPoster').isDisabled(), true);
    assert.deepEqual(errors, []);
    t.diagnostic(`Previsualització: ${screenshotPath}; PNG: ${pngPath}`);
});
