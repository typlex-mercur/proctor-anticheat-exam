# Proctor Defense V5.1 - Hệ Thống Thi Trực Tuyến & Giám Sát Anti-Cheat Đa Tầng

Hệ thống thi trắc nghiệm trực tuyến mô phỏng môi trường sát hạch tiêu chuẩn quốc tế (Pearson VUE / ProctorU / OnVUE), tích hợp hệ thống chống gian lận (Anti-Cheat) đa tầng đến lớp sâu nhất của trình duyệt, bộ theo dõi toàn diện mọi lưu lượng mạng (Deep Packet Inspection), phát hiện công cụ tự động (Bot / Selenium / Puppeteer / Tampermonkey) và AI (Monica, Sider, ChatGPT, DeepSeek, Claude, Ollama local server, v.v.).

---

## 🛡️ 7 Tầng Bảo Mật & Anti-Cheat (Lớp Sâu Nhất)

1. **Tầng 1: Dấu vân tay phần cứng, Máy ảo & Giả lập Headless (Hardware & VM Sandbox Forensics)**
   - Khai thác WebGL unmasked vendor/renderer để phát hiện driver ảo (`SwiftShader`, `llvmpipe`, `VirtualBox`, `VMware`, `Mesa`, `Microsoft Basic Render Driver`).
   - Lấy mẫu băm tín hiệu sóng âm AudioContext oscillator buffer.
   - Kiểm tra đa màn hình qua Screen Details API (`window.screen.isExtended`) và tọa độ cửa sổ trôi dạt (`screenX/screenY`).

2. **Tầng 2: Phát hiện Tool Tự động hóa & Khung Bot (Automation, Headless & Userscripts Detection)**
   - Nhận diện cờ `navigator.webdriver === true`.
   - Nhận diện các engine userscript Tampermonkey, Violentmonkey, Greasemonkey (`window.GM`, `window.GM_info`, `window.GM_xmlhttpRequest`, `window.unsafeWindow`).
   - Quét các thuộc tính nội bộ của Selenium, Puppeteer, Playwright, Cypress, Nightmare (`cdc_adoQpoasnfa76pfcZLmcfl_`, `__puppeteer_evaluation_script__`, `__playwright`, `domAutomationController`, v.v.).
   - Kiểm tra bất thường về danh sách Plugins của Chromium.
   - Vòng lặp giám sát định kỳ (Background periodic check) phát hiện tool được tiêm vào giữa bài thi.

3. **Tầng 3: Kiểm soát Tiêu điểm, Toàn màn hình & Hiển thị (Display, Focus & Fullscreen Guard)**
   - Theo dõi trạng thái `visibilitychange` (chuyển tab, thu nhỏ cửa sổ).
   - Bắt sự kiện `window.onblur` khi mất tiêu điểm (Alt+Tab hoặc bấm chuột ngoài giao diện thi) có cơ chế debounce tránh double-strike khi chuyển tab.
   - Cưỡng chế chế độ Toàn màn hình (`requestFullscreen`): tự động bật modal khẩn cấp và đếm ngược cảnh cáo nếu thoát fullscreen.

4. **Tầng 4: Chặn DevTools & Bảo vệ Tính toàn vẹn Mã nguồn (DevTools Trap & Native Hook Integrity)**
   - Bẫy timing attack thông qua getter đối tượng được in ngầm trong `console.log`.
   - Giám sát chênh lệch kích thước cửa sổ (`outerWidth - innerWidth > 220` hoặc `outerHeight - innerHeight > 240`) với ngưỡng thích ứng tránh false-positive trên màn hình zoom / DPI cao.
   - Kiểm tra toàn vẹn native method (`Function.prototype.toString`, `window.fetch`, `addEventListener`, `XMLHttpRequest.prototype.open`) nhằm phát hiện hook can thiệp trái phép.

5. **Tầng 5: Bảo vệ Nhập liệu & Sinh trắc học Hành vi (Input Biometrics & Event Integrity)**
   - Bắt buộc kiểm tra `event.isTrusted === true` trên toàn bộ sự kiện click, pointer, phím bấm nhắm vào khu vực đề thi. Các sự kiện chuột/phím phát sinh nhân tạo bằng `dispatchEvent` bị chặn và phạt thẻ ngay lập tức.
   - Vô hiệu hóa chuột phải (`contextmenu`), sao chép/cắt/dán (`copy`, `cut`, `paste`, `selectstart`).
   - Khóa các phím tắt hacker: `F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+U`, `Ctrl+S`, `Ctrl+P`, `Ctrl+A`, `Ctrl+C`, `PrintScreen`.
   - Phân tích động học gõ phím (Keystroke Dynamics): Phát hiện tốc độ dán chữ siêu phàm của bot (< 18ms liên phím).

