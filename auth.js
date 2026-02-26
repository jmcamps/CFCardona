(function () {
    const form = document.getElementById('login-form');
    const msg = document.getElementById('login-msg');
    const btn = document.getElementById('login-btn');

    async function checkSessionAndRedirect() {
        try {
            const res = await fetch('/api/auth/session', { credentials: 'same-origin' });
            const data = await res.json();
            if (data && data.authenticated) {
                window.location.replace('/index.html');
            }
        } catch (_) {}
    }

    if (!form) {
        return;
    }

    checkSessionAndRedirect();

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        msg.textContent = '';
        msg.className = 'msg';
        btn.disabled = true;

        const email = String(document.getElementById('email').value || '').trim();
        const password = String(document.getElementById('password').value || '');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ email, password })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || 'No s\'ha pogut iniciar sessió');
            }
            msg.textContent = 'Sessió iniciada';
            msg.className = 'msg ok';
            window.location.replace('/index.html');
        } catch (err) {
            msg.textContent = err && err.message ? err.message : 'Error de login';
            msg.className = 'msg err';
            btn.disabled = false;
        }
    });
})();
