# KARACHI RUNNER - Test Cases Specification & Automated Test Suite

This document specifies the formal test cases and testing architecture for **KARACHI RUNNER**, including automated browser regressions and manual device checks.

---

## 1. Test Automation Architecture

### Gameplay audit regressions (2026-10-27)

- **TC-53**: Contact shadows, fast-fall landing, slide hitbox dimensions and road decals.
- **TC-54**: Skyline/sky, 180 ms lane interpolation, speed FOV and headlight beams.
- **TC-55**: Near-miss feedback, speed wind lines, magnet attraction and emissive signage.
- **TC-56**: Airborne low-hazard grazes do not cause stumbles; boost-speed near misses reward exactly once and unlock Road Safety.
- **TC-57**: Boundary inputs cannot release a drafting boost; the real bus-boarding update does not throw; immediate crash/restart cancels old animation and transient movement state.
- **TC-58**: Repeated pickup cleanup and corridor disposal return GPU geometry/texture counts to baseline without disposing shared city materials.
- **TC-59**: Runner HUD and pause menu show current-run score rather than career XP; classic mode retains player score; new runs clear score, power-ups and vertical motion.

Run the focused checks with
`node scripts/test_runner.js --only=TC-53,TC-54,TC-55,TC-56,TC-57,TC-58,TC-59`.
TC-01 and TC-02 always execute, including the production build and Android asset-copy check.
Browser tests use isolated Chrome profiles but temporarily inject the working
`index.html`; do not run them concurrently with an interactive gameplay audit.

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
| **TC-01** | Core Modules & Release Configuration Integrity | Modules / Route / Android / PWA | Name-only Karachi route, Android API 36 and WebView hardening, valid PWA icon resources | ~10ms |
| **TC-02** | Production Bundle & Android Asset Sync | Build System / Capacitor | Build compilation and Android bundle parity | ~350ms |
| **TC-03** | Runner Onboarding & Viewport Fit | UI / Responsive Layout | Karachi areas, pace/getup selection and 375x667 fit | ~1100ms |
| **TC-04** | Karachi Street-Level Camera | 3D Engine / Camera | 3rd-person street elevation & distance | ~1200ms |
| **TC-05** | Dedicated HUD Scoreboard | HUD / Tracking | Leaderboard, rank badge, mission counters | ~1150ms |
| **TC-06** | Pictorial Quiz Dilemma & Auto-Resume | Educational Engine | Non-skippable dilemma, pictorial cards, auto-resume | ~1300ms |
| **TC-07** | Auto-Pause on Window Inactivity | Game Loop / State | Blur/visibilitychange pause & resume button | ~1200ms |
| **TC-08** | Occlusion Ghosting & Anti-Stick Physics | Physics / World | Smooth corner deflection & building transparency | ~1250ms |
| **TC-09** | District Cleared & Level Advance | Progression Engine | Modal launch, prominent advance button, Level++ | ~1200ms |
| **TC-10** | Mobile Responsive Layout (375x667) | Responsive CSS | Stacked HUD cards, zero overlap, mobile joystick | ~1100ms |
| **TC-11** | Runner Arrow-Key Lane Precision | Runner / Controls | Left/right lane selection and stable camera heading | ~2400ms |
| **TC-12** | Navigation Guidance | HUD / World | 3D chevron and objective direction | ~2300ms |
| **TC-13** | District 2 Gameplay | Progression / Physics | Scene load, collision, camera tracking and quiz rotation | ~2300ms |
| **TC-14** | Automatic Career Restore | Save System | Restore XP, getup and patrol area without a continue button | ~2300ms |
| **TC-15** | Dialogue & Journal | UI / Gameplay | Citizen dialogue, journal and jump traversal | ~2300ms |
| **TC-16** | Game Menu & Settings | UI | Menu navigation, settings and return flow | ~2300ms |
| **TC-17** | Runner Lane Controls | Runner / Controls | Lane selection, smoothing and bounds | ~2300ms |
| **TC-18** | Runner Jump & Slide | Runner / Physics | Jump, crouch and traversal models | ~2300ms |
| **TC-19** | Runner Coins & Magnet | Runner / Power-Ups | Coin collection and magnet attraction | ~2300ms |
| **TC-20** | Runner Hearts & Shield | Runner / Power-Ups | Shield absorption, damage and healing | ~2300ms |
| **TC-21** | Traffic Drafting & Boost | Runner / Traffic | Drafting, slingshot and speed display | ~2300ms |
| **TC-22** | Runner Playability Regression | Runner / Controls / HUD | Start, camera, HUD, single-action controls and restart | ~2300ms |
| **TC-23** | Runner Swept Collision | Runner / Physics | Boost-speed hazard, traffic, coin and power-up detection | ~2300ms |
| **TC-24** | Runner Crash Review & Revive Availability | Runner / Game Over | Single top-level hazard explanation and token-gated revive | ~3500ms |
| **TC-25** | Runner Power-Ups & Karachi Streetscape | Runner / World | Reachable power-ups and street signage | ~3500ms |
| **TC-26** | Tutorial Gate & Mobile Crash Layout | Runner / Responsive Layout | One-time tutorial, delayed resume and no-scroll crash review | ~3600ms |
| **TC-27** | Progression & Getup Selection | Save System / Avatar | Unlock requirements, live model swap and Master Mode | ~2800ms |
| **TC-28** | Runner Career Reset | Save System | Clear saved progress and restore default run state | ~3500ms |
| **TC-29** | Karachi Patrol Area Scenery | Runner / World | Distinct Soldier Bazar / PECHS, Lyari and Saddar landmarks and route-only challenges | ~3500ms |
| **TC-30** | Runner Reward Persistence | Progression / Save System | Runner XP persistence, area unlock, district-clear rewards | ~3500ms |
| **TC-31** | Runner Startup Isolation | Runner / Startup | Runner-only scene, route objects and physics events | ~3500ms |
| **TC-32** | Runner Touch Controls & Feedback Layout | Runner / UI | Mobile button layout, hidden legacy controls, non-overlapping notifications | ~3000ms |
| **TC-33** | Rescue Token Collection & Quick Revive Cost | Runner / Progression | Rare token drops, persistence, revive consumption and no-token rejection | ~3500ms |
| **TC-34** | Home-Screen Help & Career Progress | Runner / UI | Home-screen controls guide, career records, collections and achievements | ~1100ms |
| **TC-35** | Monsoon Potholes & Unified Master/Dev Console | Runner / Weather / Developer Tools | Rain-to-pothole gameplay, fair lane availability, shared console routing and single command transport | ~5000ms |
| **TC-36** | Named Karachi Neighborhood Loop & Progressive Challenge | Runner / Route / Difficulty | Named neighborhood route, Soldier Bazar return, area progression, difficulty ramp and saved result | ~4500ms |
| **TC-37** | Home, Help, Progress & Results Button UI Audit | Runner / UI / Responsive Layout | Button hierarchy, accessible touch targets, help/progress dialogs and mobile viewport fit | ~2800ms |
| **TC-38** | Master/Developer Runner Console Audit | Developer Tools / Runner / UI | Unified entry points, current Runner telemetry/actions, active-run gating, stale-control removal | ~2800ms |
| **TC-39** | High-Visibility Runner Hazards & Warning | Runner / Hazards / UI | Contrast-safe potholes, approach markers, nearest-hazard action warning and mobile viewport fit | ~1500ms |
| **TC-40** | Karachi Area Selection Card Overflow | Runner / Onboarding / Responsive Layout | Saddar card and title stay within the area selection panel at a tablet-width viewport | ~1500ms |
| **TC-41** | Master QA Self-Check & Safe Obstacle Controls | Master Tools / Runner / Operations Log | Live integrity check, authorized scenario spawn/clear, and persistent event history | ~1500ms |
| **TC-42–44** | Master clear-all/bot, turns & forks, classic landmarks | Runner / Master / Scenery | Sender-gated Master tools, junction turns/forks, v1.0 landmark streets | ~3000ms |
| **TC-45** | Seamless Corner Turn | Runner / Turns | Real cross-road chunks, arc path with no player/camera jump, identical street frame across turn finish, mid-turn screenshot | ~2000ms |
| **TC-46** | HUD Popup Layout (14 screen sizes) | Runner / Responsive Layout | With every popup shown at once (stats pill, rescue, power-up, combo, hazard alert, announcement, turn guide, floating points, dev toast) none overlap each other or the touch controls and none leave the viewport, from 320x568 to 1920x1080 incl. landscape phones and tablets | ~3000ms each |
| **TC-47** | Controls Tutorial Layout | Runner / Responsive Layout | Tutorial card fits 320x568, 568x320 and 1366x768, and all other popups are hidden while it is open | ~3000ms each |
| **TC-48** | Master Powers Panel | Master Control | Every in-game Master powers button (autorun, immortal, clear, complete, hearts, junction spawns) works | ~3000ms |
| **TC-49** | Pace Route Layout | Runner / Difficulty | Easy schedules forks only (no turns), Standard mixes turns and forks, Hard is denser; Master can still force turns on Easy | ~2500ms |

