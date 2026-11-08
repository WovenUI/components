// Autocomplete: WAI-ARIA combobox with a listbox, filters the options in the markup
import { fresh, idOf } from './util.js';

export function initAutocomplete(root = document) {
    for (const box of fresh(root, '.wu-autocomplete')) {
        const input = box.querySelector('input');
        const list = box.querySelector('.wu-autocomplete-list');
        if (!input || !list) continue;
        const empty = box.querySelector('.wu-autocomplete-empty');
        const options = [...list.querySelectorAll('.wu-autocomplete-option')];
        let active = null;

        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('aria-controls', idOf(list, 'wu-listbox'));
        input.autocomplete = 'off';
        list.setAttribute('role', 'listbox');
        for (const o of options) {
            o.setAttribute('role', 'option');
            idOf(o, 'wu-option');
        }

        const shown = () =>
            options.filter(
                (o) => !o.hidden && o.getAttribute('aria-disabled') !== 'true'
            );
        const setActive = (o) => {
            active?.removeAttribute('aria-selected');
            active = o;
            if (o) {
                o.setAttribute('aria-selected', 'true');
                input.setAttribute('aria-activedescendant', o.id);
                o.scrollIntoView({ block: 'nearest' });
            } else input.removeAttribute('aria-activedescendant');
        };
        const open = (on) => {
            const count = shown().length;
            list.hidden = !on || !count;
            if (empty) empty.hidden = !on || count > 0;
            input.setAttribute('aria-expanded', !list.hidden);
            setActive(null);
        };
        const filter = () => {
            const q = input.value.trim().toLowerCase();
            for (const o of options)
                o.hidden = !o.textContent.toLowerCase().includes(q);
            open(true);
        };
        const choose = (o) => {
            input.value = o.textContent.trim();
            open(false);
            input.dispatchEvent(new Event('change', { bubbles: true }));
        };
        const move = (step) => {
            if (list.hidden) filter();
            const items = shown();
            if (!items.length) return;
            const i = items.indexOf(active);
            const n = items.length;
            setActive(
                items[i < 0 ? (step > 0 ? 0 : n - 1) : (i + step + n) % n]
            );
        };

        open(false);
        input.addEventListener('input', filter);
        input.addEventListener('blur', () => open(false));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                move(e.key === 'ArrowDown' ? 1 : -1);
            } else if (e.key === 'Enter' && active) {
                choose(active);
            } else if (e.key === 'Escape') {
                if (list.hidden && (!empty || empty.hidden)) input.value = '';
                open(false);
            } else return;
            e.preventDefault();
        });
        // Keep focus in the input while picking with the pointer
        list.addEventListener('mousedown', (e) => e.preventDefault());
        list.addEventListener('click', (e) => {
            const o = e.target.closest('.wu-autocomplete-option');
            if (o && o.getAttribute('aria-disabled') !== 'true') choose(o);
        });
    }
}
