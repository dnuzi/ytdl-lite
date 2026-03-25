'use strict';

/**
 * lib/savetube.js
 * Powered by movanest.xyz/v2/ytdown
 */

const axios = require('axios');

const BASE = 'https://www.movanest.xyz/v2/ytdown';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

/**
 * @param {string} url           YouTube URL
 * @param {string|null} quality  '720', '1080p', 'best', 'mp3', 'audio', or null = all formats
 * @returns {Promise<object>}
 */
async function savetube(url, quality = null) {
    if (!url) throw new Error('url is required');

    /* ── All formats (no quality param) ── */
    if (!quality) {
        const res = await axios.get(BASE, {
            params: { url },
            headers: HEADERS,
            timeout: 15000
        });

        const d = res.data;
        if (!d?.status) throw new Error(d?.message || 'API returned no data');

        const medias = (d.formats || []).map(f => ({
            type:    f.type,
            quality: f.quality,
            label:   f.label,
            url:     f.url
        }));

        if (!medias.length) throw new Error('No formats returned by API');

        return {
            status:    true,
            title:     d.title,
            duration:  d.duration,
            thumbnail: d.thumbnail,
            medias
        };
    }

    /* ── Specific quality ── */
    // Normalise: 'mp3'/'audio' → 'mp3'; strip trailing 'p' for numeric qualities
    const q = String(quality).toLowerCase().trim();
    const apiQuality = (q === 'audio') ? 'mp3' : q;  // API accepts '720p', '720', 'best', 'mp3'

    const res = await axios.get(BASE, {
        params: { url, quality: apiQuality },
        headers: HEADERS,
        timeout: 15000
    });

    const d = res.data;
    if (!d?.status) throw new Error(d?.message || `API error for quality '${quality}'`);

    const dl = d.download;
    if (!dl?.link) throw new Error(`No download link returned for quality '${quality}'`);

    return {
        status:    true,
        title:     d.title,
        duration:  d.duration,
        thumbnail: d.thumbnail,
        url:       dl.link,
        quality:   dl.quality,
        type:      dl.type,
        label:     dl.label
    };
}

module.exports = { savetube };
