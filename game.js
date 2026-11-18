/* ==========================================================================
   DOODLE OUTPOST — 9 CHARACTERS, 10 WEAPONS/GEAR, 10 SOUND EFFECTS & PROXIMITY MIC
   ========================================================================== */

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// ==========================================================================
// 1. 9 NAMED CHARACTERS & 10 WEAPONS/GEAR DEFINITIONS
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

const SPRITES = { chars: [], weapons: [] };

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
      if (d[i] > 240 && d[i + 1] > 240 && d[i + 2] > 240) {
        d[i + 3] = 0;
      }
    }
    g.putImageData(data, 0, 0);
    onReady(c);
  };
  img.src = src;
}

CHARACTERS.forEach((ch, idx) => {
  loadTransparentSprite(ch.file, (canvasImg) => { SPRITES.chars[idx] = canvasImg; });
});

WEAPONS.forEach((wp, idx) => {
  loadTransparentSprite(wp.file, (canvasImg) => { SPRITES.weapons[idx] = canvasImg; });
});

// Per-Weapon Audio Pool
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
// 2. ARENA MAP & PLATFORMS (MAX 6 PLAYERS)
// ==========================================================================
const MAX_PLAYERS = 6;
const WORLD = { width: 2400, height: 1200 };

const PLATFORMS = [
  { x: 0, y: 0, w: 2400, h: 30, type: 'rock' },
  { x: 0, y: 1150, w: 2400, h: 50, type: 'rock' },
  { x: 0, y: 0, w: 30, h: 1200, type: 'rock' },
  { x: 2370, y: 0, w: 30, h: 1200, type: 'rock' },

  { x: 30, y: 460, w: 720, h: 36, type: 'ground' },
  { x: 880, y: 460, w: 660, h: 36, type: 'ground' },
  { x: 1680, y: 460, w: 690, h: 36, type: 'ground' },

  { x: 220, y: 270, w: 280, h: 22, type: 'metal' },
  { x: 1060, y: 250, w: 300, h: 22, type: 'wood' },
  { x: 1920, y: 270, w: 280, h: 22, type: 'metal' },

  { x: 260, y: 780, w: 820, h: 28, type: 'metal' },
  { x: 1320, y: 780, w: 820, h: 28, type: 'metal' },
  { x: 650, y: 980, w: 1100, h: 28, type: 'rock' }
];

const SPAWN_POINTS = [
  { x: 350, y: 380 },
  { x: 1180, y: 380 },
  { x: 2040, y: 380 },
  { x: 580, y: 700 },
  { x: 1650, y: 700 },
  { x: 1200, y: 900 }
];

// ==========================================================================
// 3. STATE, PROXIMITY VOICE CHAT & PEERJS MULTIPLAYER
// ==========================================================================
const state = {
  mode: 'menu',
  isHost: true,
  roomCode: '',
  myId: 'p_' + Math.random().toString(36).substring(2, 7),
  myName: localStorage.getItem('do_name') || 'Soldier_' + Math.floor(100 + Math.random() * 899),
  myCharId: parseInt(localStorage.getItem('do_char') || '0', 10),
  players: {},
  bullets: [],
  grenades: [],
  gasClouds: [],
  particles: [],
  killFeed: [],
  matchTime: 300,
  sniperZoom: false,
  camera: { x: 1180, y: 420, zoom: 1 }
};

const voiceChat = {
  enabled: false,
  stream: null,
  audioCtx: null,
  peerGains: {}
};
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
      if (state.isHost) broadcastToClients({ type: 'lobby_sync', players: state.players });
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

function updateLobbyTimerLabel() {
  document.getElementById('lobbyTimerDisplay').textContent = formatClock(state.matchTime);
}
updateLobbyTimerLabel();

