// Tabs: WAI-ARIA tabs pattern, roving tabindex, automatic activation
import { fresh, idOf } from './util.js';

const usable = (tab) =>
    !tab.disabled && tab.getAttribute('aria-disabled') !== 'true';

export function initTabs(root = document) {
    for (const tabs of fresh(root, '.wu-tabs')) {
        const list = tabs.querySelector(':scope > .wu-tabs-list');
        if (!list) continue;
        const all = [...list.querySelectorAll(':scope > .wu-tabs-tab')];
        const panels = [...tabs.querySelectorAll(':scope > .wu-tabs-panel')];
        const panelOf = (tab) =>
            document.getElementById(tab.getAttribute('aria-controls'));

        list.setAttribute('role', 'tablist');
        if (tabs.classList.contains('vertical'))
            list.setAttribute('aria-orientation', 'vertical');
        all.forEach((tab, i) => {
            const panel = panelOf(tab) || panels[i];
            tab.setAttribute('role', 'tab');
            if (!panel) return;
            tab.setAttribute('aria-controls', idOf(panel, 'wu-panel'));
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', idOf(tab, 'wu-tab'));
            if (!panel.hasAttribute('tabindex')) panel.tabIndex = 0;
        });

        const select = (tab, focus) => {
            for (const t of all) {
                const on = t === tab;
                t.setAttribute('aria-selected', on);
                t.tabIndex = on ? 0 : -1;
                const panel = panelOf(t);
                if (panel) panel.hidden = !on;
            }
            if (focus) tab.focus();
        };
        const first =
            all.find((t) => t.getAttribute('aria-selected') === 'true') ||
            all.find(usable);
        if (first) select(first);

        list.addEventListener('click', (e) => {
            const tab = e.target.closest('.wu-tabs-tab');
            if (all.includes(tab) && usable(tab)) select(tab);
        });

        list.addEventListener('keydown', (e) => {
            const items = all.filter(usable);
            const i = items.indexOf(e.target);
            if (i < 0) return;
            const vertical =
                list.getAttribute('aria-orientation') === 'vertical';
            const back = getComputedStyle(list).direction === 'rtl' ? 1 : -1;
            const prev = items.at((i - 1) % items.length);
            const after = items.at((i + 1) % items.length);
            const next = {
                ...(vertical
                    ? { ArrowUp: prev, ArrowDown: after }
                    : {
                          ArrowLeft: items.at((i + back) % items.length),
                          ArrowRight: items.at((i - back) % items.length),
                      }),
                Home: items[0],
                End: items.at(-1),
            }[e.key];
            if (!next) return;
            e.preventDefault();
            select(next, true);
        });
    }
}
