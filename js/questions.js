/**
 * EXAM QUESTION BANK - REAL HIGH-STAKES EXAM QUESTIONS
 * Dataset 1: Cybersecurity & Cloud Infrastructure Certification (CompTIA Security+ / CEH / CCNA)
 * Dataset 2: Đề Thi Đánh Giá Năng Lực ĐHQG - Tư Duy Định Lượng & Khoa Học Máy Tính
 */

const EXAM_BANKS = {
    cybersec: {
        id: "cybersec",
        title: "Kỳ Thi Chứng Chỉ Quốc Gia: An Toàn Thông Tin & Mạng Máy Tính Nâng Cao",
        code: "SEC-PRO-2026",
        durationMinutes: 45,
        passPercentage: 70,
        instructions: "Đề thi gồm 20 câu hỏi trắc nghiệm chuyên sâu. Mỗi câu chỉ có 1 đáp án đúng duy nhất. Môi trường thi được giám sát nghiêm ngặt bởi Hệ Thống Anti-Cheat V5.0 đa tầng.",
        questions: [
            {
                id: 1,
                category: "Cryptography",
                question: "Trong giao thức TLS 1.3, kỹ thuật nào sau đây được bắt buộc sử dụng nhằm đảm bảo tính bảo mật chuyển tiếp hoàn hảo (Perfect Forward Secrecy - PFS), loại bỏ hoàn toàn cơ chế trao đổi khóa RSA tĩnh?",
                codeSnippet: `// Giao thức bắt tay TLS 1.3
ClientHello -> supported_groups: [x25519, secp256r1], key_share
ServerHello <- chosen_group, server_key_share`,
                options: [
                    "Ephemeral Diffie-Hellman (ECDHE / DHE)",
                    "Static RSA Key Exchange",
                    "Dual-EC-DRBG Pseudo-random Generator",
                    "RC4 Stream Cipher with pre-shared key"
                ],
                correctAnswer: 0,
                explanation: "TLS 1.3 đã loại bỏ hoàn toàn cơ chế trao đổi khóa bằng RSA tĩnh và chỉ cho phép các thuật toán thỏa mãn Perfect Forward Secrecy (PFS), cụ thể là Ephemeral Diffie-Hellman (DHE/ECDHE). Dù khóa riêng (private key) của máy chủ bị lộ sau này, kẻ tấn công vẫn không thể giải mã các phiên truyền thông cũ."
            },
            {
                id: 2,
                category: "Web Security",
                question: "Một ứng dụng web hiển thị trực tiếp dữ liệu từ URL query parameter vào cây DOM thông qua phương thức 'document.getElementById('welcome').innerHTML = location.search;'. Lỗ hổng bảo mật nào xuất hiện và biện pháp khắc phục triệt để nhất là gì?",
                codeSnippet: `// Đoạn mã JavaScript phía máy khách bị tổn thương:
const urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get('name');
document.getElementById('greeting').innerHTML = "Xin chào " + userName;`,
                options: [
                    "Stored XSS; khắc phục bằng cách thiết lập cờ HttpOnly cho cookie.",
                    "DOM-based XSS; khắc phục bằng cách sử dụng textContent hoặc DOMPurify thay vì innerHTML.",
                    "SQL Injection; khắc phục bằng Prepared Statements trong cơ sở dữ liệu.",
                    "Cross-Site Request Forgery (CSRF); khắc phục bằng SameSite=Strict."
                ],
                correctAnswer: 1,
                explanation: "Đây là lỗ hổng DOM-based Cross-Site Scripting (DOM XSS). Nguồn dữ liệu (Source) là location.search và đích thực thi (Sink) là innerHTML mà không qua làm sạch (sanitization). Biện pháp triệt để là sử dụng textContent (chỉ gán text, không thực thi HTML) hoặc các thư viện làm sạch chuyên dụng như DOMPurify."
            },
            {
                id: 3,
                category: "Network Defense",
                question: "Kỹ thuật phòng vệ nào sau đây được sử dụng tại tầng Switch L2 để ngăn chặn các cuộc tấn công giả mạo bản tin ARP Reply nhằm chiếm đoạt luồng truyền thông (ARP Cache Poisoning / MITM)?",
                codeSnippet: `Host A (192.168.1.10) <---> [Switch L2] <---> Gateway (192.168.1.1)
                                      ^
                                Attacker (192.168.1.50) sends gratuitous ARP!`,
                options: [
                    "Port Fast & BPDU Guard",
                    "Dynamic ARP Inspection (DAI) kết hợp với DHCP Snooping Binding Table",
                    "Spanning Tree Protocol (STP) 802.1D",
                    "IP Source Guard chỉ độc lập với Access Control Lists"
                ],
                correctAnswer: 1,
                explanation: "Dynamic ARP Inspection (DAI) kiểm tra tính hợp lệ của tất cả các gói tin ARP trong mạng VLAN bằng cách đối chiếu địa chỉ IP-MAC với cơ sở dữ liệu DHCP Snooping Binding Table. Nếu bản tin ARP không khớp hoặc là giả mạo, Switch sẽ loại bỏ ngay lập tức."
            },
            {
                id: 4,
                category: "Authentication",
                question: "Trong kiến trúc xác thực OAuth 2.0 dành cho ứng dụng Single Page Application (SPA) hoặc ứng dụng di động công khai (Public Client), chuẩn mở rộng nào được khuyến nghị bắt buộc thay thế cho Implicit Flow nhằm chống lại tấn công đánh cắp Authorization Code?",
                codeSnippet: `+-------------------+        +---------------------+
|   SPA (Browser)   | -----> | Authorization Server|
| Code Verifier &   |        | Code Challenge =    |
| Code Challenge    | <----- | SHA256(Verifier)    |
+-------------------+        +---------------------+`,
                options: [
                    "Proof Key for Code Exchange (PKCE)",
                    "Resource Owner Password Credentials Grant (ROPC)",
                    "Client Credentials Grant",
                    "SAML 2.0 Web Browser SSO"
                ],
                correctAnswer: 0,
                explanation: "RFC 7636 định nghĩa PKCE (Proof Key for Code Exchange). Vì SPA và Mobile app không thể lưu giữ bí mật Client Secret một cách an toàn, PKCE tạo ra code_verifier và code_challenge (băm SHA-256) động cho mỗi lượt xác thực, ngăn chặn kẻ trung gian chiếm đoạt Authorization Code."
            },
            {
                id: 5,
                category: "Binary & System Security",
                question: "Cơ chế bảo vệ hệ điều hành nào thực hiện xáo trộn ngẫu nhiên vị trí các phân vùng bộ nhớ (Stack, Heap, Libraries/Text) mỗi khi chương trình được nạp vào RAM nhằm vô hiệu hóa các exploit sử dụng địa chỉ hàm cố định (như Return-to-libc hoặc ROP Chain)?",
                codeSnippet: `Run 1: libc printf() at 0x7fff5f82a100
Run 2: libc printf() at 0x7fff4a21e420
Run 3: libc printf() at 0x7fff6c981880`,
                options: [
                    "Data Execution Prevention (DEP / NX bit)",
                    "Stack Smashing Protector (Stack Canary / __stack_chk_guard)",
                    "Address Space Layout Randomization (ASLR / PIE)",
                    "Control Flow Integrity (CFI)"
                ],
                correctAnswer: 2,
                explanation: "ASLR (Address Space Layout Randomization) ngẫu nhiên hóa vị trí không gian bộ nhớ của tiến trình. Khi kết hợp với PIE (Position Independent Executable), kẻ tấn công không thể hardcode sẵn địa chỉ các hàm hệ thống trong shellcode hoặc ROP gadget."
            },
            {
                id: 6,
                category: "Cryptography",
                question: "Chế độ mã hóa khối (Block Cipher Mode) nào sau đây vừa cung cấp tính bảo mật dữ liệu (Confidentiality) vừa tích hợp sẵn tính toàn vẹn và xác thực nguồn gốc thông điệp (Authenticity - AEAD) với hiệu năng xử lý song song cao?",
                codeSnippet: `C = Encrypt(K, P) + AuthTag = GHASH(H, A, C)`,
                options: [
                    "Electronic Codebook (ECB)",
                    "Cipher Block Chaining (CBC)",
                    "Galois/Counter Mode (AES-GCM)",
                    "Output Feedback (OFB)"
                ],
                correctAnswer: 2,
                explanation: "AES-GCM (Galois/Counter Mode) là thuật toán mã hóa có xác thực (AEAD). Nó sử dụng chế độ Counter (CTR) cho mã hóa với khả năng tính toán song song phần cứng cực nhanh và sử dụng phép nhân trên trường hữu hạn Galois GHASH để tạo thẻ xác thực (Auth Tag)."
            },
            {
                id: 7,
                category: "Web Security",
                question: "Cấu hình HTTP Response Header nào sau đây bảo vệ trình duyệt của người dùng khỏi tấn công Clickjacking bằng cách cấm hoàn toàn việc nhúng trang web vào thẻ <iframe> hoặc <frame> từ bất kỳ domain nào?",
                codeSnippet: `HTTP/1.1 200 OK
Content-Type: text/html
...`,
                options: [
                    "Content-Security-Policy: frame-ancestors 'none'; hoặc X-Frame-Options: DENY",
                    "X-Content-Type-Options: nosniff",
                    "Access-Control-Allow-Origin: *",
                    "Referrer-Policy: no-referrer-when-downgrade"
                ],
                correctAnswer: 0,
                explanation: "'frame-ancestors 'none'' trong CSP (chuẩn hiện đại) hoặc 'X-Frame-Options: DENY' (chuẩn tương thích cũ) ngăn chặn mọi nỗ lực render trang web bên trong iframe của kẻ tấn công, triệt tiêu nguy cơ Clickjacking."
            },
            {
                id: 8,
                category: "Network Protocols",
                question: "Trong cuộc tấn công TCP SYN Flood, máy chủ bị cạn kiệt tài nguyên bộ nhớ do hàng triệu kết nối bán mở (Half-open connections) nằm trong hàng đợi SYN Backlog. Giải pháp nào phía Kernel giúp máy chủ xử lý kết nối mà không cần cấp phát cấu trúc bộ nhớ TCP Control Block cho đến khi nhận được gói tin ACK cuối cùng?",
                codeSnippet: `Client (Spoofed IPs) ---- SYN ----> Server (Queue Full!)
Server <--- ACK (with Cookie decoded) --- Client`,
                options: [
                    "TCP Window Scaling",
                    "SYN Cookies (syncookies = 1)",
                    "Path MTU Discovery",
                    "Selective Acknowledgment (SACK)"
                ],
                correctAnswer: 1,
                explanation: "SYN Cookies mã hóa thông tin trạng thái kết nối (ISN) thành một giá trị băm mật mã gửi lại trong gói SYN-ACK. Máy chủ không hề phân bổ bộ nhớ cho kết nối này cho đến khi nhận được gói tin ACK phản hồi mang giá trị Sequence Number hợp lệ."
            },
            {
                id: 9,
                category: "Malware & Forensics",
                question: "Kỹ thuật 'Process Hollowing' thường được các chủng mã độc nâng cao (APT / Stealer) sử dụng nhằm mục đích gì?",
                codeSnippet: `1. CreateProcess(target.exe, CREATE_SUSPENDED)
2. ZwUnmapViewOfSection(target)
3. VirtualAllocEx + WriteProcessMemory(malicious_code)
4. SetThreadContext + ResumeThread()`,
                options: [
                    "Mã hóa toàn bộ phân vùng ổ đĩa bằng khóa đối xứng và ghi đè Master Boot Record.",
                    "Khởi tạo một tiến trình hệ thống hợp lệ ở trạng thái tạm dừng, rỗng hóa vùng nhớ gốc và thay thế bằng mã độc để ẩn mình dưới vỏ bọc tiến trình sạch.",
                    "Lắng nghe cổng mạng ngẫu nhiên và gửi tín hiệu beacon định kỳ tới máy chủ C2 qua DNS Tunneling.",
                    "Quét các cổng dịch vụ RDP yếu mật khẩu trong mạng LAN để lây lan tự động."
                ],
                correctAnswer: 1,
                explanation: "Process Hollowing là kỹ thuật code injection tinh vi: mã độc tạo một tiến trình sạch (như svchost.exe hay explorer.exe) với cờ CREATE_SUSPENDED, hủy phân vùng bộ nhớ của file thực thi gốc, tiêm mã độc vào đó rồi Resume Thread. Nhờ vậy trình quản lý tác vụ Task Manager chỉ nhìn thấy tiến trình hệ thống hợp lệ."
            },
            {
                id: 10,
                category: "Cloud Security",
                question: "Theo nguyên tắc 'Least Privilege' (Quyền tối thiểu) trong quản trị danh tính AWS IAM, chính sách (IAM Policy) nào sau đây được coi là an toàn và tuân thủ chuẩn kiểm toán nhất?",
                codeSnippet: `{
  "Version": "2012-10-17",
  "Statement": [...]
}`,
                options: [
                    "Statement: { Effect: 'Allow', Action: '*', Resource: '*' }",
                    "Statement: { Effect: 'Allow', Action: ['s3:GetObject'], Resource: 'arn:aws:s3:::prod-customer-reports/*' }",
                    "Statement: { Effect: 'Allow', Action: ['iam:*'], Resource: '*' }",
                    "Statement: { Effect: 'Allow', Action: ['s3:*'], Resource: '*' }"
                ],
                correctAnswer: 1,
                explanation: "Chính sách an toàn chỉ cấp duy nhất hành động cần thiết ('s3:GetObject') trên đúng tài nguyên cụ thể ('arn:aws:s3:::prod-customer-reports/*') thay vì sử dụng ký tự đại diện wildcard (*) cho hành động hoặc tài nguyên."
            },
            {
                id: 11,
                category: "Web Security",
                question: "Để phòng chống tấn công Cross-Site Request Forgery (CSRF), giải pháp nào sau đây ở cấp độ Cookie của trình duyệt được xem là hiệu quả và tiện lợi nhất hiện nay?",
                codeSnippet: `Set-Cookie: session_id=xyz987abc; Secure; HttpOnly; SameSite=...`,
                options: [
                    "Thiết lập thuộc tính SameSite=Strict hoặc SameSite=Lax",
                    "Thiết lập thuộc tính Domain=.google.com",
                    "Thiết lập Max-Age=31536000",
                    "Bỏ qua cờ Secure để cho phép kết nối HTTP thường"
                ],
                correctAnswer: 0,
                explanation: "Thuộc tính 'SameSite=Strict' hoặc 'SameSite=Lax' trên Cookie ngăn trình duyệt tự động gửi cookie xác thực trong các yêu cầu chuyển hướng bắt nguồn từ trang web bên thứ ba (cross-site), loại bỏ tận gốc nguyên lý tấn công CSRF."
            },
            {
                id: 12,
                category: "Network Defense",
                question: "Trong giao thức phân giải tên miền DNS, lỗ hổng 'Kaminsky Attack' (DNS Cache Poisoning) được khắc phục căn bản nhất thông qua công nghệ tiêu chuẩn nào?",
                codeSnippet: `Dig query: example.com
Answers include RRSIG and DNSKEY records...`,
                options: [
                    "DNSSEC (Domain Name System Security Extensions) sử dụng chữ ký số mật mã",
                    "Tăng thời gian TTL (Time To Live) của bản ghi A lên mức tối đa",
                    "Chỉ sử dụng DNS qua cổng UDP 53 với cố định Source Port",
                    "Sử dụng giao thức NetBIOS over TCP/IP"
                ],
                correctAnswer: 0,
                explanation: "DNSSEC bổ sung xác thực nguồn gốc và kiểm tra toàn vẹn cho dữ liệu DNS bằng chữ ký mật mã khóa công khai (RRSIG, DNSKEY, DS). Máy chủ DNS đệ trình có thể kiểm chứng xem bản tin phản hồi có thực sự xuất phát từ máy chủ ủy quyền có thẩm quyền hay không."
            },
            {
                id: 13,
                category: "Reverse Engineering",
                question: "Trong quy ước gọi hàm chuẩn x86-64 trên hệ điều hành Linux (System V AMD64 ABI), 6 tham số số nguyên đầu tiên được truyền qua các thanh ghi theo thứ tự nào sau đây?",
                codeSnippet: `int calculate(int a, int b, int c, int d, int e, int f);`,
                options: [
                    "RDI, RSI, RDX, RCX, R8, R9",
                    "RAX, RBX, RCX, RDX, RSI, RDI",
                    "RCX, RDX, R8, R9, R10, R11",
                    "Toàn bộ tham số được push trực tiếp vào Stack từ phải sang trái"
                ],
                correctAnswer: 0,
                explanation: "System V AMD64 ABI quy định 6 tham số số nguyên/con trỏ đầu tiên được chuyển qua các thanh ghi theo thứ tự: RDI, RSI, RDX, RCX, R8, R9. Các tham số thứ 7 trở đi mới được truyền qua ngăn xếp (Stack)."
            },
            {
                id: 14,
                category: "Database Security",
                question: "Tại sao kỹ thuật 'Prepared Statements' (Parameterized Queries) lại vô hiệu hóa hoàn toàn lỗ hổng SQL Injection?",
                codeSnippet: `String query = "SELECT * FROM users WHERE username = ? AND password = ?";
PreparedStatement pstmt = connection.prepareStatement(query);
pstmt.setString(1, userInput);`,
                options: [
                    "Nó mã hóa toàn bộ dữ liệu đầu vào bằng thuật toán AES-256 trước khi lưu.",
                    "Nó tách rời pha biên dịch cú pháp SQL và pha nạp dữ liệu tham số; dữ liệu do người dùng nhập luôn được coi là giá trị đơn thuần (literal data) chứ không thể thay đổi cây cú pháp truy vấn.",
                    "Nó chạy một Web Application Firewall nội tại bên trong Engine cơ sở dữ liệu.",
                    "Nó chỉ chấp nhận các ký tự chữ cái và số (alphanumeric)."
                ],
                correctAnswer: 1,
                explanation: "Khi sử dụng Prepared Statements, câu lệnh SQL được biên dịch và tối ưu trước thành cấu trúc cây trừu tượng (AST). Khi tham số được truyền vào, database engine coi nó là giá trị dữ liệu thuần túy (data parameter), không thể can thiệp làm thay đổi cấu trúc luận lý của câu lệnh."
            },
            {
                id: 15,
                category: "Identity & Access",
                question: "Giao thức xác thực Kerberos trong mạng Active Directory sử dụng loại token vé (ticket) nào do Key Distribution Center (KDC) cấp để người dùng có thể yêu cầu truy cập các dịch vụ cụ thể mà không cần nhập lại mật khẩu?",
                codeSnippet: `User -> AS Request -> AS Reply (TGT) -> TGS Request -> TGS Reply (Service Ticket)`,
                options: [
                    "Ticket Granting Ticket (TGT) và Service Ticket (TGS Ticket)",
                    "JWT (JSON Web Token) với thuật toán HS256",
                    "OAuth Bearer Token",
                    "NTLM Response Hash"
                ],
                correctAnswer: 0,
                explanation: "Kerberos sử dụng KDC gồm Authentication Service (AS) cấp vé TGT (Ticket Granting Ticket) sau khi xác thực ban đầu, và Ticket Granting Service (TGS) sẽ dựa vào TGT để cấp Service Ticket cho từng dịch vụ cụ thể trong domain."
            },
            {
                id: 16,
                category: "Zero Trust & Architecture",
                question: "Nguyên lý cốt lõi nào sau đây mô tả đúng nhất triết lý của mô hình Kiến Trúc Không Tin Cậy (Zero Trust Architecture - NIST SP 800-207)?",
                codeSnippet: `Perimeter: Trust outside = Untrusted, Trust inside = Full Access (Traditional)
Zero Trust: Never trust, Always verify!`,
                options: [
                    "Tin cậy tuyệt đối tất cả các thiết bị nằm bên trong mạng nội bộ LAN của doanh nghiệp.",
                    "Không tin tưởng bất kỳ ai theo mặc định; bắt buộc xác thực và cấp quyền liên tục dựa trên bối cảnh cho mọi yêu cầu truy cập, bất kể vị trí thiết bị nằm trong hay ngoài mạng.",
                    "Chỉ bảo vệ bằng tường lửa thế hệ mới (NGFW) tại biên giới mạng mà không cần mã hóa bên trong.",
                    "Sử dụng mạng riêng ảo VPN để tự động cấp quyền truy cập toàn bộ tài nguyên cho nhân viên làm việc từ xa."
                ],
                correctAnswer: 1,
                explanation: "Nguyên tắc nền tảng của Zero Trust là 'Never Trust, Always Verify' (Không bao giờ tin tưởng, luôn luôn xác minh). Vị trí mạng nội bộ không còn là tiêu chí tin cậy; mọi thực thể phải được xác thực, định danh, kiểm tra trạng thái an toàn thiết bị và cấp quyền truy cập theo ngữ cảnh."
            },
            {
                id: 17,
                category: "Forensics & Incident Response",
                question: "Theo quy trình phản ứng sự cố an ninh mạng của NIST SP 800-61, thứ tự chuẩn của 4 pha chính trong vòng đời phản ứng sự cố là gì?",
                codeSnippet: `Preparation -> [ ? ] -> [ ? ] -> Post-Incident Activity`,
                options: [
                    "Preparation -> Detection & Analysis -> Containment, Eradication & Recovery -> Post-Incident Activity",
                    "Detection -> Eradication -> Preparation -> Legal Action",
                    "Containment -> Investigation -> Recovery -> Prevention",
                    "Forensics -> Patching -> Reporting -> Deployment"
                ],
                correctAnswer: 0,
                explanation: "Vòng đời xử lý sự cố chuẩn NIST SP 800-61 bao gồm 4 giai đoạn: 1. Preparation (Chuẩn bị), 2. Detection & Analysis (Phát hiện & Phân tích), 3. Containment, Eradication & Recovery (Ngăn chặn, Triệt phá & Khôi phục), 4. Post-Incident Activity (Tổng kết & Bài học kinh nghiệm)."
            },
            {
                id: 18,
                category: "Cryptography",
                question: "Tại sao thuật toán băm mật mã SHA-1 và MD5 hiện nay bị cấm tuyệt đối trong việc tạo chữ ký số và chứng chỉ bảo mật số X.509?",
                codeSnippet: `Collision Attack Demo:
File A (clean) != File B (malicious)
MD5(File A) == MD5(File B)`,
                options: [
                    "Do chúng có kích thước digest quá lớn làm chậm mạng máy tính.",
                    "Do đã bị phá vỡ tính kháng va chạm (Collision Resistance), cho phép kẻ tấn công tạo 2 thông điệp khác nhau có cùng giá trị băm trong thời gian khả thi.",
                    "Do các thuật toán này là mã nguồn đóng và yêu cầu trả phí bản quyền.",
                    "Do chúng chỉ hoạt động được trên hệ điều hành 32-bit."
                ],
                correctAnswer: 1,
                explanation: "Cả MD5 và SHA-1 đều đã bị các nhà nghiên cứu chứng minh thực nghiệm thành công tấn công va chạm (Collision Attack - điển hình là cuộc tấn công SHAttered năm 2017 với SHA-1). Kẻ tấn công có thể tạo ra chứng chỉ số giả mạo có cùng mã băm với chứng chỉ hợp lệ."
            },
            {
                id: 19,
                category: "Web Security",
                question: "Kỹ thuật tấn công Server-Side Request Forgery (SSRF) nguy hiểm nhất khi ứng dụng web chạy trong môi trường điện toán đám mây (AWS/GCP/Azure) vì kẻ tấn công có thể lạm dụng để truy cập vào địa chỉ nội bộ nào sau đây nhằm đánh cắp thông tin xác thực tạm thời?",
                codeSnippet: `GET /proxy?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/`,
                options: [
                    "Dịch vụ phân giải tên miền công cộng 8.8.8.8",
                    "Dịch vụ Metadata cục bộ (Instance Metadata Service - IMDS tại IP link-local 169.254.169.254)",
                    "Cổng mặc định của Switch biên 192.168.0.1",
                    "Máy chủ đồng bộ thời gian NTP 127.0.0.1"
                ],
                correctAnswer: 1,
                explanation: "Trong môi trường Cloud, địa chỉ Link-local 169.254.169.254 cung cấp dịch vụ Instance Metadata Service (IMDS). Khi có lỗ hổng SSRF, kẻ tấn công có thể ép máy chủ gọi đến URL này để lấy IAM Token, Secret Access Key của Role gán cho máy chủ đó."
            },
            {
                id: 20,
                category: "Network Routing",
                question: "Cơ chế bảo mật nào được triển khai cho giao thức định tuyến BGP giữa các nhà mạng viễn thông (Autonomous Systems) nhằm ngăn chặn việc công bố sai dải IP (BGP Route Hijacking) thông qua việc sử dụng hạ tầng khóa công khai để xác thực Route Origin Authorization (ROA)?",
                codeSnippet: `AS 13335 (Cloudflare) announces 1.1.1.0/24
Valid ROA signed by Cryptographic Trust Anchor...`,
                options: [
                    "Resource Public Key Infrastructure (RPKI)",
                    "OSPF MD5 Authentication",
                    "Border Router Keepalive Protocol",
                    "MPLS Traffic Engineering"
                ],
                correctAnswer: 0,
                explanation: "RPKI (Resource Public Key Infrastructure) là khung tiêu chuẩn bảo mật cho định tuyến BGP. Các tổ chức sở hữu dải IP ký số bản ghi ROA (Route Origin Authorization). Router BGP của các ISP khác sẽ kiểm tra chữ ký này để loại bỏ các tuyến định tuyến giả mạo (Route Hijack)."
            }
        ]
    },

    logic_dgnl: {
        id: "logic_dgnl",
        title: "Kỳ Thi Đánh Giá Năng Lực Đại Học Quốc Gia: Tư Duy Định Lượng & Khoa Học Máy Tính",
        code: "DGNL-LOGIC-2026",
        durationMinutes: 40,
        passPercentage: 65,
        instructions: "Đề thi gồm 15 câu hỏi tư duy logic, toán thuật toán và cấu trúc dữ liệu. Thí sinh làm bài độc lập, mọi hành vi rời màn hình hoặc can thiệp mã nguồn sẽ bị hủy bài thi.",
        questions: [
            {
                id: 1,
                category: "Algorithms & Complexity",
                question: "Thuật toán sắp xếp nào sau đây có độ phức tạp thời gian trong trường hợp xấu nhất (Worst-case) là O(n log n) và đồng thời là thuật toán sắp xếp ổn định (Stable Sort)?",
                codeSnippet: `T(n) = 2*T(n/2) + O(n)`,
                options: [
                    "Merge Sort",
                    "Quick Sort",
                    "Heap Sort",
                    "Selection Sort"
                ],
                correctAnswer: 0,
                explanation: "Merge Sort chia đôi mảng và gộp lại, luôn đảm bảo thời gian O(n log n) trong mọi trường hợp (best, average, worst) và giữ nguyên thứ tự tương đối của các phần tử bằng nhau (tính chất stable). Quick Sort worst-case là O(n²), còn Heap Sort không có tính chất stable."
            },
            {
                id: 2,
                category: "Probability & Bayes",
                question: "Một bệnh hiếm gặp xuất hiện ở 0.1% dân số (tỷ lệ 1/1000). Một xét nghiệm y tế có độ chính xác: nếu người có bệnh thì kết quả dương tính là 99% (True Positive); nếu người không có bệnh thì vẫn có 2% khả năng dương tính giả (False Positive). Một người ngẫu nhiên đi xét nghiệm nhận kết quả Dương Tính. Xác suất thực sự người đó mắc bệnh xấp xỉ bao nhiêu?",
                codeSnippet: `P(Bệnh|Dương tính) = P(Dương tính|Bệnh) * P(Bệnh) / P(Dương tính)`,
                options: [
                    "Xấp xỉ 4.7%",
                    "Xấp xỉ 99%",
                    "Xấp xỉ 50%",
                    "Xấp xỉ 97%"
                ],
                correctAnswer: 0,
                explanation: "Áp dụng định lý Bayes: P(B)=0.001, P(~B)=0.999. P(Dương|B)=0.99, P(Dương|~B)=0.02. Mẫu số P(Dương) = 0.99*0.001 + 0.02*0.999 = 0.00099 + 0.01998 = 0.02097. Tử số = 0.00099. Xác suất = 0.00099 / 0.02097 ≈ 0.0472 (tức khoảng 4.7%). Nghịch lý độ chính xác cơ bản (Base Rate Fallacy)."
            },
            {
                id: 3,
                category: "Data Structures",
                question: "Cho một cây nhị phân tìm kiếm cân bằng (AVL Tree). Nếu một nút cha có hệ số cân bằng (Balance Factor) là +2 và cây con bên trái có hệ số cân bằng là -1 (Trường hợp Left-Right - LR), thao tác xoay nào cần được thực hiện để tái lập trạng thái cân bằng?",
                codeSnippet: `      z (+2)
     /
    y (-1)
     \\
      x`,
                options: [
                    "Xoay trái tại nút con y, sau đó xoay phải tại nút gốc z (Left-Right Double Rotation)",
                    "Chỉ cần xoay phải 1 lần duy nhất tại nút z",
                    "Chỉ cần xoay trái 1 lần duy nhất tại nút y",
                    "Xoay phải tại y rồi xoay trái tại z"
                ],
                correctAnswer: 0,
                explanation: "Khi xảy ra mất cân bằng kiểu Left-Right (LR: nhánh trái bị nghiêng sang phải), thuật toán yêu cầu xoay trái (Left Rotation) tại nút y trước để biến thành trường hợp Left-Left (LL), sau đó xoay phải (Right Rotation) tại nút gốc z để cân bằng hoàn toàn cây."
            },
            {
                id: 4,
                category: "Discrete Mathematics",
                question: "Có bao nhiêu xâu nhị phân có độ dài 8 ký tự bắt đầu bằng '10' hoặc kết thúc bằng '00'?",
                codeSnippet: `Pattern A: 10xxxxxx
Pattern B: xxxxxx00`,
                options: [
                    "112 xâu",
                    "128 xâu",
                    "80 xâu",
                    "96 xâu"
                ],
                correctAnswer: 0,
                explanation: "Số xâu bắt đầu bằng '10': 2^(8-2) = 2^6 = 64. Số xâu kết thúc bằng '00': 2^(8-2) = 2^6 = 64. Số xâu thỏa mãn cả hai (10xxxx00): 2^(8-4) = 2^4 = 16. Theo nguyên lý bù trừ (Inclusion-Exclusion): 64 + 64 - 16 = 112 xâu."
            },
            {
                id: 5,
                category: "Operating Systems",
                question: "Bốn điều kiện cần để xảy ra bế tắc (Deadlock) trong hệ thống gồm: Mutual Exclusion, Hold and Wait, No Preemption và điều kiện thứ tư là gì?",
                codeSnippet: `P1 holds R1, requests R2
P2 holds R2, requests R1`,
                options: [
                    "Circular Wait (Chờ đợi vòng tròn)",
                    "Starvation (Đói tài nguyên)",
                    "Race Condition (Điều kiện tranh đua)",
                    "Priority Inversion (Đảo ngược quyền ưu tiên)"
                ],
                correctAnswer: 0,
                explanation: "Bốn điều kiện Coffman gây ra Deadlock gồm: 1. Loại trừ tương hỗ (Mutual Exclusion), 2. Giữ và chờ (Hold and Wait), 3. Không trưng dụng (No Preemption), và 4. Chờ đợi vòng tròn (Circular Wait - một chu trình khép kín các tiến trình chờ tài nguyên lẫn nhau)."
            },
            {
                id: 6,
                category: "Graph Theory",
                question: "Thuật toán Dijkstra dùng để tìm đường đi ngắn nhất từ một đỉnh nguồn đến tất cả các đỉnh khác trong đồ thị có trọng số có điều kiện bắt buộc nào đối với trọng số các cạnh?",
                codeSnippet: `edge(u, v) with weight w(u, v)`,
                options: [
                    "Tất cả trọng số các cạnh đều phải không âm (w ≥ 0)",
                    "Đồ thị phải là đồ thị vô hướng",
                    "Đồ thị không được có bất kỳ chu trình nào",
                    "Trọng số các cạnh phải là số nguyên chẵn"
                ],
                correctAnswer: 0,
                explanation: "Dijkstra dựa trên chiến lược tham lam (Greedy). Nếu tồn tại trọng số âm (negative weights), việc chọn đỉnh có khoảng cách nhỏ nhất ở bước hiện tại không còn đảm bảo là tối ưu toàn cục. Trường hợp có trọng số âm cần sử dụng thuật toán Bellman-Ford hoặc SPFA."
            },
            {
                id: 7,
                category: "Logic & Boolean Algebra",
                question: "Biểu thức logic !(A || (!B && C)) tương đương với biểu thức nào sau đây theo các định luật De Morgan?",
                codeSnippet: `NOT (A OR ((NOT B) AND C))`,
                options: [
                    "!A && (B || !C)",
                    "!A || (B && !C)",
                    "A && (!B || C)",
                    "!A && !B && !C"
                ],
                correctAnswer: 0,
                explanation: "Áp dụng De Morgan: !(A || X) = !A && !X, ở đây X = (!B && C). Tiếp tục phủ định X: !(!B && C) = !(!B) || !C = B || !C. Do đó biểu thức rút gọn là !A && (B || !C)."
            },
            {
                id: 8,
                category: "Database Design",
                question: "Một quan hệ (Relation) đạt chuẩn Dạng chuẩn 3 (3NF) khi và chỉ khi nó đã đạt Dạng chuẩn 2 (2NF) và thỏa mãn điều kiện nào sau đây?",
                codeSnippet: `R(A, B, C) where A -> B and B -> C (Transitive Dependency)`,
                options: [
                    "Không chứa bất kỳ phụ thuộc hàm bắc cầu (Transitive Dependency) nào từ thuộc tính không khóa vào khóa chính.",
                    "Tất cả các thuộc tính phải là số nguyên duy nhất.",
                    "Không chứa bất kỳ khóa ngoại (Foreign Key) nào liên kết sang bảng khác.",
                    "Chỉ có duy nhất một thuộc tính khóa chính đơn."
                ],
                correctAnswer: 0,
                explanation: "Dạng chuẩn 3 (3NF) yêu cầu lược đồ quan hệ đã ở 2NF và loại bỏ hoàn toàn các phụ thuộc bắc cầu giữa các thuộc tính không khóa (Non-prime attributes must not be transitively dependent on any candidate key)."
            },
            {
                id: 9,
                category: "Computer Architecture",
                question: "Trong kiến trúc vi xử lý hiện đại với kỹ thuật đường ống lệnh (Instruction Pipelining), loại xung đột (Hazard) nào xảy ra khi một lệnh phụ thuộc vào kết quả của một lệnh trước đó đang còn trong quá trình tính toán chưa ghi xong vào thanh ghi (Write Back)?",
                codeSnippet: `ADD R1, R2, R3   ; R1 = R2 + R3
SUB R4, R1, R5   ; Needs R1 immediately!`,
                options: [
                    "Data Hazard (Read After Write - RAW)",
                    "Structural Hazard (Xung đột phần cứng tài nguyên)",
                    "Control Hazard (Xung đột lệnh rẽ nhánh)",
                    "Page Fault Hazard"
                ],
                correctAnswer: 0,
                explanation: "Đây là Data Hazard, cụ thể là xung đột RAW (Read After Write). Lệnh thứ hai cần đọc dữ liệu từ R1 ngay lập tức trong khi lệnh thứ nhất chưa kịp hoàn tất pha ghi ngược dữ liệu. Các CPU giải quyết vấn đề này bằng kỹ thuật Forwarding/Bypassing hoặc chèn bọt (Stalling/Pipeline Bubble)."
            },
            {
                id: 10,
                category: "Algorithms & Strings",
                question: "Thuật toán tìm kiếm xâu con Knuth-Morris-Pratt (KMP) đạt độ phức tạp thời gian O(n + m) bằng cách sử dụng cấu trúc phụ trợ nào để tránh việc quay lui (backtracking) con trỏ trong chuỗi văn bản gốc?",
                codeSnippet: `Pattern: "ABABCABAB"
LPS Array (Longest Proper Prefix which is also Suffix)`,
                options: [
                    "Bảng tiền tố LPS (Longest Proper Prefix which is also Suffix / π table)",
                    "Cây tiền tố Trie",
                    "Bảng băm Rabin-Karp Rolling Hash",
                    "Ma trận kề đồ thị"
                ],
                correctAnswer: 0,
                explanation: "Thuật toán KMP tiền xử lý chuỗi mẫu (pattern) để tạo mảng LPS (π table). Mảng này lưu độ dài tiền tố thực sự dài nhất đồng thời là hậu tố của chuỗi con. Khi phát hiện ký tự không khớp, thuật toán tra cứu LPS để trượt con trỏ mẫu về vị trí thích hợp mà không cần lùi con trỏ chuỗi văn bản."
            },
            {
                id: 11,
                category: "Network & Transport",
                question: "Trường kích thước cửa sổ nhận (Receive Window - rwnd) trong TCP Header có chức năng chính là gì?",
                codeSnippet: `TCP Header: Source Port | Dest Port | Seq | Ack | rwnd = 65535`,
                options: [
                    "Điều khiển luồng (Flow Control) nhằm ngăn bên gửi truyền dữ liệu nhanh hơn khả năng giải phóng bộ đệm nhận của bên nhận.",
                    "Kiểm soát tắc nghẽn mạng (Congestion Control) giữa các router trung gian trên Internet.",
                    "Xác định thời gian Timeout trước khi truyền lại gói tin bị mất.",
                    "Mã hóa dữ liệu payload của tầng ứng dụng."
                ],
                correctAnswer: 0,
                explanation: "Receive Window (rwnd) được bên nhận thông báo cho bên gửi trong mỗi gói ACK nhằm mục đích Điều khiển luồng (Flow Control), đảm bảo bên gửi không bơm dữ liệu tràn bộ nhớ đệm (buffer overflow) của bên nhận."
            },
            {
                id: 12,
                category: "Discrete Mathematics",
                question: "Một đồ thị liên thông vô hướng G có 10 đỉnh và 15 cạnh. Khi tìm một Cây khung (Spanning Tree) của đồ thị này, cây khung đó sẽ có chính xác bao nhiêu cạnh?",
                codeSnippet: `Graph: V = 10, E = 15
Spanning Tree: V = 10, E_tree = ?`,
                options: [
                    "9 cạnh",
                    "10 cạnh",
                    "14 cạnh",
                    "15 cạnh"
                ],
                correctAnswer: 0,
                explanation: "Theo định nghĩa lý thuyết đồ thị, một cây (Tree) có V đỉnh thì luôn luôn có chính xác (V - 1) cạnh và không có chu trình. Cây khung của đồ thị có 10 đỉnh sẽ có đúng 10 - 1 = 9 cạnh."
            },
            {
                id: 13,
                category: "Algorithms",
                question: "Để giải bài toán Ba lô dạng nguyên 0/1 (0/1 Knapsack Problem) với N đồ vật và tải trọng W, phương pháp tiếp cận thuật toán tối ưu nhất là gì?",
                codeSnippet: `DP[i][w] = max(DP[i-1][w], DP[i-1][w - weight[i]] + value[i])`,
                options: [
                    "Quy hoạch động (Dynamic Programming) với độ phức tạp thời gian O(N*W)",
                    "Tham lam (Greedy) theo tỷ lệ giá trị/khối lượng luôn cho nghiệm tối ưu tuyệt đối",
                    "Chia để trị (Divide and Conquer) thời gian O(log N)",
                    "Tìm kiếm nhị phân theo giá trị trọng lượng"
                ],
                correctAnswer: 0,
                explanation: "Bài toán 0/1 Knapsack không thể giải tối ưu bằng thuật toán tham lam (Greedy chỉ giải được bài toán Ba lô phân số - Fractional Knapsack). Quy hoạch động (DP) với bảng trạng thái DP[i][w] cho kết quả chính xác trong thời gian giả đa thức O(N*W)."
            },
            {
                id: 14,
                category: "Data Structures",
                question: "Cấu trúc dữ liệu Disjoint Set Union (DSU / Find-Union) khi được tối ưu đồng thời bằng kỹ thuật 'Hợp nhất theo hạng' (Union by Rank) và 'Nén đường đi' (Path Compression) sẽ có độ phức tạp thời gian cho m thao tác trên n phần tử là bao nhiêu?",
                codeSnippet: `int find(int i) {
    if (parent[i] == i) return i;
    return parent[i] = find(parent[i]); // Path compression
}`,
                options: [
                    "O(m * α(n)), trong đó α là hàm ngược Ackermann tăng cực kỳ chậm (thực tế α(n) ≤ 4)",
                    "O(m * log n)",
                    "O(m * n)",
                    "O(m²)"
                ],
                correctAnswer: 0,
                explanation: "Khi kết hợp cả Union by Rank và Path Compression, độ phức tạp trung bình của DSU là O(α(n)) cho mỗi thao tác, trong đó α(n) là hàm ngược Ackermann. Với mọi giá trị n thực tế trong vũ trụ (kể cả n = 10^80), α(n) luôn nhỏ hơn 5, do đó thao tác thực thi gần như trong thời gian hằng số O(1)."
            },
            {
                id: 15,
                category: "Computer Systems",
                question: "Trong cấu trúc bộ nhớ ảo (Virtual Memory), hiện tượng 'Thrashing' xảy ra khi nào và hậu quả của nó đối với hiệu năng máy tính là gì?",
                codeSnippet: `CPU Utilization drops to ~1% while Disk I/O Queue shoots to 100%!`,
                options: [
                    "Xảy ra khi hệ thống dành phần lớn thời gian để tráo đổi trang (Page Swapping / Page Faults) giữa RAM và Ổ đĩa thay vì thực thi lệnh, khiến hiệu suất CPU giảm đột ngột về gần 0%.",
                    "Xảy ra khi thanh ghi CPU bị quá nhiệt do xung nhịp tăng cao.",
                    "Xảy ra khi bộ đệm L1 Cache bị hỏng dữ liệu do mất điện đột ngột.",
                    "Xảy ra khi card đồ họa GPU không thể render kịp khung hình."
                ],
                correctAnswer: 0,
                explanation: "Thrashing là trạng thái bão hòa nghiêm trọng khi tổng dung lượng Working Set của các tiến trình vượt quá dung lượng RAM vật lý có sẵn. Hệ điều hành liên tục gặp lỗi trang (Page Fault) và bận rộn nạp/ghi trang giữa RAM và Disk, khiến thông lượng CPU tụt dốc thảm hại."
            }
        ]
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EXAM_BANKS };
}
