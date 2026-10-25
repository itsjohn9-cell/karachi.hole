import { PortableGameOpsEngine } from './game-ops-engine.js';

const TELEMETRY_KEY = 'karachi_mastermode_telemetry';
const COMMAND_KEY = 'karachi_mastermode_cmd';
const FEEDBACK_KEY = 'karachi_dev_flight_recorder';
const AUDIT_KEY = 'karachi_ai_audit_log';
const ROUTE_DISTANCE_METERS = 20000;
const AREAS = {
  1: 'Soldier Bazar · PECHS',
  2: 'Lyari',
  3: 'Saddar'
};
const WEATHER = {
  clear: 'Clear',
  rain: 'Monsoon rain',
  potholes: 'Rain-softened potholes',
  'n/a': '—'
};

class RunnerOpsConsole {
  constructor() {
    this.channel = null;
    this.lastTelemetry = null;
    this.lastPingAt = 0;
    this.activeTab = 'runner-controls';
    this.opsEngine = null;
    this.opsStorageError = null;
    this.initializeOpsEngine();
    this.initCommunication();
    this.initControls();
    this.initTabs();
    this.renderHistory();
    this.renderFeedback();
    this.startHeartbeat();
  }

  initCommunication() {
    try {
      this.channel = new BroadcastChannel('karachi_hole_mastermode');
      this.channel.addEventListener('message', event => this.handleMessage(event.data));
    } catch (error) {
      console.warn('[RUNNER_CONSOLE] BroadcastChannel unavailable; using same-origin storage events.', error);
    }

    window.addEventListener('storage', event => {
      if (event.key === TELEMETRY_KEY && event.newValue) {
        try {
          const message = JSON.parse(event.newValue);
          this.handleMessage(message);
        } catch (error) {
          console.error('[RUNNER_CONSOLE] Could not read live telemetry.', error);
          this.showToast('Live telemetry could not be read.');
        }
      } else if (event.key === 'portable-game-ops:v1') {
        this.initializeOpsEngine();
        try {
          this.opsEngine?.analyze();
          this.renderOpsBoard();
        } catch (error) {
          console.error('[RUNNER_CONSOLE] Could not analyze the updated operations ledger.', error);
          this.showToast('Could not refresh the Master Board.');
        }
      } else if (event.key === FEEDBACK_KEY || event.key === AUDIT_KEY) {
        this.renderHistory();
        this.renderFeedback();
      }
    });
  }

  initializeOpsEngine() {
    try {
      this.opsEngine = new PortableGameOpsEngine();
      this.opsStorageError = null;
    } catch (error) {
      this.opsEngine = null;
      this.opsStorageError = error;
      console.error('[RUNNER_CONSOLE] Local Game Ops ledger is unavailable.', error);
    }
  }

  recordOpsEvent(type, detail) {
    if (!this.opsEngine) {
      this.showToast('Local operations log is unavailable; check browser storage.');
      return;
    }
    try {
      this.opsEngine.record(type, detail);
      this.renderOpsBoard();
    } catch (error) {
      console.error('[RUNNER_CONSOLE] Could not write to the Game Ops ledger.', error);
      this.showToast('Could not write to the local operations log.');
    }
  }

