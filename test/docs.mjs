// Doc blocks match the compiled partials, $registry and the JS exports (grammar: AGENTS.md, section 10).
// Components without a block are listed and skipped during the migration.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import * as sass from 'sass';
import { SRC, compileFile, fail } from './helpers.mjs';
import { isVersion, readDocs } from '../scripts/build-docs.mjs';

const failures = [];
const { docs, errors, undocumented, incomplete } = readDocs(SRC);
failures.push(...errors, ...incomplete.map((c) => `incomplete block: ${c}`));

// $registry read through Sass, so the test sees what the loader sees
const registry = new Map();
sass.compileString(
    '@use "kit"; @use "sass:meta";\n' +
        '@each $n, $needs in kit.$registry { @debug "#{$n}=#{meta.inspect($needs)}"; }',
    {
        loadPaths: [SRC],
        logger: {
            debug(message) {
                const [name, needs] = message.split('=');
                registry.set(
                    name,
                    [...needs.matchAll(/"([^"]+)"/g)].map((m) => m[1])
                );
            },
        },
    }
);

const jsExports = new Set(
    [
        ...readFileSync(path.join(SRC, 'js/index.js'), 'utf8').matchAll(
            /export function (\w+)|export \{([^}]+)\}/g
        ),
    ].flatMap((m) => (m[1] ? [m[1]] : m[2].split(',').map((s) => s.trim())))
);
const roots = new Set([...registry.keys()].map((n) => `wu-${n}`));

// Same compound rule as scripts/check-modifiers.mjs
const classPattern = /\.((?:\\.|[\w-])+)/g;
const classesOf = (text) =>
    [...text.matchAll(classPattern)].map((m) => m[1].replace(/\\(.)/g, '$1'));
const compoundsOf = (selector) =>
    selector
        .replace(/\([^)]*\)/g, '')
        .replace(/\[[^\]]*\]/g, '')
        .split(/[\s,>+~]+/)
        .filter(Boolean);

function cssFacts(css) {
    const modifiers = new Set();
    const classes = new Set();
    const variables = new Set();
    const ast = postcss.parse(css);
    ast.walkRules((rule) => {
        for (const c of classesOf(rule.selector)) classes.add(c);
        for (const compound of compoundsOf(rule.selector)) {
            const cs = classesOf(compound);
            if (!cs.some((c) => c.startsWith('wu-'))) continue;
            for (const c of cs) if (!c.startsWith('wu-')) modifiers.add(c);
        }
    });
    for (const m of css.matchAll(/var\((--[\w-]+)/g)) variables.add(m[1]);
    return { modifiers, classes, variables };
}

const compare = (name, kind, documented, emitted) => {
    for (const n of emitted)
        if (!documented.has(n))
            failures.push(
                `${name}: ${kind} "${n}" is emitted but not documented`
            );
    for (const n of documented)
        if (!emitted.has(n))
            failures.push(
                `${name}: @${kind} "${n}" is documented but not emitted`
            );
};
const names = (items) => new Set(items.flatMap((it) => it.names));
const older = (a, b) => {
    const [x, y] = [a, b].map((v) => v.split('-')[0].split('.').map(Number));
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i];
    return false;
};

for (const doc of docs) {
    const { name, root } = doc;
    if (!registry.has(name)) {
        failures.push(`${name}: not in $registry`);
        continue;
    }
    const css = compileFile(path.join(SRC, 'components', `_${name}.scss`));
    const facts = cssFacts(css);

    if (!facts.classes.has(root))
        failures.push(`${name}: root class ${root} is not emitted`);
    compare(name, 'modifier', names(doc.modifiers), facts.modifiers);
    compare(
        name,
        'part',
        names(doc.parts),
        new Set(
            [...facts.classes].filter(
                (c) => c.startsWith(`${root}-`) && !roots.has(c)
            )
        )
    );
    const docVars = names(doc.variables);
    for (const v of docVars)
        if (!facts.variables.has(v))
            failures.push(`${name}: @variable "${v}" is not read`);
    for (const v of facts.variables)
        if (v.startsWith(`--${root}--`) && !docVars.has(v))
            failures.push(
                `${name}: variable "${v}" is read but not documented`
            );

    const needs = registry.get(name);
    if (doc.needs.join(',') !== needs.join(','))
        failures.push(
            `${name}: @needs ${doc.needs.join(', ') || 'none'}, $registry has ${needs.join(', ') || 'none'}`
        );
    for (const e of doc.js.exports)
        if (!jsExports.has(e))
            failures.push(
                `${name}: @js export "${e}" is not in src/js/index.js`
            );

    const versions = [
        ['@since', doc.since],
        ...['modifiers', 'parts', 'variables', 'states'].flatMap((k) =>
            doc[k].map((it) => [`${it.names.join(' | ')}`, it.since])
        ),
        ...doc.changed.map((c) => ['@changed', c.version]),
    ];
    for (const [label, v] of versions) {
        if (!isVersion(v))
            failures.push(`${name}: ${label} "${v}" is not a version`);
        else if (older(v, doc.since))
            failures.push(
                `${name}: ${label} ${v} is older than the component (${doc.since})`
            );
    }
}

if (undocumented.length)
    console.log(`docs: skipped, no doc block yet: ${undocumented.join(', ')}`);
console.log(`docs: checked ${docs.map((d) => d.name).join(', ') || 'nothing'}`);
fail('docs', failures);
