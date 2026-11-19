/* ==========================================================================
   DOODLE OUTPOST — 10 ANALYZED MAPS, 9 CHARACTERS, 10 WEAPONS, 3 GRENADES & FX
   ========================================================================== */

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// ==========================================================================
// 1. TRANSPARENT SPRITE LOADER (STRIPS PURE WHITE BACKGROUNDS)
// ==========================================================================
function loadTransparentSprite(src, onReady) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const data = g.getImageData(0, 0, c.width, c.height);
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 238 && d[i + 1] > 238 && d[i + 2] > 238) {
        d[i + 3] = 0;
      }
    }
    g.putImageData(data, 0, 0);
    onReady(c);
  };
  img.src = src;
}

// ==========================================================================
// 2. 9 CHARACTERS, 10 WEAPONS, 3 GRENADES & VISUAL EFFECT SPRITES
// ==========================================================================
const CHARACTERS = [
  { id: 0, name: 'Desert Medic',  file: './assets/char1.png' },
  { id: 1, name: 'Stealth Wing',  file: './assets/char2.png' },
  { id: 2, name: 'Vanguard',      file: './assets/char3.png' },
  { id: 3, name: 'Recon Sniper',  file: './assets/char4.png' },
  { id: 4, name: 'Snow Trooper',  file: './assets/char5.png' },
  { id: 5, name: 'Night Ops',     file: './assets/char6.png' },
  { id: 6, name: 'Iron Beard',    file: './assets/char7.png' },
  { id: 7, name: 'Red Bandana',   file: './assets/char8.png' },
  { id: 8, name: 'Riot Shielder', file: './assets/char9.png' }
];

const WEAPONS = [
  { id: 0, name: 'RIOT SHIELD',  file: './assets/weap1.png',  sound: './sounds/w1_shield.mp3',     rate: 140, speed: 0,  damage: 18, spread: 0,    count: 1, color: '#38bdf8', type: 'shield' },
  { id: 1, name: 'DUAL UZIS',    file: './assets/weap2.png',  sound: './sounds/w2_uzi.mp3',        rate: 85,  speed: 18, damage: 13, spread: 0.09, count: 2, color: '#facc15', type: 'bullet' },
  { id: 2, name: 'DESERT EAGLE', file: './assets/weap3.png',  sound: './sounds/w3_deagle.mp3',     rate: 250, speed: 22, damage: 35, spread: 0.02, count: 1, color: '#fde047', type: 'bullet' },
  { id: 3, name: 'SNIPER RIFLE', file: './assets/weap4.png',  sound: './sounds/w4_sniper.mp3',     rate: 620, speed: 34, damage: 85, spread: 0.00, count: 1, color: '#38bdf8', type: 'sniper' },
  { id: 4, name: 'CHAINSAW',     file: './assets/weap5.png',  sound: './sounds/w5_chainsaw.mp3',   rate: 120, speed: 0,  damage: 25, spread: 0,    count: 1, color: '#ef4444', type: 'melee'  },
  { id: 5, name: 'SHOTGUN',      file: './assets/weap6.png',  sound: './sounds/w6_shotgun.mp3',    rate: 500, speed: 17, damage: 16, spread: 0.24, count: 6, color: '#fef08a', type: 'bullet' },
  { id: 6, name: 'ROCKET RPG',   file: './assets/weap7.png',  sound: './sounds/w7_rocket.mp3',     rate: 820, speed: 14, damage: 95, spread: 0.02, count: 1, color: '#fb923c', type: 'rocket' },
  { id: 7, name: 'AMMO CRATE',   file: './assets/weap8.png',  sound: './sounds/w8_ammo_crate.mp3', rate: 320, speed: 16, damage: 28, spread: 0.14, count: 3, color: '#bef264', type: 'bullet' },
  { id: 8, name: 'GEAR CRATE',   file: './assets/weap9.png',  sound: './sounds/w9_gear_crate.mp3', rate: 750, speed: 12, damage: 90, spread: 0.04, count: 1, color: '#f97316', type: 'rocket' },
  { id: 9, name: 'MEDKIT BOX',   file: './assets/weap10.png', sound: './sounds/w10_medkit.mp3',    rate: 600, speed: 0,  damage: 0,  spread: 0,    count: 1, color: '#22c55e', type: 'heal'   }
];

const GRENADE_TYPES = [
  { id: 0, label: 'FRAG',  name: 'FRAG GRENADE',  file: './assets/grenade_frag.png' },
  { id: 1, label: 'GAS',   name: 'GREEN GAS',     file: './assets/grenade_gas.png' },
  { id: 2, label: 'SMOKE', name: 'SMOKE SCREEN',  file: './assets/grenade_smoke.png' }
];

const FX_FILES = {
  smokeWhite: './assets/fx_smoke_white.png',
  smokeGreen: './assets/fx_smoke_green.png',
  explosion:  './assets/fx_explosion.png',
  sparks:     './assets/fx_sparks.png',
  fire:       './assets/fx_fire.png',
  dust:       './assets/fx_dust.png',
  muzzle:     './assets/fx_muzzle.png'
};

const PROP_FILES = {
  bunker:    './assets/prop_bunker.png',
  tower:     './assets/prop_tower.png',
  crate:     './assets/prop_crate.png',
  door:      './assets/prop_door.png',
  sandbag:   './assets/prop_sandbag.png',
  catwalk:   './assets/prop_catwalk.png',
  pipes:     './assets/prop_pipes.png',
  container: './assets/prop_container.png',
  cave:      './assets/prop_cave.png'
};

const SPRITES = { chars: [], weapons: [], grenades: [], fx: {}, props: {} };

CHARACTERS.forEach((ch, idx) => loadTransparentSprite(ch.file, (c) => { SPRITES.chars[idx] = c; }));
WEAPONS.forEach((wp, idx) => loadTransparentSprite(wp.file, (c) => { SPRITES.weapons[idx] = c; }));
GRENADE_TYPES.forEach((gr, idx) => loadTransparentSprite(gr.file, (c) => { SPRITES.grenades[idx] = c; }));
Object.entries(FX_FILES).forEach(([k, src]) => loadTransparentSprite(src, (c) => { SPRITES.fx[k] = c; }));
Object.entries(PROP_FILES).forEach(([k, src]) => loadTransparentSprite(src, (c) => { SPRITES.props[k] = c; }));

// ==========================================================================
// 3. ANALYZED MAP CONFIGURATIONS (PLATFORMS, SPAWNS & PROPS PER MAP)
// ==========================================================================
const WORLD = { width: 2400, height: 1200 };
const BORDER_PLATFORMS = [
  { x: 0, y: 0, w: 2400, h: 30 },
  { x: 0, y: 1160, w: 2400, h: 40 },
  { x: 0, y: 0, w: 30, h: 1200 },
  { x: 2370, y: 0, w: 30, h: 1200 }
];

