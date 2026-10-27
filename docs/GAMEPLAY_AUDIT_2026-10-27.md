# Gameplay audit - 2026-10-27

## Scope and method

Audited the local web game, including the previously uncommitted road-detail,
contact-shadow, fast-fall, lane-easing, skyline, headlight and speed-effect changes.
The existing untracked frame-image directories were not changed or included.

Ran two wall-clock sessions in the integrated Chromium browser: 120.002 seconds
before fixes and 120.998 seconds after the core gameplay fixes. Both used Standard
pace, the existing autopilot, normal damage, and automatic restart on death, not
invincibility. This is an automated gameplay observation, not a human playtest.
Separate regression tests exercised specific collision, restart, bus-boarding,
score, resource-cleanup and responsive-layout scenarios.

## Findings and fixes

| Priority | Finding | Resolution |
| --- | --- | --- |
| High | Boarding the W-11 bus called a nonexistent audio method, throwing inside the animation loop and interrupting the boarding frame. | Reused the existing musical horn and added coverage of the real boarding update. |
| High | Despawning pickups, traffic, scenery and road chunks removed objects without freeing their GPU resources. | Added deduplicated cleanup of owned geometries, materials and textures on collection, removal, turns and resets. Preserved shared city assets and Three.js sprite geometry. |
| High | The outer low-hazard collision window could trigger a stumble even during a valid jump, before the inner collision window awarded clearance. | Applied airborne clearance to the graze paths too. |
| High | Crash-animation intervals continued changing player position/camera after immediate restart or revive. | Track and cancel the active interval on reset, revive and return to menu. |
| Medium | Restart could reuse arbitrarily recycled elevated chunks as the launch runway. | Rebuild the initial terrain with its deterministic flat launch profile; dispose the old chunks. |
| Medium | Movement and reward state could survive reset; a fresh run could inherit score, power-ups or falling motion. | Reset fast-fall, lane interpolation, near-miss totals and fresh-run action/power-up state. Revive uses the actual road height. |
| Medium | Pressing outward at an outer lane could release a charged slingshot without actually changing lanes. | Ignore a clamped/no-op lane change before awarding a boost or restarting the transition. |
| Medium | Obstacle near-miss rewards depended on hitting a narrow frame window; their badge behavior differed from traffic. Grazed traffic could later pay a near-miss reward. | Award once when the swept path crosses the obstacle, interpolate lateral position, apply the badge threshold and exclude grazed traffic. |
| Medium | The runner HUD and pause menu displayed player/career XP rather than the current run's score. | Pass run score explicitly to the HUD and select the correct score in the menu; retain classic-mode scoring. |
| Low | Airborne slide played duplicate audio/feedback. | Emit one action sound and the appropriate fast-fall or slide feedback. |
| Low | Invalid Lambert roughness, fractional palette indices and the removed soft-shadow constant generated rendering warnings. | Remove the unsupported property, use integer palette indices and select the supported PCF shadow map. |

## Observed two-minute results

| Measurement | Before | After core fixes |
| --- | --- | --- |
| GPU geometries, first to last sample | 637 to 2,854 | 638 to 761; peak 820 |
| GPU textures, first to last sample | 54 to 652 | 54 to 83; peak 89 |
| Automatic restarts | 2 | 0 |
| Post-fix route distance | Not used as a benchmark | 2,765 m |
| Post-fix remaining hearts | Not used as a benchmark | 2 |
| Post-fix runtime errors | Boarding error observed before fixes | None captured |
| Post-fix sampled game FPS | Not used as a benchmark | 60 at each sample |

The procedural routes differed between sessions. Restart counts and distance are
observations, not a deterministic difficulty comparison. GPU counts vary with
visible scenery; the important change is bounded allocations instead of continuous
growth. TC-58 additionally checks that repeated pickup/chunk disposal returns
allocation counts to baseline.

The final HUD, fresh-run and flat-launch changes were subsequently validated by
regressions and a short keyboard/mobile browser smoke check. That smoke check
confirmed lane switching, jumping, fast-fall/slide, zero-score initialization,
no horizontal overflow, and no captured runtime errors.

