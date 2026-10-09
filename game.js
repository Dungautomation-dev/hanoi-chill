/**
 * game.js - Core Engine của Hà Nội Chill (Harvest Tales)
 * Kiến trúc Modular: ES6 Modules, Canvas 2D, Web Audio API, Gamepad API
 */

import { CROPS_DATA } from './src/data/CropsData.js';
import { NPCS_DATA } from './src/data/NPCsData.js';
import { RECIPES_DATA, FISH_DATA, QUESTS_DATA } from './src/data/RecipesData.js';

// --- 1. CẤU HÌNH & CANVAS ---
const CANVAS_W = 800;
const CANVAS_H = 480;
const TILE_SIZE = 32; // Mỗi ô 32x32px
const COLS = 25; // 800 / 32
const ROWS = 15; // 480 / 32

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// --- 2. TẢI TÀI NGUYÊN HÌNH ẢNH (ASSETS) ---
const ASSETS = {};
const ASSET_LIST = [
  { name: 'character', src: 'assets/character.png' },
  { name: 'grass', src: 'assets/grass.png' },
  { name: 'tilled_dirt', src: 'assets/tilled_dirt.png' },
  { name: 'plants', src: 'assets/plants.png' },
  { name: 'house', src: 'assets/house.png' },
  { name: 'trees', src: 'assets/trees.png' },
  { name: 'fences', src: 'assets/fences.png' },
  { name: 'decorations', src: 'assets/decorations.png' },
  { name: 'water', src: 'assets/water.png' },
  { name: 'chest', src: 'assets/chest.png' },
  { name: 'tools_and_materials', src: 'assets/tools_and_materials.png' }
];

let assetsLoaded = 0;
let allAssetsReady = false;

function loadAssets(callback) {
  ASSET_LIST.forEach(item => {
    const img = new Image();
    img.src = item.src;
    img.onload = () => {
      ASSETS[item.name] = img;
      assetsLoaded++;
      if (assetsLoaded === ASSET_LIST.length) {
        allAssetsReady = true;
        if (callback) callback();
      }
    };
    img.onerror = () => {
      console.warn(`Lỗi tải ảnh: ${item.src}`);
      assetsLoaded++;
      if (assetsLoaded === ASSET_LIST.length) {
        allAssetsReady = true;
        if (callback) callback();
      }
    };
  });
}

// --- 3. BỘ TỔNG HỢP ÂM THANH RETRO (WEB AUDIO SYNTH) ---
let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

const Sound = {
  playHoe() {
    if (!soundEnabled) return;
    const actx = getAudioContext();
    if (!actx) return;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, actx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.4, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + 0.12);
  },

  playWater() {
    if (!soundEnabled) return;
    const actx = getAudioContext();
    if (!actx) return;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, actx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, actx.currentTime + 0.08);
    osc.frequency.linearRampToValueAtTime(320, actx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.25, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + 0.16);
  },

  playPlant() {
    if (!soundEnabled) return;
    const actx = getAudioContext();
    if (!actx) return;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(260, actx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + 0.1);
  },

  playHarvest() {
    if (!soundEnabled) return;
    const actx = getAudioContext();
    if (!actx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, actx.currentTime + i * 0.05);
      gain.gain.setValueAtTime(0.12, actx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + i * 0.05 + 0.15);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(actx.currentTime + i * 0.05);
      osc.stop(actx.currentTime + i * 0.05 + 0.15);
    });
  },

  playMorning() {
    if (!soundEnabled) return;
    const actx = getAudioContext();
    if (!actx) return;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, actx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.2, actx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(actx.currentTime + i * 0.1);
      osc.stop(actx.currentTime + i * 0.1 + 0.3);
    });
  },

  playCast() {
    if (!soundEnabled) return;
    const actx = getAudioContext();
    if (!actx) return;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, actx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.2, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + 0.18);
  }
};

// --- 4. TRẠNG THÁI TOÀN CỤC (GAME STATE) ---
let gameState = {
  day: 1,
  timeMinutes: 420, // 07:00 AM
  gold: 500,
  energy: 100,
  maxEnergy: 100,
  season: 'MÙA XUÂN',
  weather: '☀️ NẮNG ĐẸP',
  selectedSeedId: 'tomato', // Hạt giống đang gán cho Slot 4
  inventory: {
    wood: 25,
    stone: 15,
    copper_ore: 5,
    iron_ore: 2,
    seeds: {
      tomato: 5,
      corn: 3,
      carrot: 2
    },
    crops: {}
  },
  quests: JSON.parse(JSON.stringify(QUESTS_DATA)),
  tiles: []
};

// Nhân vật chính
let player = {
  x: 7 * TILE_SIZE,
  y: 6 * TILE_SIZE,
  speed: 3.2,
  dir: 0, // 0: Down, 1: Up, 2: Left, 3: Right
  frame: 0,
  animTimer: 0,
  isMoving: false,
  selectedSlot: 0, // 0..5
  swinging: 0
};

// 2 NPC đang có mặt tại trang trại Ba Vì
let npcs = [
  { id: 'bac_ba', col: 14, row: 4, name: 'Bác Ba (Cây Bàng)', avatar: '👴', dir: 0 },
  { id: 'chi_lan', col: 7, row: 2, name: 'Chị Lan (Trà Đá)', avatar: '👩', dir: 2 }
];

// Hiệu ứng hạt & chữ nổi
const particles = [];
const floatingTexts = [];

