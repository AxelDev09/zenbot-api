import { Router } from 'express';
import { requireKey } from '../server.js';
import {
  translate, getLangs, weather,
  qrGenerate, qrRead,
  lyricsSearch, lyricsGet,
  news, newsCategories, screenshot,
  upload, shortenUrl, expandUrl,
  tiktokStalk, attp,
} from '@axel-dev09/zen-dl';

const r = Router();
r.use(requireKey);

const wrap = fn => async (req, res) => {
  try { res.json({ ok: true, result: await fn(req) }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};

r.get('/translate',      wrap(req => translate(req.query.text, req.query.to || 'es')));
r.get('/langs',          wrap(req => getLangs()));
r.get('/weather',        wrap(req => weather(req.query.city)));
r.get('/qr',             wrap(req => qrGenerate(req.query.text, Number(req.query.size) || 300)));
r.get('/qrread',         wrap(req => qrRead(req.query.url)));
r.get('/lyrics',         wrap(req => lyricsGet(req.query.artist, req.query.title)));
r.get('/lyricssearch',   wrap(req => lyricsSearch(req.query.q)));
r.get('/news',           wrap(req => news(req.query.lang || 'es', Number(req.query.limit) || 5)));
r.get('/newscategories', wrap(req => newsCategories()));
r.get('/screenshot',     wrap(req => screenshot(req.query.url, Number(req.query.w) || 1280, Number(req.query.h) || 720)));
r.get('/shorten',        wrap(req => shortenUrl(req.query.url)));
r.get('/expand',         wrap(req => expandUrl(req.query.url)));
r.get('/ttstalk',        wrap(req => tiktokStalk(req.query.user)));
r.get('/attp',           wrap(req => attp(req.query.text, Number(req.query.scale) || 5)));
r.get('/upload',         wrap(req => upload(req.query.url, req.query.filename)));

export default r;
