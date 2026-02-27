const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
require('dotenv').config();

function cleanEnvVar(value) {
    if (value === undefined || value === null) return '';
    const trimmed = String(value).trim();
    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        return trimmed.slice(1, -1).trim();
    }
    return trimmed;
}

function normalizeSupabaseServiceKey(value) {
    const cleaned = cleanEnvVar(value);
    if (!cleaned) return '';

    const compact = cleaned.replace(/\s+/g, '');

    const tokenMatch = compact.match(/(sb_(?:secret|publishable)_[A-Za-z0-9._-]+)/i);
    if (tokenMatch && tokenMatch[1]) {
        return tokenMatch[1];
    }

    const jwtMatch = compact.match(/(eyJ[A-Za-z0-9._-]+)/);
    if (jwtMatch && jwtMatch[1]) {
        return jwtMatch[1];
    }

    return compact
        .replace(/^apikey[:=]/i, '')
        .replace(/^key[:=]/i, '')
        .replace(/^token[:=]/i, '')
        .replace(/^bearer[:=]?/i, '')
        .trim();
}

function normalizeSupabaseAuthKey(value) {
    const cleaned = cleanEnvVar(value);
    if (!cleaned) return '';

    const compact = cleaned.replace(/\s+/g, '');

    const tokenMatch = compact.match(/(sb_(?:publishable|secret)_[A-Za-z0-9._-]+)/i);
    if (tokenMatch && tokenMatch[1]) {
        return tokenMatch[1];
    }

    const jwtMatch = compact.match(/(eyJ[A-Za-z0-9._-]+)/);
    if (jwtMatch && jwtMatch[1]) {
        return jwtMatch[1];
    }

    return compact
        .replace(/^apikey[:=]/i, '')
        .replace(/^key[:=]/i, '')
        .replace(/^token[:=]/i, '')
        .replace(/^bearer[:=]?/i, '')
        .trim();
}

function normalizeSupabaseUrl(value) {
    const cleaned = cleanEnvVar(value);
    if (!cleaned) return '';

    const withProtocol = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;

    let parsed;
    try {
        parsed = new URL(withProtocol);
    } catch (err) {
        throw new Error(`SUPABASE_URL invàlida: ${withProtocol}`);
    }

    const normalizedPath = (parsed.pathname || '/')
        .replace(/\/+$/, '')
        .replace(/\/rest\/v1$/i, '');

    parsed.pathname = normalizedPath || '/';
    parsed.search = '';
    parsed.hash = '';

    return parsed.toString().replace(/\/$/, '');
}

function describeApiKey(key) {
    const raw = String(key || '').trim();
    if (!raw) return 'missing';
    const type = raw.startsWith('sb_publishable_')
        ? 'publishable'
        : raw.startsWith('sb_secret_')
            ? 'secret'
            : raw.startsWith('eyJ')
                ? 'jwt'
                : 'unknown';
    const start = raw.slice(0, Math.min(12, raw.length));
    const end = raw.slice(-6);
    return `${type}:${start}...${end} (len=${raw.length})`;
}

function isMissingSupabaseTableError(err, tableName) {
    const msg = (err && err.message ? String(err.message) : '').toLowerCase();
    const table = String(tableName || '').toLowerCase();
    return msg.includes(table) && (msg.includes('pgrst205') || msg.includes('could not find the table'));
}

function isMissingSupabaseColumnError(err, columnName) {
    const msg = (err && err.message ? String(err.message) : '').toLowerCase();
    const col = String(columnName || '').toLowerCase();
    return msg.includes(col) && (msg.includes('column') || msg.includes('pgrst')) && (msg.includes('does not exist') || msg.includes('not found'));
}

const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const SUPABASE_URL = normalizeSupabaseUrl(process.env.SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY = normalizeSupabaseServiceKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUPABASE_AUTH_KEY = normalizeSupabaseAuthKey(
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
);
const IS_RENDER = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const IS_PUBLISHABLE_KEY = String(SUPABASE_SERVICE_ROLE_KEY || '').startsWith('sb_publishable_');
const USE_SUPABASE = HAS_SUPABASE_CONFIG;
const AUTH_REQUIRED = USE_SUPABASE;
const SUPABASE_SECCIONS_TABLE = 'seccions_data';
const supabaseBaseUrl = USE_SUPABASE ? new URL(SUPABASE_URL) : null;
const sessionCache = new Map();
const ROLES = {
    ADMIN: 'admin',
    DIRECCIO: 'direccio',
    SENIOR: 'senior',
    FUTBOL_BASE: 'futbol_base',
    SCOUTING: 'scouting',
    VIEWER: 'viewer'
};

if (IS_RENDER && !HAS_SUPABASE_CONFIG) {
    throw new Error('Render sense Supabase configurat: cal definir SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY');
}

if (HAS_SUPABASE_CONFIG && IS_PUBLISHABLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no pot ser una clau publishable (sb_publishable_*). Usa service_role o secret de servidor.');
}

if (AUTH_REQUIRED && !SUPABASE_AUTH_KEY) {
    throw new Error('Auth activada però falta SUPABASE_ANON_KEY o SUPABASE_PUBLISHABLE_KEY');
}

function ensureLocalDataFile() {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, '{}', 'utf8');
    }
}

if (!USE_SUPABASE) {
    ensureLocalDataFile();
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}

function parseCookies(req) {
    const header = req && req.headers ? req.headers.cookie : '';
    if (!header) return {};
    return header.split(';').reduce((acc, pair) => {
        const idx = pair.indexOf('=');
        if (idx === -1) return acc;
        const key = pair.slice(0, idx).trim();
        const value = pair.slice(idx + 1).trim();
        acc[key] = decodeURIComponent(value);
        return acc;
    }, {});
}

function getSessionTokenFromRequest(req) {
    const cookies = parseCookies(req);
    if (cookies.cf_session) return String(cookies.cf_session).trim();

    const authHeader = req && req.headers ? req.headers.authorization : '';
    if (authHeader && /^Bearer\s+/i.test(authHeader)) {
        return authHeader.replace(/^Bearer\s+/i, '').trim();
    }
    return '';
}

function isPublicPath(pathname) {
    const path = String(pathname || '');
    return path === '/login.html' || path === '/auth.js' || path === '/favicon.ico' ||
    path === '/api/auth/login' || path === '/api/auth/logout' || path === '/api/auth/session' || path === '/api/auth/exchange';
}

function setSessionCookie(res, token, maxAgeSeconds = 3600) {
    const maxAge = Math.max(60, Number(maxAgeSeconds) || 3600);
    const secure = IS_RENDER ? '; Secure' : '';
    res.setHeader(
        'Set-Cookie',
        `cf_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${maxAge}`
    );
}

function clearSessionCookie(res) {
    const secure = IS_RENDER ? '; Secure' : '';
    res.setHeader('Set-Cookie', `cf_session=; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=0`);
}

async function verifySupabaseSession(accessToken) {
    const token = String(accessToken || '').trim();
    if (!token) return null;

    const cached = sessionCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.user;
    }

    const user = await supabaseAuthRequest('GET', '/auth/v1/user', null, token);
    if (!user || !user.id) return null;
    sessionCache.set(token, { user, expiresAt: Date.now() + 30 * 1000 });
    return user;
}

function normalizeRoleName(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    const compact = raw
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s-]+/g, '_');

    if (compact === 'admin' || compact === 'administrator' || compact === 'superadmin') return ROLES.ADMIN;
    if (compact === 'direccio' || compact === 'direccion' || compact === 'management') return ROLES.DIRECCIO;
    if (compact === 'senior') return ROLES.SENIOR;
    if (compact === 'futbol_base' || compact === 'base') return ROLES.FUTBOL_BASE;
    if (compact === 'scouting' || compact === 'captacio' || compact === 'captacion') return ROLES.SCOUTING;
    if (compact === 'viewer' || compact === 'read' || compact === 'readonly' || compact === 'lectura') return ROLES.VIEWER;
    return '';
}

function extractUserRoles(user) {
    const metaCandidates = [
        user && typeof user.app_metadata === 'object' ? user.app_metadata : null,
        user && typeof user.user_metadata === 'object' ? user.user_metadata : null,
        user && typeof user.raw_app_meta_data === 'object' ? user.raw_app_meta_data : null,
        user && typeof user.raw_user_meta_data === 'object' ? user.raw_user_meta_data : null
    ].filter(Boolean);

    const buckets = [
        user && user.app_metadata ? user.app_metadata.roles : null,
        user && user.app_metadata ? user.app_metadata.role : null,
        user && user.user_metadata ? user.user_metadata.roles : null,
        user && user.user_metadata ? user.user_metadata.role : null,
        user && user.raw_app_meta_data ? user.raw_app_meta_data.roles : null,
        user && user.raw_app_meta_data ? user.raw_app_meta_data.role : null,
        user && user.raw_user_meta_data ? user.raw_user_meta_data.roles : null,
        user && user.raw_user_meta_data ? user.raw_user_meta_data.role : null,
        user ? user.role : null
    ];

    metaCandidates.forEach(meta => {
        if (meta.roles !== undefined) buckets.push(meta.roles);
        if (meta.role !== undefined) buckets.push(meta.role);
    });

    const collected = [];
    for (const bucket of buckets) {
        if (!bucket) continue;
        if (Array.isArray(bucket)) {
            bucket.forEach(item => collected.push(item));
            continue;
        }
        if (typeof bucket === 'string') {
            bucket.split(',').map(part => part.trim()).filter(Boolean).forEach(item => collected.push(item));
        }
    }

    const normalized = [...new Set(collected.map(normalizeRoleName).filter(Boolean))];
    return normalized.length ? normalized : [ROLES.VIEWER];
}

function hasAnyRole(userRoles, requiredRoles) {
    if (!Array.isArray(userRoles) || !userRoles.length) return false;
    if (!Array.isArray(requiredRoles) || !requiredRoles.length) return true;
    if (userRoles.includes(ROLES.ADMIN)) return true;
    return requiredRoles.some(role => userRoles.includes(role));
}

function isReadMethod(method) {
    const m = String(method || '').toUpperCase();
    return m === 'GET' || m === 'HEAD';
}

function isSeniorPath(pathname) {
    const p = String(pathname || '').toLowerCase();
    return p.startsWith('/seccions/senior') ||
        p.startsWith('/seccions/primer-equip') ||
        p.startsWith('/seccions/filial') ||
        p.startsWith('/web jugadors/') ||
        p.startsWith('/web filial/');
}

