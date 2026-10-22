// Captures Google Play phone screenshots (1080x1920) from a running dev server.
// Usage: node scripts/capture_store_assets.mjs [--port=5180]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const port = (process.argv.find(a => a.startsWith('--port=')) || '--port=5180').split('=')[1];
const outDir = path.join(root, 'store-assets', 'screenshots');
const chrome = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const wrapperName = 'store-shot.html';
const wrapperPath = path.join(root, wrapperName);

const SCENES = {
  '1-menu': '',
  '2-streets': `start(); setDistrict(1); advance(70);`,
  '3-landmarks': `start(); setDistrict(2); advance(70);`,
  '4-turn-ahead': `start(); setDistrict(1); game.nextJunctionAt = 1e9; game.spawnRunnerJunction('turn', -1, 70); advance(30);`,
  '5-mid-turn': `start(); setDistrict(1); game.nextJunctionAt = 1e9; game.distanceMeters = 1000;
    game.spawnRunnerJunction('turn', 1, 90); const j = game.runnerJunction;
    for (let i = 0; i < 800 && game.player.position.z - j.z > 9; i++) game.updateTempleRunCorridor(0.016);
    game.changeLane(1);
    for (let i = 0; i < 25 && game.runnerTurn; i++) game.updateTempleRunCorridor(0.016);`,
  '6-district3': `start(); setDistrict(3); advance(70);`
};

function wrapper(sceneCode) {
  return `<!doctype html><html><body style="margin:0;background:#000">
<iframe id="f" src="/" style="border:0;width:540px;height:960px"></iframe>
<script>
const f = document.getElementById('f');
const timer = setInterval(() => {
  const w = f.contentWindow;
  if (!w?.game?.ui || !w.document.getElementById('btn-start-patrol')) return;
  clearInterval(timer);
  setTimeout(() => {
    const game = w.game;
    const start = () => {
      w.document.getElementById('btn-start-patrol').click();
      game.isTempleRun = true; game.isGameStarted = true; game.isGameOver = false; game.isPaused = false;
      game.resetRunnerNavigation(); game.clearRunnerObjects(); game.hearts = 3;
      game.runnerInvulnerableTimer = 1e6;
    };
    const setDistrict = n => {
      game.currentDistrictLevel = n;
      game.corridorChunks.forEach(c => game.scene.remove(c));
      game.corridorChunks = [];
      game.initCorridorTerrain();
      game.player.position.set(0, 0, 0);
      game.currentLane = 0;
    };
    const advance = n => { for (let i = 0; i < n; i++) game.updateTempleRunCorridor(0.016); };
    try { ${sceneCode} } catch (e) { document.title = 'ERR ' + e.message; }
    w.document.querySelectorAll('#modal-tutorial, #modal-pause, .runner-tutorial-card').forEach(el => el.style.display = 'none');
  }, 300);
}, 100);
</script></body></html>`;
}

fs.mkdirSync(outDir, { recursive: true });
try {
  for (const [name, code] of Object.entries(SCENES)) {
    fs.writeFileSync(wrapperPath, wrapper(code));
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'store-shot-'));
    const file = path.join(outDir, `${name}.png`);
    try {
      execFileSync(chrome, [
        '--headless=new', '--no-first-run', `--user-data-dir=${profile}`,
        '--force-device-scale-factor=2', '--virtual-time-budget=6000',
        `--screenshot=${file}`, '--window-size=540,960',
        `http://127.0.0.1:${port}/${wrapperName}`
      ], { stdio: 'pipe', timeout: 120000 });
      console.log('captured', name);
    } finally {
      fs.rmSync(profile, { recursive: true, force: true });
    }
  }
} finally {
  fs.rmSync(wrapperPath, { force: true });
}
