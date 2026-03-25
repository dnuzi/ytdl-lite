'use strict';

/**
 * lib/ytmp3.js
 * YouTube → MP3 downloader.
 *
 * Primary engine : ytdlnew  (fast, reliable mp3)
 * Fallback engine: savetube (audio quality selection)
 *
 * Usage:
 *   const { ytmp3 } = require('ytdl-lite');
 *
 *   const result = await ytmp3('https://youtu.be/xxx');
 *   console.log(result);
 *   // → { status, title, thumbnail, url, quality, type, label, path }
 *
 *   // Request specific kbps (savetube engine, falls back to ytdlnew)
 *   const hq = await ytmp3('https://youtu.be/xxx', '320');
 */

const { download }  = require('./ytdlnew');
const { savetube }  = require('./savetube');
const { buildPath } = require('./utils');

/**
 * @param {string} youtubeUrl
 * @param {string} [quality='best']
 *   'best', '320', '256', '128' (kbps) — only honoured when savetube fallback runs
 * @param {object} [opts]
 * @param {string} [opts.dir='./']  directory prefix for the suggested file path
 * @returns {Promise<object>}
 */
async function ytmp3(youtubeUrl, quality = 'best', opts = {}) {
    const dir = opts.dir || './';

    /* ── Try primary: ytdlnew (mp3) ── */
    try {
        const fb = await download(youtubeUrl, 'audio');
        return {
            status:    true,
            title:     fb.title,
            thumbnail: fb.thumb,
            url:       fb.url,
            quality:   'best',
            type:      'audio',
            label:     'MP3 (best)',
            path:      buildPath(fb.title, 'mp3', dir),
            videoId:   fb.videoId
        };
    } catch (primaryErr) {
        console.warn('[ytmp3] ytdlnew failed:', primaryErr.message, '— trying savetube fallback...');
    }

    /* ── Fallback: savetube (with quality selection) ── */
    const data = await savetube(youtubeUrl, quality === 'best' ? 'mp3' : quality);

    if (!data.status) throw new Error(data.message || 'All engines failed for ytmp3');

    return {
        ...data,
        path: buildPath(data.title, 'mp3', dir)
    };
}

module.exports = { ytmp3 };
