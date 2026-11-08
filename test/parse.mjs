// dist/wovenui-kit.css must pass the CSS minifiers apps use: cssnano always, Lightning CSS when it can be imported
// (it is not a kit dependency). Lightning CSS rejects anchored() container queries, so they are refused here too.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import cssnano from 'cssnano';
import { DIST, fail } from './helpers.mjs';

const file = path.join(DIST, 'wovenui-kit.css');
const css = readFileSync(file, 'utf8');
const failures = [];

try {
    await postcss([cssnano]).process(css, { from: file });
} catch (error) {
    failures.push(`cssnano: ${error.message.split('\n')[0]}`);
}

css.split('\n').forEach((line, i) => {
    if (/@container\b[^{]*\banchored\(/.test(line)) {
        failures.push(
            `line ${i + 1}: anchored() container query, Lightning CSS cannot parse it`
        );
    }
});

let lightningcss;
try {
    lightningcss = await import('lightningcss');
} catch {
    console.log('parse: lightningcss not installed, checked with cssnano only');
}
if (lightningcss) {
    try {
        lightningcss.transform({
            filename: file,
            code: Buffer.from(css),
            minify: true,
        });
    } catch (error) {
        failures.push(
            `lightningcss: ${error.message} at ${JSON.stringify(error.loc)}`
        );
    }
}

fail('parse (dist/wovenui-kit.css)', failures);
