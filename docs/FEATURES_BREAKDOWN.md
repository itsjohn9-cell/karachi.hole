# Karachi Hole.io - Complete Features Breakdown

This document provides a comprehensive technical and functional breakdown of all gameplay systems, visual presentation features, educational modules, and civic mechanics in **Karachi Hole.io**.

---

## 1. 3D Subway Surfers & Grand Theft Auto Street Chase Camera

### Design Philosophy
Moving away from generic top-down hole perspectives, Karachi Hole.io adopts a low-angle, street-level chase camera inspired by arcade runners (**Subway Surfers**) and open-world street driving games (**Grand Theft Auto**). This immerses players directly into Karachi's bustling street corridors with rich atmospheric depth.

### Camera Specifications & Dynamics
* **Camera Height**: `2.65m + (player.radius * 0.62)`. Keeps the hole rim clearly visible in the foreground while opening up a dramatic street-level horizon view.
* **Camera Distance Behind**: `4.65m + (player.radius * 0.72)`. Pulls back smoothly as the hole grows from level 1 to level 6.
* **Forward Horizon Look Target**: Looks down the street axis `(player.x, 1.35, player.z - 8.5m - player.radius * 0.8)`.
* **Dynamic Steering Sway & Bank Tilt**:
  * Turning left or right sways the camera horizontally: `steerSway = moveVector.x * 0.85`.
  * Banks the camera roll axis: `camera.rotation.z = -moveVector.x * 0.045` with smooth interpolation (`THREE.MathUtils.lerp`).
* **Building Ghosting (Occlusion Transparency)**:
  * Whenever tall buildings or monument towers are between the camera position and the player hole, an occlusion raycast detects the obstruction.
  * The building's materials dynamically fade to `opacity: 0.15` (translucent ghost silhouette), guaranteeing the hole and street targets are never occluded.
* **Corner Anti-Stick Buffer**:
  * If a player approaches map boundaries or corner angles, parallel velocity deflection glides the hole along walls without sticky corner jamming.

---

## 2. Onboarding & Age-Tier Selection System

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
| **Illegal Power Kundas** | Sparking overloaded wire nests on K-Electric transformers causing load shedding. | **+750 XP**, chops illegal wires, replaces with clean solar microgrid. |
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
