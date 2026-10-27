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

No Android release bundle, Play Console upload or track publication was performed.
