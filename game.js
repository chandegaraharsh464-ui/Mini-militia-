/* ==========================================================================
   DOODLE ARMY: OUTPOST UNLIMITED
   100% Client-Side HTML5 Canvas + PeerJS Cross-Play (PC & Mobile)
   Unlimited Ammo, Unlimited Jetpack Fuel, Unlimited Gas Grenades
   ========================================================================== */

// Register Service Worker for Android & iOS PWA Installation
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Generate Dynamic App Icon for iOS Apple-Touch-Icon & Canvas
function generateSoldierIconDataURL() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#1f2b20';
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = '#a3e635';
  g.lineWidth = 20;
  g.strokeRect(16, 16, 480, 480);

  // Soldier Head & Helmet
  g.fillStyle = '#f1c29b';
  g.beginPath(); g.arc(256, 280, 95, 0, Math.PI * 2); g.fill();
  g.lineWidth = 10; g.strokeStyle = '#111'; g.stroke();

  // Helmet
  g.fillStyle = '#4b633c';
  g.beginPath(); g.arc(256, 250, 110, Math.PI, 0); g.fill(); g.stroke();

  // Tactical Goggles
  g.fillStyle = '#1e293b';
  g.fillRect(175, 235, 162, 52);
  g.strokeRect(175, 235, 162, 52);
  g.fillStyle = '#38bdf8';
  g.fillRect(188, 245, 58, 30);
  g.fillRect(266, 245, 58, 30);

  g.fillStyle = '#a3e635';
  g.font = '900 44px sans-serif';
  g.textAlign = 'center';
  g.fillText('OUTPOST ∞', 256, 455);
  return c.toDataURL('image/png');
}
document.getElementById('appleIcon').href = generateSoldierIconDataURL();

// ==========================================================================
// 1. WEAPON DEFINITIONS (ALL UNLIMITED AMMO)
// ==========================================================================
const WEAPONS = [
  { id: 0, name: 'DUAL UZI',     rate: 85,  speed: 17, damage: 13, spread: 0.09, count: 2, color: '#facc15', type: 'bullet' },
  { id: 1, name: 'DESERT EAGLE', rate: 260, speed: 21, damage: 34, spread: 0.02, count: 1, color: '#fde047', type: 'bullet' },
  { id: 2, name: 'SNIPER RIFLE', rate: 650, speed: 32, damage: 85, spread: 0.00, count: 1, color: '#38bdf8', type: 'sniper' },
  { id: 3, name: 'ROCKET RPG',   rate: 850, speed: 13, damage: 95, spread: 0.02, count: 1, color: '#fb923c', type: 'rocket' },
  { id: 4, name: 'SHOTGUN',      rate: 520, speed: 16, damage: 16, spread: 0.24, count: 6, color: '#fef08a', type: 'bullet' },
  { id: 5, name: 'CHAINSAW',     rate: 70,  speed: 0,  damage: 24, spread: 0,    count: 1, color: '#ef4444', type: 'melee'  }
];

// ==========================================================================
// 2. OUTPOST MULTI-LEVEL MAP GEOMETRY (Matches Concept Board)
// ==========================================================================
const WORLD = { width: 2800, height: 1500 };

// Solid platforms, bunker walls, watchtower, and underground cave floor
const PLATFORMS = [
  // Outer Borders
  { x: 0, y: 0, w: 2800, h: 40, type: 'rock' },
  { x: 0, y: 1440, w: 2800, h: 60, type: 'rock' },
  { x: 0, y: 0, w: 40, h: 1500, type: 'rock' },
  { x: 2760, y: 0, w: 40, h: 1500, type: 'rock' },

  // Surface Ground (Left Bunker Hill, Center Field, Right Watchtower Base)
  { x: 40, y: 460, w: 540, h: 45, type: 'ground' },
  { x: 740, y: 460, w: 1280, h: 45, type: 'ground' },
  { x: 2180, y: 460, w: 580, h: 45, type: 'ground' },

  // Left Concrete Bunker Structure
  { x: 140, y: 290, w: 320, h: 30, type: 'metal' },
  { x: 140, y: 290, w: 30, h: 170, type: 'metal' },
  { x: 430, y: 290, w: 30, h: 110, type: 'metal' },

  // Right Sniper Watchtower (Multi-Tier)
  { x: 2240, y: 310, w: 220, h: 20, type: 'wood' },
  { x: 2220, y: 170, w: 260, h: 22, type: 'wood' },
  { x: 2220, y: 95,  w: 260, h: 16, type: 'metal' }, // Tower Roof

  // Underground Bunker Level 1 (Metal Decks)
  { x: 320, y: 760, w: 880, h: 32, type: 'metal' },
  { x: 1360, y: 760, w: 1080, h: 32, type: 'metal' },

  // Underground Bunker Level 2
  { x: 680, y: 1080, w: 720, h: 32, type: 'metal' },
  { x: 1560, y: 1080, w: 940, h: 32, type: 'metal' },

  // Left Stalagmite Cave Ledges
  { x: 120, y: 980, w: 360, h: 36, type: 'rock' },
  { x: 180, y: 1240, w: 440, h: 40, type: 'rock' },

  // Center Ventilation Shaft Walls
  { x: 1180, y: 505, w: 28, h: 255, type: 'metal' },
  { x: 1540, y: 792, w: 28, h: 288, type: 'metal' }
];

