# TRẠNG THÁI DỰ ÁN (STATUS REPORT)
Dự án: **Hà Nội Chill (Harvest Tales)**
Phiên bản: **v2.0.0 (Release Candidate)**
Cập nhật lần cuối: **09/10/2026**

---

## 1. TỔNG QUAN TIẾN ĐỘ THEO CÁC NHÓM TÍNH NĂNG (TARGET: ~90% CORE LOOPS)

| Nhóm tính năng | Tỷ lệ hoàn thiện | Trạng thái | Ghi chú nghiệm thu |
| :--- | :---: | :---: | :--- |
| **Nhân vật & Di chuyển (4.1)** | 95% | ✅ Hoàn thành | 4 hướng, animation bước chân, đổ bóng, tiêu điểm tương tác, Gamepad/Bàn phím/Chuột. |
| **Nông nghiệp & Trồng trọt (4.2)** | 92% | ✅ Hoàn thành | Cuốc đất, tưới nước, 12 loại cây trồng, 6 giai đoạn lớn, điều kiện nước, qua ngày, thu hoạch. |
| **Thời gian & Mùa vụ (4.3)** | 90% | ✅ Hoàn thành | Đồng hồ 24h, 4 mùa vụ (Xuân/Hạ/Thu/Đông), chu kỳ ánh sáng ngày đêm, sự kiện cuối ngày đi ngủ. |
| **Túi đồ & Hotbar (4.4)** | 88% | ✅ Hoàn thành | Hotbar 6 ô chọn nhanh, icon pixel art, tooltip mô tả & giá bán, quản lý số lượng vật phẩm. |
| **NPC & Hội thoại (4.5)** | 85% | ✅ Hoàn thành | 8 NPC Hà Nội, tiểu sử, hội thoại ngữ cảnh, hộp thoại gỗ Stardew, hệ thống điểm tim thân thiết. |
| **Bản đồ & Thế giới (4.6)** | 85% | ✅ Hoàn thành | Nông trại Ba Vì, thị trấn, hồ câu cá, ao nước gợn sóng, hàng rào, nhà ở, camera bám theo. |
| **Khai thác & Chế tạo (4.7)** | 85% | ✅ Hoàn thành | Chặt cây thu gỗ, đập đá, menu chế tạo rương, hàng rào, vòi tưới nước tự động. |
| **Câu cá (4.8)** | 80% | ✅ Hoàn thành | Quăng cần tại ao nước/Hồ Tây, thời gian chờ cá cắn câu, thu được nhiều loài cá theo vùng. |
| **Kinh tế & Cửa hàng (4.11)** | 90% | ✅ Hoàn thành | Cửa hàng Bách Hóa Cô Mai, mua hạt giống, bán nông sản lấy tiền vàng, hòm xuất khẩu. |
| **Nhiệm vụ & Quests (4.12)** | 85% | ✅ Hoàn thành | Nhật ký nhiệm vụ theo dõi các mốc canh tác đầu tiên, phần thưởng tiền vàng. |
| **Giao diện UI/UX (5.0)** | 92% | ✅ Hoàn thành | HUD gỗ retro, font pixel 'Press Start 2P', menu phím bấm, thông báo nổi (Toast). |
| **Âm thanh (6.0)** | 90% | ✅ Hoàn thành | Bộ tổng hợp âm thanh Retro Web Audio Synthesizer (cuốc, tưới, gieo hạt, thu hoạch, thức dậy). |
| **Lưu & Tải game (8.0)** | 95% | ✅ Hoàn thành | Lưu tự động vào LocalStorage, hỗ trợ khôi phục 100% tình trạng đất, cây, tiền, vị trí. |
| **Kiểm thử tự động (11.0)** | 90% | ✅ Hoàn thành | Bộ kiểm thử unit tests cho logic sinh trưởng, năng lượng, túi đồ và lưu game. |

---

## 2. DANH SÁCH TÍNH NĂNG ĐÃ KIỂM NGHIỆM TRÊN TRÌNH DUYỆT
- [x] Khởi chạy độc lập không phụ thuộc thư viện ngoài (Zero-Install).
- [x] Hiển thị sắc nét với tỷ lệ pixel hoàn hảo (`image-rendering: pixelated`).
- [x] Cắm tay cầm Xbox / PlayStation hoạt động ngay lập tức (Plug-and-play qua Gamepad API).
- [x] Chu kỳ qua ngày hồi phục năng lượng và phát triển cây trồng hoạt động chính xác.
- [x] Kiểm tra lưu game, đóng tab mở lại dữ liệu được phục hồi nguyên vẹn.
- [x] Deploy live lên GitHub Pages tại: `https://dungautomation-dev.github.io/hanoi-chill/`.
