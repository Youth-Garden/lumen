# Lumen Project Master Rules

Before making any modifications or writing code, consult the appropriate skill in `.agents/skills/`:

- For feature planning and requirements analysis: consult the `ba` skill (`.agents/skills/ba/SKILL.md`).
- For backend development: consult the `backend` skill (`.agents/skills/backend/SKILL.md`).
- For frontend development: consult the `frontend` skill (`.agents/skills/frontend/SKILL.md`).

DO NOT ignore these skills. The architectural, design system, and syntax rules for each domain are maintained inside their respective skill instructions.

# Agent Communication Style Rule
- Answer straightforwardly, concisely, and directly to the technical problem.
- DO NOT use emotions, flowery language, or exclamations.
- Focus entirely on error analysis, proposing solutions, and reporting execution results.
- Write all code comments in English.

# Strict Code Commenting Rule
- TUYỆT ĐỐI KHÔNG comment linh tinh, tự hiển nhiên (không giải thích tên biến, tên hàm, luồng chạy thông thường, props, JSX...).
- CHỈ ĐƯỢC PHÉP comment ở những vị trí thực sự quan trọng, xử lý logic cực khó hoặc một function cực kỳ phức tạp.
- Nếu không thuộc diện cực khó/cực kỳ phức tạp, TUYỆT ĐỐI KHÔNG thêm bất kỳ comment nào.
- Mọi code comment (nếu có) bắt buộc viết bằng tiếng Anh ngắn gọn, chuẩn xác.

# Agent Quality Assurance Rule
- ALWAYS be meticulous and thorough. DO NOT push code immediately without verifying.
- Before committing and pushing code, MUST run `tsc -b` and `eslint` or the project's build command locally to ensure there are no hidden type errors or linting issues.
- Never guess fixes; verify them thoroughly by running the actual build process locally.

# Strict Zero-Workaround & Zero-Anti-Pattern Rule (MANDATORY)
- **TUYỆT ĐỐI CẤM MỌI HÌNH THỨC WORKAROUND HOẶC ANTI-PATTERN**:
  - Nếu KHÔNG CÓ yêu cầu cụ thể, rõ ràng và trực tiếp từ người dùng trong prompt hiện tại, BẤT KỲ anti-pattern hay workaround nào đều TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP SỬ DỤNG.
  - Tuyệt đối không chọn giải pháp "đi tắt" (shortcut), chắp vá tạm thời (quick fix/hack), hay lách qua các giới hạn kỹ thuật bằng các biện pháp phản kiến trúc.
  - Mọi giải pháp bắt buộc phải tuân thủ chuẩn Clean Architecture, Single Source of Truth, và Separation of Concerns ngay từ đầu.
  - Danh mục các Anti-Patterns & Workarounds BỊ CẤM TRIỆT ĐỂ:
    1. **Tầng Service can thiệp UI (Mixing Presentation & Data Layer)**: Tầng HTTP Client / Service (`CoreService`, API services) tuyệt đối KHÔNG được import UI component, KHÔNG bắn `toast`, KHÔNG parse cookie/DOM/URL để đoán ngữ cảnh UI, KHÔNG điều hướng bằng `window.location`. Tầng Service chỉ tương tác với HTTP, mappers và Domain State (Zustand store / Events).
    2. **Duplicate Dictionary / Ad-hoc i18n**: Tuyệt đối KHÔNG tự viết dictionary object riêng, KHÔNG tự chế hàm dịch trong service/utils. Toàn bộ text hiển thị BẮT BUỘC phải tập trung tại `messages/{locale}.json` và được render qua `useTranslations` của `next-intl` trong UI layer.
    3. **Workarounds & Compatibility Aliases**: Tuyệt đối KHÔNG tạo alias bridge (`export const useCreateDeck = useCreateFolder;`, `export type Deck = Folder;`) để né tránh refactor. Phải refactor 100% triệt để.
    4. **Coupled / Ping-Pong State Hooks**: Tuyệt đối KHÔNG chia cắt cùng một luồng state ra nhiều hooks phụ thuộc chéo lẫn nhau (hook A gọi hook B, hook B lại bắn callback ngược về hook A). Phải gom state vào single source of truth và dùng Pure Functions.
    5. **Ép kiểu vô tội vạ (Type Bypasses)**: Tuyệt đối KHÔNG dùng `any`, `as unknown as T` để qua mặt TypeScript compiler.