// Decorative Crates, Sandbags, Barrels & Ladders
const PROPS = [
  { x: 340, y: 416, w: 44, h: 44, kind: 'crate' },
  { x: 386, y: 416, w: 44, h: 44, kind: 'crate' },
  { x: 362, y: 372, w: 44, h: 44, kind: 'crate' },
  { x: 960, y: 416, w: 44, h: 44, kind: 'crate' },
  { x: 2270, y: 134, w: 70, h: 36, kind: 'sandbag' },
  { x: 520, y: 716, w: 44, h: 44, kind: 'crate' },
  { x: 820, y: 710, w: 34, h: 50, kind: 'barrel' },
  { x: 1750, y: 716, w: 44, h: 44, kind: 'crate' },
  { x: 1796, y: 716, w: 44, h: 44, kind: 'crate' },
  { x: 1120, y: 1030, w: 34, h: 50, kind: 'barrel' },
  { x: 2050, y: 1036, w: 44, h: 44, kind: 'crate' },
  { x: 640, y: 460, w: 36, h: 300, kind: 'ladder' },
  { x: 2100, y: 460, w: 36, h: 300, kind: 'ladder' },
  { x: 1460, y: 760, w: 36, h: 320, kind: 'ladder' }
];

const SPAWN_POINTS = [
  { x: 280, y: 390 },
  { x: 1150, y: 380 },
  { x: 2340, y: 240 },
  { x: 650, y: 690 },
  { x: 1880, y: 690 },
  { x: 1150, y: 1000 }
];

// ==========================================================================
// 3. STATE, FRIENDS STORAGE & PEERJS MULTIPLAYER
// ==========================================================================
const state = {
  mode: 'menu', // 'menu', 'lobby', 'playing'
  isHost: true,
  roomCode: '',
  myId: 'p_' + Math.random().toString(36).substring(2, 8),
  myName: localStorage.getItem('do_name') || 'Soldier_' + Math.floor(100 + Math.random() * 899),
  myColor: localStorage.getItem('do_color') || '#4b633c',
  players: {},
  bullets: [],
  grenades: [],
  gasClouds: [],
  particles: [],
  killFeed: [],
  matchTime: 300,
  sniperZoom: false,
  camera: { x: 0, y: 0, zoom: 1 }
};

let peer = null;
let connections = {}; // peerId -> DataConnection (used by Host)
let hostConn = null;    // used by Client
let gameLoopId = null;
let lastFrameTime = 0;

// UI Elements
const playerNameInput = document.getElementById('playerNameInput');
const helmetColorSelect = document.getElementById('helmetColorSelect');
playerNameInput.value = state.myName;
helmetColorSelect.value = state.myColor;

playerNameInput.addEventListener('input', () => {
  state.myName = playerNameInput.value.trim() || 'Soldier';
  localStorage.setItem('do_name', state.myName);
});
helmetColorSelect.addEventListener('change', () => {
  state.myColor = helmetColorSelect.value;
  localStorage.setItem('do_color', state.myColor);
  document.getElementById('hudAvatar').style.background = state.myColor;
});

// Saved Friends Management
function getSavedFriends() {
  return JSON.parse(localStorage.getItem('do_friends') || '[]');
}
function saveFriend(id, name) {
  const list = getSavedFriends();
  if (!list.some(f => f.name === name)) {
    list.push({ id, name, addedAt: Date.now() });
    localStorage.setItem('do_friends', JSON.stringify(list));
    renderSavedFriends();
  }
}
function renderSavedFriends() {
  const list = getSavedFriends();
  const el = document.getElementById('savedFriendsList');
  el.textContent = list.length ? list.map(f => f.name).join(', ') : 'None yet (add players in match)';
}
renderSavedFriends();

// Auto-fill Room Code from URL Invite Link (?room=XXXX)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('room')) {
  document.getElementById('roomCodeInput').value = urlParams.get('room').toUpperCase();
}

// Install Modal
document.getElementById('installAppBtn').onclick = () => document.getElementById('installModal').classList.remove('hidden');
document.getElementById('closeInstallModal').onclick = () => document.getElementById('installModal').classList.add('hidden');

