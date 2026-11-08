// Tables: data table sorting (sets aria-sort and announces the order), selection column and expandable rows
import { animated, fresh, idOf } from './util.js';

const statuses = new WeakMap();
// Polite live region after the table, added once so the first announcement is heard
const statusOf = (table) => {
    let status = statuses.get(table);
    if (!status?.isConnected) {
        status = document.createElement('div');
        status.className = 'wu-data-table-status';
        status.setAttribute('role', 'status');
        table.after(status);
        statuses.set(table, status);
    }
    return status;
};

const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
});
const valueOf = (row, i) => {
    const cell = row.cells[i];
    return cell ? (cell.dataset.sortValue ?? cell.textContent.trim()) : '';
};
const numberOf = (v) => {
    const n = v.replace(/[\s,]/g, '');
    return n && isFinite(n) ? +n : NaN;
};

export function sortTable(table, th) {
    const body = table.tBodies[0];
    if (!body) return;
    const i = th.cellIndex;
    const dir = th.getAttribute('aria-sort') === 'ascending' ? -1 : 1;
    for (const h of th.parentElement.cells)
        if (h !== th) h.removeAttribute('aria-sort');
    const order = dir > 0 ? 'ascending' : 'descending';
    th.setAttribute('aria-sort', order);
    statusOf(table).textContent =
        `Sorted by ${th.textContent.trim()}, ${order}`;

    // A detail row moves with the row before it
    const rows = [...body.rows]
        .filter((r) => !r.classList.contains('wu-table-detail'))
        .sort((a, b) => {
            const x = valueOf(a, i);
            const y = valueOf(b, i);
            const d = numberOf(x) - numberOf(y);
            return dir * (isNaN(d) ? collator.compare(x, y) : d);
        })
        .flatMap((r) => {
            const next = r.nextElementSibling;
            return next?.classList.contains('wu-table-detail')
                ? [r, next]
                : [r];
        });
    const update = () => body.append(...rows);

    if (!document.startViewTransition || !animated(table, 'wu-data-table'))
        return update();
    table.setAttribute('aria-busy', 'true');
    document
        .startViewTransition(update)
        .finished.finally(() => table.removeAttribute('aria-busy'));
}

export function initDataTable(root = document) {
    for (const table of fresh(root, '.wu-data-table')) {
        statusOf(table);
        table.addEventListener('click', (e) => {
            const th = e.target.closest('.wu-table-sort')?.closest('th');
            if (th && th.closest('table') === table && th.closest('thead'))
                sortTable(table, th);
        });
    }
}

// Selection column: row checkboxes in .wu-table-select cells, select-all in the header
const tables = new WeakSet();
const selectBox = '.wu-table-select input[type="checkbox"]';
const allBoxOf = (table) => table.querySelector(`:scope > thead ${selectBox}`);
const rowBoxesOf = (table) =>
    [...table.tBodies]
        .flatMap((body) => [...body.rows])
        .map((row) => row.querySelector(`:scope > ${selectBox}`))
        .filter(Boolean);

// Select-all is checked, mixed or clear; rows of a role="grid" table also get aria-selected
function syncSelection(table) {
    const boxes = rowBoxesOf(table);
    const on = boxes.filter((b) => b.checked).length;
    const all = allBoxOf(table);
    if (all) {
        all.checked = on > 0 && on === boxes.length;
        all.indeterminate = on > 0 && on < boxes.length;
    }
    if (/^(tree)?grid$/.test(table.getAttribute('role') ?? ''))
        for (const b of boxes)
            b.closest('tr').setAttribute('aria-selected', b.checked);
}

// Expandable row: the button's aria-controls row, else the next row, when it is a .wu-table-detail
function setExpanded(button, open) {
    const id = button.getAttribute('aria-controls');
    const row = id
        ? document.getElementById(id)
        : button.closest('tr')?.nextElementSibling;
    if (!row?.classList.contains('wu-table-detail')) return;
    button.setAttribute('aria-controls', idOf(row, 'wu-detail'));
    button.setAttribute('aria-expanded', open);
    row.hidden = !open;
}

export function initTable(root = document) {
    const found = [...root.querySelectorAll('.wu-table')];
    if (root.matches?.('.wu-table')) found.unshift(root);
    for (const table of found) {
        if (tables.has(table)) continue;
        tables.add(table);
        const own = (el) => el?.closest('table') === table;
        syncSelection(table);
        for (const b of table.querySelectorAll('.wu-table-expand'))
            if (own(b))
                setExpanded(b, b.getAttribute('aria-expanded') === 'true');

        table.addEventListener('change', (e) => {
            const box = e.target.closest?.(selectBox);
            if (!own(box)) return;
            if (box === allBoxOf(table))
                for (const b of rowBoxesOf(table))
                    if (!b.disabled) b.checked = box.checked;
            syncSelection(table);
        });
        table.addEventListener('click', (e) => {
            const b = e.target.closest?.('.wu-table-expand');
            if (own(b))
                setExpanded(b, b.getAttribute('aria-expanded') !== 'true');
        });
    }
}