  initControls() {
    document.querySelectorAll('[data-run-action]').forEach(button => {
      button.addEventListener('click', () => {
        if (!this.isRunReady()) {
          this.showToast('Start or resume a Runner session before using test actions.');
          return;
        }
        const commands = {
          'btn-runner-self-check': ['RUNNER_SELF_CHECK', {}, 'Live Runner self-check requested.'],
          'btn-runner-weather-rain': ['SET_RUNNER_RAIN', { enabled: true }, 'Monsoon rain test enabled.'],
          'btn-runner-weather-auto': ['SET_RUNNER_RAIN', { enabled: null }, 'Route weather restored.'],
          'btn-trigger-slingshot': ['TRIGGER_SLINGSHOT', {}, 'Slingshot test triggered.'],
          'btn-max-draft': ['MAX_DRAFT', {}, 'Draft charge set to ready.'],
          'btn-spawn-convoy': ['SPAWN_CONVOY', {}, 'Test convoy requested.']
        };
        const command = commands[button.id];
        if (!command) return;
        this.sendCommand(command[0], command[1]);
        this.recordOpsEvent('master.command', { command: command[0] });
        this.showToast(command[2]);
      });
    });

    document.getElementById('btn-spawn-test-obstacle')?.addEventListener('click', () => {
      if (!this.isRunReady()) {
        this.showToast('Start or resume a Runner session before spawning a test obstacle.');
        return;
      }
      const type = document.getElementById('ops-obstacle-type')?.value;
      const lane = Number(document.getElementById('ops-obstacle-lane')?.value);
      this.sendCommand('SPAWN_TEST_OBSTACLE', { type, lane });
      this.showToast('Test obstacle requested.');
    });
    document.getElementById('btn-clear-test-obstacles')?.addEventListener('click', () => {
      if (!this.isRunReady()) {
        this.showToast('Start or resume a Runner session before clearing test obstacles.');
        return;
      }
      this.sendCommand('CLEAR_TEST_OBSTACLES', {});
      this.showToast('Test obstacles cleared.');
    });
    const toggleButtons = {
      'btn-toggle-autorun': ['autoPilot', 'TOGGLE_AUTOPILOT', 'enabled', 'auto-run bot'],
      'btn-toggle-immortal': ['immortal', 'TOGGLE_IMMORTAL', 'immortal', 'invincibility']
    };
    Object.entries(toggleButtons).forEach(([id, [key, command, field, name]]) => {
      document.getElementById(id)?.addEventListener('click', () => {
        if (!this.isRunReady()) return;
        const enabled = !this.lastTelemetry?.[key];
        this.sendCommand(command, { [field]: enabled });
        this.recordOpsEvent('master.command', { command, enabled });
        this.showToast(`${name[0].toUpperCase()}${name.slice(1)} ${enabled ? 'enabled' : 'disabled'}.`);
      });
    });
    const simpleCommands = {
      'btn-clear-all-hazards': ['CLEAR_ALL_HAZARDS', 'Clearing all obstacles and traffic.'],
      'btn-complete-area': ['COMPLETE_RUNNER_AREA', 'Completing the current patrol area.'],
      'btn-complete-route': ['COMPLETE_RUNNER_ROUTE', 'Completing the full route.'],
      'btn-restore-hearts': ['RESTORE_RUNNER_HEARTS', 'Hearts restored.']
    };
    Object.entries(simpleCommands).forEach(([id, [command, message]]) => {
      document.getElementById(id)?.addEventListener('click', () => {
        if (!this.isRunReady()) return;
        this.sendCommand(command, {});
        this.recordOpsEvent('master.command', { command });
        this.showToast(message);
      });
    });
    document.getElementById('btn-spawn-junction')?.addEventListener('click', () => {
      if (!this.isRunReady()) return;
      const [kind, dir] = String(document.getElementById('ops-junction-type')?.value || 'turn-left').split('-');
      this.sendCommand('SPAWN_JUNCTION', { kind, dir });
      this.recordOpsEvent('master.command', { command: 'SPAWN_JUNCTION', kind, dir });
      this.showToast('Junction requested.');
    });
    document.getElementById('btn-set-speed')?.addEventListener('click', () => {
      if (!this.isRunReady()) return;
      const speedMult = Number(document.getElementById('ops-speed-mult')?.value) || 1;
      this.sendCommand('SET_SPEED', { speedMult });
      this.recordOpsEvent('master.command', { command: 'SET_SPEED', speedMult });
      this.showToast(`Run speed set to ${speedMult}x.`);
    });
    document.getElementById('btn-unlock-runner-content')?.addEventListener('click', () => {
      if (!this.lastTelemetry?.isRunnerMode) {
        this.showToast('Open the Runner game in another tab first.');
        return;
      }
      if (!window.confirm('Unlock all Runner areas and getups in this browser profile? This is saved to this device.')) return;
      this.sendCommand('UNLOCK_ALL_RUNNER_CONTENT', {});
      this.showToast('Test content unlock requested for this browser profile.');
    });
    document.getElementById('btn-trigger-audit')?.addEventListener('click', () => this.saveSnapshot());
    document.getElementById('btn-export-audit-json')?.addEventListener('click', () => this.exportReport('json'));
    document.getElementById('btn-export-audit-md')?.addEventListener('click', () => this.exportReport('md'));
    document.getElementById('btn-submit-dash-feedback')?.addEventListener('click', () => this.saveFeedback());
    document.getElementById('btn-import-ci-report')?.addEventListener('click', () => this.importCIReport());
    document.getElementById('btn-toggle-admin-consent')?.addEventListener('click', () => {
      if (!this.opsEngine) return;
      const current = this.opsEngine.isConsentPromptEnabled();
      this.opsEngine.setConsentPromptEnabled(!current);
      this.renderAdminConsentStatus();
      this.showToast(!current ? 'Consent prompt activated for game players.' : 'Consent prompt disabled and hidden.');
    });
    this.renderOpsBoard();
  }

