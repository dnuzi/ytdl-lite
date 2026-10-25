'use strict';

const { fetchText } = require('./http');
const { YTDLError } = require('./errors');

const CLIENTS = {
    WEB: {
        context: { clientName: 'WEB', clientVersion: '2.20250310.01.00', hl: 'en', gl: 'US' },
        headers: {}
    },
    ANDROID: {
        context: { clientName: 'ANDROID', clientVersion: '19.09.37', androidSdkVersion: 30, hl: 'en', gl: 'US' },
        headers: {
            'user-agent': 'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
            'x-youtube-client-name': '3',
            'x-youtube-client-version': '19.09.37'
        }
    }
};

/** POST to youtubei/v1/<endpoint>. Returns { data, raw }. */
async function call(endpoint, body, { client = 'WEB', timeout = 15000 } = {}) {
    const c = CLIENTS[client];
    const { text } = await fetchText(`https://www.youtube.com/youtubei/v1/${endpoint}?prettyPrint=false`, {
        method: 'POST',
        timeout,
        headers: {
            'content-type': 'application/json',
            origin: 'https://www.youtube.com',
            'accept-language': 'en-US,en;q=0.9',
            cookie: 'CONSENT=YES+1; SOCS=CAI',
            ...c.headers
        },
        body: JSON.stringify({ context: { client: c.context }, ...body })
    });
    try { return { data: JSON.parse(text), raw: text }; }
    catch (err) { throw new YTDLError('Invalid JSON from YouTube', { code: 'BAD_RESPONSE', cause: err }); }
}

/** Depth-first: collect every object stored under `key`. */
function collect(node, key, out = []) {
    if (Array.isArray(node)) { for (const c of node) collect(c, key, out); return out; }
    if (node && typeof node === 'object') {
        if (node[key] && typeof node[key] === 'object') out.push(node[key]);
        for (const k in node) if (k !== key) collect(node[k], key, out);
    }
    return out;
}

const text = o => (o ? o.simpleText ?? o.runs?.map(r => r.text).join('') ?? '' : '');

module.exports = { call, collect, text };
