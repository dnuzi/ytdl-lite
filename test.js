'use strict';
/** Live manual test (needs internet): node test.js */
const ytdl = require('./index');
const URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

const step = async (name, fn) => {
    console.log(`\n[ ${name} ]`);
    try { console.log(await fn()); } catch (e) { console.error('  FAILED:', e.code, e.message); }
};

(async () => {
    await step('getInfo (full)', async () => { const { thumbnailList, description, ...rest } = await ytdl.getInfo(URL); return { ...rest, description: description.slice(0, 80) + '...' }; });
    await step('getPlaylist', async () => { const p = await ytdl.getPlaylist('https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf', { limit: 5 }); return { ...p, items: p.items.map(i => `${i.index}. ${i.title}`) }; });
    await step('search', async () => (await ytdl.search('never gonna give you up', { limit: 3 })).map(r => `${r.title} (${r.duration})`));
    await step('getInfo', async () => { const i = await ytdl.getInfo(URL); return `${i.title} — ${i.author}`; });
    await step('ytmp3 (URL)', async () => (await ytdl.ytmp3(URL)).url);
    await step('ytmp3 (query)', async () => { const r = await ytdl.ytmp3('believer imagine dragons'); return `${r.title} -> ${r.path}`; });
    await step('ytmp4 720', async () => (await ytdl.ytmp4(URL, '720')).url);
    await step('ytmp4 all', async () => (await ytdl.ytmp4(URL, null)).medias.map(m => m.label).join(', '));
})();
