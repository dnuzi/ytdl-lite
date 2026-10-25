'use strict';

/**
 * Turn a title into a filesystem-safe slug. Unicode-aware, so Sinhala,
 * Japanese, etc. titles are kept instead of collapsing to "download".
 */
function slugify(title = 'download', max = 80) {
    const s = String(title)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s_-]/gu, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, max);
    return s || 'download';
}

/** buildPath('My Song', 'mp3', './out') -> "./out/my-song.mp3" (no FS access). */
function buildPath(title, ext, dir = './') {
    return `${String(dir).replace(/[\\/]*$/, '/')}${slugify(title)}.${ext}`;
}

const ID_PATTERNS = [
    /(?:youtube\.com|youtube-nocookie\.com)\/(?:watch\?(?:[^#\s]*&)?v=|embed\/|v\/|shorts\/|live\/)([\w-]{11})/i,
    /youtu\.be\/([\w-]{11})/i
];

/** Extract the 11-char video ID from any YouTube URL, or null. */
function extractVideoId(input) {
    if (typeof input !== 'string') return null;
    for (const p of ID_PATTERNS) {
        const m = input.match(p);
        if (m) return m[1];
    }
    return null;
}

const isYouTubeUrl = input => extractVideoId(input) !== null;
const canonicalUrl = id => `https://www.youtube.com/watch?v=${id}`;

/** Thumbnail URLs for a video id. */
function thumbnails(id) {
    const base = `https://i.ytimg.com/vi/${id}`;
    return {
        default: `${base}/default.jpg`,
        medium: `${base}/mqdefault.jpg`,
        high: `${base}/hqdefault.jpg`,
        standard: `${base}/sddefault.jpg`,
        maxres: `${base}/maxresdefault.jpg`
    };
}

/** 83 -> "1:23", 3725 -> "1:02:05" */
function formatDuration(sec) {
    sec = Math.floor(Number(sec) || 0);
    if (sec <= 0) return '';
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

/** "1:02:05" -> 3725 */
function parseDuration(str) {
    if (!str || typeof str !== 'string') return 0;
    return str.split(':').reduce((acc, p) => acc * 60 + (parseInt(p, 10) || 0), 0);
}

function formatBytes(n) {
    if (!n) return '0 B';
    const u = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), u.length - 1);
    return `${(n / 1024 ** i).toFixed(i ? 1 : 0)} ${u[i]}`;
}

/** Playlist id from a URL (…?list=PL…) or a bare id like "PLxxxxxxxxxx". */
function extractPlaylistId(input) {
    if (typeof input !== 'string') return null;
    const m = input.match(/[?&]list=([\w-]{12,})/i);
    if (m) return m[1];
    const t = input.trim();
    return /^(?:PL|UU|LL|FL|OL|RD)[\w-]{10,}$/.test(t) ? t : null;
}

/** Parse "0:00 Intro" style lines from a description into chapters (needs >= 2). */
function parseChapters(description = '') {
    const out = [];
    for (const line of String(description).split(/\r?\n/)) {
        const m = line.match(/^\s*[(\[]?((?:\d{1,2}:)?\d{1,2}:\d{2})[)\]]?\s*[-–—:|]?\s*(.+?)\s*$/);
        if (m) out.push({ time: m[1], seconds: parseDuration(m[1]), title: m[2] });
    }
    return out.length >= 2 && out[0].seconds === 0 ? out : [];
}

module.exports = { extractPlaylistId, parseChapters, slugify, buildPath, extractVideoId, isYouTubeUrl, canonicalUrl, thumbnails, formatDuration, parseDuration, formatBytes };
