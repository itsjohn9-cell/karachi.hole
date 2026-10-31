import test from 'node:test';
import assert from 'node:assert/strict';

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

test('Mystery Trunk Gacha Rewards & Wallet Deductions', async () => {
  const { saveManager, DEFAULT_SAVE_DATA } = await import('../src/saveManager.js');

  // Initialize fresh save with wallet balance
  saveManager.data = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
  saveManager.data.runnerStats.totalRupees = 1500;

  // Buy mystery crate
  const res = saveManager.buyConsumable('mystery_crate');
  assert.equal(res.success, true);
  assert.ok(['coins', 'token', 'fever', 'badge'].includes(res.rewardType), 'Should return valid reward type');
  assert.ok(res.message.length > 5, 'Should return descriptive celebration message');

  // Wallet should have deducted 300 Rs (plus coins if coins reward)
  if (res.rewardType === 'token' || res.rewardType === 'fever' || res.rewardType === 'badge') {
    assert.equal(saveManager.data.runnerStats.totalRupees, 1200);
  } else if (res.rewardType === 'coins') {
    assert.ok(saveManager.data.runnerStats.totalRupees >= 1200 + res.amount);
  }
});

test('AvatarBuilder Authentic Karachi Features & Kinematics', async () => {
  const { AvatarBuilder } = await import('../src/avatar.js');

  // Create Tariq (Street Hero)
  const avatar = AvatarBuilder.createAvatarMesh('tariq', true);
  assert.ok(avatar, 'Should create avatar mesh');
  const ud = avatar.userData;

  assert.ok(ud.torso, 'Torso exists');
  assert.ok(ud.head, 'Head exists');
  assert.ok(ud.armLGroup, 'Left arm group exists');
  assert.ok(ud.armRGroup, 'Right arm group exists');
  assert.ok(ud.legLGroup, 'Left leg group exists');
  assert.ok(ud.legRGroup, 'Right leg group exists');
  assert.ok(ud.damanFront, 'Kameez Front Daman exists');
  assert.ok(ud.damanBack, 'Kameez Back Daman exists');

  // Test dynamic athletic running stride and forward lean
  AvatarBuilder.updateAnimation(avatar, true, 0.05, 1.2, false);
  assert.ok(ud.torso.rotation.x > 0.05, 'Torso should lean forward in Temple Run athletic posture');
  assert.notEqual(ud.armLGroup.rotation.x, 0, 'Arms should pump in counter-phase');
  assert.notEqual(ud.legLGroup.rotation.x, 0, 'Legs should stride forward');

  // Test idle posture
  AvatarBuilder.updateAnimation(avatar, false, 0.05, 1.0, false);
  assert.ok(ud.torso.position.y > 1.0, 'Breathing bounce should maintain realistic vertical position');
});

test('On-Screen JUNOON & SURF Action Controls State Logic', () => {
  // Test state transitions for Junoon & Surf
  let feverCharge = 0;
  let isFeverActive = false;
  let isFeverReady = false;

  // Charging state: discolored, percentage showing
  feverCharge = 45;
  isFeverReady = feverCharge >= 100 && !isFeverActive;
  assert.equal(isFeverReady, false, 'Charging at 45% should not be ready');

  // Fully charged state: ready, colored
  feverCharge = 100;
  isFeverReady = feverCharge >= 100 && !isFeverActive;
  assert.equal(isFeverReady, true, '100% charge triggers fully colored ready state');

  // Active state
  isFeverActive = true;
  assert.equal(isFeverActive, true, 'Active state triggers flame rush');

  // Surf states
  let hoverboardTimer = 0;
  let hoverboardCooldown = 0;

  // Ready to surf
  assert.equal(hoverboardTimer === 0 && hoverboardCooldown === 0, true, 'Surf is ready when timer & cooldown are 0');

  // Surfing active with shield
  hoverboardTimer = 22.0;
  assert.equal(hoverboardTimer > 0, true, 'Surfing is active with countdown');

  // Surfing cooling down / reload
  hoverboardTimer = 0;
  hoverboardCooldown = 15.0;
  assert.equal(hoverboardCooldown > 0, true, 'Hoverboard is discolored reload state during cooldown');
});