function isFutbolBasePath(pathname) {
    const p = String(pathname || '').toLowerCase();
    return p.startsWith('/seccions/futbol-base') ||
        p.startsWith('/seccions/f7') ||
        p.startsWith('/seccions/f11') ||
        p.startsWith('/seccions/minis') ||
        p.startsWith('/seccions/s7') ||
        p.startsWith('/seccions/s8') ||
        p.startsWith('/seccions/s9') ||
        p.startsWith('/seccions/s10') ||
        p.startsWith('/seccions/s11') ||
        p.startsWith('/seccions/s12') ||
        p.startsWith('/seccions/s13') ||
        p.startsWith('/seccions/s14') ||
        p.startsWith('/seccions/s16') ||
        p.startsWith('/seccions/juvenil-masculi') ||
        p.startsWith('/seccions/juvenil-femeni') ||
        p.startsWith('/seccions/alevi-femeni') ||
        p.startsWith('/seccions/infantil-femeni') ||
        p.startsWith('/seccions/cadet-femeni');
}

function isScoutingPath(pathname) {
    const p = String(pathname || '').toLowerCase();
    return p.startsWith('/seccions/scouting') ||
        p.startsWith('/seccions/captacio-futbol-base') ||
        p.startsWith('/seccions/captacio-senior');
}

function getAuthorizationRule(pathname, method) {
    const p = String(pathname || '').toLowerCase();
    const m = String(method || 'GET').toUpperCase();

    if (p === '/api/auth/login' || p === '/api/auth/logout' || p === '/api/auth/session' || p === '/api/auth/exchange') {
        return { requiredRoles: [], readOnlyAllowed: true };
    }

    if (p.startsWith('/api/jugadors-seguiment')) {
        return { requiredRoles: [ROLES.SCOUTING, ROLES.DIRECCIO], readOnlyAllowed: true };
    }

    if (p.startsWith('/api/equips') || p.startsWith('/api/equip-config') || p.startsWith('/api/jugadors') || p.startsWith('/api/rols') || p.startsWith('/api/posicions')) {
        return { requiredRoles: [ROLES.SENIOR, ROLES.FUTBOL_BASE, ROLES.DIRECCIO], readOnlyAllowed: true };
    }

    if (p.startsWith('/api/horarios')) {
        return { requiredRoles: [ROLES.DIRECCIO, ROLES.SENIOR, ROLES.FUTBOL_BASE], readOnlyAllowed: true };
    }

    if (p.startsWith('/api/players') || p.startsWith('/api/observacions')) {
        return { requiredRoles: [ROLES.DIRECCIO, ROLES.SENIOR, ROLES.FUTBOL_BASE, ROLES.SCOUTING], readOnlyAllowed: true };
    }

    if (p.startsWith('/api/')) {
        return { requiredRoles: [ROLES.DIRECCIO], readOnlyAllowed: true };
    }

    if (isSeniorPath(p)) {
        return { requiredRoles: [ROLES.SENIOR, ROLES.DIRECCIO], readOnlyAllowed: true };
    }

    if (isFutbolBasePath(p)) {
        return { requiredRoles: [ROLES.FUTBOL_BASE, ROLES.DIRECCIO], readOnlyAllowed: true };
    }

    if (isScoutingPath(p)) {
        return { requiredRoles: [ROLES.SCOUTING, ROLES.DIRECCIO], readOnlyAllowed: true };
    }

    return { requiredRoles: [], readOnlyAllowed: true, method: m };
}

function isAuthorized(userRoles, pathname, method) {
    const rule = getAuthorizationRule(pathname, method);

    if (hasAnyRole(userRoles, rule.requiredRoles)) {
        return true;
    }

    if (rule.readOnlyAllowed && isReadMethod(method) && userRoles.includes(ROLES.VIEWER) && (!rule.requiredRoles || rule.requiredRoles.length === 0)) {
        return true;
    }

    return false;
}

async function readDatabase() {
    if (USE_SUPABASE) {
        let payload = {};
        try {
            const rows = await supabaseRestRequest('GET', `/rest/v1/${SUPABASE_SECCIONS_TABLE}?select=scope,payload`);
            payload = (Array.isArray(rows) ? rows : []).reduce((acc, row) => {
                const scope = String(row.scope || '').trim();
                if (!scope) return acc;
                acc[scope] = row.payload && typeof row.payload === 'object' ? row.payload : {};
                return acc;
            }, {});
        } catch (err) {
            if (!isMissingSupabaseTableError(err, SUPABASE_SECCIONS_TABLE)) {
                throw err;
            }
            console.warn('seccions_data no existeix a Supabase: es farà servir només la capa d\'observacions comuna');
            payload = {};
        }

        try {
            await mergeObservacionsIntoPayload(payload);
        } catch (err) {
            console.warn('No s\'han pogut fusionar observacions al payload:', err && err.message ? err.message : err);
        }
        return payload;
    }

    const raw = await fs.promises.readFile(DATA_FILE, 'utf8');
    return raw ? JSON.parse(raw) : {};
}

async function writeDatabase(payload) {
    if (USE_SUPABASE) {
        await syncObservacionsFromPayload(payload);

        const rows = Object.entries(payload || {})
            .filter(([scope, value]) =>
                scope &&
                typeof scope === 'string' &&
                scope.startsWith('seccio_') &&
                value &&
                typeof value === 'object'
            )
            .map(([scope, value]) => {
                const cloned = { ...value };
                delete cloned.observacions;
                return { scope, payload: cloned };
            });

        if (rows.length === 0) {
            return;
        }

        try {
            await supabaseRestRequest(
                'POST',
                `/rest/v1/${SUPABASE_SECCIONS_TABLE}?on_conflict=scope`,
                rows,
                'resolution=merge-duplicates'
            );
        } catch (err) {
            if (!isMissingSupabaseTableError(err, SUPABASE_SECCIONS_TABLE)) {
                throw err;
            }
            console.warn('No s\'ha pogut escriure seccions_data (taula inexistent). Observacions guardades igualment a la taula comuna.');
        }
        return;
    }

    await fs.promises.writeFile(DATA_FILE, JSON.stringify(payload), 'utf8');
}

function getObservacioScopesFromPayload(payload) {
    if (!payload || typeof payload !== 'object') return [];
    return Object.entries(payload)
        .filter(([scope, value]) =>
            scope &&
            typeof scope === 'string' &&
            scope.startsWith('seccio_') &&
            value &&
            typeof value === 'object' &&
            Array.isArray(value.observacions)
        )
        .map(([scope]) => scope);
}

async function mergeObservacionsIntoPayload(payload) {
    const rows = await supabaseRestRequest(
        'GET',
        '/rest/v1/observacions?select=id,scope,autor,data,text&order=data.desc,created_at.desc'
    );
    const list = Array.isArray(rows) ? rows : [];

    const grouped = list.reduce((acc, row) => {
        const scope = String(row.scope || '').trim();
        if (!scope) return acc;
        if (!acc[scope]) acc[scope] = [];
        acc[scope].push({
            id: String(row.id),
            autor: row.autor || 'Anònim',
            data: row.data || '',
            text: row.text || ''
        });
        return acc;
    }, {});

    Object.entries(grouped).forEach(([scope, observacions]) => {
        if (!payload[scope] || typeof payload[scope] !== 'object') {
            payload[scope] = {};
        }
        payload[scope].observacions = observacions;
    });
}

async function syncObservacionsFromPayload(payload) {
    const scopes = getObservacioScopesFromPayload(payload);
    if (scopes.length === 0) return;

    for (const scope of scopes) {
        const rawList = payload[scope].observacions;
        const normalized = (Array.isArray(rawList) ? rawList : [])
            .map(item => ({
                id: String(item?.id || randomUUID()),
                scope,
                autor: String(item?.autor || 'Anònim').trim() || 'Anònim',
                data: String(item?.data || '').trim(),
                text: String(item?.text || '').trim()
            }))
            .filter(item => item.data && item.text);

        await supabaseRestRequest('DELETE', `/rest/v1/observacions?scope=eq.${encodeURIComponent(scope)}`);

        if (normalized.length > 0) {
            await supabaseRestRequest(
                'POST',
                '/rest/v1/observacions',
                normalized
            );
        }

        payload[scope].observacions = normalized;
    }
}

async function readHorarios() {
    if (!USE_SUPABASE) return [];

    const rows = await supabaseRestRequest('GET', '/rest/v1/horarios_entrenaments?order=created_at.desc');
    return Array.isArray(rows) ? rows : [];
}

async function readEquips() {
    if (USE_SUPABASE) {
        const rows = await supabaseRestRequest('GET', '/rest/v1/equip?select=id,nom&order=nom.asc');
        return Array.isArray(rows)
            ? rows.map(row => ({ id: String(row.id), name: row.nom }))
            : [];
    }

    const data = await readDatabase();
    return Object.keys(data || {})
        .filter(key => key.startsWith('seccio_'))
        .map(key => ({ id: key, name: key.replace('seccio_', '').replace(/-/g, ' ') }));
}

async function readJugadorsByEquip(equipId) {
    const id = Number(equipId);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('equipId invàlid');
    }

    if (USE_SUPABASE) {
        const rows = await supabaseRestRequest(
            'GET',
            `/rest/v1/jugador?equip_id=eq.${id}&select=id,nom,any_naixement,data_naixement,revisio_medica&order=nom.asc`
        );
        return Array.isArray(rows)
            ? rows.map(row => ({
                id: String(row.id),
                nom: row.nom || '',
                any_naixement: Number.isFinite(Number(row.any_naixement)) ? Number(row.any_naixement) : null,
                naixement: row.data_naixement || '',
                revisio: !!row.revisio_medica
            }))
            : [];
    }

    const data = await readDatabase();
    const sectionData = data.seccio_s13 || {};
    const plantilla = Array.isArray(sectionData.plantilla) ? sectionData.plantilla : [];
    return plantilla.map((p, index) => ({
        id: String(index + 1),
        nom: p.nom || '',
        any_naixement: Number.isFinite(Number(p.any_naixement)) ? Number(p.any_naixement) : null,
        naixement: p.naixement || '',
        revisio: !!p.revisio
    }));
}

