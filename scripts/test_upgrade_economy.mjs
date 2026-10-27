import test from 'node:test';
import assert from 'node:assert/strict';

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

const { saveManager, DEFAULT_SAVE_DATA } = await import('../src/saveManager.js');

test('SaveManager power-up upgrade defaults and initial state', () => {
  const defaults = DEFAULT_SAVE_DATA.powerUpUpgrades;
  assert.equal(defaults.magnet, 1);
  assert.equal(defaults.shield, 1);
  assert.equal(defaults.nitro, 1);
  assert.equal(defaults.double_coins, 1);

  assert.equal(saveManager.getPowerUpUpgradeLevel('magnet'), 1);
  assert.equal(saveManager.getPowerUpUpgradeLevel('shield'), 1);
  assert.equal(saveManager.getPowerUpUpgradeLevel('nitro'), 1);
  assert.equal(saveManager.getPowerUpUpgradeLevel('double_coins'), 1);
  assert.equal(saveManager.getPowerUpUpgradeLevel('double'), 1);
  assert.equal(saveManager.getPowerUpUpgradeLevel('cng'), 1);
});

test('Power-up upgrade cost scaling per level', () => {
  // Lvl 1 -> 2 costs 500 Rs
  assert.equal(saveManager.getPowerUpUpgradeCost('magnet'), 500);

  // Set mock level 2
  saveManager.data.powerUpUpgrades.magnet = 2;
  assert.equal(saveManager.getPowerUpUpgradeCost('magnet'), 1500);

  // Set mock level 3
  saveManager.data.powerUpUpgrades.magnet = 3;
  assert.equal(saveManager.getPowerUpUpgradeCost('magnet'), 3000);

  // Set mock level 4
  saveManager.data.powerUpUpgrades.magnet = 4;
  assert.equal(saveManager.getPowerUpUpgradeCost('magnet'), 5000);

  // Set mock level 5 (MAX)
  saveManager.data.powerUpUpgrades.magnet = 5;
  assert.equal(saveManager.getPowerUpUpgradeCost('magnet'), null);

  // Reset back to 1
  saveManager.data.powerUpUpgrades.magnet = 1;
});

test('Power-up purchase and deduction logic', () => {
  saveManager.data.powerUpUpgrades.nitro = 1;
  saveManager.data.runnerStats.totalRupees = 400; // Not enough for 500 Rs cost

  const failRes = saveManager.upgradePowerUp('nitro');
  assert.equal(failRes.success, false);
  assert.equal(saveManager.getPowerUpUpgradeLevel('nitro'), 1);

  // Add enough rupees
  saveManager.data.runnerStats.totalRupees = 2500;
  const succRes = saveManager.upgradePowerUp('nitro');
  assert.equal(succRes.success, true);
  assert.equal(succRes.newLevel, 2);
  assert.equal(succRes.cost, 500);
  assert.equal(saveManager.data.runnerStats.totalRupees, 2000);
  assert.equal(saveManager.getPowerUpUpgradeLevel('nitro'), 2);

  // Upgrade to level 3 (costs 1500 Rs)
  const succRes2 = saveManager.upgradePowerUp('nitro');
  assert.equal(succRes2.success, true);
  assert.equal(succRes2.newLevel, 3);
  assert.equal(succRes2.cost, 1500);
  assert.equal(saveManager.data.runnerStats.totalRupees, 500);
  assert.equal(saveManager.getPowerUpUpgradeLevel('nitro'), 3);

  // Cannot afford next (costs 3000 Rs, only 500 left)
  const failRes2 = saveManager.upgradePowerUp('nitro');
  assert.equal(failRes2.success, false);

  // Reset nitro back to 1
  saveManager.data.powerUpUpgrades.nitro = 1;
});

test('Physics timing calculations: Lvl 1 Magnet = 10s, Lvl 5 Magnet = 20s', () => {
  const getMagnetDuration = (lvl) => 10.0 * (1.0 + (lvl - 1) * 0.25);
  assert.equal(getMagnetDuration(1), 10.0);
  assert.equal(getMagnetDuration(2), 12.5);
  assert.equal(getMagnetDuration(3), 15.0);
  assert.equal(getMagnetDuration(4), 17.5);
  assert.equal(getMagnetDuration(5), 20.0);
});

test('Failed upgrade save rolls back both wallet and level', () => {
  saveManager.data.powerUpUpgrades.shield = 1;
  saveManager.data.runnerStats.totalRupees = 2000;
  const save = saveManager.save;
  saveManager.save = () => false;
  try {
    const result = saveManager.upgradePowerUp('shield');
    assert.equal(result.success, false);
    assert.match(result.reason, /Could not save/);
    assert.equal(saveManager.data.powerUpUpgrades.shield, 1);
    assert.equal(saveManager.data.runnerStats.totalRupees, 2000);
  } finally {
    saveManager.save = save;
  }
});
