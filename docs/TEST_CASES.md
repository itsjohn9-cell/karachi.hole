# Karachi Hole.io - Complete Test Cases Specification & Automated Test Suite

This document specifies the formal test cases and testing architecture for **Karachi Hole.io: The City Savior**. It details the automated test suite executed every time the game runs, as well as the manual regression test cases required for cross-platform validation.

---

## 1. Test Automation Architecture

The test suite is powered by `scripts/test_runner.js` and can be invoked directly from the command line:

```bash
# Run against the scratch dev server (default port 5174)
npm test

# Run against the live production preview (port 5173)
npm run test:5173

# Run with custom parameters
node scripts/test_runner.js --port=5173 --screenshot-dir=./test_reports
```

### Automation Pipeline Mechanics
1. **Headless Chrome Automation**: Launches modern Chrome (`--headless=new`) with hardware-accelerated WebGL flags.
2. **Deterministic Virtual Time**: Uses `--virtual-time-budget` to allow Three.js rendering loops, physics simulations, and DOM animations to execute reliably without flaky timing issues.
3. **In-Session Script Injection**: Safely probes the live DOM, inspects `window.game` state, triggers modal events, and verifies camera coordinates.
4. **Visual Artifact Captures**: Generates high-resolution PNG screenshots for each test case into `test_reports/`.
5. **Auditable JSON Report**: Saves `test_reports/test_results.json` with execution timestamps, individual test status, durations, and diagnostic logs.

---

## 2. Automated Test Cases (Executed on Every Build & Run)

| Test ID | Name | Subsystem | Validation Scope | Expected Duration |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Core Modules Import Integrity | Engine / Modules | ES module resolution & syntax integrity | ~10ms |
| **TC-02** | Vite Production Bundle Build | Build System | Zero-error compilation & chunk minification | ~350ms |
| **TC-03** | Start Mission Onboarding Modal | UI / Onboarding | Name input, 3 age tiers, patrol launch | ~1100ms |
| **TC-04** | GTA Street Chase Camera | 3D Engine / Camera | 3rd-person street elevation & distance | ~1200ms |
| **TC-05** | Dedicated HUD Scoreboard | HUD / Tracking | Leaderboard, rank badge, mission counters | ~1150ms |
| **TC-06** | Pictorial Quiz Dilemma & Auto-Resume | Educational Engine | Non-skippable dilemma, pictorial cards, auto-resume | ~1300ms |
| **TC-07** | Auto-Pause on Window Inactivity | Game Loop / State | Blur/visibilitychange pause & resume button | ~1200ms |
| **TC-08** | Occlusion Ghosting & Anti-Stick Physics | Physics / World | Smooth corner deflection & building transparency | ~1250ms |
| **TC-09** | District Cleared & Level Advance | Progression Engine | Modal launch, prominent advance button, Level++ | ~1200ms |
| **TC-10** | Mobile Responsive Layout (375x667) | Responsive CSS | Stacked HUD cards, zero overlap, mobile joystick | ~1100ms |

---

### TC-01: Core Modules Import & Front-matter Syntax Integrity
- **Objective**: Ensure that all critical JavaScript modules load without parsing or syntax errors.
- **Preconditions**: Node.js v18+ environment.
- **Test Steps**:
  1. Dynamically import `src/districts.js`, `src/educationalChallenges.js`, and `src/hole.js`.
  2. Verify that exported classes and lookup dictionaries (`KARACHI_DISTRICTS`, `CIVIC_CHALLENGES`, `HoleGame`) are defined and conform to specifications.
- **Pass Criteria**: All modules resolve and load cleanly with 0 exceptions.
- **Automated Check**: `scripts/test_runner.js` -> `TC-01`.

---

### TC-02: Vite Production Bundle Compilation
- **Objective**: Verify that the application compiles into an optimized production bundle suitable for web hosting and Capacitor Android APK packaging.
- **Preconditions**: `npm install` dependencies up to date.
- **Test Steps**:
  1. Execute `npm run build` in non-interactive mode.
  2. Verify `dist/index.html` exists and is non-empty.
  3. Verify `dist/assets/*.js` and `dist/assets/*.css` are generated and minified.
- **Pass Criteria**: Vite returns exit code `0` and outputs compilation confirmation.
- **Automated Check**: `scripts/test_runner.js` -> `TC-02`.

