// Compiles a kit entry. Bare @wovenui/* URLs resolve through package exports (run node with --conditions=sass).
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import * as sass from 'sass';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
    console.error(
        'Usage: node --conditions=sass scripts/build-scss.mjs <input.scss> <output.css>'
    );
    process.exit(1);
}

const packageImporter = {
    findFileUrl(url) {
        if (!url.startsWith('@wovenui/')) return null;
        try {
            return new URL(import.meta.resolve(url));
        } catch {
            return null;
        }
    },
};

const result = sass.compile(input, {
    style: 'expanded',
    sourceMap: true,
    importers: [packageImporter],
});

mkdirSync(dirname(output), { recursive: true });
writeFileSync(
    output,
    `${result.css}\n\n/*# sourceMappingURL=${basename(output)}.map */\n`
);
writeFileSync(`${output}.map`, JSON.stringify(result.sourceMap));
