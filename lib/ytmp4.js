'use strict';

/**
 * lib/ytmp4.js
 * YouTube → MP4 downloader.
 *
 * Primary engine : savetube  (supports quality selection)
 * Fallback engine: ytdlnew   (single mp4 link, ignores quality)
 *
 * Usage:
 *   const { ytmp4 } = require('ytdl-lite');
 *
 *   // JSON info only
 *   const info = await ytmp4('https://youtu.be/xxx');
 *   console.log(info);
 *   // → { status, title, duration, thumbnail, url, quality, type, label, path }
 *
 *   // Request specific quality
 *   const hd = await ytmp4('https://youtu.be/xxx', '1080');
 *
 *   // All available qualities
 *   const all = await ytmp4('https://youtu.be/xxx', null);
 *   // → { ..., medias: [ { type, quality, label, url, path } ] }
 */

const { savetube } = require('./savetube');
const { download }  = require('./ytdlnew');
const { buildPath } = require('./utils');

/**
 * @param {string} youtubeUrl
 * @param {string|null} [quality='best']
 *   '720', '1080', '480', '360', 'best', 'highest'
 *   Pass null to get ALL available formats with their links.
 * @param {object} [opts]
 * @param {string} [opts.dir='./']  directory prefix for the suggested file path
 * @returns {Promise<object>}
 */
async function ytmp4(youtubeUrl, quality = 'best', opts = {}) {
    const dir = opts.dir || './';

    /* ── Try primary: savetube ── */
    try {
        const data = await savetube(youtubeUrl, quality === undefined ? null : quality);

        if (!data.status) throw new Error(data.message || 'savetube returned no result');

        // All-formats mode
        if (data.medias) {
            data.medias = data.medias.map(m => ({
                ...m,
                path: buildPath(data.title, m.type === 'audio' ? 'mp3' : 'mp4', dir)
            }));
            return data;
        }

        // Single result
        return {
            ...data,
            path: buildPath(data.title, data.type === 'audio' ? 'mp3' : 'mp4', dir)
        };

    } catch (primaryErr) {
        console.warn('[ytmp4] savetube failed:', primaryErr.message, '— trying fallback...');
    }

    /* ── Fallback: ytdlnew ── */
    const fb = await download(youtubeUrl, 'video');
    return {
        status:    true,
        title:     fb.title,
        thumbnail: fb.thumb,
        url:       fb.url,
        quality:   quality || 'unknown',
        type:      'video',
        label:     'mp4 (fallback)',
        path:      buildPath(fb.title, 'mp4', dir),
        note:      'Returned via fallback engine (ytdlnew) — quality selection not available'
    };
}

module.exports = { ytmp4 };
