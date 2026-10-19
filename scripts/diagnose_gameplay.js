import http from 'http';
import { spawn } from 'child_process';

async function diagnose() {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const debuggingPort = 9225;
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debuggingPort}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1280,720',
    'http://localhost:5174/'
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch(`http://127.0.0.1:${debuggingPort}/json`);
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page');
    if (!page) throw new Error('No page found');

    const WebSocket = (await import('ws')).default || (await import('ws'));
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    let id = 1;
    const send = (method, params = {}) => new Promise((resolve) => {
      const msgId = id++;
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === msgId) {
          ws.off('message', handler);
          resolve(msg.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await new Promise(r => ws.on('open', r));
    await send('Runtime.enable');
    await send('Log.enable');

    const consoleLogs = [];
    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      if (msg.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push({
          type: msg.params.type,
          args: msg.params.args.map(a => a.value || a.description)
        });
      }
    });

    // Wait 3s
    await new Promise(r => setTimeout(r, 3000));

    // Evaluate state before click
    const stateBefore = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        isGameStarted: window.game?.isGameStarted,
        isPaused: window.game?.isPaused,
        isGameOver: window.game?.isGameOver,
        isTempleRun: window.game?.isTempleRun,
        playerPos: window.game?.player?.position,
        playerSpeed: window.game?.player?.currentSpeed,
        runSpeed: window.game?.runSpeed,
        avatarMeshVisible: window.game?.player?.avatarMesh?.visible,
        avatarMeshChildren: window.game?.player?.avatarMesh?.children?.length,
        objectsAt70: (window.game?.edibleObjects || []).filter(o => o.mesh && Math.hypot(o.mesh.position.x, o.mesh.position.z - 70) < 4).map(o => o.name),
        startModalDisplay: document.getElementById('modal-start-mission')?.style?.display,
        obstaclesCount: window.game?.cityGen?.obstacles?.length
      })`,
      returnByValue: true
    });

    console.log('--- STATE BEFORE START CLICK ---');
    console.log(stateBefore.result.value);

    // Simulate clicking start patrol
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('btn-start-patrol');
        if (btn) btn.click();
      })()`
    });

    await new Promise(r => setTimeout(r, 2000));

    // Evaluate state after click
    const stateAfter = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        isGameStarted: window.game?.isGameStarted,
        isPaused: window.game?.isPaused,
        isGameOver: window.game?.isGameOver,
        playerPos: window.game?.player?.position,
        distanceMeters: window.game?.distanceMeters,
        coins: window.game?.coins,
        timeLeft: window.game?.timeLeft,
        objectsAtPlayer: (window.game?.edibleObjects || []).filter(o => o.mesh && Math.hypot(o.mesh.position.x - window.game.player.position.x, o.mesh.position.z - window.game.player.position.z) < 3).map(o => o.name)
      })`,
      returnByValue: true
    });

    console.log('--- STATE AFTER START CLICK ---');
    console.log(stateAfter.result.value);

    console.log('--- CONSOLE LOGS ---');
    console.log(JSON.stringify(consoleLogs, null, 2));

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

diagnose().catch(console.error);