---

### TC-01: Core Modules & Release Configuration Integrity
- **Objective**: Validate core imports, name-only Karachi route labels, Android production settings, and installable web icon resources.
- **Preconditions**: Node.js v18+ environment.
- **Test Steps**: Import core modules; validate route names, Android target API/WebView settings, and the PWA icon manifest.
- **Pass Criteria**: Modules resolve; the route begins and ends in Soldier Bazar with no numbered locality labels; Android targets API 36 with mixed content and WebView debugging disabled; and the declared 512px PWA icon exists.
- **Automated Check**: `scripts/test_runner.js` -> `TC-01`.

---

### TC-02: Production Bundle & Android Asset Sync
- **Objective**: Verify that the application compiles into an optimized production bundle suitable for web hosting and Capacitor Android APK packaging.
- **Preconditions**: `npm install` dependencies up to date.
- **Test Steps**:
  1. Execute `npm run build` in non-interactive mode.
  2. Verify `dist/index.html` exists and is non-empty.
  3. Verify `dist/assets/*.js` and `dist/assets/*.css` are generated and minified.
  4. Copy the build into Android assets and compare the copied index and asset filenames with `dist`.
- **Pass Criteria**: Vite and Capacitor copy return exit code `0`; Android assets match the current web build.
- **Automated Check**: `scripts/test_runner.js` -> `TC-02`.

