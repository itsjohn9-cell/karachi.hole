const STORAGE_KEY = 'karachi_hero_save_v2';
export const MAX_REVIVE_TOKENS = 3;

const memStore = new Map();
const safeStore = {
  getItem(k) {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(k);
    } catch (_) {}
    return memStore.get(k) || null;
  },
  setItem(k, v) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(k, v);
      return;
    }
    memStore.set(k, String(v));
  },
  removeItem(k) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(k);
        return;
      }
    } catch (_) {}
    memStore.delete(k);
  }
};

export const DEFAULT_SAVE_DATA = {
  version: 2,
  player: {
    name: 'Karachi Hero',
    avatarId: 'tariq',
    level: 1,
    careerXP: 0,
    reviveTokens: 0,
    totalEvilsCleansed: 0,
    totalCitizensHelped: 0,
    heroTitle: 'Street Vigilante',
    unlockedTitles: ['Street Vigilante']
  },
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    hapticsEnabled: true,
    graphicsQuality: 'high',
    cameraSensitivity: 1.0,
    ageTier: 'kids'
  },
  currentCity: 'karachi',
  currentDistrictLevel: 1,
  highestDistrictUnlocked: 1,
  masterUnlockAllContent: false,
  districts: {
    1: { status: 'unlocked', cleanliness: 35, infrastructure: 40, trafficFlow: 55, safety: 45, completedMissions: [], highScore: 0, environmentalStates: {} },
    2: { status: 'locked', cleanliness: 25, infrastructure: 35, trafficFlow: 30, safety: 40, completedMissions: [], highScore: 0, environmentalStates: {} },
    3: { status: 'locked', cleanliness: 30, infrastructure: 30, trafficFlow: 45, safety: 35, completedMissions: [], highScore: 0, environmentalStates: {} },
    4: { status: 'locked', cleanliness: 45, infrastructure: 50, trafficFlow: 40, safety: 50, completedMissions: [], highScore: 0, environmentalStates: {} },
    5: { status: 'locked', cleanliness: 20, infrastructure: 25, trafficFlow: 20, safety: 25, completedMissions: [], highScore: 0, environmentalStates: {} },
    6: { status: 'locked', cleanliness: 25, infrastructure: 30, trafficFlow: 30, safety: 30, completedMissions: [], highScore: 0, environmentalStates: {} }
  },
  badges: ['water_guardian'],
  runnerStats: {
    bestDistance: 0,
    bestScore: 0,
    totalRupees: 0,
    completedRuns: 0,
    cityTourIndex: 0,
    completedCities: [],
    totalCityWords: 0,
    dailyStreak: 0,
    lastDailyClaimDate: ''
  },
  powerUpUpgrades: {
    magnet: 1,
    shield: 1,
    nitro: 1,
    double_coins: 1,
    jump: 1,
    horn: 1,
    cricket_bat: 1,
    hoverboard: 1
  },
  citizenConversations: {}
};

class SaveManager {
  constructor() {
    this.data = this.load();
  }

  get() {
    return this.data;
  }

