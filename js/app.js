/**
 * PROCTOR DEFENSE APPLICATION CONTROLLER
 * Coordinates Exam State, Question Palette, Scoring, Telemetry HUD,
 * Dynamic Watermarking, Sound Synthesizer, and Red-Team Attack Simulator.
 */

class AppController {
    constructor() {
        this.currentBankKey = "cybersec";
        this.currentExam = EXAM_BANKS.cybersec;
        this.currentIndex = 0;
        this.userAnswers = {}; // { questionId: selectedIndex }
        this.flaggedQuestions = new Set();
        
        // Timer State
        this.remainingSeconds = this.currentExam.durationMinutes * 60;
        this.timerInterval = null;
        this.isSubmitted = false;

        // Audio synthesizer
        this.audioCtx = null;

        // DOM elements cache
        this.dom = {};
    }

    async init() {
        this._cacheDOMElements();
        this._initAudioSynthesizer();
        this._initWatermark();
        this._bindUIEvents();
        this._bindAntiCheatEvents();
        this._bindTrafficEvents();
        this._bindSimulatorEvents();

        // Initialize engines
        const fp = await window.antiCheatEngine.init();
        this._renderFingerprintDetails(fp);
        window.trafficTracker.start();

        // Initialize proctor video feed
        if (this.dom.videoFeed && this.dom.hudCanvas) {
            window.proctorAI.init(this.dom.videoFeed, this.dom.hudCanvas);
        }

        // Load exam data
        this.loadExam(this.currentBankKey);

        // Auto-start exam proctoring
        window.antiCheatEngine.start();
        this._startTimer();
    }

    _cacheDOMElements() {
        this.dom = {
            // Header
            examTitle: document.getElementById("exam-title"),
            timerDisplay: document.getElementById("timer-display"),
            statusPill: document.getElementById("status-pill"),
            tabBtns: document.querySelectorAll(".tab-btn"),
            tabContents: document.querySelectorAll(".tab-content"),
            
            // Exam View
            qBadge: document.getElementById("q-badge"),
            qCategory: document.getElementById("q-category"),
            qText: document.getElementById("q-text"),
            qCodeBox: document.getElementById("q-code-box"),
            optionsContainer: document.getElementById("options-container"),
            flagCheckbox: document.getElementById("flag-checkbox"),
            paletteGrid: document.getElementById("palette-grid"),
            btnPrev: document.getElementById("btn-prev"),
            btnNext: document.getElementById("btn-next"),
            btnClear: document.getElementById("btn-clear"),
            btnSubmit: document.getElementById("btn-submit"),
            
            // Proctor Video & Mini Telemetry
            videoFeed: document.getElementById("proctor-video-feed"),
            hudCanvas: document.getElementById("proctor-hud-canvas"),
            threatBarFill: document.getElementById("sidebar-threat-fill"),
            threatScoreText: document.getElementById("sidebar-threat-score"),
            strikePills: document.querySelectorAll(".strike-pill"),

            // SOC View
            socThreatValue: document.getElementById("soc-threat-value"),
            socStrikesValue: document.getElementById("soc-strikes-value"),
            socPacketsValue: document.getElementById("soc-packets-value"),
            socBlockedValue: document.getElementById("soc-blocked-value"),
            logStream: document.getElementById("log-stream"),
            trafficTableBody: document.getElementById("traffic-table-body"),
            fpCanvas: document.getElementById("fp-canvas"),
            fpGpu: document.getElementById("fp-gpu"),
            fpAudio: document.getElementById("fp-audio"),
            fpScreen: document.getElementById("fp-screen"),
            fpCores: document.getElementById("fp-cores"),
            fpAutomation: document.getElementById("fp-automation"),

            // Modals
            fullscreenModal: document.getElementById("modal-fullscreen"),
            strikeModal: document.getElementById("modal-strike"),
            strikeModalText: document.getElementById("strike-modal-text"),
            scoreModal: document.getElementById("modal-score"),
            scoreValue: document.getElementById("score-value"),
            accuracyValue: document.getElementById("accuracy-value"),
            integrityVerdict: document.getElementById("integrity-verdict"),
            reviewList: document.getElementById("review-list"),
            watermarkCanvas: document.getElementById("steganography-watermark"),
            packetModal: document.getElementById("modal-packet"),
            packetDetailContent: document.getElementById("packet-detail-content")
        };
    }

