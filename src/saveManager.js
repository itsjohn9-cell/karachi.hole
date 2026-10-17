const STORAGE_KEY = 'karachi_hero_save_v2';

export const DEFAULT_SAVE_DATA = {
  version: 2,
  player: {
    name: 'Karachi Hero',
    avatarId: 'tariq',
    level: 1,
    careerXP: 0,
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
  districts: {
    1: { status: 'unlocked', cleanliness: 35, infrastructure: 40, trafficFlow: 55, safety: 45, completedMissions: [], highScore: 0, environmentalStates: {} },
    2: { status: 'locked', cleanliness: 25, infrastructure: 35, trafficFlow: 30, safety: 40, completedMissions: [], highScore: 0, environmentalStates: {} },
    3: { status: 'locked', cleanliness: 30, infrastructure: 30, trafficFlow: 45, safety: 35, completedMissions: [], highScore: 0, environmentalStates: {} },
    4: { status: 'locked', cleanliness: 45, infrastructure: 50, trafficFlow: 40, safety: 50, completedMissions: [], highScore: 0, environmentalStates: {} },
    5: { status: 'locked', cleanliness: 20, infrastructure: 25, trafficFlow: 20, safety: 25, completedMissions: [], highScore: 0, environmentalStates: {} },
    6: { status: 'locked', cleanliness: 25, infrastructure: 30, trafficFlow: 30, safety: 30, completedMissions: [], highScore: 0, environmentalStates: {} }
  },
  badges: ['water_guardian'],
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
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
      return {
        ...DEFAULT_SAVE_DATA,
        ...parsed,
        player: { ...DEFAULT_SAVE_DATA.player, ...(parsed.player || {}) },
        settings: { ...DEFAULT_SAVE_DATA.settings, ...(parsed.settings || {}) },
        districts: { ...DEFAULT_SAVE_DATA.districts, ...(parsed.districts || {}) },
        badges: Array.isArray(parsed.badges) ? parsed.badges : DEFAULT_SAVE_DATA.badges
      };
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    }
  }

  save() {
    try {
      this.data.lastSaved = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      return true;
    } catch (e) {
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

  addPlayerXP(xp = 0) {
    this.data.player.careerXP = (this.data.player.careerXP || 0) + xp;
    const nextLevel = 1 + Math.floor(this.data.player.careerXP / 3500);
    this.data.player.level = Math.max(this.data.player.level || 1, nextLevel);
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
    this.save();
  }
}

export const saveManager = new SaveManager();