---

### TC-03: Start Mission Onboarding & Age Selection Modal
- **Objective**: Validate the initial mission startup modal where players configure their Hero Name and select their age group before gameplay begins.
- **Preconditions**: Game page loaded at root URL.
- **Test Steps**:
  1. Check DOM for `#modal-start-mission` visibility.
  2. Verify input `#player-name-input` is pre-populated with default `"Karachi Hero"`.
  3. Verify `#start-age-grid` contains exactly 3 tiers:
     - **Kids (5–8 yrs)**: "Fun visual challenges & civic helpers".
     - **Junior (9–12 yrs)**: "Karachi landmarks & community care".
     - **Teens / Adults (13+)**: "Water tanker mafia, civic dilemmas & infrastructure".
  4. Click the Junior tier card and verify active selection state.
  5. Click `#btn-start-patrol`.
- **Pass Criteria**: Modal closes, `window.game.playerName` and `window.game.playerAgeGroup` update, and the 3D scene starts.
- **Screenshot Artifact**: `test_reports/tc03_start_onboarding_modal.png`.

---

### TC-04: Subway Surfers / GTA Third-Person Street Chase Camera
- **Objective**: Verify that the 3D camera is anchored low and tight behind the player hole (Subway Surfers / GTA style) rather than a distant bird's-eye top-down view.
- **Preconditions**: Game started after onboarding modal.
- **Test Steps**:
  1. Allow player to spawn at `(0, 0, 0)`.
  2. Inspect `window.game.camera.position`:
     - Height ($Y$): Must be between $2.0\text{m}$ and $4.5\text{m}$ ($2.65 + r \times 0.62$).
     - Chase distance behind player ($Z$ offset): Must be between $3.0\text{m}$ and $8.0\text{m}$ ($4.6 + r \times 0.95$).
  3. Inspect camera lookAt target: Must look ahead of the player ($Z - 4.5\text{m}$) into the street horizon.
- **Pass Criteria**: Camera $Y < 6.0\text{m}$ and camera is tilted forward into the street canyon with lateral steering banking.
- **Screenshot Artifact**: `test_reports/tc04_gta_street_camera.png`.

---

### TC-05: Dedicated Scoreboard & Live Mission Tracker
- **Objective**: Verify that the real-time scoreboard, player rank badge, and district mission status are prominently visible and dynamically updating during play.
- **Preconditions**: Game in active patrol state.
- **Test Steps**:
  1. Verify `#hud-scoreboard-card` exists in the top right.
  2. Verify `#hud-player-rank` renders current player placement (e.g. `⭐ RANK #1/4`).
  3. Verify `#hud-leaderboard` contains 4 competing holes sorted by score in descending order.
  4. Verify `#hud-district-counter` shows remaining district evils (e.g. `9 / 9 Left`).
- **Pass Criteria**: All scoreboard components render with contrasting typography, live score values, and zero layout shifting.
- **Screenshot Artifact**: `test_reports/tc05_scoreboard_and_tracking.png`.

---

### TC-06: Non-Skippable Pictorial Quiz Dilemma & Auto-Resume
- **Objective**: Verify that educational civic dilemma challenges cannot be dismissed without picking an answer, render rich pictorial choices, and automatically return the player to gameplay 1.2s after the correct answer.
- **Preconditions**: Game active, educational challenge triggered or `#btn-open-quiz` clicked.
- **Test Steps**:
  1. Trigger civic dilemma challenge.
  2. Verify `#modal-quiz` appears and game loop pauses (`isPaused === true`).
  3. Verify `#btn-close-quiz` is hidden or removed so the challenge is unskippable.
  4. Verify options contain pictorial badges (e.g. `💧`, `🚓`, `🌳`) and descriptive text.
  5. Click the correct answer card:
     - Verify green success feedback styling.
     - Verify reward notification (`+60 Bonus Points!`).
     - Wait 1200ms.
  6. Verify `#modal-quiz` auto-hides and the game automatically resumes without manual closing.
- **Pass Criteria**: Unskippable during presentation, feedback is immediate, and auto-resumes seamlessly into the game.
- **Screenshot Artifact**: `test_reports/tc06_pictorial_quiz_auto_resume.png`.

---

