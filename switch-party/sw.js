const CACHE = 'switch-party-v6';
const CORE = ['./', './index.html', './styles.css', './games.js', './app.js', './manifest.json', './icons/placeholder.svg', './icons/app-icon-192.png', './icons/app-icon-512.png'];
self.addEventListener('install', event => {event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate', event => {event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('switch-party-') && k !== CACHE).map(k => caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch', event => {if(event.request.method !== 'GET' || !event.request.url.startsWith(self.registration.scope))return;event.respondWith(fetch(event.request).then(response => {if(response.ok){let copy=response.clone();caches.open(CACHE).then(cache => cache.put(event.request,copy))}return response}).catch(()=>caches.match(event.request)))});