  load() {
    try {
      const raw = safeStore.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        console.error('[SAVE] Stored career data is invalid; starting with default progress.');
        return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
      }
      const data = {
        ...DEFAULT_SAVE_DATA,
        ...parsed,
        player: { ...DEFAULT_SAVE_DATA.player, ...(parsed.player || {}) },
        settings: { ...DEFAULT_SAVE_DATA.settings, ...(parsed.settings || {}) },
        districts: { ...DEFAULT_SAVE_DATA.districts, ...(parsed.districts || {}) },
        runnerStats: { ...DEFAULT_SAVE_DATA.runnerStats, ...(parsed.runnerStats || {}) },
        powerUpUpgrades: { ...DEFAULT_SAVE_DATA.powerUpUpgrades, ...(parsed.powerUpUpgrades || {}) },
        badges: Array.isArray(parsed.badges) ? parsed.badges : DEFAULT_SAVE_DATA.badges
      };
      const reviveTokens = Number(data.player.reviveTokens);
      data.player.reviveTokens = Number.isSafeInteger(reviveTokens)
        ? Math.min(MAX_REVIVE_TOKENS, Math.max(0, reviveTokens))
        : 0;
      const numericRunnerKeys = ['bestDistance', 'bestScore', 'totalRupees', 'completedRuns', 'cityTourIndex', 'totalCityWords', 'dailyStreak'];
      numericRunnerKeys.forEach(key => {
        const value = Number(data.runnerStats[key]);
        data.runnerStats[key] = Number.isSafeInteger(value) ? Math.max(0, value) : 0;
      });
      data.runnerStats.completedCities = Array.isArray(data.runnerStats.completedCities) ? data.runnerStats.completedCities : [];
      if (data.powerUpUpgrades) {
        ['magnet', 'shield', 'nitro', 'double_coins', 'jump', 'horn', 'cricket_bat', 'hoverboard'].forEach(key => {
          const lvl = Number(data.powerUpUpgrades[key]);
          data.powerUpUpgrades[key] = Number.isSafeInteger(lvl) ? Math.max(1, Math.min(5, lvl)) : 1;
        });
      }
      return data;
    } catch (error) {
      console.error('[SAVE] Could not load career data; starting with default progress.', error);
      return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    }
  }

  save() {
    try {
      this.data.lastSaved = new Date().toISOString();
      safeStore.setItem(STORAGE_KEY, JSON.stringify(this.data));
      return true;
    } catch (error) {
      console.error('[SAVE] Could not persist career data.', error);
      return false;
    }
  }

  hasExistingProgress() {
    return Boolean(
      this.data &&
      (this.data.player.careerXP > 0 ||
       this.data.player.level > 1 ||
       this.data.highestDistrictUnlocked > 1 ||
       this.data.districts[1]?.completedMissions?.length > 0)
    );
  }

  updatePlayerName(name) {
    if (!name || typeof name !== 'string') return false;
    const sanitized = name.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().slice(0, 16);
    if (sanitized.length < 3) return false;
    this.data.player.name = sanitized;
    this.save();
    return sanitized;
  }

  getGamerName() {
    return this.data.player?.name || 'Karachi Hero';
  }

  getCareerLevel() {
    const player = this.data.player || {};
    const levelFromXP = 1 + Math.floor((player.careerXP || 0) / 3500);
    return Math.max(1, player.level || 1, levelFromXP);
  }

  getReviveTokenCount() {
    return this.data.player.reviveTokens;
  }

  addReviveToken() {
    const currentCount = this.getReviveTokenCount();
    if (currentCount >= MAX_REVIVE_TOKENS) return false;

    this.data.player.reviveTokens = currentCount + 1;
    if (this.save()) return true;
    this.data.player.reviveTokens = currentCount;
    return false;
  }

  consumeReviveToken() {
    const currentCount = this.getReviveTokenCount();
    if (currentCount < 1) return false;

    this.data.player.reviveTokens = currentCount - 1;
    if (this.save()) return true;
    this.data.player.reviveTokens = currentCount;
    return false;
  }

  recordRunnerRun(distance, score, rupeesCollected) {
    const distanceValue = Number.isFinite(distance) ? Math.max(0, Math.floor(distance)) : 0;
    const scoreValue = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
    const rupeesValue = Number.isFinite(rupeesCollected) ? Math.max(0, Math.floor(rupeesCollected)) : 0;
    const previousStats = { ...this.data.runnerStats };
    this.data.runnerStats = {
      ...previousStats,
      bestDistance: Math.max(previousStats.bestDistance || 0, distanceValue),
      bestScore: Math.max(previousStats.bestScore || 0, scoreValue),
      totalRupees: (previousStats.totalRupees || 0) + rupeesValue,
      completedRuns: (previousStats.completedRuns || 0) + 1
    };
    if (this.save()) return true;
    this.data.runnerStats = previousStats;
    return false;
  }

  getCityTourIndex() {
    return Math.max(0, Number(this.data?.runnerStats?.cityTourIndex) || 0);
  }

  getCompletedCities() {
    return Array.isArray(this.data?.runnerStats?.completedCities) ? [...this.data.runnerStats.completedCities] : [];
  }

  getTotalCityWords() {
    return Math.max(0, Number(this.data?.runnerStats?.totalCityWords) || 0);
  }

  // --- 7-Day Burns Road Chai Dhaba Daily Login Streak ---
  getChaiDhabaRewards() {
    return [
      { day: 1, name: 'Doodh Patti Chai', reward: '500 Rs', icon: '☕', amount: 500, type: 'rupees' },
      { day: 2, name: 'Paratha & Headstart', reward: '1,000 Rs + 1 Rocket', icon: '🚀', amount: 1000, type: 'headstart' },
      { day: 3, name: 'Sindhi Sandooq Trunk', reward: '1,500 Rs Bonus', icon: '🧰', amount: 1500, type: 'trunk' },
      { day: 4, name: 'Burns Road Bun Kabab', reward: '2,500 Rs', icon: '🍔', amount: 2500, type: 'rupees' },
      { day: 5, name: 'Edhi Rescue Pack', reward: '2 Revive Tokens', icon: '💖', amount: 2, type: 'tokens' },
      { day: 6, name: 'Karachi Biryani Daig', reward: '5,000 Rs Feast', icon: '🍛', amount: 5000, type: 'rupees' },
      { day: 7, name: 'Shahi Qahwa Mega Pot', reward: '10,000 Rs + Title', icon: '👑', amount: 10000, type: 'jackpot' }
    ];
  }

  getChaiDhabaStatus() {
    const today = new Date().toISOString().slice(0, 10);
    const lastClaim = this.data?.runnerStats?.lastDailyClaimDate || '';
    const currentStreak = Number(this.data?.runnerStats?.dailyStreak) || 0;
    const canClaim = lastClaim !== today;
    return {
      today,
      lastClaim,
      currentStreak: Math.max(1, Math.min(7, currentStreak === 0 ? 1 : currentStreak)),
      claimedToday: !canClaim,
      canClaim
    };
  }

  claimChaiDhabaReward() {
    const status = this.getChaiDhabaStatus();
    if (!status.canClaim) {
      return { success: false, reason: 'Already claimed today! Next cup tomorrow at midnight.' };
    }
    const today = status.today;
    let nextStreak = (Number(this.data.runnerStats.dailyStreak) || 0) + 1;
    if (nextStreak > 7) nextStreak = 1;

    const reward = this.getChaiDhabaRewards()[nextStreak - 1];
    if (reward.type === 'rupees' || reward.type === 'jackpot') {
      this.data.runnerStats.totalRupees = (this.data.runnerStats.totalRupees || 0) + reward.amount;
      if (reward.type === 'jackpot') this.unlockBadge?.('chai_connoisseur');
    } else if (reward.type === 'headstart') {
      this.data.runnerStats.totalRupees = (this.data.runnerStats.totalRupees || 0) + reward.amount;
      this.data.hasHeadstart = (this.data.hasHeadstart || 0) + 1;
    } else if (reward.type === 'tokens') {
      this.data.player.reviveTokens = Math.min(MAX_REVIVE_TOKENS, (Number(this.data.player.reviveTokens) || 0) + reward.amount);
    } else if (reward.type === 'trunk') {
      this.data.runnerStats.totalRupees = (this.data.runnerStats.totalRupees || 0) + reward.amount;
    }

    this.data.runnerStats.dailyStreak = nextStreak;
    this.data.runnerStats.lastDailyClaimDate = today;
    this.save();

    return {
      success: true,
      day: nextStreak,
      nextStreak,
      reward,
      message: `☕ Day ${nextStreak} Claimed: ${reward.name} (${reward.reward})!`
    };
  }

  recordCityWordCompleted(cityId) {
    if (!this.data.runnerStats) this.data.runnerStats = { ...DEFAULT_SAVE_DATA.runnerStats };
    const currentCompleted = Array.isArray(this.data.runnerStats.completedCities) ? this.data.runnerStats.completedCities : [];
    const normId = String(cityId || '').toLowerCase();
    if (normId && !currentCompleted.includes(normId)) {
      currentCompleted.push(normId);
    }
    this.data.runnerStats.completedCities = currentCompleted;
    this.data.runnerStats.totalCityWords = (Number(this.data.runnerStats.totalCityWords) || 0) + 1;
    this.data.runnerStats.cityTourIndex = (Number(this.data.runnerStats.cityTourIndex) || 0) + 1;
    this.save();
    return {
      completedCities: [...currentCompleted],
      totalCityWords: this.data.runnerStats.totalCityWords,
      cityTourIndex: this.data.runnerStats.cityTourIndex
    };
  }

  _normalizePowerUpKey(type) {
    const t = String(type || '').toLowerCase();
    if (t.includes('magnet') || t.includes('biryani')) return 'magnet';
    if (t.includes('shield') || t.includes('tanker')) return 'shield';
    if (t.includes('nitro') || t.includes('turbo') || t.includes('cng')) return 'nitro';
    if (t.includes('coin') || t.includes('double')) return 'double_coins';
    return t;
  }

  getPowerUpUpgradeLevel(type) {
    const key = this._normalizePowerUpKey(type);
    const upgrades = this.data.powerUpUpgrades || DEFAULT_SAVE_DATA.powerUpUpgrades;
    const lvl = Number(upgrades[key]);
    return Number.isSafeInteger(lvl) ? Math.max(1, Math.min(5, lvl)) : 1;
  }

  getPowerUpUpgradeCost(type) {
    const lvl = this.getPowerUpUpgradeLevel(type);
    if (lvl >= 5) return null; // Already at MAX level (5)
    // Level scaling: Lvl 1->2 = 500 Rs, Lvl 2->3 = 1500 Rs, Lvl 3->4 = 3000 Rs, Lvl 4->5 = 5000 Rs
    const costs = { 1: 500, 2: 1500, 3: 3000, 4: 5000 };
    return costs[lvl] || 5000;
  }

  getAllPowerUpUpgrades() {
    return {
      magnet: this.getPowerUpUpgradeLevel('magnet'),
      shield: this.getPowerUpUpgradeLevel('shield'),
      nitro: this.getPowerUpUpgradeLevel('nitro'),
      double_coins: this.getPowerUpUpgradeLevel('double_coins'),
      jump: this.getPowerUpUpgradeLevel('jump'),
      horn: this.getPowerUpUpgradeLevel('horn'),
      cricket_bat: this.getPowerUpUpgradeLevel('cricket_bat'),
      hoverboard: this.getPowerUpUpgradeLevel('hoverboard')
    };
  }

  buyConsumable(itemKey) {
    const prices = {
      mystery_crate: 300,
      revive_token: 500,
      headstart: 800
    };
    const cost = prices[itemKey];
    if (!cost) return { success: false, reason: 'Invalid item.' };

    const walletRupees = this.data.runnerStats?.totalRupees || 0;
    if (walletRupees < cost) {
      return {
        success: false,
        reason: `Insufficient Rupees! Need ${cost.toLocaleString()} Rs (Have ${walletRupees.toLocaleString()} Rs).`
      };
    }

    if (itemKey === 'revive_token') {
      const current = Number(this.data.player?.reviveTokens) || 0;
      if (current >= MAX_REVIVE_TOKENS) {
        return { success: false, reason: `Maximum revive tokens reached (${MAX_REVIVE_TOKENS})!` };
      }
      this.data.player.reviveTokens = current + 1;
    } else if (itemKey === 'mystery_crate') {
      const roll = Math.random();
      if (roll < 0.50) {
        let bonusCoins = 400 + Math.floor(Math.random() * 5) * 100;
        let isJackpot = false;
        if (Math.random() < 0.12) {
          bonusCoins = 2500;
        } else if (Math.random() < 0.05) {
          bonusCoins = 5000;
          isJackpot = true;
        }
        this.data.runnerStats.totalRupees = walletRupees - cost + bonusCoins;
        this.save();
        return {
          success: true,
          itemKey,
          rewardType: 'coins',
          amount: bonusCoins,
          isJackpot,
          message: isJackpot ? '🎰 MEGA JACKPOT! 5,000 Bonus Rupees!' : `🎁 Won ${bonusCoins.toLocaleString()} Bonus Rupees!`
        };
      } else if (roll < 0.75) {
        const current = Number(this.data.player?.reviveTokens) || 0;
        if (current < MAX_REVIVE_TOKENS) {
          this.data.player.reviveTokens = current + 1;
          this.data.runnerStats.totalRupees = walletRupees - cost;
          this.save();
          return { success: true, itemKey, rewardType: 'token', amount: 1, message: '💖 Won 1 Edhi Rescue Revive Token!' };
        } else {
          const bonusCoins = 1000;
          this.data.runnerStats.totalRupees = walletRupees - cost + bonusCoins;
          this.save();
          return { success: true, itemKey, rewardType: 'coins', amount: bonusCoins, message: `🎁 Max Tokens! Won ${bonusCoins.toLocaleString()} Bonus Rupees!` };
        }
      } else if (roll < 0.90) {
        this.data.runnerStats.totalRupees = walletRupees - cost;
        this.save();
        return { success: true, itemKey, rewardType: 'fever', message: '⚡ Won Instant JUNOON Adrenaline Charge!' };
      } else {
        this.data.runnerStats.totalRupees = walletRupees - cost;
        this.unlockBadge?.('sandooq_sultan');
        this.save();
        return { success: true, itemKey, rewardType: 'badge', message: '🏅 Unlocked Rare "Sandooq Sultan" Title!' };
      }
    } else if (itemKey === 'headstart') {
      this.data.hasHeadstart = (this.data.hasHeadstart || 0) + 1;
    }

    this.data.runnerStats.totalRupees = walletRupees - cost;
    if (!this.save()) {
      this.data.runnerStats.totalRupees = walletRupees;
      return { success: false, reason: 'Could not save purchase.' };
    }
    return { success: true, itemKey, cost };
  }

  upgradePowerUp(type) {
    const key = this._normalizePowerUpKey(type);
    if (!Object.hasOwn(DEFAULT_SAVE_DATA.powerUpUpgrades, key)) {
      console.error('[SHOP] Unknown power-up upgrade:', type);
      return { success: false, reason: 'Unknown power-up upgrade.' };
    }
    const currentLevel = this.getPowerUpUpgradeLevel(key);
    if (currentLevel >= 5) {
      return { success: false, reason: 'Ability is already at MAX Level 5!' };
    }

    const cost = this.getPowerUpUpgradeCost(key);
    const walletRupees = this.data.runnerStats?.totalRupees || 0;

    if (walletRupees < cost) {
      return {
        success: false,
        reason: `Insufficient Rupees! Need ${cost.toLocaleString()} Rs (Have ${walletRupees.toLocaleString()} Rs).`
      };
    }

    if (!this.data.powerUpUpgrades) {
      this.data.powerUpUpgrades = { ...DEFAULT_SAVE_DATA.powerUpUpgrades };
    }
    this.data.powerUpUpgrades[key] = currentLevel + 1;
    this.data.runnerStats.totalRupees = walletRupees - cost;
    if (!this.save()) {
      this.data.powerUpUpgrades[key] = currentLevel;
      this.data.runnerStats.totalRupees = walletRupees;
      return { success: false, reason: 'Could not save your upgrade. Check device storage and try again.' };
    }
    return {
      success: true,
      key,
      newLevel: currentLevel + 1,
      cost
    };
  }

  isDistrictUnlocked(districtLevel) {
    const level = Number(districtLevel);
    if (!Number.isInteger(level) || level < 1 || level > 10) return false;
    if (level === 1 || this.data.masterUnlockAllContent) return true;

    const district = this.data.districts[level];
    if (district?.status === 'unlocked' || district?.status === 'cleared' ||
        (this.data.highestDistrictUnlocked || 1) >= level) {
      return true;
    }

    const previousDistrictCleared = this.data.districts[level - 1]?.status === 'cleared';
    const careerLevel = this.getCareerLevel();
    const badges = this.data.badges || [];
    const earnedBadgeCount = new Set(badges).size;
    const achievementUnlocked = level === 2
      ? badges.includes('road_safety') || badges.includes('clean_green')
      : level === 3
        ? badges.includes('lifesaver') || earnedBadgeCount >= 4
        : earnedBadgeCount >= level + 1;

    return previousDistrictCleared || careerLevel >= level || achievementUnlocked;
  }

  isAvatarUnlocked(avatarId) {
    if (['tariq', 'biryani_rider', 'captain_karachi', 'chai_wala'].includes(avatarId) || this.data.masterUnlockAllContent) {
      return true;
    }

    const careerLevel = this.getCareerLevel();
    const badges = this.data.badges || [];
    const requirements = {
      ayesha: { level: 2, badge: 'clean_green' },
      farooq: { level: 3, badge: 'road_safety' },
      bilal: { level: 2, badge: 'lifesaver' },
      zain: { level: 4, badge: 'green_planter' }
    }[avatarId];

    return Boolean(requirements &&
      (careerLevel >= requirements.level || badges.includes(requirements.badge)));
  }

  unlockAllContentForMasterMode() {
    this.data.masterUnlockAllContent = true;
    return this.save();
  }

  addPlayerXP(xp = 0) {
    const validXP = Number(xp) || 0;
    this.data.player.careerXP = (Number(this.data.player.careerXP) || 0) + validXP;
    const nextLevel = 1 + Math.floor(this.data.player.careerXP / 3500);
    this.data.player.level = Math.max(Number(this.data.player.level) || 1, nextLevel);
    this.save();
  }

  unlockDistrict(districtLevel) {
    if (!this.data.districts[districtLevel]) {
      this.data.districts[districtLevel] = {
        status: 'unlocked', cleanliness: 30, infrastructure: 30, trafficFlow: 35, safety: 35, completedMissions: [], highScore: 0, environmentalStates: {}
      };
    }
    this.data.districts[districtLevel].status = 'unlocked';
    this.data.highestDistrictUnlocked = Math.max(this.data.highestDistrictUnlocked || 1, districtLevel);
    this.data.currentDistrictLevel = districtLevel;
    this.save();
  }

  updateDistrictGauges(districtLevel, deltas = {}) {
    if (!this.data.districts[districtLevel]) this.unlockDistrict(districtLevel);
    const d = this.data.districts[districtLevel];
    if (deltas.cleanliness) d.cleanliness = Math.min(100, (d.cleanliness || 35) + deltas.cleanliness);
    if (deltas.infrastructure) d.infrastructure = Math.min(100, (d.infrastructure || 40) + deltas.infrastructure);
    if (deltas.trafficFlow) d.trafficFlow = Math.min(100, (d.trafficFlow || 55) + deltas.trafficFlow);
    if (deltas.safety) d.safety = Math.min(100, (d.safety || 45) + deltas.safety);
    this.save();
  }

  recordMissionCompleted(districtLevel, missionId, envState = {}, xpEarned = 1000) {
    if (!this.data.districts[districtLevel]) this.unlockDistrict(districtLevel);
    const d = this.data.districts[districtLevel];
    if (!d.completedMissions.includes(missionId)) {
      d.completedMissions.push(missionId);
    }
    if (envState && typeof envState === 'object') {
      d.environmentalStates = { ...(d.environmentalStates || {}), ...envState };
    }
    this.data.player.totalEvilsCleansed = (this.data.player.totalEvilsCleansed || 0) + 1;
    this.addPlayerXP(xpEarned);
  }

  recordCitizenConversation(citizenId, choiceId) {
    this.data.citizenConversations[citizenId] = choiceId || true;
    this.data.player.totalCitizensHelped = (this.data.player.totalCitizensHelped || 0) + 1;
    this.save();
  }

  recordCitizenTalk(citizenId) {
    this.recordCitizenConversation(citizenId, 'talked');
  }

  recordDistrictCleared(districtLevel, score = 0, heroTitle = '') {
    if (!this.data.districts[districtLevel]) this.unlockDistrict(districtLevel);
    const d = this.data.districts[districtLevel];
    d.status = 'cleared';
    d.highScore = Math.max(d.highScore || 0, score);
    d.cleanliness = 100;
    d.infrastructure = 100;
    d.trafficFlow = 100;
    d.safety = 100;
    if (districtLevel + 1 <= 10) {
      this.unlockDistrict(districtLevel + 1);
    }
    if (heroTitle && !this.data.player.unlockedTitles.includes(heroTitle)) {
      this.data.player.unlockedTitles.push(heroTitle);
      this.data.player.heroTitle = heroTitle;
    }
    this.save();
  }

  unlockBadge(badgeId) {
    if (!this.data.badges.includes(badgeId)) {
      this.data.badges.push(badgeId);
      this.save();
      return true;
    }
    return false;
  }

  resetProgress() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    return this.save();
  }
}

export const saveManager = new SaveManager();