## Final validation

- `npm test`: 80/80 browser-runner checks, 7/7 analytics tests and 15/15 operations tests.
- Supplemental hazard-death, upgrade-economy and W-11 suites: 17/17 tests.
- Total: **119 passing checks**, zero failures.
- `npm run build`: passed.
- `git diff --check`: passed.
- Full browser regression coverage includes 14 responsive HUD viewport sizes.
- New regressions: TC-56 through TC-59; retained existing local TC-53 through TC-55.

## Remaining enhancements and limits

- Migrate deprecated `THREE.Clock` to `THREE.Timer` separately, with timing/pause
  regression coverage. The final smoke test still reports this deprecation.
- Split the large main production bundle; Vite still reports a chunk above
  500 kB. This is a loading-performance enhancement, not a failed build.
- Evaluate feedback density and difficulty with human players on physical
  low-end Android devices. Desktop browser FPS is not evidence of device FPS.
- A two-minute run and automated tests cannot establish that every possible
  procedural route, long-session condition or device-specific issue is absent.
- This is a web gameplay audit, not a Play Console release or physical-device
  certification.

## Publication

Web deployment target: GitHub Pages at
https://itsjohn9-cell.github.io/karachi.hole/.

The user approved pushing the tested source to `main` and publishing the web
bundle to `gh-pages`.

- Source gameplay commit: `2942d8446fd1c86511bf8d57dc1edff8cdd1c65f`.
- Pages deployment commit: `3e75c2ed36bcbad1ebd07d19138bde9552981a7f`.
- GitHub Pages build: `built`, matching the deployment commit.
- Live HTML and `assets/main-CM3JoPWT.js`: HTTP 200; SHA-256 hashes exactly
  matched the local production build.
- All seven directly referenced relative script/link assets: HTTP 200.
- Live-browser smoke: onboarding, tutorial dismissal, start, lane switching,
  jump/fast-fall/slide and current-run score verified; no runtime errors captured.

### Subsequent approved Google Play release

After the web release, the user separately approved Android publication:

- Package: `pk.karachi.runner`.
- Version: **2.2.16 (38)**.
- Tracks: **internal** and **alpha**, both independently verified as `completed`.
- Google Play upload, edit validation and edit commit: successful.
- Bundle SHA-256:
  `02b66f6403a198dba2adda7890050a6739070d7cf065d71dfe7847b358efc103`.
- Signed AAB build and signature verification passed; generated release manifest
  confirms version 38, version name 2.2.16 and target SDK 36.
- Packaged web assets match the corresponding local production build.
- Production and beta tracks remain empty and unchanged. No website redeployment
  was performed for this Android-only version bump.

Play API track status does not establish that Google review, processing or tester
availability is complete. The subsequent website-only release approval also
covers pushing this existing release metadata and these notes to GitHub.

## Follow-up: controls, turns and Shop feedback

The subsequent player feedback is addressed locally:

| Feedback | Root cause and correction |
| --- | --- |
| Remove movement buttons; make horn clearer | Removed left/right/jump/slide buttons and their listeners. Swipes and keyboard remain. Horn now has a high-contrast sound-wave icon, label, input hint and activation animation, respecting reduced-motion preferences. Help text matches the controls. |
| Unexplained police deaths | A second graze while the police car was close invoked an instant capture game-over, independent of hearts. Removed this capture path. Grazes now explicitly report slowdown without heart loss; direct hazard impacts still remove hearts. |
| Structures obstruct turns | Slab bounds were calculated while some groups were detached from their chunk, mixing local/world coordinates. Nonmerged props could also be translated twice. Snapshot transforms before reparenting, compute bounds in the attached frame, and include wires/sprites in clearance. Preserve asphalt and ground while clearing both sides, the cross-road entry and exit. Maintain clearance as chunks recycle and traffic moves; remove obstructive power-ups, buses and decorative arches from the approach. |
| Turns hard to read | Junction signs reused the X-shaped pothole marker. They now use dedicated directional arrows, sized to fit their boards. |
| Coins turn sideways | Coins now face the camera without edge-on spinning, with upright face text. The same collection update runs during turns; additional coins follow the actual quarter-circle path. |
| Menu text overflows | Added wrapping/shrink-safe headers and shop rows, stacked purchases on narrow screens, and a compact landscape action row. Menus remain scrollable with reachable actions. |
| Main-menu Shop misplaced/nonfunctional | Replaced the absolute-positioned button with a responsive header grid. Shop now layers above home/menu overlays, supports Escape/focus return, and preserves pause state. Purchases charge only the banked career wallet once, persist atomically, roll back on storage failure and display errors inside the Shop. |

