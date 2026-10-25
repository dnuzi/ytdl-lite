'use strict';

const { getJSON, fetchText } = require('./http');
const { call } = require('./innertube');
const { search } = require('./search');
const { YTDLError } = require('./errors');
const { extractVideoId, extractPlaylistId, canonicalUrl, thumbnails, formatDuration, parseChapters } = require('./utils');

/** Basic info for a known video id (oEmbed — fast, no key needed). */
async function linkInfo(id, opts = {}) {
    const url = canonicalUrl(id);
    const base = { id, url, title: 'YouTube Video', author: '', duration: '', seconds: 0, views: '', thumbnail: thumbnails(id).high };
    try {
        const o = await getJSON(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`, { timeout: opts.timeout ?? 10000 });
        if (o.title) base.title = o.title;
        if (o.author_name) base.author = o.author_name;
    } catch { /* oEmbed is a bonus; keep defaults */ }
    return base;
}

/** Resolve a YouTube URL OR a plain search query to a single video (basic fields). */
async function resolve(input, opts = {}) {
    const text = String(input ?? '').trim();
    if (!text) throw new YTDLError('A YouTube URL or search query is required', { code: 'INVALID_INPUT' });
    const id = extractVideoId(text);
    if (id) return linkInfo(id, opts);
    if (/^https?:\/\//i.test(text)) throw new YTDLError('Not a valid YouTube URL', { code: 'INVALID_URL' });
    const [first] = await search(text, { limit: 1, timeout: opts.timeout });
    return first;
}

/* ───────────────────────── full details ───────────────────────── */

async function playerAndroid(id, timeout) {
    const { data } = await call('player', { videoId: id, contentCheckOk: true, racyCheckOk: true }, { client: 'ANDROID', timeout });
    return data;
}

async function playerWatchPage(id, timeout) {
    const { text } = await fetchText(`https://www.youtube.com/watch?v=${id}&hl=en&bpctr=9999999999&has_verified=1`, {
        timeout, headers: { 'accept-language': 'en-US,en;q=0.9', cookie: 'CONSENT=YES+1; SOCS=CAI' }
    });
    const m = /ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;\s*(?:var\s|<\/script>)/s.exec(text);
    if (!m) throw new YTDLError('Player data not found on watch page', { code: 'BAD_RESPONSE' });
    return JSON.parse(m[1]);
}

async function fetchPlayer(id, timeout) {
    let last;
    for (const fn of [playerAndroid, playerWatchPage]) {
        try {
            const d = await fn(id, timeout);
            if (d?.videoDetails) return d;
            last = new YTDLError(d?.playabilityStatus?.reason || 'Video unavailable', { code: 'VIDEO_UNAVAILABLE' });
        } catch (e) { last = e; }
    }
    throw last;
}

const num = v => { const n = Number(String(v ?? '').replace(/,/g, '')); return Number.isFinite(n) && v !== '' && v != null ? n : null; };

/** Best-effort like count from the `next` endpoint (YouTube changes this markup often). */
async function fetchLikes(id, timeout) {
    try {
        const { raw } = await call('next', { videoId: id }, { timeout });
        for (const re of [/"likeCount":"?(\d{1,15})/, /([\d,]{1,15}) likes?"/, /along with ([\d,]{1,15}) other people/]) {
            const m = re.exec(raw);
            if (m) return num(m[1]);
        }
    } catch { /* optional */ }
    return null;
}

/**
 * Full video details. Accepts a URL or a search query.
 * @param {string} input
 * @param {{timeout?: number, likes?: boolean}} [opts]  likes:false skips the extra like-count request
 */
async function getInfo(input, opts = {}) {
    const text = String(input ?? '').trim();
    if (!text) throw new YTDLError('A YouTube URL or search query is required', { code: 'INVALID_INPUT' });
    const timeout = opts.timeout ?? 15000;

    let id = extractVideoId(text), seed = null;
    if (!id) {
        if (/^https?:\/\//i.test(text)) throw new YTDLError('Not a valid YouTube URL', { code: 'INVALID_URL' });
        seed = (await search(text, { limit: 1, timeout }))[0];
        id = seed.id;
    }

    const [player, likes] = await Promise.all([
        fetchPlayer(id, timeout).catch(e => e),
        opts.likes === false ? null : fetchLikes(id, timeout)
    ]);

    // Detailed lookup failed -> degrade gracefully to basic info
    if (player instanceof Error) {
        if (player.code === 'VIDEO_UNAVAILABLE') throw player;
        const basic = seed || await linkInfo(id, opts);
        return { status: true, ...basic, thumbnails: thumbnails(id), partial: true };
    }

    const vd = player.videoDetails;
    const mf = player.microformat?.playerMicroformatRenderer || {};
    const description = vd.shortDescription || mf.description?.simpleText || '';
    const seconds = Number(vd.lengthSeconds) || 0;
    const channelId = vd.channelId || mf.externalChannelId || '';
    const list = vd.thumbnail?.thumbnails || [];

    return {
        status: true,
        id,
        url: canonicalUrl(id),
        title: vd.title,
        description,
        author: vd.author || mf.ownerChannelName || '',
        channelId,
        channelUrl: mf.ownerProfileUrl || (channelId ? `https://www.youtube.com/channel/${channelId}` : ''),
        duration: formatDuration(seconds),
        seconds,
        views: num(vd.viewCount),
        likes,
        publishDate: mf.publishDate || null,
        uploadDate: mf.uploadDate || null,
        category: mf.category || null,
        keywords: vd.keywords || [],
        chapters: parseChapters(description),
        isLive: !!vd.isLive,
        isLiveContent: !!vd.isLiveContent,
        isPrivate: !!vd.isPrivate,
        isUnlisted: !!mf.isUnlisted,
        isFamilySafe: mf.isFamilySafe ?? null,
        availableCountries: mf.availableCountries || [],
        playlistId: extractPlaylistId(text),
        thumbnail: thumbnails(id).high,
        thumbnails: thumbnails(id),
        thumbnailList: list
    };
}

module.exports = { getInfo, resolve, linkInfo };
