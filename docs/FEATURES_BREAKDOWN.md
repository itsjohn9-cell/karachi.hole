# KARACHI RUNNER - Gameplay & Master Operations Features

This document covers the Karachi Runner experience and its Master/Developer operations tools. The shared console is focused on the current Karachi city loop; it no longer exposes legacy civic-mode controls as Runner options.

## Runner Weather & Road Hazards

KARACHI RUNNER begins in Soldier Bazar and follows a 20,000 m city loop through named Karachi neighborhoods. The HUD, results and operations console show neighborhood names only; internal route progression values are not shown to players. The route advances through Soldier Bazar/PECHS, Lyari/Chakiwara and Saddar/Burns Road, switching street scenery and local hazards as each area is reached, then finishes back at Soldier Bazar. Running speed, hazard spacing and fair multi-lane combinations scale up during the loop. The bundled locality names are curated from [Wikipedia's Karachi neighborhoods category](https://en.wikipedia.org/wiki/Category:Neighbourhoods_of_Karachi), accessed October 22, 2026.

The route also includes a recurring monsoon sequence after the 450 m warmup. Rain uses a lightweight animated rainfall effect; puddled potholes then appear during the post-rain phase. Potholes can be jumped or avoided by lane switching, and supplemental rain or difficulty hazards preserve at least one open lane.

The start screen is a route preview rather than a route picker: every new or restarted run begins in Soldier Bazar. Help, Progress and Run use a clear utility/action hierarchy, with mobile-sized buttons, accessible focus and dialogs that remain within the viewport.

## Unified Master & Developer Console

The Master/Developer console is a browser-local operations UI for live Runner telemetry, explicitly labelled active-run test actions, progression unlocks, weather QA snapshots and feedback notes. Both Master and Developer URLs redirect to the same page. Telemetry reports area, neighborhood name, loop distance, challenge tier, score, hearts, lane/speed, hazards, weather, rupees and active power-ups. Test actions stay disabled unless a connected Runner session is actively running; local test unlocks are identified as persistent to this browser profile.

---

## 1. 3D Karachi Hero Character Avatars & Procedural Animations

### Design Philosophy
Moving completely away from an abstract dark hole in the ground, Karachi Hole.io puts players directly into the shoes of authentic Karachi street heroes. The character moves through streets, avenues, and alleys with skeletal limb animations, floating health/name sprites, and a glowing civic action aura.

### 5 Playable Karachi Avatars:
1. **Tariq (Tariq Road Street Hero)**:
   * Wears traditional Pakistani green and white Shalwar Kameez with matching brown Peshawari chappals.
   * Bonus: +10% street patrol run speed.
2. **Dr. Ayesha (Civil Hospital Crusader)**:
   * Wears white medical coat, traditional Sindhi Ajrak patterned dupatta/scarf, and stethoscope.
   * Bonus: +15% civic cleansing interaction reach.
3. **Inspector Farooq (Karachi Traffic Police)**:
   * Wears crisp khaki Sindh Police uniform with police peaked cap, duty belt, and aviator sunglasses.
   * Bonus: Civic shockwave stuns fleeing robbers and reckless racers.
4. **Bilal (Edhi Ambulance Volunteer)**:
   * Wears white ambulance uniform and high-visibility red rescue vest with crescent insignia.
   * Bonus: Double XP payout for VIP clearance and citizen rescue missions.
5. **Zain (Eco Cadet)**:
   * Young school cadet wearing navy blazer, grey trousers, backpack, and heroic cape.
   * Bonus: Rapid waste sorting bonus score in eco cleanup missions.

---

## 2. Karachi Street-Level Third-Person Perspective Camera

### Camera Specifications & Dynamics
* **Street-Level Framing**: Third-person perspective positioned at human eye-level ($Y \approx 2.35\text{m}$, distance $\approx 4.4\text{m}$) looking straight forward down the road ($6.5\text{m}$ ahead).
* **Dynamic Facing Angle Tracking**: Smoothly swings behind the player's movement direction as they turn into side alleys, boulevards, and bazaars with dampened angular interpolation.
* **Dynamic Steering Sway & Bank Tilt**: Smooth lateral camera sway and subtle banking roll ($3.5^\circ$) when steering into corners.
* **Building Ghosting**: Raycasting detects tall colonial buildings or skyscrapers between the camera and hero, dynamically rendering them at `opacity: 0.15` to ensure 100% unobstructed street visibility.

---

## 3. Real-Life Solid Obstacle Collisions

### Collision Physics & Boundary Sliding
* **Solid Buildings, Monuments & Food Stalls**: Player and competitor bots cannot walk through solid buildings, colonial structures, heritage walls, or food stalls.
* **Wall Sliding Algorithm**: Decomposes character movement velocity into surface-parallel slide vectors when colliding with building boundaries. Characters smoothly glide along building perimeters rather than stopping abruptly or getting stuck.
* **Map Boundary Buffers**: Smoothly deflects characters along Bab-e-Karachi, Saddar heritage walls, and Arabian Sea waterfronts.

---

## 4. Multi-Mission District Checklists & Level 2 Fix

### Multi-Mission Progression
Instead of single-evil quotas, each of the 5 Karachi districts features a comprehensive 5-mission checklist:
* **District 1 (Tariq Road & PECHS)**: Stop Water Tanker Mafia (1), Catch Mobile Snatchers (2), Repair Potholes (3), Bust Gutka Peddlers (3), Clean Up Street Waste (4).
* **District 2 (Saddar Bazaar & Empress Market)**: Clear VIP Escorts for Ambulance (2), Bust Bhatta Extortionists (3), Catch Reckless Racers (3), Dismantle Dangerous Kundas (2), Clear Market Rubbish (4).
* **3D Rotating Waypoint Diamond Beacons**: Every active mission target is marked with a 3D rotating diamond octahedron beacon floating above it, glowing brightly with target emoji markers (`🚰`, `🚑`, `📱`, `🕳️`, `📜`).
* **Level 2 Accessibility Fix**: VIP Prado convoys and illegal water tankers are interactable at Tier 1, allowing players to immediately engage in Level 2 objectives without artificial size gatekeeping.

---

## 5. Interactive Educational Mini-Puzzles

### Age-Calibrated Mini-Puzzles:
* 🐣 **Kids (Ages 5–8) - Waste Sorter Puzzle**: Drag-and-drop / click to sort recyclable plastic bottles, banana peels, and aluminum cans into designated Green (Organic) and Blue (Recycle) bins.
* 🎒 **Junior (Ages 9–12) - Water Pipe Flow Connect**: Click to rotate municipal water pipe segments (Straight, Corner, T-Junction) to bridge dry PECHS neighborhood pipes back to the water reservoir.
* 🏆 **Teens & Adults (Ages 13+) - Emergency Route Dispatch**: Navigate an Edhi Ambulance through gridlocked Karachi streets (Shaheed-e-Millat, M.A. Jinnah Rd, Shahrah-e-Faisal) to Civil Hospital.
* **Unskippable & Auto-Resume**: Puzzles cannot be bypassed until correctly solved, and gameplay automatically resumes after 1.2s of celebration fanfare upon completion.

---

## 6. Zero-Overlap Dedicated Quadrant HUD

The UI has been engineered into 4 clean, dedicated quadrants with zero overlaps across small mobile phones to 4K desktop screens:
* **Top Fixed Header**: Player avatar badge, current level, match timer, score pill, and sound/pause icons.
* **Top-Left Card**: District title, multi-mission checklist, remaining counter, and active crisis indicator.
* **Top-Right Card**: Live competitor scoreboard with real-time rankings and active player rank tag.
* **Bottom-Left Card**: Circular Karachi mini-map with real-time player, threat, and district boundaries.
* **Bottom-Right**: Glowing orange ⚡ SPRINT button.

---

## 7. Dynamic Competitor Bot AI & Scoring

* **Active Street Roaming**: Competitor bots patrol Karachi streets, seek collectable debris, and collect items.
* **Difficulty-Scaled Score Accumulation**: Bots accumulate points organically on the live scoreboard (every 10s in Kids mode, every 6s in Senior mode).
* **Kid-Friendly Safety**: In Kids/Easy mode, bots never devour the player, keeping the experience empowering and fun.

Upon launching the game, players are greeted by the **Start Mission Modal** before timer and physics begin:

1. **Custom Hero Name**:
   * Pre-filled with "Karachi Hero", customizable up to 18 characters.
   * Displays on the player's 3D void label, leaderboard, and victory screens.
2. **Three Age Tiers**:
   * 🐣 **Kids (Ages 5–8)**:
     * High-contrast visual picture cues and emoji hints (`🚰 ➡️ 💧 🚫`).
     * Friendly difficulty tuning: AI bots move slower and never hunt the player.
     * Simple dilemmas centered on home habits (turning off taps, saving electricity, being kind to stray pets).
   * 🎒 **Junior (Ages 9–12)**:
     * Focus on neighborhood responsibility and emergency response (giving way to Edhi Ambulances, keeping drains free of plastic bags, reporting broken streetlights).
   * 🏆 **Teens & Adults (Ages 13+)**:
     * Focus on civic governance, anti-extortion awareness, opposing illegal land grabbing (China-Cutting), and protecting public footpaths.

---

## 3. Civic Targets: Bad Guys vs. Good Friends

### 🔴 Bad Guys & Civic Evils (Devour Them All!)
Each bad guy is highlighted with a **bouncing red chevron arrow**, an **animated red warning ring**, and an overhead target decal (`😈 DEVOUR THIS BAD GUY!`):

| Civic Evil | Visual Identity & Behavior | Devour Rewards & Impact |
| :--- | :--- | :--- |
| **Water Tanker Mafia** | Giant blue water tanker trucks siphoning tap water from residential pipelines. | **+1,400 XP**, triggers towering freshwater geyser, restores tap water to dry homes with celebrating residents. |
| **Mobile Snatchers** | Armed thugs on 70cc motorbikes threatening students. Flees in panic when approached. | **+850 XP**, rescues citizen, drops stolen money briefcases, citizen celebrates with saved mobile. |
| **VIP Protocol Convoys** | Heavy black SUVs with flashing red-blue police beacons causing 2-hour traffic jams. | **+1,600 XP**, frees trapped yellow taxis and ambulances, drivers honk happily. |
| **Bhatta Extortionists** | Criminals waving extortion slips demanding money from bazaar shopkeepers. | **+700 XP**, confiscates extortion slips, reopens peaceful market. |
| **Reckless One-Wheelers** | Loud silencer-less racing bikes performing dangerous stunts in public avenues. | **+500 XP**, impounds racing bike, creates safe pedestrian walkway. |
| **Road Potholes** | Broken asphalt craters and burst municipal water leaks. | **+80 XP**, transforms broken crater into smooth carpet road with flowerpots. |
| **Illegal Power Kundas** | Sparking overloaded wire nests on utility transformers causing load shedding. | **+750 XP**, clears illegal wires and replaces them with a clean solar microgrid. |
| **China-Cutting Encroachers** | Illegal brick walls built over public footpaths. | **+650 XP**, demolishes wall, restores open public promenade. |
| **Corrupt Politicians** | VIP politicians fleeing with foreign currency briefcases. | **+600 XP**, recovers public funds with confetti money bursts. |

### 🟢 Good Friends (Protected from Devour!)
Good friends are surrounded by an **emerald green halo** and an overhead friendly decal (`💚 FRIEND • INNOCENT CITIZEN`):
* **Innocent Citizens**: Walking pedestrians in shalwar kameez. If touched, they shower the player with green love hearts and joyous blessings.
* **Burns Road Bun Kabab Carts**: Touching the cart gives an instant **Spicy Chutney Turbo Boost** (5 seconds of 1.45x top speed!).
* **Quetta Karak Chai Dhabas**: Touching gives a **Dudh Patti Energy Recharge** with golden shockwaves.
* **Friendly Stray Dogs & Kittens**: Touching them lets the player pet them, triggering tail-wagging barks, purrs, and heart sparkles.
* **Safe Commuters (Buses & Rickshaws)**: Honest working drivers peacefully navigating the city.

---

## 4. Before ➔ After Civic Transformation System

When the hole devours a civic evil, the game executes an instant **Civic Transformation**:
1. **Pothole Devoured**: The broken asphalt hole disappears and is replaced by a gleaming, smooth asphalt road segment with green shrubs and a banner: `BEFORE: Broken Pothole ➔ AFTER: Smooth Repaired Road!`.
2. **Water Tanker Devoured**: Water hoses detach, rooftop tanks overflow with sparkling blue geysers, and residents on balconies wave happily: `"Tap water is back! Taps are full! Thank you Hero!"`.
3. **Robber Devoured**: Victim citizen jumps in joy, green hearts burst around them, shouting: `"Praise be! My phone is saved!"`.
4. **VIP Convoy Devoured**: The stuck traffic jam dissolves, yellow cabs accelerate down the avenue, and an Edhi Ambulance with flashing sirens speeds safely to Civil Hospital.

---

## 5. Non-Skippable Pictorial Educational Dilemma System

### Design Rules
* **Non-Skippable**: Close/Skip buttons are intentionally absent. The player must think and select the correct option to proceed.
* **Rich Pictorial Visuals**: Options feature large 48px+ visual emojis, color badges, and simple English instructions.
* **Encouraging Feedback Loop**:
  * **Incorrect Choice**: Button shakes with red glow; friendly prompt appears (*"Try again! Look closely at the pictures to save Karachi!"*). No penalty, no points deducted.
  * **Correct Choice**: Green glow, victory fanfare sound, +500 XP to +750 XP awarded, +25s to +40s match time added, and **automatic return to game after 1.2 seconds**.

### Earned Civic Medals
1. 🚰 **Water Guardian**: Learned to stop water wastage and tanker theft.
2. 🚑 **Ambulance Hero**: Gives right-of-way to emergency ambulances.
3. 🧹 **Clean City Star**: Disposes trash in municipal bins.
4. ⚡ **Energy Champion**: Turns off unneeded appliances to stop power overloads.
5. 🐾 **Kind Companion**: Provides water bowls for street pets.
6. 🚦 **Traffic Champion**: Respects zebra crossings and traffic signals.
7. 🌱 **Urban Forester**: Plants trees in public green spaces.

---

## 6. District Progression (5 Karachi Districts)

1. **District 1: Tariq Road & PECHS**:
   * *Crisis*: Water Tanker Extortion & Street Snatchers.
   * *Targets*: 1 Water Tanker, 2 Snatchers, 3 Gutka Vendors, 3 Potholes, 6 Trash Bags.
2. **District 2: Saddar & Empress Market**:
   * *Crisis*: VIP Protocol Traffic Jams & Ambulance Gridlock.
   * *Targets*: 2 VIP Convoys, 2 Armed Dakoos, 3 Bhatta Slips, 3 One-Wheelers, 4 Debris Piles.
3. **District 3: Water Pump & Gulshan-e-Iqbal**:
   * *Crisis*: Tanker Cartels & Sparking Power Kundas.
   * *Targets*: 3 Water Tankers, 3 Sparking Kundas, 2 Encroachment Walls, 2 VIP Convoys, 2 Robbers.
4. **District 4: Clifton & Sea View Coast**:
   * *Crisis*: Corrupt Politicians & Beachfront Encroachments.
   * *Targets*: 4 Corrupt VIPs, 2 Speeding Escorts, 2 Beach Tankers, 3 Mangrove Grabbers.
5. **District 5: Mazar-e-Quaid Metropolis (Grand Finale)**:
   * *Crisis*: Metropolis Mafia Eradication. Total city cleansing fulfilling Quaid's dream.
   * *Targets*: 6 Foreign Asset Politicians, 3 Motorcades, 3 Tanker Cartels, 3 Extortionists, 3 Snatchers.

---

## 7. Realtime Tracking HUD & Scoreboard

* **Dedicated Top-Right Scoreboard**: Pinned card tracking live ranks (`1st to 5th`), hole levels, and point tallies.
* **Top-Center Timer & Score**: Large 4-minute match timer pill with score counter and cleansing progress bar.
* **Crime Radar Compass Bar**: Guides players with directional arrow indicators (`➔ 14m Ahead`, `⬅ 22m Left`).
* **2D Glass Mini-Map Radar**: 65m coverage circle with rotating radar sweep, colored target pips, edge-clamped arrows for distant targets, and player heading chevron.
* **Auto-Pause on Inactivity**: Instant modal on tab switch (`visibilitychange` / `blur`) with **"▶ RESUME PATROL"** action.
