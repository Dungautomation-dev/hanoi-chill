# KIẾN TRÚC HỆ THỐNG VÀ PHÂN TÍCH REPOSITORY THAM KHẢO
Dự án: **Hà Nội Chill (Harvest Tales)**
Nguồn tham khảo: [WeDias/StardewValley (Decompiled v1.5.6)](https://github.com/WeDias/StardewValley)

---

## 1. PHÂN TÍCH KIẾN TRÚC MÃ NGUỒN STARDEW VALLEY (1.5.6)

Qua việc khảo sát cấu trúc repository decompiled của Stardew Valley, trò chơi được xây dựng bằng C# trên nền tảng MonoGame/XNA với mô hình hướng đối tượng (OOP) kinh điển kết hợp Event-Driven và Entity-Component hybrid:

```
┌─────────────────────────────────────────────────────────────┐
│                          Game1                              │
│       (Game Loop: Initialize, Update, Draw, StateMachine)   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       ┌───────▼────────┐             ┌────────▼────────┐
       │     Farmer     │             │  GameLocation   │
       │(Player Entity) │             │ (Maps & Layers) │
       └───────┬────────┘             └────────┬────────┘
               │                               │
       ┌───────┴────────┐             ┌────────┴────────┐
       │  Tool / Item   │             │   HoeDirt &     │
       │   Inventory    │             │     Crops       │
       └────────────────┘             └─────────────────┘
               │                               │
               └───────────────┬───────────────┘
                               │
                      ┌────────▼────────┐
                      │    SaveGame     │
                      │ (Serialization) │
                      └─────────────────┘
```

### Bảng phân tích các hệ thống cốt lõi của Stardew Valley:

| Hệ thống | Class / File trong Stardew Valley | Chức năng cốt lõi | Nguyên lý hoạt động học hỏi | Cách triển khai trong Hà Nội Chill (`hanoi-chill`) |
| :--- | :--- | :--- | :--- | :--- |
| **Game Loop & Quản lý màn hình** | `Game1.cs` | Vòng lặp chính, xử lý `Update(gameTime)` và `Draw(spriteBatch)`, chuyển đổi state giữa Title, Game, Cutscene, Menu. | Tách biệt logic cập nhật trạng thái với logic render. Tần số tick cố định (60 FPS). | `src/core/GameEngine.js`: Quản lý loop với `requestAnimationFrame`, delta time, camera viewport, và event bus. |
| **Nhân vật người chơi** | `Farmer.cs`, `Character.cs` | Vị trí, hướng nhìn, tốc độ, hoạt ảnh bước đi/dùng công cụ, chỉ số Máu (HP), Năng lượng (Stamina), Tiền tệ (Money). | Quản lý toạ độ pixel thực tế và bounding box va chạm (BoundingBox) nhỏ hơn kích thước sprite. | `src/entities/Player.js`: Lưu toạ độ, hướng (4 chiều), năng lượng (100%), tiền (Gold), hoạt ảnh vung công cụ. |
| **Công cụ & Vật phẩm** | `Tool.cs`, `Hoe.cs`, `WateringCan.cs`, `Axe.cs`, `Pickaxe.cs`, `FishingRod.cs`, `Item.cs` | Lớp cha `Tool` và `Item`, xác định vùng tác động (bounding box / tile ahead), chi phí năng lượng, cấp độ công cụ. | Đa hình (Polymorphism) qua hàm `doFunction(location, x, y, power, who)`. | `src/systems/ToolSystem.js`: Chuẩn hoá phương thức `use(tile, player, world)` cho từng công cụ. |
| **Đất canh tác & Cây trồng** | `HoeDirt.cs`, `Crop.cs`, `TerrainFeature.cs` | Ô đất cày: trạng thái khô (`0`), ướt (`1`), phân bón. `Crop`: loại hạt, giai đoạn (`currentPhase`), số ngày trong giai đoạn (`dayOfCurrentPhase`), số ngày ra trái lại (`regrowAfterHarvest`). | Mỗi ngày mới (`dayUpdate`), nếu ô đất có nước (`state == 1`), `crop.newDay(state)` sẽ tăng ngày phát triển. Cây có thể thu hoạch nhiều lần. | `src/farming/FarmingSystem.js` & `src/data/CropsData.js`: Quản lý 12+ loại cây trồng, 5-6 giai đoạn sinh trưởng, mùa vụ và tưới nước. |
| **Bản đồ & Thế giới** | `GameLocation.cs`, `Farm.cs`, `Town.cs`, `Warp.cs` | Quản lý danh sách đối tượng, layer va chạm, điểm dịch chuyển (`Warp`), danh sách NPC đang hiện diện. | Tách thế giới thành các địa danh độc lập (Locations) có toạ độ và danh sách đối tượng riêng biệt. | `src/world/WorldManager.js`: Quản lý Nông Trại Ba Vì, Thị Trấn Hà Nội, Hồ Tây, Khu Mỏ Núi Trầm với camera follow. |
| **Thời gian & Mùa vụ** | `GameTime`, `DayTimeMoneyBox.cs`, `WorldDate.cs` | Giờ trong ngày (600 - 2600 = 6:00 AM - 2:00 AM), ngày trong tháng (1 - 28), 4 mùa (Spring, Summer, Fall, Winter), năm. | Thời gian trôi theo chu kỳ thực (mỗi 7 giây thực = 10 phút game). Ban đêm ánh sáng tối dần. | `src/core/TimeSystem.js`: 4 mùa (Xuân, Hạ, Thu, Đông), chu kỳ 24h, ánh sáng mặt trời theo thời gian. |
| **Túi đồ & Rương** | `Inventory.cs`, `Chest.cs`, `ItemGrabMenu.cs` | Danh sách 12/24/36 ô, giới hạn stack (999), hotbar chọn nhanh, chuyển đổi vật phẩm qua lại giữa túi đồ và rương. | Mảng `List<Item>` với cơ chế kiểm tra `canStackWith()` và `addToStack()`. | `src/systems/InventorySystem.js`: Quản lý Hotbar 6-12 ô, Backpack modal, cơ chế xếp chồng (Stacking). |
| **NPC & Lịch trình** | `NPC.cs`, `SchedulePathDescription.cs`, `Dialogue.cs` | Lịch trình di chuyển theo giờ (`Schedule`), hội thoại theo sự kiện/thời tiết, điểm thân thiết (Hearts/Friendship), tặng quà. | NPC đọc bảng lịch trình dạng chuỗi (`"610 Town 12 18 2"`: lúc 6:10 đến toạ độ 12, 18). | `src/entities/NPCManager.js` & `src/data/NPCsData.js`: 8 NPC Hà Nội, lịch trình di chuyển, hội thoại và điểm tim. |
| **Kinh tế & Cửa hàng** | `ShopMenu.cs`, `ShippingBin` | Hòm xuất khẩu tính tiền qua đêm. Cửa hàng bán hạt giống và vật phẩm nông nghiệp. | Mua trừ tiền ngay, bán gửi vào hòm sẽ được tính toán tổng kết khi đi ngủ. | `src/systems/EconomySystem.js`: Cửa hàng Bách Hóa Cô Mai và Thùng gửi hàng (Shipping Bin). |
| **Câu cá** | `FishingRod.cs`, `BobberBar.cs` | Ném cần, chờ cá cắn (`Bite`), minigame giữ thanh trượt xanh bám theo con cá đang nhảy. | Minigame vật lý với trọng lực và lực đẩy lò xo của thanh trượt. | `src/systems/FishingSystem.js`: Minigame câu cá tương tác có thanh giữ lực và nhiều loài cá theo vùng nước. |
| **Lưu & Tải game** | `SaveGame.cs` | Chuyển đổi toàn bộ dữ liệu thế giới thành XML/JSON và tải lại nguyên vẹn. | Serialization với kiểm tra phiên bản dữ liệu và file dự phòng. | `src/systems/SaveSystem.js`: Lưu trữ LocalStorage + Export/Import JSON file với cấu trúc phiên bản hóa. |

---

## 2. LỰA CHỌN CÔNG NGHỆ: WEB GAME ENGINE MODULAR (HTML5 CANVAS 2D + ES6)

### So sánh và lý do lựa chọn:
1. **Tính tương thích tức thì và kiểm thử 1-click:** Game chạy trực tiếp trên Windows PC (bất kỳ trình duyệt hiện đại hoặc Electron) đồng thời deploy thẳng lên **GitHub Pages** (`https://dungautomation-dev.github.io/hanoi-chill/`) giúp người dùng click là chơi ngay trên mọi thiết bị.
2. **Kiểm soát kiến trúc sâu:** Xây dựng cấu trúc module hóa phân tầng (Core, Entities, Systems, World, Data, UI) tương đồng với C# của Stardew Valley, dễ đọc, dễ viết unit test tự động.
3. **Hiệu năng cao:** Canvas 2D với `image-rendering: pixelated`, 60 FPS mượt mà, tài nguyên tải động, hỗ trợ native **Gamepad API** (Xbox/PlayStation) và **Web Audio API**.

---

## 3. SƠ ĐỒ THƯ MỤC KIẾN TRÚC MODULAR DỰ ÁN

```
hanoi-chill/
├── index.html                    # Trang game chính, canvas và overlay UI
├── style.css                     # Retro pixel-art UI styling (Stardew wooden theme)
├── main.js                       # Điểm khởi động game (Bootstrap & Engine init)
├── docs/                         # Tài liệu thiết kế, kiến trúc, kiểm thử
│   ├── GDD.md                    # Game Design Document chi tiết
│   ├── ARCHITECTURE.md           # Kiến trúc hệ thống và phân tích mã nguồn
│   ├── ROADMAP.md                # Lộ trình phát triển tính năng
│   ├── STATUS.md                 # Trạng thái nghiệm thu chi tiết
│   ├── TESTING.md                # Hướng dẫn kiểm thử & Unit Tests
│   └── ASSET_LICENSES.md         # Giấy phép tài nguyên đồ họa
├── assets/                       # Spritesheets 16-bit Pixel Art
├── src/
│   ├── core/
│   │   ├── GameEngine.js         # Loop chính, Canvas renderer, Camera viewport
│   │   ├── TimeSystem.js         # Đồng hồ 24h, 4 mùa, ngày đêm, thời tiết
│   │   ├── InputManager.js       # Bàn phím, Chuột, Gamepad API
│   │   └── EventBus.js           # Truyền thông điệp giữa các hệ thống
│   ├── data/
│   │   ├── CropsData.js          # Dữ liệu 12+ loại cây trồng (mùa vụ, ngày, giá)
│   │   ├── ItemsData.js          # Danh mục vật phẩm, công cụ, nguyên liệu
│   │   ├── NPCsData.js           # 8 NPC Hà Nội, tiểu sử, hội thoại, quà tặng
│   │   ├── RecipesData.js        # Công thức chế tạo (Crafting)
│   │   └── FishData.js           # Danh sách cá & độ khó
│   ├── world/
│   │   ├── WorldManager.js       # Quản lý bản đồ, chuyển cảnh các khu vực
│   │   └── LightingSystem.js     # Ánh sáng ngày/hoàng hôn/đêm & đom đóm
│   ├── entities/
│   │   ├── Player.js             # Vị trí, hoạt ảnh, máu, năng lượng, va chạm
│   │   └── NPCManager.js         # Vòng lặp NPC, lịch trình, tương tác hội thoại
│   ├── systems/
│   │   ├── FarmingSystem.js      # Cuốc, tưới, gieo hạt, sinh trưởng, thu hoạch
│   │   ├── InventorySystem.js    # Túi đồ, Hotbar, xếp chồng, rương chứa đồ
│   │   ├── FishingSystem.js      # Cần câu, minigame bắt cá
│   │   ├── MiningSystem.js       # Khai khoáng đá/quặng, quái vật, hang mỏ
│   │   ├── CraftingSystem.js     # Chế tạo công cụ, hàng rào, vòi tưới
│   │   ├── EconomySystem.js      # Cửa hàng Bách Hóa Cô Mai, mua bán
│   │   ├── QuestSystem.js        # Nhật ký nhiệm vụ chính & phụ
│   │   ├── SaveSystem.js         # Lưu/Tải LocalStorage & xuất file JSON
│   │   └── AudioSynth.js         # Bộ tổng hợp âm thanh Retro Web Audio
│   └── ui/
│       └── UIManager.js          # Quản lý Modal, HUD, Hộp thoại, Shop, Inventory
└── tests/
    └── unit_tests.js             # Bộ kiểm thử tự động cho toàn bộ logic game
```