---

### TC-03: KARACHI RUNNER Onboarding & Viewport Fit
- **Objective**: Validate the runner-only start screen and ensure it fits a 375x667 mobile viewport without scrolling.
- **Preconditions**: Game page loaded at root URL.
- **Test Steps**:
  1. Check DOM for `#modal-start-mission` visibility.
  2. Verify the title is `KARACHI RUNNER`; no player-name input or repeated district label is shown.
  3. Verify three Karachi areas, three runner pace choices and five getup choices.
  4. Verify the modal and RUN button fit the viewport and the modal has no hidden overflow.
- **Pass Criteria**: The first screen is visible without page/modal scrolling and exposes the intended runner setup.
- **Screenshot Artifact**: `test_reports/tc03_start_onboarding_modal.png`.

---

### TC-04: Karachi Street-Level Chase Camera
- **Objective**: Verify that the 3D camera is anchored low and tight behind the player rather than a distant bird's-eye top-down view.
- **Preconditions**: Game started after onboarding modal.
- **Test Steps**:
  1. Allow player to spawn at `(0, 0, 0)`.
  2. Inspect `window.game.camera.position`:
     - Height ($Y$): Must be between $2.0\text{m}$ and $4.5\text{m}$ ($2.65 + r \times 0.62$).
     - Chase distance behind player ($Z$ offset): Must be between $3.0\text{m}$ and $8.0\text{m}$ ($4.6 + r \times 0.95$).
  3. Inspect camera lookAt target: Must look ahead of the player ($Z - 4.5\text{m}$) into the street horizon.
- **Pass Criteria**: Camera $Y < 6.0\text{m}$ and camera is tilted forward into the street canyon with lateral steering banking.
- **Screenshot Artifact**: `test_reports/tc04_runner_camera.png`.

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

### TC-22: Karachi Runner Start, Controls & Restart
- **Objective**: Verify the v3 runner start flow, camera, uncluttered HUD, discrete controls, and complete restart.
- **Test Steps**:
  1. Start the v3 runner through onboarding and verify the runner tutorial and HUD appear.
  2. Advance the runner and confirm the chase camera stays attached to the player.
  3. Verify the open-world scoreboard and mini-map are hidden.
  4. Verify one keyboard press, one gameplay swipe, and one mobile button press each cause exactly one lane change; key-repeat and swipes on buttons must not cause extra actions.
  5. Restart after power-ups and traversal actions; verify score, power-ups, camera, pause, movement, and jump/slide state reset.