document.getElementById('lobbyTimePlus').onclick = () => {
  state.matchTime = Math.min(3600, state.matchTime + 60);
  updateLobbyTimerLabel();
};
document.getElementById('lobbyTimeMinus').onclick = () => {
  state.matchTime = Math.max(30, state.matchTime - 60);
  updateLobbyTimerLabel();
};

function adjustLiveTimer(deltaSeconds) {
  if (state.isHost) {
    state.matchTime = Math.max(10, Math.min(3600, state.matchTime + deltaSeconds));
  } else if (hostConn && hostConn.open) {
    hostConn.send({ type: 'adjust_time', delta: deltaSeconds });
  }
}
document.getElementById('timePlusBtn').onclick = () => adjustLiveTimer(30);
document.getElementById('timeMinusBtn').onclick = () => adjustLiveTimer(-30);

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('room')) {
  document.getElementById('roomCodeInput').value = urlParams.get('room').toUpperCase();
}

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
          Object.keys(connections).forEach((remoteId) => {
            const call = peer.call(remoteId, voiceChat.stream);
            attachVoiceCall(call);
          });
          if (!state.isHost && hostConn && hostConn.peer) {
            const call = peer.call(hostConn.peer, voiceChat.stream);
            attachVoiceCall(call);
          }
        }
      }
      voiceChat.stream.getAudioTracks().forEach((t) => { t.enabled = true; });
      voiceChat.enabled = true;
      btn.textContent = '🎙️ MIC: ON';
    } catch (err) {
      alert('Microphone permission is required for voice chat.');
    }
  } else {
    if (voiceChat.stream) {
      voiceChat.stream.getAudioTracks().forEach((t) => { t.enabled = false; });
    }
    voiceChat.enabled = false;
    btn.textContent = '🎙️ MIC: OFF';
  }
}