async function readJugadorById(jugadorId) {
    const safeId = String(jugadorId || '').trim();
    if (!safeId) {
        throw new Error('id invàlid');
    }

    if (USE_SUPABASE) {
        if (!/^\d+$/.test(safeId)) {
            throw new Error('id invàlid');
        }
        const rolsCatalog = await readRolsCatalog();
        const roleById = rolsCatalog.reduce((acc, row) => {
            acc[String(row.id)] = row.nom;
            return acc;
        }, {});

        const rows = await supabaseRestRequest(
            'GET',
            `/rest/v1/jugador?id=eq.${encodeURIComponent(safeId)}&select=*&limit=1`
        );
        const row = Array.isArray(rows) ? rows[0] : null;
        if (!row) return null;

        const fitxaDetall = row.fitxa_detall && typeof row.fitxa_detall === 'object'
            ? row.fitxa_detall
            : (typeof row.fitxa_detall === 'string' && row.fitxa_detall.trim()
                ? (() => {
                    try { return JSON.parse(row.fitxa_detall); } catch (_) { return {}; }
                })()
                : {});

        const fromRowOrDetall = (key, fallback = '') => {
            if (row[key] !== undefined && row[key] !== null) return row[key];
            if (fitxaDetall[key] !== undefined && fitxaDetall[key] !== null) return fitxaDetall[key];
            return fallback;
        };

        const posicionsFromJoin = await readJugadorPosicions(safeId);
        const posicionsRaw = posicionsFromJoin.length
            ? posicionsFromJoin
            : fromRowOrDetall('posicions',
                fromRowOrDetall('posicio',
                    fromRowOrDetall('posicio_preferida', [])
                )
            );
        const posicionsNormalized = Array.isArray(posicionsRaw)
            ? posicionsRaw.map(v => String(v || '').trim()).filter(Boolean)
            : String(posicionsRaw || '')
                .split(',')
                .map(v => v.trim())
                .filter(Boolean);

        const rolActualIdRaw = fromRowOrDetall('rol_actual_id', null);
        const rolPrevistIdRaw = fromRowOrDetall('rol_previst_id', null);
        const rolActualId = Number.isFinite(Number(rolActualIdRaw)) ? Number(rolActualIdRaw) : null;
        const rolPrevistId = Number.isFinite(Number(rolPrevistIdRaw)) ? Number(rolPrevistIdRaw) : null;

        return {
            id: String(row.id),
            nom: row.nom || '',
            equip_id: Number.isFinite(Number(row.equip_id)) ? Number(row.equip_id) : null,
            any_naixement: Number.isFinite(Number(row.any_naixement)) ? Number(row.any_naixement) : null,
            naixement: row.data_naixement || '',
            revisio: !!row.revisio_medica,
            edat: fromRowOrDetall('edat', ''),
            poblacio: fromRowOrDetall('poblacio', fromRowOrDetall('residencia', '')),
            rol_actual_id: rolActualId,
            rol_actual: roleById[String(rolActualId)] || fromRowOrDetall('rol_actual', fromRowOrDetall('rol', '')),
            fitxa_mensual: fromRowOrDetall('fitxa_mensual', ''),
            primes_partit: fromRowOrDetall('primes_partit', ''),
            prima_permanencia: fromRowOrDetall('prima_permanencia', ''),
            altres_incentius: fromRowOrDetall('altres_incentius', ''),
            rol_previst_id: rolPrevistId,
            rol_previst: roleById[String(rolPrevistId)] || fromRowOrDetall('rol_previst', ''),
            conv_situacio: fromRowOrDetall('conv_situacio', ''),
            val_forts: fromRowOrDetall('val_forts', ''),
            val_millorar: fromRowOrDetall('val_millorar', ''),
            val_lesions: fromRowOrDetall('val_lesions', ''),
            val_compromis: fromRowOrDetall('val_compromis', ''),
            observacions: fromRowOrDetall('observacions', ''),
            posicions: posicionsNormalized,
            conversations: Array.isArray(fromRowOrDetall('conversations', [])) ? fromRowOrDetall('conversations', []) : [],
            substitutes: Array.isArray(fromRowOrDetall('substitutes', [])) ? fromRowOrDetall('substitutes', []) : [],
            comentaris: Array.isArray(fromRowOrDetall('comentaris', [])) ? fromRowOrDetall('comentaris', []) : []
        };
    }

    const data = await readDatabase();
    const sectionData = data.seccio_s13 || {};
    const plantilla = Array.isArray(sectionData.plantilla) ? sectionData.plantilla : [];
    const found = plantilla.find(p => String(p.id) === safeId);
    if (!found) return null;
    return {
        id: String(found.id),
        nom: found.nom || '',
        equip_id: null,
        any_naixement: Number.isFinite(Number(found.any_naixement)) ? Number(found.any_naixement) : null,
        naixement: found.naixement || '',
        revisio: !!found.revisio,
        edat: found.edat || '',
        poblacio: found.poblacio || '',
        rol_actual_id: found.rol_actual_id || null,
        rol_actual: found.rol_actual || '',
        fitxa_mensual: found.fitxa_mensual || '',
        primes_partit: found.primes_partit || '',
        prima_permanencia: found.prima_permanencia || '',
        altres_incentius: found.altres_incentius || '',
        rol_previst_id: found.rol_previst_id || null,
        rol_previst: found.rol_previst || '',
        conv_situacio: found.conv_situacio || '',
        val_forts: found.val_forts || '',
        val_millorar: found.val_millorar || '',
        val_lesions: found.val_lesions || '',
        val_compromis: found.val_compromis || '',
        observacions: found.observacions || '',
        posicions: Array.isArray(found.posicions) ? found.posicions : [],
        conversations: Array.isArray(found.conversations) ? found.conversations : [],
        substitutes: Array.isArray(found.substitutes) ? found.substitutes : [],
        comentaris: Array.isArray(found.comentaris) ? found.comentaris : []
    };
}

function parseAnyNaixement(rawValue) {
    if (rawValue === undefined || rawValue === null) return null;
    const raw = String(rawValue).trim();
    if (!raw) return null;

    let yearText = '';
    if (/^\d{4}$/.test(raw)) {
        yearText = raw;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        yearText = raw.slice(0, 4);
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
        yearText = raw.slice(-4);
    } else {
        return null;
    }

    const year = Number(yearText);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
        return null;
    }
    return year;
}

async function ensureRolIdByName(rolName) {
    const safeName = String(rolName || '').trim();
    if (!safeName) {
        throw new Error('Nom de rol invàlid');
    }

    const existing = await supabaseRestRequest(
        'GET',
        `/rest/v1/rol?nom=eq.${encodeURIComponent(safeName)}&select=id&limit=1`
    );
    if (Array.isArray(existing) && existing[0] && existing[0].id !== undefined) {
        return Number(existing[0].id);
    }

    const created = await supabaseRestRequest(
        'POST',
        '/rest/v1/rol?select=id',
        [{ nom: safeName }],
        'return=representation'
    );
    if (Array.isArray(created) && created[0] && created[0].id !== undefined) {
        return Number(created[0].id);
    }

    throw new Error(`No s'ha pogut crear o recuperar el rol ${safeName}`);
}

async function readRolsCatalog() {
    if (USE_SUPABASE) {
        const rows = await supabaseRestRequest('GET', '/rest/v1/rol?select=id,nom&order=nom.asc');
        return Array.isArray(rows)
            ? rows
                .map(row => ({ id: String(row.id), nom: String(row.nom || '').trim() }))
                .filter(row => row.nom)
            : [];
    }

    const fallback = [
        'Titular habitual', 'Rotació', 'Suplent', 'Baixa', 'Altre',
        'Mantenir titularitat', 'Jugador clau', 'Possible baixa'
    ];
    return fallback.map((nom, idx) => ({ id: String(idx + 1), nom }));
}

async function readEquipConfig(equipId) {
    const id = Number(equipId);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('equipId invàlid');
    }

    if (USE_SUPABASE) {
        const equipRows = await supabaseRestRequest(
            'GET',
            `/rest/v1/equip?id=eq.${id}&select=id,comp_categoria,comp_temporada,comp_url&limit=1`
        );
        const equip = Array.isArray(equipRows) && equipRows[0] ? equipRows[0] : {};

        const staffRows = await supabaseRestRequest(
            'GET',
            `/rest/v1/staff?equip_id=eq.${id}&select=nom,telefon,rol:rol_id(nom)`
        );

        const byRole = (Array.isArray(staffRows) ? staffRows : []).reduce((acc, row) => {
            const roleName = row && row.rol && row.rol.nom ? String(row.rol.nom) : '';
            if (roleName) {
                acc[roleName] = {
                    nom: row.nom || '',
                    tel: row.telefon || ''
                };
            }
            return acc;
        }, {});

        return {
            comp_categoria: equip.comp_categoria || '',
            comp_temporada: equip.comp_temporada || '',
            comp_url: equip.comp_url || '',
            s_primer_entrenador_nom: byRole['Primer Entrenador']?.nom || '',
            s_primer_entrenador_tel: byRole['Primer Entrenador']?.tel || '',
            s_segon_entrenador_nom: byRole['Segon Entrenador']?.nom || '',
            s_segon_entrenador_tel: byRole['Segon Entrenador']?.tel || '',
            s_tercer_entrenador_nom: byRole['Tercer Entrenador']?.nom || '',
            s_tercer_entrenador_tel: byRole['Tercer Entrenador']?.tel || ''
        };
    }

    const data = await readDatabase();
    const section = data.seccio_s13 || {};
    return {
        comp_categoria: section.comp_categoria || '',
        comp_temporada: section.comp_temporada || '',
        comp_url: section.comp_url || '',
        s_primer_entrenador_nom: section.s_primer_entrenador_nom || '',
        s_primer_entrenador_tel: section.s_primer_entrenador_tel || '',
        s_segon_entrenador_nom: section.s_segon_entrenador_nom || '',
        s_segon_entrenador_tel: section.s_segon_entrenador_tel || '',
        s_tercer_entrenador_nom: section.s_tercer_entrenador_nom || '',
        s_tercer_entrenador_tel: section.s_tercer_entrenador_tel || ''
    };
}

