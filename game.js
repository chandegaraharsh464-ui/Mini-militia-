/* ==========================================================================
   DOODLE ARMY: OUTPOST UNLIMITED (WITH CUSTOM SPRITE & MAP ASSETS)
   Loads: assets/soldiers.png, assets/weapons.png, assets/map_outpost.png, assets/lobby_bg.png
   ========================================================================== */

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// ==========================================================================
// 1. ASSET LOADER & AUTOMATIC WHITE-BACKGROUND REMOVER
// ==========================================================================
const ASSETS = {
  soldiers: null, // Transparent processed canvas
  weapons: null,  // Transparent processed canvas
  map: new Image(),
  loaded: { soldiers: false, weapons: false, map: false }
};

function loadSpriteSheetWithoutWhiteBG(src, key) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const off = document.createElement('canvas');
    off.width = img.width;
    off.height = img.height;
    const octx = off.getContext('2d');
    octx.drawImage(img, 0, 0);

    const imgData = octx.getImageData(0, 0, off.width, off.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      // Remove near-white background pixels while keeping crisp black outlines
      if (d[i] > 238 && d[i + 1] > 238 && d[i + 2] > 238) {
        d[i + 3] = 0;
      }
    }
    octx.putImageData(imgData, 0, 0);
    ASSETS[key] = off;
    ASSETS.loaded[key] = true;
  };
  img.src = src;
}

loadSpriteSheetWithoutWhiteBG('./assets/soldiers.png', 'soldiers');
loadSpriteSheetWithoutWhiteBG('./assets/weapons.png', 'weapons');

ASSETS.map.onload = () => { ASSETS.loaded.map = true; };
ASSETS.map.src = './assets/map_outpost.png';

// Set Lobby Background Image
const lobbyEl = document.getElementById('lobbyScreen');
if (lobbyEl) {
  lobbyEl.style.backgroundImage = `linear-gradient(rgba(12,16,13,0.82), rgba(12,16,13,0.92)), url('./assets/lobby_bg.png')`;
  lobbyEl.style.backgroundSize = 'cover';
  lobbyEl.style.backgroundPosition = 'center';
}

// ==========================================================================
// 2. WEAPONS (WITH EXACT CROP REGIONS FROM assets/weapons.png)
// ==========================================================================
// Crop coordinates normalized (0.0 to 1.0) to match your weapons.png layout
const WEAPONS = [
  { id: 0, name: 'DUAL UZI',     rate: 85,  speed: 18, damage: 13, spread: 0.09, count: 2, color: '#facc15', type: 'bullet', crop: [0.02, 0.03, 0.16, 0.25] },
  { id: 1, name: 'DESERT EAGLE', rate: 260, speed: 22, damage: 34, spread: 0.02, count: 1, color: '#fde047', type: 'bullet', crop: [0.35, 0.04, 0.19, 0.24] },
  { id: 2, name: 'SNIPER RIFLE', rate: 650, speed: 34, damage: 85, spread: 0.00, count: 1, color: '#38bdf8', type: 'sniper', crop: [0.57, 0.04, 0.40, 0.24] },
  { id: 3, name: 'ROCKET RPG',   rate: 850, speed: 14, damage: 95, spread: 0.02, count: 1, color: '#fb923c', type: 'rocket', crop: [0.02, 0.38, 0.46, 0.24] },
  { id: 4, name: 'SHOTGUN',      rate: 520, speed: 17, damage: 16, spread: 0.24, count: 6, color: '#fef08a', type: 'bullet', crop: [0.56, 0.40, 0.41, 0.20] },
  { id: 5, name: 'CHAINSAW',     rate: 70,  speed: 0,  damage: 24, spread: 0,    count: 1, color: '#ef4444', type: 'melee',  crop: [0.02, 0.72, 0.38, 0.20] }
];

// ==========================================================================
// 3. EXACT COLLISION PLATFORMS ALIGNED TO assets/map_outpost.png
// ==========================================================================
const WORLD = { width: 2800, height: 1560 };