// Cảnh quan tĩnh
const scenery = {
  house: { x: 2 * TILE_SIZE, y: 1 * TILE_SIZE, w: 96 * 1.8, h: 80 * 1.8 },
  chest: { col: 7, row: 3 },
  trees: [
    { col: 0, row: 8 },
    { col: 0, row: 11 },
    { col: 19, row: 1 },
    { col: 22, row: 1 },
    { col: 22, row: 4 }
  ],
  fences: [
    { col: 2, row: 5 }, { col: 3, row: 5 }, { col: 4, row: 5 }, { col: 5, row: 5 },
    { col: 6, row: 5 }, { col: 7, row: 5 }
  ],
  pond: { minCol: 18, maxCol: 23, minRow: 10, maxRow: 13 }
};

// --- 5. BẢN ĐỒ & TẠO Ô ĐẤT ---
function initMapTiles() {
  const tiles = [];
  for (let c = 0; c < COLS; c++) {
    tiles[c] = [];
    for (let r = 0; r < ROWS; r++) {
      let type = 'grass';
      let isSolid = false;
      let decoration = null;

      // Ao nước
      if (c >= scenery.pond.minCol && c <= scenery.pond.maxCol &&
          r >= scenery.pond.minRow && r <= scenery.pond.maxRow) {
        type = 'water';
        isSolid = true;
      }

      // Nhà ở
      if (c >= 2 && c <= 6 && r >= 1 && r <= 4) isSolid = true;

      // Hàng rào
      if (scenery.fences.some(f => f.col === c && f.row === r)) isSolid = true;

      // Hoa cỏ dại ngẫu nhiên
      if (type === 'grass' && !isSolid && Math.random() < 0.12) {
        decoration = Math.floor(Math.random() * 4);
      }

      tiles[c][r] = {
        type: type,
        tilled: false,
        watered: false,
        isSolid: isSolid,
        decoration: decoration,
        crop: null
      };
    }
  }

  // Luống đất cày sẵn 6x3
  for (let c = 9; c <= 14; c++) {
    for (let r = 6; r <= 9; r++) {
      tiles[c][r].tilled = true;
      tiles[c][r].decoration = null;
    }
  }

  return tiles;
}

// --- 6. HỆ THỐNG LƯU / TẢI GAME (SAVE / LOAD) ---
function saveGame() {
  try {
    const dataToSave = {
      day: gameState.day,
      timeMinutes: gameState.timeMinutes,
      gold: gameState.gold,
      energy: gameState.energy,
      season: gameState.season,
      selectedSeedId: gameState.selectedSeedId,
      inventory: gameState.inventory,
      playerPos: { x: player.x, y: player.y, dir: player.dir, slot: player.selectedSlot },
      tiles: gameState.tiles.map(col => col.map(t => ({
        tilled: t.tilled,
        watered: t.watered,
        crop: t.crop
      })))
    };
    localStorage.setItem('hanoichill_save_v2', JSON.stringify(dataToSave));
    showToast('Đã lưu tiến trình nông trại Hà Nội Chill! 💾');
  } catch (e) {
    console.error('Lỗi khi lưu game:', e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem('hanoichill_save_v2');
    if (raw) {
      const saved = JSON.parse(raw);
      gameState.day = saved.day || 1;
      gameState.timeMinutes = saved.timeMinutes || 420;
      gameState.gold = saved.gold ?? 500;
      gameState.energy = saved.energy ?? 100;
      gameState.season = saved.season || 'MÙA XUÂN';
      gameState.selectedSeedId = saved.selectedSeedId || 'tomato';
      if (saved.inventory) gameState.inventory = saved.inventory;

      if (saved.playerPos) {
        player.x = saved.playerPos.x;
        player.y = saved.playerPos.y;
        player.dir = saved.playerPos.dir || 0;
        player.selectedSlot = saved.playerPos.slot || 0;
      }

      gameState.tiles = initMapTiles();
      if (saved.tiles && saved.tiles.length === COLS) {
        for (let c = 0; c < COLS; c++) {
          for (let r = 0; r < ROWS; r++) {
            if (saved.tiles[c][r]) {
              gameState.tiles[c][r].tilled = saved.tiles[c][r].tilled;
              gameState.tiles[c][r].watered = saved.tiles[c][r].watered;
              gameState.tiles[c][r].crop = saved.tiles[c][r].crop;
            }
          }
        }
      }
      return true;
    }
  } catch (e) {
    console.warn('Lỗi đọc file save, khởi tạo mới:', e);
  }
  gameState.tiles = initMapTiles();
  return false;
}

// --- 7. ĐI NGỦ (QUA NGÀY MỚI) ---
let isSleeping = false;
let sleepFadeAlpha = 0;

function sleepNextDay() {
  if (isSleeping) return;
  isSleeping = true;
  showToast('Đang nghỉ ngơi... Một ngày mới thanh bình ở Ba Vì 🌅');

  let fadeStep = 0.05;
  const fadeInterval = setInterval(() => {
    sleepFadeAlpha += fadeStep;
    if (sleepFadeAlpha >= 1) {
      clearInterval(fadeInterval);

      gameState.day += 1;
      gameState.timeMinutes = 360; // 06:00 AM
      gameState.energy = 100;

      // Sinh trưởng cây trồng
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
          const tile = gameState.tiles[c][r];
          if (tile.crop && tile.watered) {
            if (tile.crop.stage < 5) {
              tile.crop.stage += 1;
            }
          }
          tile.watered = false; // Đất khô lại
        }
      }

      saveGame();
      Sound.playMorning();
      updateHUD();

      const unfadeInterval = setInterval(() => {
        sleepFadeAlpha -= fadeStep;
        if (sleepFadeAlpha <= 0) {
          sleepFadeAlpha = 0;
          isSleeping = false;
          clearInterval(unfadeInterval);
        }
      }, 30);
    }
  }, 30);
}

