import assert from 'node:assert/strict';
import test from 'node:test';
import { getNextSafeRenderScale, PortableGameOpsEngine } from '../src/game-ops-engine.js';

class MemoryStorage {
  data = new Map();

  getItem(key) {
    return this.data.get(key) ?? null;
  }

  setItem(key, value) {
    this.data.set(key, String(value));
  }
}

function createEngine(options = {}) {
  let now = Date.UTC(2026, 0, 1);
  const engine = new PortableGameOpsEngine({
    storage: new MemoryStorage(),
    namespace: 'test:portable-ops',
    now: () => now,
    ...options
  });
  return { engine, advance: amount => { now += amount; } };
}

test('stores bounded, portable audit events and exports a detached report', () => {
  const { engine } = createEngine({ maxEvents: 10 });
  for (let index = 0; index < 12; index += 1) engine.record('check.result', { index });

  const report = engine.exportData();
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.events.length, 10);
  assert.equal(report.events[0].detail.index, 2);
  report.events.pop();
  assert.equal(engine.exportData().events.length, 10);
});

test('preserves events written by separate game and console instances', () => {
  const storage = new MemoryStorage();
  const make = () => new PortableGameOpsEngine({
    storage,
    namespace: 'shared:ops',
    now: () => Date.UTC(2026, 0, 1)
  });
  const gameEngine = make();
  const consoleEngine = make();
  gameEngine.record('runner.crash', { reason: 'Open gutter' });
  consoleEngine.record('master.command', { command: 'RUNNER_SELF_CHECK' });
  assert.deepEqual(
    make().state.events.map(event => event.type),
    ['runner.crash', 'master.command']
  );
});

test('flags persistent low-FPS episodes without applying an unapproved source change', () => {
  const { engine, advance } = createEngine();
  const telemetry = { fps: 20, level: 2, distanceMeters: 1200 };
  engine.observeTelemetry(telemetry);
  engine.observeTelemetry(telemetry);
  engine.observeTelemetry(telemetry);
  assert.equal(engine.state.events.filter(item => item.type === 'performance.low_fps').length, 1);
  engine.observeTelemetry({ ...telemetry, fps: 60 });
  engine.observeTelemetry(telemetry);
  engine.observeTelemetry(telemetry);
  advance(1);
  const suggestions = engine.observeTelemetry(telemetry);
  assert.ok(suggestions.some(item => item.id === 'repeated-low-fps'));
  assert.equal(engine.state.events.some(item => item.type === 'source.changed'), false);
});

test('persists suggestions, review decisions, and telemetry samples across engine instances', () => {
  const storage = new MemoryStorage();
  let now = Date.UTC(2026, 0, 1);
  const make = () => new PortableGameOpsEngine({
    storage,
    namespace: 'shared:ops',
    now: () => now
  });
  const engine = make();
  engine.addFeedback({ category: 'Bug', message: 'Potholes are hard to see.' });
  const suggestion = engine.state.suggestions.find(item => item.id === 'feedback-hazard-visibility');
  assert.ok(suggestion);
  assert.equal(engine.updateSuggestion(suggestion.id, 'accepted'), true);
  assert.equal(make().state.suggestions.find(item => item.id === suggestion.id).status, 'accepted');

  engine.observeTelemetry({ fps: 55, distanceMeters: 10 });
  engine.observeTelemetry({ fps: 55, distanceMeters: 15 });
  assert.equal(engine.state.events.filter(item => item.type === 'telemetry.sample').length, 1);
  now += 60_000;
  engine.observeTelemetry({ fps: 55, distanceMeters: 20 });
  assert.equal(engine.state.events.filter(item => item.type === 'telemetry.sample').length, 2);
});

test('calculates bounded, monotonic render-scale recovery steps', () => {
  assert.equal(getNextSafeRenderScale(2), 1.7);
  assert.equal(getNextSafeRenderScale(0.9), 0.8);
  assert.equal(getNextSafeRenderScale(0.75), 0.75);
  assert.throws(() => getNextSafeRenderScale(Number.NaN), /finite positive values/);
});

