import { mount } from 'svelte';
import { registerSW } from 'virtual:pwa-register';

import App from './App.svelte';
import { loadAppearance } from './lib/persistence/persistence';
import { resolveBoot } from './lib/share/boot';
import { parseShareHash } from './lib/share/share-url';

import './styles/app.css';

registerSW({ immediate: true });

const target = document.getElementById('app');
if (!target) throw new Error('Mount target #app is missing from index.html');

const shared = await parseShareHash(location.hash);
const boot = resolveBoot(shared, location.search, loadAppearance());

export default mount(App, { target, props: { boot } });