async function writeEquipConfig(equipId, payload) {
    const id = Number(equipId);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('equipId invàlid');
    }

    const config = {
        comp_categoria: String(payload?.comp_categoria || '').trim(),
        comp_temporada: String(payload?.comp_temporada || '').trim(),
        comp_url: String(payload?.comp_url || '').trim(),
        s_primer_entrenador_nom: String(payload?.s_primer_entrenador_nom || '').trim(),
        s_primer_entrenador_tel: String(payload?.s_primer_entrenador_tel || '').trim(),
        s_segon_entrenador_nom: String(payload?.s_segon_entrenador_nom || '').trim(),
        s_segon_entrenador_tel: String(payload?.s_segon_entrenador_tel || '').trim(),
        s_tercer_entrenador_nom: String(payload?.s_tercer_entrenador_nom || '').trim(),
        s_tercer_entrenador_tel: String(payload?.s_tercer_entrenador_tel || '').trim()
    };

    if (USE_SUPABASE) {
        await supabaseRestRequest(
            'PATCH',
            `/rest/v1/equip?id=eq.${id}`,
            {
                comp_categoria: config.comp_categoria || null,
                comp_temporada: config.comp_temporada || null,
                comp_url: config.comp_url || null
            }
        );

        const staffRoles = [
            { role: 'Primer Entrenador', nom: config.s_primer_entrenador_nom, tel: config.s_primer_entrenador_tel },
            { role: 'Segon Entrenador', nom: config.s_segon_entrenador_nom, tel: config.s_segon_entrenador_tel },
            { role: 'Tercer Entrenador', nom: config.s_tercer_entrenador_nom, tel: config.s_tercer_entrenador_tel }
        ];

        for (const item of staffRoles) {
            const rolId = await ensureRolIdByName(item.role);
            await supabaseRestRequest('DELETE', `/rest/v1/staff?equip_id=eq.${id}&rol_id=eq.${rolId}`);
            if (item.nom || item.tel) {
                await supabaseRestRequest(
                    'POST',
                    '/rest/v1/staff',
                    [{ equip_id: id, nom: item.nom || item.role, telefon: item.tel || null, rol_id: rolId }]
                );
            }
        }

        return;
    }

    const data = await readDatabase();
    if (!data.seccio_s13) data.seccio_s13 = {};
    data.seccio_s13.comp_categoria = config.comp_categoria;
    data.seccio_s13.comp_temporada = config.comp_temporada;
    data.seccio_s13.comp_url = config.comp_url;
    data.seccio_s13.s_primer_entrenador_nom = config.s_primer_entrenador_nom;
    data.seccio_s13.s_primer_entrenador_tel = config.s_primer_entrenador_tel;
    data.seccio_s13.s_segon_entrenador_nom = config.s_segon_entrenador_nom;
    data.seccio_s13.s_segon_entrenador_tel = config.s_segon_entrenador_tel;
    data.seccio_s13.s_tercer_entrenador_nom = config.s_tercer_entrenador_nom;
    data.seccio_s13.s_tercer_entrenador_tel = config.s_tercer_entrenador_tel;
    await writeDatabase(data);
}

async function ensurePosicioIdByName(posicioName) {
    const safeName = String(posicioName || '').trim();
    if (!safeName) {
        throw new Error('Nom de posició invàlid');
    }

    const existing = await supabaseRestRequest(
        'GET',
        `/rest/v1/posicio?nom=eq.${encodeURIComponent(safeName)}&select=id&limit=1`
    );
    if (Array.isArray(existing) && existing[0] && existing[0].id !== undefined) {
        return Number(existing[0].id);
    }

    const created = await supabaseRestRequest(
        'POST',
        '/rest/v1/posicio?select=id',
        [{ nom: safeName }],
        'return=representation'
    );
    if (Array.isArray(created) && created[0] && created[0].id !== undefined) {
        return Number(created[0].id);
    }

    throw new Error(`No s'ha pogut crear o recuperar la posició ${safeName}`);
}

async function readPosicionsCatalog() {
    if (USE_SUPABASE) {
        const rows = await supabaseRestRequest('GET', '/rest/v1/posicio?select=id,nom&order=nom.asc');
        return Array.isArray(rows)
            ? rows
                .map(row => ({ id: String(row.id), nom: String(row.nom || '').trim() }))
                .filter(row => row.nom)
            : [];
    }

    const fallback = [
        'Porter', 'Lateral Dret', 'Lateral Esquerre', 'Central',
        'Pivot Defensiu', 'Interior', 'Mitja Punta',
        'Extrem Dret', 'Extrem Esquerre', 'Davanter Centre'
    ];
    return fallback.map((nom, idx) => ({ id: String(idx + 1), nom }));
}

async function readJugadorPosicions(playerId) {
    const pid = Number(playerId);
    if (!Number.isInteger(pid) || pid <= 0) return [];

    if (USE_SUPABASE) {
        const links = await supabaseRestRequest(
            'GET',
            `/rest/v1/jugador_posicio?jugador_id=eq.${pid}&select=posicio_id`
        );
        const posRows = await supabaseRestRequest('GET', '/rest/v1/posicio?select=id,nom');

        const posById = (Array.isArray(posRows) ? posRows : []).reduce((acc, row) => {
            acc[String(row.id)] = String(row.nom || '').trim();
            return acc;
        }, {});

        const names = (Array.isArray(links) ? links : [])
            .map(link => posById[String(link.posicio_id)])
            .filter(Boolean);
        return [...new Set(names)];
    }

    return [];
}

async function syncJugadorPosicions(playerId, posicions = []) {
    const pid = Number(playerId);
    if (!Number.isInteger(pid) || pid <= 0) return;
    if (!USE_SUPABASE) return;

    await supabaseRestRequest('DELETE', `/rest/v1/jugador_posicio?jugador_id=eq.${pid}`);

    const uniq = [...new Set((Array.isArray(posicions) ? posicions : [])
        .map(p => String(p || '').trim())
        .filter(Boolean))];

    if (!uniq.length) return;

    const rows = [];
    for (const posName of uniq) {
        const posId = await ensurePosicioIdByName(posName);
        rows.push({ jugador_id: pid, posicio_id: posId });
    }
    await supabaseRestRequest('POST', '/rest/v1/jugador_posicio', rows);
}

function mapSeguimentRowToClient(row, posicionsByPlayer = {}, contactesByPlayer = {}) {
    const playerId = String(row.id);
    return {
        id: playerId,
        nom: row.nom || '',
        club: row.club_actual || '',
        tel: row.telefon || '',
        poblacio: row.residencia || '',
        any_naixement: row.any_naixement || null,
        genere: row.genere || '',
        segment: normalizeSeguimentSegment(row.segment) || '',
        situacio: row.informe_tecnic || row.observacions || '',
        posicions: posicionsByPlayer[playerId] || [],
        contactes: contactesByPlayer[playerId] || []
    };
}

function normalizeSeguimentContactes(contactes) {
    const rows = Array.isArray(contactes) ? contactes : [];
    return rows
        .map(contacte => ({
            autor: String(contacte?.autor || 'Anònim').trim() || 'Anònim',
            data: String(contacte?.data || '').trim(),
            nota: String(contacte?.nota || '').trim()
        }))
        .filter(contacte => contacte.data || contacte.nota);
}

function normalizeSeguimentSegment(segment) {
    const raw = String(segment || '').trim().toLowerCase();
    if (raw === 'base' || raw === 'senior') return raw;
    return '';
}

function getCaptacioSegmentsScope() {
    return 'seccio_captacio_segments';
}

function getSegmentKey(segment) {
    return segment === 'senior' ? 'senior_ids' : 'base_ids';
}

function normalizeSegmentIds(value) {
    return [...new Set((Array.isArray(value) ? value : []).map(v => String(v || '').trim()).filter(Boolean))];
}

async function readSegmentIds(segment) {
    const safeSegment = normalizeSeguimentSegment(segment);
    if (!safeSegment) return null;

    const data = await readDatabase();
    const scope = getCaptacioSegmentsScope();
    const payload = data && typeof data[scope] === 'object' ? data[scope] : {};
    return normalizeSegmentIds(payload[getSegmentKey(safeSegment)]);
}

async function setPlayerSegmentMembership(playerId, segment) {
    const safeSegment = normalizeSeguimentSegment(segment);
    const safeId = String(playerId || '').trim();
    if (!safeSegment || !safeId) return;

    const data = await readDatabase();
    const scope = getCaptacioSegmentsScope();
    if (!data[scope] || typeof data[scope] !== 'object') data[scope] = {};

    const targetKey = getSegmentKey(safeSegment);
    const otherKey = getSegmentKey(safeSegment === 'base' ? 'senior' : 'base');

    const targetIds = normalizeSegmentIds(data[scope][targetKey]);
    const otherIds = normalizeSegmentIds(data[scope][otherKey]);

    if (!targetIds.includes(safeId)) targetIds.push(safeId);
    data[scope][targetKey] = targetIds;
    data[scope][otherKey] = otherIds.filter(id => id !== safeId);

    await writeDatabase(data);
}

async function removePlayerFromAllSegments(playerId) {
    const safeId = String(playerId || '').trim();
    if (!safeId) return;

    const data = await readDatabase();
    const scope = getCaptacioSegmentsScope();
    if (!data[scope] || typeof data[scope] !== 'object') return;

    const nextBase = normalizeSegmentIds(data[scope].base_ids).filter(id => id !== safeId);
    const nextSenior = normalizeSegmentIds(data[scope].senior_ids).filter(id => id !== safeId);
    data[scope].base_ids = nextBase;
    data[scope].senior_ids = nextSenior;
    await writeDatabase(data);
}

function getSeguimentContactScope(playerId) {
    const safeId = String(playerId || '').trim();
    return `captacio_jugador_${safeId}`;
}

async function syncSeguimentContactes(playerId, contactes = []) {
    const pid = Number(playerId);
    if (!Number.isInteger(pid) || pid <= 0) return;

    const scope = getSeguimentContactScope(pid);
    await supabaseRestRequest('DELETE', `/rest/v1/observacions?scope=eq.${encodeURIComponent(scope)}`);

    const normalized = normalizeSeguimentContactes(contactes);
    if (!normalized.length) return;

    const rows = normalized.map(contacte => ({
        id: randomUUID(),
        scope,
        autor: contacte.autor || 'Anònim',
        data: contacte.data || new Date().toISOString().slice(0, 10),
        text: contacte.nota || ''
    }));
    await supabaseRestRequest('POST', '/rest/v1/observacions', rows);
}

