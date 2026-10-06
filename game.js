const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CẤU HÌNH ---
const TILE_SIZE = 40;
const COLS = 20; // 800 / 40
const ROWS = 12; // 480 / 40

// --- TRẠNG THÁI GAME ---
let gameState = {
    day: 1,
    money: 0,
    tiles: [] // Mảng 2D: [x][y]
};

let player = {
    x: COLS / 2 * TILE_SIZE,
    y: ROWS / 2 * TILE_SIZE,
    speed: 4,
    dir: 2, // 0: Up, 1: Right, 2: Down, 3: Left
    tool: 0 // 0: Cuốc, 1: Nước, 2: Hạt giống, 3: Bàn tay
};

// --- QUẢN LÝ INPUT ---
const keys = { w: false, a: false, s: false, d: false, space: false };
let actionJustPressed = false; 
let r1JustPressed = false;
let l1JustPressed = false;
let startJustPressed = false;

window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    if (key === 'w' || e.key === 'ArrowUp') keys.w = true;
    if (key === 'a' || e.key === 'ArrowLeft') keys.a = true;
    if (key === 's' || e.key === 'ArrowDown') keys.s = true;
    if (key === 'd' || e.key === 'ArrowRight') keys.d = true;
    if (key === ' ') {
        if (!keys.space) actionJustPressed = true;
        keys.space = true;
    }
    
    // Đổi công cụ
    if (['1','2','3','4'].includes(key)) {
        player.tool = parseInt(key) - 1;
        updateToolbarUI();
    }
});

window.addEventListener('keyup', e => {
    const key = e.key.toLowerCase();
    if (key === 'w' || e.key === 'ArrowUp') keys.w = false;
    if (key === 'a' || e.key === 'ArrowLeft') keys.a = false;
    if (key === 's' || e.key === 'ArrowDown') keys.s = false;
    if (key === 'd' || e.key === 'ArrowRight') keys.d = false;
    if (key === ' ') keys.space = false;
});

// --- KHỞI TẠO GAME ---
function init() {
    loadGame();
    updateUI();
    requestAnimationFrame(gameLoop);
}

function createEmptyMap() {
    const map = [];
    for (let x = 0; x < COLS; x++) {
        map[x] = [];
        for (let y = 0; y < ROWS; y++) {
            map[x][y] = {
                state: 0, // 0: Cỏ, 1: Đất cày, 2: Đất ướt
                crop: -1  // -1: Không có, 0: Hạt, 1: Cây non, 2: Cây lớn
            };
        }
    }
    return map;
}

// --- SAVE / LOAD ---
function saveGame() {
    localStorage.setItem('webdew_save', JSON.stringify(gameState));
    console.log("Game saved!");
}

function loadGame() {
    const saved = localStorage.getItem('webdew_save');
    if (saved) {
        gameState = JSON.parse(saved);
    } else {
        gameState.tiles = createEmptyMap();
    }
}

// --- HÀNH ĐỘNG GAME ---
function handleGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads || !gamepads[0]) return;
    
    const gp = gamepads[0];
    
    // Di chuyển (D-pad hoặc Analog trái)
    const axesX = gp.axes[0];
    const axesY = gp.axes[1];
    
    keys.w = gp.buttons[12]?.pressed || axesY < -0.5;
    keys.s = gp.buttons[13]?.pressed || axesY > 0.5;
    keys.a = gp.buttons[14]?.pressed || axesX < -0.5;
    keys.d = gp.buttons[15]?.pressed || axesX > 0.5;

    // Nút Action (A trên Xbox / Cross trên PS)
    if (gp.buttons[0]?.pressed) {
        if (!keys.space) actionJustPressed = true;
        keys.space = true;
    } else {
        keys.space = false;
    }

    // Đổi công cụ (L1 / R1)
    if (gp.buttons[5]?.pressed) { // R1
        if (!r1JustPressed) {
            player.tool = (player.tool + 1) % 4;
            updateToolbarUI();
            r1JustPressed = true;
        }
    } else {
        r1JustPressed = false;
    }
    
    if (gp.buttons[4]?.pressed) { // L1
        if (!l1JustPressed) {
            player.tool = (player.tool - 1 + 4) % 4;
            updateToolbarUI();
            l1JustPressed = true;
        }
    } else {
        l1JustPressed = false;
    }

    // Nút Start (Ngủ)
    if (gp.buttons[9]?.pressed) { // Start
        if (!startJustPressed) {
            sleepNextDay();
            startJustPressed = true;
        }
    } else {
        startJustPressed = false;
    }
}

function getTargetTile() {
    // Xác định ô mà người chơi đang hướng tới
    let tx = Math.floor((player.x + TILE_SIZE/2) / TILE_SIZE);
    let ty = Math.floor((player.y + TILE_SIZE/2) / TILE_SIZE);
    
    if (player.dir === 0) ty -= 1;
    if (player.dir === 1) tx += 1;
    if (player.dir === 2) ty += 1;
    if (player.dir === 3) tx -= 1;

    // Ràng buộc trong bản đồ
    if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS) {
        return { x: tx, y: ty };
    }
    return null;
}

