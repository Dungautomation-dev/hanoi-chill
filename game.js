/**
 * HNChill - Nông Trại Hà Nội (Stardew Valley Edition)
 * Game Engine: Pure HTML5 Canvas 2D + Pixel-Art Spritesheets + Web Audio Synth
 */

(function () {
  'use strict';

  // --- 1. HẰNG SỐ & CẤU HÌNH ---
  const CANVAS_W = 800;
  const CANVAS_H = 480;
  const TILE_SIZE = 32; // Mỗi ô hiển thị 32x32 px (scale 2x từ tile gốc 16x16)
  const COLS = 25; // 800 / 32
  const ROWS = 15; // 480 / 32

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false; // Bắt buộc để pixel art luôn sắc nét!

  // --- 2. TẢI TÀI NGUYÊN HÌNH ẢNH (SPRITESHEETS) ---
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
    { name: 'tools', src: 'assets/tools.png' },
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

  // --- 3. BỘ TỔNG HỢP ÂM THANH RETRO (WEB AUDIO SYNTHESIZER) ---
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
      // Tiếng cuốc xới đất giòn giã (Noise burst + Low thud)
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
      // Tiếng nước tưới rào rào êm tai
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
      // Tiếng gieo hạt
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
      // Tiếng chuông thu hoạch ting ting vàng (Chime arpeggio)
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
      // Điệu thức buổi sáng thức dậy (Morning harp jingle)
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
    }
  };

  // --- 4. TRẠNG THÁI DỮ LIỆU GAME (STATE) ---
  let gameState = {
    day: 1,
    timeMinutes: 420, // 07:00 AM (420 phút)
    gold: 500,
    energy: 100,
    season: 'MÙA XUÂN',
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
    swinging: 0 // Hiệu ứng vung tay khi hành động
  };

  // Hạt bụi và hiệu ứng nổi (Particles & Floating texts)
  const particles = [];
  const floatingTexts = [];

  // Mảng tĩnh chứa các vật cản bản đồ (Obstacles & Scenery)
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
      // Hàng rào quây xung quanh khu đất
      { col: 2, row: 5 }, { col: 3, row: 5 }, { col: 4, row: 5 }, { col: 5, row: 5 },
      { col: 6, row: 5 }, { col: 7, row: 5 }
    ],
    pond: {
      minCol: 18, maxCol: 23,
      minRow: 10, maxRow: 13
    }
  };

  // --- 5. KHỞI TẠO BẢN ĐỒ (MAP GENERATION) ---
  function initMapTiles() {
    const tiles = [];
    for (let c = 0; c < COLS; c++) {
      tiles[c] = [];
      for (let r = 0; r < ROWS; r++) {
        let type = 'grass';
        let isSolid = false;
        let decoration = null;

        // Vùng ao nước (Pond)
        if (c >= scenery.pond.minCol && c <= scenery.pond.maxCol &&
            r >= scenery.pond.minRow && r <= scenery.pond.maxRow) {
          type = 'water';
          isSolid = true;
        }

        // Vùng ngôi nhà
        if (c >= 2 && c <= 6 && r >= 1 && r <= 4) {
          isSolid = true;
        }

        // Vùng hàng rào
        if (scenery.fences.some(f => f.col === c && f.row === r)) {
          isSolid = true;
        }

        // Hoa và cỏ dại ngẫu nhiên ở bãi cỏ
        if (type === 'grass' && !isSolid && Math.random() < 0.12) {
          decoration = Math.floor(Math.random() * 4); // 0..3 hoa/đá dại
        }

        tiles[c][r] = {
          type: type,
          tilled: false,
          watered: false,
          isSolid: isSolid,
          decoration: decoration,
          crop: null // { type: 'tomato'|'corn', stage: 0..5 }
        };
      }
    }

    // Tạo sẵn một luống đất canh tác 6x3 ở giữa trang trại để người chơi bắt đầu trồng ngay!
    for (let c = 9; c <= 14; c++) {
      for (let r = 6; r <= 9; r++) {
        tiles[c][r].tilled = true;
        tiles[c][r].decoration = null;
      }
    }

    return tiles;
  }

  // --- 6. HỆ THỐNG LƯU / TẢI GAME (SAVE / LOAD LOCALSTORAGE) ---
  function saveGame() {
    try {
      const dataToSave = {
        day: gameState.day,
        timeMinutes: gameState.timeMinutes,
        gold: gameState.gold,
        energy: gameState.energy,
        season: gameState.season,
        playerPos: { x: player.x, y: player.y, dir: player.dir, slot: player.selectedSlot },
        tiles: gameState.tiles.map(col => col.map(t => ({
          tilled: t.tilled,
          watered: t.watered,
          crop: t.crop
        })))
      };
      localStorage.setItem('hnchill_save_data', JSON.stringify(dataToSave));
      showToast('Đã lưu tiến trình nông trại HNChill! 💾');
    } catch (e) {
      console.error('Lỗi khi lưu game:', e);
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem('hnchill_save_data');
      if (raw) {
        const saved = JSON.parse(raw);
        gameState.day = saved.day || 1;
        gameState.timeMinutes = saved.timeMinutes || 420;
        gameState.gold = saved.gold ?? 500;
        gameState.energy = saved.energy ?? 100;
        gameState.season = saved.season || 'MÙA XUÂN';

        if (saved.playerPos) {
          player.x = saved.playerPos.x;
          player.y = saved.playerPos.y;
          player.dir = saved.playerPos.dir || 0;
          player.selectedSlot = saved.playerPos.slot || 0;
        }

        // Khởi tạo base map trước, sau đó phục hồi trạng thái đất và cây
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
      console.warn('Lỗi khi đọc save, tạo thế giới mới:', e);
    }
    gameState.tiles = initMapTiles();
    return false;
  }

  // --- 7. ĐI NGỦ (QUA NGÀY MỚI - NEXT DAY CYCLE) ---
  let isSleeping = false;
  let sleepFadeAlpha = 0;

  function sleepNextDay() {
    if (isSleeping) return;
    isSleeping = true;
    showToast('Đang ngủ... Một ngày mới bắt đầu 🌅');

    // Chuyển cảnh mờ dần
    let fadeStep = 0.05;
    const fadeInterval = setInterval(() => {
      sleepFadeAlpha += fadeStep;
      if (sleepFadeAlpha >= 1) {
        clearInterval(fadeInterval);

        // Xử lý logic qua ngày (Cây lớn, đất khô, hồi thể lực)
        gameState.day += 1;
        gameState.timeMinutes = 360; // 06:00 AM thức dậy
        gameState.energy = 100;

        for (let c = 0; c < COLS; c++) {
          for (let r = 0; r < ROWS; r++) {
            const tile = gameState.tiles[c][r];
            // Nếu cây được tưới nước hôm qua -> Lớn thêm 1 giai đoạn (tối đa stage 5)
            if (tile.crop && tile.watered) {
              if (tile.crop.stage < 5) {
                tile.crop.stage += 1;
              }
            }
            // Đất khô trở lại vào ngày mới
            tile.watered = false;
          }
        }

        // Tự động lưu game khi qua ngày
        saveGame();
        Sound.playMorning();
        updateHUD();

        // Mở sáng trở lại
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

  // --- 8. HỆ THỐNG INPUT (BÀN PHÍM, CHUỘT, TAY CẦM) ---
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
  });

  window.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    if (k === 'w' || e.key === 'ArrowUp') keys.w = false;
    if (k === 'a' || e.key === 'ArrowLeft') keys.a = false;
    if (k === 's' || e.key === 'ArrowDown') keys.s = false;
    if (k === 'd' || e.key === 'ArrowRight') keys.d = false;
    if (e.key === ' ' || k === 'space') keys.space = false;
  });

  // Tương tác bằng chuột (Click vào ô đất trong tầm)
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

  // Đổi slot bằng cuộn chuột
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.deltaY > 0) {
      player.selectedSlot = (player.selectedSlot + 1) % 6;
    } else {
      player.selectedSlot = (player.selectedSlot - 1 + 6) % 6;
    }
    updateHotbarUI();
  });

  // TAY CẦM (GAMEPAD POLLING)
  let gpPrevButtons = {};
  function pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads || !gamepads[0]) return;
    const gp = gamepads[0];

    // D-Pad & Analog
    const ax = gp.axes[0] || 0;
    const ay = gp.axes[1] || 0;
    keys.w = gp.buttons[12]?.pressed || ay < -0.4;
    keys.s = gp.buttons[13]?.pressed || ay > 0.4;
    keys.a = gp.buttons[14]?.pressed || ax < -0.4;
    keys.d = gp.buttons[15]?.pressed || ax > 0.4;

    // Nút A (Xbox) / Cross (PS) - Hành động
    const btnA = gp.buttons[0]?.pressed;
    if (btnA && !gpPrevButtons[0]) {
      actionRequested = true;
    }
    gpPrevButtons[0] = btnA;

    // Nút LB (Slot trước)
    const btnLB = gp.buttons[4]?.pressed;
    if (btnLB && !gpPrevButtons[4]) {
      player.selectedSlot = (player.selectedSlot - 1 + 6) % 6;
      updateHotbarUI();
    }
    gpPrevButtons[4] = btnLB;

    // Nút RB (Slot sau)
    const btnRB = gp.buttons[5]?.pressed;
    if (btnRB && !gpPrevButtons[5]) {
      player.selectedSlot = (player.selectedSlot + 1) % 6;
      updateHotbarUI();
    }
    gpPrevButtons[5] = btnRB;

    // Nút Start (Đi ngủ)
    const btnStart = gp.buttons[9]?.pressed;
    if (btnStart && !gpPrevButtons[9]) {
      sleepNextDay();
    }
    gpPrevButtons[9] = btnStart;

    // Nút Select (Lưu game)
    const btnSelect = gp.buttons[8]?.pressed;
    if (btnSelect && !gpPrevButtons[8]) {
      saveGame();
    }
    gpPrevButtons[8] = btnSelect;
  }

  // --- 9. LOGIC TƯƠNG TÁC (FARMING ACTIONS) ---
  function getFrontTile() {
    const pc = Math.floor((player.x + 16) / TILE_SIZE);
    const pr = Math.floor((player.y + 24) / TILE_SIZE);
    let tc = pc;
    let tr = pr;
    if (player.dir === 0) tr += 1; // Down
    if (player.dir === 1) tr -= 1; // Up
    if (player.dir === 2) tc -= 1; // Left
    if (player.dir === 3) tc += 1; // Right

    if (tc >= 0 && tc < COLS && tr >= 0 && tr < ROWS) {
      return { col: tc, row: tr };
    }
    return null;
  }

  function interactWithTile(col, row) {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
    const tile = gameState.tiles[col][row];
    if (tile.isSolid) return;

    player.swinging = 12; // Kích hoạt animation vung tay

    // Tọa độ hạt rơi (Particle spawn)
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

      case 2: // RÌU (AXE)
        if (tile.decoration !== null) {
          tile.decoration = null;
          Sound.playHoe();
          spawnDustParticles(px, py, '#5c7a29');
          consumeEnergy(2);
        } else if (tile.tilled && !tile.crop) {
          tile.tilled = false; // Phẳng lại thành cỏ
          Sound.playHoe();
        }
        break;

      case 3: // GIEO HẠT CÀ CHUA (TOMATO SEED)
        if (tile.tilled && !tile.crop) {
          if (gameState.gold >= 10) {
            tile.crop = { type: 'tomato', stage: 0 };
            gameState.gold -= 10;
            Sound.playPlant();
            spawnDustParticles(px, py, '#38a169');
            updateHUD();
          } else {
            showToast('Không đủ tiền mua hạt giống cà chua (Cần 10G)!');
          }
        }
        break;

      case 4: // GIEO HẠT BẮP NGÔ (CORN SEED)
        if (tile.tilled && !tile.crop) {
          if (gameState.gold >= 15) {
            tile.crop = { type: 'corn', stage: 0 };
            gameState.gold -= 15;
            Sound.playPlant();
            spawnDustParticles(px, py, '#d69e2e');
            updateHUD();
          } else {
            showToast('Không đủ tiền mua hạt giống bắp (Cần 15G)!');
          }
        }
        break;

      case 5: // THU HOẠCH / NHẶT NÔNG SẢN (HAND)
        if (tile.crop && tile.crop.stage === 5) {
          const isTomato = tile.crop.type === 'tomato';
          const reward = isTomato ? 45 : 65;
          const cropName = isTomato ? 'Cà chua' : 'Bắp ngô';

          gameState.gold += reward;
          tile.crop = null; // Thu hoạch xong dọn sạch ô
          Sound.playHarvest();

          // Hiệu ứng chữ vàng nổi lên + tia sáng
          floatingTexts.push({
            text: `+${reward}G`,
            x: px,
            y: py - 10,
            alpha: 1,
            color: '#ffd700'
          });
          spawnSparkles(px, py);
          showToast(`Thu hoạch được 1 quả ${cropName}! (+${reward} Gold)`);
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

  // --- 10. HỆ THỐNG HIỆU ỨNG HẠT (PARTICLES) ---
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

  // --- 11. HÀM VẼ TOÀN BỘ ĐỒ HỌA (RENDER PIPELINE) ---
  let waterFrame = 0;
  let waterTimer = 0;

  function renderGame() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Cập nhật frame nước gợn sóng
    waterTimer++;
    if (waterTimer > 25) {
      waterFrame = (waterFrame + 1) % 4;
      waterTimer = 0;
    }

    // 1. VẼ NỀN ĐẤT & CỎ (TILES)
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const tile = gameState.tiles[c][r];
        const dx = c * TILE_SIZE;
        const dy = r * TILE_SIZE;

        if (tile.type === 'water') {
          // Vẽ nước lấp lánh từ water.png
          if (ASSETS.water) {
            ctx.drawImage(ASSETS.water, waterFrame * 16, 0, 16, 16, dx, dy, TILE_SIZE, TILE_SIZE);
          } else {
            ctx.fillStyle = '#3182ce';
            ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
          }
        } else {
          // Vẽ thảm cỏ xanh mướt từ grass.png
          if (ASSETS.grass) {
            ctx.drawImage(ASSETS.grass, 16, 16, 16, 16, dx, dy, TILE_SIZE, TILE_SIZE);
          } else {
            ctx.fillStyle = '#68d391';
            ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
          }

          // Vẽ đất tilled nếu đã được cuốc
          if (tile.tilled) {
            if (ASSETS.tilled_dirt) {
              // Vẽ ô đất cày từ tilled_dirt.png
              ctx.drawImage(ASSETS.tilled_dirt, 0, 0, 16, 16, dx, dy, TILE_SIZE, TILE_SIZE);
            } else {
              ctx.fillStyle = tile.watered ? '#5c3a21' : '#a07855';
              ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
            }

            // Nếu đất được tưới nước -> Phủ lớp bóng ẩm sẫm màu
            if (tile.watered) {
              ctx.fillStyle = 'rgba(50, 25, 10, 0.42)';
              ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
            }
          }

          // Vẽ hoa cỏ dại trang trí
          if (tile.decoration !== null && ASSETS.decorations) {
            const decX = tile.decoration * 16;
            ctx.drawImage(ASSETS.decorations, decX, 0, 16, 16, dx + 4, dy + 4, 24, 24);
          }
        }
      }
    }

    // 2. VẼ CÂY TRỒNG (CROPS)
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const tile = gameState.tiles[c][r];
        if (tile.crop && ASSETS.plants) {
          const dx = c * TILE_SIZE;
          const dy = r * TILE_SIZE;
          const stage = tile.crop.stage; // 0..5
          const rowY = tile.crop.type === 'tomato' ? 0 : 16; // Hàng 0: Cà chua, Hàng 1: Bắp
          // Vẽ crop sprite 16x16 lên kích thước 32x32
          ctx.drawImage(ASSETS.plants, stage * 16, rowY, 16, 16, dx, dy - 6, TILE_SIZE, TILE_SIZE + 6);
        }
      }
    }

    // 3. VẼ CẢNH QUAN TĨNH (SCENERY: HOUSE, FENCES, TREES, CHEST)
    // Hàng rào gỗ
    if (ASSETS.fences) {
      scenery.fences.forEach(f => {
        ctx.drawImage(ASSETS.fences, 0, 0, 16, 16, f.col * TILE_SIZE, f.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      });
    }

    // Ngôi nhà gỗ (Farmhouse)
    if (ASSETS.house) {
      ctx.drawImage(ASSETS.house, 0, 0, 96, 80, scenery.house.x, scenery.house.y, scenery.house.w, scenery.house.h);
    }

    // Hòm gỗ (Chest)
    if (ASSETS.chest) {
      ctx.drawImage(ASSETS.chest, 0, 0, 16, 16, scenery.chest.col * TILE_SIZE, scenery.chest.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // Cây đại thụ râm mát (Trees)
    if (ASSETS.trees) {
      scenery.trees.forEach(t => {
        // Cây tán rộng 48x48
        ctx.drawImage(ASSETS.trees, 0, 0, 48, 56, t.col * TILE_SIZE - 16, t.row * TILE_SIZE - 40, 64, 76);
      });
    }

    // 4. VẼ KHUNG TIÊU ĐIỂM Ô TƯƠNG TÁC (TARGET HIGHLIGHT)
    const target = getFrontTile();
    if (target) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
      ctx.lineWidth = 2;
      ctx.strokeRect(target.col * TILE_SIZE, target.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // 5. VẼ NHÂN VẬT CHÍNH (PLAYER ANIMATION)
    drawPlayer();

    // 6. VẼ CÁC HIỆU ỨNG HẠT & CHỮ NỔI (PARTICLES & FLOATING TEXTS)
    renderParticles();
    renderFloatingTexts();

    // 7. HIỆU ỨNG ÁNH SÁNG NGÀY & ĐÊM (DAY/NIGHT LIGHTING TINT)
    renderDayNightLighting();

    // 8. MÀN ĐEN KHI ĐI NGỦ
    if (sleepFadeAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${sleepFadeAlpha})`;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
  }

  function drawPlayer() {
    if (!ASSETS.character) {
      // Fallback nếu ảnh chưa tải xong
      ctx.fillStyle = '#f56565';
      ctx.fillRect(player.x, player.y, 24, 32);
      return;
    }

    // Tính frame bước chân (Walking frame)
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

    // Row theo hướng: 0=Down, 1=Up, 2=Left, 3=Right
    const frameRow = player.dir;

    // Sprite gốc 48x48
    const sx = frameCol * 48;
    const sy = frameRow * 48;

    // Đổ bóng dưới chân nhân vật
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(player.x + 16, player.y + 36, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vẽ nhân vật (Scale lên 32x32 với tâm khớp đúng ô)
    ctx.drawImage(ASSETS.character, sx, sy, 48, 48, player.x - 8, player.y - 12, 48, 48);

    // Hiệu ứng vung công cụ
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
    // 06:00 (360) -> 17:00 (1020): Ban ngày trong trẻo
    // 17:00 -> 19:30: Hoàng hôn vàng cam ấm áp
    // 19:30 -> 02:00: Ban đêm xanh thẫm
    let ambientColor = null;

    if (mins >= 1020 && mins < 1170) {
      // Hoàng hôn
      const t = (mins - 1020) / 150;
      ambientColor = `rgba(237, 137, 54, ${t * 0.28})`;
    } else if (mins >= 1170 || mins < 360) {
      // Ban đêm
      ambientColor = 'rgba(26, 32, 44, 0.38)';
    }

    if (ambientColor) {
      ctx.fillStyle = ambientColor;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
  }

  // --- 12. VẬT LÝ VÀ DI CHUYỂN (PHYSICS & COLLISION) ---
  function updatePhysics() {
    if (isSleeping) return;

    let dx = 0;
    let dy = 0;

    if (keys.w) { dy -= player.speed; player.dir = 1; }
    if (keys.s) { dy += player.speed; player.dir = 0; }
    if (keys.a) { dx -= player.speed; player.dir = 2; }
    if (keys.d) { dx += player.speed; player.dir = 3; }

    player.isMoving = (dx !== 0 || dy !== 0);

    // Tính toán toạ độ mới với va chạm
    const nextX = Math.max(8, Math.min(CANVAS_W - 32, player.x + dx));
    const nextY = Math.max(8, Math.min(CANVAS_H - 42, player.y + dy));

    // Kiểm tra va chạm với các ô đất bị khóa (House, Pond, Fences)
    const checkCol = Math.floor((nextX + 16) / TILE_SIZE);
    const checkRow = Math.floor((nextY + 28) / TILE_SIZE);

    if (checkCol >= 0 && checkCol < COLS && checkRow >= 0 && checkRow < ROWS) {
      const tile = gameState.tiles[checkCol][checkRow];
      if (!tile || !tile.isSolid) {
        player.x = nextX;
        player.y = nextY;
      }
    }

    // Xử lý nút hành động (Space / Gamepad A)
    if (actionRequested) {
      const target = getFrontTile();
      if (target) interactWithTile(target.col, target.row);
      actionRequested = false;
    }
  }

  // --- 13. CẬP NHẬT GIAO DIỆN & THỜI GIAN (HUD & CLOCK) ---
  function updateGameClock() {
    if (isSleeping) return;
    // Mỗi giây thực tế tăng 1 phút trong game
    gameState.timeMinutes += 0.25;
    if (gameState.timeMinutes >= 1440) {
      gameState.timeMinutes = 0; // Sang ngày mới nếu thức quá 24h
    }

    // Format giờ HH:MM AM/PM
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
      energyEl.innerText = `⚡ NĂNG LƯỢNG: ${gameState.energy}%`;
      energyEl.style.color = gameState.energy > 30 ? '#228b22' : '#e53e3e';
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
  }

  // Vẽ các icon pixel art lên từng ô Hotbar
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
          } else {
            cctx.font = '18px Arial'; cctx.fillText('⛏️', 4, 22);
          }
          break;
        case 1: // Bình tưới (Watering Can)
          if (ASSETS.tools_and_materials) {
            cctx.drawImage(ASSETS.tools_and_materials, 16, 0, 16, 16, 4, 4, 24, 24);
          } else {
            cctx.font = '18px Arial'; cctx.fillText('🚿', 4, 22);
          }
          break;
        case 2: // Rìu (Axe)
          if (ASSETS.tools_and_materials) {
            cctx.drawImage(ASSETS.tools_and_materials, 32, 0, 16, 16, 4, 4, 24, 24);
          } else {
            cctx.font = '18px Arial'; cctx.fillText('🪓', 4, 22);
          }
          break;
        case 3: // Cà chua (Tomato seeds)
          if (ASSETS.plants) {
            cctx.drawImage(ASSETS.plants, 80, 0, 16, 16, 4, 4, 24, 24);
          } else {
            cctx.font = '18px Arial'; cctx.fillText('🍅', 4, 22);
          }
          break;
        case 4: // Bắp ngô (Corn seeds)
          if (ASSETS.plants) {
            cctx.drawImage(ASSETS.plants, 80, 16, 16, 16, 4, 4, 24, 24);
          } else {
            cctx.font = '18px Arial'; cctx.fillText('🌽', 4, 22);
          }
          break;
        case 5: // Tay thu hoạch (Hand)
          cctx.font = '18px Arial';
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

  // --- 14. KHỞI CHẠY GAME LOOP ---
  function gameLoop() {
    pollGamepad();
    updatePhysics();
    updateGameClock();
    renderGame();
    requestAnimationFrame(gameLoop);
  }

  // Thiết lập sự kiện các nút Header
  function setupUIEvents() {
    // Nút Lưu game
    const saveBtn = document.getElementById('btn-save');
    if (saveBtn) saveBtn.addEventListener('click', saveGame);

    // Nút Đi ngủ
    const sleepBtn = document.getElementById('btn-sleep');
    if (sleepBtn) sleepBtn.addEventListener('click', sleepNextDay);

    // Nút Âm thanh
    const soundBtn = document.getElementById('btn-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundBtn.innerText = soundEnabled ? '🔊 BẬT ÂM' : '🔇 TẮT ÂM';
        showToast(soundEnabled ? 'Đã bật âm thanh retro!' : 'Đã tắt âm thanh');
      });
    }

    // Click chọn slot ở Toolbar
    document.querySelectorAll('.hotbar-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        player.selectedSlot = parseInt(slot.getAttribute('data-slot'));
        updateHotbarUI();
      });
    });
  }

  // Bắt đầu khởi động
  loadAssets(() => {
    loadGame();
    setupUIEvents();
    updateHUD();
    updateHotbarUI();
    renderHotbarIcons();
    showToast('Chào mừng bạn đến với nông trại HNChill! 🌾');
    requestAnimationFrame(gameLoop);
  });

})();
