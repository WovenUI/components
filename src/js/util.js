// Shared helpers for the kit scripts
const started = new WeakSet();
let count = 0;

// Elements matching the selector in root (root included), each returned only once
export function fresh(root, selector) {
    const found = [...root.querySelectorAll(selector)];
    if (root.matches?.(selector)) found.unshift(root);
    return found.filter((el) => !started.has(el) && started.add(el));
}

// The element's id, assigned when missing
export function idOf(el, prefix) {
    if (!el.id) el.id = `${prefix}-${++count}`;
    return el.id;
}

// True when the component opted into motion and the user allows it
export const animated = (el, name) =>
    el.matches(`.${name}.animated, .wu-animated .${name}`) &&
    matchMedia('(prefers-reduced-motion: no-preference)').matches;
