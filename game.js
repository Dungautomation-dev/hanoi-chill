/**
 * Hà Nội Midnight Rush - Bão Đêm Phố Cổ 3D (v3.5 - Road Rash Edition)
 * Three.js WebGL Engine, Accurate Steering, Enhanced Kick Animation,
 * Starting-Grid Bots, Nitro Road Pickups, Garage & LocalStorage Save.
 */

(function () {
  'use strict';

  // --- 1. DỮ LIỆU CÁC DÒNG XE & NÂNG CẤP (BIKES & STATS) ---
  const BIKES_DATABASE = {
    cub50: {
      id: 'cub50',
      name: 'Honda Super Cub 50',
      icon: '🛵',
      price: 0,
      color: 0x0284c7, // Xanh bích
      shieldColor: 0xf1f5f9,
      baseSpeed: 115,
      baseAccel: 50,
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
      baseAccel: 62,
      baseKick: 1.25,
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
      baseSpeed: 145,
      baseAccel: 75,
      baseKick: 1.6,
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
      baseSpeed: 165,
      baseAccel: 90,
      baseKick: 2.0,
      baseNitro: 150,
      desc: 'Vua côn tay đường phố, tốc độ xé gió, quái kiệt phố đêm!'
    }
  };

  // Trạng thái lưu trữ của người chơi (Persistent Player Save)
  let userSave = {
    gold: 500,
    currentBike: 'cub50',
    ownedBikes: ['cub50'],
    upgrades: {
      speed: 1, // 1..5
      accel: 1,
      kick: 1,
      nitro: 1
    },
    totalKOs: 0,
    highScore: 0
  };

  function loadUserSave() {
    try {
      const raw = localStorage.getItem('hanoirush_save_v3');
      if (raw) {
        const parsed = JSON.parse(raw);
        userSave = Object.assign(userSave, parsed);
      }
    } catch (e) {
      console.warn('Lỗi đọc save, dùng mặc định:', e);
    }
  }

  function saveUserData() {
    try {
      localStorage.setItem('hanoirush_save_v3', JSON.stringify(userSave));
    } catch (e) {
      console.error('Lỗi ghi save:', e);
    }
  }

  // --- 2. BIẾN GAME THREE.JS & THẾ GIỚI ---
  let scene, camera, renderer;
  let playerBikeMesh = null;
  let playerLeftLeg = null, playerRightLeg = null, playerTorso = null;
  let kickSwooshMesh = null;
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
    accel: 50,
    brake: 90,
    handling: 18,
    leanAngle: 0,
    nitro: 100,
    maxNitro: 100,
    isBoosting: false,
    kickSide: null, // 'left' | 'right' | null
    kickTimer: 0,
    kickPower: 1.0,
    knockouts: 0,
    distanceTraveled: 0,
    raceTargetDistance: 2500, // 2.5km mỗi chặng đua
    isRaceFinished: false,
    rank: 1,
    crashedTimer: 0
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

  // --- 3. ÂM THANH RETRO BÔ XE MÁY & VA CHẠM ---
  function initAudio() {
    if (audioCtx) return;
    try {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioClass) return;
      audioCtx = new AudioClass();

      engineOsc = audioCtx.createOscillator();
      engineGain = audioCtx.createGain();
      engineOsc.type = 'sawtooth';
      engineOsc.frequency.setValueAtTime(45, audioCtx.currentTime);
      engineGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, audioCtx.currentTime);

      engineOsc.connect(filter);
      filter.connect(engineGain);
      engineGain.connect(audioCtx.destination);
      engineOsc.start();
    } catch (e) {
      console.warn('Audio Init Error:', e);
    }
  }

  function updateEngineSound() {
    if (!audioCtx || !engineOsc || !engineGain || !soundEnabled) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const targetFreq = 42 + (player.speed / player.maxSpeed) * 120 + (player.isBoosting ? 45 : 0);
    engineOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.08);
    const targetGain = player.speed > 2 ? 0.09 : 0.03;
    engineGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.1);
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
    gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.16);
  }

  function playPickupSound() {
    if (!audioCtx || !soundEnabled) return;
    // Âm thanh ăn Nitro ting ting
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

  // --- 4. TÍNH TOÁN CHỈ SỐ XE & NÂNG CẤP ---
  function applyBikeStats() {
    const bikeData = BIKES_DATABASE[userSave.currentBike] || BIKES_DATABASE.cub50;
    const up = userSave.upgrades;

    player.maxSpeed = bikeData.baseSpeed + (up.speed - 1) * 8;
    player.accel = bikeData.baseAccel + (up.accel - 1) * 6;
    player.kickPower = bikeData.baseKick + (up.kick - 1) * 0.25;
    player.maxNitro = bikeData.baseNitro + (up.nitro - 1) * 20;
    player.nitro = player.maxNitro;
  }

  // --- 5. TẠO THREE.JS SCENE ---
  function initThree() {
    const container = document.getElementById('game-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b19);
    scene.fog = new THREE.FogExp2(0x0a1128, 0.0075);

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.2, 500);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x28406c, 0.75);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x77aaff, 0.65);
    moonLight.position.set(30, 80, -40);
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

  // --- 6. MÔ HÌNH XE MÁY 3D & ANIMATION ĐẠP ĐẸP MẮT ---
  function createDetailedBikeMesh(colorHex, shieldColorHex, isOpponent = false, riderName = '') {
    const bikeGroup = new THREE.Group();

    // 1. Khung xe chính (Metallic Frame)
    const bodyGeo = new THREE.BoxGeometry(0.72, 0.78, 2.1);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.25,
      metalness: 0.75
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.85;
    bikeGroup.add(body);

    // 2. Yếm xe (Leg shield)
    const shieldGeo = new THREE.BoxGeometry(1.05, 0.82, 0.22);
    const shieldMat = new THREE.MeshStandardMaterial({ color: shieldColorHex, roughness: 0.4 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 0.8, 0.48);
    bikeGroup.add(shield);

    // 3. Yên xe
    const seatGeo = new THREE.BoxGeometry(0.66, 0.26, 1.15);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 1.25, -0.32);
    bikeGroup.add(seat);

    // 4. Bánh xe gai cao su + mâm kim loại
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.28, 18);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    wheelGeo.rotateZ(Math.PI / 2);

    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.position.set(0, 0.5, 1.18);
    bikeGroup.add(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
    rearWheel.position.set(0, 0.5, -0.95);
    bikeGroup.add(rearWheel);

    // 5. Đèn pha trước + SpotLight
    const headlightGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.2, 16);
    headlightGeo.rotateX(Math.PI / 2);
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headlight = new THREE.Mesh(headlightGeo, headlightMat);
    headlight.position.set(0, 1.18, 1.12);
    bikeGroup.add(headlight);

    if (!isOpponent) {
      const spotLight = new THREE.SpotLight(0xfff8d6, 3.5, 60, Math.PI / 6, 0.45, 1.2);
      spotLight.position.set(0, 1.18, 1.2);
      const spotTarget = new THREE.Object3D();
      spotTarget.position.set(0, 0, 30);
      bikeGroup.add(spotTarget);
      spotLight.target = spotTarget;
      bikeGroup.add(spotLight);

      // Ngọn lửa Nitro ở đuôi pô (Exhaust Flame)
      const flameGeo = new THREE.ConeGeometry(0.2, 1.2, 8);
      flameGeo.rotateX(-Math.PI / 2);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0 });
      exhaustFlame = new THREE.Mesh(flameGeo, flameMat);
      exhaustFlame.position.set(0.38, 0.45, -1.75);
      bikeGroup.add(exhaustFlame);
    }

    // 6. Đèn hậu xe
    const tailGeo = new THREE.BoxGeometry(0.32, 0.16, 0.1);
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const tailLight = new THREE.Mesh(tailGeo, tailMat);
    tailLight.position.set(0, 1.12, -1.06);
    bikeGroup.add(tailLight);

    // 7. Tay lái
    const handleGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.15, 10);
    handleGeo.rotateZ(Math.PI / 2);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0, 1.36, 0.88);
    bikeGroup.add(handle);

    // 8. Ống xả pô
    const exhaustGeo = new THREE.CylinderGeometry(0.09, 0.14, 1.2, 10);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9 });
    const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.position.set(0.38, 0.45, -0.65);
    bikeGroup.add(exhaust);

    // 9. Người lái (Rider) với các khớp chân riêng biệt để ĐẠP
    const riderGroup = new THREE.Group();

    // Thân áo
    const torsoGeo = new THREE.BoxGeometry(0.65, 0.75, 0.42);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: isOpponent ? 0xd97706 : 0x0284c7,
      roughness: 0.7
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 1.72, -0.2);
    torso.rotation.x = 0.28;
    riderGroup.add(torso);

    // Đầu & Nón bảo hiểm
    const helmetGeo = new THREE.SphereGeometry(0.3, 14, 14);
    const helmetMat = new THREE.MeshStandardMaterial({
      color: isOpponent ? 0xef4444 : 0xfacc15,
      roughness: 0.3
    });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.set(0, 2.28, -0.05);
    riderGroup.add(helmet);

    // Chân trái & Chân phải (Upper leg + Lower leg)
    const legGeo = new THREE.BoxGeometry(0.24, 0.75, 0.28);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(0.34, 1.15, -0.15); // Bên trái (+X)
    riderGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(-0.34, 1.15, -0.15); // Bên phải (-X)
    riderGroup.add(rightLeg);

    bikeGroup.add(riderGroup);

    // Bảng tên 3D lơ lửng trên đầu Bot đối thủ (Nameplate)
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

    c.font = 'bold 26px Arial, sans-serif';
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
    if (playerBikeMesh) {
      scene.remove(playerBikeMesh);
    }
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

  // --- 7. TẠO CÁC BOT ĐỐI THỦ ĐỨNG NGAY VẠCH XUẤT PHÁT (STARTING GRID) ---
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
        downTimer: 0,
        lean: 0
      });
    });
  }

  // --- 8. VẬT PHẨM NITRO TRÊN ĐƯỜNG (NITRO ROAD PICKUPS) ---
  function spawnNitroPickups() {
    for (let i = 0; i < 12; i++) {
      const nitroGroup = new THREE.Group();

      // Bình gas màu xanh Cyan rực rỡ
      const canGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16);
      const canMat = new THREE.MeshStandardMaterial({
        color: 0x00f3ff,
        emissive: 0x00f3ff,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });
      const can = new THREE.Mesh(canGeo, canMat);
      nitroGroup.add(can);

      // Vòng hào quang sáng (Glowing ring)
      const ringGeo = new THREE.TorusGeometry(0.65, 0.08, 8, 20);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
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
      // Xoay tròn và nhấp nhô lơ lửng
      np.mesh.rotation.y += 2.5 * delta;
      np.mesh.position.y = 1.2 + Math.sin(player.z * 0.08 + np.z) * 0.25;

      // Nhặt Nitro
      if (np.active) {
        const dz = Math.abs(np.z - player.z);
        const dx = Math.abs(np.x - player.x);
        if (dz < 2.5 && dx < 1.8) {
          np.active = false;
          np.mesh.visible = false;
          playPickupSound();

          // Hồi đầy bình Nitro + Bùng nổ tốc độ ngay lập tức!
          player.nitro = player.maxNitro;
          player.speed = Math.min(player.maxSpeed + 35, player.speed + 30);
          player.isBoosting = true;
          spawnSparks(player.x, 0.8, player.z);
          showBanner('⚡ BÌNH NITRO N2O!', 'TĂNG TỐC XÉ GIÓ!');

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

  // --- 9. XE BUÝT HÀ NỘI SỐ 01 / 02 ---
  function spawnTrafficBuses() {
    for (let i = 0; i < 5; i++) {
      const busGroup = new THREE.Group();

      const busBodyGeo = new THREE.BoxGeometry(3.6, 3.8, 12);
      const busMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
      const busBody = new THREE.Mesh(busBodyGeo, busMat);
      busBody.position.y = 2.1;
      busGroup.add(busBody);

      const lowerGeo = new THREE.BoxGeometry(3.65, 1.2, 12.05);
      const lowerMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c });
      const lower = new THREE.Mesh(lowerGeo, lowerMat);
      lower.position.y = 0.9;
      busGroup.add(lower);

      const glassGeo = new THREE.BoxGeometry(3.7, 1.4, 11);
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 });
      const glass = new THREE.Mesh(glassGeo, glassMat);
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

  // --- 10. ĐƯỜNG PHỐ & NHÀ CỔ VÔ TẬN ---
  const NEON_SIGNS = [
    'PHỞ BÁT ĐÀN', 'BIA HƠI HÀ NỘI', 'CAFE TRỨNG', 'TRÀ ĐÁ VỈA HÈ',
    'BÚN CHẢ PHỐ CỔ', 'CẮM ĐỒ 24/7', 'KEM TRÀNG TIỀN', 'LẨU ẾCH HỒ TÂY'
  ];

  function createNeonTexture(text) {
    const cvs = document.createElement('canvas');
    cvs.width = 512;
    cvs.height = 128;
    const c = cvs.getContext('2d');
    c.fillStyle = '#0b1329';
    c.fillRect(0, 0, 512, 128);

    c.strokeStyle = '#00f3ff';
    c.lineWidth = 6;
    c.strokeRect(8, 8, 496, 112);

    c.font = 'bold 36px Arial, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#ffea00';
    c.shadowColor = '#ff0055';
    c.shadowBlur = 18;
    c.fillText(text, 256, 64);

    return new THREE.CanvasTexture(cvs);
  }

  function createRoadSegment(index) {
    const segGroup = new THREE.Group();
    const segZ = index * SEGMENT_LENGTH;

    const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, SEGMENT_LENGTH);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x141824,
      roughness: 0.45,
      metalness: 0.2
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    segGroup.add(roadMesh);

    // Vạch kẻ vàng
    for (let l = 0; l < 4; l++) {
      const lineGeo = new THREE.PlaneGeometry(0.35, 6);
      lineGeo.rotateX(-Math.PI / 2);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set(0, 0.02, -SEGMENT_LENGTH / 2 + 10 + l * 20);
      segGroup.add(lineMesh);
    }

    // Vỉa hè
    const walkGeo = new THREE.BoxGeometry(6, 0.4, SEGMENT_LENGTH);
    const walkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const leftWalk = new THREE.Mesh(walkGeo, walkMat);
    leftWalk.position.set(-ROAD_WIDTH / 2 - 3, 0.2, 0);
    segGroup.add(leftWalk);

    const rightWalk = new THREE.Mesh(walkGeo, walkMat);
    rightWalk.position.set(ROAD_WIDTH / 2 + 3, 0.2, 0);
    segGroup.add(rightWalk);

    // Cột đèn cao áp
    const lampX = ROAD_WIDTH / 2 + 2;
    const lampPoleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8);
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const lampPole = new THREE.Mesh(lampPoleGeo, lampMat);
    lampPole.position.set(lampX, 3.75, 0);
    segGroup.add(lampPole);

    const bulbGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd54f });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(lampX - 0.8, 7.4, 0);
    segGroup.add(bulb);

    const streetLight = new THREE.PointLight(0xffb74d, 1.2, 32, 1.6);
    streetLight.position.set(lampX - 0.8, 7.2, 0);
    segGroup.add(streetLight);

    // Dãy nhà ống & Biển hiệu Neon
    [-1, 1].forEach(side => {
      const bldHeight = 12 + Math.random() * 8;
      const bldGeo = new THREE.BoxGeometry(8, bldHeight, 22);
      const bldMat = new THREE.MeshStandardMaterial({
        color: (side === -1) ? 0x94a3b8 : 0x78716c,
        roughness: 0.85
      });
      const bldMesh = new THREE.Mesh(bldGeo, bldMat);
      bldMesh.position.set(side * (ROAD_WIDTH / 2 + 10), bldHeight / 2, 0);
      segGroup.add(bldMesh);

      if (Math.random() < 0.65) {
        const signText = NEON_SIGNS[Math.floor(Math.random() * NEON_SIGNS.length)];
        const signGeo = new THREE.PlaneGeometry(6, 1.8);
        const signMat = new THREE.MeshBasicMaterial({
          map: createNeonTexture(signText),
          transparent: true
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(side * (ROAD_WIDTH / 2 + 5.9), 5.5, 0);
        sign.rotation.y = (side === -1) ? Math.PI / 2 : -Math.PI / 2;
        segGroup.add(sign);
      }
    });

    segGroup.position.z = segZ;
    scene.add(segGroup);
    return segGroup;
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

  // --- 11. HỆ THỐNG TIA LỬA ĐIỆN (SPARKS) ---
  function spawnSparks(x, y, z) {
    const sparkGeo = new THREE.BufferGeometry();
    const count = 30;
    const pos = [];
    const vels = [];

    for (let i = 0; i < count; i++) {
      pos.push(x, y, z);
      vels.push(
        (Math.random() - 0.5) * 14,
        Math.random() * 9 + 3,
        (Math.random() - 0.5) * 14
      );
    }

    sparkGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffea00,
      size: 0.5,
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

  // --- 12. CƠ CHẾ ĐẠP NHAU VÀ ANIMATION ĐẸP MẮT (ROAD RASH KICK) ---
  let screenShakeIntensity = 0;

  function executeKick(side) {
    if (player.kickSide !== null || !playerLeftLeg || !playerRightLeg) return;
    initAudio();
    player.kickSide = side;
    player.kickTimer = 0.4; // Thời gian vung chân

    // Animation đạp lực lưỡng: Thân người nghiêng ngược chiều, chân vung thẳng ra ngoài
    // Nhắc lại: +X là BÊN TRÁI màn hình, -X là BÊN PHẢI màn hình
    if (side === 'left') {
      playerLeftLeg.position.set(1.15, 1.35, 0.2); // Vung chân trái sang bên trái (+X)
      playerLeftLeg.rotation.z = -1.35;
      playerLeftLeg.rotation.x = -0.4;
      playerTorso.rotation.z = 0.3; // Thân người nghiêng sang phải để lấy thế
    } else {
      playerRightLeg.position.set(-1.15, 1.35, 0.2); // Vung chân phải sang bên phải (-X)
      playerRightLeg.rotation.z = 1.35;
      playerRightLeg.rotation.x = -0.4;
      playerTorso.rotation.z = -0.3;
    }

    // Kiểm tra va chạm với đối thủ trong tầm đạp (Khoảng cách < 3.8m)
    let hitOpponent = null;
    opponents.forEach(op => {
      if (op.isDown) return;
      const dz = Math.abs(op.z - player.z);
      const dx = op.x - player.x;

      if (dz < 3.2) {
        // Đối thủ bên trái có dx > 0 (+X), đối thủ bên phải có dx < 0 (-X)
        if (side === 'left' && dx > 0.3 && dx < 4.0) {
          hitOpponent = op;
        } else if (side === 'right' && dx < -0.3 && dx > -4.0) {
          hitOpponent = op;
        }
      }
    });

    if (hitOpponent) {
      playKickHit();
      hitOpponent.isDown = true;
      hitOpponent.downTimer = 4.2;
      hitOpponent.speed = 8;
      hitOpponent.mesh.rotation.z = (side === 'left') ? -1.5 : 1.5;

      spawnSparks(hitOpponent.x, 0.6, hitOpponent.z);
      screenShakeIntensity = 0.55;

      player.knockouts++;
      userSave.totalKOs++;
      userSave.gold += 150; // Thưởng 150G mỗi lần hạ gục
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
        // Thu chân và thân về vị trí ngồi bình thường (+X là trái, -X là phải)
        playerLeftLeg.position.set(0.34, 1.15, -0.15);
        playerLeftLeg.rotation.set(0, 0, 0);
        playerRightLeg.position.set(-0.34, 1.15, -0.15);
        playerRightLeg.rotation.set(0, 0, 0);
        playerTorso.rotation.z = 0;
      }
    }
  }

  // --- 13. SỬA CHÍNH XÁC HƯỚNG BẺ LÁI (STEERING DIRECTION FIX) ---
  function updatePlayerPhysics(delta) {
    if (player.isRaceFinished) return;

    // 1. Ga & Phanh
    const currentMaxSpeed = player.isBoosting ? player.maxSpeed + 35 : player.maxSpeed;

    if (input.gas) {
      player.speed = Math.min(currentMaxSpeed, player.speed + player.accel * delta);
    } else if (input.brake) {
      player.speed = Math.max(0, player.speed - player.brake * delta);
    } else {
      player.speed = Math.max(0, player.speed - 18 * delta);
    }

    // 2. Nitro Boost
    if (input.boost && player.nitro > 0 && player.speed > 25) {
      player.isBoosting = true;
      player.nitro = Math.max(0, player.nitro - 40 * delta);
      player.speed = Math.min(currentMaxSpeed, player.speed + 50 * delta);
      if (exhaustFlame) exhaustFlame.material.opacity = 0.95;
    } else {
      player.isBoosting = false;
      player.nitro = Math.min(player.maxNitro, player.nitro + 4 * delta);
      if (exhaustFlame) exhaustFlame.material.opacity = 0;
    }

    // 3. ĐIỀU KHIỂN BẺ LÁI CHUẨN XÁC THEO TAY NGƯỜI CHƠI:
    // Vì Camera đặt sau xe nhìn theo hướng +Z:
    // +X là BÊN TRÁI màn hình (Screen Left / Tay trái người chơi)
    // -X là BÊN PHẢI màn hình (Screen Right / Tay phải người chơi)
    const steerSpeed = player.handling * (player.speed / player.maxSpeed);
    let targetLean = 0;

    if (input.left) {
      player.x += steerSpeed * delta; // Phím A / Mũi tên Trái: Lách sang TRÁI (+X)
      targetLean = -0.45;             // Nghiêng thân xe sang BÊN TRÁI màn hình
    } else if (input.right) {
      player.x -= steerSpeed * delta; // Phím D / Mũi tên Phải: Lách sang PHẢI (-X)
      targetLean = 0.45;              // Nghiêng thân xe sang BÊN PHẢI màn hình
    }

    player.x = Math.max(-ROAD_WIDTH / 2 + 1.2, Math.min(ROAD_WIDTH / 2 - 1.2, player.x));
    player.leanAngle += (targetLean - player.leanAngle) * 14 * delta;

    // Tiến lên phía trước theo trục Z
    const moveZ = (player.speed * 1000 / 3600) * delta;
    player.z += moveZ;
    player.distanceTraveled += moveZ;

    // Cập nhật vị trí và góc xoay Mesh
    playerBikeMesh.position.set(player.x, 0, player.z);
    // rotation.z nghiêng xe sang trái/phải, rotation.y bẻ hướng đầu xe
    playerBikeMesh.rotation.z = player.leanAngle;
    playerBikeMesh.rotation.y = -player.leanAngle * 0.35;

    // Lăn bánh xe
    const wheelRot = moveZ * 2.2;
    if (playerBikeMesh.children[3] && playerBikeMesh.children[4]) {
      playerBikeMesh.children[3].rotation.x += wheelRot;
      playerBikeMesh.children[4].rotation.x += wheelRot;
    }

    // 4. Va chạm với xe buýt
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

    // 5. Kiểm tra kết thúc chặng đua (Race Finish)
    if (player.distanceTraveled >= player.raceTargetDistance && !player.isRaceFinished) {
      finishRace();
    }

    updateEngineSound();
  }

  // --- 14. CẬP NHẬT ĐỐI THỦ AI & THỨ HẠNG ---
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
        // AI chạy bám đuổi người chơi quyết liệt
        op.speed = op.baseSpeed + Math.sin(op.z * 0.04) * 10;
        op.x += Math.sin(op.z * 0.02 + op.id) * 4.0 * delta;
        op.x = Math.max(-ROAD_WIDTH / 2 + 2, Math.min(ROAD_WIDTH / 2 - 2, op.x));
      }

      const opMoveZ = (op.speed * 1000 / 3600) * delta;
      op.z += opMoveZ;
      op.mesh.position.set(op.x, 0, op.z);
    });

    // Cập nhật xe buýt
    trafficVehicles.forEach(bus => {
      const busMoveZ = (bus.speed * 1000 / 3600) * delta;
      bus.z += busMoveZ;
      if (bus.z < player.z - 40) {
        bus.z = player.z + 240 + Math.random() * 80;
        bus.x = (Math.random() < 0.5) ? -4.5 : 4.5;
      }
      bus.mesh.position.set(bus.x, 0, bus.z);
    });

    // Tính thứ hạng
    let aheadCount = 0;
    opponents.forEach(op => {
      if (op.z > player.z) aheadCount++;
    });
    player.rank = aheadCount + 1;
  }

  // --- 15. CAMERA BÁM THEO MƯỢT MÀ ---
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
  }

  // --- 16. KẾT THÚC CHẶNG ĐUA & THƯỞNG TIỀN (FINISH RACE) ---
  function finishRace() {
    player.isRaceFinished = true;
    player.speed = 0;

    // Tiền thưởng tính theo thứ hạng và KOs
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
    showBanner('BẮT ĐẦU CHẶNG MỚI! 🏍️', 'NHẤN [W] ĐỂ PHÓNG GA! ĐẠP HẠ GỤC ĐỐI THỦ!');
  }

  // --- 17. QUẢN LÝ GARAGE XE & NÂNG CẤP CHỈ SỐ ---
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
      if (isCurrent) {
        statusHtml = `<span class="bike-card-status status-using">ĐANG DÙNG</span>`;
      } else if (isOwned) {
        statusHtml = `<span class="bike-card-status status-owned">CHỌN LÁI</span>`;
      } else {
        statusHtml = `<span class="bike-card-status status-locked">MUA (${bike.price}G)</span>`;
      }

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
          // Mua xe mới
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
    const STAT_COST = 300; // Mỗi cấp tốn 300G
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

  // --- 18. GIAO DIỆN & INPUT EVENTS ---
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

  function setupInputEvents() {
    window.addEventListener('keydown', e => {
      initAudio();
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') input.gas = true;
      if (k === 's' || e.key === 'ArrowDown') input.brake = true;

      // CHUẨN XÁC: A = Trái, D = Phải
      if (k === 'a' || e.key === 'ArrowLeft') input.left = true;
      if (k === 'd' || e.key === 'ArrowRight') input.right = true;

      if (e.key === 'Shift' || e.key === ' ') input.boost = true;
      if (k === 'j') executeKick('left');
      if (k === 'k') executeKick('right');
      if (k === 'h') playHorn();
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

  // Tay cầm Gamepad
  let prevGpButtons = {};
  function pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads || !gamepads[0]) return;
    const gp = gamepads[0];

    const ax = gp.axes[0] || 0;
    input.left = gp.buttons[14]?.pressed || ax < -0.35;
    input.right = gp.buttons[15]?.pressed || ax > 0.35;

    input.gas = gp.buttons[7]?.pressed || gp.buttons[0]?.pressed;
    input.brake = gp.buttons[6]?.pressed || gp.buttons[1]?.pressed;

    if (gp.buttons[2]?.pressed && !prevGpButtons[2]) executeKick('left');
    prevGpButtons[2] = gp.buttons[2]?.pressed;

    if (gp.buttons[1]?.pressed && !prevGpButtons[1]) executeKick('right');
    prevGpButtons[1] = gp.buttons[1]?.pressed;

    input.boost = gp.buttons[5]?.pressed;
  }

  // --- 19. GAME LOOP ---
  let lastTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);

    const delta = Math.min(0.06, (now - lastTime) / 1000);
    lastTime = now;

    pollGamepad();
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
    showBanner('BÃO ĐÊM PHỐ CỔ 🏍️', 'NHẤN [W] ĐỂ PHÓNG GA! A=TRÁI, D=PHẢI. [J]/[K]=ĐẠP ĐỐI THỦ!');
    requestAnimationFrame(animate);
  });

})();