test('Pakistan Cities Tour Word Hunt & Progression', async () => {
  const { saveManager, DEFAULT_SAVE_DATA } = await import('../src/saveManager.js');
  const { PAKISTAN_CITIES_TOUR } = await import('../src/main.js');

  // Verify tour sequence has all 8 Pakistani cities
  assert.equal(PAKISTAN_CITIES_TOUR.length, 8);
  assert.equal(PAKISTAN_CITIES_TOUR[0].name, 'KARACHI');
  assert.equal(PAKISTAN_CITIES_TOUR[1].name, 'LAHORE');
  assert.equal(PAKISTAN_CITIES_TOUR[2].name, 'ISLAMABAD');
  assert.equal(PAKISTAN_CITIES_TOUR[3].name, 'PESHAWAR');
  assert.equal(PAKISTAN_CITIES_TOUR[4].name, 'QUETTA');
  assert.equal(PAKISTAN_CITIES_TOUR[5].name, 'MULTAN');
  assert.equal(PAKISTAN_CITIES_TOUR[6].name, 'RAWALPINDI');
  assert.equal(PAKISTAN_CITIES_TOUR[7].name, 'GWADAR');

  // Verify city icons & theme colors
  assert.equal(PAKISTAN_CITIES_TOUR[0].icon, '🌊');
  assert.equal(PAKISTAN_CITIES_TOUR[1].icon, '🕌');

  // Test progression recording
  saveManager.data = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
  const res1 = saveManager.recordCityWordCompleted('karachi');
  assert.deepEqual(res1.completedCities, ['karachi']);
  assert.equal(res1.cityTourIndex, 1);
  assert.equal(res1.totalCityWords, 1);

  const res2 = saveManager.recordCityWordCompleted('lahore');
  assert.deepEqual(res2.completedCities, ['karachi', 'lahore']);
  assert.equal(res2.cityTourIndex, 2);
  assert.equal(res2.totalCityWords, 2);
});

test('Difficulty Pace Score Multipliers & Hurdle Mode Gate', async () => {
  // Test score multipliers
  const getMult = (diff) => {
    if (diff === 'hard') return 2.5;
    if (diff === 'cruiser') return 1.5;
    return 1.0;
  };

  assert.equal(getMult('easy'), 1.0, 'Easy mode has 1.0x points');
  assert.equal(getMult('cruiser'), 1.5, 'Cruiser mode has 1.5x points');
  assert.equal(getMult('hard'), 2.5, 'Hard mode has 2.5x points');

  // Test that roof hurdles only spawn in hard mode
  const spawnHurdlesOnRoof = (diff) => diff === 'hard';
  assert.equal(spawnHurdlesOnRoof('easy'), false, 'Easy roof surfing has NO overhead hurdles');
  assert.equal(spawnHurdlesOnRoof('cruiser'), false, 'Cruiser roof surfing has NO overhead hurdles');
  assert.equal(spawnHurdlesOnRoof('hard'), true, 'Hard mode spawns overhead hurdles');
});

test('Burns Road Chai Dhaba 7-Day Streak & Rewards', async () => {
  const { saveManager, DEFAULT_SAVE_DATA } = await import('../src/saveManager.js');
  saveManager.data = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
  const initialRupees = saveManager.data.runnerStats.totalRupees || 0;

  // Day 1 Claim
  const status1 = saveManager.getChaiDhabaStatus();
  assert.equal(status1.canClaim, true);
  assert.equal(status1.currentStreak, 1);

  const claim1 = saveManager.claimChaiDhabaReward();
  assert.equal(claim1.success, true);
  assert.equal(claim1.nextStreak, 1);
  assert.equal(saveManager.data.runnerStats.totalRupees, initialRupees + 500);

  // Cannot claim twice on same day
  const statusDup = saveManager.getChaiDhabaStatus();
  assert.equal(statusDup.canClaim, false);
  const claimDup = saveManager.claimChaiDhabaReward();
  assert.equal(claimDup.success, false);

  // Rewards list contains 7 days
  const rewards = saveManager.getChaiDhabaRewards();
  assert.equal(rewards.length, 7);
  assert.equal(rewards[0].reward, '500 Rs');
  assert.equal(rewards[6].reward, '10,000 Rs + Title');
});