// ==========================================================================
// 4. PLAYER FACTORY & LOBBY NETWORKING
// ==========================================================================
function createPlayerEntity(id, name, color, isBot = false, spawnIdx = 0) {
  const sp = SPAWN_POINTS[spawnIdx % SPAWN_POINTS.length];
  return {
    id, name, color, isBot,
    x: sp.x, y: sp.y,
    vx: 0, vy: 0,
    facing: 1,
    aimAngle: 0,
    hp: 100,
    maxHp: 100,
    weaponIdx: 0,
    kills: 0,
    deaths: 0,
    jetpacking: false,
    shooting: false,
    lastShot: 0,
    lastGrenade: 0,
    walkFrame: 0,
    deadTimer: 0,
    aiTimer: 0,
    aiDir: 1
  };
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// HOST: Create Room
document.getElementById('createRoomBtn').onclick = () => {
  state.isHost = true;
  state.roomCode = generateRoomCode();
  const peerId = 'DOODLE_OUTPOST_' + state.roomCode;
  document.getElementById('connectionStatus').textContent = 'Creating P2P Room...';

  peer = new Peer(peerId);
  peer.on('open', () => {
    state.players = {};
    state.players[state.myId] = createPlayerEntity(state.myId, state.myName, state.myColor, false, 0);
    document.getElementById('waitingRoom').classList.remove('hidden');
    document.getElementById('displayRoomCode').textContent = state.roomCode;
    document.getElementById('connectionStatus').textContent = 'Room Live! Share Code or Link';
    updateLobbyPlayersUI();
  });

  peer.on('connection', (conn) => {
    conn.on('data', (msg) => handleHostReceive(conn, msg));
    conn.on('close', () => {
      if (conn.playerId && state.players[conn.playerId]) {
        delete state.players[conn.playerId];
        delete connections[conn.playerId];
        updateLobbyPlayersUI();
      }
    });
  });

  peer.on('error', (err) => {
    document.getElementById('connectionStatus').textContent = 'Network note: ' + err.type + ' (Try Solo Bots or retry)';
  });
};

// CLIENT: Join Friend's Room
document.getElementById('joinRoomBtn').onclick = () => {
  const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
  if (code.length !== 4) {
    document.getElementById('connectionStatus').textContent = 'Enter a valid 4-character Room Code!';
    return;
  }
  state.isHost = false;
  state.roomCode = code;
  document.getElementById('connectionStatus').textContent = 'Connecting to ' + code + '...';

  peer = new Peer();
  peer.on('open', () => {
    hostConn = peer.connect('DOODLE_OUTPOST_' + code, { reliable: false });
    hostConn.on('open', () => {
      document.getElementById('connectionStatus').textContent = 'Connected to Squad! Waiting for Host to start...';
      hostConn.send({ type: 'join', id: state.myId, name: state.myName, color: state.myColor });
    });
    hostConn.on('data', (msg) => handleClientReceive(msg));
    hostConn.on('close', () => {
      alert('Host disconnected from match.');
      location.reload();
    });
  });
};

// SOLO VS BOTS (Instant Offline/Practice)
document.getElementById('soloBotsBtn').onclick = () => {
  state.isHost = true;
  state.roomCode = 'SOLO';
  state.players = {};
  state.players[state.myId] = createPlayerEntity(state.myId, state.myName, state.myColor, false, 0);
  spawnBotsUpTo(6);
  startMatch();
};

function spawnBotsUpTo(targetCount) {
  const botNames = ['Sgt. Viper', 'Ghost_Ops', 'Major Boom', 'SniperWolf', 'Cpl. Tank'];
  const botColors = ['#7a4933', '#3c5263', '#363636', '#5c4033', '#3f6212'];
  let idx = Object.keys(state.players).length;
  let b = 0;
  while (idx < targetCount) {
    const bid = 'bot_' + idx;
    state.players[bid] = createPlayerEntity(bid, botNames[b % botNames.length], botColors[b % botColors.length], true, idx);
    idx++; b++;
  }
}

function updateLobbyPlayersUI() {
  const listEl = document.getElementById('lobbyPlayersList');
  listEl.innerHTML = '';
  Object.values(state.players).forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'player-chip';
    chip.textContent = `🪖 ${p.name} ${p.id === state.myId ? '(You)' : ''}`;
    listEl.appendChild(chip);
  });
}

// Share Buttons
document.getElementById('copyLinkBtn').onclick = () => {
  const url = `${location.origin}${location.pathname}?room=${state.roomCode}`;
  navigator.clipboard.writeText(url);
  document.getElementById('copyLinkBtn').textContent = '✅ Copied!';
  setTimeout(() => document.getElementById('copyLinkBtn').textContent = '📋 Copy Invite Link', 2000);
};

