/**
 * Hà Nội Midnight Rush - Bão Đêm Phố Cổ 3D (Road Rash Edition)
 * Engine: Three.js WebGL 3D, Procedural City, Physics, Bike Combat & Web Audio Synth
 */

(function () {
  'use strict';

  // --- 1. BIẾN TOÀN CỤC & THREE.JS SETUP ---
  let scene, camera, renderer;
  let playerBike, playerRider;
  const opponents = [];
  const trafficVehicles = [];
  const roadSegments = [];
  const streetProps = [];
  const sparkParticles = [];
  const smokeParticles = [];

  const ROAD_WIDTH = 22;
  const SEGMENT_LENGTH = 80;
  const TOTAL_SEGMENTS = 14;
  const VISIBLE_DISTANCE = SEGMENT_LENGTH * TOTAL_SEGMENTS;

  // Trạng thái người chơi
  const player = {
    x: 0,
    z: 0,
    speed: 0,
    maxSpeed: 135,
    accel: 55,
    brake: 85,
    handling: 16,
    leanAngle: 0,
    wheelieAngle: 0,
    nitro: 100,
    isBoosting: false,
    kickSide: null, // 'left' | 'right' | null
    kickTimer: 0,
    knockouts: 0,
    distanceTraveled: 0,
    rank: 1,
    crashedTimer: 0,
    cameraView: 0 // 0: Close Chase, 1: High Far, 2: First-Person Handlebar
  };

  // Trạng thái điều khiển (Controls)
  const input = {
    gas: false,
    brake: false,
    left: false,
    right: false,
    kickLeft: false,
    kickRight: false,
    boost: false
  };

  // Âm thanh Web Audio Synth
  let audioCtx = null;
  let engineOsc = null;
  let engineGain = null;
  let soundEnabled = true;

  // --- 2. BỘ TỔNG HỢP ÂM THANH RETRO BÔ XE MÁY & VA CHẠM ---
  function initAudio() {
    if (audioCtx) return;
    try {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioClass) return;
      audioCtx = new AudioClass();

      // Động cơ xe máy (Sawtooth oscillator giả lập tiếng pô rít)
      engineOsc = audioCtx.createOscillator();
      engineGain = audioCtx.createGain();
      engineOsc.type = 'sawtooth';
      engineOsc.frequency.setValueAtTime(45, audioCtx.currentTime);
      engineGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, audioCtx.currentTime);

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

    // Cao độ tiếng bô tăng vọt theo vận tốc
    const targetFreq = 40 + (player.speed / player.maxSpeed) * 110 + (player.isBoosting ? 40 : 0);
    engineOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.08);
    const targetGain = player.speed > 2 ? 0.09 : 0.03;
    engineGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.1);
  }

  function playHorn() {
    if (!audioCtx || !soundEnabled) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.setValueAtTime(554, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }

  function playKickHit() {
    if (!audioCtx || !soundEnabled) return;
    // Tiếng đấm/đạp côm cốp va kim loại (Metallic crunch)
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  }

  function playCrashSound() {
    if (!audioCtx || !soundEnabled) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  }

  // --- 3. KHỞI TẠO THREE.JS SCENE & ÁNH SÁNG ĐÊM PHỐ CỔ ---
  function initThree() {
    const container = document.getElementById('game-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b19);
    // Sương mù đêm Hà Nội huyền ảo
    scene.fog = new THREE.FogExp2(0x0a1128, 0.0075);

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.2, 500);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Ánh sáng môi trường đêm (Night ambient light)
    const ambientLight = new THREE.AmbientLight(0x223a66, 0.65);
    scene.add(ambientLight);

    // Ánh trăng xanh mờ chiếu rọi
    const moonLight = new THREE.DirectionalLight(0x77aaff, 0.55);
    moonLight.position.set(30, 80, -40);
    scene.add(moonLight);

    // Xây dựng đường phố và người chơi
    buildRoadNetwork();
    createPlayerMotorcycle();
    spawnOpponents();
    spawnTrafficBuses();

    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // --- 4. TẠO MÔ HÌNH XE MÁY ĐUA 3D CHI TIẾT ---
  function createBikeMesh(colorHex, isOpponent = false) {
    const bikeGroup = new THREE.Group();

    // 1. Thân xe chính (Body frame)
    const bodyGeo = new THREE.BoxGeometry(0.7, 0.75, 2.0);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.3,
      metalness: 0.6
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.85;
    bikeGroup.add(body);

    // 2. Yếm xe màu trắng ngà (Classic Honda Cub/Dream leg shield)
    const shieldGeo = new THREE.BoxGeometry(1.0, 0.8, 0.2);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 0.8, 0.45);
    bikeGroup.add(shield);

    // 3. Yên xe bọc da đen
    const seatGeo = new THREE.BoxGeometry(0.65, 0.25, 1.1);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 1.25, -0.35);
    bikeGroup.add(seat);

    // 4. Bánh xe trước & sau (Wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.28, 18);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    wheelGeo.rotateZ(Math.PI / 2);

    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.position.set(0, 0.5, 1.15);
    bikeGroup.add(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
    rearWheel.position.set(0, 0.5, -0.95);
    bikeGroup.add(rearWheel);

    // 5. Đèn pha trước (Headlight)
    const headlightGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.2, 16);
    headlightGeo.rotateX(Math.PI / 2);
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headlight = new THREE.Mesh(headlightGeo, headlightMat);
    headlight.position.set(0, 1.15, 1.1);
    bikeGroup.add(headlight);

    // Đèn rọi SpotLight thực tế soi sáng mặt đường phía trước
    if (!isOpponent) {
      const spotLight = new THREE.SpotLight(0xfff8d6, 3.2, 55, Math.PI / 6, 0.45, 1.2);
      spotLight.position.set(0, 1.15, 1.2);
      const spotTarget = new THREE.Object3D();
      spotTarget.position.set(0, 0, 25);
      bikeGroup.add(spotTarget);
      spotLight.target = spotTarget;
      bikeGroup.add(spotLight);
    }

    // 6. Đèn hậu đỏ rực phía sau
    const tailGeo = new THREE.BoxGeometry(0.3, 0.16, 0.1);
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const tailLight = new THREE.Mesh(tailGeo, tailMat);
    tailLight.position.set(0, 1.1, -1.05);
    bikeGroup.add(tailLight);

    // 7. Tay lái (Handlebars)
    const handleGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 10);
    handleGeo.rotateZ(Math.PI / 2);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0, 1.35, 0.85);
    bikeGroup.add(handle);

    // 8. Ống xả pô xe mạ bạc
    const exhaustGeo = new THREE.CylinderGeometry(0.09, 0.12, 1.1, 10);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9 });
    const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.position.set(0.38, 0.45, -0.65);
    bikeGroup.add(exhaust);

    // 9. Nhân vật tay đua (Rider)
    const riderGroup = new THREE.Group();

    // Thân áo
    const torsoGeo = new THREE.BoxGeometry(0.65, 0.75, 0.4);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: isOpponent ? 0xd97706 : 0x0284c7,
      roughness: 0.7
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 1.7, -0.2);
    torso.rotation.x = 0.28; // Hơi khom người núp gió
    riderGroup.add(torso);

    // Đầu & Mũ bảo hiểm nửa đầu
    const helmetGeo = new THREE.SphereGeometry(0.28, 14, 14);
    const helmetMat = new THREE.MeshStandardMaterial({
      color: isOpponent ? 0xef4444 : 0xfacc15,
      roughness: 0.3
    });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.set(0, 2.25, -0.05);
    riderGroup.add(helmet);

    // Chân trái & Chân phải (Có thể co duỗi khi ĐẠP)
    const legGeo = new THREE.BoxGeometry(0.2, 0.65, 0.25);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.32, 1.15, -0.15);
    riderGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.32, 1.15, -0.15);
    riderGroup.add(rightLeg);

    bikeGroup.add(riderGroup);

    return {
      mesh: bikeGroup,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      wheels: [frontWheel, rearWheel]
    };
  }

  function createPlayerMotorcycle() {
    const bikeData = createBikeMesh(0xb91c1c, false); // Honda Dream màu đỏ đô huyền thoại
    playerBike = bikeData.mesh;
    playerRider = bikeData;
    playerBike.position.set(0, 0, 0);
    scene.add(playerBike);
  }

  // --- 5. TẠO CÁC TAY ĐUA ĐỐI THỦ PHỐ CỔ (OPPONENT AI) ---
  const OPPONENT_NAMES = [
    { name: 'Hùng "Tổ Lái"', color: 0x2563eb, speed: 118, biasX: -3.5 },
    { name: 'Tuấn "Wave Chiến"', color: 0x16a34a, speed: 124, biasX: 3.5 },
    { name: 'Lan "Bão Đêm"', color: 0xd946ef, speed: 121, biasX: -6.0 },
    { name: 'Dũng "Pô Nổ"', color: 0xf59e0b, speed: 115, biasX: 6.0 },
    { name: 'Sơn "Liều Mạng"', color: 0xdc2626, speed: 127, biasX: 0.0 }
  ];

  function spawnOpponents() {
    OPPONENT_NAMES.forEach((data, index) => {
      const bikeObj = createBikeMesh(data.color, true);
      const startZ = 25 + index * 35;
      bikeObj.mesh.position.set(data.biasX, 0, startZ);
      scene.add(bikeObj.mesh);

      opponents.push({
        id: index,
        name: data.name,
        mesh: bikeObj.mesh,
        leftLeg: bikeObj.leftLeg,
        rightLeg: bikeObj.rightLeg,
        x: data.biasX,
        z: startZ,
        speed: data.speed,
        baseSpeed: data.speed,
        isDown: false,
        downTimer: 0,
        lean: 0,
        kickTimer: 0
      });
    });
  }

  // --- 6. XE BUÝT HÀ NỘI SỐ 01 / 02 TRÊN ĐƯỜNG (TRAFFIC VEHICLES) ---
  function spawnTrafficBuses() {
    for (let i = 0; i < 5; i++) {
      const busGroup = new THREE.Group();

      // Thân xe buýt lớn màu vàng - đỏ đặc trưng Hà Nội
      const busBodyGeo = new THREE.BoxGeometry(3.6, 3.8, 12);
      const busMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
      const busBody = new THREE.Mesh(busBodyGeo, busMat);
      busBody.position.y = 2.1;
      busGroup.add(busBody);

      // Nửa thân dưới màu đỏ
      const lowerGeo = new THREE.BoxGeometry(3.65, 1.2, 12.05);
      const lowerMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c });
      const lower = new THREE.Mesh(lowerGeo, lowerMat);
      lower.position.y = 0.9;
      busGroup.add(lower);

      // Kính xe buýt
      const glassGeo = new THREE.BoxGeometry(3.7, 1.4, 11);
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.y = 2.6;
      busGroup.add(glass);

      // Đèn hậu xe buýt
      const tailGeo = new THREE.BoxGeometry(0.6, 0.4, 0.1);
      const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const tl = new THREE.Mesh(tailGeo, tailMat);
      tl.position.set(1.2, 1.2, -6.05);
      const tr = new THREE.Mesh(tailGeo, tailMat);
      tr.position.set(-1.2, 1.2, -6.05);
      busGroup.add(tl);
      busGroup.add(tr);

      const laneX = (i % 2 === 0) ? -4.5 : 4.5;
      const startZ = 120 + i * 160;
      busGroup.position.set(laneX, 0, startZ);
      scene.add(busGroup);

      trafficVehicles.push({
        mesh: busGroup,
        x: laneX,
        z: startZ,
        speed: 48 // Chạy chậm 48 km/h
      });
    }
  }

  // --- 7. TẠO HỆ THỐNG ĐƯỜNG PHỐ & NHÀ CỔ VÔ TẬN (PROCEDURAL ROAD & CITY) ---
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

    // 1. Mặt đường nhựa ẩm ướt phản chiếu (Wet Asphalt)
    const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, SEGMENT_LENGTH);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x141824,
      roughness: 0.45,
      metalness: 0.2
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.position.y = 0;
    segGroup.add(roadMesh);

    // 2. Vạch kẻ đường đứt đoạn màu vàng phản quang
    for (let l = 0; l < 4; l++) {
      const lineGeo = new THREE.PlaneGeometry(0.35, 6);
      lineGeo.rotateX(-Math.PI / 2);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set(0, 0.02, -SEGMENT_LENGTH / 2 + 10 + l * 20);
      segGroup.add(lineMesh);
    }

    // 3. Vỉa hè hai bên (Sidewalks)
    const walkGeo = new THREE.BoxGeometry(6, 0.4, SEGMENT_LENGTH);
    const walkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });

    const leftWalk = new THREE.Mesh(walkGeo, walkMat);
    leftWalk.position.set(-ROAD_WIDTH / 2 - 3, 0.2, 0);
    segGroup.add(leftWalk);

    const rightWalk = new THREE.Mesh(walkGeo, walkMat);
    rightWalk.position.set(ROAD_WIDTH / 2 + 3, 0.2, 0);
    segGroup.add(rightWalk);

    // 4. Cột đèn cao áp ánh vàng ấm (Street Lamps)
    const lampX = ROAD_WIDTH / 2 + 2;
    const lampPoleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8);
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const lampPole = new THREE.Mesh(lampPoleGeo, lampMat);
    lampPole.position.set(lampX, 3.75, 0);
    segGroup.add(lampPole);

    // Đèn chiếu sáng vàng ấm (Street light glow)
    const bulbGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd54f });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(lampX - 0.8, 7.4, 0);
    segGroup.add(bulb);

    const streetLight = new THREE.PointLight(0xffb74d, 1.2, 32, 1.6);
    streetLight.position.set(lampX - 0.8, 7.2, 0);
    segGroup.add(streetLight);

    // 5. Cây xanh cổ thụ râm mát trên vỉa hè
    const treeGeo = new THREE.DodecahedronGeometry(2.8, 1);
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x1e4620, roughness: 0.8 });
    const treeMesh = new THREE.Mesh(treeGeo, treeMat);
    treeMesh.position.set(-lampX - 1.2, 6.5, -15);
    segGroup.add(treeMesh);

    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.45, 5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(-lampX - 1.2, 2.5, -15);
    segGroup.add(trunk);

    // 6. Dãy nhà ống phố cổ Hà Nội san sát 2 bên
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

      // Biển hiệu Neon phát sáng rực rỡ
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
      // Khi xe vượt qua đoạn đường > 80m phía sau -> Bê lên đầu phía trước vô tận
      if (seg.position.z < player.z - SEGMENT_LENGTH * 2) {
        seg.position.z += TOTAL_SEGMENTS * SEGMENT_LENGTH;
      }
    });
  }

  // --- 8. HỆ THỐNG HẠT TIA LỬA & KHÓI PÔ (SPARKS & SMOKE) ---
  function spawnSparks(x, y, z) {
    const sparkGeo = new THREE.BufferGeometry();
    const count = 25;
    const pos = [];
    const vels = [];

    for (let i = 0; i < count; i++) {
      pos.push(x, y, z);
      vels.push(
        (Math.random() - 0.5) * 12,
        Math.random() * 8 + 2,
        (Math.random() - 0.5) * 12
      );
    }

    sparkGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffea00,
      size: 0.45,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const pSystem = new THREE.Points(sparkGeo, sparkMat);
    scene.add(pSystem);

    sparkParticles.push({
      mesh: pSystem,
      vels: vels,
      life: 1.0
    });
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
        sp.vels[j * 3 + 1] -= 22 * delta; // Trọng lực
      }

      sp.mesh.geometry.attributes.position.needsUpdate = true;
      sp.mesh.material.opacity = sp.life;

      if (sp.life <= 0) {
        scene.remove(sp.mesh);
        sparkParticles.splice(i, 1);
      }
    }
  }

  // --- 9. CƠ CHẾ CHIẾN ĐẤU "ĐẠP NHAU" KIỂU ROAD RASH (BIKE COMBAT) ---
  let screenShakeIntensity = 0;

  function executeKick(side) {
    if (player.kickSide !== null) return;
    initAudio();
    player.kickSide = side;
    player.kickTimer = 0.35; // Thời gian vung chân

    // Animation vung chân người chơi
    if (side === 'left') {
      playerRider.leftLeg.position.x = -0.85;
      playerRider.leftLeg.rotation.z = 0.9;
    } else {
      playerRider.rightLeg.position.x = 0.85;
      playerRider.rightLeg.rotation.z = -0.9;
    }

    // Kiểm tra va chạm với đối thủ trong tầm đạp (Khoảng cách < 3.2m)
    let hitOpponent = null;
    opponents.forEach(op => {
      if (op.isDown) return;
      const dz = Math.abs(op.z - player.z);
      const dx = op.x - player.x;

      if (dz < 2.8) {
        if (side === 'left' && dx < -0.4 && dx > -3.4) {
          hitOpponent = op;
        } else if (side === 'right' && dx > 0.4 && dx < 3.4) {
          hitOpponent = op;
        }
      }
    });

    if (hitOpponent) {
      // ĐẠP TRÚNG!
      playKickHit();
      hitOpponent.isDown = true;
      hitOpponent.downTimer = 4.0; // Bị ngã cày mặt đường 4 giây
      hitOpponent.speed = 10;
      hitOpponent.mesh.rotation.z = (side === 'left') ? -1.4 : 1.4; // Đổ rạp xe

      spawnSparks(hitOpponent.x, 0.6, hitOpponent.z);
      screenShakeIntensity = 0.45;

      player.knockouts++;
      player.nitro = Math.min(100, player.nitro + 35); // Hồi 35% Nitro khi hạ gục

      showBanner(
        '💥 HẠ GỤC ĐỐI THỦ!',
        `BẠN ĐÃ ĐẠP VĂNG ${hitOpponent.name.toUpperCase()} (+200 PTS)!`
      );
      updateHUD();
    }
  }

  function updateKickAnimation(delta) {
    if (player.kickSide !== null) {
      player.kickTimer -= delta;
      if (player.kickTimer <= 0) {
        player.kickSide = null;
        // Thu chân về vị trí ban đầu
        playerRider.leftLeg.position.set(-0.32, 1.15, -0.15);
        playerRider.leftLeg.rotation.z = 0;
        playerRider.rightLeg.position.set(0.32, 1.15, -0.15);
        playerRider.rightLeg.rotation.z = 0;
      }
    }
  }

  // --- 10. VẬT LÝ XE MÁY & ĐIỀU KHIỂN CHI TIẾT ---
  function updatePlayerPhysics(delta) {
    // 1. Ga & Phanh
    const maxS = player.isBoosting ? 168 : player.maxSpeed;

    if (input.gas) {
      player.speed = Math.min(maxS, player.speed + player.accel * delta);
    } else if (input.brake) {
      player.speed = Math.max(0, player.speed - player.brake * delta);
    } else {
      player.speed = Math.max(0, player.speed - 16 * delta); // Ma sát tự nhiên
    }

    // 2. Nitro Boost (Shift)
    if (input.boost && player.nitro > 0 && player.speed > 30) {
      player.isBoosting = true;
      player.nitro = Math.max(0, player.nitro - 35 * delta);
      player.speed = Math.min(168, player.speed + 45 * delta);
    } else {
      player.isBoosting = false;
      player.nitro = Math.min(100, player.nitro + 6 * delta); // Tự hồi Nitro chậm
    }

    // 3. Đánh võng & Bẻ lái (Steering & Leaning)
    const steerSpeed = player.handling * (player.speed / player.maxSpeed);
    let targetLean = 0;

    if (input.left) {
      player.x -= steerSpeed * delta;
      targetLean = 0.42;
    } else if (input.right) {
      player.x += steerSpeed * delta;
      targetLean = -0.42;
    }

    // Ràng buộc làn đường (Không đi xuyên ra khỏi vỉa hè)
    player.x = Math.max(-ROAD_WIDTH / 2 + 1.2, Math.min(ROAD_WIDTH / 2 - 1.2, player.x));

    // Hiệu ứng nghiêng xe ôm cua
    player.leanAngle += (targetLean - player.leanAngle) * 12 * delta;

    // Di chuyển xe theo trục Z (Quãng đường)
    const moveZ = (player.speed * 1000 / 3600) * delta;
    player.z += moveZ;
    player.distanceTraveled += moveZ;

    // Cập nhật vị trí và góc nghiêng của Mesh xe máy
    playerBike.position.set(player.x, 0, player.z);
    playerBike.rotation.z = player.leanAngle;
    playerBike.rotation.y = player.leanAngle * 0.4;

    // Lăn bánh xe
    const wheelRot = moveZ * 2.2;
    playerRider.wheels[0].rotation.x += wheelRot;
    playerRider.wheels[1].rotation.x += wheelRot;

    // 4. Va chạm với Xe Buýt trên đường (Bus Collision)
    trafficVehicles.forEach(bus => {
      const dz = Math.abs(bus.z - player.z);
      const dx = Math.abs(bus.x - player.x);
      if (dz < 6.5 && dx < 2.4) {
        // Tông vào xe buýt!
        playCrashSound();
        player.speed = Math.max(15, player.speed * 0.4);
        spawnSparks(player.x, 1.2, player.z + 1.5);
        screenShakeIntensity = 0.7;
        showBanner('⚠️ VA CHẠM XE BUÝT!', 'LÁI CẨN THẬN HƠN!');
      }
    });

    updateEngineSound();
  }

  // --- 11. CẬP NHẬT ĐỐI THỦ AI & XE GIAO THÔNG ---
  function updateOpponents(delta) {
    opponents.forEach(op => {
      if (op.isDown) {
        op.downTimer -= delta;
        op.speed = 15;
        if (op.downTimer <= 0) {
          op.isDown = false;
          op.mesh.rotation.z = 0; // Đứng dậy đua tiếp
          op.speed = op.baseSpeed;
        }
      } else {
        // AI tự động lượn lách nhẹ nhàng
        op.speed = op.baseSpeed + Math.sin(op.z * 0.05) * 8;
        op.x += Math.sin(op.z * 0.03 + op.id) * 3.5 * delta;
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

      // Xe buýt chạy lùi về phía trước người chơi liên tục
      if (bus.z < player.z - 40) {
        bus.z = player.z + 240 + Math.random() * 80;
        bus.x = (Math.random() < 0.5) ? -4.5 : 4.5;
      }
      bus.mesh.position.set(bus.x, 0, bus.z);
    });

    // Tính toán thứ hạng người chơi (Rank 1st..6th)
    let aheadCount = 0;
    opponents.forEach(op => {
      if (op.z > player.z) aheadCount++;
    });
    player.rank = aheadCount + 1;
  }

  // --- 12. CAMERA ĐIỆN ẢNH BÁM THEO XE ---
  function updateCamera() {
    let targetCamX = player.x * 0.45;
    let targetCamY = 3.6;
    let targetCamZ = player.z - 6.5;

    // Rung màn hình khi va chạm hoặc cọ quẹt (Screen Shake)
    if (screenShakeIntensity > 0) {
      targetCamX += (Math.random() - 0.5) * screenShakeIntensity * 2;
      targetCamY += (Math.random() - 0.5) * screenShakeIntensity * 2;
      screenShakeIntensity = Math.max(0, screenShakeIntensity - 0.03);
    }

    camera.position.set(targetCamX, targetCamY, targetCamZ);
    camera.lookAt(player.x * 0.2, 1.4, player.z + 18);
  }

  // --- 13. CẬP NHẬT GIAO DIỆN HUD ---
  function updateHUD() {
    const speedEl = document.getElementById('hud-speed');
    if (speedEl) speedEl.innerText = Math.round(player.speed);

    const rankEl = document.getElementById('hud-rank');
    if (rankEl) rankEl.innerHTML = `${player.rank}<span class="rank-sup">/6</span>`;

    const distEl = document.getElementById('hud-distance');
    if (distEl) distEl.innerText = `${Math.round(player.distanceTraveled)} m`;

    const koEl = document.getElementById('hud-ko');
    if (koEl) koEl.innerText = `⚔️ ${player.knockouts}`;

    const nitroFill = document.getElementById('nitro-fill');
    if (nitroFill) nitroFill.style.width = `${Math.round(player.nitro)}%`;
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

  // --- 14. BỘ ĐIỀU KHIỂN INPUT (BÀN PHÍM, CHUỘT, TAY CẦM, TOUCH) ---
  function setupInputEvents() {
    window.addEventListener('keydown', e => {
      initAudio();
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') input.gas = true;
      if (k === 's' || e.key === 'ArrowDown') input.brake = true;
      if (k === 'a' || e.key === 'ArrowLeft') input.left = true;
      if (k === 'd' || e.key === 'ArrowRight') input.right = true;
      if (e.key === 'Shift') input.boost = true;
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
      if (e.key === 'Shift') input.boost = false;
    });

    // Chuột Trái = Đạp Trái, Chuột Phải = Đạp Phải
    window.addEventListener('mousedown', e => {
      initAudio();
      if (e.button === 0) executeKick('left');
      if (e.button === 2) executeKick('right');
    });

    window.addEventListener('contextmenu', e => e.preventDefault());

    // Nút Header
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

    // Cảm ứng điện thoại (Touch controls)
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

    document.getElementById('touch-kick-l')?.addEventListener('touchstart', e => {
      e.preventDefault(); executeKick('left');
    });
    document.getElementById('touch-kick-r')?.addEventListener('touchstart', e => {
      e.preventDefault(); executeKick('right');
    });
  }

  // Polling Tay Cầm Gamepad
  let prevGpButtons = {};
  function pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads || !gamepads[0]) return;
    const gp = gamepads[0];

    const ax = gp.axes[0] || 0;
    input.left = gp.buttons[14]?.pressed || ax < -0.35;
    input.right = gp.buttons[15]?.pressed || ax > 0.35;

    // Nút RT hoặc A: Ga
    input.gas = gp.buttons[7]?.pressed || gp.buttons[0]?.pressed;
    // Nút LT hoặc B: Phanh
    input.brake = gp.buttons[6]?.pressed || gp.buttons[1]?.pressed;

    // Nút X (Đạp Trái)
    if (gp.buttons[2]?.pressed && !prevGpButtons[2]) executeKick('left');
    prevGpButtons[2] = gp.buttons[2]?.pressed;

    // Nút B (Đạp Phải)
    if (gp.buttons[1]?.pressed && !prevGpButtons[1]) executeKick('right');
    prevGpButtons[1] = gp.buttons[1]?.pressed;

    // Nút RB (Boost)
    input.boost = gp.buttons[5]?.pressed;
  }

  // --- 15. GAME LOOP CHÍNH (60 FPS) ---
  let lastTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);

    const delta = Math.min(0.06, (now - lastTime) / 1000);
    lastTime = now;

    pollGamepad();
    updatePlayerPhysics(delta);
    updateKickAnimation(delta);
    updateOpponents(delta);
    updateRoadRecycling();
    updateParticles(delta);
    updateCamera();
    updateHUD();

    renderer.render(scene, camera);
  }

  // Khởi động
  window.addEventListener('DOMContentLoaded', () => {
    initThree();
    setupInputEvents();
    showBanner('BÃO ĐÊM PHỐ CỔ 🏍️', 'NHẤN [W] ĐỂ PHÓNG GA! NHẤN [J]/[K] ĐỂ ĐẠP ĐỐI THỦ!');
    requestAnimationFrame(animate);
  });

})();