- **Pass Criteria**: Start and control flows are usable, single-action, and restart to a clean playable run.
- **Automated Check**: `scripts/test_runner.js` -> `TC-22`.

### TC-23: Boost-Speed Swept Collision & Pickup Detection
- **Objective**: Prevent high-speed movement or slow frames from skipping hazards, traffic, coins, and power-ups between frames.
- **Test Steps**:
  1. Step runner physics by 100ms at CNG Nitro speed with a gutter between start and end positions.
  2. Repeat with moving traffic, a coin, and a shield power-up crossing the runner path.
  3. Verify each object collides or collects exactly once.
- **Pass Criteria**: Swept-path checks register all four objects without requiring a frame to land directly on them.
- **Automated Check**: `scripts/test_runner.js` -> `TC-23`.

### TC-24: Runner Life-Loss Review
- **Objective**: Show the final hazard and actionable avoidance guidance once at the top of the crash screen.
- **Pass Criteria**: No duplicate final-life heading or repeated hit explanation appears, no snapshots are shown, and Quick Revive is disabled without a Rescue Token.

### TC-25: Reachable Power-Ups & Karachi Streetscape
- **Objective**: Confirm the runner can collect safe-lane power-ups and that the corridor includes local Karachi street references.
- **Pass Criteria**: Drop-cycle coverage includes each supported power-up type and area signage is generated.

### TC-26: First-Run Tutorial Gate & Mobile Crash Layout
- **Objective**: Confirm the tutorial pauses the first run, resumes one second after dismissal, and does not reappear on later runs.
- **Pass Criteria**: Movement remains stopped during tutorial, delayed resume is honored, and the crash review fits 375x667.

### TC-27: Progression Unlocks & Getup Model Change
- **Objective**: Verify district/getup lock rules, actual 3D model replacement, and the Master Mode unlock override.
- **Pass Criteria**: Level 2 opens only its eligible rewards, the selected getup replaces the player mesh, and Master Mode unlocks all runner areas/getups.

### TC-28: Runner Career Reset
- **Objective**: Verify the settings reset clears saved XP/unlocks and restores the default starting run.
- **Pass Criteria**: XP, level, Master Mode access and area unlocks reset; the player returns to the first area with the default getup and pace.

### TC-29: District-Specific Karachi Patrol Scenery & Challenges
- **Objective**: Confirm each selected area creates distinct Karachi scenery and a route-specific challenge.
- **Pass Criteria**: Soldier Bazar / PECHS has its rooftop water tanks and water-tanker queue; Lyari has football-ground/mural features and a football challenge; Saddar has heritage facades, market handcarts and restoration scaffolding. Route-only challenges must use their expected dodge or slide action.

### TC-30: Runner Reward Persistence & Patrol Area Unlock
- **Objective**: Verify runner-earned XP and district completion persist and unlock Karachi areas.
- **Pass Criteria**: Runner XP advances career progression, Lyari becomes accessible at its unlock threshold, and a completed patrol area plus its bonus XP are saved.

### TC-31: Runner Startup Isolation from Open-World Gameplay
- **Objective**: Ensure the run button starts the dedicated Karachi Runner scene and does not load or simulate open-world patrol gameplay.
- **Test Steps**:
  1. Start a run from the onboarding screen with the tutorial already completed.
  2. Verify open-world city objects and route hazards are hidden while the Karachi corridor is visible.
  3. Step runner physics near former open-world boundaries and verify no legacy boundary, civic, or traffic events fire.
- **Pass Criteria**: Only runner corridor, obstacles, pickups, and runner physics are active after startup.

### TC-32: Runner Touch Controls & Feedback Layout
- **Objective**: Keep runner actions clear and usable on small screens without overlapping transient notifications.
- **Pass Criteria**: Lane, jump, slide and horn controls remain accessible; sprint/journal/free-unstick controls are not exposed in runner mode; gameplay feedback is capped and does not cover controls.

### TC-33: Rescue Token Collection & Quick Revive Cost
- **Objective**: Verify rare Rescue Token spawning, safe-lane placement, persistent collection and paid revival.
- **Pass Criteria**: Tokens drop on the scheduled rare interval, one token is persisted and consumed per revive, and a zero-token player cannot revive.

