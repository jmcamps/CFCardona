(function () {
    const form = document.getElementById('set-pass-form');
    const msg = document.getElementById('set-pass-msg');
    const btn = document.getElementById('set-pass-btn');

    async function ensureAuthenticated() {
        try {
            const res = await fetch('/api/auth/session', { credentials: 'same-origin' });
            const data = await res.json();
            if (!data || !data.authenticated) {
                window.location.replace('/login.html');
            }
        } catch (_) {
            window.location.replace('/login.html');
        }
    }

    if (!form) return;
    ensureAuthenticated();

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        msg.textContent = '';
        msg.className = 'msg';

        const password = String(document.getElementById('password').value || '');
        const password2 = String(document.getElementById('password2').value || '');

        if (password.length < 8) {
            msg.textContent = 'La contrasenya ha de tenir mínim 8 caràcters.';
            msg.className = 'msg err';
            return;
        }

        if (password !== password2) {
            msg.textContent = 'Les contrasenyes no coincideixen.';
            msg.className = 'msg err';
            return;
        }

        btn.disabled = true;

        try {
            const res = await fetch('/api/auth/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ password })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || data.details || 'No s\'ha pogut guardar la contrasenya');
            }
            msg.textContent = 'Contrasenya actualitzada. Entrant...';
            msg.className = 'msg ok';
            window.location.replace('/index.html');
        } catch (err) {
            msg.textContent = err && err.message ? err.message : 'Error actualitzant contrasenya';
            msg.className = 'msg err';
            btn.disabled = false;
        }
    });
})();
