import { SYSTEM_ACTIONS_CATALOG } from './actionCatalog.js';
import { getStore, triggerBackgroundSync } from './telemetryStore.js';

/**
 * Execute or Rollback a System Action / Optimization
 * 
 * @param {Object} options
 * @param {string} options.actionId - Identifier from SYSTEM_ACTIONS_CATALOG
 * @param {boolean} [options.enable=true] - true to apply, false to revert
 * @param {string} [options.actor='admin@enterprise.internal'] - Admin user applying or reverting
 * @param {string} [options.reason] - Optional operational rationale
 * @param {Object} [options.store] - Store instance (defaults to singleton getStore())
 */
export function applyAnalyticsAction({
  actionId,
  enable = true,
  actor = 'admin@enterprise.internal',
  reason = '',
  store = getStore()
} = {}) {
  const catalogEntry = SYSTEM_ACTIONS_CATALOG[actionId];
  if (!catalogEntry) {
    throw new Error(`Unknown actionId "${actionId}". Must match SYSTEM_ACTIONS_CATALOG.`);
  }

  store.monitoredFixes ||= {};
  const fix = store.monitoredFixes[actionId] || {
    actionId,
    title: catalogEntry.title,
    category: catalogEntry.category,
    status: 'pending',
    healthStatus: 'standby',
    appliedAt: null,
    appliedBy: null,
    revertedAt: null,
    revertedBy: null,
    observedMetricDelta: catalogEntry.telemetryEffect,
    baselineMetric: catalogEntry.baselineMetric,
    targetMetric: catalogEntry.targetMetric,
    uptimeSeconds: 0
  };

  const previousStatus = fix.status;
  const operation = enable ? 'APPLY' : 'REVERT';
  const newStatus = enable ? 'active' : 'reverted';
  const now = Date.now();

  if (enable) {
    fix.status = 'active';
    fix.healthStatus = 'healthy';
    fix.appliedAt = now;
    fix.appliedBy = actor;
    fix.uptimeSeconds = 0;
  } else {
    fix.status = 'reverted';
    fix.healthStatus = 'reverted';
    fix.revertedAt = now;
    fix.revertedBy = actor;
  }

  store.monitoredFixes[actionId] = fix;

  // Immutable Actions History Record
  const historyRecord = {
    historyId: `hist_${now}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now,
    actionId,
    actionTitle: catalogEntry.title,
    category: catalogEntry.category,
    operation,
    actor,
    previousStatus,
    newStatus,
    observedImpact: catalogEntry.telemetryEffect,
    reason: reason || (enable
      ? `Executive 1-Click optimization executed by ${actor}.`
      : `Operational rollback requested by ${actor}.`)
  };

  store.actionsHistory ||= [];
  store.actionsHistory.unshift(historyRecord);

  // Push to rolling recent activity feed
  store.recentActivity ||= [];
  store.recentActivity.unshift({
    id: `act_${now}`,
    time: 'Just now',
    timestamp: now,
    actor,
    type: enable ? 'fix_applied' : 'fix_reverted',
    label: enable ? `Applied fix: ${catalogEntry.title}` : `Reverted fix: ${catalogEntry.title}`,
    badge: enable ? 'Fix Active' : 'Fix Reverted'
  });

  if (store.recentActivity.length > 50) {
    store.recentActivity.pop();
  }

  triggerBackgroundSync(store);

  return {
    success: true,
    actionId,
    operation,
    status: newStatus,
    fix,
    historyRecord
  };
}

/**
 * Returns a map of currently active optimizations
 */
export function getActiveOptimizations(store = getStore()) {
  const active = {};
  for (const [key, fix] of Object.entries(store.monitoredFixes || {})) {
    if (fix && fix.status === 'active') {
      active[key] = true;
    }
  }
  return active;
}
