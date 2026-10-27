# Karachi Hole.io - Version Updates & Release Changelog

All notable changes to the **Karachi Hole.io: The City Savior** project are documented in this file in reverse chronological order following [Semantic Versioning (SemVer)](https://semver.org/).

---

## [v2.2.18] - 2026-10-27

### Turn continuity and police pursuer removal
- Removed the police pursuer, shadow and chase-camera behavior.
- Fixed raised-road obstruction at flat intersections, all-lane turn entry/exit
  continuity, and stale lane interpolation after turning.
- Preserved queued turns during lane dodges and prevented boosted frames from
  overshooting the corner.
- Retained missed/wrong-turn heart penalties with explicit warnings and
  protected four-second damage-cause announcements.
- Validation: 130 checks passed; a 120-second rendered audit completed four
  turns at approximately 59.9 FPS, with no police or captured runtime errors.
- Approved release targets: GitHub main, GitHub Pages, and Google Play
  **internal** and **alpha**, version **2.2.18 (40)**. Publication verification
  is recorded in the gameplay audit; production and beta are excluded.

---

## [v2.2.17] - 2026-10-27

### Controls, turn clarity and Shop Android testing release
- Removed traversal buttons while preserving swipe/keyboard controls; redesigned
  the horn with a clearer icon and activation feedback.
- Removed police-capture deaths; direct road hazards still cost hearts.
- Cleared turn approaches, corrected direction arrows, and kept coins upright
  and collectable throughout turns.
- Fixed responsive menu text, Shop placement, wallet charging and save rollback.
- Validation: 127 gameplay/build checks passed before release; signed AAB and
  packaged web-asset parity verified for version **2.2.17 (39)**, target SDK 36.
- Published to Google Play **internal** and **alpha** testing. Fresh API inspection
  verified both tracks as `completed` on version code **39**. Beta and production
  remain empty. No website redeployment was performed.

---

## [v2.2.16] - 2026-10-27

### Gameplay stability and Android testing release
- Fixed W-11 boarding audio, GPU resource cleanup, airborne hazard grazes,
  crash/revive/reset isolation, lane-boundary boosts and near-miss rewards.
- Corrected current-run score displays and deterministic flat launch terrain.
- Included the audited fast-fall, lane-easing, road-detail and skyline effects.
- Validation: 119 checks passed; signed Android bundle built and verified.
- Google Play version code **38** published to **internal** and **alpha** testing;
  both tracks independently verified as `completed`. Production was unchanged.
- See [the gameplay audit](GAMEPLAY_AUDIT_2026-10-27.md) for findings and verification.

---

## [v2.2.1] - 2026-10-17

### 🚀 Highlights & Gameplay Bug Fixes
- **Solid AABB Building & Corner Collision Physics**: Implemented circle-to-AABB bounding box collision resolution with tangential sliding and interior pushout for all rectangular buildings, colonial tenements, food stalls, utility poles, and municipal signboards. Players and avatars can no longer pass through building walls or corners.
- **Camera-Relative Arrow Key Controls**: Transformed keyboard Arrow keys and virtual joystick inputs by the third-person camera angle (`camAngle`). ArrowUp now reliably drives the avatar forward down the corridor you are viewing, while ArrowLeft and ArrowRight turn and steer naturally.
- **HUD Widget Overlap & Overhead Sprite De-Cluttering**: Converted `.active-crisis-card` from absolute to relative positioning within the mission checklist card to prevent overlapping. Added clean max-height and scrolling to `.hud-mission-card` to maintain a 40px buffer above the radar. Hid the player's overhead billboard nametag so third-person camera view is 100% unobstructed.
- **Universal Civic Threat Capture Radius**: Removed strict tier blocks on district mission targets and expanded capture distance to `hole.radius + (obj.radius || 1.2)`, allowing water tankers, mobile snatchers, and gutka peddlers to be cleanly captured at Level 1.
- **District Completion & Level 2 Transition Fix**: Added automatic district cleared polling when all threats are eliminated (`districtRemaining === 0`). Resolved the Level 2 instant-freeze glitch by resetting `isGameOver = false`, `isPaused = false`, and `timeLeft = matchDuration` in `advanceToNextDistrict()`, while cleanly purging old district evils.

---

## [v2.2.0] - 2026-10-17

### 🚀 Highlights
- **3D Karachi Hero Avatars (Hole View Removed)**: Replaced the dark void hole in the ground with 5 authentic 3D Karachi character avatars (Tariq in Shalwar Kameez, Dr. Ayesha in Ajrak Scarf, Inspector Farooq in Police Uniform, Bilal in Edhi Volunteer Vest, and Zain the Eco Cadet) with procedural limb walk/run cycle skeletal animations, floating name badges, and civic ground auras.
- **Karachi Street-Level Third-Person Perspective**: Camera follows dynamically behind the character avatar, tracking facing angle down avenues, boulevards, and side alleys with deep Karachi street visibility.
- **Real-Life Solid Obstacle Physics**: Characters cannot walk through solid buildings, colonial monuments, or food stalls; implemented smooth sliding obstacle collision physics.
- **Zero-Overlap Quadrant HUD**: Eliminated all overlapping cards and banners across all screen sizes (mobile through desktop) using dedicated screen regions for the top bar, mission checklist, live scoreboard, Karachi mini-map and action controls.
- **Multi-Mission District Checklists & Level 2 Fix**: Replaced single-evil quotas with structured multi-mission checklists (4–5 civic objectives per district). Fixed Level 2 inaction by making VIP Protocol convoys and water tankers immediately interactable at tier 1 with 3D rotating diamond waypoint beacons.
- **Dynamic Competitor Bot AI & Scoring**: Fixed bot coordinate initialization bug (`[x, z]` vs `{x, z}`) so AI competitor bots actively roam the streets, collect debris, and accumulate score on the live leaderboard.
- **Interactive Age-Calibrated Mini-Puzzles**: Expanded educational challenges with hands-on mini-puzzles (Kids Waste Sorter, Junior Water Pipe Connector, Teens Emergency Route Dispatch) that auto-resume upon correct solution.

---

## [v2.1.0] - 2026-10-17

### 🚀 Highlights
- **Dedicated HUD Scoreboard & Live Mission Tracker**: Implemented a standalone scoreboard card displaying real-time competitor rankings (`#1` through `#4`), dynamic player rank badges, and a district mission evil counter (`9/9 Left`).
- **Prominent District Cleared Celebration**: Re-engineered the level-completion modal with high-contrast celebration visuals and a dedicated `"🚀 GO TO NEXT LEVEL ➔"` advance button that increments `currentDistrictLevel` smoothly.
- **Automated Test Suite Runner**: Added `scripts/test_runner.js` with 10 automated test cases (`npm test`) covering headless Chrome execution, camera position math, quiz flows, auto-pause triggers, corner physics, and mobile viewport responsiveness.
- **Comprehensive Documentation Suite**: Added `PLATFORMS_SUPPORTED.md`, `FEATURES_BREAKDOWN.md`, `TEST_CASES.md`, `ARCHITECTURE.md`, and `VERSION_UPDATES.md`.

### 🛠️ Detailed Changes
- **HUD & Scoreboard**:
  - Replaced inline text with high-contrast neon translucent card `#hud-scoreboard-card`.
  - Added live sorting of leaderboard entries by score on each devour event.
  - Added dedicated gold/neon rank badge `#hud-player-rank`.
- **Level Progression**:
  - Implemented `handleDistrictCleared()` with celebration modal `#modal-district-cleared`.
  - Added smooth transition to District 2 (Clifton Beachfront), District 3 (Korangi Industrial), and beyond.
  - Preserved player score, upgrades, and skin selection across district transitions.
- **Test Automation**:
  - Created Node.js automated test runner (`scripts/test_runner.js`).
  - Added `npm test` and `npm run test:5173` scripts to `package.json`.
  - Automated visual screenshot capturing into `test_reports/`.

---

## [v2.0.0] - 2026-10-16

### 🚀 Highlights
- **Karachi Street-Level Chase Camera**: Completely transformed the perspective from a distant top-down view to an immersive, ground-level street-chase camera. The camera follows tightly behind the player ($Y \approx 2.65\text{m}$, $Z \approx 4.6\text{m}$), tilting up into Karachi's skyline with lateral steering banking.
- **Start Mission Onboarding & Age Tiers**: Added initial mission modal allowing players to enter their Hero Name and select their age bracket (**Kids 5–8**, **Junior 9–12**, or **Teens/Adults 13+**).
- **Non-Skippable Pictorial Civic Quizzes**: Upgraded educational dilemmas into pictorial choice cards that pause gameplay, cannot be skipped, and auto-resume after 1.2s upon choosing the correct answer.
- **Auto-Pause on Inactivity**: Implemented automatic game pausing when the player tabs away, minimizes the window, or switches apps, with a dedicated resume modal.
- **Corner Anti-Stick Physics & Building Ghosting**: Eliminated player trapping with smooth boundary sliding deflection and raycast-based building transparency (`opacity: 0.15`).
- **Responsive Layout Overhaul**: Redesigned all HUD elements with responsive CSS breakpoints, ensuring 100% usability on mobile screens (320px–420px) up to 4K displays.

### 🛠️ Detailed Changes
- **3D Engine & Camera**:
  - Redesigned `updateCamera()` in `src/hole.js` with street-level offset:
    $$Y = 2.65 + r \times 0.62$$
    $$Z = \text{player.z} + 4.6 + r \times 0.95$$
  - Added camera lookAt horizon target $(\text{player.x}, 1.2, \text{player.z} - 4.5)$.
  - Added lateral banking rotation when steering left or right.
- **Building Occlusion & Physics**:
  - Added `THREE.Raycaster` between camera and player.
  - Added building ghosting to prevent blind spots behind tall skyscrapers.
  - Implemented corner sliding velocity decomposition to eliminate edge sticking.
- **Educational System**:
  - Refactored `src/educationalChallenges.js` with pictorial icons and calibrated difficulty tiers.
  - Removed skip/close button; player must engage with the dilemma.
  - Added 1200ms auto-resume timeout upon correct answer.
- **UI & State**:
  - Added `#modal-start-mission` on game boot.
  - Added `#modal-auto-pause` listening to `visibilitychange` and `window.onblur`.
  - Enforced English-only language across all text and HUD cards.

---

## [v1.2.0] - 2026-10-16

### 🚀 Highlights
- **Karachi Civic Crises Engine**: Introduced real Karachi urban challenges: Water Tanker Mafia, Mobile Snatchers, and Street Potholes.
- **Before-and-After Transformations**: Devouring civic evils actively repairs the city: devouring water tankers distributes water to 2,500 homes with particle fountains; devouring trash piles blooms public gardens.
- **Protected Civic Friends**: Added immunity and warning alarms for Edhi Ambulances, rescue vehicles, and school buses.
- **District Mini-Map & Radar**: Added bottom-left radar canvas displaying live positions of player, AI holes, civic crises, and landmarks.
- **Karachi Civic Medals**: Introduced 7 unlockable badges (Water Savior, Karachi Guardian, Anti-Litter Champion, Green City Pioneer, etc.).

### 🛠️ Detailed Changes
- **Civic Logic**:
  - Created `src/districts.js` containing configurations for 5 Karachi districts.
  - Added water tanker truck 3D models with water particle effects.
  - Added pothole mesh generation and road repair patching on devour.
  - Added radar canvas rendering loop in `src/hole.js`.

---

## [v1.1.0] - 2026-10-16

### 🚀 Highlights
- **Karachi Architectural Landmarks**: Added detailed procedural 3D models for iconic Karachi monuments:
  - **Mazar-e-Quaid** (White marble dome with stepped plinth).
  - **Teen Talwar** (Three iconic white marble swords in Clifton).
  - **Empress Market** (Indo-Gothic red brick clock tower).
  - **Port Grand & Native Jetty** (Harbor boardwalk with lighting).
  - **Karachi Port Trust & Cranes** (Industrial container loading docks).
  - **Habib Bank Plaza & Bahria Icon Tower** (Karachi skyline skyscrapers).
- **Cultural Pakistani Skins**: Added Truck Art floral patterns, Sindhi Ajrak geometric motifs, and Green Crescent skins.
- **Audio & Sound System**: Implemented procedural audio synthesized with Web Audio API (swallowing pops, siren alerts, water splash, and victory chimes) with mute persistence.

### 🛠️ Detailed Changes
- **3D Modeling**:
  - Created `src/karachiModels.js` with procedural geometry for all landmarks.
  - Positioned landmarks as permanent non-eatable civic anchors across the city map.
- **Skin System**:
  - Created `src/skins.js` with custom canvas procedural textures and dynamic ring glow shaders.
- **Audio Engine**:
  - Created `src/audio.js` with zero external audio asset dependencies.

---

## [v1.0.0] - 2026-10-15

### 🚀 Highlights
- **Initial Release**: Core 3D Hole.io gameplay engine built with Three.js and Vite.
- **Core Mechanics**:
  - Smooth hole translation with keyboard (WASD / Arrows), mouse drag, and virtual touch joystick.
  - Dynamic growth physics: hole expands in radius as it consumes objects smaller than its threshold.
  - AI Competitor Holes: Autonomous bots navigating the map and competing for score.
  - Timed Round: 2-minute countdown timer with end-game victory/game-over screen.
  - Android APK Packaging: Capacitor bridge configured for native Android execution.

---

## Upgrade Guide & Breaking Changes

### Upgrading from v1.x to v2.x
- **Camera Perspective Change**: Any custom camera scripts assuming top-down $Y > 20\text{m}$ coordinates must be updated to the street-level chase model ($Y < 5\text{m}$).
- **Unskippable Quiz Flow**: Educational challenge modals no longer provide a close/cancel callback; game logic resumes automatically 1.2s after `onCorrectAnswer()` fires.
- **Onboarding Gate**: The game loop no longer begins immediately on `window.onload`; it waits for the player to select their age tier and submit the `#modal-start-mission` modal.

---

## Upcoming Roadmap (v2.2.0+)
- [ ] **Urdu Audio Voiceover**: Optional localized voice prompts ("Shaabash!", "Pani pohanch gaya!").
- [ ] **Multiplayer Mode**: Real-time WebSocket matchmaking for cooperative district cleaning.
- [ ] **Additional Districts**: Lyari Sports Arena, Malir Green Farmlands, and Kemari Coastal Ferry Docks.
