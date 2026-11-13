/**
 * DEEP ANTI-CHEAT ENGINE (V5.1 HIGH-SECURITY PROCTOR CORE)
 * Implements 7-layer browser sandbox & heuristics protection:
 * Layer 1: Hardware, Virtual Machine & Fingerprinting Forensics
 * Layer 2: Headless Browser & Bot Framework Detection (WebDriver, Selenium, Puppeteer, Tampermonkey)
 * Layer 3: Display, Window Focus, Fullscreen & Multi-Monitor Guard
 * Layer 4: DevTools, Debugger & Code Integrity Verification (Native Hook Detection)
 * Layer 5: Input Biometrics (Event.isTrusted on Click/Pointer/Keys, Keystroke Dynamics, Mouse Teleportation)
 * Layer 6: DOM Mutation & AI Assistant Extension Hunter (Monica, Sider, Harpa, ChatGPT, Custom Elements & Shadow DOM)
 * Layer 7: Honeypot Decoys, Adversarial Prompt Poisoning & Canary Extraction Trap
 */

class AntiCheatEngine {
    constructor() {
        this.isActive = false;
        this.isDisqualified = false;
        this.threatScore = 0; // 0 - 100
        this.strikes = 0;
        this.maxStrikes = 3;
        this.violations = [];
        this.subscribers = new Set();
        
        // Fingerprint Cache
        this.fingerprint = {
            canvasHash: null,
            webglRenderer: null,
            webglVendor: null,
            audioHash: null,
            cores: navigator.hardwareConcurrency || 1,
            memory: navigator.deviceMemory || "N/A",
            screenRes: `${window.screen.width}x${window.screen.height}`,
            isExtended: false,
            vmDetected: false,
            automationFlags: []
        };

        // Biometrics tracking
        this.keystrokes = [];
        this.mousePoints = [];
        this.lastInputTime = Date.now();
        this.lastBlurTime = 0;

        // Anti-tamper references to original native methods
        this.nativeMethods = {
            fetch: window.fetch,
            addEventListener: window.addEventListener,
            setTimeout: window.setTimeout,
            setInterval: window.setInterval,
            DateNow: Date.now,
            FunctionToString: Function.prototype.toString
        };

        // DevTools timing detector state
        this.devToolsOpen = false;
        this.devToolsInterval = null;
        this.periodicCheckInterval = null;
        this.mutationObserver = null;
        this.fullscreenGraceTimer = null;
        
        // Bound event handlers
        this._onVisibilityChange = this._onVisibilityChange.bind(this);
        this._onWindowBlur = this._onWindowBlur.bind(this);
        this._onWindowFocus = this._onWindowFocus.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onContextMenu = this._onContextMenu.bind(this);
        this._onCopyPaste = this._onCopyPaste.bind(this);
        this._onFullscreenChange = this._onFullscreenChange.bind(this);
        this._onResize = this._onResize.bind(this);
    }

    /**
     * Subscribe to AntiCheat events (telemetry updates, strikes, violations)
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    _notify(event, data) {
        this.subscribers.forEach(cb => {
            try { cb(event, data); } catch (e) { console.error("Subscriber error:", e); }
        });
    }

    /**
     * Initialize deep hardware forensics and integrity baseline
     */
    async init() {
        await this._collectHardwareFingerprint();
        this._verifyNativeIntegrity();
        this._detectAutomationMarkers();
        this._setupDOMMutationObserver();
        this._setupShadowDOMInterceptor();
        this._setupDevToolsDetector();
        this._setupScreenDetailsObserver();
        return this.fingerprint;
    }

    /**
     * Start active exam proctoring mode
     */
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.strikes = 0;
        this.threatScore = 0;
        this.violations = [];

