/**
 * NETWORK TRAFFIC TRACKER & DEEP PACKET INSPECTION (DPI) ENGINE (V5.1)
 * Intercepts all browser network activity:
 * - window.fetch (monitored & payload inspect)
 * - XMLHttpRequest (open / send / status / strike enforcement)
 * - navigator.sendBeacon (asynchronous telemetry & exfiltration blocker)
 * - window.WebSocket (real-time streaming socket connection guard)
 * - window.EventSource (Server-Sent Events / SSE LLM streaming guard)
 * Logs full HTTP payloads, detects external AI API calls (OpenAI, Claude, DeepSeek, Gemini, Ollama, etc.),
 * inspects question payload exfiltration, and enforces proctor firewall rules.
 */

class TrafficTrackerEngine {
    constructor() {
        this.packets = [];
        this.subscribers = new Set();
        this.isMonitoring = false;
        this.heartbeatTimer = null;
        this.sequenceNumber = 1000;
        
        // Comprehensive AI & Exfiltration Blacklist Signatures
        this.aiBlacklist = [
            { pattern: /api\.openai\.com/i, name: "OpenAI API (ChatGPT/GPT-4o)" },
            { pattern: /chatgpt\.com/i, name: "ChatGPT Web Interface" },
            { pattern: /anthropic\.com/i, name: "Anthropic Claude API" },
            { pattern: /claude\.ai/i, name: "Claude Web Interface" },
            { pattern: /deepseek\.com/i, name: "DeepSeek AI API & Chat" },
            { pattern: /generativelanguage\.googleapis\.com/i, name: "Google Gemini AI API" },
            { pattern: /perplexity\.ai/i, name: "Perplexity AI Search" },
            { pattern: /cohere\.ai/i, name: "Cohere Generative API" },
            { pattern: /groq\.com/i, name: "Groq LPU Inference API" },
            { pattern: /mistral\.ai/i, name: "Mistral AI API" },
            { pattern: /openrouter\.ai/i, name: "OpenRouter Multi-LLM API" },
            { pattern: /poe\.com/i, name: "Poe AI Platform" },
            { pattern: /replicate\.com/i, name: "Replicate Inference API" },
            { pattern: /together\.(xyz|ai)/i, name: "Together AI Platform" },
            { pattern: /(localhost|127\.0\.0\.1):11434/i, name: "Ollama Local AI Server (Port 11434)" },
            { pattern: /(localhost|127\.0\.0\.1):1234/i, name: "LM Studio Local LLM (Port 1234)" },
            { pattern: /(localhost|127\.0\.0\.1):8000/i, name: "Local vLLM / FastChat API (Port 8000)" },
            { pattern: /(localhost|127\.0\.0\.1):5000/i, name: "LocalAI / Text-Gen-WebUI (Port 5000)" },
            { pattern: /discord(app)?\.com\/api\/webhooks/i, name: "Discord Webhook Exfiltration" },
            { pattern: /api\.telegram\.org/i, name: "Telegram Bot Exfiltration" },
            { pattern: /webhook\.site/i, name: "Webhook.site Data Leaker" },
            { pattern: /pastebin\.com/i, name: "Pastebin Data Drop" },
            { pattern: /pipedream\.net/i, name: "Pipedream Webhook Exfiltration" },
            { pattern: /requestbin/i, name: "RequestBin Data Leaker" },
            { pattern: /(ngrok\.io|localtunnel\.me|trycloudflare\.com)/i, name: "Reverse Tunnel Exfiltration Proxy" }
        ];

        // Store original native implementations
        this._nativeFetch = window.fetch ? window.fetch.bind(window) : null;
        this._nativeXHROpen = XMLHttpRequest.prototype.open;
        this._nativeXHRSend = XMLHttpRequest.prototype.send;
        this._nativeSendBeacon = navigator.sendBeacon ? navigator.sendBeacon.bind(navigator) : null;
        this._nativeWebSocket = window.WebSocket;
        this._nativeEventSource = window.EventSource;
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    _notify(packet) {
        this.subscribers.forEach(cb => {
            try { cb(packet); } catch(e) { console.error("Traffic subscriber error:", e); }
        });
    }

    start() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        this._installFetchInterceptor();
        this._installXHRInterceptor();
        this._installBeaconInterceptor();
        this._installWebSocketInterceptor();
        this._installEventSourceInterceptor();
        this._startHeartbeatLoop();
        this.logInternal("INIT", "/sys/traffic-tracker", "ONLINE", "Proctor DPI Deep Network Interceptor active (Fetch, XHR, Beacon, WS, SSE)");
    }

