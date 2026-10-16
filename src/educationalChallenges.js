// Karachi Civic Junior Academy: Pictorial & Interactive Puzzle Civic Challenges
// Multi-age calibrated dilemmas and interactive puzzles for Karachi street patrol

export const AGE_TIERS = {
  kids: {
    id: 'kids',
    name: 'Young Explorers',
    ageRange: 'Ages 5–8',
    icon: '👶',
    description: 'Simple visual choices with picture cues and friendly guidance'
  },
  junior: {
    id: 'junior',
    name: 'Karachi Junior Rangers',
    ageRange: 'Ages 9–12',
    icon: '🧒',
    description: 'Civic responsibility, emergency awareness, and neighborhood care'
  },
  senior: {
    id: 'senior',
    name: 'Teens & Adult Champions',
    ageRange: 'Ages 13+',
    icon: '🧑',
    description: 'Urban leadership, environmental action, and city infrastructure ethics'
  }
};

export const CIVIC_BADGES = [
  {
    id: 'water_guardian',
    name: 'Water Guardian',
    icon: '🚰',
    color: '#00e5ff',
    desc: 'Learned to stop water wastage and protect precious drinking water'
  },
  {
    id: 'lifesaver',
    name: 'Ambulance Hero',
    icon: '🚑',
    color: '#ff1744',
    desc: 'Understands giving right-of-way to emergency rescue ambulances'
  },
  {
    id: 'clean_green',
    name: 'Clean City Star',
    icon: '🧹',
    color: '#00e676',
    desc: 'Throws trash in bins and keeps Karachi street drains clear'
  },
  {
    id: 'power_saver',
    name: 'Energy Champion',
    icon: '⚡',
    color: '#ffd700',
    desc: 'Turns off unneeded appliances to stop power overloads'
  },
  {
    id: 'animal_kindness',
    name: 'Kind Companion',
    icon: '🐾',
    color: '#ff80ab',
    desc: 'Provides water bowls and gentle care for street pets'
  },
  {
    id: 'road_safety',
    name: 'Traffic Champion',
    icon: '🚦',
    color: '#76ff03',
    desc: 'Respects zebra crossings and helps pedestrians cross safely'
  },
  {
    id: 'green_planter',
    name: 'Urban Forester',
    icon: '🌱',
    color: '#66bb6a',
    desc: 'Plants trees and cares for public green parks'
  }
];

