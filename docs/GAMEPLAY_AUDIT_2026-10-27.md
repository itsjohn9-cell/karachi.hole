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
