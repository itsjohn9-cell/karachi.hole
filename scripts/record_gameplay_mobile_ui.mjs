import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, '..');
const reportDir = path.join(projectDir, 'test_reports');
const artifactDir = '/Users/mohammadjhone/.gemini/antigravity-ide/brain/09ee0209-1c57-4c74-9150-ce143b914724';

if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

const chromeExecutable = process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  : 'google-chrome';

const indexPath = path.join(projectDir, 'index.html');
const ORIGINAL_INDEX_HTML = fs.readFileSync(indexPath, 'utf8');

function restoreIndex() {
  try {
    fs.writeFileSync(indexPath, ORIGINAL_INDEX_HTML, 'utf8');
  } catch {}
}

process.on('exit', restoreIndex);
process.on('SIGINT', () => { restoreIndex(); process.exit(1); });
process.on('SIGTERM', () => { restoreIndex(); process.exit(1); });

let serverResolve;
const videoDonePromise = new Promise(resolve => { serverResolve = resolve; });

let receivedVideoBytes = 0;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url?.startsWith('/progress')) {
    const urlObj = new URL(req.url, 'http://127.0.0.1:5179');
    const phase = urlObj.searchParams.get('phase');
    const elapsed = urlObj.searchParams.get('elapsed');
    const dist = urlObj.searchParams.get('dist');
    const score = urlObj.searchParams.get('score');
    console.log(`⏱️ [MOBILE UI RECORDER] ${elapsed}s | Phase: ${phase} | Distance: ${dist}m | Score: ${score}`);
    res.writeHead(200);
    res.end('ok');
    return;
  }

  if (req.url === '/save-video' && req.method === 'POST') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      receivedVideoBytes = buffer.length;

      const reportVideoPath = path.join(reportDir, 'gameplay_mobile_with_startup_and_pause.webm');
      fs.writeFileSync(reportVideoPath, buffer);
      console.log(`✅ [MOBILE UI RECORDER] Saved mobile UI video to ${reportVideoPath} (${receivedVideoBytes} bytes)`);

      if (fs.existsSync(artifactDir)) {
        const artifactVideoPath = path.join(artifactDir, 'gameplay_mobile_with_startup_and_pause.webm');
        fs.writeFileSync(artifactVideoPath, buffer);
        console.log(`✅ [MOBILE UI RECORDER] Saved artifact video to ${artifactVideoPath}`);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'saved', bytes: receivedVideoBytes }));

      serverResolve({
        success: true,
        bytes: receivedVideoBytes
      });
    });
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(5179, '127.0.0.1', () => {
  console.log('🚀 [MOBILE UI RECORDER SERVER] Listening on http://127.0.0.1:5179');
  startRecordingSession();
});

