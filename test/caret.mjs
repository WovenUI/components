// The caret button and the checkable button group selectors exist in the built CSS.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DIST, fail, rulesOf } from './helpers.mjs';

const rules = rulesOf(readFileSync(path.join(DIST, 'wovenui-kit.css'), 'utf8'));
const has = (part) => rules.some((r) => r.includes(part));
const failures = [];
for (const part of [
    '.wu-btn.caret::after',
    '.wu-btn.caret:empty',
    '.wu-btn.caret.sm:empty',
    '.wu-btn.caret.lg:empty',
    '[popover]:popover-open',
    ':has(> input:checked',
    '[aria-pressed=true]',
]) {
    if (!has(part)) failures.push(`missing selector ${part}`);
}
const selected = rules.find((r) => r.includes('[aria-pressed=true]') && r.includes('> input:checked') && r.includes('bg-selected'));
if (!selected) failures.push('aria-pressed and :checked do not share one selected rule');
fail('caret and checkable group', failures);
