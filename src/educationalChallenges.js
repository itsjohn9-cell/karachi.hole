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
  },

  // ==========================================
  // 5. SAFETY & CITIZEN PROTECTION (ALL TIERS)
  // ==========================================
  {
    id: 'kids_safety_snatcher',
    category: 'safety',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '🛡️',
    pictureEmoji: '🛡️ 🏃 👨‍👩‍👧',
    topic: 'Personal Safety & Trust',
    scenario: 'A stranger approaches and tries to snatch your phone or backpack in a busy market.',
    question: 'What is the most important rule for your safety?',
    options: [
      {
        id: 'opt_a',
        icon: '🛡️',
        picture: '👨‍👩‍👦 Stay Safe & Tell Adults',
        text: 'Never struggle with strangers; stay safe and immediately tell parents or police!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '💥',
        picture: '🥊 Fight with Strangers',
        text: 'Fight or run after dangerous people alone',
        isCorrect: false
      }
    ],
    feedback: 'Your life and safety always come first! Valuables can be replaced, but human life is priceless!'
  },
  {
    id: 'kids_police_15',
    category: 'safety',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '📞',
    pictureEmoji: '📞 🚓 1️⃣5️⃣',
    topic: 'Karachi Police Emergency Helpline',
    scenario: 'You or someone nearby needs urgent help from police on the street in Karachi.',
    question: 'Which emergency number should you call for immediate police rescue?',
    options: [
      {
        id: 'opt_a',
        icon: '🚓',
        picture: '📞 Dial 15',
        text: 'Dial 15 (Madadgar 15 Emergency Police Rescue)!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '📱',
        picture: '❌ Dial 000',
        text: 'Dial random numbers or call a friend',
        isCorrect: false
      }
    ],
    feedback: 'Spot on! Madadgar 15 is Karachi Police 24/7 emergency dispatch helpline for rapid assistance!'
  },
  {
    id: 'junior_safety_snatching',
    category: 'safety',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '📱',
    pictureEmoji: '📱 🕊️ 📞',
    topic: 'Street Robbery Response Protocol',
    scenario: 'What is the official safety protocol advised by CPLC (Citizens-Police Liaison Committee) if confronted by armed snatchers?',
    question: 'What is the recommended civic safety reaction?',
    options: [
      {
        id: 'opt_a',
        icon: '🕊️',
        picture: '⚖️ Protect Life & Report to 15 / CPLC',
        text: 'Comply calmly, avoid sudden moves, observe suspect features, and immediately report to 15 & CPLC 1102!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🥊',
        picture: '💥 Physical Altercation',
        text: 'Engage in a physical brawl over a mobile phone',
        isCorrect: false
      }
    ],
    feedback: 'Wise choice! De-escalation protects life; CPLC and Police use IMEI tracking to recover snatched devices!'
  },
  {
    id: 'senior_street_protection',
    category: 'safety',
    ageTier: 'senior',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '📹',
    pictureEmoji: '📹 💡 🏘️',
    topic: 'Community Crime Deterrence',
    scenario: 'How can Karachi neighborhood mohalla committees proactively prevent street crime and phone snatching?',
    question: 'What is the most effective community-driven initiative?',
    options: [
      {
        id: 'opt_a',
        icon: '💡',
        picture: '📹 Street Lighting & Community CCTV',
        text: 'Install synchronized street illumination, high-resolution perimeter CCTV, and gated neighborhood watch coordination!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🙈',
        picture: '🌑 Leave Streets Dark',
        text: 'Leave alleyways unlit and disconnect community surveillance cameras',
        isCorrect: false
      }
    ],
    feedback: 'Exemplary civic leadership! Brightly illuminated corridors and community CCTV deter street offenses by over 60%!'
  },

  // ==========================================
  // 6. ROAD POTHOLES & INFRASTRUCTURE
  // ==========================================
  {
    id: 'kids_pothole_warning',
    category: 'cleanliness',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'clean_green',
    icon: '🕳️',
    pictureEmoji: '🕳️ ⚠️ 🛣️',
    topic: 'Dangerous Road Craters & Potholes',
    scenario: 'You see a deep broken pothole in the road where motorbikes are bumping.',
    question: 'What should be done to keep commuters safe?',
    options: [
      {
        id: 'opt_a',
        icon: '⚠️',
        picture: '🚧 Mark Danger & Report to KMC',
        text: 'Place a visible warning marker and ask an elder to report it to KMC Helpline 1339!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🙈',
        picture: '🏃 Ignore Road Hazard',
        text: 'Throw rocks into the hole to make it deeper',
        isCorrect: false
      }
    ],
    feedback: 'Excellent! Reporting potholes helps Karachi Municipal Corporation dispatch rapid road asphalt repair teams!'
  },
  {
    id: 'junior_pothole_civic',
    category: 'cleanliness',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'clean_green',
    icon: '🛣️',
    pictureEmoji: '🛣️ 🏗️ 📱',
    topic: 'Civic Infrastructure Repair',
    scenario: 'Broken road surfaces on Tariq Road and Saddar slow down ambulances and damage citizen vehicles.',
    question: 'How can active citizens trigger municipal asphalt paving?',
    options: [
      {
        id: 'opt_a',
        icon: '📱',
        picture: '🏛️ File on Citizen Portal / KMC App',
        text: 'Log GPS geotagged photo on Karachi Citizen Portal and notify the district municipal commissioner!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🤷',
        picture: '⏳ Wait Years Passively',
        text: 'Wait indefinitely without notifying municipal engineers',
        isCorrect: false
      }
    ],
    feedback: 'Civic empowerment! Geotagged civic reporting creates public accountability and prompt repair workflows!'
  },

  // ==========================================
  // 7. WATER CRISIS & FRESHWATER ETHICS
  // ==========================================
  {
    id: 'kids_water_saving',
    category: 'water',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'water_guardian',
    icon: '💧',
    pictureEmoji: '💧 🔧 🚰',
    topic: 'Preventing Water Leaks',
    scenario: 'A water pipe in your courtyard is dripping clean sweet water continuously.',
    question: 'What is the responsible thing to do?',
    options: [
      {
        id: 'opt_a',
        icon: '🔧',
        picture: '🛠️ Fix Washer / Close Valve',
        text: 'Tell your family to call a plumber and fix the leaking washer immediately!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🌊',
        picture: '🚰 Let it Drip Forever',
        text: 'Let thousands of liters of clean water drain away',
        isCorrect: false
      }
    ],
    feedback: 'Water champion! A single dripping faucet can waste over 20 liters of freshwater daily!'
  },
  {
    id: 'senior_water_governance',
    category: 'water',
    ageTier: 'senior',
    type: 'quiz',
    badgeId: 'water_guardian',
    icon: '🌊',
    pictureEmoji: '🌊 🚰 ⚖️',
    topic: 'Karachi Water Rights & Fair Distribution',
    scenario: 'Why does Karachi experience localized water shortages despite receiving water from Keenjhar Lake?',
    question: 'What is the primary structural challenge facing KW&SC?',
    options: [
      {
        id: 'opt_a',
        icon: '⚖️',
        picture: '💧 Pipeline Distribution & Tanker Cartels',
        text: 'Illegal commercial hydrants siphoning bulk supply, coupled with outdated unmetered distribution pipelines!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🏞️',
        picture: '🌧️ No Rainfall',
        text: 'Karachi has zero municipal water pipelines connected to rivers',
        isCorrect: false
      }
    ],
    feedback: 'Profound urban insight! Modernizing metering and eliminating illegal siphon hydrants ensures equal tap water for all!'
  },

  // ==========================================
  // 8. ELECTRICITY & MONSOON HAZARDS
  // ==========================================
  {
    id: 'kids_electric_pole',
    category: 'electricity',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'power_saver',
    icon: '⚡',
    pictureEmoji: '⚡ 🌧️ 🚫',
    topic: 'Monsoon Rainy Day Electrical Safety',
    scenario: 'It is raining heavily in Karachi and the street has rainwater puddles near an electric pole.',
    question: 'What is the most crucial life-saving rule?',
    options: [
      {
        id: 'opt_a',
        icon: '🚫',
        picture: '⚠️ Stay Far Away from Poles & Wires',
        text: 'Never touch metal poles, transformers, or fallen wires during rain! Stay far away!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🖐️',
        picture: '⚡ Touch Wet Wire',
        text: 'Hold onto metal streetlight poles while wading through water',
        isCorrect: false
      }
    ],
    feedback: 'Critical life saver! Wet ground conducts electricity; always maintain a wide clearance from poles and call 118!'
  },

  // ==========================================
  // 9. TRAFFIC & MOTORCYCLE SAFETY
  // ==========================================
  {
    id: 'kids_traffic_zebra',
    category: 'ambulance',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '🦓',
    pictureEmoji: '🦓 🚸 🚦',
    topic: 'Crossing Roads on Zebra Stripes',
    scenario: 'You need to cross the bustling avenue outside Empress Market.',
    question: 'Where is the safest place for pedestrians to cross?',
    options: [
      {
        id: 'opt_a',
        icon: '🚸',
        picture: '🦓 On the Zebra Crossing',
        text: 'At the marked zebra crossing or overhead pedestrian bridge when traffic stops!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🏃',
        picture: '🏎️ Run in Fast Lanes',
        text: 'Dash between speeding cars in the middle of the highway',
        isCorrect: false
      }
    ],
    feedback: 'Terrific road awareness! Using zebra crossings and pedestrian overhead bridges prevents accidents!'
  },
  {
    id: 'junior_helmet_safety',
    category: 'ambulance',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '🪖',
    pictureEmoji: '🪖 🏍️ 🛡️',
    topic: 'Motorcycle Helmet Protection',
    scenario: 'Why does Karachi Traffic Police enforce mandatory safety helmets for all motorcycle riders and passengers?',
    question: 'What is the medical reason for wearing a certified helmet?',
    options: [
      {
        id: 'opt_a',
        icon: '🛡️',
        picture: '🧠 Protects Brain & Reduces Head Injury',
        text: 'Helmets absorb impact shock and reduce risk of fatal head trauma by more than 70%!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '💨',
        picture: '🕶️ It Just Looks Cool',
        text: 'Helmets are only worn to block wind in eyes',
        isCorrect: false
      }
    ],
    feedback: 'Indispensable safety fact! Always fasten the helmet chinstrap securely on every 70cc ride!'
  }
];

