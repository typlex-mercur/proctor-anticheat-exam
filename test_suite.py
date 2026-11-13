"""
Comprehensive Automated Verification Suite for Proctor Anti-Cheat Exam System (V5.1).
Runs headless browser tests using Selenium to verify all functional and security layers:
- UI Question loading, options, palette navigation, and state locking
- Deep Packet Inspection (DPI): Interception of Fetch, XHR, and navigator.sendBeacon
- Multi-AI Firewall: Blocking OpenAI, DeepSeek, and Ollama local server
- Deep Anti-Cheat: Blur debouncing, Tampermonkey markers, Custom AI tags, Nested containers
- Event Trust verification: Rejecting synthetic click bots on exam navigation
- Packet Detail Inspector Modal: Viewing payload and headers in SOC view
- Strike system & Auto-disqualification lockdown
"""

import sys
import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By

def run_tests():
    print("=== STARTING PROCTOR ANTI-CHEAT VERIFICATION ===")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(script_dir, "index.html")
    file_url = f"file:///{html_path.replace(os.sep, '/')}"
    print(f"Target URL: {file_url}")

    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1600,1000")

    driver = webdriver.Chrome(options=chrome_options)
    
    passed = 0
    total = 0

    def assert_test(name, condition, details=""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"[PASS] {name} {details}")
        else:
            print(f"[FAIL] {name} {details}")
            raise AssertionError(f"Assertion failed for: {name} - {details}")

    try:
        driver.get(file_url)
        time.sleep(1.2)

        # Allow tests to perform security checks without tripping maxStrikes prematurely
        driver.execute_script("window.antiCheatEngine.maxStrikes = 20;")

        # TEST 1: Page Title and UI Header
        assert_test("Test 1: Page Header and Title", 
                    "Hệ Thống Thi Trực Tuyến" in driver.title)
        
        exam_title = driver.find_element(By.ID, "exam-title").text
        assert_test("Test 2: Exam Title Loaded", len(exam_title) > 0, f"({exam_title})")

        # TEST 3: Question 1 Content and Options
        q_badge = driver.find_element(By.ID, "q-badge").text
        assert_test("Test 3: Question Badge", "CÂU 1" in q_badge or "CÂU 01" in q_badge, f"({q_badge})")

        options = driver.find_elements(By.CLASS_NAME, "option-card")
        assert_test("Test 4: Four Options Rendered", len(options) == 4, f"(Found {len(options)})")

        # TEST 5: Select Option A and verify Selection State
        options[0].click()
        time.sleep(0.3)
        options = driver.find_elements(By.CLASS_NAME, "option-card")
        assert_test("Test 5: Option A Selected Style", "selected" in options[0].get_attribute("class"))

        # TEST 6: Navigation - Next Question
        btn_next = driver.find_element(By.ID, "btn-next")
        btn_next.click()
        time.sleep(0.3)
        q_badge_2 = driver.find_element(By.ID, "q-badge").text
        assert_test("Test 6: Navigated to Question 2", "CÂU 2" in q_badge_2 or "CÂU 02" in q_badge_2, f"({q_badge_2})")

        # TEST 7: Traffic Tracker - Heartbeat and Network Packets
        packets_count = driver.execute_script("return window.trafficTracker.packets.length;")
        assert_test("Test 7: Traffic Tracker Recording Packets", packets_count >= 1, f"(Packets: {packets_count})")

        # TEST 8: Deep Packet Inspection - Block OpenAI API Call
        block_openai = driver.execute_async_script("""
            const done = arguments[0];
            window.fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                body: JSON.stringify({ prompt: "Solve this exam question" })
            }).then(res => {
                res.json().then(data => done({ status: res.status, data }));
            }).catch(err => done({ error: err.message }));
        """)
        assert_test("Test 8: OpenAI API Blocked with 403 Forbidden", 
                    block_openai.get("status") == 403 and block_openai.get("data", {}).get("error") == "BLOCKED_BY_PROCTOR_FIREWALL")

        # TEST 9: Deep Packet Inspection - Block DeepSeek API Call
        block_deepseek = driver.execute_async_script("""
            const done = arguments[0];
            window.fetch("https://api.deepseek.com/v1/chat/completions", {
                method: "POST",
                body: JSON.stringify({ prompt: "Solve question" })
            }).then(res => done(res.status))
            .catch(err => done(0));
        """)
        assert_test("Test 9: DeepSeek API Blocked with 403 Forbidden", block_deepseek == 403)

        # TEST 10: Deep Packet Inspection - Block Ollama Local AI Server (Port 11434)
        block_ollama = driver.execute_async_script("""
            const done = arguments[0];
            window.fetch("http://localhost:11434/api/generate", {
                method: "POST",
                body: JSON.stringify({ model: "llama3", prompt: "exam prompt" })
            }).then(res => done(res.status))
            .catch(err => done(0));
        """)
        assert_test("Test 10: Ollama Local Server Blocked with 403 Forbidden", block_ollama == 403)

        # TEST 11: Deep Packet Inspection - Intercept & Block navigator.sendBeacon
        beacon_before = driver.execute_script("return window.trafficTracker.packets.length;")
        driver.execute_script("navigator.sendBeacon('https://api.openai.com/v1/chat/completions', '{\"prompt\":\"leak\"}');")
        beacon_after = driver.execute_script("return window.trafficTracker.packets.length;")
        blocked_beacons = driver.execute_script("return window.trafficTracker.packets.filter(p => p.protocol === 'BEACON' && p.status === 403).length;")
        assert_test("Test 11: sendBeacon Exfiltration Blocked & Recorded", beacon_after > beacon_before and blocked_beacons >= 1)

        # TEST 12: Packet Detail Inspector Modal Opens on Row Click
        driver.execute_script("""
            const rows = document.querySelectorAll('#traffic-table-body tr');
            if (rows.length > 0) rows[0].click();
        """)
        time.sleep(0.3)
        packet_modal_active = driver.execute_script("""
            return document.getElementById('modal-packet').classList.contains('active');
        """)
        driver.execute_script("document.getElementById('btn-close-packet').click();")
        assert_test("Test 12: DPI Packet Detail Inspector Modal Active", packet_modal_active is True)

        # TEST 13: Anti-Cheat Layer - Trigger Window Blur
        driver.execute_script("window.antiCheatEngine._onWindowBlur();")
        time.sleep(0.3)
        threat_score = driver.execute_script("return window.antiCheatEngine.threatScore;")
        strikes = driver.execute_script("return window.antiCheatEngine.strikes;")
        assert_test("Test 13: Blur Detection Recorded Strike and Threat Score", strikes >= 1 and threat_score > 0, 
                    f"(Strikes: {strikes}, Threat: {threat_score}%)")

        # TEST 14: Proctor AI - Eye Gaze Looking Away Simulation
        driver.execute_script("window.proctorAI.simulateGazeAway();")
        time.sleep(0.3)
        violations = driver.execute_script("return window.antiCheatEngine.violations.map(v => v.type);")
        assert_test("Test 14: Gaze Looking Away Detected", "HEAD_GAZE_LOOKING_AWAY" in violations)

        # TEST 15: AI Extension Custom Tag Injection (<monica-sidebar>)
        driver.execute_script("""
            const monicaTag = document.createElement('monica-sidebar');
            document.body.appendChild(monicaTag);
        """)
        time.sleep(0.4)
        violations = driver.execute_script("return window.antiCheatEngine.violations.map(v => v.type);")
        assert_test("Test 15: AI Custom Element <monica-sidebar> Caught", "AI_EXTENSION_DOM_INJECTION" in violations)

        # TEST 16: AI Extension Nested Container (.sider-chatgpt-floating-box)
        driver.execute_script("""
            const outer = document.createElement('div');
            const inner = document.createElement('div');
            inner.className = 'sider-chatgpt-floating-box';
            outer.appendChild(inner);
            document.body.appendChild(outer);
        """)
        time.sleep(0.4)
        violations = driver.execute_script("return window.antiCheatEngine.violations.map(v => v.type);")
        assert_test("Test 16: Nested AI Extension Container Caught", "AI_EXTENSION_DOM_INJECTION" in violations)

        # TEST 17: Tampermonkey Userscript Framework Detection (window.GM)
        driver.execute_script("""
            window.GM = { info: "Cheating userscript engine" };
            window.antiCheatEngine._detectAutomationMarkers();
        """)
        time.sleep(0.3)
        violations = driver.execute_script("return window.antiCheatEngine.violations.map(v => v.type);")
        assert_test("Test 17: Tampermonkey Userscript Engine Caught", "AUTOMATION_FRAMEWORK_DETECTED" in violations)

        # TEST 18: Untrusted Bot Click on btn-next Blocked
        idx_before = driver.execute_script("return window.app.currentIndex;")
        driver.execute_script("""
            document.getElementById('btn-next').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        """)
        time.sleep(0.3)
        idx_after = driver.execute_script("return window.app.currentIndex;")
        violations = driver.execute_script("return window.antiCheatEngine.violations.map(v => v.type);")
        assert_test("Test 18: Untrusted Click Bot Blocked on Navigation Button", 
                    idx_after == idx_before and "UNTRUSTED_CLICK_BOT" in violations)

        # TEST 19: Disqualification Enforced when strikes >= maxStrikes
        driver.execute_script("""
            window.antiCheatEngine.maxStrikes = window.antiCheatEngine.strikes; // Set threshold to current
            window.antiCheatEngine.addStrike("Vượt ngưỡng vi phạm tối đa");
        """)
        time.sleep(0.5)
        is_disqualified = driver.execute_script("""
            return window.antiCheatEngine.isDisqualified === true && window.antiCheatEngine.violations.some(v => v.type === 'DISQUALIFIED');
        """)
        assert_test("Test 19: Disqualification & Lockdown Enforced on Max Strikes", is_disqualified)

        # TEST 20: Score & Forensic Report Active and Options Locked
        score_modal_active = driver.execute_script("""
            return document.getElementById('modal-score').classList.contains('active');
        """)
        options_locked = driver.execute_script("""
            return document.getElementById('options-container').classList.contains('locked');
        """)
        assert_test("Test 20: Score Modal Active & Options Locked Post-Submission", score_modal_active and options_locked)

        print("\n" + "="*50)
        print(f"ALL TESTS PASSED: {passed} / {total} tests verified successfully!")
        print("="*50)

    finally:
        driver.quit()

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"[ERROR] Test suite failed: {e}")
        sys.exit(1)