### TC-07: Auto-Pause on Inactivity with Resume Patrol Action
- **Objective**: Verify that switching browser tabs, minimizing the window, or navigating away automatically pauses the game with a dedicated resume modal.
- **Preconditions**: Active gameplay running.
- **Test Steps**:
  1. Trigger `document.dispatchEvent(new Event('visibilitychange'))` or call `ui.showAutoPauseModal()`.
  2. Verify `#modal-auto-pause` is displayed with "PATROL PAUSED - YOU STEPPED AWAY".
  3. Verify the game loop clock and timer stop ticking.
  4. Click `#btn-auto-resume`.
  5. Verify `#modal-auto-pause` hides and game patrol resumes immediately.
- **Pass Criteria**: Inactivity triggers instant pause; explicit resume button restores full gameplay.
- **Screenshot Artifact**: `test_reports/tc07_auto_pause_modal.png`.

---

### TC-08: Building Occlusion Ghosting & Corner Anti-Stick Physics
- **Objective**: Verify that players never get permanently trapped in street corners or blinded behind tall high-rises.
- **Preconditions**: Player active in street canyon.
- **Test Steps**:
  1. Position player at boundary corner `(92, 0, 92)`.
  2. Apply velocity vector `(1, 1)` into the corner.
  3. Verify anti-stick deflection: player smoothly slides along the boundary without penetrating walls or freezing.
  4. Cast occlusion ray between camera and player through adjacent building mesh.
  5. Verify building material toggles to transparent ghosting mode (`opacity: 0.15`).
- **Pass Criteria**: Player coordinates remain safely within $[-94, 94]$, velocity slides along edges, and occluding structures fade out.
- **Screenshot Artifact**: `test_reports/tc08_building_ghosting_corner_sliding.png`.

---

### TC-09: District Cleared Celebration & Next Level Advance Flow
- **Objective**: Verify that cleaning all civic evils in a district triggers a celebratory modal with a prominent "Next Level" advance button that advances to the next Karachi district.
- **Preconditions**: All target district evils devoured (`districtEvilsRemaining === 0`).
- **Test Steps**:
  1. Trigger `window.game.handleDistrictCleared()`.
  2. Verify `#modal-district-cleared` appears with civic transformation badge.
  3. Verify `#btn-next-district` displays `"🚀 GO TO NEXT LEVEL ➔"`.
  4. Click `#btn-next-district`.
  5. Verify `currentDistrictLevel` increments from 1 to 2.
  6. Verify new district configuration (e.g. Saddar Cultural District -> Clifton Beachfront) loads with refreshed civic crises and landmarks.
- **Pass Criteria**: Clear modal celebration appears; clicking next level advances the game to Level 2 without reload.
- **Screenshot Artifact**: `test_reports/tc09_district_cleared_advance.png`.

---

### TC-10: Cross-Device Responsiveness on Mobile Viewport (375x667)
- **Objective**: Verify that the entire HUD, radar mini-map, scoreboard, and touch joystick render cleanly on small smartphone screens without overlapping or clipping.
- **Preconditions**: Headless browser configured with `--window-size=375,667`.
- **Test Steps**:
  1. Load game and dismiss start mission modal.
  2. Inspect `#district-mission-banner` and `#hud-active-crisis` bounding boxes.
  3. Verify vertical gap between banner bottom and crisis card top ($> 0\text{px}$).
  4. Verify `#radar-canvas` renders scaled down to $72\times72\text{px}$.
  5. Verify virtual joystick touch zone `#joystick-zone` covers the lower screen half without obscuring buttons.
- **Pass Criteria**: Zero DOM collisions, all buttons touch-accessible ($> 44\text{px}$ touch targets), and responsive flex layouts adapt perfectly.
- **Screenshot Artifact**: `test_reports/tc10_mobile_viewport_responsiveness.png`.

---

## 3. Manual & Regression Test Cases (QA Matrix)

The following test cases are validated manually before every major version release and across physical mobile devices:

### TC-11: Multi-Touch Virtual Joystick Precision
- **Platform**: Real Android Device (Chrome / Capacitor APK) & iOS Safari.
- **Steps**:
  1. Touch and hold thumb on bottom left quadrant.
  2. Drag circle outward in $360^\circ$ rotation.
  3. Verify nipple indicator follows thumb with spring centering on release.
