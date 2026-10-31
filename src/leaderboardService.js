/**
 * Karachi Runner - Global Scoring Charts & Daily Challenges Service
 * Supports multi-timeframe leaderboards (Day, Week, Month, Year, All-Time),
 * Gamer Name management, Daily Challenges with rankings, and optional
 * zero-cost Firebase Realtime Database / Firestore REST cloud synchronization
 * with resilient offline fallback & realistic competitive rival simulation.
 */

import { saveManager } from './saveManager.js';

const LEADERBOARD_STORAGE_KEY = 'karachi_runner_leaderboards_v1';
const DAILY_CHALLENGES_KEY = 'karachi_runner_daily_challenges_v1';
const GAMER_PROFILE_KEY = 'karachi_runner_gamer_tag_v1';
const CLOUD_CONFIG_KEY = 'karachi_runner_cloud_url_v1';

const memStore = new Map();
const safeStore = {
  getItem(k) {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(k);
    } catch (_) {}
    return memStore.get(k) || null;
  },
  setItem(k, v) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(k, v);
        return;
      }
    } catch (_) {}
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

// Authentic Karachi runner rival handles and base scores for rich competitive feel
const RIVAL_POOL = [
  { name: 'TariqRoad_Racer', district: 'Saddar', pace: 'standard', baseMultiplier: 0.95 },
  { name: 'BurnsRoad_Foodie', district: 'Soldier Bazar', pace: 'cruiser', baseMultiplier: 0.90 },
  { name: 'Lyari_Speedster', district: 'Lyari', pace: 'hard', baseMultiplier: 0.98 },
  { name: 'Kharadar_King', district: 'Soldier Bazar', pace: 'standard', baseMultiplier: 0.85 },
  { name: 'Gulshan_Glider', district: 'Saddar', pace: 'cruiser', baseMultiplier: 0.82 },
  { name: 'Clifton_Cruiser', district: 'Saddar', pace: 'cruiser', baseMultiplier: 0.78 },
  { name: 'Nazimabad_Ninja', district: 'Soldier Bazar', pace: 'hard', baseMultiplier: 0.92 },
  { name: 'Malir_Mach', district: 'Lyari', pace: 'standard', baseMultiplier: 0.75 },
  { name: 'Defence_Dasher', district: 'Saddar', pace: 'standard', baseMultiplier: 0.88 },
  { name: 'ChaiWala_Express', district: 'Soldier Bazar', pace: 'cruiser', baseMultiplier: 0.80 },
  { name: 'W11_SurferUstaad', district: 'Lyari', pace: 'hard', baseMultiplier: 0.96 },
  { name: 'Empress_Runner', district: 'Saddar', pace: 'standard', baseMultiplier: 0.84 }
];

export class LeaderboardService {
  constructor(saveManager = null) {
    this.saveManager = saveManager;
    this.cloudUrl = this.loadCloudUrl();
    this.gamerName = this.loadGamerName();
    this.cache = this.loadLocalStore();
  }

  // --- Gamer Handle Management ---
  loadGamerName() {
    try {
      const stored = safeStore.getItem(GAMER_PROFILE_KEY);
      if (stored && stored.trim().length >= 3) return stored.trim();
      const saveName = this.saveManager?.get()?.player?.name;
      if (saveName && saveName !== 'Karachi Hero' && saveName.trim().length >= 3) {
        return saveName.trim();
      }
    } catch (_) {}
    return 'Karachi_Hero';
  }

  setGamerName(name) {
    if (!name || typeof name !== 'string') return false;
    const sanitized = name.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().slice(0, 16);
    if (sanitized.length < 3) return false;
    this.gamerName = sanitized;
    try {
      safeStore.setItem(GAMER_PROFILE_KEY, sanitized);
      if (this.saveManager) {
        this.saveManager.updatePlayerName(sanitized);
      }
    } catch (_) {}
    return sanitized;
  }

  getGamerName() {
    return this.gamerName || 'Karachi_Hero';
  }

