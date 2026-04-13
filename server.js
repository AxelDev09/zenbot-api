import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

import scraperRoutes from './routes/scrapers.js';
import searchRoutes  from './routes/search.js';
import toolsRoutes   from './routes/tools.js';
import nsfwRoutes    from './routes/nsfw.js';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const PORT       = process.env.PORT || 3030;
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const KEYS_FILE  = join(__dirname, 'keys.json');

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

function loadKeys() {
  if (!existsSync(KEYS_FILE)) return {};
  try { return JSON.parse(readFileSync(KEYS_FILE, 'utf8')); } catch { return {}; }
}

function saveKeys(keys) {
  writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

export function requireKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key) return res.status(401).json({ error: 'Falta x-api-key' });
  const keys = loadKeys();
  if (!keys[key]) return res.status(403).json({ error: 'API key inválida' });
  keys[key].lastUsed = Date.now();
  keys[key].requests = (keys[key].requests || 0) + 1;
  saveKeys(keys);
  req.keyData = keys[key];
  next();
}

app.post('/auth/register', (req, res) => {
  const { adminPass, name } = req.body;
  if (adminPass !== ADMIN_PASS) return res.status(403).json({ error: 'Contraseña admin incorrecta' });
  if (!name) return res.status(400).json({ error: 'Falta name' });
  const key  = 'zb_' + crypto.randomBytes(24).toString('hex');
  const keys = loadKeys();
  keys[key]  = { name, createdAt: Date.now(), lastUsed: null, requests: 0 };
  saveKeys(keys);
  res.json({ ok: true, key, name });
});

app.delete('/auth/revoke', (req, res) => {
  const { adminPass, key } = req.body;
  if (adminPass !== ADMIN_PASS) return res.status(403).json({ error: 'Contraseña admin incorrecta' });
  const keys = loadKeys();
  if (!keys[key]) return res.status(404).json({ error: 'Key no encontrada' });
  delete keys[key];
  saveKeys(keys);
  res.json({ ok: true });
});

app.get('/auth/keys', (req, res) => {
  const { adminPass } = req.query;
  if (adminPass !== ADMIN_PASS) return res.status(403).json({ error: 'Contraseña admin incorrecta' });
  const keys = loadKeys();
  const list = Object.entries(keys).map(([k, v]) => ({
    key:       k.slice(0, 12) + '...',
    name:      v.name,
    createdAt: v.createdAt,
    lastUsed:  v.lastUsed,
    requests:  v.requests,
  }));
  res.json({ total: list.length, keys: list });
});

app.get('/ping', (_, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/scrapers', scraperRoutes);
app.use('/search',   searchRoutes);
app.use('/tools',    toolsRoutes);
app.use('/nsfw',     nsfwRoutes);

app.use((_, res) => res.status(404).json({ error: 'Endpoint no encontrado' }));

app.listen(PORT, () => console.log('[API] Activa en puerto ' + PORT));
