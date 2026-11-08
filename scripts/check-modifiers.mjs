// Fails when a kit modifier word reuses a core class name or appears outside a .wu-* compound.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const kitCss = readFileSync(
    process.argv[2] ?? join(root, 'dist/wovenui-kit.css'),
    'utf8'
);
const coreCss = readFileSync(require.resolve('@wovenui/core/css'), 'utf8');

const classPattern = /\.((?:\\.|[\w-])+)/g;
const unescape = (name) => name.replace(/\\(.)/g, '$1');
const classesOf = (text) =>
    [...text.matchAll(classPattern)].map((m) => unescape(m[1]));

const coreClasses = new Set();
postcss.parse(coreCss).walkRules((rule) => {
    for (const name of classesOf(rule.selector)) coreClasses.add(name);
});

// Compound selectors: split on combinators and commas, ignoring pseudo arguments
const compoundsOf = (selector) =>
    selector
        .replace(/\([^)]*\)/g, '')
        .replace(/\[[^\]]*\]/g, '')
        .split(/[\s,>+~]+/)
        .filter(Boolean);

const modifiers = new Map();
const compounds = [];
postcss.parse(kitCss).walkRules((rule) => {
    for (const compound of compoundsOf(rule.selector)) {
        const classes = classesOf(compound);
        compounds.push({ compound, classes, selector: rule.selector });
        if (!classes.some((c) => c.startsWith('wu-'))) continue;
        for (const c of classes) {
            if (!c.startsWith('wu-')) modifiers.set(c, rule.selector);
        }
    }
});

const errors = [];
for (const [word, selector] of modifiers) {
    if (coreClasses.has(word))
        errors.push(
            `Modifier "${word}" reuses a core class name (${selector})`
        );
}
for (const { compound, classes, selector } of compounds) {
    for (const c of classes) {
        if (modifiers.has(c) && !classes.some((k) => k.startsWith('wu-'))) {
            errors.push(
                `Modifier "${c}" used without a .wu-* root in "${compound}" (${selector})`
            );
        }
    }
}

if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
}
console.log(
    `check-modifiers: ${modifiers.size} modifiers (${[...modifiers.keys()].join(', ')}), ${coreClasses.size} core classes, no conflicts`
);
