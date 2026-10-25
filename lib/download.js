'use strict';

/**
 * lib/download.js — the savenow scraper (mp3 / 360 / 480 / 720 / 1080)
 * plus a streaming file saver with progress.
 */

const fs = require('node:fs');
const path = require('node:path');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { fetchText, retry, sleep, UA } = require('./http');
const { YTDLError } = require('./errors');

const SAVE_BASE = 'https://p.savenow.to';
// Default key. Override with { apiKey } or the YTDL_API_KEY env var.
const DEFAULT_KEY = 'dfcb6d76f2f6a9894gjkege8a4ab232222';

const VIDEO_QUALITIES = ['360', '480', '720', '1080'];
const FORMATS = ['mp3', ...VIDEO_QUALITIES];

/**
 * Get a direct download URL for a video.
 * @param {string} videoUrl  full YouTube URL
 * @param {'mp3'|'360'|'480'|'720'|'1080'} format
 * @param {{apiKey?: string, timeout?: number, maxWaitMs?: number, pollMs?: number, retries?: number,
 *          onProgress?: (p: object) => void}} [opts]
 * @returns {Promise<string>}
 */
async function getLink(videoUrl, format = 'mp3', opts = {}) {
    if (!FORMATS.includes(format)) {
        throw new YTDLError(`Unsupported format "${format}". Use one of: ${FORMATS.join(', ')}`, { code: 'INVALID_QUALITY' });
    }
    const key = opts.apiKey || process.env.YTDL_API_KEY || DEFAULT_KEY;
    const headers = { accept: '*/*', referer: 'https://y2down.cc/', origin: 'https://y2down.cc' };
    const timeout = opts.timeout ?? 20000;

    const startUrl = `${SAVE_BASE}/ajax/download.php?` + new URLSearchParams({ copyright: '0', format, url: videoUrl, api: key });
    const start = await retry(async () => {
        const { text } = await fetchText(startUrl, { headers, timeout });
        let j;
        try { j = JSON.parse(text); } catch { throw new YTDLError('Download service returned invalid JSON', { code: 'BAD_RESPONSE' }); }
        if (!j.progress_url) throw new YTDLError('Download service returned no progress URL', { code: 'BAD_RESPONSE' });
        return j;
    }, opts.retries ?? 2);

    const pollMs = opts.pollMs ?? 2000;
    const deadline = Date.now() + (opts.maxWaitMs ?? 120000);
    while (Date.now() < deadline) {
        try {
            const { text } = await fetchText(start.progress_url, { headers, timeout });
            const p = JSON.parse(text);
            if (p.download_url) return p.download_url;
            if (opts.onProgress) opts.onProgress({ stage: 'converting', progress: p.progress, raw: p });
        } catch { /* transient, keep polling */ }
        await sleep(pollMs);
    }
    throw new YTDLError('Download service timed out', { code: 'TIMEOUT' });
}

/**
 * Stream a URL to disk with progress.
 * @returns {Promise<{file: string, size: number}>}
 */
async function saveFile(url, filePath, opts = {}) {
    const abs = path.resolve(filePath);
    await fs.promises.mkdir(path.dirname(abs), { recursive: true });

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), opts.saveTimeout ?? 30 * 60 * 1000);
    try {
        const res = await fetch(url, { headers: { 'user-agent': UA }, signal: ctrl.signal });
        if (!res.ok || !res.body) throw new YTDLError(`Download failed (HTTP ${res.status})`, { code: 'HTTP_ERROR', status: res.status });

        const total = Number(res.headers.get('content-length')) || 0;
        let done = 0;
        const src = Readable.fromWeb(res.body);
        src.on('data', chunk => {
            done += chunk.length;
            if (opts.onProgress) opts.onProgress({ stage: 'downloading', downloaded: done, total, percent: total ? +(done / total * 100).toFixed(1) : null });
        });
        await pipeline(src, fs.createWriteStream(abs));
        return { file: abs, size: done };
    } catch (err) {
        await fs.promises.unlink(abs).catch(() => {});
        if (err instanceof YTDLError) throw err;
        if (err.name === 'AbortError') throw new YTDLError('Download timed out', { code: 'TIMEOUT', cause: err });
        throw new YTDLError(err.message, { code: 'NETWORK', cause: err });
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { getLink, saveFile, FORMATS, VIDEO_QUALITIES };
