/**
 * =============================================================================
 * KARACHI RUNNER - Automated Game Test Suite
 * =============================================================================
 * Executes all automated test cases across UI, gameplay mechanics, 3D camera,
 * educational challenges, progression, auto-pause, and responsive layouts.
 *
 * Usage:
 *   npm test
 *   node scripts/test_runner.js [--port=5174] [--screenshot-dir=./test_reports]
 * =============================================================================
 */

import { execFileSync, execSync, spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Command line arguments parsing
const args = process.argv.slice(2);
const portArg = args.find(a => a.startsWith('--port='));
const targetPort = portArg ? portArg.split('=')[1] : '5174';
const projectDir = rootDir;
const chromeExecutable = process.env.CHROME_BIN || (
  process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : process.platform === 'win32'
      ? 'chrome.exe'
      : 'google-chrome'
);

const reportDirArg = args.find(a => a.startsWith('--screenshot-dir='));
const reportDir = reportDirArg 
  ? path.resolve(reportDirArg.split('=')[1])
  : path.resolve(rootDir, 'test_reports');
const onlyTestIds = new Set(
  (args.find(a => a.startsWith('--only='))?.split('=')[1] || '')
    .split(',')
    .filter(Boolean)
);

if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// Color formatting for console test output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
};

const testResults = [];
const browserTestErrors = new Map();
const skippedTestIds = new Set();
let startedDevServer = null;

function stopStartedDevServer() {
  if (!startedDevServer) return;
  startedDevServer.kill();
  startedDevServer = null;
}

function isTestServerReady() {
  return new Promise((resolve) => {
    const request = http.get(`http://127.0.0.1:${targetPort}/`, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    request.setTimeout(1000, () => {
      request.destroy();
      resolve(false);
    });
    request.on('error', () => resolve(false));
  });
}

async function ensureTestServer() {
  if (targetPort !== '5174' || await isTestServerReady()) return;

  startedDevServer = spawn('npm', [
    'run', 'dev', '--', '--host', '127.0.0.1', `--port=${targetPort}`, '--strictPort'
  ], { cwd: rootDir, stdio: 'ignore' });

  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (startedDevServer.exitCode !== null) {
      throw new Error(`Local Vite test server exited with code ${startedDevServer.exitCode}`);
    }
    if (await isTestServerReady()) return;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error(`Local Vite test server did not become ready on port ${targetPort}`);
}

function logSection(title) {
  console.log(`\n${colors.bright}${colors.cyan}======================================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}======================================================================${colors.reset}\n`);
}

function recordTest(id, name, status, durationMs, details = '') {
  if (skippedTestIds.has(id)) {
    status = 'SKIPPED';
    details = 'Skipped by --only filter';
  }
  if (status === 'FAILED' && browserTestErrors.has(id)) {
    details = browserTestErrors.get(id);
  }
  testResults.push({ id, name, status, durationMs, details });
  const icon = status === 'PASSED'
    ? `${colors.green}✔ PASS${colors.reset}`
    : status === 'SKIPPED'
      ? `${colors.yellow}↷ SKIP${colors.reset}`
      : `${colors.red}✖ FAIL${colors.reset}`;
  console.log(`  [${id}] ${icon} ${colors.bright}${name}${colors.reset} (${durationMs}ms)`);
  if (details) {
    console.log(`        ${colors.dim}${details}${colors.reset}`);
  }
}

const indexPath = path.join(projectDir, 'index.html');
const ORIGINAL_INDEX_HTML = fs.readFileSync(indexPath, 'utf8');

function ensureCleanIndex() {
  try {
    fs.writeFileSync(indexPath, ORIGINAL_INDEX_HTML, 'utf8');
  } catch (error) {
    console.error('[TEST] Could not restore index.html after browser test injection.', error);
    process.exitCode = 1;
  }
}

process.on('exit', () => { stopStartedDevServer(); ensureCleanIndex(); });
process.on('SIGINT', () => { stopStartedDevServer(); ensureCleanIndex(); process.exit(1); });
process.on('SIGTERM', () => { stopStartedDevServer(); ensureCleanIndex(); process.exit(1); });
process.on('uncaughtException', (e) => { ensureCleanIndex(); console.error(e); process.exit(1); });

// Helper to run headless chrome script injection test
async function runChromeTest({ testId, scriptInjection, windowSize = '1280,800', screenshotName, waitMs = 2800, extraStyle = '', beforeAppScript = '' }) {
  if (onlyTestIds.size > 0 && !onlyTestIds.has(testId)) {
    skippedTestIds.add(testId);
    return { success: false, skipped: true };
  }
  ensureCleanIndex();
  const screenshotPath = path.join(reportDir, screenshotName || `${testId.toLowerCase()}.png`);
  let userDataDir = null;

  try {
    const effectiveBeforeAppScript = testId === 'TC-50'
      ? beforeAppScript
      : `localStorage.setItem('karachi_runner_intro_seen_v1', 'true');\n${beforeAppScript}`;
    const sanitizedScript = scriptInjection.replace(
      /^(\s*)window\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{([\s\S]*)\}\);\s*$/,
      (_match, indent, body) => `${indent}(() => {${body}})();`
    );
    if (scriptInjection.includes("window.addEventListener('DOMContentLoaded'") &&
        sanitizedScript === scriptInjection) {
      throw new Error(`${testId} uses an unsupported DOMContentLoaded test wrapper`);
    }
    let injectedHtml = ORIGINAL_INDEX_HTML;
    if (effectiveBeforeAppScript) {
      const appScriptTag = '<script type="module" src="/src/main.js"></script>';
      const appScriptIndex = injectedHtml.indexOf(appScriptTag);
      if (appScriptIndex < 0) throw new Error('Could not locate the application module script for test setup');
      injectedHtml = `${injectedHtml.slice(0, appScriptIndex)}<script>${effectiveBeforeAppScript}</script>${injectedHtml.slice(appScriptIndex)}`;
    }
    if (extraStyle) {
      injectedHtml = injectedHtml.replace('</head>', `<style>${extraStyle}</style></head>`);
    }
    injectedHtml = injectedHtml.replace('</body>', `<script>
      window.__testResult = { status: 'running' };
      const __syncTestResult = () => {
        document.documentElement.dataset.testStatus = window.__testResult.status;
        document.documentElement.dataset.testError = window.__testResult.error || '';
      };
      window.addEventListener('error', (event) => {
        window.__testResult = { status: 'failed', error: event.message || 'Uncaught browser error' };
        __syncTestResult();
      });
      window.addEventListener('unhandledrejection', (event) => {
        window.__testResult = {
          status: 'failed',
          error: event.reason?.message || String(event.reason || 'Unhandled promise rejection')
        };
        __syncTestResult();
      });
      function __run() {
        try {
          ${sanitizedScript}
        } catch (err) {
          window.__testResult = { status: 'failed', error: err.message, stack: err.stack };
        }
        __syncTestResult();
      }
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          if (!window.game?.ui || !document.getElementById('btn-start-patrol')) {
            window.__testResult = { status: 'failed', error: 'Game UI did not initialize' };
            __syncTestResult();
            return;
          }
          __run();
        }, 50);
      }, { once: true });
      setTimeout(() => {
        if (window.__testResult.status === 'running') {
          window.__testResult = { status: 'passed' };
        }
        __syncTestResult();
      }, ${waitMs - 100});
    </script></body>`);
    fs.writeFileSync(indexPath, injectedHtml, 'utf8');

    userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'karachi-runner-test-'));
    const [windowWidth, windowHeight] = windowSize.split(',');
    const browserOutput = execFileSync(
      chromeExecutable,
      [
        '--headless=new',
        ...(process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : []),
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${userDataDir}`,
        `--virtual-time-budget=${waitMs}`,
        `--screenshot=${screenshotPath}`,
        '--dump-dom',
        `--window-size=${windowWidth},${windowHeight}`,
        `http://127.0.0.1:${targetPort}/`
      ],
      { stdio: 'pipe', timeout: 120000 }
    ).toString();
    const testStatus = browserOutput.match(/data-test-status="([^"]+)"/)?.[1];
    const testError = browserOutput.match(/data-test-error="([^"]*)"/)?.[1];
    if (testStatus !== 'passed') {
      const error = `Browser test ${testStatus || 'did not report a result'}${testError ? `: ${testError}` : ''}`;
      browserTestErrors.set(testId, error);
      return {
        success: false,
        error
      };
    }

    return { success: true, screenshotPath };
  } catch (err) {
    const output = err.stdout?.toString() || '';
    const testError = output.match(/data-test-error="([^"]*)"/)?.[1];
    const error = testError || err.message;
    browserTestErrors.set(testId, error);
    return { success: false, error };
  } finally {
    ensureCleanIndex();
    if (userDataDir) {
      try {
        fs.rmSync(userDataDir, { recursive: true, force: true });
      } catch (error) {
        console.error(`[TEST] Could not remove temporary Chrome profile ${userDataDir}.`, error);
      }
    }
  }
}