export const EDUCATIONAL_CHALLENGES = [
  // ==========================================
  // 1. INTERACTIVE MINI-PUZZLES (CALIBRATED BY AGE)
  // ==========================================
  {
    id: 'puzzle_kids_waste_sorter',
    category: 'cleanliness',
    ageTier: 'kids',
    type: 'puzzle_waste_sorter',
    badgeId: 'clean_green',
    icon: '🧹',
    topic: 'Interactive Clean City Puzzle',
    scenario: 'Sort street waste into the right bins to keep Karachi clean!',
    question: 'Tap each item to sort into the Blue Recycle Bin or Green Compost Bin!',
    items: [
      { id: 'item_1', name: 'Plastic Bottle', icon: '🥤', target: 'recycle' },
      { id: 'item_2', name: 'Banana Peel', icon: '🍌', target: 'compost' },
      { id: 'item_3', name: 'Soda Can', icon: '🥫', target: 'recycle' },
      { id: 'item_4', name: 'Apple Core', icon: '🍎', target: 'compost' }
    ]
  },
  {
    id: 'puzzle_junior_pipe_connect',
    category: 'water',
    ageTier: 'junior',
    type: 'puzzle_pipe_flow',
    badgeId: 'water_guardian',
    icon: '🚰',
    topic: 'PECHS Pipeline Alignment Puzzle',
    scenario: 'The water pipeline from the main pump to neighborhood homes is misaligned!',
    question: 'Tap the misaligned pipe segments to rotate and connect fresh water to homes!',
    segments: [
      { id: 'seg_1', icon: '═', initialRotation: 90, targetRotation: 0 },
      { id: 'seg_2', icon: '═', initialRotation: 0, targetRotation: 0 },
      { id: 'seg_3', icon: '═', initialRotation: 90, targetRotation: 0 }
    ]
  },
  {
    id: 'puzzle_senior_ambulance_dispatch',
    category: 'ambulance',
    ageTier: 'senior',
    type: 'puzzle_emergency_dispatch',
    badgeId: 'lifesaver',
    icon: '🚑',
    topic: 'Emergency Route Dispatch Puzzle',
    scenario: 'An Edhi Ambulance with critical patient is blocked at Empress Market intersection!',
    question: 'Tap the vehicles in the correct civic priority sequence to clear the corridor!',
    steps: [
      { id: 'veh_rickshaw', label: '1. Move Auto-Rickshaw to left curb', icon: '🛺', correctStep: 1 },
      { id: 'veh_prado', label: '2. Clear VIP Prado from center lane', icon: '🚙', correctStep: 2 },
      { id: 'veh_bus', label: '3. Advance Mini-Bus into bus stop bay', icon: '🚌', correctStep: 3 }
    ]
  },

  // ==========================================
  // 2. KIDS TIER (Ages 5-8) - Pictorial Questions
  // ==========================================
  {
    id: 'kids_water_tap',
    category: 'water',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'water_guardian',
    icon: '🚰',
    pictureEmoji: '🚰 ➡️ 💧 🚫',
    topic: 'Saving Drinking Water',
    scenario: 'You are brushing your teeth and notice the water tap is running freely!',
    question: 'Which picture shows the right thing to do?',
    options: [
      {
        id: 'opt_a',
        icon: '🚰',
        picture: '🔒 Close Tap',
        text: 'Turn the tap off tightly while brushing!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🌊',
        picture: '🚿 Let it Run',
        text: 'Leave it open and waste drinking water',
        isCorrect: false
      }
    ],
    feedback: 'Wonderful! Turning off the tap saves up to 8 liters of clean drinking water every day for Karachi homes!'
  },
  {
    id: 'kids_trash_peel',
    category: 'cleanliness',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'clean_green',
    icon: '🗑️',
    pictureEmoji: '🍌 ➡️ 🗑️ ✅',
    topic: 'Clean Streets & Green Parks',
    scenario: 'You finish eating a sweet mango at Burns Road park. What do you do with the peel?',
    question: 'Where does the fruit peel belong?',
    options: [
      {
        id: 'opt_a',
        icon: '🗑️',
        picture: '🚮 In the Trash Bin',
        text: 'Put it inside the green municipal bin!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🛣️',
        picture: '🍂 Drop on Street',
        text: 'Drop it on the road for someone to slip',
        isCorrect: false
      }
    ],
    feedback: 'Brilliant! Keeping trash in bins prevents choked storm drains during monsoon rains!'
  },
  {
    id: 'kids_ambulance_siren',
    category: 'ambulance',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'lifesaver',
    icon: '🚑',
    pictureEmoji: '🚑 🚨 🔊',
    topic: 'Emergency Ambulance Sirens',
    scenario: 'You hear a loud WEE-WOO siren behind your car! An Edhi Ambulance is flashing red lights!',
    question: 'What should our car driver do?',
    options: [
      {
        id: 'opt_a',
        icon: '🚑',
        picture: '➡️ Move to Left Curb',
        text: 'Pull to the side and give way!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🛑',
        picture: '🚫 Block the Road',
        text: 'Block the road and race the ambulance',
        isCorrect: false
      }
    ],
    feedback: 'Heroic! Giving way lets doctors save lives inside the ambulance!'
  },

  // ==========================================
  // 3. JUNIOR TIER (Ages 9-12) - Civic Decisions
  // ==========================================
  {
    id: 'junior_tanker_mafia',
    category: 'water',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'water_guardian',
    icon: '🚰',
    pictureEmoji: '🚰 🛡️ 📞',
    topic: 'Illegal Water Tankers & Lines',
    scenario: 'You spot someone puncturing a municipal water main to siphon water into private commercial tankers!',
    question: 'What is the most responsible action to take?',
    options: [
      {
        id: 'opt_a',
        icon: '📱',
        picture: '📞 Report to Karachi Water Board',
        text: 'Report illegal water theft to KW&SC complaint helpline!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🙈',
        picture: '🤐 Walk Away Silently',
        text: 'Ignore it and pay expensive private tanker prices',
        isCorrect: false
      }
    ],
    feedback: 'Superb! Reporting water theft stops the tanker mafia and protects community tap lines!'
  },
  {
    id: 'junior_ambulance_traffic',
    category: 'ambulance',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'lifesaver',
    icon: '🚑',
    pictureEmoji: '🚑 🚦 🛣️',
    topic: 'Right of Way for Emergency Vehicles',
    scenario: 'At a red traffic light on Shahrah-e-Faisal, an ambulance is stuck behind cars with its siren blaring.',
    question: 'How should drivers react at the intersection?',
    options: [
      {
        id: 'opt_a',
        icon: '🚗',
        picture: '↔️ Form an Emergency Corridor',
        text: 'Safely inch forward and part to the sides to create a center corridor!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🛑',
        picture: '⛔ Stay Frozen',
        text: 'Refuse to budge until the signal turns green',
        isCorrect: false
      }
    ],
    feedback: 'Life-saving! Traffic laws internationally permit cautiously creating an emergency lane for ambulances!'
  },
  {
    id: 'junior_power_kunda',
    category: 'electricity',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'power_saver',
    icon: '⚡',
    pictureEmoji: '⚡ ⚠️ 🔥',
    topic: 'Illegal Kundas & Electrical Safety',
    scenario: 'You see metallic hooks (kundas) sparking over power lines near your neighborhood during rain.',
    question: 'What is the safe procedure?',
    options: [
      {
        id: 'opt_a',
        icon: '⚠️',
        picture: '🚧 Keep Away & Call 118',
        text: 'Stay far away and immediately report the hazard to 118!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🖐️',
        picture: '⚡ Touch Wires',
        text: 'Try to pull the wet sparking wire yourself',
        isCorrect: false
      }
    ],
    feedback: 'Exact safety rule! Electrocution risk during monsoon is extreme; always keep distance and inform professionals!'
  },

  // ==========================================
  // 4. SENIOR / ADULTS TIER (Ages 13+) - Policy & Ethics
  // ==========================================
  {
    id: 'senior_vip_culture',
    category: 'ambulance',
    ageTier: 'senior',
    type: 'quiz',
    badgeId: 'lifesaver',
    icon: '🚔',
    pictureEmoji: '🚔 🚫 🚑 ⚖️',
    topic: 'VIP Protocol vs Public Safety',
    scenario: 'A VIP motorcade escort blocks public traffic, leaving multiple ambulances stuck in gridlock.',
    question: 'According to fundamental human rights and traffic law, what takes precedence?',
    options: [
      {
        id: 'opt_a',
        icon: '🚑',
        picture: '⚖️ Emergency Medical Vehicles',
        text: 'Ambulances and emergency response vehicles always have absolute priority over protocol!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🚙',
        picture: '🚨 VIP Escort Convoys',
        text: 'Politicians and VIP convoys should block emergency vehicles',
        isCorrect: false
      }
    ],
    feedback: 'Constitutional excellence! The right to life guarantees that emergency ambulances supersede all VIP protocols!'
  },
  {
    id: 'senior_rain_drainage',
    category: 'cleanliness',
    ageTier: 'senior',
    type: 'quiz',
    badgeId: 'clean_green',
    icon: '🌊',
    pictureEmoji: '🌊 🏗️ 🌿',
    topic: 'Urban Drainage & Monsoon Flooding',
    scenario: 'Why does Karachi face severe urban flooding during monsoon downpours?',
    question: 'What is the primary root cause and sustainable solution?',
    options: [
      {
        id: 'opt_a',
        icon: '🌿',
        picture: '🏗️ Clear Encroached Storm Nullahs',
        text: 'Clear plastic waste and encroachments from natural nullahs and install permeable surfaces!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🧱',
        picture: '🏗️ Build Concrete Walls',
        text: 'Pave all city soil in concrete and dump trash in open drains',
        isCorrect: false
      }
    ],
    feedback: 'True urban leadership! Preserving natural drainage channels is vital for Karachi climate resilience!'
  }
];

export function getChallengesByAge(ageTier = 'kids') {
  return EDUCATIONAL_CHALLENGES.filter(c => c.ageTier === ageTier);
}

export function getChallengeByCategoryAndTier(category, ageTier = 'kids') {
  const matches = EDUCATIONAL_CHALLENGES.filter(c => c.ageTier === ageTier && (category ? c.category === category : true));
  if (matches.length > 0) {
    return matches[Math.floor(Math.random() * matches.length)];
  }
  return EDUCATIONAL_CHALLENGES[0];
}

export function getRandomChallenge(ageTier = 'kids') {
  const matches = getChallengesByAge(ageTier);
  return matches[Math.floor(Math.random() * matches.length)];
}