const MAPS = [
  {
    id: 0, name: 'Desert Outpost', file: './assets/map1.png',
    // Analyzed from 1000204456.png: Upper left bunker roof, right bunker roof, central trench wooden deck & desert floor
    platforms: [
      { x: 180, y: 495, w: 940, h: 26 },   // Left Bunker Roof
      { x: 1760, y: 475, w: 580, h: 26 },  // Right Command Bunker Roof
      { x: 840, y: 785, w: 710, h: 24 },   // Center Trench Wooden Deck
      { x: 1560, y: 745, w: 520, h: 24 },  // Right Trench Wooden Bridge
      { x: 30, y: 980, w: 2340, h: 40 }    // Desert Canyon Floor
    ],
    props: [
      { kind: 'sandbag', x: 320, y: 455, w: 120, h: 42 },
      { kind: 'crate',   x: 920, y: 735, w: 68, h: 52 },
      { kind: 'tower',   x: 2080, y: 265, w: 150, h: 210 }
    ],
    spawns: [{ x: 350, y: 420 }, { x: 1950, y: 400 }, { x: 1150, y: 710 }, { x: 600, y: 900 }, { x: 1800, y: 900 }, { x: 1200, y: 900 }]
  },
  {
    id: 1, name: 'Underground Bunker', file: './assets/map2.png',
    // Analyzed from 1000204457.png: Upper-left command deck, upper-right catwalk, center grated bridge & concrete floor
    platforms: [
      { x: 120, y: 585, w: 1180, h: 26 },  // Left Upper Command Deck
      { x: 1520, y: 445, w: 620, h: 22 },  // Top-Right Metal Catwalk
      { x: 1620, y: 635, w: 680, h: 26 },  // Mid-Right Bunker Deck
      { x: 810, y: 830, w: 840, h: 24 },   // Center Grated Catwalk
      { x: 30, y: 1030, w: 2340, h: 40 }   // Underground Floor
    ],
    props: [
      { kind: 'door',    x: 720, y: 445, w: 130, h: 140 },
      { kind: 'pipes',   x: 1950, y: 255, w: 120, h: 190 },
      { kind: 'crate',   x: 420, y: 535, w: 68, h: 52 }
    ],
    spawns: [{ x: 350, y: 510 }, { x: 1820, y: 370 }, { x: 1180, y: 750 }, { x: 450, y: 950 }, { x: 1950, y: 950 }, { x: 1200, y: 950 }]
  },
  {
    id: 2, name: 'Abandoned Scrapyard', file: './assets/map3.png',
    // Analyzed from 1000204455.png: Left hangar & brick roof, center scaffolding, right brick building & wooden walkway
    platforms: [
      { x: 60, y: 530, w: 580, h: 26 },    // Left Brick Building Roof
      { x: 860, y: 555, w: 540, h: 22 },   // Center Steel Scaffolding
      { x: 1760, y: 525, w: 580, h: 26 },  // Right Brick Building & Walkway
      { x: 1060, y: 815, w: 560, h: 24 },  // Lower Wooden Loading Deck
      { x: 30, y: 1020, w: 2340, h: 40 }   // Scrapyard Dirt Yard
    ],
    props: [
      { kind: 'container', x: 220, y: 420, w: 180, h: 110 },
      { kind: 'catwalk',   x: 1120, y: 755, w: 180, h: 65 },
      { kind: 'crate',     x: 1880, y: 475, w: 68, h: 52 }
    ],
    spawns: [{ x: 300, y: 450 }, { x: 1120, y: 480 }, { x: 2020, y: 450 }, { x: 700, y: 940 }, { x: 1650, y: 940 }, { x: 1250, y: 740 }]
  },
  {
    id: 3, name: 'Jungle River Camp', file: './assets/map4.png',
    // Analyzed from 1000204452.png: Left stilt huts, center rope bridge, right watchtower ridge & lower river dock
    platforms: [
      { x: 180, y: 575, w: 420, h: 24 },   // Left Stilt Hut Deck
      { x: 640, y: 455, w: 420, h: 24 },   // Upper-Left Hut Deck
      { x: 1060, y: 475, w: 360, h: 20 },  // Center Suspension Rope Bridge
      { x: 1420, y: 445, w: 820, h: 26 },  // Right Watchtower & Camp Ridge
      { x: 1360, y: 735, w: 640, h: 24 },  // Mid-Right River Hut Deck
      { x: 30, y: 940, w: 2340, h: 40 }    // Jungle Trail & River Bank
    ],
    props: [
      { kind: 'tower',   x: 1440, y: 235, w: 140, h: 210 },
      { kind: 'sandbag', x: 1580, y: 405, w: 120, h: 42 },
      { kind: 'crate',   x: 340, y: 525, w: 68, h: 52 }
    ],
    spawns: [{ x: 360, y: 500 }, { x: 840, y: 380 }, { x: 1850, y: 370 }, { x: 1650, y: 660 }, { x: 750, y: 860 }, { x: 1250, y: 860 }]
  },
  {
    id: 4, name: 'Catacombs Mine', file: './assets/map5.png',
    // Analyzed from 1000204454.png: Left cavern ledge, center suspension bridge, right mine shack ledge & cavern floor
    platforms: [
      { x: 60, y: 545, w: 860, h: 26 },    // Left Cavern Shack Ledge
      { x: 920, y: 435, w: 640, h: 20 },   // Center Cavern Rope Bridge
      { x: 1560, y: 425, w: 440, h: 26 },  // Upper-Right Mine Shack
      { x: 1860, y: 615, w: 480, h: 26 },  // Mid-Right Cavern Ledge
      { x: 30, y: 990, w: 2340, h: 40 }    // Underground Mine Track Floor
    ],
    props: [
      { kind: 'cave',  x: 1080, y: 810, w: 220, h: 180 },
      { kind: 'crate', x: 260, y: 495, w: 68, h: 52 },
      { kind: 'pipes', x: 2050, y: 435, w: 110, h: 180 }
    ],
    spawns: [{ x: 350, y: 470 }, { x: 1220, y: 360 }, { x: 1760, y: 350 }, { x: 550, y: 910 }, { x: 1850, y: 910 }, { x: 1200, y: 910 }]
  },
  {
    id: 5, name: 'Arctic Snow Base', file: './assets/map6.png',
    // Analyzed from 1000204453.png: Upper radar bunker roof, mid snow barracks, left cliff steel bridge & snow field
    platforms: [
      { x: 1520, y: 345, w: 680, h: 26 },  // Upper Radar Station Roof
      { x: 420, y: 515, w: 880, h: 26 },   // Mid-Left Snow Barracks
      { x: 1880, y: 615, w: 460, h: 26 },  // Right Snow Bunker Roof
      { x: 480, y: 745, w: 780, h: 24 },   // Left Cliff Steel Bridge
      { x: 30, y: 980, w: 2340, h: 40 }    // Snow Base Ground
    ],
    props: [
      { kind: 'bunker',  x: 1620, y: 205, w: 160, h: 140 },
      { kind: 'sandbag', x: 1920, y: 575, w: 120, h: 42 },
      { kind: 'crate',   x: 680, y: 465, w: 68, h: 52 }
    ],
    spawns: [{ x: 1820, y: 270 }, { x: 750, y: 440 }, { x: 2080, y: 540 }, { x: 820, y: 670 }, { x: 1550, y: 900 }, { x: 1200, y: 900 }]
  },
  {
    id: 6, name: 'Reactor Core', file: './assets/map7.png',
    // Analyzed from 1000204451.png: Left & right upper turbine decks, center grated bridge over deep reactor pit
    platforms: [
      { x: 60, y: 545, w: 940, h: 26 },    // Left Turbine Deck
      { x: 1120, y: 455, w: 1180, h: 26 }, // Back & Right Upper Turbine Deck
      { x: 960, y: 775, w: 780, h: 22 },   // Center Grated Reactor Bridge
      { x: 60, y: 895, w: 660, h: 26 },    // Lower-Left Platform
      { x: 1680, y: 885, w: 660, h: 26 },  // Lower-Right Platform
      { x: 30, y: 1120, w: 2340, h: 40 }   // Bottom Reactor Floor
    ],
    props: [
      { kind: 'pipes',   x: 240, y: 355, w: 120, h: 190 },
      { kind: 'catwalk', x: 1220, y: 715, w: 180, h: 65 },
      { kind: 'door',    x: 2140, y: 495, w: 120, h: 140 }
    ],
    spawns: [{ x: 450, y: 470 }, { x: 1650, y: 380 }, { x: 1320, y: 700 }, { x: 350, y: 820 }, { x: 1950, y: 810 }, { x: 1200, y: 1040 }]
  },
  {
    id: 7, name: 'Bio-Hazard Lab', file: './assets/map8.png',
    // Analyzed from 1000204449.png: Upper U-shaped laboratory balcony & center metal bridge over toxic water pit
    platforms: [
      { x: 60, y: 555, w: 840, h: 26 },    // Left Cryo-Computer Balcony
      { x: 680, y: 445, w: 1040, h: 24 },  // Back Lab Control Walkway
      { x: 1520, y: 555, w: 820, h: 26 },  // Right Cryo-Tank Balcony
      { x: 420, y: 835, w: 1560, h: 24 },  // Center Grated Bridge Over Pit
      { x: 30, y: 1120, w: 2340, h: 40 }   // Lower Lab Floor
    ],
    props: [
      { kind: 'door',  x: 980, y: 315, w: 120, h: 130 },
      { kind: 'crate', x: 240, y: 505, w: 68, h: 52 },
      { kind: 'pipes', x: 2150, y: 365, w: 110, h: 190 }
    ],
    spawns: [{ x: 420, y: 480 }, { x: 1180, y: 370 }, { x: 1920, y: 480 }, { x: 1180, y: 760 }, { x: 550, y: 1040 }, { x: 1850, y: 1040 }]
  },
  {
    id: 8, name: 'Mountain Helipad', file: './assets/map9.png',
    // Analyzed from 1000204450.png: Top command tent ridge, central helipad rock, left bunker & wooden cliff bridge
    platforms: [
      { x: 1320, y: 365, w: 720, h: 26 },  // Top Command Tent Ridge
      { x: 960, y: 485, w: 460, h: 24 },   // Mid-Upper Bunker Ledge
      { x: 1280, y: 635, w: 480, h: 26 },  // Helipad Landing Pad
      { x: 340, y: 695, w: 640, h: 26 },   // Left Outpost Bunker Deck
      { x: 940, y: 755, w: 760, h: 22 },   // Wooden Cliff Bridge
      { x: 30, y: 1030, w: 2340, h: 40 }   // Lower Mountain Trail
    ],
    props: [
      { kind: 'bunker',  x: 420, y: 555, w: 160, h: 140 },
      { kind: 'sandbag', x: 640, y: 655, w: 120, h: 42 },
      { kind: 'crate',   x: 1520, y: 315, w: 68, h: 52 }
    ],
    spawns: [{ x: 1650, y: 290 }, { x: 1500, y: 560 }, { x: 620, y: 620 }, { x: 1280, y: 680 }, { x: 750, y: 950 }, { x: 1850, y: 950 }]
  },
  {
    id: 9, name: 'Maximum Prison', file: './assets/map10.png',
    // Analyzed from 1000204448.png: 3-tier left cellblock walkways, right cellblock balcony, guard towers & yard
    platforms: [
      { x: 60, y: 465, w: 1040, h: 22 },   // Left Cellblock Top Tier
      { x: 60, y: 635, w: 1040, h: 22 },   // Left Cellblock Middle Tier
      { x: 1720, y: 495, w: 620, h: 24 },  // Right Guardhouse Roof
      { x: 1940, y: 685, w: 420, h: 22 },  // Right Cellblock Catwalk
      { x: 30, y: 990, w: 2340, h: 40 }    // Prison Courtyard Ground
    ],
    props: [
      { kind: 'tower',   x: 960, y: 255, w: 130, h: 210 },
      { kind: 'tower',   x: 1920, y: 285, w: 130, h: 210 },
      { kind: 'sandbag', x: 1180, y: 950, w: 130, h: 42 }
    ],
    spawns: [{ x: 450, y: 390 }, { x: 450, y: 560 }, { x: 2020, y: 420 }, { x: 2120, y: 610 }, { x: 850, y: 910 }, { x: 1550, y: 910 }]
  }
];

