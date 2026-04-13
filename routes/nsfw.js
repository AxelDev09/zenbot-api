import { Router } from 'express';
import { requireKey } from '../server.js';
import {
  xnxxSearch, xnxxDownload,
  phSearch, phDownload, phDownloadBuffer,
  xvideosSearch, xvideosDownload,
  xhamsterSearch, xhamsterDownload, xhamsterDownloadBuffer,
  rule34Random,
} from '@axel-dev09/zen-dl';

const r = Router();
r.use(requireKey);

const wrap = fn => async (req, res) => {
  try { res.json({ ok: true, result: await fn(req) }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};

r.get('/xnxx',             wrap(req => xnxxSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/xnxxdl',           wrap(req => xnxxDownload(req.query.url)));
r.get('/ph',               wrap(req => phSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/phdl',             wrap(req => phDownload(req.query.url)));
r.get('/phdlbuffer',       wrap(req => phDownloadBuffer(req.query.url, req.query.quality || '720')));
r.get('/xvideos',          wrap(req => xvideosSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/xvideosdl',        wrap(req => xvideosDownload(req.query.url)));
r.get('/xhamster',         wrap(req => xhamsterSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/xhamsterdl',       wrap(req => xhamsterDownload(req.query.url)));
r.get('/xhamsterdlbuffer', wrap(req => xhamsterDownloadBuffer(req.query.url, req.query.quality || '720p')));
r.get('/rule34',           wrap(req => rule34Random(req.query.tags || '')));

export default r;
