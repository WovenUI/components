// @wovenui/components scripts: finds kit components by class and starts them.
// init(root) starts components added later; each element starts only once.
import { initAutocomplete } from './autocomplete.js';
import { initDataTable, initTable, sortTable } from './data-table.js';
import { initInputClear } from './input-clear.js';
import { initTabs } from './tabs.js';
import { dismiss, initToast, toast } from './toast.js';

export function init(root = document) {
    initTabs(root);
    initToast(root);
    initAutocomplete(root);
    initTable(root);
    initDataTable(root);
    initInputClear(root);
}

export {
    dismiss,
    initAutocomplete,
    initDataTable,
    initInputClear,
    initTable,
    initTabs,
    initToast,
    sortTable,
    toast,
};

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', () => init());
    else init();
}