# Content & Copywriting Neutrality Rule
- NEVER inject or hardcode specialized domain terms (such as "TOEIC", "IELTS", specific certifications, or specialized test names) into general application copy, section titles, headers, badges, or input placeholders.
- General features, vocabulary, flashcards, decks/folders, dashboard, settings, and UI components must remain completely generic, neutral, and versatile.
- Specialized domain terms may ONLY be used within modules that are strictly dedicated to that specific purpose (e.g., an actual TOEIC mock test module).

- NEVER append redundant count numbers or pill badges (e.g. `(0)`, `[count]`, or `<span ...>{items.length}</span>`) next to section titles, headings, or category labels unless explicitly requested by the user. Section headers must remain clean and minimalist.

## Strict UI Aesthetics & Anti-Border / Anti-Card-Clutter Convention (MANDATORY)

- **Tuyệt đối HẠN CHẾ dùng Border**: Tuyệt đối KHÔNG lạm dụng các đường viền cứng (`border`, `border border-border/80`, `border-border/50`). Thiết kế của Lumen hướng đến sự phẳng, thoáng đãng, tinh tế và hiện đại.
- **Tuyệt đối KHÔNG lạm dụng Background Card (Anti-Card-Clutter / Anti-Box-in-Box)**:
  - KHÔNG bọc từng hàng (row), từng đoạn văn bản, hoặc từng mục lựa chọn vào các hộp nền riêng biệt (`bg-muted/20`, `bg-muted/30`, `rounded-2xl border...`).
  - Tránh triệt để tình trạng "hộp lồng trong hộp" (box-in-box) gây ngột ngạt và rối rắm giao diện.
  - Sử dụng trực tiếp bề mặt nền của Dialog / Page kết hợp với khoảng cách (padding/gap) và phân cấp kiểu chữ (typography hierarchy) tự nhiên, rõ ràng.

# Strict Prohibition on Opening Browser for Testing (Bắt buộc)
- TUYỆT ĐỐI KHÔNG ĐƯỢC MỞ BROWSER (không dùng browser_subagent, puppeteer hay bất kỳ browser automation nào) để kiểm tra giao diện hoặc tính năng. Các trang/tính năng yêu cầu đăng nhập của người dùng mà agent không thể đăng nhập được.
- Mọi kiểm tra tính đúng đắn phải thực hiện qua việc đọc hiểu code, phân tích logic, chạy `tsc --noEmit`, chạy `eslint` hoặc test code trực tiếp trong terminal, tuyệt đối không tự mở trình duyệt.


# Button Styling Rule
- **No Manual Button Re-styling (Prioritize Variants)**: Tuyệt đối KHÔNG tự ý re-style, không ghi đè style thủ công (như tùy tiện ghi đè `border`, `rounded`, `bg`, `shadow`, padding) lên component `<Button>`. Component `Button` của hệ thống đã có đầy đủ các `variant` (`default`, `secondary`, `outline`, `ghost`, `subtle`, `destructive`) và `size` (`default`, `sm`, `lg`, `icon`, `icon-sm`). BẮT BUỘC chỉ sử dụng trực tiếp các `variant` và `size` có sẵn, không can thiệp class ghi đè phá vỡ design system.

# Strict Directory Structure, Re-export, and Type Placement Rule (MANDATORY)
- **Separation of Concerns by Directory**:
  - `components/`: CHỈ chứa UI components (`.tsx`). Tuyệt đối KHÔNG đặt constants, animation variants, configs, utils hay types vào thư mục `components/`. Khi cần, BẮT BUỘC phải tạo thư mục riêng phù hợp (`constants/`, `hooks/`, `types/`, `utils/`).
  - `constants/`: Chứa hằng số, static configs, animation variants (ví dụ `animations.ts`).
  - `hooks/`: Chứa React custom hooks (`use-[name].ts`).
  - `types/`: Chứa domain types, feature models, shared interfaces (`[feature].types.ts`).
- **Re-export Convention**:
  - Hooks và Constants BẮT BUỘC phải được re-export tập trung qua file `index.ts` của thư mục đó (ví dụ: `hooks/index.ts`, `constants/index.ts`).
  - Components KHÔNG CẦN và KHÔNG re-export qua `index.ts`, import trực tiếp từ file component để tối ưu tree-shaking và code-splitting.
