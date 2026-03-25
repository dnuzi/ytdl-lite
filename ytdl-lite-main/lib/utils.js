'use strict';

/**
 * lib/utils.js
 * Shared helpers used by ytmp3 / ytmp4 modules.
 */

const sanitize = require('sanitize-filename');

/**
 * Turn a video title into a filesystem-safe slug.
 * e.g. "Lelena - Official Song!" → "lelena-official-song"
 */
function slugify(title = 'download') {
    return sanitize(
        title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')   // strip special chars
            .trim()
            .replace(/[\s_]+/g, '-')    // spaces → hyphens
            .replace(/-+/g, '-')        // collapse duplicate hyphens
            .slice(0, 80)               // keep it sane
    ) || 'download';
}

/**
 * Build a file path string (no actual FS write here).
 * @param {string} title
 * @param {'mp3'|'mp4'} ext
 * @param {string} [dir='./']   optional directory prefix
 * @returns {string}  e.g. "./lelena-song.mp3"
 */
function buildPath(title, ext, dir = './') {
    const slug = slugify(title);
    return `${dir.replace(/\/?$/, '/')}${slug}.${ext}`;
}

module.exports = { slugify, buildPath };
