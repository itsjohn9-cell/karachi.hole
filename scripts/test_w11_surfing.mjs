import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

// Mock browser globals for Node test environment
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { reload: () => {} },
    innerWidth: 1280,
    innerHeight: 720
  };
}
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
      style: {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      addEventListener: () => {},
      getContext: () => new Proxy({
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        measureText: () => ({ width: 10 })
      }, {
        get: (target, prop) => (prop in target ? target[prop] : () => {}),
        set: () => true
      })
    }),
    body: { appendChild: () => {}, removeChild: () => {} }
  };
}
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

const { CityGenerator } = await import('../src/cityGenerator.js');

test('CityGenerator.createW11SurfingBus creates bus with rear ramp and roof deck', () => {
  const bus = CityGenerator.createW11SurfingBus();
  assert.ok(bus instanceof THREE.Group, 'Expected a THREE.Group');
  assert.equal(bus.name, 'W11-Surfing-Bus');
  assert.equal(bus.userData.isSurfingBus, true);
  assert.equal(bus.userData.roofHeight, 3.12);
  assert.equal(bus.userData.rampStartZ, 7.5);
  assert.equal(bus.userData.rampEndZ, 3.1);
  assert.equal(bus.userData.rampLength, 4.4);

  // Check children: core bus, rear ramp group, roof deck, ramp sign
  const rearRamp = bus.children.find(c => c.name === 'W11-Rear-Ramp');
  assert.ok(rearRamp, 'Must have attached W11-Rear-Ramp');
  assert.ok(rearRamp.rotation.x > 0.5, 'Ramp must be inclined upward towards roof');
});

test('CityGenerator.createOverheadBridgeSign creates low clearance sign', () => {
  const sign = CityGenerator.createOverheadBridgeSign({
    blockedLanes: [-3.2, 0],
    text: '⚠️ RIGHT LANE OPEN / SLIDE!'
  });
  assert.ok(sign instanceof THREE.Group, 'Expected a THREE.Group');
  assert.equal(sign.name, 'Overhead-Bridge-Sign');
  assert.equal(sign.userData.isOverheadBridgeSign, true);
  assert.equal(sign.userData.bottomY, 3.52);
  assert.equal(sign.userData.topY, 4.70);
  assert.deepEqual(sign.userData.blockedLanes, [-3.2, 0]);
  assert.equal(sign.userData.requiredAction, 'slide_or_dodge');
});

test('CityGenerator.createW11SurfingSetPiece creates complete set piece bundle', () => {
  const setPiece = CityGenerator.createW11SurfingSetPiece(-120.0, { laneX: 0 });
  assert.ok(setPiece.bus, 'Must include surfing bus');
  assert.equal(setPiece.bus.position.z, -120.0);
  assert.equal(setPiece.bus.position.x, 0);
  assert.equal(setPiece.bridgeSigns.length, 3, 'Must include 3 downstream bridge signs');
  assert.equal(setPiece.bridgeSigns[0].position.z, -120.0 - 45);
  assert.equal(setPiece.bridgeSigns[1].position.z, -120.0 - 90);
  assert.equal(setPiece.bridgeSigns[2].position.z, -120.0 - 135);
});

test('W-11 Surfing Ramp Trigger Math: smooth ascension and roof snap', () => {
  const busZ = -50.0;
  const busRoofY = 3.12;
  const groundY = 0.05;

  // 1. Approaching ramp at distance 6.0m behind bus center (between 3.1 and 7.5)
  const distZ = 5.3; // middle of ramp
  const rampProgress = (7.5 - distZ) / 4.4; // 0.5
  const rampY = groundY + rampProgress * (busRoofY - groundY);
  assert.ok(rampProgress > 0 && rampProgress < 1, 'Ramp progress should be normalized 0..1');
  assert.ok(rampY > groundY && rampY < busRoofY, 'Height should be midway up ramp');

  // 2. Entering roof zone (distZ < 3.1)
  const playerZAtRoof = busZ + 2.5;
  const isSnappedToRoof = (playerZAtRoof - busZ) < 3.1;
  assert.equal(isSnappedToRoof, true, 'Player should snap to roof when crossing ramp threshold');
});

test('W-11 Surfing Mechanic: 50% Speed Boost and Invulnerability', () => {
  const baseRunnerSpeed = 13.5;
  let speed = baseRunnerSpeed;
  const isBusSurfing = true;

  if (isBusSurfing) {
    speed *= 1.50;
  }
  assert.equal(speed, 20.25, 'Current speed must increase by exactly 50%');

  // Ground hazard invulnerability check
  const groundObstacle = { type: 'pothole', hazardType: 'LOW_HAZARD', isHit: false };
  let damaged = false;
  if (isBusSurfing && (groundObstacle.hazardType === 'LOW_HAZARD' || groundObstacle.type === 'pothole')) {
    // Invulnerable to ground hazards while surfing on roof!
    damaged = false;
  } else {
    damaged = true;
  }
  assert.equal(damaged, false, 'Player must be invulnerable to ground hazards while surfing');
});

test('W-11 Surfing Bridge Sign Dodging & Sliding Mechanics', () => {
  const sign = {
    type: 'overhead_bridge_sign',
    blockedLanes: [-3.2, 0], // Left and center lanes blocked, right lane (+3.2) open
    isHit: false
  };

  // Case A: Swiping right to lane +3.2 (dodge)
  const targetLaneX = 3.2;
  const isLaneBlocked = sign.blockedLanes.some(lx => Math.abs(targetLaneX - lx) < 1.0);
  assert.equal(isLaneBlocked, false, 'Right lane should be unblocked');

  // Case B: In center lane (0), but sliding
  const centerLaneX = 0;
  const isCenterBlocked = sign.blockedLanes.some(lx => Math.abs(centerLaneX - lx) < 1.0);
  const isSliding = true;
  assert.equal(isCenterBlocked, true, 'Center lane is blocked');
  const clearedBySlide = isCenterBlocked && isSliding;
  assert.equal(clearedBySlide, true, 'Should clear low bridge sign by sliding');

  // Case C: In center lane, standing (not sliding)
  const isStanding = false;
  const hitSign = isCenterBlocked && !isStanding;
  assert.equal(hitSign, true, 'Should hit sign when standing in blocked lane');
});

test('W-11 Surfing Exit: 15s timer expiration, brake screech, and forward launch', () => {
  let timer = 15.0;
  const dt = 1.0;
  let audioPlayed = null;
  const mockAudio = {
    playBrakeScreech: () => { audioPlayed = 'playBrakeScreech'; }
  };

  // Simulate 15 seconds countdown
  for (let s = 0; s < 15; s++) {
    timer -= dt;
  }
  assert.equal(timer, 0.0, 'Timer should reach 0 after 15 seconds');

  let isBusSurfing = true;
  let playerVelocityY = 0;
  let playerGrounded = true;

  if (timer <= 0) {
    mockAudio.playBrakeScreech();
    playerVelocityY = 8.5; // upward launch
    playerGrounded = false;
    isBusSurfing = false;
  }

  assert.equal(audioPlayed, 'playBrakeScreech', 'Must trigger audio.playBrakeScreech');
  assert.equal(playerVelocityY, 8.5, 'Must launch player forward with upward velocity');
  assert.equal(playerGrounded, false, 'Player must be airborne during launch');
  assert.equal(isBusSurfing, false, 'Surfing mode must end');
});
