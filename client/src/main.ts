import { createApp } from 'vue';
import './main.css';
import App from './App.vue';
import { initStore } from './save-data.ts';

initStore().then(() => createApp(App).mount('#root'));
