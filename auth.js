(function () {
    const form = document.getElementById('login-form');
    const msg = document.getElementById('login-msg');
    const btn = document.getElementById('login-btn');

    function parseParamsFromSearchAndHash() {
        const out = {};
        const parse = (source) => {
            if (!source) return;
            const text = source.startsWith('#') || source.startsWith('?') ? source.slice(1) : source;
            const params = new URLSearchParams(text);
            for (const [k, v] of params.entries()) {
                out[k] = v;
            }
        };
        parse(window.location.search);
        parse(window.location.hash);
        return out;
    }

    async function handleSupabaseCallback() {
        const params = parseParamsFromSearchAndHash();
        const accessToken = String(params.access_token || '').trim();
        const expiresIn = Number(params.expires_in || 3600);
        const callbackType = String(params.type || '').trim().toLowerCase();
        const errorDescription = String(params.error_description || params.error || '').trim();

        if (errorDescription) {
            msg.textContent = decodeURIComponent(errorDescription);
            msg.className = 'msg err';
            return false;
        }

        if (!accessToken) {
            return false;
        }

        msg.textContent = 'Validant invitació...';
        msg.className = 'msg';

        try {
            const res = await fetch('/api/auth/exchange', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ access_token: accessToken, expires_in: expiresIn })
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || data.details || 'No s\'ha pogut validar la invitació');
            }

            window.history.replaceState({}, document.title, '/login.html');
            if (callbackType === 'invite') {
                window.location.replace('/set-password.html');
            } else {
                window.location.replace('/index.html');
            }
            return true;
        } catch (err) {
            msg.textContent = err && err.message ? err.message : 'Error validant invitació';
            msg.className = 'msg err';
            return false;
        }
    }

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

    (async function initAuthFlow() {
        const handled = await handleSupabaseCallback();
        if (!handled) {
            checkSessionAndRedirect();
        }
    })();

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
