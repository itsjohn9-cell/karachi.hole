import * as THREE from 'three';
import { GameStates, stateManager } from './StateManager.js';

/**
 * Universal WebGL Geometry, Material, and Texture Disposal Utility
 * Recursively frees all GPU memory for an object hierarchy to guarantee 0 memory leaks.
 */
export function disposeHierarchy(threeObject) {
  if (!threeObject) return;

  threeObject.traverse((node) => {
    // 1. Dispose Geometry
    if (node.geometry) {
      node.geometry.dispose();
    }

    // 2. Dispose Material(s) and Attached Textures
    if (node.material) {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((mat) => {
        if (!mat) return;

        // Dispose textures on material properties
        const textureKeys = [
          'map', 'alphaMap', 'aoMap', 'bumpMap', 'displacementMap',
          'emissiveMap', 'envMap', 'lightMap', 'metalnessMap',
          'normalMap', 'roughnessMap', 'specularMap'
        ];

        textureKeys.forEach((key) => {
          if (mat[key] && typeof mat[key].dispose === 'function') {
            mat[key].dispose();
          }
        });

        mat.dispose();
      });
    }
  });

  // 3. Detach from parent
  if (threeObject.parent) {
    threeObject.parent.remove(threeObject);
  }
}

/**
 * Core Game Engine
 * Coordinates WebGL Rendering, Physics Loop, Camera Chase, and State Synchronization.
 */
export class Game {
  constructor(containerId = 'canvas-container') {
    this.container = document.getElementById(containerId) || document.body;
    this.stateManager = stateManager;

    // Subsystem slots
    this.chunkManager = null;
    this.crisisManager = null;
    this.particleSystem = null;
    this.inputHandler = null;
    this.player = null;

    // Time & Metrics
    this.clock = new THREE.Clock(false);
    this.elapsedTime = 0;
    this.score = 0;
    this.currentCityKey = 'karachi';

    // Camera chase settings (Subway Surfers / GTA street chase perspective)
    this.camSettings = {
      height: 2.7,
      distance: 4.8,
      forwardLookAtOffset: -8.5,
      lookAtY: 1.35,
      lerpSpeed: 8.5
    };

    this.initWebGL();
    this.setupStateHooks();
    this.bindWindowEvents();

    // Start in BOOT state
    this.stateManager.transitionTo(GameStates.BOOT);

    // Bind and start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  // -------------------------------------------------------------------------
  // WebGL & Scene Initialization
  // -------------------------------------------------------------------------
  initWebGL() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd2c6b2);
    this.scene.fog = new THREE.FogExp2(0xd2c6b2, 0.0065);

