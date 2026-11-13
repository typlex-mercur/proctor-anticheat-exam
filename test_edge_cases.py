"""
Edge Case and Boundary Verification Suite for Proctor Anti-Cheat System (V5.1):
1. Exam switcher: cybersec (20 questions) <-> logic_dgnl (15 questions)
2. Flagging questions and clearing choices
3. Copy-Paste and shortcut blocking (Ctrl+A, Ctrl+C, F12, Ctrl+Shift+I)
4. Keystroke Dynamics / Superhuman typing bot detection (< 18ms delta)
5. Adversarial Honeypot text inclusion in candidate innerText
6. Red-Team Native Hook simulator button execution
7. Post-submission answer immutability protection
8. Fullscreen exit enforcement modal
"""

import sys
import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

def run_edge_tests():
    print("=== STARTING PROCTOR EDGE-CASE VERIFICATION ===")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(script_dir, "index.html")
    file_url = f"file:///{html_path.replace(os.sep, '/')}"

    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
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
            raise AssertionError(f"Assertion failed: {name} - {details}")

    try:
        driver.get(file_url)
        time.sleep(1.2)

        # Allow edge tests to execute multiple security triggers without premature disqualification
        driver.execute_script("window.antiCheatEngine.maxStrikes = 20;")

        # EDGE TEST 1: Switch Exam to 'logic_dgnl'
        select_elem = driver.find_element(By.ID, "exam-select-dropdown")
        select = Select(select_elem)
        select.select_by_value("logic_dgnl")
        time.sleep(0.4)

        palette_btns = driver.find_elements(By.CLASS_NAME, "palette-btn")
        assert_test("Edge 1: Switch to Logic ĐGNL Bank (15 questions)", len(palette_btns) == 15, f"(Found {len(palette_btns)} buttons)")

        q_category = driver.find_element(By.ID, "q-category").text
        assert_test("Edge 2: Logic Category Loaded", "Algorithms" in q_category or "Complexity" in q_category or "Logic" in q_category, f"({q_category})")

        # EDGE TEST 3: Flag question and verify palette status
        flag_checkbox = driver.find_element(By.ID, "flag-checkbox")
        flag_checkbox.click()
        time.sleep(0.3)
        palette_btns = driver.find_elements(By.CLASS_NAME, "palette-btn")
        assert_test("Edge 3: Question 1 Flagged Style in Palette", "flagged" in palette_btns[0].get_attribute("class"))

        # EDGE TEST 4: Select answer, then Clear Choice
        options = driver.find_elements(By.CLASS_NAME, "option-card")
        options[1].click() # Select B
        time.sleep(0.3)
        options = driver.find_elements(By.CLASS_NAME, "option-card")
        assert_test("Edge 4: Option B Selected", "selected" in options[1].get_attribute("class"))

        btn_clear = driver.find_element(By.ID, "btn-clear")
        btn_clear.click()
        time.sleep(0.2)
        options = driver.find_elements(By.CLASS_NAME, "option-card")
        is_cleared = all("selected" not in opt.get_attribute("class") for opt in options)
        assert_test("Edge 5: Answer Cleared Successfully", is_cleared)

        # EDGE TEST 6: Copy Event Blocked
        copy_blocked = driver.execute_script("""
            const event = new Event('copy', { bubbles: true, cancelable: true });
            document.dispatchEvent(event);
            return event.defaultPrevented;
        """)
        assert_test("Edge 6: Copy Event defaultPrevented", copy_blocked is True)

        # EDGE TEST 7: Hotkey F12 and Ctrl+Shift+I Blocked
        hotkey_blocked = driver.execute_script("""
            const e1 = new KeyboardEvent('keydown', { key: 'F12', keyCode: 123, bubbles: true, cancelable: true });
            window.dispatchEvent(e1);
            const e2 = new KeyboardEvent('keydown', { key: 'I', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true });
            window.dispatchEvent(e2);
            return e1.defaultPrevented && e2.defaultPrevented;
        """)
        assert_test("Edge 7: DevTools Hotkeys F12 and Ctrl+Shift+I Blocked", hotkey_blocked is True)

        # EDGE TEST 8: Keystroke Bot Detection (< 18ms delta)
        driver.execute_script("""
            const now = Date.now();
            window.antiCheatEngine.keystrokes = [];
            for (let i = 0; i < 10; i++) {
                window.antiCheatEngine.keystrokes.push({ key: 'a', delta: 5, timestamp: now - (10 - i) * 5 });
            }
            window.antiCheatEngine.lastInputTime = now - 5;
            window.antiCheatEngine._onKeyDown({
                key: 'a',
                isTrusted: true,
                ctrlKey: false,
                shiftKey: false,
                preventDefault: () => {},
                stopPropagation: () => {}
            });
        """)
        time.sleep(0.3)
        violations = driver.execute_script("return window.antiCheatEngine.violations.map(v => v.type);")
        assert_test("Edge 8: Superhuman Keystroke Bot Flagged", "SUPERHUMAN_KEYSTROKE_BOT" in violations)

        # EDGE TEST 9: Fullscreen Exit and Re-enter Warning Modal
        driver.execute_script("window.antiCheatEngine._onFullscreenChange();")
        time.sleep(0.3)
        fs_modal_active = driver.execute_script("return document.getElementById('modal-fullscreen').classList.contains('active');")
        assert_test("Edge 9: Fullscreen Exit Triggered Enforcer Modal", fs_modal_active is True)
        driver.execute_script("document.getElementById('btn-reenter-fullscreen').click();")

        # EDGE TEST 10: Honeypot Decoy in question-body innerText (accessible to AI scrapers)
        has_honeypot = driver.execute_script("""
            return document.querySelector('.question-body').innerText.includes('CHEAT_VIOLATION_CONFIRMED');
        """)
        assert_test("Edge 10: Adversarial Honeypot Present in innerText", has_honeypot is True)

        # EDGE TEST 11: Red-Team Simulator Hook Button Triggers Native Hook Violation
        v_before = driver.execute_script("return window.antiCheatEngine.violations.length;")
        driver.execute_script("document.getElementById('btn-sim-hook').click();")
        time.sleep(0.3)
        v_after = driver.execute_script("return window.antiCheatEngine.violations.length;")
        assert_test("Edge 11: Red-Team Native Hook Simulator Triggers Violation", v_after > v_before)

        # EDGE TEST 12: Post-Submission Answer Immutability (Clear choice blocked after submit)
        driver.execute_script("window.app.selectAnswer(1, 1); window.app.submitExam();")
        ans_before = driver.execute_script("return window.app.userAnswers[1];")
        driver.execute_script("document.getElementById('btn-clear').click();")
        ans_after = driver.execute_script("return window.app.userAnswers[1];")
        assert_test("Edge 12: Answers Locked & Cannot Be Cleared Post-Submission", ans_before == ans_after)

        print("\n" + "="*50)
        print(f"ALL EDGE TESTS PASSED: {passed} / {total} edge tests verified!")
        print("="*50)

    finally:
        driver.quit()

if __name__ == "__main__":
    try:
        run_edge_tests()
    except Exception as e:
        print(f"[ERROR] Edge test failed: {e}")
        sys.exit(1)
