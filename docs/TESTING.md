# HƯỚNG DẪN KIỂM THỬ (TESTING GUIDE)
Dự án: **Hà Nội Chill (Harvest Tales)**

---

## 1. MỤC TIÊU KIỂM THỬ
Đảm bảo các hệ thống cốt lõi (Nông nghiệp, Năng lượng, Tiền tệ, Cây trồng, Lưu game) hoạt động chính xác theo quy chuẩn logic mô phỏng của Stardew Valley mà không có lỗi hồi quy (regression bugs).

---

## 2. BỘ KIỂM THỬ TỰ ĐỘNG (UNIT TESTS)
Toàn bộ logic được kiểm thử tự động thông qua file `tests/unit_tests.js`.

### Các ca kiểm thử tự động (Test Cases):
1. **TEST 1: Tương tác đất & Cuốc đất (Hoeing Logic)**
   - Đầu vào: Ô đất bãi cỏ (`grass`, `tilled = false`).
   - Hành động: Sử dụng cuốc.
   - Kết quả kỳ vọng: Ô đất chuyển sang `tilled = true`, giảm 2 năng lượng của người chơi.
2. **TEST 2: Tưới nước & Độ ẩm (Watering Logic)**
   - Đầu vào: Ô đất đã cuốc (`tilled = true`, `watered = false`).
   - Hành động: Sử dụng bình tưới.
   - Kết quả kỳ vọng: Ô đất chuyển sang `watered = true`, giảm 1 năng lượng.
3. **TEST 3: Quy tắc sinh trưởng cây trồng qua ngày (Crop Growth Rule)**
   - Trường hợp 3A: Cây có tưới nước (`watered = true`) -> Qua ngày giai đoạn tăng từ `stage 0` lên `stage 1`. Đất khô trở lại (`watered = false`).
   - Trường hợp 3B: Cây KHÔNG được tưới (`watered = false`) -> Qua ngày giai đoạn giữ nguyên `stage 0`.
4. **TEST 4: Thu hoạch & Cộng tiền (Harvest & Economy)**
   - Đầu vào: Cây trồng đạt giai đoạn chín mọng (`stage = 5`).
   - Hành động: Thu hoạch bằng tay.
   - Kết quả kỳ vọng: Ô đất sạch cây trồng (`crop = null`), tiền vàng tăng chính xác theo giá trị nông sản (ví dụ +45G cho cà chua, +65G cho bắp ngô).
5. **TEST 5: Giới hạn Năng lượng (Energy Bounds)**
   - Thực hiện liên tục các hành động tiêu hao thể lực.
   - Kết quả kỳ vọng: Năng lượng không bao giờ bị âm dưới 0, hệ thống cảnh báo kiệt sức khi năng lượng về 0.
6. **TEST 6: Kiểm thử chuỗi tuần tự hóa & Khôi phục (Save/Load Serialization)**
   - Chuyển đổi dữ liệu sang chuỗi JSON và phục hồi lại.
   - Kết quả kỳ vọng: Tình trạng từng ô đất, số ngày, lượng tiền vàng được phục hồi nguyên vẹn 100%.

### Cách chạy kiểm thử:
Mở file `tests/test_runner.html` trên trình duyệt hoặc chạy qua Node.js:
```bash
node tests/unit_tests.js
```
