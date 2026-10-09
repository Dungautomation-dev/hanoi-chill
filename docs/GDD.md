# TÀI LIỆU THIẾT KẾ GAME (GAME DESIGN DOCUMENT - GDD)
Tên dự án: **Hà Nội Chill (Harvest Tales)**
Thể loại: **2D Pixel Art Farming & Life Simulation RPG**
Nền tảng: **Windows PC & Web Browser (HTML5 Canvas 2D + Gamepad Native)**

---

## 1. TỔNG QUAN Ý TƯỞNG & BẢN SẮC
Hà Nội Chill lấy cảm hứng từ lối chơi mô phỏng cuộc sống và nông nghiệp ấm áp của Stardew Valley, nhưng mang đậm nét văn hóa nông thôn Bắc Bộ và hơi thở thanh bình của vùng ngoại ô Hà Nội:
- Người chơi rời bỏ khói bụi phố thị ồn ào để trở về tiếp quản trang trại của ông nội để lại ở chân núi Ba Vì.
- Không gian làng quê với cây đa, giếng nước, sân đình, quán trà đá vỉa hè và những luống rau xanh mướt.
- Tông màu pixel art 16-bit hoài niệm, âm thanh mộc mạc và nhịp chơi chậm rãi, thư giãn (Chill).

---

## 2. CÁC HỆ THỐNG GAMEPLAY CHÍNH

### 2.1. Nông nghiệp & Trồng trọt (Farming Loop)
- **Chu kỳ sinh trưởng:** 12+ loại cây trồng đại diện cho nông sản Việt Nam:
  1. *Cà chua bi (Cherry Tomato)*: Mùa Xuân/Hạ, 4 ngày lớn, thu hoạch nhiều lần.
  2. *Bắp ngô nếp (Sweet Corn)*: Mùa Hạ/Thu, 6 ngày lớn, thu hoạch nhiều lần.
  3. *Cà rốt (Carrot)*: Mùa Đông/Xuân, 4 ngày lớn.
  4. *Dâu tây (Strawberry)*: Mùa Xuân, 5 ngày lớn.
  5. *Khoai tây (Potato)*: Mùa Xuân, 5 ngày lớn.
  6. *Lúa mì (Wheat)*: Mùa Hạ/Thu, 4 ngày lớn.
  7. *Cà tím (Eggplant)*: Mùa Thu, 5 ngày lớn.
  8. *Bí ngô (Pumpkin)*: Mùa Thu, 8 ngày lớn, giá trị cao.
  9. *Dưa hấu (Melon)*: Mùa Hạ, 7 ngày lớn.
  10. *Bắp cải (Cabbage)*: Mùa Đông, 6 ngày lớn.
  11. *Ớt chỉ thiên (Chilli)*: Mùa Hạ, 4 ngày lớn.
  12. *Hoa hướng dương (Sunflower)*: Mùa Hạ/Thu, 5 ngày lớn, cho hạt khi thu hoạch.
- **Quy tắc đất trồng:**
  - Cần cuốc đất bằng Cuốc (Hoe).
  - Cần tưới nước mỗi ngày bằng Bình tưới (Watering Can) hoặc trông cậy vào trời mưa.
  - Cây không được tưới nước sẽ tạm dừng sinh trưởng trong ngày đó.
  - Sau khi thu hoạch, nông sản được cộng vào túi đồ để bán lấy tiền vàng (Gold) hoặc dùng nấu ăn/tặng quà.

### 2.2. Thời gian, Lịch trình & Thời tiết (Time & Seasons)
- **Chu kỳ ngày:** Bắt đầu lúc 06:00 AM và kết thúc lúc 02:00 AM hôm sau.
- **Tốc độ thời gian:** Mỗi 1.2 giây thực = 1 phút trong game (1 ngày chơi kéo dài khoảng 14 phút thực tế).
- **4 Mùa:**
  - *Mùa Xuân (Spring):* Hoa nở, thời tiết ấm áp, mưa phùn.
  - *Mùa Hạ (Summer):* Nắng vàng rực rỡ, ngày dài, giông bão mùa hè.
  - *Mùa Thu (Fall):* Lá vàng bay, gió heo may se lạnh, trời thu Hà Nội lãng mạn.
  - *Mùa Đông (Winter):* Bầu trời xám bạc, sương mù, chỉ trồng được cây chịu rét.
- **Thời tiết:** Nắng ráo (Sunny), Mưa rào (Rainy - tự động tưới toàn bộ nông trại!), Giông bão (Storm).

### 2.3. Nhân vật & Xã hội (NPCs & Social)
Thị trấn có tối thiểu 8 NPC mang tính cách đặc trưng của Hà Nội:
1. **Bác Ba (Cây Bàng):** Người làm vườn già thông thái, dạy người chơi kỹ thuật trồng cây.
2. **Chị Lan (Trà Đá):** Chủ quán nước đầu làng, nắm rõ mọi tin tức và chuyện trong làng.
3. **Cụ Rùa:** Trưởng lão hiền từ bên hồ, am hiểu các loài thủy sản và câu chuyện lịch sử.
4. **Chú Tuấn (Thợ Rèn):** Thợ kim hoàn & rèn nông cụ, nâng cấp cuốc, rìu, xẻng.
5. **Cô Mai (Bách Hóa):** Chủ cửa hàng hạt giống và nhu yếu phẩm nông nghiệp.
6. **Em Hương (Tiệm Bánh):** Cô thợ làm bánh ngọt ngào, thích hoa quả tươi và dâu tây.
7. **Anh Dũng (Kỹ Sư Tự Động):** Kỹ sư trẻ chế tạo vòi phun nước tự động và máy móc trang trại.
8. **Ông Bình (Trưởng Thôn):** Giao nhiệm vụ phát triển làng xóm và mở rộng vùng đất.

### 2.4. Bản đồ & Thế giới (World & Maps)
- **Nông Trại Ba Vì (Player's Farm):** Khu đất canh tác rộng lớn, có nhà ở, ao cá nhỏ, hòm thư và đất trồng.
- **Thị Trấn Hà Nội (Town):** Có Cửa hàng Cô Mai, Tiệm rèn Chú Tuấn, Quán trà đá Chị Lan.
- **Hồ Tây (Fishing Lake):** Điểm câu cá yên bình với bến thuyền gỗ và nhiều loài cá quý.
- **Hang Núi Trầm (Mines):** Nơi khai thác đá, quặng đồng, quặng sắt và đối đầu với quái vật bóng đêm.

### 2.5. Các hoạt động mở rộng
- **Khai khoáng & Chặt cây:** Chặt gỗ, đập đá lấy nguyên liệu chế tạo rương và hàng rào.
- **Câu cá:** Minigame câu cá tương tác đòi hỏi khéo léo giữ thanh cân bằng.
- **Chế tạo (Crafting):** Chế tạo Rương đồ (Chest), Hàng rào gỗ (Wood Fence), Vòi tưới nước (Sprinkler), Bù nhìn đuổi quạ (Scarecrow).
- **Hệ thống nhiệm vụ (Quests):** Nhật ký nhiệm vụ theo dõi tiến trình làm quen hàng xóm và mùa vụ.
- **Lưu game an toàn:** Tự động lưu khi đi ngủ, hỗ trợ nhiều slot save và xuất file sao lưu JSON.
