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
  globalThis.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
      style: {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      addEventListener: () => {},
      getContext: () => new Proxy({
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        measureText: () => ({ width: 10 })
      }, {
        get: (target, prop) => (prop in target ? target[prop] : () => {}),
        set: () => true
      })
    }),
    body: { appendChild: () => {}, removeChild: () => {} }
  };
}
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

globalThis.window.__karachi_game_initialized__ = true;

const { AvatarBuilder } = await import('../src/avatar.js');
const { audio } = await import('../src/audio.js');
const { Game } = await import('../src/main.js');

test('Hazard Death Resolution Classification (getDeathResolutionType)', async () => {
  const { Game } = await import('../src/main.js');
  const dummyScene = new THREE.Scene();
  const game = Object.create(Game.prototype);

  // 1. Gutter / Manhole deaths
  assert.equal(game.getDeathResolutionType('Open Gutter', { type: 'gutter' }), 'gutter');
  assert.equal(game.getDeathResolutionType('Rain-Softened Pothole', { type: 'pothole' }), 'gutter');
  assert.equal(game.getDeathResolutionType('Sewage Overflow', { type: 'sewage' }), 'gutter');
  assert.equal(game.getDeathResolutionType('Fell into Open Manhole', null), 'gutter');

  // 2. Chaser Capture deaths
  assert.equal(game.getDeathResolutionType('Captured by Sindh Police Mobile!', { type: 'chaser_capture' }), 'chaser');
  assert.equal(game.getDeathResolutionType('Tackled by Rival Gang Pursuer', null), 'chaser');

  // 3. Vehicle / Wall crash deaths
  assert.equal(game.getDeathResolutionType('Stalled Qingqi Rickshaw', { type: 'rickshaw' }), 'vehicle_crash');
  assert.equal(game.getDeathResolutionType('Bedford Truck Impact', { type: 'traffic_vehicle' }), 'vehicle_crash');
  assert.equal(game.getDeathResolutionType('Low-Hanging Bridge Sign', { type: 'overhead_bridge_sign' }), 'vehicle_crash');
  assert.equal(game.getDeathResolutionType('Crash into Saddar Heritage Scaffolding', { type: 'heritage_scaffold' }), 'vehicle_crash');
});

test('AvatarBuilder Gutter Fall Animation (Flailing limbs into void)', () => {
  const avatar = AvatarBuilder.createAvatarMesh('tariq', true);
  AvatarBuilder.triggerGutterFall(avatar);

  assert.equal(avatar.userData.deathType, 'gutter');

  // Simulate animation frame
  AvatarBuilder.updateAnimation(avatar, false, 0.05, 1.0, false);
  const ud = avatar.userData;

  // Arms should be flailing straight up
  assert.ok(ud.armLGroup.rotation.x < -1.5, 'Left arm should flail upward');
  assert.ok(ud.armRGroup.rotation.x < -1.5, 'Right arm should flail upward');
});

test('AvatarBuilder Backward Ragdoll Animation (Vehicle / Wall Crash)', () => {
  const avatar = AvatarBuilder.createAvatarMesh('tariq', true);
  AvatarBuilder.triggerBackwardRagdoll(avatar);

  assert.equal(avatar.userData.deathType, 'ragdoll');

  // Simulate animation frame
  AvatarBuilder.updateAnimation(avatar, false, 0.05, 1.0, false);
  const ud = avatar.userData;

  // Torso arched backward, arms knocked wide
  assert.ok(ud.torso.rotation.x < -0.5, 'Torso should arch backward');
  assert.ok(ud.head.rotation.x < -0.3, 'Head should snap back');
  assert.ok(ud.armLGroup.rotation.x > 0.5, 'Arms should fling backward');
});

test('AvatarBuilder Trip and Fall Animation (Chaser Capture)', () => {
  const avatar = AvatarBuilder.createAvatarMesh('tariq', true);
  AvatarBuilder.triggerTripAndFall(avatar);

  assert.equal(avatar.userData.deathType, 'trip');

  // Simulate animation frame
  AvatarBuilder.updateAnimation(avatar, false, 0.05, 1.0, false);
  const ud = avatar.userData;

  // Torso pitched flat forward onto ground, hands bracing pavement
  assert.ok(ud.torso.rotation.x > 0.5, 'Torso should pitch forward towards asphalt');
  assert.ok(ud.armLGroup.rotation.x < -0.5, 'Arms should brace pavement');
});

test('AvatarBuilder resetDeathAnimation restores character pose', () => {
  const avatar = AvatarBuilder.createAvatarMesh('tariq', true);
  AvatarBuilder.triggerBackwardRagdoll(avatar);
  AvatarBuilder.updateAnimation(avatar, false, 0.05, 1.0, false);
  assert.equal(avatar.userData.deathType, 'ragdoll');

  AvatarBuilder.resetDeathAnimation(avatar);
  assert.equal(avatar.userData.deathType, null);
  assert.equal(avatar.userData.torso.rotation.x, 0);
  assert.equal(avatar.userData.head.rotation.x, 0);
});

test('Audio Dynamic Music Pitching (5% per speed increment, reset on death)', () => {
  audio.resetMusicPitch();
  assert.equal(audio.getMusicPitch(), 1.0, 'Pitch should start at 1.0');

  // Base runner speed 13.5 m/s
  const baseRunnerSpeed = 13.5;

  // Speed = 14.5 (+1 m/s): 1 tier = +5% -> 1.05
  let speed = 14.5;
  let speedDelta = Math.max(0, speed - baseRunnerSpeed);
  let speedTiers = Math.floor(speedDelta / 1.0);
  let targetPitch = 1.0 + (speedTiers * 0.05);
  audio.setMusicPitch(targetPitch);
  assert.equal(Number(audio.getMusicPitch().toFixed(2)), 1.05);

  // Speed = 16.5 (+3 m/s): 3 tiers = +15% -> 1.15
  speed = 16.5;
  speedDelta = Math.max(0, speed - baseRunnerSpeed);
  speedTiers = Math.floor(speedDelta / 1.0);
  targetPitch = 1.0 + (speedTiers * 0.05);
  audio.setMusicPitch(targetPitch);
  assert.equal(Number(audio.getMusicPitch().toFixed(2)), 1.15);

  // Surfing boost speed = 20.25 (+6.75 m/s): 6 tiers = +30% -> 1.30
  speed = 20.25;
  speedDelta = Math.max(0, speed - baseRunnerSpeed);
  speedTiers = Math.floor(speedDelta / 1.0);
  targetPitch = 1.0 + (speedTiers * 0.05);
  audio.setMusicPitch(targetPitch);
  assert.equal(Number(audio.getMusicPitch().toFixed(2)), 1.30);

  // Player dies -> Reset pitch back to 1.0
  audio.resetMusicPitch();
  assert.equal(audio.getMusicPitch(), 1.0, 'Pitch must reset to 1.0 on death');
});
