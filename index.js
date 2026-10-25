'use strict';

/**
 * ytdl-lite v1.0.1 — zero-dependency YouTube downloader & search.
 *
 *   const { ytmp3, ytmp4, search, getInfo } = require('ytdl-lite');
 *   // or:  import { ytmp3 } from 'ytdl-lite';
 *
 *   await ytmp3('https://youtu.be/dQw4w9WgXcQ');          // URL
 *   await ytmp3('never gonna give you up', 'best', { save: true }); // or search text, saved to disk
 *   await ytmp4(url, '720');  await ytmp4(url, null);      // one quality / all formats
 *   await search('believer', { limit: 5 });
 *   await getInfo(url);                 // full details: views, likes, description, chapters...
 *   await getPlaylist(listUrl, { all: true });
 */

const { ytmp3 } = require('./lib/ytmp3');
const { ytmp4 } = require('./lib/ytmp4');
const { getInfo, resolve } = require('./lib/info');
const { getPlaylist } = require('./lib/playlist');
const { search, clearSearchCache } = require('./lib/search');
const { getLink, saveFile, FORMATS, VIDEO_QUALITIES } = require('./lib/download');
const { YTDLError } = require('./lib/errors');
const utils = require('./lib/utils');

module.exports = {
    // high-level
    ytmp3, ytmp4, getInfo, getPlaylist, search,
    // building blocks
    resolve, getLink, saveFile, clearSearchCache,
    // constants / errors
    FORMATS, VIDEO_QUALITIES, YTDLError,
    // utilities
    slugify: utils.slugify,
    buildPath: utils.buildPath,
    extractVideoId: utils.extractVideoId,
    isYouTubeUrl: utils.isYouTubeUrl,
    extractPlaylistId: utils.extractPlaylistId,
    parseChapters: utils.parseChapters,
    formatDuration: utils.formatDuration,
    parseDuration: utils.parseDuration,
    formatBytes: utils.formatBytes,
    thumbnails: utils.thumbnails
};