    // 2. Camera
    const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.3, 500);
    this.camera.position.set(0, this.camSettings.height, this.camSettings.distance);
    this.camera.lookAt(0, this.camSettings.lookAtY, this.camSettings.forwardLookAtOffset);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear old canvases if any
    const existingCanvas = this.container.querySelector('canvas');
    if (existingCanvas) {
      existingCanvas.remove();
    }
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Rig
    this.ambientLight = new THREE.AmbientLight(0xfff3e0, 0.65);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xc4b79b, 0.5);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.dirLight.position.set(45, 70, 35);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 200;
    const shadowD = 65;
    this.dirLight.shadow.camera.left = -shadowD;
    this.dirLight.shadow.camera.right = shadowD;
    this.dirLight.shadow.camera.top = shadowD;
    this.dirLight.shadow.camera.bottom = -shadowD;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);
  }

  // -------------------------------------------------------------------------
  // State Machine Lifecycle Hooks
  // -------------------------------------------------------------------------
  setupStateHooks() {
    // When transitioning into PLAYING
    this.stateManager.onEnter(GameStates.PLAYING, () => {
      if (!this.clock.running) {
        this.clock.start();
      }
    });

    // When pausing for Educational Quiz
    this.stateManager.onEnter(GameStates.QUIZ_PAUSE, () => {
      this.clock.stop();
    });

    // When transitioning out of QUIZ_PAUSE
    this.stateManager.onExit(GameStates.QUIZ_PAUSE, () => {
      this.clock.start();
    });

    // When level or game resets
    this.stateManager.onEnter(GameStates.MAIN_MENU, () => {
      this.clock.stop();
    });
  }

  // -------------------------------------------------------------------------
  // City & Environment Configuration
  // -------------------------------------------------------------------------
  applyCityAtmosphere(cityConfig) {
    if (!cityConfig) return;

    if (cityConfig.skyColor) {
      this.scene.background = new THREE.Color(cityConfig.skyColor);
    }
    if (cityConfig.fogColor && cityConfig.fogDensity) {
      this.scene.fog = new THREE.FogExp2(cityConfig.fogColor, cityConfig.fogDensity);
    }
    if (cityConfig.ambientColor && this.ambientLight) {
      this.ambientLight.color.set(cityConfig.ambientColor);
    }
    if (cityConfig.sunColor && this.dirLight) {
      this.dirLight.color.set(cityConfig.sunColor);
    }
  }

  // -------------------------------------------------------------------------
  // Responsive Resize Handling
  // -------------------------------------------------------------------------
  bindWindowEvents() {
    this.handleResize = () => {
      const width = window.innerWidth;
      const height = Math.max(window.innerHeight, 1);

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      this.stateManager.emit('viewportResized', { width, height });
    };

    window.addEventListener('resize', this.handleResize);

    // Auto-pause when page loses focus
    window.addEventListener('visibilitychange', () => {
      if (document.hidden && this.stateManager.is(GameStates.PLAYING)) {
        this.stateManager.transitionTo(GameStates.QUIZ_PAUSE, { reason: 'visibilitychange' });
      }
    });
  }

  // -------------------------------------------------------------------------
  // Camera Chase Update
  // -------------------------------------------------------------------------
  updateCamera(dt) {
    if (!this.player || !this.camera) return;

    const targetPos = this.player.position;
    const s = this.camSettings;

    // Follow smoothly behind player along Z, centered horizontally
    const desiredX = targetPos.x * 0.45;
    const desiredY = targetPos.y + s.height + (this.player.radius || 1.0) * 0.4;
    const desiredZ = targetPos.z + s.distance;

    const t = Math.min(1.0, dt * s.lerpSpeed);
    this.camera.position.x += (desiredX - this.camera.position.x) * t;
    this.camera.position.y += (desiredY - this.camera.position.y) * t;
    this.camera.position.z += (desiredZ - this.camera.position.z) * t;

    // Always look forward ahead of player
    this.camera.lookAt(
      targetPos.x * 0.25,
      targetPos.y + s.lookAtY,
      targetPos.z + s.forwardLookAtOffset
    );
  }

  // -------------------------------------------------------------------------
  // Main Render & Physics Loop (Delta-Time Clamped)
  // -------------------------------------------------------------------------
  animate() {
    requestAnimationFrame(this.animate);

    // Delta-Time clamping to prevent physics tunneling during frame drops
    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05);

    if (this.stateManager.isPlaying()) {
      this.elapsedTime += dt;

      // Update Subsystems
      if (this.inputHandler) this.inputHandler.update(dt);
      if (this.player) this.player.update(dt);
      if (this.chunkManager) this.chunkManager.update(this.player.position, dt);
      if (this.crisisManager) this.crisisManager.update(dt);
      if (this.particleSystem) this.particleSystem.update(dt);

      this.updateCamera(dt);
    } else {
      // In non-playing states (MENU, CITY_SELECT, QUIZ_PAUSE), keep ambient particle & idle animations moving smoothly
      if (this.particleSystem) this.particleSystem.update(dt * 0.5);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // -------------------------------------------------------------------------
  // Clean Level Teardown & Memory Reclamation
  // -------------------------------------------------------------------------
  clearLevel() {
    if (this.chunkManager) {
      this.chunkManager.dispose();
      this.chunkManager = null;
    }

    if (this.crisisManager) {
      this.crisisManager.dispose();
      this.crisisManager = null;
    }

    if (this.particleSystem) {
      this.particleSystem.clear();
    }

    if (this.player) {
      disposeHierarchy(this.player.mesh);
      this.player = null;
    }
  }

  destroy() {
    this.clearLevel();
    window.removeEventListener('resize', this.handleResize);
    disposeHierarchy(this.scene);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

// Global Singleton Export
export const game = new Game();
