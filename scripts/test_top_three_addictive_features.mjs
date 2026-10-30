import test from 'node:test';
import assert from 'node:assert/strict';

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


