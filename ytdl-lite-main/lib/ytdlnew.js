'use strict';

/**
 * lib/ytdlnew.js
 * Scraper backed by ytdl-new.vercel.app — fast mp3/mp4 converter.
 * Used as the primary engine for ytmp3 and as fallback for ytmp4.
 */

const axios = require('axios');
const qs    = require('qs');

const BASE_URL = 'https://ytdl-new.vercel.app/api/ytdl';

const HEADERS = {
    accept:            'application/json',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-GB,en;q=0.9',
    'user-agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
};

function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

function thumbnail(id) {
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/**
 * Download via ytdl-new API.
 *
 * @param {string} youtubeUrl
 * @param {'audio'|'video'} format
 * @returns {Promise<object>} { success, title, thumb, url, format, videoId, raw }
 */
async function download(youtubeUrl, format = 'audio') {
    if (typeof youtubeUrl !== 'string' || !youtubeUrl.trim()) {
        throw new Error('youtubeUrl must be a non-empty string');
    }

    const apiFormat = format === 'audio' ? 'mp3' : 'mp4';
    const url = `${BASE_URL}?${qs.stringify({ url: youtubeUrl, format: apiFormat })}`;

    try {
        const res  = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const data = res.data;

        if (!data.status) throw new Error(data.error || 'Download failed');

        const result  = data.result || {};
        const videoId = result.id || extractVideoId(youtubeUrl);

        return {
            success:  true,
            title:    result.title,
            thumb:    thumbnail(videoId),
            url:      result.download,
            format:   result.format || apiFormat,
            videoId,
            raw:      data
        };
    } catch (err) {
        if (err.response?.status >= 500) {
            throw new Error(`ytdl-new API server error (${err.response.status})`);
        }
        throw new Error(`ytdl-new download failed: ${err.message}`);
    }
}

module.exports = { download, extractVideoId, thumbnail };
