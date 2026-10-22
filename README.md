# KARACHI RUNNER

[![Build & Test Status](https://img.shields.io/badge/tests-52%20automated-blue.svg)](docs/TEST_CASES.md)
[![Platforms](https://img.shields.io/badge/platforms-Android%20%7C%20Web%20%7C%20iOS-blue.svg)](docs/PLATFORMS_SUPPORTED.md)
[![Version](https://img.shields.io/badge/version-2.3.0-orange.svg)](docs/VERSION_UPDATES.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Live Game](https://img.shields.io/badge/live-GitHub%20Pages-success.svg)](https://itsjohn9-cell.github.io/karachi.hole/)

Run Karachi's streets in a 3D endless runner. Dodge traffic, open gutters and live wires; collect rupee coins and gameplay power-ups; and patrol locally styled routes through Soldier Bazar/PECHS, Lyari and Saddar/Burns Road.

**Live Game Deployment:** [https://itsjohn9-cell.github.io/karachi.hole/](https://itsjohn9-cell.github.io/karachi.hole/)

---

## 🎮 Key Features

- **Karachi street-level chase camera**: Ground-level 3D perspective ($Y \approx 2.65\text{m}$, $Z \approx 4.6\text{m}$) with forward horizon lookAt, lateral steering banking, and procedural building ghosting to prevent blind spots.
- **Focused runner onboarding**: Choose a Karachi patrol area, runner pace and getup from a compact, scroll-free start screen.
- **Parkour Jump Traversal**: Realistic vertical physics ($g = -18\text{ m/s}^2$) allowing the player to leap over curbs, barriers, and small obstacles with <kbd>Space</kbd> or the on-screen Jump button.
- **Karachi Street Runner (v3)**: Endless three-lane sprint through Karachi streets with swipe/keyboard/touch controls, hazards, traffic, rupee coins, and CNG Nitro, shields, magnets, chai heals and jump boosts.
- **Turns, forks & navigation**: A Google-Maps-style banner announces upcoming junctions. Press left/right (or swipe) within 16 m to take 90° street turns (perfect turns pay +500, wrong or missed turns cost a heart), and choose at forks between a fast flyover (bonus coins) and a dark underpass full of low wires. Master Control can spawn junctions on demand and the auto-run bot navigates them. Pace changes the route: **Easy** has no left/right turns (forks only, wider spacing), **Standard** mixes turns and forks, **Hard** chains turns more often.
- **Career persistence and progression**: Career progress resumes automatically. Patrol areas and getups unlock through career milestones, completed areas or achievements; Master Mode can unlock them all. Reset progression from game settings.
- **Karachi patrol areas**: Each runner route has its own local street signs, buildings, palette and roadside details; Lyari includes a football-ground feature.
- **Pakistani getups and local references**: Runner clothing is selected directly and unlocks through gameplay; Karachi street signs and roadside details identify each route.
- **Cross-Platform Responsive Design**: Optimized for small smartphones (320px–375px), tablets, laptops, and ultra-wide desktop monitors.

---

## 📚 Complete Project Documentation

Explore the comprehensive engineering and operational guides in the [`docs/`](docs/) directory:

| Document | Description |
| :--- | :--- |
| **[Platforms Supported](docs/PLATFORMS_SUPPORTED.md)** | Supported operating systems, mobile devices, desktop browsers, hardware requirements, and responsive viewport breakpoints. |
| **[Features Breakdown](docs/FEATURES_BREAKDOWN.md)** | In-depth breakdown of camera math, age tiers, civic evils vs protected friends, transformations, medals, and district progression. |
| **[Test Cases & Automation](docs/TEST_CASES.md)** | Automated regression coverage for runner onboarding, controls, power-ups, progression, Karachi area scenery, and Android asset sync. |
| **[Technical Architecture](docs/ARCHITECTURE.md)** | Three.js WebGL scene graph, stencil CSG hole rendering, building occlusion raycaster, vector boundary sliding, and Capacitor native bridge. |
| **[Version Updates & Changelog](docs/VERSION_UPDATES.md)** | Complete SemVer release history from v1.0.0 through v2.3.0, detailing breaking changes, bug fixes, and roadmap. |

---

## 🧪 Automated Test Suite (52 Checks)

The project includes an automated test runner that validates all core mechanics via headless Chrome:

# Use the next Play version code and the matching user-facing app version.
KARACHI_RUNNER_VERSION_NAME=2.3.0 KARACHI_RUNNER_VERSION_CODE=1 npm run build:android:aab
```bash
# Run all 41 browser regressions and 11 Game Ops engine tests
npm test

# Run tests and create the production website bundle
npm run release:check

# Run tests against live preview server (port 5173)
npm run test:5173

# Build the production web app and sync its assets into the Android project
npm run build:android

# Custom headless run with screenshot output
node scripts/test_runner.js --port=5173 --screenshot-dir=./test_reports
```

### Automated Coverage Matrix:
- `TC-01`: Core Modules Import & Front-matter Syntax Integrity
- `TC-02`: Production Bundle & Android Asset Sync
- `TC-03`: KARACHI RUNNER Onboarding & 375x667 Viewport Fit
- `TC-04`: Karachi street-level chase camera
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
- `TC-16`: Game Menu & Settings Hub
- `TC-17`: Runner Lane Switching
- `TC-18`: Runner Jump & Slide Traversal
- `TC-19`: Runner Coin Pickup & Magnet
- `TC-20`: Runner Hearts, Shield & Chai Healing
- `TC-21`: Runner Traffic Drafting, Boost & Speed HUD
- `TC-22`: Runner Start, Camera, HUD, Touch/Keyboard Controls & Restart
- `TC-23`: Boost-Speed Swept Collision and Pickup Detection
- `TC-24`: Runner crash review and Rescue Token revive availability
- `TC-25`: Reachable power-ups and Karachi streetscape
- `TC-26`: First-run tutorial gate and mobile crash layout
- `TC-27`: Progression unlocks, getup model change and Master Mode override
- `TC-28`: Career reset and default state
- `TC-29`: District-specific Karachi patrol scenery
- `TC-30`: Runner reward persistence and patrol-area unlocks
- `TC-31`: Runner startup isolation from open-world gameplay
- `TC-32`: Runner touch controls and non-overlapping feedback
- `TC-33`: Rare Rescue Token collection and token-cost revive
- `TC-34`: Home-screen help and career progress

*All test runs produce high-resolution screenshots in `test_reports/` and a structured `test_reports/test_results.json` log.*

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js v18.0 or higher
- Google Chrome (for running automated headless tests)
- JDK 21 (for native Android builds)

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/itsjohn9-cell/karachi.hole.git
cd karachi.hole

# Install dependencies
npm install

# Start Vite local development server (port 5173)
npm run dev

# Run automated regression suite
npm test
```

### Android Release Signing

Google Play submissions must target Android 16 / API 36 or higher. The project uses JDK 21 and API 36 build tools. To build and locally install the unsigned-for-Play debug variant (debug-signed), run:

```bash
npm run build:android
cd android
./gradlew :app:assembleDebug
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. This is for local/device testing only and cannot be submitted to Play.

For Play, create a private upload keystore and configure `KARACHI_RUNNER_KEYSTORE`, `KARACHI_RUNNER_KEYSTORE_PASSWORD`, `KARACHI_RUNNER_KEY_ALIAS`, and `KARACHI_RUNNER_KEY_PASSWORD` in your build environment. Keep the keystore and passwords outside the repository and back them up securely. Then build the Play upload bundle:

```bash
npm run build:android:aab
```

Upload `android/app/build/outputs/bundle/release/app-release.aab` to Play Console and enroll in Play App Signing. Do not use the debug APK or the standalone `npm run build:apk` signer for Play uploads.

### Connected release workflow

The **Prepare and publish release** GitHub Actions workflow connects the regression suite, production web build, optional signed Android App Bundle, and GitHub Pages publishing. Run it manually from the Actions tab and choose `website`, `android`, or `both`. Website releases must be run from `main`.

- Every destination runs `npm ci`, the full test suite, and a production web build first.
- For `android` or `both`, provide the Android version name and a positive version code higher than every previously uploaded bundle. Configure the repository secrets `KARACHI_RUNNER_KEYSTORE_BASE64`, `KARACHI_RUNNER_KEYSTORE_PASSWORD`, `KARACHI_RUNNER_KEY_ALIAS`, and `KARACHI_RUNNER_KEY_PASSWORD`. The workflow builds and retains a signed `.aab` artifact; it does **not** upload or submit it to Google Play.
- For `website` or `both`, type `DEPLOY` in the confirmation field. Only the built `dist/` contents are pushed to `gh-pages`, and only after the selected build steps succeed.
- Google Play Console approval and the publisher's manual review/upload remain required. No live website deployment occurs unless the workflow is manually run with the exact confirmation.

### Google Play publication checklist

1. Create a Play Console developer account and a new app entry. Confirm `com.holeio.karachi` is the permanent application ID before creating the listing; Play does not let you change an app's application ID after publication.
2. Complete the store listing with a 512 × 512 app icon, feature graphic, phone/tablet screenshots, title, short and full descriptions, and developer contact details.
3. Publish a privacy policy on a public HTTPS URL and accurately complete Data safety, target audience, ads, content rating, app access, and other App content declarations. The game keeps progress and operations notes locally, and currently requests Google Fonts over HTTPS; account for those behaviors in disclosures.
4. Upload the signed AAB to the internal testing track and test it on real Android devices. Review Play's pre-launch report and fix crashes, compatibility, and policy issues.
5. Complete the closed-test requirement if Play Console requires it for your account. For personal developer accounts created after November 13, 2023, Google currently requires at least 12 testers opted in continuously for 14 days before applying for production access.
6. Apply for production access when eligible, submit the production release for review, then use a staged rollout. Increment `versionCode` for every update.

The repository does not contain the publisher's upload keystore, Play Console credentials, privacy-policy URL/contact, or store listing materials, so a signed Play AAB and live Play publication still require the publisher's setup and approval. See Google's current [target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878) and [testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465).

### Website publication checklist

The production web game is hosted by GitHub Pages at [https://itsjohn9-cell.github.io/karachi.hole/](https://itsjohn9-cell.github.io/karachi.hole/). Pages is currently configured to serve the `gh-pages` branch from its root directory, with HTTPS enforced.

1. From the project root, install locked dependencies and run the complete regression suite:

   ```bash
   npm ci
   npm test
   ```

2. Create and inspect the production site bundle:

   ```bash
   npm run build
   npm run preview -- --host 127.0.0.1
   ```

   Open the local preview URL printed by Vite and test the game on desktop and mobile-sized viewports. The deployable static site is in `dist/`.
3. After explicit approval to publish, deploy the contents of `dist/` to the root of the `gh-pages` branch. Do not publish the source tree or the Android debug build to that branch. GitHub Pages serves the update at the live URL above after its deployment completes.
4. Verify the live page, manifest, icons, game start, and browser console after deployment. If the release is not approved, keep the tested build local and leave the live branch unchanged.

Web and Android releases are separate: publishing the website does not submit an Android app to Play, and uploading an AAB does not update the website. Both releases require their own verification and explicit publication approval.

---

## 🚀 Live Production URL

- **GitHub Pages**: [https://itsjohn9-cell.github.io/karachi.hole/](https://itsjohn9-cell.github.io/karachi.hole/)
- **Repository**: [https://github.com/itsjohn9-cell/karachi.hole](https://github.com/itsjohn9-cell/karachi.hole)
