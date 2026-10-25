<div align="center">

<img src="https://raw.githubusercontent.com/dnuzi/ytdl-lite/main/assets/banner.svg" alt="ytdl-lite" width="100%"/>

<br/>

[![npm](https://img.shields.io/npm/v/ytdl-lite?style=for-the-badge&logo=npm&color=cb3837)](https://www.npmjs.com/package/ytdl-lite)
[![downloads](https://img.shields.io/npm/dm/ytdl-lite?style=for-the-badge&logo=npm&color=7c5cff)](https://www.npmjs.com/package/ytdl-lite)
[![node](https://img.shields.io/node/v/ytdl-lite?style=for-the-badge&logo=node.js&color=339933)](https://nodejs.org)
[![types](https://img.shields.io/badge/types-included-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](#-typescript)
[![deps](https://img.shields.io/badge/dependencies-0-00d4ff?style=for-the-badge)](package.json)
[![license](https://img.shields.io/badge/license-MIT-ffb86b?style=for-the-badge)](LICENSE)

**Fast, zero-dependency YouTube downloader, search & metadata toolkit for Node.js.**
<br/>MP3 · MP4 · Playlists · Full video details · CLI · CommonJS + ESM + TypeScript

[Install](#-install) · [Quick start](#-quick-start) · [API](#-api-reference) · [CLI](#-cli) · [Recipes](#-recipes) · [FAQ](#-faq)

</div>

<img src="https://raw.githubusercontent.com/dnuzi/ytdl-lite/main/assets/divider.svg" width="100%" alt=""/>

<div align="center">
<img src="https://raw.githubusercontent.com/dnuzi/ytdl-lite/main/assets/terminal.svg" alt="ytdl CLI demo" width="760"/>
</div>

<img src="https://raw.githubusercontent.com/dnuzi/ytdl-lite/main/assets/divider.svg" width="100%" alt=""/>

## ✨ Why ytdl-lite?

| | |
|---|---|
| 🪶 **Zero dependencies** | Built on Node 18+ `fetch`. Nothing to audit, tiny install. |
| 🔀 **Dual package** | `require()` and `import` both work, with bundled TypeScript types. |
| 🔎 **URL *or* search text** | `ytmp3('believer')` works as well as `ytmp3(url)`. |
| 🛡️ **Self-healing search** | Innertube → Piped → Invidious → HTML, automatic fallback + 30 min cache. |
| 📊 **Rich metadata** | Description, views, likes, dates, keywords, chapters, channel, thumbnails. |
| 📃 **Playlists** | Full details and every video, with automatic pagination. |
| 💾 **Save to disk** | `{ save: true }` streams the file with live progress callbacks. |
| 🧰 **CLI included** | `ytdl mp3 / mp4 / search / info / playlist`. |
| 🧯 **Typed errors** | `YTDLError` with stable `.code` values you can branch on. |

<br/>

<div align="center">
<img src="https://raw.githubusercontent.com/dnuzi/ytdl-lite/main/assets/flow.svg" alt="How ytdl-lite works" width="860"/>
</div>

<img src="https://raw.githubusercontent.com/dnuzi/ytdl-lite/main/assets/divider.svg" width="100%" alt=""/>

## 📦 Install

```bash
npm  install ytdl-lite
pnpm add     ytdl-lite
yarn add     ytdl-lite
bun  add     ytdl-lite
```

> Requires **Node.js ≥ 18**.

## 🚀 Quick start

<table>
<tr><th>CommonJS</th><th>ES Modules</th></tr>
<tr><td>

```js
const { ytmp3, ytmp4, search,
        getInfo, getPlaylist } = require('ytdl-lite');
```

</td><td>

```js
import { ytmp3, ytmp4, search,
         getInfo, getPlaylist } from 'ytdl-lite';
```

</td></tr>
</table>

```js
const URL = 'https://youtu.be/dQw4w9WgXcQ';

// 🎵 MP3 — from a link or plain text
const song = await ytmp3(URL);
const same = await ytmp3('never gonna give you up');
console.log(song.url, song.path);        // direct link + suggested filename

// 💾 …and save it to disk with progress
await ytmp3(URL, 'best', {
  save: true,
  dir: './music',
  onProgress: p => p.percent && console.log(`${p.percent}%`)
});

// 🎬 MP4 — pick a quality, or get them all
await ytmp4(URL, '720');                 // 360 | 480 | 720 | 1080 | best | worst
const all = await ytmp4(URL, null);      // every format -> all.medias[]

// 🔎 Search
const results = await search('believer', { limit: 5 });

// 📊 Everything about a video
const info = await getInfo(URL);
console.log(info.title, info.views, info.likes, info.chapters);

// 📃 Playlists
const pl = await getPlaylist('https://youtube.com/playlist?list=PL…', { all: true });
console.log(`${pl.title} — ${pl.videoCount} videos`);
```

## 📚 API reference

<details open>
<summary><b>🎵 ytmp3(input, quality?, opts?)</b></summary>

<br/>

`input` is a YouTube URL **or** a search query. The service returns one best-quality MP3 (`quality` is kept for backward compatibility).

```jsonc
{
  "status": true,
  "id": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up (Official Video)",
  "author": "Rick Astley",
  "duration": "3:33",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "url": "https://…/audio.mp3",
  "quality": "best",
  "type": "audio",
  "path": "./rick-astley-never-gonna-give-you-up-official-video.mp3",
  "file": "/abs/path.mp3",   // only with save: true
  "size": 3563412           // only with save: true
}
```
</details>

<details>
<summary><b>🎬 ytmp4(input, quality = 'best', opts?)</b></summary>

<br/>

| `quality` | Result |
|---|---|
| `'360'` `'480'` `'720'` `'1080'` (also `'720p'`) | exactly that quality |
| `'best'` | tries 1080 → 720 → 480 → 360 until one works |
| `'worst'` | tries 360 → 480 → 720 → 1080 |
| `null` | **all** formats in parallel → `{ medias: [{ type, quality, label, url, path }] }` |
</details>

<details>
<summary><b>📊 getInfo(input, { likes = true, timeout })</b></summary>

<br/>

```jsonc
{
  "id": "dQw4w9WgXcQ", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "…", "description": "…",
  "author": "Rick Astley", "channelId": "UC…", "channelUrl": "https://www.youtube.com/channel/UC…",
  "duration": "3:33", "seconds": 213,
  "views": 1500000000,
  "likes": 18000000,                  // best effort — may be null
  "publishDate": "2009-10-25", "uploadDate": "2009-10-24",
  "category": "Music", "keywords": ["rick astley", "…"],
  "chapters": [{ "time": "0:00", "seconds": 0, "title": "Intro" }],
  "isLive": false, "isPrivate": false, "isUnlisted": false, "isFamilySafe": true,
  "availableCountries": ["US", "GB", "…"],
  "playlistId": null,
  "thumbnail": "…", "thumbnails": { "default": "…", "medium": "…", "high": "…", "standard": "…", "maxres": "…" },
  "thumbnailList": [{ "url": "…", "width": 336, "height": 188 }]
}
```

If YouTube blocks the detailed lookup you get the basic fields with `partial: true` instead of an error. Pass `{ likes: false }` to skip the extra like-count request.
</details>

<details>
<summary><b>📃 getPlaylist(urlOrId, { limit = 100, all = false })</b></summary>

<br/>

```jsonc
{
  "id": "PL…", "url": "https://www.youtube.com/playlist?list=PL…",
  "title": "…", "description": "…",
  "author": "…", "channelId": "UC…", "channelUrl": "…",
  "videoCount": 42, "views": 120000, "lastUpdated": "Oct 3, 2025",
  "totalSeconds": 9660, "thumbnail": "…", "hasMore": false,
  "items": [
    { "index": 1, "id": "…", "url": "…", "title": "…", "author": "…",
      "duration": "3:33", "seconds": 213, "thumbnail": "…", "isPlayable": true }
  ]
}
```

`all: true` follows every continuation page (capped at 5000 videos).
</details>

<details>
<summary><b>🔎 search(query, { limit = 10, providers, cache = true, timeout })</b></summary>

<br/>

Returns `{ id, url, title, author, duration, seconds, views, thumbnail }[]`.
Restrict or reorder engines with `providers: ['innertube', 'piped', 'invidious', 'html']`.
</details>

<details>
<summary><b>🧱 Building blocks & utilities</b></summary>

<br/>

| Function | Purpose |
|---|---|
| `getLink(url, format, opts?)` | Direct link for `mp3` / `360` / `480` / `720` / `1080` |
| `saveFile(url, path, { onProgress })` | Stream any URL to disk |
| `resolve(input)` | URL or query → single video |
| `extractVideoId(url)` · `extractPlaylistId(url)` · `isYouTubeUrl(url)` | URL parsing |
| `slugify(title)` · `buildPath(title, ext, dir)` | Unicode-safe filenames |
| `parseChapters(description)` | Chapters from timestamps |
| `formatDuration(sec)` · `parseDuration('1:02:05')` · `formatBytes(n)` | Formatting |
| `thumbnails(id)` | All thumbnail sizes |
| `clearSearchCache()` | Flush the search cache |
</details>

### ⚙️ Common options

| Option | Default | Description |
|---|---|---|
| `dir` | `'./'` | Directory for the suggested / saved path |
| `save` | `false` | Download the file to disk |
| `onProgress` | – | `({ stage, percent, downloaded, total }) => void` |
| `apiKey` | env `YTDL_API_KEY` | Override the converter key |
| `timeout` | `20000` | Per-request timeout (ms) |
| `maxWaitMs` | `120000` | Max time to wait for conversion |
| `retries` | `2` | Start-request retries |

### 🧯 Error codes

```js
import { YTDLError } from 'ytdl-lite';

try { await ytmp4(URL, '720'); }
catch (e) {
  if (e instanceof YTDLError && e.code === 'TIMEOUT') { /* retry later */ }
}
```

| Code | Meaning |
|---|---|
| `INVALID_INPUT` · `INVALID_URL` · `INVALID_QUALITY` | Bad arguments (thrown before any network call) |
| `SEARCH_FAILED` · `NO_FORMATS` · `NO_RESULTS` | Nothing found |
| `VIDEO_UNAVAILABLE` · `PLAYLIST_UNAVAILABLE` | Private / removed / region-blocked |
| `TIMEOUT` · `NETWORK` · `HTTP_ERROR` · `BAD_RESPONSE` | Transport problems |

## 🖥️ CLI

```bash
npm i -g ytdl-lite        # or: npx ytdl-lite …
```

| Command | Example |
|---|---|
| `ytdl mp3 <url\|query>` | `ytdl mp3 "never gonna give you up" --save --dir ./music` |
| `ytdl mp4 <url\|query>` | `ytdl mp4 https://youtu.be/dQw4w9WgXcQ -q 720` · `-q all` |
| `ytdl search <query>` | `ytdl search believer -n 5` |
| `ytdl info <url\|query>` | `ytdl info https://youtu.be/dQw4w9WgXcQ` |
| `ytdl playlist <url\|id>` | `ytdl playlist "https://youtube.com/playlist?list=PL…" --all` |

Flags: `-q/--quality` · `-n/--limit` · `-d/--dir` · `-s/--save` · `--all` · `--json` · `-v` · `-h`.
Output is JSON, so it pipes straight into `jq`.

## 🍳 Recipes

<details>
<summary><b>Download a whole playlist as MP3 (with error handling)</b></summary>

```js
import { getPlaylist, ytmp3, slugify } from 'ytdl-lite';

const pl = await getPlaylist(process.argv[2], { all: true });
const dir = `./${slugify(pl.title)}`;

for (const v of pl.items) {
  try {
    const r = await ytmp3(v.url, 'best', { save: true, dir });
    console.log('✔', r.file);
  } catch (e) {
    console.error('✖', v.title, e.code);
  }
}
```
</details>

<details>
<summary><b>Tiny Express API</b></summary>

```js
import express from 'express';
import { ytmp3, search, getInfo } from 'ytdl-lite';

const app = express();
const wrap = fn => (req, res) => fn(req).then(r => res.json(r))
  .catch(e => res.status(400).json({ error: e.code, message: e.message }));

app.get('/mp3',    wrap(r => ytmp3(r.query.q)));
app.get('/search', wrap(r => search(r.query.q, { limit: 10 })));
app.get('/info',   wrap(r => getInfo(r.query.q)));

app.listen(3000);
```
</details>

<details>
<summary><b>Pick the best result yourself</b></summary>

```js
const [first, second] = await search('lofi hip hop', { limit: 2 });
const short = (await search('lofi', { limit: 10 })).filter(v => v.seconds < 300);
const mp3 = await ytmp3(short[0].url);
```
</details>

<details>
<summary><b>Show a progress bar</b></summary>

```js
await ytmp4(URL, '720', {
  save: true,
  onProgress: ({ stage, percent }) =>
    process.stdout.write(`\r${stage} ${percent ?? '…'}%   `)
});
```
</details>

## 🟦 TypeScript

Types ship with the package — no `@types` needed.

```ts
import { ytmp4, getInfo, type VideoInfo, type DownloadResult } from 'ytdl-lite';

const info: VideoInfo = await getInfo(url);
const file: DownloadResult = await ytmp4(url, '720', { save: true });
```

## ❓ FAQ

<details>
<summary><b>Why is <code>likes</code> sometimes <code>null</code>?</b></summary>
YouTube hides or changes like counts regularly. It is fetched best-effort; everything else in <code>getInfo</code> is unaffected.
</details>

<details>
<summary><b>A download fails or times out.</b></summary>
Third-party converters can be busy. Raise <code>maxWaitMs</code>, retry, or catch <code>TIMEOUT</code>. For <code>'best'</code> video quality the library already falls back to lower resolutions.
</details>

<details>
<summary><b>Can I use my own converter key?</b></summary>
Yes: <code>{ apiKey: '…' }</code> or the <code>YTDL_API_KEY</code> environment variable.
</details>

<details>
<summary><b>Does it work in the browser?</b></summary>
No — it targets Node.js 18+ (it writes files and calls services that block browser CORS).
</details>

## 🗺️ Roadmap

- [x] ESM + CJS + TypeScript
- [x] Search with multi-provider fallback
- [x] Full metadata & playlists
- [ ] Playlist batch download helper
- [ ] Subtitle / caption listing
- [ ] Channel & trending feeds

## 🤝 Contributing

Issues and PRs are welcome.

```bash
git clone https://github.com/dnuzi/ytdl-lite && cd ytdl-lite
npm test          # offline unit tests
npm run test:live # hits the real services
```

## ⚠️ Disclaimer

This project is for personal and educational use. Respect copyright and YouTube's Terms of Service. You are responsible for what you download.

<img src="https://raw.githubusercontent.com/dnuzi/ytdl-lite/main/assets/divider.svg" width="100%" alt=""/>

<div align="center">

**MIT © [DanuZz](https://github.com/dnuzi)** · Made with ❤️ in Sri Lanka

⭐ If this helped you, star the repo!

</div>