### TC-34: Home-Screen Help & Career Progress
- **Objective**: Provide first-screen access to runner instructions and saved career records/collections/achievements.
- **Pass Criteria**: Help and progress open without starting gameplay, and the initial screen still fits 375x667 without scrolling.

### TC-35: Monsoon Potholes & Unified Master/Developer Console
- **Objective**: Add a recurring Karachi monsoon sequence and make Master/Developer operations use one runner-aware dashboard.
- **Pass Criteria**: Rain begins after the warmup distance, rain-softened puddled potholes follow the rain, at least one lane remains clear, the dashboard can force rain for testing, and the legacy Developer URL redirects to the shared Master console.
- **Pass Criteria**: Master and game tabs use the same command channel and storage fallback without duplicate legacy dispatch paths.

### TC-36: Named Karachi Neighborhood Loop & Progressive Challenge
- **Objective**: Turn the endless corridor into a long Karachi city loop that starts in Soldier Bazar, advances through Lyari and Saddar, and finishes at the starting area.
- **Pass Criteria**: Every route stop displays a unique Karachi neighborhood name without a stage number; runs begin and finish at Soldier Bazar; areas change scenery and unlock in route order; run speed and hazard pressure increase; combination patterns preserve one safe lane; and reaching 20,000 m records and displays the return-to-start finish.

### TC-37: Home, Help, Progress & Results Button UI Audit
- **Objective**: Keep primary and utility actions visually distinct, consistent, accessible and usable across mobile layouts.
- **Pass Criteria**: RUN is the prominent full-width action; Help/Progress have equal 44 px minimum touch targets; dialogs and close controls fit the viewport; route guidance appears in Help; and the HOME action returns to setup after loop completion.

### TC-38: Master/Developer Runner Console Audit
- **Objective**: Keep Master and Developer entry points on one coherent operations UI for the current Karachi Runner loop.
- **Pass Criteria**: Both legacy URLs redirect to the shared console; telemetry reflects Runner area, route stage, distance, difficulty and current run state; test actions are disabled unless a connected Runner is actively running; and obsolete hole, civic timer, district-warper and simulated fleet controls are absent.

### TC-39: High-Visibility Runner Hazards & Warning
- **Objective**: Make potholes and upcoming obstacles readable against Karachi road surfaces and give players enough time to react.
- **Pass Criteria**: Potholes use light-independent contrasting materials and two visible approach markers; the HUD identifies the nearest upcoming hazard, distance and appropriate action; imminent hazards are emphasized; the alert fits mobile viewports and hides when the road ahead is clear or the run is inactive.

### TC-40: Karachi Area Selection Card Overflow
- **Objective**: Keep every area card and its title inside the Karachi area selection panel at tablet and desktop widths.
- **Pass Criteria**: At an 847px viewport, all three cards fit within the grid and modal bounds, and the Saddar title wraps without horizontal overflow.

### TC-41: Master QA Self-Check & Safe Obstacle Controls
- **Objective**: Restore low-risk Master controls for automated live checks and repeatable Karachi hazard scenarios.
- **Pass Criteria**: The live self-check reports scene/lane/player/hazard/route state; only the Master console sender can spawn an allowlisted test hazard; clearing removes only tagged test hazards; all actions are retained in the local Game Ops ledger.

---

## 3. Manual & Regression Test Cases (QA Matrix)

The following test cases are validated manually before every major version release and across physical mobile devices:

### QA-01: Multi-Touch Virtual Joystick Precision
- **Platform**: Real Android Device (Chrome / Capacitor APK) & iOS Safari.
- **Steps**:
  1. Touch and hold thumb on bottom left quadrant.
  2. Drag circle outward in $360^\circ$ rotation.
  3. Verify nipple indicator follows thumb with spring centering on release.
- **Pass Criteria**: Zero jitter, smooth 60fps hole translation.

### QA-02: Audio Settings & Sound Toggle State Persistence
- **Steps**:
  1. Click audio mute toggle button `#btn-sound-toggle`.
  2. Verify all sound effects (devour, splash, siren, victory) are muted.
  3. Reload browser page.
  4. Verify sound toggle remains muted (persisted in `localStorage.getItem('karachiHole_soundMuted')`).
- **Pass Criteria**: Audio state persists across sessions without resetting to default loud.

