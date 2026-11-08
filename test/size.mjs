// Sizes are reported, not limited, until AAMIR sets a budget.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { DIST } from './helpers.mjs';

for (const file of ['wovenui-kit.min.css', 'wovenui-kit.js']) {
    const size = zlib.gzipSync(readFileSync(path.join(DIST, file)), { level: 9 }).length;
    console.log(`size: ${file} ${size} bytes gzip`);
}