### Follow-up verification

- Full `npm test`: **87/87 browser/build checks**, **7/7 analytics** and
  **15/15 operations**.
- Supplemental hazard, upgrade-economy and W-11 surfing tests: **18/18**.
- **127 passing checks total**; production build and `git diff --check` passed.
- TC-61 checks actual rendered bounds, not only clearance metadata, for left
  and right turns in all three scenery styles. Existing turn-frame continuity
  and GPU-recycling regressions also pass.
- TC-63 checks home/help/progress/shop at 320x568, 568x320, 768x1024 and
  1280x800. Existing phone-landscape menu/HUD and popup-layout checks also pass.
- Interactive browser spot-checks inspected both turn directions, face-on
  readable coins, the horn and the Shop overlay. These are spot checks, not a
  new two-minute uninterrupted gameplay measurement.
- Existing large-bundle and deprecated `THREE.Clock` warnings remain.

The user approved publishing this follow-up to GitHub `main` and GitHub Pages
only. Deployment verification is recorded below after publication. No release
AAB build or Play publication is included. The already-published Android version
2.2.16 (38) does not contain this follow-up.

### Follow-up website publication

- Source pushed to `main`: `8e4910b0b08c01fb091f17cc35b89c3c1315c792`.
- GitHub Pages deployment: `9138b06d710807cba9039c014011f082116eceea`,
  independently verified as `built` for that exact commit.
- Live URL: <https://itsjohn9-cell.github.io/karachi.hole/?release=9138b06>.
- Live HTML and all five directly referenced JavaScript/CSS assets returned
  HTTP 200 and matched local production SHA-256 hashes exactly.
- Live-browser smoke verified Shop visibility above the main menu, four upgrade
  rows without horizontal overflow, Escape close, run start, removed traversal
  buttons, horn activation feedback, lane switching and return to home.
- Deployment worktree removed; only the pre-existing untracked frame directories
  remain. Play Console was not changed.

### Follow-up Android publication

The user subsequently approved **2.2.17 (39)** for **internal** and **alpha**
testing only.

- Signed release AAB build and signature verification passed; generated and
  packaged manifests confirm `pk.karachi.runner`, version 39, version name
  2.2.17 and target SDK 36.
- Bundle SHA-256:
  `41805d861622ec6c58adb1d0177b6056f5049d707270c2db1ceb4d6c4ffeb74f`.
- Bundle size: 3,557,512 bytes. Packaged web assets match the local release build;
  Capacitor-generated files and the omitted `.nojekyll` were checked separately.
- Play bundle upload, edit validation and publication commit succeeded.
- An independent fresh edit verified internal and alpha both contain release
  `2.2.17 (39)`, status `completed`, and the uploaded bundle hash matches.
  The verification edit was deleted without committing it.
- Beta and production remain empty and unchanged. No website redeployment or
  Git push was performed for this Android release; version metadata, release
  notes and these results remain local pending separate GitHub push approval.

Play API `completed` status confirms the track release configuration, not that
Google review/processing has finished or every tester can already download it.

## Second follow-up: turn continuity and removing the police pursuer

These changes were approved for GitHub main, the website and Google Play
internal/alpha publication as **2.2.18 (40)**. Verification is recorded below.
The user explicitly chose to retain heart penalties for missed/wrong turns,
with unmistakable warnings and damage explanations.