// --- 8. ĐIỀU KHIỂN & INPUT ---
const keys = { w: false, a: false, s: false, d: false, space: false };
let actionRequested = false;

window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'w' || e.key === 'ArrowUp') keys.w = true;
  if (k === 'a' || e.key === 'ArrowLeft') keys.a = true;
  if (k === 's' || e.key === 'ArrowDown') keys.s = true;
  if (k === 'd' || e.key === 'ArrowRight') keys.d = true;

  if (e.key === ' ' || k === 'space') {
    if (!keys.space) actionRequested = true;
    keys.space = true;
    e.preventDefault();
  }

  // Phím số 1..6 đổi công cụ
  if (['1', '2', '3', '4', '5', '6'].includes(k)) {
    player.selectedSlot = parseInt(k) - 1;
    updateHotbarUI();
  }

  // Phím E mở Túi đồ
  if (k === 'e') {
    openInventoryModal();
  }

  // Phím ESC đóng modal hoặc hộp thoại
  if (k === 'escape') {
    closeAllModals();
    closeDialogue();
  }
});

window.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (k === 'w' || e.key === 'ArrowUp') keys.w = false;
  if (k === 'a' || e.key === 'ArrowLeft') keys.a = false;
  if (k === 's' || e.key === 'ArrowDown') keys.s = false;
  if (k === 'd' || e.key === 'ArrowRight') keys.d = false;
  if (e.key === ' ' || k === 'space') keys.space = false;
});

// Tương tác chuột
let mouseTile = null;
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;
  const c = Math.floor(mx / TILE_SIZE);
  const r = Math.floor(my / TILE_SIZE);
  if (c >= 0 && c < COLS && r >= 0 && r < ROWS) {
    mouseTile = { col: c, row: r };
  } else {
    mouseTile = null;
  }
});

canvas.addEventListener('click', () => {
  if (mouseTile) {
    interactWithTile(mouseTile.col, mouseTile.row);
  }
});

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  if (e.deltaY > 0) {
    player.selectedSlot = (player.selectedSlot + 1) % 6;
  } else {
    player.selectedSlot = (player.selectedSlot - 1 + 6) % 6;
  }
  updateHotbarUI();
});

// Tay cầm (Gamepad API)
let gpPrevButtons = {};
function pollGamepad() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  if (!gamepads || !gamepads[0]) return;
  const gp = gamepads[0];

  const ax = gp.axes[0] || 0;
  const ay = gp.axes[1] || 0;
  keys.w = gp.buttons[12]?.pressed || ay < -0.4;
  keys.s = gp.buttons[13]?.pressed || ay > 0.4;
  keys.a = gp.buttons[14]?.pressed || ax < -0.4;
  keys.d = gp.buttons[15]?.pressed || ax > 0.4;

  const btnA = gp.buttons[0]?.pressed;
  if (btnA && !gpPrevButtons[0]) actionRequested = true;
  gpPrevButtons[0] = btnA;

  const btnLB = gp.buttons[4]?.pressed;
  if (btnLB && !gpPrevButtons[4]) {
    player.selectedSlot = (player.selectedSlot - 1 + 6) % 6;
    updateHotbarUI();
  }
  gpPrevButtons[4] = btnLB;

  const btnRB = gp.buttons[5]?.pressed;
  if (btnRB && !gpPrevButtons[5]) {
    player.selectedSlot = (player.selectedSlot + 1) % 6;
    updateHotbarUI();
  }
  gpPrevButtons[5] = btnRB;

  const btnY = gp.buttons[3]?.pressed; // Nút Y mở túi đồ
  if (btnY && !gpPrevButtons[3]) openInventoryModal();
  gpPrevButtons[3] = btnY;

  const btnStart = gp.buttons[9]?.pressed;
  if (btnStart && !gpPrevButtons[9]) sleepNextDay();
  gpPrevButtons[9] = btnStart;

  const btnSelect = gp.buttons[8]?.pressed;
  if (btnSelect && !gpPrevButtons[8]) saveGame();
  gpPrevButtons[8] = btnSelect;
}

// --- 9. LOGIC TƯƠNG TÁC (FARMING, FISHING, NPC) ---
function getFrontTile() {
  const pc = Math.floor((player.x + 16) / TILE_SIZE);
  const pr = Math.floor((player.y + 24) / TILE_SIZE);
  let tc = pc;
  let tr = pr;
  if (player.dir === 0) tr += 1;
  if (player.dir === 1) tr -= 1;
  if (player.dir === 2) tc -= 1;
  if (player.dir === 3) tc += 1;

  if (tc >= 0 && tc < COLS && tr >= 0 && tr < ROWS) {
    return { col: tc, row: tr };
  }
  return null;
}

