(async function () {
    'use strict';
    const D = window.JornadaData;
    const poster = document.getElementById('poster');
    const preview = document.getElementById('preview');
    const download = document.getElementById('downloadPoster');
    const print = document.getElementById('printPoster');
    const status = document.getElementById('posterStatus');
    let weekend, exporting = false;
    const message = (text, error = false) => { status.textContent = text; status.className = error ? 'error' : ''; };
    function fitPreview() {
        const scale = Math.min(1, preview.clientWidth / 900);
        poster.style.transform = `scale(${scale})`;
        preview.style.height = `${poster.scrollHeight * scale}px`;
        // Una pàgina A3 amb marges de 10 mm, també per jornades amb més files.
        poster.style.setProperty('--print-scale', Math.min(1.16, 1505 / poster.scrollHeight));
    }
    async function request(url) {
        const response = await fetch(url, { credentials:'same-origin' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'No s’han pogut carregar les dades.');
        return data;
    }
    async function waitForImages() {
        await Promise.all(Array.from(poster.querySelectorAll('img')).map(img => img.decode()));
    }
    download.addEventListener('click', async () => {
        if (exporting || download.disabled) return;
        exporting = true;
        download.disabled = print.disabled = true;
        message('Generant PNG d’alta resolució…');
        try {
            if (!window.htmlToImage) throw new Error('No s’ha pogut carregar el generador de PNG. Recarrega la pàgina.');
            await waitForImages();
            const blob = await window.htmlToImage.toBlob(poster, {
                width:900, height:poster.scrollHeight, pixelRatio:3, backgroundColor:'#ffffff',
                style:{ transform:'none' }, skipFonts:true, fontEmbedCSS:''
            });
            if (!blob) throw new Error('No s’ha pogut generar la imatge.');
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `CF-Cardona-partits-a-casa-${weekend}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            message('PNG generat. Ja pots penjar o imprimir el cartell.');
        } catch (error) { message(error.message || 'No s’ha pogut generar el PNG. Pots provar l’opció d’imprimir.', true); }
        finally { exporting = false; download.disabled = print.disabled = false; }
    });
    print.addEventListener('click', () => { if (!print.disabled) window.print(); });
    try {
        weekend = D.validateWeekend(new URLSearchParams(location.search).get('weekend') || D.nextWeekend());
        document.getElementById('backLink').href = `planificacio-jornada.html?weekend=${weekend}`;
        const [data, teams] = await Promise.all([request(`/api/planificacio-jornada?weekend=${weekend}`), request('/api/equips')]);
        const matches = D.withSharedLockerNotes(D.normalizeMatches(data.matches, weekend), teams);
        if (!matches.length) { message('No hi ha partits locals planificats per a aquest cap de setmana.'); return; }
        poster.innerHTML = window.CartellTemplate.render(weekend, matches, teams);
        poster.hidden = false;
        fitPreview();
        await waitForImages();
        fitPreview();
        new ResizeObserver(fitPreview).observe(preview);
        download.disabled = print.disabled = false;
        message(`${matches.length} partits · PNG de 2700 píxels d’amplada.`);
        document.title = `Partits a casa ${D.label(weekend)} | CF Cardona`;
    } catch (error) { message(error.message || 'No s’ha pogut preparar el cartell.', true); }
})();
