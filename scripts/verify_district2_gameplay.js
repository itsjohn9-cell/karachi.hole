import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  console.log('--- STARTING DISTRICT 2 & GAMEPLAY VERIFICATION ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('[BROWSER LOG]:', msg.text()));
  page.on('pageerror', err => console.error('[BROWSER ERROR]:', err));

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

  // 1. Start Patrol
  await page.evaluate(() => {
    const startBtn = document.getElementById('btn-start-patrol');
    if (startBtn) startBtn.click();
  });

  await new Promise(r => setTimeout(r, 800));

  // 2. Complete District 1 and advance to District 2
  const d2Result = await page.evaluate(async () => {
    const g = window.game;
    if (!g) throw new Error('Game instance not found');

    // Trigger district 1 cleared
    g.handleDistrictCleared();

    await new Promise(r => setTimeout(r, 500));

    // Click Next District
    const nextBtn = document.getElementById('btn-next-district');
    if (!nextBtn) throw new Error('Next district button not found');
    nextBtn.click();

    await new Promise(r => setTimeout(r, 600));

    const pPos = g.player.position;
    const cPos = g.camera.position;

    return {
      districtLevel: g.currentDistrictLevel,
      playerPos: { x: pPos.x, y: pPos.y, z: pPos.z },
      camPos: { x: cPos.x, y: cPos.y, z: cPos.z },
      camAngle: g.camAngle,
      playerSpeed: g.player.baseSpeed,
      playerRadius: g.player.targetRadius,
      isPlayerFinite: isFinite(pPos.x) && isFinite(pPos.z),
      isCamFinite: isFinite(cPos.x) && isFinite(cPos.z),
      childCount: g.scene.children.length,
      edibleCount: g.edibleObjects.length,
      obstaclesCount: g.cityGen.obstacles.length
    };
  });

  console.log('District 2 Advance Result:', JSON.stringify(d2Result, null, 2));

  if (d2Result.districtLevel !== 2) {
    throw new Error('Did not advance to District 2');
  }
  if (!d2Result.isPlayerFinite || !d2Result.isCamFinite) {
    throw new Error('Player or Camera position became NaN in District 2!');
  }
  if (d2Result.childCount < 40) {
    throw new Error('Scene has too few objects in District 2: ' + d2Result.childCount);
  }

  // 3. Test Backward Movement & Camera Viewing Angle Tracking
  console.log('Testing backward camera angle tracking...');
  const backwardResult = await page.evaluate(async () => {
    const g = window.game;
    const initialCamAngle = g.camAngle;

    // Simulate pressing KeyS (move backward)
    g.moveVector.y = 1; // inputForward = -1 (backward)
    g.moveVector.x = 0;

    // Simulate 30 frames of physics updates (~1 second of backward travel)
    for (let f = 0; f < 30; f++) {
      g.updatePhysics(0.033);
      g.updateCamera(0.033);
    }

    const newCamAngle = g.camAngle;
    const playerFacing = g.player.facingAngle;

    // Release key
    g.moveVector.y = 0;

    return {
      initialCamAngle,
      newCamAngle,
      playerFacing,
      angleDifference: Math.abs(newCamAngle - initialCamAngle)
    };
  });

  console.log('Backward Camera Tracking Result:', JSON.stringify(backwardResult, null, 2));
  if (backwardResult.angleDifference < 0.2) {
    throw new Error('Camera viewing angle failed to rotate when moving backward!');
  }

  // 4. Test Solid Building Collision (No Penetration)
  console.log('Testing solid building collision...');
  const collisionResult = await page.evaluate(() => {
    const g = window.game;
    const obstacles = g.cityGen.obstacles;

    // Find a solid box obstacle (e.g. Burns Road or Tariq Road plaza or dry home)
    const boxObs = obstacles.find(o => o.isBox && o.maxX - o.minX > 3.0);
    if (!boxObs) throw new Error('No box obstacle found for collision test');

    // Place player right outside the south face (maxZ)
    const startX = boxObs.cx;
    const startZ = boxObs.maxZ + 0.5;
    g.player.position.set(startX, 0, startZ);

    // Attempt to push NORTH directly into the building for 30 frames at full sprint speed
    g.player.isBoosting = true;
    for (let f = 0; f < 30; f++) {
      // dx = 0, dz = -1 (moving North into building)
      g.player.move(0, -1, 0.033, 94.0, obstacles);
    }

    const finalX = g.player.position.x;
    const finalZ = g.player.position.z;

    // Check if player penetrated inside the box
    const insideBox = (finalX >= boxObs.minX && finalX <= boxObs.maxX && finalZ >= boxObs.minZ && finalZ <= boxObs.maxZ);
    const stoppedAtWall = finalZ >= boxObs.maxZ + 0.65; // avatarBodyRadius is 0.70

    return {
      boxObs: { minX: boxObs.minX, maxX: boxObs.maxX, minZ: boxObs.minZ, maxZ: boxObs.maxZ },
      startZ,
      finalZ,
      insideBox,
      stoppedAtWall
    };
  });

  console.log('Building Collision Result:', JSON.stringify(collisionResult, null, 2));
  if (collisionResult.insideBox) {
    throw new Error('Avatar penetrated INSIDE the building box!');
  }
  if (!collisionResult.stoppedAtWall) {
    throw new Error('Avatar was not stopped at the building wall! Final Z: ' + collisionResult.finalZ);
  }

  // 5. Test Educational Challenge Non-Repetition & Category Diversity
  console.log('Testing quiz challenge diversity & rotation...');
  const quizResult = await page.evaluate(() => {
    const fn = window.getChallengeByCategoryAndTier;
    if (!fn) throw new Error('getChallengeByCategoryAndTier not found on window');

    const safety1 = fn('safety', 'kids');
    const safety2 = fn('safety', 'kids');
    const clean1 = fn('cleanliness', 'kids');
    const clean2 = fn('cleanliness', 'kids');
    const water1 = fn('water', 'kids');

    return {
      safety1: safety1?.id,
      safety2: safety2?.id,
      clean1: clean1?.id,
      clean2: clean2?.id,
      water1: water1?.id,
      safetyQuestionsDifferent: safety1?.id !== safety2?.id,
      cleanQuestionsDifferent: clean1?.id !== clean2?.id
    };
  });

  console.log('Quiz Questions Test Result:', JSON.stringify(quizResult, null, 2));
  if (!quizResult.safetyQuestionsDifferent) {
    throw new Error('Safety questions repeated on consecutive calls!');
  }
  if (!quizResult.cleanQuestionsDifferent) {
    throw new Error('Cleanliness questions repeated on consecutive calls!');
  }

  // 6. Capture live verification screenshot of District 2
  const screenshotPath = '/Users/mohammadjhone/Projects/hole-io-android/test_reports/district2_live_verified.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved District 2 Live Screenshot to:', screenshotPath);

  await browser.close();
  console.log('--- ALL DISTRICT 2 VERIFICATION CHECKS PASSED! ---');
}

main().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
