// Reads the doc block of every src/components/_*.scss into dist/components.json and dist/llms-full.txt.
// Grammar: AGENTS.md, section 10. Usage: node scripts/build-docs.mjs [--strict]
// Without --strict, components without a block or with missing tags are warnings; malformed lines always fail.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.env.UIKIT_SRC ?? join(root, 'src');
const DIST = process.env.UIKIT_DIST ?? join(root, 'dist');

const TAG_ORDER = [
    'since',
    'needs',
    'js',
    'example',
    'modifier',
    'part',
    'variable',
    'state',
    'changed',
];
const SINGLE = ['since', 'needs', 'js'];
const REQUIRED = ['since', 'needs', 'js', 'example'];
const ITEM_TAGS = ['modifier', 'part', 'variable', 'state'];
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z.-]+)?$/;
const BANNED = /[\u2014\u2192{}]/;
const ITEM = /^(\S+(?: \| \S+)*)(?: \[([^\]]+)\])? - (.+) @since (\S+)$/;

export const isVersion = (v) => SEMVER.test(v);

export const componentFiles = (src = SRC) =>
    readdirSync(join(src, 'components'))
        .filter((f) => /^_.+\.scss$/.test(f))
        .sort()
        .map((f) => ({
            name: f.slice(1, -5),
            file: join(src, 'components', f),
        }));

