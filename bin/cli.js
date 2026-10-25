#!/usr/bin/env node
'use strict';

const { ytmp3, ytmp4, getInfo, getPlaylist, search, formatBytes } = require('../index');
const pkg = require('../package.json');

const HELP = `
ytdl-lite v${pkg.version} — YouTube downloader & search

Usage:
  ytdl mp3    <url|query> [--save] [--dir ./music]
  ytdl mp4    <url|query> [-q 360|480|720|1080|best|all] [--save] [--dir ./videos]
  ytdl search <query>     [-n 10]
  ytdl info   <url|query>      full video details (views, likes, description, chapters...)
  ytdl playlist <url|id> [-n 100 | --all]

Options:
  -q, --quality   video quality (mp4)      -n, --limit  results / playlist videos
  -s, --save      download the file        -d, --dir    output directory (default ./)
      --all       whole playlist
      --json      force JSON output        -v, --version  -h, --help
`;

function parse(argv) {
    const o = { _: [] };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '-q' || a === '--quality') o.quality = argv[++i];
        else if (a === '-n' || a === '--limit') o.limit = parseInt(argv[++i], 10);
        else if (a === '-d' || a === '--dir') o.dir = argv[++i];
        else if (a === '-s' || a === '--save') o.save = true;
        else if (a === '--all') o.all = true;
        else if (a === '--json') o.json = true;
        else if (a === '-h' || a === '--help') o.help = true;
        else if (a === '-v' || a === '--version') o.version = true;
        else o._.push(a);
    }
    return o;
}

(async () => {
    const o = parse(process.argv.slice(2));
    const [cmd, ...rest] = o._;
    const input = rest.join(' ').trim();

    if (o.version) return console.log(pkg.version);
    if (o.help || !cmd || !input) return console.log(HELP);

    let last = -1;
    const onProgress = p => {
        if (p.stage !== 'downloading' || o.json || !process.stderr.isTTY) return;
        const pct = p.percent == null ? formatBytes(p.downloaded) : `${Math.floor(p.percent)}%`;
        if (pct !== last) { process.stderr.write(`\r⬇  ${pct}   `); last = pct; }
    };
    const opts = { dir: o.dir, save: o.save, onProgress };

    try {
        let result;
        if (cmd === 'mp3') result = await ytmp3(input, 'best', opts);
        else if (cmd === 'mp4') result = await ytmp4(input, o.quality === 'all' ? null : (o.quality || 'best'), opts);
        else if (cmd === 'search') result = await search(input, { limit: o.limit || 10 });
        else if (cmd === 'playlist') result = await getPlaylist(input, { limit: o.limit || 100, all: o.all });
        else if (cmd === 'info') result = await getInfo(input);
        else { console.error(`Unknown command: ${cmd}`); console.log(HELP); process.exit(1); }

        if (last !== -1) process.stderr.write('\n');
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error(`Error [${err.code || 'ERROR'}]: ${err.message}`);
        process.exit(1);
    }
})();