document.getElementById('whatsappShareBtn').onclick = () => {
  const url = `${location.origin}${location.pathname}?room=${state.roomCode}`;
  const text = `Join my Doodle Outpost match! Room Code: *${state.roomCode}* — Tap to play on Phone or PC: ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

document.getElementById('startMatchBtn').onclick = () => {
  if (document.getElementById('fillBotsCheck').checked) {
    spawnBotsUpTo(6);
  }
  broadcastToClients({ type: 'start', players: state.players, roomCode: state.roomCode });
  startMatch();
};

function handleHostReceive(conn, msg) {
  if (msg.type === 'join') {
    const count = Object.keys(state.players).length;
    if (count >= 6) return;
    conn.playerId = msg.id;
    connections[msg.id] = conn;
    state.players[msg.id] = createPlayerEntity(msg.id, msg.name, msg.color, false, count);
    updateLobbyPlayersUI();
    broadcastToClients({ type: 'lobby_sync', players: state.players });
    if (state.mode === 'playing') {
      conn.send({ type: 'start', players: state.players, roomCode: state.roomCode });
    }
  } else if (msg.type === 'input') {
    const p = state.players[msg.id];
    if (p) {
      p.remoteInput = msg.input;
      if (typeof msg.weaponIdx === 'number') p.weaponIdx = msg.weaponIdx;
      if (msg.throwGrenade) spawnGrenade(p);
    }
  }
}

function handleClientReceive(msg) {
  if (msg.type === 'lobby_sync') {
    state.players = msg.players;
    document.getElementById('waitingRoom').classList.remove('hidden');
    document.getElementById('displayRoomCode').textContent = state.roomCode;
    document.getElementById('startMatchBtn').classList.add('hidden');
    updateLobbyPlayersUI();
  } else if (msg.type === 'start') {
    state.players = msg.players;
    state.roomCode = msg.roomCode;
    startMatch();
  } else if (msg.type === 'state') {
    state.players = msg.players;
    state.bullets = msg.bullets;
    state.grenades = msg.grenades;
    state.gasClouds = msg.gasClouds;
    state.killFeed = msg.killFeed;
    state.matchTime = msg.matchTime;
  }
}

function broadcastToClients(payload) {
  Object.values(connections).forEach(c => {
    if (c.open) c.send(payload);
  });
}

// ==========================================================================
// 5. INPUTS: PC (KEYBOARD + MOUSE) & MOBILE (DUAL VIRTUAL JOYSTICKS)
// ==========================================================================
const input = {
  moveX: 0,
  moveY: 0,
  aimX: 1,
  aimY: 0,
  shooting: false
};

const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (state.mode !== 'playing') return;
  if (e.code >= 'Digit1' && e.code <= 'Digit6') selectWeapon(parseInt(e.code.replace('Digit', '')) - 1);
  if (e.code === 'KeyQ') cycleWeapon();
  if (e.code === 'KeyG' || e.code === 'KeyE') triggerGrenade();
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') toggleSniperZoom();
  if (e.code === 'Tab') { e.preventDefault(); toggleScoreboard(); }
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

window.addEventListener('mousemove', (e) => {
  if (state.mode !== 'playing') return;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const len = Math.hypot(dx, dy) || 1;
  input.aimX = dx / len;
  input.aimY = dy / len;
});

window.addEventListener('mousedown', (e) => {
  if (state.mode !== 'playing') return;
  if (e.target.tagName === 'BUTTON') return;
  if (e.button === 0) input.shooting = true;
  if (e.button === 2) triggerGrenade();
});
window.addEventListener('mouseup', (e) => { if (e.button === 0) input.shooting = false; });
window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('wheel', (e) => {
  if (state.mode === 'playing') cycleWeapon();
});

// Dual Virtual Joysticks Touch Logic
function bindVirtualStick(zoneId, knobId, onMove, onRelease) {
  const zone = document.getElementById(zoneId);
  const knob = document.getElementById(knobId);
  let activeTouchId = null;

  zone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    activeTouchId = t.identifier;
    handleTouch(t);
  }, { passive: false });

  zone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId) {
        handleTouch(e.changedTouches[i]);
      }
    }
  }, { passive: false });

  const endTouch = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId) {
        activeTouchId = null;
        knob.style.transform = `translate(0px, 0px)`;
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
    const maxR = 42;
    let dx = t.clientX - cx;
    let dy = t.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    onMove(dx / maxR, dy / maxR);
  }
}

bindVirtualStick(
  'leftStickZone', 'leftKnob',
  (nx, ny) => { input.moveX = nx; input.moveY = ny; },
  () => { input.moveX = 0; input.moveY = 0; }
);

bindVirtualStick(
  'rightStickZone', 'rightKnob',
  (nx, ny) => {
    const len = Math.hypot(nx, ny);
    if (len > 0.15) {
      input.aimX = nx / len;
      input.aimY = ny / len;
      input.shooting = len > 0.35; // Auto-fire when pushed past 35%
    }
  },
  () => { input.shooting = false; }
);

// HUD Action Buttons
document.querySelectorAll('.w-slot').forEach(btn => {
  btn.onclick = () => selectWeapon(parseInt(btn.dataset.w));
});
document.getElementById('btnSwap').onclick = cycleWeapon;
document.getElementById('btnGrenade').onclick = triggerGrenade;
document.getElementById('btnZoom').onclick = toggleSniperZoom;
document.getElementById('toggleScoreboardBtn').onclick = toggleScoreboard;
document.getElementById('closeSbBtn').onclick = toggleScoreboard;
document.getElementById('leaveMatchBtn').onclick = () => location.reload();

function selectWeapon(idx) {
  const me = state.players[state.myId];
  if (!me) return;
  me.weaponIdx = idx;
  document.querySelectorAll('.w-slot').forEach((b, i) => b.classList.toggle('active', i === idx));
  document.getElementById('hudWeaponName').textContent = WEAPONS[idx].name;
  if (!state.isHost && hostConn && hostConn.open) {
    hostConn.send({ type: 'input', id: state.myId, input, weaponIdx: idx });
  }
}

function cycleWeapon() {
  const me = state.players[state.myId];
  if (!me) return;
  selectWeapon((me.weaponIdx + 1) % WEAPONS.length);
}

function toggleSniperZoom() {
  state.sniperZoom = !state.sniperZoom;
}

function triggerGrenade() {
  const me = state.players[state.myId];
  if (!me || me.hp <= 0) return;
  if (state.isHost) {
    spawnGrenade(me);
  } else if (hostConn && hostConn.open) {
    hostConn.send({ type: 'input', id: state.myId, input, throwGrenade: true });
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
  Object.values(state.players)
    .sort((a, b) => b.kills - a.kills)
    .forEach(p => {
      const div = document.createElement('div');
      div.className = 'sb-row';
      const canAdd = p.id !== state.myId && !p.isBot;
      div.innerHTML = `
        <span>🪖 ${p.name} ${p.isBot ? '[BOT]' : ''}</span>
        <span>Kills: <b>${p.kills}</b> | Deaths: ${p.deaths}</span>
        ${canAdd ? `<button class="btn-sm" onclick="saveFriend('${p.id}','${p.name}');this.textContent='⭐ Added'">+ Friend</button>` : ''}
      `;
      rows.appendChild(div);
    });
}

// ==========================================================================
// 6. START MATCH & PHYSICS / COMBAT ENGINE
// ==========================================================================
function startMatch() {
  state.mode = 'playing';
  document.getElementById('lobbyScreen').classList.add('hidden');
  document.getElementById('gameContainer').classList.remove('hidden');
  document.getElementById('hudAvatar').style.background = state.myColor;
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
  if (keys['KeyA'] || keys['ArrowLeft'])  kx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) kx += 1;
  if (keys['KeyW'] || keys['ArrowUp'] || keys['Space']) ky -= 1;
  if (keys['KeyS'] || keys['ArrowDown'])  ky += 1;
  if (kx !== 0 || ky !== 0) {
    input.moveX = kx;
    input.moveY = ky;
  } else if (!('ontouchstart' in window)) {
    input.moveX = 0;
    input.moveY = 0;
  }
}

function gameLoop(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;

  updateKeyboardInput();

  if (state.isHost) {
    stepHostSimulation(dt, now);
    broadcastToClients({
      type: 'state',
      players: state.players,
      bullets: state.bullets,
      grenades: state.grenades,
      gasClouds: state.gasClouds,
      killFeed: state.killFeed,
      matchTime: state.matchTime
    });
  } else if (hostConn && hostConn.open) {
    hostConn.send({ type: 'input', id: state.myId, input });
  }

  updateCamera();
  renderGame(now);
  updateHudUI();
  gameLoopId = requestAnimationFrame(gameLoop);
}

function stepHostSimulation(dt, now) {
  state.matchTime = Math.max(0, state.matchTime - dt);

  Object.values(state.players).forEach((p, idx) => {
    if (p.hp <= 0) {
      p.deadTimer -= dt;
      if (p.deadTimer <= 0) {
        const sp = SPAWN_POINTS[(idx + Math.floor(Math.random() * 6)) % SPAWN_POINTS.length];
        p.x = sp.x; p.y = sp.y; p.vx = 0; p.vy = 0; p.hp = 100;
      }
      return;
    }

    // Determine active input (Host, Remote Client, or Smart AI Bot)
    let ctrl = input;
    if (p.isBot) {
      ctrl = computeBotAI(p, dt);
    } else if (p.id !== state.myId) {
      ctrl = p.remoteInput || { moveX: 0, moveY: 0, aimX: 1, aimY: 0, shooting: false };
    }

    // Horizontal Movement
    const speed = 340;
    p.vx = ctrl.moveX * speed;

    // Unlimited Jetpack Flight (Push Up or W/Space)
    if (ctrl.moveY < -0.22) {
      p.vy += ctrl.moveY * 1450 * dt;
      p.vy = Math.max(p.vy, -460);
      p.jetpacking = true;
      if (Math.random() < 0.6) {
        state.particles.push({
          x: p.x - p.facing * 12, y: p.y + 16,
          vx: (Math.random() - 0.5) * 60, vy: 120 + Math.random() * 80,
          life: 0.35, color: Math.random() < 0.5 ? '#f97316' : '#94a3b8', r: 6
        });
      }
    } else {
      p.jetpacking = false;
      p.vy += 980 * dt; // Gravity
      p.vy = Math.min(p.vy, 680);
    }

    // Aim & Facing
    p.aimAngle = Math.atan2(ctrl.aimY, ctrl.aimX);
    p.facing = Math.cos(p.aimAngle) >= 0 ? 1 : -1;
    if (Math.abs(p.vx) > 20) p.walkFrame += dt * 10;

    // Move & Collide with Outpost Platforms
    moveAndCollide(p, dt);

    // Unlimited Firing
    if (ctrl.shooting) {
      fireWeapon(p, now);
    }
  });

  // Update Bullets & Rockets
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life -= dt;

    let hitWall = false;
    for (const plat of PLATFORMS) {
      if (b.x > plat.x && b.x < plat.x + plat.w && b.y > plat.y && b.y < plat.y + plat.h) {
        hitWall = true; break;
      }
    }

    let hitPlayer = null;
    for (const p of Object.values(state.players)) {
      if (p.id !== b.ownerId && p.hp > 0) {
        if (Math.abs(b.x - p.x) < 22 && Math.abs(b.y - p.y) < 28) {
          hitPlayer = p; break;
        }
      }
    }

    if (hitWall || hitPlayer || b.life <= 0) {
      if (b.type === 'rocket') {
        explodeRocket(b.x, b.y, b.ownerId);
      } else if (hitPlayer) {
        damagePlayer(hitPlayer, b.damage, b.ownerId, b.weaponName);
      }
      state.bullets.splice(i, 1);
    }
  }

  // Update Green Gas Grenades
  for (let i = state.grenades.length - 1; i >= 0; i--) {
    const g = state.grenades[i];
    g.vy += 850 * dt;
    g.x += g.vx * dt;
    g.y += g.vy * dt;
    g.fuse -= dt;

    for (const plat of PLATFORMS) {
      if (g.x > plat.x && g.x < plat.x + plat.w && g.y > plat.y && g.y < plat.y + plat.h) {
        g.vy *= -0.45;
        g.vx *= 0.7;
        g.y = plat.y - 4;
      }
    }

    if (g.fuse <= 0) {
      state.gasClouds.push({ x: g.x, y: g.y, r: 115, life: 6.5, ownerId: g.ownerId });
      state.grenades.splice(i, 1);
    }
  }

  // Update Toxic Gas Clouds
  for (let i = state.gasClouds.length - 1; i >= 0; i--) {
    const gc = state.gasClouds[i];
    gc.life -= dt;
    Object.values(state.players).forEach(p => {
      if (p.hp > 0 && Math.hypot(p.x - gc.x, p.y - gc.y) < gc.r) {
        damagePlayer(p, 26 * dt, gc.ownerId, 'GAS GRENADE');
      }
    });
    if (gc.life <= 0) state.gasClouds.splice(i, 1);
  }
}

function moveAndCollide(p, dt) {
  const hw = 16, hh = 26;
  p.x += p.vx * dt;
  for (const plat of PLATFORMS) {
    if (p.x + hw > plat.x && p.x - hw < plat.x + plat.w && p.y + hh > plat.y && p.y - hh < plat.y + plat.h) {
      if (p.vx > 0) p.x = plat.x - hw;
      else if (p.vx < 0) p.x = plat.x + plat.w + hw;
    }
  }

  p.y += p.vy * dt;
  for (const plat of PLATFORMS) {
    if (p.x + hw > plat.x && p.x - hw < plat.x + plat.w && p.y + hh > plat.y && p.y - hh < plat.y + plat.h) {
      if (p.vy > 0) { p.y = plat.y - hh; p.vy = 0; }
      else if (p.vy < 0) { p.y = plat.y + plat.h + hh; p.vy = 0; }
    }
  }
}

function fireWeapon(p, now) {
  const w = WEAPONS[p.weaponIdx];
  if (now - p.lastShot < w.rate) return;
  p.lastShot = now;

  if (w.type === 'melee') {
    // Chainsaw close combat slash
    const reachX = p.x + Math.cos(p.aimAngle) * 42;
    const reachY = p.y + Math.sin(p.aimAngle) * 42;
    Object.values(state.players).forEach(target => {
      if (target.id !== p.id && target.hp > 0 && Math.hypot(target.x - reachX, target.y - reachY) < 42) {
        damagePlayer(target, w.damage, p.id, w.name);
      }
    });
    return;
  }

  for (let i = 0; i < w.count; i++) {
    const offset = w.count === 2 ? (i === 0 ? -5 : 5) : 0;
    const ang = p.aimAngle + (Math.random() - 0.5) * w.spread;
    state.bullets.push({
      x: p.x + Math.cos(p.aimAngle) * 24,
      y: p.y + Math.sin(p.aimAngle) * 24 + offset,
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

function spawnGrenade(p) {
  const now = performance.now();
  if (now - p.lastGrenade < 450) return; // Rapid unlimited grenades!
  p.lastGrenade = now;
  state.grenades.push({
    x: p.x + p.facing * 18,
    y: p.y - 8,
    vx: Math.cos(p.aimAngle) * 560,
    vy: Math.sin(p.aimAngle) * 560 - 140,
    fuse: 1.6,
    ownerId: p.id
  });
}

function explodeRocket(x, y, ownerId) {
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 80 + Math.random() * 220;
    state.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 0.45, color: i % 2 === 0 ? '#f97316' : '#facc15', r: 10
    });
  }
  Object.values(state.players).forEach(p => {
    if (p.hp > 0) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < 130) {
        damagePlayer(p, Math.round(95 * (1 - d / 130)), ownerId, 'ROCKET RPG');
      }
    }
  });
}

function damagePlayer(target, amount, attackerId, weaponName) {
  if (target.hp <= 0) return;
  target.hp -= amount;
  if (target.hp <= 0) {
    target.hp = 0;
    target.deaths += 1;
    target.deadTimer = 3.0;
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
    bot.aiTimer = 0.8 + Math.random() * 1.2;
    bot.aiDir = Math.random() < 0.5 ? -1 : 1;
    if (Math.random() < 0.25) bot.weaponIdx = Math.floor(Math.random() * WEAPONS.length);
  }

  let nearest = null, bestDist = 9999;
  Object.values(state.players).forEach(other => {
    if (other.id !== bot.id && other.hp > 0) {
      const d = Math.hypot(other.x - bot.x, other.y - bot.y);
      if (d < bestDist) { bestDist = d; nearest = other; }
    }
  });

  if (!nearest) return { moveX: 0, moveY: 0, aimX: 1, aimY: 0, shooting: false };

  const dx = nearest.x - bot.x;
  const dy = nearest.y - bot.y;
  const dist = Math.hypot(dx, dy) || 1;
  return {
    moveX: dist > 260 ? Math.sign(dx) * 0.75 : bot.aiDir * 0.6,
    moveY: dy < -60 || bot.y > 1250 ? -0.8 : 0,
    aimX: dx / dist,
    aimY: dy / dist,
    shooting: dist < 680
  };
}

// ==========================================================================
// 7. CAMERA & CONCEPT-ACCURATE 2D DOODLE RENDERING
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sky & Underground Rock Backdrop
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGrad.addColorStop(0, '#6b7c6e');
  skyGrad.addColorStop(0.35, '#465248');
  skyGrad.addColorStop(1, '#1c1917');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-state.camera.x, -state.camera.y);

  // Underground Dark Cave Layer
  ctx.fillStyle = '#231f1d';
  ctx.fillRect(40, 480, 2720, 960);

  // Draw Props (Crates, Barrels, Sandbags, Ladders)
  for (const pr of PROPS) {
    if (pr.kind === 'crate') {
      ctx.fillStyle = '#92623a';
      ctx.fillRect(pr.x, pr.y, pr.w, pr.h);
      ctx.strokeStyle = '#1c1917'; ctx.lineWidth = 3;
      ctx.strokeRect(pr.x, pr.y, pr.w, pr.h);
      ctx.beginPath(); ctx.moveTo(pr.x, pr.y); ctx.lineTo(pr.x + pr.w, pr.y + pr.h); ctx.stroke();
    } else if (pr.kind === 'barrel') {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(pr.x, pr.y, pr.w, pr.h);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
      ctx.strokeRect(pr.x, pr.y, pr.w, pr.h);
    } else if (pr.kind === 'sandbag') {
      ctx.fillStyle = '#a89f78';
      ctx.fillRect(pr.x, pr.y, pr.w, pr.h);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
      ctx.strokeRect(pr.x, pr.y, pr.w, pr.h);
    } else if (pr.kind === 'ladder') {
      ctx.strokeStyle = '#57534e'; ctx.lineWidth = 4;
      ctx.strokeRect(pr.x, pr.y, pr.w, pr.h);
      for (let ry = pr.y + 24; ry < pr.y + pr.h; ry += 26) {
        ctx.beginPath(); ctx.moveTo(pr.x, ry); ctx.lineTo(pr.x + pr.w, ry); ctx.stroke();
      }
    }
  }

  // Draw Platforms & Outpost Structures
  for (const plat of PLATFORMS) {
    if (plat.type === 'metal') ctx.fillStyle = '#52585c';
    else if (plat.type === 'wood') ctx.fillStyle = '#785032';
    else if (plat.type === 'ground') ctx.fillStyle = '#57534e';
    else ctx.fillStyle = '#292524';

    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    ctx.strokeStyle = '#0f1110'; ctx.lineWidth = 3;
    ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

    if (plat.type === 'ground') {
      ctx.fillStyle = '#4d7c0f';
      ctx.fillRect(plat.x, plat.y, plat.w, 10);
    }
  }

  // Draw Green Toxic Gas Clouds
  for (const gc of state.gasClouds) {
    const grad = ctx.createRadialGradient(gc.x, gc.y, 10, gc.x, gc.y, gc.r);
    grad.addColorStop(0, 'rgba(34, 197, 94, 0.65)');
    grad.addColorStop(1, 'rgba(22, 163, 74, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(gc.x, gc.y, gc.r, 0, Math.PI * 2); ctx.fill();
  }

  // Draw Grenades
  for (const g of state.grenades) {
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(g.x, g.y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
  }

  // Draw Particles
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const pt = state.particles[i];
    pt.x += pt.vx * 0.016; pt.y += pt.vy * 0.016; pt.life -= 0.016;
    ctx.fillStyle = pt.color;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * Math.max(0, pt.life * 2), 0, Math.PI * 2); ctx.fill();
    if (pt.life <= 0) state.particles.splice(i, 1);
  }

  // Draw Soldiers (Exact Doodle Army Character Design)
  Object.values(state.players).forEach(p => {
    if (p.hp <= 0) return;
    drawDoodleSoldier(p);
  });

  // Draw Bullets & Rockets
  for (const b of state.bullets) {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.type === 'rocket' ? 7 : 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawDoodleSoldier(p) {
  ctx.save();
  ctx.translate(p.x, p.y);

  // Name & Mini Health Tag above head
  ctx.fillStyle = '#fff';
  ctx.font = '800 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(p.name, 0, -42);
  ctx.fillStyle = '#111';
  ctx.fillRect(-20, -37, 40, 5);
  ctx.fillStyle = p.hp > 35 ? '#22c55e' : '#ef4444';
  ctx.fillRect(-20, -37, 40 * (p.hp / p.maxHp), 5);

  ctx.scale(p.facing, 1);

  // Jetpack Tank on Back
  ctx.fillStyle = '#475569';
  ctx.fillRect(-19, -12, 11, 24);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5;
  ctx.strokeRect(-19, -12, 11, 24);

  // Jetpack Flame Thruster
  if (p.jetpacking) {
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-18, 12); ctx.lineTo(-13, 30 + Math.random() * 8); ctx.lineTo(-9, 12);
    ctx.fill();
  }

  // Boots & Camo Legs
  const legSwing = Math.sin(p.walkFrame) * 5;
  ctx.fillStyle = p.color;
  ctx.fillRect(-8 + legSwing, 10, 7, 13);
  ctx.strokeRect(-8 + legSwing, 10, 7, 13);
  ctx.fillRect(2 - legSwing, 10, 7, 13);
  ctx.strokeRect(2 - legSwing, 10, 7, 13);

  // Camo Torso
  ctx.fillStyle = p.color;
  ctx.fillRect(-11, -10, 22, 22);
  ctx.strokeRect(-11, -10, 22, 22);

  // Head
  ctx.fillStyle = '#f1c29b';
  ctx.beginPath(); ctx.arc(0, -18, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Military Helmet
  ctx.fillStyle = p.color;
  ctx.beginPath(); ctx.arc(0, -20, 12.5, Math.PI, 0); ctx.fill(); ctx.stroke();

  // Tactical Goggles
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(1, -22, 11, 6);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(3, -21, 7, 4);

  ctx.restore();

  // Rotating Weapon Arm
  ctx.save();
  ctx.translate(p.x, p.y - 2);
  ctx.rotate(p.aimAngle);
  if (p.facing < 0) ctx.scale(1, -1);

  const w = WEAPONS[p.weaponIdx];
  ctx.fillStyle = w.id === 5 ? '#d97706' : '#1f2937';
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
  const gunLen = w.id === 2 || w.id === 3 ? 34 : 24;
  ctx.fillRect(4, -4, gunLen, 8);
  ctx.strokeRect(4, -4, gunLen, 8);
  ctx.restore();
}

function updateHudUI() {
  const me = state.players[state.myId];
  if (!me) return;
  document.getElementById('healthBar').style.width = `${Math.max(0, me.hp)}%`;
  document.getElementById('hpText').textContent = `HP ${Math.ceil(me.hp)}`;
  document.getElementById('matchScore').textContent = `KILLS: ${me.kills}`;

  const mins = Math.floor(state.matchTime / 60).toString().padStart(2, '0');
  const secs = Math.floor(state.matchTime % 60).toString().padStart(2, '0');
  document.getElementById('matchTimer').textContent = `${mins}:${secs}`;

  const kf = document.getElementById('killFeed');
  kf.innerHTML = state.killFeed.map(item => `<div class="kill-item">${item}</div>`).join('');
}
