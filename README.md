# ✨ ytdl-lite

> 🚀 **Fast & reliable YouTube downloader** — MP3 & MP4 with quality selection, metadata, and smart file paths.
> ⚡ Powered by dual scrapers with automatic fallback for maximum uptime.

---

## 📦 Install

```bash
npm install ytdl-lite
```

---

## ⚡ Features

* 🎵 Download **MP3 (best / 320 / 256 / 128 kbps)**
* 🎬 Download **MP4 (1080p / 720p / 480p / 360p)**
* 🔄 **Auto fallback system** (2 scrapers)
* 📊 Full **video metadata (JSON)**
* 📁 Clean **auto-generated file paths**
* 🧠 Smart **format detection**
* 💻 CLI support

---

## 🚀 Quick Start

```js
const ytdl = require('ytdl-lite');

const URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

// 🎵 MP3
const mp3 = await ytdl.ytmp3(URL);
console.log(mp3.url);
console.log(mp3.path);

// 🎬 MP4 (best)
const mp4 = await ytdl.ytmp4(URL);
console.log(mp4.url);
console.log(mp4.path);

// 🎬 MP4 (specific quality)
const hd = await ytdl.ytmp4(URL, '1080');
console.log(hd.quality, hd.url);

// 📦 All formats
const all = await ytdl.ytmp4(URL, null);
all.medias.forEach(m => console.log(m.type, m.label));

// 📊 Info only
const info = await ytdl.getInfo(URL);
console.log(info.title, info.duration);
```

---

## 📚 API Reference

### 🎵 `ytmp3(url, quality = 'best', opts = {})`

Download audio in MP3 format.

| Param      | Type     | Description                      |
| ---------- | -------- | -------------------------------- |
| `url`      | `string` | YouTube URL                      |
| `quality`  | `string` | `best`, `320`, `256`, `128`      |
| `opts.dir` | `string` | Output directory (default: `./`) |

**Response**

```json
{
  "status": true,
  "title": "Never Gonna Give You Up",
  "url": "...",
  "quality": "best",
  "type": "audio",
  "path": "./never-gonna-give-you-up.mp3"
}
```

---

### 🎬 `ytmp4(url, quality = 'best', opts = {})`

Download video in MP4 format.

| Param      | Type             | Description                                    |
| ---------- | ---------------- | ---------------------------------------------- |
| `url`      | `string`         | YouTube URL                                    |
| `quality`  | `string \| null` | `best`, `1080`, `720`, `480`, `360`, or `null` |
| `opts.dir` | `string`         | Output directory                               |

---

#### ▶ Single format

```json
{
  "status": true,
  "title": "...",
  "quality": "1080",
  "type": "video",
  "url": "...",
  "path": "./video.mp4"
}
```

#### 📦 All formats (`quality = null`)

```json
{
  "status": true,
  "title": "...",
  "medias": [
    { "type": "video", "quality": "1080", "label": "1080p" },
    { "type": "audio", "quality": "128", "label": "MP3 • 128kbps" }
  ]
}
```

---

### 📊 `getInfo(url)`

Get full metadata + all available formats.

---

## 🖥️ CLI Usage

```bash
npm install -g ytdl-lite
```

```bash
# MP3
ytdl mp3 https://youtu.be/VIDEO_ID

# MP4
ytdl mp4 https://youtu.be/VIDEO_ID 1080

# Info
ytdl info https://youtu.be/VIDEO_ID
```

---

## 📁 Project Structure

```
ytdl-lite/
├── index.js
├── lib/
│   ├── ytmp3.js
│   ├── ytmp4.js
│   ├── info.js
│   ├── savetube.js
│   ├── ytdlnew.js
│   └── utils.js
├── bin/cli.js
├── test.js
└── package.json
```

---

## 🛡️ Reliability

> This package uses **two independent scraping engines**.
> If one fails, the other automatically takes over — ensuring high success rates.

---

## 📜 License

MIT © **DanuZz**

---

## 💡 Pro Tip

Use `quality = null` to build your own **custom downloader UI** with all formats.

---
