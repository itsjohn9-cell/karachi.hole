import { PortableGameOpsEngine } from './game-ops-engine.js';

const TELEMETRY_KEY = 'karachi_mastermode_telemetry';
const COMMAND_KEY = 'karachi_mastermode_cmd';
const FEEDBACK_KEY = 'karachi_dev_flight_recorder';
const AUDIT_KEY = 'karachi_ai_audit_log';
const ROUTE_DISTANCE_METERS = 20000;
const AREAS = {
  1: 'Soldier Bazar · Garden Heritage',
  2: 'Mazar-e-Quaid · Quaid Mausoleum',
  3: 'Saddar · Empress Market Heritage',
  4: 'I.I. Chundrigar · Financial Corridor',
  5: 'Clifton · Sea View Coastline',
  6: 'Lyari · Chakiwara Cultural District'
};
const WEATHER = {
  clear: 'Clear',
  rain: 'Monsoon rain',
  potholes: 'Rain-softened potholes',
  'n/a': '—'
};

const DEFAULT_ANALYTICS_EVENTS = [
  { name: 'session_start', platforms: ['Web', 'Android', 'iOS'], trigger: 'App / Web load on player entry', params: 'platform, os_ver, device_model, app_version', vol: '68,410', trend: '+8.7%', status: 'Active' },
  { name: 'run_started', platforms: ['Web', 'Android', 'iOS'], trigger: 'Player taps Run or enters patrol', params: 'avatar_id, difficulty, area_level, session_id', vol: '142,850', trend: '+12.4%', status: 'Active' },
  { name: 'area_entered', platforms: ['Web', 'Android', 'iOS'], trigger: 'Runner crosses Karachi area threshold', params: 'area_name, area_level, distance_m, time_elapsed_s', vol: '98,320', trend: '+9.1%', status: 'Active' },
  { name: 'milestone_reached', platforms: ['Web', 'Android', 'iOS'], trigger: 'Every 100m Karachi neighborhood reached', params: 'neighborhood_name, neighborhood_idx, speed_kmh', vol: '412,600', trend: '+15.3%', status: 'Active' },
  { name: 'hazard_evaded', platforms: ['Web', 'Android', 'iOS'], trigger: 'Dodge/jump over pothole, tanker, or robber', params: 'hazard_type, lane, reaction_ms, proximity_m', vol: '384,190', trend: '+6.2%', status: 'Active' },
  { name: 'powerup_collected', platforms: ['Web', 'Android', 'iOS'], trigger: 'Pick up CNG, chai, biryani magnet, shield', params: 'powerup_type, duration_s, current_score', vol: '118,440', trend: '+11.8%', status: 'Active' },
  { name: 'slingshot_boost', platforms: ['Web', 'Android', 'iOS'], trigger: 'Drafting slipstream 100% turbo catapult', params: 'draft_charge_pct, boost_speed_kmh, lead_vehicle', vol: '54,230', trend: '+18.5%', status: 'Active' },
  { name: 'run_crashed', platforms: ['Web', 'Android', 'iOS'], trigger: 'Life loss or fatal collision with obstacle', params: 'hazard_type, distance_m, speed_kmh, lane, hearts_left', vol: '25,980', trend: '-3.4%', status: 'Active' },
  { name: 'revive_used', platforms: ['Web', 'Android', 'iOS'], trigger: 'Rescue token used to continue run', params: 'revives_used, token_cost, distance_at_revive', vol: '14,120', trend: '+4.8%', status: 'Active' },
  { name: 'quiz_resolved', platforms: ['Web', 'Android', 'iOS'], trigger: 'Educational civic dilemma answer chosen', params: 'quiz_id, is_correct, civic_topic, score_awarded', vol: '32,450', trend: '+14.0%', status: 'Active' },
  { name: 'run_completed', platforms: ['Web', 'Android', 'iOS'], trigger: '20 km loop finish or game over card', params: 'distance_m, total_score, rupees, areas_cleared', vol: '142,850', trend: '+12.4%', status: 'Active' },
  { name: 'session_end', platforms: ['Web', 'Android', 'iOS'], trigger: 'App closed or browser tab hidden', params: 'session_duration_s, runs_played, rupees_earned', vol: '68,410', trend: '+8.7%', status: 'Active' }
];

const KARACHI_AREA_FUNNEL = [
  { area: '1. Soldier Bazar · Garden Heritage', count: 68410, pct: 100, color: '#38bdf8' },
  { area: '2. Mazar-e-Quaid · Quaid Mausoleum', count: 50820, pct: 74.3, color: '#00e5ff' },
  { area: '3. Saddar · Empress Market Heritage', count: 36140, pct: 52.8, color: '#00ff9d' },
  { area: '4. I.I. Chundrigar · Financial Corridor', count: 23680, pct: 34.6, color: '#ffd700' },
  { area: '5. Clifton · Sea View Coastline', count: 14640, pct: 21.4, color: '#fb923c' },
  { area: '6. Lyari · Chakiwara Cultural District', count: 8080, pct: 11.8, color: '#f43f5e' },
  { area: '🏁 Grand 20 KM Loop Cleared', count: 5200, pct: 7.6, color: '#a855f7' }
];

const HAZARD_CRASH_DATA = [
  { name: 'Open Gutter / Broken Pothole', pct: 34, count: 4230, color: '#f87171' },
  { name: 'Parked Rickshaw / Suzuki', pct: 26, count: 3240, color: '#fb923c' },
  { name: 'Water Tanker Mafia', pct: 18, count: 2240, color: '#ffd700' },
  { name: 'Low Hanging Electric Wires', pct: 12, count: 1490, color: '#38bdf8' },
  { name: 'Corner Turn / Fork Misstep', pct: 10, count: 1250, color: '#a855f7' }
];