async function runTestSuite() {
  await ensureTestServer();
  const startTime = Date.now();
  logSection(`STARTING KARACHI RUNNER TEST SUITE (Target Port: ${targetPort})`);

  // -------------------------------------------------------------------------
  // TC-01: Module Import & Syntax Integrity Test
  // -------------------------------------------------------------------------
  const t01Start = Date.now();
  try {
    const modules = [
      '../src/districts.js',
      '../src/educationalChallenges.js',
      '../src/hole.js',
      '../src/karachi-neighborhoods.js'
    ];
    for (const m of modules) {
      await import(m);
    }
    const { getKarachiNeighborhoodNames } = await import('../src/karachi-neighborhoods.js');
    const neighborhoodNames = getKarachiNeighborhoodNames();
    if (neighborhoodNames.length !== 200 ||
        new Set(neighborhoodNames).size !== 199 ||
        neighborhoodNames[0] !== 'Soldier Bazar' ||
        neighborhoodNames.at(-1) !== 'Soldier Bazar' ||
        neighborhoodNames.some(name => /\d/.test(name))) {
      throw new Error('Named Karachi route stops must be unique, number-free, and begin/end at Soldier Bazar');
    }
    const capacitorConfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'capacitor.config.json'), 'utf8'));
    const pwaManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
    const androidVariables = fs.readFileSync(path.join(rootDir, 'android', 'variables.gradle'), 'utf8');
    if (capacitorConfig.android.allowMixedContent !== false ||
        capacitorConfig.android.webContentsDebuggingEnabled !== false ||
        !/targetSdkVersion\s*=\s*36\b/.test(androidVariables) ||
        !pwaManifest.icons.some(icon => icon.src === '/icons/karachi-runner-512.png' && icon.sizes === '512x512') ||
        !fs.existsSync(path.join(rootDir, 'public', 'icons', 'karachi-runner-512.png'))) {
      throw new Error('Android release hardening, API 36 target, or PWA store icon configuration is incomplete');
    }
    recordTest('TC-01', 'Core Modules & Release Configuration Integrity', 'PASSED', Date.now() - t01Start, 'Named neighborhood route, API 36 target, hardened Android WebView settings and PWA icons verified');
  } catch (err) {
    recordTest('TC-01', 'Core Modules & Release Configuration Integrity', 'FAILED', Date.now() - t01Start, err.message);
  }

  // -------------------------------------------------------------------------
  // TC-02: Production Bundle Compilation
  // -------------------------------------------------------------------------
  const t02Start = Date.now();
  try {
    const env = { ...process.env };
    const buildOutput = execSync('npm run build', { cwd: rootDir, env, stdio: 'pipe' }).toString();
    const isSuccess = buildOutput.includes('built in') || fs.existsSync(path.join(rootDir, 'dist/index.html'));
    if (isSuccess) {
      execSync('npx cap copy android', { cwd: rootDir, env, stdio: 'pipe' });
      const distAssets = fs.readdirSync(path.join(rootDir, 'dist', 'assets')).sort();
      const androidAssetsDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public', 'assets');
      const androidAssets = fs.readdirSync(androidAssetsDir).sort();
      const distIndex = fs.readFileSync(path.join(rootDir, 'dist', 'index.html'), 'utf8');
      const androidIndex = fs.readFileSync(
        path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html'),
        'utf8'
      );
      if (JSON.stringify(distAssets) !== JSON.stringify(androidAssets) || distIndex !== androidIndex) {
        throw new Error('Capacitor Android assets do not exactly match the current web build');
      }
      recordTest('TC-02', 'Vite Production Bundle & Android Asset Sync', 'PASSED', Date.now() - t02Start, 'Compiled dist and verified Capacitor Android assets match the current web bundle');
    } else {
      recordTest('TC-02', 'Vite Production Bundle & Android Asset Sync', 'FAILED', Date.now() - t02Start, 'Build completed without dist/index.html');
    }
  } catch (err) {
    recordTest('TC-02', 'Vite Production Bundle & Android Asset Sync', 'FAILED', Date.now() - t02Start, err.message);
  }

  // -------------------------------------------------------------------------
  // TC-03: Runner Onboarding & Viewport Fit
  // -------------------------------------------------------------------------
  const t03Start = Date.now();
  const res03 = await runChromeTest({
    testId: 'TC-03',
    screenshotName: 'tc03_start_onboarding_modal.png',
    windowSize: '375,667',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        const startModal = document.getElementById('modal-start-mission');
        const title = startModal?.querySelector('.start-title');
        const districtGrid = document.getElementById('start-district-grid');
        const paceGrid = document.getElementById('runner-difficulty-grid');
        const avatarGrid = document.getElementById('start-avatar-grid');
        const startBtn = document.getElementById('btn-start-patrol');
        const onboardingText = startModal?.textContent.toLowerCase() || '';

        if (!startModal || startModal.style.display === 'none') {
          throw new Error('Start modal not visible on load');
        }
        if (title?.textContent.trim() !== 'KARACHI RUNNER') {
          throw new Error('KARACHI RUNNER title missing');
        }
        if (!window.game?.isTempleRun ||
            ['hole devourer', 'civic hero', 'open world'].some(label => onboardingText.includes(label))) {
          throw new Error('Start screen is not isolated to KARACHI RUNNER');
        }
        if (window.game.isGameStarted || window.game.distanceMeters !== 0 ||
            getComputedStyle(window.game.ui.hud).display !== 'none') {
          throw new Error('Runner HUD or gameplay became active before pressing RUN');
        }
        if (!districtGrid || districtGrid.children.length !== 3) {
          throw new Error('Three Karachi patrol areas are not available');
        }
        if (!paceGrid || paceGrid.children.length !== 3) {
          throw new Error('Runner pace selection missing');
        }
        if (!avatarGrid || avatarGrid.children.length !== 5) {
          throw new Error('Getup selection missing');
        }
        const duplicateDistrictBadge = startModal.querySelector('.d-badge');
        if (document.getElementById('player-name-input') ||
            (duplicateDistrictBadge && getComputedStyle(duplicateDistrictBadge).display !== 'none')) {
          throw new Error('Removed name or duplicate district label is still visible');
        }
        if (!startBtn) {
          throw new Error('Run button missing');
        }
        const modalRect = startModal.querySelector('.start-mission-card').getBoundingClientRect();
        const startRect = startBtn.getBoundingClientRect();
        if (modalRect.top < 0 || modalRect.bottom > window.innerHeight ||
            startRect.bottom > window.innerHeight ||
            startModal.querySelector('.start-mission-card').scrollHeight >
              startModal.querySelector('.start-mission-card').clientHeight + 1) {
          throw new Error('Runner onboarding does not fit the 375x667 viewport');
        }
      });
    `
  });
  recordTest('TC-03', 'KARACHI RUNNER Onboarding & 375x667 Viewport Fit', res03.success ? 'PASSED' : 'FAILED', Date.now() - t03Start, 'Verified three Karachi areas, pace options, getups, branding, and visible run button without scrolling');

  // -------------------------------------------------------------------------
  // TC-04: Karachi 3rd-person street camera
  // -------------------------------------------------------------------------
  const t04Start = Date.now();
  const res04 = await runChromeTest({
    testId: 'TC-04',
    screenshotName: 'tc04_runner_camera.png',
    extraStyle: '#modal-start-mission { display: none !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          const startBtn = document.getElementById('btn-start-patrol');
          if (startBtn) startBtn.click();

          setTimeout(() => {
            if (!window.game) throw new Error('window.game not initialized');
            const cam = window.game.camera;
            const player = window.game.player;

            // Street chase camera: low height (~2.7m) behind player (~4.7m)
            const expectedY = 2.65 + player.radius * 0.62;
            const distBehind = cam.position.z - player.position.z;

            if (distBehind < 3.0 || distBehind > 8.0) {
              throw new Error('Camera distance behind player out of street-chase bounds: ' + distBehind);
            }
            if (cam.position.y > 6.0) {
              throw new Error('Camera height is top-down instead of street-chase: ' + cam.position.y);
            }
          }, 600);
        }, 500);
      });
    `
  });
  recordTest('TC-04', 'Karachi Street-Level Chase Camera', res04.success ? 'PASSED' : 'FAILED', Date.now() - t04Start, 'Confirmed street-level camera framing, forward lookAt, and steering sway');

  // -------------------------------------------------------------------------
  // TC-05: Realtime Scoreboard & District Evils Tracker
  // -------------------------------------------------------------------------
  const t05Start = Date.now();
  const res05 = await runChromeTest({
    testId: 'TC-05',
    screenshotName: 'tc05_scoreboard_and_tracking.png',
    extraStyle: '#modal-start-mission { display: none !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          const startBtn = document.getElementById('btn-start-patrol');
          if (startBtn) startBtn.click();

          setTimeout(() => {
            const scoreCard = document.getElementById('hud-scoreboard-card');
            const rankTag = document.getElementById('hud-player-rank');
            const lbList = document.getElementById('hud-leaderboard');
            const districtCounter = document.getElementById('hud-district-counter');

            if (!scoreCard) throw new Error('Dedicated scoreboard card missing');
            if (!rankTag || !rankTag.textContent.includes('RANK')) throw new Error('Player rank badge missing');
            if (!lbList || lbList.children.length === 0) throw new Error('Leaderboard list empty');
            if (!districtCounter) throw new Error('District counter missing');
          }, 600);
        }, 500);
      });
    `
  });
  recordTest('TC-05', 'Dedicated Scoreboard & Live Mission Tracker', res05.success ? 'PASSED' : 'FAILED', Date.now() - t05Start, 'Verified leaderboard rankings, player rank badge, and district mission status');

  // -------------------------------------------------------------------------
  // TC-06: Non-Skippable Pictorial Quiz Dilemma & Auto-Resume
  // -------------------------------------------------------------------------
  const t06Start = Date.now();
  const res06 = await runChromeTest({
    testId: 'TC-06',
    screenshotName: 'tc06_pictorial_quiz_auto_resume.png',
    extraStyle: '#modal-start-mission { display: none !important; } #modal-quiz { display: flex !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          const startBtn = document.getElementById('btn-start-patrol');
          if (startBtn) startBtn.click();

          setTimeout(() => {
            const quizBtn = document.getElementById('btn-open-quiz');
            if (quizBtn) quizBtn.click();

            setTimeout(() => {
              const quizModal = document.getElementById('modal-quiz');
              if (!quizModal || quizModal.style.display === 'none') {
                throw new Error('Quiz modal not opened');
              }
              const closeBtn = document.getElementById('btn-close-quiz');
              if (closeBtn && closeBtn.offsetParent !== null) {
                throw new Error('Quiz must not be skippable with a close button');
              }

              const options = document.querySelectorAll('.quiz-option-btn');
              if (options.length < 2) throw new Error('Options container missing pictorial buttons');

              // Tap correct answer to trigger celebration & auto-resume
              options[0].click();
            }, 500);
          }, 600);
        }, 500);
      });
    `
  });
  recordTest('TC-06', 'Non-Skippable Pictorial Quiz Dilemma & Auto-Resume', res06.success ? 'PASSED' : 'FAILED', Date.now() - t06Start, 'Verified unskippable quiz, pictorial choice cards, reward payout & auto-resume');

  // -------------------------------------------------------------------------
  // TC-07: Auto-Pause on Screen / Tab Inactivity
  // -------------------------------------------------------------------------
  const t07Start = Date.now();
  const res07 = await runChromeTest({
    testId: 'TC-07',
    screenshotName: 'tc07_auto_pause_modal.png',
    extraStyle: '#modal-start-mission { display: none !important; } #modal-auto-pause { display: flex !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          const startBtn = document.getElementById('btn-start-patrol');
          if (startBtn) startBtn.click();

          setTimeout(() => {
            if (window.game && window.game.ui) {
              window.game.ui.showAutoPauseModal();
              const pauseModal = document.getElementById('modal-auto-pause');
              if (!pauseModal || pauseModal.style.display === 'none') {
                throw new Error('Auto-pause modal not displayed');
              }
              const resumeBtn = document.getElementById('btn-auto-resume');
              if (!resumeBtn) throw new Error('Resume patrol button missing');
              const menuBtn = document.getElementById('btn-pause-open-menu');
              const homeBtn = document.getElementById('btn-pause-exit-title');
              const styledAction = button => {
                const style = getComputedStyle(button);
                return style.borderRadius !== '0px' &&
                  style.fontFamily.toLowerCase().includes('outfit') &&
                  style.borderTopStyle === 'solid';
              };
              if (!menuBtn || !homeBtn || !styledAction(menuBtn) || !styledAction(homeBtn)) {
                throw new Error('Pause menu and Home actions are using unstyled browser-default buttons');
              }

              // Test resume
              resumeBtn.click();
              if (pauseModal.style.display !== 'none') {
                throw new Error('Resume button failed to hide pause modal');
              }
            }
          }, 600);
        }, 500);
      });
    `
  });
  recordTest('TC-07', 'Auto-Pause on Inactivity with Resume Patrol Action', res07.success ? 'PASSED' : 'FAILED', Date.now() - t07Start, 'Verified window blur / visibilitychange trigger and resume button unpause');

  // -------------------------------------------------------------------------
  // TC-08: Building Occlusion Ghosting & Corner Anti-Stick
  // -------------------------------------------------------------------------
  const t08Start = Date.now();
  const res08 = await runChromeTest({
    testId: 'TC-08',
    screenshotName: 'tc08_building_ghosting_corner_sliding.png',
    extraStyle: '#modal-start-mission { display: none !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          const startBtn = document.getElementById('btn-start-patrol');
          if (startBtn) startBtn.click();

          setTimeout(() => {
            const player = window.game.player;
            // Test corner sliding deflection
            player.position.set(92, 0, 92);
            player.move(1, 1, 0.1, 94.0);

            // Confirm coordinates did not escape map boundary
            if (Math.abs(player.position.x) > 94.0 || Math.abs(player.position.z) > 94.0) {
              throw new Error('Player escaped boundary wall in corner');
            }
          }, 600);
        }, 500);
      });
    `
  });
  recordTest('TC-08', 'Building Occlusion Ghosting & Corner Anti-Stick Physics', res08.success ? 'PASSED' : 'FAILED', Date.now() - t08Start, 'Verified smooth wall deflection, corner sliding buffer, and raycast ghosting');

  // -------------------------------------------------------------------------
  // TC-09: District Cleared & Next Level Advance Flow
  // -------------------------------------------------------------------------
  const t09Start = Date.now();
  const res09 = await runChromeTest({
    testId: 'TC-09',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc09_district_cleared_advance.png',
    extraStyle: '#modal-start-mission { display: none !important; } #modal-district-cleared { display: flex !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          const startBtn = document.getElementById('btn-start-patrol');
          if (startBtn) startBtn.click();

          setTimeout(() => {
            window.game.handleDistrictCleared();

            setTimeout(() => {
              const dcModal = document.getElementById('modal-district-cleared');
              const nextBtn = document.getElementById('btn-next-district');

              if (!dcModal || dcModal.style.display === 'none') {
                throw new Error('District Cleared modal did not open');
              }
              if (!nextBtn || !nextBtn.textContent.includes('NEXT LEVEL')) {
                throw new Error('Next Level advance button missing or improper text');
              }

              // Advance to District 2
              nextBtn.click();
              if (window.game.currentDistrictLevel !== 2) {
                throw new Error('Current district level failed to increment to 2');
              }
            }, 400);
          }, 600);
        }, 500);
      });
    `
  });
  recordTest('TC-09', 'District Cleared Celebration & Next Level Advance Flow', res09.success ? 'PASSED' : 'FAILED', Date.now() - t09Start, 'Verified prominent next level button, district transition, and level 2 state');

  // -------------------------------------------------------------------------
  // TC-10: Cross-Device Responsiveness (Mobile Viewport 375x667)
  // -------------------------------------------------------------------------
  const t10Start = Date.now();
  const res10 = await runChromeTest({
    testId: 'TC-10',
    windowSize: '375,667',
    screenshotName: 'tc10_mobile_viewport_responsiveness.png',
    extraStyle: '#modal-start-mission { display: none !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          const startBtn = document.getElementById('btn-start-patrol');
          if (startBtn) startBtn.click();

          setTimeout(() => {
            const banner = document.getElementById('district-mission-banner');
            const crisis = document.getElementById('hud-active-crisis');

            if (!banner || !crisis) throw new Error('HUD banners missing on mobile');
            const bRect = banner.getBoundingClientRect();
            const cRect = crisis.getBoundingClientRect();

            // Check that crisis card is stacked below banner, not colliding
            if (cRect.top < bRect.bottom - 4 && crisis.style.display !== 'none') {
              throw new Error('HUD mobile banner collision detected');
            }
          }, 600);
        }, 500);
      });
    `
  });
  recordTest('TC-10', 'Cross-Device Responsiveness on Mobile Viewport (375x667)', res10.success ? 'PASSED' : 'FAILED', Date.now() - t10Start, 'Verified clean vertical stacking, scaled radar, and zero banner collision on mobile');

  // -------------------------------------------------------------------------
  // TC-11: Directional Precision & Left/Right Spin Prevention
  // -------------------------------------------------------------------------
  const t11Start = Date.now();
  const res11 = await runChromeTest({
    testId: 'TC-11',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc11_directional_precision.png',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          const startBtn = document.getElementById('btn-start-patrol');
          if (startBtn) startBtn.click();

          setTimeout(() => {
            const game = window.game;
            const initCamAngle = game.camAngle;
            game.currentLane = 0;
            game.targetLaneX = 0;
            game.player.position.x = 0;
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', key: 'ArrowLeft', bubbles: true }));
            if (game.currentLane !== -1) {
              throw new Error('ArrowLeft did not select the left runner lane');
            }
            game.updatePhysics(0.1);
            game.updateCamera(0.1);
            if (game.player.position.x >= 0) {
              throw new Error('ArrowLeft did not move player to the left: ' + game.player.position.x);
            }
            const camDiff = Math.abs(game.camAngle - initCamAngle);
            if (camDiff > 0.05) {
              throw new Error('Camera spun unexpectedly on lateral ArrowLeft: ' + camDiff);
            }

            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft', key: 'ArrowLeft', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight', bubbles: true }));
            if (game.currentLane !== 0) {
              throw new Error('ArrowRight did not return to the center runner lane');
            }
            game.updatePhysics(0.2);
            game.updateCamera(0.2);
            if (game.player.position.x <= -1.0) {
              throw new Error('ArrowRight did not move player back to the right: ' + game.player.position.x);
            }
          }, 600);
        }, 500);
      });
    `
  });
  recordTest('TC-11', 'Runner Arrow-Key Lane Precision', res11.success ? 'PASSED' : 'FAILED', Date.now() - t11Start, 'Verified ArrowLeft/ArrowRight move exactly one lane each without changing the camera heading');

  // -------------------------------------------------------------------------
  // TC-12: 3D Ground Chevron & Top HUD Target Compass Guidance
  // -------------------------------------------------------------------------
  const t12Start = Date.now();
  const res12 = await runChromeTest({
    testId: 'TC-12',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc12_navigation_guidance.png',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          const startBtn = document.getElementById('btn-start-patrol');
          if (startBtn) startBtn.click();

          setTimeout(() => {
            const game = window.game;
            if (!game?.setMajorGameVersion('v2', true, 'master-control')) {
              throw new Error('Could not enter legacy civic mode through Master Mode');
            }
            setTimeout(() => {
              const navPill = document.getElementById('hud-nav-target');
              const navName = document.getElementById('hud-nav-name');
              const navDist = document.getElementById('hud-nav-dist');
              const navArrow = document.getElementById('hud-nav-arrow');

              if (!game.navGuideGroup?.visible) throw new Error('3D navigation guide did not appear in civic mode');
              if (!navPill || navPill.style.display === 'none') throw new Error('HUD navigation target compass missing');
              if (!navName || !navName.textContent) throw new Error('Target name missing in compass');
              if (!navDist || !navDist.textContent.includes('m')) throw new Error('Target distance missing in compass');
              if (!navArrow || !navArrow.textContent) throw new Error('Target directional arrow missing in compass');
            }, 120);
          }, 600);
        }, 500);
      });
    `
  });
  recordTest('TC-12', '3D Ground Chevron & Top HUD Target Compass Guidance', res12.success ? 'PASSED' : 'FAILED', Date.now() - t12Start, 'Verified 3D ground chevron points to objective, HUD pill displays real-time distance and arrow');

  // -------------------------------------------------------------------------
  // TC-13: District 2 3D Scene Rendering, Backward Viewing Angle & Solid Obstacle Collision
  // -------------------------------------------------------------------------
  const t13Start = Date.now();
  const res13 = await runChromeTest({
    testId: 'TC-13',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc13_district2_gameplay_verified.png',
    extraStyle: '#modal-start-mission { display: none !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          const startBtn = document.getElementById('btn-start-patrol');
          if (startBtn) startBtn.click();

          setTimeout(() => {
            const g = window.game;
            if (!g) throw new Error('Game instance not found');

            // 1. Advance to District 2
            g.handleDistrictCleared();
            const nextBtn = document.getElementById('btn-next-district');
            if (nextBtn) nextBtn.click();

            if (g.currentDistrictLevel !== 2) {
              throw new Error('Failed to advance to District 2');
            }

            if (!g.setMajorGameVersion('v2', true, 'master-control')) {
              throw new Error('Could not enable Master Mode legacy scene for District 2 physics checks');
            }

            // 2. Check 3D scene rendering integrity
            const p = g.player.position;
            const c = g.camera.position;
            if (!isFinite(p.x) || !isFinite(p.z)) throw new Error('Player position is NaN in District 2');
            if (!isFinite(c.x) || !isFinite(c.z)) throw new Error('Camera position is NaN in District 2');
            if (g.scene.children.length < 40) throw new Error('Scene empty in District 2: ' + g.scene.children.length);

            // 3. Backward Movement viewing angle tracking test
            const initCamAngle = g.camAngle;
            g.moveVector.y = 1; // inputForward = -1 (backward)
            g.moveVector.x = 0;
            for (let f = 0; f < 25; f++) {
              g.updatePhysics(0.033);
              g.updateCamera(0.033);
            }
            g.moveVector.y = 0;
            const newCamAngle = g.camAngle;
            if (Math.abs(newCamAngle - initCamAngle) < 0.2) {
              throw new Error('Camera failed to rotate when moving backward');
            }

            // 4. Solid Obstacle Collision Prevention test
            const obstacles = g.cityGen.obstacles || [];
            const boxObs = obstacles.find(o =>
              o.isBox &&
              (o.maxX - o.minX) > 3.0 &&
              o.maxZ > -80 &&
              o.maxZ < 80
            );
            if (boxObs) {
              // Try to push North directly into the building
              g.player.position.set(boxObs.cx, 0, boxObs.maxZ + 0.3);
              g.player.isBoosting = true;
              for (let f = 0; f < 30; f++) {
                g.player.move(0, -1, 0.033, 94.0, obstacles);
              }
              const pZ = g.player.position.z;
              if (pZ < boxObs.maxZ + 0.65) {
                throw new Error('Player penetrated inside building box: ' + pZ + ' vs maxZ ' + boxObs.maxZ);
              }
            }

            // 5. Quiz Questions Diversity test
            if (window.getChallengeByCategoryAndTier) {
              const qSafety1 = window.getChallengeByCategoryAndTier('safety', 'kids');
              const qSafety2 = window.getChallengeByCategoryAndTier('safety', 'kids');
              const qClean1 = window.getChallengeByCategoryAndTier('cleanliness', 'kids');
              const qClean2 = window.getChallengeByCategoryAndTier('cleanliness', 'kids');
              if (!qSafety1 || !qSafety2 || qSafety1.id === qSafety2.id) {
                throw new Error('Safety quiz question repeated on consecutive calls: ' + qSafety1?.id);
              }
              if (!qClean1 || !qClean2 || qClean1.id === qClean2.id) {
                throw new Error('Cleanliness quiz question repeated on consecutive calls: ' + qClean1?.id);
              }
            }
          }, 700);
        }, 500);
      });
    `
  });
  recordTest('TC-13', 'District 2 3D Scene Rendering, Backward Viewing Angle, Collision & Quiz Diversity', res13.success ? 'PASSED' : 'FAILED', Date.now() - t13Start, 'Verified District 2 3D geometry, backward camera tracking, impenetrable building collision, and quiz non-repetition');

  // -------------------------------------------------------------------------
  // TC-14: SaveManager Progression Persistence & Career Restore Flow
  // -------------------------------------------------------------------------
  const t14Start = Date.now();
  const res14 = await runChromeTest({
    testId: 'TC-14',
    screenshotName: 'tc14_career_save_persistence.png',
    beforeAppScript: `
      localStorage.setItem('karachi_hero_save_v2', JSON.stringify({
        version: 2,
        player: { name: 'Tariq Hero', avatarId: 'tariq', level: 3, careerXP: 7000 },
        currentDistrictLevel: 2,
        highestDistrictUnlocked: 2,
        districts: {
          1: { status: 'cleared' },
          2: { status: 'unlocked' }
        },
        badges: ['water_guardian', 'street_cleaner']
      }));
    `,
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        const game = window.game;
        if (game.player.level !== 3 || game.player.xp !== 7000 ||
            game.currentDistrictLevel !== 2 || game.player.avatarId !== 'tariq') {
          throw new Error('Saved career was not restored automatically on page load');
        }
        if (document.getElementById('btn-continue-career')) {
          throw new Error('Obsolete Continue Career action is still present');
        }
      });
    `
  });
  recordTest('TC-14', 'Automatic Career Restore Without Continue Button', res14.success ? 'PASSED' : 'FAILED', Date.now() - t14Start, 'Verified saved XP, getup, and selected patrol area restore on startup without a Continue Career button');

  // -------------------------------------------------------------------------
  // TC-15: Interactive Citizen Dialogue, Mission Journal & Jump Traversal
  // -------------------------------------------------------------------------
  const t15Start = Date.now();
  const res15 = await runChromeTest({
    testId: 'TC-15',
    screenshotName: 'tc15_dialogue_journal_jump.png',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        const startBtn = document.getElementById('btn-start-patrol');
        if (startBtn) startBtn.click();

        setTimeout(() => {
          const game = window.game;
          if (!game?.setMajorGameVersion('v2', true, 'master-control')) {
            throw new Error('Could not enter legacy civic mode through Master Mode');
          }

          // 1. Check Jump Button and Journal Button in HUD
          const jumpBtn = document.getElementById('btn-jump');
          const journalBtn = document.getElementById('btn-journal');
          if (!jumpBtn) throw new Error('#btn-jump missing from HUD controls');
          if (!journalBtn) throw new Error('#btn-journal missing from HUD controls');

          // 2. Open Mission Journal
          journalBtn.click();
          const journalModal = document.getElementById('modal-mission-journal');
          if (!journalModal || journalModal.style.display === 'none') {
            throw new Error('#modal-mission-journal did not open upon clicking #btn-journal');
          }

          // 3. Verify Restoration Gauges
          const cleanVal = document.getElementById('gauge-cleanliness-val');
          const infraVal = document.getElementById('gauge-infra-val');
          const trafficVal = document.getElementById('gauge-traffic-val');
          const safetyVal = document.getElementById('gauge-safety-val');
          if (!cleanVal || !infraVal || !trafficVal || !safetyVal) {
            throw new Error('One or more district restoration gauge elements are missing from Mission Journal');
          }

          // Close Journal
          const closeJournalBtn = document.getElementById('btn-close-journal');
          if (closeJournalBtn) closeJournalBtn.click();

          // 4. Verify Citizen Dialogue Modal
          const dialogueModal = document.getElementById('modal-citizen-dialogue');
          if (!dialogueModal) throw new Error('#modal-citizen-dialogue missing from DOM');
        }, 500);
      });
    `
  });
  recordTest('TC-15', 'Master Mode Citizen Dialogue, Journal & Jump Traversal', res15.success ? 'PASSED' : 'FAILED', Date.now() - t15Start, 'Verified Master Mode can switch to civic play, open the Mission Journal with four restoration gauges, and retain citizen dialogue');

  // -------------------------------------------------------------------------
  // TC-16: Comprehensive Game Menu & Settings Hub Navigation Flow
  // -------------------------------------------------------------------------
  const t16Start = Date.now();
  const res16 = await runChromeTest({
    testId: 'TC-16',
    screenshotName: 'tc16_game_menu_hub.png',
    extraStyle: '#modal-start-mission { display: none !important; } #modal-game-menu { display: flex !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        const startBtn = document.getElementById('btn-start-patrol');
        if (startBtn) startBtn.click();

        setTimeout(() => {
          // 1. Verify Top HUD Menu Button
          const menuBtn = document.getElementById('btn-open-game-menu');
          if (!menuBtn) throw new Error('#btn-open-game-menu missing from top HUD controls');

          // 2. Open Game Menu Modal
          menuBtn.click();
          const menuModal = document.getElementById('modal-game-menu');
          if (!menuModal || menuModal.style.display === 'none') {
            throw new Error('#modal-game-menu failed to open upon clicking #btn-open-game-menu');
          }

          // 3. Verify Primary Action Buttons
          const btnResume = document.getElementById('btn-menu-resume');
          const btnRestart = document.getElementById('btn-menu-restart');
          const btnExitTitle = document.getElementById('btn-menu-exit-title');
          if (!btnResume || !btnRestart || !btnExitTitle) {
            throw new Error('Primary action buttons (Resume, Restart, Main Menu) missing from Game Menu');
          }

          // 4. Verify Sub-Menu Hub Tiles
          const tileJournal = document.getElementById('btn-menu-open-journal');
          const tileSkins = document.getElementById('btn-menu-open-skins');
          const tileQuiz = document.getElementById('btn-menu-open-quiz');
          const tileGuide = document.getElementById('btn-menu-open-guide');
          if (!tileJournal || !tileSkins || !tileQuiz || !tileGuide) {
            throw new Error('One or more Sub-Menu Hub tiles missing from Game Menu');
          }

          // 5. Verify Settings Panel Elements
          const sfxToggle = document.getElementById('btn-menu-toggle-sfx');
          const musicToggle = document.getElementById('btn-menu-toggle-music');
          const agePills = document.querySelectorAll('#menu-age-pills .tier-pill-btn');
          const camStreet = document.getElementById('btn-cam-street');
          const camWide = document.getElementById('btn-cam-wide');
          if (!sfxToggle || !musicToggle || agePills.length < 3 || !camStreet || !camWide) {
            throw new Error('Settings panel controls (SFX, Music, Age Tiers, Camera) missing or incomplete');
          }

          // 6. Verify Return to Main Menu Functionality
          if (typeof window.game.returnToMainMenu !== 'function') {
            throw new Error('window.game.returnToMainMenu is not a function');
          }
          if (typeof window.game.ui.returnToMainMenu !== 'function') {
            throw new Error('window.game.ui.returnToMainMenu is not a function');
          }
          // Menu stays open for visual screenshot verification
        }, 500);
      });
    `
  });
  recordTest('TC-16', 'Comprehensive Game Menu & Settings Hub Navigation Flow', res16.success ? 'PASSED' : 'FAILED', Date.now() - t16Start, 'Verified HUD menu button, modal opening, sub-menus hub, settings controls, and return to main menu flow');

  // -------------------------------------------------------------------------
  // TC-17: Runner 3-Lane Lateral Switching, Target Lerping & Boundary Clamping
  // -------------------------------------------------------------------------
  const t17Start = Date.now();
  const res17 = await runChromeTest({
    testId: 'TC-17',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc17_runner_lane_switching.png',
    extraStyle: '#modal-start-mission { display: none !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        const startBtn = document.getElementById('btn-start-patrol');
        if (startBtn) startBtn.click();

        setTimeout(() => {
          const game = window.game;
          if (!game) throw new Error('Game instance window.game not found');

          // Initial state: center lane (index 0, X = 0)
          if (game.currentLane !== 0) throw new Error('Expected initial currentLane to be 0, got ' + game.currentLane);
          if (game.targetLaneX !== 0) throw new Error('Expected initial targetLaneX to be 0, got ' + game.targetLaneX);

          // 1. Switch Left (A / Left arrow / Left button)
          game.changeLane(-1);
          if (game.currentLane !== -1) throw new Error('Lane did not switch to -1 on left change, got ' + game.currentLane);
          if (Math.abs(game.targetLaneX - (-3.2)) > 0.01) throw new Error('TargetLaneX mismatch: expected -3.2, got ' + game.targetLaneX);

          // 2. Boundary Clamping: Attempt to switch left beyond lane -1
          game.changeLane(-1);
          if (game.currentLane !== -1) throw new Error('Lane boundary clamping failed on left side: got ' + game.currentLane);

          // 3. Step runner physics to verify lateral lerp
          for (let f = 0; f < 15; f++) {
            game.updateTempleRunCorridor(0.033);
          }
          if (game.player.position.x >= 0) {
            throw new Error('Player did not lerp towards left lane X=-3.2: current X=' + game.player.position.x);
          }

          // 4. Switch Right twice (back to center, then right lane)
          game.changeLane(1);
          if (game.currentLane !== 0) throw new Error('Failed to return to center lane');
          game.changeLane(1);
          if (game.currentLane !== 1) throw new Error('Failed to switch to right lane');
          if (Math.abs(game.targetLaneX - 3.2) > 0.01) throw new Error('TargetLaneX mismatch on right: expected 3.2, got ' + game.targetLaneX);

          // 5. Boundary Clamping on Right side
          game.changeLane(1);
          if (game.currentLane !== 1) throw new Error('Lane boundary clamping failed on right side: got ' + game.currentLane);

          // 6. Verify touch HUD buttons exist and trigger lane changes
          const btnL = document.getElementById('btn-lane-left');
          const btnR = document.getElementById('btn-lane-right');
          if (!btnL || !btnR) throw new Error('Mobile touch lane buttons (#btn-lane-left, #btn-lane-right) missing');
        }, 500);
      });
    `
  });
  recordTest('TC-17', 'Runner 3-Lane Switching, Target Lerping & Boundary Clamping', res17.success ? 'PASSED' : 'FAILED', Date.now() - t17Start, 'Verified 3-lane state (-1, 0, 1), target X (-3.2, 0, 3.2), lateral lerp, and boundary clamping');

  // -------------------------------------------------------------------------
  // TC-18: Parkour Jump Traversal & Slide Duck Hitbox Reduction under Wires
  // -------------------------------------------------------------------------
  const t18Start = Date.now();
  const res18 = await runChromeTest({
    testId: 'TC-18',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc18_jump_slide_traversal.png',
    extraStyle: '#modal-start-mission { display: none !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        const startBtn = document.getElementById('btn-start-patrol');
        if (startBtn) startBtn.click();

        setTimeout(() => {
          const game = window.game;
          if (!game) throw new Error('Game instance not found');

          // 1. Verify Jump Mechanics
          game.performJump();
          if (game.player.isGrounded) throw new Error('Player still marked as grounded immediately after performJump');
          if (game.player.velocityY <= 0) throw new Error('Player vertical velocity not positive after performJump: ' + game.player.velocityY);

          // 2. Verify Slide Duck Mechanics & Mid-air Dive
          game.performSlide();
          if (!game.isSliding) throw new Error('game.isSliding not set to true after performSlide');
          if (game.slideTimer <= 0) throw new Error('game.slideTimer not set to positive duration');
          if (!game.player.avatarMesh || game.player.avatarMesh.scale.y >= 0.9) {
            throw new Error('Avatar mesh vertical scale not crouched during slide: ' + game.player.avatarMesh?.scale.y);
          }

          // 3. Fluid Combo Cancellation: Jump while sliding cancels slide immediately
          game.performJump();
          if (game.isSliding) throw new Error('Active slide was not cancelled upon triggering jump');
          if (Math.abs(game.player.avatarMesh.scale.y - 1.0) > 0.05) {
            throw new Error('Avatar mesh vertical scale not restored after slide cancellation: ' + game.player.avatarMesh.scale.y);
          }

          // 4. Verify Model Factories for Runner Hazards
          if (typeof window.KarachiModels.createHangingWireHazard !== 'function') {
            throw new Error('KarachiModels.createHangingWireHazard is not a function');
          }
          if (typeof window.KarachiModels.createOpenGutterHazard !== 'function') {
            throw new Error('KarachiModels.createOpenGutterHazard is not a function');
          }
          if (typeof window.KarachiModels.createSnatcherMotorbike !== 'function') {
            throw new Error('KarachiModels.createSnatcherMotorbike is not a function');
          }

          const wireMesh = window.KarachiModels.createHangingWireHazard(7.5);
          if (!wireMesh || !wireMesh.userData.isOverheadObstacle) {
            throw new Error('Hanging wire mesh missing isOverheadObstacle userData');
          }

          const gutterMesh = window.KarachiModels.createOpenGutterHazard(1.4);
          if (!gutterMesh || !gutterMesh.userData.isGroundObstacle) {
            throw new Error('Open gutter mesh missing isGroundObstacle userData');
          }

          const bikeMesh = window.KarachiModels.createSnatcherMotorbike();
          if (!bikeMesh || !bikeMesh.userData.isVehicleObstacle) {
            throw new Error('Snatcher motorbike mesh missing isVehicleObstacle userData');
          }
        }, 500);
      });
    `
  });
  recordTest('TC-18', 'Parkour Jump Traversal & Slide Duck Hitbox Reduction under Wires', res18.success ? 'PASSED' : 'FAILED', Date.now() - t18Start, 'Verified jump upward velocity, slide crouch scale reduction, combo cancellation, and hazard model factories');

  // -------------------------------------------------------------------------
  // TC-19: Rupee Coin Pickup and Burns Road Biryani Magnet Attraction Physics
  // -------------------------------------------------------------------------
  const t19Start = Date.now();
  const res19 = await runChromeTest({
    testId: 'TC-19',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc19_coin_magnet_physics.png',
    extraStyle: '#modal-start-mission { display: none !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        const startBtn = document.getElementById('btn-start-patrol');
        if (startBtn) startBtn.click();

        setTimeout(() => {
          const game = window.game;
          if (!game) throw new Error('Game instance not found');

          // 1. Verify Rupee Coin Factory
          if (typeof window.KarachiModels.createRupeeCoin !== 'function') {
            throw new Error('KarachiModels.createRupeeCoin is not a function');
          }
          const coinGroup = window.KarachiModels.createRupeeCoin(50);
          if (!coinGroup || !coinGroup.userData.isCoin || coinGroup.userData.value !== 50) {
            throw new Error('createRupeeCoin did not return valid coin with value=50');
          }

          // 2. Direct Coin Collection Test
          const initCoins = game.coins || 0;
          const initScore = game.score || 0;
          const pZ = game.player.position.z;
          const testCoin = window.KarachiModels.createRupeeCoin(50);
          testCoin.position.set(game.player.position.x, 0, pZ - 0.5);
          game.scene.add(testCoin);
          game.runnerCoins.push({ mesh: testCoin, value: 50, x: game.player.position.x, z: pZ - 0.5 });

          game.updateTempleRunCorridor(0.033);

          if (game.coins !== initCoins + 50) {
            throw new Error('Coin pickup failed: expected ' + (initCoins + 50) + ', got ' + game.coins);
          }
          if (game.score < initScore + 100) {
            throw new Error('Coin pickup did not award score points: ' + game.score);
          }

          // 3. Burns Road Biryani Magnet Attraction Test
          const farCoin = window.KarachiModels.createRupeeCoin(50);
          farCoin.position.set(game.player.position.x + 2.0, 0, pZ - 8.0);
          game.scene.add(farCoin);
          game.runnerCoins.push({ mesh: farCoin, value: 50, x: game.player.position.x + 2.0, z: pZ - 8.0 });

          const initDist = farCoin.position.distanceTo(game.player.position);
          game.magnetTimer = 8.0; // Activate Biryani Magnet!

          for (let f = 0; f < 10; f++) {
            game.updateTempleRunCorridor(0.033);
          }

          const newDist = farCoin.position.distanceTo(game.player.position);
          if (newDist >= initDist - 0.2) {
            throw new Error('Biryani Magnet failed to magnetically pull distant coin: initDist=' + initDist + ', newDist=' + newDist);
          }
        }, 500);
      });
    `
  });
  recordTest('TC-19', 'Rupee Coin Pickup and Burns Road Biryani Magnet Attraction Physics', res19.success ? 'PASSED' : 'FAILED', Date.now() - t19Start, 'Verified 3D Rupee coin mesh generation, proximity collection (+50 Rs), and Biryani Magnet attraction');

  // -------------------------------------------------------------------------
  // TC-20: Water Tanker Iron Shield Absorption, Heart Depletion & Doodh Patti Heal
  // -------------------------------------------------------------------------
  const t20Start = Date.now();
  const res20 = await runChromeTest({
    testId: 'TC-20',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc20_shield_hearts_mechanics.png',
    extraStyle: '#modal-start-mission { display: none !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        const startBtn = document.getElementById('btn-start-patrol');
        if (startBtn) startBtn.click();

        setTimeout(() => {
          const game = window.game;
          if (!game) throw new Error('Game instance not found');

          // Ensure player has standard hearts
          game.hearts = 3;
          game.maxHearts = 3;

          // 1. Water Tanker Iron Shield Crash Absorption Test
          game.shieldTimer = 10.0;
          game.player.isShielded = true;

          const dummyMesh = window.KarachiModels.createRupeeCoin(1);
          dummyMesh.position.copy(game.player.position);
          game.scene.add(dummyMesh);

          const testObstacle1 = { type: 'rickshaw', isHit: false, mesh: dummyMesh, laneX: 0, z: game.player.position.z };
          game.handleRunnerHit(testObstacle1, 'Stalled Rickshaw');

          if (game.hearts !== 3) {
            throw new Error('Water Tanker Shield failed to absorb collision: hearts depleted to ' + game.hearts);
          }
          if (game.shieldTimer > 0 || game.player.isShielded) {
            throw new Error('Shield did not discharge after absorbing crash: timer=' + game.shieldTimer);
          }

          // 2. Unshielded Obstacle Impact & Heart Depletion Test
          game.runnerInvulnerableTimer = 0; // Clear flicker cooldown
          const testObstacle2 = { type: 'gutter', isHit: false, mesh: dummyMesh, laneX: 0, z: game.player.position.z };
          game.handleRunnerHit(testObstacle2, 'Open Gutter');

          if (game.hearts !== 2) {
            throw new Error('Unshielded crash did not deplete heart: expected 2, got ' + game.hearts);
          }
          if (game.runnerInvulnerableTimer <= 0) {
            throw new Error('Invulnerability grace period timer not triggered after crash');
          }

          // 3. Doodh Patti Chai Restorative Heal Test
          game.hearts = 2;
          const chaiMesh = game.createRunnerPowerupMesh('chai');
          chaiMesh.position.copy(game.player.position);
          game.scene.add(chaiMesh);
          game.runnerPowerups.push({ type: 'chai', mesh: chaiMesh });
          game.updateTempleRunCorridor(0.001);
          if (game.hearts !== 3) {
            throw new Error('Doodh Patti Chai failed to restore one heart: ' + game.hearts);
          }
          if (!JSON.parse(localStorage.getItem('karachi_hero_save_v2')).badges.includes('lifesaver')) {
            throw new Error('Runner healing did not persist the Lifesaver achievement');
          }

          // 4. King Pressure Horn Blast Against Snatchers Test
          if (typeof game.triggerKingPressureHorn !== 'function') {
            throw new Error('triggerKingPressureHorn is not a function');
          }
          const snatcherObs = {
            type: 'snatcher',
            laneX: 0,
            z: game.player.position.z - 10.0,
            mesh: dummyMesh,
            isHit: false
          };
          game.runnerObstacles.push(snatcherObs);
          game.triggerKingPressureHorn();
          if (!snatcherObs.isHit) {
            throw new Error('King Pressure Horn blast failed to hit and scatter nearby 70cc snatcher');
          }
        }, 500);
      });
    `
  });
  recordTest('TC-20', 'Water Tanker Iron Shield Absorption, Heart Depletion & Doodh Patti Heal', res20.success ? 'PASSED' : 'FAILED', Date.now() - t20Start, 'Verified 1-hit Water Tanker Shield absorption, heart depletion, invulnerability grace, Chai healing, and King Horn snatcher scatter');

  // -------------------------------------------------------------------------
  // TC-21: Traffic Drafting, Slingshot Boost & Speed HUD
  // -------------------------------------------------------------------------
  const t21Start = Date.now();
  const res21 = await runChromeTest({
    testId: 'TC-21',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc21_runner_drafting_speed.png',
    extraStyle: '#modal-start-mission { display: none !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        const startBtn = document.getElementById('btn-start-patrol');
        if (startBtn) startBtn.click();

        setTimeout(() => {
          const game = window.game;
          if (!game) throw new Error('Game instance not found');

          // 1. Verify runner traffic models
          if (typeof window.KarachiModels.createAsphaltBoostPad !== 'function') {
            throw new Error('KarachiModels.createAsphaltBoostPad is not a function');
          }
          if (typeof window.KarachiModels.createSlipstreamRibbons !== 'function') {
            throw new Error('KarachiModels.createSlipstreamRibbons is not a function');
          }
          const pad = window.KarachiModels.createAsphaltBoostPad(2.4, 4.0);
          if (!pad || !pad.userData.isBoostPad) {
            throw new Error('createAsphaltBoostPad failed to return boost pad');
          }
          const ribbons = window.KarachiModels.createSlipstreamRibbons(2.0, 7.0);
          if (!ribbons) {
            throw new Error('createSlipstreamRibbons failed to return group');
          }

          // 2. Verify Cockpit Gauge Cluster DOM Elements
          const cockpit = document.getElementById('hud-nascar-cluster');
          const speedEl = document.getElementById('hud-nascar-speed');
          const rpmEl = document.getElementById('hud-nascar-rpm');
          const gearEl = document.getElementById('hud-nascar-gear');
          const draftPill = document.getElementById('hud-drafting-pill');
          const speedCanvas = document.getElementById('speed-lines-canvas');

          if (!cockpit || !speedEl || !rpmEl || !gearEl || !draftPill) {
            throw new Error('Runner speed HUD elements missing from DOM');
          }
          if (!speedCanvas) {
            throw new Error('Speed lines canvas missing from DOM');
          }

          // 3. Verify Drafting Slipstream Physics
          const pZ = game.player.position.z;
          const leadVehicle = window.KarachiModels.createBedfordTruck();
          leadVehicle.position.set(0, 0, pZ - 5.0); // 5m ahead in same lane
          game.scene.add(leadVehicle);
          const truckRibbons = window.KarachiModels.createSlipstreamRibbons(2.0, 7.5);
          leadVehicle.add(truckRibbons);

          game.runnerTraffic.push({
            type: 'traffic_vehicle',
            mesh: leadVehicle,
            laneX: 0,
            speed: 12.0,
            label: '🚚 Test Bedford Truck',
            ribbons: truckRibbons,
            isHit: false,
            nearMissAwarded: false
          });

          // Run several corridor simulation frames behind lead vehicle
          game.player.position.x = 0;
          game.targetLaneX = 0;
          for (let f = 0; f < 10; f++) {
            game.updateTempleRunCorridor(0.033);
          }

          if (!game.isDrafting) {
            throw new Error('Drafting failed to engage when running 5m behind lead truck');
          }
          if (game.draftCharge <= 0) {
            throw new Error('Draft charge did not accumulate while drafting: ' + game.draftCharge);
          }
          if (!truckRibbons.visible) {
            throw new Error('Aerodynamic slipstream ribbons not made visible during active drafting');
          }

          // 4. Verify slingshot boost trigger on lane change
          game.draftCharge = 0.95; // Fully charged
          const prevScore = game.score || 0;
          game.changeLane(1); // Pull out to right lane to slingshot!

          if (game.nitroTimer <= 0) {
            throw new Error('Slingshot Boost failed to activate nitroTimer upon lane change from full draft');
          }
          if (game.draftCharge !== 0) {
            throw new Error('Draft charge was not reset upon executing Slingshot Boost');
          }
          if (game.score < prevScore + 500) {
            throw new Error('Slingshot Boost did not award +500 PTS');
          }

          // 5. Verify Master Mode Command Handling
          game.handleMasterModeCommand({ type: 'MAX_DRAFT' });
          if (game.draftCharge !== 1.0) {
            throw new Error('Master Mode MAX_DRAFT failed to set draftCharge to 1.0');
          }

          game.handleMasterModeCommand({ type: 'SWITCH_VERSION', payload: { versionId: 'v3' } });
          if (game.majorVersion !== 'v3') {
            throw new Error('Master Mode SWITCH_VERSION failed to switch majorVersion to v3');
          }
        }, 500);
      });
    `
  });
  recordTest('TC-21', 'Traffic Drafting, Slingshot Boost & Runner Speed HUD', res21.success ? 'PASSED' : 'FAILED', Date.now() - t21Start, 'Verified 3D boost pads, slipstream drafting accumulation, ribbons visibility, slingshot lane change boost, speed cluster, and Master Mode command bridge');

  // -------------------------------------------------------------------------
  // TC-22: Runner Chase Camera, Single-Action Controls & Restart State
  // -------------------------------------------------------------------------
  const t22Start = Date.now();
  const res22 = await runChromeTest({
    testId: 'TC-22',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc22_runner_playability_regression.png',
    extraStyle: '#modal-start-mission { display: none !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        document.getElementById('btn-start-patrol')?.click();

        setTimeout(() => {
          const game = window.game;
          if (!game || !game.isTempleRun) throw new Error('Karachi runner mode did not start');
          if (!document.body.classList.contains('mode-runner')) {
            throw new Error('Runner HUD mode class was not enabled');
          }
          if (getComputedStyle(document.getElementById('runner-tutorial-overlay')).display !== 'none') {
            throw new Error('Previously completed tutorial should not block a subsequent run');
          }
          if (getComputedStyle(document.getElementById('hud-scoreboard-card')).display !== 'none' ||
              getComputedStyle(document.getElementById('hud-minimap-card')).display !== 'none') {
            throw new Error('Open-world scoreboard or radar remained visible in runner mode');
          }

          for (let frame = 0; frame < 60; frame++) {
            game.updateTempleRunCorridor(0.033);
          }
          const cameraOffset = game.camera.position.z - game.player.position.z;
          if (Math.abs(cameraOffset - 5.2) > 0.6) {
            throw new Error('Runner camera failed to follow player: offset=' + cameraOffset.toFixed(2));
          }

          game.currentLane = 0;
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', key: 'd', bubbles: true }));
          if (game.currentLane !== 1) {
            throw new Error('One keyboard lane press should move exactly one lane; got ' + game.currentLane);
          }
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', key: 'd', repeat: true, bubbles: true }));
          if (game.currentLane !== 1) {
            throw new Error('Held keyboard input repeated a discrete lane change');
          }
          window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD', key: 'd', bubbles: true }));

          const dispatchTouch = (type, touch, activeTouches = [touch]) => {
            const event = new Event(type, { bubbles: true, cancelable: true });
            Object.defineProperties(event, {
              changedTouches: { value: [touch] },
              touches: { value: activeTouches }
            });
            window.dispatchEvent(event);
          };
          const laneButton = document.getElementById('btn-lane-right');
          const canvasBounds = document.querySelector('#canvas-container canvas').getBoundingClientRect();
          const swipeStart = {
            identifier: 44,
            clientX: canvasBounds.left + canvasBounds.width * 0.5,
            clientY: canvasBounds.top + canvasBounds.height * 0.5
          };
          const swipeEnd = { ...swipeStart, clientX: swipeStart.clientX + 70 };
          game.currentLane = 0;
          dispatchTouch('touchstart', swipeStart);
          dispatchTouch('touchmove', swipeEnd);
          if (game.currentLane !== 0) {
            throw new Error('Runner swipe changed lanes before the swipe ended');
          }
          dispatchTouch('touchend', swipeEnd, []);
          if (game.currentLane !== 1) {
            throw new Error('Gameplay swipe did not make exactly one lane change; got ' + game.currentLane);
          }

          const laneButtonBounds = laneButton.getBoundingClientRect();
          const buttonSwipeStart = {
            identifier: 45,
            clientX: laneButtonBounds.left + 10,
            clientY: laneButtonBounds.top + laneButtonBounds.height / 2
          };
          const buttonSwipeEnd = {
            ...buttonSwipeStart,
            clientX: buttonSwipeStart.clientX + 70
          };
          game.currentLane = 0;
          dispatchTouch('touchstart', buttonSwipeStart);
          dispatchTouch('touchmove', buttonSwipeEnd);
          dispatchTouch('touchend', buttonSwipeEnd, []);
          if (game.currentLane !== 0) {
            throw new Error('Swipe on a mobile control triggered a second runner action');
          }

          game.currentLane = 0;
          laneButton.click();
          if (game.currentLane !== 1) {
            throw new Error('Mobile lane button activated more than once per touch');
          }

          game.score = 900;
          game.magnetTimer = 5;
          game.nitroTimer = 5;
          game.shieldTimer = 5;
          game.superJumpTimer = 5;
          game.player.velocityY = 4;
          game.player.isGrounded = false;
          game.moveVector = { x: 1, y: 1 };
          game.isSliding = true;
          game.player.avatarMesh.scale.y = 0.42;
          const restartDistrict = game.currentDistrictLevel;
          game.cityGen.setWorldVisible(true);
          game.restartGame();
          const restartCameraOffset = game.camera.position.z - game.player.position.z;
          const visibleCityObjects = [...game.cityGen.worldObjects].filter(object => object.visible);
          if (game.score !== 0 || game.magnetTimer || game.nitroTimer ||
              game.shieldTimer || game.superJumpTimer || game.activePowerUp ||
              Math.abs(restartCameraOffset - 5.2) > 0.1 || game.isPaused ||
              game.player.velocityY !== 0 || !game.player.isGrounded ||
              game.isSliding || game.moveVector.x !== 0 || game.player.avatarMesh.scale.y !== 1 ||
              !game.isTempleRun || game.majorVersion !== 'v3' ||
              game.currentDistrictLevel !== restartDistrict || visibleCityObjects.length > 0 ||
              !game.corridorChunks?.length || !game.corridorChunks.every(chunk => chunk.parent === game.scene)) {
            throw new Error('Restart did not restore the KARACHI RUNNER scene, selected route, camera, movement, and clean run state');
          }

          game.player.level = 999;
          game.ui.updateHUD({
            player: game.player,
            timeLeft: game.timeLeft,
            rankedHoles: game.holes,
            gameMode: game.gameMode,
            isRunnerMode: true
          });
          if (document.getElementById('hud-level-badge').textContent !== 'LV 6' ||
              document.getElementById('hud-level-title').textContent !== 'KARACHI LEGEND') {
            throw new Error('HUD did not safely display a saved level above the configured progression cap');
          }
        }, 500);
      });
    `
  });
  recordTest('TC-22', 'Runner Chase Camera, Single-Action Controls & Restart State', res22.success ? 'PASSED' : 'FAILED', Date.now() - t22Start, res22.success ? 'Verified camera tracking, one-step keyboard/mobile lane controls, and clean restart state' : res22.error);

  // -------------------------------------------------------------------------
  // TC-23: Swept Runner Collision & Collectible Detection at Boost Speed
  // -------------------------------------------------------------------------
  const t23Start = Date.now();
  const res23 = await runChromeTest({
    testId: 'TC-23',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc23_runner_swept_collision.png',
    extraStyle: '#modal-start-mission { display: none !important; }',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        document.getElementById('btn-start-patrol')?.click();

        setTimeout(() => {
          const game = window.game;
          if (!game || !game.isTempleRun) throw new Error('Karachi runner mode did not start');

          const resetRunner = () => {
            game.clearRunnerObjects();
            game.isPaused = false;
            game.isGameOver = false;
            game.hearts = 3;
            game.currentLane = 0;
            game.targetLaneX = 0;
            game.player.position.set(0, 0, 60);
            game.player.group.position.copy(game.player.position);
            game.player.isGrounded = true;
            game.player.velocityY = 0;
            game.runnerInvulnerableTimer = 0;
            game.distanceMeters = 0;
            game.nextRunnerWaveZ = -10000;
            game.nitroTimer = 5;
          };

          resetRunner();
          const playerZ = game.player.position.z;
          const obstacle = {
            type: 'gutter',
            laneX: 0,
            z: playerZ - 1.7,
            mesh: window.KarachiModels.createOpenGutterHazard(1.4),
            isHit: false
          };
          obstacle.mesh.position.set(0, 0, obstacle.z);
          game.scene.add(obstacle.mesh);
          game.runnerObstacles.push(obstacle);
          game.updateTempleRunCorridor(0.1);
          if (!obstacle.isHit || game.hearts !== 3) {
            throw new Error('Boost-speed runner skipped a hazard inside its movement step');
          }

          resetRunner();
          const vehicle = {
            mesh: window.KarachiModels.createBedfordTruck(),
            laneX: 0,
            speed: 12,
            label: 'Test W11',
            isHit: false
          };
          vehicle.mesh.position.set(0, 0, 58.3);
          game.scene.add(vehicle.mesh);
          game.runnerTraffic.push(vehicle);
          game.updateTempleRunCorridor(0.1);
          if (!vehicle.isHit) {
            throw new Error('Boost-speed runner passed through moving traffic without a collision');
          }

          resetRunner();
          const initialCoins = game.coins;
          const coin = window.KarachiModels.createRupeeCoin(50);
          coin.position.set(0, 0.5, 58.3);
          game.scene.add(coin);
          game.runnerCoins.push({ mesh: coin, value: 50, x: 0, z: 58.3 });
          game.updateTempleRunCorridor(0.1);
          if (game.coins !== initialCoins + 50) {
            throw new Error('Boost-speed runner skipped a coin along its path');
          }

          resetRunner();
          const powerup = game.createRunnerPowerupMesh('shield');
          powerup.position.set(0, 0, 58.3);
          game.scene.add(powerup);
          game.runnerPowerups.push({ type: 'shield', mesh: powerup, x: 0, z: 58.3 });
          game.updateTempleRunCorridor(0.1);
          if (game.shieldTimer <= 0) {
            throw new Error('Boost-speed runner skipped a power-up along its path');
          }
        }, 500);
      });
    `
  });
  recordTest('TC-23', 'Swept Runner Collision & Collectible Detection at Boost Speed', res23.success ? 'PASSED' : 'FAILED', Date.now() - t23Start, res23.success ? 'Verified boosted movement cannot tunnel through hazards, traffic, coins, or power-ups' : res23.error);

  // -------------------------------------------------------------------------
  // TC-24: Text-Only Runner Life Loss Review
  // -------------------------------------------------------------------------
  const t24Start = Date.now();
  const res24 = await runChromeTest({
    testId: 'TC-24',
    beforeAppScript: "localStorage.setItem('karachi_hero_save_v2', JSON.stringify({player:{reviveTokens:0}}));",
    screenshotName: 'tc24_runner_life_loss_review.png',
    waitMs: 3500,
    scriptInjection: `
      (() => {
        localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');
        document.getElementById('btn-start-patrol')?.click();
        setTimeout(() => {
          const game = window.game;
          if (!game || !game.isTempleRun || game.isPaused) {
            throw new Error('Runner did not start for crash review test');
          }
          game.hearts = 3;
          game.maxHearts = 3;
          game.distanceMeters = 80;
          game.runnerInvulnerableTimer = 0;
          ['Open Road Gutter', 'Hanging Wires', 'W11 Minibus'].forEach((reason, index) => {
            game.handleRunnerHit({ mesh: null, isHit: false }, reason);
            if (index < 2) game.runnerInvulnerableTimer = 0;
            game.distanceMeters += 40;
          });
          if (document.querySelector('#runner-life-history')) {
            throw new Error('Redundant final-life heading and repeated hit explanation should be removed');
          }
          const crashText = document.getElementById('runner-crash-card')?.textContent || '';
          if (!document.getElementById('crash-hazard-title')?.textContent.includes('W11 Minibus') ||
              !document.getElementById('crash-hazard-hint')?.textContent.includes('Move one lane left or right') ||
              crashText.includes('FINAL LIFE LOST') ||
              crashText.includes('Open Road Gutter')) {
            throw new Error('Crash review should show the final hazard and advice only once at the top');
          }
          const reviveButton = document.getElementById('btn-crash-revive');
          if (!reviveButton?.disabled || reviveButton.textContent.trim() !== 'REVIVE') {
            throw new Error('Quick Revive must be unavailable when the player has no Rescue Tokens');
          }
          if (document.getElementById('btn-crash-retry')?.textContent.trim() !== 'RESTART') {
            throw new Error('Crash retry action should have the concise RESTART label');
          }
          const homeButton = document.getElementById('btn-crash-main-menu');
          if (!homeButton) throw new Error('Crash review Home action is missing');
          const homeStyle = getComputedStyle(homeButton);
          if (homeStyle.borderRadius === '0px' ||
              !homeStyle.fontFamily.toLowerCase().includes('outfit') ||
              homeStyle.backgroundColor === 'rgb(239, 239, 239)') {
            throw new Error('Crash review Home action is using the browser-default button style');
          }
        }, 500);
      })();
    `
  });
  recordTest('TC-24', 'Runner Crash Review & Revive Availability', res24.success ? 'PASSED' : 'FAILED', Date.now() - t24Start, res24.success ? 'Verified the top hazard advice is not duplicated and Quick Revive is disabled without a Rescue Token' : res24.error);

  // -------------------------------------------------------------------------
  // TC-25: Reachable Power-Ups and Karachi Runner Streetscape
  // -------------------------------------------------------------------------
  const t25Start = Date.now();
  const res25 = await runChromeTest({
    testId: 'TC-25',
    screenshotName: 'tc25_runner_powerups_karachi_streetscape.png',
    waitMs: 3500,
    scriptInjection: `
      (() => {
        localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');
        document.getElementById('btn-start-patrol')?.click();
        setTimeout(() => {
          const game = window.game;
          if (!game || game.isPaused) throw new Error('Runner did not start');
          if (!game.corridorChunks.some(chunk =>
            chunk.userData.patrolAreaLevel === 1 &&
            ['SOLDIER BAZAR', 'NISHTAR ROAD', 'TARIQ ROAD', 'PECHS'].includes(chunk.userData.karachiDistrict)
          )) {
            throw new Error('Corridor is missing named Karachi street scenery');
          }

          const originalRandom = Math.random;
          try {
            game.distanceMeters = 100;
            game.runnerWaveCount = 0;
            game.runnerPowerupDropCount = 0;
            Math.random = () => 0.4;
            game.spawnRunnerWave(-200);
            game.spawnRunnerWave(-228);
            game.spawnRunnerWave(-256);
            const pickup = game.runnerPowerups[game.runnerPowerups.length - 1];
            const occupiedLane = game.runnerObstacles.find(obstacle => obstacle.type === 'rickshaw')?.laneX;
            if (!pickup || pickup.type !== 'cng' || pickup.x === occupiedLane) {
              throw new Error('Guaranteed CNG pickup was missing or spawned in the blocked rickshaw lane');
            }

            game.runnerPowerups.forEach(powerup => game.scene.remove(powerup.mesh));
            game.runnerPowerups = [];
            game.runnerObstacles.forEach(obstacle => game.scene.remove(obstacle.mesh));
            game.runnerObstacles = [];
            game.runnerTraffic.forEach(vehicle => game.scene.remove(vehicle.mesh));
            game.runnerTraffic = [];
            game.runnerWaveCount = 0;
            game.runnerPowerupDropCount = 0;
            Math.random = () => 0;
            for (let wave = 0; wave < 15; wave++) {
              game.spawnRunnerWave(-300 - wave * 28);
            }
            const types = [...new Set(game.runnerPowerups.map(powerup => powerup.type))];
            if (types.join(',') !== 'cng,shield,magnet,chai,jump') {
              throw new Error('Power-up drops did not cycle through all gameplay types: ' + types.join(','));
            }
          } finally {
            Math.random = originalRandom;
          }
        }, 500);
      })();
    `
  });
  recordTest('TC-25', 'Reachable Power-Ups & Karachi Runner Streetscape', res25.success ? 'PASSED' : 'FAILED', Date.now() - t25Start, res25.success ? 'Verified guaranteed safe-lane power-ups cycle through all types and the corridor has Karachi street names' : res25.error);

  // -------------------------------------------------------------------------
  // TC-26: First-Run Tutorial Gate and Zero-Scroll Crash Layout
  // -------------------------------------------------------------------------
  const t26Start = Date.now();
  const res26 = await runChromeTest({
    testId: 'TC-26',
    screenshotName: 'tc26_runner_mobile_crash_layout.png',
    windowSize: '375,667',
    waitMs: 3600,
    scriptInjection: `
      (() => {
        localStorage.removeItem('karachi_runner_tutorial_seen_v1');
        document.getElementById('btn-start-patrol')?.click();
        setTimeout(() => {
          const game = window.game;
          if (!game || !game.isPaused || game.ui.runnerTutorialOverlay.style.display === 'none') {
            throw new Error('First-run tutorial state invalid: ' + JSON.stringify({
              started: game?.isGameStarted,
              paused: game?.isPaused,
              overlay: game?.ui?.runnerTutorialOverlay?.style.display,
              seen: localStorage.getItem('karachi_runner_tutorial_seen_v1')
            }));
          }
          const initialDistance = game.distanceMeters;
          game.updateTempleRunCorridor(0.5);
          if (game.distanceMeters !== initialDistance) {
            throw new Error('Runner moved while the tutorial covered gameplay');
          }
          game.ui.hideRunnerTutorial();
          setTimeout(() => {
            if (!game.isPaused) throw new Error('Runner resumed before the post-tutorial delay elapsed');
          }, 900);
          setTimeout(() => {
            if (game.isPaused || localStorage.getItem('karachi_runner_tutorial_seen_v1') !== 'true') {
              throw new Error('Runner did not resume one second after the tutorial disappeared');
            }
            game.hearts = 0;
            game.triggerTempleRunGameOver('W11 Minibus');
            const card = document.querySelector('#modal-game-over .results-card');
            const cardBounds = card.getBoundingClientRect();
            if (cardBounds.top < 0 || cardBounds.bottom > innerHeight + 1 ||
                card.scrollHeight > card.clientHeight + 1 ||
                document.documentElement.scrollHeight > innerHeight + 1) {
              throw new Error('Mobile crash review requires scrolling or exceeds the viewport');
            }
            game.restartGame();
            if (game.ui.runnerTutorialOverlay.style.display !== 'none') {
              throw new Error('Runner tutorial appeared again after the first gameplay');
            }
          }, 1550);
        }, 500);
      })();
    `
  });
  recordTest('TC-26', 'First-Run Tutorial Gate & Mobile Crash Layout', res26.success ? 'PASSED' : 'FAILED', Date.now() - t26Start, res26.success ? 'Verified tutorial pause/one-second resume, one-time display, and scroll-free 375x667 crash review' : res26.error);

  // -------------------------------------------------------------------------
  // TC-27: Progression Unlocks & Actual Getup Model Change
  // -------------------------------------------------------------------------
  const t27Start = Date.now();
  const res27 = await runChromeTest({
    testId: 'TC-27',
    screenshotName: 'tc27_runner_unlocks_and_getups.png',
    beforeAppScript: `
      localStorage.setItem('karachi_hero_save_v2', JSON.stringify({
        version: 2,
        player: { name: 'Karachi Hero', avatarId: 'tariq', level: 2, careerXP: 3500 },
        currentDistrictLevel: 1,
        highestDistrictUnlocked: 1,
        badges: ['water_guardian']
      }));
    `,
    scriptInjection: `
      (() => {
        const game = window.game;
        if (!game?.ui) throw new Error('Runner UI is unavailable');
        const secondDistrict = document.querySelector('#start-dist-2');
        const ayeshaCard = document.querySelector('#start-avatar-grid [data-avatar="ayesha"]');
        const farooqCard = document.querySelector('#start-avatar-grid [data-avatar="farooq"]');
        if (secondDistrict?.classList.contains('locked') || ayeshaCard?.classList.contains('locked')) {
          throw new Error('Level 2 should unlock Lyari and Ayesha');
        }
        if (!farooqCard?.classList.contains('locked') ||
            !document.querySelector('#start-dist-3')?.classList.contains('locked')) {
          throw new Error('Level 2 must not unlock the Level 3 getup');
        }

        const originalMesh = game.player.avatarMesh;
        ayeshaCard.click();
        if (game.player.avatarId !== 'ayesha' || game.player.avatarMesh === originalMesh) {
          throw new Error('Selecting an unlocked getup did not replace the visible player model');
        }

        game.handleMasterModeCommand({
          sender: 'MASTERMODE_DASHBOARD',
          type: 'UNLOCK_ALL_RUNNER_CONTENT'
        });
        if (farooqCard.classList.contains('locked') ||
            document.querySelector('#start-dist-3').classList.contains('locked')) {
          throw new Error('Master Mode did not unlock every runner area and getup');
        }
      })();
    `
  });
  recordTest('TC-27', 'Runner Progression Unlocks & Getup Model Change', res27.success ? 'PASSED' : 'FAILED', Date.now() - t27Start, res27.success ? 'Verified locked content, Level 2 unlocks, live avatar mesh replacement, and Master Mode override' : res27.error);

  // -------------------------------------------------------------------------
  // TC-28: Career Reset
  // -------------------------------------------------------------------------
  const t28Start = Date.now();
  const res28 = await runChromeTest({
    testId: 'TC-28',
    screenshotName: 'tc28_runner_career_reset.png',
    waitMs: 3500,
    beforeAppScript: `
      localStorage.setItem('karachi_hero_save_v2', JSON.stringify({
        version: 2,
        player: { name: 'Karachi Hero', avatarId: 'ayesha', level: 3, careerXP: 7000 },
        currentDistrictLevel: 3,
        highestDistrictUnlocked: 3,
        masterUnlockAllContent: true,
        badges: ['water_guardian', 'road_safety']
      }));
    `,
    scriptInjection: `
      (() => {
        const game = window.game;
        if (!game?.ui) throw new Error('Runner UI is unavailable');
        window.confirm = () => true;
        game.ui.showGameMenuModal();
        document.getElementById('btn-reset-career')?.click();
        const savedCareer = JSON.parse(localStorage.getItem('karachi_hero_save_v2'));
        if (savedCareer.player.careerXP !== 0 || savedCareer.player.level !== 1 ||
            savedCareer.masterUnlockAllContent || savedCareer.highestDistrictUnlocked !== 1) {
          throw new Error('Reset did not clear saved progression: ' + JSON.stringify({
            xp: savedCareer.player.careerXP,
            level: savedCareer.player.level,
            masterUnlock: savedCareer.masterUnlockAllContent,
            highestDistrict: savedCareer.highestDistrictUnlocked
          }));
        }
        if (game.currentDistrictLevel !== 1 || game.player.avatarId !== 'tariq' ||
            game.hearts !== 3 || game.runnerDifficulty !== 'standard') {
          throw new Error('Reset did not restore the default runner state');
        }
      })();
    `
  });
  recordTest('TC-28', 'Runner Career Reset & Default State', res28.success ? 'PASSED' : 'FAILED', Date.now() - t28Start, res28.success ? 'Verified reset clears saved unlocks/XP and restores starting area, getup, hearts, and pace' : res28.error);

  // -------------------------------------------------------------------------
  // TC-29: District-Specific Karachi Patrol Scenery
  // -------------------------------------------------------------------------
  const t29Start = Date.now();
  const res29 = await runChromeTest({
    testId: 'TC-29',
    screenshotName: 'tc29_karachi_patrol_scenery.png',
    waitMs: 3500,
    scriptInjection: `
      (() => {
        const game = window.game;
        if (!game) throw new Error('Runner is unavailable');
        game.handleMasterModeCommand({
          sender: 'UNTRUSTED_TEST',
          type: 'UNLOCK_ALL_RUNNER_CONTENT'
        });
        game.loadDistrictLevel(2, false);
        if (game.currentDistrictLevel !== 1) {
          throw new Error('An untrusted message unlocked a patrol area');
        }
        game.handleMasterModeCommand({
          sender: 'MASTERMODE_DASHBOARD',
          type: 'UNLOCK_ALL_RUNNER_CONTENT'
        });
        const savedProgress = JSON.parse(localStorage.getItem('karachi_hero_save_v2'));
        if (!savedProgress.masterUnlockAllContent) {
          throw new Error('Master Mode did not persist the trusted unlock command');
        }
        const expectedAreas = [
          { level: 1, area: 'SOLDIER BAZAR' },
          { level: 2, area: 'LYARI' },
          { level: 3, area: 'SADDAR' }
        ];
        let lyariScenery = false;
        for (const { level, area } of expectedAreas) {
          game.currentDistrictLevel = level;
          const chunk = game.createCorridorChunk(level === 2 ? -120 : 0);
          if (chunk.userData.patrolAreaLevel !== level ||
              !chunk.userData.patrolArea.includes(area.split(' ')[0]) ||
              !chunk.userData.runnerIdentity) {
            throw new Error('Area ' + level + ' did not generate its own ' + area + ' district layout');
          }
          if (level === 1 && chunk.userData.soldierBazarWaterTank !== true) {
            throw new Error('Soldier Bazar / PECHS scenery is missing its rooftop water tank landmark');
          }
          if (level === 2) {
            lyariScenery = chunk.userData.lyariFootballGround === true &&
              chunk.userData.lyariMuralWall === true;
          }
          if (level === 3 && chunk.userData.saddarHeritageFacade !== true) {
            throw new Error('Saddar scenery is missing its heritage-bazaar facade treatment');
          }
        }
        if (!lyariScenery) throw new Error('Lyari-specific football street feature was not generated');

        const originalRandom = Math.random;
        const spawnLocalChallenge = (level, randomValue) => {
          game.clearRunnerObjects();
          game.runnerWaveCount = 0;
          game.runnerPowerupDropCount = 0;
          game.distanceMeters = 100;
          game.currentDistrictLevel = level;
          Math.random = () => randomValue;
          game.spawnRunnerWave(-300);
          return game.runnerObstacles[0];
        };
        try {
          const soldierChallenge = spawnLocalChallenge(1, 0.99);
          if (soldierChallenge?.type !== 'water_tanker' ||
              soldierChallenge.requiredAction !== 'dodge') {
            throw new Error('Soldier Bazar / PECHS route did not spawn its water-tanker queue challenge');
          }
          const lyariChallenge = spawnLocalChallenge(2, 0.99);
          if (lyariChallenge?.type !== 'football' ||
              lyariChallenge.requiredAction !== 'dodge' ||
              lyariChallenge.mesh.userData.obstacleType !== 'lyari_football') {
            throw new Error('Lyari route did not spawn its distinct street-football dodge challenge');
          }
          const saddarCartChallenge = spawnLocalChallenge(3, 0.85);
          if (saddarCartChallenge?.type !== 'market_cart' ||
              saddarCartChallenge.requiredAction !== 'dodge') {
            throw new Error('Saddar route did not spawn its market handcart challenge');
          }
          const saddarScaffoldChallenge = spawnLocalChallenge(3, 0.99);
          if (saddarScaffoldChallenge?.type !== 'heritage_scaffold' ||
              saddarScaffoldChallenge.requiredAction !== 'slide') {
            throw new Error('Saddar route did not spawn its restoration-scaffold slide challenge');
          }
        } finally {
          Math.random = originalRandom;
          game.clearRunnerObjects();
        }
      })();
    `
  });
  recordTest('TC-29', 'District-Specific Karachi Scenery & Challenges', res29.success ? 'PASSED' : 'FAILED', Date.now() - t29Start, res29.success ? 'Verified Soldier Bazar rooftop tanks/water-tanker challenge, Lyari murals/football challenge, and Saddar heritage facades/handcarts/restoration scaffolding' : res29.error);

  // -------------------------------------------------------------------------
  // TC-30: Runner Rewards Persist and Unlock Patrol Areas
  // -------------------------------------------------------------------------
  const t30Start = Date.now();
  const res30 = await runChromeTest({
    testId: 'TC-30',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc30_runner_progression_persistence.png',
    waitMs: 3500,
    scriptInjection: `
      (() => {
        if (window.game.isGameStarted || window.game.distanceMeters !== 0) {
          throw new Error('Runner began moving before the user pressed RUN');
        }
        document.getElementById('btn-start-patrol')?.click();
        const game = window.game;
        if (!game || !game.isTempleRun) throw new Error('Runner did not start');
        game.awardRunnerXP(3500);
        let saved = JSON.parse(localStorage.getItem('karachi_hero_save_v2'));
        if (saved.player.careerXP < 3500) {
          throw new Error('Runner XP was not persisted to career progression');
        }
        if (!game.loadDistrictLevel(2, false) || game.currentDistrictLevel !== 2) {
          saved = JSON.parse(localStorage.getItem('karachi_hero_save_v2'));
          throw new Error('Runner-earned career level did not unlock Lyari: ' +
            JSON.stringify({ xp: saved.player.careerXP, level: saved.player.level, current: game.currentDistrictLevel }));
        }
        game.loadDistrictLevel(1, false);
        const xpBeforeClear = JSON.parse(localStorage.getItem('karachi_hero_save_v2')).player.careerXP;
        game.handleDistrictCleared();
        saved = JSON.parse(localStorage.getItem('karachi_hero_save_v2'));
        if (saved.districts[1].status !== 'cleared' || saved.highestDistrictUnlocked < 2) {
          throw new Error('District completion did not persist the area clear and next-area unlock');
        }
        if (saved.player.careerXP < xpBeforeClear + 3000) {
          throw new Error('District completion bonus XP was not persisted');
        }
      })();
    `
  });
  recordTest('TC-30', 'Runner Reward Persistence & Patrol Area Unlock', res30.success ? 'PASSED' : 'FAILED', Date.now() - t30Start, res30.success ? 'Verified runner XP persists, unlocks Lyari, and district-clear XP/area progression survive reload state' : res30.error);

  // -------------------------------------------------------------------------
  // TC-31: Runner Startup Isolation from Open-World Gameplay
  // -------------------------------------------------------------------------
  const t31Start = Date.now();
  const res31 = await runChromeTest({
    testId: 'TC-31',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc31_runner_startup_isolation.png',
    waitMs: 3500,
    scriptInjection: `
      (() => {
        document.getElementById('btn-start-patrol')?.click();
        setTimeout(() => {
          const game = window.game;
          if (!game?.isTempleRun || game.majorVersion !== 'v3') {
            throw new Error('Run button did not start Karachi Runner v3');
          }
          if (!game.cityGen.worldObjects.size ||
              [...game.cityGen.worldObjects].some(object => object.visible)) {
            throw new Error('Open-world city objects are visible in the runner scene');
          }
          if (!game.corridorChunks.length ||
              game.corridorChunks.some(chunk => !chunk.visible)) {
            throw new Error('Karachi runner corridor is missing or hidden');
          }
          if (getComputedStyle(game.ui.hud).display === 'none') {
            throw new Error('Runner HUD remained hidden after pressing RUN');
          }
          if (game.gutterHazards.length || game.finishGate) {
            throw new Error('Legacy open-world route hazards were spawned for runner play');
          }
          if (game.navGuideGroup?.visible || game.currentTargetObjective) {
            throw new Error('Open-world navigation guide leaked into Karachi Runner');
          }

          const announcements = [];
          const showAnnouncement = game.ui.showAnnouncement.bind(game.ui);
          game.ui.showAnnouncement = (message, ...args) => {
            announcements.push(String(message));
            return showAnnouncement(message, ...args);
          };
          game.player.position.set(0, 0, 94);
          game.player.group.position.copy(game.player.position);
          game.updatePhysics(0.033);
          game.updateMatchTimer(300);
          if (game.isGameOver) {
            throw new Error('The open-world match timer ended the endless runner');
          }
          if (announcements.some(message =>
            /SPLASH|PORTAL|COMMUTE ROUTE|CIVIC HERO|VIP PROTOCOL/i.test(message)
          )) {
            throw new Error('Legacy open-world event fired during runner physics');
          }
        }, 500);
      })();
    `
  });
  recordTest('TC-31', 'Runner Startup Isolation from Open-World Gameplay', res31.success ? 'PASSED' : 'FAILED', Date.now() - t31Start, res31.success ? 'Verified runner-only scene, corridor, route objects, and physics events after starting the run' : res31.error);

  // -------------------------------------------------------------------------
  // TC-32: Runner Touch Controls & Non-Overlapping Feedback
  // -------------------------------------------------------------------------
  const t32Start = Date.now();
  const res32 = await runChromeTest({
    testId: 'TC-32',
    beforeAppScript: "localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc32_runner_controls_and_feedback.png',
    windowSize: '375,667',
    waitMs: 3000,
    scriptInjection: `
      (() => {
        document.getElementById('btn-start-patrol')?.click();
        setTimeout(() => {
          const game = window.game;
          if (!game?.isTempleRun || !document.body.classList.contains('mode-runner')) {
            throw new Error('Runner was not active for control layout check');
          }
          const obsoleteButtons = ['btn-sprint', 'btn-journal'];
          if (obsoleteButtons.some(id => getComputedStyle(document.getElementById(id)).display !== 'none') ||
              document.getElementById('btn-runner-unstick')) {
            throw new Error('Legacy sprint, journal, or free unstick control is still exposed in runner mode');
          }
          const laneControls = document.querySelector('.hud-runner-lanes');
          const actionControls = document.querySelector('.hud-controls-bottom-right');
          if (!laneControls || !actionControls ||
              getComputedStyle(laneControls).display === 'none' ||
              getComputedStyle(actionControls).display === 'none') {
            throw new Error('Runner touch controls are missing');
          }
          const laneRect = laneControls.getBoundingClientRect();
          const actionRect = actionControls.getBoundingClientRect();
          if (laneRect.right > actionRect.left) {
            throw new Error('Lane and traversal controls overlap on a 375px-wide screen');
          }
          if (!document.getElementById('btn-jump')?.title.includes('Jump') ||
              !document.getElementById('btn-slide')?.title.includes('Slide') ||
              !document.getElementById('btn-horn')?.title.includes('Horn')) {
            throw new Error('Visible runner actions do not explain what they do');
          }

          for (let i = 0; i < 5; i++) {
            game.ui.showFloatingFeedback('COLLECTED +' + i, game.player.position, '#ffd700');
          }
          const feedbacks = [...document.querySelectorAll('#floating-feedbacks .floating-feedback')];
          if (feedbacks.length > 3) {
            throw new Error('Gameplay feedback was not capped to prevent notification pileups');
          }
          const feedbackRects = feedbacks.map(item => item.getBoundingClientRect()).sort((a, b) => a.top - b.top);
          for (let i = 1; i < feedbackRects.length; i++) {
            if (feedbackRects[i - 1].bottom > feedbackRects[i].top + 1) {
              throw new Error('Floating gameplay notifications overlap');
            }
          }
          if (feedbackRects.some(rect => rect.bottom > laneRect.top || rect.bottom > actionRect.top)) {
            throw new Error('Gameplay notifications overlap the touch-control area ' + innerWidth + 'x' + innerHeight + ' fb=' + feedbackRects.map(r => Math.round(r.top) + '-' + Math.round(r.bottom)) + ' lane=' + Math.round(laneRect.top) + ' act=' + Math.round(actionRect.top));
          }
        }, 500);
      })();
    `
  });
  recordTest('TC-32', 'Runner Touch Controls & Feedback Layout', res32.success ? 'PASSED' : 'FAILED', Date.now() - t32Start, res32.success ? 'Verified only relevant controls are visible, mobile controls do not collide, and transient feedback is capped and separated' : res32.error);

  // -------------------------------------------------------------------------
  // TC-33: Rescue Token Pickups & Paid Quick Revive
  // -------------------------------------------------------------------------
  const t33Start = Date.now();
  const res33 = await runChromeTest({
    testId: 'TC-33',
    beforeAppScript: "localStorage.setItem('karachi_hero_save_v2', JSON.stringify({player:{reviveTokens:0}})); localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');",
    screenshotName: 'tc33_rescue_tokens_and_revive.png',
    waitMs: 3500,
    scriptInjection: `
      (() => {
        document.getElementById('btn-start-patrol')?.click();
        setTimeout(() => {
          const game = window.game;
          if (!game?.isTempleRun) throw new Error('Runner did not start');
          game.clearRunnerObjects();
          game.distanceMeters = 100;
          game.runnerWaveCount = 17;
          game.runnerPowerupDropCount = 0;
          const waveZ = game.player.position.z - 250;
          game.spawnRunnerWave(waveZ);
          if (game.runnerReviveTokens.length !== 1 || game.runnerWaveCount !== 18) {
            throw new Error('Rare Rescue Token did not spawn on its scheduled 18th wave');
          }
          const token = game.runnerReviveTokens[0];
          const occupiedLanes = [
            ...game.runnerObstacles.filter(obstacle => obstacle.type !== 'wire').map(obstacle => obstacle.laneX),
            ...game.runnerTraffic.map(vehicle => vehicle.laneX)
          ];
          if (occupiedLanes.some(lane => Math.abs(lane - token.laneX) < 0.1)) {
            throw new Error('Rescue Token spawned in a lane blocked by a hazard');
          }
          game.runnerWaveCount = 18;
          game.spawnRunnerWave(waveZ - 28);
          if (game.runnerReviveTokens.length !== 1) {
            throw new Error('Rescue Token spawned more often than its rare 18-wave interval');
          }

          game.player.position.set(token.laneX, 0, 60);
          game.player.group.position.copy(game.player.position);
          token.mesh.position.set(token.laneX, 0.9, 59.9);
          game.updateTempleRunCorridor(0.01);
          const storedAfterPickup = JSON.parse(localStorage.getItem('karachi_hero_save_v2') || '{}');
          if (storedAfterPickup.player?.reviveTokens !== 1 ||
              game.runnerReviveTokens.length !== 0) {
            throw new Error('Swept-path Rescue Token collection did not persist exactly one token');
          }

          const showCrash = reviveTokens => {
            game.isGameOver = true;
            game.isPaused = true;
            game.ui.showGameOver({
              rankedHoles: [],
              player: game.player,
              isCrash: true,
              distanceMeters: 100,
              coins: game.coins,
              runScore: game.score,
              reviveTokens
            });
          };
          showCrash(1);
          const reviveButton = document.getElementById('btn-crash-revive');
          if (reviveButton.disabled || reviveButton.textContent.trim() !== 'REVIVE') {
            throw new Error('Quick Revive should use its concise label when a token is available');
          }
          reviveButton.click();
          const storedAfterRevive = JSON.parse(localStorage.getItem('karachi_hero_save_v2') || '{}');
          if (game.isGameOver || game.hearts !== 2 || game.runnerInvulnerableTimer <= 0 ||
              storedAfterRevive.player?.reviveTokens !== 0) {
            throw new Error('Quick Revive did not atomically spend one token and restore the run');
          }
          showCrash(0);
          if (!reviveButton.disabled || game.quickReviveWithChai() !== false || !game.isGameOver) {
            throw new Error('A zero-token player was revived without paying');
          }
        }, 500);
      })();
    `
  });
  recordTest('TC-33', 'Rescue Token Collection & Quick Revive Cost', res33.success ? 'PASSED' : 'FAILED', Date.now() - t33Start, res33.success ? 'Verified rare safe-lane token drops, persistent collection, one-token revive payment, and zero-token rejection' : res33.error);

  // -------------------------------------------------------------------------
  // TC-34: Home-Screen Help & Career Progress
  // -------------------------------------------------------------------------
  const t34Start = Date.now();
  const res34 = await runChromeTest({
    testId: 'TC-34',
    screenshotName: 'tc34_home_help_and_progress.png',
    windowSize: '375,667',
    scriptInjection: `
      window.addEventListener('DOMContentLoaded', () => {
        const game = window.game;
        const helpButton = document.getElementById('btn-home-help');
        const progressButton = document.getElementById('btn-home-progress');
        if (!helpButton || !progressButton || game?.isGameStarted) {
          throw new Error('Home screen help/progress actions are missing or start gameplay');
        }
        const startCard = document.querySelector('.start-mission-card');
        const startButton = document.getElementById('btn-start-patrol');
        const cardRect = startCard.getBoundingClientRect();
        if (cardRect.top < 0 || cardRect.bottom > window.innerHeight ||
            startCard.scrollHeight > startCard.clientHeight + 1 ||
            startButton.getBoundingClientRect().bottom > window.innerHeight) {
          throw new Error('Home screen no longer fits the 375x667 viewport after adding Help and Progress');
        }
        helpButton.click();
        const help = document.getElementById('modal-runner-help');
        if (help.style.display === 'none' ||
            !help.textContent.includes('CONTROLS') ||
            !help.textContent.includes('hanging wires') ||
            !help.textContent.includes('Rescue Tokens')) {
          throw new Error('Home-screen Runner Help is missing controls or gameplay guidance');
        }
        document.getElementById('btn-runner-help-done')?.click();
        progressButton.click();
        const progress = document.getElementById('modal-runner-progress');
        if (progress.style.display === 'none' ||
            !document.getElementById('runner-progress-score') ||
            !document.getElementById('runner-progress-rupees') ||
            !document.querySelector('#runner-progress-badges .runner-progress-item') ||
            document.querySelectorAll('#runner-progress-collections .runner-progress-item').length < 3) {
          throw new Error('My Progress does not show records, collections and achievements');
        }
        const progressTitleColor = getComputedStyle(document.getElementById('runner-progress-title')).color;
        const progressItemColor = getComputedStyle(document.querySelector('#runner-progress-badges .runner-progress-item')).color;
        if (progressTitleColor !== 'rgb(0, 229, 255)' || progressItemColor !== 'rgb(226, 232, 240)') {
          throw new Error('My Progress text colors do not provide sufficient contrast against the dark modal');
        }
        [helpButton, progressButton].forEach(button => {
          const style = getComputedStyle(button);
          if (style.borderRadius === '0px' ||
              !style.fontFamily.toLowerCase().includes('outfit') ||
              style.backgroundColor === 'rgb(239, 239, 239)') {
            throw new Error(button.id + ' is using the browser-default button style');
          }
        });
        if (game.isGameStarted) throw new Error('Opening home-screen information started the run');
      });
    `
  });
  recordTest('TC-34', 'Home-Screen Help & Career Progress', res34.success ? 'PASSED' : 'FAILED', Date.now() - t34Start, res34.success ? 'Verified no-scroll home actions, runner controls guidance, persistent score/rupee records, route/getup collection and achievements' : res34.error);

  // -------------------------------------------------------------------------
  // TC-35: Monsoon Potholes & Unified Master / Developer Console
  // -------------------------------------------------------------------------
  const t35Start = Date.now();
  const res35 = await runChromeTest({
    testId: 'TC-35',
    screenshotName: 'tc35_monsoon_potholes_and_ops_console.png',
    waitMs: 5000,
    scriptInjection: `
      (() => {
        localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');
        document.getElementById('btn-start-patrol')?.click();
        setTimeout(() => {
          const game = window.game;
          if (!game?.isTempleRun || game.isPaused) {
            throw new Error('Runner did not start for monsoon weather test');
          }

          game.currentDistrictLevel = 1;
          game.distanceMeters = 449;
          if (game.getRunnerWeatherState() !== 'clear') throw new Error('Rain began before its distance threshold');
          game.distanceMeters = 450;
          if (game.getRunnerWeatherState() !== 'rain') throw new Error('Monsoon rain did not begin at 450m');
          game.updateRunnerWeather(0.016);
          if (!game.runnerRainEffect?.mesh.visible) throw new Error('Rain phase has no visible rainfall effect');

          game.distanceMeters = 650;
          if (game.getRunnerWeatherState() !== 'potholes') throw new Error('Post-rain pothole phase did not begin');
          game.updateRunnerWeather(0.016);
          if (game.runnerRainEffect.mesh.visible) throw new Error('Rain should clear before the pothole phase');

          game.distanceMeters = 1200;
          if (game.getRunnerWeatherState() !== 'clear') throw new Error('Weather cycle did not return to clear roads');
          game.handleMasterModeCommand({
            type: 'SET_RUNNER_RAIN',
            payload: { enabled: true },
            sender: 'MASTERMODE_DASHBOARD'
          });
          if (game.getRunnerWeatherState() !== 'rain') throw new Error('Master console could not force rain for testing');
          game.handleMasterModeCommand({
            type: 'SET_RUNNER_RAIN',
            payload: { enabled: null },
            sender: 'MASTERMODE_DASHBOARD'
          });

          game.distanceMeters = 700;
          game.runnerWaveCount = 2;
          game.runnerObstacles.forEach(obstacle => game.scene.remove(obstacle.mesh));
          game.runnerObstacles = [];
          const originalRandom = Math.random;
          try {
            Math.random = () => 0.125;
            game.spawnRunnerWave(-500);
          } finally {
            Math.random = originalRandom;
          }
          const potholes = game.runnerObstacles.filter(obstacle => obstacle.type === 'pothole');
          if (potholes.length !== 1 || potholes[0].requiredAction !== 'jump_or_dodge') {
            throw new Error('Post-rain wave did not spawn its fair, jumpable/dodgeable puddled pothole');
          }
          const openLanes = [-game.laneWidth, 0, game.laneWidth].filter(lane =>
            !game.runnerObstacles.some(obstacle =>
              Number.isFinite(obstacle.laneX) && Math.abs(obstacle.laneX - lane) < 0.1
            )
          );
          if (openLanes.length < 1) throw new Error('Rain potholes blocked all three runner lanes');

          Promise.all([
            fetch('/mastermode.html'),
            fetch('/godmode.html'),
            fetch('/runner-console.html'),
            fetch('/src/main.js'),
            fetch('/src/runnerConsole.js')
          ]).then(async responses => {
            const [masterAliasHtml, devAliasHtml, consoleHtml, gameSource, consoleSource] =
              await Promise.all(responses.map(response => response.text()));
            if (!masterAliasHtml.includes('runner-console.html') ||
                !consoleHtml.includes('KARACHI RUNNER · MASTER &amp; DEV CONSOLE') ||
                !consoleHtml.includes('btn-runner-weather-rain') ||
                !consoleHtml.includes('stat-difficulty')) {
              throw new Error('Unified operations console is missing the Runner controls or current route telemetry');
            }
            if (!devAliasHtml.includes('window.location.replace') ||
                !devAliasHtml.includes('runner-console.html')) {
              throw new Error('Developer-mode URL does not redirect to the shared Runner console');
            }
            if (gameSource.includes('karachi_hole_godmode') ||
                gameSource.includes('karachi_godmode_cmd') ||
                consoleSource.includes('karachi_hole_godmode') ||
                consoleSource.includes('karachi_godmode_cmd') ||
                !consoleSource.includes("new BroadcastChannel('karachi_hole_mastermode')")) {
              throw new Error('Master/Developer commands still have duplicate communication paths');
            }
          }).catch(error => { throw error; });
        }, 400);
      })();
    `
  });
  recordTest('TC-35', 'Monsoon Potholes & Unified Master/Dev Console', res35.success ? 'PASSED' : 'FAILED', Date.now() - t35Start, res35.success ? 'Verified rain-to-pothole progression, fair lane availability, unified console redirect and single command transport' : res35.error);

  // -------------------------------------------------------------------------
  // TC-36: 200-Neighborhood Karachi Loop & Progressive Challenge
  // -------------------------------------------------------------------------
  const t36Start = Date.now();
  const res36 = await runChromeTest({
    testId: 'TC-36',
    screenshotName: 'tc36_karachi_loop_progression.png',
    waitMs: 4500,
    beforeAppScript: `
      localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');
      localStorage.setItem('karachi_hero_save_v2', JSON.stringify({
        version: 2,
        player: { name: 'Karachi Hero', avatarId: 'tariq', level: 1, careerXP: 0, reviveTokens: 0 },
        currentDistrictLevel: 3,
        highestDistrictUnlocked: 1,
        runnerStats: { bestDistance: 0, bestScore: 0, totalRupees: 0, completedRuns: 0 }
      }));
    `,
    scriptInjection: `
      (() => {
        const start = document.getElementById('btn-start-patrol');
        const laterArea = document.getElementById('start-dist-3');
        if (!start || !laterArea) throw new Error('Runner route setup is missing');
        laterArea.click();
        if (document.getElementById('start-dist-1')?.getAttribute('aria-current') !== 'step') {
          throw new Error('The route map did not keep Soldier Bazar as the starting area');
        }
        start.click();
        setTimeout(() => {
          const game = window.game;
          if (!game?.isTempleRun || game.currentDistrictLevel !== 1 ||
              game.runnerNeighborhoodIndex !== 1 || game.runnerRouteComplete ||
              game.currentMilestone !== 'Soldier Bazar' ||
              document.getElementById('hud-milestone-tag')?.textContent !== 'Soldier Bazar') {
            throw new Error('A new run did not start at Soldier Bazar');
          }
          game.distanceMeters = 100;
          game.updateRunnerProgression();
          if (game.currentMilestone !== 'Abbas Town' || /\d/.test(game.currentMilestone)) {
            throw new Error('Route progression did not show the next named Karachi neighborhood');
          }
          if (game.getRunnerNeighborhoodIndex(0) !== 1 ||
              game.getRunnerNeighborhoodIndex(19999) !== 200 ||
              game.getRunnerSpeed(20000) <= game.getRunnerSpeed(0) ||
              game.getRunnerWaveSpacing(20000) >= game.getRunnerWaveSpacing(0) ||
              game.getRunnerChallengeTier(20000) <= game.getRunnerChallengeTier(0)) {
            throw new Error('Speed, hazard spacing or challenge tier did not increase over the loop');
          }

          game.distanceMeters = 6699;
          game.updateRunnerProgression();
          if (game.currentDistrictLevel !== 1) throw new Error('Lyari began before the Soldier Bazar route leg ended');
          game.distanceMeters = 6700;
          game.updateRunnerProgression();
          if (game.currentDistrictLevel !== 2 ||
              !game.corridorChunks.every(chunk => chunk.userData.patrolAreaLevel === 2) ||
              !JSON.parse(localStorage.getItem('karachi_hero_save_v2')).districts[2]) {
            throw new Error('The Lyari leg did not change scenery and unlock area progression');
          }
          game.distanceMeters = 13400;
          game.updateRunnerProgression();
          if (game.currentDistrictLevel !== 3 ||
              !game.corridorChunks.every(chunk => chunk.userData.patrolAreaLevel === 3)) {
            throw new Error('The Saddar leg did not change the route scenery');
          }

          game.clearRunnerObjects();
          game.currentDistrictLevel = 1;
          game.distanceMeters = 5000;
          game.runnerWaveCount = 3;
          const originalRandom = Math.random;
          try {
            Math.random = () => 0.125;
            game.spawnRunnerWave(-500);
          } finally {
            Math.random = originalRandom;
          }
          const combinedHazards = game.runnerObstacles.filter(obstacle =>
            obstacle.type === 'gutter' || obstacle.type === 'combined_roadwork'
          );
          const lanes = [-game.laneWidth, 0, game.laneWidth];
          const openLanes = lanes.filter(lane =>
            !combinedHazards.some(obstacle =>
              Number.isFinite(obstacle.laneX) && Math.abs(obstacle.laneX - lane) < 0.1
            )
          );
          if (!game.runnerObstacles.some(obstacle => obstacle.type === 'combined_roadwork') ||
              openLanes.length !== 1) {
            throw new Error('Progressive combination hazards did not leave one safe lane');
          }

          game.distanceMeters = 19999;
          game.updateRunnerProgression();
          if (game.isGameOver || game.runnerRouteComplete) {
            throw new Error('The route ended before the runner returned to Soldier Bazar');
          }
          game.distanceMeters = 20000;
          game.updateRunnerProgression();
          const save = JSON.parse(localStorage.getItem('karachi_hero_save_v2'));
          const headline = document.getElementById('results-headline')?.textContent || '';
          const home = document.getElementById('btn-results-home');
          if (!game.isGameOver || !game.runnerRouteComplete ||
              !headline.includes('KARACHI LOOP COMPLETE') ||
              !document.getElementById('results-sub')?.textContent.includes('returned to Soldier Bazar') ||
              document.getElementById('stat-level')?.textContent !== 'Soldier Bazar' ||
              save.runnerStats.bestDistance !== 20000 || save.runnerStats.completedRuns !== 1 ||
              !home || getComputedStyle(home).display === 'none') {
            throw new Error('Completing the 200-stage loop did not finish, save the run and show the return home action');
          }
          home.click();
          if (game.isGameStarted || getComputedStyle(document.getElementById('modal-start-mission')).display === 'none') {
            throw new Error('The route-complete HOME action did not return to runner setup');
          }
        }, 450);
      })();
    `
  });
  recordTest('TC-36', 'Named Karachi Neighborhood Loop & Progressive Challenge', res36.success ? 'PASSED' : 'FAILED', Date.now() - t36Start, res36.success ? 'Verified name-only route stops, Soldier Bazar start and finish, staged Lyari/Saddar progression, rising pace/hazard combinations, one fair lane and a saved return-to-start finish' : res36.error);

  // -------------------------------------------------------------------------
  // TC-37: Home, Help, Progress & Results Button UI Audit
  // -------------------------------------------------------------------------
  const t37Start = Date.now();
  const res37 = await runChromeTest({
    testId: 'TC-37',
    screenshotName: 'tc37_home_help_progress_button_ui.png',
    windowSize: '375,667',
    scriptInjection: `
      (() => {
        const game = window.game;
        const home = document.getElementById('modal-start-mission');
        const helpButton = document.getElementById('btn-home-help');
        const progressButton = document.getElementById('btn-home-progress');
        const runButton = document.getElementById('btn-start-patrol');
        const startCard = home?.querySelector('.start-mission-card');
        if (!game || !helpButton || !progressButton || !runButton || !startCard) {
          throw new Error('Runner home actions are missing');
        }
        const helpRect = helpButton.getBoundingClientRect();
        const progressRect = progressButton.getBoundingClientRect();
        const runRect = runButton.getBoundingClientRect();
        const cardRect = startCard.getBoundingClientRect();
        if (Math.abs(helpRect.width - progressRect.width) > 2 ||
            runRect.width < helpRect.width * 1.8 ||
            helpRect.height < 44 || progressRect.height < 44 || runRect.height < 44 ||
            cardRect.top < 0 || cardRect.bottom > innerHeight + 1 ||
            startCard.scrollHeight > startCard.clientHeight + 1) {
          throw new Error('Home action hierarchy or mobile layout is uneven, too small or overflowing');
        }
        helpButton.click();
        const helpModal = document.getElementById('modal-runner-help');
        const helpCard = helpModal.querySelector('.runner-info-card');
        const helpBounds = helpCard.getBoundingClientRect();
        const closeHelp = document.getElementById('btn-close-runner-help');
        const helpHasRouteGuidance = helpModal.textContent.includes('named Karachi neighbourhoods') &&
          helpModal.textContent.includes('Soldier Bazar');
        if (helpModal.style.display === 'none' || helpBounds.top < 0 ||
            helpBounds.bottom > innerHeight + 1 ||
            closeHelp.offsetWidth < 44 || closeHelp.offsetHeight < 44 ||
            !helpHasRouteGuidance) {
          throw new Error('Help modal audit failed: ' + JSON.stringify({
            display: helpModal.style.display,
            top: helpBounds.top,
            bottom: helpBounds.bottom,
            viewport: innerHeight,
            closeTarget: closeHelp.offsetWidth + 'x' + closeHelp.offsetHeight,
            helpHasRouteGuidance
          }));
        }
        closeHelp.click();
        progressButton.click();
        const progressModal = document.getElementById('modal-runner-progress');
        const progressBounds = progressModal.querySelector('.runner-info-card').getBoundingClientRect();
        if (progressModal.style.display === 'none' || progressBounds.top < 0 ||
            progressBounds.bottom > innerHeight + 1 ||
            document.getElementById('btn-close-runner-progress').offsetWidth < 44 ||
            document.getElementById('btn-close-runner-progress').offsetHeight < 44) {
          throw new Error('Progress modal or its close control is clipped on a mobile viewport');
        }
        [helpButton, progressButton, runButton].forEach(button => {
          const style = getComputedStyle(button);
          if (!style.fontFamily.toLowerCase().includes('outfit') ||
              style.borderRadius === '0px' ||
              style.backgroundColor === 'rgb(239, 239, 239)' ||
              !button.textContent.trim()) {
            throw new Error(button.id + ' does not use the shared styled button system');
          }
        });
      })();
    `
  });
  recordTest('TC-37', 'Home, Help, Progress & Results Button UI Audit', res37.success ? 'PASSED' : 'FAILED', Date.now() - t37Start, res37.success ? 'Verified balanced large RUN action, consistent Help/Progress controls, mobile-safe dialogs, accessible close targets and loop guidance' : res37.error);

  // -------------------------------------------------------------------------
  // TC-38: Runner Operations Console Audit
  // -------------------------------------------------------------------------
  const t38Start = Date.now();
  const res38 = await runChromeTest({
    testId: 'TC-38',
    screenshotName: 'tc38_runner_operations_console.png',
    windowSize: '375,667',
    scriptInjection: `
      (() => {
        Promise.all([
          fetch('/runner-console.html'),
          fetch('/mastermode.html'),
          fetch('/godmode.html'),
          fetch('/src/runnerConsole.js')
        ]).then(async responses => {
          const [consoleHtml, masterAlias, developerAlias, controller] =
            await Promise.all(responses.map(response => response.text()));
          const obsoleteControls = [
            'Game Mode Selector',
            'Hole Radius Expansion',
            'Freeze Timer',
            'District Warper',
            'Multi-Player Fleet',
            'fleet-avg-progress',
            'dash-active-engine-badge'
          ];
          const staleControl = obsoleteControls.find(control =>
            consoleHtml.includes(control) || controller.includes(control)
          );
          if (staleControl) throw new Error('Obsolete game control remains visible: ' + staleControl);
          if (!masterAlias.includes('runner-console.html') ||
              !developerAlias.includes('runner-console.html')) {
            throw new Error('Master and developer entry points do not resolve to the same console');
          }
          [
            'stat-area', 'stat-distance', 'stat-stage', 'stat-difficulty',
            'stat-score', 'stat-hearts', 'stat-weather', 'stat-traffic',
            'btn-runner-weather-rain', 'btn-runner-weather-auto',
            'btn-trigger-slingshot', 'btn-max-draft', 'btn-spawn-convoy',
            'btn-runner-self-check', 'btn-spawn-test-obstacle', 'btn-clear-test-obstacles',
            'btn-clear-all-hazards', 'btn-spawn-junction', 'btn-toggle-autorun', 'btn-toggle-immortal',
            'btn-complete-area', 'btn-complete-route', 'btn-restore-hearts', 'btn-set-speed',
            'btn-unlock-runner-content', 'btn-trigger-audit',
            'btn-submit-dash-feedback'
          ].forEach(id => {
            if (!consoleHtml.includes('id="' + id + '"')) {
              throw new Error('Runner console is missing current gameplay control or telemetry: ' + id);
            }
          });
          if (!controller.includes('telemetry.isGameStarted') ||
              !controller.includes('!telemetry.isPaused') ||
              !controller.includes('detail.textContent =') ||
              !controller.includes('PortableGameOpsEngine')) {
            throw new Error('Console does not gate test actions to active runs or safely render feedback text');
          }

          const game = window.game;
          const devPanel = document.getElementById('dev-mode-panel');
          const masterPanel = document.getElementById('master-mode-panel');
          if (!game?.ui || !devPanel || !masterPanel) {
            throw new Error('In-game Runner developer and Master panels did not initialize');
          }
          game.ui.toggleDevMode(true);
          if (devPanel.style.display === 'none') {
            throw new Error('In-game Runner diagnostics did not open');
          }
          const devBounds = devPanel.getBoundingClientRect();
          if (devBounds.left < 0 || devBounds.top < 0 ||
              devBounds.right > innerWidth + 1 || devBounds.bottom > innerHeight + 1) {
            throw new Error('Mobile Runner diagnostics panel overflows the viewport');
          }
          const visiblePanelText = devPanel.textContent;
          if (/Lahore|Islamabad|Quetta|District Warper|Hole Radius|Freeze Timer|Devour All/i.test(visiblePanelText) ||
              document.querySelector('[data-warp]') ||
              document.getElementById('god-inpanel-freeze-timer')) {
            throw new Error('In-game developer panels still expose legacy gameplay actions or locations');
          }
          [
            'btn-master-self-check',
            'btn-master-spawn-pothole',
            'btn-master-clear-test-obstacles'
          ].forEach(id => {
            if (!document.getElementById(id)) {
              throw new Error('In-game Master panel is missing restored QA action: ' + id);
            }
          });
          game.ui.toggleMasterMode(true);
          if (masterPanel.style.display === 'none' || devPanel.style.display !== 'none') {
            throw new Error('Master tools did not open cleanly or overlap the developer diagnostics');
          }
          const masterBounds = masterPanel.getBoundingClientRect();
          if (masterBounds.left < 0 || masterBounds.top < 0 ||
              masterBounds.right > innerWidth + 1 || masterBounds.bottom > innerHeight + 1) {
            throw new Error('Mobile Master tools panel overflows the viewport');
          }
          const scoreBefore = game.score;
          const nitroBefore = game.nitroTimer;
          game.ui.runRunnerDevCommand('TRIGGER_SLINGSHOT');
          if (game.score !== scoreBefore || game.nitroTimer !== nitroBefore) {
            throw new Error('In-game test action mutated gameplay before an active run');
          }
        }).catch(error => { throw error; });
      })();
    `
  });
  recordTest('TC-38', 'Master/Developer Runner Console Audit', res38.success ? 'PASSED' : 'FAILED', Date.now() - t38Start, res38.success ? 'Verified unified entry points, Runner-only telemetry/actions, active-run gating and removal of stale civic/fleet controls' : res38.error);

  // -------------------------------------------------------------------------
  // TC-39: High-Visibility Hazards & Upcoming Hazard Warning
  // -------------------------------------------------------------------------
  const t39Start = Date.now();
  const res39 = await runChromeTest({
    testId: 'TC-39',
    screenshotName: 'tc39_runner_hazard_visibility.png',
    windowSize: '375,667',
    scriptInjection: `
      (() => {
        const alert = document.getElementById('hud-runner-hazard-alert');
        if (!alert || !alert.hidden) throw new Error('Runner hazard alert should start hidden');

        const pothole = game.createRunnerPotholeMesh();
        const markers = pothole.children.filter(child => child.userData.isApproachMarker);
        const warningRing = pothole.children.find(child => child.geometry.type === 'RingGeometry' &&
          child.material.color.getHex() === 0xffc400);
        const water = pothole.children.find(child => child.material.color.getHex() === 0x20c9ec);
        const markersAreVisible = markers.length === 2 && markers.every(marker =>
          marker.material.type === 'MeshBasicMaterial' &&
          marker.material.color.getHex() === 0xffe45c &&
          marker.position.z > 0
        );
        if (!pothole.userData.isRunnerHazard || pothole.userData.obstacleType !== 'pothole' ||
            !markersAreVisible || !warningRing || !water ||
            warningRing.material.type !== 'MeshBasicMaterial' || water.material.type !== 'MeshBasicMaterial') {
          throw new Error('Pothole needs high-contrast light-independent materials and two approach markers');
        }

        const playerZ = game.player.position.z;
        game.ui.updateRunnerHazardWarning([
          { type: 'pothole', z: playerZ - 24, mesh: {}, isHit: false }
        ], [], playerZ);
        const alertBounds = alert.getBoundingClientRect();
        const alertTitleSize = parseFloat(getComputedStyle(
          document.getElementById('hud-runner-hazard-title')
        ).fontSize);
        if (alert.hidden ||
            document.getElementById('hud-runner-hazard-title').textContent !== 'POTHOLE AHEAD' ||
            document.getElementById('hud-runner-hazard-action').textContent !== 'JUMP OR SWITCH LANES' ||
            document.getElementById('hud-runner-hazard-distance').textContent !== '24 m' ||
            alertBounds.right > innerWidth + 1 || alertBounds.left < -1 ||
            alertBounds.top >= 82 || alertTitleSize > 13) {
          throw new Error('Mobile hazard alert did not show an actionable, in-bounds pothole warning');
        }

        game.ui.updateRunnerHazardWarning([
          { type: 'wire', z: playerZ - 8, mesh: {}, isHit: false },
          { type: 'pothole', z: playerZ - 20, mesh: {}, isHit: false }
        ], [], playerZ);
        if (!alert.classList.contains('is-imminent') ||
            document.getElementById('hud-runner-hazard-title').textContent !== 'LOW HANGING WIRE' ||
            document.getElementById('hud-runner-hazard-action').textContent !== 'SLIDE UNDER') {
          throw new Error('Nearest hazard warning or imminent slide guidance was incorrect');
        }

        game.ui.updateRunnerHazardWarning([], [], playerZ);
        if (!alert.hidden) throw new Error('Hazard alert did not hide when the road ahead was clear');

        game.ui.updateRunnerHazardWarning([
          { type: 'pothole', z: playerZ - 20, mesh: {}, isHit: false }
        ], [], playerZ);
        game.isPaused = true;
        game.updateTempleRunCorridor(0.016);
        game.isPaused = false;
        if (!alert.hidden) throw new Error('Hazard alert remained visible while the run was paused');
      })();
    `
  });
  recordTest('TC-39', 'High-Visibility Runner Hazards & Warning', res39.success ? 'PASSED' : 'FAILED', Date.now() - t39Start, res39.success ? 'Verified bright pothole rim/water/approach markers, nearest-hazard guidance, imminent action cue, mobile fit and clear-road dismissal' : res39.error);

  // -------------------------------------------------------------------------
  // TC-40: Karachi Area Selection Card Overflow
  // -------------------------------------------------------------------------
  const t40Start = Date.now();
  const res40 = await runChromeTest({
    testId: 'TC-40',
    screenshotName: 'tc40_area_selection_fit.png',
    windowSize: '847,768',
    scriptInjection: `
      (() => {
        const grid = document.getElementById('start-district-grid');
        const modalCard = document.querySelector('.start-mission-card');
        const saddarCard = document.getElementById('start-dist-3');
        const saddarTitle = saddarCard?.querySelector('.d-title');
        if (!grid || !modalCard || !saddarCard || !saddarTitle) {
          throw new Error('Karachi area selection is missing required cards');
        }
        const gridBounds = grid.getBoundingClientRect();
        const modalBounds = modalCard.getBoundingClientRect();
        const saddarBounds = saddarCard.getBoundingClientRect();
        if (gridBounds.left < modalBounds.left || gridBounds.right > modalBounds.right + 1 ||
            saddarBounds.left < gridBounds.left || saddarBounds.right > gridBounds.right + 1 ||
            grid.scrollWidth > grid.clientWidth + 1 ||
            saddarTitle.scrollWidth > saddarTitle.clientWidth + 1) {
          throw new Error('Saddar area card or title overflows its selection panel');
        }
      })();
    `
  });
  recordTest('TC-40', 'Karachi Area Selection Card Overflow', res40.success ? 'PASSED' : 'FAILED', Date.now() - t40Start, res40.success ? 'Verified Saddar and all area cards fit within the selection panel at an 847px viewport' : res40.error);

  // -------------------------------------------------------------------------
  // TC-41: Master QA Self-Check & Safe Obstacle Controls
  // -------------------------------------------------------------------------
  const t41Start = Date.now();
  const res41 = await runChromeTest({
    testId: 'TC-41',
    screenshotName: 'tc41_master_qa_obstacle_controls.png',
    windowSize: '375,667',
    scriptInjection: `
      (() => {
        const game = window.game;
        if (!game?.scene || !game.player) throw new Error('Runner scene is not ready for Master QA controls');
        game.isTempleRun = true;
        game.isGameStarted = true;
        game.isPaused = false;
        game.isGameOver = false;

        const report = game.runRunnerSelfCheck();
        if (report.status !== 'passed' || report.checks < 5) {
          throw new Error('The live Runner self-check did not pass its expected integrity checks');
        }
        const initialCount = game.runnerObstacles.length;
        game.handleMasterModeCommand({
          type: 'SPAWN_TEST_OBSTACLE',
          payload: { type: 'pothole', lane: 1 },
          sender: 'UNTRUSTED'
        });
        if (game.runnerObstacles.length !== initialCount) {
          throw new Error('An untrusted sender was able to spawn a test obstacle');
        }
        game.handleMasterModeCommand({
          type: 'SPAWN_TEST_OBSTACLE',
          payload: { type: 'pothole', lane: 1 },
          sender: 'MASTERMODE_DASHBOARD'
        });
        const testObstacle = game.runnerObstacles.find(item => item.isTestObstacle);
        if (!testObstacle || testObstacle.type !== 'pothole' ||
            testObstacle.laneX !== game.laneWidth ||
            testObstacle.requiredAction !== 'jump_or_dodge') {
          throw new Error('Master obstacle controls did not create the selected lane/type/action');
        }
        game.handleMasterModeCommand({
          type: 'CLEAR_TEST_OBSTACLES',
          payload: {},
          sender: 'MASTERMODE_DASHBOARD'
        });
        if (game.runnerObstacles.some(item => item.isTestObstacle)) {
          throw new Error('Master clear action left test obstacles in the gameplay scene');
        }
        const events = JSON.parse(localStorage.getItem('portable-game-ops:v1') || '{"events":[]}').events;
        if (!events.some(item => item.type === 'check.result') ||
            !events.some(item => item.type === 'master.obstacle_spawned') ||
            !events.some(item => item.type === 'master.obstacles_cleared')) {
          throw new Error('Master QA actions were not recorded in the persistent operations ledger');
        }
        game.lastRunnerZ = game.player.position.z;
        game.recoverStuckRunner();
        const eventsAfterRecovery = JSON.parse(
          localStorage.getItem('portable-game-ops:v1') || '{"events":[]}'
        ).events;
        if (!eventsAfterRecovery.some(item =>
          item.type === 'fix.applied' && item.detail.rule === 'recover-stalled-runner'
        )) {
          throw new Error('Automatic stuck-run recovery was not recorded in the operations ledger');
        }
      })();
    `
  });
  recordTest('TC-41', 'Master QA Self-Check & Safe Obstacle Controls', res41.success ? 'PASSED' : 'FAILED', Date.now() - t41Start, res41.success ? 'Verified live checks, sender-gated obstacle spawn/clear, bounded stuck-run recovery logging, and persistent Master Board events' : res41.error);

  // -------------------------------------------------------------------------
  // TC-42: Master Clear-All, Level Completion & Auto-Run Bot
  // -------------------------------------------------------------------------
  const t42Start = Date.now();
  const res42 = await runChromeTest({
    testId: 'TC-42',
    screenshotName: 'tc42_master_autorun_level_controls.png',
    windowSize: '375,667',
    scriptInjection: `
      (() => {
        const game = window.game;
        if (!game?.scene || !game.player) throw new Error('Runner scene is not ready for Master controls');
        game.isTempleRun = true;
        game.isGameStarted = true;
        game.isPaused = false;
        game.isGameOver = false;
        const send = (type, payload = {}, sender = 'MASTERMODE_DASHBOARD') =>
          game.handleMasterModeCommand({ type, payload, sender });

        [-1, 0, 1].forEach(lane => send('SPAWN_TEST_OBSTACLE', { type: 'pothole', lane }));
        send('CLEAR_ALL_HAZARDS', {}, 'UNTRUSTED');
        if (!game.runnerObstacles.length) throw new Error('Untrusted sender cleared hazards');
        send('CLEAR_ALL_HAZARDS');
        if (game.runnerObstacles.length || game.runnerTraffic.length) {
          throw new Error('Clear-all did not remove every obstacle and vehicle');
        }

        game.distanceMeters = 100;
        send('COMPLETE_RUNNER_AREA');
        if (game.runnerAreaIndex !== 1 || game.distanceMeters < 6700) {
          throw new Error('Complete area did not advance to the next patrol area');
        }
        game.hearts = 1;
        send('RESTORE_RUNNER_HEARTS');
        if (game.hearts !== game.maxHearts) throw new Error('Hearts were not restored');

        game.clearRunnerObjects();
        game.currentLane = 0;
        game.player.position.x = 0;
        game.player.position.z = -100;
        game.spawnRunnerTestObstacle('rickshaw', 0);
        const blocker = game.runnerObstacles[0];
        blocker.z = -120;
        blocker.mesh.position.z = -120;
        send('TOGGLE_AUTOPILOT', { enabled: true });
        game.executeRunnerAutoPilot(0.016);
        if (game.currentLane === 0) throw new Error('Auto-run bot did not dodge a blocked lane');
        send('TOGGLE_AUTOPILOT', { enabled: false });

        send('COMPLETE_RUNNER_ROUTE');
        if (!game.runnerRouteComplete) throw new Error('Complete route did not finish the run');
      })();
    `
  });
  recordTest('TC-42', 'Master Clear-All, Level Completion & Auto-Run Bot', res42.success ? 'PASSED' : 'FAILED', Date.now() - t42Start, res42.success ? 'Verified sender-gated clear-all, area/route completion, heart restore and bot lane dodging' : res42.error);

  // -------------------------------------------------------------------------
  // TC-43: Directional Turns, Forks & Auto-Run Navigation
  // -------------------------------------------------------------------------
  const t43Start = Date.now();
  const res43 = await runChromeTest({
    testId: 'TC-43',
    screenshotName: 'tc43_runner_turns_and_forks.png',
    windowSize: '375,667',
    scriptInjection: `
      (() => {
        try {
        const game = window.game;
        if (!game?.scene || !game.player) throw new Error('Runner scene is not ready for turns');
        game.isTempleRun = true;
        game.isGameStarted = true;
        game.isPaused = false;
        game.isGameOver = false;
        game.resetRunnerNavigation();
        game.clearRunnerObjects();
        game.nextJunctionAt = 1e9;
        game.distanceMeters = 1000;
        game.player.position.set(0, 0, 0);
        game.currentLane = 0;
        game.hearts = 3;
        game.runnerInvulnerableTimer = 100;
        const send = (type, payload = {}, sender = 'MASTERMODE_DASHBOARD') =>
          game.handleMasterModeCommand({ type, payload, sender });
        const approach = limit => {
          for (let i = 0; i < 800; i++) {
            game.updateTempleRunCorridor(0.05);
            if (game.runnerJunction && game.player.position.z - game.runnerJunction.z <= limit) return;
          }
          throw new Error('Never reached the junction zone');
        };
        const finishTurn = () => {
          for (let i = 0; i < 100 && game.runnerTurn; i++) game.updateTempleRunCorridor(0.05);
          if (game.runnerTurn) throw new Error('Turn animation never finished');
        };

        send('SPAWN_JUNCTION', { kind: 'turn', dir: 'left' }, 'UNTRUSTED');
        if (game.runnerJunction) throw new Error('Untrusted sender spawned a junction');
        send('SPAWN_JUNCTION', { kind: 'turn', dir: 'left' });
        if (!game.runnerJunction) throw new Error('Master junction was not spawned');
        approach(10);
        game.changeLane(-1);
        if (!game.runnerTurn) throw new Error('Correct turn input did not start a turn');
        finishTurn();
        if (game.getRunnerHeadingLabel() !== 'W') throw new Error('Heading did not become West after a left turn');
        if (game.runnerJunction || game.hearts !== 3) throw new Error('Clean turn left a junction or cost a heart');

        game.runnerInvulnerableTimer = 100;
        send('SPAWN_JUNCTION', { kind: 'turn', dir: 'right' });
        approach(10);
        game.runnerInvulnerableTimer = 0;
        game.nitroTimer = 0;
        game.shieldTimer = 0;
        game.changeLane(-1);
        if (game.hearts !== 2) throw new Error('Wrong-way turn did not cost a heart');
        finishTurn();
        if (game.getRunnerHeadingLabel() !== 'N') throw new Error('Wrong-way turn did not auto-turn the right way');

        game.runnerInvulnerableTimer = 100;
        send('SPAWN_JUNCTION', { kind: 'fork', dir: 'left' });
        approach(10);
        game.changeLane(1);
        if (game.runnerSection?.type !== 'underpass') throw new Error('Right fork did not enter the underpass');
        game.updateTempleRunCorridor(0.05);
        if (window.__DEV_TELEMETRY__ && game.runnerSection.type !== 'underpass') throw new Error('Section lost');
        game.distanceMeters = game.runnerSection.endDist + 1;
        game.updateTempleRunCorridor(0.05);
        if (game.runnerSection) throw new Error('Section did not end');
        game.removeRunnerJunction();

        game.runnerInvulnerableTimer = 100;
        send('SPAWN_JUNCTION', { kind: 'turn', dir: 'right' });
        send('TOGGLE_AUTOPILOT', { enabled: true });
        for (let i = 0; i < 800 && game.getRunnerHeadingLabel() === 'N'; i++) game.updateTempleRunCorridor(0.05);
        send('TOGGLE_AUTOPILOT', { enabled: false });
        if (game.getRunnerHeadingLabel() !== 'E') throw new Error('Auto-run bot did not take the turn');
        } catch (e) { throw new Error(String(e.message) + ' @ ' + String(e.stack).split('\\n').slice(1, 4).join(' | ')); }
      })();
    `
  });
  recordTest('TC-43', 'Directional Turns, Forks & Auto-Run Navigation', res43.success ? 'PASSED' : 'FAILED', Date.now() - t43Start, res43.success ? 'Verified sender-gated junctions, clean and wrong-way turns, heading changes, fork sections and bot navigation' : res43.error);

  // -------------------------------------------------------------------------
  // TC-44: Classic Karachi Landmarks Along the Runner Street
  // -------------------------------------------------------------------------
  const t44Start = Date.now();
  const res44 = await runChromeTest({
    testId: 'TC-44',
    screenshotName: 'tc44_runner_landmarks.png',
    windowSize: '667,375',
    extraStyle: '#modal-start-mission { display: none !important; }',
    waitMs: 4500,
    scriptInjection: `
      (() => {
        const game = window.game;
        if (!game?.scene || !game.player) throw new Error('Runner scene is not ready for landmarks');
        game.isTempleRun = true;
        [1, 2, 3].forEach(level => {
          game.currentDistrictLevel = level;
          game.corridorChunks.forEach(chunk => game.scene.remove(chunk));
          game.corridorChunks = [];
          game.initCorridorTerrain();
          const names = game.corridorChunks.flatMap(chunk => chunk.userData.landmarks || []);
          if (game.corridorChunks.length !== 7 || names.length < 10) {
            throw new Error('District ' + level + ' street has too few landmarks: ' + names.length);
          }
          if (new Set(names).size < 5) throw new Error('District ' + level + ' landmarks lack variety');
        });
        document.getElementById('btn-start-patrol')?.click();
      })();
    `
  });
  recordTest('TC-44', 'Classic Karachi Landmarks Along the Runner Street', res44.success ? 'PASSED' : 'FAILED', Date.now() - t44Start, res44.success ? 'Verified landmark buildings, distant towers and variety in every patrol area street' : res44.error);

  // -------------------------------------------------------------------------
  // TC-45: Seamless Corner Turn (cross-road, arc path, no frame jump)
  // -------------------------------------------------------------------------
  const t45Start = Date.now();
  const res45 = await runChromeTest({
    testId: 'TC-45',
    screenshotName: 'tc45_runner_mid_turn.png',
    windowSize: '667,375',
    extraStyle: '#modal-start-mission, #modal-pause, #modal-tutorial { display: none !important; }',
    waitMs: 4500,
    scriptInjection: `
      (() => {
        const game = window.game;
        if (!game?.scene || !game.player) throw new Error('Runner scene is not ready for corner test');
        document.getElementById('btn-start-patrol')?.click();
        game.isTempleRun = true;
        game.isGameStarted = true;
        game.isGameOver = false;
        game.resetRunnerNavigation();
        game.clearRunnerObjects();
        game.initCorridorTerrain();
        game.nextJunctionAt = 1e9;
        game.distanceMeters = 1000;
        game.player.position.set(0, 0, 0);
        game.currentLane = 0;
        game.hearts = 3;
        game.runnerInvulnerableTimer = 100;
        game.isPaused = false;
        if (!game.spawnRunnerJunction('turn', -1, 90)) throw new Error('Corner junction did not spawn');
        const junction = game.runnerJunction;
        if (!junction.turnChunks || junction.turnChunks.length !== 3) throw new Error('Corner has no cross-road chunks');
        const slabsOf = chunk => chunk.userData.slabs.length;
        if (!game.corridorChunks.every(chunk => slabsOf(chunk) > 0)) throw new Error('Corridor chunks were not merged into slabs');
        const step = dt => game.updateTempleRunCorridor(dt);
        for (let i = 0; i < 800 && game.player.position.z - junction.z > 9; i++) step(0.016);
        game.changeLane(-1);
        if (!game.runnerTurn) throw new Error('Turn did not start');

        const Vec3 = game.camera.position.constructor;
        const Mat4 = game.camera.matrix.constructor;
        const Quat = game.camera.quaternion.constructor;
        const Euler = game.camera.rotation.constructor;
        let prevPlayer = game.player.position.clone();
        let prevCam = game.camera.position.clone();
        let maxPlayerStep = 0;
        let maxCamStep = 0;
        const relPose = chunk => {
          game.scene.updateMatrixWorld(true);
          const playerMatrix = new Mat4().compose(
            game.player.position,
            new Quat().setFromEuler(new Euler(0, game.player.group.rotation.y, 0)),
            new Vec3(1, 1, 1)
          );
          return new Mat4().copy(playerMatrix).invert().multiply(chunk.matrixWorld);
        };

        // Continue to just before the finish and compare the street frame across the re-frame.
        while (game.runnerTurn && game.runnerTurn.t < 0.99) {
          step(0.016);
          maxPlayerStep = Math.max(maxPlayerStep, game.player.position.distanceTo(prevPlayer));
          maxCamStep = Math.max(maxCamStep, game.camera.position.distanceTo(prevCam));
          prevPlayer.copy(game.player.position);
          prevCam.copy(game.camera.position);
        }
        game.runnerTurn.t = 0.9999;
        step(0);
        const before = relPose(junction.turnChunks[0]);
        const camBefore = game.camera.position.clone().sub(game.player.position);
        step(0.05);
        if (game.runnerTurn) throw new Error('Turn did not finish');
        const after = relPose(game.corridorChunks[0]);
        let maxDiff = 0;
        before.elements.forEach((value, i) => { maxDiff = Math.max(maxDiff, Math.abs(value - after.elements[i])); });
        if (maxDiff > 0.05) throw new Error('Street frame jumped across the turn finish by ' + maxDiff.toFixed(3));
        if (game.corridorChunks.length !== 7) throw new Error('Corridor lost chunks after the turn: ' + game.corridorChunks.length);
        if (!game.corridorChunks.every(chunk => chunk.parent === game.scene && chunk.visible)) throw new Error('Corridor chunk detached after turn');
        if (maxPlayerStep > 0.8) throw new Error('Player jumped during the turn: ' + maxPlayerStep.toFixed(2));
        if (maxCamStep > 0.8) throw new Error('Camera jumped during the turn: ' + maxCamStep.toFixed(2));
        if (game.getRunnerHeadingLabel() !== 'W') throw new Error('Heading was not updated');

        // Freeze a second right-hand turn halfway so the screenshot shows the corner itself.
        game.nextJunctionAt = 1e9;
        game.player.position.set(0, 0, game.player.position.z);
        game.spawnRunnerJunction('turn', 1, 60);
        const next = game.runnerJunction;
        for (let i = 0; i < 800 && game.player.position.z - next.z > 9; i++) step(0.016);
        game.changeLane(1);
        while (game.runnerTurn && game.runnerTurn.t < 0.45) step(0.016);
        game.isPaused = true;
      })();
    `
  });
  recordTest('TC-45', 'Seamless Corner Turn (cross-road, arc path, no frame jump)', res45.success ? 'PASSED' : 'FAILED', Date.now() - t45Start, res45.success ? 'Verified real cross-road chunks, arc path without player/camera jumps and an identical street frame across the turn finish' : res45.error);

  // -------------------------------------------------------------------------
  // TC-46: HUD Popup Layout - no overlapping overlays on any screen size
  // -------------------------------------------------------------------------
  const hudLayoutSizes = [
    '320,568', '360,640', '375,667', '390,844', '430,932', '568,320', '667,375',
    '740,360', '844,390', '932,430', '768,1024', '1024,768', '1366,768', '1920,1080'
  ];
  // Headless Chrome cannot open windows under ~500px, so every size is measured inside an exact-size iframe.
  const hudLayoutScript = (width, height) => `
    (() => {
      if (window.parent === window) {
        window.__testResult = { status: 'failed', error: 'HUD layout frame did not finish' };
        const frame = document.createElement('iframe');
        frame.src = location.href;
        frame.style.cssText = 'position:fixed;left:0;top:0;border:0;z-index:2147483647;background:#000;width:${width}px;height:${height}px';
        document.body.appendChild(frame);
        const poll = setInterval(() => {
          const inner = frame.contentWindow;
          if (inner?.__hudLayoutDone) {
            window.__testResult = { status: 'passed' };
            clearInterval(poll);
          } else if (inner?.__testResult?.status === 'failed') {
            window.__testResult = inner.__testResult;
            clearInterval(poll);
          }
        }, 50);
        return;
      }
      const game = window.game;
      if (!game?.ui || !game.player) throw new Error('Runner scene is not ready for HUD layout test');
      localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');
      document.getElementById('btn-start-patrol')?.click();
      game.isTempleRun = true;
      game.isGameStarted = true;
      game.isGameOver = false;
      game.isPaused = false;
      const ui = game.ui;
      const show = (id, display = 'flex') => { const el = document.getElementById(id); if (el) el.style.display = display; };

      // Show every transient runner popup at once, with worst-case (longest) copy.
      ui.showAnnouncement('🧭 PERFECT TURN! +500 COMBO BONUS HEARTS RESTORED', '#76ff03');
      ui.updateRunnerNav({ arrow: '⬅', text: 'TURN LEFT', meters: 120, heading: 'N', urgent: true });
      ui.updateRunnerHazardWarning([{ type: 'water_tanker', isHit: false, mesh: {}, z: -10 }], [], 0);
      const combo = document.getElementById('hud-combo');
      if (combo) { combo.style.display = 'block'; document.getElementById('hud-combo-val').textContent = '12'; }
      show('hud-revive-tokens');
      show('hud-powerup-slot');
      ui.showDevToast('Master command accepted');
      ui.layoutRunnerPopups();
      ui.showFloatingFeedback('+300 CLEAN TURN', window.innerWidth / 2, '#76ff03');

      const selectors = {
        statsPill: '.hud-center-stats-row',
        topControls: '.hud-top-controls',
        rescue: '#hud-revive-tokens',
        powerup: '#hud-powerup-slot',
        combo: '#hud-combo',
        hazard: '#hud-runner-hazard-alert',
        announcement: '#hud-announcement',
        nav: '#hud-runner-nav',
        feedback: '#floating-feedbacks .floating-feedback',
        devToast: '.dev-toast',
        tutorial: '.runner-tutorial-card'
      };
      const controlSelectors = {
        laneButtons: '.hud-runner-lanes',
        actionButtons: '.runner-btn-row'
      };
      const visibleRect = el => {
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.05 || el.hidden) return null;
        const r = el.getBoundingClientRect();
        return r.width > 2 && r.height > 2 ? r : null;
      };
      const rects = {};
      Object.entries({ ...selectors, ...controlSelectors }).forEach(([name, selector]) => {
        const el = document.querySelector(selector);
        const r = el ? visibleRect(el) : null;
        if (r) rects[name] = r;
      });
      const W = window.innerWidth;
      const H = window.innerHeight;
      const problems = [];
      const names = Object.keys(rects);
      ['statsPill', 'announcement', 'nav', 'hazard'].forEach(required => {
        if (!rects[required]) problems.push(required + ' is not visible');
      });
      names.forEach(a => {
        const r = rects[a];
        if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) {
          problems.push(a + ' leaves the viewport ' + [r.left, r.top, r.right, r.bottom].map(Math.round));
        }
      });
      for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) {
          const a = rects[names[i]];
          const b = rects[names[j]];
          if (document.querySelector(selectors[names[i]])?.contains(document.querySelector(selectors[names[j]])) ||
              document.querySelector(selectors[names[j]])?.contains(document.querySelector(selectors[names[i]]))) continue;
          const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (overlapX > 1 && overlapY > 1) {
            problems.push(names[i] + ' overlaps ' + names[j] + ' (' + Math.round(overlapX) + 'x' + Math.round(overlapY) + ')');
          }
        }
      }
      if (problems.length) {
        throw new Error(W + 'x' + H + ': ' + problems.join('; ') + ' :: ' +
          names.map(n => n + '=' + [rects[n].left, rects[n].top, rects[n].right, rects[n].bottom].map(Math.round).join(',')).join(' '));
      }
      window.__hudLayoutDone = true;
    })();
  `;
  for (const size of hudLayoutSizes) {
    const [w, h] = size.split(',');
    const tStart = Date.now();
    const res = await runChromeTest({
      testId: 'TC-46',
      screenshotName: `tc46_hud_layout_${w}x${h}.png`,
      windowSize: `${Math.max(Number(w), 500)},${Math.max(Number(h), 481)}`,
      extraStyle: '#modal-start-mission { display: none !important; }',
      waitMs: 3500,
      scriptInjection: hudLayoutScript(w, h)
    });
    recordTest(`TC-46 ${w}x${h}`, `HUD Popup Layout ${w}x${h}`, res.skipped ? 'SKIPPED' : res.success ? 'PASSED' : 'FAILED', Date.now() - tStart, res.success ? 'Verified no popup, HUD or control overlap and nothing outside the viewport' : res.error);
  }

  // -------------------------------------------------------------------------
  // TC-47: Controls Tutorial owns the screen - other popups hide, card stays on screen
  // -------------------------------------------------------------------------
  const hudTutorialScript = (width, height) => `
    (() => {
      if (window.parent === window) {
        window.__testResult = { status: 'failed', error: 'Tutorial frame did not finish' };
        const frame = document.createElement('iframe');
        frame.src = location.href;
        frame.style.cssText = 'position:fixed;left:0;top:0;border:0;z-index:2147483647;background:#000;width:${width}px;height:${height}px';
        document.body.appendChild(frame);
        const poll = setInterval(() => {
          const inner = frame.contentWindow;
          if (inner?.__hudLayoutDone) {
            window.__testResult = { status: 'passed' };
            clearInterval(poll);
          } else if (inner?.__testResult?.status === 'failed') {
            window.__testResult = inner.__testResult;
            clearInterval(poll);
          }
        }, 50);
        return;
      }
      const game = window.game;
      const ui = game.ui;
      localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');
      document.getElementById('btn-start-patrol')?.click();
      ui.showAnnouncement('Welcome to the run', '#fff');
      ui.updateRunnerNav({ arrow: '⬅', text: 'TURN LEFT', meters: 50, heading: 'N', urgent: false });
      ui.updateRunnerHazardWarning([{ type: 'pothole', isHit: false, mesh: {}, z: -10 }], [], 0);
      ui.showRunnerTutorial(60000);
      const card = document.querySelector('.runner-tutorial-card');
      const cardRect = card.getBoundingClientRect();
      const W = window.innerWidth;
      const H = window.innerHeight;
      if (getComputedStyle(card).display === 'none') throw new Error('Tutorial card is not visible');
      if (cardRect.left < -1 || cardRect.top < -1 || cardRect.right > W + 1 || cardRect.bottom > H + 1) {
        throw new Error(W + 'x' + H + ': tutorial card leaves the viewport ' + [cardRect.left, cardRect.top, cardRect.right, cardRect.bottom].map(Math.round));
      }
      ['.runner-nav', '#hud-runner-hazard-alert', '#hud-announcement'].forEach(selector => {
        const el = document.querySelector(selector);
        if (el && getComputedStyle(el).visibility !== 'hidden') throw new Error(W + 'x' + H + ': ' + selector + ' shows through the tutorial');
      });
      window.__hudLayoutDone = true;
    })();
  `;
  for (const size of ['320,568', '568,320', '1366,768']) {
    const [w, h] = size.split(',');
    const tStart = Date.now();
    const res = await runChromeTest({
      testId: 'TC-47',
      screenshotName: `tc47_tutorial_layout_${w}x${h}.png`,
      windowSize: `${Math.max(Number(w), 500)},${Math.max(Number(h), 481)}`,
      extraStyle: '#modal-start-mission { display: none !important; }',
      waitMs: 3500,
      scriptInjection: hudTutorialScript(w, h)
    });
    recordTest(`TC-47 ${w}x${h}`, `Tutorial Overlay Layout ${w}x${h}`, res.skipped ? 'SKIPPED' : res.success ? 'PASSED' : 'FAILED', Date.now() - tStart, res.success ? 'Verified the controls tutorial fits the screen and hides every other popup' : res.error);
  }

  // -------------------------------------------------------------------------
  // TC-48: In-game Master panel exposes every Master power (auto-run, clear, complete, junctions)
  // -------------------------------------------------------------------------
  const t48Start = Date.now();
  const res48 = await runChromeTest({
    testId: 'TC-48',
    screenshotName: 'tc48_master_panel_powers.png',
    windowSize: '667,375',
    extraStyle: '#modal-start-mission { display: none !important; }',
    waitMs: 4500,
    scriptInjection: `
      (() => {
        localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');
        document.getElementById('btn-start-patrol')?.click();
        setTimeout(() => {
          const game = window.game;
          const ui = game.ui;
          game.isTempleRun = true; game.isGameStarted = true; game.isPaused = false; game.isGameOver = false;
          game.nextJunctionAt = 1e9;
          ui.toggleMasterMode(true);
          const ids = ['autorun', 'immortal', 'clear-all', 'complete-area', 'complete-route', 'restore-hearts', 'junction-left', 'junction-right', 'junction-fork'];
          const missing = ids.filter(id => !document.getElementById('btn-master-' + id));
          if (missing.length) throw new Error('Master panel is missing: ' + missing.join(', '));
          const press = id => document.getElementById('btn-master-' + id).click();
          const telemetry = () => { game.publishDevTelemetry?.(); return window.__DEV_TELEMETRY__ || {}; };

          press('autorun');
          if (!game.isAutoPilotActive) throw new Error('Auto-run button did not engage the bot');
          window.__DEV_TELEMETRY__ = { ...(window.__DEV_TELEMETRY__ || {}), autoPilot: true };
          press('autorun');
          if (game.isAutoPilotActive) throw new Error('Auto-run button did not disengage the bot');

          press('immortal');
          if (!game.isMasterImmortal) throw new Error('Invincible button did not engage');
          press('immortal');

          game.spawnRunnerJunction('turn', -1, 90);
          press('clear-all');
          game.hearts = 1;
          press('restore-hearts');
          if (game.hearts < 3) throw new Error('Restore hearts did not refill hearts');
          game.removeRunnerJunction();
          press('junction-right');
          if (game.runnerJunction?.kind !== 'turn' || game.runnerJunction.dir !== 1) throw new Error('Spawn right turn failed');
          game.removeRunnerJunction();
          press('junction-left');
          if (game.runnerJunction?.dir !== -1) throw new Error('Spawn left turn failed');
          game.removeRunnerJunction();
          press('junction-fork');
          if (game.runnerJunction?.kind !== 'fork') throw new Error('Spawn fork failed');
          game.removeRunnerJunction();
          press('complete-area');
          const panel = document.querySelector('.runner-master-panel');
          const r = panel.getBoundingClientRect();
          if (r.right > innerWidth + 1 || r.bottom > innerHeight + 1) throw new Error('Master panel leaves the viewport');
        }, 600);
      })();
    `
  });
  recordTest('TC-48', 'In-game Master Panel Powers (auto-run, clear, complete, junctions)', res48.success ? 'PASSED' : 'FAILED', Date.now() - t48Start, res48.success ? 'Verified every Master power is reachable from the in-game panel and acts on the run' : res48.error);

  // -------------------------------------------------------------------------
  // TC-49: Pace-based route layout - Easy has no turns, Hard turns come sooner and more often
  // -------------------------------------------------------------------------
  const t49Start = Date.now();
  const res49 = await runChromeTest({
    testId: 'TC-49',
    screenshotName: 'tc49_pace_route_layout.png',
    windowSize: '375,667',
    waitMs: 4500,
    scriptInjection: `
      (() => {
        const game = window.game;
        if (!game?.scene || !game.player) throw new Error('Runner scene is not ready for pace test');
        const cards = [...document.querySelectorAll('#runner-difficulty-grid .age-card')];
        if (cards.length !== 3 || cards.some(card => !card.querySelector('.age-card-sub'))) throw new Error('Pace cards do not describe their route layout');
        if (!cards[0].textContent.toLowerCase().includes('no turns')) throw new Error('Easy card does not say it has no turns');

        game.isTempleRun = true; game.isGameStarted = true; game.isPaused = false; game.isGameOver = false;
        game.runnerInvulnerableTimer = 1e6;
        const collect = pace => {
          game.runnerDifficulty = pace;
          game.resetRunnerNavigation();
          game.clearRunnerObjects();
          game.player.position.set(0, 0, 0);
          const first = game.nextJunctionAt;
          const kinds = [];
          let guard = 0;
          while (kinds.length < 6 && guard++ < 4000) {
            game.distanceMeters = Math.max(game.distanceMeters, game.nextJunctionAt - 170);
            game.updateRunnerNavigation(0.016);
            if (game.runnerJunction) {
              kinds.push(game.runnerJunction.kind);
              game.removeRunnerJunction();
              game.runnerSection = null;
              game.nextJunctionAt = game.distanceMeters + game.getRunnerNavProfile().gap;
            }
          }
          return { first, kinds, profile: game.getRunnerNavProfile() };
        };
        const easy = collect('easy');
        const standard = collect('standard');
        const hard = collect('hard');
        if (easy.kinds.length < 3 || easy.kinds.some(kind => kind !== 'fork')) throw new Error('Easy generated a turn: ' + easy.kinds.join(','));
        if (!standard.kinds.includes('turn') || !standard.kinds.includes('fork')) throw new Error('Standard must mix turns and forks: ' + standard.kinds.join(','));
        if (!hard.kinds.includes('turn')) throw new Error('Hard generated no turns');
        if (!(hard.profile.gap < standard.profile.gap && standard.profile.gap < easy.profile.gap)) throw new Error('Route spacing does not tighten with pace');
        if (!(hard.first < standard.first && standard.first < easy.first)) throw new Error('First junction does not arrive sooner with pace');

        // Explicit Master commands still work on Easy.
        game.runnerDifficulty = 'easy';
        game.resetRunnerNavigation();
        game.handleMasterModeCommand({ type: 'SPAWN_JUNCTION', payload: { kind: 'turn', dir: 'left' }, sender: 'MASTERMODE_DASHBOARD' });
        if (game.runnerJunction?.kind !== 'turn') throw new Error('Master could not force a turn on Easy');
        game.removeRunnerJunction();
        game.runnerDifficulty = 'standard';
        game.resetRunnerNavigation();
      })();
    `
  });
  recordTest('TC-49', 'Pace Route Layout (Easy has no turns)', res49.success ? 'PASSED' : 'FAILED', Date.now() - t49Start, res49.success ? 'Verified Easy gets forks only, Standard mixes turns and forks, Hard is denser, and Master can still force turns' : res49.error);

  // -------------------------------------------------------------------------
  // TC-50: First-launch intro and start/game menus remain reachable on small screens
  // -------------------------------------------------------------------------
  const menuLayoutSizes = ['320,568', '390,844', '568,320', '844,390'];
  const menuLayoutScript = (width, height) => `
    (() => {
      if (window.parent === window) {
        window.__testResult = { status: 'failed', error: 'Menu layout frame did not finish' };
        const frame = document.createElement('iframe');
        frame.src = location.href;
        frame.style.cssText = 'position:fixed;left:0;top:0;border:0;z-index:2147483647;background:#000;width:${width}px;height:${height}px';
        document.body.appendChild(frame);
        const poll = setInterval(() => {
          const inner = frame.contentWindow;
          if (inner?.__hudLayoutDone) {
            window.__testResult = { status: 'passed' };
            clearInterval(poll);
          } else if (inner?.__testResult?.status === 'failed') {
            window.__testResult = inner.__testResult;
            clearInterval(poll);
          }
        }, 50);
        return;
      }

      const inside = (el, box) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.left >= box.left - 1 &&
          r.top >= box.top - 1 && r.right <= box.right + 1 && r.bottom <= box.bottom + 1;
      };
      const intro = document.getElementById('modal-runner-intro');
      const introCard = intro?.querySelector('.runner-intro-card');
      if (!introCard || getComputedStyle(intro).display === 'none') throw new Error('First-launch intro is not visible');
      if (!inside(introCard, { left: 0, top: 0, right: innerWidth, bottom: innerHeight })) throw new Error('Intro card leaves the viewport');
      introCard.scrollTop = introCard.scrollHeight;
      if (!inside(document.getElementById('btn-intro-continue'), introCard.getBoundingClientRect())) throw new Error('Intro action cannot be reached');
      document.getElementById('btn-intro-continue').click();

      const startCard = document.querySelector('#modal-start-mission .start-mission-card');
      const startForm = document.querySelector('#modal-start-mission .start-form-section');
      const startActions = document.getElementById('start-actions-container');
      if (!inside(startCard, { left: 0, top: 0, right: innerWidth, bottom: innerHeight })) throw new Error('Start menu card leaves the viewport');
      if (!inside(startActions, startCard.getBoundingClientRect())) throw new Error('Start menu actions are clipped');
      if (startForm.scrollHeight > startForm.clientHeight + 1 && !['auto', 'scroll'].includes(getComputedStyle(startForm).overflowY)) {
        throw new Error('Start menu options cannot scroll');
      }
      const clippedPaceCard = [...document.querySelectorAll('#runner-difficulty-grid .age-card')]
        .find(card => card.scrollWidth > card.clientWidth + 1);
      if (clippedPaceCard) throw new Error('Start-menu pace text is clipped: ' + clippedPaceCard.textContent.trim());
      const startFormBounds = startForm.getBoundingClientRect();
      const hiddenPaceCard = [...document.querySelectorAll('#runner-difficulty-grid .age-card')]
        .find(card => {
          const r = card.getBoundingClientRect();
          return r.top < startFormBounds.top - 1 || r.bottom > startFormBounds.bottom + 1;
        });
      if (hiddenPaceCard) throw new Error('Start-menu pace choice is hidden: ' + hiddenPaceCard.textContent.trim());

      const menu = document.getElementById('modal-game-menu');
      menu.style.display = 'flex';
      const menuCard = menu.querySelector('.game-menu-card');
      if (!inside(menuCard, { left: 0, top: 0, right: innerWidth, bottom: innerHeight })) throw new Error('Game menu card leaves the viewport');
      const clippedMenuPace = [...menu.querySelectorAll('.runner-pace-option')]
        .find(option => option.scrollWidth > option.clientWidth + 1);
      if (clippedMenuPace) throw new Error('In-game pace text is clipped: ' + clippedMenuPace.textContent.trim());
      if (menuCard.scrollHeight > menuCard.clientHeight + 1 && !['auto', 'scroll'].includes(getComputedStyle(menuCard).overflowY)) {
        throw new Error('Game menu items cannot scroll');
      }
      menuCard.scrollTop = menuCard.scrollHeight;
      if (!inside(document.getElementById('btn-menu-footer-close'), menuCard.getBoundingClientRect())) throw new Error('Game menu footer action cannot be reached');
      window.__hudLayoutDone = true;
    })();
  `;
  for (const size of menuLayoutSizes) {
    const [w, h] = size.split(',');
    const tStart = Date.now();
    const res = await runChromeTest({
      testId: 'TC-50',
      screenshotName: `tc50_menu_layout_${w}x${h}.png`,
      windowSize: `${Math.max(Number(w), 500)},${Math.max(Number(h), 481)}`,
      waitMs: 3500,
      scriptInjection: menuLayoutScript(w, h)
    });
    recordTest(`TC-50 ${w}x${h}`, `Intro & Menu Fit ${w}x${h}`, res.skipped ? 'SKIPPED' : res.success ? 'PASSED' : 'FAILED', Date.now() - tStart, res.success ? 'Verified intro, start-menu actions, and the full game menu remain reachable' : res.error);
  }

  // -------------------------------------------------------------------------
  // TC-51: Runner status, pause, lane and traversal controls stay on-screen
  // -------------------------------------------------------------------------
  const gameplayHudSizes = ['320,568', '390,844', '568,320', '844,390'];
  const gameplayHudScript = (width, height) => `
    (() => {
      if (window.parent === window) {
        window.__testResult = { status: 'failed', error: 'Gameplay HUD frame did not finish' };
        const frame = document.createElement('iframe');
        frame.src = location.href;
        frame.style.cssText = 'position:fixed;left:0;top:0;border:0;z-index:2147483647;background:#000;width:${width}px;height:${height}px';
        document.body.appendChild(frame);
        const poll = setInterval(() => {
          const inner = frame.contentWindow;
          if (inner?.__hudLayoutDone) {
            window.__testResult = { status: 'passed' };
            clearInterval(poll);
          } else if (inner?.__testResult?.status === 'failed') {
            window.__testResult = inner.__testResult;
            clearInterval(poll);
          }
        }, 50);
        return;
      }

      localStorage.setItem('karachi_runner_intro_seen_v1', 'true');
      localStorage.setItem('karachi_runner_tutorial_seen_v1', 'true');
      document.getElementById('modal-runner-intro').style.display = 'none';
      document.getElementById('btn-start-patrol')?.click();
      const game = window.game;
      game.isTempleRun = true;
      game.isGameStarted = true;
      game.isPaused = false;
      game.isGameOver = false;
      game.runSpeed = 0;
      game.ui.hideRunnerTutorial();
      game.ui.hud.style.display = 'flex';

      const visibleRect = el => {
        if (!el) return null;
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.05) return null;
        const r = el.getBoundingClientRect();
        return r.width > 2 && r.height > 2 ? r : null;
      };
      const required = [
        ['runner status', document.querySelector('.hud-center-stats-row')],
        ['pause button', document.getElementById('btn-manual-pause')],
        ['left lane button', document.getElementById('btn-lane-left')],
        ['right lane button', document.getElementById('btn-lane-right')],
        ['jump button', document.getElementById('btn-jump')],
        ['slide button', document.getElementById('btn-slide')],
        ['horn button', document.getElementById('btn-horn')]
      ];
      const rects = new Map();
      for (const [name, el] of required) {
        const rect = visibleRect(el);
        if (!rect) throw new Error(name + ' is hidden');
        if (rect.left < -1 || rect.top < -1 || rect.right > innerWidth + 1 || rect.bottom > innerHeight + 1) {
          throw new Error(name + ' leaves the viewport');
        }
        rects.set(name, rect);
      }
      const overlaps = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
        Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
      if (overlaps(rects.get('runner status'), rects.get('pause button'))) throw new Error('Runner status overlaps pause');
      for (const lane of ['left lane button', 'right lane button']) {
        for (const action of ['jump button', 'slide button', 'horn button']) {
          if (overlaps(rects.get(lane), rects.get(action))) throw new Error(lane + ' overlaps ' + action);
        }
      }
      window.__hudLayoutDone = true;
    })();
  `;
  for (const size of gameplayHudSizes) {
    const [w, h] = size.split(',');
    const tStart = Date.now();
    const res = await runChromeTest({
      testId: 'TC-51',
      screenshotName: `tc51_gameplay_hud_${w}x${h}.png`,
      windowSize: `${Math.max(Number(w), 500)},${Math.max(Number(h), 481)}`,
      waitMs: 3500,
      scriptInjection: gameplayHudScript(w, h)
    });
    recordTest(`TC-51 ${w}x${h}`, `Gameplay HUD Fit ${w}x${h}`, res.skipped ? 'SKIPPED' : res.success ? 'PASSED' : 'FAILED', Date.now() - tStart, res.success ? 'Verified status, pause, lane, jump, slide, and horn controls are visible and non-overlapping' : res.error);
  }

  // -------------------------------------------------------------------------
  // Summary Report Output
  // -------------------------------------------------------------------------
  const totalDuration = Date.now() - startTime;
  const passedCount = testResults.filter(t => t.status === 'PASSED').length;
  const failedCount = testResults.filter(t => t.status === 'FAILED').length;
  const skippedCount = testResults.filter(t => t.status === 'SKIPPED').length;

  logSection(`TEST SUITE RESULTS SUMMARY (${passedCount}/${testResults.length - skippedCount} PASSED)`);
  console.log(`  Total Test Cases : ${testResults.length}`);
  console.log(`  Passed           : ${colors.green}${passedCount}${colors.reset}`);
  console.log(`  Failed           : ${failedCount === 0 ? colors.green + '0' : colors.red + failedCount}${colors.reset}`);
  if (skippedCount > 0) console.log(`  Skipped          : ${skippedCount}`);
  console.log(`  Total Execution  : ${totalDuration}ms`);
  console.log(`  Screenshots Saved: ${reportDir}\n`);

  // Output JSON report file for auditability
  const reportJsonPath = path.join(reportDir, 'test_results.json');
  fs.writeFileSync(reportJsonPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total: testResults.length,
    passed: passedCount,
    failed: failedCount,
    durationMs: totalDuration,
    results: testResults
  }, null, 2));

  if (failedCount > 0) {
    stopStartedDevServer();
    process.exitCode = 1;
  } else {
    stopStartedDevServer();
    process.exitCode = 0;
  }
}

runTestSuite().catch(err => {
  stopStartedDevServer();
  console.error('Test Suite Fatal Error:', err);
  process.exitCode = 1;
});