function interactWithTile(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;

  // Kiểm tra tương tác với NPC gần đó
  const npcNear = npcs.find(n => n.col === col && n.row === row);
  if (npcNear) {
    openDialogue(npcNear.id);
    return;
  }

  const tile = gameState.tiles[col][row];

  // Nếu đang cầm CẦN CÂU (Slot 3) và ô đối diện là ao nước
  if (player.selectedSlot === 3 && tile.type === 'water') {
    startFishing();
    return;
  }

  if (tile.isSolid) return;

  player.swinging = 12;
  const px = col * TILE_SIZE + 16;
  const py = row * TILE_SIZE + 16;

  switch (player.selectedSlot) {
    case 0: // CUỐC ĐẤT (HOE)
      if (!tile.tilled && tile.type === 'grass') {
        tile.tilled = true;
        tile.decoration = null;
        Sound.playHoe();
        spawnDustParticles(px, py, '#8a5b28');
        consumeEnergy(2);
      }
      break;

    case 1: // BÌNH TƯỚI (WATERING CAN)
      if (tile.tilled && !tile.watered) {
        tile.watered = true;
        Sound.playWater();
        spawnWaterParticles(px, py);
        consumeEnergy(1);
      }
      break;

    case 2: // RÌU ĐỐN CỦI (AXE)
      if (tile.decoration !== null) {
        tile.decoration = null;
        gameState.inventory.wood = (gameState.inventory.wood || 0) + 2;
        Sound.playHoe();
        spawnDustParticles(px, py, '#5c7a29');
        showToast('Nhặt được +2 Gỗ! 🪵');
        consumeEnergy(2);
      } else if (tile.tilled && !tile.crop) {
        tile.tilled = false; // Phẳng lại cỏ
        Sound.playHoe();
      }
      break;

    case 3: // CẦN CÂU CÁ (Nếu click ngoài nước)
      showToast('Hãy hướng cần câu về phía bờ ao để câu cá! 🎣');
      break;

    case 4: // GIEO HẠT GIỐNG ĐANG CHỌN
      if (tile.tilled && !tile.crop) {
        const seedId = gameState.selectedSeedId || 'tomato';
        const cropInfo = CROPS_DATA[seedId] || CROPS_DATA.tomato;
        const seedCount = gameState.inventory.seeds[seedId] || 0;

        if (seedCount > 0) {
          tile.crop = { type: seedId, stage: 0 };
          gameState.inventory.seeds[seedId]--;
          Sound.playPlant();
          spawnDustParticles(px, py, '#38a169');
          showToast(`Đã gieo 1 hạt giống ${cropInfo.name}! 🌱`);
          updateHotbarUI();
        } else {
          showToast(`Hết hạt giống ${cropInfo.name}! Hãy vào Cửa hàng Cô Mai mua thêm.`);
        }
      }
      break;

    case 5: // THU HOẠCH / NHẶT NÔNG SẢN (HAND)
      if (tile.crop && tile.crop.stage === 5) {
        const cropInfo = CROPS_DATA[tile.crop.type] || CROPS_DATA.tomato;
        const reward = cropInfo.sellPrice;

        gameState.gold += reward;
        gameState.inventory.crops[tile.crop.type] = (gameState.inventory.crops[tile.crop.type] || 0) + 1;

        if (cropInfo.regrows) {
          tile.crop.stage = 3; // Quay lại giai đoạn ra hoa
        } else {
          tile.crop = null;
        }

        Sound.playHarvest();
        floatingTexts.push({
          text: `+${reward}G`,
          x: px,
          y: py - 10,
          alpha: 1,
          color: '#ffd700'
        });
        spawnSparkles(px, py);
        showToast(`Thu hoạch ${cropInfo.name}! (+${reward} Gold 🪙)`);
        updateHUD();
      }
      break;
  }
}

function consumeEnergy(amount) {
  gameState.energy = Math.max(0, gameState.energy - amount);
  updateHUD();
  if (gameState.energy === 0) {
    showToast('Bạn đã kiệt sức! Hãy đi ngủ để hồi phục 🛌');
  }
}

// --- 10. MINIGAME CÂU CÁ (FISHING MINIGAME) ---
let isFishingActive = false;
let fishingFishPos = 50; // 0..100
let fishingBarPos = 50;  // 0..100
let fishingProgress = 35; // 0..100
let fishVelocity = 1;

function startFishing() {
  if (isFishingActive) return;
  isFishingActive = true;
  Sound.playCast();
  showToast('Đang quăng cần câu xuống hồ... Chờ cá cắn câu! 🎣');

  setTimeout(() => {
    // Cá cắn câu -> Mở minigame
    const overlay = document.getElementById('fishing-box');
    if (overlay) overlay.style.display = 'block';
    fishingProgress = 35;
    runFishingLoop();
  }, 1200);
}

function runFishingLoop() {
  if (!isFishingActive) return;

  // Cá di chuyển ngẫu nhiên
  fishingFishPos += fishVelocity * (Math.random() * 3 + 1);
  if (fishingFishPos > 85) { fishingFishPos = 85; fishVelocity = -1; }
  if (fishingFishPos < 15) { fishingFishPos = 15; fishVelocity = 1; }
  if (Math.random() < 0.05) fishVelocity *= -1;

  // Thanh xanh được kéo lên nếu người chơi giữ SPACE hoặc Chuột
  if (keys.space) {
    fishingBarPos = Math.max(0, fishingBarPos - 2.8);
  } else {
    fishingBarPos = Math.min(80, fishingBarPos + 2.2); // Trọng lực rơi xuống
  }

  // Kiểm tra thanh xanh có bắt trúng cá không
  const isCatching = Math.abs(fishingBarPos - fishingFishPos) < 22;
  if (isCatching) {
    fishingProgress = Math.min(100, fishingProgress + 0.6);
  } else {
    fishingProgress = Math.max(0, fishingProgress - 0.4);
  }

  // Cập nhật DOM
  const greenBar = document.getElementById('fishing-green-bar');
  const fishIcon = document.getElementById('fishing-fish-icon');
  const fill = document.getElementById('fishing-progress-fill');

  if (greenBar) greenBar.style.top = `${fishingBarPos * 1.3}px`;
  if (fishIcon) fishIcon.style.top = `${fishingFishPos * 1.3}px`;
  if (fill) fill.style.height = `${fishingProgress}%`;

  if (fishingProgress >= 100) {
    // Câu thành công!
    endFishing(true);
  } else if (fishingProgress <= 0) {
    // Cá chạy mất
    endFishing(false);
  } else {
    requestAnimationFrame(runFishingLoop);
  }
}

