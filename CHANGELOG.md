# Changelog

All notable changes to `ytdl-lite` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — Initial Release

### Added
- `ytmp3(url, quality?, opts?)` — Download YouTube audio as MP3
- `ytmp4(url, quality?, opts?)` — Download YouTube video as MP4 with quality selection
- `getInfo(url)` — Fetch all available formats and video metadata
- Quality options: `'best'`, `'2160'`, `'1440'`, `'1080'`, `'720'`, `'480'`, `'360'`, `'240'`, `'144'`, `'mp3'`
- Suggested file path output (e.g. `./song-title.mp3` / `./song-title.mp4`)
- Auto fallback between engines (savetube → ytdlnew)
- CLI support via `ytdl` command:
  - `ytdl mp3 <url>`
  - `ytdl mp4 <url> [quality]`
  - `ytdl info <url>`
- `slugify()` and `buildPath()` utility helpers exported
- `sanitize-filename` for safe file naming
- Full JSDoc comments on all public functions

### Engines
- **Primary (ytmp4):** `movanest.xyz/v2/ytdown` — supports quality selection
- **Primary (ytmp3):** `ytdl-new.vercel.app` — fast mp3 conversion
- **Fallback:** Automatic cross-engine fallback on failure

---

## Unreleased

> Changes that are staged but not yet published will appear here.

---

_For older versions, see the [GitHub Releases](../../releases) page._