async function startRecordingSession() {
  const injectionScript = `
    <script>
      (function() {
        console.log('[MOBILE-COMPOSITE-RECORDER] Injected script loaded.');
        localStorage.setItem('karachi_runner_intro_seen_v1', 'true');
        localStorage.setItem('kr_analytics_consent', 'granted');

        async function initFullUiRecorder() {
          let attempts = 0;
          while (!document.querySelector('canvas') && attempts < 80) {
            attempts++;
            await new Promise(r => setTimeout(r, 100));
          }

          const webglCanvas = document.querySelector('#canvas-container canvas') || document.querySelector('canvas');
          if (!webglCanvas) {
            console.error('[MOBILE-COMPOSITE-RECORDER] WebGL canvas not found');
            return;
          }

          const W = 390;
          const H = 844;
          const compositeCanvas = document.createElement('canvas');
          compositeCanvas.width = W;
          compositeCanvas.height = H;
          const ctx = compositeCanvas.getContext('2d');

          let recordingPhase = 'startup_screen';
          let phaseStartTime = Date.now();
          const globalStartTime = Date.now();

          const stream = compositeCanvas.captureStream(30);
          let mime = 'video/webm;codecs=vp8';
          if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm';

          const recordedChunks = [];
          const recorder = new MediaRecorder(stream, {
            mimeType: mime,
            videoBitsPerSecond: 4000000
          });

          recorder.ondataavailable = e => {
            if (e.data && e.data.size > 0) recordedChunks.push(e.data);
          };

          recorder.onstop = async () => {
            console.log('[MOBILE-COMPOSITE-RECORDER] Stopped, sending ' + recordedChunks.length + ' chunks...');
            const blob = new Blob(recordedChunks, { type: mime });
            const buffer = await blob.arrayBuffer();
            await fetch('http://127.0.0.1:5179/save-video', {
              method: 'POST',
              headers: { 'Content-Type': 'video/webm' },
              body: buffer
            });
          };

          recorder.start(400);

          function renderLoop() {
            try {
              ctx.drawImage(webglCanvas, 0, 0, W, H);

              const now = Date.now();
              const elapsedSec = (now - globalStartTime) / 1000;

              if (elapsedSec < 3.5) {
                recordingPhase = 'startup_screen';
              } else if (elapsedSec >= 3.5 && elapsedSec < 18.0) {
                if (recordingPhase === 'startup_screen') {
                  recordingPhase = 'gameplay';
                  const consentBtn = document.getElementById('btn-consent-allow');
                  if (consentBtn) consentBtn.click();
                  const startBtn = document.getElementById('btn-start-patrol');
                  if (startBtn && startBtn.offsetParent !== null) startBtn.click();

                  setTimeout(() => {
                    if (window.game) {
                      window.game.isPaused = false;
                      window.game.handleMasterModeCommand({
                        type: 'TOGGLE_AUTOPILOT',
                        payload: { enabled: true },
                        sender: 'MASTERMODE_DASHBOARD'
                      });
                      window.game.handleMasterModeCommand({
                        type: 'TOGGLE_IMMORTAL',
                        payload: { immortal: true },
                        sender: 'MASTERMODE_DASHBOARD'
                      });
                      window.game.hearts = 5;
                      window.game.maxHearts = 5;
                    }
                  }, 400);
                }
              } else if (elapsedSec >= 18.0 && elapsedSec < 24.0) {
                if (recordingPhase === 'gameplay') {
                  recordingPhase = 'pause_menu';
                  const pauseBtn = document.getElementById('btn-pause') || document.querySelector('.btn-pause');
                  if (pauseBtn) pauseBtn.click();
                  else if (window.game) window.game.pauseRunner('pause_button');
                }
              } else if (elapsedSec >= 24.0 && elapsedSec < 32.0) {
                if (recordingPhase === 'pause_menu') {
                  recordingPhase = 'resumed_gameplay';
                  const resumeBtn = document.getElementById('btn-resume') || document.getElementById('btn-resume-patrol');
                  if (resumeBtn) resumeBtn.click();
                  else if (window.game) window.game.resumeRunner();
                }
              } else if (elapsedSec >= 32.0) {
                if (recorder.state === 'recording') {
                  recorder.stop();
                  return;
                }
              }

              // Draw UI overlays
              drawUiOverlays(ctx, recordingPhase, W, H);

            } catch (err) {
              console.error('[MOBILE-RENDER-ERROR]', err);
            }

            if (recorder.state === 'recording') {
              requestAnimationFrame(renderLoop);
            }
          }

          function drawUiOverlays(ctx, phase, W, H) {
            if (phase === 'startup_screen') {
              ctx.fillStyle = 'rgba(10, 15, 29, 0.75)';
              ctx.fillRect(16, 80, W - 32, H - 160);
              ctx.strokeStyle = '#00e5ff';
              ctx.lineWidth = 2;
              ctx.strokeRect(16, 80, W - 32, H - 160);

              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 24px Outfit, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('KARACHI RUNNER', W / 2, 140);

              ctx.fillStyle = '#00e5ff';
              ctx.font = '14px Outfit, sans-serif';
              ctx.fillText('MOBILE EDITION · 390x844', W / 2, 170);

              ctx.fillStyle = '#00e676';
              ctx.beginPath();
              ctx.roundRect(W / 2 - 80, H - 160, 160, 48, 12);
              ctx.fill();

              ctx.fillStyle = '#0a0f1d';
              ctx.font = 'bold 16px Outfit, sans-serif';
              ctx.fillText('▶ RUN PATROL', W / 2, H - 130);
            } else if (phase === 'pause_menu') {
              ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
              ctx.fillRect(0, 0, W, H);

              ctx.fillStyle = '#ffd600';
              ctx.font = 'bold 28px Outfit, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('⏸️ PATROL PAUSED', W / 2, H / 2 - 80);

              ctx.fillStyle = '#e2e8f0';
              ctx.font = '16px Outfit, sans-serif';
              ctx.fillText('SOLDIER BAZAR ROUTE', W / 2, H / 2 - 40);

              ctx.fillStyle = '#00e5ff';
              ctx.beginPath();
              ctx.roundRect(W / 2 - 80, H / 2 + 10, 160, 44, 10);
              ctx.fill();

              ctx.fillStyle = '#0a0f1d';
              ctx.font = 'bold 15px Outfit, sans-serif';
              ctx.fillText('RESUME PATROL', W / 2, H / 2 + 38);
            } else {
              // Active HUD
              const game = window.game;
              const dist = Math.round(game?.distanceMeters || 0);
              const score = game?.score || 0;
              const coins = game?.coins || 0;
              const hearts = game?.hearts || 3;

              ctx.fillStyle = 'rgba(10, 15, 29, 0.65)';
              ctx.beginPath();
              ctx.roundRect(12, 16, W - 24, 46, 10);
              ctx.fill();

              ctx.font = 'bold 13px Outfit, sans-serif';
              ctx.textAlign = 'left';
              ctx.fillStyle = '#ffd700';
              ctx.fillText('🪙 ' + coins + ' Rs', 24, 44);

              ctx.fillStyle = '#00e5ff';
              ctx.fillText('🏃 ' + dist + 'm', W / 2 - 25, 44);

              ctx.fillStyle = '#ff1744';
              ctx.textAlign = 'right';
              ctx.fillText('❤️'.repeat(Math.max(1, hearts)), W - 24, 44);
            }
          }

          requestAnimationFrame(renderLoop);

          let elapsedSec = 0;
          const progressInterval = setInterval(() => {
            elapsedSec++;
            const dist = Math.round(window.game?.distanceMeters || 0);
            const score = window.game?.score || 0;
            fetch('http://127.0.0.1:5179/progress?phase=' + recordingPhase + '&elapsed=' + elapsedSec + '&dist=' + dist + '&score=' + score).catch(() => {});
            if (elapsedSec >= 35) clearInterval(progressInterval);
          }, 1000);
        }

        window.addEventListener('DOMContentLoaded', () => {
          setTimeout(initFullUiRecorder, 600);
        });
      })();
    </script>
  `;

  const modifiedHtml = ORIGINAL_INDEX_HTML.replace('</body>', `${injectionScript}</body>`);
  fs.writeFileSync(indexPath, modifiedHtml, 'utf8');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'karachi-record-mobile-ui-'));
  const chromeArgs = [
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required',
    `--user-data-dir=${userDataDir}`,
    '--window-size=390,844',
    'http://127.0.0.1:5173/'
  ];

  console.log('📱 [MOBILE UI RECORDER] Launching Chrome in 390x844...');
  const chromeProcess = spawn(chromeExecutable, chromeArgs, { stdio: 'inherit' });

  chromeProcess.on('error', err => {
    console.error('❌ Failed to spawn Chrome:', err);
    restoreIndex();
    process.exit(1);
  });

  const timeout = setTimeout(() => {
    console.error('⚠️ [MOBILE UI RECORDER] Timed out waiting for video completion.');
    try { chromeProcess.kill(); } catch {}
    restoreIndex();
    server.close();
    process.exit(1);
  }, 60000);

  const result = await videoDonePromise;
  clearTimeout(timeout);

  console.log(`\n🎉 [MOBILE UI RECORDER SUCCESS] Captured ${result.bytes} bytes of mobile UI video!`);

  try { chromeProcess.kill(); } catch {}
  restoreIndex();
  server.close();
  process.exit(0);
}
