import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('/sdcard/zenbot-api/routes', { recursive: true });

// — server.js
writeFileSync('/sdcard/zenbot-api/server.js', `
import express    from 'express';
import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';
import crypto from 'crypto';

import scraperRoutes from './routes/scrapers.js';
import searchRoutes  from './routes/search.js';
import toolsRoutes   from './routes/tools.js';
import nsfwRoutes    from './routes/nsfw.js';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const PORT       = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const KEYS_FILE  = join(__dirname, 'keys.json');

const app = express();
app.use(express.json());

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
`.trim());

// — routes/scrapers.js
writeFileSync('/sdcard/zenbot-api/routes/scrapers.js', `
import { Router } from 'express';
import { requireKey } from '../server.js';
import {
  youtubeDownload,
  ytDownload, ytInfo, ytSearch, getFileSize,
  tiktokDownload, tiktokInfo,
  fbDownload,
  tweetInfo, tweetDownload,
  mediafireInfo,
  githubInfo, githubRelease, githubContents, githubSearch,
  apkSearch, apkInfo,
  gdriveInfo, gdriveDownload,
  igDownload, igReelDownload, igStalk, igStories,
  threadsDownload,
  spotidownTrack,
} from '@soyaxell09/zenbot-scraper';

const r = Router();
r.use(requireKey);

const wrap = fn => async (req, res) => {
  try { res.json({ ok: true, result: await fn(req) }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};

r.get('/youtube',        wrap(req => youtubeDownload(req.query.q)));
r.get('/ytinfo',         wrap(req => ytInfo(req.query.url)));
r.get('/ytdownload',     wrap(req => ytDownload(req.query.url, req.query.type || 'mp3', req.query.quality || '128k')));
r.get('/ytsearch',       wrap(req => ytSearch(req.query.q, Number(req.query.limit) || 5)));
r.get('/ytsize',         wrap(req => getFileSize(req.query.url)));
r.get('/tiktok',         wrap(req => tiktokDownload(req.query.url)));
r.get('/tiktokinfo',     wrap(req => tiktokInfo(req.query.url)));
r.get('/facebook',       wrap(req => fbDownload(req.query.url)));
r.get('/tweet',          wrap(req => tweetInfo(req.query.url)));
r.get('/tweetdl',        wrap(req => tweetDownload(req.query.url)));
r.get('/mediafire',      wrap(req => mediafireInfo(req.query.url)));
r.get('/github',         wrap(req => githubInfo(req.query.repo)));
r.get('/githubrelease',  wrap(req => githubRelease(req.query.repo)));
r.get('/githubcontents', wrap(req => githubContents(req.query.repo, req.query.path)));
r.get('/githubsearch',   wrap(req => githubSearch(req.query.q, req.query.type || 'repositories', Number(req.query.limit) || 5)));
r.get('/apksearch',      wrap(req => apkSearch(req.query.q, Number(req.query.limit) || 5)));
r.get('/apkinfo',        wrap(req => apkInfo(req.query.pkg)));
r.get('/gdrive',         wrap(req => gdriveInfo(req.query.url)));
r.get('/gdriveдл',       wrap(req => gdriveDownload(req.query.url)));
r.get('/ig',             wrap(req => igDownload(req.query.url)));
r.get('/igreel',         wrap(req => igReelDownload(req.query.url)));
r.get('/igstalk',        wrap(req => igStalk(req.query.user)));
r.get('/igstories',      wrap(req => igStories(req.query.user)));
r.get('/threads',        wrap(req => threadsDownload(req.query.url)));
r.get('/spoti',          wrap(req => spotidownTrack(req.query.url)));

export default r;
`.trim());

