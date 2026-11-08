// Bundles src/js into dist/wovenui-kit.js (ES module) and dist/wovenui-kit.iife.js (classic script, global WovenUIKit).
// No bundler: the modules are joined in order, imports dropped and exports collected. Top-level names must be unique.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const order = [
    'util',
    'tabs',
    'toast',
    'autocomplete',
    'data-table',
    'input-clear',
    'index',
];
const api = [
    'init',
    'toast',
    'dismiss',
    'sortTable',
    'initTabs',
    'initToast',
    'initAutocomplete',
    'initDataTable',
    'initInputClear',
    'initTable',
];

const body = order
    .map((name) =>
        readFileSync(join(root, 'src/js', `${name}.js`), 'utf8')
            .replace(/^import[\s\S]*?from\s+'[^']+';\n/gm, '')
            .replace(/^export \{[\s\S]*?\};\n/gm, '')
            .replace(/^export (?=const|function|let)/gm, '')
    )
    .join('\n')
    .trim();

const header =
    '// @wovenui/components wovenui-kit.js, MIT. Built from src/js.\n';
const list = api.join(', ');

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(
    join(root, 'dist/wovenui-kit.js'),
    `${header}${body}\n\nexport { ${list} };\n`
);
writeFileSync(
    join(root, 'dist/wovenui-kit.iife.js'),
    `${header}(() => {\n'use strict';\n${body}\n\nglobalThis.WovenUIKit = { ${list} };\n})();\n`
);
