import { Router } from 'express';
import { requireKey } from '../server.js';
import {
  ytDownload, ytInfo, ytSearch, getFileSize,
  tiktokDownload, tiktokInfo, tiktokSearch, snaptikDownload,
  fbDownload,
  tweetInfo, tweetDownload,
  mediafireInfo,
  githubInfo, githubRelease, githubContents, githubSearch,
  apkSearch, apkInfo,
  aptoideSearch, aptoideInfo,
  bookSearch, bookInfo,
  gdriveInfo, gdriveDownload,
  igDownload, igReelDownload, igStalk, igStories,
  threadsDownload,
  spotidownTrack,
  deezerSearch, deezerTrack,
  ddownr
} from '@soyaxell09/zenbot-scraper';

const r = Router();
r.use(requireKey);

const wrap = fn => async (req, res) => {
  try { res.json({ ok: true, result: await fn(req) }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};

r.get('/ytinfo',         wrap(req => ytInfo(req.query.url)));
r.get('/ytdownload',     wrap(req => ytDownload(req.query.url, req.query.type, req.query.quality)));
r.get('/ytsearch',       wrap(req => ytSearch(req.query.q, Number(req.query.limit) || 5)));
r.get('/ytsize',         wrap(req => getFileSize(req.query.url)));
r.get('/tiktok',         wrap(req => tiktokDownload(req.query.url)));
r.get('/tiktokinfo',     wrap(req => tiktokInfo(req.query.url)));
r.get('/tiktoksearch',   wrap(req => tiktokSearch(req.query.q, Number(req.query.limit) || 5)));
r.get('/snaptik',        wrap(req => snaptikDownload(req.query.url)));
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
r.get('/aptoide',        wrap(req => aptoideSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/aptoideinfo',    wrap(req => aptoideInfo(req.query.pkg)));
r.get('/booksearch',     wrap(req => bookSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/bookinfo',       wrap(req => bookInfo(req.query.url)));
r.get('/gdrive',         wrap(req => gdriveInfo(req.query.url)));
r.get('/gdrivedl',       wrap(req => gdriveDownload(req.query.url)));
r.get('/ig',             wrap(req => igDownload(req.query.url)));
r.get('/igreel',         wrap(req => igReelDownload(req.query.url)));
r.get('/igstalk',        wrap(req => igStalk(req.query.user)));
r.get('/igstories',      wrap(req => igStories(req.query.user)));
r.get('/threads',        wrap(req => threadsDownload(req.query.url)));
r.get('/spoti',          wrap(req => spotidownTrack(req.query.url)));
r.get('/deezersearch',   wrap(req => deezerSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/deezertrack',    wrap(req => deezerTrack(req.query.q, req.query.format || 'mp3')));
r.get('/ddownr',         wrap(req => ddownr(req.query.url, req.query.format || '720')));

export default r;