# Karachi Hole.io: The City Savior 🏙️🕳️

[![Build & Test Status](https://img.shields.io/badge/tests-10%2F10%20passing-brightgreen.svg)](docs/TEST_CASES.md)
[![Platforms](https://img.shields.io/badge/platforms-Android%20%7C%20Web%20%7C%20iOS-blue.svg)](docs/PLATFORMS_SUPPORTED.md)
[![Version](https://img.shields.io/badge/version-2.1.0-orange.svg)](docs/VERSION_UPDATES.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

An immersive 3D arcade experience and civic education game set in Karachi, Pakistan. Inspired by fast-paced street chase games like *Subway Surfers* and *Grand Theft Auto*, players patrol the bustling avenues of Karachi, devouring urban crises—including the illegal water tanker mafia, street snatchers, and garbage overflows—to restore civic order, deliver water to drought-stricken neighborhoods, and bloom public gardens.

---

## 🎮 Key Features

- **Subway Surfers / GTA Third-Person Street Chase Camera**: Ground-level 3D perspective ($Y \approx 2.65\text{m}$, $Z \approx 4.6\text{m}$) with forward horizon lookAt, lateral steering banking, and procedural building ghosting to prevent blind spots.
- **Onboarding & Age-Tier Selection**: Players choose their Hero Name and select from 3 curated age tiers:
  - **Kids (5–8 yrs)**: Visual challenges, clean trash, protect emergency helpers.
  - **Junior (9–12 yrs)**: Landmark identification, community care, traffic discipline.
  - **Teens / Adults (13+)**: Water infrastructure dilemmas, tanker mafia, civic policy.
- **Karachi Civic Crises & Transformations**:
  - **Water Tanker Mafia**: Devour illegal water tankers to pump clean water to 2,500+ homes with celebratory water fountains.
  - **Street Trash Piles**: Devouring garbage spawns blooming flower gardens.
  - **Mobile Snatchers**: High-speed street chases to recover stolen property.
  - **Protected Friends**: Immunity and warning alerts for Edhi Ambulances, rescue vehicles, and school buses.
- **Non-Skippable Pictorial Dilemmas**: Educational pause challenges featuring pictorial cards that auto-resume 1.2s after the correct choice.
- **Dedicated Scoreboard & Live Mission Tracker**: Translucent neon HUD with real-time player rank badge (`⭐ RANK #1/4`), live leaderboard sorting, and remaining district evils counter.
- **District Progression System**: Complete all civic challenges in a district to trigger a celebration modal and advance (`🚀 GO TO NEXT LEVEL ➔`) through Saddar, Clifton Beach, Korangi, Lyari, and Malir.
- **Auto-Pause on Inactivity**: Automatically halts gameplay and timers when the player tabs away, minimizes the window, or locks the screen, with a one-click resume action.
- **Anti-Stick Corner Physics**: Decoupled axis sliding physics ensures players never get stuck on building corners or map boundaries.
- **Pakistani Cultural Skins & Landmarks**: Mazar-e-Quaid, Teen Talwar, Empress Market, Port Grand, Bahria Icon Tower, Habib Bank Plaza, with Truck Art and Sindhi Ajrak skins.
- **Cross-Platform Responsive Design**: Optimized for small smartphones (320px–375px), tablets, laptops, and ultra-wide desktop monitors.

---

## 📚 Complete Project Documentation

Explore the comprehensive engineering and operational guides in the [`docs/`](docs/) directory:

| Document | Description |
| :--- | :--- |
| **[Platforms Supported](docs/PLATFORMS_SUPPORTED.md)** | Supported operating systems, mobile devices, desktop browsers, hardware requirements, and responsive viewport breakpoints. |
| **[Features Breakdown](docs/FEATURES_BREAKDOWN.md)** | In-depth breakdown of camera math, age tiers, civic evils vs protected friends, transformations, medals, and district progression. |
| **[Test Cases & Automation](docs/TEST_CASES.md)** | Full specification for the 10 automated test cases executed on every build, plus manual regression QA checklists. |
| **[Technical Architecture](docs/ARCHITECTURE.md)** | Three.js WebGL scene graph, stencil CSG hole rendering, building occlusion raycaster, vector boundary sliding, and Capacitor native bridge. |
| **[Version Updates & Changelog](docs/VERSION_UPDATES.md)** | Complete SemVer release history from v1.0.0 through v2.1.0, detailing breaking changes, bug fixes, and roadmap. |

---

## 🧪 Automated Test Suite

The project includes a robust automated test runner that runs every time the game is validated or built:

```bash
# Run all 10 automated test cases (default port 5174)
npm test

# Run tests against live preview (port 5173)
npm run test:5173

# Custom headless run with screenshot output
node scripts/test_runner.js --port=5173 --screenshot-dir=./test_reports
```

### Automated Coverage Matrix:
- `TC-01`: Core Modules Import & Front-matter Syntax Integrity
- `TC-02`: Vite Production Bundle Compilation
- `TC-03`: Start Mission Onboarding & Age Selection Modal
- `TC-04`: Subway Surfers / GTA Third-Person Street Chase Camera
- `TC-05`: Dedicated Scoreboard & Live Mission Tracker
- `TC-06`: Non-Skippable Pictorial Quiz Dilemma & Auto-Resume
- `TC-07`: Auto-Pause on Inactivity with Resume Patrol Action
- `TC-08`: Building Occlusion Ghosting & Corner Anti-Stick Physics
- `TC-09`: District Cleared Celebration & Next Level Advance Flow
- `TC-10`: Cross-Device Responsiveness on Mobile Viewport (375x667)

*All test runs produce high-resolution screenshots in `test_reports/` and a structured `test_reports/test_results.json` log.*

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js v18.0 or higher
- Google Chrome (for running automated headless tests)

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/itsjohn9-cell/karachi.hole.git
cd hole-io-android

# Install dependencies
npm install

# Start Vite local development server
npm run dev

# Run automated test suite
npm test
```

Open `http://localhost:5173/` in your browser to play.

---

## 📱 Mobile App Compilation (Android APK)

Karachi Hole.io is configured with **Capacitor** for one-click native Android compilation:

```bash
# 1. Build optimized web bundle
npm run build

# 2. Synchronize web assets to native Android project
npx cap sync android

# 3. Open in Android Studio to build APK / AAB
npx cap open android
```

Alternatively, to run directly on a connected USB device with debugging:
```bash
npx cap run android
```

---

## ⌨️ Controls & Multi-Input System

| Platform | Input Method | Actions |
| :--- | :--- | :--- |
| **Mobile (Android/iOS)** | Virtual Touch Joystick | Touch & drag anywhere on the lower screen to steer $360^\circ$. |
| **Desktop / Laptop** | Keyboard (WASD / Arrows) | Direct vector translation and lateral steering banking. |
| **Desktop / Laptop** | Mouse Drag | Click and hold to drag the hole toward cursor position. |
| **Universal** | HUD Buttons | Tap to toggle audio mute, switch skins, view guides, or pause. |

---

## 🏛️ Local Repository & Git Policy

- **Branch**: `main`
- **Author Identity**: `itsjohn9 <itsjohn9@gmail.com>`
- **Safety Policy**: All commits remain strictly local; remote pushes are executed only upon explicit user command.
