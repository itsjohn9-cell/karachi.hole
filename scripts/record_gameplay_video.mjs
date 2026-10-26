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
let finalDistance = 0;
let finalScore = 0;

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
    const urlObj = new URL(req.url, 'http://127.0.0.1:5176');
    const elapsed = urlObj.searchParams.get('elapsed');
    const dist = urlObj.searchParams.get('dist');
    const score = urlObj.searchParams.get('score');
    console.log(`⏱️ [GAMEPLAY 2-MIN] Elapsed: ${elapsed}s / 120s | Distance: ${dist}m | Score: ${score}`);
    res.writeHead(200);
    res.end('ok');
    return;
  }

  if (req.url === '/save-video' && req.method === 'POST') {
    const chunks = [];
    finalDistance = Number(req.headers['x-distance'] || 0);
    finalScore = Number(req.headers['x-score'] || 0);

    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      receivedVideoBytes = buffer.length;

      const reportVideoPath2m = path.join(reportDir, 'gameplay_2min.webm');
      fs.writeFileSync(reportVideoPath2m, buffer);
      console.log(`✅ [RECORDER] Saved video to ${reportVideoPath2m} (${receivedVideoBytes} bytes)`);

      if (fs.existsSync(artifactDir)) {
        const artifactVideoPath2m = path.join(artifactDir, 'gameplay_2min.webm');
        fs.writeFileSync(artifactVideoPath2m, buffer);
        console.log(`✅ [RECORDER] Saved artifact video to ${artifactVideoPath2m}`);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'saved', bytes: receivedVideoBytes }));

      serverResolve({
        success: true,
        bytes: receivedVideoBytes,
        distance: finalDistance,
        score: finalScore
      });
    });
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(5176, '127.0.0.1', () => {
  console.log('🚀 [RECORDER SERVER] Listening on http://127.0.0.1:5176');
  startRecordingSession();
});

async function startRecordingSession() {
  const injectionScript = `
    <script>
      (function() {
        console.log('[AUTO-RECORDER] Injected 1-min script active.');
        localStorage.setItem('karachi_runner_intro_seen_v1', 'true');
        localStorage.setItem('kr_analytics_consent', 'granted');

        async function initRecorder() {
          let attempts = 0;
          while ((!window.game || !window.game.isGameStarted) && attempts < 80) {
            attempts++;
            const consentBtn = document.getElementById('btn-consent-allow');
            if (consentBtn) consentBtn.click();
            const startBtn = document.getElementById('btn-start-patrol');
            if (startBtn && startBtn.offsetParent !== null) {
              startBtn.click();
            }
            await new Promise(r => setTimeout(r, 150));
          }

          console.log('[AUTO-RECORDER] Game active! Engaging autopilot and MediaRecorder...');
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

          const canvas = document.querySelector('#canvas-container canvas') || document.querySelector('canvas');
          if (!canvas) {
            console.error('[AUTO-RECORDER] Canvas not found!');
            return;
          }

          const stream = canvas.captureStream(30);
          let mime = 'video/webm;codecs=vp8';
          if (!MediaRecorder.isTypeSupported(mime)) {
            mime = 'video/webm';
          }

          const recordedChunks = [];
          const recorder = new MediaRecorder(stream, {
            mimeType: mime,
            videoBitsPerSecond: 3500000
          });

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) recordedChunks.push(e.data);
          };

          recorder.onstop = async () => {
            console.log('[AUTO-RECORDER] Recorder stopped, sending ' + recordedChunks.length + ' chunks...');
            const blob = new Blob(recordedChunks, { type: mime });
            const buffer = await blob.arrayBuffer();
            await fetch('http://127.0.0.1:5176/save-video', {
              method: 'POST',
              headers: {
                'Content-Type': 'video/webm',
                'X-Distance': String(Math.round(window.game?.distanceMeters || 0)),
                'X-Score': String(window.game?.score || 0)
              },
              body: buffer
            });
          };

          recorder.start(400);

          const startTime = Date.now();
          const timer = setInterval(() => {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            const dist = Math.round(window.game?.distanceMeters || 0);
            const score = window.game?.score || 0;

            if (window.game) {
              if (window.game.hearts < 3) window.game.hearts = 5;
              if (window.game.isPaused) window.game.isPaused = false;
            }

            fetch('http://127.0.0.1:5176/progress?elapsed=' + elapsed + '&dist=' + dist + '&score=' + score, { method: 'POST' }).catch(() => {});

            if (elapsed >= 120) {
              clearInterval(timer);
              recorder.stop();
            }
          }, 1000);
        }

        window.addEventListener('DOMContentLoaded', () => {
          setTimeout(initRecorder, 600);
        });
      })();
    </script>
  `;

  const modifiedHtml = ORIGINAL_INDEX_HTML.replace('</body>', `${injectionScript}</body>`);
  fs.writeFileSync(indexPath, modifiedHtml, 'utf8');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'karachi-record-2m-'));
  const chromeArgs = [
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1280,720',
    'http://127.0.0.1:5173/'
  ];

  console.log('🎬 [RECORDER] Launching Chrome to record full 2-minute (120s) gameplay...');
  const chromeProcess = spawn(chromeExecutable, chromeArgs, { stdio: 'inherit' });

  chromeProcess.on('error', err => {
    console.error('❌ Failed to spawn Chrome:', err);
    restoreIndex();
    process.exit(1);
  });

  // Wait up to 150s for the recording to complete
  const timeout = setTimeout(() => {
    console.error('⚠️ [RECORDER] Timed out waiting for video completion.');
    try { chromeProcess.kill(); } catch {}
    restoreIndex();
    server.close();
    process.exit(1);
  }, 150000);

  const result = await videoDonePromise;
  clearTimeout(timeout);

  console.log(`🎉 [RECORDER SUCCESS] Captured ${result.bytes} bytes of 1-minute gameplay video! Final Distance: ${result.distance}m, Score: ${result.score}`);

  try { chromeProcess.kill(); } catch {}
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  restoreIndex();
  server.close();
  process.exit(0);
}