function attachVoiceCall(call) {
  if (!call) return;
  call.on('stream', (remoteStream) => {
    if (!voiceChat.audioCtx) {
      voiceChat.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const source = voiceChat.audioCtx.createMediaStreamSource(remoteStream);
    const gainNode = voiceChat.audioCtx.createGain();
    gainNode.gain.value = 1.0;

    const audioEl = new Audio();
    audioEl.srcObject = remoteStream;
    audioEl.autoplay = true;
    audioEl.muted = true;

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
    if (!other || other.hp <= 0) {
      gainNode.gain.value = 0;
      return;
    }
    const dist = Math.hypot(other.x - me.x, other.y - me.y);
    gainNode.gain.value = Math.max(0, Math.min(1, 1 - dist / MAX_VOICE_DISTANCE));
  });
}

document.getElementById('toggleMicBtn').onclick = toggleProximityMic;

function createPlayer(id, name, charId, isBot = false, spawnIdx = 0) {
  const sp = SPAWN_POINTS[spawnIdx % SPAWN_POINTS.length];
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
        broadcastToClients({ type: 'lobby_sync', players: state.players });
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
      if (voiceChat.stream) {
        const call = peer.call(hostConn.peer, voiceChat.stream);
        attachVoiceCall(call);
      }
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
  if (document.getElementById('fillBotsCheck').checked) {
    addBotsUpTo(MAX_PLAYERS);
  }
  broadcastToClients({ type: 'start', players: state.players, roomCode: state.roomCode, matchTime: state.matchTime });
  startMatch();
};

function handleHostReceive(conn, msg) {
  if (msg.type === 'join') {
    const count = Object.keys(state.players).length;
    if (count >= MAX_PLAYERS) return;
    conn.playerId = msg.id;
    connections[msg.id] = conn;
    state.players[msg.id] = createPlayer(msg.id, msg.name, msg.charId, false, count);
    if (voiceChat.stream) {
      const call = peer.call(conn.peer, voiceChat.stream);
      attachVoiceCall(call);
    }
    updateLobbyPlayersUI();
    broadcastToClients({ type: 'lobby_sync', players: state.players });
    if (state.mode === 'playing') {
      conn.send({ type: 'start', players: state.players, roomCode: state.roomCode, matchTime: state.matchTime });
    }
  } else if (msg.type === 'input') {
    const p = state.players[msg.id];
    if (p) {
      p.remoteInput = msg.input;
      if (typeof msg.weaponIdx === 'number') p.weaponIdx = msg.weaponIdx;
      if (msg.throwGrenade) spawnGrenade(p);
    }
  } else if (msg.type === 'adjust_time') {
    state.matchTime = Math.max(10, Math.min(3600, state.matchTime + msg.delta));
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
    state.matchTime = msg.matchTime;
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
  Object.values(connections).forEach((c) => { if (c.open) c.send(payload); });
}

// ==========================================================================
// 4. INPUTS (PC KEYBOARD/MOUSE + MOBILE DUAL JOYSTICKS)
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
// 5. SIMULATION, PER-WEAPON AUDIO & 10 WEAPONS / SHIELD / MEDKIT MECHANICS
// ==========================================================================
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
      grenades: state.grenades, gasClouds: state.gasClouds,
      killFeed: state.killFeed, matchTime: state.matchTime
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
      if (Math.random() < 0.5) {
        state.particles.push({
          x: p.x - p.facing * 14, y: p.y + 18,
          vx: (Math.random() - 0.5) * 60, vy: 130,
          life: 0.3, color: Math.random() < 0.5 ? '#f97316' : '#cbd5e1', r: 6
        });
      }
    } else {
      p.jetpacking = false;
      p.vy = Math.min(p.vy + 980 * dt, 680);
    }

    p.aimAngle = Math.atan2(ctrl.aimY, ctrl.aimX);
    p.facing = Math.cos(p.aimAngle) >= 0 ? 1 : -1;
    moveAndCollide(p, dt);

    if (ctrl.shooting) fireWeapon(p, now);
  });

  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    b.x += b.vx; b.y += b.vy; b.life -= dt;

    const hitWall = PLATFORMS.some((pl) => b.x > pl.x && b.x < pl.x + pl.w && b.y > pl.y && b.y < pl.y + pl.h);
    let hitPlayer = null;

    for (const p of Object.values(state.players)) {
      if (p.id !== b.ownerId && p.hp > 0 && Math.abs(b.x - p.x) < 24 && Math.abs(b.y - p.y) < 32) {
        const activeW = WEAPONS[p.weaponIdx];
        const bulletFromFront = Math.cos(p.aimAngle) * b.vx < 0;
        if (activeW && activeW.type === 'shield' && bulletFromFront) {
          state.particles.push({ x: b.x, y: b.y, vx: (Math.random() - 0.5) * 140, vy: -80, life: 0.25, color: '#38bdf8', r: 5 });
          hitPlayer = 'BLOCKED';
        } else {
          hitPlayer = p;
        }
        break;
      }
    }

    if (hitWall || hitPlayer || b.life <= 0) {
      if (b.type === 'rocket') explodeRocket(b.x, b.y, b.ownerId);
      else if (hitPlayer && hitPlayer !== 'BLOCKED') damagePlayer(hitPlayer, b.damage, b.ownerId, b.weaponName);
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
    Object.values(state.players).forEach((p) => {
      if (p.hp > 0 && Math.hypot(p.x - gc.x, p.y - gc.y) < gc.r) {
        damagePlayer(p, 26 * dt, gc.ownerId, 'GAS GRENADE');
      }
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
  playWeaponSound(p, p.weaponIdx);

  if (w.type === 'heal') {
    p.hp = Math.min(p.maxHp, p.hp + 35);
    return;
  }

  if (w.type === 'shield' || w.type === 'melee') {
    const rx = p.x + Math.cos(p.aimAngle) * 40;
    const ry = p.y + Math.sin(p.aimAngle) * 40;
    Object.values(state.players).forEach((t) => {
      if (t.id !== p.id && t.hp > 0 && Math.hypot(t.x - rx, t.y - ry) < 42) {
        damagePlayer(t, w.damage, p.id, w.name);
      }
    });
    return;
  }

  for (let i = 0; i < w.count; i++) {
    const offset = w.count === 2 ? (i === 0 ? -5 : 5) : 0;
    const ang = p.aimAngle + (Math.random() - 0.5) * w.spread;
    state.bullets.push({
      x: p.x + Math.cos(p.aimAngle) * 26,
      y: p.y + Math.sin(p.aimAngle) * 26 + offset,
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
  if (now - p.lastGrenade < 420) return;
  p.lastGrenade = now;
  state.grenades.push({
    x: p.x + p.facing * 20, y: p.y - 8,
    vx: Math.cos(p.aimAngle) * 560, vy: Math.sin(p.aimAngle) * 560 - 140,
    fuse: 1.5, ownerId: p.id
  });
}

function explodeRocket(x, y, ownerId) {
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2, sp = 80 + Math.random() * 200;
    state.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.45, color: i % 2 === 0 ? '#f97316' : '#facc15', r: 9 });
  }
  Object.values(state.players).forEach((p) => {
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
// 6. CAMERA & CANVAS RENDERING
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
  ctx.fillStyle = '#1c211d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-state.camera.x, -state.camera.y);

  ctx.fillStyle = '#252b26';
  ctx.fillRect(0, 0, WORLD.width, 470);
  ctx.fillStyle = '#1b1817';
  ctx.fillRect(0, 470, WORLD.width, WORLD.height - 470);

  for (const pl of PLATFORMS) {
    ctx.fillStyle = pl.type === 'metal' ? '#52585c' : pl.type === 'wood' ? '#7c5233' : pl.type === 'ground' ? '#57534e' : '#292524';
    ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
    ctx.strokeStyle = '#0e110f'; ctx.lineWidth = 3;
    ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
    if (pl.type === 'ground') {
      ctx.fillStyle = '#4d7c0f';
      ctx.fillRect(pl.x, pl.y, pl.w, 8);
    }
  }

  for (const gc of state.gasClouds) {
    const grad = ctx.createRadialGradient(gc.x, gc.y, 10, gc.x, gc.y, gc.r);
    grad.addColorStop(0, 'rgba(34, 197, 94, 0.7)');
    grad.addColorStop(1, 'rgba(22, 163, 74, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(gc.x, gc.y, gc.r, 0, Math.PI * 2); ctx.fill();
  }

  for (const g of state.grenades) {
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(g.x, g.y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
  }

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const pt = state.particles[i];
    pt.x += pt.vx * 0.016; pt.y += pt.vy * 0.016; pt.life -= 0.016;
    ctx.fillStyle = pt.color;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * Math.max(0, pt.life * 2), 0, Math.PI * 2); ctx.fill();
    if (pt.life <= 0) state.particles.splice(i, 1);
  }

  Object.values(state.players).forEach((p) => {
    if (p.hp <= 0) return;
    drawCharacterAndWeapon(p);
  });

  for (const b of state.bullets) {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.type === 'rocket' ? 8 : 4.5, 0, Math.PI * 2);
    ctx.fill();
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

  if (p.jetpacking) {
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-p.facing * 12, 22);
    ctx.lineTo(-p.facing * 18, 38 + Math.random() * 8);
    ctx.lineTo(-p.facing * 6, 22);
    ctx.fill();
  }

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
  document.getElementById('healthBar').style.width = `${Math.max(0, me.hp)}%`;
  document.getElementById('hpText').textContent = `HP ${Math.ceil(me.hp)}`;
  document.getElementById('matchScore').textContent = `KILLS: ${me.kills} • PLAYERS: ${Object.keys(state.players).length}/${MAX_PLAYERS}`;
  document.getElementById('matchTimer').textContent = formatClock(state.matchTime);
  document.getElementById('killFeed').innerHTML = state.killFeed.map((item) => `<div class="kill-item">${item}</div>`).join('');
}
