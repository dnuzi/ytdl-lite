'use strict';

const { YTDLError } = require('./errors');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Fetch with timeout; returns { res, text } (body already read). */
async function fetchText(url, { method = 'GET', headers = {}, body, timeout = 20000, redirect = 'follow' } = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
        const res = await fetch(url, { method, headers: { 'user-agent': UA, ...headers }, body, redirect, signal: ctrl.signal });
        if (!res.ok) throw new YTDLError(`HTTP ${res.status}`, { code: 'HTTP_ERROR', status: res.status });
        return { res, text: await res.text() };
    } catch (err) {
        if (err instanceof YTDLError) throw err;
        if (err.name === 'AbortError') throw new YTDLError('Request timed out', { code: 'TIMEOUT', cause: err });
        throw new YTDLError(err.message, { code: 'NETWORK', cause: err });
    } finally {
        clearTimeout(timer);
    }
}

async function getJSON(url, opts = {}) {
    const { text } = await fetchText(url, { ...opts, headers: { accept: 'application/json', ...(opts.headers || {}) } });
    try { return JSON.parse(text); }
    catch (err) { throw new YTDLError('Invalid JSON response', { code: 'BAD_RESPONSE', cause: err }); }
}

/** Run fn up to `retries + 1` times with linear backoff. */
async function retry(fn, retries = 2, delay = 800) {
    let last;
    for (let i = 0; i <= retries; i++) {
        try { return await fn(i); }
        catch (e) { last = e; if (i < retries) await sleep(delay * (i + 1)); }
    }
    throw last;
}

module.exports = { UA, sleep, fetchText, getJSON, retry };