test('recommends investigation after repeated losses from the same hazard', () => {
  const { engine } = createEngine();
  [1, 2, 3].forEach(distanceMeters => {
    engine.recordCrash({ reason: 'Rain-Softened Pothole', obstacleType: 'pothole', distanceMeters });
  });
  const suggestions = engine.analyze();
  assert.ok(suggestions.some(item => item.id === 'repeat-crash-rain-softened-pothole'));
  assert.equal(suggestions[0].status, 'needs-review');
});

test('turns developer feedback into deterministic, review-only suggestions', () => {
  const { engine } = createEngine();
  const suggestions = engine.addFeedback({
    category: 'Bug',
    message: 'Potholes are hard to see in the rain.'
  });
  assert.ok(suggestions.some(item => item.id === 'feedback-hazard-visibility'));
  assert.ok(suggestions.every(item => item.status === 'needs-review'));
});

test('requires explicit consent and a configured adapter before publishing aggregates', async () => {
  let calls = 0;
  const withoutConsent = createEngine({ aggregateTransport: async () => { calls += 1; } }).engine;
  assert.equal(await withoutConsent.publishAggregate({ sessions: 1 }), false);
  const optedIn = createEngine({
    aggregateTransport: async payload => {
      calls += 1;
      assert.deepEqual(payload, { sessions: 1 });
    },
    analyticsConsent: true
  }).engine;
  assert.equal(await optedIn.publishAggregate({ sessions: 1 }), true);
  assert.equal(calls, 1);
});

test('rejects corrupt persisted data and invalid check states explicitly', () => {
  const storage = new MemoryStorage();
  storage.setItem('broken', '{not-json');
  assert.throws(() => new PortableGameOpsEngine({ storage, namespace: 'broken' }), SyntaxError);
  const { engine } = createEngine();
  assert.throws(() => engine.recordCheckResult({ status: 'unknown' }), /Check status/);
});

test('imports CI test results once, preserves every case, and suggests review for failures', () => {
  const { engine } = createEngine();
  const report = {
    timestamp: '2026-01-01T00:00:00.000Z',
    results: [
      { id: 'TC-01', name: 'Module imports', status: 'PASSED', details: 'Imported successfully' },
      { id: 'TC-02', name: 'Production build', status: 'FAILED', details: 'Build command failed' },
      { id: 'TC-03', name: 'Touch controls', status: 'SKIPPED', details: 'Filtered' }
    ]
  };

  assert.deepEqual(engine.importCIReport(report, { source: 'run-42/test_results.json' }), {
    PASSED: 1,
    FAILED: 1,
    SKIPPED: 1
  });
  assert.equal(engine.state.events.filter(event => event.type === 'check.result').length, 3);
  assert.ok(engine.state.events.some(event => event.type === 'ci.report.imported'));
  assert.ok(engine.state.suggestions.some(item => item.id === 'failed-automated-checks'));
  assert.throws(() => engine.importCIReport(report), /already been imported/);
});

test('rejects malformed CI reports before writing partial records', () => {
  const { engine } = createEngine();
  assert.throws(() => engine.importCIReport({
    timestamp: 'not-a-date',
    results: [{ id: 'TC-01', name: 'Build', status: 'PASSED' }]
  }), /valid timestamp/);
  assert.throws(() => engine.importCIReport({
    timestamp: '2026-01-01T00:00:00.000Z',
    results: [{ id: 'TC-01', name: 'Build', status: 'UNKNOWN' }]
  }), /supported status/);
  assert.equal(engine.state.events.length, 0);
});

test('toggles and persists admin consent prompt gate status', () => {
  const { engine } = createEngine();
  assert.equal(engine.isConsentPromptEnabled(), false);
  assert.equal(engine.setConsentPromptEnabled(true), true);
  assert.equal(engine.isConsentPromptEnabled(), true);
  assert.ok(engine.state.events.some(event => event.type === 'admin.consent_gate_updated'));
  assert.equal(engine.setConsentPromptEnabled(false), false);
  assert.equal(engine.isConsentPromptEnabled(), false);
});
