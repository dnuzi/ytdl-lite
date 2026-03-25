'use strict';

/**
 * lib/info.js
 * Get full video metadata + all available formats (no download link fetching for individual files).
 * Useful when you just want info before deciding what to download.
 *
 * Usage:
 *   const { getInfo } = require('ytdl-lite');
 *   const info = await getInfo('https://youtu.be/xxx');
 *   console.log(info.title, info.medias);
 */

const { savetube } = require('./savetube');

/**
 * @param {string} youtubeUrl
 * @returns {Promise<object>} Full info with all format links
 */
async function getInfo(youtubeUrl) {
    const data = await savetube(youtubeUrl, null); // null = all formats
    if (!data.status) throw new Error(data.message || 'getInfo failed');
    return data;
}

module.exports = { getInfo };