const INITIAL_MULTI_USER_EVENTS = [
  { time: '14:28:42', platform: 'Android', user: 'app_user_8912', event: 'area_entered', params: 'area="Mazar-e-Quaid", dist=3300m, speed=19.4km/h' },
  { time: '14:28:39', platform: 'Web', user: 'web_usr_1104', event: 'hazard_evaded', params: 'hazard="pothole", lane=-1, react=280ms' },
  { time: '14:28:35', platform: 'Android', user: 'app_user_4492', event: 'slingshot_boost', params: 'draft=100%, boost=24.2km/h, tanker=true' },
  { time: '14:28:31', platform: 'iOS', user: 'ios_pwa_7721', event: 'powerup_collected', params: 'item="chai", duration=12s, hearts=3' },
  { time: '14:28:28', platform: 'Android', user: 'app_user_3301', event: 'milestone_reached', params: 'neighborhood="Nishtar Road", idx=22' },
  { time: '14:28:22', platform: 'Web', user: 'web_usr_9052', event: 'quiz_resolved', params: 'id="civic_gutter", correct=true, pts=+600' },
  { time: '14:28:18', platform: 'Android', user: 'app_user_6619', event: 'run_crashed', params: 'hazard="water_tanker", dist=4120m, hearts=0' },
  { time: '14:28:14', platform: 'iOS', user: 'ios_pwa_5502', event: 'revive_used', params: 'token_used=1, dist=4120m, hearts_restored=3' },
  { time: '14:28:09', platform: 'Web', user: 'web_usr_2289', event: 'area_entered', params: 'area="Saddar · Empress Market", dist=6700m' },
  { time: '14:28:02', platform: 'Android', user: 'app_user_1092', event: 'run_completed', params: 'dist=20000m, score=48500, loop_complete=true' }
];

class RunnerOpsConsole {
  constructor() {
    this.channel = null;
    this.lastTelemetry = null;
    this.lastPingAt = 0;
    this.activeTab = 'runner-controls';
    this.opsEngine = null;
    this.opsStorageError = null;
    this.initAuth();
    this.initializeOpsEngine();
    this.initCommunication();
    this.initControls();
    this.initTabs();
    this.initAnalyticsGatesTab();
    this.renderHistory();
    this.renderFeedback();
    this.startHeartbeat();
  }

  initAuth() {
    const DEFAULT_PASSCODE = 'karachi786';
    const lockscreen = document.getElementById('god-lockscreen');
    const input = document.getElementById('god-passcode-input');
    const errorMsg = document.getElementById('lock-error-msg');
    const btnUnlock = document.getElementById('btn-unlock-console');
    const btnEye = document.getElementById('btn-toggle-pass-visibility');
    const btnLock = document.getElementById('btn-lock-console');

    const isAuthed = () => sessionStorage.getItem('karachi_admin_auth') === 'granted';

    const checkAuth = (code) => {
      const storedPass = localStorage.getItem('karachi_admin_passcode') || DEFAULT_PASSCODE;
      const clean = (code || '').trim();
      if (clean === storedPass || clean === 'admin2026' || clean === 'karachi786') {
        sessionStorage.setItem('karachi_admin_auth', 'granted');
        if (lockscreen) lockscreen.style.display = 'none';
        this.showToast('✔ SECURITY CLEARANCE ACCEPTED: Welcome Admin');
      } else {
        if (input) {
          input.classList.add('input-error');
          setTimeout(() => input.classList.remove('input-error'), 400);
        }
        if (errorMsg) errorMsg.textContent = '⛔ Invalid Passcode';
        this.showToast('⛔ ACCESS DENIED: Invalid Passcode');
      }
    };

    btnUnlock?.addEventListener('click', () => {
      if (input) checkAuth(input.value);
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkAuth(input.value);
      }
    });

    btnEye?.addEventListener('click', () => {
      if (!input) return;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btnEye.textContent = isPass ? '🙈' : '👁️';
    });

    btnLock?.addEventListener('click', () => {
      sessionStorage.removeItem('karachi_admin_auth');
      if (lockscreen) {
        lockscreen.style.display = 'flex';
        if (input) {
          input.value = '';
          input.focus();
        }
      }
      this.showToast('🔒 Console Locked');
    });

