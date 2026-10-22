export class VirtualJoystick {
  constructor({ containerId = 'joystick-zone', onMove, onEnd, onBoost, onJump, onInteract, onJournal }) {
    this.container = document.getElementById(containerId) || document.body;
    this.onMove = onMove;
    this.onEnd = onEnd;
    this.onBoost = onBoost;
    this.onJump = onJump;
    this.onInteract = onInteract;
    this.onJournal = onJournal;

    this.active = false;
    this.touchId = null;
    this.origin = { x: 0, y: 0 };
    this.current = { x: 0, y: 0 };
    this.vector = { x: 0, y: 0 };
    this.maxRadius = 55;

    // Keys state for desktop
    this.keys = {
      KeyW: false, KeyS: false, KeyA: false, KeyD: false,
      ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
      Space: false, ShiftLeft: false, ShiftRight: false,
      KeyE: false, KeyJ: false
    };

    this.createDOM();
    this.bindEvents();
  }

  createDOM() {
    this.base = document.createElement('div');
    this.base.className = 'virtual-joystick-base';
    this.base.style.display = 'none';

    this.knob = document.createElement('div');
    this.knob.className = 'virtual-joystick-knob';

    this.base.appendChild(this.knob);
    document.body.appendChild(this.base);
  }

  bindEvents() {
    // Touch Events on mobile
    window.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    window.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    window.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });

    // Keyboard Events on desktop
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));

    // Mouse drag support on desktop
    let isMouseDown = false;
    window.addEventListener('mousedown', (e) => {
      // Ignore if clicking UI buttons
      if (e.target.closest('.ui-interactive, button, .modal')) return;
      isMouseDown = true;
      this.startJoystick(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      this.moveJoystick(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      this.endJoystick();
    });
  }

  handleTouchStart(e) {
    if (this.active) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // Check if touch is on interactive UI element
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target && target.closest('.ui-interactive, button, .modal')) {
        continue;
      }

      this.touchId = touch.identifier;
      this.startJoystick(touch.clientX, touch.clientY);
      e.preventDefault();
      break;
    }
  }

  handleTouchMove(e) {
    if (!this.active) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.touchId) {
        this.moveJoystick(touch.clientX, touch.clientY);
        e.preventDefault();
        break;
      }
    }
  }

  handleTouchEnd(e) {
    if (!this.active) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.touchId) {
        this.touchId = null;
        this.endJoystick();
        e.preventDefault();
        break;
      }
    }
  }

  startJoystick(clientX, clientY) {
    this.active = true;
    this.origin = { x: clientX, y: clientY };
    this.current = { x: clientX, y: clientY };
    this.vector = { x: 0, y: 0 };

    this.base.style.left = `${clientX - this.maxRadius}px`;
    this.base.style.top = `${clientY - this.maxRadius}px`;
    this.base.style.display = 'block';

    this.knob.style.transform = `translate(0px, 0px)`;
  }

  moveJoystick(clientX, clientY) {
    const dx = clientX - this.origin.x;
    const dy = clientY - this.origin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const clampedDist = Math.min(distance, this.maxRadius);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    this.knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

    // Normalized vector (-1 to 1)
    this.vector.x = knobX / this.maxRadius;
    this.vector.y = knobY / this.maxRadius;

    if (this.onMove) {
      this.onMove(this.vector.x, this.vector.y);
    }
  }

  endJoystick() {
    this.active = false;
    this.vector = { x: 0, y: 0 };
    this.base.style.display = 'none';

    if (this.onEnd) {
      this.onEnd();
    }
  }

  handleKeyDown(e) {
    if (window.game?.isTempleRun && [
      'KeyW', 'KeyS', 'KeyA', 'KeyD',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'
    ].includes(e.code)) {
      return;
    }

    if (this.keys.hasOwnProperty(e.code)) {
      this.keys[e.code] = true;
      if (e.code === 'Space' && this.onJump) {
        this.onJump();
      }
      if (e.code === 'KeyE' && this.onInteract) {
        this.onInteract();
      }
      if (e.code === 'KeyJ' && this.onJournal) {
        this.onJournal();
      }
      this.updateKeyboardVector();
    }
  }

  handleKeyUp(e) {
    if (this.keys.hasOwnProperty(e.code)) {
      this.keys[e.code] = false;
      if (window.game?.isTempleRun && [
        'KeyW', 'KeyS', 'KeyA', 'KeyD',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'
      ].includes(e.code)) {
        return;
      }
      this.updateKeyboardVector();
    }
  }

  updateKeyboardVector() {
    if (this.active) return; // Touch joystick takes priority if active

    let vx = 0;
    let vz = 0;

    if (this.keys.KeyA || this.keys.ArrowLeft) vx -= 1;
    if (this.keys.KeyD || this.keys.ArrowRight) vx += 1;
    if (this.keys.KeyW || this.keys.ArrowUp) vz -= 1;
    if (this.keys.KeyS || this.keys.ArrowDown) vz += 1;

    const len = Math.sqrt(vx * vx + vz * vz);
    if (len > 0) {
      vx /= len;
      vz /= len;
      this.vector.x = vx;
      this.vector.y = vz;
      if (this.onMove) this.onMove(vx, vz);
    } else {
      this.vector.x = 0;
      this.vector.y = 0;
      if (this.onEnd) this.onEnd();
    }

    if (this.onBoost) {
      this.onBoost(this.keys.Space || this.keys.ShiftLeft || this.keys.ShiftRight);
    }
  }

  getVector() {
    return this.vector;
  }
}
