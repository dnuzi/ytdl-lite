'use strict';

/**
 * test.js — manual test / usage examples
 * Run: node test.js
 */

const ytdl = require('./index');

const TEST_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Never Gonna Give You Up

async function run() {
    console.log('=== ytdl-scraper test ===\n');

    // 1. MP3
    console.log('[ 1 ] ytmp3 — best audio');
    try {
        const mp3 = await ytdl.ytmp3(TEST_URL);
        console.log('  title :', mp3.title);
        console.log('  url   :', mp3.url);
        console.log('  path  :', mp3.path);   // e.g. ./never-gonna-give-you-up.mp3
    } catch (e) { console.error('  FAILED:', e.message); }

    // 2. MP4 best
    console.log('\n[ 2 ] ytmp4 — best quality');
    try {
        const mp4 = await ytdl.ytmp4(TEST_URL, 'best');
        console.log('  title  :', mp4.title);
        console.log('  quality:', mp4.quality);
        console.log('  url    :', mp4.url);
        console.log('  path   :', mp4.path);  // e.g. ./never-gonna-give-you-up.mp4
    } catch (e) { console.error('  FAILED:', e.message); }

    // 3. MP4 specific quality
    console.log('\n[ 3 ] ytmp4 — 720p');
    try {
        const mp4hd = await ytdl.ytmp4(TEST_URL, '720');
        console.log('  label:', mp4hd.label);
        console.log('  url  :', mp4hd.url);
    } catch (e) { console.error('  FAILED:', e.message); }

    // 4. All formats
    console.log('\n[ 4 ] ytmp4 — all formats');
    try {
        const all = await ytdl.ytmp4(TEST_URL, null);
        (all.medias || []).forEach(m =>
            console.log(`  [${m.type}] ${m.label} → ${m.url?.slice(0, 60)}...`)
        );
    } catch (e) { console.error('  FAILED:', e.message); }

    // 5. getInfo
    console.log('\n[ 5 ] getInfo');
    try {
        const info = await ytdl.getInfo(TEST_URL);
        console.log('  title    :', info.title);
        console.log('  duration :', info.duration);
        console.log('  formats  :', (info.medias || []).map(m => m.label).join(', '));
    } catch (e) { console.error('  FAILED:', e.message); }
}

run().catch(console.error);
