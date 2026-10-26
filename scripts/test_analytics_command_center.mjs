import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';

import {
  getStore,
  categorizeScreenResolution,
  recordTelemetryEvent,
  getCountryFlag
} from '../src/analytics/telemetryStore.js';
import { generateAnalyticsInsights } from '../src/analytics/heuristicEngine.js';
import {
  applyAnalyticsAction,
  getActiveOptimizations
} from '../src/analytics/actionsManager.js';
import { SYSTEM_ACTIONS_CATALOG } from '../src/analytics/actionCatalog.js';
import { handleAnalyticsApiRequest } from '../src/analytics/analyticsApiHandler.js';

// Helper mock for HTTP Request and Response
class MockReq extends EventEmitter {
  constructor({ method = 'GET', url = '/', headers = {}, body = null } = {}) {
    super();
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.body = body;
  }
}

class MockRes extends EventEmitter {
  constructor() {
    super();
    this.statusCode = 200;
    this.headers = {};
    this.body = '';
  }
  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value;
  }
  getHeader(name) {
    return this.headers[name.toLowerCase()];
  }
  end(data = '') {
    this.body = data;
    this.emit('finish');
  }
}

test('1. Dwell time & bounce calculation', () => {
  const store = getStore();
  const testView = `Test Grid View ${Date.now()}`;

  // Session 1: 5 seconds (Under 10s -> classified as a bounce)
  recordTelemetryEvent({ view: testView, dwellSeconds: 5 });
  let dwell = store.dwellTimes[testView];
  assert.ok(dwell, 'Dwell record should be created');
  assert.equal(dwell.sessionCount, 1);
  assert.equal(dwell.bounceCount, 1);
  assert.equal(dwell.bounceRate, 100.0);
  assert.equal(dwell.avgDwellSeconds, 5.0);

  // Session 2: 45 seconds (Over 10s -> NOT a bounce)
  recordTelemetryEvent({ view: testView, dwellSeconds: 45 });
  dwell = store.dwellTimes[testView];
  assert.equal(dwell.sessionCount, 2);
  assert.equal(dwell.bounceCount, 1);
  assert.equal(dwell.bounceRate, 50.0);
  assert.equal(dwell.avgDwellSeconds, 25.0);
});

test('2. Screen resolution categorization', () => {
  // 13" laptop resolutions
  const res1 = categorizeScreenResolution(1440, 900);
  assert.equal(res1.bucket, 'laptop_13_inch');
  assert.equal(res1.is13InchLaptop, true);

  const res2 = categorizeScreenResolution(1280, 800);
  assert.equal(res2.bucket, 'laptop_13_inch');
  assert.equal(res2.is13InchLaptop, true);

  // FHD Desktop
  const res3 = categorizeScreenResolution(1920, 1080);
  assert.equal(res3.bucket, 'fhd_desktop');
  assert.equal(res3.is13InchLaptop, false);

  // Mobile
  const res4 = categorizeScreenResolution(375, 667);
  assert.equal(res4.bucket, 'mobile');
  assert.equal(res4.is13InchLaptop, false);

  // 4K
  const res5 = categorizeScreenResolution(3840, 2160);
  assert.equal(res5.bucket, 'uhd_4k');
  assert.equal(res5.is13InchLaptop, false);

  // Flag emoji
  assert.equal(getCountryFlag('US'), '🇺🇸');
  assert.equal(getCountryFlag('SA'), '🇸🇦');
  assert.equal(getCountryFlag('PK'), '🇵🇰');
});

test('3. Real-time heuristic insight generation (producing at least 5 prioritized findings)', () => {
  const store = getStore();
  const insights = generateAnalyticsInsights(store);

  assert.ok(Array.isArray(insights), 'Insights should be an array');
  assert.ok(insights.length >= 5, `Expected at least 5 prioritized findings, got ${insights.length}`);

  // Check ranking descending by impactScore
  for (let i = 0; i < insights.length - 1; i++) {
    assert.ok(
      insights[i].impactScore >= insights[i + 1].impactScore,
      `Finding at index ${i} (${insights[i].impactScore}) should rank >= index ${i + 1} (${insights[i + 1].impactScore})`
    );
  }

  // Validate finding schema
  const requiredFields = [
    'id', 'actionId', 'title', 'category', 'severity',
    'impactScore', 'status', 'evidence', 'recommendation',
    'actionLabel', 'impactMetric', 'revertable'
  ];

  insights.forEach(f => {
    requiredFields.forEach(field => {
      assert.ok(f[field] !== undefined, `Finding ${f.id} missing field "${field}"`);
    });
    assert.ok(f.impactScore >= 1 && f.impactScore <= 100, `Impact score out of 1-100 range: ${f.impactScore}`);
    assert.ok(['ui_ux', 'audience', 'performance', 'data_hygiene', 'feature_discovery'].includes(f.category));
    assert.ok(['high', 'medium', 'opportunity', 'resolved', 'warning'].includes(f.severity));
  });
});

test('4. Optimization execution (applyAnalyticsAction setting status: "active")', () => {
  const store = getStore();
  const actionId = 'enable_high_contrast_pothole_rims';

  const result = applyAnalyticsAction({
    actionId,
    enable: true,
    actor: 'test.admin@enterprise.internal',
    reason: 'Testing apply optimization execution',
    store
  });

  assert.equal(result.success, true);
  assert.equal(result.status, 'active');
  assert.equal(result.operation, 'APPLY');

  const fix = store.monitoredFixes[actionId];
  assert.equal(fix.status, 'active');
  assert.equal(fix.healthStatus, 'healthy');
  assert.equal(fix.appliedBy, 'test.admin@enterprise.internal');
  assert.ok(fix.appliedAt > 0);

  const active = getActiveOptimizations(store);
  assert.equal(active[actionId], true);
});

