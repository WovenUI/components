// Toasts: a polite live region, auto-dismiss paused on hover and focus, never takes focus
import { fresh } from './util.js';

const MAX = 3;
const timers = new WeakMap();
const keys = new WeakMap();
const open = new Map();
const before = new WeakMap();
const pending = new WeakSet();
const toastsOf = (region) =>
    region.querySelectorAll(':scope > .wu-toast:not([hidden])');
const paused = (region) => region.matches(':hover, :focus-within');

function start(el) {
    const t = timers.get(el);
    if (!t || t.id) return;
    t.start = Date.now();
    t.id = setTimeout(() => dismiss(el), t.left);
}

function stop(el) {
    const t = timers.get(el);
    if (!t?.id) return;
    clearTimeout(t.id);
    t.id = 0;
    t.left -= Date.now() - t.start;
}

// Focus target when a focused toast closes: the next toast's close button, else where focus was before
function focusAfter(el) {
    const region = el.parentElement;
    const rest = region ? [...toastsOf(region)].filter((t) => t !== el) : [];
    const next =
        rest.find(
            (t) =>
                el.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING
        ) ?? rest.at(-1);
    const close = next?.querySelector('.wu-toast-close');
    if (close) return close;
    const back = region && before.get(region);
    return back?.isConnected ? back : null;
}

// Hides the toast, then removes it once its exit transition ends
export function dismiss(el, moveFocus = true) {
    if (el.hidden) return;
    if (moveFocus && el.contains(document.activeElement))
        focusAfter(el)?.focus();
    stop(el);
    timers.delete(el);
    if (open.get(keys.get(el)) === el) open.delete(keys.get(el));
    el.hidden = true;
    const done = () => el.remove();
    Promise.all(el.getAnimations().map((a) => a.finished)).then(done, done);
}

function arm(el, region, ms) {
    if (ms > 0) timers.set(el, { left: ms, ms, id: 0 });
    if (!paused(region)) start(el);
}

// Closes the oldest toasts that time out, until at most MAX are open; never the new one or a focused one
function cap(region, added) {
    const shown = [...toastsOf(region)];
    let extra = shown.length - MAX;
    for (const el of shown) {
        if (extra <= 0) break;
        if (
            el === added ||
            !timers.has(el) ||
            el.contains(document.activeElement)
        )
            continue;
        dismiss(el, false);
        extra--;
    }
}

function wire(root) {
    for (const region of fresh(root, '.wu-toast-region')) {
        const resume = () => toastsOf(region).forEach(start);
        // detail 0: activated from the keyboard, so focus moves on; a pointer click lets it go
        region.addEventListener('click', (e) => {
            const close = e.target.closest('.wu-toast-close');
            if (close) dismiss(close.closest('.wu-toast'), e.detail === 0);
        });
        region.addEventListener('mouseenter', () =>
            toastsOf(region).forEach(stop)
        );
        region.addEventListener('focusin', (e) => {
            if (e.relatedTarget && !region.contains(e.relatedTarget))
                before.set(region, e.relatedTarget);
            toastsOf(region).forEach(stop);
        });
        region.addEventListener('mouseleave', () => {
            if (!region.matches(':focus-within')) resume();
        });
        region.addEventListener('focusout', (e) => {
            if (!region.contains(e.relatedTarget) && !region.matches(':hover'))
                resume();
        });
        for (const el of toastsOf(region))
            arm(el, region, +(el.dataset.duration ?? 5000));
    }
}

export const initToast = (root = document) => wire(root);

// Shows a toast; returns its element. duration 0 keeps it until closed.
// A message and variant already open restart that toast's timer instead of adding another.
export function toast(message, options = {}) {
    const { title, variant, duration = 5000, closeLabel = 'Close' } = options;
    const key = `${variant ?? ''}\n${message}`;
    const same = open.get(key);
    if (same && !same.hidden && (same.isConnected || pending.has(same))) {
        const t = timers.get(same);
        if (t) {
            stop(same);
            t.left = t.ms;
            if (!paused(same.parentElement ?? same)) start(same);
        }
        return same;
    }

    let region = document.querySelector('.wu-toast-region');
    if (!region) {
        region = document.createElement('section');
        region.className = 'wu-toast-region';
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-label', 'Notifications');
        document.body.append(region);
    }
    wire(region);

    const el = document.createElement('div');
    el.className = variant ? `wu-toast ${variant}` : 'wu-toast';
    const part = (tag, className, text) => {
        const node = el.appendChild(document.createElement(tag));
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    };
    if (title) part('p', 'wu-toast-title', title);
    part('p', '', message);
    const close = part('button', 'wu-toast-close');
    close.type = 'button';
    close.setAttribute('aria-label', closeLabel);
    keys.set(el, key);
    open.set(key, el);
    pending.add(el);

    // Next task, so a region added just now is known to screen readers first
    setTimeout(() => {
        pending.delete(el);
        if (open.get(key) !== el) return;
        region.append(el);
        arm(el, region, duration);
        cap(region, el);
    }, 50);
    return el;
}
