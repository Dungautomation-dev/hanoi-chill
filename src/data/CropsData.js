/**
 * CropsData.js - Dữ liệu 12+ loại cây trồng đặc trưng nông nghiệp Hà Nội & Việt Nam
 */
export const CROPS_DATA = {
  tomato: {
    id: 'tomato',
    name: 'Cà chua bi Ba Vì',
    seedPrice: 15,
    sellPrice: 45,
    daysToGrow: 4,
    maxStage: 5,
    regrows: true,
    regrowDays: 2,
    seasons: ['Xuân', 'Hạ'],
    spriteRow: 0,
    description: 'Trái cà chua mọng nước, vị ngọt thanh tự nhiên từ vùng núi Ba Vì.'
  },
  corn: {
    id: 'corn',
    name: 'Bắp ngô nếp bãi bồi',
    seedPrice: 20,
    sellPrice: 65,
    daysToGrow: 5,
    maxStage: 5,
    regrows: true,
    regrowDays: 3,
    seasons: ['Hạ', 'Thu'],
    spriteRow: 1,
    description: 'Giống bắp nếp dẻo thơm được trồng tại bãi bồi ven sông Hồng.'
  },
  carrot: {
    id: 'carrot',
    name: 'Cà rốt Đông Anh',
    seedPrice: 12,
    sellPrice: 38,
    daysToGrow: 4,
    maxStage: 5,
    regrows: false,
    seasons: ['Xuân', 'Đông'],
    spriteRow: 1,
    description: 'Củ cà rốt củ mập giòn ngọt, giàu vitamin A.'
  },
  strawberry: {
    id: 'strawberry',
    name: 'Dâu tây ôn đới',
    seedPrice: 35,
    sellPrice: 90,
    daysToGrow: 6,
    maxStage: 5,
    regrows: true,
    regrowDays: 3,
    seasons: ['Xuân'],
    spriteRow: 0,
    description: 'Loài quả mọng đỏ rực, hương thơm nồng nàn quyến rũ.'
  },
  potato: {
    id: 'potato',
    name: 'Khoai tây vàng Thường Tín',
    seedPrice: 18,
    sellPrice: 50,
    daysToGrow: 4,
    maxStage: 5,
    regrows: false,
    seasons: ['Xuân', 'Đông'],
    spriteRow: 1,
    description: 'Củ khoai tây bùi bở, là thực phẩm dinh dưỡng quen thuộc.'
  },
  wheat: {
    id: 'wheat',
    name: 'Lúa mì / Lúa nếp cái',
    seedPrice: 10,
    sellPrice: 32,
    daysToGrow: 3,
    maxStage: 5,
    regrows: false,
    seasons: ['Hạ', 'Thu'],
    spriteRow: 1,
    description: 'Bông lúa vàng ươm trĩu hạt, dùng làm cốm hoặc bột làm bánh.'
  },
  eggplant: {
    id: 'eggplant',
    name: 'Cà tím quả dài',
    seedPrice: 22,
    sellPrice: 60,
    daysToGrow: 5,
    maxStage: 5,
    regrows: true,
    regrowDays: 2,
    seasons: ['Thu'],
    spriteRow: 0,
    description: 'Cà tím vỏ bóng láng, rất thích hợp làm món nướng mỡ hành.'
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Bí ngô khổng lồ',
    seedPrice: 40,
    sellPrice: 130,
    daysToGrow: 7,
    maxStage: 5,
    regrows: false,
    seasons: ['Thu'],
    spriteRow: 0,
    description: 'Quả bí ngô vàng ruộm nặng trĩu cành, giá trị kinh tế rất cao.'
  },
  melon: {
    id: 'melon',
    name: 'Dưa hấu giải nhiệt',
    seedPrice: 30,
    sellPrice: 95,
    daysToGrow: 6,
    maxStage: 5,
    regrows: false,
    seasons: ['Hạ'],
    spriteRow: 0,
    description: 'Quả dưa ruột đỏ mọng ngọt lịm, giải khát ngày hè oi ả.'
  },
  cabbage: {
    id: 'cabbage',
    name: 'Bắp cải cuộn vụ đông',
    seedPrice: 25,
    sellPrice: 70,
    daysToGrow: 5,
    maxStage: 5,
    regrows: false,
    seasons: ['Đông'],
    spriteRow: 1,
    description: 'Lá cải xanh non cuộn chặt, ưa khí hậu rét mướt mùa đông.'
  },
  chilli: {
    id: 'chilli',
    name: 'Ớt chỉ thiên cay nồng',
    seedPrice: 15,
    sellPrice: 48,
    daysToGrow: 4,
    maxStage: 5,
    regrows: true,
    regrowDays: 2,
    seasons: ['Hạ'],
    spriteRow: 0,
    description: 'Trái ớt đỏ chót cay xé lưỡi, làm gia vị đậm đà cho mọi bữa cơm.'
  },
  sunflower: {
    id: 'sunflower',
    name: 'Hoa hướng dương rực rỡ',
    seedPrice: 28,
    sellPrice: 80,
    daysToGrow: 5,
    maxStage: 5,
    regrows: false,
    seasons: ['Hạ', 'Thu'],
    spriteRow: 0,
    description: 'Đóa hoa vàng luôn hướng về ánh mặt trời, thu hoạch còn rụng thêm hạt giống.'
  }
};