const PLATFORMS = [
  // World Borders
  { x: 0, y: 0, w: 2800, h: 30 },
  { x: 0, y: 1520, w: 2800, h: 40 },
  { x: 0, y: 0, w: 30, h: 1560 },
  { x: 2770, y: 0, w: 30, h: 1560 },

  // Surface Ground (Aligned to grass/dirt horizon in map_outpost.png)
  { x: 30,   y: 525, w: 510,  h: 40 }, // Left hill & Bunker floor
  { x: 675,  y: 525, w: 1630, h: 40 }, // Center battlefield
  { x: 2425, y: 525, w: 345,  h: 40 }, // Right rocky ridge

  // Left Concrete Bunker Roof & Wall
  { x: 380, y: 215, w: 335, h: 28 },
  { x: 380, y: 215, w: 28,  h: 310 },

  // Right Sniper Watchtower Floors & Roof
  { x: 2210, y: 345, w: 255, h: 20 },
  { x: 2195, y: 195, w: 285, h: 22 },
  { x: 2195, y: 65,  w: 285, h: 18 },

  // Underground Bunker Level 1 Deck
  { x: 420,  y: 845, w: 1270, h: 32 },
  { x: 1835, y: 845, w: 935,  h: 32 },

  // Underground Bunker Level 2 Deck
  { x: 740,  y: 1175, w: 950, h: 32 },
  { x: 1835, y: 1175, w: 935, h: 32 },

  // Bottom-Left Stalagmite Cave Floor & Bottom Bunker Floor
  { x: 30,   y: 1460, w: 1200, h: 60 },
  { x: 1245, y: 1485, w: 1525, h: 45 },

  // Bunker Vertical Divider Walls
  { x: 420,  y: 565, w: 26, h: 280 },
  { x: 740,  y: 877, w: 26, h: 298 },
  { x: 1245, y: 1207, w: 26, h: 278 }
];

const SPAWN_POINTS = [
  { x: 520,  y: 440 },
  { x: 1350, y: 440 },
  { x: 2330, y: 140 },
  { x: 920,  y: 770 },
  { x: 2150, y: 770 },
  { x: 1550, y: 1400 }
];

// ==========================================================================
// 4. GAME STATE, FRIENDS & PEERJS MULTIPLAYER
// ==========================================================================
const state = {
  mode: 'menu',
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
  camera: { x: 1350, y: 440, zoom: 1 }
};

let peer = null;
let connections = {};
let hostConn = null;
let lastFrameTime = 0;

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
});

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
  document.getElementById('savedFriendsList').textContent = list.length ? list.map(f => f.name).join(', ') : 'None yet (add players in match)';
}
renderSavedFriends();

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('room')) {
  document.getElementById('roomCodeInput').value = urlParams.get('room').toUpperCase();
}

document.getElementById('installAppBtn').onclick = () => document.getElementById('installModal').classList.remove('hidden');
document.getElementById('closeInstallModal').onclick = () => document.getElementById('installModal').classList.add('hidden');

