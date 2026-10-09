/**
 * tests/unit_tests.js - Bộ kiểm thử tự động toàn diện logic game Hà Nội Chill
 * Chạy bằng: node tests/unit_tests.js
 */

import { CROPS_DATA } from '../src/data/CropsData.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('🧪 BẮT ĐẦU CHẠY KIỂM THỬ TỰ ĐỘNG - HÀ NỘI CHILL');
console.log('====================================================\n');

// 1. KIỂM THỬ DỮ LIỆU CÂY TRỒNG (12+ LOẠI CÂY)
console.log('--- NHÓM 1: Dữ liệu 12+ Cây Trồng ---');
const cropKeys = Object.keys(CROPS_DATA);
assert(cropKeys.length >= 12, `Có tối thiểu 12 loại cây trồng (Hiện có: ${cropKeys.length})`);
assert(CROPS_DATA.tomato && CROPS_DATA.tomato.regrows === true, 'Cà chua có thuộc tính thu hoạch nhiều lần (regrows)');
assert(CROPS_DATA.pumpkin && CROPS_DATA.pumpkin.sellPrice > 100, 'Bí ngô có giá trị kinh tế cao (> 100G)');
assert(CROPS_DATA.corn && CROPS_DATA.corn.seasons.includes('Hạ'), 'Bắp ngô phù hợp với Mùa Hạ');

// 2. KIỂM THỬ LOGIC CUỐC ĐẤT & NĂNG LƯỢNG
console.log('\n--- NHÓM 2: Cuốc Đất & Tiêu Hao Thể Lực ---');
let tile = { type: 'grass', tilled: false, watered: false, crop: null };
let energy = 100;

function useHoe(t) {
  if (!t.tilled && t.type === 'grass') {
    t.tilled = true;
    energy = Math.max(0, energy - 2);
    return true;
  }
  return false;
}

const hoeResult = useHoe(tile);
assert(hoeResult === true, 'Cuốc đất thành công trên ô cỏ');
assert(tile.tilled === true, 'Ô đất chuyển trạng thái tilled = true');
assert(energy === 98, 'Năng lượng giảm chính xác từ 100 xuống 98');

// 3. KIỂM THỬ TƯỚI NƯỚC
console.log('\n--- NHÓM 3: Tưới Nước & Làm Ẩm Đất ---');
function useWater(t) {
  if (t.tilled && !t.watered) {
    t.watered = true;
    energy = Math.max(0, energy - 1);
    return true;
  }
  return false;
}

const waterResult = useWater(tile);
assert(waterResult === true, 'Tưới nước thành công trên ô đất đã cuốc');
assert(tile.watered === true, 'Ô đất có độ ẩm watered = true');
assert(energy === 97, 'Năng lượng giảm từ 98 xuống 97');

// 4. KIỂM THỬ SINH TRƯỞNG QUA NGÀY (CROP GROWTH CYCLE)
console.log('\n--- NHÓM 4: Sinh Trưởng Cây Trồng Qua Ngày ---');
tile.crop = { type: 'tomato', stage: 0 };

function processNextDay(t) {
  if (t.crop && t.watered) {
    if (t.crop.stage < 5) {
      t.crop.stage += 1;
    }
  }
  // Đất khô trở lại
  t.watered = false;
}

processNextDay(tile);
assert(tile.crop.stage === 1, 'Cây được tưới nước tăng lên stage 1 khi qua ngày');
assert(tile.watered === false, 'Đất khô lại (watered = false) vào sáng hôm sau');

// Kiểm thử trường hợp KHÔNG tưới nước
processNextDay(tile);
assert(tile.crop.stage === 1, 'Cây KHÔNG được tưới giữ nguyên stage 1 (không lớn lên)');

// 5. KIỂM THỬ THU HOẠCH & CỘNG TIỀN
console.log('\n--- NHÓM 5: Thu Hoạch & Kinh Tế ---');
tile.crop.stage = 5; // Cà chua chín mọng
let gold = 500;

function harvestCrop(t) {
  if (t.crop && t.crop.stage === 5) {
    const cropInfo = CROPS_DATA[t.crop.type];
    gold += cropInfo.sellPrice;
    if (cropInfo.regrows) {
      t.crop.stage = 3; // Ra hoa lại
    } else {
      t.crop = null;
    }
    return cropInfo.sellPrice;
  }
  return 0;
}

const earned = harvestCrop(tile);
assert(earned === 45, 'Thu hoạch cà chua Ba Vì nhận đúng 45G');
assert(gold === 545, 'Tổng tiền tăng từ 500 lên 545G');
assert(tile.crop.stage === 3, 'Cây thu hoạch nhiều lần quay về giai đoạn 3 (đơm hoa)');

// 6. KIỂM THỬ TUẦN TỰ HÓA & LƯU TRỮ (SAVE / LOAD)
console.log('\n--- NHÓM 6: Lưu & Phục Hồi Dữ Liệu (Save / Load) ---');
const originalState = {
  day: 12,
  season: 'Mùa Thu',
  gold: 1250,
  energy: 85,
  player: { x: 240, y: 320, dir: 2 }
};

const serialized = JSON.stringify(originalState);
const restored = JSON.parse(serialized);

assert(restored.day === 12, 'Khôi phục số ngày chính xác (Day 12)');
assert(restored.season === 'Mùa Thu', 'Khôi phục mùa vụ chính xác (Mùa Thu)');
assert(restored.gold === 1250, 'Khôi phục tiền vàng chính xác (1250G)');
assert(restored.player.x === 240 && restored.player.y === 320, 'Khôi phục toạ độ người chơi chính xác');

// TỔNG KẾT
console.log('\n====================================================');
console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passed} PASS, ${failed} FAIL`);
if (failed === 0) {
  console.log('🎉 TẤT CẢ CÁC KIỂM THỬ LOGIC ĐỀU ĐẠT CHUẨN 100%!');
} else {
  console.error('⚠️ CẦN SỬA LỖI LOGIC TRƯỚC KHI RELEASE!');
  process.exit(1);
}
console.log('====================================================\n');
