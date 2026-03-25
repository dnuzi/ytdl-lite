'use strict';

/**
 * ytdl-lite
 * ============
 * YouTube downloader with MP3 & MP4 support, quality selection,
 * JSON output, and suggested file paths.
 *
 * Quick start:
 *   const ytdl = require('ytdl-lite');
 *
 *   // MP3
 *   const mp3 = await ytdl.ytmp3('https://youtu.be/VIDEO_ID');
 *   console.log(mp3.url);   // direct download URL
 *   console.log(mp3.path);  // e.g. "./song-title.mp3"
 *
 *   // MP4 (best quality)
 *   const mp4 = await ytdl.ytmp4('https://youtu.be/VIDEO_ID');
 *
 *   // MP4 (specific quality)
 *   const hd = await ytdl.ytmp4('https://youtu.be/VIDEO_ID', '1080');
 *
 *   // All available formats
 *   const all = await ytdl.ytmp4('https://youtu.be/VIDEO_ID', null);
 *   console.log(all.medias);
 *
 *   // Video info only (no extra wait for downloads)
 *   const info = await ytdl.getInfo('https://youtu.be/VIDEO_ID');
 */

const { ytmp3 }   = require('./lib/ytmp3');
const { ytmp4 }   = require('./lib/ytmp4');
const { getInfo } = require('./lib/info');

// Low-level engines (for advanced users)
const { savetube } = require('./lib/savetube');
const { download: ytdlnewDownload } = require('./lib/ytdlnew');
const { slugify, buildPath } = require('./lib/utils');

module.exports = {
    // ── High-level API ──────────────────────────────────────────────────────
    ytmp3,
    ytmp4,
    getInfo,

    // ── Low-level engines ───────────────────────────────────────────────────
    savetube,
    ytdlnewDownload,

    // ── Utilities ───────────────────────────────────────────────────────────
    slugify,
    buildPath
};