// — routes/search.js
writeFileSync('/sdcard/zenbot-api/routes/search.js', `
import { Router } from 'express';
import { requireKey } from '../server.js';
import {
  pinsearch, pinimg, pinvid,
  giphy, gifNext, giphyBuffer,
  spotify,
  googleSearch, animeImage, wallpaperSearch, stickerSearch,
} from '@soyaxell09/zenbot-scraper';

const r = Router();
r.use(requireKey);

const wrap = fn => async (req, res) => {
  try { res.json({ ok: true, result: await fn(req) }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};

r.get('/pinterest', wrap(req => pinsearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/pinimg',    wrap(req => pinimg(req.query.url)));
r.get('/pinvid',    wrap(req => pinvid(req.query.q, Number(req.query.limit) || 5)));
r.get('/gif',       wrap(req => giphy(req.query.q, Number(req.query.limit) || 5)));
r.get('/gifnext',   wrap(req => gifNext(req.query.q)));
r.get('/gifbuffer', wrap(req => giphyBuffer(req.query.q)));
r.get('/spotify',   wrap(req => spotify(req.query.q, req.query.type || 'tracks', Number(req.query.limit) || 5)));
r.get('/google',    wrap(req => googleSearch(req.query.q, Number(req.query.limit) || 5)));
r.get('/anime',     wrap(req => animeImage(req.query.q, Number(req.query.limit) || 5)));
r.get('/wallpaper', wrap(req => wallpaperSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/sticker',   wrap(req => stickerSearch(req.query.q, Number(req.query.limit) || 10)));

export default r;
`.trim());

// — routes/tools.js
writeFileSync('/sdcard/zenbot-api/routes/tools.js', `
import { Router } from 'express';
import { requireKey } from '../server.js';
import {
  translate, weather,
  qrGenerate, qrRead,
  lyricsSearch, lyricsGet,
  news, screenshot,
  upload, shortenUrl, expandUrl,
  tiktokStalk, attp,
} from '@soyaxell09/zenbot-scraper';

const r = Router();
r.use(requireKey);

const wrap = fn => async (req, res) => {
  try { res.json({ ok: true, result: await fn(req) }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};

r.get('/translate',    wrap(req => translate(req.query.text, req.query.to || 'es')));
r.get('/weather',      wrap(req => weather(req.query.city)));
r.get('/qr',           wrap(req => qrGenerate(req.query.text, Number(req.query.size) || 300)));
r.get('/lyrics',       wrap(req => lyricsGet(req.query.artist, req.query.title)));
r.get('/lyricssearch', wrap(req => lyricsSearch(req.query.q)));
r.get('/news',         wrap(req => news(req.query.lang || 'es', Number(req.query.limit) || 5)));
r.get('/screenshot',   wrap(req => screenshot(req.query.url, Number(req.query.w) || 1280, Number(req.query.h) || 720)));
r.get('/shorten',      wrap(req => shortenUrl(req.query.url)));
r.get('/expand',       wrap(req => expandUrl(req.query.url)));
r.get('/ttstalk',      wrap(req => tiktokStalk(req.query.user)));
r.get('/attp',         wrap(req => attp(req.query.text, Number(req.query.scale) || 5)));

export default r;
`.trim());

// — routes/nsfw.js
writeFileSync('/sdcard/zenbot-api/routes/nsfw.js', `
import { Router } from 'express';
import { requireKey } from '../server.js';
import {
  xnxxSearch, xnxxDownload,
  phSearch, phDownload,
  xvideosSearch, xvideosDownload,
  xhamsterSearch, xhamsterDownload,
  rule34Random,
} from '@soyaxell09/zenbot-scraper';

const r = Router();
r.use(requireKey);

const wrap = fn => async (req, res) => {
  try { res.json({ ok: true, result: await fn(req) }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};

r.get('/xnxx',       wrap(req => xnxxSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/xnxxdl',     wrap(req => xnxxDownload(req.query.url)));
r.get('/ph',         wrap(req => phSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/phdl',       wrap(req => phDownload(req.query.url)));
r.get('/xvideos',    wrap(req => xvideosSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/xvideosdl',  wrap(req => xvideosDownload(req.query.url)));
r.get('/xhamster',   wrap(req => xhamsterSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/xhamsterdl', wrap(req => xhamsterDownload(req.query.url)));
r.get('/rule34',     wrap(req => rule34Random(req.query.tags || '')));

export default r;
`.trim());

// — package.json
writeFileSync('/sdcard/zenbot-api/package.json', JSON.stringify({
  name: 'zenbot-api',
  version: '1.0.0',
  type: 'module',
  main: 'server.js',
  scripts: { start: 'node server.js' },
  dependencies: {
    express: '^4.18.2',
    '@soyaxell09/zenbot-scraper': 'latest',
  }
}, null, 2));