async function readJugadorsSeguiment(segment = '') {
    const safeSegment = normalizeSeguimentSegment(segment);
    const segmentIds = await readSegmentIds(safeSegment);

    if (USE_SUPABASE) {
        let playersRows;
        let usingLegacySegmentFallback = false;
        try {
            const segmentFilter = safeSegment ? `&segment=eq.${encodeURIComponent(safeSegment)}` : '';
            playersRows = await supabaseRestRequest(
                'GET',
                `/rest/v1/jugador_en_seguiment?select=id,nom,telefon,club_actual,any_naixement,genere,residencia,informe_tecnic,observacions,segment&order=nom.asc${segmentFilter}`
            );
        } catch (err) {
            if (!isMissingSupabaseColumnError(err, 'segment')) {
                throw err;
            }
            usingLegacySegmentFallback = true;
            playersRows = await supabaseRestRequest(
                'GET',
                '/rest/v1/jugador_en_seguiment?select=id,nom,telefon,club_actual,any_naixement,genere,residencia,informe_tecnic,observacions&order=nom.asc'
            );
        }

        const linkRows = await supabaseRestRequest(
            'GET',
            '/rest/v1/jugador_en_seguiment_posicio?select=jugador_en_seguiment_id,posicio_id'
        );
        const posRows = await supabaseRestRequest('GET', '/rest/v1/posicio?select=id,nom');

        const posById = (Array.isArray(posRows) ? posRows : []).reduce((acc, row) => {
            acc[String(row.id)] = row.nom;
            return acc;
        }, {});

        const posicionsByPlayer = (Array.isArray(linkRows) ? linkRows : []).reduce((acc, link) => {
            const playerId = String(link.jugador_en_seguiment_id);
            const posName = posById[String(link.posicio_id)];
            if (!posName) return acc;
            if (!acc[playerId]) acc[playerId] = [];
            acc[playerId].push(posName);
            return acc;
        }, {});

        const safePlayersRows = Array.isArray(playersRows) ? playersRows : [];
        const contactesByPlayer = {};
        await Promise.all(
            safePlayersRows.map(async row => {
                const playerId = String(row.id);
                const scope = getSeguimentContactScope(playerId);
                const obs = await readObservacions(scope);
                contactesByPlayer[playerId] = (Array.isArray(obs) ? obs : []).map(item => ({
                    id: item.id ? String(item.id) : '',
                    autor: item.autor || 'Anònim',
                    data: item.data || '',
                    nota: item.text || ''
                }));
            })
        );

        let mapped = safePlayersRows.map(row => mapSeguimentRowToClient(row, posicionsByPlayer, contactesByPlayer));
        if (usingLegacySegmentFallback && Array.isArray(segmentIds)) {
            const segmentSet = new Set(segmentIds.map(String));
            mapped = mapped.filter(item => segmentSet.has(String(item.id)));
        }
        return mapped;
    }

    const data = await readDatabase();
    const rows = data.captacio_futbol_base || [];
    let list = Array.isArray(rows) ? rows : [];
    if (safeSegment) {
        const withSegment = list.filter(item => normalizeSeguimentSegment(item && item.segment) === safeSegment);
        if (withSegment.length > 0) {
            list = withSegment;
        } else if (Array.isArray(segmentIds)) {
            const segmentSet = new Set(segmentIds.map(String));
            list = list.filter(item => segmentSet.has(String(item && item.id)));
        } else {
            list = [];
        }
    } else if (Array.isArray(segmentIds)) {
        const segmentSet = new Set(segmentIds.map(String));
        list = list.filter(item => segmentSet.has(String(item && item.id)));
    }
    return list;
}

async function syncSeguimentPosicions(playerId, posicions = []) {
    const pid = Number(playerId);
    if (!Number.isInteger(pid) || pid <= 0) return;

    await supabaseRestRequest('DELETE', `/rest/v1/jugador_en_seguiment_posicio?jugador_en_seguiment_id=eq.${pid}`);

    const uniq = [...new Set((Array.isArray(posicions) ? posicions : []).map(p => String(p || '').trim()).filter(Boolean))];
    if (!uniq.length) return;

    const rows = [];
    for (const posName of uniq) {
        const posId = await ensurePosicioIdByName(posName);
        rows.push({ jugador_en_seguiment_id: pid, posicio_id: posId });
    }
    await supabaseRestRequest('POST', '/rest/v1/jugador_en_seguiment_posicio', rows);
}

async function createJugadorSeguiment(payload, segment = '') {
    const safeSegment = normalizeSeguimentSegment(segment);
    const row = {
        nom: String(payload?.nom || '').trim(),
        telefon: String(payload?.tel || '').trim() || null,
        club_actual: String(payload?.club || '').trim() || null,
        any_naixement: Number.isFinite(Number(payload?.any_naixement)) ? Number(payload.any_naixement) : null,
        genere: String(payload?.genere || '').trim() || null,
        residencia: String(payload?.poblacio || '').trim() || null,
        informe_tecnic: String(payload?.situacio || '').trim() || null,
        observacions: null
    };

    if (!row.nom) {
        throw new Error('nom obligatori');
    }

    if (USE_SUPABASE) {
        let created;
        let usedLegacySegmentFallback = false;
        try {
            const rowWithSegment = { ...row, segment: safeSegment || null };
            created = await supabaseRestRequest(
                'POST',
                '/rest/v1/jugador_en_seguiment?select=id,nom,telefon,club_actual,any_naixement,genere,residencia,informe_tecnic,observacions,segment',
                [rowWithSegment],
                'return=representation'
            );
        } catch (err) {
            if (!isMissingSupabaseColumnError(err, 'segment')) {
                throw err;
            }
            usedLegacySegmentFallback = true;
            created = await supabaseRestRequest(
                'POST',
                '/rest/v1/jugador_en_seguiment?select=id,nom,telefon,club_actual,any_naixement,genere,residencia,informe_tecnic,observacions',
                [row],
                'return=representation'
            );
        }
        const player = Array.isArray(created) ? created[0] : null;
        if (!player || player.id === undefined || player.id === null) {
            throw new Error('No s\'ha pogut crear el jugador en seguiment');
        }
        await syncSeguimentPosicions(player.id, payload?.posicions || []);
        await syncSeguimentContactes(player.id, payload?.contactes || []);

        const createdPlayer = mapSeguimentRowToClient(
            player,
            {
                [String(player.id)]: [...new Set((payload?.posicions || []).map(p => String(p || '').trim()).filter(Boolean))]
            },
            {
                [String(player.id)]: normalizeSeguimentContactes(payload?.contactes || [])
            }
        );
        if (usedLegacySegmentFallback) {
            await setPlayerSegmentMembership(player.id, safeSegment);
        }
        return createdPlayer;
    }

    const data = await readDatabase();
    const rows = Array.isArray(data.captacio_futbol_base) ? data.captacio_futbol_base : [];
    const local = {
        id: `local_${Date.now()}`,
        nom: row.nom,
        segment: safeSegment || '',
        club: row.club_actual || '',
        tel: row.telefon || '',
        poblacio: row.residencia || '',
        any_naixement: row.any_naixement,
        genere: row.genere || '',
        situacio: row.informe_tecnic || '',
        posicions: Array.isArray(payload?.posicions) ? payload.posicions : [],
        contactes: normalizeSeguimentContactes(payload?.contactes || [])
    };
    rows.push(local);
    data.captacio_futbol_base = rows;
    await writeDatabase(data);
    await setPlayerSegmentMembership(local.id, safeSegment);
    return local;
}

async function updateJugadorSeguiment(payload, segment = '') {
    const id = String(payload?.id || '').trim();
    if (!id) throw new Error('id obligatori');
    const safeSegment = normalizeSeguimentSegment(segment);

    if (USE_SUPABASE) {
        if (!/^\d+$/.test(id)) {
            throw new Error('id de jugador en seguiment invàlid');
        }

        const patch = {};
        if (payload.nom !== undefined) patch.nom = String(payload.nom || '').trim();
        if (payload.tel !== undefined) patch.telefon = String(payload.tel || '').trim() || null;
        if (payload.club !== undefined) patch.club_actual = String(payload.club || '').trim() || null;
        if (payload.any_naixement !== undefined) {
            patch.any_naixement = Number.isFinite(Number(payload.any_naixement)) ? Number(payload.any_naixement) : null;
        }
        if (payload.genere !== undefined) patch.genere = String(payload.genere || '').trim() || null;
        if (payload.poblacio !== undefined) patch.residencia = String(payload.poblacio || '').trim() || null;
        if (payload.situacio !== undefined) patch.informe_tecnic = String(payload.situacio || '').trim() || null;

        let usedLegacySegmentFallback = false;
        if (safeSegment) {
            patch.segment = safeSegment;
        }

        if (Object.keys(patch).length > 0) {
            try {
                await supabaseRestRequest('PATCH', `/rest/v1/jugador_en_seguiment?id=eq.${encodeURIComponent(id)}`, patch);
            } catch (err) {
                if (!isMissingSupabaseColumnError(err, 'segment')) {
                    throw err;
                }
                usedLegacySegmentFallback = true;
                delete patch.segment;
                if (Object.keys(patch).length > 0) {
                    await supabaseRestRequest('PATCH', `/rest/v1/jugador_en_seguiment?id=eq.${encodeURIComponent(id)}`, patch);
                }
            }
        }

        if (payload.posicions !== undefined) {
            await syncSeguimentPosicions(id, payload.posicions);
        }
        if (payload.contactes !== undefined) {
            await syncSeguimentContactes(id, payload.contactes);
        }
        if (usedLegacySegmentFallback) {
            await setPlayerSegmentMembership(id, safeSegment);
        }
        return;
    }

    const data = await readDatabase();
    const rows = Array.isArray(data.captacio_futbol_base) ? data.captacio_futbol_base : [];
    const idx = rows.findIndex(p => String(p.id) === id);
    if (idx === -1) return;
    if (payload.nom !== undefined) rows[idx].nom = String(payload.nom || '').trim();
    if (payload.tel !== undefined) rows[idx].tel = String(payload.tel || '').trim();
    if (payload.club !== undefined) rows[idx].club = String(payload.club || '').trim();
    if (payload.any_naixement !== undefined) rows[idx].any_naixement = Number.isFinite(Number(payload.any_naixement)) ? Number(payload.any_naixement) : null;
    if (payload.genere !== undefined) rows[idx].genere = String(payload.genere || '').trim();
    if (payload.poblacio !== undefined) rows[idx].poblacio = String(payload.poblacio || '').trim();
    if (payload.situacio !== undefined) rows[idx].situacio = String(payload.situacio || '').trim();
    if (safeSegment) rows[idx].segment = safeSegment;
    if (payload.posicions !== undefined) rows[idx].posicions = Array.isArray(payload.posicions) ? payload.posicions : [];
    if (payload.contactes !== undefined) rows[idx].contactes = normalizeSeguimentContactes(payload.contactes);
    await writeDatabase(data);
    await setPlayerSegmentMembership(id, safeSegment);
}

