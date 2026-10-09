/**
 * RecipesData.js & FishData.js & QuestsData.js
 */

export const RECIPES_DATA = [
  {
    id: 'chest',
    name: 'Rương gỗ đựng đồ',
    category: 'Công trình',
    icon: '📦',
    materials: { wood: 50 },
    output: { id: 'chest', count: 1 },
    description: 'Chứa được nhiều loại hạt giống, nông sản và nguyên liệu.'
  },
  {
    id: 'wood_fence',
    name: 'Hàng rào gỗ',
    category: 'Công trình',
    icon: '🪵',
    materials: { wood: 10 },
    output: { id: 'wood_fence', count: 5 },
    description: 'Bảo vệ luống cây khỏi thú rừng và ngăn cỏ dại xâm lấn.'
  },
  {
    id: 'sprinkler',
    name: 'Vòi phun nước tự động',
    category: 'Nông nghiệp',
    icon: '🚿',
    materials: { copper_ore: 2, iron_ore: 1 },
    output: { id: 'sprinkler', count: 1 },
    description: 'Tự động tưới nước 4 ô đất xung quanh mỗi sớm mai.'
  },
  {
    id: 'scarecrow',
    name: 'Bù nhìn rơm đuổi quạ',
    category: 'Nông nghiệp',
    icon: '🌾',
    materials: { wood: 20, straw: 10 },
    output: { id: 'scarecrow', count: 1 },
    description: 'Đuổi lũ chim quạ không cho mổ phá hạt giống quý.'
  },
  {
    id: 'hanoi_salad',
    name: 'Salad rau củ Hà Nội',
    category: 'Ẩm thực',
    icon: '🥗',
    materials: { tomato: 2, carrot: 1 },
    output: { id: 'hanoi_salad', count: 1 },
    description: 'Món gỏi thanh mát, ăn vào hồi phục ngay 60 điểm thể lực.'
  }
];

export const FISH_DATA = [
  { id: 'carp', name: 'Cá chép Hồ Tây', price: 75, difficulty: 'Dễ', season: 'Xuân, Hạ, Thu' },
  { id: 'tilapia', name: 'Cá rô phi đồng', price: 40, difficulty: 'Rất dễ', season: 'Tất cả' },
  { id: 'black_carp', name: 'Cá trắm đen cụ', price: 130, difficulty: 'Khó', season: 'Thu, Đông' },
  { id: 'river_shrimp', name: 'Tôm sông Hồng', price: 60, difficulty: 'Dễ', season: 'Xuân, Hạ' },
  { id: 'golden_koi', name: 'Cá chép vàng tài lộc', price: 300, difficulty: 'Cực khó', season: 'Tết / Xuân' }
];

export const QUESTS_DATA = [
  {
    id: 'q1_farm_start',
    title: 'Khởi Đầu Nông Trại Ba Vì',
    description: 'Dùng cuốc xới 3 ô đất và dùng bình tưới đẫm nước cho đất.',
    targetType: 'water_tiles',
    targetAmount: 3,
    rewardGold: 100,
    completed: false
  },
  {
    id: 'q2_first_harvest',
    title: 'Mùa Vụ Đầu Tiên',
    description: 'Trồng và thu hoạch 3 mẻ Cà chua bi Ba Vì.',
    targetType: 'harvest_tomato',
    targetAmount: 3,
    rewardGold: 150,
    completed: false
  },
  {
    id: 'q3_meet_neighbors',
    title: 'Giao Lưu Hàng Xóm',
    description: 'Trò chuyện cùng Chị Lan (Quán trà đá) và Bác Ba.',
    targetType: 'talk_npc',
    targetAmount: 2,
    rewardGold: 80,
    completed: false
  },
  {
    id: 'q4_fishing_master',
    title: 'Tay Câu Bến Nước',
    description: 'Câu thành công ít nhất 1 con cá tại Hồ Tây.',
    targetType: 'catch_fish',
    targetAmount: 1,
    rewardGold: 120,
    completed: false
  }
];