const MAP_IMAGES = MAPS.map((m) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = m.file;
  return img;
});

function getActivePlatforms() {
  const m = MAPS[state.mapId] || MAPS[0];
  return BORDER_PLATFORMS.concat(m.platforms);
}

// ==========================================================================
// 4. PER-WEAPON AUDIO POOL
// ==========================================================================
const weaponAudios = WEAPONS.map((wp) => {
  const a = new Audio(wp.sound);
  a.preload = 'auto';
  return a;
});

function playWeaponSound(shooter, weaponIdx) {
  const baseAudio = weaponAudios[weaponIdx];
  const me = state.players[state.myId];
  if (!baseAudio) return;

  let volume = 1.0;
  if (me && shooter && shooter.id !== me.id) {
    const dist = Math.hypot(shooter.x - me.x, shooter.y - me.y);
    volume = Math.max(0, Math.min(1, 1 - dist / 1150));
  }
  if (volume <= 0.02) return;

  const clip = baseAudio.cloneNode();
  clip.volume = volume;
  clip.play().catch(() => {});
}

// ==========================================================================
// 5. STATE, PROXIMITY VOICE CHAT & PEERJS MULTIPLAYER
// ==========================================================================
const MAX_PLAYERS = 6;
const state = {
  mode: 'menu',
  isHost: true,
  roomCode: '',
  mapId: 0,
  myId: 'p_' + Math.random().toString(36).substring(2, 7),
  myName: localStorage.getItem('do_name') || 'Soldier_' + Math.floor(100 + Math.random() * 899),
  myCharId: parseInt(localStorage.getItem('do_char') || '0', 10),
  myGrenadeType: 0,
  players: {},
  bullets: [],
  grenades: [],
  clouds: [], // { x, y, r, life, kind: 'gas'|'smoke', ownerId }
  fxList: [], // Visual sprite explosions, sparks, fire, dust
  killFeed: [],
  matchTime: 300,
  sniperZoom: false,
  camera: { x: 1180, y: 550, zoom: 1 }
};

const voiceChat = { enabled: false, stream: null, audioCtx: null, peerGains: {} };
const MAX_VOICE_DISTANCE = 650;

let peer = null;
let connections = {};
let hostConn = null;
let lastFrameTime = 0;

// Build 9 Character Cards & 10 Weapon Buttons
const charGridEl = document.getElementById('characterGrid');
CHARACTERS.forEach((ch) => {
  const card = document.createElement('div');
  card.className = 'char-card' + (ch.id === state.myCharId ? ' selected' : '');
  card.innerHTML = `<img src="${ch.file}" alt="${ch.name}" /><div class="char-name">${ch.name}</div>`;
  card.onclick = () => {
    state.myCharId = ch.id;
    localStorage.setItem('do_char', String(ch.id));
    document.querySelectorAll('.char-card').forEach((el, i) => el.classList.toggle('selected', i === ch.id));
    if (state.players[state.myId]) {
      state.players[state.myId].charId = ch.id;
      if (state.isHost) broadcastToClients({ type: 'lobby_sync', players: state.players, mapId: state.mapId });
    }
  };
  charGridEl.appendChild(card);
});