// — api-client.js
writeFileSync('/sdcard/zenbot-api/api-client.js', `
import axios from 'axios';

const BASE    = process.env.ZENBOT_API_URL || 'https://api.axelmodz.xyz';
const API_KEY = process.env.ZENBOT_API_KEY || '';

const client = axios.create({
  baseURL: BASE,
  headers: { 'x-api-key': API_KEY },
  timeout: 30000,
});

async function get(path, params = {}) {
  const { data } = await client.get(path, { params });
  if (!data.ok) throw new Error(data.error || 'Error en la API');
  return data.result;
}

export const youtubeDownload = q               => get('/scrapers/youtube', { q });
export const ytInfo          = url             => get('/scrapers/ytinfo', { url });
export const ytDownload      = (url, type, quality) => get('/scrapers/ytdownload', { url, type, quality });
export const ytSearch        = (q, limit)      => get('/scrapers/ytsearch', { q, limit });
export const tiktokDownload  = url             => get('/scrapers/tiktok', { url });
export const fbDownload      = url             => get('/scrapers/facebook', { url });
export const tweetInfo       = url             => get('/scrapers/tweet', { url });
export const tweetDownload   = url             => get('/scrapers/tweetdl', { url });
export const mediafireInfo   = url             => get('/scrapers/mediafire', { url });
export const githubInfo      = repo            => get('/scrapers/github', { repo });
export const githubRelease   = repo            => get('/scrapers/githubrelease', { repo });
export const githubContents  = (repo, path)    => get('/scrapers/githubcontents', { repo, path });
export const githubSearch    = (q, type, limit)=> get('/scrapers/githubsearch', { q, type, limit });
export const apkSearch       = (q, limit)      => get('/scrapers/apksearch', { q, limit });
export const apkInfo         = pkg             => get('/scrapers/apkinfo', { pkg });
export const gdriveInfo      = url             => get('/scrapers/gdrive', { url });
export const igDownload      = url             => get('/scrapers/ig', { url });
export const igReelDownload  = url             => get('/scrapers/igreel', { url });
export const igStalk         = user            => get('/scrapers/igstalk', { user });
export const igStories       = user            => get('/scrapers/igstories', { user });
export const threadsDownload = url             => get('/scrapers/threads', { url });
export const spotidownTrack  = url             => get('/scrapers/spoti', { url });
export const pinsearch       = (q, limit)      => get('/search/pinterest', { q, limit });
export const pinimg          = url             => get('/search/pinimg', { url });
export const pinvid          = (q, limit)      => get('/search/pinvid', { q, limit });
export const giphy           = (q, limit)      => get('/search/gif', { q, limit });
export const gifNext         = q               => get('/search/gifnext', { q });
export const spotify         = (q, type, limit)=> get('/search/spotify', { q, type, limit });
export const googleSearch    = (q, limit)      => get('/search/google', { q, limit });
export const animeImage      = (q, limit)      => get('/search/anime', { q, limit });
export const wallpaperSearch = (q, limit)      => get('/search/wallpaper', { q, limit });
export const stickerSearch   = (q, limit)      => get('/search/sticker', { q, limit });
export const translate       = (text, to)      => get('/tools/translate', { text, to });
export const weather         = city            => get('/tools/weather', { city });
export const qrGenerate      = (text, size)    => get('/tools/qr', { text, size });
export const lyricsGet       = (artist, title) => get('/tools/lyrics', { artist, title });
export const lyricsSearch    = q               => get('/tools/lyricssearch', { q });
export const news            = (lang, limit)   => get('/tools/news', { lang, limit });
export const screenshot      = (url, w, h)     => get('/tools/screenshot', { url, w, h });
export const shortenUrl      = url             => get('/tools/shorten', { url });
export const expandUrl       = url             => get('/tools/expand', { url });
export const tiktokStalk     = user            => get('/tools/ttstalk', { user });
export const attp            = (text, scale)   => get('/tools/attp', { text, scale });
export const xnxxSearch      = (q, limit)      => get('/nsfw/xnxx', { q, limit });
export const xnxxDownload    = url             => get('/nsfw/xnxxdl', { url });
export const phSearch        = (q, limit)      => get('/nsfw/ph', { q, limit });
export const phDownload      = url             => get('/nsfw/phdl', { url });
export const xvideosSearch   = (q, limit)      => get('/nsfw/xvideos', { q, limit });
export const xvideosDownload = url             => get('/nsfw/xvideosdl', { url });
export const xhamsterSearch  = (q, limit)      => get('/nsfw/xhamster', { q, limit });
export const xhamsterDownload= url             => get('/nsfw/xhamsterdl', { url });
export const rule34Random    = tags            => get('/nsfw/rule34', { tags });
`.trim());

console.log('✅ zenbot-api creado en /sdcard/zenbot-api');