  // --- Cloud Endpoint Configuration ---
  loadCloudUrl() {
    try {
      return safeStore.getItem(CLOUD_CONFIG_KEY) || (typeof window !== 'undefined' && window.__KR_FIREBASE_URL__) || '';
    } catch (_) {
      return '';
    }
  }

  setCloudUrl(url) {
    const cleanUrl = (url || '').trim().replace(/\/$/, '');
    this.cloudUrl = cleanUrl;
    try {
      if (cleanUrl) {
        safeStore.setItem(CLOUD_CONFIG_KEY, cleanUrl);
      } else {
        safeStore.removeItem(CLOUD_CONFIG_KEY);
      }
    } catch (_) {}
    return this.cloudUrl;
  }

  getCloudStatus() {
    return {
      configured: Boolean(this.cloudUrl),
      url: this.cloudUrl || 'Local High-Availability Storage',
      type: this.cloudUrl.includes('firebaseio.com') ? 'Firebase Realtime DB' : (this.cloudUrl ? 'REST Endpoint' : 'Local Persistent Storage')
    };
  }

  // --- Timeframe Keys ---
  getTimeframeKeys(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    // ISO week number
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
    const w = String(weekNumber).padStart(2, '0');

    return {
      day: `${y}-${m}-${d}`,
      week: `${y}-W${w}`,
      month: `${y}-${m}`,
      year: `${y}`,
      all_time: 'all_time'
    };
  }