  initTabs() {
    document.querySelectorAll('.god-tab-btn').forEach(button => {
      button.addEventListener('click', () => {
        this.activeTab = button.dataset.tab;
        document.querySelectorAll('.god-tab-btn').forEach(tab => {
          const selected = tab === button;
          tab.classList.toggle('active', selected);
          tab.setAttribute('aria-selected', String(selected));
        });
        document.querySelectorAll('.tab-pane').forEach(panel => {
          panel.classList.toggle('active', panel.id === `tab-${this.activeTab}`);
        });
      });
    });
  }

  startHeartbeat() {
    this.sendCommand('PING', {});
    window.setInterval(() => {
      this.sendCommand('PING', {});
      if (Date.now() - this.lastPingAt > 3500) {
        this.lastTelemetry = null;
        this.renderTelemetry(null);
      }
    }, 2000);
  }

  sendCommand(type, payload = {}) {
    const message = {
      type,
      payload,
      sender: 'MASTERMODE_DASHBOARD',
      timestamp: Date.now()
    };
    if (this.channel) {
      try {
        this.channel.postMessage(message);
        return;
      } catch (error) {
        console.error('[RUNNER_CONSOLE] Could not send command over BroadcastChannel.', error);
      }
    }
    try {
      localStorage.setItem(COMMAND_KEY, JSON.stringify(message));
    } catch (error) {
      console.error('[RUNNER_CONSOLE] Could not send command through browser storage.', error);
      this.showToast('Could not send command to the game tab.');
    }
  }

  handleMessage(message) {
    if (!message || !['PONG', 'TELEMETRY_UPDATE'].includes(message.type) || !message.telemetry) return;
    this.lastPingAt = Date.now();
    this.lastTelemetry = message.telemetry;
    this.renderTelemetry(this.lastTelemetry);
  }

  isRunReady() {
    const telemetry = this.lastTelemetry;
    return Boolean(telemetry?.isRunnerMode && telemetry.isGameStarted &&
      !telemetry.isPaused && !telemetry.isGameOver);
  }

  renderTelemetry(telemetry) {
    const connected = Boolean(telemetry);
    const pill = document.getElementById('connection-pill');
    const label = document.getElementById('connection-label');
    if (pill) pill.className = `connection-pill ${connected ? 'connected' : 'disconnected'}`;
    if (label) label.textContent = connected ? 'CONNECTED TO GAME TAB' : 'GAME TAB NOT CONNECTED';

    const setText = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };
    const runState = !connected ? 'Waiting for game' :
      !telemetry.isRunnerMode ? 'Runner mode not active' :
      telemetry.isGameOver ? 'Run ended' :
      telemetry.isPaused ? 'Run paused' :
      telemetry.isGameStarted ? 'Run active' : 'Runner ready';
    setText('console-run-state', runState);
    document.querySelectorAll('[data-run-action]').forEach(button => {
      button.disabled = !this.isRunReady();
      button.setAttribute('aria-disabled', String(button.disabled));
    });

    if (!connected || !telemetry.isRunnerMode) {
      [
        'stat-area', 'stat-neighborhood', 'stat-distance', 'stat-stage',
        'stat-difficulty', 'stat-score', 'stat-coins', 'stat-hearts',
        'stat-speed', 'stat-lane', 'stat-weather', 'stat-hazards',
        'stat-traffic', 'stat-powerup', 'stat-fps'
      ].forEach(id => setText(id, '—'));
      setText('stat-run-status', runState);
      return;
    }

