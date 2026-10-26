import { SYSTEM_ACTIONS_CATALOG } from './actionCatalog.js';

const STORE_KEY = Symbol.for('project.analyticsStore');

/**
 * Country flag emoji helper from 2-letter ISO country code
 */
export function getCountryFlag(countryCode = '') {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const code = countryCode.toUpperCase();
  const offset = 127397;
  try {
    return String.fromCodePoint(...[...code].map(c => c.charCodeAt(0) + offset));
  } catch {
    return '🌐';
  }
}

/**
 * Screen resolution bucketing
 * Identifies Mobile viewports (375x667, 390x844) vs 13" laptop screens (1440x900 / 1280x800) and FHD desktops.
 */
export function categorizeScreenResolution(width, height) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const maxDim = Math.max(w, h);
  const minDim = Math.min(w, h);

  if (maxDim <= 768) {
    return { bucket: 'mobile', label: 'Mobile Device (375x667 / 390x844)', is13InchLaptop: false, isMobile: true };
  }
  if (maxDim <= 1024) {
    return { bucket: 'tablet', label: 'Tablet / iPad (768 - 1024px)', is13InchLaptop: false, isMobile: false };
  }
  // 13" Laptop screens: typically 1280x800, 1440x900, 1366x768
  if ((maxDim >= 1280 && maxDim <= 1440 && minDim >= 720 && minDim <= 900) ||
      (w === 1440 && h === 900) || (w === 1280 && h === 800) || (w === 1366 && h === 768)) {
    return {
      bucket: 'laptop_13_inch',
      label: '13" Laptop Screen (1440x900 / 1280x800)',
      is13InchLaptop: true,
      isMobile: false
    };
  }
  if (maxDim >= 1920 && maxDim < 2560) {
    return { bucket: 'fhd_desktop', label: 'FHD Desktop (1920x1080)', is13InchLaptop: false, isMobile: false };
  }
  if (maxDim >= 2560) {
    return { bucket: 'uhd_4k', label: '2K / 4K Monitor (>= 2560px)', is13InchLaptop: false, isMobile: false };
  }
  return { bucket: 'standard_desktop', label: 'Standard Desktop (1600x900)', is13InchLaptop: false, isMobile: false };
}

/**
 * Seed initial monitored fixes from the system actions catalog
 */
function createDefaultMonitoredFixes() {
  const fixes = {};
  for (const [key, action] of Object.entries(SYSTEM_ACTIONS_CATALOG)) {
    fixes[key] = {
      actionId: key,
      title: action.title,
      category: action.category,
      status: action.defaultActive ? 'active' : 'pending',
      healthStatus: action.defaultActive ? 'healthy' : 'standby',
      appliedAt: action.defaultActive ? Date.now() - 3600000 * 14 : null,
      appliedBy: action.defaultActive ? 'system.gameplay_ops@karachi-runner.internal' : null,
      revertedAt: null,
      revertedBy: null,
      observedMetricDelta: action.telemetryEffect,
      baselineMetric: action.baselineMetric,
      targetMetric: action.targetMetric,
      uptimeSeconds: action.defaultActive ? 50400 : 0
    };
  }
  return fixes;
}

/**
 * Create fresh default store state with rich Karachi Runner gameplay distributions
 */
