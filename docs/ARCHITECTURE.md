# KARACHI RUNNER - Technical Architecture & Systems Design

This document describes the rendering pipeline, runner and civic-mode physics, procedural Karachi models, Master/Developer telemetry bridge, and native Android package.

---

## 1. System Overview & Component Architecture

```mermaid
graph TD
    subgraph Browser / Capacitor Android WebView
        Boot[src/main.js Entry Point] --> Core[HoleGame Engine src/hole.js]
        
        Core --> SceneGraph[Three.js WebGL Scene]
        Core --> CameraSystem[Karachi Street Chase Camera]
        Core --> Physics[Collision & Boundary Sliding Engine]
        Core --> AI[AI Opponent Controller]
        Core --> Audio[Web Audio Synthesizer src/audio.js]
        
        Core --> DistrictEngine[District & Civic Crises src/districts.js]
        Core --> QuizEngine[Pictorial Dilemmas src/educationalChallenges.js]
        Core --> Landmarks[Procedural 3D Karachi Models src/karachiModels.js]
        Core --> CityGen[Procedural City Grid src/city.js]
        Core --> Skins[Cultural Shader Skins src/skins.js]
        
        Core --> HUD[Responsive DOM HUD & Radar Canvas]
    end
    
    subgraph Test & Quality Automation
        TestRunner[scripts/test_runner.js] --> HeadlessChrome[Headless Chrome Browser]
        HeadlessChrome --> VirtualDOM[Live Game Session]
        VirtualDOM --> TestReports[test_reports/ & test_results.json]
    end
```

---

## 2. Source Code Modular Organization

| Module | Location | Primary Responsibilities |
| :--- | :--- | :--- |
| **Main Bootstrap** | `src/main.js` | Initializes DOM listeners, splash screen, and instantiates `HoleGame`. |
| **Runner Route & Difficulty** | `src/main.js`, `src/karachi-neighborhoods.js` | 20,000 m named-neighborhood city loop, Soldier Bazar → Lyari → Saddar area transitions, rising speed/hazard combinations, and the return-to-start finish. |
| **Runner Weather & Hazards** | `src/main.js` | Distance-based monsoon cycle, rain effect, fair post-rain pothole spawning, and runner collision handling. |
| **Master / Developer Console** | `runner-console.html`, `src/runnerConsole.js` | Shared browser-local Runner telemetry, active-run test controls, QA snapshots, and feedback; Master and Developer URLs redirect here. |
| **Portable Game Ops Engine** | `src/game-ops-engine.js` | Dependency-free, namespaced operations ledger; bounded telemetry rules, review-only recommendations, explicit-consent aggregate transport, and portable report export. |
| **Game Engine** | `src/hole.js` | WebGL scene graph, render loop, camera chase math, devour physics, leaderboard, HUD update cycle, auto-pause listeners. |
| **District System** | `src/districts.js` | Karachi district progression (Saddar, Clifton, Korangi, Lyari, Malir), civic crisis definitions, before/after transformations. |
| **Educational Engine** | `src/educationalChallenges.js` | Age-calibrated pictorial quiz dilemmas (Kids, Junior, Adult), reward payouts, non-skippable dialog state. |
| **Karachi Models** | `src/karachiModels.js` | Procedural 3D geometry for Mazar-e-Quaid, Teen Talwar, Empress Market, Port Grand, cranes, tankers, Edhi ambulances. |
| **City Generator** | `src/city.js` | Procedural Karachi road network, intersections, sidewalks, streetlights, billboards, and devourable urban props. |
| **Skin System** | `src/skins.js` | Procedural canvas textures & ring shaders (Pakistani Truck Art, Sindhi Ajrak, Green Crescent, Gold Star). |
| **Audio Synthesizer** | `src/audio.js` | Synthesizes swallowing pops, water splashes, police sirens, and fanfare using Web Audio API (0 external MP3 files). |
| **Test Runner** | `scripts/test_runner.js` | Headless Chrome automated regression suite covering runner, console, progression, responsive layout, and Android asset sync. |

---

## 3. 3D Camera & Visual Mechanics

### Third-Person Street Chase Camera Math
Rather than using a detached top-down isometric view, Karachi Hole.io employs an intimate street-level chase camera that places the player inside the bustling corridors of Karachi:

```
                  Horizon Look Target (player.x, 1.2, player.z - 4.5)
                            ▲
                           /
                          / (tilt angle ~22°)
                         /
Camera [Cam] ───────────► Hole [Player]
  Height: Y = 2.65 + r * 0.62
  Distance: Z = player.z + 4.6 + r * 0.95
```

#### Mathematical Formulation:
1. **Vertical Elevation ($Y$)**:
   $$Y_{\text{cam}} = 2.65 + r \times 0.62$$
   *Where $r$ is the dynamic radius of the hole. As the hole grows, the camera smoothly zooms out just enough to keep the rim in frame while preserving ground-level immersion.*

2. **Longitudinal Distance ($Z$)**:
   $$Z_{\text{cam}} = Z_{\text{player}} + 4.6 + r \times 0.95$$
   *Keeps the camera positioned immediately behind the rear rim of the hole.*

3. **Lateral Steering Banking**:
   When the player turns left or right, a slight roll ($\pm 0.08\text{ rad}$) and lateral sway ($X_{\text{offset}} = -V_x \times 0.35$) is applied to simulate the sensation of a high-speed vehicle or chase runner.

4. **Horizon LookAt Target**:
   $$\text{Target} = (X_{\text{player}}, 1.2, Z_{\text{player}} - 4.5)$$
   *Directs the player's view down the avenue toward distant Karachi landmarks rather than looking straight down at the asphalt.*

---