- **Type Placement Convention**:
  - Hook-specific props/return (`Use[Name]Props`, `Use[Name]Return`) có thể định nghĩa trong file hook đó hoặc file `use-[name].types.ts` (nếu quá dài).
  - Domain / Entity / Shared Types (như `MissedWordStat`, models, data structures) TUYỆT ĐỐI KHÔNG để trong thư mục `hooks/`. BẮT BUỘC phải đặt trong thư mục `types/` của module.

# Strict Service & API Domain Separation Rule (MANDATORY)
- Các module dịch vụ trong `services/` phải phân tách độc lập theo đúng domain nghiệp vụ. Tuyệt đối KHÔNG gộp chung các API/endpoint khác domain vào cùng một service.
- Ví dụ: Domain `vocabulary` (từ vựng, thư mục, flashcard CRUD) và domain `study` (flashcard đến hạn ôn tập `dueFlashcards`, nộp kết quả ôn tập `reviewFlashcard`, session học) BẮT BUỘC phải tách riêng thành hai service riêng biệt (`services/vocabulary` và `services/study`), đồng thời các hooks tương ứng cũng phải nằm tách bạch trong feature tương ứng (`features/vocabulary/hooks` và `features/study/hooks`).
- **Clean Service Import Convention (MANDATORY)**:
  - Khi import types, models, keys, hay functions từ một domain service, BẮT BUỘC phải import trực tiếp từ root module của domain đó (ví dụ: `import { VocabularyWord, Folder } from '@/services/vocabulary';`, `import { User } from '@/services/auth';`, `import { DueFlashcard } from '@/services/study';`).
  - TUYỆT ĐỐI KHÔNG import sâu vào các file con nội bộ như `@/services/vocabulary/vocabulary.types`, `@/services/study/study.types`, `@/services/auth/auth.types` hay `@/services/progress/progress.types`.
  - Mọi module service BẮT BUỘC phải re-export toàn bộ types, keys, service qua file `index.ts` của domain đó.

# Strict Constants, Enums & Type Certainty Rule (MANDATORY)
- **Chống Hardcode & Magic Values**: Tuyệt đối KHÔNG hardcode magic strings, numbers hay phím tắt. Tất cả phím tắt (shortcuts), configs, ratings BẮT BUỘC định nghĩa qua Enum/Constant rõ nghĩa (ví dụ `StudyShortcutKey { FLIP_SPACE = 'Space', MASTERED = '1', ... }`).
- **Chống Lạm Dụng `?` và `| null` Vô Tội Vạ**: Phải chắc chắn về data schema. Tuyệt đối không gắn `?` hay `| null` bừa bãi khi trường đó đã được đảm bảo chắc chắn (như mappers luôn khởi tạo array rỗng `[]` thì type là `T[]`). Chỉ dùng `?` khi thực sự optional và `| null` khi backend cam kết trả `null` có chủ đích. Tuyệt đối không viết `?: string | null`.

# Strict Hook Length Limit & Loose Coupling Rule (MANDATORY)
- **Giới hạn độ dài Custom Hook**: Một React custom hook BẮT BUỘC KHÔNG ĐƯỢC dài quá 300 dòng code.
- **Chống Phụ Thuộc Chéo Giữa Các Hook (Anti-Coupled Hooks / Anti-Ping-Pong State)**:
  - Khi phân rã logic để tuân thủ giới hạn dòng code, TUYỆT ĐỐI KHÔNG chia cắt cùng một luồng state nghiệp vụ ra thành nhiều custom hooks phụ thuộc chéo (hook A phụ thuộc hook B, hook B gọi callback/state của hook A, chuyền qua chuyền lại các callbacks như `onAction`, `resetAction`, ping-pong state).
  - BẮT BUỘC tuân thủ:
    1. **Pure Utilities First**: Ưu tiên tách logic tính toán, chuyển đổi dữ liệu (data transformations, algorithms, queue calculation, rating mapping) thành các Pure Functions trong thư mục `utils/`. Hàm thuần túy không có React lifecycle/state, cực kỳ dễ test và không gây coupling giữa các hooks.
    2. **Single Source of Truth**: State cốt lõi của một quy trình (session queue, feedback, card hiện tại) phải được quản trị tập trung tại một nơi duy nhất.
    3. **Độc lập, Unidirectional**: Các sub-hooks nếu tạo (như audio player, keyboard shortcuts listener) phải hoàn toàn độc lập, chỉ nhận input cần thiết (unidirectional flow), không can thiệp hay phụ thuộc chéo vào state của hook khác.

