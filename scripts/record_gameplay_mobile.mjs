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
    const urlObj = new URL(req.url, 'http://127.0.0.1:5178');
    const elapsed = urlObj.searchParams.get('elapsed');
    const dist = urlObj.searchParams.get('dist');
    const score = urlObj.searchParams.get('score');
    console.log(`📱 [MOBILE 390x844] Elapsed: ${elapsed}s / 60s | Distance: ${dist}m | Score: ${score}`);
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

      const reportVideoPath = path.join(reportDir, 'gameplay_mobile_390x844.webm');
      fs.writeFileSync(reportVideoPath, buffer);
      console.log(`✅ [MOBILE RECORDER] Saved video to ${reportVideoPath} (${receivedVideoBytes} bytes)`);

      if (fs.existsSync(artifactDir)) {
        const artifactVideoPath = path.join(artifactDir, 'gameplay_mobile_390x844.webm');
        fs.writeFileSync(artifactVideoPath, buffer);
        console.log(`✅ [MOBILE RECORDER] Saved artifact video to ${artifactVideoPath}`);
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

server.listen(5178, '127.0.0.1', () => {
  console.log('🚀 [MOBILE RECORDER SERVER] Listening on http://127.0.0.1:5178');
  startRecordingSession();
});

async function startRecordingSession() {
  const injectionScript = `
    <script>
      (function() {
        console.log('[MOBILE-RECORDER] Injected mobile 390x844 script active.');
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

          console.log('[MOBILE-RECORDER] Game active on mobile viewport! Engaging autopilot...');
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
            console.error('[MOBILE-RECORDER] Canvas not found!');
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
            console.log('[MOBILE-RECORDER] Recorder stopped, sending ' + recordedChunks.length + ' chunks...');
            const blob = new Blob(recordedChunks, { type: mime });
            const buffer = await blob.arrayBuffer();
            await fetch('http://127.0.0.1:5178/save-video', {
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

          let durationSec = 60;
          let elapsedSec = 0;
          const interval = setInterval(() => {
            elapsedSec++;
            const dist = Math.round(window.game?.distanceMeters || 0);
            const score = window.game?.score || 0;

            fetch('http://127.0.0.1:5178/progress?elapsed=' + elapsedSec + '&dist=' + dist + '&score=' + score).catch(() => {});

            if (elapsedSec >= durationSec) {
              clearInterval(interval);
              console.log('[MOBILE-RECORDER] Stopping mobile recorder at ' + durationSec + 's...');
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

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'karachi-record-mobile-'));
  const chromeArgs = [
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required',
    `--user-data-dir=${userDataDir}`,
    '--window-size=390,844',
    'http://127.0.0.1:5173/'
  ];

  console.log('📱 [MOBILE RECORDER] Launching Chrome in 390x844 mobile viewport...');
  const chromeProcess = spawn(chromeExecutable, chromeArgs, { stdio: 'inherit' });

  chromeProcess.on('error', err => {
    console.error('❌ Failed to spawn Chrome:', err);
    restoreIndex();
    process.exit(1);
  });

  const timeout = setTimeout(() => {
    console.error('⚠️ [MOBILE RECORDER] Timed out waiting for video completion.');
    try { chromeProcess.kill(); } catch {}
    restoreIndex();
    server.close();
    process.exit(1);
  }, 90000);

  const result = await videoDonePromise;
  clearTimeout(timeout);

  console.log(`\n🎉 [MOBILE RECORDER SUCCESS] Captured ${result.bytes} bytes of mobile 390x844 gameplay! Final Distance: ${result.distance}m, Score: ${result.score}`);

  try { chromeProcess.kill(); } catch {}
  restoreIndex();
  server.close();
  process.exit(0);
}