## 4. Physics, Collision & Anti-Stick Sliding

### The Corner Trapping Problem & Resolution
In standard boundary clamping, if a player moves diagonally into a corner $(X_{\text{max}}, Z_{\text{max}})$, setting coordinates to the clamped maximum creates friction lock, freezing the player.

### Vector Decomposition Boundary Deflection
The engine implements smooth wall sliding by decoupling the movement axes:

```javascript
// Axis-decoupled movement with corner buffer
const margin = mapLimit - player.radius;

// Test X movement independently
const nextX = player.position.x + moveX * speed * dt;
if (Math.abs(nextX) < margin) {
  player.position.x = nextX;
} else {
  // Deflect along the boundary wall
  player.position.x = Math.sign(nextX) * margin;
}

// Test Z movement independently
const nextZ = player.position.z + moveZ * speed * dt;
if (Math.abs(nextZ) < margin) {
  player.position.z = nextZ;
} else {
  // Deflect along the boundary wall
  player.position.z = Math.sign(nextZ) * margin;
}
```

This guarantees that moving diagonally into a wall redirects 100% of the tangential velocity component along the street corridor, allowing the player to slide fluidly around corners.

---

## 5. Dynamic Building Occlusion Ghosting

Because the camera stays low to the asphalt, skyscrapers and flyovers can occasionally obstruct the line of sight between the camera and the hole.

### Raycasting Transparency Pass
1. A ray is cast every frame from `camera.position` to `player.position`.
2. All intersecting building meshes are gathered.
3. For each occluding building:
   - The original opacity and depth write states are cached.
   - Material parameters are toggled to ghost mode:
     ```javascript
     mesh.material.transparent = true;
     mesh.material.opacity = 0.15;
     ```
4. When the camera moves past the obstruction, the building smoothly lerps back to full opacity (`1.0`).

---

## 6. Real-Time Stencil Hole CSG Rendering

To create the illusion that the ground has an actual physical hole where buildings tumble down:
1. **Ground Plane**: Rendered with standard depth and color writing.
2. **Hole Disc**: A circular geometry placed at $Y = 0.01$ with a custom fragment shader that writes to the stencil buffer and clears depth buffer values inside the circle radius.
3. **Interior Cylinder**: A dark textured cylindrical cavity positioned below the street ($Y \in [-3, 0]$) with inverted normals, simulating an underground abyss.
4. **Devour Transition**: Objects falling into the hole are detached from the city grid, given gravity velocity ($V_y = V_y - 9.8 \times dt$), scaled down exponentially ($S = S \times 0.92$), and removed from memory once $Y < -4\text{m}$.

---

## 7. Capacitor Android Native Bridge

```
┌────────────────────────────────────────────────────────┐
│                   Android OS Kernel                    │
├────────────────────────────────────────────────────────┤
│           Capacitor Native Activity (Java/Kotlin)       │
│  - AndroidManifest.xml: Hardware Acceleration Enabled  │
│  - Immersive Full-Screen Sticky Flags                  │
│  - AssetManager serving public/ and dist/ via file:// │
├────────────────────────────────────────────────────────┤
│             Chromium WebView (Hardware WebGL 2.0)      │
│  - Three.js WebGLRenderer                              │
│  - Web Audio Context (Hardware DAC)                    │
│  - TouchEvent Listener (Multi-Touch Pointer API)       │
└────────────────────────────────────────────────────────┘
```

- **AndroidManifest Configuration**:
  - `android:hardwareAccelerated="true"` ensures the Mali/Adreno GPU executes Three.js shaders natively.
  - `android:screenOrientation="sensor"` allows fluid play on both tablets (landscape) and phones (portrait).
- **Audio Context Auto-Unlock**:
  - Android WebViews suspend audio until user interaction. The engine hooks the first touchstart event to call `audioContext.resume()`.

---

## 8. Portable Game Ops, Automation & Data Boundaries

`src/game-ops-engine.js` is a standalone ESM module with injectable storage, clock, namespace, and optional aggregate transport. It has no Three.js, DOM, or project-specific imports, and can be copied into another browser game. The Master Board stores bounded gameplay events and deterministic suggestions in the current browser profile. Repeated low-FPS episodes and repeated hazard losses can create review items; developer notes are categorized by fixed text rules. Suggestions are not code patches and require human review.

The game may apply only explicit, bounded runtime recovery rules: the existing stuck-run watchdog restores a stalled runner, and sustained low frame rate can lower the renderer pixel ratio in two small steps. Both actions are recorded in the operations ledger. This module does not rewrite source files, install packages, or execute arbitrary developer feedback as code. Scheduled repository automation runs the production build and browser regression suite; reports are saved as GitHub Actions artifacts. It runs daily, on manual dispatch, and when an issue is tagged `game-ops`. A downloaded `test_results.json` can be imported into the Master Board; imported test cases, report summaries, failures, and resulting review suggestions are saved in the local ledger. Duplicate report timestamps and malformed results are rejected.

Gameplay telemetry and feedback remain local by default. Cross-device install counts, trends, or user feedback are unavailable without a separately configured and consented analytics service. The module exposes an opt-in aggregate transport adapter but sends nothing unless both consent and an adapter are supplied. Routine QA logs are exportable from the Master Board.

---

## 9. Automated Testing Pipeline

The automated test runner (`scripts/test_runner.js`) validates all architectural layers:
- **Build Layer**: `vite build` compilation and tree shaking.
- **Module Layer**: ES import resolution.
- **State Layer**: Onboarding name/age setting, quiz dialogs, and pause state.
- **3D Geometry Layer**: Mathematical validation of camera vectors and coordinates.
- **Layout Layer**: DOM bounding box collision detection across simulated viewports.
