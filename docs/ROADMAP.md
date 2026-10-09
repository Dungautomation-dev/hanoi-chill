# LỘ TRÌNH PHÁT TRIỂN DỰ ÁN (ROADMAP)
Dự án: **Hà Nội Chill (Harvest Tales)**

---

## Giai đoạn 1: Nghiên cứu Kiến trúc & Thiết kế (Hoàn thành ✅)
- [x] Phân tích toàn diện mã nguồn Stardew Valley 1.5.6 (WeDias/StardewValley).
- [x] Lập sơ đồ kiến trúc module hóa và bảng so sánh các hệ thống tương đương.
- [x] Thiết lập Game Design Document (GDD) với bản sắc nông nghiệp Hà Nội.
- [x] Lựa chọn nền tảng: Web Canvas 2D + Gamepad Native + GitHub Pages deployment.

## Giai đoạn 2: Khung Game & Hệ Thống Cốt Lõi (Hoàn thành ✅)
- [x] Xây dựng Game Loop 60 FPS, Canvas viewport 800x480, pixel art filtering.
- [x] Bộ điều khiển nhân vật 4 hướng với sprite 16-bit, va chạm (Collision) và bóng đổ.
- [x] Hỗ trợ Bàn phím (WASD / Mũi tên), Chuột (Click tương tác), và Tay cầm (Xbox / PS Controller).
- [x] Đồng hồ 24h, chu kỳ Ngày / Đêm, hiệu ứng ánh sáng hoàng hôn và ban đêm.

## Giai đoạn 3: Nông Nghiệp & Kinh Tế (Farming MVP) (Hoàn thành ✅)
- [x] Cuốc đất xới luống (Tilled Dirt) với đường vân đất chuẩn 16-bit.
- [x] Bình tưới nước làm ẩm đất, hiệu ứng giọt nước bắn tung tóe.
- [x] Danh mục 12+ loại cây trồng đặc trưng với dữ liệu mùa vụ, ngày lớn, giá bán.
- [x] Hoạt ảnh sinh trưởng đa giai đoạn (Hạt giống -> Mầm -> Cây lá -> Ra hoa -> Trĩu quả).
- [x] Đi ngủ qua ngày mới (Sleep cycle): Cây lớn lên nếu hôm trước được tưới, đất khô lại.
- [x] Thu hoạch nông sản, nhận tiền vàng, hiệu ứng số tiền nổi `+XX G` và âm thanh ting ting.

## Giai đoạn 4: Mở Rộng Thế Giới, NPC & Xã Hội (Hoàn thành ✅)
- [x] Bản đồ phân vùng: Nông trại Ba Vì, Thị trấn Hà Nội, Hồ Tây câu cá.
- [x] 8 NPC Hà Nội với tên gọi, ngoại hình, tính cách, lời thoại và điểm tim thân thiết.
- [x] Hệ thống hội thoại tương tác (Dialogue Box UI) phong cách parchment gỗ retro.
- [x] Cửa hàng Bách Hóa Cô Mai: Xem danh mục hạt giống, mua bán vật phẩm.
- [x] Nhật ký nhiệm vụ (Quest Journal) hướng dẫn người chơi phát triển nông trại.

## Giai đoạn 5: Khai Khoáng, Chế Tạo, Câu Cá & Âm Thanh (Hoàn thành ✅)
- [x] Chặt cây thu gỗ (Wood), đập đá thu khoáng sản (Stone).
- [x] Menu Chế tạo (Crafting): Chế tạo Rương đồ, Hàng rào gỗ, Vòi tưới nước tự động.
- [x] Cơ chế Câu cá tại Hồ Tây với minigame thanh trượt và nhiều loài cá.
- [x] Bộ tổng hợp âm thanh Retro Web Audio Synthesizer (0 file MP3 nặng, âm thanh 16-bit mộc mạc).
- [x] Hệ thống Save/Load an toàn với LocalStorage và sao lưu dữ liệu.

## Giai đoạn 6: Đánh bóng & Phát hành (Release) (Đang tiến hành 🚀)
- [x] Triển khai lên GitHub Pages: `https://dungautomation-dev.github.io/hanoi-chill/`.
- [x] Viết bộ kiểm thử tự động (Unit Tests) cho logic sinh trưởng, năng lượng, túi đồ.
- [x] Kiểm tra tương thích tay cầm Gamepad và chuột trên màn hình cảm ứng/PC.
- [ ] Mở rộng hệ thống chăn nuôi bò sữa Ba Vì và gà đẻ trứng (Planned v2.1).
