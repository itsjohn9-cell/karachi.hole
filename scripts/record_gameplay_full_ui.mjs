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
    const urlObj = new URL(req.url, 'http://127.0.0.1:5177');
    const phase = urlObj.searchParams.get('phase');
    const elapsed = urlObj.searchParams.get('elapsed');
    const dist = urlObj.searchParams.get('dist');
    const score = urlObj.searchParams.get('score');
    console.log(`⏱️ [RECORDING] ${elapsed}s | Phase: ${phase} | Distance: ${dist}m | Score: ${score}`);
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

      const reportVideoPath = path.join(reportDir, 'gameplay_with_startup_and_pause.webm');
      fs.writeFileSync(reportVideoPath, buffer);
      console.log(`✅ [RECORDER] Saved full UI video to ${reportVideoPath} (${receivedVideoBytes} bytes)`);

      if (fs.existsSync(artifactDir)) {
        const artifactVideoPath = path.join(artifactDir, 'gameplay_with_startup_and_pause.webm');
        fs.writeFileSync(artifactVideoPath, buffer);
        console.log(`✅ [RECORDER] Saved artifact video to ${artifactVideoPath}`);
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

server.listen(5177, '127.0.0.1', () => {
  console.log('🚀 [RECORDER SERVER] Listening on http://127.0.0.1:5177');
  startRecordingSession();
});

async function startRecordingSession() {
  const injectionScript = `
    <script>
      (function() {
        console.log('[COMPOSITE-RECORDER] Injected script loaded.');
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
            console.error('[COMPOSITE-RECORDER] WebGL canvas not found');
            return;
          }

          const W = 1280;
          const H = 720;
          const compositeCanvas = document.createElement('canvas');
          compositeCanvas.width = W;
          compositeCanvas.height = H;
          const ctx = compositeCanvas.getContext('2d');

          let recordingPhase = 'startup_screen'; // 'startup_screen' -> 'gameplay' -> 'pause_menu' -> 'resumed_gameplay'
          let phaseStartTime = Date.now();
          const globalStartTime = Date.now();

          // Stream & MediaRecorder
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
            console.log('[COMPOSITE-RECORDER] Stopped, sending ' + recordedChunks.length + ' chunks...');
            const blob = new Blob(recordedChunks, { type: mime });
            const buffer = await blob.arrayBuffer();
            await fetch('http://127.0.0.1:5177/save-video', {
              method: 'POST',
              headers: { 'Content-Type': 'video/webm' },
              body: buffer
            });
          };

          recorder.start(400);
          console.log('[COMPOSITE-RECORDER] MediaRecorder active on composite canvas!');

          function renderLoop() {
            try {
              // 1. Draw 3D WebGL game scene
              ctx.drawImage(webglCanvas, 0, 0, W, H);

              const now = Date.now();
              const elapsedSec = (now - globalStartTime) / 1000;

              // Timeline management:
              // 0s - 4.5s: Startup Screen
              // 4.5s - 22s: Active Gameplay
              // 22s - 28s: Pause Menu
              // 28s - 36s: Resumed Gameplay
              // 36s: Finish
              if (elapsedSec < 4.5) {
                recordingPhase = 'startup_screen';
              } else if (elapsedSec >= 4.5 && elapsedSec < 22.0) {
                if (recordingPhase === 'startup_screen') {
                  recordingPhase = 'gameplay';
                  console.log('[COMPOSITE-RECORDER] Starting game patrol!');
                  const consentBtn = document.getElementById('btn-consent-allow');
                  if (consentBtn) consentBtn.click();
                  const startBtn = document.getElementById('btn-start-patrol');
                  if (startBtn) startBtn.click();
                  if (window.game) {
                    window.game.isPaused = false;
                    window.game.handleMasterModeCommand({
                      type: 'TOGGLE_AUTOPILOT',
                      payload: { enabled: true },
                      sender: 'MASTERMODE_DASHBOARD'
                    });
                    window.game.hearts = 5;
                    window.game.maxHearts = 5;
                  }
                }
              } else if (elapsedSec >= 22.0 && elapsedSec < 28.0) {
                if (recordingPhase === 'gameplay') {
                  recordingPhase = 'pause_menu';
                  console.log('[COMPOSITE-RECORDER] Triggering pause menu!');
                  const pauseBtn = document.getElementById('btn-manual-pause');
                  if (pauseBtn) pauseBtn.click();
                  if (window.game) window.game.pauseGame?.();
                }
              } else if (elapsedSec >= 28.0 && elapsedSec < 36.0) {
                if (recordingPhase === 'pause_menu') {
                  recordingPhase = 'resumed_gameplay';
                  console.log('[COMPOSITE-RECORDER] Resuming patrol!');
                  const resumeBtn = document.getElementById('btn-auto-resume');
                  if (resumeBtn) resumeBtn.click();
                  if (window.game) window.game.resumeGame?.();
                }
              } else if (elapsedSec >= 36.0) {
                if (recorder.state === 'recording') {
                  console.log('[COMPOSITE-RECORDER] Reached 36s mark, stopping recorder.');
                  recorder.stop();
                }
              }

              // Keep hearts filled during gameplay
              if (window.game && (recordingPhase === 'gameplay' || recordingPhase === 'resumed_gameplay')) {
                if (window.game.hearts < 3) window.game.hearts = 5;
              }

              // 2. Render overlays based on current phase
              if (recordingPhase === 'startup_screen') {
                drawStartupScreen(ctx, W, H, elapsedSec);
              } else if (recordingPhase === 'pause_menu') {
                drawPauseMenu(ctx, W, H, elapsedSec);
              } else {
                drawGameplayHud(ctx, W, H, window.game);
              }
            } catch (err) {
              console.error('[COMPOSITE-RECORDER] render error:', err);
            }

            if (recorder.state === 'recording') {
              requestAnimationFrame(renderLoop);
            }
          }

          requestAnimationFrame(renderLoop);

          // Progress reporting interval
          const progressInterval = setInterval(() => {
            const elapsed = Math.round((Date.now() - globalStartTime) / 1000);
            const dist = Math.round(window.game?.distanceMeters || 0);
            const score = window.game?.score || 0;
            fetch('http://127.0.0.1:5177/progress?phase=' + recordingPhase + '&elapsed=' + elapsed + '&dist=' + dist + '&score=' + score, { method: 'POST' }).catch(() => {});
            if (elapsed >= 38) {
              clearInterval(progressInterval);
              if (recorder.state === 'recording') recorder.stop();
            }
          }, 1000);
        }

        // DRAW STARTUP SCREEN OVERLAY
        function drawStartupScreen(ctx, W, H, time) {
          // Backdrop tint
          ctx.fillStyle = 'rgba(5, 10, 20, 0.72)';
          ctx.fillRect(0, 0, W, H);

          const cardW = 540;
          const cardH = 580;
          const cardX = (W - cardW) / 2;
          const cardY = (H - cardH) / 2;

          // Glassmorphic Modal Card
          ctx.save();
          ctx.fillStyle = 'rgba(17, 24, 39, 0.94)';
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 24;
          ctx.beginPath();
          ctx.roundRect(cardX, cardY, cardW, cardH, 20);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Title: KARACHI RUNNER
          ctx.textAlign = 'center';
          ctx.font = '900 32px Outfit, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
          ctx.shadowBlur = 12;
          ctx.fillText('KARACHI RUNNER', W / 2, cardY + 54);
          ctx.shadowBlur = 0;

          // Urdu Subtitle
          ctx.font = '700 16px "Noto Nastaliq Urdu", Outfit, sans-serif';
          ctx.fillStyle = '#ffd700';
          ctx.fillText('شہرِ کراچی کی شاہراہوں پر دوڑیں', W / 2, cardY + 82);

          // District Selection Group
          const grpY = cardY + 110;
          ctx.textAlign = 'left';
          ctx.font = '700 12px Outfit, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillText('📍 KARACHI LOOP · 200 NEIGHBORHOODS', cardX + 32, grpY);

          // District Card (Soldier Bazar · PECHS)
          const distCardY = grpY + 14;
          const distCardW = cardW - 64;
          const distCardH = 72;
          ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
          ctx.strokeStyle = '#00e5ff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(cardX + 32, distCardY, distCardW, distCardH, 12);
          ctx.fill();
          ctx.stroke();

          // District Badge & Title
          ctx.font = '800 13px Outfit, sans-serif';
          ctx.fillStyle = '#00e5ff';
          ctx.fillText('SOLDIER BAZAR · PECHS', cardX + 46, distCardY + 26);
          ctx.fillStyle = '#ffffff';
          ctx.font = '600 13px Outfit, sans-serif';
          ctx.fillText('Soldier Bazar to PECHS (Tariq Road)', cardX + 46, distCardY + 46);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.font = '400 11px Outfit, sans-serif';
          ctx.fillText('Old-city utility lanes · gutters & low hanging wires', cardX + 46, distCardY + 62);

          // Status Badge 'ACTIVE'
          ctx.fillStyle = '#00e676';
          ctx.font = '800 11px Outfit, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('● UNLOCKED', cardX + cardW - 46, distCardY + 26);

          // Runner Pace Selection
          const paceY = distCardY + 92;
          ctx.textAlign = 'left';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '700 12px Outfit, sans-serif';
          ctx.fillText('🏃 CHOOSE YOUR PACE:', cardX + 32, paceY);

          const paces = [
            { icon: '🌱', label: 'Easy', active: false },
            { icon: '⚡', label: 'Standard', active: true },
            { icon: '🔥', label: 'Hard', active: false }
          ];
          const paceW = (distCardW - 16) / 3;
          paces.forEach((p, idx) => {
            const px = cardX + 32 + idx * (paceW + 8);
            const py = paceY + 12;
            ctx.fillStyle = p.active ? 'rgba(0, 230, 118, 0.18)' : 'rgba(255, 255, 255, 0.05)';
            ctx.strokeStyle = p.active ? '#00e676' : 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = p.active ? 1.5 : 1;
            ctx.beginPath();
            ctx.roundRect(px, py, paceW, 46, 8);
            ctx.fill();
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.font = '14px Outfit, sans-serif';
            ctx.fillStyle = p.active ? '#00e676' : '#ffffff';
            ctx.fillText(p.icon + ' ' + p.label, px + paceW / 2, py + 28);
          });

          // Avatar Getup Selection
          const avatarY = paceY + 80;
          ctx.textAlign = 'left';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '700 12px Outfit, sans-serif';
          ctx.fillText('🥋 GETUP / AVATAR:', cardX + 32, avatarY);

          const avatars = [
            { id: 'tariq', name: 'Tariq Road Kurta', sub: 'Traditional', active: true },
            { id: 'lyari', name: 'Lyari Footballer', sub: 'Speedster', active: false }
          ];
          const avW = (distCardW - 8) / 2;
          avatars.forEach((a, idx) => {
            const ax = cardX + 32 + idx * (avW + 8);
            const ay = avatarY + 12;
            ctx.fillStyle = a.active ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)';
            ctx.strokeStyle = a.active ? '#ffd700' : 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = a.active ? 1.5 : 1;
            ctx.beginPath();
            ctx.roundRect(ax, ay, avW, 52, 8);
            ctx.fill();
            ctx.stroke();

            ctx.textAlign = 'left';
            ctx.font = '700 13px Outfit, sans-serif';
            ctx.fillStyle = a.active ? '#ffd700' : '#ffffff';
            ctx.fillText('👤 ' + a.name, ax + 14, ay + 24);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '400 11px Outfit, sans-serif';
            ctx.fillText(a.sub, ax + 14, ay + 42);
          });

          // Action Row: HELP, PROGRESS, and START RUN button
          const actionY = avatarY + 90;
          const pulse = 1.0 + Math.sin(time * 6) * 0.03;

          // START RUN Button
          const btnW = distCardW;
          const btnH = 54;
          const btnX = cardX + 32;
          const btnY = actionY;

          ctx.save();
          ctx.translate(btnX + btnW / 2, btnY + btnH / 2);
          ctx.scale(pulse, pulse);
          ctx.translate(-(btnX + btnW / 2), -(btnY + btnH / 2));

          const grad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY);
          grad.addColorStop(0, '#00e676');
          grad.addColorStop(1, '#00b0ff');
          ctx.fillStyle = grad;
          ctx.shadowColor = '#00e676';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.roundRect(btnX, btnY, btnW, btnH, 27);
          ctx.fill();

          ctx.textAlign = 'center';
          ctx.font = '900 18px Outfit, sans-serif';
          ctx.fillStyle = '#0a192f';
          ctx.shadowBlur = 0;
          ctx.fillText('🏃 START PATROL MISSION', btnX + btnW / 2, btnY + 34);
          ctx.restore();
        }

        // DRAW ACTIVE GAMEPLAY HUD
        function drawGameplayHud(ctx, W, H, game) {
          const dist = Math.round(game?.distanceMeters || 0);
          const score = game?.score || 0;
          const coins = game?.coins || 0;
          const hearts = game?.hearts || 5;

          // 1. Top Bar Background
          ctx.fillStyle = 'rgba(10, 15, 26, 0.65)';
          ctx.beginPath();
          ctx.roundRect(16, 16, W - 32, 60, 14);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Left: Hearts & Distance
          ctx.textAlign = 'left';
          ctx.font = '18px sans-serif';
          ctx.fillStyle = '#ff1744';
          ctx.fillText('❤️'.repeat(Math.max(1, Math.min(5, hearts))), 34, 52);

          ctx.font = '800 18px Outfit, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('🏃 ' + dist + 'm', 170, 52);

          // Center: District Milestone
          ctx.textAlign = 'center';
          ctx.font = '700 13px Outfit, sans-serif';
          ctx.fillStyle = '#00e5ff';
          ctx.fillText('📍 SOLDIER BAZAR · PECHS', W / 2, 44);
          ctx.font = '400 11px Outfit, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillText('DISTRICT 1 · KARACHI CITY LOOP', W / 2, 62);

          // Right: Rupees Score & Coins
          ctx.textAlign = 'right';
          ctx.font = '800 18px Outfit, sans-serif';
          ctx.fillStyle = '#ffd700';
          ctx.fillText('🪙 ' + score.toLocaleString() + ' Rs', W - 140, 52);

          // Pause Button [⏸️ PAUSE]
          const pbX = W - 110;
          const pbY = 26;
          const pbW = 84;
          const pbH = 40;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.roundRect(pbX, pbY, pbW, pbH, 8);
          ctx.fill();
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.font = '700 12px Outfit, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('⏸️ PAUSE', pbX + pbW / 2, pbY + 25);
        }

        // DRAW PAUSE MENU OVERLAY
        function drawPauseMenu(ctx, W, H, time) {
          // Dimmed backdrop with blur feel
          ctx.fillStyle = 'rgba(3, 7, 18, 0.88)';
          ctx.fillRect(0, 0, W, H);

          const cardW = 460;
          const cardH = 390;
          const cardX = (W - cardW) / 2;
          const cardY = (H - cardH) / 2;

          // Glassmorphic Pause Card
          ctx.save();
          ctx.fillStyle = 'rgba(17, 24, 39, 0.95)';
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.roundRect(cardX, cardY, cardW, cardH, 20);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Pause Icon
          ctx.textAlign = 'center';
          ctx.font = '40px sans-serif';
          ctx.fillText('⏸️', W / 2, cardY + 68);

          // Title: RUN PAUSED
          ctx.font = '900 28px Outfit, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('RUN PAUSED', W / 2, cardY + 114);

          // Subtitle
          ctx.font = '400 13px Outfit, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillText('Your Karachi patrol is safely on hold.', W / 2, cardY + 140);

          // RESUME BUTTON
          const btnW = cardW - 72;
          const btnH = 50;
          const btnX = cardX + 36;
          let btnY = cardY + 168;

          const resGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY);
          resGrad.addColorStop(0, '#00e676');
          resGrad.addColorStop(1, '#00b0ff');
          ctx.fillStyle = resGrad;
          ctx.beginPath();
          ctx.roundRect(btnX, btnY, btnW, btnH, 25);
          ctx.fill();

          ctx.font = '900 16px Outfit, sans-serif';
          ctx.fillStyle = '#0a192f';
          ctx.fillText('▶ RESUME RUN', btnX + btnW / 2, btnY + 31);

          // GAME MENU & SETTINGS BUTTON
          btnY += 62;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.roundRect(btnX, btnY, btnW, btnH, 25);
          ctx.fill();
          ctx.stroke();

          ctx.font = '700 14px Outfit, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('☰ OPEN GAME MENU & SETTINGS', btnX + btnW / 2, btnY + 31);

          // RETURN TO MAIN MENU BUTTON
          btnY += 60;
          ctx.font = '600 13px Outfit, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillText('🏠 RETURN TO MAIN MENU', btnX + btnW / 2, btnY + 22);
        }

        window.addEventListener('DOMContentLoaded', () => {
          setTimeout(initFullUiRecorder, 600);
        });
      })();
    </script>
  `;

  const modifiedHtml = ORIGINAL_INDEX_HTML.replace('</body>', `${injectionScript}</body>`);
  fs.writeFileSync(indexPath, modifiedHtml, 'utf8');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'karachi-record-full-ui-'));
  const chromeArgs = [
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1280,720',
    'http://127.0.0.1:5173/'
  ];

  console.log('🎬 [RECORDER] Launching Chrome to record full journey (Startup Screen -> Gameplay -> Pause Menu -> Resumed)...');
  const chromeProcess = spawn(chromeExecutable, chromeArgs, { stdio: 'inherit' });

  chromeProcess.on('error', err => {
    console.error('❌ Failed to spawn Chrome:', err);
    restoreIndex();
    process.exit(1);
  });

  // Wait up to 70s for video completion
  const timeout = setTimeout(() => {
    console.error('⚠️ [RECORDER] Timed out waiting for full UI video completion.');
    try { chromeProcess.kill(); } catch {}
    restoreIndex();
    server.close();
    process.exit(1);
  }, 70000);

  const result = await videoDonePromise;
  clearTimeout(timeout);

  console.log(`🎉 [FULL UI RECORDER SUCCESS] Captured ${result.bytes} bytes of comprehensive video!`);

  try { chromeProcess.kill(); } catch {}
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  restoreIndex();
  server.close();
  process.exit(0);
}