function createInitialStoreState() {
  return {
    schemaVersion: 3,
    createdAt: Date.now(),
    updatedAt: Date.now(),

    // 1. Karachi 6-District Loop Dwell & Survival Funnel
    dwellTimes: {
      '1. Soldier Bazar · Garden Heritage': {
        view: '1. Soldier Bazar · Garden Heritage',
        route: 'district_1',
        totalDwellSeconds: 284000,
        sessionCount: 68410,
        avgDwellSeconds: 74.2,
        bounceCount: 5472, // Crashes under 10s
        bounceRate: 8.0,
        completionPct: 100.0
      },
      '2. Mazar-e-Quaid · Mausoleum': {
        view: '2. Mazar-e-Quaid · Mausoleum',
        route: 'district_2',
        totalDwellSeconds: 228000,
        sessionCount: 50820,
        avgDwellSeconds: 88.5,
        bounceCount: 6098,
        bounceRate: 12.0,
        completionPct: 74.3
      },
      '3. Saddar · Empress Market': {
        view: '3. Saddar · Empress Market',
        route: 'district_3',
        totalDwellSeconds: 162000,
        sessionCount: 36140,
        avgDwellSeconds: 96.0,
        bounceCount: 6505,
        bounceRate: 18.0,
        completionPct: 52.8
      },
      '4. I.I. Chundrigar · Financial': {
        view: '4. I.I. Chundrigar · Financial',
        route: 'district_4',
        totalDwellSeconds: 118000,
        sessionCount: 23680,
        avgDwellSeconds: 104.2,
        bounceCount: 5209,
        bounceRate: 22.0,
        completionPct: 34.6
      },
      '5. Clifton · Sea View Coast': {
        view: '5. Clifton · Sea View Coast',
        route: 'district_5',
        totalDwellSeconds: 78000,
        sessionCount: 14640,
        avgDwellSeconds: 112.5,
        bounceCount: 4099,
        bounceRate: 28.0,
        completionPct: 21.4
      },
      '6. Lyari · Chakiwara District': {
        view: '6. Lyari · Chakiwara District',
        route: 'district_6',
        totalDwellSeconds: 46000,
        sessionCount: 8080,
        avgDwellSeconds: 125.0,
        bounceCount: 2908,
        bounceRate: 36.0,
        completionPct: 11.8
      }
    },

    // 2. Fatal Collision & Hazard Crash Distribution
    hazardCrashes: {
      'Open Gutter / Broken Pothole': { name: 'Open Gutter / Broken Pothole', count: 4230, percentage: 34.0, color: '#f87171' },
      'Parked Rickshaw / Suzuki': { name: 'Parked Rickshaw / Suzuki', count: 3240, percentage: 26.0, color: '#fb923c' },
      'Water Tanker Mafia': { name: 'Water Tanker Mafia', count: 2240, percentage: 18.0, color: '#ffd700' },
      'Low Hanging Electric Wires': { name: 'Low Hanging Electric Wires', count: 1490, percentage: 12.0, color: '#38bdf8' },
      'Corner Turn / Fork Misstep': { name: 'Corner Turn / Fork Misstep', count: 1240, percentage: 10.0, color: '#a855f7' }
    },

    // 3. Monitored Gameplay Fixes
    monitoredFixes: createDefaultMonitoredFixes(),

    // 4. Immutable Actions History Ledger
    actionsHistory: [
      {
        historyId: 'act_init_bootstrap_001',
        timestamp: Date.now() - 3600000 * 32,
        actionId: 'enable_dynamic_render_scale_governor',
        actionTitle: 'Dynamic Render-Scale Governor for Low-End Mobile Chips',
        category: 'performance',
        operation: 'APPLY',
        actor: 'gameops.lead@karachi-runner.internal',
        previousStatus: 'pending',
        newStatus: 'active',
        observedImpact: 'Low-FPS episodes dropped by 78.4%; locked 60 FPS achieved across Android and iOS test fleet.',
        reason: 'Automated frame rate degradation detected in Saddar heavy traffic chunk.'
      }
    ],

    // 5. Device & Display Ergonomics
    deviceFootprint: {
      resolutionBuckets: {
        mobile: { label: 'Mobile Device (375x667 / 390x844)', count: 4680, percentage: 68.4, is13InchLaptop: false, isMobile: true },
        laptop_13_inch: { label: '13" Laptop Screen (1440x900 / 1280x800)', count: 1420, percentage: 20.8, is13InchLaptop: true, isMobile: false },
        fhd_desktop: { label: 'FHD Desktop (1920x1080)', count: 740, percentage: 10.8, is13InchLaptop: false, isMobile: false }
      },
      platforms: {
        'Android (Capacitor AAB)': { count: 3840, pct: 56.1 },
        'Web (PWA / Mobile Safari)': { count: 1980, pct: 28.9 },
        'Desktop Chrome/macOS': { count: 1020, pct: 15.0 }
      }
    },

    // 6. Rupee Economy & Session Gameplay Metrics
    gameplayEconomy: {
      totalRupeesCollected: 4850200,
      totalRunsPlayed: 142850,
      avgRunDistanceMeters: 1420,
      avgSessionDurationSeconds: 402, // 6m 42s
      reviveTokensUsed: 14120,
      powerupUpgrades: {
        nitro: { name: 'CNG Nitro', count: 1840, icon: '🚀' },
        shield: { name: 'Water Tanker Shield', count: 1620, icon: '🛡️' },
        horn: { name: 'King Pressure Horn', count: 1240, icon: '📢' },
        biryani: { name: 'Burns Road Biryani Feast', count: 980, icon: '🍲' },
        double_coins: { name: 'Double Rupees', count: 860, icon: '🪙' },
        jump: { name: 'Hydraulic Suspension Jump', count: 640, icon: '🦘' }
      }
    },

    // 7. Dead-End & Corner Turn Detection
    zeroResults: [
      {
        id: 'zr_corner_turn_saddar',
        query: '90° Right Turn to Empress Market',
        filterCombination: { junction: 'Saddar Fork', speedKmh: 24.2, lane: 1 },
        occurrences: 84,
        rootCause: 'Players swiped too late at high boost velocity; 15m street direction sign cue was missing.',
        firstDetectedAt: Date.now() - 3600000 * 20,
        lastDetectedAt: Date.now() - 60000 * 18
      },
      {
        id: 'zr_low_wire_duck',
        query: 'Low Electric Wires in Soldier Bazar',
        filterCombination: { hazard: 'hanging_wires', action: 'slide', lane: 0 },
        occurrences: 52,
        rootCause: 'Hitbox crouch scale did not duck fast enough when sliding from jump apex.',
        firstDetectedAt: Date.now() - 3600000 * 36,
        lastDetectedAt: Date.now() - 3600000 * 4
      }
    ],

    // 8. User Location & Diaspora Edge IP Attribution
    geoDistribution: {
      diasporaPercentage: 38.0,
      countries: [
        { code: 'PK', name: 'Pakistan (Karachi Local)', flag: '🇵🇰', sessions: 4240, percentage: 62.0, topCity: 'Karachi' },
        { code: 'AE', name: 'United Arab Emirates (Dubai)', flag: '🇦🇪', sessions: 684, percentage: 10.0, topCity: 'Dubai' },
        { code: 'SA', name: 'Saudi Arabia (Riyadh / Jeddah)', flag: '🇸🇦', sessions: 410, percentage: 6.0, topCity: 'Riyadh' },
        { code: 'GB', name: 'United Kingdom (London)', flag: '🇬🇧', sessions: 274, percentage: 4.0, topCity: 'London' },
        { code: 'US', name: 'United States (Houston / Chicago)', flag: '🇺🇸', sessions: 274, percentage: 4.0, topCity: 'Houston' },
        { code: 'CA', name: 'Canada (Toronto)', flag: '🇨🇦', sessions: 205, percentage: 3.0, topCity: 'Toronto' }
      ]
    },

    // 9. Performance & Mobile FPS Telemetry
    performanceTelemetry: {
      averageFps: 52.4,
      lowFpsSessionPct: 24.2,
      smooth60FpsPct: 64.5,
      canvasRenderScale: 0.92,
      stutterIncidentsByChunk: [
        { chunk: 'Saddar Empress Market Bazaar', avgFps: 34.2, memoryMb: 142 },
        { chunk: 'Monsoon Flooded Pothole Corridor', avgFps: 38.6, memoryMb: 128 },
        { chunk: 'W-11 Minibus Congestion Zone', avgFps: 41.0, memoryMb: 119 }
      ]
    },

    // 10. Active Players Audit Ledger
    usersAudit: [
      { id: 'usr_karachi_01', email: 'hamza.runner@karachi.pk', role: 'Master Runner', lastSeen: Date.now() - 60000 * 4, favoriteAction: 'Slingshot Boost (100%)', country: 'PK', flag: '🇵🇰' },
      { id: 'usr_dubai_02', email: 'bilal.dubai@diaspora.ae', role: 'Patrol Captain', lastSeen: Date.now() - 60000 * 18, favoriteAction: 'Burns Road Biryani Feast', country: 'AE', flag: '🇦🇪' },
      { id: 'usr_riyadh_03', email: 'usman.sa@diaspora.sa', role: 'Speedster', lastSeen: Date.now() - 3600000 * 1, favoriteAction: 'CNG Turbo 2.4x', country: 'SA', flag: '🇸🇦' },
      { id: 'usr_london_04', email: 'ayesha.uk@diaspora.co.uk', role: 'Loop Completer (20km)', lastSeen: Date.now() - 3600000 * 2, favoriteAction: 'Wave 18 Rescue Token', country: 'GB', flag: '🇬🇧' }
    ],

    // 11. Rolling Live Activity Feed
    recentActivity: [
      {
        id: 'act_live_1',
        time: 'Just now',
        timestamp: Date.now() - 60000 * 1,
        actor: 'hamza.runner@karachi.pk',
        type: 'loop_cleared',
        label: 'Cleared Saddar Heritage (District 3) · 6,700m',
        badge: 'District Clear'
      },
      {
        id: 'act_live_2',
        time: '4m ago',
        timestamp: Date.now() - 60000 * 4,
        actor: 'bilal.dubai@diaspora.ae',
        type: 'slingshot_boost',
        label: '100% Slingshot Turbo on Bedford Truck at 24.8 km/h',
        badge: 'Slingshot'
      },
      {
        id: 'act_live_3',
        time: '12m ago',
        timestamp: Date.now() - 60000 * 12,
        actor: 'system.game_ops',
        type: 'hazard_warning',
        label: 'Monsoon pothole crash cluster flagged in Soldier Bazar',
        badge: 'Hazard Alert'
      }
    ]
  };
}

