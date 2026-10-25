'use strict';

/**
 * lib/search.js — YouTube search with 4 providers and automatic fallback:
 *   Innertube (web API) -> Piped -> Invidious -> HTML scrape
 */

const { fetchText, getJSON } = require('./http');
const { YTDLError } = require('./errors');
const { canonicalUrl, thumbnails, formatDuration, parseDuration } = require('./utils');

const CACHE_TTL = 30 * 60 * 1000;
const cache = new Map();

const PIPED = ['https://pipedapi.kavin.rocks', 'https://pipedapi.adminforge.de', 'https://api.piped.private.coffee'];
const INVIDIOUS = ['https://yewtu.be', 'https://inv.nadeko.net', 'https://invidious.nerdvpn.de'];

const rText = o => (o ? o.simpleText ?? o.runs?.[0]?.text ?? '' : '');

function item(id, title, author, duration, views) {
    return {
        id,
        url: canonicalUrl(id),
        title: title || 'YouTube Video',
        author: author || '',
        duration: duration || '',
        seconds: parseDuration(duration),
        views: views || '',
        thumbnail: thumbnails(id).high
    };
}

function findVideos(node, out) {
    if (Array.isArray(node)) { for (const c of node) findVideos(c, out); return; }
    if (node && typeof node === 'object') {
        const vr = node.videoRenderer;
        if (vr && typeof vr.videoId === 'string') { out.push(vr); return; }
        for (const k in node) findVideos(node[k], out);
    }
}

function fromRenderers(data, limit) {
    const vrs = [], seen = new Set(), out = [];
    findVideos(data, vrs);
    for (const vr of vrs) {
        if (seen.has(vr.videoId)) continue;
        seen.add(vr.videoId);
        out.push(item(vr.videoId, rText(vr.title), rText(vr.ownerText), rText(vr.lengthText), rText(vr.viewCountText)));
        if (out.length >= limit) break;
    }
    return out;
}

async function innertube(q, limit, timeout) {
    const { text } = await fetchText('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
        method: 'POST',
        timeout,
        headers: {
            'content-type': 'application/json',
            origin: 'https://www.youtube.com',
            'accept-language': 'en-US,en;q=0.9',
            cookie: 'CONSENT=YES+1; SOCS=CAI'
        },
        body: JSON.stringify({
            context: { client: { clientName: 'WEB', clientVersion: '2.20250310.01.00', hl: 'en', gl: 'US' } },
            query: q,
            params: 'EgIQAQ==' // videos only
        })
    });
    const out = fromRenderers(JSON.parse(text), limit);
    if (!out.length) throw new YTDLError('innertube: no results', { code: 'NO_RESULTS' });
    return out;
}

async function piped(q, limit, timeout) {
    let last;
    for (const base of PIPED) {
        try {
            const r = await getJSON(`${base}/search?filter=videos&q=${encodeURIComponent(q)}`, { timeout });
            const out = [];
            for (const it of r.items || []) {
                const m = /[?&]v=([\w-]{11})/.exec(it.url || '');
                if (!m || !it.title) continue;
                out.push(item(m[1], it.title, it.uploaderName, formatDuration(it.duration), `${it.views ?? 0} views`));
                if (out.length >= limit) break;
            }
            if (out.length) return out;
        } catch (e) { last = e; }
    }
    throw last || new YTDLError('piped: no results', { code: 'NO_RESULTS' });
}

async function invidious(q, limit, timeout) {
    let last;
    for (const base of INVIDIOUS) {
        try {
            const r = await getJSON(`${base}/api/v1/search?type=video&q=${encodeURIComponent(q)}`, { timeout });
            const out = [];
            for (const it of r || []) {
                if (!it.videoId) continue;
                out.push(item(it.videoId, it.title, it.author, formatDuration(it.lengthSeconds), `${it.viewCount ?? 0} views`));
                if (out.length >= limit) break;
            }
            if (out.length) return out;
        } catch (e) { last = e; }
    }
    throw last || new YTDLError('invidious: no results', { code: 'NO_RESULTS' });
}

async function html(q, limit, timeout) {
    const { text } = await fetchText(`https://www.youtube.com/results?sp=EgIQAQ%3D%3D&search_query=${encodeURIComponent(q)}`, {
        timeout,
        headers: { 'accept-language': 'en-US,en;q=0.9', cookie: 'CONSENT=YES+1' }
    });
    const m = /var ytInitialData = (\{.*?\});<\/script>/s.exec(text);
    if (!m) throw new YTDLError('youtube data not found', { code: 'BAD_RESPONSE' });
    const out = fromRenderers(JSON.parse(m[1]), limit);
    if (!out.length) throw new YTDLError('html: no results', { code: 'NO_RESULTS' });
    return out;
}

const PROVIDERS = { innertube, piped, invidious, html };

/**
 * Search YouTube videos.
 * @param {string} query
 * @param {{limit?: number, timeout?: number, cache?: boolean, providers?: string[]}} [opts]
 * @returns {Promise<Array>} { id, url, title, author, duration, seconds, views, thumbnail }[]
 */
async function search(query, opts = {}) {
    const q = String(query || '').trim();
    if (!q) throw new YTDLError('Search query is empty', { code: 'INVALID_INPUT' });
    const limit = Math.max(1, Math.min(opts.limit ?? 10, 25));
    const timeout = opts.timeout ?? 15000;
    const key = q.toLowerCase();

    const hit = cache.get(key);
    if (opts.cache !== false && hit && Date.now() - hit.at < CACHE_TTL) return hit.items.slice(0, limit);

    const order = (opts.providers || Object.keys(PROVIDERS)).filter(p => PROVIDERS[p]);
    const errors = [];
    for (const name of order) {
        try {
            const items = await PROVIDERS[name](q, 25, timeout);
            if (items.length) {
                if (cache.size > 200) cache.clear();
                cache.set(key, { items, at: Date.now() });
                return items.slice(0, limit);
            }
        } catch (e) { errors.push(`${name}: ${e.message}`); }
    }
    throw new YTDLError(`Search failed (${errors.join(' | ') || 'no results'})`, { code: 'SEARCH_FAILED' });
}

const clearSearchCache = () => cache.clear();

module.exports = { search, clearSearchCache };