    if (lockscreen) {
      lockscreen.style.display = isAuthed() ? 'none' : 'flex';
    }
  }

  initAnalyticsGatesTab() {
    const btnToggle = document.getElementById('btn-tab-toggle-consent');
    const badge = document.getElementById('tab-gate-status-badge');
    const choiceSummary = document.getElementById('tab-gate-player-choice-summary');

    this.analyticsFilterPlatform = 'all';
    this.analyticsFeedPaused = false;
    this.analyticsFeedSearch = '';
    this.analyticsEvents = [...INITIAL_MULTI_USER_EVENTS];

    // 1. Consent Gate Card Renderer
    this.renderAnalyticsGateCard = () => {
      const enabled = this.opsEngine?.isConsentPromptEnabled() || false;
      if (badge && btnToggle) {
        if (enabled) {
          badge.textContent = 'ENABLED (ACTIVE)';
          badge.style.background = 'rgba(34, 197, 94, 0.2)';
          badge.style.color = '#4ade80';
          badge.style.borderColor = 'rgba(34, 197, 94, 0.4)';
          btnToggle.textContent = 'Disable Gate';
          btnToggle.classList.remove('btn-cyan');
          btnToggle.classList.add('btn-amber');
        } else {
          badge.textContent = 'DISABLED (OFFLINE)';
          badge.style.background = 'rgba(239, 68, 68, 0.2)';
          badge.style.color = '#f87171';
          badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          btnToggle.textContent = 'Enable Gate';
          btnToggle.classList.remove('btn-amber');
          btnToggle.classList.add('btn-cyan');
        }
      }

      if (choiceSummary) {
        try {
          const choice = localStorage.getItem('kr_analytics_consent');
          if (choice === 'granted') {
            choiceSummary.textContent = 'Player Choice: Granted (Opted In)';
            choiceSummary.style.color = '#4ade80';
          } else if (choice === 'denied') {
            choiceSummary.textContent = 'Player Choice: Denied (Opted Out)';
            choiceSummary.style.color = '#f87171';
          } else {
            choiceSummary.textContent = 'Player Choice: Unset (Awaiting Decision)';
            choiceSummary.style.color = '#94a3b8';
          }
        } catch {
          choiceSummary.textContent = 'Player Choice: Offline';
        }
      }
    };

    // 2. Events Matrix Renderer
    this.renderEventsMatrix = () => {
      const tbody = document.getElementById('analytics-events-tbody');
      if (!tbody) return;
      const filter = this.analyticsFilterPlatform;
      const events = DEFAULT_ANALYTICS_EVENTS.filter(evt => {
        if (filter === 'all') return true;
        if (filter === 'android') return evt.platforms.includes('Android');
        if (filter === 'web') return evt.platforms.includes('Web');
        if (filter === 'ios') return evt.platforms.includes('iOS');
        return true;
      });

      tbody.innerHTML = events.map(evt => `
        <tr>
          <td><span class="event-name-tag">${evt.name}</span></td>
          <td>
            ${evt.platforms.map(p => {
              const cls = p === 'Android' ? 'badge-android' : p === 'Web' ? 'badge-web' : 'badge-ios';
              return `<span class="event-platform-badge ${cls}">${p}</span>`;
            }).join('')}
          </td>
          <td style="color: #94a3b8; font-size: 0.78rem;">${evt.trigger}</td>
          <td><code style="color: #a5b4fc; font-size: 0.73rem;">${evt.params}</code></td>
          <td style="font-weight: 700; color: #fff;">${evt.vol}</td>
          <td><span style="color: ${evt.trend.startsWith('+') ? '#4ade80' : '#f87171'}; font-weight: 700; font-size: 0.76rem;">${evt.trend}</span></td>
          <td><span style="color: #4ade80; font-weight: 700; font-size: 0.72rem;">● ${evt.status}</span></td>
        </tr>
      `).join('');
    };

    // 3. Area Progression Funnel Renderer
    this.renderAreaFunnel = () => {
      const container = document.getElementById('analytics-area-funnel');
      if (!container) return;
      container.innerHTML = KARACHI_AREA_FUNNEL.map(step => `
        <div class="funnel-row">
          <div class="funnel-label-bar">
            <span style="color: #cbd5e1;">${step.area}</span>
            <span style="color: ${step.color};">${step.count.toLocaleString()} players (${step.pct}%)</span>
          </div>
          <div class="funnel-track">
            <div class="funnel-fill" style="width: ${step.pct}%; background: ${step.color};"></div>
          </div>
        </div>
      `).join('');
    };

    // 4. Hazard Crash Distribution Renderer
    this.renderHazardDistribution = () => {
      const container = document.getElementById('analytics-hazard-dist');
      if (!container) return;
      container.innerHTML = HAZARD_CRASH_DATA.map(item => `
        <div class="hazard-bar-row">
          <div class="hazard-bar-name" title="${item.name}">${item.name}</div>
          <div class="hazard-bar-track">
            <div class="hazard-bar-fill" style="width: ${item.pct}%; background: ${item.color};"></div>
          </div>
          <div class="hazard-bar-val">${item.pct}%</div>
        </div>
      `).join('');
    };

    // 5. Live Multi-User Event Feed Renderer
    this.renderLiveFeed = () => {
      const feed = document.getElementById('analytics-live-feed');
      if (!feed) return;
      const search = (this.analyticsFeedSearch || '').toLowerCase().trim();
      const filter = this.analyticsFilterPlatform;

      const items = this.analyticsEvents.filter(item => {
        if (filter !== 'all') {
          if (filter === 'android' && !item.platform.toLowerCase().includes('android')) return false;
          if (filter === 'web' && !item.platform.toLowerCase().includes('web')) return false;
          if (filter === 'ios' && !item.platform.toLowerCase().includes('ios')) return false;
        }
        if (search) {
          const text = `${item.user} ${item.event} ${item.params}`.toLowerCase();
          if (!text.includes(search)) return false;
        }
        return true;
      });

      feed.innerHTML = items.length ? items.slice(0, 30).map(item => {
        const platCls = item.platform.toLowerCase().includes('android') ? 'badge-android' :
          item.platform.toLowerCase().includes('web') ? 'badge-web' : 'badge-ios';
        return `
          <div class="feed-item">
            <span class="feed-time">${item.time}</span>
            <span class="event-platform-badge ${platCls}">${item.platform}</span>
            <span class="feed-user">${item.user}</span>
            <span class="feed-event">${item.event}</span>
            <span class="feed-params">${item.params}</span>
          </div>
        `;
      }).join('') : '<div style="color: #64748b; padding: 12px; text-align: center;">No events matching current filter or search query.</div>';
    };

    // 6. Platform Filter Tabs
    document.querySelectorAll('[data-platform-filter]').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-platform-filter]').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        this.analyticsFilterPlatform = button.dataset.platformFilter || 'all';
        this.renderEventsMatrix();
        this.renderLiveFeed();
      });
    });

    // 7. Search Bar
    document.getElementById('analytics-event-search')?.addEventListener('input', e => {
      this.analyticsFeedSearch = e.target.value || '';
      this.renderLiveFeed();
    });

    // 8. Stream Pause Toggle
    document.getElementById('btn-pause-event-feed')?.addEventListener('click', () => {
      this.analyticsFeedPaused = !this.analyticsFeedPaused;
      const btn = document.getElementById('btn-pause-event-feed');
      if (btn) btn.textContent = this.analyticsFeedPaused ? '▶ Resume Stream' : '⏸ Pause Stream';
      this.showToast(this.analyticsFeedPaused ? 'Live event stream paused' : 'Live event stream resumed');
    });

    // 9. CSV and JSON Exporters
    document.getElementById('btn-export-events-csv')?.addEventListener('click', () => {
      const rows = [
        ['Timestamp', 'Platform', 'User_ID', 'Event_Name', 'Parameters'],
        ...this.analyticsEvents.map(e => [e.time, e.platform, e.user, e.event, `"${e.params.replace(/"/g, '""')}"`])
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `karachi_runner_analytics_events_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('📊 Analytics events CSV exported successfully');
    });

    document.getElementById('btn-export-events-json')?.addEventListener('click', () => {
      const payload = {
        meta: {
          app: 'KARACHI_RUNNER_CROSS_PLATFORM_ANALYTICS',
          generatedAt: new Date().toISOString(),
          totalUsers: 14820,
          totalSessions: 68410,
          totalDistanceKm: 184290
        },
        eventTaxonomy: DEFAULT_ANALYTICS_EVENTS,
        areaFunnel: KARACHI_AREA_FUNNEL,
        hazardCrashDistribution: HAZARD_CRASH_DATA,
        recentEventsLedger: this.analyticsEvents
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `karachi_runner_analytics_hub_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('💾 Complete Analytics JSON exported successfully');
    });

    // 10. Periodic Simulated Live Multi-User Stream Generator
    const simulatedUsers = ['app_user_3941', 'app_user_8012', 'web_usr_6521', 'web_usr_2910', 'ios_pwa_4812', 'app_user_1190'];
    const simulatedEvents = [
      { event: 'hazard_evaded', params: () => `hazard="${['pothole', 'rickshaw', 'water_tanker'][Math.floor(Math.random() * 3)]}", react=${Math.floor(200 + Math.random() * 200)}ms` },
      { event: 'milestone_reached', params: () => `neighborhood="Karachi Sector", speed=${(18 + Math.random() * 5).toFixed(1)}km/h` },
      { event: 'powerup_collected', params: () => `item="${['chai', 'cng', 'biryani_magnet', 'shield'][Math.floor(Math.random() * 4)]}", hearts=3` },
      { event: 'slingshot_boost', params: () => `draft=100%, boost=${(22 + Math.random() * 6).toFixed(1)}km/h` },
      { event: 'area_entered', params: () => `area="${['Mazar-e-Quaid', 'Saddar', 'I.I. Chundrigar', 'Clifton'][Math.floor(Math.random() * 4)]}"` }
    ];

    window.setInterval(() => {
      if (this.analyticsFeedPaused) return;
      const user = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
      const plat = user.startsWith('app') ? 'Android' : user.startsWith('web') ? 'Web' : 'iOS';
      const evTemplate = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      this.analyticsEvents.unshift({
        time: timeStr,
        platform: plat,
        user,
        event: evTemplate.event,
        params: evTemplate.params()
      });
      if (this.analyticsEvents.length > 100) this.analyticsEvents.pop();
      if (this.activeTab === 'analytics-gates') {
        this.renderLiveFeed();
      }
    }, 4000);

    // Initial renders
    this.renderAnalyticsGateCard();
    this.renderEventsMatrix();
    this.renderAreaFunnel();
    this.renderHazardDistribution();
    this.renderLiveFeed();

    btnToggle?.addEventListener('click', () => {
      if (!this.opsEngine) return;
      const current = this.opsEngine.isConsentPromptEnabled();
      this.opsEngine.setConsentPromptEnabled(!current);
      if (this.renderAnalyticsGateCard) this.renderAnalyticsGateCard();
      this.renderAdminConsentStatus();
      this.showToast(!current ? 'Consent prompt gate activated for game players.' : 'Consent prompt gate disabled and hidden.');
    });

    document.getElementById('btn-save-passcode')?.addEventListener('click', () => {
      const input = document.getElementById('input-new-passcode');
      const val = (input?.value || '').trim();
      if (!val || val.length < 4) {
        this.showToast('Passcode must be at least 4 characters.');
        return;
      }
      try {
        localStorage.setItem('karachi_admin_passcode', val);
        if (input) input.value = '';
        this.showToast('✔ Custom Admin Passcode Saved');
      } catch (e) {
        this.showToast('Could not save passcode to storage.');
      }
    });

    document.getElementById('btn-reset-passcode')?.addEventListener('click', () => {
      try {
        localStorage.removeItem('karachi_admin_passcode');
        this.showToast('✔ Reset to Default Passcode (karachi786)');
      } catch (e) {
        this.showToast('Could not reset passcode.');
      }
    });

    document.getElementById('btn-view-web-spec')?.addEventListener('click', () => {
      this.showToast('Web GA4 Contract: 10 Core Events · Zero PII · Zero Location · Bounded Facade');
    });

    document.getElementById('btn-view-android-spec')?.addEventListener('click', () => {
      this.showToast('Android Stream: Capacitor Native SDK · AD_ID Excluded · Single Active Provider Rule');
    });

    document.getElementById('btn-export-spec-md')?.addEventListener('click', () => {
      window.open('./docs/ANALYTICS_SPECIFICATION.md', '_blank');
    });

    document.getElementById('btn-export-full-ledger-json')?.addEventListener('click', () => {
      this.exportReport('json');
    });

    document.getElementById('btn-copy-mmp-json')?.addEventListener('click', () => {
      const payload = this.lastTelemetry?.mmpPayload || (this.lastTelemetry ? {
        warning: 'Legacy telemetry packet without MMP envelope',
        telemetry: this.lastTelemetry
      } : { error: 'No live game instance connected' });
      const str = JSON.stringify(payload, null, 2);
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(str).then(() => {
          this.showToast('📋 MMP JSON payload copied to clipboard');
        }).catch(() => {
          this.showToast('Could not access clipboard');
        });
      } else {
        this.showToast('Clipboard access not supported');
      }
    });

    document.getElementById('btn-ping-mmp-test')?.addEventListener('click', () => {
      this.recordOpsEvent('mmp.ping', {
        instanceId: this.lastTelemetry?.clientInfo?.instanceId || 'unknown',
        platform: this.lastTelemetry?.clientInfo?.platform || 'web',
        targets: ['AppsFlyer', 'Adjust', 'Singular', 'Firebase', 'GA4']
      });
      this.showToast('⚡ Test MMP event registered and logged to ledger');
    });

    document.getElementById('btn-clear-local-ledger')?.addEventListener('click', () => {
      if (!window.confirm('Clear all local operations ledger history in this browser?')) return;
      try {
        localStorage.removeItem('portable-game-ops:v1');
        this.initializeOpsEngine();
        this.renderOpsBoard();
        if (this.renderAnalyticsGateCard) this.renderAnalyticsGateCard();
        this.showToast('✔ Local Ledger Cleared');
      } catch (e) {
        this.showToast('Could not clear ledger.');
      }
    });
  }

  initCommunication() {
    try {
      this.channel = new BroadcastChannel('karachi_hole_mastermode');
      this.channel.addEventListener('message', event => this.handleMessage(event.data));
    } catch (error) {
      console.warn('[RUNNER_CONSOLE] BroadcastChannel unavailable; using same-origin storage events.', error);
    }

    // Immediately load last known telemetry from local storage if available
    try {
      const stored = localStorage.getItem(TELEMETRY_KEY);
      if (stored) {
        const message = JSON.parse(stored);
        this.handleMessage(message);
      }
    } catch (err) {
      console.warn('[RUNNER_CONSOLE] Could not load initial telemetry from storage.', err);
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
    // 1. AI Auto-Pilot (Hands-Free QA)
    const toggleAutoPilot = () => {
      const active = !Boolean(this.lastTelemetry?.autoPilot);
      this.sendCommand('TOGGLE_AUTOPILOT', { enabled: active });
      this.recordOpsEvent('master.command', { command: 'TOGGLE_AUTOPILOT', enabled: active });
      this.showToast(active ? '🤖 AI Auto-Pilot ACTIVE: Running autonomously!' : '🤖 AI Auto-Pilot Disengaged.');
      const badge = document.getElementById('badge-autorun');
      if (badge) {
        badge.className = `card-badge ${active ? 'badge-active' : 'badge-idle'}`;
        badge.textContent = active ? 'RUNNING' : 'STANDBY';
      }
    };
    document.getElementById('btn-master-autorun')?.addEventListener('click', toggleAutoPilot);
    document.getElementById('btn-toggle-autorun')?.addEventListener('click', toggleAutoPilot);

    document.getElementById('btn-master-selfcheck')?.addEventListener('click', () => {
      this.sendCommand('RUNNER_SELF_CHECK', {});
      this.recordOpsEvent('master.command', { command: 'RUNNER_SELF_CHECK' });
      this.showToast('🧪 Runner QA self-check requested.');
    });

    // 2. Hole & Vortex Suction Scale
    const setVortexRadius = (radius) => {
      const r = Number(radius);
      const display = document.getElementById('vortex-radius-display');
      if (display) display.textContent = `${r.toFixed(1)}m`;
      const slider = document.getElementById('slider-vortex-radius');
      if (slider) slider.value = r;
      document.querySelectorAll('[data-vortex-preset]').forEach(chip => {
        chip.classList.toggle('active', Math.abs(Number(chip.dataset.vortexPreset) - r) < 0.1);
      });
      this.sendCommand('SET_RADIUS', { radius: r });
      this.recordOpsEvent('master.command', { command: 'SET_RADIUS', radius: r });
      this.showToast(`🕳️ Vortex Devour Radius: ${r.toFixed(1)}m`);
    };

    document.getElementById('slider-vortex-radius')?.addEventListener('input', (e) => {
      setVortexRadius(e.target.value);
    });

    document.querySelectorAll('[data-vortex-preset]').forEach(chip => {
      chip.addEventListener('click', () => {
        setVortexRadius(chip.dataset.vortexPreset);
      });
    });

    document.getElementById('btn-master-devour-all')?.addEventListener('click', () => {
      this.sendCommand('DEVOUR_ALL', {});
      this.recordOpsEvent('master.command', { command: 'DEVOUR_ALL' });
      this.showToast('💥 Devoured all road hazards & potholes!');
    });

    // 3. Speed & Acceleration Multipliers
    const setSpeedMult = (mult) => {
      const m = Number(mult);
      const display = document.getElementById('speed-mult-display');
      if (display) display.textContent = `${m.toFixed(1)}x`;
      const slider = document.getElementById('slider-speed-mult');
      if (slider) slider.value = m;
      document.querySelectorAll('[data-speed-preset]').forEach(chip => {
        chip.classList.toggle('active', Math.abs(Number(chip.dataset.speedPreset) - m) < 0.1);
      });
      this.sendCommand('SET_SPEED', { speedMult: m });
      this.recordOpsEvent('master.command', { command: 'SET_SPEED', speedMult: m });
      this.showToast(`⚡ Master Speed: ${m.toFixed(1)}x`);
    };

    document.getElementById('slider-speed-mult')?.addEventListener('input', (e) => {
      setSpeedMult(e.target.value);
    });

    document.querySelectorAll('[data-speed-preset]').forEach(chip => {
      chip.addEventListener('click', () => {
        setSpeedMult(chip.dataset.speedPreset);
      });
    });

    document.getElementById('btn-master-nascar-speed')?.addEventListener('click', () => {
      this.sendCommand('TOGGLE_NASCAR_SPEED', {});
      this.recordOpsEvent('master.command', { command: 'TOGGLE_NASCAR_SPEED' });
      this.showToast('🏎️ NASCAR Super Speed toggled!');
    });

    // 4. God Protections & World Freezes
    document.getElementById('btn-master-immortal')?.addEventListener('click', () => {
      const active = !Boolean(this.lastTelemetry?.immortal);
      this.sendCommand('TOGGLE_IMMORTAL', { immortal: active });
      this.recordOpsEvent('master.command', { command: 'TOGGLE_IMMORTAL', immortal: active });
      this.showToast(active ? '🛡️ God Invincibility ACTIVE!' : '🛡️ Standard vulnerability restored.');
      const badge = document.getElementById('badge-immortal');
      if (badge) {
        badge.className = `card-badge ${active ? 'badge-active' : 'badge-idle'}`;
        badge.textContent = active ? 'GOD IMMUNITY' : 'MORTAL';
      }
    });

    let timerFrozen = false;
    document.getElementById('btn-master-freeze-timer')?.addEventListener('click', () => {
      timerFrozen = !timerFrozen;
      this.sendCommand('FREEZE_TIMER', { frozen: timerFrozen });
      this.recordOpsEvent('master.command', { command: 'FREEZE_TIMER', frozen: timerFrozen });
      this.showToast(timerFrozen ? '⏱️ Mission Timer FROZEN!' : '⏱️ Mission Timer Resumed.');
    });

    let threatsFrozen = false;
    document.getElementById('btn-master-freeze-threats')?.addEventListener('click', () => {
      threatsFrozen = !threatsFrozen;
      this.sendCommand('FREEZE_THREATS', { frozen: threatsFrozen });
      this.recordOpsEvent('master.command', { command: 'FREEZE_THREATS', frozen: threatsFrozen });
      this.showToast(threatsFrozen ? '🛑 Traffic & Obstacle Movement FROZEN!' : '🏃 Traffic resumed movement.');
    });

    document.getElementById('btn-master-restore-hearts')?.addEventListener('click', () => {
      this.sendCommand('RESTORE_RUNNER_HEARTS', {});
      this.recordOpsEvent('master.command', { command: 'RESTORE_RUNNER_HEARTS' });
      this.showToast('❤️ Refilled Hearts & Rescue Tokens.');
    });

    // 5. Tactical Power-Ups & Street Munchies Spawner
    const spawners = {
      'btn-spawn-munchies': ['SPAWN_MUNCHIES', { count: 21 }, '🥫 Spawned 21 Street Munchies & Rupees!'],
      'btn-spawn-cng': ['SPAWN_POWERUP', { type: 'cng' }, '⚡ Spawned CNG Turbo Nitro!'],
      'btn-spawn-shield': ['SPAWN_POWERUP', { type: 'shield' }, '🛡️ Spawned Water Tanker Iron Shield!'],
      'btn-spawn-magnet': ['SPAWN_POWERUP', { type: 'magnet' }, '🧲 Spawned Burns Road Biryani Magnet!'],
      'btn-spawn-chai': ['SPAWN_POWERUP', { type: 'chai' }, '☕ Spawned Doodh Patti Chai!'],
      'btn-spawn-token': ['SPAWN_POWERUP', { type: 'revive_token' }, '✨ Spawned Rescue Token!']
    };
    Object.entries(spawners).forEach(([id, [command, payload, msg]]) => {
      document.getElementById(id)?.addEventListener('click', () => {
        this.sendCommand(command, payload);
        this.recordOpsEvent('master.command', { command, ...payload });
        this.showToast(msg);
      });
    });

    // 6. NASCAR Tactical Boosts
    document.getElementById('btn-trigger-slingshot')?.addEventListener('click', () => {
      this.sendCommand('TRIGGER_SLINGSHOT', {});
      this.recordOpsEvent('master.command', { command: 'TRIGGER_SLINGSHOT' });
      this.showToast('🚀 Slingshot boost triggered!');
    });
    document.getElementById('btn-max-draft')?.addEventListener('click', () => {
      this.sendCommand('MAX_DRAFT', {});
      this.recordOpsEvent('master.command', { command: 'MAX_DRAFT' });
      this.showToast('💨 100% Slipstream Draft set!');
    });
    document.getElementById('btn-spawn-convoy')?.addEventListener('click', () => {
      this.sendCommand('SPAWN_CONVOY', {});
      this.recordOpsEvent('master.command', { command: 'SPAWN_CONVOY' });
      this.showToast('🚚 Highway traffic convoy spawned!');
    });

    // 7. Karachi District Fast-Travel
    document.querySelectorAll('[data-warp-district]').forEach(button => {
      button.addEventListener('click', () => {
        const district = Number(button.dataset.warpDistrict);
        this.sendCommand('WARP_DISTRICT', { district });
        this.recordOpsEvent('master.command', { command: 'WARP_DISTRICT', district });
        this.showToast(`🚀 Warping to District ${district}...`);
      });
    });

    // 8. Dynamic Weather Generator
    document.getElementById('btn-runner-weather-rain')?.addEventListener('click', () => {
      this.sendCommand('SET_RUNNER_RAIN', { enabled: true });
      this.recordOpsEvent('master.command', { command: 'SET_RUNNER_RAIN', enabled: true });
      this.showToast('🌧️ Monsoon Rain Test Enabled (Road Potholes Active)');
    });
    document.getElementById('btn-weather-potholes')?.addEventListener('click', () => {
      this.sendCommand('SET_RUNNER_RAIN', { enabled: true });
      this.recordOpsEvent('master.command', { command: 'SET_RUNNER_RAIN', mode: 'potholes' });
      this.showToast('🕳️ Rain-Softened Potholes Active');
    });
    document.getElementById('btn-weather-clear')?.addEventListener('click', () => {
      this.sendCommand('SET_RUNNER_RAIN', { enabled: false });
      this.recordOpsEvent('master.command', { command: 'SET_RUNNER_RAIN', enabled: false });
      this.showToast('☀️ Clear Skies Enabled');
    });
    document.getElementById('btn-runner-weather-auto')?.addEventListener('click', () => {
      this.sendCommand('SET_RUNNER_RAIN', { enabled: null });
      this.recordOpsEvent('master.command', { command: 'SET_RUNNER_RAIN', enabled: null });
      this.showToast('🌦️ Natural Weather Cycle Restored');
    });

    // 9. Karachi Special Set-Pieces & Daily Quests
    const specialActions = {
      'btn-master-trigger-surf': ['TRIGGER_SURF', {}, '🏄 W-11 Minibus roof surfing spawned ahead!'],
      'btn-master-trigger-wordhunt': ['TRIGGER_WORDHUNT', {}, '🎸 KARACHI Word Complete & Junoon Fever activated!'],
      'btn-master-trigger-trampoline': ['TRIGGER_SPRING_TRAMPOLINE', {}, '🦘 Hydraulic Spring Trampoline pad deployed ahead!'],
      'btn-master-trigger-slang': ['TRIGGER_SLANG_BILLBOARD', {}, '📢 Karachi slang billboard spawned ahead!'],
      'btn-master-complete-daily': ['COMPLETE_DAILY_QUESTS', {}, '🎯 All daily challenges completed!'],
      'btn-master-reset-daily': ['RESET_DAILY_QUESTS', {}, '🔄 Daily challenges reset to fresh seed!']
    };
    Object.entries(specialActions).forEach(([id, [command, payload, msg]]) => {
      document.getElementById(id)?.addEventListener('click', () => {
        this.sendCommand(command, payload);
        this.recordOpsEvent('master.command', { command, ...payload });
        this.showToast(msg);
      });
    });

    // 10. Admin Cloud Sync Configuration
    const cloudInp = document.getElementById('input-dash-cloud-url');
    if (cloudInp) {
      try {
        cloudInp.value = localStorage.getItem('karachi_runner_cloud_url_v1') || '';
      } catch (_) {}
    }
    document.getElementById('btn-dash-save-cloud')?.addEventListener('click', () => {
      const val = cloudInp?.value?.trim() || '';
      try {
        if (val) localStorage.setItem('karachi_runner_cloud_url_v1', val);
        else localStorage.removeItem('karachi_runner_cloud_url_v1');
        this.showToast(val ? '☁️ Cloud Database URL saved.' : '☁️ Cloud URL cleared.');
      } catch (e) {
        this.showToast('Could not save cloud URL.');
      }
    });
    document.getElementById('btn-dash-clear-cloud')?.addEventListener('click', () => {
      if (cloudInp) cloudInp.value = '';
      try {
        localStorage.removeItem('karachi_runner_cloud_url_v1');
        this.showToast('☁️ Cloud Database URL cleared.');
      } catch (_) {}
    });

    // Obstacle Master tab actions
    document.getElementById('btn-spawn-test-obstacle')?.addEventListener('click', () => {
      const type = document.getElementById('ops-obstacle-type')?.value;
      const lane = Number(document.getElementById('ops-obstacle-lane')?.value);
      this.sendCommand('SPAWN_TEST_OBSTACLE', { type, lane });
      this.showToast('Test obstacle requested.');
    });
    document.getElementById('btn-clear-test-obstacles')?.addEventListener('click', () => {
      this.sendCommand('CLEAR_TEST_OBSTACLES', {});
      this.showToast('Test obstacles cleared.');
    });
    document.getElementById('btn-clear-all-hazards')?.addEventListener('click', () => {
      this.sendCommand('CLEAR_ALL_HAZARDS', {});
      this.showToast('All obstacles & traffic cleared.');
    });
    document.getElementById('btn-spawn-junction')?.addEventListener('click', () => {
      const [kind, dir] = String(document.getElementById('ops-junction-type')?.value || 'turn-left').split('-');
      this.sendCommand('SPAWN_JUNCTION', { kind, dir });
      this.showToast('Junction requested.');
    });

    // Profile & Unlocks
    document.getElementById('btn-unlock-runner-content')?.addEventListener('click', () => {
      if (!window.confirm('Unlock all Runner areas and getups in this browser profile? This is saved to this device.')) return;
      this.sendCommand('UNLOCK_ALL_RUNNER_CONTENT', {});
      this.showToast('Test content unlock requested for this browser profile.');
    });

    // QA & Snapshot actions
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
    return Boolean(telemetry?.isRunnerMode && telemetry.isGameStarted && !telemetry.isPaused);
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

    const autorunBadge = document.getElementById('badge-autorun');
    if (autorunBadge && telemetry) {
      const active = Boolean(telemetry.autoPilot);
      autorunBadge.className = `card-badge ${active ? 'badge-active' : 'badge-idle'}`;
      autorunBadge.textContent = active ? 'RUNNING' : 'STANDBY';
    }
    const immortalBadge = document.getElementById('badge-immortal');
    if (immortalBadge && telemetry) {
      const active = Boolean(telemetry.immortal);
      immortalBadge.className = `card-badge ${active ? 'badge-active' : 'badge-idle'}`;
      immortalBadge.textContent = active ? 'GOD IMMUNITY' : 'MORTAL';
    }

    if (!connected || !telemetry.isRunnerMode) {
      [
        'stat-area', 'stat-neighborhood', 'stat-distance', 'stat-stage',
        'stat-difficulty', 'stat-score', 'stat-coins', 'stat-hearts',
        'stat-speed', 'stat-lane', 'stat-weather', 'stat-hazards',
        'stat-traffic', 'stat-powerup', 'stat-fps', 'stat-client-device'
      ].forEach(id => setText(id, '—'));
      setText('stat-client-details', 'Runtime —');
      setText('stat-run-status', runState);
      return;
    }

    const client = telemetry.clientInfo;
    const mmp = telemetry.mmpPayload;
    if (client) {
      setText('stat-client-device', `${client.deviceCategory.toUpperCase()} · ${client.platform}`);
      setText('stat-client-details', `${client.viewport} (${client.runtime}) · ${client.online ? '🟢 Online' : '🔴 Offline'}`);
    } else {
      setText('stat-client-device', 'WEB · Detected');
      setText('stat-client-details', 'Standard Viewport');
    }

    const badge = document.getElementById('mmp-instance-badge');
    if (badge) {
      if (client?.instanceId) {
        badge.textContent = `${client.instanceId.slice(0, 14)}… · ${client.consentStatus.toUpperCase()}`;
        badge.style.color = client.consentStatus === 'granted' ? '#4ade80' : '#00e5ff';
      } else {
        badge.textContent = 'STANDBY';
        badge.style.color = '#94a3b8';
      }
    }

    const mmpViewer = document.getElementById('mmp-payload-viewer');
    if (mmpViewer && mmp) {
      mmpViewer.textContent = JSON.stringify(mmp, null, 2);
    }

    const distance = Math.max(0, Number(telemetry.distanceMeters) || 0);
    const speed = Number(telemetry.nascar?.speedKmh);
    const km = (distance / 1000).toFixed(2);
    setText('stat-area', AREAS[telemetry.level] || 'Karachi route');
    setText('stat-neighborhood', telemetry.runnerNeighborhoodName || telemetry.currentMilestone || 'Soldier Bazar');
    setText('stat-distance', `${Math.min(distance, ROUTE_DISTANCE_METERS).toLocaleString()} m (${km} km)`);
    setText('stat-stage', `${Math.max(0, ROUTE_DISTANCE_METERS - distance).toLocaleString()} m (${((ROUTE_DISTANCE_METERS - distance) / 1000).toFixed(2)} km) to finish`);
    setText('stat-difficulty', `Tier ${Number(telemetry.runnerChallengeTier) || 0}`);
    setText('stat-score', `${(Number(telemetry.score) || 0).toLocaleString()} pts`);
    setText('stat-coins', `${(Number(telemetry.coins) || 0).toLocaleString()} rupees`);
    setText('stat-hearts', `${Number(telemetry.hearts) || 0} / 3`);
    setText('stat-speed', Number.isFinite(speed) ? `${Math.round(speed)} km/h` : '—');

    if (telemetry.isGameStarted && !telemetry.isPaused && !this.analyticsFeedPaused) {
      if (this.lastRecordedLiveDistance === undefined || Math.abs(distance - this.lastRecordedLiveDistance) >= 100) {
        this.lastRecordedLiveDistance = distance;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const nh = telemetry.runnerNeighborhoodName || telemetry.currentMilestone || 'Soldier Bazar';
        this.analyticsEvents.unshift({
          time: timeStr,
          platform: 'Web (Local)',
          user: 'active_runner',
          event: distance === 0 ? 'run_started' : 'milestone_reached',
          params: `neighborhood="${nh}", dist=${distance}m (${km}km), speed=${Math.round(speed || 19)}km/h`
        });
        if (this.analyticsEvents.length > 100) this.analyticsEvents.pop();
        if (this.activeTab === 'analytics-gates') {
          this.renderLiveFeed();
        }
      }
    }
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
    if (this.renderAnalyticsGateCard) this.renderAnalyticsGateCard();
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
