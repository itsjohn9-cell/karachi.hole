/**
 * Centralized System Actions Catalog for Karachi Runner Gameplay
 * Operational optimizations spanning gameplay collision, hazard visibility,
 * mobile performance, and diaspora player retention.
 */
export const SYSTEM_ACTIONS_CATALOG = {
  enable_high_contrast_pothole_rims: {
    id: 'enable_high_contrast_pothole_rims',
    title: 'High-Contrast Hazard Rims & Monsoon Pothole Cues',
    category: 'ui_ux',
    description: 'Renders glowing high-visibility cyan/orange hazard borders and early road puddle reflections for rain-softened potholes and open gutters.',
    telemetryEffect: 'Night and monsoon pothole collisions dropped from 34% to 11% (-23%); average player survival distance jumped +420m.',
    baselineMetric: '34% Crash Rate to Open Gutters & Potholes',
    targetMetric: '< 15% Crash Rate to Road Potholes',
    defaultActive: false
  },
  enable_haptic_corner_turn_cue: {
    id: 'enable_haptic_corner_turn_cue',
    title: 'Haptic Pre-Turn Warning & 15m Street Direction Signage',
    category: 'feature_discovery',
    description: 'Emits a tactile vibration pulse and displays glowing overhead directional arrows 15m before 90-degree corner junctions and fork cross-roads.',
    telemetryEffect: 'Corner turn collision and missed-turn wall crashes dropped from 18% to 3.2% (-14.8%).',
    baselineMetric: '18% Wall Collisions at 90° Corner Turns',
    targetMetric: '< 5% Corner Turn Wall Crashes',
    defaultActive: false
  },
  enable_dynamic_render_scale_governor: {
    id: 'enable_dynamic_render_scale_governor',
    title: 'Dynamic Render-Scale Governor for Low-End Mobile Chips',
    category: 'performance',
    description: 'Automatically throttles Three.js canvas render-scale by 15% (down to 0.8x) during intense traffic and particle bursts when frame rate drops under 35 FPS.',
    telemetryEffect: 'Low-FPS episodes on Android/iOS dropped by 78.4%; gameplay frame rate stabilized at a smooth 58.6 FPS.',
    baselineMetric: '24.2% Sessions with Stutter/Low-FPS (< 30 FPS)',
    targetMetric: '< 5% Stutter Sessions (Maintains 60 FPS)',
    defaultActive: false
  },
  enable_swept_collision_buffer: {
    id: 'enable_swept_collision_buffer',
    title: 'Continuous Swept Collision Buffer at Max Boost Speeds',
    category: 'data_hygiene',
    description: 'Expands sub-step raycasting during 2.4x CNG Turbo and Slingshot draft boosts to eliminate high-velocity collision tunneling through rickshaws and street barriers.',
    telemetryEffect: 'High-speed collision tunneling dropped to 0%; false crash disputes reduced by 94%.',
    baselineMetric: '4.8% Tunneling Glitch Rate at Boost Speed',
    targetMetric: '0% High-Velocity Collision Tunneling',
    defaultActive: false
  },
  enable_diaspora_difficulty_tuning: {
    id: 'enable_diaspora_difficulty_tuning',
    title: 'Overseas Diaspora Adaptive Onboarding & Difficulty Pace',
    category: 'audience',
    description: 'Provides gentler starting traffic pace and extended warmup golden coin paths for overseas players (UAE, Saudi Arabia, UK, US, Canada) discovering Karachi streets.',
    telemetryEffect: 'First-run completion rate for overseas diaspora players surged from 38% to 74% (+95% retention).',
    baselineMetric: '38% First-Run Completion for Global Diaspora',
    targetMetric: '> 70% First-Run Completion Across All Regions',
    defaultActive: false
  },
  enable_rescue_token_mercy_drop: {
    id: 'enable_rescue_token_mercy_drop',
    title: 'Wave 18 Guaranteed Rescue Token Mercy Spawner',
    category: 'ui_ux',
    description: 'Guarantees a floating golden Rescue Token on the 18th wave in Hard and Master difficulty runs to give skilled players a fair revive chance before the 20km loop finish.',
    telemetryEffect: 'End-game rage quits dropped by 64%; loop completion rate in Saddar and Lyari doubled.',
    baselineMetric: '62% Hard-Mode Loss Abandonment before Lyari',
    targetMetric: '< 25% Loop Abandonment',
    defaultActive: false
  }
};
