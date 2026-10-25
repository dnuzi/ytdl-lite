# ✨ ytdl-lite

Zero-dependency YouTube downloader & search for Node.js 18+. **CommonJS + ESM + TypeScript.**

```bash
npm install ytdl-lite
```

## Quick start

```js
// CommonJS
const { ytmp3, ytmp4, search, getInfo } = require('ytdl-lite');
// ESM
import { ytmp3, ytmp4, search, getInfo } from 'ytdl-lite';

const URL = 'https://youtu.be/dQw4w9WgXcQ';

await ytmp3(URL);                                  // { url, title, path, ... }
await ytmp3('never gonna give you up');            // search text works too
await ytmp3(URL, 'best', { save: true, dir: './music' }); // download to disk
await ytmp4(URL, '720');                           // 360 | 480 | 720 | 1080 | best | worst
await ytmp4(URL, null);                            // all formats -> .medias[]
await search('believer', { limit: 5 });
await getInfo(URL);                                // views, likes, description, chapters...
await getPlaylist('https://youtube.com/playlist?list=PL...', { all: true });
```

### getInfo output (example)
```js
{ id, url, title, description, author, channelId, channelUrl, duration: '3:33', seconds: 213,
  views: 1500000000, likes: 18000000 /* best effort, may be null */, publishDate: '2009-10-25',
  uploadDate, category: 'Music', keywords: [...], chapters: [{ time, seconds, title }],
  isLive, isPrivate, isUnlisted, isFamilySafe, availableCountries, playlistId,
  thumbnail, thumbnails: { default, medium, high, standard, maxres }, thumbnailList }
```

### getPlaylist output
```js
{ id, url, title, description, author, channelId, channelUrl, videoCount, views, lastUpdated,
  totalSeconds, thumbnail, hasMore, items: [{ index, id, url, title, author, duration, seconds, thumbnail, isPlayable }] }
```

## API

| Function | Description |
| --- | --- |
| `ytmp3(input, quality?, opts?)` | MP3 link (`input` = URL or search query) |
| `ytmp4(input, quality = 'best', opts?)` | MP4 link; `null` returns every format |
| `search(query, { limit, providers, cache })` | Search videos |
| `getInfo(input, { likes })` | **Full details**: description, views, likes, dates, category, keywords, chapters, channel, flags, thumbnails |
| `getPlaylist(urlOrId, { limit, all })` | Playlist details + videos (paginated, default 100, `all:true` for everything) |
| `getLink(url, format, opts?)` | Low-level: direct link for `mp3`/`360`/`480`/`720`/`1080` |
| `saveFile(url, path, { onProgress })` | Stream a URL to disk |
| `extractVideoId`, `isYouTubeUrl`, `slugify`, `buildPath`, `formatDuration`, `formatBytes`, `thumbnails` | Utilities |

**Options** (`ytmp3` / `ytmp4`): `dir`, `save`, `onProgress`, `apiKey` (or env `YTDL_API_KEY`), `timeout`, `maxWaitMs`, `retries`.

**Search** tries Innertube → Piped → Invidious → HTML and caches results for 30 min.

**Errors** are `YTDLError` with `.code`: `INVALID_INPUT`, `INVALID_URL`, `INVALID_QUALITY`, `SEARCH_FAILED`, `TIMEOUT`, `HTTP_ERROR`, `NETWORK`, `BAD_RESPONSE`, `NO_FORMATS`.

```js
try { await ytmp4(URL, '720'); }
catch (e) { if (e.code === 'TIMEOUT') /* retry */; }
```

## CLI

```bash
npm i -g ytdl-lite
ytdl mp3 "never gonna give you up" --save --dir ./music
ytdl mp4 https://youtu.be/dQw4w9WgXcQ -q 720
ytdl mp4 https://youtu.be/dQw4w9WgXcQ -q all
ytdl search believer -n 5
ytdl info https://youtu.be/dQw4w9WgXcQ
ytdl playlist "https://youtube.com/playlist?list=PL..." --all
```

## Notes
- Requires Node.js ≥ 18 (built-in `fetch`).
- `ytmp3`'s `quality` argument is kept for compatibility; the service returns a single best-quality MP3.
- Third-party services can change at any time; use responsibly and respect copyright/YouTube ToS.

MIT © DanuZz
