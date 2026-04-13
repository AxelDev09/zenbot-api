import { Router } from 'express';
import { requireKey } from '../server.js';
import {
  pinsearch, pinimg, pinvid,
  giphy, gifNext, giphyBuffer,
  googleSearch, animeImage, wallpaperSearch, stickerSearch,
  deezerFind, deezerSearchAlbum, deezerSearchArtist, deezerAlbumTracks, deezerArtistTopTracks
} from '@axel-dev09/zen-dl';

const r = Router();
r.use(requireKey);

const wrap = fn => async (req, res) => {
  try { res.json({ ok: true, result: await fn(req) }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};

r.get('/pinterest',         wrap(req => pinsearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/pinimg',            wrap(req => pinimg(req.query.url)));
r.get('/pinvid',            wrap(req => pinvid(req.query.q, Number(req.query.limit) || 5)));
r.get('/gif',               wrap(req => giphy(req.query.q, Number(req.query.limit) || 5)));
r.get('/gifnext',           wrap(req => gifNext(req.query.q)));
r.get('/gifbuffer',         wrap(req => giphyBuffer(req.query.q)));
r.get('/google',            wrap(req => googleSearch(req.query.q, Number(req.query.limit) || 5)));
r.get('/anime',             wrap(req => animeImage(req.query.q, Number(req.query.limit) || 5)));
r.get('/wallpaper',         wrap(req => wallpaperSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/sticker',           wrap(req => stickerSearch(req.query.q, Number(req.query.limit) || 10)));
r.get('/deezerfind',        wrap(req => deezerFind(req.query.q, Number(req.query.limit) || 10)));
r.get('/deezeralbums',      wrap(req => deezerSearchAlbum(req.query.q, Number(req.query.limit) || 10)));
r.get('/deezerartists',     wrap(req => deezerSearchArtist(req.query.q, Number(req.query.limit) || 10)));
r.get('/deezeralbumtracks', wrap(req => deezerAlbumTracks(req.query.id, Number(req.query.limit) || 50)));
r.get('/deezertoptracks',   wrap(req => deezerArtistTopTracks(req.query.id, Number(req.query.limit) || 10)));

export default r;