const weaponBarEl = document.getElementById('weaponSelectorBar');
WEAPONS.forEach((wp) => {
  const btn = document.createElement('button');
  btn.className = 'w-slot' + (wp.id === 1 ? ' active' : '');
  btn.dataset.w = String(wp.id);
  btn.innerHTML = `<img src="${wp.file}" alt="${wp.name}" /><span>${wp.id + 1}.${wp.name.split(' ')[0]}</span>`;
  btn.onclick = () => selectWeapon(wp.id);
  weaponBarEl.appendChild(btn);
});

const mapSelectEl = document.getElementById('mapSelect');
mapSelectEl.onchange = (e) => {
  state.mapId = parseInt(e.target.value, 10) || 0;
  if (state.isHost) broadcastToClients({ type: 'lobby_sync', players: state.players, mapId: state.mapId });
};

const nameInput = document.getElementById('playerNameInput');
nameInput.value = state.myName;
nameInput.addEventListener('input', () => {
  state.myName = nameInput.value.trim() || 'Soldier';
  localStorage.setItem('do_name', state.myName);
});

function getSavedFriends() { return JSON.parse(localStorage.getItem('do_friends') || '[]'); }
function saveFriend(id, name) {
  const list = getSavedFriends();
  if (!list.some((f) => f.name === name)) {
    list.push({ id, name });
    localStorage.setItem('do_friends', JSON.stringify(list));
    renderSavedFriends();
  }
}
function renderSavedFriends() {
  const list = getSavedFriends();
  document.getElementById('savedFriendsList').textContent = list.length ? list.map((f) => f.name).join(', ') : 'None yet';
}
renderSavedFriends();

function formatClock(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const r = (s % 60).toString().padStart(2, '0');
  return `${m}:${r}`;
}
function updateLobbyTimerLabel() { document.getElementById('lobbyTimerDisplay').textContent = formatClock(state.matchTime); }
updateLobbyTimerLabel();

document.getElementById('lobbyTimePlus').onclick = () => { state.matchTime = Math.min(3600, state.matchTime + 60); updateLobbyTimerLabel(); };
document.getElementById('lobbyTimeMinus').onclick = () => { state.matchTime = Math.max(30, state.matchTime - 60); updateLobbyTimerLabel(); };

function adjustLiveTimer(deltaSeconds) {
  if (state.isHost) state.matchTime = Math.max(10, Math.min(3600, state.matchTime + deltaSeconds));
  else if (hostConn && hostConn.open) hostConn.send({ type: 'adjust_time', delta: deltaSeconds });
}
document.getElementById('timePlusBtn').onclick = () => adjustLiveTimer(30);
document.getElementById('timeMinusBtn').onclick = () => adjustLiveTimer(-30);

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('room')) document.getElementById('roomCodeInput').value = urlParams.get('room').toUpperCase();

document.getElementById('installAppBtn').onclick = () => document.getElementById('installModal').classList.remove('hidden');
document.getElementById('closeInstallModal').onclick = () => document.getElementById('installModal').classList.add('hidden');

// Proximity Voice Controls
async function toggleProximityMic() {
  const btn = document.getElementById('toggleMicBtn');
  if (!voiceChat.enabled) {
    try {
      if (!voiceChat.stream) {
        voiceChat.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (peer) {
          Object.keys(connections).forEach((remoteId) => attachVoiceCall(peer.call(remoteId, voiceChat.stream)));
          if (!state.isHost && hostConn && hostConn.peer) attachVoiceCall(peer.call(hostConn.peer, voiceChat.stream));
        }
      }
      voiceChat.stream.getAudioTracks().forEach((t) => { t.enabled = true; });
      voiceChat.enabled = true;
      btn.textContent = '🎙️ MIC: ON';
    } catch (err) {
      alert('Microphone permission is required for voice chat.');
    }
  } else {
    if (voiceChat.stream) voiceChat.stream.getAudioTracks().forEach((t) => { t.enabled = false; });
    voiceChat.enabled = false;
    btn.textContent = '🎙️ MIC: OFF';
  }
}

function attachVoiceCall(call) {
  if (!call) return;
  call.on('stream', (remoteStream) => {
    if (!voiceChat.audioCtx) voiceChat.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = voiceChat.audioCtx.createMediaStreamSource(remoteStream);
    const gainNode = voiceChat.audioCtx.createGain();
    gainNode.gain.value = 1.0;
    const audioEl = new Audio();
    audioEl.srcObject = remoteStream; audioEl.autoplay = true; audioEl.muted = true;
    source.connect(gainNode);
    gainNode.connect(voiceChat.audioCtx.destination);
    voiceChat.peerGains[call.peer] = gainNode;
  });
}

function bindIncomingVoiceCalls() {
  if (!peer) return;
  peer.on('call', (call) => {
    call.answer(voiceChat.stream || undefined);
    attachVoiceCall(call);
  });
}

function updateProximityVoiceVolumes() {
  const me = state.players[state.myId];
  if (!me) return;
  Object.entries(voiceChat.peerGains).forEach(([peerId, gainNode]) => {
    const other = state.players[peerId];
    if (!other || other.hp <= 0) { gainNode.gain.value = 0; return; }
    const dist = Math.hypot(other.x - me.x, other.y - me.y);
    gainNode.gain.value = Math.max(0, Math.min(1, 1 - dist / MAX_VOICE_DISTANCE));
  });
}
document.getElementById('toggleMicBtn').onclick = toggleProximityMic;

