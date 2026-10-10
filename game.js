/**
 * Hà Nội Midnight Rush - Bão Đêm Phố Cổ 3D (v4.0 - Cinematic Road Rash Edition)
 * Three.js WebGL Engine, Procedural Indochine Architecture & Textures,
 * Tháp Rùa Hồ Gươm, Ô Quan Chưởng, Cầu Long Biên, Wet Asphalt Reflections,
 * Synthwave Night Drive Music Engine & Road Rash Combat.
 * 
 * Tác giả: Dũng Automation • "Chia sẻ để thành công"
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. PROCEDURAL TEXTURE FACTORY (NGÓI VẢY CÁ, TƯỜNG CỔ, ĐƯỜNG ƯỚT & BIỂN NEON)
  // =========================================================================
  const TextureFactory = {
    cache: {},

    // 1. Mặt đường nhựa ướt đêm phố cổ (Wet Asphalt with reflections & lines)
    getWetAsphalt() {
      if (this.cache.asphalt) return this.cache.asphalt;

      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Nền nhựa đường ướt đen huyền bí
      ctx.fillStyle = '#0f141e';
      ctx.fillRect(0, 0, 512, 512);

      // Hạt noise & bóng nước lấp loáng
      const imgData = ctx.getImageData(0, 0, 512, 512);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 22;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 1.3));
      }
      ctx.putImageData(imgData, 0, 0);

      // Vạch kẻ đường vàng đôi ở giữa tim đường
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(250, 0, 4, 512);
      ctx.fillRect(258, 0, 4, 512);

      // Vạch kẻ trắng đứt đoạn phân làn
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let y = 0; y < 512; y += 64) {
        ctx.fillRect(128, y, 6, 36);
        ctx.fillRect(384, y, 6, 36);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 4);
      this.cache.asphalt = texture;
      return texture;
    },

    // 2. Vỉa hè lát đá xanh phố cổ
    getSidewalk() {
      if (this.cache.sidewalk) return this.cache.sidewalk;

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 256, 256);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      const size = 32;
      for (let x = 0; x <= 256; x += size) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke();
      }
      for (let y = 0; y <= 256; y += size) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 6);
      this.cache.sidewalk = texture;
      return texture;
    },

    // 3. Tường vàng vôi cổ kính Hà Nội (Weathered Yellow Lime Plaster)
    getOldWall(colorHex = 0xf59e0b) {
      const key = `wall_${colorHex}`;
      if (this.cache[key]) return this.cache[key];

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
      ctx.fillRect(0, 0, 256, 256);

      // Noise vết thời gian & loang lổ ẩm mốc
      const imgData = ctx.getImageData(0, 0, 256, 256);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 36;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.5));
      }
      ctx.putImageData(imgData, 0, 0);

      // Vệt rêu phong ẩm ướt chân tường
      const grad = ctx.createLinearGradient(0, 256, 0, 180);
      grad.addColorStop(0, 'rgba(30, 45, 20, 0.6)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 180, 256, 76);

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      this.cache[key] = texture;
      return texture;
    },

    // 4. Mái ngói vảy cá / ngói âm dương rêu phong
    getRoofTiles(colorHex = 0xb91c1c) {
      const key = `roof_${colorHex}`;
      if (this.cache[key]) return this.cache[key];

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
      ctx.fillRect(0, 0, 256, 256);

      const rowH = 16;
      const tileW = 24;
      for (let r = 0; r < 256 / rowH + 1; r++) {
        const y = r * rowH;
        const offX = (r % 2 === 0) ? 0 : tileW / 2;
        for (let x = -tileW; x < 256 + tileW; x += tileW) {
          ctx.beginPath();
          ctx.arc(x + offX + tileW / 2, y + rowH * 0.8, tileW / 2, Math.PI, 0, false);
          ctx.strokeStyle = 'rgba(25, 5, 5, 0.45)';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          if (Math.random() < 0.25) {
            ctx.fillStyle = 'rgba(20, 40, 15, 0.4)';
            ctx.beginPath();
            ctx.arc(x + offX + tileW / 2, y + 6, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2);
      this.cache[key] = texture;
      return texture;
    },

    // 5. Cửa chớp gỗ kiểu Pháp xanh lá (French Louvered Window)
    getFrenchWindow() {
      if (this.cache.window) return this.cache.window;

      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 64, 128);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(6, 6, 52, 116);

      ctx.fillStyle = '#15803d';
      for (let y = 10; y < 118; y += 7) {
        ctx.fillRect(8, y, 48, 5);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(8, y + 4, 48, 1.5);
        ctx.fillStyle = '#15803d';
      }

      const texture = new THREE.CanvasTexture(canvas);
      this.cache.window = texture;
      return texture;
    },

    // 6. Biển hiệu Neon phát sáng phố cổ
    getNeonSign(title, sub = '', color1 = '#ffea00', color2 = '#00f3ff') {
      const key = `neon_${title}_${sub}`;
      if (this.cache[key]) return this.cache[key];

      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#0b1329';
      ctx.fillRect(0, 0, 512, 128);

      ctx.strokeStyle = color2;
      ctx.lineWidth = 5;
      ctx.strokeRect(8, 8, 496, 112);

      ctx.font = 'bold 36px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color1;
      ctx.shadowColor = color2;
      ctx.shadowBlur = 18;
      ctx.fillText(title, 256, sub ? 54 : 64);

      if (sub) {
        ctx.font = 'italic 18px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.shadowBlur = 6;
        ctx.fillText(sub, 256, 92);
      }

      const texture = new THREE.CanvasTexture(canvas);
      this.cache[key] = texture;
      return texture;
    },

    // 7. Cờ đỏ sao vàng Việt Nam
    getNationalFlag() {
      if (this.cache.flag) return this.cache.flag;

      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 0, 120, 80);

      ctx.fillStyle = '#facc15';
      const cx = 60, cy = 40, outer = 22, inner = 9;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = (18 + i * 72) * Math.PI / 180 - Math.PI / 2;
        const a2 = (54 + i * 72) * Math.PI / 180 - Math.PI / 2;
        const x1 = cx + Math.cos(a1) * outer;
        const y1 = cy + Math.sin(a1) * outer;
        const x2 = cx + Math.cos(a2) * inner;
        const y2 = cy + Math.sin(a2) * inner;
        if (i === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      this.cache.flag = texture;
      return texture;
    }
  };

  // =========================================================================
  // 2. DỮ LIỆU DÒNG XE & TRẠNG THÁI NGƯỜI CHƠI (BIKES CATALOG)
  // =========================================================================
  const BIKES_DATABASE = {
    cub50: {
      id: 'cub50',
      name: 'Honda Super Cub 50',
      icon: '🛵',
      price: 0,
      color: 0x0284c7, // Xanh bích
      shieldColor: 0xf1f5f9,
      baseSpeed: 115,
      baseAccel: 52,
      baseKick: 1.0,
      baseNitro: 80,
      desc: 'Chiếc Cub 50cc kim vàng giọt lệ bền bỉ, dễ luồn lách phố cổ.'
    },
    wave_alpha: {
      id: 'wave_alpha',
      name: 'Honda Wave Alpha',
      icon: '🏍️',
      price: 1000,
      color: 0x16a34a, // Xanh lá
      shieldColor: 0xe2e8f0,
      baseSpeed: 130,
      baseAccel: 64,
      baseKick: 1.3,
      baseNitro: 100,
      desc: 'Chiếc Wave kiểng bốc đầu, nước đề cực nhạy của dân tổ.'
    },
    dream_chien: {
      id: 'dream_chien',
      name: 'Honda Dream Chiến II',
      icon: '🔥',
      price: 2500,
      color: 0xb91c1c, // Đỏ đô
      shieldColor: 0xfef08a,
      baseSpeed: 148,
      baseAccel: 78,
      baseKick: 1.65,
      baseNitro: 120,
      desc: 'Huyền thoại bão đêm Hà Nội, đầm xe, cú đạp cực nặng đô!'
    },
    exciter150: {
      id: 'exciter150',
      name: 'Yamaha Exciter 150',
      icon: '⚡',
      price: 5000,
      color: 0xd946ef, // Tím neon
      shieldColor: 0x1e293b,
      baseSpeed: 168,
      baseAccel: 92,
      baseKick: 2.1,
      baseNitro: 150,
      desc: 'Vua côn tay đường phố, tốc độ xé gió, quái kiệt phố đêm!'
    }
  };

  let userSave = {
    gold: 500,
    currentBike: 'cub50',
    ownedBikes: ['cub50'],
    upgrades: { speed: 1, accel: 1, kick: 1, nitro: 1 },
    totalKOs: 0,
    highScore: 0
  };

  function loadUserSave() {
    try {
      const raw = localStorage.getItem('hanoirush_save_v4');
      if (raw) userSave = Object.assign(userSave, JSON.parse(raw));
    } catch (e) {
      console.warn('Lỗi đọc save:', e);
    }
  }

  function saveUserData() {
    try {
      localStorage.setItem('hanoirush_save_v4', JSON.stringify(userSave));
    } catch (e) {
      console.error('Lỗi ghi save:', e);
    }
  }

  // =========================================================================
  // 3. BIẾN GAME THREE.JS & THẾ GIỚI ĐUA
  // =========================================================================
  let scene, camera, renderer;
  let playerBikeMesh = null;
  let playerLeftLeg = null, playerRightLeg = null, playerTorso = null;
  let exhaustFlame = null;

  const opponents = [];
  const trafficVehicles = [];
  const roadSegments = [];
  const nitroPickups = [];
  const sparkParticles = [];

  const ROAD_WIDTH = 22;
  const SEGMENT_LENGTH = 80;
  const TOTAL_SEGMENTS = 14;

  const player = {
    x: 0,
    z: 0,
    speed: 0,
    maxSpeed: 115,
    accel: 52,
    brake: 90,
    handling: 19,
    leanAngle: 0,
    nitro: 100,
    maxNitro: 100,
    isBoosting: false,
    kickSide: null,
    kickTimer: 0,
    kickPower: 1.0,
    knockouts: 0,
    distanceTraveled: 0,
    raceTargetDistance: 2500, // 2.5km mỗi chặng đua
    isRaceFinished: false,
    rank: 1
  };

  const input = {
    gas: false,
    brake: false,
    left: false,
    right: false,
    boost: false
  };

  let audioCtx = null;
  let engineOsc = null;
  let engineGain = null;
  let soundEnabled = true;
  let musicEnabled = true;
  let isPhotoMode = false;

  // =========================================================================
  // 4. ÂM THANH SYNTHWAVE & TIẾNG PÔ ĐỘ (WEB AUDIO API ENGINE)
  // =========================================================================
  function initAudio() {
    if (audioCtx) return;
    try {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioClass) return;
      audioCtx = new AudioClass();

      // Động cơ xe máy (Sawtooth qua filter thấp)
      engineOsc = audioCtx.createOscillator();
      engineGain = audioCtx.createGain();
      engineOsc.type = 'sawtooth';
      engineOsc.frequency.setValueAtTime(45, audioCtx.currentTime);
      engineGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, audioCtx.currentTime);

      engineOsc.connect(filter);
      filter.connect(engineGain);
      engineGain.connect(audioCtx.destination);
      engineOsc.start();

      if (musicEnabled) playSynthwaveBeat();
    } catch (e) {
      console.warn('Audio Init Error:', e);
    }
  }

  function updateEngineSound() {
    if (!audioCtx || !engineOsc || !engineGain || !soundEnabled) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const targetFreq = 42 + (player.speed / player.maxSpeed) * 135 + (player.isBoosting ? 50 : 0);
    engineOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.08);
    const targetGain = player.speed > 2 ? 0.09 : 0.03;
    engineGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.1);
  }

  // Nhạc nền Synthwave Bão Đêm Phố Cổ (Driving 120 BPM Bass & Chords)
  let musicStep = 0;
  function playSynthwaveBeat() {
    if (!musicEnabled || !audioCtx) return;
    const bassNotes = [55, 55, 65.41, 73.42, 55, 55, 82.41, 73.42]; // A1, C2, D2, E2
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(bassNotes[musicStep % bassNotes.length], now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.22);

    musicStep++;
    setTimeout(playSynthwaveBeat, 250); // 120 BPM eighth notes
  }

  function toggleMusic() {
    musicEnabled = !musicEnabled;
    const btn = document.getElementById('btn-music');
    if (btn) btn.innerText = musicEnabled ? '🎵' : '🔇';
    if (musicEnabled && audioCtx) playSynthwaveBeat();
  }

  function playHorn() {
    if (!audioCtx || !soundEnabled) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(460, audioCtx.currentTime);
    osc.frequency.setValueAtTime(580, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.28);
  }

  function playKickHit() {
    if (!audioCtx || !soundEnabled) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, audioCtx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.65, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.16);
  }

  function playPickupSound() {
    if (!audioCtx || !soundEnabled) return;
    [659.25, 880, 1174.6].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.06);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.06 + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + i * 0.06);
      osc.stop(audioCtx.currentTime + i * 0.06 + 0.18);
    });
  }

  // =========================================================================
  // 5. TÍNH TOÁN CHỈ SỐ XE
  // =========================================================================
  function applyBikeStats() {
    const bikeData = BIKES_DATABASE[userSave.currentBike] || BIKES_DATABASE.cub50;
    const up = userSave.upgrades;

    player.maxSpeed = bikeData.baseSpeed + (up.speed - 1) * 8;
    player.accel = bikeData.baseAccel + (up.accel - 1) * 6;
    player.kickPower = bikeData.baseKick + (up.kick - 1) * 0.25;
    player.maxNitro = bikeData.baseNitro + (up.nitro - 1) * 20;
    player.nitro = player.maxNitro;
  }

  // =========================================================================
  // 6. KHỞI TẠO THREE.JS SCENE & ÁNH SÁNG
  // =========================================================================
  function initThree() {
    const container = document.getElementById('game-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040817);
    scene.fog = new THREE.FogExp2(0x071126, 0.0065);

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.2, 600);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // Ánh trăng & Ánh sáng môi trường
    const ambientLight = new THREE.AmbientLight(0x28406c, 0.85);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x77aaff, 0.75);
    moonLight.position.set(40, 90, -40);
    scene.add(moonLight);

    buildRoadNetwork();
    spawnNitroPickups();
    rebuildPlayerBike();
    spawnStartingGridOpponents();
    spawnTrafficBuses();

    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // =========================================================================
  // 7. MÔ HÌNH XE MÁY 3D & ANIMATION ĐẠP
  // =========================================================================
  function createDetailedBikeMesh(colorHex, shieldColorHex, isOpponent = false, riderName = '') {
    const bikeGroup = new THREE.Group();

    // 1. Khung xe chính
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.25,
      metalness: 0.75
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.78, 2.1), bodyMat);
    body.position.y = 0.85;
    bikeGroup.add(body);

    // 2. Yếm xe
    const shield = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.82, 0.22),
      new THREE.MeshStandardMaterial({ color: shieldColorHex, roughness: 0.4 })
    );
    shield.position.set(0, 0.8, 0.48);
    bikeGroup.add(shield);

    // 3. Yên xe da đen
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.66, 0.26, 1.15),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
    );
    seat.position.set(0, 1.25, -0.32);
    bikeGroup.add(seat);

    // 4. Bánh xe gai cao su + nan hoa
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.28, 18);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    wheelGeo.rotateZ(Math.PI / 2);

    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.position.set(0, 0.5, 1.18);
    bikeGroup.add(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
    rearWheel.position.set(0, 0.5, -0.95);
    bikeGroup.add(rearWheel);

    // 5. Đèn pha trước + SpotLight rọi đường
    const headlight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.2, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    headlight.rotateX(Math.PI / 2);
    headlight.position.set(0, 1.18, 1.12);
    bikeGroup.add(headlight);

    if (!isOpponent) {
      const spotLight = new THREE.SpotLight(0xfff8d6, 3.8, 65, Math.PI / 6, 0.45, 1.2);
      spotLight.position.set(0, 1.18, 1.2);
      const spotTarget = new THREE.Object3D();
      spotTarget.position.set(0, 0, 30);
      bikeGroup.add(spotTarget);
      spotLight.target = spotTarget;
      bikeGroup.add(spotLight);

      // Ngọn lửa Nitro rực sáng ở đuôi pô
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0 });
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.2, 8), flameMat);
      flame.rotateX(-Math.PI / 2);
      flame.position.set(0.38, 0.45, -1.75);
      exhaustFlame = flame;
      bikeGroup.add(flame);
    }

    // 6. Đèn hậu đỏ
    const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0044 }));
    tailLight.position.set(0, 1.12, -1.06);
    bikeGroup.add(tailLight);

    // 7. Tay lái
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.15, 10),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
    );
    handle.rotateZ(Math.PI / 2);
    handle.position.set(0, 1.36, 0.88);
    bikeGroup.add(handle);

    // 8. Ống xả pô crom
    const exhaust = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.14, 1.2, 10),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9 })
    );
    exhaust.rotateX(Math.PI / 2);
    exhaust.position.set(0.38, 0.45, -0.65);
    bikeGroup.add(exhaust);

    // 9. Người lái (Rider)
    const riderGroup = new THREE.Group();

    const torsoMat = new THREE.MeshStandardMaterial({
      color: isOpponent ? 0xd97706 : 0x0284c7,
      roughness: 0.7
    });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.42), torsoMat);
    torso.position.set(0, 1.72, -0.2);
    torso.rotation.x = 0.28;
    riderGroup.add(torso);

    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 14, 14),
      new THREE.MeshStandardMaterial({ color: isOpponent ? 0xef4444 : 0xfacc15, roughness: 0.3 })
    );
    helmet.position.set(0, 2.28, -0.05);
    riderGroup.add(helmet);

    // Hai chân có khớp để đạp
    const legGeo = new THREE.BoxGeometry(0.24, 0.75, 0.28);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(0.34, 1.15, -0.15);
    riderGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(-0.34, 1.15, -0.15);
    riderGroup.add(rightLeg);

    bikeGroup.add(riderGroup);

    // Tên Bot đối thủ lơ lửng trên đầu
    if (isOpponent && riderName) {
      const nameSprite = createNameSprite(riderName);
      nameSprite.position.set(0, 3.2, 0);
      bikeGroup.add(nameSprite);
    }

    return {
      mesh: bikeGroup,
      torso: torso,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      wheels: [frontWheel, rearWheel]
    };
  }

  function createNameSprite(name) {
    const cvs = document.createElement('canvas');
    cvs.width = 256;
    cvs.height = 64;
    const c = cvs.getContext('2d');
    c.fillStyle = 'rgba(10, 14, 26, 0.85)';
    c.roundRect(4, 4, 248, 56, 10);
    c.fill();
    c.strokeStyle = '#ffea00';
    c.lineWidth = 4;
    c.roundRect(4, 4, 248, 56, 10);
    c.stroke();

    c.font = 'bold 26px "Orbitron", sans-serif';
    c.fillStyle = '#ffea00';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(name, 128, 32);

    const tex = new THREE.CanvasTexture(cvs);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.5, 0.9, 1);
    return sprite;
  }

  function rebuildPlayerBike() {
    if (playerBikeMesh) scene.remove(playerBikeMesh);
    const currentBike = BIKES_DATABASE[userSave.currentBike] || BIKES_DATABASE.cub50;
    const bikeObj = createDetailedBikeMesh(currentBike.color, currentBike.shieldColor, false);
    playerBikeMesh = bikeObj.mesh;
    playerLeftLeg = bikeObj.leftLeg;
    playerRightLeg = bikeObj.rightLeg;
    playerTorso = bikeObj.torso;
    playerBikeMesh.position.set(player.x, 0, player.z);
    scene.add(playerBikeMesh);
    applyBikeStats();
  }

  // =========================================================================
  // 8. BOT ĐỐI THỦ XUẤT PHÁT (STARTING GRID)
  // =========================================================================
  const BOT_ROSTER = [
    { name: 'Hùng "Tổ Lái"', color: 0x2563eb, shield: 0xffffff, startX: -3.6, startZ: 8, speed: 114 },
    { name: 'Tuấn "Wave Chiến"', color: 0x16a34a, shield: 0xf1f5f9, startX: 3.6, startZ: 14, speed: 120 },
    { name: 'Lan "Bão Đêm"', color: 0xd946ef, shield: 0x1e293b, startX: -6.5, startZ: 3, speed: 117 },
    { name: 'Dũng "Pô Nổ"', color: 0xf59e0b, shield: 0xfef08a, startX: 6.5, startZ: 20, speed: 123 },
    { name: 'Sơn "Liều Mạng"', color: 0xdc2626, shield: 0x1e293b, startX: -1.2, startZ: 26, speed: 126 }
  ];

  function spawnStartingGridOpponents() {
    opponents.forEach(op => scene.remove(op.mesh));
    opponents.length = 0;

    BOT_ROSTER.forEach((data, index) => {
      const bikeObj = createDetailedBikeMesh(data.color, data.shield, true, data.name);
      bikeObj.mesh.position.set(data.startX, 0, data.startZ);
      scene.add(bikeObj.mesh);

      opponents.push({
        id: index,
        name: data.name,
        mesh: bikeObj.mesh,
        leftLeg: bikeObj.leftLeg,
        rightLeg: bikeObj.rightLeg,
        x: data.startX,
        z: data.startZ,
        speed: 0,
        baseSpeed: data.speed,
        isDown: false,
        downTimer: 0
      });
    });
  }

  // =========================================================================
  // 9. NITRO PICKUPS TRÊN ĐƯỜNG
  // =========================================================================
  function spawnNitroPickups() {
    for (let i = 0; i < 14; i++) {
      const nitroGroup = new THREE.Group();

      const can = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16),
        new THREE.MeshStandardMaterial({ color: 0x00f3ff, emissive: 0x00f3ff, emissiveIntensity: 0.7, roughness: 0.2 })
      );
      nitroGroup.add(can);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.08, 8, 20),
        new THREE.MeshBasicMaterial({ color: 0xffea00 })
      );
      ring.rotation.x = Math.PI / 2;
      nitroGroup.add(ring);

      const laneX = (Math.random() - 0.5) * (ROAD_WIDTH - 6);
      const pz = 100 + i * 180;
      nitroGroup.position.set(laneX, 1.2, pz);
      scene.add(nitroGroup);

      nitroPickups.push({
        mesh: nitroGroup,
        x: laneX,
        z: pz,
        active: true
      });
    }
  }

  function updateNitroPickups(delta) {
    nitroPickups.forEach(np => {
      np.mesh.rotation.y += 2.5 * delta;
      np.mesh.position.y = 1.2 + Math.sin(player.z * 0.08 + np.z) * 0.25;

      if (np.active) {
        const dz = Math.abs(np.z - player.z);
        const dx = Math.abs(np.x - player.x);
        if (dz < 2.5 && dx < 1.8) {
          np.active = false;
          np.mesh.visible = false;
          playPickupSound();

          player.nitro = player.maxNitro;
          player.speed = Math.min(player.maxSpeed + 35, player.speed + 32);
          player.isBoosting = true;
          spawnSparks(player.x, 0.8, player.z);
          showBanner('⚡ BÌNH NITRO N2O!', 'TĂNG TỐC XÉ GIÓ PHỐ ĐÊM!');

          setTimeout(() => {
            np.z = player.z + 450 + Math.random() * 200;
            np.x = (Math.random() - 0.5) * (ROAD_WIDTH - 6);
            np.mesh.position.set(np.x, 1.2, np.z);
            np.mesh.visible = true;
            np.active = true;
          }, 4000);
        }
      }
    });
  }

  // =========================================================================
  // 10. XE BUÝT HÀ NỘI SỐ 01 / 02
  // =========================================================================
  function spawnTrafficBuses() {
    for (let i = 0; i < 5; i++) {
      const busGroup = new THREE.Group();

      const busBody = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 3.8, 12),
        new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 })
      );
      busBody.position.y = 2.1;
      busGroup.add(busBody);

      const lower = new THREE.Mesh(
        new THREE.BoxGeometry(3.65, 1.2, 12.05),
        new THREE.MeshStandardMaterial({ color: 0xb91c1c })
      );
      lower.position.y = 0.9;
      busGroup.add(lower);

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(3.7, 1.4, 11),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 })
      );
      glass.position.y = 2.6;
      busGroup.add(glass);

      const laneX = (i % 2 === 0) ? -4.5 : 4.5;
      const startZ = 160 + i * 180;
      busGroup.position.set(laneX, 0, startZ);
      scene.add(busGroup);

      trafficVehicles.push({
        mesh: busGroup,
        x: laneX,
        z: startZ,
        speed: 45
      });
    }
  }

  // =========================================================================
  // 11. PHỐ CỔ INDOCHINE, HỒ GƯƠM & ĐƯỜNG PHỐ TỰ SINH
  // =========================================================================
  const NEON_PRESETS = [
    { title: 'PHỞ BÁT ĐÀN', sub: 'GIA TRUYỀN TỪ NĂM 1946', c1: '#fde047', c2: '#ef4444' },
    { title: 'CAFE TRỨNG', sub: 'GIẢNG 1946 • BAN CÔNG HOA GIẤY', c1: '#fbbf24', c2: '#f59e0b' },
    { title: 'BIA HƠI HÀ NỘI', sub: 'TƯƠI MÁT • 1986', c1: '#38bdf8', c2: '#0284c7' },
    { title: 'TRÀ ĐÁ VỈA HÈ', sub: 'HƯỚNG DƯƠNG • ĐIẾU CÀY', c1: '#4ade80', c2: '#16a34a' },
    { title: 'CHỢ ĐỒNG XUÂN', sub: 'SẦM UẤT ĐÊM KẺ CHỢ', c1: '#f43f5e', c2: '#e11d48' },
    { title: 'KEM TRÀNG TIỀN', sub: 'CỐM SỮA • ĐẬU XANH 1958', c1: '#a7f3d0', c2: '#10b981' },
    { title: 'BÚN CHẢ HÀNG MÀNH', sub: 'QUẠT THAN HOA THƠM NỨC', c1: '#f97316', c2: '#ea580c' },
    { title: 'LỤA HÀNG GAI', sub: 'TƠ TẰM VẠN PHÚC', c1: '#e879f9', c2: '#c026d3' }
  ];

  function createRoadSegment(index) {
    const segGroup = new THREE.Group();
    const segZ = index * SEGMENT_LENGTH;

    // 1. Mặt đường nhựa ướt
    const roadMat = new THREE.MeshStandardMaterial({
      map: TextureFactory.getWetAsphalt(),
      roughness: 0.28,
      metalness: 0.32
    });
    const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_WIDTH, SEGMENT_LENGTH), roadMat);
    roadMesh.rotateX(-Math.PI / 2);
    segGroup.add(roadMesh);

    // 2. Vỉa hè đá xanh hai bên
    const walkMat = new THREE.MeshStandardMaterial({
      map: TextureFactory.getSidewalk(),
      roughness: 0.8
    });
    [-1, 1].forEach(side => {
      const walk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, SEGMENT_LENGTH), walkMat);
      walk.position.set(side * (ROAD_WIDTH / 2 + 3), 0.2, 0);
      segGroup.add(walk);
    });

    // 3. Cột đèn cao áp gang đúc Pháp
    const lampX = ROAD_WIDTH / 2 + 2;
    const lampPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85 })
    );
    lampPole.position.set(lampX, 3.75, 0);
    segGroup.add(lampPole);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd54f }));
    bulb.position.set(lampX - 0.8, 7.4, 0);
    segGroup.add(bulb);

    const streetLight = new THREE.PointLight(0xffb74d, 1.4, 35, 1.6);
    streetLight.position.set(lampX - 0.8, 7.2, 0);
    segGroup.add(streetLight);

    // 4. KIẾN TRÚC PHỐ CỔ INDOCHINE HOẶC HỒ GƯƠM THÁP RÙA
    const isLakeSegment = (index % 5 === 2);

    if (isLakeSegment) {
      // Bên phải là Góc Hồ Gươm & Tháp Rùa soi bóng
      const lakeMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.9 });
      const lake = new THREE.Mesh(new THREE.PlaneGeometry(35, SEGMENT_LENGTH), lakeMat);
      lake.rotateX(-Math.PI / 2);
      lake.position.set(ROAD_WIDTH / 2 + 23, -0.2, 0);
      segGroup.add(lake);

      // Tháp Rùa nổi giữa hồ
      const towerGroup = createMiniTurtleTower();
      towerGroup.position.set(ROAD_WIDTH / 2 + 22, 0, 0);
      segGroup.add(towerGroup);

      // Bên trái vẫn là dãy nhà phố cổ
      createShophouseBlock(segGroup, -1, index);
    } else {
      // Cả hai bên là dãy nhà ống phố cổ Indochine
      createShophouseBlock(segGroup, -1, index);
      createShophouseBlock(segGroup, 1, index + 3);
    }

    // 5. Cây xà cừ cổ thụ ven đường
    const treeTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.45, 5, 8),
      new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 })
    );
    treeTrunk.position.set(-ROAD_WIDTH / 2 - 2, 2.5, 15);
    segGroup.add(treeTrunk);

    const treeLeaves = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 })
    );
    treeLeaves.position.set(-ROAD_WIDTH / 2 - 2, 6.0, 15);
    segGroup.add(treeLeaves);

    segGroup.position.z = segZ;
    scene.add(segGroup);
    return segGroup;
  }

  // Tạo khối nhà ống Indochine
  function createShophouseBlock(parent, side, seed) {
    const bldH = 12 + (seed % 3) * 3;
    const wallColor = (seed % 2 === 0) ? 0xf59e0b : 0xd97706;

    const wallMat = new THREE.MeshStandardMaterial({
      map: TextureFactory.getOldWall(wallColor),
      roughness: 0.65
    });
    const bldMesh = new THREE.Mesh(new THREE.BoxGeometry(8, bldH, 24), wallMat);
    bldMesh.position.set(side * (ROAD_WIDTH / 2 + 10), bldH / 2, 0);
    parent.add(bldMesh);

    // Mái ngói dốc vảy cá
    const roofMat = new THREE.MeshStandardMaterial({ map: TextureFactory.getRoofTiles(0xb91c1c) });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.4, 4), roofMat);
    roof.rotateY(Math.PI / 4);
    roof.position.set(side * (ROAD_WIDTH / 2 + 10), bldH + 1.2, 0);
    parent.add(roof);

    // Cửa chớp xanh tầng 2 & 3
    const winMat = new THREE.MeshStandardMaterial({ map: TextureFactory.getFrenchWindow() });
    for (let floor = 1; floor <= 2; floor++) {
      [-4, 4].forEach(wz => {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.0), winMat);
        win.position.set(side * (ROAD_WIDTH / 2 + 5.95), 4.5 + floor * 3.5, wz);
        win.rotation.y = (side === -1) ? Math.PI / 2 : -Math.PI / 2;
        parent.add(win);
      });
    }

    // Ban công hoa giấy rực rỡ
    const balc = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.7, 4.5),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    balc.position.set(side * (ROAD_WIDTH / 2 + 5.5), 6.5, 0);
    parent.add(balc);

    for (let f = 0; f < 5; f++) {
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
      flower.position.set(side * (ROAD_WIDTH / 2 + 5.2), 7.2, -1.5 + f * 0.75);
      parent.add(flower);
    }

    // Đèn lồng đỏ treo hiên
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.8 })
    );
    lantern.position.set(side * (ROAD_WIDTH / 2 + 5.4), 4.2, 2);
    parent.add(lantern);

    // Biển hiệu Neon phố cổ
    const preset = NEON_PRESETS[Math.abs(seed) % NEON_PRESETS.length];
    const signMat = new THREE.MeshBasicMaterial({
      map: TextureFactory.getNeonSign(preset.title, preset.sub, preset.c1, preset.c2),
      transparent: true
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.0), signMat);
    sign.position.set(side * (ROAD_WIDTH / 2 + 5.92), 3.8, 0);
    sign.rotation.y = (side === -1) ? Math.PI / 2 : -Math.PI / 2;
    parent.add(sign);
  }

  // Tháp Rùa mini bên bờ hồ
  function createMiniTurtleTower() {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 });

    // Đảo cỏ nổi
    const island = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6.2, 0.6, 12), new THREE.MeshStandardMaterial({ color: 0x365314 }));
    island.position.y = 0.2;
    group.add(island);

    // Tầng 1
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.8, 3.4), stoneMat);
    t1.position.y = 1.2;
    group.add(t1);

    // Tầng 2
    const t2 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.4, 2.4), stoneMat);
    t2.position.y = 2.8;
    group.add(t2);

    // Tầng 3 & Mái đao cong
    const t3 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 1.8), stoneMat);
    t3.position.y = 4.0;
    group.add(t3);

    const roofMat = new THREE.MeshStandardMaterial({ map: TextureFactory.getRoofTiles(0x57534e) });
    const peak = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.0, 4), roofMat);
    peak.rotateY(Math.PI / 4);
    peak.position.y = 5.0;
    group.add(peak);

    // Cờ đỏ sao vàng trên đỉnh tháp
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshBasicMaterial({
      map: TextureFactory.getNationalFlag(),
      side: THREE.DoubleSide
    }));
    flag.position.set(0.4, 6.2, 0);
    group.add(flag);

    // Đèn hắt sáng vàng rọi lên Tháp Rùa
    const light = new THREE.PointLight(0xfbbf24, 1.8, 24);
    light.position.set(0, 3.5, 0);
    group.add(light);

    return group;
  }

  function buildRoadNetwork() {
    for (let i = 0; i < TOTAL_SEGMENTS; i++) {
      const seg = createRoadSegment(i);
      roadSegments.push(seg);
    }
  }

  function updateRoadRecycling() {
    roadSegments.forEach(seg => {
      if (seg.position.z < player.z - SEGMENT_LENGTH * 2) {
        seg.position.z += TOTAL_SEGMENTS * SEGMENT_LENGTH;
      }
    });
  }

  // =========================================================================
  // 12. HỆ THỐNG TIA LỬA ĐIỆN (SPARKS)
  // =========================================================================
  function spawnSparks(x, y, z) {
    const sparkGeo = new THREE.BufferGeometry();
    const count = 35;
    const pos = [];
    const vels = [];

    for (let i = 0; i < count; i++) {
      pos.push(x, y, z);
      vels.push((Math.random() - 0.5) * 16, Math.random() * 10 + 4, (Math.random() - 0.5) * 16);
    }

    sparkGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffea00,
      size: 0.55,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const pSystem = new THREE.Points(sparkGeo, sparkMat);
    scene.add(pSystem);
    sparkParticles.push({ mesh: pSystem, vels: vels, life: 1.0 });
  }

  function updateParticles(delta) {
    for (let i = sparkParticles.length - 1; i >= 0; i--) {
      const sp = sparkParticles[i];
      sp.life -= delta * 3.5;
      const positions = sp.mesh.geometry.attributes.position.array;

      for (let j = 0; j < positions.length / 3; j++) {
        positions[j * 3] += sp.vels[j * 3] * delta;
        positions[j * 3 + 1] += sp.vels[j * 3 + 1] * delta;
        positions[j * 3 + 2] += sp.vels[j * 3 + 2] * delta;
        sp.vels[j * 3 + 1] -= 24 * delta;
      }

      sp.mesh.geometry.attributes.position.needsUpdate = true;
      sp.mesh.material.opacity = sp.life;

      if (sp.life <= 0) {
        scene.remove(sp.mesh);
        sparkParticles.splice(i, 1);
      }
    }
  }

  // =========================================================================
  // 13. CƠ CHẾ ĐẠP NHAU ROAD RASH (COMBAT KICK)
  // =========================================================================
  let screenShakeIntensity = 0;

  function executeKick(side) {
    if (player.kickSide !== null || !playerLeftLeg || !playerRightLeg) return;
    initAudio();
    player.kickSide = side;
    player.kickTimer = 0.42;

    if (side === 'left') {
      playerLeftLeg.position.set(1.15, 1.35, 0.2);
      playerLeftLeg.rotation.z = -1.35;
      playerLeftLeg.rotation.x = -0.4;
      playerTorso.rotation.z = 0.3;
    } else {
      playerRightLeg.position.set(-1.15, 1.35, 0.2);
      playerRightLeg.rotation.z = 1.35;
      playerRightLeg.rotation.x = -0.4;
      playerTorso.rotation.z = -0.3;
    }

    let hitOpponent = null;
    opponents.forEach(op => {
      if (op.isDown) return;
      const dz = Math.abs(op.z - player.z);
      const dx = op.x - player.x;

      if (dz < 3.2) {
        if (side === 'left' && dx > 0.3 && dx < 4.0) hitOpponent = op;
        else if (side === 'right' && dx < -0.3 && dx > -4.0) hitOpponent = op;
      }
    });

    if (hitOpponent) {
      playKickHit();
      hitOpponent.isDown = true;
      hitOpponent.downTimer = 4.2;
      hitOpponent.speed = 8;
      hitOpponent.mesh.rotation.z = (side === 'left') ? -1.5 : 1.5;

      spawnSparks(hitOpponent.x, 0.6, hitOpponent.z);
      screenShakeIntensity = 0.6;

      player.knockouts++;
      userSave.totalKOs++;
      userSave.gold += 150;
      saveUserData();

      player.nitro = Math.min(player.maxNitro, player.nitro + 45);
      showBanner('💥 CÚ ĐẠP CHÍ MẠNG!', `BẠN ĐÃ ĐẠP VĂNG ${hitOpponent.name.toUpperCase()} (+150G)!`);
      updateHUD();
    }
  }

  function updateKickAnimation(delta) {
    if (player.kickSide !== null) {
      player.kickTimer -= delta;
      if (player.kickTimer <= 0) {
        player.kickSide = null;
        playerLeftLeg.position.set(0.34, 1.15, -0.15);
        playerLeftLeg.rotation.set(0, 0, 0);
        playerRightLeg.position.set(-0.34, 1.15, -0.15);
        playerRightLeg.rotation.set(0, 0, 0);
        playerTorso.rotation.z = 0;
      }
    }
  }

  // =========================================================================
  // 14. VẬT LÝ XE & ĐIỀU KHIỂN CHUẨN XÁC
  // =========================================================================
  function updatePlayerPhysics(delta) {
    if (player.isRaceFinished) return;

    const currentMaxSpeed = player.isBoosting ? player.maxSpeed + 35 : player.maxSpeed;

    if (input.gas) {
      player.speed = Math.min(currentMaxSpeed, player.speed + player.accel * delta);
    } else if (input.brake) {
      player.speed = Math.max(0, player.speed - player.brake * delta);
    } else {
      player.speed = Math.max(0, player.speed - 18 * delta);
    }

    if (input.boost && player.nitro > 0 && player.speed > 25) {
      player.isBoosting = true;
      player.nitro = Math.max(0, player.nitro - 38 * delta);
      player.speed = Math.min(currentMaxSpeed, player.speed + 50 * delta);
      if (exhaustFlame) exhaustFlame.material.opacity = 0.95;
    } else {
      player.isBoosting = false;
      player.nitro = Math.min(player.maxNitro, player.nitro + 4 * delta);
      if (exhaustFlame) exhaustFlame.material.opacity = 0;
    }

    // Bẻ lái: A = Trái (+X), D = Phải (-X)
    const steerSpeed = player.handling * (player.speed / player.maxSpeed);
    let targetLean = 0;

    if (input.left) {
      player.x += steerSpeed * delta;
      targetLean = -0.45;
    } else if (input.right) {
      player.x -= steerSpeed * delta;
      targetLean = 0.45;
    }

    player.x = Math.max(-ROAD_WIDTH / 2 + 1.2, Math.min(ROAD_WIDTH / 2 - 1.2, player.x));
    player.leanAngle += (targetLean - player.leanAngle) * 14 * delta;

    const moveZ = (player.speed * 1000 / 3600) * delta;
    player.z += moveZ;
    player.distanceTraveled += moveZ;

    playerBikeMesh.position.set(player.x, 0, player.z);
    playerBikeMesh.rotation.z = player.leanAngle;
    playerBikeMesh.rotation.y = -player.leanAngle * 0.35;

    // Lăn bánh xe
    const wheelRot = moveZ * 2.2;
    if (playerBikeMesh.children[3] && playerBikeMesh.children[4]) {
      playerBikeMesh.children[3].rotation.x += wheelRot;
      playerBikeMesh.children[4].rotation.x += wheelRot;
    }

    // Va chạm với xe buýt
    trafficVehicles.forEach(bus => {
      const dz = Math.abs(bus.z - player.z);
      const dx = Math.abs(bus.x - player.x);
      if (dz < 6.8 && dx < 2.5) {
        player.speed = Math.max(15, player.speed * 0.35);
        spawnSparks(player.x, 1.2, player.z + 1.5);
        screenShakeIntensity = 0.8;
        showBanner('⚠️ TÔNG XE BUÝT HÀ NỘI!', 'GIẢM TỐC ĐỘ!');
      }
    });

    if (player.distanceTraveled >= player.raceTargetDistance && !player.isRaceFinished) {
      finishRace();
    }

    updateEngineSound();
  }

  // =========================================================================
  // 15. ĐỐI THỦ AI & BẢNG THỨ HẠNG
  // =========================================================================
  function updateOpponents(delta) {
    opponents.forEach(op => {
      if (op.isDown) {
        op.downTimer -= delta;
        op.speed = 10;
        if (op.downTimer <= 0) {
          op.isDown = false;
          op.mesh.rotation.z = 0;
          op.speed = op.baseSpeed;
        }
      } else {
        op.speed = op.baseSpeed + Math.sin(op.z * 0.04) * 10;
        op.x += Math.sin(op.z * 0.02 + op.id) * 4.0 * delta;
        op.x = Math.max(-ROAD_WIDTH / 2 + 2, Math.min(ROAD_WIDTH / 2 - 2, op.x));
      }

      const opMoveZ = (op.speed * 1000 / 3600) * delta;
      op.z += opMoveZ;
      op.mesh.position.set(op.x, 0, op.z);
    });

    trafficVehicles.forEach(bus => {
      const busMoveZ = (bus.speed * 1000 / 3600) * delta;
      bus.z += busMoveZ;
      if (bus.z < player.z - 40) {
        bus.z = player.z + 240 + Math.random() * 80;
        bus.x = (Math.random() < 0.5) ? -4.5 : 4.5;
      }
      bus.mesh.position.set(bus.x, 0, bus.z);
    });

    let aheadCount = 0;
    opponents.forEach(op => {
      if (op.z > player.z) aheadCount++;
    });
    player.rank = aheadCount + 1;
  }

  // =========================================================================
  // 16. CAMERA ĐIỆN ẢNH & HIỆU ỨNG RUNG LẮC
  // =========================================================================
  function updateCamera() {
    let targetCamX = player.x;
    let targetCamY = 3.4;
    let targetCamZ = player.z - 6.2;

    if (screenShakeIntensity > 0) {
      targetCamX += (Math.random() - 0.5) * screenShakeIntensity * 2;
      targetCamY += (Math.random() - 0.5) * screenShakeIntensity * 2;
      screenShakeIntensity = Math.max(0, screenShakeIntensity - 0.03);
    }

    camera.position.set(targetCamX, targetCamY, targetCamZ);
    camera.lookAt(player.x, 1.4, player.z + 16);

    // Hiệu ứng tốc độ dãn FOV (Speed Tunnel Vision)
    const targetFov = player.isBoosting ? 76 : (65 + (player.speed / player.maxSpeed) * 8);
    camera.fov += (targetFov - camera.fov) * 0.1;
    camera.updateProjectionMatrix();
  }

  // =========================================================================
  // 17. KẾT THÚC CHẶNG ĐUA & GARAGE
  // =========================================================================
  function finishRace() {
    player.isRaceFinished = true;
    player.speed = 0;

    const rankPrizes = { 1: 500, 2: 300, 3: 200, 4: 100, 5: 50, 6: 20 };
    const prize = (rankPrizes[player.rank] || 50) + player.knockouts * 150;
    userSave.gold += prize;
    saveUserData();

    const endModal = document.getElementById('end-modal');
    const titleEl = document.getElementById('end-title');
    const iconEl = document.getElementById('end-icon');
    const rankEl = document.getElementById('stat-rank');
    const koEl = document.getElementById('stat-ko');
    const prizeEl = document.getElementById('stat-prize');

    if (endModal && titleEl && rankEl && koEl && prizeEl) {
      if (player.rank === 1) {
        iconEl.innerText = '🏆';
        titleEl.innerText = 'VÔ ĐỊCH PHỐ ĐÊM!';
      } else {
        iconEl.innerText = '🏁';
        titleEl.innerText = `HOÀN THÀNH CHẶNG ĐUA! HẠNG #${player.rank}`;
      }
      rankEl.innerText = `#${player.rank}`;
      koEl.innerText = `${player.knockouts} xe`;
      prizeEl.innerText = `+${prize} G`;
      endModal.style.display = 'flex';
    }
    updateHUD();
  }

  function restartRace() {
    document.getElementById('end-modal').style.display = 'none';
    player.isRaceFinished = false;
    player.z = 0;
    player.x = 0;
    player.speed = 0;
    player.distanceTraveled = 0;
    player.knockouts = 0;
    player.nitro = player.maxNitro;

    spawnStartingGridOpponents();
    showControlsHint(5);
    showBanner('BẮT ĐẦU CHẶNG MỚI! 🏍️', 'NHẤN [W] ĐỂ PHÓNG GA! ĐẠP HẠ GỤC ĐỐI THỦ!');
  }

  function openGarage() {
    const modal = document.getElementById('garage-modal');
    if (!modal) return;
    renderGarageBikes();
    renderGarageUpgrades();
    modal.style.display = 'flex';
  }

  function closeGarage() {
    const modal = document.getElementById('garage-modal');
    if (modal) modal.style.display = 'none';
    rebuildPlayerBike();
    updateHUD();
  }

  function renderGarageBikes() {
    const shelf = document.getElementById('bike-shelf');
    const goldText = document.getElementById('garage-gold-text');
    if (!shelf || !goldText) return;

    goldText.innerText = `🪙 ${userSave.gold} G`;
    shelf.innerHTML = '';

    Object.values(BIKES_DATABASE).forEach(bike => {
      const isOwned = userSave.ownedBikes.includes(bike.id);
      const isCurrent = userSave.currentBike === bike.id;

      let statusHtml = '';
      if (isCurrent) statusHtml = `<span class="bike-card-status status-using">ĐANG DÙNG</span>`;
      else if (isOwned) statusHtml = `<span class="bike-card-status status-owned">CHỌN LÁI</span>`;
      else statusHtml = `<span class="bike-card-status status-locked">MUA (${bike.price}G)</span>`;

      const card = document.createElement('div');
      card.className = `bike-card ${isCurrent ? 'active' : ''}`;
      card.innerHTML = `
        <div class="bike-card-icon">${bike.icon}</div>
        <div class="bike-card-name">${bike.name}</div>
        <div class="bike-card-price">${isOwned ? 'ĐÃ SỞ HỮU' : `🪙 ${bike.price} G`}</div>
        ${statusHtml}
      `;

      card.addEventListener('click', () => {
        if (isOwned) {
          userSave.currentBike = bike.id;
          saveUserData();
          renderGarageBikes();
        } else {
          if (userSave.gold >= bike.price) {
            userSave.gold -= bike.price;
            userSave.ownedBikes.push(bike.id);
            userSave.currentBike = bike.id;
            saveUserData();
            renderGarageBikes();
            showBanner('🎉 MUA XE MỚI THÀNH CÔNG!', `BẠN ĐÃ SỞ HỮU ${bike.name.toUpperCase()}!`);
          } else {
            alert('Bạn không đủ tiền để mua chiếc xe này! Hãy đua tiếp để kiếm thêm tiền vàng nhé.');
          }
        }
      });

      shelf.appendChild(card);
    });
  }

  function renderGarageUpgrades() {
    const STAT_COST = 300;
    const stats = ['speed', 'accel', 'kick', 'nitro'];

    stats.forEach(st => {
      const pipsContainer = document.getElementById(`pips-${st}`);
      const btn = document.getElementById(`btn-up-${st}`);
      if (!pipsContainer || !btn) return;

      const currentLvl = userSave.upgrades[st] || 1;
      pipsContainer.innerHTML = '';
      for (let i = 1; i <= 5; i++) {
        const pip = document.createElement('div');
        pip.className = `pip ${i <= currentLvl ? 'filled' : ''}`;
        pipsContainer.appendChild(pip);
      }

      if (currentLvl >= 5) {
        btn.innerText = 'ĐÃ TỐI ĐA (MAX)';
        btn.classList.add('maxed');
        btn.onclick = null;
      } else {
        const cost = STAT_COST * currentLvl;
        btn.innerText = `NÂNG CẤP (${cost}G)`;
        btn.classList.remove('maxed');
        btn.onclick = () => {
          if (userSave.gold >= cost) {
            userSave.gold -= cost;
            userSave.upgrades[st] = currentLvl + 1;
            saveUserData();
            applyBikeStats();
            renderGarageBikes();
            renderGarageUpgrades();
            showBanner('⚡ NÂNG CẤP THÀNH CÔNG!', `ĐÃ LÊN CẤP ${currentLvl + 1}!`);
          } else {
            alert(`Bạn cần ${cost}G để nâng cấp chỉ số này!`);
          }
        };
      }
    });
  }

  // =========================================================================
  // 18. HUD & TIẾN ĐỘ CHẶNG ĐUA (RACE TRACKER)
  // =========================================================================
  function updateHUD() {
    const speedEl = document.getElementById('hud-speed');
    if (speedEl) speedEl.innerText = Math.round(player.speed);

    const rankEl = document.getElementById('hud-rank');
    if (rankEl) rankEl.innerHTML = `${player.rank}<span class="rank-sup">/6</span>`;

    const goldEl = document.getElementById('hud-gold');
    if (goldEl) goldEl.innerText = `🪙 ${userSave.gold} G`;

    const koEl = document.getElementById('hud-ko');
    if (koEl) koEl.innerText = `⚔️ ${player.knockouts}`;

    const nitroFill = document.getElementById('nitro-fill');
    if (nitroFill) {
      const pct = (player.nitro / player.maxNitro) * 100;
      nitroFill.style.width = `${Math.round(pct)}%`;
    }

    // Cập nhật thanh tiến độ Race Tracker
    const distText = document.getElementById('hud-dist-text');
    if (distText) distText.innerText = `${Math.min(2500, Math.round(player.distanceTraveled))} / 2500m`;

    const trackerFill = document.getElementById('tracker-fill');
    const playerPct = Math.min(100, Math.max(0, (player.distanceTraveled / player.raceTargetDistance) * 100));
    if (trackerFill) trackerFill.style.width = `${playerPct}%`;

    const pinPlayer = document.getElementById('pin-player');
    if (pinPlayer) pinPlayer.style.left = `${playerPct}%`;

    // Cập nhật vị trí các Bot trên thanh tiến độ
    opponents.forEach((op, idx) => {
      const pinBot = document.getElementById(`pin-bot-${idx}`);
      if (pinBot) {
        const botPct = Math.min(100, Math.max(0, (op.z / player.raceTargetDistance) * 100));
        pinBot.style.left = `${botPct}%`;
      }
    });
  }

  let bannerTimeout = null;
  function showBanner(title, sub) {
    const banner = document.getElementById('center-banner');
    const titleEl = document.getElementById('banner-title');
    const subEl = document.getElementById('banner-sub');
    if (!banner || !titleEl || !subEl) return;

    titleEl.innerText = title;
    subEl.innerText = sub;
    banner.classList.add('show');

    clearTimeout(bannerTimeout);
    bannerTimeout = setTimeout(() => {
      banner.classList.remove('show');
    }, 2400);
  }

  let hintPanelTimeout = null;
  function showControlsHint(autoHideSeconds = 5) {
    const panel = document.getElementById('controls-hint-panel');
    if (!panel) return;
    panel.classList.remove('hidden');

    if (hintPanelTimeout) clearTimeout(hintPanelTimeout);
    if (autoHideSeconds > 0) {
      hintPanelTimeout = setTimeout(() => panel.classList.add('hidden'), autoHideSeconds * 1000);
    }
  }

  function hideControlsHint() {
    const panel = document.getElementById('controls-hint-panel');
    if (!panel) return;
    panel.classList.add('hidden');
    if (hintPanelTimeout) clearTimeout(hintPanelTimeout);
  }

  function toggleControlsHint() {
    const panel = document.getElementById('controls-hint-panel');
    if (!panel) return;
    if (panel.classList.contains('hidden')) showControlsHint(7);
    else hideControlsHint();
  }

  function togglePhotoMode() {
    isPhotoMode = !isPhotoMode;
    document.body.classList.toggle('photo-mode', isPhotoMode);
    if (isPhotoMode) showBanner('📷 CHẾ ĐỘ ẢNH!', 'NHẤN F2 ĐỂ HIỆN LẠI GIAO DIỆN!');
  }

  // =========================================================================
  // 19. SỰ KIỆN ĐIỀU KHIỂN & INPUT
  // =========================================================================
  function setupInputEvents() {
    window.addEventListener('keydown', e => {
      initAudio();
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') input.gas = true;
      if (k === 's' || e.key === 'ArrowDown') input.brake = true;
      if (k === 'a' || e.key === 'ArrowLeft') input.left = true;
      if (k === 'd' || e.key === 'ArrowRight') input.right = true;
      if (e.key === 'Shift' || e.key === ' ') input.boost = true;
      if (k === 'j') executeKick('left');
      if (k === 'k') executeKick('right');
      if (k === 'h') playHorn();

      if (e.key === 'F1' || k === 'f1') { e.preventDefault(); toggleControlsHint(); }
      if (e.key === 'F2' || k === 'f2') { e.preventDefault(); togglePhotoMode(); }
    });

    window.addEventListener('keyup', e => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') input.gas = false;
      if (k === 's' || e.key === 'ArrowDown') input.brake = false;
      if (k === 'a' || e.key === 'ArrowLeft') input.left = false;
      if (k === 'd' || e.key === 'ArrowRight') input.right = false;
      if (e.key === 'Shift' || e.key === ' ') input.boost = false;
    });

    window.addEventListener('mousedown', e => {
      initAudio();
      if (e.button === 0) executeKick('left');
      if (e.button === 2) executeKick('right');
    });

    window.addEventListener('contextmenu', e => e.preventDefault());

    document.getElementById('btn-toggle-help')?.addEventListener('click', toggleControlsHint);
    document.getElementById('btn-close-hint')?.addEventListener('click', hideControlsHint);
    document.getElementById('btn-photo')?.addEventListener('click', togglePhotoMode);
    document.getElementById('btn-exit-photo')?.addEventListener('click', togglePhotoMode);
    document.getElementById('btn-music')?.addEventListener('click', toggleMusic);

    document.getElementById('btn-sound')?.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      const btn = document.getElementById('btn-sound');
      if (btn) btn.innerText = soundEnabled ? '🔊' : '🔇';
    });

    document.getElementById('btn-horn')?.addEventListener('click', () => {
      initAudio();
      playHorn();
    });

    document.getElementById('btn-garage')?.addEventListener('click', openGarage);
    document.getElementById('btn-close-garage')?.addEventListener('click', closeGarage);
    document.getElementById('btn-resume-race')?.addEventListener('click', closeGarage);

    document.getElementById('btn-end-garage')?.addEventListener('click', () => {
      document.getElementById('end-modal').style.display = 'none';
      openGarage();
    });
    document.getElementById('btn-end-restart')?.addEventListener('click', restartRace);

    // Touch controls
    const bindTouch = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', e => { e.preventDefault(); initAudio(); onDown(); });
      el.addEventListener('touchend', e => { e.preventDefault(); onUp(); });
    };

    bindTouch('touch-gas', () => input.gas = true, () => input.gas = false);
    bindTouch('touch-brake', () => input.brake = true, () => input.brake = false);
    bindTouch('touch-left', () => input.left = true, () => input.left = false);
    bindTouch('touch-right', () => input.right = true, () => input.right = false);
    bindTouch('touch-nitro', () => input.boost = true, () => input.boost = false);

    document.getElementById('touch-kick-l')?.addEventListener('touchstart', e => {
      e.preventDefault(); executeKick('left');
    });
    document.getElementById('touch-kick-r')?.addEventListener('touchstart', e => {
      e.preventDefault(); executeKick('right');
    });
  }

  // =========================================================================
  // 20. GAME LOOP
  // =========================================================================
  let lastTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);

    const delta = Math.min(0.06, (now - lastTime) / 1000);
    lastTime = now;

    updatePlayerPhysics(delta);
    updateKickAnimation(delta);
    updateOpponents(delta);
    updateNitroPickups(delta);
    updateRoadRecycling();
    updateParticles(delta);
    updateCamera();
    updateHUD();

    renderer.render(scene, camera);
  }

  // Khởi động
  window.addEventListener('DOMContentLoaded', () => {
    loadUserSave();
    initThree();
    setupInputEvents();
    showControlsHint(5);
    showBanner('BÃO ĐÊM PHỐ CỔ 🏍️', 'NHẤN [W] ĐỂ PHÓNG GA! A=TRÁI, D=PHẢI. [J]/[K]=ĐẠP ĐỐI THỦ!');
    requestAnimationFrame(animate);
  });

})();
