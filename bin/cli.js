#!/usr/bin/env node
'use strict';

/**
 * bin/cli.js
 * Optional CLI — install globally: npm i -g ytdl-lite
 *
 * Usage:
 *   ytdl mp3  <youtube-url>
 *   ytdl mp4  <youtube-url> [quality]
 *   ytdl info <youtube-url>
 *
 * Examples:
 *   ytdl mp3  https://youtu.be/dQw4w9WgXcQ
 *   ytdl mp4  https://youtu.be/dQw4w9WgXcQ 1080
 *   ytdl info https://youtu.be/dQw4w9WgXcQ
 */

const { ytmp3, ytmp4, getInfo } = require('../index');

const [,, cmd, url, quality] = process.argv;

const HELP = `
ytdl — YouTube MP3/MP4 downloader

  ytdl mp3  <url>            Download audio (MP3)
  ytdl mp4  <url> [quality]  Download video (MP4). Quality: 360|480|720|1080|best
  ytdl info <url>            Show all available formats as JSON
`;

(async () => {
    if (!cmd || !url) { console.log(HELP); process.exit(0); }

    try {
        let result;
        if (cmd === 'mp3') {
            result = await ytmp3(url);
        } else if (cmd === 'mp4') {
            result = await ytmp4(url, quality || 'best');
        } else if (cmd === 'info') {
            result = await getInfo(url);
        } else {
            console.error(`Unknown command: ${cmd}`);
            console.log(HELP);
            process.exit(1);
        }

        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