function createPlayer(id, name, charId, isBot = false, spawnIdx = 0) {
  const activeMap = MAPS[state.mapId] || MAPS[0];
  const sp = activeMap.spawns[spawnIdx % activeMap.spawns.length];
  return {
    id, name, charId, isBot,
    x: sp.x, y: sp.y,
    vx: 0, vy: 0,
    facing: 1, aimAngle: 0,
    hp: 100, maxHp: 100,
    weaponIdx: 1,
    kills: 0, deaths: 0,
    jetpacking: false,
    lastShot: 0, lastGrenade: 0,
    deadTimer: 0, aiTimer: 0, aiDir: 1
  };
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

document.getElementById('createRoomBtn').onclick = () => {
  state.isHost = true;
  state.roomCode = generateRoomCode();
  document.getElementById('connectionStatus').textContent = 'Creating Room...';

  peer = new Peer('DOODLE_OUTPOST_' + state.roomCode);
  bindIncomingVoiceCalls();
  peer.on('open', () => {
    state.players = {};
    state.players[state.myId] = createPlayer(state.myId, state.myName, state.myCharId, false, 0);
    document.getElementById('waitingRoom').classList.remove('hidden');
    document.getElementById('displayRoomCode').textContent = state.roomCode;
    document.getElementById('connectionStatus').textContent = 'Room Ready! Share code with up to 5 friends.';
    updateLobbyPlayersUI();
  });

  peer.on('connection', (conn) => {
    conn.on('data', (msg) => handleHostReceive(conn, msg));
    conn.on('close', () => {
      if (conn.playerId && state.players[conn.playerId]) {
        delete state.players[conn.playerId];
        delete connections[conn.playerId];
        updateLobbyPlayersUI();
        broadcastToClients({ type: 'lobby_sync', players: state.players, mapId: state.mapId });
      }
    });
  });
};

document.getElementById('joinRoomBtn').onclick = () => {
  const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
  if (code.length !== 4) return;
  state.isHost = false;
  state.roomCode = code;
  document.getElementById('connectionStatus').textContent = 'Joining room ' + code + '...';

  peer = new Peer();
  bindIncomingVoiceCalls();
  peer.on('open', () => {
    hostConn = peer.connect('DOODLE_OUTPOST_' + code, { reliable: false });
    hostConn.on('open', () => {
      document.getElementById('connectionStatus').textContent = 'Joined! Waiting for Host to start...';
      hostConn.send({ type: 'join', id: state.myId, name: state.myName, charId: state.myCharId });
      if (voiceChat.stream) attachVoiceCall(peer.call(hostConn.peer, voiceChat.stream));
    });
    hostConn.on('data', (msg) => handleClientReceive(msg));
  });
};

document.getElementById('soloBotsBtn').onclick = () => {
  state.isHost = true;
  state.roomCode = 'BOTS';
  state.players = {};
  state.players[state.myId] = createPlayer(state.myId, state.myName, state.myCharId, false, 0);
  addBotsUpTo(MAX_PLAYERS);
  startMatch();
};

function addBotsUpTo(limit) {
  const botNames = ['Sgt. Viper', 'Ghost_Ops', 'Major Boom', 'SniperWolf', 'Cpl. Tank'];
  let idx = Object.keys(state.players).length;
  let b = 0;
  while (idx < limit) {
    const bid = 'bot_' + idx;
    state.players[bid] = createPlayer(bid, botNames[b % botNames.length], (idx + 1) % CHARACTERS.length, true, idx);
    idx++; b++;
  }
}

function updateLobbyPlayersUI() {
  const playersArr = Object.values(state.players);
  document.getElementById('roomCountBadge').textContent = `${playersArr.length} / ${MAX_PLAYERS} Players`;
  const listEl = document.getElementById('lobbyPlayersList');
  listEl.innerHTML = '';
  playersArr.forEach((p) => {
    const chip = document.createElement('div');
    chip.className = 'player-chip';
    const chName = CHARACTERS[p.charId]?.name || 'Soldier';
    chip.textContent = `🪖 ${p.name} (${chName}) ${p.id === state.myId ? '(You)' : ''}`;
    listEl.appendChild(chip);
  });
}

document.getElementById('copyLinkBtn').onclick = () => {
  const url = `${location.origin}${location.pathname}?room=${state.roomCode}`;
  navigator.clipboard.writeText(url);
  document.getElementById('copyLinkBtn').textContent = '✅ Copied';
  setTimeout(() => (document.getElementById('copyLinkBtn').textContent = '📋 Copy Link'), 1800);
};

document.getElementById('whatsappShareBtn').onclick = () => {
  const url = `${location.origin}${location.pathname}?room=${state.roomCode}`;
  const text = `Join my Doodle Outpost match! Code: *${state.roomCode}* — ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

document.getElementById('startMatchBtn').onclick = () => {
  if (document.getElementById('fillBotsCheck').checked) addBotsUpTo(MAX_PLAYERS);
  // Re-align spawn points to the chosen map
  Object.values(state.players).forEach((p, idx) => {
    const sp = (MAPS[state.mapId] || MAPS[0]).spawns[idx % 6];
    p.x = sp.x; p.y = sp.y;
  });
  broadcastToClients({ type: 'start', players: state.players, roomCode: state.roomCode, matchTime: state.matchTime, mapId: state.mapId });
  startMatch();
};

function handleHostReceive(conn, msg) {
  if (msg.type === 'join') {
    const count = Object.keys(state.players).length;
    if (count >= MAX_PLAYERS) return;
    conn.playerId = msg.id;
    connections[msg.id] = conn;
    state.players[msg.id] = createPlayer(msg.id, msg.name, msg.charId, false, count);
    if (voiceChat.stream) attachVoiceCall(peer.call(conn.peer, voiceChat.stream));
    updateLobbyPlayersUI();
    broadcastToClients({ type: 'lobby_sync', players: state.players, mapId: state.mapId });
    if (state.mode === 'playing') {
      conn.send({ type: 'start', players: state.players, roomCode: state.roomCode, matchTime: state.matchTime, mapId: state.mapId });
    }
  } else if (msg.type === 'input') {
    const p = state.players[msg.id];
    if (p) {
      p.remoteInput = msg.input;
      if (typeof msg.weaponIdx === 'number') p.weaponIdx = msg.weaponIdx;
      if (msg.throwGrenade) spawnGrenade(p, msg.grenadeType ?? 0);
    }
  } else if (msg.type === 'adjust_time') {
    state.matchTime = Math.max(10, Math.min(3600, state.matchTime + msg.delta));
  }
}

function handleClientReceive(msg) {
  if (msg.type === 'lobby_sync') {
    state.players = msg.players;
    state.mapId = msg.mapId || 0;
    mapSelectEl.value = String(state.mapId);
    document.getElementById('waitingRoom').classList.remove('hidden');
    document.getElementById('displayRoomCode').textContent = state.roomCode;
    document.getElementById('startMatchBtn').classList.add('hidden');
    updateLobbyPlayersUI();
  } else if (msg.type === 'start') {
    state.players = msg.players;
    state.roomCode = msg.roomCode;
    state.matchTime = msg.matchTime;
    state.mapId = msg.mapId || 0;
    startMatch();
  } else if (msg.type === 'state') {
    state.players = msg.players;
    state.bullets = msg.bullets;
    state.grenades = msg.grenades;
    state.clouds = msg.clouds;
    state.fxList = msg.fxList;
    state.killFeed = msg.killFeed;
    state.matchTime = msg.matchTime;
    state.mapId = msg.mapId || 0;
  }
}

function broadcastToClients(payload) {
  Object.values(connections).forEach((c) => { if (c.open) c.send(payload); });
}

// ==========================================================================
// 6. INPUTS (PC KEYBOARD/MOUSE + MOBILE DUAL JOYSTICKS & GRENADE SELECTOR)
// ==========================================================================
const input = { moveX: 0, moveY: 0, aimX: 1, aimY: 0, shooting: false };
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (state.mode !== 'playing') return;
  if (e.code === 'Digit1') selectWeapon(0);
  if (e.code === 'Digit2') selectWeapon(1);
  if (e.code === 'Digit3') selectWeapon(2);
  if (e.code === 'Digit4') selectWeapon(3);
  if (e.code === 'Digit5') selectWeapon(4);
  if (e.code === 'Digit6') selectWeapon(5);
  if (e.code === 'Digit7') selectWeapon(6);
  if (e.code === 'Digit8') selectWeapon(7);
  if (e.code === 'Digit9') selectWeapon(8);
  if (e.code === 'Digit0') selectWeapon(9);
  if (e.code === 'KeyQ') cycleWeapon();
  if (e.code === 'KeyF') cycleGrenadeType();
  if (e.code === 'KeyG' || e.code === 'KeyE') triggerGrenade();
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') state.sniperZoom = !state.sniperZoom;
  if (e.code === 'Tab') { e.preventDefault(); toggleScoreboard(); }
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

window.addEventListener('mousemove', (e) => {
  if (state.mode !== 'playing') return;
  const dx = e.clientX - canvas.width / 2;
  const dy = e.clientY - canvas.height / 2;
  const len = Math.hypot(dx, dy) || 1;
  input.aimX = dx / len;
  input.aimY = dy / len;
});

window.addEventListener('mousedown', (e) => {
  if (state.mode !== 'playing' || e.target.tagName === 'BUTTON') return;
  if (e.button === 0) input.shooting = true;
  if (e.button === 2) triggerGrenade();
});
window.addEventListener('mouseup', (e) => { if (e.button === 0) input.shooting = false; });
window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('wheel', () => { if (state.mode === 'playing') cycleWeapon(); });

function bindVirtualStick(zoneId, knobId, onMove, onRelease) {
  const zone = document.getElementById(zoneId);
  const knob = document.getElementById(knobId);
  let activeId = null;

  zone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    activeId = t.identifier;
    handleTouch(t);
  }, { passive: false });

  zone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeId) handleTouch(e.changedTouches[i]);
    }
  }, { passive: false });

  const endTouch = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeId) {
        activeId = null;
        knob.style.transform = 'translate(0px, 0px)';
        onRelease();
      }
    }
  };
  zone.addEventListener('touchend', endTouch);
  zone.addEventListener('touchcancel', endTouch);

  function handleTouch(t) {
    const rect = zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = 40;
    let dx = t.clientX - cx;
    let dy = t.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    onMove(dx / maxR, dy / maxR);
  }
}

bindVirtualStick('leftStickZone', 'leftKnob', (nx, ny) => { input.moveX = nx; input.moveY = ny; }, () => { input.moveX = 0; input.moveY = 0; });
bindVirtualStick('rightStickZone', 'rightKnob', (nx, ny) => {
  const len = Math.hypot(nx, ny);
  if (len > 0.15) { input.aimX = nx / len; input.aimY = ny / len; input.shooting = len > 0.35; }
}, () => { input.shooting = false; });

document.getElementById('btnSwap').onclick = cycleWeapon;
document.getElementById('btnGrenade').onclick = triggerGrenade;
document.getElementById('btnGrenadeType').onclick = cycleGrenadeType;
document.getElementById('btnZoom').onclick = () => { state.sniperZoom = !state.sniperZoom; };
document.getElementById('toggleScoreboardBtn').onclick = toggleScoreboard;
document.getElementById('closeSbBtn').onclick = toggleScoreboard;
document.getElementById('leaveMatchBtn').onclick = () => location.reload();

function selectWeapon(idx) {
  const me = state.players[state.myId];
  if (!me) return;
  me.weaponIdx = idx;
  document.querySelectorAll('.w-slot').forEach((b) => b.classList.toggle('active', parseInt(b.dataset.w) === idx));
  document.getElementById('hudWeaponName').textContent = WEAPONS[idx].name;
  if (!state.isHost && hostConn && hostConn.open) {
    hostConn.send({ type: 'input', id: state.myId, input, weaponIdx: idx });
  }
}

function cycleWeapon() {
  const me = state.players[state.myId];
  if (me) selectWeapon((me.weaponIdx + 1) % WEAPONS.length);
}

function cycleGrenadeType() {
  state.myGrenadeType = (state.myGrenadeType + 1) % GRENADE_TYPES.length;
  const gInfo = GRENADE_TYPES[state.myGrenadeType];
  document.getElementById('btnGrenadeType').innerHTML = `${gInfo.label}<small>TYPE</small>`;
}

function triggerGrenade() {
  const me = state.players[state.myId];
  if (!me || me.hp <= 0) return;
  if (state.isHost) spawnGrenade(me, state.myGrenadeType);
  else if (hostConn && hostConn.open) {
    hostConn.send({ type: 'input', id: state.myId, input, throwGrenade: true, grenadeType: state.myGrenadeType });
  }
}

function toggleScoreboard() {
  const sb = document.getElementById('scoreboardModal');
  sb.classList.toggle('hidden');
  if (!sb.classList.contains('hidden')) renderScoreboard();
}

function renderScoreboard() {
  document.getElementById('hudRoomCode').textContent = state.roomCode;
  const rows = document.getElementById('scoreboardRows');
  rows.innerHTML = '';
  Object.values(state.players).sort((a, b) => b.kills - a.kills).forEach((p) => {
    const div = document.createElement('div');
    div.className = 'sb-row';
    const canAdd = p.id !== state.myId && !p.isBot;
    const cName = CHARACTERS[p.charId]?.name || 'Soldier';
    div.innerHTML = `
      <span>🪖 ${p.name} <small>(${cName})</small></span>
      <span>Kills: <b>${p.kills}</b> | Deaths: ${p.deaths}</span>
      ${canAdd ? `<button class="btn-sm" onclick="saveFriend('${p.id}','${p.name}');this.textContent='⭐ Saved'">+ Friend</button>` : ''}
    `;
    rows.appendChild(div);
  });
}

// ==========================================================================
// 7. SIMULATION, 3 GRENADE TYPES & SPRITE EFFECTS ENGINE
// ==========================================================================
function addFxSprite(fxKey, x, y, size, life) {
  state.fxList.push({ fxKey, x, y, size, life, maxLife: life });
}

function startMatch() {
  state.mode = 'playing';
  document.getElementById('lobbyScreen').classList.add('hidden');
  document.getElementById('gameContainer').classList.remove('hidden');
  const myChar = CHARACTERS[state.myCharId] || CHARACTERS[0];
  document.getElementById('hudAvatarImg').src = myChar.file;
  document.getElementById('hudCharRole').textContent = myChar.name.toUpperCase();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function updateKeyboardInput() {
  let kx = 0, ky = 0;
  if (keys['KeyA'] || keys['ArrowLeft']) kx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) kx += 1;
  if (keys['KeyW'] || keys['ArrowUp'] || keys['Space']) ky -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) ky += 1;
  if (kx !== 0 || ky !== 0) { input.moveX = kx; input.moveY = ky; }
  else if (!('ontouchstart' in window)) { input.moveX = 0; input.moveY = 0; }
}

function gameLoop(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;
  updateKeyboardInput();

  if (state.isHost) {
    stepHostSimulation(dt, now);
    broadcastToClients({
      type: 'state', players: state.players, bullets: state.bullets,
      grenades: state.grenades, clouds: state.clouds, fxList: state.fxList,
      killFeed: state.killFeed, matchTime: state.matchTime, mapId: state.mapId
    });
  } else if (hostConn && hostConn.open) {
    hostConn.send({ type: 'input', id: state.myId, input });
  }

  updateProximityVoiceVolumes();
  updateCamera();
  renderGame();
  updateHudUI();
  requestAnimationFrame(gameLoop);
}

function stepHostSimulation(dt, now) {
  state.matchTime = Math.max(0, state.matchTime - dt);
  const platforms = getActivePlatforms();
  const activeMap = MAPS[state.mapId] || MAPS[0];

  Object.values(state.players).forEach((p, idx) => {
    if (p.hp <= 0) {
      p.deadTimer -= dt;
      if (p.deadTimer <= 0) {
        const sp = activeMap.spawns[(idx + Math.floor(Math.random() * 6)) % activeMap.spawns.length];
        p.x = sp.x; p.y = sp.y; p.vx = 0; p.vy = 0; p.hp = 100;
      }
      return;
    }

    let ctrl = input;
    if (p.isBot) ctrl = computeBotAI(p, dt);
    else if (p.id !== state.myId) ctrl = p.remoteInput || { moveX: 0, moveY: 0, aimX: 1, aimY: 0, shooting: false };

    p.vx = ctrl.moveX * 350;
    if (ctrl.moveY < -0.22) {
      p.vy += ctrl.moveY * 1450 * dt;
      p.vy = Math.max(p.vy, -460);
      p.jetpacking = true;
      if (Math.random() < 0.35) {
        addFxSprite('fire', p.x - p.facing * 14, p.y + 24, 34, 0.18);
      }
    } else {
      p.jetpacking = false;
      p.vy = Math.min(p.vy + 980 * dt, 680);
    }

    p.aimAngle = Math.atan2(ctrl.aimY, ctrl.aimX);
    p.facing = Math.cos(p.aimAngle) >= 0 ? 1 : -1;
    moveAndCollide(p, dt, platforms);

    if (ctrl.shooting) fireWeapon(p, now);
  });

  // Bullets & Rockets
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    b.x += b.vx; b.y += b.vy; b.life -= dt;

    const hitWall = platforms.some((pl) => b.x > pl.x && b.x < pl.x + pl.w && b.y > pl.y && b.y < pl.y + pl.h);
    let hitPlayer = null;

    for (const p of Object.values(state.players)) {
      if (p.id !== b.ownerId && p.hp > 0 && Math.abs(b.x - p.x) < 24 && Math.abs(b.y - p.y) < 32) {
        const activeW = WEAPONS[p.weaponIdx];
        const bulletFromFront = Math.cos(p.aimAngle) * b.vx < 0;
        if (activeW && activeW.type === 'shield' && bulletFromFront) {
          addFxSprite('sparks', b.x, b.y, 44, 0.22);
          hitPlayer = 'BLOCKED';
        } else {
          hitPlayer = p;
        }
        break;
      }
    }

    if (hitWall || hitPlayer || b.life <= 0) {
      if (b.type === 'rocket') {
        explodeBlast(b.x, b.y, b.ownerId, 135, 95, 'ROCKET RPG');
      } else if (hitPlayer && hitPlayer !== 'BLOCKED') {
        addFxSprite('sparks', b.x, b.y, 38, 0.2);
        damagePlayer(hitPlayer, b.damage, b.ownerId, b.weaponName);
      } else if (hitWall) {
        addFxSprite('dust', b.x, b.y, 34, 0.22);
      }
      state.bullets.splice(i, 1);
    }
  }

  // 3 Grenade Types: 0 = Frag Explosion, 1 = Green Toxic Gas, 2 = Tactical White Smoke Screen
  for (let i = state.grenades.length - 1; i >= 0; i--) {
    const g = state.grenades[i];
    g.vy += 850 * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.fuse -= dt;
    for (const pl of platforms) {
      if (g.x > pl.x && g.x < pl.x + pl.w && g.y > pl.y && g.y < pl.y + pl.h) {
        g.vy *= -0.45; g.vx *= 0.7; g.y = pl.y - 4;
      }
    }
    if (g.fuse <= 0) {
      if (g.gType === 0) {
        explodeBlast(g.x, g.y, g.ownerId, 150, 100, 'FRAG GRENADE');
      } else if (g.gType === 1) {
        state.clouds.push({ x: g.x, y: g.y, r: 135, life: 7.0, kind: 'gas', ownerId: g.ownerId });
      } else {
        state.clouds.push({ x: g.x, y: g.y, r: 165, life: 9.0, kind: 'smoke', ownerId: g.ownerId });
      }
      state.grenades.splice(i, 1);
    }
  }

  // Gas & Smoke Clouds
  for (let i = state.clouds.length - 1; i >= 0; i--) {
    const cl = state.clouds[i];
    cl.life -= dt;
    if (cl.kind === 'gas') {
      Object.values(state.players).forEach((p) => {
        if (p.hp > 0 && Math.hypot(p.x - cl.x, p.y - cl.y) < cl.r) {
          damagePlayer(p, 28 * dt, cl.ownerId, 'GREEN GAS');
        }
      });
    }
    if (cl.life <= 0) state.clouds.splice(i, 1);
  }

  // Update Visual Effect Timers
  for (let i = state.fxList.length - 1; i >= 0; i--) {
    state.fxList[i].life -= dt;
    if (state.fxList[i].life <= 0) state.fxList.splice(i, 1);
  }
}

function moveAndCollide(p, dt, platforms) {
  const hw = 18, hh = 30;
  p.x += p.vx * dt;
  for (const pl of platforms) {
    if (p.x + hw > pl.x && p.x - hw < pl.x + pl.w && p.y + hh > pl.y && p.y - hh < pl.y + pl.h) {
      p.x = p.vx > 0 ? pl.x - hw : pl.x + pl.w + hw;
    }
  }
  p.y += p.vy * dt;
  for (const pl of platforms) {
    if (p.x + hw > pl.x && p.x - hw < pl.x + pl.w && p.y + hh > pl.y && p.y - hh < pl.y + pl.h) {
      if (p.vy > 0) { p.y = pl.y - hh; p.vy = 0; }
      else if (p.vy < 0) { p.y = pl.y + pl.h + hh; p.vy = 0; }
    }
  }
}

function fireWeapon(p, now) {
  const w = WEAPONS[p.weaponIdx];
  if (now - p.lastShot < w.rate) return;
  p.lastShot = now;
  playWeaponSound(p, p.weaponIdx);

  if (w.type === 'heal') {
    p.hp = Math.min(p.maxHp, p.hp + 35);
    addFxSprite('sparks', p.x, p.y, 64, 0.35);
    return;
  }

  if (w.type === 'shield' || w.type === 'melee') {
    const rx = p.x + Math.cos(p.aimAngle) * 40;
    const ry = p.y + Math.sin(p.aimAngle) * 40;
    if (w.type === 'melee') addFxSprite('sparks', rx, ry, 42, 0.16);
    Object.values(state.players).forEach((t) => {
      if (t.id !== p.id && t.hp > 0 && Math.hypot(t.x - rx, t.y - ry) < 42) {
        damagePlayer(t, w.damage, p.id, w.name);
      }
    });
    return;
  }

  const mx = p.x + Math.cos(p.aimAngle) * 30;
  const my = p.y + Math.sin(p.aimAngle) * 30;
  addFxSprite('muzzle', mx, my, 36, 0.12);

  for (let i = 0; i < w.count; i++) {
    const offset = w.count === 2 ? (i === 0 ? -5 : 5) : 0;
    const ang = p.aimAngle + (Math.random() - 0.5) * w.spread;
    state.bullets.push({
      x: mx, y: my + offset,
      vx: Math.cos(ang) * w.speed,
      vy: Math.sin(ang) * w.speed,
      damage: w.damage,
      ownerId: p.id,
      weaponName: w.name,
      color: w.color,
      type: w.type,
      life: 1.8
    });
  }
}

function spawnGrenade(p, gType = 0) {
  const now = performance.now();
  if (now - p.lastGrenade < 420) return;
  p.lastGrenade = now;
  state.grenades.push({
    x: p.x + p.facing * 20, y: p.y - 8,
    vx: Math.cos(p.aimAngle) * 560, vy: Math.sin(p.aimAngle) * 560 - 140,
    fuse: 1.5, gType, ownerId: p.id
  });
}

function explodeBlast(x, y, ownerId, radius, maxDmg, label) {
  addFxSprite('explosion', x, y, radius * 1.45, 0.45);
  addFxSprite('dust', x, y + 18, radius * 1.3, 0.55);
  Object.values(state.players).forEach((p) => {
    if (p.hp > 0) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < radius) damagePlayer(p, Math.round(maxDmg * (1 - d / radius)), ownerId, label);
    }
  });
}

function damagePlayer(target, amount, attackerId, weaponName) {
  if (target.hp <= 0) return;
  target.hp -= amount;
  if (target.hp <= 0) {
    target.hp = 0; target.deaths += 1; target.deadTimer = 3.0;
    addFxSprite('explosion', target.x, target.y, 110, 0.4);
    const attacker = state.players[attackerId];
    if (attacker && attacker.id !== target.id) {
      attacker.kills += 1;
      state.killFeed.unshift(`${attacker.name} [${weaponName}] ${target.name}`);
      if (state.killFeed.length > 4) state.killFeed.pop();
    }
  }
}

function computeBotAI(bot, dt) {
  bot.aiTimer -= dt;
  if (bot.aiTimer <= 0) {
    bot.aiTimer = 0.8 + Math.random() * 1.1;
    bot.aiDir = Math.random() < 0.5 ? -1 : 1;
    if (Math.random() < 0.25) bot.weaponIdx = 1 + Math.floor(Math.random() * 7);
  }
  let nearest = null, bestDist = 9999;
  Object.values(state.players).forEach((o) => {
    if (o.id !== bot.id && o.hp > 0) {
      const d = Math.hypot(o.x - bot.x, o.y - bot.y);
      if (d < bestDist) { bestDist = d; nearest = o; }
    }
  });
  if (!nearest) return { moveX: 0, moveY: 0, aimX: 1, aimY: 0, shooting: false };
  const dx = nearest.x - bot.x, dy = nearest.y - bot.y, dist = Math.hypot(dx, dy) || 1;
  return {
    moveX: dist > 250 ? Math.sign(dx) * 0.75 : bot.aiDir * 0.6,
    moveY: dy < -60 || bot.y > 950 ? -0.8 : 0,
    aimX: dx / dist, aimY: dy / dist, shooting: dist < 650
  };
}

// ==========================================================================
// 8. CAMERA & MULTI-MAP / PROPS / GRENADE / FX RENDERING
// ==========================================================================
function updateCamera() {
  const me = state.players[state.myId];
  if (!me) return;
  const targetZoom = state.sniperZoom ? 0.68 : (canvas.width < 750 ? 0.82 : 1.0);
  state.camera.zoom += (targetZoom - state.camera.zoom) * 0.1;
  state.camera.x += (me.x - state.camera.x) * 0.15;
  state.camera.y += (me.y - state.camera.y) * 0.15;
}

function renderGame() {
  ctx.fillStyle = '#141815';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-state.camera.x, -state.camera.y);

  // 1. Draw Selected Map Image
  const activeMap = MAPS[state.mapId] || MAPS[0];
  const mapImg = MAP_IMAGES[state.mapId];
  if (mapImg && mapImg.complete && mapImg.naturalWidth > 0) {
    ctx.drawImage(mapImg, 0, 0, WORLD.width, WORLD.height);
  } else {
    ctx.fillStyle = '#242b25';
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    ctx.fillStyle = '#57534e';
    activeMap.platforms.forEach((pl) => ctx.fillRect(pl.x, pl.y, pl.w, pl.h));
  }

  // 2. Draw Map-Specific Props (Bunkers, Watchtowers, Crates, Sandbags, Pipes, Containers)
  (activeMap.props || []).forEach((pr) => {
    const pSprite = SPRITES.props[pr.kind];
    if (pSprite) ctx.drawImage(pSprite, pr.x, pr.y, pr.w, pr.h);
  });

  // 3. Draw Soldiers & Equipped Weapons
  Object.values(state.players).forEach((p) => {
    if (p.hp <= 0) return;
    drawCharacterAndWeapon(p);
  });

  // 4. Draw Thrown Grenades (Frag / Green Gas / Smoke Canister)
  for (const g of state.grenades) {
    const gSprite = SPRITES.grenades[g.gType];
    if (gSprite) {
      ctx.drawImage(gSprite, g.x - 12, g.y - 14, 24, 28);
    } else {
      ctx.fillStyle = g.gType === 1 ? '#22c55e' : g.gType === 2 ? '#cbd5e1' : '#4b5563';
      ctx.beginPath(); ctx.arc(g.x, g.y, 7, 0, Math.PI * 2); ctx.fill();
    }
  }

  // 5. Draw Bullets & Rockets
  for (const b of state.bullets) {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.type === 'rocket' ? 8 : 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Draw Green Toxic Gas Clouds & White Tactical Smoke Screens
  for (const cl of state.clouds) {
    const cSprite = cl.kind === 'gas' ? SPRITES.fx.smokeGreen : SPRITES.fx.smokeWhite;
    ctx.save();
    ctx.globalAlpha = Math.min(0.92, cl.life * 0.45);
    if (cSprite) {
      ctx.drawImage(cSprite, cl.x - cl.r, cl.y - cl.r * 0.85, cl.r * 2, cl.r * 1.6);
    } else {
      ctx.fillStyle = cl.kind === 'gas' ? 'rgba(34,197,94,0.6)' : 'rgba(226,232,240,0.75)';
      ctx.beginPath(); ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // 7. Draw Explosion, Fire, Sparks & Dust FX Sprites
  for (const fx of state.fxList) {
    const fSprite = SPRITES.fx[fx.fxKey];
    if (fSprite) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, fx.life / fx.maxLife);
      ctx.drawImage(fSprite, fx.x - fx.size / 2, fx.y - fx.size / 2, fx.size, fx.size);
      ctx.restore();
    }
  }

  ctx.restore();
}

function drawCharacterAndWeapon(p) {
  ctx.save();
  ctx.translate(p.x, p.y);

  ctx.fillStyle = '#fff';
  ctx.font = '900 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
  ctx.strokeText(p.name, 0, -44);
  ctx.fillText(p.name, 0, -44);

  ctx.fillStyle = '#111';
  ctx.fillRect(-22, -38, 44, 5);
  ctx.fillStyle = p.hp > 35 ? '#22c55e' : '#ef4444';
  ctx.fillRect(-22, -38, 44 * (p.hp / p.maxHp), 5);

  const charImg = SPRITES.chars[p.charId];
  ctx.save();
  ctx.scale(p.facing, 1);
  if (charImg) {
    ctx.drawImage(charImg, -34, -34, 68, 68);
  } else {
    ctx.fillStyle = '#4b633c';
    ctx.fillRect(-16, -26, 32, 54);
  }
  ctx.restore();
  ctx.restore();

  const wImg = SPRITES.weapons[p.weaponIdx];
  if (wImg) {
    ctx.save();
    ctx.translate(p.x, p.y + 4);
    ctx.rotate(p.aimAngle);
    if (p.facing < 0) ctx.scale(1, -1);
    const isShield = p.weaponIdx === 0;
    const drawW = isShield ? 28 : 42;
    const drawH = isShield ? 42 : 26;
    ctx.drawImage(wImg, isShield ? 12 : 4, -drawH / 2, drawW, drawH);
    ctx.restore();
  }
}

function updateHudUI() {
  const me = state.players[state.myId];
  if (!me) return;
  const activeMap = MAPS[state.mapId] || MAPS[0];
  document.getElementById('healthBar').style.width = `${Math.max(0, me.hp)}%`;
  document.getElementById('hpText').textContent = `HP ${Math.ceil(me.hp)}`;
  document.getElementById('matchScore').textContent = `${activeMap.name.toUpperCase()} • KILLS: ${me.kills} • ${Object.keys(state.players).length}/${MAX_PLAYERS}`;
  document.getElementById('matchTimer').textContent = formatClock(state.matchTime);
  document.getElementById('killFeed').innerHTML = state.killFeed.map((item) => `<div class="kill-item">${item}</div>`).join('');
}
