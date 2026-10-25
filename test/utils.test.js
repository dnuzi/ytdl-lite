'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const y = require('../index');

test('extractVideoId handles all URL shapes', () => {
    const id = 'dQw4w9WgXcQ';
    for (const u of [
        `https://www.youtube.com/watch?v=${id}`, `https://youtu.be/${id}?t=5`,
        `https://youtube.com/shorts/${id}`, `https://www.youtube.com/embed/${id}`,
        `https://m.youtube.com/watch?feature=share&v=${id}`, `https://music.youtube.com/watch?v=${id}`
    ]) assert.equal(y.extractVideoId(u), id, u);
    assert.equal(y.extractVideoId('hello world'), null);
});

test('slugify / buildPath', () => {
    assert.equal(y.slugify('Lelena - Official Song!'), 'lelena-official-song');
    assert.equal(y.slugify('!!!'), 'download');
    assert.equal(y.slugify('සිංදුව ගීතය'), 'සිංදුව-ගීතය');
    assert.equal(y.buildPath('My Song', 'mp3'), './my-song.mp3');
    assert.equal(y.buildPath('My Song', 'mp4', './out'), './out/my-song.mp4');
});

test('duration helpers', () => {
    assert.equal(y.formatDuration(83), '1:23');
    assert.equal(y.formatDuration(3725), '1:02:05');
    assert.equal(y.parseDuration('1:02:05'), 3725);
});

test('input validation', async () => {
    await assert.rejects(() => y.ytmp4('https://youtu.be/dQw4w9WgXcQ', '999'), { code: 'INVALID_QUALITY' });
    await assert.rejects(() => y.ytmp3(''), { code: 'INVALID_INPUT' });
    await assert.rejects(() => y.getLink('x', 'flac'), { code: 'INVALID_QUALITY' });
});

test('ESM wrapper exposes the same API', async () => {
    const esm = await import('../index.mjs');
    assert.equal(esm.ytmp3, y.ytmp3);
    assert.equal(esm.default, y);
});

test('playlist id + chapters', () => {
    assert.equal(y.extractPlaylistId('https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf'), 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf');
    assert.equal(y.extractPlaylistId('https://youtu.be/dQw4w9WgXcQ?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf'), 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf');
    assert.equal(y.extractPlaylistId('hello'), null);
    const ch = y.parseChapters('Intro text\n0:00 Intro\n1:30 - Verse\n1:02:05 Outro');
    assert.deepEqual(ch.map(c => c.seconds), [0, 90, 3725]);
    assert.deepEqual(y.parseChapters('no chapters here'), []);
});