function endFishing(success) {
  isFishingActive = false;
  const overlay = document.getElementById('fishing-box');
  if (overlay) overlay.style.display = 'none';

  if (success) {
    const randomFish = FISH_DATA[Math.floor(Math.random() * FISH_DATA.length)];
    gameState.gold += randomFish.price;
    Sound.playHarvest();
    showToast(`Tuyệt vời! Bạn câu được 1 con ${randomFish.name}! (+${randomFish.price} Gold) 🐟`);
    updateHUD();
  } else {
    showToast('Cá đã giật mạnh và bơi mất! Hãy thử lại lần sau nhé. 🌊');
  }
}

// --- 11. HỘP THOẠI NPC (DIALOGUE SYSTEM) ---
let currentNpcId = null;

function openDialogue(npcId) {
  currentNpcId = npcId;
  const npc = NPCS_DATA.find(n => n.id === npcId);
  if (!npc) return;

  const box = document.getElementById('dialogue-box');
  const nameEl = document.getElementById('dialogue-name');
  const textEl = document.getElementById('dialogue-text');
  const avatarEl = document.getElementById('dialogue-avatar');

  if (box && nameEl && textEl && avatarEl) {
    nameEl.innerText = `${npc.name} (${npc.role})`;
    textEl.innerText = npc.dialogues.morning;
    avatarEl.innerText = npc.avatar;
    box.style.display = 'flex';
  }
}

function closeDialogue() {
  const box = document.getElementById('dialogue-box');
  if (box) box.style.display = 'none';
  currentNpcId = null;
}

// --- 12. CÁC CỬA SỔ MODAL (SHOP / CRAFTING / INVENTORY / QUESTS) ---
function openModal(title, contentHtml) {
  const backdrop = document.getElementById('modal-backdrop');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  if (backdrop && titleEl && bodyEl) {
    titleEl.innerText = title;
    bodyEl.innerHTML = contentHtml;
    backdrop.style.display = 'flex';
  }
}

function closeAllModals() {
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) backdrop.style.display = 'none';
}