/**
 * Defensive schema migration for store self-healing
 */
function migrateStoreSchema(store) {
  const initial = createInitialStoreState();
  if (!store || typeof store !== 'object') return initial;

  // Backfill missing root keys
  for (const [key, val] of Object.entries(initial)) {
    if (store[key] === undefined || store[key] === null) {
      store[key] = val;
    }
  }

  // Ensure monitoredFixes has all catalog entries
  store.monitoredFixes ||= {};
  for (const [actionId, action] of Object.entries(SYSTEM_ACTIONS_CATALOG)) {
    if (!store.monitoredFixes[actionId]) {
      store.monitoredFixes[actionId] = {
        actionId,
        title: action.title,
        category: action.category,
        status: action.defaultActive ? 'active' : 'pending',
        healthStatus: action.defaultActive ? 'healthy' : 'standby',
        appliedAt: null,
        appliedBy: null,
        revertedAt: null,
        revertedBy: null,
        observedMetricDelta: action.telemetryEffect,
        baselineMetric: action.baselineMetric,
        targetMetric: action.targetMetric,
        uptimeSeconds: 0
      };
    }
  }

  if (!Array.isArray(store.actionsHistory)) store.actionsHistory = [];
  if (!Array.isArray(store.recentActivity)) store.recentActivity = [];
  if (!Array.isArray(store.zeroResults)) store.zeroResults = [];
  if (!Array.isArray(store.usersAudit)) store.usersAudit = initial.usersAudit;

  store.schemaVersion = 3;
  return store;
}