- **Pass Criteria**: Zero jitter, smooth 60fps hole translation.

### TC-12: Audio Settings & Sound Toggle State Persistence
- **Steps**:
  1. Click audio mute toggle button `#btn-sound-toggle`.
  2. Verify all sound effects (devour, splash, siren, victory) are muted.
  3. Reload browser page.
  4. Verify sound toggle remains muted (persisted in `localStorage.getItem('karachiHole_soundMuted')`).
- **Pass Criteria**: Audio state persists across sessions without resetting to default loud.

### TC-13: Truck Art & Cultural Skin Switcher
- **Steps**:
  1. Open skin selection drawer `#btn-open-skins`.
  2. Switch between **Truck Art Vibrant**, **Ajrak Royal Blue**, **Green Crescent**, and **Golden Star**.
  3. Verify hole ring shader updates with chosen palette immediately in 3D viewport.
- **Pass Criteria**: Skin textures map correctly without WebGL shader compilation stutters.

### TC-14: Water Tanker Devour & City Delivery Transformation
- **Steps**:
  1. Patrol Saddar district until a water tanker mafia truck is located.
  2. Grow hole radius to $> 2.2\text{m}$ to satisfy swallowing threshold.
  3. Devour the tanker truck.
  4. Observe visual feedback: water splash particle burst, joyful chime, and neighborhood water pipe status banner turning to `"💧 Water Restored to 2,500 Homes!"`.
- **Pass Criteria**: Devouring civic evil converts scene to positive civic transformation.

### TC-15: Protected Civic Friends Devour Immunity
- **Steps**:
  1. Navigate hole directly under an Edhi Ambulance or school bus.
  2. Attempt to swallow.
  3. Verify object does NOT drop into hole.
  4. Verify warning toast: `"🚨 Warning! Protect Civic Helpers & Ambulances!"`.
- **Pass Criteria**: Protected civic entities cannot be consumed and trigger educational alert.

### TC-16: Age Group Quiz Difficulty Calibration
- **Steps**:
  1. Start game selecting **Kids (5–8)**: verify questions focus on simple pictograms (trash bins, traffic signals, trees).
  2. Restart and select **Junior (9–12)**: verify questions test Karachi landmarks and civic responsibilities.
  3. Restart and select **Adult (13+)**: verify questions cover water management, fire safety, and illegal parking.
- **Pass Criteria**: Question bank matches selected demographic tier accurately.

### TC-17: AI Opponent Dynamic Difficulty Scaling
- **Steps**:
  1. Observe 3 AI opponent holes across 120 seconds.
  2. Verify AI holes seek nearby small debris first, avoiding larger buildings until grew.
  3. In District 1, AI patrol speed is capped at $0.85\times$. In District 3+, AI speed scales to $1.15\times$.
- **Pass Criteria**: AI holes provide organic competition without teleporting or getting stuck.

### TC-18: High-DPI Retina Display Performance
- **Steps**:
  1. Run game on MacBook Retina (2x pixel ratio) or 4K monitor.
  2. Verify `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` caps pixel ratio to 2.0 to prevent GPU thermal throttling.
  3. Monitor FPS counter.
- **Pass Criteria**: Sustained 60 FPS without frame drops or overheating.

### TC-19: Battery Saver & Background Throttling
- **Steps**:
  1. Run game on Android device with Battery Saver enabled.
  2. Minimize app for 30 seconds.
  3. Return to app.
- **Pass Criteria**: Auto-pause triggers immediately upon minimize; returning cleanly prompts "Resume Patrol" without crashing WebGL context.

### TC-20: Offline Gameplay (Zero Network Dependency)
- **Steps**:
  1. Turn off Wi-Fi and Cellular data.
  2. Launch game in browser (PWA cached) or Capacitor native APK.
- **Pass Criteria**: All 3D procedural models, audio chimes, quizzes, and textures load from local bundle with zero network requests.

---

## 4. Test Execution Summary & Quality Gates

To guarantee that no regression enters the codebase:
1. **Local Pre-Commit Gate**: `npm test` must output `10/10 PASSED` with 0 failures before any code commit.
2. **Build Verification**: `npm run build` must succeed without warnings or unbundled asset errors.
3. **Screenshot Review**: Check `test_reports/*.png` for layout fidelity and visual clarity.
