/**
 * NPCsData.js - Dữ liệu 8 nhân vật đặc trưng phong vị Hà Nội
 */
export const NPCS_DATA = [
  {
    id: 'bac_ba',
    name: 'Bác Ba (Cây Bàng)',
    role: 'Lão nông tri điền',
    avatar: '👴',
    location: 'Nông trại Ba Vì',
    favoriteItem: 'corn',
    dislikedItem: 'weed',
    dialogues: {
      morning: 'Chào cháu! Đất Ba Vì màu mỡ lắm, chịu khó xới đất tưới nước là quả trĩu cành ngay đấy!',
      afternoon: 'Nắng chiều thế này nhớ tưới thêm chút nước cho mát rễ cây nhé cháu.',
      night: 'Trời tối rồi, về nghỉ ngơi sớm đi cháu ơi, giữ sức mai ra đồng sớm.',
      gift_liked: 'Ôi quý hóa quá! Bắp ngô thơm dẻo đúng vị ngày xưa bác thích lắm, cảm ơn cháu nhé!',
      gift_disliked: 'Cái này bác không dùng được đâu cháu ơi, giữ lại đi.'
    }
  },
  {
    id: 'chi_lan',
    name: 'Chị Lan (Trà Đá)',
    role: 'Chủ quán nước đầu làng',
    avatar: '👩',
    location: 'Quán Trà Đá Vỉa Hè',
    favoriteItem: 'sunflower',
    dislikedItem: 'stone',
    dialogues: {
      morning: 'Làm chén trà nóng ngắm sương sớm không em ơi? Nay thấy làng xóm rộn ràng lắm đấy!',
      afternoon: 'Ngồi uống cốc nhân trần cho mát em ơi, làm lụng cả ngày vất vả rồi.',
      night: 'Sắp dọn hàng rồi, em về nhà kẻo gió lạnh nhé.',
      gift_liked: 'Bông hướng dương đẹp quá em ơi! Cắm ở bàn trà đá khách nhìn mê ngay!',
      gift_disliked: 'Tặng chị cục đá này làm gì em, để kê chân bàn à?'
    }
  },
  {
    id: 'cu_rua',
    name: 'Cụ Rùa',
    role: 'Trưởng lão bến nước',
    avatar: '🐢',
    location: 'Hồ Tây',
    favoriteItem: 'carp',
    dislikedItem: 'trash',
    dialogues: {
      morning: 'Mặt hồ sáng sớm tĩnh lặng như gương... Muốn câu cá ngon phải biết kiên nhẫn con nhé.',
      afternoon: 'Gió Hồ Tây buổi chiều mát rượi, ngồi ngắm sóng nước lòng nhẹ tênh.',
      night: 'Mặt trăng soi bóng nước hồ rồi... Hãy về thắp đèn đoàn viên cùng gia đình.',
      gift_liked: 'Con cá chép vảy vàng tươi tắn quá! Con có tay nghề ngư nghiệp đấy!',
      gift_disliked: 'Đừng vứt rác xuống hồ nước trong lành này con nhé.'
    }
  },
  {
    id: 'chu_tuan',
    name: 'Chú Tuấn (Thợ Rèn)',
    role: 'Thợ rèn nông cụ',
    avatar: '🧔',
    location: 'Xưởng Rèn Phố Cũ',
    favoriteItem: 'iron_ore',
    dislikedItem: 'flower',
    dialogues: {
      morning: 'Lò rèn đã đỏ lửa rồi đây! Cần sửa cuốc hay mài rìu cứ mang qua chú!',
      afternoon: 'Tiếng đe tiếng búa cả đời chú nghe quen rồi, lao động là vinh quang cháu ạ.',
      night: 'Tắt lò rèn thôi, mắt chú mỏi rồi. Mai lại ghé nhé!',
      gift_liked: 'Quặng sắt chất lượng cao đấy! Cảm ơn cháu, chú sẽ rèn cho cháu chiếc cuốc sắc bén nhất!',
      gift_disliked: 'Đưa hoa cho chú làm gì, tay chú dính đầy nhọ nồi thế này!'
    }
  },
  {
    id: 'co_mai',
    name: 'Cô Mai (Bách Hóa)',
    role: 'Chủ tiệm hạt giống',
    avatar: '👩‍🌾',
    location: 'Tiệm Bách Hóa Cô Mai',
    favoriteItem: 'strawberry',
    dislikedItem: 'weed',
    dialogues: {
      morning: 'Chào cháu! Tiệm cô hôm nay vừa nhập hạt giống cà chua và dâu tây tươi mới lắm nè!',
      afternoon: 'Cần phân bón hay hạt giống mùa mới thì cứ vào chọn thoải mái nhé.',
      night: 'Đóng cửa tiệm rồi, cháu đi ngủ sớm ngày mai sang ủng hộ cô tiếp nha.',
      gift_liked: 'Trái dâu tây chín đỏ mọng ngọt ngào quá! Cô sẽ ép nước uống, cảm ơn cháu nhé!',
      gift_disliked: 'Cỏ dại này cô nhổ ngoài vườn đầy ra, cháu tặng cô làm chi!'
    }
  },
  {
    id: 'em_huong',
    name: 'Em Hương (Tiệm Bánh)',
    role: 'Thợ làm bánh ngọt',
    avatar: '👧',
    location: 'Tiệm Bánh Hoa Quả',
    favoriteItem: 'melon',
    dislikedItem: 'chilli',
    dialogues: {
      morning: 'Anh/chị ơi! Em vừa nướng mẻ bánh mỳ bơ sữa thơm phức xong này!',
      afternoon: 'Nếu có hoa quả tươi ngon, mang qua em làm bánh kem dâu tây đãi nhé!',
      night: 'Phố lên đèn rồi, chúc anh/chị buổi tối ngủ ngon mơ đẹp nha!',
      gift_liked: 'Dưa hấu mát lành! Em sẽ làm món thạch dưa hấu thanh mát mùa hè, cảm ơn anh/chị nhiều!',
      gift_disliked: 'Ớt cay quá, em sợ cay lắm không ăn được đâu ạ!'
    }
  },
  {
    id: 'anh_dung',
    name: 'Anh Dũng (Kỹ Sư)',
    role: 'Kỹ sư tự động hóa',
    avatar: '👨‍💻',
    location: 'Trạm Kỹ Thuật Làng',
    favoriteItem: 'copper_ore',
    dislikedItem: 'weed',
    dialogues: {
      morning: 'Chào bạn! Mình đang nghiên cứu hệ thống vòi phun nước tự động cho bà con trong làng.',
      afternoon: 'Nếu tìm được quặng đồng và quặng sắt, mang về đây mình chế tạo máy móc cho nhé!',
      night: 'Viết xong mấy dòng code điều khiển rồi, chuẩn bị nghỉ ngơi thôi bạn ơi.',
      gift_liked: 'Tuyệt vời! Quặng đồng này dẫn điện rất tốt, đúng thứ mình đang cần để làm vi mạch!',
      gift_disliked: 'Cỏ dại này làm kẹt bánh răng máy bơm nước mất bạn ơi.'
    }
  },
  {
    id: 'ong_binh',
    name: 'Ông Bình (Trưởng Thôn)',
    role: 'Trưởng thôn gương mẫu',
    avatar: '👴‍💼',
    location: 'Nhà Văn Hóa Thôn',
    favoriteItem: 'pumpkin',
    dislikedItem: 'trash',
    dialogues: {
      morning: 'Chào cháu! Chúc trang trại của cháu mùa vụ này bội thu, đem lại vẻ đẹp cho quê hương!',
      afternoon: 'Bà con lối xóm ai cũng khen trang trại của cháu chăm sóc khéo léo đấy.',
      night: 'Bà con đã lên đèn nghỉ ngơi rồi. Chúc cháu ngủ ngon giấc nhé.',
      gift_liked: 'Quả bí ngô to tròn đẹp mắt quá! Để ông mang ra đình làng góp vào mâm cỗ rằm nhé!',
      gift_disliked: 'Nhặt được rác thì bỏ vào thùng rác quy định cháu nhé.'
    }
  }
];