export function getChallengesByAge(ageTier = 'kids') {
  return EDUCATIONAL_CHALLENGES.filter(c => c.ageTier === ageTier);
}

// Global persistent set of seen challenge IDs to prevent repeat questions
const seenChallengeIds = new Set();

export function getChallengeByCategoryAndTier(category, ageTier = 'kids') {
  // 1. Filter candidates matching category and age tier
  let candidates = EDUCATIONAL_CHALLENGES.filter(c => {
    const catMatch = category ? (c.category === category) : true;
    const tierMatch = ageTier ? (c.ageTier === ageTier) : true;
    return catMatch && tierMatch;
  });

  // If no exact match for this age tier, fall back to any tier for this category
  if (candidates.length === 0 && category) {
    candidates = EDUCATIONAL_CHALLENGES.filter(c => c.category === category);
  }

  // If still empty, fall back to matching age tier, or all challenges
  if (candidates.length === 0) {
    candidates = EDUCATIONAL_CHALLENGES.filter(c => c.ageTier === ageTier);
    if (candidates.length === 0) {
      candidates = EDUCATIONAL_CHALLENGES;
    }
  }

  // 2. Prioritize unseen questions from the candidate pool
  const unseen = candidates.filter(c => !seenChallengeIds.has(c.id));
  const pool = (unseen.length > 0) ? unseen : candidates;

  // If all candidates in this category were seen, reset their seen status so deck reshuffles
  if (unseen.length === 0) {
    candidates.forEach(c => seenChallengeIds.delete(c.id));
  }

  const selected = pool[Math.floor(Math.random() * pool.length)];
  seenChallengeIds.add(selected.id);
  return selected;
}

export function getRandomChallenge(ageTier = 'kids') {
  return getChallengeByCategoryAndTier(null, ageTier);
}
