# Support

Thanks for using **ytdl-lite** by **@DanuZz**! 🙏  
Here's how to get help if something isn't working.

---

## 🐛 Found a Bug?

1. Check the [existing issues](../../issues) — it might already be reported
2. If not, open a **New Issue** and include:
   - The YouTube URL you tested with
   - The quality you requested (e.g. `'720'`, `'mp3'`)
   - The full error message or unexpected output
   - Your Node.js version: `node -v`
   - Your OS (Windows / Mac / Linux)

---

## 💡 Have a Feature Request?

Open an issue with the label `enhancement` and describe:
- What you want
- Why it would be useful
- Any example of how it should work

---

## ❓ Common Issues

### `Error: API returned no data`
The upstream API may be temporarily down. Wait a few minutes and try again.

### `Error: No download link returned for quality 'xxx'`
That quality may not be available for the video. Try `'best'` or check available formats using `getInfo()`:
```js
const info = await ytdl.getInfo('https://youtu.be/VIDEO_ID');
console.log(info.medias); // see all available qualities
```

### `Error: ytdl-new API server error (5xx)`
The fallback engine is down. The primary engine (savetube) will handle it automatically.

### The `.path` is correct but how do I actually save the file?
The `.path` is just a **suggested filename** — use it with `axios` or `fs` to save:
```js
const ytdl  = require('ytdl-lite');
const axios = require('axios');
const fs    = require('fs');

const result = await ytdl.ytmp3('https://youtu.be/VIDEO_ID');

const writer = fs.createWriteStream(result.path);
const stream = await axios({ url: result.url, responseType: 'stream' });
stream.data.pipe(writer);

writer.on('finish', () => console.log('Saved to', result.path));
```

---

## 📦 Versions

Always make sure you're on the **latest version**:
```bash
npm install ytdl-lite@latest
```

Check installed version:
```bash
npm list ytdl-lite
```

---

## 🔒 Security Issues

Please **do not** open public issues for security vulnerabilities.  
Read [SECURITY.md](./SECURITY.md) for how to report them privately.

---

## 📬 Contact

For anything else, reach out via GitHub:  
**[@DanuZz](https://github.com/dnuzi)**

---

_Response times may vary — this is an open source project maintained in free time. Thanks for your patience! 💙_
