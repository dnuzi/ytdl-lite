'use strict';

const { resolve } = require('./info');
const { getLink, saveFile } = require('./download');
const { buildPath, thumbnails } = require('./utils');

/**
 * YouTube -> MP3.
 * @param {string} input   YouTube URL or search query
 * @param {string} [quality='best']  kept for API compatibility (the service returns one best-quality MP3)
 * @param {object} [opts]  { dir='./', save=false, onProgress, apiKey, timeout }
 */
async function ytmp3(input, quality = 'best', opts = {}) {
    const dir = opts.dir || './';
    const v = await resolve(input, opts);
    const url = await getLink(v.url, 'mp3', opts);

    const result = {
        status: true,
        id: v.id,
        videoId: v.id,
        title: v.title,
        author: v.author,
        duration: v.duration,
        thumbnail: v.thumbnail,
        thumbnails: thumbnails(v.id),
        url,
        quality: 'best',
        type: 'audio',
        label: 'MP3 (best)',
        path: buildPath(v.title, 'mp3', dir)
    };
    if (opts.save) Object.assign(result, await saveFile(url, result.path, opts));
    return result;
}

module.exports = { ytmp3 };