// Returns { doc, errors, missing }: doc is null without a block; missing lists required tags not present
export function parseBlock(name, text) {
    const lines = text.split('\n');
    const errors = [];
    const err = (n, msg) => errors.push(`_${name}.scss:${n + 1}: ${msg}`);
    if (!lines[0].startsWith('////')) {
        if (lines.some((l) => /^\s*\/\/\/\//.test(l)))
            err(0, 'doc block must be the first lines of the file');
        return { doc: null, errors, missing: [] };
    }

    let end = 0;
    while (end < lines.length && lines[end].startsWith('////')) end++;
    const body = lines.slice(0, end);
    if (body[0] !== '////') err(0, 'first line must be a bare ////');
    if (body.length < 3 || body[end - 1] !== '////')
        err(end - 1, 'last line must be a bare ////');
    if (lines[end] !== '')
        err(end, 'doc block must be followed by a blank line');
    if (lines.slice(end).some((l) => /^\s*\/\/\/\//.test(l)))
        err(end, 'only one doc block per file');

    const doc = {
        name,
        root: null,
        summary: null,
        notes: [],
        since: null,
        needs: null,
        js: null,
        examples: [],
        modifiers: [],
        parts: [],
        variables: [],
        states: [],
        changed: [],
    };
    const seen = new Map();
    let rank = -1;
    let example = null;

    for (let i = 1; i < end - 1; i++) {
        const raw = body[i];
        if (raw !== '////' && !raw.startsWith('//// ')) {
            err(i, 'line must be //// followed by one space and text');
            continue;
        }
        const line = raw.slice(5);
        if (example && (line === '' || line.startsWith('  '))) {
            example.push(line.slice(2));
            continue;
        }
        example = null;
        if (line === '') continue;
        if (BANNED.test(line)) err(i, 'no braces, em dashes or arrows');

        if (i === 1) {
            const m = line.match(/^@component (wu-[a-z0-9-]+)$/);
            if (m) doc.root = m[1];
            else err(i, 'line two must be @component <root class>');
            continue;
        }
        if (!line.startsWith('@')) {
            if (rank >= 0)
                err(i, 'text after a tag must be indented example code');
            else if (doc.summary === null) {
                if (i !== 2) err(i, 'the summary is line three');
                if (/[.!?] +[A-Z]/.test(line.replace(/`[^`]*`/g, '')))
                    err(i, 'the summary is one sentence');
                doc.summary = line;
            } else doc.notes.push(line);
            continue;
        }

        const [, tag, rest = ''] = line.match(/^@(\S+)(?: (.*))?$/);
        const r = TAG_ORDER.indexOf(tag);
        if (r < 0) {
            err(i, `unknown tag @${tag}`);
            continue;
        }
        if (r < rank)
            err(i, `@${tag} is out of order (${TAG_ORDER.join(', ')})`);
        rank = Math.max(rank, r);
        if (SINGLE.includes(tag) && seen.has(tag))
            err(i, `@${tag} appears twice`);
        seen.set(tag, true);

        if (tag === 'since') {
            if (isVersion(rest)) doc.since = rest;
            else err(i, `@since "${rest}" is not a version`);
        } else if (tag === 'needs') {
            if (rest === 'none') doc.needs = [];
            else if (/^[a-z0-9-]+(, [a-z0-9-]+)*$/.test(rest))
                doc.needs = rest.split(', ');
            else err(i, '@needs takes none or a comma list of component names');
        } else if (tag === 'js') {
            const m = rest.match(
                /^(none)$|^(required|optional) ([A-Za-z]+(?:, [A-Za-z]+)*)$/
            );
            if (!m)
                err(
                    i,
                    '@js takes none, required <exports> or optional <exports>'
                );
            else
                doc.js = m[1]
                    ? { mode: 'none', exports: [] }
                    : { mode: m[2], exports: m[3].split(', ') };
        } else if (tag === 'example') {
            if (rest !== 'html') err(i, 'write @example html');
            example = [];
            doc.examples.push({ lang: 'html', code: example });
        } else if (tag === 'changed') {
            const m = rest.match(/^(\S+) - (.+)$/);
            if (!m || !isVersion(m[1]))
                err(i, '@changed takes <version> - <note>');
            else doc.changed.push({ version: m[1], note: m[2] });
        } else {
            const m = rest.match(ITEM);
            if (!m) {
                err(i, `@${tag} takes <name> - <description> @since <version>`);
                continue;
            }
            const [, names, value, description, since] = m;
            if (!isVersion(since)) err(i, `@since "${since}" is not a version`);
            if (value !== undefined && tag !== 'variable')
                err(i, `[default] is only for @variable`);
            const item = { names: names.split(' | '), description, since };
            if (tag === 'variable') item.default = value ?? null;
            const key = `${tag}s`;
            const used = new Set(doc[key].flatMap((x) => x.names));
            for (const n of item.names) {
                if (used.has(n)) err(i, `@${tag} ${n} appears twice`);
                const valid = {
                    modifier: /^[a-z0-9][a-z0-9-]*$/,
                    part: /^wu-[a-z0-9-]+$/,
                    variable: /^--wu-[A-Za-z0-9-]+$/,
                    state: /^\S+$/,
                }[tag];
                if (!valid.test(n)) err(i, `@${tag} name "${n}" is not valid`);
            }
            doc[key].push(item);
        }
    }

    for (const ex of doc.examples) {
        while (ex.code.length && ex.code.at(-1) === '') ex.code.pop();
        if (!ex.code.length) errors.push(`_${name}.scss: @example has no code`);
        ex.code = ex.code.join('\n');
    }
    const missing = [];
    if (!doc.root) missing.push('component');
    if (!doc.summary) missing.push('summary');
    for (const t of REQUIRED) if (!seen.has(t)) missing.push(t);
    return { doc, errors, missing };
}

export function readDocs(src = SRC) {
    const docs = [];
    const errors = [];
    const undocumented = [];
    const incomplete = [];
    for (const { name, file } of componentFiles(src)) {
        const result = parseBlock(name, readFileSync(file, 'utf8'));
        errors.push(...result.errors);
        if (!result.doc) undocumented.push(name);
        else if (result.missing.length)
            incomplete.push(`${name} (missing ${result.missing.join(', ')})`);
        else docs.push(result.doc);
    }
    return { docs, errors, undocumented, incomplete };
}

// Naming, motion and icon rules come from AGENTS.md; sentences about repo tooling are dropped
function guideRules() {
    const agents = readFileSync(join(root, 'AGENTS.md'), 'utf8');
    const section = (heading) => {
        const start = agents.indexOf(`\n${heading}\n`);
        const body = agents.slice(start + heading.length + 2);
        return body.slice(0, body.search(/\n#{2,3} /)).trim();
    };
    const clean = (text) =>
        text
            .split('\n')
            .map((line) =>
                line
                    .replace(/ \(in `src\/[^`]+`\)/g, '')
                    .split(/(?<=\.) (?=[A-Z`])/)
                    .filter(
                        (s) =>
                            !/`(scripts|test|src)\//.test(s) &&
                            !/^Kit files /.test(s)
                    )
                    .join(' ')
            )
            .filter((line) => line.trim() !== '' && line.trim() !== '-')
            .join('\n');
    return [
        ['Naming grammar', clean(section('## 4. Naming grammar'))],
        ['Motion', clean(section('### Motion'))],
        ['Icons', clean(section('### Icons'))],
    ];
}

const table = (head, rows) =>
    [
        `| ${head.join(' | ')} |`,
        `| ${head.map(() => '---').join(' | ')} |`,
        ...rows.map((r) => `| ${r.join(' | ')} |`),
    ].join('\n');
const code = (names) => names.map((n) => `\`${n}\``).join(', ');

function componentSection(doc) {
    const js =
        doc.js.mode === 'none'
            ? 'none, CSS only'
            : `${doc.js.mode}: ${code(doc.js.exports)} from \`@wovenui/components/js\``;
    const out = [
        `## ${doc.name}`,
        doc.summary,
        ...doc.notes,
        [
            `- Root class: \`${doc.root}\``,
            `- Sass entry: \`@use "@wovenui/components/${doc.name}";\``,
            `- Needs: ${doc.needs.length ? code(doc.needs) : 'none'}`,
            `- JavaScript: ${js}`,
            `- Since: ${doc.since}`,
        ].join('\n'),
        '### Markup',
        ...doc.examples.map((ex) => `\`\`\`html\n${ex.code}\n\`\`\``),
    ];
    const lists = [
        ['Modifiers', 'Modifier', doc.modifiers],
        ['Parts', 'Part', doc.parts],
        ['Variables', 'Variable', doc.variables],
        ['States', 'State', doc.states],
    ];
    for (const [title, label, items] of lists) {
        if (!items.length) continue;
        const withDefault = label === 'Variable';
        const head = withDefault
            ? [label, 'Default', 'Description', 'Since']
            : [label, 'Description', 'Since'];
        const rows = items.map((it) => {
            const row = [code(it.names), it.description, it.since];
            if (withDefault)
                row.splice(1, 0, it.default ? `\`${it.default}\`` : '');
            return row;
        });
        out.push(`### ${title}`, table(head, rows));
    }
    if (doc.changed.length)
        out.push(
            '### Changes',
            table(
                ['Version', 'Change'],
                doc.changed.map((c) => [c.version, c.note])
            )
        );
    return out.join('\n\n');
}

export function llms(docs) {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const intro = [
        '# WovenUI Components LLM Guide',
        `**Package**: \`${pkg.name}\`. HTML and CSS components built on \`@wovenui/core\` tokens, plus a small optional script.`,
        '**Purpose**: Drop this file into a project so an AI assistant writes correct WovenUI Components markup.',
        "Generated from each component's source. Core reference: https://wovenui.com/llms-full.txt.",
        '## Loading',
        [
            '- All components, prebuilt: `@wovenui/components/min.css`.',
            '- All components from Sass: `@use "@wovenui/components";`, with `$components: ("name": false)` to switch components off.',
            '- One component from Sass: `@use "@wovenui/components/{name}";`. Its needs load with it.',
            '- Script, only for components whose JavaScript is not none: `import { init } from "@wovenui/components/js";` or `dist/wovenui-kit.iife.js` (global `WovenUIKit`). It starts components on `DOMContentLoaded`; `init(element)` starts content added later.',
            '- State lives in attributes (`aria-*`, `hidden`, `open`), not classes.',
        ].join('\n'),
        ...guideRules().flatMap(([title, text]) => [`## ${title}`, text]),
        '## Components',
        docs.map((d) => `- \`${d.name}\`: ${d.summary}`).join('\n'),
    ];
    return [...intro, ...docs.map(componentSection)].join('\n\n') + '\n';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const strict = process.argv.includes('--strict');
    const { docs, errors, undocumented, incomplete } = readDocs();
    const problems = [
        ...errors,
        ...incomplete.map((c) => `incomplete block: ${c}`),
    ];
    if (undocumented.length) {
        const msg = `no doc block: ${undocumented.join(', ')}`;
        if (strict) problems.push(msg);
        else console.warn(`build-docs: warning, ${msg}`);
    }
    if (!strict && incomplete.length) {
        problems.splice(errors.length);
        console.warn(
            `build-docs: warning, incomplete block: ${incomplete.join(', ')}`
        );
    }
    if (problems.length) {
        console.error(problems.join('\n'));
        process.exit(1);
    }
    mkdirSync(DIST, { recursive: true });
    writeFileSync(
        join(DIST, 'components.json'),
        JSON.stringify({ components: docs, undocumented }, null, 2) + '\n'
    );
    writeFileSync(join(DIST, 'llms-full.txt'), llms(docs));
    console.log(
        `build-docs: ${docs.length} documented, ${undocumented.length + incomplete.length} without a complete block`
    );
}