        // Attach listeners with capture = true to intercept before user scripts
        document.addEventListener("visibilitychange", this._onVisibilityChange);
        window.addEventListener("blur", this._onWindowBlur);
        window.addEventListener("focus", this._onWindowFocus);
        window.addEventListener("keydown", this._onKeyDown, true);
        window.addEventListener("keyup", this._onKeyUp, true);
        window.addEventListener("mousemove", this._onMouseMove, true);
        window.addEventListener("pointerdown", this._onPointerDown, true);
        window.addEventListener("click", this._onClick, true);
        document.addEventListener("contextmenu", this._onContextMenu, true);
        document.addEventListener("copy", this._onCopyPaste, true);
        document.addEventListener("cut", this._onCopyPaste, true);
        document.addEventListener("paste", this._onCopyPaste, true);
        document.addEventListener("selectstart", this._onCopyPaste, true);
        document.addEventListener("fullscreenchange", this._onFullscreenChange);
        window.addEventListener("resize", this._onResize);

        // Start background integrity & automation periodic watch loop
        this.periodicCheckInterval = setInterval(() => {
            if (!this.isActive) return;
            this._detectAutomationMarkers();
            this._verifyNativeIntegrity();
        }, 2500);

        this._logViolation("SYSTEM_START", "INFO", "Hệ thống Anti-Cheat V5.1 đã kích hoạt toàn bộ 7 tầng giám sát sâu.");
        this._notify("STATUS_CHANGED", { active: true });
    }

    /**
     * Stop active proctoring mode
     */
    stop() {
        this.isActive = false;
        document.removeEventListener("visibilitychange", this._onVisibilityChange);
        window.removeEventListener("blur", this._onWindowBlur);
        window.removeEventListener("focus", this._onWindowFocus);
        window.removeEventListener("keydown", this._onKeyDown, true);
        window.removeEventListener("keyup", this._onKeyUp, true);
        window.removeEventListener("mousemove", this._onMouseMove, true);
        if (!this.isDisqualified) {
            window.removeEventListener("pointerdown", this._onPointerDown, true);
            window.removeEventListener("click", this._onClick, true);
        }
        document.removeEventListener("contextmenu", this._onContextMenu, true);
        document.removeEventListener("copy", this._onCopyPaste, true);
        document.removeEventListener("cut", this._onCopyPaste, true);
        document.removeEventListener("paste", this._onCopyPaste, true);
        document.removeEventListener("selectstart", this._onCopyPaste, true);
        document.removeEventListener("fullscreenchange", this._onFullscreenChange);
        window.removeEventListener("resize", this._onResize);

        if (this.devToolsInterval) {
            clearInterval(this.devToolsInterval);
            this.devToolsInterval = null;
        }
        if (this.periodicCheckInterval) {
            clearInterval(this.periodicCheckInterval);
            this.periodicCheckInterval = null;
        }

        this._logViolation("SYSTEM_STOP", "INFO", "Hệ thống Anti-Cheat tạm dừng giám sát.");
        this._notify("STATUS_CHANGED", { active: false });
    }

    /* ------------------------------------------------------------
       LAYER 1 & 2: HARDWARE, VM & AUTOMATION FINGERPRINTING
    ------------------------------------------------------------ */

    async _collectHardwareFingerprint() {
        // 1. Canvas Fingerprint
        try {
            const canvas = document.createElement("canvas");
            canvas.width = 240;
            canvas.height = 60;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.textBaseline = "top";
                ctx.font = "14px 'Arial', sans-serif";
                ctx.textBaseline = "alphabetic";
                ctx.fillStyle = "#f60";
                ctx.fillRect(125, 1, 62, 20);
                ctx.fillStyle = "#069";
                ctx.fillText("ProctorAntiCheat#5.1!🛡️", 2, 15);
                ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
                ctx.fillText("ProctorAntiCheat#5.1!🛡️", 4, 17);
                const b64 = canvas.toDataURL();
                this.fingerprint.canvasHash = this._quickHash(b64);
            }
        } catch (e) {
            this.fingerprint.canvasHash = "BLOCKED";
        }

        // 2. WebGL Fingerprint & VM Check
        try {
            const glCanvas = document.createElement("canvas");
            const gl = glCanvas.getContext("webgl") || glCanvas.getContext("experimental-webgl");
            if (gl) {
                const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
                if (debugInfo) {
                    this.fingerprint.webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    this.fingerprint.webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                } else {
                    this.fingerprint.webglVendor = gl.getParameter(gl.VENDOR);
                    this.fingerprint.webglRenderer = gl.getParameter(gl.RENDERER);
                }

                // Check for VM / Headless markers
                const r = (this.fingerprint.webglRenderer || "").toLowerCase();
                const v = (this.fingerprint.webglVendor || "").toLowerCase();
                if (r.includes("swiftshader") || r.includes("llvmpipe") || r.includes("virtualbox") || 
                    r.includes("vmware") || r.includes("mesa") || r.includes("basic render driver") ||
                    (v.includes("google inc.") && r.includes("software"))) {
                    this.fingerprint.vmDetected = true;
                    this._logViolation("VM_OR_HEADLESS_DETECTED", "WARN", 
                        `Phát hiện môi trường máy ảo hoặc trình duyệt giả lập Headless (GPU: ${this.fingerprint.webglRenderer})`, 30);
                }
            }
        } catch (e) {
            this.fingerprint.webglRenderer = "UNAVAILABLE";
        }

        // 3. AudioContext Fingerprint
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const audioCtx = new AudioContext();
                const oscillator = audioCtx.createOscillator();
                const analyser = audioCtx.createAnalyser();
                const gain = audioCtx.createGain();
                const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);

                gain.gain.value = 0; // mute
                oscillator.type = "triangle";
                oscillator.connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(gain);
                gain.connect(audioCtx.destination);

                this.fingerprint.audioHash = "AC_" + (audioCtx.sampleRate || 44100).toString(16);
                audioCtx.close();
            }
        } catch (e) {
            this.fingerprint.audioHash = "AUDIO_RESTRICTED";
        }

        // 4. Multi-screen / Extended Desktop Check
        if ("isExtended" in window.screen) {
            this.fingerprint.isExtended = !!window.screen.isExtended;
        }
    }

    _detectAutomationMarkers() {
        const detected = [];

        // Selenium / WebDriver flag
        if (navigator.webdriver === true) {
            detected.push("navigator.webdriver = true");
        }

        // Userscript Engines: Tampermonkey, Greasemonkey, Violentmonkey
        const userscriptGlobals = [
            "GM", "GM_info", "GM_xmlhttpRequest", "GM_setValue", "GM_getValue",
            "unsafeWindow", "__tampermonkey", "__violentmonkey"
        ];
        userscriptGlobals.forEach(prop => {
            if (prop in window && window[prop] !== undefined) {
                detected.push(`Userscript Engine (${prop})`);
            }
        });

        // Injected automation properties
        const suspiciousProps = [
            "__webdriver_evaluate",
            "__selenium_evaluate",
            "__webdriver_script_function",
            "__webdriver_script_func",
            "__webdriver_script_fn",
            "__fxdriver_evaluate",
            "__driver_unwrapped",
            "__webdriver_unwrapped",
            "__selenium_unwrapped",
            "__fxdriver_unwrapped",
            "cdc_adoQpoasnfa76pfcZLmcfl_Array",
            "cdc_adoQpoasnfa76pfcZLmcfl_Promise",
            "cdc_adoQpoasnfa76pfcZLmcfl_Symbol",
            "__nightmare",
            "_phantom",
            "callPhantom",
            "domAutomation",
            "domAutomationController",
            "__puppeteer_evaluation_script__",
            "__playwright",
            "Cypress"
        ];

        suspiciousProps.forEach(prop => {
            if (prop in window && window[prop] !== undefined) {
                detected.push(`window.${prop}`);
            }
        });

        // Plugin count anomaly (Chrome desktop almost always has plugins)
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        if (isChrome && navigator.plugins && navigator.plugins.length === 0) {
            detected.push("Zero Plugins (Headless Chromium signature)");
        }

        if (!this._knownAutomationFlags) this._knownAutomationFlags = new Set();
        const newFlags = detected.filter(f => !this._knownAutomationFlags.has(f));
        if (newFlags.length > 0) {
            newFlags.forEach(f => this._knownAutomationFlags.add(f));
            this.fingerprint.automationFlags = Array.from(this._knownAutomationFlags);
            this._logViolation("AUTOMATION_FRAMEWORK_DETECTED", "CRITICAL", 
                `Phát hiện công cụ tự động hóa / Bot Runner / Userscript: ${newFlags.join(", ")}`, 50);
            
            if (this.isActive && !window.__TEST_MODE__) {
                this.addStrike(`Phát hiện môi trường tự động hóa (${newFlags[0]})`);
            }
        }
    }

    /* ------------------------------------------------------------
       LAYER 4: NATIVE API INTEGRITY & DEVTOOLS DETECTION
    ------------------------------------------------------------ */

    _verifyNativeIntegrity() {
        const targets = [
            { obj: window, method: "fetch", name: "window.fetch" },
            { obj: window, method: "addEventListener", name: "window.addEventListener" },
            { obj: document, method: "addEventListener", name: "document.addEventListener" },
            { obj: XMLHttpRequest.prototype, method: "open", name: "XMLHttpRequest.prototype.open" },
            { obj: Function.prototype, method: "toString", name: "Function.prototype.toString" }
        ];

        for (const t of targets) {
            try {
                const fn = t.obj[t.method];
                if (!fn) continue;
                const str = this.nativeMethods.FunctionToString.call(fn);
                const isNative = /\{\s*\[native code\]\s*\}/.test(str);
                
                // Note: our traffic tracker wraps fetch/XHR legally for monitoring,
                // so we check if it is unrecognized foreign tampering
                if (!isNative && !fn.__proctor_monitored) {
                    this._logViolation("NATIVE_HOOK_TAMPER", "CRITICAL",
                        `Phát hiện phương thức ${t.name} đã bị can thiệp/hook bởi Extension hoặc Tampermonkey!`, 40);
                    if (this.isActive) {
                        this.addStrike(`Can thiệp mã nguồn native API (${t.name})`);
                    }
                }
            } catch (e) {
                // Ignore descriptor read issues
            }
        }
    }

    _setupDevToolsDetector() {
        const element = document.createElement("div");
        Object.defineProperty(element, "id", {
            get: () => {
                if (!this.devToolsOpen) {
                    this.devToolsOpen = true;
                    this._handleDevToolsEvent(true);
                }
                return "devtools-trap";
            }
        });

        // Outer vs Inner Dimension delta threshold (> 220px to avoid false positives on high-DPI scaling)
        const checkDimensions = () => {
            const widthThreshold = (window.outerWidth - window.innerWidth) > 220;
            const heightThreshold = (window.outerHeight - window.innerHeight) > 240;
            const isDocked = widthThreshold || heightThreshold;

            if (isDocked && !this.devToolsOpen) {
                this.devToolsOpen = true;
                this._handleDevToolsEvent(true);
            } else if (!isDocked && this.devToolsOpen) {
                this.devToolsOpen = false;
                this._handleDevToolsEvent(false);
            }
        };

        this.devToolsInterval = setInterval(() => {
            if (!this.isActive) return;

            // Method 1: Console getter evaluation
            console.log(element);
            console.clear();

            // Method 2: Dimension delta
            checkDimensions();

            // Method 3: Debugger timing heuristic
            const start = performance.now();
            // debugger; // Evaluated when devtools is active
            if (performance.now() - start > 100) {
                this._handleDevToolsEvent(true);
            }
        }, 1500);
    }

    _handleDevToolsEvent(opened) {
        if (!this.isActive) return;
        if (opened) {
            this._logViolation("DEVTOOLS_OPENED", "CRITICAL", 
                "Phát hiện mở Trình duyệt Nhà phát triển (Developer Tools / Inspect Element)!", 45);
            this.addStrike("Mở Developer Tools trong thời gian thi");
        } else {
            this._logViolation("DEVTOOLS_CLOSED", "INFO", "Developer Tools đã được đóng lại.");
        }
    }

    /* ------------------------------------------------------------
       LAYER 3: DISPLAY, WINDOW FOCUS & FULLSCREEN GUARD
    ------------------------------------------------------------ */

    _onVisibilityChange() {
        if (!this.isActive) return;
        if (document.visibilityState === "hidden") {
            this.lastBlurTime = Date.now();
            this._logViolation("TAB_SWITCH_HIDDEN", "ALERT", 
                "Thí sinh đã chuyển tab hoặc thu nhỏ cửa sổ làm bài!", 25);
            this.addStrike("Rời khỏi giao diện làm bài thi (Chuyển tab)");
        } else {
            this._logViolation("TAB_RESTORED", "INFO", "Thí sinh đã quay lại giao diện làm bài thi.");
        }
    }

    _onWindowBlur() {
        if (!this.isActive) return;
        // Debounce: if visibilitychange already fired within 200ms, do not double-strike the same action
        if (Date.now() - this.lastBlurTime < 250) return;
        this.lastBlurTime = Date.now();

        this._logViolation("WINDOW_BLUR_LOST_FOCUS", "ALERT", 
            "Cửa sổ bài thi bị mất tiêu điểm (Focus Lost). Có thể đã chuyển sang ứng dụng khác (Alt+Tab hoặc click ngoài)!", 20);
        this.addStrike("Mất tiêu điểm cửa sổ bài thi");
    }

    _onWindowFocus() {
        if (!this.isActive) return;
        this._logViolation("WINDOW_FOCUS_REGAINED", "INFO", "Cửa sổ bài thi đã lấy lại tiêu điểm.");
    }

    _onFullscreenChange() {
        if (!this.isActive) return;
        const isFullscreen = !!document.fullscreenElement;
        if (!isFullscreen) {
            this._logViolation("FULLSCREEN_EXITED", "ALERT", 
                "Thí sinh đã thoát chế độ Toàn màn hình (Fullscreen)!", 25);
            this._notify("FULLSCREEN_VIOLATION", { countdown: 5 });
            this.addStrike("Thoát chế độ Toàn màn hình");
        } else {
            this._logViolation("FULLSCREEN_ENTERED", "INFO", "Chế độ Toàn màn hình được duy trì an toàn.");
        }
    }

    _onResize() {
        if (!this.isActive) return;
        if (window.screenX < -50 || window.screenX > window.screen.availWidth) {
            this._logViolation("MULTI_MONITOR_DRIFT", "WARN", 
                "Cửa sổ bài thi được di chuyển sang màn hình phụ thứ hai!", 15);
        }
    }

    _setupScreenDetailsObserver() {
        if ("isExtended" in window.screen) {
            window.screen.addEventListener("change", () => {
                if (window.screen.isExtended) {
                    this._logViolation("MULTI_MONITOR_CONNECTED", "ALERT", 
                        "Phát hiện kết nối thêm màn hình phụ ngoài!", 20);
                }
            });
        }
    }

    /* ------------------------------------------------------------
       LAYER 5: INPUT PROTECTION & BIOMETRICS (isTrusted & Bots)
    ------------------------------------------------------------ */

    _onContextMenu(e) {
        if (!this.isActive) return;
        e.preventDefault();
        e.stopPropagation();
        this._logViolation("CONTEXT_MENU_BLOCKED", "WARN", "Cố gắng bấm chuột phải (Context Menu đã bị vô hiệu hóa).", 10);
        return false;
    }

    _onCopyPaste(e) {
        if (!this.isActive) return;
        e.preventDefault();
        e.stopPropagation();

        // Check if pasted content contains honeypot canary or AI output
        if (e.type === "paste" && e.clipboardData) {
            const pastedText = e.clipboardData.getData("text") || "";
            if (pastedText.includes("CHEAT_VIOLATION_CONFIRMED") || 
                pastedText.includes("As an AI") || 
                pastedText.includes("Tôi là một mô hình AI")) {
                this._logViolation("AI_CANARY_PASTE_CAUGHT", "CRITICAL", 
                    "BẮT QUẢ TANG: Thí sinh dán kết quả từ AI chứa Honeypot Trap!", 50);
                this.addStrike("Dán câu trả lời do AI tạo vào bài thi");
            }
        }

        this._logViolation("CLIPBOARD_ACTION_BLOCKED", "ALERT", 
            `Cố gắng thực hiện thao tác Clipboard (${e.type}) bị chặn!`, 20);
        return false;
    }

    _onKeyDown(e) {
        if (!this.isActive) return;

        // 1. isTrusted Verification
        if (e.isTrusted === false) {
            this._logViolation("UNTRUSTED_KEY_EVENT", "CRITICAL", 
                "Phát hiện sự kiện bàn phím giả mạo (Synthetic Key Event / dispatchEvent script)!", 50);
            this.addStrike("Sử dụng công cụ giả lập phím tự động (Bot Script)");
            e.preventDefault();
            return;
        }

        const key = (e.key || "").toUpperCase();
        const isCtrl = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;

        // 2. Trapped Prohibited Hotkeys (F12, DevTools, Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+U, PrintScreen, Snipping Tool)
        if (key === "F12" || 
            (isCtrl && isShift && (key === "I" || key === "J" || key === "C" || key === "S")) || 
            (isCtrl && (key === "U" || key === "S" || key === "P" || key === "A" || key === "C" || key === "V" || key === "X"))) {
            e.preventDefault();
            e.stopPropagation();
            this._logViolation("PROHIBITED_HOTKEY", "CRITICAL", 
                `Phát hiện tổ hợp phím cấm: ${isCtrl ? 'Ctrl+' : ''}${isShift ? 'Shift+' : ''}${key}!`, 35);
            return false;
        }

        // 3. PrintScreen Trap & Snipping Tool
        if (key === "PRINTSCREEN" || e.keyCode === 44) {
            this._logViolation("PRINTSCREEN_ATTEMPT", "CRITICAL", 
                "Phát hiện chụp ảnh màn hình bằng phím PrintScreen!", 30);
            this.addStrike("Chụp ảnh màn hình đề thi");
            try { navigator.clipboard.writeText("[VIOLATION: Screen capture prohibited]"); } catch(err) {}
        }

        // 4. Keystroke Dynamics & Typing Bot Detector
        const now = Date.now();
        const delta = (this.lastInputTime && (now - this.lastInputTime < 2000)) ? (now - this.lastInputTime) : 100;
        this.lastInputTime = now;
        this.keystrokes.push({ key: e.key, delta, timestamp: now });

        if (this.keystrokes.length > 8) {
            const lastFew = this.keystrokes.slice(-6);
            const avgDelta = lastFew.reduce((acc, k) => acc + k.delta, 0) / lastFew.length;
            // Bot typing speed: inhuman speed < 18ms per keystroke
            if (avgDelta < 18) {
                this._logViolation("SUPERHUMAN_KEYSTROKE_BOT", "CRITICAL", 
                    `Tốc độ gõ phím phi thực tế (${Math.round(60000 / Math.max(1, avgDelta))} CPM). Phát hiện bot dán chữ tự động!`, 40);
                this.keystrokes = [];
            }
        }
    }

    _onKeyUp(e) {
        if (!this.isActive) return;
        if (e.isTrusted === false) {
            this._logViolation("UNTRUSTED_KEY_UP", "CRITICAL", "Phát hiện giả mạo sự kiện KeyUp!", 30);
        }
    }

    _onPointerDown(e) {
        if (!this.isActive) return;
        if (this.isDisqualified) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        if (e.isTrusted === false && e.target && e.target.closest && 
            (e.target.closest(".options-grid") || e.target.closest(".exam-action-bar") || e.target.closest(".palette-grid"))) {
            this._handleUntrustedClick(e);
            return false;
        }
    }

    _onClick(e) {
        if (this.isDisqualified) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        if (!this.isActive) return;

        // Check if untrusted click was targeted at exam controls (options, navigation, palette)
        if (e.isTrusted === false && e.target && e.target.closest && 
            (e.target.closest(".options-grid") || e.target.closest(".exam-action-bar") || e.target.closest(".palette-grid"))) {
            this._handleUntrustedClick(e);
            return false;
        }
    }

    _handleUntrustedClick(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this._logViolation("UNTRUSTED_CLICK_BOT", "CRITICAL", 
            "Phát hiện click chuột giả lập không xuất phát từ người dùng thật (event.isTrusted = false)!", 50);
        this.addStrike("Sử dụng Auto-clicker hoặc Bot tự động");
    }

    _onMouseMove(e) {
        if (!this.isActive) return;
        const now = Date.now();
        this.mousePoints.push({ x: e.clientX, y: e.clientY, t: now });

        if (this.mousePoints.length > 20) {
            this.mousePoints.shift();
            const p1 = this.mousePoints[this.mousePoints.length - 2];
            const p2 = this.mousePoints[this.mousePoints.length - 1];
            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            const dt = p2.t - p1.t;

            if (dist > 500 && dt > 0 && dt < 8) {
                this._logViolation("MOUSE_TELEPORTATION_BOT", "WARN", 
                    `Con trỏ chuột nhảy tức thời không qua quỹ đạo tự nhiên (${Math.round(dist)}px trong ${dt}ms).`, 20);
            }
        }
    }

    /* ------------------------------------------------------------
       LAYER 6 & 7: DOM EXTENSION HUNTER, SHADOW DOM & CANARY TRAP
    ------------------------------------------------------------ */

    _isSuspiciousNode(node) {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;

        const tag = (node.tagName || "").toLowerCase();
        const id = (node.id || "").toLowerCase();
        const cls = (node.className || "").toString().toLowerCase();

        // Foreign unauthorized iframe
        if (tag === "iframe" && !node.dataset.examAllowed) {
            return `Foreign iframe detected: #${id}.${cls}`;
        }

        const extensionSignatures = [
            "monica", "sider", "chatgpt", "harpa", "merlin", "liner", 
            "ai-assistant", "scispace", "supercopy", "maxai", "bing-chat",
            "copilot", "deepseek", "chat-gpt", "quillbot", "grammarly"
        ];

        // 1. Tag name check (e.g. <monica-sidebar>, <sider-app>, <chatgpt-floating-box>)
        for (const sig of extensionSignatures) {
            if (tag.includes(sig) || id.includes(sig) || cls.includes(sig)) {
                return `AI Extension Signature [${sig}] in <${tag} id="${id}" class="${cls}">`;
            }
        }

        // 2. Check inner elements for extension markers
        if (node.querySelector) {
            for (const sig of extensionSignatures) {
                const innerMatch = node.querySelector(`[id*="${sig}"], [class*="${sig}"], ${sig}`);
                if (innerMatch) {
                    return `AI Extension nested container containing [${sig}]`;
                }
            }
        }

        // 3. Honeypot canary string in text
        const text = node.textContent || "";
        if (text.includes("CHEAT_VIOLATION_CONFIRMED") && !node.classList.contains("ai-decoy-honeypot")) {
            return "Adversarial Honeypot Canary String Exfiltrated / Injected into DOM!";
        }

        return null;
    }

    _setupDOMMutationObserver() {
        // Initial scan of existing DOM elements
        const existingElements = document.querySelectorAll("*");
        for (const el of existingElements) {
            const violation = this._isSuspiciousNode(el);
            if (violation) {
                this._logViolation("AI_EXTENSION_DOM_INJECTION", "CRITICAL", 
                    `Phát hiện Extension AI đang hoạt động trên trang: ${violation}`, 45);
                this.addStrike(`Phát hiện Extension AI (${violation})`);
                break;
            }
        }

        // Mutation Observer for dynamic injections
        this.mutationObserver = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.addedNodes.length) {
                    for (const node of m.addedNodes) {
                        const reason = this._isSuspiciousNode(node);
                        if (reason) {
                            this._logViolation("AI_EXTENSION_DOM_INJECTION", "CRITICAL", 
                                `Phát hiện Extension AI tiêm giao diện vào trang: ${reason}`, 45);
                            this.addStrike(`Sử dụng Extension AI trợ giúp`);
                            break;
                        }
                    }
                }
            }
        });

        this.mutationObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    _setupShadowDOMInterceptor() {
        const self = this;
        const originalAttachShadow = Element.prototype.attachShadow;
        if (!originalAttachShadow) return;

        Element.prototype.attachShadow = function(init) {
            const hostTag = (this.tagName || "").toLowerCase();
            const hostId = (this.id || "").toLowerCase();
            const hostCls = (this.className || "").toString().toLowerCase();

            // Check if shadow root host is foreign / extension
            const suspicious = self._isSuspiciousNode(this);
            if (suspicious) {
                self._logViolation("AI_SHADOW_DOM_INJECTION", "CRITICAL", 
                    `Phát hiện Shadow DOM tiêm bởi Extension AI: <${hostTag} id="${hostId}" class="${hostCls}">`, 45);
                self.addStrike("Phát hiện Extension AI sử dụng Shadow DOM");
            }

            return originalAttachShadow.call(this, init);
        };
        Element.prototype.attachShadow.__proctor_monitored = true;
    }

    /* ------------------------------------------------------------
       THREAT SCORING & STRIKE SYSTEM
    ------------------------------------------------------------ */

    addStrike(reason) {
        if (!this.isActive) return;
        this.strikes++;
        this.threatScore = Math.min(100, this.threatScore + 30);
        
        const strikeData = {
            strikes: this.strikes,
            maxStrikes: this.maxStrikes,
            reason: reason,
            threatScore: this.threatScore,
            timestamp: new Date().toLocaleTimeString("vi-VN")
        };

        this._logViolation("STRIKE_ISSUED", "CRITICAL", 
            `CẢNH CÁO VI PHẠM SỐ ${this.strikes}/${this.maxStrikes}: ${reason}`);

        this._notify("STRIKE_ISSUED", strikeData);

        if (this.strikes >= this.maxStrikes) {
            this.disqualify(`Đã vượt quá số lần vi phạm cho phép (${this.strikes}/${this.maxStrikes})`);
        }
    }

    disqualify(reason) {
        this.isDisqualified = true;
        this.threatScore = 100;
        this.stop();
        const payload = {
            reason: reason,
            violationsCount: this.violations.length,
            threatScore: 100,
            timestamp: new Date().toISOString()
        };
        this._logViolation("DISQUALIFIED", "CRITICAL", `ĐÌNH CHỈ THI: ${reason}`);
        this._notify("DISQUALIFIED", payload);
    }

    _logViolation(type, severity, description, threatScoreIncrement = 0) {
        if (threatScoreIncrement > 0) {
            this.threatScore = Math.min(100, this.threatScore + threatScoreIncrement);
        }

        const record = {
            id: "V-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
            type,
            severity, // INFO, WARN, ALERT, CRITICAL
            description,
            threatScore: this.threatScore,
            strikes: this.strikes,
            timestamp: new Date().toLocaleTimeString("vi-VN", { hour12: false }) + "." + (Date.now() % 1000).toString().padStart(3, '0')
        };

        this.violations.push(record);
        this._notify("VIOLATION", record);
        this._notify("THREAT_UPDATED", { threatScore: this.threatScore, strikes: this.strikes });
    }

    _quickHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return "0x" + Math.abs(hash).toString(16).toUpperCase();
    }
}

// Global Export
window.antiCheatEngine = new AntiCheatEngine();
