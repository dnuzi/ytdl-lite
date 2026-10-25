# Changelog

## 1.0.1
### Changed
- **New engines.** Replaced the movanest (`savetube`) and `ytdl-new` scrapers with the savenow downloader and a 4-provider search (Innertube → Piped → Invidious → HTML) with caching.
- **Zero dependencies.** `axios`, `qs` and `sanitize-filename` removed; uses Node 18+ built-in `fetch`.
- Unicode-aware `slugify` (non-Latin titles no longer become `download`).

### Added
- **Full video details** from `getInfo`: description, views, likes, publish/upload date, category, keywords, chapters, channel id/url, live/private/unlisted flags, country list, all thumbnails. Falls back to basic info (`partial: true`) if YouTube blocks the detailed lookup.
- **`getPlaylist(url|id, { limit, all })`** — title, description, owner, video count, views, last updated, total duration and every video (with pagination). CLI: `ytdl playlist <url> --all`.
- Dual package: CommonJS (`require`) and ESM (`import`) via `exports` map, plus TypeScript types.
- `search(query, opts)`; `ytmp3`/`ytmp4`/`getInfo` accept a **URL or a search query**.
- `save: true` option downloads the file to disk, with `onProgress` callbacks.
- `ytmp4(url, 'worst')`, `'720p'` style qualities, automatic fallback chain for `'best'`.
- `getLink`, `saveFile`, `resolve`, `extractVideoId`, `isYouTubeUrl`, `formatDuration`, `formatBytes`, `thumbnails`.
- `YTDLError` with stable `.code` values.
- CLI: `ytdl search`, `--save`, `--dir`, `--limit`, `--quality all`, `--version`.

### Removed
- `savetube` and `ytdlnewDownload` low-level exports.
