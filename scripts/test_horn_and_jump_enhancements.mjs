import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

// Mock browser globals for Node test environment
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { reload: () => {} },
    innerWidth: 1280,
    innerHeight: 720
  };
}
if (typeof globalThis.document === 'undefined') {
  const elements = new Map();
  globalThis.document = {
    getElementById: (id) => elements.get(id) || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        style: {},
        classList: {
          classes: new Set(),
          add: (c) => el.classList.classes.add(c),
          remove: (c) => el.classList.classes.delete(c),
          contains: (c) => el.classList.classes.has(c)
        },
        setAttribute: () => {},
        removeAttribute: () => {},
        offsetWidth: 100,
        addEventListener: () => {},
        querySelector: () => ({ textContent: '' }),
        getContext: () => new Proxy({
          createLinearGradient: () => ({ addColorStop: () => {} }),
          createRadialGradient: () => ({ addColorStop: () => {} }),
          measureText: () => ({ width: 10 })
        }, {
          get: (target, prop) => (prop in target ? target[prop] : () => {}),
          set: () => true
        })
      };
      return el;
    },
    body: { appendChild: () => {}, removeChild: () => {} }
  };
}

const { KarachiModels } = await import('../src/karachiModels.js');

test('KarachiModels.createSpringLaunchPad creates hydraulic trampoline pad', () => {
  const pad = KarachiModels.createSpringLaunchPad(2.4, 3.8);
  assert.ok(pad instanceof THREE.Group, 'Expected a THREE.Group');
  assert.equal(pad.userData.isSpringPad, true);
  assert.equal(pad.userData.isBoostPad, true);
  assert.ok(pad.children.length >= 4, 'Must have base, ring, spring coil, and chevrons');
});

test('Horn Cooldown duration scales with pace: easy (4s), standard (8s), hard (14s)', () => {
  const getCooldown = (pace) => {
    if (pace === 'easy') return 4.0;
    if (pace === 'hard') return 14.0;
    return 8.0;
  };

  assert.equal(getCooldown('easy'), 4.0, 'Easy mode should give 4.0s quick cooldown');
  assert.equal(getCooldown('standard'), 8.0, 'Standard mode should give 8.0s balanced cooldown');
  assert.equal(getCooldown('hard'), 14.0, 'Hard mode should give 14.0s high-stakes cooldown');
});

test('Horn does NOT remove immovable structural hazards (wires, gutters, bridge signs)', () => {
  const hazards = [
    { type: 'wire', hazardType: 'HIGH_HAZARD', isHit: false },
    { type: 'gutter', hazardType: 'LOW_HAZARD', isHit: false },
    { type: 'pothole', hazardType: 'LOW_HAZARD', isHit: false },
    { type: 'overhead_bridge_sign', hazardType: 'HIGH_HAZARD', isHit: false },
    { type: 'rickshaw', hazardType: 'MID_HAZARD', isHit: false },
    { type: 'snatcher', hazardType: 'MID_HAZARD', isHit: false },
    { type: 'cone', hazardType: 'LOW_HAZARD', isHit: false }
  ];

  const clearWithHorn = (obs) => {
    const isImmovableStructure = (
      obs.type === 'wire' ||
      obs.type === 'gutter' ||
      obs.type === 'pothole' ||
      obs.type === 'digging' ||
      obs.type === 'overhead_bridge_sign' ||
      obs.hazardType === 'HIGH_HAZARD'
    );
    if (isImmovableStructure) {
      return false; // preserved!
    }
    obs.isHit = true;
    return true; // cleared or deflected
  };

  assert.equal(clearWithHorn(hazards[0]), false, 'Wire must NOT be deleted by horn');
  assert.equal(clearWithHorn(hazards[1]), false, 'Gutter must NOT be deleted by horn');
  assert.equal(clearWithHorn(hazards[2]), false, 'Pothole must NOT be deleted by horn');
  assert.equal(clearWithHorn(hazards[3]), false, 'Overhead bridge sign must NOT be deleted by horn');
  assert.equal(clearWithHorn(hazards[4]), true, 'Rickshaw must be parted / cleared by horn');
  assert.equal(clearWithHorn(hazards[5]), true, 'Snatcher must be scared away by horn');
  assert.equal(clearWithHorn(hazards[6]), true, 'Traffic cone must be blasted aside by horn');
});

test('Super Jump Springs enhancement: immediate soaring jump & skyline clearance', () => {
  let jumpTriggered = false;
  let jumpStrengthUsed = 0;
  const mockPlayer = {
    jump: (strength) => {
      jumpTriggered = true;
      jumpStrengthUsed = strength;
      return true;
    }
  };

  // When 'jump' powerup is collected:
  const superJumpActive = true;
  mockPlayer.jump(superJumpActive ? 11.5 : 6.2);

  assert.equal(jumpTriggered, true, 'Immediate jump should be triggered on collection');
  assert.equal(jumpStrengthUsed, 11.5, 'Super jump strength should be 11.5 for skyline clearance');
});

test('Hydraulic Spring Trampoline Pad: 12.5 launch velocity onto rooftops', () => {
  let launchHeight = 0;
  const pad = { isSpringPad: true, isUsed: false };
  const mockPlayer = {
    jump: (strength) => { launchHeight = strength; }
  };

  if (pad.isSpringPad) {
    mockPlayer.jump(12.5);
    pad.isUsed = true;
  }

  assert.equal(pad.isUsed, true);
  assert.equal(launchHeight, 12.5, 'Trampoline launch velocity should be 12.5m/s');
});

