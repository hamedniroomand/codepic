import { mount } from 'svelte';

import App from './App.svelte';
import { parseShareHash } from './lib/share/share-url';

import './styles/app.css';

const target = document.getElementById('app');
if (!target) throw new Error('Mount target #app is missing from index.html');

const shared = await parseShareHash(location.hash);

export default mount(App, { target, props: { shared } });
