const DEFAULT_MAX_EVENTS = 500;
const DEFAULT_MAX_SUGGESTIONS = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

const KNOWN_FEEDBACK_RULES = [
  {
    id: 'hazard-visibility',
    pattern: /\b(hard to see|can't see|cannot see|not visible|visibility|invisible|unclear hazard|pothole)\b/i,
    title: 'Review hazard visibility',
    detail: 'Review hazard contrast, approach cues, and detection distance.'
  },
  {
    id: 'control-usability',
    pattern: /\b(control|steer|lane|jump|slide|button|touch)\b/i,
    title: 'Review Runner controls',
    detail: 'Review touch-target size, input response, and control guidance.'
  },
  {
    id: 'performance',
    pattern: /\b(slow|lag|stutter|fps|frame rate|performance)\b/i,
    title: 'Review gameplay performance',
    detail: 'Compare performance snapshots by device and route section.'
  },
  {
    id: 'karachi-authenticity',
    pattern: /\b(karachi|authentic|area|street|prop|visual|art|culture|scenery)\b/i,
    title: 'Review Karachi scene authenticity',
    detail: 'Review the named route area, landmarks, street props, and hazard fit.'
  }
];

export function getNextSafeRenderScale(currentRatio, { minimum = 0.8, reduction = 0.85 } = {}) {
  if (!Number.isFinite(currentRatio) || currentRatio <= 0 ||
      !Number.isFinite(minimum) || minimum <= 0 ||
      !Number.isFinite(reduction) || reduction <= 0 || reduction >= 1) {
    throw new TypeError('Render scale and reduction settings must be finite positive values.');
  }
  if (currentRatio <= minimum) return currentRatio;
  return Math.max(minimum, Number((currentRatio * reduction).toFixed(2)));
}

export class PortableGameOpsEngine {
  constructor({
    storage = globalThis.localStorage,
    namespace = 'portable-game-ops:v1',
    now = () => Date.now(),
    maxEvents = DEFAULT_MAX_EVENTS,
    maxSuggestions = DEFAULT_MAX_SUGGESTIONS,
    aggregateTransport = null,
    analyticsConsent = false
  } = {}) {
    if (!storage || typeof storage.getItem !== 'function' ||
        typeof storage.setItem !== 'function') {
      throw new TypeError('Game Ops requires a storage adapter with getItem and setItem.');
    }
    if (!/^[a-zA-Z0-9:_-]{1,80}$/.test(namespace)) {
      throw new TypeError('Game Ops namespace contains unsupported characters.');
    }
    this.storage = storage;
    this.key = namespace;
    this.now = now;
    this.maxEvents = Math.max(10, Math.floor(maxEvents));
    this.maxSuggestions = Math.max(10, Math.floor(maxSuggestions));
    this.aggregateTransport = aggregateTransport;
    this.analyticsConsent = Boolean(analyticsConsent);
    this.state = this.readState();
    this.lowFpsSamples = 0;
  }

  readState() {
    const stored = this.storage.getItem(this.key);
    if (!stored) return { schemaVersion: 1, events: [], suggestions: [], lastSampleAt: 0 };
    const state = JSON.parse(stored);
    if (!state || state.schemaVersion !== 1 ||
        !Array.isArray(state.events) || !Array.isArray(state.suggestions)) {
      throw new TypeError(`Stored Game Ops state at "${this.key}" is invalid.`);
    }
    return {
      schemaVersion: 1,
      events: state.events.slice(-this.maxEvents),
      suggestions: state.suggestions.slice(-this.maxSuggestions),
      lastSampleAt: Number(state.lastSampleAt) || 0
    };
  }

  persist() {
    this.storage.setItem(this.key, JSON.stringify(this.state));
  }

  refreshState() {
    const lastSampleAt = this.state.lastSampleAt;
    const latest = this.readState();
    this.state.events = latest.events;
    this.state.suggestions = latest.suggestions;
    this.state.lastSampleAt = Math.max(lastSampleAt, latest.lastSampleAt);
  }

  record(type, detail = {}) {
    if (typeof type !== 'string' || !/^[a-z][a-z0-9_.-]{1,63}$/i.test(type)) {
      throw new TypeError('Game Ops event type must be a short identifier.');
    }
    this.refreshState();
    const event = {
      id: `${this.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(this.now()).toISOString(),
      type,
      detail: JSON.parse(JSON.stringify(detail))
    };
    this.state.events.push(event);
    this.state.events = this.state.events.slice(-this.maxEvents);
    this.persist();
    return event;
  }

  observeTelemetry(telemetry) {
    if (!telemetry || typeof telemetry !== 'object') return [];
    const suggestions = [];
    const fps = Number(telemetry.fps);
    if (Number.isFinite(fps) && fps > 0 && fps < 30) {
      this.lowFpsSamples += 1;
      if (this.lowFpsSamples === 3) {
        this.record('performance.low_fps', {
          fps,
          area: telemetry.level ?? null,
          distanceMeters: telemetry.distanceMeters ?? null
        });
      }
    } else {
      this.lowFpsSamples = 0;
    }

    const now = this.now();
    if (now - this.state.lastSampleAt >= 60_000) {
      this.record('telemetry.sample', {
        fps: Number.isFinite(fps) ? fps : null,
        distanceMeters: Number(telemetry.distanceMeters) || 0,
        level: telemetry.level ?? null,
        hearts: telemetry.hearts ?? null,
        weather: telemetry.runnerWeather || 'unknown',
        obstacleCount: Number(telemetry.runnerObstacleCount) || 0,
        trafficCount: Number(telemetry.runnerTrafficCount) || 0,
        runState: telemetry.isGameOver ? 'ended' : telemetry.isPaused ? 'paused' : 'active'
      });
      this.state.lastSampleAt = now;
      this.persist();
    }
    suggestions.push(...this.analyze());
    return suggestions;
  }

  analyze() {
    this.refreshState();
    const cutoff = this.now() - DAY_MS;
    const recent = this.state.events.filter(event => Date.parse(event.timestamp) >= cutoff);
    const findings = [];
    const lowFpsCount = recent.filter(event => event.type === 'performance.low_fps').length;
    if (lowFpsCount >= 2) {
      findings.push({
        id: 'repeated-low-fps',
        category: 'Performance',
        title: 'Repeated low frame rate detected',
        detail: `${lowFpsCount} low-FPS episodes were recorded in the last 24 hours. Compare affected devices and route sections.`,
        source: 'telemetry'
      });
    }

    const crashes = recent.filter(event => event.type === 'runner.crash');
    const crashCounts = new Map();
    crashes.forEach(event => {
      const reason = String(event.detail?.reason || 'Unknown hazard');
      crashCounts.set(reason, (crashCounts.get(reason) || 0) + 1);
    });
    crashCounts.forEach((count, reason) => {
      if (count >= 3) {
        findings.push({
          id: `repeat-crash-${this.slug(reason)}`,
          category: 'Gameplay fairness',
          title: `Repeated run losses: ${reason}`,
          detail: `${count} losses were recorded in the last 24 hours. Review warning time, visibility, and lane fairness before changing difficulty.`,
          source: 'telemetry'
        });
      }
    });

    recent.filter(event => event.type === 'developer.feedback').forEach(event => {
      const text = `${event.detail?.category || ''} ${event.detail?.message || ''}`;
      KNOWN_FEEDBACK_RULES.forEach(rule => {
        if (rule.pattern.test(text)) {
          findings.push({
            id: `feedback-${rule.id}`,
            category: 'Feedback',
            title: rule.title,
            detail: rule.detail,
            source: 'developer feedback'
          });
        }
      });
    });

    const failedChecks = recent.filter(event =>
      event.type === 'check.result' && event.detail?.status === 'failed'
    );
    if (failedChecks.length) {
      const names = [...new Set(failedChecks.map(event => event.detail.name))];
      findings.push({
        id: 'failed-automated-checks',
        category: 'Build & QA',
        title: 'Review failed automated checks',
        detail: `${failedChecks.length} failed check${failedChecks.length === 1 ? '' : 's'} recorded in the last 24 hours: ${names.join(', ')}.`,
        source: 'CI report'
      });
    }

    const added = [];
    findings.forEach(finding => {
      const exists = [...this.state.suggestions, ...added].some(item =>
        item.id === finding.id && this.now() - Date.parse(item.firstSeenAt) < DAY_MS
      );
      if (exists) return;
      const suggestion = { ...finding, firstSeenAt: new Date(this.now()).toISOString(), status: 'needs-review' };
      this.record('suggestion.created', { id: suggestion.id, category: suggestion.category });
      added.push(suggestion);
    });
    if (added.length) {
      this.refreshState();
      this.state.suggestions.push(...added);
    }
    if (added.length || this.state.suggestions.length > this.maxSuggestions) {
      this.state.suggestions = this.state.suggestions.slice(-this.maxSuggestions);
      this.persist();
    }
    return added;
  }

  addFeedback({ category = 'Suggestion', message } = {}) {
    if (typeof message !== 'string' || !message.trim()) {
      throw new TypeError('Feedback message is required.');
    }
    const note = {
      category: String(category).slice(0, 80),
      message: message.trim().slice(0, 2000)
    };
    this.record('developer.feedback', note);
    return this.analyze();
  }

  recordCrash({ reason, obstacleType, distanceMeters, area } = {}) {
    return this.record('runner.crash', {
      reason: String(reason || 'Unknown hazard').slice(0, 120),
      obstacleType: obstacleType ? String(obstacleType).slice(0, 80) : null,
      distanceMeters: Number.isFinite(Number(distanceMeters)) ? Number(distanceMeters) : null,
      area: area ?? null
    });
  }

  recordCheckResult({ name, status, summary } = {}) {
    if (!['passed', 'failed', 'warning'].includes(status)) {
      throw new TypeError('Check status must be passed, failed, or warning.');
    }
    return this.record('check.result', {
      name: String(name || 'Game Ops check').slice(0, 120),
      status,
      summary: String(summary || '').slice(0, 1000)
    });
  }

  importCIReport(report, { source = 'test_results.json' } = {}) {
    if (!report || typeof report !== 'object' ||
        typeof report.timestamp !== 'string' || !Number.isFinite(Date.parse(report.timestamp)) ||
        !Array.isArray(report.results) || report.results.length === 0 ||
        report.results.length > 1000) {
      throw new TypeError('CI report must include a valid timestamp and between 1 and 1000 test results.');
    }
    const results = report.results.map(result => {
      if (!result || typeof result !== 'object' ||
          typeof result.id !== 'string' || !result.id.trim() ||
          typeof result.name !== 'string' || !result.name.trim() ||
          !['PASSED', 'FAILED', 'SKIPPED'].includes(result.status)) {
        throw new TypeError('Every CI test result must include an id, name, and supported status.');
      }
      return result;
    });

    this.refreshState();
    if (this.state.events.some(event =>
      event.type === 'ci.report.imported' && event.detail?.timestamp === report.timestamp
    )) {
      throw new Error('This CI report has already been imported.');
    }
    const counts = results.reduce((total, result) => {
      total[result.status] += 1;
      return total;
    }, { PASSED: 0, FAILED: 0, SKIPPED: 0 });
    const reportSource = String(source).slice(0, 160);
    this.record('ci.report.imported', {
      timestamp: report.timestamp,
      source: reportSource,
      total: results.length,
      passed: counts.PASSED,
      failed: counts.FAILED,
      skipped: counts.SKIPPED
    });
    results.forEach(result => {
      const status = result.status === 'PASSED'
        ? 'passed'
        : result.status === 'FAILED' ? 'failed' : 'warning';
      this.recordCheckResult({
        name: `${result.id}: ${result.name}`,
        status,
        summary: result.details || ''
      });
    });
    this.analyze();
    return counts;
  }

  updateSuggestion(id, status) {
    if (!['accepted', 'dismissed', 'implemented'].includes(status)) {
      throw new TypeError('Suggestion status is invalid.');
    }
    this.refreshState();
    if (!this.state.suggestions.some(item => item.id === id)) return false;
    this.record('suggestion.updated', { id, status });
    this.refreshState();
    const suggestion = this.state.suggestions.find(item => item.id === id);
    if (!suggestion) return false;
    suggestion.status = status;
    suggestion.updatedAt = new Date(this.now()).toISOString();
    this.persist();
    return true;
  }

  async publishAggregate(aggregate) {
    if (!this.analyticsConsent || typeof this.aggregateTransport !== 'function') return false;
    if (!aggregate || typeof aggregate !== 'object') {
      throw new TypeError('An aggregate object is required.');
    }
    await this.aggregateTransport(JSON.parse(JSON.stringify(aggregate)));
    this.record('analytics.aggregate_sent', { consented: true });
    return true;
  }

  exportData() {
    return JSON.parse(JSON.stringify({
      exportedAt: new Date(this.now()).toISOString(),
      scope: 'local Game Ops audit data',
      ...this.state
    }));
  }

  slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  }
}
