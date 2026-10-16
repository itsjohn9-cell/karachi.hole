// Karachi Civic Junior Academy: Pictorial Educational Challenges
// English-Only, visual, kid-friendly dilemmas for street civic awareness

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
  // KIDS TIER (Ages 5-8) - Visual & Simple
  // ==========================================
  {
    id: 'kids_water_tap',
    category: 'water',
    ageTier: 'kids',
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
        picture: '💧 Waste Water',
        text: 'Leave it open and let clean water spill away',
        isCorrect: false
      }
    ],
    explanation: 'Awesome job! Turning off the tap saves 6 liters of clean water every time. Karachi needs every drop!',
    rewardXP: 500,
    rewardTime: 30
  },
  {
    id: 'kids_trash_bin',
    category: 'cleanliness',
    ageTier: 'kids',
    badgeId: 'clean_green',
    icon: '🗑️',
    pictureEmoji: '🧃 ➡️ 🗑️ ✅',
    topic: 'Keeping Streets Clean',
    scenario: 'You finished a snack pack and juice box at the park.',
    question: 'Where should the empty box go?',
    options: [
      {
        id: 'opt_a',
        icon: '🗑️',
        picture: '♻️ Green Bin',
        text: 'Toss it into the green trash dustbin!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🚯',
        picture: '🛣️ On the Road',
        text: 'Drop it onto the street road or sidewalk',
        isCorrect: false
      }
    ],
    explanation: 'Fantastic! Putting trash in the bin prevents clogged gutters and keeps Karachi healthy!',
    rewardXP: 500,
    rewardTime: 30
  },
  {
    id: 'kids_thirsty_kitten',
    category: 'animals',
    ageTier: 'kids',
    badgeId: 'animal_kindness',
    icon: '🐾',
    pictureEmoji: '🐱 ☀️ 🥣 💧',
    topic: 'Kindness to Street Animals',
    scenario: 'On a hot sunny afternoon, a tiny street kitten looks tired and thirsty.',
    question: 'How can you help this little friend?',
    options: [
      {
        id: 'opt_a',
        icon: '🥣',
        picture: '🥛 Fresh Water Bowl',
        text: 'Place a clean bowl of water in the shade!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🏃',
        picture: '👟 Chase Away',
        text: 'Scare it or chase it down the sidewalk',
        isCorrect: false
      }
    ],
    explanation: 'Wonderful kindness! Caring for animals is a great civic virtue that makes our city compassionate.',
    rewardXP: 500,
    rewardTime: 30
  },
  {
    id: 'kids_save_light',
    category: 'electricity',
    ageTier: 'kids',
    badgeId: 'power_saver',
    icon: '💡',
    pictureEmoji: '🚪 ➡️ 💡 🔴 OFF',
    topic: 'Switching Off Lights',
    scenario: 'You are going out to play in the street with your friends.',
    question: 'What should you do before leaving your room?',
    options: [
      {
        id: 'opt_a',
        icon: '💡',
        picture: '🔌 Turn Off Lights',
        text: 'Switch off the room lights, fan, and TV!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '⚡',
        picture: '💡 Leave On',
        text: 'Leave all lights and air conditioning running',
        isCorrect: false
      }
    ],
    explanation: 'Super! Turning off lights saves electricity, prevents power cuts, and protects city power grids!',
    rewardXP: 500,
    rewardTime: 30
  },

  // ==========================================
  // JUNIOR TIER (Ages 9-12) - Civic Action
  // ==========================================
  {
    id: 'junior_ambulance_siren',
    category: 'emergency',
    ageTier: 'junior',
    badgeId: 'lifesaver',
    icon: '🚑',
    pictureEmoji: '🚑 🚨 🔊 ➡️ 🚗 💨',
    topic: 'Emergency Ambulance Siren',
    scenario: 'Traffic is heavy on Shahrah-e-Faisal and an Edhi Ambulance is sounding sirens behind cars.',
    question: 'What is the duty of drivers on the street?',
    options: [
      {
        id: 'opt_a',
        icon: '🚑',
        picture: '🛣️ Clear Lane Left',
        text: 'Steer aside immediately to give a clear emergency lane!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🛑',
        picture: '🚗 Block Road',
        text: 'Race ahead of the ambulance and block the lane',
        isCorrect: false
      }
    ],
    explanation: 'Heroic choice! Every second counts in medical emergencies. Giving way saves precious lives!',
    rewardXP: 600,
    rewardTime: 35
  },
  {
    id: 'junior_open_gutter',
    category: 'safety',
    ageTier: 'junior',
    badgeId: 'clean_green',
    icon: '🕳️',
    pictureEmoji: '⚠️ 🕳️ 🚧 🚩 Safe Warning',
    topic: 'Open Road Gutter Hazard',
    scenario: 'You notice a heavy manhole cover is missing on a busy street near a school.',
    question: 'What is the best immediate safety action?',
    options: [
      {
        id: 'opt_a',
        icon: '🚩',
        picture: '⚠️ Warning Marker',
        text: 'Place a visible warning marker/branch and alert elders to report to KMC!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🙈',
        picture: '🏃 Ignore & Walk Away',
        text: 'Ignore it and hope nobody falls inside at night',
        isCorrect: false
      }
    ],
    explanation: 'Spot on! Marking hazardous manholes protects motorbikers and pedestrians from dangerous accidents.',
    rewardXP: 600,
    rewardTime: 35
  },
  {
    id: 'junior_plant_tree',
    category: 'environment',
    ageTier: 'junior',
    badgeId: 'green_planter',
    icon: '🌱',
    pictureEmoji: '🌳 ☀️ 🍃 Cool Greenery',
    topic: 'Beating Karachi Heatwaves',
    scenario: 'Summer temperatures in Karachi can become very high due to asphalt and concrete.',
    question: 'How can citizens naturally cool down neighborhoods?',
    options: [
      {
        id: 'opt_a',
        icon: '🌱',
        picture: '🌳 Plant Native Trees',
        text: 'Plant indigenous shade trees like Neem and Gulmohar!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🪓',
        picture: '🏗️ Chop Down Trees',
        text: 'Cut down trees to pave more concrete parking lots',
        isCorrect: false
      }
    ],
    explanation: 'Green Hero! Neem trees provide dense shade, absorb carbon dioxide, and bring pleasant breezes to Karachi.',
    rewardXP: 600,
    rewardTime: 35
  },
  {
    id: 'junior_zebra_crossing',
    category: 'traffic',
    ageTier: 'junior',
    badgeId: 'road_safety',
    icon: '🚸',
    pictureEmoji: '🚶 🦓 🚦 Safe Crosswalk',
    topic: 'Pedestrian Zebra Crossing',
    scenario: 'School children and elderly citizens need to cross a wide boulevard with busy traffic.',
    question: 'What should vehicles do at a marked zebra crossing?',
    options: [
      {
        id: 'opt_a',
        icon: '🛑',
        picture: '🛑 Stop & Wait',
        text: 'Stop completely before the white stripes and allow people to cross!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🏎️',
        picture: '📢 Honk & Speed',
        text: 'Honk loudly and speed through the crosswalk',
        isCorrect: false
      }
    ],
    explanation: 'Civic Excellence! Zebra crossings prioritize human pedestrians over motor vehicles for safety.',
    rewardXP: 600,
    rewardTime: 35
  },

  // ==========================================
  // TEENS & ADULTS TIER (Ages 13+) - Urban Ethics
  // ==========================================
  {
    id: 'senior_water_tanker_cartel',
    category: 'water',
    ageTier: 'senior',
    badgeId: 'water_guardian',
    icon: '💧',
    pictureEmoji: '🚰 🏘️ ⚖️ Municipal Water Rights',
    topic: 'Water Supply Justice',
    scenario: 'Illegal commercial tankers are siphoning water from municipal pipelines, leaving homes dry.',
    question: 'What is the sustainable civic solution to water scarcity?',
    options: [
      {
        id: 'opt_a',
        icon: '⚖️',
        picture: '🏛️ Metered Piping & Legal Enforcement',
        text: 'Equitable piped municipal supply, rain harvesting, and strict enforcement!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '💰',
        picture: '💸 Pay Bribes',
        text: 'Rely permanently on paying high black-market tanker extortion',
        isCorrect: false
      }
    ],
    explanation: 'True Urban Leader! Clean piped tap water is a fundamental civic right that belongs to every Karachi family.',
    rewardXP: 750,
    rewardTime: 40
  },
  {
    id: 'senior_encroachment_footpath',
    category: 'urban',
    ageTier: 'senior',
    badgeId: 'road_safety',
    icon: '📐',
    pictureEmoji: '🚶 🛍️ 🛣️ Accessible Public Spaces',
    topic: 'Public Footpath Accessibility',
    scenario: 'Shops and illegal wall encroachments block public sidewalks, pushing families into busy traffic.',
    question: 'Why are clear sidewalks vital for Karachi?',
    options: [
      {
        id: 'opt_a',
        icon: '🚸',
        picture: '🚶 Safe Barrier-Free Walking',
        text: 'They ensure safe, barrier-free walking for mothers, strollers, and the disabled!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🧱',
        picture: '🚧 Private Grab',
        text: 'Footpaths should be privatized and built over by shopkeepers',
        isCorrect: false
      }
    ],
    explanation: 'Spot on! Public footpaths belong to citizens. Keeping sidewalks clear prevents road accidents.',
    rewardXP: 750,
    rewardTime: 40
  }
];

export function getChallengesByAge(ageTier = 'kids') {
  const normalizedTier = (ageTier === 'ranger' || ageTier === 'junior') ? 'junior' : 
                         (ageTier === 'champion' || ageTier === 'senior') ? 'senior' : 'kids';
  return EDUCATIONAL_CHALLENGES.filter(c => c.ageTier === normalizedTier);
}

export function getChallengesByTier(ageTier = 'kids') {
  return getChallengesByAge(ageTier);
}

export function getRandomChallenge(ageTier = 'kids') {
  const pool = getChallengesByAge(ageTier);
  if (!pool || pool.length === 0) return EDUCATIONAL_CHALLENGES[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getChallengeByCategoryAndTier(category, ageTier = 'kids') {
  const pool = getChallengesByAge(ageTier);
  if (!category) return getRandomChallenge(ageTier);
  const matched = pool.filter(c => c.category === category);
  if (matched.length > 0) {
    return matched[Math.floor(Math.random() * matched.length)];
  }
  return getRandomChallenge(ageTier);
}