  // --- Local Store Management & Seeding ---
  loadLocalStore() {
    try {
      const raw = safeStore.getItem(LEADERBOARD_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (_) {}
    return this.createSeededStore();
  }

  saveLocalStore() {
    try {
      safeStore.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(this.cache));
    } catch (_) {}
  }

  createSeededStore() {
    const keys = this.getTimeframeKeys();
    const store = {
      day: {},
      week: {},
      month: {},
      year: {},
      all_time: []
    };
    return store;
  }

  getSeededRivals(timeframeKey, timeframe) {
    const baseScoreByTimeframe = {
      day: 28000,
      week: 48000,
      month: 72000,
      year: 98000,
      all_time: 125000
    };
    const maxScore = baseScoreByTimeframe[timeframe] || 50000;

    // Use timeframe key string as pseudo-seed
    let hash = 0;
    for (let i = 0; i < timeframeKey.length; i++) {
      hash = (hash << 5) - hash + timeframeKey.charCodeAt(i);
      hash |= 0;
    }
    const rand = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return RIVAL_POOL.map((rival, index) => {
      const variation = 0.85 + (rand(hash + index * 17) * 0.3);
      const score = Math.round(maxScore * rival.baseMultiplier * variation);
      const distance = Math.round(score / 5.5);
      return {
        id: `rival_${rival.name}_${timeframeKey}`,
        gamerName: rival.name,
        score,
        distance,
        district: rival.district,
        pace: rival.pace,
        timestamp: Date.now() - (index * 3600000 * 2),
        isPlayer: false
      };
    });
  }

  // --- Submit Score ---
  async submitRunScore({ score, distance, rupees, district, pace }) {
    if (!score || score <= 0) return null;
    const now = new Date();
    const keys = this.getTimeframeKeys(now);
    const gamerName = this.getGamerName();

    const record = {
      id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      gamerName,
      score: Math.round(score),
      distance: Math.round(distance || 0),
      rupees: Math.round(rupees || 0),
      district: district || 'Soldier Bazar',
      pace: pace || 'cruiser',
      timestamp: now.getTime(),
      dateString: now.toISOString(),
      isPlayer: true
    };

    // Store in all timeframes
    const timeframes = ['day', 'week', 'month', 'year', 'all_time'];
    const playerRanks = {};

    timeframes.forEach(tf => {
      const key = keys[tf];
      if (tf === 'all_time') {
        if (!Array.isArray(this.cache.all_time)) this.cache.all_time = [];
        this.cache.all_time.push(record);
        this.cache.all_time.sort((a, b) => b.score - a.score);
        this.cache.all_time = this.cache.all_time.slice(0, 100);
      } else {
        if (!this.cache[tf]) this.cache[tf] = {};
        if (!Array.isArray(this.cache[tf][key])) this.cache[tf][key] = [];
        this.cache[tf][key].push(record);
        this.cache[tf][key].sort((a, b) => b.score - a.score);
        this.cache[tf][key] = this.cache[tf][key].slice(0, 100);
      }
    });

    this.saveLocalStore();

    // Async cloud push if URL is configured
    if (this.cloudUrl) {
      this.pushToCloud(record, keys).catch(err => {
        console.warn('[Leaderboards] Cloud sync delayed; queued in local cache:', err.message);
      });
    }

    // Return player rank in current day and all-time
    return {
      record,
      rankDay: this.getPlayerRank('day'),
      rankAllTime: this.getPlayerRank('all_time')
    };
  }

  // --- Push to Firebase / Cloud REST ---
  async pushToCloud(record, keys) {
    if (!this.cloudUrl) return;
    try {
      // Firebase Realtime DB REST accepts POST to a resource path
      const url = `${this.cloudUrl}/leaderboards/runs.json`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
        mode: 'cors'
      });
    } catch (e) {
      // Gracefully continue; offline/local store holds the scores
    }
  }

  // --- Get Leaderboard for Timeframe ---
  getLeaderboard(timeframe = 'day') {
    const keys = this.getTimeframeKeys();
    const key = keys[timeframe] || keys.day;

    let entries = [];
    if (timeframe === 'all_time') {
      entries = Array.isArray(this.cache.all_time) ? [...this.cache.all_time] : [];
    } else {
      if (this.cache[timeframe] && Array.isArray(this.cache[timeframe][key])) {
        entries = [...this.cache[timeframe][key]];
      }
    }

    // Ensure rivals are included so leaderboard is always rich and competitive
    const rivals = this.getSeededRivals(key, timeframe);
    const combined = [...entries, ...rivals];

    // Deduplicate / sort by highest score descending
    combined.sort((a, b) => b.score - a.score);

    // Keep highest score per player name
    const seenNames = new Set();
    const deduped = [];
    for (const item of combined) {
      if (!seenNames.has(item.gamerName)) {
        seenNames.add(item.gamerName);
        deduped.push(item);
      }
    }

    // Assign rank 1-N
    return deduped.slice(0, 50).map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
      isCurrentPlayer: entry.gamerName === this.getGamerName()
    }));
  }

  getPlayerRank(timeframe = 'day') {
    const list = this.getLeaderboard(timeframe);
    const playerIndex = list.findIndex(item => item.isCurrentPlayer);
    if (playerIndex >= 0) {
      return {
        rank: playerIndex + 1,
        entry: list[playerIndex],
        total: list.length
      };
    }
    return {
      rank: list.length + 1,
      entry: null,
      total: list.length
    };
  }

  // --- Pakistan Cities Tour Leaderboard ---
  getCitiesTourLeaderboard() {
    const playerCityWords = this.saveManager?.getTotalCityWords?.() ?? 0;
    const playerCompleted = this.saveManager?.getCompletedCities?.() ?? [];
    const playerGamer = this.getGamerName();

    const mockCityTourRivals = [
      { gamerName: 'W11_SurferUstaad', citiesCompleted: 14, currentCity: 'GWADAR', badges: ['🌊', '🕌', '🏛️', '🏔️', '🍎', '🏺', '🚂', '⚓'] },
      { gamerName: 'Nazimabad_Ninja', citiesCompleted: 11, currentCity: 'MULTAN', badges: ['🌊', '🕌', '🏛️', '🏔️', '🍎', '🏺'] },
      { gamerName: 'Saddar_Speedster', citiesCompleted: 9, currentCity: 'QUETTA', badges: ['🌊', '🕌', '🏛️', '🏔️', '🍎'] },
      { gamerName: 'Lyari_Striker', citiesCompleted: 7, currentCity: 'PESHAWAR', badges: ['🌊', '🕌', '🏛️', '🏔️'] },
      { gamerName: 'Tariq_Road_Tornado', citiesCompleted: 5, currentCity: 'ISLAMABAD', badges: ['🌊', '🕌', '🏛️'] },
      { gamerName: 'Defence_Dasher', citiesCompleted: 3, currentCity: 'LAHORE', badges: ['🌊', '🕌'] },
      { gamerName: 'ChaiWala_Express', citiesCompleted: 2, currentCity: 'LAHORE', badges: ['🌊'] }
    ];

    const playerEntry = {
      gamerName: playerGamer,
      citiesCompleted: playerCityWords,
      completedList: playerCompleted,
      isCurrentPlayer: true
    };

    const all = [...mockCityTourRivals.filter(r => r.gamerName !== playerGamer), playerEntry]
      .sort((a, b) => b.citiesCompleted - a.citiesCompleted);

    return all.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
      isCurrentPlayer: entry.gamerName === playerGamer
    }));
  }

  // =========================================================================
  // DAILY CHALLENGES SYSTEM
  // =========================================================================

  getDateSeed(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getDailyChallenges(date = new Date()) {
    const dateKey = this.getDateSeed(date);
    const saved = this.loadDailyChallengesState();

    if (saved.dateKey === dateKey && Array.isArray(saved.challenges) && saved.challenges.length === 3) {
      return saved;
    }

    // Generate deterministic challenges for today
    const challenges = this.generateChallengesForDate(dateKey);
    const newState = {
      dateKey,
      challenges,
      claimed: {},
      allCompletedBonusClaimed: false
    };
    this.saveDailyChallengesState(newState);
    return newState;
  }

  loadDailyChallengesState() {
    try {
      const raw = safeStore.getItem(DAILY_CHALLENGES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (_) {}
    return { dateKey: '', challenges: [], claimed: {}, allCompletedBonusClaimed: false };
  }

  saveDailyChallengesState(state) {
    try {
      safeStore.setItem(DAILY_CHALLENGES_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  generateChallengesForDate(dateKey) {
    // Deterministic hash from dateKey
    let seed = 0;
    for (let i = 0; i < dateKey.length; i++) {
      seed = (seed * 31 + dateKey.charCodeAt(i)) & 0xffffffff;
    }
    const pseudoRandom = (offset) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    const distanceTargets = [1200, 1600, 2000, 2500];
    const coinTargets = [60, 80, 100, 150];
    const surfTargets = [2, 3, 4];
    const hornTargets = [3, 4, 5];

    const distTarget = distanceTargets[Math.floor(pseudoRandom(1) * distanceTargets.length)];
    const coinTarget = coinTargets[Math.floor(pseudoRandom(2) * coinTargets.length)];
    const surfTarget = surfTargets[Math.floor(pseudoRandom(3) * surfTargets.length)];

    return [
      {
        id: 'c1_distance',
        title: 'Karachi Commuter',
        description: `Run ${distTarget.toLocaleString()}m in a single run`,
        icon: '🏃',
        type: 'distance_single_run',
        target: distTarget,
        current: 0,
        completed: false,
        rewardRupees: 500
      },
      {
        id: 'c2_coins',
        title: 'Biryani Magnet Feast',
        description: `Collect ${coinTarget} Rupee coins using Magnet or Street Run`,
        icon: '🪙',
        type: 'collect_coins',
        target: coinTarget,
        current: 0,
        completed: false,
        rewardRupees: 750
      },
      {
        id: 'c3_stunt',
        title: 'W-11 Minibus Surfer',
        description: `Surf on the roof of ${surfTarget} W-11 Minibuses`,
        icon: '🚌',
        type: 'surf_minibus',
        target: surfTarget,
        current: 0,
        completed: false,
        rewardRupees: 1000
      }
    ];
  }

  recordChallengeProgress(type, amount = 1, date = new Date()) {
    const state = this.getDailyChallenges(date);
    let updated = false;

    state.challenges.forEach(challenge => {
      if (challenge.type === type && !challenge.completed) {
        if (type === 'distance_single_run') {
          challenge.current = Math.max(challenge.current, Math.round(amount));
        } else {
          challenge.current = Math.min(challenge.target, challenge.current + amount);
        }
        if (challenge.current >= challenge.target) {
          challenge.completed = true;
          challenge.completedAt = Date.now();
        }
        updated = true;
      }
    });

    if (updated) {
      this.saveDailyChallengesState(state);
    }
    return state;
  }

  claimChallengeReward(challengeId, date = new Date()) {
    const state = this.getDailyChallenges(date);
    const challenge = state.challenges.find(c => c.id === challengeId);
    if (!challenge || !challenge.completed || state.claimed[challengeId]) {
      return { success: false, message: 'Reward already claimed or requirement not met' };
    }

    state.claimed[challengeId] = true;
    const rewardRupees = challenge.rewardRupees || 500;

    if (this.saveManager) {
      this.saveManager.addRupees(rewardRupees);
    }

    // Check if all 3 are completed
    const allDone = state.challenges.every(c => c.completed);
    let allBonus = 0;
    if (allDone && !state.allCompletedBonusClaimed) {
      state.allCompletedBonusClaimed = true;
      allBonus = 2500;
      if (this.saveManager) {
        this.saveManager.addRupees(allBonus);
      }
    }

    this.saveDailyChallengesState(state);
    return {
      success: true,
      rewardRupees,
      allBonus,
      totalReward: rewardRupees + allBonus,
      allCompleted: allDone
    };
  }

  completeAllDailyChallenges(date = new Date()) {
    const state = this.getDailyChallenges(date);
    state.challenges.forEach(c => {
      c.current = c.target;
      c.completed = true;
      c.completedAt = Date.now();
    });
    this.saveDailyChallengesState(state);
    return state;
  }

  resetDailyChallenges(date = new Date()) {
    const dateKey = this.getDateSeed(date);
    const challenges = this.generateChallengesForDate(dateKey);
    const state = {
      dateKey,
      challenges,
      claimed: {},
      allCompletedBonusClaimed: false
    };
    this.saveDailyChallengesState(state);
    return state;
  }

  // --- Daily Challenge Leaderboards ---
  getDailyChallengeLeaderboard() {
    const dateKey = this.getDateSeed();
    const state = this.getDailyChallenges();
    const completedCount = state.challenges.filter(c => c.completed).length;

    // Deterministic challengers for today's daily challenges
    const rivals = [
      { gamerName: 'Lyari_Speedster', completed: 3, points: 2250, time: '09:14 AM' },
      { gamerName: 'TariqRoad_Racer', completed: 3, points: 2250, time: '11:32 AM' },
      { gamerName: 'BurnsRoad_Foodie', completed: 2, points: 1250, time: '01:45 PM' },
      { gamerName: 'Kharadar_King', completed: 2, points: 1250, time: '03:10 PM' },
      { gamerName: 'Gulshan_Glider', completed: 1, points: 500, time: '04:22 PM' },
      { gamerName: 'Clifton_Cruiser', completed: 1, points: 500, time: '05:08 PM' }
    ];

    const playerEntry = {
      gamerName: this.getGamerName(),
      completed: completedCount,
      points: state.challenges.reduce((sum, c) => c.completed ? sum + c.rewardRupees : sum, 0) + (state.allCompletedBonusClaimed ? 2500 : 0),
      time: 'Today',
      isCurrentPlayer: true
    };

    const all = [...rivals, playerEntry];
    all.sort((a, b) => b.completed !== a.completed ? b.completed - a.completed : b.points - a.points);

    return all.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
      isCurrentPlayer: entry.gamerName === this.getGamerName()
    }));
  }
}

export const leaderboardService = new LeaderboardService(saveManager);