    _initAudioSynthesizer() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.audioCtx = new AudioCtx();
        } catch(e) {}
    }

    playTone(type) {
        if (!this.audioCtx) return;
        try {
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            if (type === "click") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === "warn") {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.setValueAtTime(260, now + 0.12);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.28);
                osc.start(now);
                osc.stop(now + 0.28);
            } else if (type === "alarm") {
                osc.type = "triangle";
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.setValueAtTime(440, now + 0.15);
                osc.frequency.setValueAtTime(880, now + 0.3);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.45);
                osc.start(now);
                osc.stop(now + 0.45);
            } else if (type === "success") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
            }
        } catch(e) {}
    }

    _initWatermark() {
        const canvas = this.dom.watermarkCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);
        resize();

        let offset = 0;
        const drawWatermark = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.font = "14px 'JetBrains Mono', monospace";
            ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
            ctx.rotate(-Math.PI / 6);

            const text = `PROCTOR ID: B23DCCN001 | IP: 118.70.182.42 | ${new Date().toISOString().substring(11, 19)}`;
            offset = (offset + 0.25) % 120;

            for (let x = -canvas.width; x < canvas.width * 2; x += 360) {
                for (let y = -canvas.height; y < canvas.height * 2; y += 140) {
                    ctx.fillText(text, x + offset, y);
                }
            }
            ctx.restore();
            requestAnimationFrame(drawWatermark);
        };
        requestAnimationFrame(drawWatermark);
    }

    /* ------------------------------------------------------------
       EXAM ENGINE & NAVIGATION
    ------------------------------------------------------------ */

    loadExam(bankKey) {
        this.currentBankKey = bankKey;
        this.currentExam = EXAM_BANKS[bankKey] || EXAM_BANKS.cybersec;
        this.currentIndex = 0;
        this.userAnswers = {};
        this.flaggedQuestions.clear();
        this.remainingSeconds = this.currentExam.durationMinutes * 60;
        this.isSubmitted = false;

        if (this.dom.examTitle) {
            this.dom.examTitle.textContent = this.currentExam.title;
        }

        this._renderPalette();
        this._renderCurrentQuestion();
    }

    _renderPalette() {
        const grid = this.dom.paletteGrid;
        if (!grid) return;
        grid.innerHTML = "";

        const questions = this.currentExam.questions;
        questions.forEach((q, idx) => {
            const btn = document.createElement("button");
            btn.className = "palette-btn";
            btn.textContent = (idx + 1).toString().padStart(2, '0');
            btn.dataset.index = idx;

            if (idx === this.currentIndex) btn.classList.add("active");
            if (this.userAnswers[q.id] !== undefined) btn.classList.add("answered");
            if (this.flaggedQuestions.has(q.id)) btn.classList.add("flagged");

            btn.addEventListener("click", () => {
                this.playTone("click");
                this.goToQuestion(idx);
            });
            grid.appendChild(btn);
        });
    }

    _renderCurrentQuestion() {
        const q = this.currentExam.questions[this.currentIndex];
        if (!q) return;

        // Meta badges
        this.dom.qBadge.textContent = `CÂU ${this.currentIndex + 1} / ${this.currentExam.questions.length}`;
        this.dom.qCategory.textContent = q.category || "General";
        this.dom.flagCheckbox.checked = this.flaggedQuestions.has(q.id);

        // Text & Code Box
        this.dom.qText.textContent = q.question;
        if (q.codeSnippet) {
            this.dom.qCodeBox.style.display = "block";
            this.dom.qCodeBox.textContent = q.codeSnippet;
        } else {
            this.dom.qCodeBox.style.display = "none";
        }

        // Render Options
        this.dom.optionsContainer.innerHTML = "";
        if (this.isSubmitted) {
            this.dom.optionsContainer.classList.add("locked");
        } else {
            this.dom.optionsContainer.classList.remove("locked");
        }
        const keys = ["A", "B", "C", "D"];
        const selectedOpt = this.userAnswers[q.id];

        q.options.forEach((optText, optIdx) => {
            const card = document.createElement("div");
            card.className = "option-card" + (selectedOpt === optIdx ? " selected" : "");
            card.dataset.optionIndex = optIdx;

            card.innerHTML = `
                <div class="option-key">${keys[optIdx]}</div>
                <div class="option-text">${this._escapeHTML(optText)}</div>
            `;

            card.addEventListener("click", (e) => {
                // Verify event trust
                if (e.isTrusted === false) {
                    window.antiCheatEngine._logViolation("UNTRUSTED_CLICK_BOT", "CRITICAL", 
                        "Phát hiện nhấp chọn đáp án thông qua mã Script/Bot tự động!", 50);
                    return;
                }
                this.playTone("click");
                this.selectAnswer(q.id, optIdx);
            });

            this.dom.optionsContainer.appendChild(card);
        });

        // Update Prev / Next buttons
        this.dom.btnPrev.disabled = this.currentIndex === 0;
        this.dom.btnNext.textContent = (this.currentIndex === this.currentExam.questions.length - 1) ? "Xem lại" : "Câu tiếp theo ❯";

        this._updatePaletteStatus();
    }

    selectAnswer(qId, optionIdx) {
        if (this.isSubmitted) return;
        this.userAnswers[qId] = optionIdx;

        // Log mock network call to save answer
        window.fetch("/api/v1/exam/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionId: qId, answerIndex: optionIdx, timestamp: Date.now() })
        }).catch(() => {});

        this._renderCurrentQuestion();
    }

    goToQuestion(index) {
        if (this.isSubmitted || (window.antiCheatEngine && window.antiCheatEngine.isDisqualified)) return;
        if (index < 0 || index >= this.currentExam.questions.length) return;
        this.currentIndex = index;
        this._renderCurrentQuestion();
    }

    _updatePaletteStatus() {
        const btns = this.dom.paletteGrid.querySelectorAll(".palette-btn");
        const questions = this.currentExam.questions;
        btns.forEach((btn, idx) => {
            const q = questions[idx];
            btn.className = "palette-btn";
            if (idx === this.currentIndex) btn.classList.add("active");
            if (this.userAnswers[q.id] !== undefined) btn.classList.add("answered");
            if (this.flaggedQuestions.has(q.id)) btn.classList.add("flagged");
        });
    }

    /* ------------------------------------------------------------
       TIMER & SUBMISSION
    ------------------------------------------------------------ */

    _startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.isSubmitted) {
                clearInterval(this.timerInterval);
                return;
            }

            this.remainingSeconds--;
            const mins = Math.floor(this.remainingSeconds / 60);
            const secs = this.remainingSeconds % 60;
            const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            if (this.dom.timerDisplay) {
                this.dom.timerDisplay.textContent = formatted;
                if (this.remainingSeconds < 300) {
                    this.dom.timerDisplay.parentElement.classList.add("urgent");
                }
            }

            if (this.remainingSeconds <= 0) {
                clearInterval(this.timerInterval);
                this.submitExam("Hết giờ làm bài quy định!");
            }
        }, 1000);
    }

    submitExam(reason = "Thí sinh chủ động nộp bài") {
        if (this.isSubmitted) return;
        this.isSubmitted = true;
        clearInterval(this.timerInterval);
        this.playTone("success");

        // Calculate score
        const questions = this.currentExam.questions;
        let correctCount = 0;
        const reviewHTML = [];

        questions.forEach((q, idx) => {
            const userAns = this.userAnswers[q.id];
            const isCorrect = userAns === q.correctAnswer;
            if (isCorrect) correctCount++;

            const keys = ["A", "B", "C", "D"];
            reviewHTML.push(`
                <div class="review-item ${isCorrect ? 'correct' : 'wrong'}">
                    <strong>Câu ${idx + 1}:</strong> ${this._escapeHTML(q.question.substring(0, 110))}...<br>
                    <span style="color: ${isCorrect ? '#10b981' : '#f43f5e'}">
                        ${isCorrect ? '✓ Đúng' : '✗ Sai'}: Bạn chọn: <b>${userAns !== undefined ? keys[userAns] : 'Chưa làm'}</b> | Đáp án chuẩn: <b>${keys[q.correctAnswer]}</b>
                    </span>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px;">
                        <i>Giải thích: ${this._escapeHTML(q.explanation)}</i>
                    </div>
                </div>
            `);
        });

        const scorePercent = Math.round((correctCount / questions.length) * 100);
        this.dom.scoreValue.textContent = `${correctCount} / ${questions.length}`;
        this.dom.accuracyValue.textContent = `${scorePercent}%`;
        
        const threat = window.antiCheatEngine.threatScore;
        const strikes = window.antiCheatEngine.strikes;

        if (strikes >= 3 || threat >= 80) {
            this.dom.integrityVerdict.innerHTML = `<span style="color: #ef4444; font-weight:bold;">ĐÌNH CHỈ THI (HỦY KẾT QUẢ) - VI PHẠM AN NINH NGHIÊM TRỌNG (Threat: ${threat}%)</span>`;
        } else if (threat > 30) {
            this.dom.integrityVerdict.innerHTML = `<span style="color: #f59e0b; font-weight:bold;">CẢNH BÁO ĐỘ TIN CẬY (Có ${strikes} lần cảnh báo - Điểm số được lưu để Hội đồng chấm thẩm định)</span>`;
        } else {
            this.dom.integrityVerdict.innerHTML = `<span style="color: #10b981; font-weight:bold;">CHỨNG NHẬN TRUNG THỰC CAO (Tính toàn vẹn bài thi 100% đạt chuẩn Quốc Gia)</span>`;
        }

        this.dom.reviewList.innerHTML = reviewHTML.join("");
        this.dom.optionsContainer.classList.add("locked");
        this.dom.scoreModal.classList.add("active");

        window.antiCheatEngine._logViolation("EXAM_SUBMITTED", "INFO", 
            `Bài thi đã nộp thành công. Điểm số: ${correctCount}/${questions.length} (${scorePercent}%). Lý do: ${reason}`);
    }

    /* ------------------------------------------------------------
       EVENT BINDINGS & LISTENERS
    ------------------------------------------------------------ */

    _bindUIEvents() {
        // Tab switching
        this.dom.tabBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                this.playTone("click");
                const targetViewId = btn.dataset.target;
                
                this.dom.tabBtns.forEach(b => b.classList.remove("active"));
                this.dom.tabContents.forEach(c => c.classList.remove("active"));

                btn.classList.add("active");
                const targetView = document.getElementById(targetViewId);
                if (targetView) targetView.classList.add("active");
            });
        });

        // Exam Switcher Select
        const examSelect = document.getElementById("exam-select-dropdown");
        if (examSelect) {
            examSelect.addEventListener("change", (e) => {
                this.loadExam(e.target.value);
            });
        }

        // Navigation buttons
        this.dom.btnPrev.addEventListener("click", () => {
            this.playTone("click");
            this.goToQuestion(this.currentIndex - 1);
        });

        this.dom.btnNext.addEventListener("click", () => {
            this.playTone("click");
            if (this.currentIndex < this.currentExam.questions.length - 1) {
                this.goToQuestion(this.currentIndex + 1);
            } else {
                // If at end, switch to SOC or confirm
                this.goToQuestion(0);
            }
        });

        this.dom.btnClear.addEventListener("click", () => {
            if (this.isSubmitted) return;
            this.playTone("click");
            const q = this.currentExam.questions[this.currentIndex];
            delete this.userAnswers[q.id];
            this._renderCurrentQuestion();
        });

        this.dom.flagCheckbox.addEventListener("change", (e) => {
            if (this.isSubmitted) return;
            this.playTone("click");
            const q = this.currentExam.questions[this.currentIndex];
            if (e.target.checked) {
                this.flaggedQuestions.add(q.id);
            } else {
                this.flaggedQuestions.delete(q.id);
            }
            this._updatePaletteStatus();
        });

        this.dom.btnSubmit.addEventListener("click", () => {
            const answeredCount = Object.keys(this.userAnswers).length;
            const total = this.currentExam.questions.length;
            if (confirm(`Bạn đã hoàn thành ${answeredCount}/${total} câu hỏi. Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?`)) {
                this.submitExam();
            }
        });

        // Close score modal
        const btnCloseScore = document.getElementById("btn-close-score");
        if (btnCloseScore) {
            btnCloseScore.addEventListener("click", () => {
                this.dom.scoreModal.classList.remove("active");
            });
        }

        // Close packet inspector modal
        const btnClosePacket = document.getElementById("btn-close-packet");
        if (btnClosePacket && this.dom.packetModal) {
            btnClosePacket.addEventListener("click", () => {
                this.dom.packetModal.classList.remove("active");
            });
        }

        // Enforce Fullscreen button in Modal
        const btnReenterFullscreen = document.getElementById("btn-reenter-fullscreen");
        if (btnReenterFullscreen) {
            btnReenterFullscreen.addEventListener("click", () => {
                this.playTone("click");
                document.documentElement.requestFullscreen().catch(() => {});
                this.dom.fullscreenModal.classList.remove("active");
            });
        }

        // Acknowledge Strike Modal button
        const btnAckStrike = document.getElementById("btn-ack-strike");
        if (btnAckStrike) {
            btnAckStrike.addEventListener("click", () => {
                this.dom.strikeModal.classList.remove("active");
            });
        }
    }

    _bindAntiCheatEvents() {
        window.antiCheatEngine.subscribe((event, data) => {
            if (event === "THREAT_UPDATED") {
                this._updateThreatUI(data.threatScore, data.strikes);
            } else if (event === "VIOLATION") {
                this._appendLogEntry(data);
                this.playTone(data.severity === "CRITICAL" ? "alarm" : "warn");
            } else if (event === "STRIKE_ISSUED") {
                this.playTone("alarm");
                this._showStrikeWarning(data);
            } else if (event === "FULLSCREEN_VIOLATION") {
                this.playTone("alarm");
                this.dom.fullscreenModal.classList.add("active");
            } else if (event === "DISQUALIFIED") {
                this.playTone("alarm");
                this._showStrikeWarning({
                    reason: `ĐÌNH CHỈ THI: ${data.reason} (HỦY KẾT QUẢ BÀI THI)`,
                    strikes: window.antiCheatEngine.strikes,
                    maxStrikes: window.antiCheatEngine.maxStrikes
                });
                this.submitExam("Đình chỉ thi do vi phạm an ninh nghiêm trọng");
            }
        });
    }

    _bindTrafficEvents() {
        window.trafficTracker.subscribe((packet) => {
            this._appendTrafficRow(packet);
            this._updateTrafficMetrics();
        });
    }

    _updateThreatUI(threatScore, strikes) {
        // Mini sidebar
        if (this.dom.threatBarFill) {
            this.dom.threatBarFill.style.width = `${threatScore}%`;
        }
        if (this.dom.threatScoreText) {
            this.dom.threatScoreText.textContent = `${threatScore}%`;
        }
        if (this.dom.strikePills) {
            this.dom.strikePills.forEach((p, idx) => {
                if (idx < strikes) {
                    p.classList.add("active");
                } else {
                    p.classList.remove("active");
                }
            });
        }

        // SOC cards
        if (this.dom.socThreatValue) {
            this.dom.socThreatValue.textContent = `${threatScore}%`;
            this.dom.socThreatValue.style.color = threatScore > 60 ? "#ef4444" : (threatScore > 30 ? "#f59e0b" : "#10b981");
        }
        if (this.dom.socStrikesValue) {
            this.dom.socStrikesValue.textContent = `${strikes} / 3`;
            this.dom.socStrikesValue.style.color = strikes > 0 ? "#ef4444" : "#10b981";
        }

        // Header shield status
        if (this.dom.statusPill) {
            if (strikes >= 2 || threatScore >= 70) {
                this.dom.statusPill.style.color = "#ef4444";
                this.dom.statusPill.style.borderColor = "rgba(239, 68, 68, 0.5)";
                this.dom.statusPill.innerHTML = `<span class="pulse-dot" style="background:#ef4444"></span> COMPROMISED (STRIKE ${strikes})`;
            } else if (strikes > 0 || threatScore > 25) {
                this.dom.statusPill.style.color = "#f59e0b";
                this.dom.statusPill.style.borderColor = "rgba(245, 158, 11, 0.5)";
                this.dom.statusPill.innerHTML = `<span class="pulse-dot" style="background:#f59e0b"></span> SUSPICIOUS (${threatScore}%)`;
            } else {
                this.dom.statusPill.style.color = "#10b981";
                this.dom.statusPill.style.borderColor = "rgba(16, 185, 129, 0.4)";
                this.dom.statusPill.innerHTML = `<span class="pulse-dot"></span> PROCTOR V5.0 SECURE`;
            }
        }
    }

    _showStrikeWarning(data) {
        if (!this.dom.strikeModalText) return;
        this.dom.strikeModalText.innerHTML = `
            Hệ thống phát hiện hành vi vi phạm quy chế thi:<br>
            <b style="color: #ef4444; font-size: 1.1rem;">"${data.reason}"</b><br><br>
            Cảnh báo số: <b>${data.strikes} / ${data.maxStrikes}</b>.<br>
            <i>Lưu ý: Nếu nhận đủ 3 cảnh báo, hệ thống sẽ tự động đình chỉ thi và hủy toàn bộ kết quả!</i>
        `;
        this.dom.strikeModal.classList.add("active");
    }

    _appendLogEntry(record) {
        if (!this.dom.logStream) return;
        const entry = document.createElement("div");
        entry.className = "log-entry";
        entry.dataset.severity = record.severity;
        entry.innerHTML = `
            <div class="log-time">${record.timestamp}</div>
            <div class="log-severity ${record.severity}">[${record.severity}]</div>
            <div class="log-desc">
                <b>${record.type}:</b> ${this._escapeHTML(record.description)}
                <span style="opacity: 0.6; font-size: 0.7rem;">(Threat: ${record.threatScore}%)</span>
            </div>
        `;
        this.dom.logStream.insertBefore(entry, this.dom.logStream.firstChild);
    }

    _appendTrafficRow(packet) {
        if (!this.dom.trafficTableBody) return;
        const row = document.createElement("tr");
        row.dataset.threat = packet.threatLevel;

        const isBlocked = packet.status === 403;
        const methodClass = isBlocked ? "BLOCKED" : packet.method;

        row.innerHTML = `
            <td>${packet.timestamp}</td>
            <td><span class="packet-method ${methodClass}">${packet.method}</span></td>
            <td class="packet-url" title="${this._escapeHTML(packet.url)}">${this._escapeHTML(packet.url)}</td>
            <td>${packet.status}</td>
            <td>${packet.latency}ms</td>
            <td class="packet-status ${packet.threatLevel}">[${packet.threatLevel}] ${this._escapeHTML(packet.threatReason)}</td>
        `;

        row.addEventListener("click", () => {
            this.playTone("click");
            this._showPacketDetailModal(packet);
        });

        this.dom.trafficTableBody.insertBefore(row, this.dom.trafficTableBody.firstChild);
    }

    _showPacketDetailModal(packet) {
        if (!this.dom.packetModal || !this.dom.packetDetailContent) return;
        this.dom.packetDetailContent.innerHTML = `
            <div class="packet-detail-row"><b>Packet ID:</b> ${packet.id}</div>
            <div class="packet-detail-row"><b>Timestamp:</b> ${packet.timestamp}</div>
            <div class="packet-detail-row"><b>Protocol:</b> ${packet.protocol}</div>
            <div class="packet-detail-row"><b>HTTP Method:</b> ${packet.method}</div>
            <div class="packet-detail-row"><b>Target URL:</b> ${this._escapeHTML(packet.url)}</div>
            <div class="packet-detail-row"><b>Status:</b> ${packet.status} (${packet.statusText || 'N/A'})</div>
            <div class="packet-detail-row"><b>Latency:</b> ${packet.latency}ms</div>
            <div class="packet-detail-row"><b>Threat Assessment:</b> <span class="packet-status ${packet.threatLevel}">[${packet.threatLevel}] ${this._escapeHTML(packet.threatReason)}</span></div>
            <div class="packet-detail-row" style="margin-top:0.75rem;"><b>Request Headers:</b><pre style="background:#090d16; padding:6px; border-radius:4px; font-size:0.75rem; white-space:pre-wrap;">${this._escapeHTML(packet.headers || '{}')}</pre></div>
            <div class="packet-detail-row"><b>Payload / Body:</b><pre style="background:#090d16; padding:6px; border-radius:4px; font-size:0.75rem; max-height:120px; overflow-y:auto; white-space:pre-wrap;">${this._escapeHTML(packet.payload || '[No payload body]')}</pre></div>
        `;
        this.dom.packetModal.classList.add("active");
    }

    _updateTrafficMetrics() {
        const packets = window.trafficTracker.packets;
        const blocked = packets.filter(p => p.threatLevel === "CRITICAL" || p.status === 403).length;

        if (this.dom.socPacketsValue) {
            this.dom.socPacketsValue.textContent = packets.length;
        }
        if (this.dom.socBlockedValue) {
            this.dom.socBlockedValue.textContent = blocked;
        }
    }

    _renderFingerprintDetails(fp) {
        if (this.dom.fpCanvas) this.dom.fpCanvas.textContent = fp.canvasHash || "OK_0x4A29B";
        if (this.dom.fpGpu) this.dom.fpGpu.textContent = (fp.webglRenderer || "WebGL Available").substring(0, 36);
        if (this.dom.fpAudio) this.dom.fpAudio.textContent = fp.audioHash || "AC_44100";
        if (this.dom.fpScreen) this.dom.fpScreen.textContent = fp.screenRes + (fp.isExtended ? " (Multi-Display!)" : "");
        if (this.dom.fpCores) this.dom.fpCores.textContent = `${fp.cores} Cores / RAM: ${fp.memory}GB`;
        if (this.dom.fpAutomation) {
            this.dom.fpAutomation.textContent = fp.automationFlags.length ? fp.automationFlags.join(", ") : "CLEAN (No WebDriver)";
            if (fp.automationFlags.length) this.dom.fpAutomation.style.color = "#ef4444";
        }
    }

    /* ------------------------------------------------------------
       RED-TEAM ATTACK SIMULATOR HANDLERS
    ------------------------------------------------------------ */

    _bindSimulatorEvents() {
        const triggers = {
            "btn-sim-fullscreen": () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                } else {
                    window.antiCheatEngine._onFullscreenChange();
                }
            },
            "btn-sim-blur": () => {
                window.antiCheatEngine._onWindowBlur();
            },
            "btn-sim-copy": () => {
                window.antiCheatEngine._onCopyPaste({ type: "copy", preventDefault: ()=>{}, stopPropagation: ()=>{} });
            },
            "btn-sim-hotkey": () => {
                window.antiCheatEngine._onKeyDown({
                    key: "I",
                    ctrlKey: true,
                    shiftKey: true,
                    isTrusted: true,
                    preventDefault: ()=>{},
                    stopPropagation: ()=>{}
                });
            },
            "btn-sim-extension": () => {
                const fakeExtensionNode = document.createElement("div");
                fakeExtensionNode.id = "monica-quick-action-ai";
                fakeExtensionNode.className = "sider-chatgpt-floating-box";
                document.body.appendChild(fakeExtensionNode);
                setTimeout(() => fakeExtensionNode.remove(), 2000);
            },
            "btn-sim-untrusted": () => {
                // Dispatch synthetic untrusted click
                const fakeEvent = new MouseEvent("pointerdown", { bubbles: true, cancelable: true });
                // In browser, dispatchEvent always sets isTrusted = false!
                document.dispatchEvent(fakeEvent);
            },
            "btn-sim-keystroke-bot": () => {
                const now = Date.now();
                for (let i = 0; i < 10; i++) {
                    window.antiCheatEngine.keystrokes.push({ key: "A", delta: 4, timestamp: now + i * 4 });
                }
                window.antiCheatEngine._onKeyDown({
                    key: "A",
                    ctrlKey: false,
                    shiftKey: false,
                    isTrusted: true,
                    preventDefault: ()=>{},
                    stopPropagation: ()=>{}
                });
            },
            "btn-sim-ai-traffic": () => {
                window.fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: "gpt-4o",
                        messages: [{ role: "user", content: "Solve question 1 for me!" }]
                    })
                }).catch(() => {});
            },
            "btn-sim-hook": () => {
                // Temporarily inject a non-native rogue wrapper on window.fetch
                const original = window.fetch;
                const rogueFetch = function(...args) { return original.apply(this, args); };
                rogueFetch.__proctor_monitored = false;
                window.fetch = rogueFetch;
                window.antiCheatEngine._verifyNativeIntegrity();
                window.fetch = original;
            },
            "btn-sim-webdriver": () => {
                window.GM = { info: "Cheating Userscript Active" };
                window.antiCheatEngine._detectAutomationMarkers();
            },
            "btn-sim-gaze": () => {
                window.proctorAI.simulateGazeAway();
            },
            "btn-sim-faces": () => {
                window.proctorAI.simulateMultipleFaces();
            }
        };

        for (const [btnId, handler] of Object.entries(triggers)) {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener("click", () => {
                    this.playTone("warn");
                    handler();
                });
            }
        }

        // Log Filter Buttons
        document.querySelectorAll("#log-filters .filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll("#log-filters .filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const filter = btn.dataset.filter;
                document.querySelectorAll(".log-entry").forEach(entry => {
                    if (filter === "ALL" || entry.dataset.severity === filter) {
                        entry.style.display = "flex";
                    } else {
                        entry.style.display = "none";
                    }
                });
            });
        });

        // Traffic Filter Buttons
        document.querySelectorAll("#traffic-filters .filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll("#traffic-filters .filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const filter = btn.dataset.filter;
                document.querySelectorAll("#traffic-table-body tr").forEach(row => {
                    if (filter === "ALL" || row.dataset.threat === filter) {
                        row.style.display = "";
                    } else {
                        row.style.display = "none";
                    }
                });
            });
        });
    }

    _escapeHTML(str) {
        if (!str) return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
}

// Instantiate and start on DOM loaded
window.addEventListener("DOMContentLoaded", () => {
    window.app = new AppController();
    window.app.init();
});