async function deleteJugadorSeguiment(id) {
    const safeId = String(id || '').trim();
    if (!safeId) throw new Error('id obligatori');

    if (USE_SUPABASE) {
        if (!/^\d+$/.test(safeId)) {
            throw new Error('id de jugador en seguiment invàlid');
        }
        await supabaseRestRequest('DELETE', `/rest/v1/jugador_en_seguiment?id=eq.${encodeURIComponent(safeId)}`);
        await removePlayerFromAllSegments(safeId);
        return;
    }

    const data = await readDatabase();
    const rows = Array.isArray(data.captacio_futbol_base) ? data.captacio_futbol_base : [];
    data.captacio_futbol_base = rows.filter(p => String(p.id) !== safeId);
    await writeDatabase(data);
    await removePlayerFromAllSegments(safeId);
}

async function createJugador(payload) {
    const equipId = Number(payload?.equip_id);
    const nom = String(payload?.nom || '').trim();
    const anyNaixement = parseAnyNaixement(payload?.any_naixement ?? payload?.data_naixement);
    const dataNaixement = anyNaixement ? `${String(anyNaixement)}-01-01` : null;
    const revisioMedica = !!payload?.revisio_medica;

    if (!Number.isInteger(equipId) || equipId <= 0) {
        throw new Error('equip_id invàlid');
    }
    if (!nom) {
        throw new Error('nom obligatori');
    }

    if (USE_SUPABASE) {
        const rows = await supabaseRestRequest(
            'POST',
            '/rest/v1/jugador?select=id,nom,any_naixement,data_naixement,revisio_medica',
            [{
                equip_id: equipId,
                nom,
                any_naixement: anyNaixement,
                data_naixement: dataNaixement,
                revisio_medica: revisioMedica
            }],
            'return=representation'
        );
        const row = Array.isArray(rows) ? rows[0] : null;
        if (!row || row.id === undefined || row.id === null) {
            throw new Error('No s\'ha pogut obtenir l\'id del jugador creat');
        }
        return {
            id: String(row.id),
            nom,
            any_naixement: Number.isFinite(Number(row?.any_naixement)) ? Number(row.any_naixement) : anyNaixement,
            naixement: row?.data_naixement || dataNaixement || '',
            revisio: row ? !!row.revisio_medica : revisioMedica
        };
    }

    const data = await readDatabase();
    if (!data.seccio_s13) data.seccio_s13 = {};
    if (!Array.isArray(data.seccio_s13.plantilla)) data.seccio_s13.plantilla = [];
    const player = {
        id: String(randomUUID()),
        nom,
        any_naixement: anyNaixement,
        naixement: dataNaixement || '',
        revisio: revisioMedica
    };
    data.seccio_s13.plantilla.push(player);
    await writeDatabase(data);
    return player;
}

async function updateJugador(payload) {
    const id = String(payload?.id || '').trim();
    if (!id) {
        throw new Error('id obligatori');
    }

    const patch = {};
    if (payload.nom !== undefined) patch.nom = String(payload.nom || '').trim();
    if (payload.any_naixement !== undefined) {
        const anyNaixement = parseAnyNaixement(payload.any_naixement);
        patch.any_naixement = anyNaixement;
        patch.data_naixement = anyNaixement ? `${String(anyNaixement)}-01-01` : null;
    } else if (payload.data_naixement !== undefined) {
        const anyNaixement = parseAnyNaixement(payload.data_naixement);
        patch.any_naixement = anyNaixement;
        patch.data_naixement = anyNaixement ? `${String(anyNaixement)}-01-01` : null;
    }
    if (payload.revisio_medica !== undefined) patch.revisio_medica = !!payload.revisio_medica;

        const detailFields = [
        'edat', 'poblacio', 'fitxa_mensual', 'primes_partit', 'prima_permanencia',
        'altres_incentius', 'conv_situacio', 'val_forts', 'val_millorar',
            'val_lesions', 'val_compromis', 'observacions', 'conversations', 'substitutes', 'comentaris'
    ];

    if (USE_SUPABASE) {
        if (!/^\d+$/.test(id)) {
            throw new Error('id de jugador invàlid (cal bigint numèric)');
        }
        const existingRows = await supabaseRestRequest(
            'GET',
            `/rest/v1/jugador?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
        );
        const existing = Array.isArray(existingRows) ? existingRows[0] : null;
        if (!existing) {
            throw new Error('Jugador no trobat');
        }

        const columns = new Set(Object.keys(existing));
        const fitxaDetallCurrent = existing.fitxa_detall && typeof existing.fitxa_detall === 'object'
            ? existing.fitxa_detall
            : (typeof existing.fitxa_detall === 'string' && existing.fitxa_detall.trim()
                ? (() => {
                    try { return JSON.parse(existing.fitxa_detall); } catch (_) { return {}; }
                })()
                : {});
        const fitxaDetallNext = { ...fitxaDetallCurrent };

        const resolveRoleId = async (idField, nameField) => {
            const rawId = payload[idField];
            if (rawId !== undefined && rawId !== null && String(rawId).trim() !== '') {
                const numericId = Number(rawId);
                return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
            }
            const rawName = payload[nameField];
            if (rawName !== undefined && rawName !== null && String(rawName).trim()) {
                return ensureRolIdByName(String(rawName));
            }
            return undefined;
        };

        const rolActualId = await resolveRoleId('rol_actual_id', 'rol_actual');
        if (rolActualId !== undefined) {
            if (columns.has('rol_actual_id')) {
                patch.rol_actual_id = rolActualId;
            } else {
                fitxaDetallNext.rol_actual_id = rolActualId;
            }
        }

        const rolPrevistId = await resolveRoleId('rol_previst_id', 'rol_previst');
        if (rolPrevistId !== undefined) {
            if (columns.has('rol_previst_id')) {
                patch.rol_previst_id = rolPrevistId;
            } else {
                fitxaDetallNext.rol_previst_id = rolPrevistId;
            }
        }

        const mapToAlternativeColumns = (field, value) => {
            if (field === 'poblacio' && columns.has('residencia')) {
                patch.residencia = value;
                return true;
            }
            return false;
        };

        for (const field of detailFields) {
            if (payload[field] === undefined) continue;
            const value = payload[field];
            if (columns.has(field)) {
                patch[field] = value;
            } else if (mapToAlternativeColumns(field, value)) {
                // mapped to an alternative known column
            } else {
                fitxaDetallNext[field] = value;
            }
        }

        if (columns.has('fitxa_detall')) {
            patch.fitxa_detall = fitxaDetallNext;
        }

        await supabaseRestRequest(
            'PATCH',
            `/rest/v1/jugador?id=eq.${encodeURIComponent(id)}`,
            patch
        );

        if (payload.posicions !== undefined) {
            await syncJugadorPosicions(id, payload.posicions);
        }
        return;
    }

    const data = await readDatabase();
    const plantilla = (((data || {}).seccio_s13 || {}).plantilla) || [];
    const index = plantilla.findIndex(p => String(p.id) === id);
    if (index === -1) return;
    if (patch.nom !== undefined) plantilla[index].nom = patch.nom;
    if (patch.any_naixement !== undefined) plantilla[index].any_naixement = patch.any_naixement;
    if (patch.data_naixement !== undefined) plantilla[index].naixement = patch.data_naixement || '';
    if (patch.revisio_medica !== undefined) plantilla[index].revisio = !!patch.revisio_medica;
    if (payload.rol_actual_id !== undefined) plantilla[index].rol_actual_id = payload.rol_actual_id;
    if (payload.rol_previst_id !== undefined) plantilla[index].rol_previst_id = payload.rol_previst_id;
    if (payload.rol_actual !== undefined) plantilla[index].rol_actual = payload.rol_actual;
    if (payload.rol_previst !== undefined) plantilla[index].rol_previst = payload.rol_previst;
    detailFields.forEach(field => {
        if (payload[field] !== undefined) {
            plantilla[index][field] = payload[field];
        }
    });
    if (payload.posicions !== undefined) {
        plantilla[index].posicions = Array.isArray(payload.posicions) ? payload.posicions : [];
    }
    await writeDatabase(data);
}

async function deleteJugador(id) {
    const safeId = String(id || '').trim();
    if (!safeId) {
        throw new Error('id obligatori');
    }

    if (USE_SUPABASE) {
        if (!/^\d+$/.test(safeId)) {
            throw new Error('id de jugador invàlid (cal bigint numèric)');
        }
        await supabaseRestRequest(
            'DELETE',
            `/rest/v1/jugador?id=eq.${encodeURIComponent(safeId)}`
        );
        return;
    }

    const data = await readDatabase();
    if (!data.seccio_s13 || !Array.isArray(data.seccio_s13.plantilla)) return;
    data.seccio_s13.plantilla = data.seccio_s13.plantilla.filter(p => String(p.id) !== safeId);
    await writeDatabase(data);
}

async function writeHorarios(horarios) {
    if (!USE_SUPABASE) return;

    try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!Array.isArray(horarios)) {
            throw new Error('Payload d\'horaris invàlid');
        }

        if (horarios.length === 0) {
            await supabaseRestRequest('DELETE', '/rest/v1/horarios_entrenaments?id=not.is.null');
            return;
        }

        const normalized = horarios.map(item => {
            const rawId = String(item.id || '').trim();
            const teamId = String(item.team_id || '').trim();
            const campValue = String(item.camp || '').trim();
            const vestidorValue = item.vestidor ? String(item.vestidor).trim() : '';
            const row = {
                id: uuidRegex.test(rawId) ? rawId : randomUUID(),
                team_id: teamId,
                dia: String(item.dia || '').trim(),
                inici: String(item.inici || '').trim(),
                fi: String(item.fi || '').trim(),
                vestidor: teamId ? (vestidorValue || null) : null,
                camp: teamId ? campValue : ''
            };

            if (!row.dia || !row.inici || !row.fi) {
                return null;
            }

            return row;
        }).filter(Boolean);

        if (normalized.length === 0) {
            throw new Error('No hi ha horaris vàlids per guardar');
        }

        await supabaseRestRequest(
            'POST',
            '/rest/v1/horarios_entrenaments?on_conflict=id',
            normalized,
            'resolution=merge-duplicates'
        );

        const existing = await supabaseRestRequest('GET', '/rest/v1/horarios_entrenaments?select=id');
        const keepIds = new Set(normalized.map(row => row.id));
        const staleIds = (Array.isArray(existing) ? existing : [])
            .map(row => String(row.id))
            .filter(id => !keepIds.has(id));

        if (staleIds.length > 0) {
            const idsFilter = staleIds.map(id => `"${id}"`).join(',');
            await supabaseRestRequest('DELETE', `/rest/v1/horarios_entrenaments?id=in.(${idsFilter})`);
        }
    } catch (err) {
        console.error('Error writing horarios:', err.message);
        throw err;
    }
}

async function ensureHorariosTable() {
    if (!USE_SUPABASE) return;
    console.log('Note: horarios_entrenaments table debe estar creada manualmente en Supabase');
}

async function readObservacions(scope) {
    const safeScope = String(scope || '').trim();
    if (!safeScope) {
        throw new Error('Cal indicar scope');
    }

    if (USE_SUPABASE) {
        const rows = await supabaseRestRequest(
            'GET',
            `/rest/v1/observacions?scope=eq.${encodeURIComponent(safeScope)}&order=data.desc,created_at.desc`
        );
        return Array.isArray(rows) ? rows : [];
    }

    const data = await readDatabase();
    const localObs = (((data || {}).__observacions || {})[safeScope]) || [];
    return Array.isArray(localObs) ? localObs : [];
}

async function addObservacio(scope, payload) {
    const safeScope = String(scope || '').trim();
    if (!safeScope) {
        throw new Error('Cal indicar scope');
    }

    const row = {
        id: String(payload?.id || randomUUID()),
        scope: safeScope,
        autor: String(payload?.autor || 'Anònim').trim(),
        data: String(payload?.data || '').trim(),
        text: String(payload?.text || '').trim()
    };

    if (!row.data || !row.text) {
        throw new Error('Falten camps obligatoris (data i text)');
    }

    if (USE_SUPABASE) {
        await supabaseRestRequest(
            'POST',
            '/rest/v1/observacions?on_conflict=id',
            [row],
            'resolution=merge-duplicates'
        );
        return row;
    }

    const data = await readDatabase();
    if (!data.__observacions) data.__observacions = {};
    if (!Array.isArray(data.__observacions[safeScope])) data.__observacions[safeScope] = [];
    data.__observacions[safeScope].unshift(row);
    await writeDatabase(data);
    return row;
}

async function deleteObservacio(scope, id) {
    const safeScope = String(scope || '').trim();
    const safeId = String(id || '').trim();
    if (!safeScope || !safeId) {
        throw new Error('Cal indicar scope i id');
    }

    if (USE_SUPABASE) {
        await supabaseRestRequest(
            'DELETE',
            `/rest/v1/observacions?scope=eq.${encodeURIComponent(safeScope)}&id=eq.${encodeURIComponent(safeId)}`
        );
        return;
    }

    const data = await readDatabase();
    if (!data.__observacions || !Array.isArray(data.__observacions[safeScope])) {
        return;
    }
    data.__observacions[safeScope] = data.__observacions[safeScope].filter(item => String(item.id) !== safeId);
    await writeDatabase(data);
}

function supabaseRestRequest(method, endpointPath, body = null, preferHeader = null) {
    return new Promise((resolve, reject) => {
        if (!supabaseBaseUrl) {
            reject(new Error('Supabase no configurat'));
            return;
        }

        const bodyString = body ? JSON.stringify(body) : null;
        const headers = {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
        };

        if (preferHeader) {
            headers.Prefer = preferHeader;
        }

        if (bodyString) {
            headers['Content-Length'] = Buffer.byteLength(bodyString);
        }

        const basePath = (supabaseBaseUrl.pathname || '/').replace(/\/+$/, '');
        const fullPath = `${basePath}${endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`}`;

        const req = https.request(
            {
                protocol: supabaseBaseUrl.protocol,
                hostname: supabaseBaseUrl.hostname,
                port: supabaseBaseUrl.port || 443,
                method,
                path: fullPath,
                headers
            },
            res => {
                let responseData = '';
                res.on('data', chunk => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    const statusCode = res.statusCode || 500;
                    if (statusCode >= 200 && statusCode < 300) {
                        if (!responseData) {
                            resolve(null);
                            return;
                        }
                        try {
                            resolve(JSON.parse(responseData));
                        } catch (err) {
                            resolve(null);
                        }
                        return;
                    }

                    if (statusCode === 401) {
                        console.error(
                            '[Supabase 401] host=%s path=%s key=%s',
                            supabaseBaseUrl.hostname,
                            endpointPath,
                            describeApiKey(SUPABASE_SERVICE_ROLE_KEY)
                        );
                    }

                    reject(new Error(`Supabase HTTP ${statusCode}: ${responseData}`));
                });
            }
        );

        req.on('error', reject);
        if (bodyString) {
            req.write(bodyString);
        }
        req.end();
    });
}

