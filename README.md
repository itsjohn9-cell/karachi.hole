# Karachi Hole.io: The City Savior 🏙️🕳️

[![Build & Test Status](https://img.shields.io/badge/tests-15%2F15%20passing-brightgreen.svg)](docs/TEST_CASES.md)
[![Platforms](https://img.shields.io/badge/platforms-Android%20%7C%20Web%20%7C%20iOS-blue.svg)](docs/PLATFORMS_SUPPORTED.md)
[![Version](https://img.shields.io/badge/version-2.3.0-orange.svg)](docs/VERSION_UPDATES.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Live Game](https://img.shields.io/badge/live-GitHub%20Pages-success.svg)](https://itsjohn9-cell.github.io/karachi.hole/)

An immersive 3D arcade experience and civic education game set in Karachi, Pakistan. Inspired by fast-paced street chase games like *Subway Surfers* and *Grand Theft Auto*, players patrol the bustling avenues of Karachi, devouring urban crises—including the illegal water tanker mafia, street snatchers, and garbage overflows—to restore civic order, deliver water to drought-stricken neighborhoods, and bloom public gardens.

**Live Game Deployment:** [https://itsjohn9-cell.github.io/karachi.hole/](https://itsjohn9-cell.github.io/karachi.hole/)

---

## 🎮 Key Features

- **Subway Surfers / GTA Third-Person Street Chase Camera**: Ground-level 3D perspective ($Y \approx 2.65\text{m}$, $Z \approx 4.6\text{m}$) with forward horizon lookAt, lateral steering banking, and procedural building ghosting to prevent blind spots.
- **Onboarding & Age-Tier Selection**: Players choose their Hero Name and select from 3 curated age tiers:
  - **Kids (5–8 yrs)**: Visual challenges, clean trash, protect emergency helpers.
  - **Junior (9–12 yrs)**: Landmark identification, community care, traffic discipline.
  - **Teens / Adults (13+)**: Water infrastructure dilemmas, tanker mafia, civic policy.
- **Parkour Jump Traversal**: Realistic vertical physics ($g = -18\text{ m/s}^2$) allowing the player to leap over curbs, barriers, and small obstacles with <kbd>Space</kbd> or the on-screen Jump button.
- **Interactive Bilingual Citizen Dialogues**: Authentic Karachi residents (Uncle Shamim at Burns Road, Baji Fatima in PECHS, Ustad Kareem in Saddar, Inspector Farooq on Shahrah-e-Faisal) rendered with authentic Urdu Nastaliq script and English translations.
- **Mission Journal & District Restoration Gauges**: In-game journal tracking 4 civic pillars (Cleanliness, Infrastructure, Traffic Flow, Peace) across Karachi's 5 major districts.
- **Career Persistence (`SaveManager`)**: Progress is automatically saved to local storage, allowing players to resume their career with their earned XP, badges, and unlocked districts.
- **3D Ground Navigation Arrow & Top Compass**: Real-time directional chevrons point directly toward active civic crises and key landmarks.
- **Karachi Civic Crises & Transformations**:
  - **Water Tanker Mafia**: Devour illegal water tankers to pump clean water to 2,500+ homes with celebratory water fountains.
  - **Street Trash Piles**: Devouring garbage spawns blooming flower gardens.
  - **Mobile Snatchers**: High-speed street chases to recover stolen property and rescue victims.
  - **Protected Friends**: Immunity and warning alerts for Edhi Ambulances, rescue vehicles, and school buses.
- **Non-Skippable Pictorial Dilemmas**: Educational pause challenges featuring pictorial cards that auto-resume 1.2s after the correct choice.
- **Dedicated Scoreboard & Live Mission Tracker**: Translucent neon HUD with real-time player rank badge (`⭐ RANK #1/4`), live leaderboard sorting, and remaining district evils counter.
- **District Progression System**: Complete all civic challenges in a district to trigger a celebration modal and advance (`🚀 GO TO NEXT LEVEL ➔`) through Saddar, Clifton Beach, Korangi, Lyari, and Malir.
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
| **[Test Cases & Automation](docs/TEST_CASES.md)** | Full specification for all 15 automated test cases executed on every build, plus manual regression QA checklists. |
| **[Technical Architecture](docs/ARCHITECTURE.md)** | Three.js WebGL scene graph, stencil CSG hole rendering, building occlusion raycaster, vector boundary sliding, and Capacitor native bridge. |
| **[Version Updates & Changelog](docs/VERSION_UPDATES.md)** | Complete SemVer release history from v1.0.0 through v2.3.0, detailing breaking changes, bug fixes, and roadmap. |

---

## 🧪 Automated Test Suite (15/15 Passing)

The project includes an automated test runner that validates all core mechanics via headless Chrome:

```bash
# Run all 15 automated test cases (default port 5174)
npm test

# Run tests against live preview server (port 5173)
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
- `TC-11`: Directional Precision & Left/Right Spin Prevention
- `TC-12`: 3D Ground Chevron & Top HUD Target Compass Guidance
- `TC-13`: District 2 3D Scene Rendering, Backward Viewing Angle, Collision & Quiz Diversity
- `TC-14`: SaveManager Progression Persistence & Career Restore Flow
- `TC-15`: Interactive Citizen Dialogue, Mission Journal & Jump Traversal

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

# Start Vite local development server (port 5173)
npm run dev

# Run automated 15-test suite
npm test
```

---

## 🚀 Live Production URL

- **GitHub Pages**: [https://itsjohn9-cell.github.io/karachi.hole/](https://itsjohn9-cell.github.io/karachi.hole/)
- **Repository**: [https://github.com/itsjohn9-cell/karachi.hole](https://github.com/itsjohn9-cell/karachi.hole)
