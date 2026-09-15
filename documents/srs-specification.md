# TÀI LIỆU ĐẶC TẢ HỆ THỐNG GHI NHỚ TỪ VỰNG (SPACED REPETITION SYSTEM - SRS)

> File này là nguồn sự thật (source of truth) cho cơ chế SRS trong dự án Lumen.
> Mọi thay đổi logic SRS phải cập nhật đồng bộ file này.

---

## 1. MÔ HÌNH DỮ LIỆU (DATA SCHEMA)

```typescript
interface UserWordProgress {
  userId: string;
  wordId: string;          // hoặc flashcardId tùy mapping

  // Trạng thái hiển thị
  masteryScore: number;    // Điểm thành thạo thực tế: 0.0 -> 100.0 (%)
  level: number;           // 0: Chưa học | 1..4: Đang học | 5: Thông thạo
  isWilted: boolean;       // true: Quá hạn ôn tập (Cần tưới nước / Hoa héo)

  // Chỉ số phục vụ tính toán nấc & SRS
  learningStep: number;    // Bộ đếm cho Level 0→1: Tích lũy 0 -> 6 lần đúng
  intervalDays: number;    // Khoảng cách ngày cho lần ôn tập kế tiếp

  // Mốc thời gian
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
}
```

---

## 2. PHÂN CẤP NẤC NHỚ & BIỂU TƯỢNG VÒNG ĐỜI CÂY TRỒNG

| level | Tên           | masteryScore  | Icon               | Nấc sáng | intervalDays    |
|-------|---------------|---------------|--------------------|----------|-----------------|
| 0     | Chưa học      | 0%            | Hạt mầm chưa gieo  | 0 / 5    | N/A             |
| 1     | Mới học       | 1% – 20%      | Hạt nảy mầm        | 1 / 5    | 4 giờ (0.16d)   |
| 2     | Nhớ tạm       | 21% – 40%     | Chồi non vươn lên  | 2 / 5    | 1 ngày          |
| 3     | Nhớ lâu       | 41% – 60%     | Cây 2 lá mầm       | 3 / 5    | 3 ngày          |
| 4     | Thuộc lòng    | 61% – 80%     | Cây kết nụ hoa     | 4 / 5    | 7 ngày          |
| 5     | Thông thạo    | 81% – 100%    | Hoa hướng dương nở | 5 / 5    | 30d → nhân đôi  |

---

## 3. LOGIC HỌC TỪ MỚI & THĂNG CẤP (TIẾN TRÌNH THUẬN)

### 3.1. Giai đoạn Gieo mầm (Level 0 → Level 1)

- Phải chọn đúng lũy kế **6 lần** (cross-session, lưu bền vững DB)
- Mỗi lần đúng:
  ```
  learningStep += 1
  masteryScore = min(20, learningStep × (20/6))
  ```
- Khi learningStep >= 6:
  ```
  level = 1
  masteryScore = 20%
  nextReviewAt = now + 4 giờ
  ```

### 3.2. Ôn tập định kỳ SRS (Level 1 → Level 5)

| Chuyển từ → đến | Số lần đúng cần | masteryScore mới | intervalDays |
|-----------------|-----------------|------------------|--------------|
| Level 1 → 2     | 2 lần ôn hợp lệ | 40%              | 1 ngày       |
| Level 2 → 3     | 2 lần ôn hợp lệ | 60%              | 3 ngày       |
| Level 3 → 4     | 1 lần ôn hợp lệ | 80%              | 7 ngày       |
| Level 4 → 5     | 1 lần ôn hợp lệ | 100%             | 30 ngày      |

> "Ôn hợp lệ" = trả lời đúng tại thời điểm current_time >= nextReviewAt

### 3.3. Phím tắt đánh giá nhanh

| Hành động     | Kết quả                                          |
|---------------|--------------------------------------------------|
| "Nhớ tạm"     | level=2, masteryScore=40%, nextReviewAt=now+1d   |
| "Đã biết"     | level=5, masteryScore=100%, nextReviewAt=now+30d |

---

## 4. CƠ CHẾ HOA HÉO & TRỪ ĐIỂM KHI TRẢ LỜI SAI

### 4.1. Hoa héo (Wilted)

Khi: `current_time >= nextReviewAt` → `isWilted = true`

Không tự động trừ điểm khi chưa vào làm bài.

### 4.2. Vào tưới nước (Review Session)

**Đúng:**
- `isWilted = false`
- Tăng level theo bảng 3.2
- Level 5 đúng tiếp: `intervalDays = min(180, intervalDays × 2)`

**Sai:**
```
masteryScore = max(0, masteryScore - 20%)
level = floor(masteryScore / 20)
intervalDays = 0.16  (4 giờ)
nextReviewAt = now + 4 giờ
```

---

## 5. STATE MACHINE

```
[Level 0: Chưa học]
       │
       ▼ (Đúng đủ 6 lần tích lũy)
[Level 1: Mới học (1 nấc, 20%)] ── Sau 4 giờ ──► [Hoa héo]
       │                                              │
       ├──────── Đúng 2 lần ôn tập ◄─────────────────┘
       ▼
[Level 2: Nhớ tạm (2 nấc, 40%)] ── Sau 1 ngày ──► [Hoa héo]
       │                                              │
       ├──────── Đúng 2 lần ôn tập ◄─────────────────┤
       │                                         ▼ (Sai)
       │                                    Rớt về Level 1
       ▼
[Level 3: Nhớ lâu (3 nấc, 60%)] ── Sau 3 ngày ──► [Hoa héo]
       │                                              │
       ├──────── Đúng 1 lần ôn tập ◄─────────────────┤
       │                                         ▼ (Sai)
       │                                    Rớt về Level 2
       ▼
[Level 4: Thuộc lòng (4 nấc, 80%)] ─ Sau 7 ngày ─► [Hoa héo]
       │                                              │
       ├──────── Đúng 1 lần ôn tập ◄─────────────────┤
       │                                         ▼ (Sai)
       │                                    Rớt về Level 3
       ▼
[Level 5: Hoa hướng dương (5 nấc, 100%)] ─ 30d ─► [Hoa héo]
       │                                              │
       ├──────── Đúng: interval × 2 (max 180d) ◄──────┤
       │                                         ▼ (Sai)
       └──────────────────────────────── Rớt về Level 4
```