function supabaseAuthRequest(method, endpointPath, body = null, bearerToken = null) {
    return new Promise((resolve, reject) => {
        if (!supabaseBaseUrl) {
            reject(new Error('Supabase no configurat'));
            return;
        }

        if (!SUPABASE_AUTH_KEY) {
            reject(new Error('SUPABASE_AUTH_KEY no configurada'));
            return;
        }

        const bodyString = body ? JSON.stringify(body) : null;
        const headers = {
            apikey: SUPABASE_AUTH_KEY,
            'Content-Type': 'application/json'
        };

        if (bearerToken) {
            headers.Authorization = `Bearer ${bearerToken}`;
        }

        if (bodyString) {
            headers['Content-Length'] = Buffer.byteLength(bodyString);
        }

        const basePath = (supabaseBaseUrl.pathname || '/').replace(/\/+$/, '');
        const fullPath = `${basePath}${endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`}`;

        const req = https.request(
            {
                protocol: supabaseBaseUrl.protocol,
                hostname: supabaseBaseUrl.hostname,
                port: supabaseBaseUrl.port || 443,
                method,
                path: fullPath,
                headers
            },
            res => {
                let responseData = '';
                res.on('data', chunk => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    const statusCode = res.statusCode || 500;
                    if (statusCode >= 200 && statusCode < 300) {
                        if (!responseData) {
                            resolve(null);
                            return;
                        }
                        try {
                            resolve(JSON.parse(responseData));
                        } catch (_) {
                            resolve(null);
                        }
                        return;
                    }

                    reject(new Error(`Supabase Auth HTTP ${statusCode}: ${responseData}`));
                });
            }
        );

        req.on('error', reject);
        if (bodyString) req.write(bodyString);
        req.end();
    });
}

const server = http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, 'http://localhost');
    const pathname = requestUrl.pathname;
    const scopeParam = requestUrl.searchParams.get('scope');
    const idParam = requestUrl.searchParams.get('id');
    const storageBackend = USE_SUPABASE ? 'supabase' : 'file';
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        if (AUTH_REQUIRED && !isPublicPath(pathname)) {
            const token = getSessionTokenFromRequest(req);
            const user = token ? await verifySupabaseSession(token) : null;

            if (!user) {
                if (pathname.startsWith('/api/')) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Unauthorized' }));
                } else {
                    const search = requestUrl.search || '';
                    res.writeHead(302, { Location: `/login.html${search}` });
                    res.end();
                }
                return;
            }

            req.authUser = user;
            req.authRoles = extractUserRoles(user);

            if (!isAuthorized(req.authRoles, pathname, req.method)) {
                if (pathname.startsWith('/api/')) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: 'Forbidden',
                        role: req.authRoles,
                        path: pathname
                    }));
                } else {
                    res.writeHead(302, { Location: '/index.html?forbidden=1' });
                    res.end();
                }
                return;
            }
        }
    } catch (authErr) {
        console.error('Auth guard error:', authErr && authErr.message ? authErr.message : authErr);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Auth guard failure' }));
        return;
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
        (async () => {
            try {
                const body = await readBody(req);
                const parsed = body ? JSON.parse(body) : {};
                const email = String(parsed.email || '').trim();
                const password = String(parsed.password || '').trim();

                if (!email || !password) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Email i password obligatoris' }));
                    return;
                }

                const session = await supabaseAuthRequest(
                    'POST',
                    '/auth/v1/token?grant_type=password',
                    { email, password }
                );

                const accessToken = session && session.access_token ? String(session.access_token) : '';
                const expiresIn = session && session.expires_in ? Number(session.expires_in) : 3600;

                if (!accessToken) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Credencials invàlides' }));
                    return;
                }

                setSessionCookie(res, accessToken, expiresIn);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            } catch (err) {
                const msg = err && err.message ? err.message : String(err);
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Login fallit', details: msg }));
            }
        })();
        return;
    }

    if (pathname === '/api/auth/logout' && req.method === 'POST') {
        clearSessionCookie(res);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        return;
    }

    if (pathname === '/api/auth/session' && req.method === 'GET') {
        (async () => {
            const token = getSessionTokenFromRequest(req);
            if (!token) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ authenticated: false }));
                return;
            }

            try {
                const user = await verifySupabaseSession(token);
                if (!user) {
                    clearSessionCookie(res);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ authenticated: false }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                const roles = extractUserRoles(user);
                res.end(JSON.stringify({
                    authenticated: true,
                    user: { id: user.id, email: user.email || '', roles },
                    debug: {
                        app_metadata: user.app_metadata || null,
                        user_metadata: user.user_metadata || null,
                        raw_app_meta_data: user.raw_app_meta_data || null,
                        raw_user_meta_data: user.raw_user_meta_data || null,
                        top_level_role: user.role || null
                    }
                }));
            } catch (_) {
                clearSessionCookie(res);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ authenticated: false }));
            }
        })();
        return;
    }

    if (pathname === '/api/auth/exchange' && req.method === 'POST') {
        (async () => {
            try {
                const body = await readBody(req);
                const parsed = body ? JSON.parse(body) : {};
                const accessToken = String(parsed.access_token || '').trim();
                const expiresIn = parsed && parsed.expires_in ? Number(parsed.expires_in) : 3600;

                if (!accessToken) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'access_token obligatori' }));
                    return;
                }

                const user = await verifySupabaseSession(accessToken);
                if (!user) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Token invàlid o expirat' }));
                    return;
                }

                setSessionCookie(res, accessToken, expiresIn);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, user: { id: user.id, email: user.email || '' } }));
            } catch (err) {
                const msg = err && err.message ? err.message : String(err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No s\'ha pogut intercanviar la sessió', details: msg }));
            }
        })();
        return;
    }

    if (pathname === '/api/players' && req.method === 'GET') {
        (async () => {
            try {
                const data = await readDatabase();
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify(data));
            } catch (err) {
                console.error('Error GET /api/players:', err && err.message ? err.message : err);
                res.writeHead(500, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut llegir la base de dades",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/players' && req.method === 'POST') {
        (async () => {
            try {
                const body = await readBody(req);
                const parsed = body ? JSON.parse(body) : {};
                await writeDatabase(parsed);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({ status: 'success' }));
            } catch (err) {
                if (err instanceof SyntaxError) {
                    res.writeHead(400, {
                        'Content-Type': 'application/json',
                        'X-Storage-Backend': storageBackend
                    });
                    res.end(JSON.stringify({ error: 'JSON invàlid' }));
                    return;
                }

                console.error('Error POST /api/players:', err && err.message ? err.message : err);
                res.writeHead(500, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut guardar la base de dades",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/equips' && req.method === 'GET') {
        (async () => {
            try {
                const equips = await readEquips();
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify(equips));
            } catch (err) {
                console.error('Error GET /api/equips:', err && err.message ? err.message : err);
                res.writeHead(500, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'han pogut llegir els equips",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/jugadors-seguiment' && req.method === 'GET') {
        (async () => {
            try {
                const segment = requestUrl.searchParams.get('segment');
                const jugadors = await readJugadorsSeguiment(segment);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify(jugadors));
            } catch (err) {
                console.error('Error GET /api/jugadors-seguiment:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'han pogut llegir els jugadors en seguiment",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/jugadors-seguiment' && req.method === 'POST') {
        (async () => {
            try {
                const segment = requestUrl.searchParams.get('segment');
                const body = await readBody(req);
                const parsed = body ? JSON.parse(body) : {};
                const created = await createJugadorSeguiment(parsed, segment);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({ status: 'success', jugador: created }));
            } catch (err) {
                if (err instanceof SyntaxError) {
                    res.writeHead(400, {
                        'Content-Type': 'application/json',
                        'X-Storage-Backend': storageBackend
                    });
                    res.end(JSON.stringify({ error: 'JSON invàlid' }));
                    return;
                }
                console.error('Error POST /api/jugadors-seguiment:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut crear el jugador en seguiment",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/jugadors-seguiment' && req.method === 'PATCH') {
        (async () => {
            try {
                const segment = requestUrl.searchParams.get('segment');
                const body = await readBody(req);
                const parsed = body ? JSON.parse(body) : {};
                await updateJugadorSeguiment(parsed, segment);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({ status: 'success' }));
            } catch (err) {
                if (err instanceof SyntaxError) {
                    res.writeHead(400, {
                        'Content-Type': 'application/json',
                        'X-Storage-Backend': storageBackend
                    });
                    res.end(JSON.stringify({ error: 'JSON invàlid' }));
                    return;
                }
                console.error('Error PATCH /api/jugadors-seguiment:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut actualitzar el jugador en seguiment",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/jugadors-seguiment' && req.method === 'DELETE') {
        (async () => {
            try {
                const jugadorId = requestUrl.searchParams.get('id');
                await deleteJugadorSeguiment(jugadorId);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({ status: 'success' }));
            } catch (err) {
                console.error('Error DELETE /api/jugadors-seguiment:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut eliminar el jugador en seguiment",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/equip-config' && req.method === 'GET') {
        (async () => {
            try {
                const equipId = requestUrl.searchParams.get('equipId');
                const config = await readEquipConfig(equipId);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify(config));
            } catch (err) {
                console.error('Error GET /api/equip-config:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut llegir la configuració d'equip",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/equip-config' && req.method === 'POST') {
        (async () => {
            try {
                const equipId = requestUrl.searchParams.get('equipId');
                const body = await readBody(req);
                const parsed = body ? JSON.parse(body) : {};
                await writeEquipConfig(equipId, parsed);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({ status: 'success' }));
            } catch (err) {
                if (err instanceof SyntaxError) {
                    res.writeHead(400, {
                        'Content-Type': 'application/json',
                        'X-Storage-Backend': storageBackend
                    });
                    res.end(JSON.stringify({ error: 'JSON invàlid' }));
                    return;
                }
                console.error('Error POST /api/equip-config:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut guardar la configuració d'equip",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/rols' && req.method === 'GET') {
        (async () => {
            try {
                const rols = await readRolsCatalog();
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify(rols));
            } catch (err) {
                console.error('Error GET /api/rols:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'han pogut llegir els rols",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/posicions' && req.method === 'GET') {
        (async () => {
            try {
                const posicions = await readPosicionsCatalog();
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify(posicions));
            } catch (err) {
                console.error('Error GET /api/posicions:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'han pogut llegir les posicions",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/jugadors' && req.method === 'GET') {
        (async () => {
            try {
                const jugadorId = requestUrl.searchParams.get('id');
                if (jugadorId) {
                    const jugador = await readJugadorById(jugadorId);
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'X-Storage-Backend': storageBackend
                    });
                    res.end(JSON.stringify(jugador || null));
                    return;
                }
                const equipId = requestUrl.searchParams.get('equipId');
                const jugadors = await readJugadorsByEquip(equipId);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify(jugadors));
            } catch (err) {
                console.error('Error GET /api/jugadors:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'han pogut llegir els jugadors",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/jugadors' && req.method === 'POST') {
        (async () => {
            try {
                const body = await readBody(req);
                const parsed = body ? JSON.parse(body) : {};
                const created = await createJugador(parsed);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({ status: 'success', jugador: created }));
            } catch (err) {
                if (err instanceof SyntaxError) {
                    res.writeHead(400, {
                        'Content-Type': 'application/json',
                        'X-Storage-Backend': storageBackend
                    });
                    res.end(JSON.stringify({ error: 'JSON invàlid' }));
                    return;
                }
                console.error('Error POST /api/jugadors:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut crear el jugador",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/jugadors' && req.method === 'PATCH') {
        (async () => {
            try {
                const body = await readBody(req);
                const parsed = body ? JSON.parse(body) : {};
                await updateJugador(parsed);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({ status: 'success' }));
            } catch (err) {
                if (err instanceof SyntaxError) {
                    res.writeHead(400, {
                        'Content-Type': 'application/json',
                        'X-Storage-Backend': storageBackend
                    });
                    res.end(JSON.stringify({ error: 'JSON invàlid' }));
                    return;
                }
                console.error('Error PATCH /api/jugadors:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut actualitzar el jugador",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/jugadors' && req.method === 'DELETE') {
        (async () => {
            try {
                const jugadorId = requestUrl.searchParams.get('id');
                await deleteJugador(jugadorId);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({ status: 'success' }));
            } catch (err) {
                console.error('Error DELETE /api/jugadors:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut eliminar el jugador",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/horarios' && req.method === 'GET') {
        (async () => {
            try {
                const horarios = await readHorarios();
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify(horarios));
            } catch (err) {
                console.error('Error GET /api/horarios:', err && err.message ? err.message : err);
                res.writeHead(500, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut llegir els horaris",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/horarios' && req.method === 'POST') {
        (async () => {
            try {
                const body = await readBody(req);
                const horarios = body ? JSON.parse(body) : [];
                await writeHorarios(horarios);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({ status: 'success' }));
            } catch (err) {
                if (err instanceof SyntaxError) {
                    res.writeHead(400, {
                        'Content-Type': 'application/json',
                        'X-Storage-Backend': storageBackend
                    });
                    res.end(JSON.stringify({ error: 'JSON invàlid' }));
                    return;
                }

                console.error('Error POST /api/horarios:', err && err.message ? err.message : err);
                res.writeHead(500, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut guardar els horaris",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/observacions' && req.method === 'GET') {
        (async () => {
            try {
                const observacions = await readObservacions(scopeParam);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify(observacions));
            } catch (err) {
                console.error('Error GET /api/observacions:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'han pogut llegir les observacions",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/observacions' && req.method === 'POST') {
        (async () => {
            try {
                const body = await readBody(req);
                const parsed = body ? JSON.parse(body) : {};
                const created = await addObservacio(scopeParam, parsed);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({ status: 'success', observacio: created }));
            } catch (err) {
                if (err instanceof SyntaxError) {
                    res.writeHead(400, {
                        'Content-Type': 'application/json',
                        'X-Storage-Backend': storageBackend
                    });
                    res.end(JSON.stringify({ error: 'JSON invàlid' }));
                    return;
                }

                console.error('Error POST /api/observacions:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut guardar l'observació",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else if (pathname === '/api/observacions' && req.method === 'DELETE') {
        (async () => {
            try {
                await deleteObservacio(scopeParam, idParam);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({ status: 'success' }));
            } catch (err) {
                console.error('Error DELETE /api/observacions:', err && err.message ? err.message : err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'X-Storage-Backend': storageBackend
                });
                res.end(JSON.stringify({
                    error: "No s'ha pogut eliminar l'observació",
                    details: err && err.message ? err.message : String(err)
                }));
            }
        })();
    } else {
        // Servir fitxers estàtics (HTML, CSS, JS, etc.)
        // Fem servir pathname (sense querystring) per evitar 404 amb ?playerId=...
        const staticPath = pathname === '/' ? '/index.html' : pathname;
        const decodedPath = decodeURIComponent(staticPath);
        let filePath = path.join(__dirname, decodedPath);
        
        // Securitat: evita path traversal
        if (!filePath.startsWith(__dirname)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        
        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.writeHead(404);
                res.end('File not found');
                return;
            }
            
            // Detecta tipus MIME
            const ext = path.extname(filePath);
            const mimeTypes = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.jpeg': 'image/jpeg'
            };
            const contentType = mimeTypes[ext] || 'text/plain';
            
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
        });
    }
});

server.listen(PORT, async () => {
    console.log(`BBDD del CF Cardona activa al port ${PORT}`);
    if (USE_SUPABASE) {
        console.log(
            '[Supabase config] host=%s key=%s',
            supabaseBaseUrl.hostname,
            describeApiKey(SUPABASE_SERVICE_ROLE_KEY)
        );
        console.log(`Persistència activa a Supabase (${SUPABASE_SECCIONS_TABLE} + observacions + horarios_entrenaments)`);
        try {
            await ensureHorariosTable();
        } catch (err) {
            console.warn('Warning during table initialization:', err.message);
        }
    } else {
        console.log(`Dades persistents a fitxer local: ${DATA_FILE}`);
    }
});
