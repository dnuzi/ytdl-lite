'use strict';

const { call, collect, text } = require('./innertube');
const { YTDLError } = require('./errors');
const { extractPlaylistId, canonicalUrl, thumbnails, formatDuration, parseDuration } = require('./utils');

const num = s => { const n = parseInt(String(s ?? '').replace(/[^\d]/g, ''), 10); return Number.isFinite(n) ? n : null; };

function parseItems(data, seen, out) {
    for (const r of collect(data, 'playlistVideoRenderer')) {
        if (!r.videoId || seen.has(r.videoId)) continue;
        seen.add(r.videoId);
        const seconds = Number(r.lengthSeconds) || parseDuration(text(r.lengthText));
        out.push({
            index: num(text(r.index)) ?? out.length + 1,
            id: r.videoId,
            url: canonicalUrl(r.videoId),
            title: text(r.title) || 'YouTube Video',
            author: text(r.shortBylineText),
            channelId: r.shortBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || '',
            duration: formatDuration(seconds),
            seconds,
            thumbnail: thumbnails(r.videoId).high,
            isPlayable: r.isPlayable !== false
        });
    }
}

const nextToken = data => collect(data, 'continuationCommand')[0]?.token || null;

/**
 * Playlist details + videos.
 * @param {string} input  playlist URL (…?list=PL…) or bare playlist id
 * @param {{limit?: number, all?: boolean, timeout?: number}} [opts]
 *        limit = max videos (default 100); all:true fetches every page (capped at 5000)
 */
async function getPlaylist(input, opts = {}) {
    const id = extractPlaylistId(String(input ?? '').trim());
    if (!id) throw new YTDLError('Not a valid playlist URL or id', { code: 'INVALID_URL' });
    const timeout = opts.timeout ?? 15000;
    const limit = opts.all ? 5000 : Math.max(1, opts.limit ?? 100);

    const { data, raw } = await call('browse', { browseId: 'VL' + id }, { timeout });
    if (data.alerts?.length && !collect(data, 'playlistVideoRenderer').length) {
        const msg = text(collect(data, 'alertWithButtonRenderer')[0]?.text) || text(collect(data, 'alertRenderer')[0]?.text) || 'Playlist unavailable';
        throw new YTDLError(msg, { code: 'PLAYLIST_UNAVAILABLE' });
    }

    const items = [], seen = new Set();
    parseItems(data, seen, items);
    let token = nextToken(data);

    for (let page = 0; token && items.length < limit && page < 100; page++) {
        const { data: more } = await call('browse', { continuation: token }, { timeout });
        const before = items.length;
        parseItems(more, seen, items);
        token = items.length > before ? nextToken(more) : null;
    }

    const meta = data.metadata?.playlistMetadataRenderer || {};
    const owner = collect(data, 'videoOwnerRenderer')[0];
    const header = collect(data, 'playlistHeaderRenderer')[0];
    const title = meta.title || text(header?.title) || '';
    if (!title && !items.length) throw new YTDLError('Playlist not found or empty', { code: 'PLAYLIST_UNAVAILABLE' });

    const author = text(owner?.title) || text(header?.ownerText) || '';
    const channelId = owner?.navigationEndpoint?.browseEndpoint?.browseId || '';
    const countM = /"(\d[\d,]*) videos?"/.exec(raw);
    const viewsM = /"([\d,]+) views?"/.exec(raw);
    const updM = /(?:Last updated|Updated) (?:on )?([A-Z][a-z]{2,8} \d{1,2}, \d{4})/.exec(raw);

    const shown = items.slice(0, limit);
    return {
        status: true,
        id,
        url: `https://www.youtube.com/playlist?list=${id}`,
        title,
        description: meta.description || '',
        author,
        channelId,
        channelUrl: channelId ? `https://www.youtube.com/channel/${channelId}` : '',
        videoCount: countM ? num(countM[1]) : items.length,
        views: viewsM ? num(viewsM[1]) : null,
        lastUpdated: updM ? updM[1] : null,
        totalSeconds: shown.reduce((a, v) => a + v.seconds, 0),
        thumbnail: shown[0]?.thumbnail || '',
        hasMore: !!token || items.length > shown.length,
        items: shown
    };
}

module.exports = { getPlaylist };