function createPlayerEntity(id, name, color, isBot = false, spawnIdx = 0) {
  const sp = SPAWN_POINTS[spawnIdx % SPAWN_POINTS.length];
  return {
    id, name, color, isBot,
    x: sp.x, y: sp.y,
    vx: 0, vy: 0,
    facing: 1,
    aimAngle: 0,
    hp: 100, maxHp: 100,
    weaponIdx: 0,
    kills: 0, deaths: 0,
    jetpacking: false,
    lastShot: 0, lastGrenade: 0,
    animFrame: 0, deadTimer: 0,
    aiTimer: 0, aiDir: 1
  };
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

document.getElementById('createRoomBtn').onclick = () => {
  state.isHost = true;
  state.roomCode = generateRoomCode();
  document.getElementById('connectionStatus').textContent = 'Creating P2P Room...';

  peer = new Peer('DOODLE_OUTPOST_' + state.roomCode);
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
};

document.getElementById('joinRoomBtn').onclick = () => {
  const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
  if (code.length !== 4) return;
  state.isHost = false;
  state.roomCode = code;
  document.getElementById('connectionStatus').textContent = 'Connecting to ' + code + '...';

  peer = new Peer();
  peer.on('open', () => {
    hostConn = peer.connect('DOODLE_OUTPOST_' + code, { reliable: false });
    hostConn.on('open', () => {
      document.getElementById('connectionStatus').textContent = 'Connected! Waiting for Host...';
      hostConn.send({ type: 'join', id: state.myId, name: state.myName, color: state.myColor });
    });
    hostConn.on('data', (msg) => handleClientReceive(msg));
  });
};

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
  let idx = Object.keys(state.players).length;
  let b = 0;
  while (idx < targetCount) {
    const bid = 'bot_' + idx;
    state.players[bid] = createPlayerEntity(bid, botNames[b % botNames.length], '#4b633c', true, idx);
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

document.getElementById('copyLinkBtn').onclick = () => {
  const url = `${location.origin}${location.pathname}?room=${state.roomCode}`;
  navigator.clipboard.writeText(url);
  document.getElementById('copyLinkBtn').textContent = '✅ Copied!';
  setTimeout(() => document.getElementById('copyLinkBtn').textContent = '📋 Copy Invite Link', 2000);
};

document.getElementById('whatsappShareBtn').onclick = () => {
  const url = `${location.origin}${location.pathname}?room=${state.roomCode}`;
  const text = `Join my Doodle Outpost match! Room Code: *${state.roomCode}* — Play on Phone or PC: ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

document.getElementById('startMatchBtn').onclick = () => {
  if (document.getElementById('fillBotsCheck').checked) spawnBotsUpTo(6);
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
    if (state.mode === 'playing') conn.send({ type: 'start', players: state.players, roomCode: state.roomCode });
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
  Object.values(connections).forEach(c => { if (c.open) c.send(payload); });
}

// ==========================================================================
// 5. CONTROLS (PC MOUSE/KEYBOARD + MOBILE DUAL JOYSTICKS)
// ==========================================================================
const input = { moveX: 0, moveY: 0, aimX: 1, aimY: 0, shooting: false };
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
      if (e.changedTouches[i].identifier === activeTouchId) handleTouch(e.changedTouches[i]);
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

document.querySelectorAll('.w-slot').forEach(btn => { btn.onclick = () => selectWeapon(parseInt(btn.dataset.w)); });
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
  if (!state.isHost && hostConn && hostConn.open) hostConn.send({ type: 'input', id: state.myId, input, weaponIdx: idx });
}
function cycleWeapon() {
  const me = state.players[state.myId];
  if (me) selectWeapon((me.weaponIdx + 1) % WEAPONS.length);
}
function toggleSniperZoom() { state.sniperZoom = !state.sniperZoom; }
function triggerGrenade() {
  const me = state.players[state.myId];
  if (!me || me.hp <= 0) return;
  if (state.isHost) spawnGrenade(me);
  else if (hostConn && hostConn.open) hostConn.send({ type: 'input', id: state.myId, input, throwGrenade: true });
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
  Object.values(state.players).sort((a, b) => b.kills - a.kills).forEach(p => {
    const div = document.createElement('div');
    div.className = 'sb-row';
    const canAdd = p.id !== state.myId && !p.isBot;
    div.innerHTML = `<span>🪖 ${p.name} ${p.isBot ? '[BOT]' : ''}</span><span>Kills: <b>${p.kills}</b> | Deaths: ${p.deaths}</span>${canAdd ? `<button class="btn-sm" onclick="saveFriend('${p.id}','${p.name}');this.textContent='⭐ Added'">+ Friend</button>` : ''}`;
    rows.appendChild(div);
  });
}

// ==========================================================================
// 6. PHYSICS & COMBAT SIMULATION
// ==========================================================================
function startMatch() {
  state.mode = 'playing';
  document.getElementById('lobbyScreen').classList.add('hidden');
  document.getElementById('gameContainer').classList.remove('hidden');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);
}
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

function updateKeyboardInput() {
  let kx = 0, ky = 0;
  if (keys['KeyA'] || keys['ArrowLeft'])  kx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) kx += 1;
  if (keys['KeyW'] || keys['ArrowUp'] || keys['Space']) ky -= 1;
  if (keys['KeyS'] || keys['ArrowDown'])  ky += 1;
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
      grenades: state.grenades, gasClouds: state.gasClouds,
      killFeed: state.killFeed, matchTime: state.matchTime
    });
  } else if (hostConn && hostConn.open) {
    hostConn.send({ type: 'input', id: state.myId, input });
  }

  updateCamera();
  renderGame();
  updateHudUI();
  requestAnimationFrame(gameLoop);
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

    let ctrl = input;
    if (p.isBot) ctrl = computeBotAI(p, dt);
    else if (p.id !== state.myId) ctrl = p.remoteInput || { moveX: 0, moveY: 0, aimX: 1, aimY: 0, shooting: false };

    p.vx = ctrl.moveX * 350;
    if (ctrl.moveY < -0.22) {
      p.vy += ctrl.moveY * 1450 * dt;
      p.vy = Math.max(p.vy, -460);
      p.jetpacking = true;
    } else {
      p.jetpacking = false;
      p.vy = Math.min(p.vy + 980 * dt, 680);
    }

    p.aimAngle = Math.atan2(ctrl.aimY, ctrl.aimX);
    p.facing = Math.cos(p.aimAngle) >= 0 ? 1 : -1;
    p.animFrame += dt * (p.jetpacking ? 12 : (Math.abs(p.vx) > 20 ? 10 : 2));

    moveAndCollide(p, dt);
    if (ctrl.shooting) fireWeapon(p, now);
  });

  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    b.x += b.vx; b.y += b.vy; b.life -= dt;
    let hitWall = PLATFORMS.some(pl => b.x > pl.x && b.x < pl.x + pl.w && b.y > pl.y && b.y < pl.y + pl.h);
    let hitPlayer = Object.values(state.players).find(p => p.id !== b.ownerId && p.hp > 0 && Math.abs(b.x - p.x) < 24 && Math.abs(b.y - p.y) < 32);

    if (hitWall || hitPlayer || b.life <= 0) {
      if (b.type === 'rocket') explodeRocket(b.x, b.y, b.ownerId);
      else if (hitPlayer) damagePlayer(hitPlayer, b.damage, b.ownerId, b.weaponName);
      state.bullets.splice(i, 1);
    }
  }

  for (let i = state.grenades.length - 1; i >= 0; i--) {
    const g = state.grenades[i];
    g.vy += 850 * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.fuse -= dt;
    for (const pl of PLATFORMS) {
      if (g.x > pl.x && g.x < pl.x + pl.w && g.y > pl.y && g.y < pl.y + pl.h) {
        g.vy *= -0.45; g.vx *= 0.7; g.y = pl.y - 4;
      }
    }
    if (g.fuse <= 0) {
      state.gasClouds.push({ x: g.x, y: g.y, r: 120, life: 6.5, ownerId: g.ownerId });
      state.grenades.splice(i, 1);
    }
  }

  for (let i = state.gasClouds.length - 1; i >= 0; i--) {
    const gc = state.gasClouds[i];
    gc.life -= dt;
    Object.values(state.players).forEach(p => {
      if (p.hp > 0 && Math.hypot(p.x - gc.x, p.y - gc.y) < gc.r) damagePlayer(p, 26 * dt, gc.ownerId, 'GAS GRENADE');
    });
    if (gc.life <= 0) state.gasClouds.splice(i, 1);
  }
}

function moveAndCollide(p, dt) {
  const hw = 18, hh = 30;
  p.x += p.vx * dt;
  for (const pl of PLATFORMS) {
    if (p.x + hw > pl.x && p.x - hw < pl.x + pl.w && p.y + hh > pl.y && p.y - hh < pl.y + pl.h) {
      p.x = p.vx > 0 ? pl.x - hw : pl.x + pl.w + hw;
    }
  }
  p.y += p.vy * dt;
  for (const pl of PLATFORMS) {
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

  if (w.type === 'melee') {
    const rx = p.x + Math.cos(p.aimAngle) * 44, ry = p.y + Math.sin(p.aimAngle) * 44;
    Object.values(state.players).forEach(t => {
      if (t.id !== p.id && t.hp > 0 && Math.hypot(t.x - rx, t.y - ry) < 44) damagePlayer(t, w.damage, p.id, w.name);
    });
    return;
  }

  for (let i = 0; i < w.count; i++) {
    const offset = w.count === 2 ? (i === 0 ? -5 : 5) : 0;
    const ang = p.aimAngle + (Math.random() - 0.5) * w.spread;
    state.bullets.push({
      x: p.x + Math.cos(p.aimAngle) * 26, y: p.y + Math.sin(p.aimAngle) * 26 + offset,
      vx: Math.cos(ang) * w.speed, vy: Math.sin(ang) * w.speed,
      damage: w.damage, ownerId: p.id, weaponName: w.name, color: w.color, type: w.type, life: 1.8
    });
  }
}

function spawnGrenade(p) {
  const now = performance.now();
  if (now - p.lastGrenade < 450) return;
  p.lastGrenade = now;
  state.grenades.push({
    x: p.x + p.facing * 20, y: p.y - 8,
    vx: Math.cos(p.aimAngle) * 560, vy: Math.sin(p.aimAngle) * 560 - 140,
    fuse: 1.6, ownerId: p.id
  });
}

function explodeRocket(x, y, ownerId) {
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2, sp = 80 + Math.random() * 220;
    state.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.45, color: i % 2 === 0 ? '#f97316' : '#facc15', r: 10 });
  }
  Object.values(state.players).forEach(p => {
    if (p.hp > 0) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < 130) damagePlayer(p, Math.round(95 * (1 - d / 130)), ownerId, 'ROCKET RPG');
    }
  });
}

function damagePlayer(target, amount, attackerId, weaponName) {
  if (target.hp <= 0) return;
  target.hp -= amount;
  if (target.hp <= 0) {
    target.hp = 0; target.deaths += 1; target.deadTimer = 3.0;
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
  Object.values(state.players).forEach(o => {
    if (o.id !== bot.id && o.hp > 0) {
      const d = Math.hypot(o.x - bot.x, o.y - bot.y);
      if (d < bestDist) { bestDist = d; nearest = o; }
    }
  });
  if (!nearest) return { moveX: 0, moveY: 0, aimX: 1, aimY: 0, shooting: false };
  const dx = nearest.x - bot.x, dy = nearest.y - bot.y, dist = Math.hypot(dx, dy) || 1;
  return {
    moveX: dist > 260 ? Math.sign(dx) * 0.75 : bot.aiDir * 0.6,
    moveY: dy < -60 || bot.y > 1300 ? -0.8 : 0,
    aimX: dx / dist, aimY: dy / dist, shooting: dist < 680
  };
}

// ==========================================================================
// 7. RENDERING WITH YOUR EXACT UPLOADED DESIGN ASSETS
// ==========================================================================
function updateCamera() {
  const me = state.players[state.myId];
  if (!me) return;
  const targetZoom = state.sniperZoom ? 0.65 : (canvas.width < 750 ? 0.78 : 0.95);
  state.camera.zoom += (targetZoom - state.camera.zoom) * 0.1;
  state.camera.x += (me.x - state.camera.x) * 0.15;
  state.camera.y += (me.y - state.camera.y) * 0.15;
}

function renderGame() {
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-state.camera.x, -state.camera.y);

  // 1. Draw Your Exact Outpost Map Artwork
  if (ASSETS.loaded.map) {
    ctx.drawImage(ASSETS.map, 0, 0, WORLD.width, WORLD.height);
  } else {
    ctx.fillStyle = '#292524';
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    ctx.fillStyle = '#57534e';
    PLATFORMS.forEach(pl => ctx.fillRect(pl.x, pl.y, pl.w, pl.h));
  }

  // 2. Draw Green Toxic Gas Clouds
  for (const gc of state.gasClouds) {
    const grad = ctx.createRadialGradient(gc.x, gc.y, 10, gc.x, gc.y, gc.r);
    grad.addColorStop(0, 'rgba(34, 197, 94, 0.7)');
    grad.addColorStop(1, 'rgba(22, 163, 74, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(gc.x, gc.y, gc.r, 0, Math.PI * 2); ctx.fill();
  }

  // 3. Draw Grenades (Using Grenade Sprite from weapons.png if loaded)
  for (const g of state.grenades) {
    if (ASSETS.loaded.weapons) {
      const ws = ASSETS.weapons;
      ctx.drawImage(ws, ws.width * 0.64, ws.height * 0.72, ws.width * 0.08, ws.height * 0.20, g.x - 10, g.y - 12, 20, 24);
    } else {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath(); ctx.arc(g.x, g.y, 8, 0, Math.PI * 2); ctx.fill();
    }
  }

  // 4. Draw Explosion Particles
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const pt = state.particles[i];
    pt.x += pt.vx * 0.016; pt.y += pt.vy * 0.016; pt.life -= 0.016;
    ctx.fillStyle = pt.color;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * Math.max(0, pt.life * 2), 0, Math.PI * 2); ctx.fill();
    if (pt.life <= 0) state.particles.splice(i, 1);
  }

  // 5. Draw Soldiers Using Your Exact soldiers.png Sprite Sheet + Selected Weapon
  Object.values(state.players).forEach(p => {
    if (p.hp <= 0) return;
    drawSpriteSoldier(p);
  });

  // 6. Draw Bullets & Rockets
  for (const b of state.bullets) {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.type === 'rocket' ? 8 : 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawSpriteSoldier(p) {
  ctx.save();
  ctx.translate(p.x, p.y);

  // Player Name & Health Bar
  ctx.fillStyle = '#fff';
  ctx.font = '900 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
  ctx.strokeText(p.name, 0, -48);
  ctx.fillText(p.name, 0, -48);

  ctx.fillStyle = '#111';
  ctx.fillRect(-22, -42, 44, 6);
  ctx.fillStyle = p.hp > 35 ? '#22c55e' : '#ef4444';
  ctx.fillRect(-22, -42, 44 * (p.hp / p.maxHp), 6);

  ctx.scale(p.facing, 1);

  if (ASSETS.loaded.soldiers) {
    // Slice 5x2 grid from assets/soldiers.png
    const sheet = ASSETS.soldiers;
    const cols = 5, rows = 2;
    const fw = sheet.width / cols;
    const fh = sheet.height / rows;
    const col = Math.floor(p.animFrame) % cols;
    const row = p.jetpacking ? 1 : 0; // Row 1 = Jetpack flying with flame, Row 0 = Ground walk/idle
    ctx.drawImage(sheet, col * fw, row * fh, fw, fh, -36, -38, 72, 74);
  } else {
    // Fallback vector soldier while image loads
    ctx.fillStyle = p.color;
    ctx.fillRect(-14, -22, 28, 44);
  }

  ctx.restore();

  // Draw Active Weapon Sprite from assets/weapons.png
  if (ASSETS.loaded.weapons) {
    const w = WEAPONS[p.weaponIdx];
    const ws = ASSETS.weapons;
    const [cx, cy, cw, ch] = w.crop;
    ctx.save();
    ctx.translate(p.x, p.y + 2);
    ctx.rotate(p.aimAngle);
    if (p.facing < 0) ctx.scale(1, -1);
    const drawW = w.id === 2 || w.id === 3 ? 52 : 36;
    const drawH = 22;
    ctx.drawImage(ws, ws.width * cx, ws.height * cy, ws.width * cw, ws.height * ch, 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }
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

  document.getElementById('killFeed').innerHTML = state.killFeed.map(item => `<div class="kill-item">${item}</div>`).join('');
}