| Finding | Correction |
| --- | --- |
| Police van remained a confusing visual threat after capture deaths were removed. | Removed the pursuer model, spawn/update paths, shadow, chase camera changes and obsolete capture resolution. No pursuer returns after restart or repeated grazes. |
| Turns could jump sideways or shift the street/camera at the exit, especially outside the centre lane. | Calculate the arc and outgoing street frame from actual entry coordinates and selected lane, transform the camera into that frame, and clear stale lane interpolation/banking. Blend the entry camera rather than snapping it. |
| Missed inputs could resolve after crossing the corner, producing an invalid tight arc. | Clamp forward travel to the queued-turn or last-input boundary, including boosted/large frames, and resolve missed turns before the junction. |
| A lane dodge could cancel an already-confirmed turn. | Preserve queued turn input; award its bonus only once. |
| Raised straight roads overlapped flat intersections, hiding the runner behind asphalt/ground. | Rebuild existing approach chunks with a continuous transition to ground level, keep newly generated nearby chunks flat, and realign affected objects/player/camera to the new terrain. |
| Heart-loss messages were brief and could immediately be replaced by rewards or heading updates. | Show the actual cause, one-heart cost and remaining hearts for four seconds at higher priority. The turn guide explicitly states the miss penalty; help matches the no-pursuer behavior. |

### Repeated two-minute rendered audit

An initial 120.257-second run revealed the raised-road obstruction in its
mid-turn screenshot despite clean runtime/error metrics. The terrain fix was
then tested and the entire real-time audit repeated in isolated Chrome:

- Duration: **120.175 seconds**, **7,198 rendered frames**, approximately **59.90 FPS**.
- Distance: **2,303 m**; four turns in both directions, including an outer-lane turn.
- No captured runtime errors, police pursuer or automatic restarts.
- Two actual heart losses: **Low-Hanging Bridge Sign** at 643 m and
  **Open Gutter** at 1,216 m. These were hazard impacts, not police capture.
- One heart remained. Normal damage was enabled; no invincibility.
- Mid-turn screenshot inspected: runner and road visible, with no raised-road
  obstruction. This is automated gameplay observation, not physical-device or
  human-playtest certification.
- GPU geometries/textures changed from 597/55 to 745/67 as scenery changed;
  those samples alone do not prove leak freedom. TC-58 separately verifies
  resource cleanup.

### Re-audit validation

- Full browser/build runner: **90/90** checks, including new TC-64 through TC-66
  and all 14 HUD layout sizes.
- Analytics **7/7**, operations **15/15**, supplemental death/economy/W-11
  tests **18/18**: **130 passing checks** in total.
- Production web build and whitespace/diff validation passed.
- Existing Three.js clock-deprecation and large-bundle warnings remain.
- Android 2.2.17 (39) does **not** contain this second follow-up; version 40 does.

### Approved 2.2.18 (40) publication

- Release metadata checks TC-01/02 passed after the version bump; publisher and
  Pages deployment scripts passed syntax checks and `git diff --check` passed.
- Signed release AAB built successfully. JAR signature verified; merged release
  manifests confirm version code 40, version name 2.2.18 and target SDK 36.
- Bundle size: **3,556,190 bytes**; SHA-256:
  `b3eb0e5c8008a46052226c88a32df2309ebc798875affe123b3f0634b77f9df5`.
- All 20 application files from the web build match the AAB byte-for-byte.
  The Pages-only `.nojekyll` marker is intentionally excluded by Android;
  packaged Cordova files match the Capacitor asset copies.
- Google Play upload, edit validation and commit succeeded. A fresh independent
  edit verified **internal** and **alpha** at **2.2.18 (40)**, both `completed`,
  and confirmed the uploaded bundle hash above. Beta and production remain empty.
- Google review, processing and tester availability may still be pending despite
  the API `completed` release status.
- GitHub source and Pages deployment verification will be appended after their
  approved publication completes.