test('5. Rollback execution (applyAnalyticsAction with enable: false setting status: "reverted")', () => {
  const store = getStore();
  const actionId = 'enable_high_contrast_pothole_rims';

  const result = applyAnalyticsAction({
    actionId,
    enable: false,
    actor: 'rollback.auditor@enterprise.internal',
    reason: 'Testing rollback execution',
    store
  });

  assert.equal(result.success, true);
  assert.equal(result.status, 'reverted');
  assert.equal(result.operation, 'REVERT');

  const fix = store.monitoredFixes[actionId];
  assert.equal(fix.status, 'reverted');
  assert.equal(fix.healthStatus, 'reverted');
  assert.equal(fix.revertedBy, 'rollback.auditor@enterprise.internal');
  assert.ok(fix.revertedAt > 0);

  const active = getActiveOptimizations(store);
  assert.equal(active[actionId], undefined);
});

test('6. Audit trail tracking (actionsHistory recording REVERT and APPLY)', () => {
  const store = getStore();
  const actionId = 'enable_haptic_corner_turn_cue';

  // Apply
  applyAnalyticsAction({
    actionId,
    enable: true,
    actor: 'auditor.apply@enterprise.internal',
    reason: 'Audit trail apply step',
    store
  });

  // Revert
  applyAnalyticsAction({
    actionId,
    enable: false,
    actor: 'auditor.revert@enterprise.internal',
    reason: 'Audit trail revert step',
    store
  });

  const latestRevert = store.actionsHistory[0];
  const priorApply = store.actionsHistory[1];

  assert.equal(latestRevert.operation, 'REVERT');
  assert.equal(latestRevert.actionId, actionId);
  assert.equal(latestRevert.actor, 'auditor.revert@enterprise.internal');
  assert.equal(latestRevert.previousStatus, 'active');
  assert.equal(latestRevert.newStatus, 'reverted');

  assert.equal(priorApply.operation, 'APPLY');
  assert.equal(priorApply.actionId, actionId);
  assert.equal(priorApply.actor, 'auditor.apply@enterprise.internal');
  assert.equal(priorApply.newStatus, 'active');
});

test('7. API endpoints (POST /api/analytics/track, GET /api/admin/analytics, POST /api/admin/analytics apply/revert)', async () => {
  // A. POST /api/analytics/track
  {
    const req = new MockReq({
      method: 'POST',
      url: '/api/analytics/track',
      headers: {
        'x-vercel-ip-country': 'AE',
        'x-vercel-ip-city': 'Dubai'
      },
      body: {
        type: 'currency_toggle',
        currency: 'PKR',
        dwellSeconds: 22,
        view: 'API Test View',
        screenWidth: 1440,
        screenHeight: 900
      }
    });
    const res = new MockRes();
    const handled = await handleAnalyticsApiRequest(req, res);
    assert.equal(handled, true);
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
  }

  // B. GET /api/admin/analytics
  {
    const req = new MockReq({
      method: 'GET',
      url: '/api/admin/analytics'
    });
    const res = new MockRes();
    const handled = await handleAnalyticsApiRequest(req, res);
    assert.equal(handled, true);
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.ok(body.store, 'Should return store');
    assert.ok(Array.isArray(body.insights), 'Should return insights array');
    assert.ok(body.insights.length >= 5, 'Should return at least 5 insights');
  }

  // C. POST /api/admin/analytics (Unauthorized without admin credentials)
  {
    const req = new MockReq({
      method: 'POST',
      url: '/api/admin/analytics',
      headers: {},
      body: { actionId: 'enable_high_contrast_pothole_rims', enable: true }
    });
    const res = new MockRes();
    const handled = await handleAnalyticsApiRequest(req, res);
    assert.equal(handled, true);
    assert.equal(res.statusCode, 401, 'Should reject unauthenticated requests');
  }

  // D. POST /api/admin/analytics (Apply with Admin Auth)
  {
    const req = new MockReq({
      method: 'POST',
      url: '/api/admin/analytics',
      headers: { 'x-admin-email': 'admin.executive@enterprise.internal' },
      body: { actionId: 'enable_high_contrast_pothole_rims', enable: true, reason: 'API apply verification' }
    });
    const res = new MockRes();
    const handled = await handleAnalyticsApiRequest(req, res);
    assert.equal(handled, true);
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.equal(body.operation, 'APPLY');
    assert.equal(body.status, 'active');
  }

  // E. POST /api/admin/analytics (Revert with Bearer Auth)
  {
    const req = new MockReq({
      method: 'POST',
      url: '/api/admin/analytics',
      headers: { 'authorization': 'Bearer enterprise-secure-admin-token-xyz' },
      body: { actionId: 'enable_high_contrast_pothole_rims', operation: 'revert', reason: 'API revert verification' }
    });
    const res = new MockRes();
    const handled = await handleAnalyticsApiRequest(req, res);
    assert.equal(handled, true);
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.equal(body.operation, 'REVERT');
    assert.equal(body.status, 'reverted');
  }
});
