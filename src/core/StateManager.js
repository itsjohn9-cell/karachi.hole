/**
 * Karachi Hole / Pakistan Run - Finite State Machine & Event Bus
 * Decouples canvas rendering, physics, UI overlays, and game lifecycle.
 */

export const GameStates = Object.freeze({
  BOOT: 'BOOT',
  MAIN_MENU: 'MAIN_MENU',
  CITY_SELECT: 'CITY_SELECT',
  PLAYING: 'PLAYING',
  QUIZ_PAUSE: 'QUIZ_PAUSE',
  CELEBRATION: 'CELEBRATION',
  GAME_OVER: 'GAME_OVER'
});

export class StateManager {
  constructor(initialState = GameStates.BOOT) {
    this.currentState = initialState;
    this.previousState = null;
    this.eventListeners = new Map();
    this.enterHooks = new Map();
    this.exitHooks = new Map();

    // Define valid state transition matrix
    this.validTransitions = {
      [GameStates.BOOT]: [GameStates.MAIN_MENU, GameStates.CITY_SELECT],
      [GameStates.MAIN_MENU]: [GameStates.CITY_SELECT, GameStates.PLAYING],
      [GameStates.CITY_SELECT]: [GameStates.MAIN_MENU, GameStates.PLAYING],
      [GameStates.PLAYING]: [GameStates.QUIZ_PAUSE, GameStates.CELEBRATION, GameStates.GAME_OVER, GameStates.CITY_SELECT, GameStates.MAIN_MENU],
      [GameStates.QUIZ_PAUSE]: [GameStates.PLAYING, GameStates.GAME_OVER, GameStates.MAIN_MENU],
      [GameStates.CELEBRATION]: [GameStates.PLAYING, GameStates.CITY_SELECT, GameStates.MAIN_MENU, GameStates.GAME_OVER],
      [GameStates.GAME_OVER]: [GameStates.MAIN_MENU, GameStates.CITY_SELECT, GameStates.PLAYING]
    };
  }

  // -------------------------------------------------------------------------
  // Event Bus (Pub-Sub)
  // -------------------------------------------------------------------------
  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(handler);
    }
  }

  once(event, handler) {
    const wrapped = (payload) => {
      this.off(event, wrapped);
      handler(payload);
    };
    return this.on(event, wrapped);
  }

  emit(event, payload = {}) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(handler => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[StateManager] Error in event listener for '${event}':`, err);
        }
      });
    }
  }

  // -------------------------------------------------------------------------
  // State Machine Lifecycle Hooks
  // -------------------------------------------------------------------------
  onEnter(state, hook) {
    if (!this.enterHooks.has(state)) {
      this.enterHooks.set(state, new Set());
    }
    this.enterHooks.get(state).add(hook);
  }

  onExit(state, hook) {
    if (!this.exitHooks.has(state)) {
      this.exitHooks.set(state, new Set());
    }
    this.exitHooks.get(state).add(hook);
  }

  canTransition(toState) {
    const allowed = this.validTransitions[this.currentState];
    return Array.isArray(allowed) && allowed.includes(toState);
  }

  transitionTo(newState, payload = {}) {
    if (!GameStates[newState]) {
      console.warn(`[StateManager] Invalid state target: '${newState}'`);
      return false;
    }

    if (this.currentState === newState) {
      return true; // Already in target state
    }

    if (!this.canTransition(newState)) {
      console.warn(`[StateManager] Illegal transition from '${this.currentState}' to '${newState}'`);
      return false;
    }

    const fromState = this.currentState;

    // 1. Run exit hooks for current state
    if (this.exitHooks.has(fromState)) {
      this.exitHooks.get(fromState).forEach(hook => {
        try {
          hook(newState, payload);
        } catch (e) {
          console.error(`[StateManager] Error in exit hook for '${fromState}':`, e);
        }
      });
    }

    // 2. Perform state transition
    this.previousState = fromState;
    this.currentState = newState;

    // 3. Run enter hooks for new state
    if (this.enterHooks.has(newState)) {
      this.enterHooks.get(newState).forEach(hook => {
        try {
          hook(fromState, payload);
        } catch (e) {
          console.error(`[StateManager] Error in enter hook for '${newState}':`, e);
        }
      });
    }

    // 4. Emit global state change event for decoupled UI listeners
    this.emit('stateChanged', {
      from: fromState,
      to: newState,
      payload
    });

    return true;
  }

  getState() {
    return this.currentState;
  }

  getPreviousState() {
    return this.previousState;
  }

  is(state) {
    return this.currentState === state;
  }

  isPlaying() {
    return this.currentState === GameStates.PLAYING;
  }

  isPaused() {
    return this.currentState === GameStates.QUIZ_PAUSE;
  }
}

// Global Singleton Export for cross-module coordination
export const stateManager = new StateManager();