    stop() {
        this.isMonitoring = false;
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /* ------------------------------------------------------------
       PAYLOAD EXFILTRATION & BLACKLIST INSPECTION
    ------------------------------------------------------------ */

    _checkBlacklist(url) {
        if (!url) return null;
        const strUrl = String(url);
        for (const item of this.aiBlacklist) {
            if (item.pattern.test(strUrl)) {
                return item;
            }
        }
        return null;
    }

    /**
     * Inspect outbound request payload to detect candidate attempting to exfiltrate
     * exam questions, options, or test tokens.
     */
    _inspectPayload(payload) {
        if (!payload || typeof payload !== "string") return null;
        const text = payload.toLowerCase();

        // Check for current question leak
        if (window.app && window.app.currentExam) {
            const currentQ = window.app.currentExam.questions[window.app.currentIndex];
            if (currentQ) {
                const qSub = currentQ.question.substring(0, 30).toLowerCase();
                if (text.includes(qSub)) {
                    return `Phát hiện gửi lậu đề thi đang làm: "${currentQ.question.substring(0, 45)}..."`;
                }
            }
        }

        // Generic exam exfiltration keywords
        const leakSignatures = [
            "tls 1.3", "perfect forward secrecy", "stored xss", "dom-based xss", 
            "dynamic arp inspection", "oauth 2.0", "aslr", "b23dccn001", "sec-pro-2026",
            "cheat_violation_confirmed", "solve this question", "giải câu hỏi này"
        ];

        for (const sig of leakSignatures) {
            if (text.includes(sig)) {
                return `Dữ liệu chứa từ khóa đề thi / tài liệu mật: [${sig}]`;
            }
        }

        return null;
    }

    /* ------------------------------------------------------------
       1. DEEP PACKET INTERCEPTION: FETCH
    ------------------------------------------------------------ */

    _installFetchInterceptor() {
        const self = this;
        const monitoredFetch = async function(resource, init = {}) {
            if (!self.isMonitoring) {
                return self._nativeFetch ? self._nativeFetch(resource, init) : fetch(resource, init);
            }

            const startTime = performance.now();
            const url = typeof resource === 'string' ? resource : (resource.url || String(resource));
            const method = (init.method || 'GET').toUpperCase();
            const body = init.body ? (typeof init.body === 'string' ? init.body : '[Binary/Object Payload]') : null;
            const headers = init.headers ? (typeof init.headers === 'object' ? JSON.stringify(init.headers) : String(init.headers)) : "{}";

            // Check AI / Malicious Exfiltration Signature
            const blacklistMatch = self._checkBlacklist(url);
            const leakReason = self._inspectPayload(body);

            if (blacklistMatch || leakReason) {
                const threatDesc = blacklistMatch ? `Phát hiện gọi API AI ngoại lai: ${blacklistMatch.name}` : `DPI CẢNH BÁO: ${leakReason}`;
                const threatScore = blacklistMatch ? 50 : 40;

                const packet = self._createPacket({
                    protocol: "FETCH",
                    method,
                    url,
                    payload: body,
                    headers,
                    status: 403,
                    statusText: "FIREWALL_BLOCKED",
                    latency: 1,
                    threatLevel: "CRITICAL",
                    threatReason: threatDesc
                });

                if (window.antiCheatEngine && window.antiCheatEngine.isActive) {
                    window.antiCheatEngine._logViolation("AI_NETWORK_EXFILTRATION_BLOCKED", "CRITICAL", 
                        `TƯỜNG LỬA CHẶN TRUY CẬP (${method} ${url}): ${threatDesc}`, threatScore);
                    window.antiCheatEngine.addStrike(`Cố gắng sử dụng mạng gọi AI giải đề / phát tán đề thi (${blacklistMatch ? blacklistMatch.name : 'Data Exfiltration'})`);
                }

                return new Response(JSON.stringify({
                    error: "BLOCKED_BY_PROCTOR_FIREWALL",
                    message: "Mọi kết nối tới dịch vụ AI và dịch vụ ngoài đều bị giám sát và cấm tuyệt đối.",
                    endpoint: blacklistMatch ? blacklistMatch.name : "EXFILTRATION_PREVENTED",
                    details: threatDesc
                }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json', 'X-Proctor-Firewall': 'BLOCKED' }
                });
            }

            // Internal simulated endpoints (e.g. /api/v1/...)
            try {
                if (url.startsWith("/api/v1/")) {
                    const latency = Math.floor(Math.random() * 25) + 15;
                    const responseData = self._handleMockBackend(url, method, body);
                    self._createPacket({
                        protocol: "FETCH",
                        method,
                        url,
                        payload: body,
                        headers,
                        status: 200,
                        statusText: "OK",
                        latency,
                        threatLevel: "CLEAN",
                        threatReason: "Internal Proctor Telemetry Stream"
                    });
                    return new Response(JSON.stringify(responseData), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                // Genuine external request
                const response = await self._nativeFetch(resource, init);
                const latency = Math.round(performance.now() - startTime);
                self._createPacket({
                    protocol: "FETCH",
                    method,
                    url,
                    payload: body,
                    headers,
                    status: response.status,
                    statusText: response.statusText,
                    latency,
                    threatLevel: response.status >= 400 ? "WARN" : "CLEAN",
                    threatReason: response.status >= 400 ? `HTTP ${response.status} External Response` : "Authorized Network Call"
                });
                return response;
            } catch (err) {
                const latency = Math.round(performance.now() - startTime);
                self._createPacket({
                    protocol: "FETCH",
                    method,
                    url,
                    payload: body,
                    headers,
                    status: 0,
                    statusText: "FAILED",
                    latency,
                    threatLevel: "WARN",
                    threatReason: `Connection Error: ${err.message}`
                });
                throw err;
            }
        };

        monitoredFetch.__proctor_monitored = true;
        window.fetch = monitoredFetch;
    }

    /* ------------------------------------------------------------
       2. DEEP PACKET INTERCEPTION: XHR
    ------------------------------------------------------------ */

    _installXHRInterceptor() {
        const self = this;
        const originalOpen = this._nativeXHROpen;
        const originalSend = this._nativeXHRSend;

        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._proctorData = {
                method: method.toUpperCase(),
                url: String(url),
                startTime: 0,
                headers: {}
            };
            return originalOpen.call(this, method, url, ...args);
        };
        XMLHttpRequest.prototype.open.__proctor_monitored = true;

        XMLHttpRequest.prototype.send = function(body) {
            if (this._proctorData) {
                this._proctorData.startTime = performance.now();
                this._proctorData.payload = body ? String(body) : null;

                const blacklistMatch = self._checkBlacklist(this._proctorData.url);
                const leakReason = self._inspectPayload(this._proctorData.payload);

                if (blacklistMatch || leakReason) {
                    const threatDesc = blacklistMatch ? `AI Service Blocked: ${blacklistMatch.name}` : `DPI Leaked: ${leakReason}`;
                    
                    if (window.antiCheatEngine && window.antiCheatEngine.isActive) {
                        window.antiCheatEngine._logViolation("AI_XHR_EXFILTRATION_BLOCKED", "CRITICAL",
                            `Chặn yêu cầu XHR trái phép (${this._proctorData.method} ${this._proctorData.url}): ${threatDesc}`, 50);
                        window.antiCheatEngine.addStrike(`Cố gắng sử dụng XHR gọi AI giải đề (${blacklistMatch ? blacklistMatch.name : 'Exfiltration'})`);
                    }

                    self._createPacket({
                        protocol: "XHR",
                        method: this._proctorData.method,
                        url: this._proctorData.url,
                        payload: this._proctorData.payload,
                        status: 403,
                        statusText: "FIREWALL_BLOCKED",
                        latency: 1,
                        threatLevel: "CRITICAL",
                        threatReason: threatDesc
                    });
                    
                    this.abort();
                    return;
                }

                this.addEventListener("loadend", () => {
                    const latency = Math.round(performance.now() - this._proctorData.startTime);
                    self._createPacket({
                        protocol: "XHR",
                        method: this._proctorData.method,
                        url: this._proctorData.url,
                        payload: this._proctorData.payload,
                        status: this.status,
                        statusText: this.statusText || "DONE",
                        latency,
                        threatLevel: this.status >= 400 ? "WARN" : "CLEAN",
                        threatReason: "Standard XHR Request"
                    });
                });
            }
            return originalSend.call(this, body);
        };
        XMLHttpRequest.prototype.send.__proctor_monitored = true;
    }

    /* ------------------------------------------------------------
       3. DEEP PACKET INTERCEPTION: SEND BEACON
    ------------------------------------------------------------ */

    _installBeaconInterceptor() {
        if (!navigator.sendBeacon) return;
        const self = this;
        const originalSendBeacon = this._nativeSendBeacon;

        navigator.sendBeacon = function(url, data) {
            const strUrl = String(url);
            const strPayload = data ? (typeof data === 'string' ? data : (data instanceof Blob ? '[Blob Data]' : '[Beacon Payload]')) : null;

            const blacklistMatch = self._checkBlacklist(strUrl);
            const leakReason = self._inspectPayload(strPayload);

            if (blacklistMatch || leakReason) {
                const threatDesc = blacklistMatch ? `Beacon AI Service Blocked: ${blacklistMatch.name}` : `Beacon Data Leak: ${leakReason}`;
                
                if (window.antiCheatEngine && window.antiCheatEngine.isActive) {
                    window.antiCheatEngine._logViolation("AI_BEACON_EXFILTRATION_BLOCKED", "CRITICAL",
                        `Chặn beacon phát tán dữ liệu tới ${strUrl}`, 50);
                    window.antiCheatEngine.addStrike(`Cố gắng dùng navigator.sendBeacon gửi đề ra ngoài (${blacklistMatch ? blacklistMatch.name : 'Beacon Leak'})`);
                }

                self._createPacket({
                    protocol: "BEACON",
                    method: "POST",
                    url: strUrl,
                    payload: strPayload,
                    status: 403,
                    statusText: "FIREWALL_BLOCKED",
                    latency: 1,
                    threatLevel: "CRITICAL",
                    threatReason: threatDesc
                });
                return false; // Beacon rejected
            }

            self._createPacket({
                protocol: "BEACON",
                method: "POST",
                url: strUrl,
                payload: strPayload,
                status: 200,
                statusText: "QUEUED",
                latency: 1,
                threatLevel: "CLEAN",
                threatReason: "Standard Telemetry Beacon"
            });

            return originalSendBeacon(url, data);
        };
        navigator.sendBeacon.__proctor_monitored = true;
    }

    /* ------------------------------------------------------------
       4. DEEP PACKET INTERCEPTION: WEBSOCKET
    ------------------------------------------------------------ */

    _installWebSocketInterceptor() {
        if (!window.WebSocket) return;
        const self = this;
        const OriginalWebSocket = this._nativeWebSocket;

        const ProxiedWebSocket = function(url, protocols) {
            const strUrl = String(url);
            const blacklistMatch = self._checkBlacklist(strUrl);

            if (blacklistMatch) {
                if (window.antiCheatEngine && window.antiCheatEngine.isActive) {
                    window.antiCheatEngine._logViolation("AI_WEBSOCKET_BLOCKED", "CRITICAL",
                        `Cấm mở kênh WebSocket kết nối AI ngoại lai: ${blacklistMatch.name} (${strUrl})`, 50);
                    window.antiCheatEngine.addStrike(`Kết nối WebSocket tới dịch vụ AI (${blacklistMatch.name})`);
                }

                self._createPacket({
                    protocol: "WS",
                    method: "CONNECT",
                    url: strUrl,
                    payload: "[WebSocket Handshake Blocked]",
                    status: 403,
                    statusText: "FIREWALL_BLOCKED",
                    latency: 1,
                    threatLevel: "CRITICAL",
                    threatReason: `Unauthorized AI WebSocket: ${blacklistMatch.name}`
                });

                throw new Error(`[PROCTOR_FIREWALL] WebSocket connection to ${strUrl} blocked.`);
            }

            self._createPacket({
                protocol: "WS",
                method: "CONNECT",
                url: strUrl,
                payload: "[WebSocket Handshake]",
                status: 101,
                statusText: "SWITCHING_PROTOCOLS",
                latency: 2,
                threatLevel: "WARN",
                threatReason: "External WebSocket Connection"
            });

            return new OriginalWebSocket(url, protocols);
        };

        ProxiedWebSocket.prototype = OriginalWebSocket.prototype;
        ProxiedWebSocket.__proctor_monitored = true;
        window.WebSocket = ProxiedWebSocket;
    }

    /* ------------------------------------------------------------
       5. DEEP PACKET INTERCEPTION: EVENTSOURCE (SSE)
    ------------------------------------------------------------ */

    _installEventSourceInterceptor() {
        if (!window.EventSource) return;
        const self = this;
        const OriginalEventSource = this._nativeEventSource;

        const ProxiedEventSource = function(url, configuration) {
            const strUrl = String(url);
            const blacklistMatch = self._checkBlacklist(strUrl);

            if (blacklistMatch) {
                if (window.antiCheatEngine && window.antiCheatEngine.isActive) {
                    window.antiCheatEngine._logViolation("AI_EVENTSOURCE_BLOCKED", "CRITICAL",
                        `Chặn luồng streaming EventSource (SSE) tới ${blacklistMatch.name}`, 50);
                    window.antiCheatEngine.addStrike(`Nhận phản hồi streaming từ AI (${blacklistMatch.name})`);
                }

                self._createPacket({
                    protocol: "SSE",
                    method: "GET",
                    url: strUrl,
                    payload: "[EventSource SSE Stream Blocked]",
                    status: 403,
                    statusText: "FIREWALL_BLOCKED",
                    latency: 1,
                    threatLevel: "CRITICAL",
                    threatReason: `AI Streaming Stream Blocked: ${blacklistMatch.name}`
                });

                throw new Error(`[PROCTOR_FIREWALL] EventSource stream to ${strUrl} blocked.`);
            }

            self._createPacket({
                protocol: "SSE",
                method: "GET",
                url: strUrl,
                payload: "[EventSource SSE Stream Initialized]",
                status: 200,
                statusText: "OK",
                latency: 2,
                threatLevel: "WARN",
                threatReason: "Authorized EventSource Stream"
            });

            return new OriginalEventSource(url, configuration);
        };

        ProxiedEventSource.prototype = OriginalEventSource.prototype;
        ProxiedEventSource.__proctor_monitored = true;
        window.EventSource = ProxiedEventSource;
    }

    /* ------------------------------------------------------------
       PACKET CREATION & LOGGING
    ------------------------------------------------------------ */

    _createPacket(data) {
        const packet = {
            id: "PKT-" + (++this.sequenceNumber),
            timestamp: new Date().toLocaleTimeString("vi-VN", { hour12: false }) + "." + (Date.now() % 1000).toString().padStart(3, '0'),
            protocol: data.protocol || "HTTP",
            method: data.method || "GET",
            url: data.url,
            payload: data.payload,
            headers: data.headers || "{}",
            status: data.status,
            statusText: data.statusText,
            latency: data.latency,
            threatLevel: data.threatLevel || "CLEAN", // CLEAN, WARN, ALERT, CRITICAL
            threatReason: data.threatReason || ""
        };

        this.packets.push(packet);
        if (this.packets.length > 250) {
            this.packets.shift();
        }
        this._notify(packet);
        return packet;
    }

    logInternal(method, endpoint, status, message) {
        return this._createPacket({
            protocol: "INTERNAL",
            method,
            url: endpoint,
            payload: JSON.stringify({ message }),
            headers: "X-Internal-Proctor: true",
            status: status === "ONLINE" ? 200 : 204,
            statusText: status,
            latency: 1,
            threatLevel: "CLEAN",
            threatReason: "Internal System Event"
        });
    }

    /* ------------------------------------------------------------
       SIMULATED SERVER TELEMETRY HEARTBEAT
    ------------------------------------------------------------ */

    _startHeartbeatLoop() {
        this.heartbeatTimer = setInterval(async () => {
            if (!this.isMonitoring) return;

            const telemetryPayload = {
                seq: this.sequenceNumber,
                timestamp: Date.now(),
                threatScore: window.antiCheatEngine ? window.antiCheatEngine.threatScore : 0,
                strikes: window.antiCheatEngine ? window.antiCheatEngine.strikes : 0,
                activeWindow: document.hasFocus(),
                visibility: document.visibilityState,
                entropyHash: Math.random().toString(36).substring(2, 10)
            };

            try {
                await window.fetch("/api/v1/proctor/telemetry/heartbeat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(telemetryPayload)
                });
            } catch (e) {
                // Ignore internal mock errors
            }
        }, 4000);
    }

    _handleMockBackend(url, method, body) {
        if (url.includes("/telemetry/heartbeat")) {
            return {
                ack: true,
                serverTime: Date.now(),
                status: "SYNCHRONIZED",
                integrityCheck: "PASS",
                receivedSeq: this.sequenceNumber
            };
        }
        if (url.includes("/exam/answer")) {
            return {
                status: "RECORDED",
                savedAt: Date.now()
            };
        }
        return { ok: true };
    }
}

// Global Export
window.trafficTracker = new TrafficTrackerEngine();