function openShopModal() {
  let html = `<div class="modal-grid-cards">`;
  Object.values(CROPS_DATA).forEach(c => {
    html += `
      <div class="modal-item-card">
        <div class="card-icon">🌱</div>
        <div class="card-info">
          <div class="card-title">Hạt ${c.name}</div>
          <div class="card-desc">${c.description}</div>
          <div style="font-size:8px; color:#c53030; margin-bottom:6px;">Giá: 🪙 ${c.seedPrice} G | Thu hoạch: 🪙 ${c.sellPrice} G</div>
          <button class="wood-btn btn-sm btn-buy-seed" data-crop="${c.id}">MUA HẠT (🪙 ${c.seedPrice}G)</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  openModal('Tiệm Bách Hóa Cô Mai - Mua Hạt Giống', html);

  // Gán sự kiện mua
  document.querySelectorAll('.btn-buy-seed').forEach(btn => {
    btn.addEventListener('click', () => {
      const cropId = btn.getAttribute('data-crop');
      const cropInfo = CROPS_DATA[cropId];
      if (gameState.gold >= cropInfo.seedPrice) {
        gameState.gold -= cropInfo.seedPrice;
        gameState.inventory.seeds[cropId] = (gameState.inventory.seeds[cropId] || 0) + 1;
        gameState.selectedSeedId = cropId; // Chọn luôn hạt này
        Sound.playPlant();
        updateHUD();
        updateHotbarUI();
        showToast(`Đã mua 1 túi hạt ${cropInfo.name}!`);
      } else {
        showToast('Bạn không đủ tiền mua hạt giống này!');
      }
    });
  });
}

function openCraftingModal() {
  let html = `<div class="modal-grid-cards">`;
  RECIPES_DATA.forEach(r => {
    const matStr = Object.entries(r.materials).map(([k, v]) => `${v} ${k}`).join(', ');
    html += `
      <div class="modal-item-card">
        <div class="card-icon">${r.icon}</div>
        <div class="card-info">
          <div class="card-title">${r.name}</div>
          <div class="card-desc">${r.description}</div>
          <div style="font-size:8px; color:#2b6cb0; margin-bottom:6px;">Yêu cầu: ${matStr}</div>
          <button class="wood-btn btn-sm btn-craft" data-recipe="${r.id}">CHẾ TẠO</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  openModal('Bàn Chế Tạo Nông Cụ Ba Vì', html);

  document.querySelectorAll('.btn-craft').forEach(btn => {
    btn.addEventListener('click', () => {
      const recId = btn.getAttribute('data-recipe');
      const recipe = RECIPES_DATA.find(r => r.id === recId);
      // Kiểm tra nguyên liệu
      let canCraft = true;
      for (const [mat, req] of Object.entries(recipe.materials)) {
        if ((gameState.inventory[mat] || 0) < req) {
          canCraft = false; break;
        }
      }
      if (canCraft) {
        for (const [mat, req] of Object.entries(recipe.materials)) {
          gameState.inventory[mat] -= req;
        }
        Sound.playHarvest();
        showToast(`Chế tạo thành công: ${recipe.name}! 🎉`);
      } else {
        showToast('Không đủ nguyên liệu để chế tạo món này!');
      }
    });
  });
}

function openInventoryModal() {
  let seedsHtml = Object.entries(gameState.inventory.seeds)
    .filter(([_, count]) => count > 0)
    .map(([id, count]) => `<div>🌱 <b>${CROPS_DATA[id]?.name || id}</b>: ${count} túi <button class="wood-btn btn-sm btn-equip-seed" data-id="${id}">CHỌN</button></div>`)
    .join('') || 'Chưa có hạt giống nào.';

  let cropsHtml = Object.entries(gameState.inventory.crops)
    .filter(([_, count]) => count > 0)
    .map(([id, count]) => `<div>🌾 <b>${CROPS_DATA[id]?.name || id}</b>: ${count} quả</div>`)
    .join('') || 'Chưa có nông sản thu hoạch.';

  const html = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="background:#e9ca93; padding:10px; border-radius:6px; border:2px solid #7c441b;">
        <h3 style="font-size:11px; margin-bottom:6px; color:#7c2d12;">📦 Nguyên Liệu Thu Thập:</h3>
        <div>🪵 Gỗ: ${gameState.inventory.wood || 0} | 🪨 Đá: ${gameState.inventory.stone || 0} | 🪨 Đồng: ${gameState.inventory.copper_ore || 0} | ⚙️ Sắt: ${gameState.inventory.iron_ore || 0}</div>
      </div>
      <div style="background:#e9ca93; padding:10px; border-radius:6px; border:2px solid #7c441b;">
        <h3 style="font-size:11px; margin-bottom:6px; color:#7c2d12;">🌱 Túi Hạt Giống (Chọn hạt cho Slot 5):</h3>
        ${seedsHtml}
      </div>
      <div style="background:#e9ca93; padding:10px; border-radius:6px; border:2px solid #7c441b;">
        <h3 style="font-size:11px; margin-bottom:6px; color:#7c2d12;">🍅 Nông Sản Thu Hoạch:</h3>
        ${cropsHtml}
      </div>
    </div>
  `;
  openModal('Túi Đồ Trang Trại (Ba Lô)', html);

  document.querySelectorAll('.btn-equip-seed').forEach(btn => {
    btn.addEventListener('click', () => {
      gameState.selectedSeedId = btn.getAttribute('data-id');
      updateHotbarUI();
      closeAllModals();
      showToast(`Đã gán hạt ${CROPS_DATA[gameState.selectedSeedId].name} vào thanh công cụ!`);
    });
  });
}

function openQuestsModal() {
  let html = `<div style="display:flex; flex-direction:column; gap:10px;">`;
  QUESTS_DATA.forEach(q => {
    html += `
      <div style="background:#e9ca93; padding:12px; border-radius:6px; border:2px solid #7c441b;">
        <div style="font-size:11px; font-weight:bold; color:#7c2d12; margin-bottom:4px;">📜 ${q.title}</div>
        <div style="font-size:9px; color:#5c3818; margin-bottom:6px;">${q.description}</div>
        <div style="font-size:8px; color:#22543d; font-weight:bold;">Phần thưởng: 🪙 ${q.rewardGold} G</div>
      </div>
    `;
  });
  html += `</div>`;
  openModal('Nhật Ký Nhiệm Vụ Nông Thôn', html);
}

// --- 13. HIỆU ỨNG HẠT (PARTICLES) ---
function spawnDustParticles(x, y, color) {
  for (let i = 0; i < 6; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 16,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 2 - 0.5,
      size: Math.random() * 3 + 2,
      color: color,
      life: 20
    });
  }
}

function spawnWaterParticles(x, y) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 2.5 - 1,
      size: Math.random() * 2 + 2,
      color: '#4299e1',
      life: 18
    });
  }
}

function spawnSparkles(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      size: Math.random() * 3 + 1,
      color: '#f6e05e',
      life: 25
    });
  }
}

// --- 14. VẼ ĐỒ HỌA TOÀN BỘ (RENDER PIPELINE) ---
let waterFrame = 0;
let waterTimer = 0;

function renderGame() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  waterTimer++;
  if (waterTimer > 25) {
    waterFrame = (waterFrame + 1) % 4;
    waterTimer = 0;
  }

  // 1. VẼ NỀN & AO NƯỚC & ĐẤT CÀY
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const tile = gameState.tiles[c][r];
      const dx = c * TILE_SIZE;
      const dy = r * TILE_SIZE;

      if (tile.type === 'water') {
        if (ASSETS.water) {
          ctx.drawImage(ASSETS.water, waterFrame * 16, 0, 16, 16, dx, dy, TILE_SIZE, TILE_SIZE);
        } else {
          ctx.fillStyle = '#3182ce';
          ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
        }
      } else {
        if (ASSETS.grass) {
          ctx.drawImage(ASSETS.grass, 16, 16, 16, 16, dx, dy, TILE_SIZE, TILE_SIZE);
        } else {
          ctx.fillStyle = '#68d391';
          ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
        }

        if (tile.tilled) {
          if (ASSETS.tilled_dirt) {
            ctx.drawImage(ASSETS.tilled_dirt, 0, 0, 16, 16, dx, dy, TILE_SIZE, TILE_SIZE);
          } else {
            ctx.fillStyle = tile.watered ? '#5c3a21' : '#a07855';
            ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
          }

          if (tile.watered) {
            ctx.fillStyle = 'rgba(50, 25, 10, 0.42)';
            ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
          }
        }

        if (tile.decoration !== null && ASSETS.decorations) {
          const decX = tile.decoration * 16;
          ctx.drawImage(ASSETS.decorations, decX, 0, 16, 16, dx + 4, dy + 4, 24, 24);
        }
      }
    }
  }

  // 2. VẼ CÂY TRỒNG
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const tile = gameState.tiles[c][r];
      if (tile.crop && ASSETS.plants) {
        const dx = c * TILE_SIZE;
        const dy = r * TILE_SIZE;
        const stage = tile.crop.stage;
        const cropInfo = CROPS_DATA[tile.crop.type] || CROPS_DATA.tomato;
        const rowY = cropInfo.spriteRow * 16;
        ctx.drawImage(ASSETS.plants, stage * 16, rowY, 16, 16, dx, dy - 6, TILE_SIZE, TILE_SIZE + 6);
      }
    }
  }

  // 3. CẢNH QUAN TĨNH
  if (ASSETS.fences) {
    scenery.fences.forEach(f => {
      ctx.drawImage(ASSETS.fences, 0, 0, 16, 16, f.col * TILE_SIZE, f.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
  }

  if (ASSETS.house) {
    ctx.drawImage(ASSETS.house, 0, 0, 96, 80, scenery.house.x, scenery.house.y, scenery.house.w, scenery.house.h);
  }

  if (ASSETS.chest) {
    ctx.drawImage(ASSETS.chest, 0, 0, 16, 16, scenery.chest.col * TILE_SIZE, scenery.chest.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  if (ASSETS.trees) {
    scenery.trees.forEach(t => {
      ctx.drawImage(ASSETS.trees, 0, 0, 48, 56, t.col * TILE_SIZE - 16, t.row * TILE_SIZE - 40, 64, 76);
    });
  }

  // 4. VẼ CÁC NPC ĐANG HIỆN DIỆN
  npcs.forEach(n => {
    const nx = n.col * TILE_SIZE;
    const ny = n.row * TILE_SIZE;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(nx + 16, ny + 30, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(n.avatar, nx + 16, ny + 24);

    // Tên NPC trên đầu
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffdf79';
    ctx.fillText(n.name.split(' ')[0], nx + 16, ny - 6);
  });

  // 5. TIÊU ĐIỂM Ô TƯƠNG TÁC
  const target = getFrontTile();
  if (target) {
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
    ctx.lineWidth = 2;
    ctx.strokeRect(target.col * TILE_SIZE, target.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  // 6. NHÂN VẬT CHÍNH
  drawPlayer();

  // 7. HIỆU ỨNG HẠT & CHỮ NỔI
  renderParticles();
  renderFloatingTexts();

  // 8. ÁNH SÁNG NGÀY & ĐÊM
  renderDayNightLighting();

  // 9. MÀN ĐEN KHI ĐI NGỦ
  if (sleepFadeAlpha > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${sleepFadeAlpha})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
}

function drawPlayer() {
  if (!ASSETS.character) {
    ctx.fillStyle = '#f56565';
    ctx.fillRect(player.x, player.y, 24, 32);
    return;
  }

  let frameCol = 0;
  if (player.isMoving) {
    player.animTimer += 1;
    if (player.animTimer > 8) {
      player.frame = (player.frame + 1) % 4;
      player.animTimer = 0;
    }
    frameCol = player.frame;
  } else {
    player.frame = 0;
    frameCol = 0;
  }

  const frameRow = player.dir;
  const sx = frameCol * 48;
  const sy = frameRow * 48;

  // Đổ bóng
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(player.x + 16, player.y + 36, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.drawImage(ASSETS.character, sx, sy, 48, 48, player.x - 8, player.y - 12, 48, 48);

  if (player.swinging > 0) {
    player.swinging--;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(player.x + 16, player.y + 16, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function renderParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function renderFloatingTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 0.6;
    ft.alpha -= 0.02;
    ctx.save();
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.fillText(ft.text, ft.x - 12, ft.y);
    ctx.restore();
    if (ft.alpha <= 0) floatingTexts.splice(i, 1);
  }
}

function renderDayNightLighting() {
  const mins = gameState.timeMinutes;
  let ambientColor = null;

  if (mins >= 1020 && mins < 1170) {
    const t = (mins - 1020) / 150;
    ambientColor = `rgba(237, 137, 54, ${t * 0.28})`;
  } else if (mins >= 1170 || mins < 360) {
    ambientColor = 'rgba(26, 32, 44, 0.38)';
  }

  if (ambientColor) {
    ctx.fillStyle = ambientColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
}

// --- 15. VẬT LÝ & VA CHẠM ---
function updatePhysics() {
  if (isSleeping || isFishingActive) return;

  let dx = 0;
  let dy = 0;

  if (keys.w) { dy -= player.speed; player.dir = 1; }
  if (keys.s) { dy += player.speed; player.dir = 0; }
  if (keys.a) { dx -= player.speed; player.dir = 2; }
  if (keys.d) { dx += player.speed; player.dir = 3; }

  player.isMoving = (dx !== 0 || dy !== 0);

  const nextX = Math.max(8, Math.min(CANVAS_W - 32, player.x + dx));
  const nextY = Math.max(8, Math.min(CANVAS_H - 42, player.y + dy));

  const checkCol = Math.floor((nextX + 16) / TILE_SIZE);
  const checkRow = Math.floor((nextY + 28) / TILE_SIZE);

  if (checkCol >= 0 && checkCol < COLS && checkRow >= 0 && checkRow < ROWS) {
    const tile = gameState.tiles[checkCol][checkRow];
    if (!tile || !tile.isSolid) {
      player.x = nextX;
      player.y = nextY;
    }
  }

  if (actionRequested) {
    const target = getFrontTile();
    if (target) interactWithTile(target.col, target.row);
    actionRequested = false;
  }
}

// --- 16. CẬP NHẬT HUD & ĐỒNG HỒ ---
function updateGameClock() {
  if (isSleeping) return;
  gameState.timeMinutes += 0.25;
  if (gameState.timeMinutes >= 1440) gameState.timeMinutes = 0;

  const totalMins = Math.floor(gameState.timeMinutes);
  let hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const timeStr = `${String(displayHours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;

  const timeEl = document.getElementById('hud-time');
  if (timeEl) timeEl.innerText = `⏰ ${timeStr}`;
}

function updateHUD() {
  const dayEl = document.getElementById('hud-day');
  if (dayEl) dayEl.innerText = `NGÀY ${gameState.day}`;

  const goldEl = document.getElementById('hud-gold');
  if (goldEl) goldEl.innerText = `🪙 ${gameState.gold} G`;

  const energyEl = document.getElementById('hud-energy');
  if (energyEl) {
    energyEl.innerText = `⚡ NĂNG LƯỢNG: ${gameState.energy}/100`;
    energyEl.style.color = gameState.energy > 30 ? '#228b22' : '#e53e3e';
  }

  const seedNameEl = document.getElementById('hotbar-seed-name');
  if (seedNameEl) {
    const curSeed = CROPS_DATA[gameState.selectedSeedId] || CROPS_DATA.tomato;
    const count = gameState.inventory.seeds[gameState.selectedSeedId] || 0;
    seedNameEl.innerText = `${curSeed.name.split(' ')[0]} (${count})`;
  }
}

function updateHotbarUI() {
  document.querySelectorAll('.hotbar-slot').forEach(slot => {
    const idx = parseInt(slot.getAttribute('data-slot'));
    if (idx === player.selectedSlot) {
      slot.classList.add('active');
    } else {
      slot.classList.remove('active');
    }
  });
  updateHUD();
}

function renderHotbarIcons() {
  for (let slot = 0; slot < 6; slot++) {
    const c = document.getElementById(`icon-slot-${slot}`);
    if (!c) continue;
    const cctx = c.getContext('2d');
    cctx.imageSmoothingEnabled = false;
    cctx.clearRect(0, 0, 32, 32);

    switch (slot) {
      case 0: // Cuốc (Hoe)
        if (ASSETS.tools_and_materials) {
          cctx.drawImage(ASSETS.tools_and_materials, 0, 0, 16, 16, 4, 4, 24, 24);
        }
        break;
      case 1: // Bình tưới (Watering Can)
        if (ASSETS.tools_and_materials) {
          cctx.drawImage(ASSETS.tools_and_materials, 16, 0, 16, 16, 4, 4, 24, 24);
        }
        break;
      case 2: // Rìu (Axe)
        if (ASSETS.tools_and_materials) {
          cctx.drawImage(ASSETS.tools_and_materials, 32, 0, 16, 16, 4, 4, 24, 24);
        }
        break;
      case 3: // Cần câu (Fishing Rod)
        cctx.font = '20px Arial';
        cctx.fillText('🎣', 4, 24);
        break;
      case 4: // Hạt giống đang chọn
        if (ASSETS.plants) {
          const curCrop = CROPS_DATA[gameState.selectedSeedId] || CROPS_DATA.tomato;
          const rY = curCrop.spriteRow * 16;
          cctx.drawImage(ASSETS.plants, 80, rY, 16, 16, 4, 4, 24, 24);
        }
        break;
      case 5: // Tay thu hoạch (Hand)
        cctx.font = '20px Arial';
        cctx.fillText('🖐️', 4, 24);
        break;
    }
  }
}

let toastTimeout = null;
function showToast(msg) {
  const toast = document.getElementById('toast-msg');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// --- 17. SỰ KIỆN GIAO DIỆN & MODAL ---
function setupUIEvents() {
  document.getElementById('btn-inventory')?.addEventListener('click', openInventoryModal);
  document.getElementById('btn-shop')?.addEventListener('click', openShopModal);
  document.getElementById('btn-crafting')?.addEventListener('click', openCraftingModal);
  document.getElementById('btn-quests')?.addEventListener('click', openQuestsModal);
  document.getElementById('btn-sleep')?.addEventListener('click', sleepNextDay);
  document.getElementById('btn-modal-close')?.addEventListener('click', closeAllModals);

  document.getElementById('btn-dialogue-close')?.addEventListener('click', closeDialogue);
  document.getElementById('btn-dialogue-gift')?.addEventListener('click', () => {
    showToast('Bạn đã tặng một món quà ý nghĩa! Điểm thân thiết tăng thêm ❤️!');
    closeDialogue();
  });

  const soundBtn = document.getElementById('btn-sound');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.innerText = soundEnabled ? '🔊 ÂM THANH' : '🔇 TẮT ÂM';
      showToast(soundEnabled ? 'Đã bật âm thanh retro!' : 'Đã tắt âm thanh');
    });
  }

  document.querySelectorAll('.hotbar-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      player.selectedSlot = parseInt(slot.getAttribute('data-slot'));
      updateHotbarUI();
    });
  });
}

// --- 18. GAME LOOP ---
function gameLoop() {
  pollGamepad();
  updatePhysics();
  updateGameClock();
  renderGame();
  requestAnimationFrame(gameLoop);
}

// Bắt đầu khởi động
loadAssets(() => {
  loadGame();
  setupUIEvents();
  updateHUD();
  updateHotbarUI();
  renderHotbarIcons();
  showToast('Chào mừng bạn đến với nông trại Hà Nội Chill! 🌾');
  requestAnimationFrame(gameLoop);
});