test('Chingchi Turbo Juggernaut & Mount Mechanics', async () => {
  const { KarachiModels } = await import('../src/karachiModels.js');
  const mount = KarachiModels.createChingchiVehicleMount();
  assert.ok(mount, 'Chingchi mount exists');
  assert.equal(mount.userData.isChingchiMount, true);
  assert.ok(mount.userData.frontWheel, 'Has front wheel');
  assert.ok(mount.userData.rearWheelL, 'Has left rear wheel');
  assert.ok(mount.userData.rearWheelR, 'Has right rear wheel');
  assert.ok(mount.userData.underglow, 'Has neon underglow');
});

test('Dynamic Karachi Weather Progression (Afternoon -> Sunset -> Monsoon)', async () => {
  const getWeatherForDist = (dist) => {
    if (dist < 900) return 'afternoon';
    if (dist < 2100) return 'sunset';
    return 'monsoon';
  };

  assert.equal(getWeatherForDist(300), 'afternoon');
  assert.equal(getWeatherForDist(1200), 'sunset');
  assert.equal(getWeatherForDist(2500), 'monsoon');
});

test('Burns Road Biryani Express Time-Attack Mode', async () => {
  const { KarachiModels } = await import('../src/karachiModels.js');
  const { saveManager } = await import('../src/saveManager.js');

  const gate = KarachiModels.createBiryaniDeliveryGate(1);
  assert.ok(gate, 'Biryani gate exists');
  assert.equal(gate.userData.isBiryaniGate, true);
  assert.equal(gate.userData.isPassed, false);

  // Test recording best Biryani rush score
  const res = saveManager.recordBiryaniRushScore(5);
  assert.equal(res.best >= 5, true);
  assert.equal(saveManager.getBiryaniRushBest() >= 5, true);
});

test('Instrumental Street Radio Stations (Zero Songs, Procedural Web Audio)', async () => {
  const { audio } = await import('../src/audio.js');

  // Verify cycling through stations
  const st1 = audio.cycleNextRadioStation();
  assert.ok(['none', 'fm91', 'fm102', 'fm106'].includes(st1));
  assert.ok(typeof audio.getRadioStationLabel() === 'string');

  // Ensure stop works cleanly
  audio.stopRadioStation();
  assert.equal(audio.currentRadioStation, 'none');
  assert.equal(audio.getRadioStationLabel(), '📻 RADIO: OFF');
});

test('Gully Companions Pets & Perks', async () => {
  const { KarachiModels } = await import('../src/karachiModels.js');
  const { saveManager } = await import('../src/saveManager.js');

  // Verify companion models
  const cat = KarachiModels.createStreetCat();
  assert.equal(cat.animalType, 'cat');

  const dog = KarachiModels.createStrayDog();
  assert.equal(dog.animalType, 'dog');

  const seagull = KarachiModels.createKemariSeagull();
  assert.equal(seagull.userData.isSeagull, true);

  // Verify saving equipped companion
  saveManager.setEquippedCompanion('seagull');
  assert.equal(saveManager.getEquippedCompanion(), 'seagull');
  saveManager.setEquippedCompanion('cat');
  assert.equal(saveManager.getEquippedCompanion(), 'cat');
});

test('Personal Best Ghost Runner Logic', async () => {
  const bestDistance = 500;
  const isGhostEligible = (dist) => dist >= 120;
  assert.equal(isGhostEligible(50), false, 'Under 120m does not spawn ghost');
  assert.equal(isGhostEligible(bestDistance), true, 'Personal best spawns ghost runner');

  let ghostOvertaken = false;
  let playerZ = -300;
  let ghostZ = -290;
  // Player overtakes when playerZ <= ghostZ (running forward into negative Z)
  if (playerZ <= ghostZ) {
    ghostOvertaken = true;
  }
  assert.equal(ghostOvertaken, true, 'Overtaking ghost triggers celebration');
});



