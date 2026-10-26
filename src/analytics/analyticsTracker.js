/**
 * Lightweight Client-Side Analytics & Telemetry Tracker
 * Captures dwell times, micro-interactions, device metrics, and synchronizes active optimizations.
 */

let activeOptimizationsCache = {};
const optimizationListeners = new Set();
let currentTabName = '';
let currentTabStartTime = Date.now();

/**
 * Send telemetry payload using sendBeacon for page unloads with fetch fallback
 */
function sendPayload(endpoint, data) {
  const url = endpoint || '/api/analytics/track';
  const payload = JSON.stringify({
    ...data,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1440,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 900,
    timestamp: Date.now()
  });

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) return;
    } catch {}
  }

  if (typeof fetch === 'function') {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true
    }).catch(() => {});
  }
}

/**
 * Track route or page view transition
 */
export function trackPageView(route = '/') {
  sendPayload('/api/analytics/track', {
    type: 'page_view',
    route,
    view: route.replace(/^\/admin\/?/, '').replace(/-/g, ' ').toUpperCase() || 'OVERVIEW'
  });
}

/**
 * Track dwell time on a tab or view
 */
export function trackTabDwell(tabName, dwellSeconds) {
  if (!tabName) return;
  const dwell = Number(dwellSeconds) || Math.max(1, Math.round((Date.now() - currentTabStartTime) / 1000));
  sendPayload('/api/analytics/track', {
    type: 'tab_dwell',
    view: tabName,
    dwellSeconds: dwell
  });
}

/**
 * Begin timing a specific tab
 */
export function startTabTiming(tabName) {
  if (currentTabName && currentTabName !== tabName) {
    const elapsed = Math.max(1, Math.round((Date.now() - currentTabStartTime) / 1000));
    trackTabDwell(currentTabName, elapsed);
  }
  currentTabName = tabName;
  currentTabStartTime = Date.now();
}

/**
 * Track report or file export action (pptx, csv, pdf)
 */
export function trackExport(exportType = 'csv') {
  sendPayload('/api/analytics/track', {
    type: 'export_triggered',
    exportType
  });
}

/**
 * Track currency / economy metric view
 */
export function trackCurrencyToggle(currency = 'PKR') {
  sendPayload('/api/analytics/track', {
    type: 'currency_toggle',
    currency
  });
}

/**
 * Track runner district dwell time and completion
 */
export function trackDistrictDwell(district, dwellSeconds, completed = false) {
  sendPayload('/api/analytics/track', {
    type: 'district_dwell',
    district,
    dwellSeconds: Number(dwellSeconds) || 0,
    completed: Boolean(completed)
  });
}

/**
 * Track fatal hazard collision in gameplay
 */
export function trackHazardCrash(hazardType, district = 'Soldier Bazar', speed = 1.0) {
  sendPayload('/api/analytics/track', {
    type: 'hazard_crash',
    hazardType,
    district,
    speed: Number(speed) || 1.0
  });
}

/**
 * Track collected Pakistani Rupees & run distance
 */
export function trackRupeesCollected(rupees = 0, distanceMeters = 0) {
  sendPayload('/api/analytics/track', {
    type: 'rupees_collected',
    rupees: Number(rupees) || 0,
    distanceMeters: Number(distanceMeters) || 0
  });
}

/**
 * Track low-FPS episode or frame rate telemetry
 */
export function trackFpsEpisode(fps = 60, isSub30 = false) {
  sendPayload('/api/analytics/track', {
    type: 'fps_episode',
    fps: Number(fps) || 60,
    isSub30: Boolean(isSub30)
  });
}

/**
 * Track metric selection or sort preference
 */
export function trackMetricSelect(metric = '') {
  sendPayload('/api/analytics/track', {
    type: 'metric_select',
    metric
  });
}

/**
 * Track search query string and resulting rows count
 */
export function trackSearchQuery(query = '', resultCount = 0) {
  sendPayload('/api/analytics/track', {
    type: 'search_query',
    query,
    resultCount: Number(resultCount) || 0
  });
}

/**
 * Subscribe to runtime active optimizations
 */
export function subscribeToOptimizations(callback) {
  if (typeof callback !== 'function') return () => {};
  optimizationListeners.add(callback);
  callback(activeOptimizationsCache);
  return () => optimizationListeners.delete(callback);
}

/**
 * Update cached optimizations and notify subscribers
 */
export function updateActiveOptimizations(newOptimizations = {}) {
  activeOptimizationsCache = { ...newOptimizations };
  optimizationListeners.forEach(cb => {
    try { cb(activeOptimizationsCache); } catch {}
  });
}

/**
 * Check if a specific optimization is currently active
 */
export function isOptimizationActive(actionId) {
  return Boolean(activeOptimizationsCache[actionId]);
}

// Auto-wire page unload and visibilitychange
if (typeof window !== 'undefined') {
  const flushCurrentDwell = () => {
    if (currentTabName) {
      const elapsed = Math.max(1, Math.round((Date.now() - currentTabStartTime) / 1000));
      trackTabDwell(currentTabName, elapsed);
    }
  };

  window.addEventListener('beforeunload', flushCurrentDwell);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushCurrentDwell();
    } else {
      currentTabStartTime = Date.now();
    }
  });
}