6. **Tầng 6: Thợ săn Extension AI & Prompt Độc hại Bẫy AI (DOM AI Extension Hunter & Adversarial Honeypot)**
   - `MutationObserver` liên tục quét các custom element tag (`<monica-sidebar>`, `<sider-app>`, `<chatgpt-bubble>`), container lồng nhau và các class/id của extension AI.
   - Khởi tạo quét toàn bộ cây DOM hiện hữu ngay khi tải trang và chặn tiêm Shadow DOM qua `Element.prototype.attachShadow`.
   - Thẻ Adversarial Honeypot Prompt Poisoning vô hình với mắt người nhưng được trích xuất vào `innerText` cho các công cụ cào đề và AI OCR: ép AI xuất mã bẫy canary `CHEAT_VIOLATION_CONFIRMED`.
   - Bắt giữ thao tác paste chứa câu trả lời AI hoặc chuỗi bẫy canary.

7. **Tầng 7: Bắt Gói Tin Mạng & Tường Lửa Ngăn Exfiltration (DPI Traffic Tracker & AI Firewall)**
   - Đánh chặn toàn diện 5 kênh mạng: `window.fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `window.WebSocket` và `window.EventSource` (SSE).
   - Danh sách đen mở rộng: `api.openai.com`, `chatgpt.com`, `anthropic.com`, `claude.ai`, `deepseek.com`, `generativelanguage.googleapis.com`, `perplexity.ai`, `openrouter.ai`, `poe.com`, `localhost:11434` (Ollama), `localhost:1234` (LM Studio), `localhost:8000`, `localhost:5000`, webhook exfiltration (Discord, Telegram, Webhook.site, Pipedream), ngrok, localtunnel.
   - Tự động phản hồi `403 Forbidden [Proctor Firewall Blocked]` khi phát hiện request tới AI ngoài, ghi nhận log pháp y và phạt thẻ kỷ luật.
   - Kiểm tra nội dung payload (Deep Packet Inspection) phát hiện hành vi tuồn đề thi, câu hỏi ra ngoài.
   - Trình soi gói tin chi tiết (Packet Detail Inspector Modal) trong SOC cho phép bấm xem chi tiết headers, body, latency và đánh giá an ninh.
   - Gửi heartbeat telemetry bảo mật định kỳ 4 giây/lần.

8. **Tầng Bổ Trợ: Giám sát AI Thị giác & Âm thanh (Proctor AI Vision & Audio Telemetry)**
   - Tích hợp Webcam thực tế hoặc bộ mô phỏng Canvas AI Landmark HUD.
   - Nhận diện tư thế đầu và hướng nhìn (Head Pose & Gaze Direction): cảnh báo khi quay mặt nhìn điện thoại hoặc màn hình phụ (> 40°).
   - Phát hiện nhiều khuôn mặt cùng xuất hiện trong khung hình webcam.
   - Đo cường độ âm thanh micro (VAD) để phát hiện thì thầm hoặc người đọc bài từ ngoài.

---

## 📚 Bộ Đề Thi Thật (Authentic Exam Banks)

1. **Đề 1: Kỳ Thi Chứng Chỉ Quốc Gia - An Toàn Thông Tin & Mạng Máy Tính Nâng Cao (SEC-PRO-2026)**
   - 20 câu hỏi chuyên sâu chuẩn CompTIA Security+, CEH, CCNA: Mật mã học (TLS 1.3, PFS, AES-GCM), An toàn ứng dụng Web (DOM XSS, SQLi, CSRF, SSRF), An toàn hệ thống & Binary (ASLR, Process Hollowing, x86-64 calling conventions), Mạng & Định tuyến (DAI, SYN Cookies, DNSSEC, BGP RPKI).
2. **Đề 2: Kỳ Thi Đánh Giá Năng Lực ĐHQG - Tư Duy Định Lượng & Khoa Học Máy Tính (DGNL-LOGIC-2026)**
   - 15 câu hỏi tư duy logic: Độ phức tạp thuật toán (Merge Sort, KMP, DSU Ackermann), Xác suất Bayes, Cây nhị phân AVL, Toán rời rạc, Hệ điều hành (Deadlock Coffman, Thrashing bộ nhớ ảo).

---

## 🚀 Hướng Dẫn Khởi Chạy

### Cách 1: Chạy trực tiếp trên trình duyệt
Mở trực tiếp file `index.html` bằng Google Chrome, Microsoft Edge hoặc Mozilla Firefox:
```powershell
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" "file:///C:/Users/Admin/.gemini/antigravity/scratch/proctor-anticheat-exam/index.html"
```

### Cách 2: Khởi chạy qua Python Local Server
```powershell
cd C:\Users\Admin\.gemini\antigravity\scratch\proctor-anticheat-exam
python -m http.server 8080
```
Sau đó truy cập: `http://localhost:8080`

### Chạy Toàn Bộ Kiểm Thử Tự Động (Automated Test Suites)
Có thể chạy trực tiếp từ bất kỳ thư mục nào:
```powershell
python C:\Users\Admin\.gemini\antigravity\scratch\proctor-anticheat-exam\test_suite.py
python C:\Users\Admin\.gemini\antigravity\scratch\proctor-anticheat-exam\test_edge_cases.py
```
*(Cả 2 bộ test gồm 32 kịch bản kiểm thử tự động với headless Chrome đều vượt qua 100% PASS)*
