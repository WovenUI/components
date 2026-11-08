// Shared helpers for the kit tests. UIKIT_SRC and UIKIT_DIST point the tests at other folders (used to prove failures).
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import * as sass from 'sass';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SRC = process.env.UIKIT_SRC ?? path.join(ROOT, 'src');
export const DIST = process.env.UIKIT_DIST ?? path.join(ROOT, 'dist');
export const ROOT_DIR = ROOT;
export const BUNDLE = path.join(SRC, 'index.scss');
export const ENTRIES_DIR = path.join(SRC, 'entries');
export const entryFiles = () =>
    readdirSync(ENTRIES_DIR)
        .filter((f) => f.endsWith('.scss'))
        .map((f) => path.join(ENTRIES_DIR, f));

// Bare @wovenui/* URLs resolve through package exports (run node with --conditions=sass)
const importers = [
    {
        findFileUrl(url) {
            if (!url.startsWith('@wovenui/')) return null;
            try {
                return new URL(import.meta.resolve(url));
            } catch {
                return null;
            }
        },
    },
];

export const compileFile = (file) =>
    sass.compile(file, { style: 'expanded', importers }).css;
export const compileString = (source) =>
    sass.compileString(source, {
        style: 'expanded',
        importers,
        loadPaths: [SRC],
    }).css;

// Rules as "layer path | selector { declarations }" strings
export function rulesOf(css) {
    const out = [];
    postcss.parse(css).walkRules((rule) => {
        const layers = [];
        for (let p = rule.parent; p && p.type !== 'root'; p = p.parent) {
            layers.unshift(`${p.name} ${p.params}`);
        }
        const body = rule.nodes
            .map((n) => `${n.prop}:${n.value}`)
            .join(';');
        out.push(`${layers.join(' > ')} | ${rule.selector} { ${body} }`);
    });
    return out;
}

export function fail(name, failures) {
    if (failures.length === 0) return console.log(`${name}: ok`);
    console.log(`${name}: ${failures.length} failure(s)`);
    failures.forEach((f) => console.log(`  ${f}`));
    process.exit(1);
}