### QA-03: Truck Art & Cultural Skin Switcher
- **Steps**:
  1. Open skin selection drawer `#btn-open-skins`.
  2. Switch between **Truck Art Vibrant**, **Ajrak Royal Blue**, **Green Crescent**, and **Golden Star**.
  3. Verify hole ring shader updates with chosen palette immediately in 3D viewport.
- **Pass Criteria**: Skin textures map correctly without WebGL shader compilation stutters.

### QA-04: Water Tanker Devour & City Delivery Transformation
- **Steps**:
  1. Patrol Saddar district until a water tanker mafia truck is located.
  2. Grow hole radius to $> 2.2\text{m}$ to satisfy swallowing threshold.
  3. Devour the tanker truck.
  4. Observe visual feedback: water splash particle burst, joyful chime, and neighborhood water pipe status banner turning to `"💧 Water Restored to 2,500 Homes!"`.
- **Pass Criteria**: Devouring civic evil converts scene to positive civic transformation.

### QA-05: Protected Civic Friends Devour Immunity
- **Steps**:
  1. Navigate hole directly under an Edhi Ambulance or school bus.
  2. Attempt to swallow.
  3. Verify object does NOT drop into hole.
  4. Verify warning toast: `"🚨 Warning! Protect Civic Helpers & Ambulances!"`.
- **Pass Criteria**: Protected civic entities cannot be consumed and trigger educational alert.

### QA-06: Age Group Quiz Difficulty Calibration
- **Steps**:
  1. Start game selecting **Kids (5–8)**: verify questions focus on simple pictograms (trash bins, traffic signals, trees).
  2. Restart and select **Junior (9–12)**: verify questions test Karachi landmarks and civic responsibilities.
  3. Restart and select **Adult (13+)**: verify questions cover water management, fire safety, and illegal parking.
- **Pass Criteria**: Question bank matches selected demographic tier accurately.

### QA-07: AI Opponent Dynamic Difficulty Scaling
- **Steps**:
  1. Observe 3 AI opponent holes across 120 seconds.
  2. Verify AI holes seek nearby small debris first, avoiding larger buildings until grew.
  3. In District 1, AI patrol speed is capped at $0.85\times$. In District 3+, AI speed scales to $1.15\times$.
- **Pass Criteria**: AI holes provide organic competition without teleporting or getting stuck.

### QA-08: High-DPI Retina Display Performance
- **Steps**:
  1. Run game on MacBook Retina (2x pixel ratio) or 4K monitor.
  2. Verify `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` caps pixel ratio to 2.0 to prevent GPU thermal throttling.
  3. Monitor FPS counter.
- **Pass Criteria**: Sustained 60 FPS without frame drops or overheating.

### QA-09: Battery Saver & Background Throttling
- **Steps**:
  1. Run game on Android device with Battery Saver enabled.
  2. Minimize app for 30 seconds.
  3. Return to app.
- **Pass Criteria**: Auto-pause triggers immediately upon minimize; returning cleanly prompts "Resume Patrol" without crashing WebGL context.

### QA-10: Offline Gameplay (Zero Network Dependency)
- **Steps**:
  1. Turn off Wi-Fi and Cellular data.
  2. Launch game in browser (PWA cached) or Capacitor native APK.
- **Pass Criteria**: All 3D procedural models, audio chimes, quizzes, and textures load from local bundle with zero network requests.

---

## 4. Test Execution Summary & Quality Gates

To guarantee that no regression enters the codebase:
1. **Local Pre-Commit Gate**: `npm test` must pass all 11 portable Game Ops unit tests and output all browser regression tests as PASSED for browser regression tests, with 0 failures. The runner starts its own Vite server on port 5174 when needed.
2. **Build Verification**: `npm run build` must succeed without build errors; TC-02 also verifies the Android asset copy is current. Use `npm run build:android` to build and sync Android assets outside the test runner.
3. **Browser Assertion Verification**: Browser-side exceptions and failed assertions must be reported as failed tests; Chrome screenshots alone do not count as a pass.
4. **Screenshot Review**: Check `test_reports/*.png` for layout fidelity and visual clarity.
5. **Game Ops Import Checks**: The portable unit suite verifies CI report import, per-case retention, failure suggestions, duplicate rejection, malformed-report rejection, and cross-instance persistence.
