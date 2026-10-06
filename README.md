# Web Dew Valley (Stardew Clone)

Một bản sao (clone) siêu tối giản của Stardew Valley chạy trực tiếp trên trình duyệt, có hỗ trợ chơi bằng **Tay cầm (Gamepad)**.

## 🌟 Tính năng (Các Core Mechanics của Stardew Valley)
- **Hệ thống bản đồ (Grid-based)**: Tương tác chính xác theo từng ô đất (Tile).
- **Hệ thống nông nghiệp**:
  - Cuốc đất (Hoe)
  - Tưới nước (Watering Can)
  - Gieo hạt (Seed)
  - Thu hoạch (Harvest)
- **Hệ thống thời gian & Sinh trưởng**: 
  - Trồng cây phải tưới nước mới lớn được.
  - Nhấn nút "Đi ngủ" để qua ngày. Đất sẽ khô lại và cây sẽ lớn lên 1 bậc nếu hôm trước được tưới.
- **Kinh tế cơ bản**: Thu hoạch bán lấy tiền (Money).
- **Hỗ trợ Gamepad (Tay cầm Xbox / PlayStation)** Native qua Gamepad API.
- **Hệ thống Save/Load**: Tự động lưu thế giới, cấp độ cây trồng, tiền bạc vào `LocalStorage` mỗi khi qua ngày. F5 tải lại trang vẫn giữ nguyên.

## 🎮 Cách điều khiển

**Bằng Bàn phím:**
- **W, A, S, D** hoặc **Phím mũi tên**: Di chuyển nhân vật.
- **Phím SPACE**: Thực hiện hành động (Cuốc, Tưới, Trồng...).
- **Phím 1, 2, 3, 4**: Đổi công cụ nhanh.

**Bằng Tay cầm (Gamepad):**
- **Analog trái** / **D-Pad**: Di chuyển.
- **Nút A** (Xbox) hoặc **Cross ✖️** (PS): Thực hiện hành động.
- **Nút L1 / R1** (LB / RB): Chuyển đổi công cụ trong Toolbar.
- **Nút Start / Menu**: Đi ngủ (Qua ngày mới).

## 🚀 Cách chạy dự án
Chỉ cần mở file `index.html` lên bằng trình duyệt, hoặc dùng Live Server trên VS Code là có thể chơi ngay!
Không cần cài đặt thư viện hay NPM. Thích hợp đẩy thẳng lên **Vercel** để chơi online.
