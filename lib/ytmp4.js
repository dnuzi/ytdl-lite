'use strict';

const { resolve } = require('./info');
const { getLink, saveFile, VIDEO_QUALITIES } = require('./download');
const { YTDLError } = require('./errors');
const { buildPath, thumbnails } = require('./utils');

const normalise = q => String(q).toLowerCase().replace(/p$/, '').trim();

/**
 * YouTube -> MP4.
 * @param {string} input  YouTube URL or search query
 * @param {string|null} [quality='best']  '360'|'480'|'720'|'1080'|'best'|'worst' — null = ALL formats
 * @param {object} [opts]  { dir, save, onProgress, apiKey, timeout }
 */
async function ytmp4(input, quality = 'best', opts = {}) {
    const dir = opts.dir || './';
    if (quality !== null) {
        const qq = normalise(quality ?? 'best');
        if (!['best', 'highest', 'worst', 'lowest', ...VIDEO_QUALITIES].includes(qq)) {
            throw new YTDLError(`Invalid quality "${quality}". Use ${VIDEO_QUALITIES.join(', ')}, best or worst`, { code: 'INVALID_QUALITY' });
        }
    }
    const v = await resolve(input, opts);
    const meta = { id: v.id, videoId: v.id, title: v.title, author: v.author, duration: v.duration, thumbnail: v.thumbnail, thumbnails: thumbnails(v.id) };

    /* ── all formats ── */
    if (quality === null) {
        const wanted = [...VIDEO_QUALITIES, 'mp3'];
        const settled = await Promise.allSettled(wanted.map(f => getLink(v.url, f, opts)));
        const medias = [];
        settled.forEach((r, i) => {
            if (r.status !== 'fulfilled') return;
            const f = wanted[i], audio = f === 'mp3';
            medias.push({
                type: audio ? 'audio' : 'video',
                quality: f,
                label: audio ? 'MP3' : `${f}p`,
                url: r.value,
                path: buildPath(v.title, audio ? 'mp3' : 'mp4', dir)
            });
        });
        if (!medias.length) throw new YTDLError('No formats could be resolved', { code: 'NO_FORMATS' });
        return { status: true, ...meta, medias };
    }

    /* ── single quality (best/worst use a fallback chain) ── */
    const q = normalise(quality ?? 'best');
    let chain;
    if (q === 'best' || q === 'highest') chain = [...VIDEO_QUALITIES].reverse();
    else if (q === 'worst' || q === 'lowest') chain = [...VIDEO_QUALITIES];
    else if (VIDEO_QUALITIES.includes(q)) chain = [q];
    else throw new YTDLError(`Invalid quality "${quality}". Use ${VIDEO_QUALITIES.join(', ')}, best or worst`, { code: 'INVALID_QUALITY' });

    let url, got, lastErr;
    for (const f of chain) {
        try { url = await getLink(v.url, f, opts); got = f; break; }
        catch (e) { lastErr = e; }
    }
    if (!url) throw lastErr;

    const result = {
        status: true, ...meta, url,
        quality: got, type: 'video', label: `${got}p`,
        path: buildPath(v.title, 'mp4', dir)
    };
    if (opts.save) Object.assign(result, await saveFile(url, result.path, opts));
    return result;
}

module.exports = { ytmp4 };
