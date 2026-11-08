// Input clear button: .wu-input-clear inside .wu-input-affix shows while the field has text, clears it and refocuses
import { fresh } from './util.js';

export function initInputClear(root = document) {
    for (const button of fresh(root, '.wu-input-clear')) {
        const input = button
            .closest('.wu-input-affix')
            ?.querySelector('input, textarea');
        if (!input) continue;

        const sync = () => {
            button.hidden = !input.value || input.disabled || input.readOnly;
        };
        button.addEventListener('click', () => {
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            sync();
            input.focus();
        });
        input.addEventListener('input', sync);
        input.form?.addEventListener('reset', () => setTimeout(sync));
        sync();
    }
}
