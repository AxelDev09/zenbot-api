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

// Scrapers
export const ytInfo          = url             => get('/scrapers/ytinfo', { url });
export const ytDownload      = (url, type, quality) => get('/scrapers/ytdownload', { url, type, quality });
export const ytSearch        = (q, limit)      => get('/scrapers/ytsearch', { q, limit });
export const ytSize          = url             => get('/scrapers/ytsize', { url });
export const tiktokDownload  = url             => get('/scrapers/tiktok', { url });
export const tiktokInfo      = url             => get('/scrapers/tiktokinfo', { url });
export const tiktokSearch    = (q, limit)      => get('/scrapers/tiktoksearch', { q, limit });
export const snaptikDownload = url             => get('/scrapers/snaptik', { url });
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
export const aptoideSearch   = (q, limit)      => get('/scrapers/aptoide', { q, limit });
export const aptoideInfo     = pkg             => get('/scrapers/aptoideinfo', { pkg });
export const bookSearch      = (q, limit)      => get('/scrapers/booksearch', { q, limit });
export const bookInfo        = url             => get('/scrapers/bookinfo', { url });
export const gdriveInfo      = url             => get('/scrapers/gdrive', { url });
export const gdriveDownload  = url             => get('/scrapers/gdrivedl', { url });
export const igDownload      = url             => get('/scrapers/ig', { url });
export const igReelDownload  = url             => get('/scrapers/igreel', { url });
export const igStalk         = user            => get('/scrapers/igstalk', { user });
export const igStories       = user            => get('/scrapers/igstories', { user });
export const threadsDownload = url             => get('/scrapers/threads', { url });
export const spotidownTrack  = url             => get('/scrapers/spoti', { url });
export const deezerSearch    = (q, limit)      => get('/scrapers/deezersearch', { q, limit });
export const deezerTrack     = (q, format)     => get('/scrapers/deezertrack', { q, format });
export const ddownr          = (url, format)   => get('/scrapers/ddownr', { url, format });

// Search
export const pinsearch       = (q, limit)      => get('/search/pinterest', { q, limit });
export const pinimg          = url             => get('/search/pinimg', { url });
export const pinvid          = (q, limit)      => get('/search/pinvid', { q, limit });
export const giphy           = (q, limit)      => get('/search/gif', { q, limit });
export const gifNext         = q               => get('/search/gifnext', { q });
export const gifBuffer       = q               => get('/search/gifbuffer', { q });
export const googleSearch    = (q, limit)      => get('/search/google', { q, limit });
export const animeImage      = (q, limit)      => get('/search/anime', { q, limit });
export const wallpaperSearch = (q, limit)      => get('/search/wallpaper', { q, limit });
export const stickerSearch   = (q, limit)      => get('/search/sticker', { q, limit });
export const deezerFind            = (q, limit) => get('/search/deezerfind', { q, limit });
export const deezerSearchAlbum     = (q, limit) => get('/search/deezeralbums', { q, limit });
export const deezerSearchArtist    = (q, limit) => get('/search/deezerartists', { q, limit });
export const deezerAlbumTracks     = (id, limit)=> get('/search/deezeralbumtracks', { id, limit });
export const deezerArtistTopTracks = (id, limit)=> get('/search/deezertoptracks', { id, limit });

// Tools
export const translate       = (text, to)      => get('/tools/translate', { text, to });
export const getLangs        = ()              => get('/tools/langs');
export const weather         = city            => get('/tools/weather', { city });
export const qrGenerate      = (text, size)    => get('/tools/qr', { text, size });
export const qrRead          = url             => get('/tools/qrread', { url });
export const lyricsGet       = (artist, title) => get('/tools/lyrics', { artist, title });
export const lyricsSearch    = q               => get('/tools/lyricssearch', { q });
export const news            = (lang, limit)   => get('/tools/news', { lang, limit });
export const newsCategories  = ()              => get('/tools/newscategories');
export const screenshot      = (url, w, h)     => get('/tools/screenshot', { url, w, h });
export const shortenUrl      = url             => get('/tools/shorten', { url });
export const expandUrl       = url             => get('/tools/expand', { url });
export const tiktokStalk     = user            => get('/tools/ttstalk', { user });
export const attp            = (text, scale)   => get('/tools/attp', { text, scale });
export const uploadFile      = (url, filename) => get('/tools/upload', { url, filename });

// NSFW
export const xnxxSearch      = (q, limit)      => get('/nsfw/xnxx', { q, limit });
export const xnxxDownload    = url             => get('/nsfw/xnxxdl', { url });
export const phSearch        = (q, limit)      => get('/nsfw/ph', { q, limit });
export const phDownload      = url             => get('/nsfw/phdl', { url });
export const phDownloadBuf   = (url, quality)  => get('/nsfw/phdlbuffer', { url, quality });
export const xvideosSearch   = (q, limit)      => get('/nsfw/xvideos', { q, limit });
export const xvideosDownload = url             => get('/nsfw/xvideosdl', { url });
export const xhamsterSearch  = (q, limit)      => get('/nsfw/xhamster', { q, limit });
export const xhamsterDownload= url             => get('/nsfw/xhamsterdl', { url });
export const xhamsterDlBuf   = (url, quality)  => get('/nsfw/xhamsterdlbuffer', { url, quality });
export const rule34Random    = tags            => get('/nsfw/rule34', { tags });