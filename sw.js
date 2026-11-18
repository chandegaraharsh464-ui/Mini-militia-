const CACHE_NAME = 'doodle-outpost-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './manifest.json',
  './sounds/w1_shield.mp3',
  './sounds/w2_uzi.mp3',
  './sounds/w3_deagle.mp3',
  './sounds/w4_sniper.mp3',
  './sounds/w5_chainsaw.mp3',
  './sounds/w6_shotgun.mp3',
  './sounds/w7_rocket.mp3',
  './sounds/w8_ammo_crate.mp3',
  './sounds/w9_gear_crate.mp3',
  './sounds/w10_medkit.mp3'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request)));
});
