import { t } from 'svelte-i18n';
import { get } from 'svelte/store';

export const i18n = () => get(t);