    const distance = Math.max(0, Number(telemetry.distanceMeters) || 0);
    const speed = Number(telemetry.nascar?.speedKmh);
    setText('stat-area', AREAS[telemetry.level] || 'Karachi route');
    setText('stat-neighborhood', telemetry.runnerNeighborhoodName || telemetry.currentMilestone || 'Soldier Bazar');
    setText('stat-distance', `${Math.min(distance, ROUTE_DISTANCE_METERS).toLocaleString()} m`);
    setText('stat-stage', `${Math.max(0, ROUTE_DISTANCE_METERS - distance).toLocaleString()} m to finish`);
    setText('stat-difficulty', `Tier ${Number(telemetry.runnerChallengeTier) || 0}`);
    setText('stat-score', `${(Number(telemetry.score) || 0).toLocaleString()} pts`);
    setText('stat-coins', `${(Number(telemetry.coins) || 0).toLocaleString()} rupees`);
    setText('stat-hearts', `${Number(telemetry.hearts) || 0} / 3`);
    setText('stat-speed', Number.isFinite(speed) ? `${Math.round(speed)} km/h` : '—');
    setText('stat-lane', `Lane ${Math.min(3, Math.max(1, (Number(telemetry.currentLane) || 0) + 2))} / 3`);
    setText('stat-weather', WEATHER[telemetry.runnerWeather] || 'Unknown');
    setText('stat-hazards', `${Number(telemetry.runnerObstacleCount) || 0} hazards`);
    setText('stat-traffic', `${Number(telemetry.runnerTrafficCount) || 0} vehicles`);
    setText('stat-powerup', `Power-up: ${telemetry.activePowerUp || 'None'}`);
    setText('stat-fps', Number.isFinite(Number(telemetry.fps)) && Number(telemetry.fps) > 0
      ? `${Math.round(Number(telemetry.fps))} FPS`
      : '—');
    setText('stat-run-status', telemetry.runnerRouteComplete ? 'Loop complete' : runState);
    const autoRun = document.getElementById('btn-toggle-autorun');
    if (autoRun) {
      autoRun.textContent = telemetry.autoPilot ? 'Stop auto-run' : 'Start auto-run';
      autoRun.setAttribute('aria-pressed', String(Boolean(telemetry.autoPilot)));
    }
    const immortal = document.getElementById('btn-toggle-immortal');
    if (immortal) {
      immortal.textContent = telemetry.immortal ? 'Disable invincibility' : 'Enable invincibility';
      immortal.setAttribute('aria-pressed', String(Boolean(telemetry.immortal)));
    }
  }

  readStoredList(key) {
    const value = localStorage.getItem(key);
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new TypeError(`Stored ${key} data must be a list.`);
    return parsed;
  }

  saveSnapshot() {
    try {
      const audits = this.readStoredList(AUDIT_KEY);
      const telemetry = this.lastTelemetry;
      audits.push({
        id: `RUNNER-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: telemetry ? 'TELEMETRY_SNAPSHOT' : 'NO_LIVE_TELEMETRY',
        summary: telemetry
          ? `${Math.round(telemetry.distanceMeters || 0)} m · ${telemetry.runnerWeather || 'unknown weather'} · ${telemetry.hearts ?? '—'} hearts`
          : 'No connected game telemetry',
        telemetry: telemetry ? JSON.parse(JSON.stringify(telemetry)) : null
      });
      localStorage.setItem(AUDIT_KEY, JSON.stringify(audits.slice(-100)));
      this.recordOpsEvent('qa.snapshot_saved', {
        connected: Boolean(telemetry),
        distanceMeters: Number(telemetry?.distanceMeters) || 0
      });
      this.renderHistory();
      this.renderOpsBoard();
      this.showToast(telemetry ? 'Live Runner snapshot saved.' : 'Saved a snapshot noting no connected game.');
    } catch (error) {
      console.error('[RUNNER_CONSOLE] Could not save QA snapshot.', error);
      this.showToast('Could not save the QA snapshot in browser storage.');
    }
  }

  saveFeedback() {
    const input = document.getElementById('dash-feedback-input');
    const category = document.getElementById('dash-feedback-cat');
    const message = input?.value.trim();
    if (!message) {
      this.showToast('Enter a feedback note before saving.');
      return;
    }
    try {
      const notes = this.readStoredList(FEEDBACK_KEY);
      const note = {
        timestamp: new Date().toISOString(),
        category: category?.value || 'Suggestion',
        message,
        distanceMeters: this.lastTelemetry?.distanceMeters ?? null,
        level: this.lastTelemetry?.level ?? null
      };
      notes.push(note);
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(notes.slice(-100)));
      if (this.opsEngine) {
        const suggestions = this.opsEngine.addFeedback(note);
        if (suggestions.length) this.showToast('Feedback saved; a rule-based suggestion is ready for review.');
      }
      this.sendCommand('NEW_DEV_NOTE', {
        note: {
          category: 'CONSOLE_FEEDBACK',
          message,
          details: { category: note.category, source: 'RUNNER_CONSOLE' }
        }
      });
      if (input) input.value = '';
      this.renderFeedback();
      this.renderOpsBoard();
      this.showToast('Feedback note saved in this browser.');
    } catch (error) {
      console.error('[RUNNER_CONSOLE] Could not save feedback note.', error);
      this.showToast('Could not save feedback in browser storage.');
    }
  }

  renderHistory() {
    let audits;
    try {
      audits = this.readStoredList(AUDIT_KEY);
    } catch (error) {
      console.error('[RUNNER_CONSOLE] Could not read QA snapshots.', error);
      this.showToast('QA snapshot history could not be read.');
      return;
    }
    const list = document.getElementById('audit-history-list');
    if (!list) return;
    list.replaceChildren();
    if (!audits.length) {
      list.textContent = 'No snapshots saved yet.';
      return;
    }
    audits.slice().reverse().forEach(audit => {
      const item = document.createElement('article');
      item.className = 'console-history-item';
      const heading = document.createElement('strong');
      heading.textContent = audit.summary || 'Runner snapshot';
      const detail = document.createElement('span');
      detail.textContent = `${audit.status || 'Snapshot'} · ${audit.timestamp ? new Date(audit.timestamp).toLocaleString() : 'Time unavailable'}`;
      item.append(heading, detail);
      list.append(item);
    });
  }

  renderFeedback() {
    let notes;
    try {
      notes = this.readStoredList(FEEDBACK_KEY);
    } catch (error) {
      console.error('[RUNNER_CONSOLE] Could not read feedback notes.', error);
      this.showToast('Feedback notes could not be read.');
      return;
    }
    const badge = document.getElementById('dash-feedback-count');
    const list = document.getElementById('dash-feedback-list');
    if (badge) badge.textContent = `${notes.length} saved ${notes.length === 1 ? 'note' : 'notes'}`;
    if (!list) return;
    list.replaceChildren();
    if (!notes.length) {
      list.textContent = 'No feedback notes saved yet.';
      return;
    }
    notes.slice().reverse().forEach(note => {
      const item = document.createElement('article');
      item.className = 'console-history-item';
      const heading = document.createElement('strong');
      heading.textContent = `${note.category || 'Feedback'}${Number.isFinite(note.distanceMeters) ? ` · ${Math.round(note.distanceMeters)} m` : ''}`;
      const detail = document.createElement('span');
      detail.textContent = `${note.message || ''} · ${note.timestamp ? new Date(note.timestamp).toLocaleString() : 'Time unavailable'}`;
      item.append(heading, detail);
      list.append(item);
    });
  }

  renderOpsBoard() {
    const eventList = document.getElementById('ops-event-list');
    const suggestionList = document.getElementById('ops-suggestion-list');
    if (!eventList || !suggestionList) return;
    const boardStatus = document.getElementById('ops-board-status');
    if (!this.opsEngine) {
      if (boardStatus) boardStatus.textContent = 'Local ledger unavailable: browser storage could not be read or written.';
      eventList.textContent = 'The operations ledger is unavailable. Exported logs cannot be saved in this browser.';
      suggestionList.textContent = this.opsStorageError?.message || 'Repair browser storage before using the local Master Board.';
      return;
    }
    if (boardStatus) boardStatus.textContent = 'Local history is stored in this browser profile.';
    const renderItems = (container, items, emptyText, createItem) => {
      container.replaceChildren();
      if (!items.length) {
        container.textContent = emptyText;
        return;
      }
      items.slice().reverse().forEach(item => container.append(createItem(item)));
    };
    renderItems(eventList, this.opsEngine.state.events, 'No operations recorded yet.', event => {
      const item = document.createElement('article');
      item.className = 'console-history-item';
      const heading = document.createElement('strong');
      heading.textContent = event.type.replaceAll('.', ' · ');
      const detail = document.createElement('span');
      detail.textContent = `${JSON.stringify(event.detail)} · ${new Date(event.timestamp).toLocaleString()}`;
      item.append(heading, detail);
      return item;
    });
    renderItems(
      suggestionList,
      this.opsEngine.state.suggestions.filter(item => item.status === 'needs-review'),
      'No outstanding suggestions. New findings appear here for review.',
      suggestion => {
        const item = document.createElement('article');
        item.className = 'console-history-item';
        const heading = document.createElement('strong');
        heading.textContent = `${suggestion.category}: ${suggestion.title}`;
        const detail = document.createElement('span');
        detail.textContent = `${suggestion.detail} · ${suggestion.source}`;
        const actions = document.createElement('div');
        actions.className = 'console-history-actions';
        [['accepted', 'Accept for review'], ['dismissed', 'Dismiss']].forEach(([status, label]) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = label;
          button.addEventListener('click', () => {
            try {
              this.opsEngine.updateSuggestion(suggestion.id, status);
              this.renderOpsBoard();
            } catch (error) {
              console.error('[RUNNER_CONSOLE] Could not update suggestion status.', error);
              this.showToast('Could not update the suggestion.');
            }
          });
          actions.append(button);
        });
        item.append(heading, detail, actions);
        return item;
      }
    );
    this.renderAdminConsentStatus();
  }

  renderAdminConsentStatus() {
    const btn = document.getElementById('btn-toggle-admin-consent');
    const badge = document.getElementById('admin-consent-status-badge');
    if (!btn || !badge) return;
    const enabled = this.opsEngine?.isConsentPromptEnabled() || false;
    if (enabled) {
      badge.textContent = 'ENABLED (ACTIVE)';
      badge.style.background = 'rgba(34, 197, 94, 0.2)';
      badge.style.color = '#4ade80';
      badge.style.borderColor = 'rgba(34, 197, 94, 0.4)';
      btn.textContent = 'Disable for Players';
      btn.classList.remove('btn-cyan');
      btn.classList.add('btn-amber');
    } else {
      badge.textContent = 'DISABLED (HIDDEN)';
      badge.style.background = 'rgba(239, 68, 68, 0.2)';
      badge.style.color = '#f87171';
      badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      btn.textContent = 'Enable for Players';
      btn.classList.remove('btn-amber');
      btn.classList.add('btn-cyan');
    }
  }

  async importCIReport() {
    const input = document.getElementById('ops-ci-report-file');
    const file = input?.files?.[0];
    if (!file) {
      this.showToast('Choose a test_results.json file first.');
      return;
    }
    if (!this.opsEngine) {
      this.showToast('Local operations log is unavailable; the CI report was not imported.');
      return;
    }
    try {
      const report = JSON.parse(await file.text());
      const counts = this.opsEngine.importCIReport(report, { source: file.name });
      this.renderOpsBoard();
      this.showToast(
        `CI report imported: ${counts.PASSED} passed, ${counts.FAILED} failed, ${counts.SKIPPED} skipped.`
      );
    } catch (error) {
      console.error('[RUNNER_CONSOLE] Could not import the CI report.', error);
      this.showToast(error instanceof SyntaxError
        ? 'The selected CI report is not valid JSON.'
        : error.message || 'The CI report could not be imported.');
    } finally {
      input.value = '';
    }
  }

  exportReport(format) {
    try {
      const audits = this.readStoredList(AUDIT_KEY);
      const feedback = this.readStoredList(FEEDBACK_KEY);
      const report = {
        exportedAt: new Date().toISOString(),
        scope: 'Browser-local Runner developer console',
        currentTelemetry: this.lastTelemetry,
        snapshots: audits,
        feedback,
        gameOps: this.opsEngine?.exportData() || null
      };
      const isJson = format === 'json';
      const content = isJson
        ? JSON.stringify(report, null, 2)
        : `# KARACHI RUNNER QA report\n\nExported: ${report.exportedAt}\n\nSnapshots: ${audits.length}\nFeedback notes: ${feedback.length}\n\nAutomated test and release status are not inferred from telemetry snapshots. Run \`npm test\` for the regression suite.\n`;
      const blob = new Blob([content], { type: isJson ? 'application/json' : 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `karachi-runner-${isJson ? 'qa.json' : 'qa.md'}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[RUNNER_CONSOLE] Could not export QA report.', error);
      this.showToast('Could not export the QA report.');
    }
  }

  showToast(message) {
    const toast = document.getElementById('console-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.masterMode = new RunnerOpsConsole();
  window.godMode = window.masterMode;
});
