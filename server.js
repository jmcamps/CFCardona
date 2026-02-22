const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IS_RENDER = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const IS_PUBLISHABLE_KEY = String(SUPABASE_SERVICE_ROLE_KEY || '').startsWith('sb_publishable_');
const USE_SUPABASE = HAS_SUPABASE_CONFIG;
const SUPABASE_TABLE = 'app_state';
const SUPABASE_ROW_ID = 'cfcardona_main';
const supabaseBaseUrl = USE_SUPABASE ? new URL(SUPABASE_URL) : null;

if (IS_RENDER && !HAS_SUPABASE_CONFIG) {
    throw new Error('Render sense Supabase configurat: cal definir SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY');
}

if (HAS_SUPABASE_CONFIG && IS_PUBLISHABLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no pot ser una clau publishable (sb_publishable_*). Usa service_role o secret de servidor.');
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

async function readDatabase() {
    if (USE_SUPABASE) {
        const rows = await supabaseRestRequest('GET', `/rest/v1/${SUPABASE_TABLE}?id=eq.${encodeURIComponent(SUPABASE_ROW_ID)}&select=payload&limit=1`);
        return rows?.[0]?.payload || {};
    }

    const raw = await fs.promises.readFile(DATA_FILE, 'utf8');
    return raw ? JSON.parse(raw) : {};
}

async function writeDatabase(payload) {
    if (USE_SUPABASE) {
        await supabaseRestRequest(
            'POST',
            `/rest/v1/${SUPABASE_TABLE}?on_conflict=id`,
            [{ id: SUPABASE_ROW_ID, payload }],
            'resolution=merge-duplicates'
        );
        return;
    }

    await fs.promises.writeFile(DATA_FILE, JSON.stringify(payload), 'utf8');
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

        const req = https.request(
            {
                protocol: supabaseBaseUrl.protocol,
                hostname: supabaseBaseUrl.hostname,
                port: supabaseBaseUrl.port || 443,
                method,
                path: endpointPath,
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

const server = http.createServer((req, res) => {
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

    if (req.url === '/api/players' && req.method === 'GET') {
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
    } else if (req.url === '/api/players' && req.method === 'POST') {
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
    } else {
        // Servir fitxers estàtics (HTML, CSS, JS, etc.)
        // Decodifica la URL (per espais i altres caracteres especials)
        const decodedUrl = decodeURIComponent(req.url === '/' ? 'index.html' : req.url);
        let filePath = path.join(__dirname, decodedUrl);
        
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

server.listen(PORT, () => {
    console.log(`BBDD del CF Cardona activa al port ${PORT}`);
    if (USE_SUPABASE) {
        console.log(`Persistència activa a Supabase (${SUPABASE_TABLE}.${SUPABASE_ROW_ID})`);
    } else {
        console.log(`Dades persistents a fitxer local: ${DATA_FILE}`);
    }
});