/**
 * Access or initialize the persistent in-memory telemetry singleton
 */
export function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = createInitialStoreState();
  } else {
    migrateStoreSchema(globalThis[STORE_KEY]);
  }
  return globalThis[STORE_KEY];
}

/**
 * Fire-and-forget background sync adapter (does not block HTTP thread)
 */
export function triggerBackgroundSync(store) {
  Promise.resolve().then(() => {
    store.updatedAt = Date.now();
    try {
      if (globalThis.localStorage) {
        globalThis.localStorage.setItem('kr_gameplay_analytics_snapshot', JSON.stringify({
          updatedAt: store.updatedAt,
          monitoredFixesCount: Object.keys(store.monitoredFixes || {}).length,
          actionsHistoryCount: (store.actionsHistory || []).length
        }));
      }
    } catch {}
  }).catch(() => {});
}

/**
 * Ingest telemetry payload from client or edge requests
 */
export function recordTelemetryEvent({
  type,
  view,
  route,
  dwellSeconds = 0,
  screenWidth,
  screenHeight,
  rupeesEarned,
  distanceMeters,
  hazardType,
  query,
  resultCount,
  countryCode,
  city,
  fps,
  actor
} = {}) {
  const store = getStore();

  // 1. Dwell Times & Bounce Tracking (Runs under 10 seconds count as early crash/bounce)
  if (view && dwellSeconds > 0) {
    const dwell = store.dwellTimes[view] || {
      view,
      route: route || `district_${Object.keys(store.dwellTimes).length + 1}`,
      totalDwellSeconds: 0,
      sessionCount: 0,
      avgDwellSeconds: 0,
      bounceCount: 0,
      bounceRate: 0,
      completionPct: 100.0
    };

    dwell.sessionCount += 1;
    dwell.totalDwellSeconds += dwellSeconds;
    dwell.avgDwellSeconds = Number((dwell.totalDwellSeconds / dwell.sessionCount).toFixed(1));

    if (dwellSeconds < 10) {
      dwell.bounceCount += 1;
    }
    dwell.bounceRate = Number(((dwell.bounceCount / dwell.sessionCount) * 100).toFixed(1));
    store.dwellTimes[view] = dwell;
  }

  // 2. Screen Resolution Bucketing
  if (screenWidth && screenHeight) {
    const { bucket, label, is13InchLaptop, isMobile } = categorizeScreenResolution(screenWidth, screenHeight);
    const buckets = store.deviceFootprint.resolutionBuckets;
    if (!buckets[bucket]) {
      buckets[bucket] = { label, count: 0, percentage: 0, is13InchLaptop, isMobile };
    }
    buckets[bucket].count += 1;

    const total = Object.values(buckets).reduce((acc, b) => acc + b.count, 0);
    for (const b of Object.values(buckets)) {
      b.percentage = Number(((b.count / total) * 100).toFixed(1));
    }
  }

  // 3. Hazard Crash Recording
  if (hazardType && store.hazardCrashes) {
    if (!store.hazardCrashes[hazardType]) {
      store.hazardCrashes[hazardType] = { name: hazardType, count: 1, percentage: 1, color: '#f87171' };
    } else {
      store.hazardCrashes[hazardType].count += 1;
    }
    const totalCrashes = Object.values(store.hazardCrashes).reduce((acc, h) => acc + h.count, 0);
    for (const h of Object.values(store.hazardCrashes)) {
      h.percentage = Number(((h.count / totalCrashes) * 100).toFixed(1));
    }
  }

  // 4. Rupee Economy Ingestion
  if (rupeesEarned && Number.isFinite(Number(rupeesEarned))) {
    store.gameplayEconomy.totalRupeesCollected += Number(rupeesEarned);
  }
  if (distanceMeters && Number.isFinite(Number(distanceMeters))) {
    store.gameplayEconomy.totalRunsPlayed += 1;
    store.gameplayEconomy.avgRunDistanceMeters = Math.round(
      (store.gameplayEconomy.avgRunDistanceMeters * 0.95) + (Number(distanceMeters) * 0.05)
    );
  }

  // 5. FPS Performance
  if (fps && Number.isFinite(Number(fps))) {
    const f = Number(fps);
    store.performanceTelemetry.averageFps = Number(((store.performanceTelemetry.averageFps * 0.95) + (f * 0.05)).toFixed(1));
    if (f < 30) {
      store.performanceTelemetry.lowFpsSessionPct = Number((store.performanceTelemetry.lowFpsSessionPct * 0.99 + 0.1).toFixed(1));
    }
  }

  // 6. User Location / Geo Attribution
  if (countryCode) {
    const countries = store.geoDistribution.countries;
    const existing = countries.find(c => c.code === countryCode.toUpperCase());
    if (existing) {
      existing.sessions += 1;
      if (city) existing.topCity = city;
    } else {
      countries.push({
        code: countryCode.toUpperCase(),
        name: countryCode.toUpperCase(),
        flag: getCountryFlag(countryCode),
        sessions: 1,
        percentage: 1.0,
        topCity: city || 'Unknown'
      });
    }
    const totalSessions = countries.reduce((acc, c) => acc + c.sessions, 0);
    for (const c of countries) {
      c.percentage = Number(((c.sessions / totalSessions) * 100).toFixed(1));
    }
  }

  triggerBackgroundSync(store);
  return store;
}