function doAction() {
    const target = getTargetTile();
    if (!target) return;
    
    const tile = gameState.tiles[target.x][target.y];

    if (player.tool === 0) { // Cuốc (Hoe)
        if (tile.state === 0) tile.state = 1; // Biến cỏ thành đất
    } 
    else if (player.tool === 1) { // Tưới (Watering Can)
        if (tile.state === 1) tile.state = 2; // Đất thành đất ướt
    }
    else if (player.tool === 2) { // Hạt giống (Seed)
        if ((tile.state === 1 || tile.state === 2) && tile.crop === -1) {
            tile.crop = 0; // Trồng hạt
        }
    }
    else if (player.tool === 3) { // Tay (Harvest)
        if (tile.crop === 2) {
            tile.crop = -1; // Thu hoạch
            gameState.money += 15; // Bán cà chua được 15 vàng
            updateUI();
        }
    }
}

document.getElementById('btn-sleep').addEventListener('click', sleepNextDay);

function sleepNextDay() {
    gameState.day += 1;
    
    // Xử lý cây trồng lớn lên
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            const tile = gameState.tiles[x][y];
            
            // Cây chỉ lớn lên nếu đất được tưới nước
            if (tile.state === 2 && tile.crop >= 0 && tile.crop < 2) {
                tile.crop += 1;
            }
            
            // Đất khô lại vào ngày hôm sau
            if (tile.state === 2) {
                tile.state = 1; 
            }
        }
    }
    
    updateUI();
    saveGame(); // Lưu game mỗi khi qua ngày
    
    // Hiệu ứng mờ màn hình
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0,0, canvas.width, canvas.height);
}

// --- GIAO DIỆN ---
function updateUI() {
    document.getElementById('day-display').innerText = `Ngày: ${gameState.day} | Tiền: ${gameState.money} 🪙`;
}

function updateToolbarUI() {
    document.querySelectorAll('.tool-slot').forEach(el => el.classList.remove('active'));
    document.querySelector(`.tool-slot[data-index="${player.tool}"]`).classList.add('active');
}

document.querySelectorAll('.tool-slot').forEach(slot => {
    slot.addEventListener('click', function() {
        player.tool = parseInt(this.getAttribute('data-index'));
        updateToolbarUI();
    });
});

// --- RENDER & GAME LOOP ---
function drawMap() {
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            const tile = gameState.tiles[x][y];
            
            // Vẽ đất
            if (tile.state === 1) {
                ctx.fillStyle = '#b7955b'; // Đất khô
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE - 2, TILE_SIZE - 2);
            } else if (tile.state === 2) {
                ctx.fillStyle = '#8b5a2b'; // Đất ướt
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE - 2, TILE_SIZE - 2);
            }
            
            // Vẽ cây trồng
            if (tile.crop === 0) {
                drawEmoji('🌱', x * TILE_SIZE + 20, y * TILE_SIZE + 26);
            } else if (tile.crop === 1) {
                drawEmoji('🌿', x * TILE_SIZE + 20, y * TILE_SIZE + 26);
            } else if (tile.crop === 2) {
                drawEmoji('🍅', x * TILE_SIZE + 20, y * TILE_SIZE + 26);
            }
        }
    }
}

function drawEmoji(emoji, x, y) {
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, x, y);
}

function drawPlayer() {
    // Vẽ nhân vật
    drawEmoji('🧑‍🌾', player.x + TILE_SIZE/2, player.y + TILE_SIZE/2);
    
    // Vẽ ô mục tiêu (Highlight)
    const target = getTargetTile();
    if (target) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(target.x * TILE_SIZE, target.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Vẽ icon công cụ đang cầm mờ mờ ở ô mục tiêu
        const toolEmojis = ['⛏️', '🚿', '🌱', '🖐️'];
        ctx.globalAlpha = 0.5;
        drawEmoji(toolEmojis[player.tool], target.x * TILE_SIZE + 20, target.y * TILE_SIZE + 20);
        ctx.globalAlpha = 1.0;
    }
}

function updatePhysics() {
    let dx = 0;
    let dy = 0;
    if (keys.w) { dy -= player.speed; player.dir = 0; }
    if (keys.s) { dy += player.speed; player.dir = 2; }
    if (keys.a) { dx -= player.speed; player.dir = 3; }
    if (keys.d) { dx += player.speed; player.dir = 1; }

    // Ràng buộc di chuyển trong map
    player.x = Math.max(0, Math.min(canvas.width - TILE_SIZE, player.x + dx));
    player.y = Math.max(0, Math.min(canvas.height - TILE_SIZE, player.y + dy));

    if (actionJustPressed) {
        doAction();
        actionJustPressed = false;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa frame cũ (cỏ là background canvas)
    
    handleGamepad();
    updatePhysics();
    
    drawMap();
    drawPlayer();

    requestAnimationFrame(gameLoop);
}

// Bắt đầu
init();
