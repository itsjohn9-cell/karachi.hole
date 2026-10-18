// Karachi Civic Academy: Multi-Age Calibrated Civic Dilemmas & Non-Repeating Challenge Engine
// Culturally grounded in Karachi & Pakistani civic life, emergency rescue, safety, and infrastructure

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
    icon: '🎒',
    description: 'Civic responsibility, emergency awareness, and neighborhood care'
  },
  senior: {
    id: 'senior',
    name: 'Teens & Adult Champions',
    ageRange: 'Ages 13+',
    icon: '🏆',
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
  // 1. INTERACTIVE MINI-PUZZLES
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
    rewardXP: 600,
    rewardTime: 25,
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
    rewardXP: 700,
    rewardTime: 30,
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
    rewardXP: 800,
    rewardTime: 35,
    steps: [
      { id: 'veh_rickshaw', label: '1. Move Auto-Rickshaw to left curb', icon: '🛺', correctStep: 1 },
      { id: 'veh_prado', label: '2. Clear VIP Prado from center lane', icon: '🚙', correctStep: 2 },
      { id: 'veh_bus', label: '3. Advance Mini-Bus into bus stop bay', icon: '🚌', correctStep: 3 }
    ]
  },

  // ==========================================
  // 2. KIDS TIER (Ages 5-8) - Pictorial & Practical
  // ==========================================
  // Cleanliness
  {
    id: 'kids_clean_trash_peel',
    category: 'cleanliness',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'clean_green',
    icon: '🗑️',
    pictureEmoji: '🍌 ➡️ 🗑️ ✅',
    topic: 'Clean Streets & Green Parks',
    scenario: 'You finish eating a sweet mango at Burns Road park. What do you do with the peel?',
    question: 'Where does the fruit peel belong?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🗑️', picture: '🚮 In the Green Municipal Bin', text: 'Put it inside the green municipal bin!', isCorrect: true },
      { id: 'opt_b', icon: '🛣️', picture: '🍂 Drop on Street', text: 'Drop it on the road for someone to slip', isCorrect: false }
    ],
    feedback: 'Brilliant! Keeping trash in bins prevents choked storm drains during monsoon rains!'
  },
  {
    id: 'kids_clean_pothole_flag',
    category: 'cleanliness',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'clean_green',
    icon: '🕳️',
    pictureEmoji: '🕳️ ⚠️ 🛣️',
    topic: 'Open Manholes & Road Hazards',
    scenario: 'You see an open, broken gutter hole on the sidewalk where children are playing.',
    question: 'What is the kindest and safest action?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🚧', picture: '⚠️ Mark Hazard & Tell Elders', text: 'Place a visible warning marker and tell parents or elders immediately!', isCorrect: true },
      { id: 'opt_b', icon: '🙈', picture: '🏃 Jump Over & Ignore', text: 'Ignore it and let someone fall in', isCorrect: false }
    ],
    feedback: 'Heroic! Warning neighbors stops pedestrian accidents and alerts KMC road repair teams!'
  },
  {
    id: 'kids_clean_gutka_stop',
    category: 'cleanliness',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'clean_green',
    icon: '🌿',
    pictureEmoji: '🏛️ 🚫 🌸',
    topic: 'Protecting City Heritage Walls',
    scenario: 'A person is about to spit red paan juice on the clean white wall of a school or hospital.',
    question: 'What should we remind them gently?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🌸', picture: '🧼 Keep City Walls Clean', text: 'Our city walls are our pride; please keep Karachi clean!', isCorrect: true },
      { id: 'opt_b', icon: '🔴', picture: '🎨 Paint More Walls Red', text: 'Spit on walls everywhere', isCorrect: false }
    ],
    feedback: 'Spot on! Respecting public spaces keeps Karachi beautiful and hygienic for everyone!'
  },
  {
    id: 'kids_clean_park_flowers',
    category: 'cleanliness',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'green_planter',
    icon: '🌱',
    pictureEmoji: '🌸 🌱 🐝',
    topic: 'Caring for Public Gardens',
    scenario: 'You see beautiful blooming roses and jasmine at Frere Hall gardens.',
    question: 'How do good city heroes treat park flowers?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🌱', picture: '👁️ Admire & Let Bloom', text: 'Smell and admire them gently so everyone can enjoy them!', isCorrect: true },
      { id: 'opt_b', icon: '✂️', picture: '🥀 Pluck & Stomp', text: 'Pluck them all and throw them on the grass', isCorrect: false }
    ],
    feedback: 'Wonderful! Leaving flowers intact keeps Karachi parks vibrant and welcoming!'
  },

  // Water
  {
    id: 'kids_water_brush_tap',
    category: 'water',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'water_guardian',
    icon: '🚰',
    pictureEmoji: '🚰 ➡️ 💧 🚫',
    topic: 'Saving Drinking Water',
    scenario: 'You are brushing your teeth and notice the water tap is running freely!',
    question: 'Which picture shows the right thing to do?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🚰', picture: '🔒 Close Tap Tightly', text: 'Turn the tap off tightly while brushing!', isCorrect: true },
      { id: 'opt_b', icon: '🌊', picture: '🚿 Let it Run Continuously', text: 'Leave it open and waste drinking water', isCorrect: false }
    ],
    feedback: 'Wonderful! Turning off the tap saves up to 8 liters of clean drinking water every day for Karachi homes!'
  },
  {
    id: 'kids_water_leak_report',
    category: 'water',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'water_guardian',
    icon: '💧',
    pictureEmoji: '💧 🔧 🚰',
    topic: 'Preventing Water Leaks',
    scenario: 'A courtyard tap is dripping sweet drinking water droplet by droplet all night.',
    question: 'What is the responsible thing to do?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🔧', picture: '🛠️ Ask Elders to Fix Washer', text: 'Tell your parents to replace the rubber washer and stop the leak!', isCorrect: true },
      { id: 'opt_b', icon: '🌊', picture: '🚰 Let it Drip Forever', text: 'Let hundreds of liters drain into the mud', isCorrect: false }
    ],
    feedback: 'Water champion! Fixing a small leak saves over 20 liters of sweet water every single day!'
  },
  {
    id: 'kids_water_birds_pet',
    category: 'water',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'animal_kindness',
    icon: '🕊️',
    pictureEmoji: '🕊️ 🥣 💧',
    topic: 'Kindness: Water Bowls for Birds & Pets',
    scenario: 'On hot summer afternoons, pigeons and street cats in Karachi are panting from heat.',
    question: 'How can you be a neighborhood hero for thirsty animals?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🥣', picture: '💧 Place Clean Water Bowl', text: 'Place a small earthen water bowl (kunda) in shade on your terrace or curb!', isCorrect: true },
      { id: 'opt_b', icon: '🪨', picture: '🚫 Chase Them Away', text: 'Throw pebbles to scare them away', isCorrect: false }
    ],
    feedback: 'Compassionate hero! Providing cool water saves vulnerable animals during extreme Karachi heatwaves!'
  },

  // Ambulance
  {
    id: 'kids_ambulance_siren_corridor',
    category: 'ambulance',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'lifesaver',
    icon: '🚑',
    pictureEmoji: '🚑 🚨 🔊',
    topic: 'Emergency Ambulance Sirens',
    scenario: 'You hear a loud WEE-WOO siren behind your car! An Edhi Ambulance is flashing red lights!',
    question: 'What should our car driver do?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🚑', picture: '➡️ Move to Left Curb', text: 'Pull to the side safely and give immediate way!', isCorrect: true },
      { id: 'opt_b', icon: '🛑', picture: '🚫 Block the Lane', text: 'Block the road and race the ambulance', isCorrect: false }
    ],
    feedback: 'Heroic! Giving way lets doctors and paramedics reach hospitals in time to save lives!'
  },
  {
    id: 'kids_ambulance_edhi_115',
    category: 'ambulance',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'lifesaver',
    icon: '📞',
    pictureEmoji: '📞 🚑 1️⃣1️⃣5️⃣',
    topic: 'Emergency Ambulance Helplines',
    scenario: 'If someone is injured and needs a hospital rescue ambulance, which number does Karachi dial?',
    question: 'Which emergency number calls the Edhi Ambulance Foundation?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🚑', picture: '📞 Dial 115 or 1122', text: 'Dial 115 (Edhi) or 1122 (Rescue)!', isCorrect: true },
      { id: 'opt_b', icon: '🎮', picture: '❌ Dial Video Game', text: 'Dial random numbers or play games', isCorrect: false }
    ],
    feedback: 'Life-saving knowledge! Edhi 115 and Rescue 1122 are active 24/7 across Pakistan!'
  },

  // Safety
  {
    id: 'kids_safety_phone_stranger',
    category: 'safety',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '🛡️',
    pictureEmoji: '🛡️ 🏃 👨‍👩‍👧',
    topic: 'Personal Safety & Trust',
    scenario: 'A stranger approaches you on the street and tries to pull your backpack or mobile phone.',
    question: 'What is the most important rule for your personal safety?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🛡️', picture: '👨‍👩‍👦 Protect Life & Tell Adults', text: 'Never fight alone; protect your life, run to safety, and tell parents or police!', isCorrect: true },
      { id: 'opt_b', icon: '💥', picture: '🥊 Fight Danger Alone', text: 'Wrestle dangerous people over objects', isCorrect: false }
    ],
    feedback: 'Your life and safety always come first! Valuables can be replaced, but human life is priceless!'
  },
  {
    id: 'kids_safety_police_15_call',
    category: 'safety',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '📞',
    pictureEmoji: '📞 🚓 1️⃣5️⃣',
    topic: 'Karachi Police Emergency Rescue',
    scenario: 'Someone nearby needs urgent safety assistance from police on the street in Karachi.',
    question: 'Which emergency number should you call for immediate police dispatch?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🚓', picture: '📞 Dial 15', text: 'Dial 15 (Madadgar 15 Police Rescue)!', isCorrect: true },
      { id: 'opt_b', icon: '📱', picture: '❌ Dial 000', text: 'Dial random numbers or post on social media', isCorrect: false }
    ],
    feedback: 'Spot on! Madadgar 15 is Karachi Police 24/7 rapid dispatch helpline!'
  },
  {
    id: 'kids_safety_zebra_cross',
    category: 'safety',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '🦓',
    pictureEmoji: '🦓 🚸 🚦',
    topic: 'Pedestrian Zebra Crossings',
    scenario: 'You need to cross a busy road near your school on Clifton Beach avenue.',
    question: 'Where is the safest place for children to cross the road?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🦓', picture: '🚸 Zebra Crosswalk with Elder', text: 'At the white zebra crossing, holding an elder hand!', isCorrect: true },
      { id: 'opt_b', icon: '🏃', picture: '🏎️ Dart through Fast Traffic', text: 'Run out suddenly between speeding buses', isCorrect: false }
    ],
    feedback: 'Golden rule of road safety! Zebra crossings give pedestrians clear visibility to drivers!'
  },

  // Electricity
  {
    id: 'kids_elec_rain_wire',
    category: 'electricity',
    ageTier: 'kids',
    type: 'quiz',
    badgeId: 'power_saver',
    icon: '⚡',
    pictureEmoji: '⚡ 🌧️ 🚫',
    topic: 'Rainy Day Electrical Safety',
    scenario: 'During heavy rain in Karachi, water is standing on the street near an electric pole.',
    question: 'What is the most crucial life-saving rule?',
    rewardXP: 500,
    rewardTime: 25,
    options: [
      { id: 'opt_a', icon: '🚫', picture: '⚠️ Stay Far Away from Poles & Wires', text: 'Never touch metal streetlight poles, transformers, or fallen cables during rain!', isCorrect: true },
      { id: 'opt_b', icon: '🖐️', picture: '⚡ Touch Wet Wire', text: 'Hold onto metal streetlight poles while wading through water', isCorrect: false }
    ],
    feedback: 'Critical safety knowledge! Wet metal poles can conduct dangerous electric current during downpours!'
  },

  // ==========================================
  // 3. JUNIOR TIER (Ages 9-12) - Civic Dilemmas
  // ==========================================
  // Cleanliness
  {
    id: 'junior_clean_pothole_portal',
    category: 'cleanliness',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'clean_green',
    icon: '🛣️',
    pictureEmoji: '🛣️ 🏗️ 📱',
    topic: 'Civic Infrastructure Repair',
    scenario: 'Deep potholes on Tariq Road and Saddar slow down ambulances and damage citizen motorbikes.',
    question: 'How can active citizens trigger municipal asphalt paving?',
    rewardXP: 650,
    rewardTime: 30,
    options: [
      { id: 'opt_a', icon: '📱', picture: '🏛️ File on Citizen Portal / KMC App', text: 'Log GPS geotagged photo on Karachi Citizen Portal & KMC Helpline 1339!', isCorrect: true },
      { id: 'opt_b', icon: '🤷', picture: '⏳ Wait Years Passively', text: 'Wait indefinitely without notifying municipal engineers', isCorrect: false }
    ],
    feedback: 'Civic empowerment! Geotagged civic reporting creates public accountability and prompt repair workflows!'
  },
  {
    id: 'junior_clean_plastic_bags',
    category: 'cleanliness',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'clean_green',
    icon: '🛍️',
    pictureEmoji: '🛍️ 🌊 🚫',
    topic: 'Polythene Bags & Monsoon Drainage',
    scenario: 'Why are thin single-use plastic shopper bags banned near Karachi storm drains?',
    question: 'What harmful effect do plastic bags have on our city during monsoon?',
    rewardXP: 650,
    rewardTime: 30,
    options: [
      { id: 'opt_a', icon: '🌊', picture: '🚫 They Choke Nullahs & Cause Floods', text: 'They block storm drainage channels, causing dirty water to back up into homes!', isCorrect: true },
      { id: 'opt_b', icon: '🌿', picture: '🌱 They Turn into Trees', text: 'They dissolve instantly and fertilize road gardens', isCorrect: false }
    ],
    feedback: 'Accurate! Non-biodegradable plastics are the #1 cause of urban drainage failure during monsoon downpours!'
  },
  {
    id: 'junior_clean_trash_burning',
    category: 'cleanliness',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'clean_green',
    icon: '🔥',
    pictureEmoji: '🔥 💨 🫁 🚫',
    topic: 'Stopping Toxic Trash Burning',
    scenario: 'A neighborhood sweeper is setting fire to a dry plastic trash pile on the street corner.',
    question: 'Why is burning plastic waste dangerous, and what should be done?',
    rewardXP: 650,
    rewardTime: 30,
    options: [
      { id: 'opt_a', icon: '🫁', picture: '🚫 Toxic Smog: Call SSWMB', text: 'It releases carcinogenic dioxin smoke that harms children; request SSWMB compactor truck collection!', isCorrect: true },
      { id: 'opt_b', icon: '🔥', picture: '🪵 Add More Plastic to Fire', text: 'Encourage setting fire to all garbage on the street', isCorrect: false }
    ],
    feedback: 'Protecting lungs! Open garbage burning creates severe smog and respiratory illnesses in Karachi!'
  },

  // Water
  {
    id: 'junior_water_tanker_theft',
    category: 'water',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'water_guardian',
    icon: '🚰',
    pictureEmoji: '🚰 🛡️ 📞',
    topic: 'Illegal Water Tankers & Lines',
    scenario: 'You spot someone puncturing a municipal water main to siphon sweet water into commercial tankers!',
    question: 'What is the most responsible action to take?',
    rewardXP: 650,
    rewardTime: 30,
    options: [
      { id: 'opt_a', icon: '📱', picture: '📞 Report to Karachi Water Board', text: 'Report illegal water theft to KW&SC complaint helpline 1334!', isCorrect: true },
      { id: 'opt_b', icon: '🙈', picture: '🤐 Walk Away Silently', text: 'Ignore it and pay expensive private tanker prices', isCorrect: false }
    ],
    feedback: 'Superb! Reporting water theft stops the tanker mafia and protects community tap lines!'
  },
  {
    id: 'junior_water_dengue_tanks',
    category: 'water',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'water_guardian',
    icon: '🦟',
    pictureEmoji: '🦟 🚰 🔒',
    topic: 'Stopping Dengue & Clean Water Storage',
    scenario: 'Your neighborhood rooftop water tank has a broken lid, and standing water is exposed to the air.',
    question: 'Why must rooftop water tanks always remain sealed with tight covers?',
    rewardXP: 650,
    rewardTime: 30,
    options: [
      { id: 'opt_a', icon: '🔒', picture: '🛡️ Prevents Dengue Mosquito Breeding', text: 'Aedes mosquitoes lay eggs in clean open water; tight lids prevent dengue & malaria outbreaks!', isCorrect: true },
      { id: 'opt_b', icon: '🌤️', picture: '☀️ Sunlight Makes Water Sweet', text: 'Leaving tanks open lets birds swim and cleans the water', isCorrect: false }
    ],
    feedback: 'Crucial health awareness! Sealed water storage breaks the breeding cycle of dengue mosquitoes in Karachi!'
  },

  // Ambulance
  {
    id: 'junior_ambulance_red_signal',
    category: 'ambulance',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'lifesaver',
    icon: '🚑',
    pictureEmoji: '🚑 🚦 🛣️',
    topic: 'Right of Way for Emergency Vehicles',
    scenario: 'At a red traffic light on Shahrah-e-Faisal, an ambulance is stuck behind cars with siren blaring.',
    question: 'How should drivers safely react at the intersection?',
    rewardXP: 650,
    rewardTime: 30,
    options: [
      { id: 'opt_a', icon: '🚗', picture: '↔️ Part to Sides: Form Corridor', text: 'Safely inch forward and part to the sides to create an emergency center corridor!', isCorrect: true },
      { id: 'opt_b', icon: '🛑', picture: '⛔ Stay Frozen & Block', text: 'Refuse to budge until the signal turns green', isCorrect: false }
    ],
    feedback: 'Life-saving! Traffic laws internationally permit cautiously creating an emergency lane for ambulances!'
  },
  {
    id: 'junior_ambulance_hoax_ban',
    category: 'ambulance',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'lifesaver',
    icon: '☎️',
    pictureEmoji: '☎️ 🚑 ❌ ⚖️',
    topic: 'Civic Ethics: Emergency Phone Lines',
    scenario: 'Some school students prank-call emergency helplines like 1122 or 115 just for fun.',
    question: 'Why are fake calls to emergency dispatchers a serious crime?',
    rewardXP: 650,
    rewardTime: 30,
    options: [
      { id: 'opt_a', icon: '⚖️', picture: '🚨 Blocks Dispatch to Dying Patients', text: 'It ties up phone lines and dispatches ambulances away from real dying patients!', isCorrect: true },
      { id: 'opt_b', icon: '🎭', picture: '😂 Harmless Joke', text: 'It helps ambulance drivers practice driving faster', isCorrect: false }
    ],
    feedback: 'Moral maturity! An ambulance sent to a fake call is an ambulance stolen from someone fighting for life!'
  },

  // Safety
  {
    id: 'junior_safety_snatch_protocol',
    category: 'safety',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '📱',
    pictureEmoji: '📱 🕊️ 📞',
    topic: 'Street Robbery Response Protocol',
    scenario: 'What is the official safety protocol advised by CPLC (Citizens-Police Liaison Committee) if confronted by armed snatchers?',
    question: 'What is the recommended civic safety reaction?',
    rewardXP: 650,
    rewardTime: 30,
    options: [
      { id: 'opt_a', icon: '🕊️', picture: '⚖️ Protect Life & Report to 15 / CPLC', text: 'Comply calmly, avoid sudden moves, observe suspect features, and immediately report to 15 & CPLC 1102!', isCorrect: true },
      { id: 'opt_b', icon: '🥊', picture: '💥 Physical Altercation', text: 'Engage in a physical brawl over a mobile phone', isCorrect: false }
    ],
    feedback: 'Wise choice! De-escalation protects life; CPLC and Police use IMEI tracking to recover snatched devices!'
  },
  {
    id: 'junior_safety_one_wheeling_risk',
    category: 'safety',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '🏍️',
    pictureEmoji: '🏍️ ⚠️ 🏥',
    topic: 'Stopping Reckless One-Wheeling',
    scenario: 'Teenagers on 70cc motorbikes remove silencers and perform dangerous one-wheeling on Sea View road.',
    question: 'Why is one-wheeling on public streets strictly illegal under Pakistan traffic law?',
    rewardXP: 650,
    rewardTime: 30,
    options: [
      { id: 'opt_a', icon: '🏥', picture: '⚠️ Fatal Hazard to Rider & Commuters', text: 'It causes fatal loss of vehicle control, horrific head injuries, and endangers pedestrians!', isCorrect: true },
      { id: 'opt_b', icon: '💨', picture: '🏆 Great Street Entertainment', text: 'It is a safe sport meant for busy public highways', isCorrect: false }
    ],
    feedback: 'Crucial life lesson! Public highways are not stunt arenas; genuine motorsport belongs in regulated tracks with gear!'
  },

  // Electricity
  {
    id: 'junior_elec_kunda_alert',
    category: 'electricity',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'power_saver',
    icon: '⚡',
    pictureEmoji: '⚡ ⚠️ 🔥',
    topic: 'Illegal Kundas & Electrical Safety',
    scenario: 'You see metallic hooks (kundas) sparking over power lines near your neighborhood during rain.',
    question: 'What is the safe procedure?',
    rewardXP: 650,
    rewardTime: 30,
    options: [
      { id: 'opt_a', icon: '⚠️', picture: '🚧 Keep Away & Call 118', text: 'Stay far away and immediately report the hazard to K-Electric 118!', isCorrect: true },
      { id: 'opt_b', icon: '🖐️', picture: '⚡ Touch Wires', text: 'Try to pull the wet sparking wire yourself', isCorrect: false }
    ],
    feedback: 'Exact safety rule! Electrocution risk during monsoon is extreme; always keep distance and inform professionals!'
  },
  {
    id: 'junior_elec_peak_hours_off',
    category: 'electricity',
    ageTier: 'junior',
    type: 'quiz',
    badgeId: 'power_saver',
    icon: '💡',
    pictureEmoji: '💡 ⏰ 🌙',
    topic: 'Peak Load Energy Conservation',
    scenario: 'In Pakistan, peak electricity demand occurs every evening between 6:00 PM and 10:00 PM.',
    question: 'How can families prevent neighborhood transformer trips during peak hours?',
    rewardXP: 650,
    rewardTime: 30,
    options: [
      { id: 'opt_a', icon: '🌙', picture: '⚡ Turn Off High-Wattage Appliances', text: 'Avoid running electric water pumps, heavy washing machines, and irons during peak hours!', isCorrect: true },
      { id: 'opt_b', icon: '🔌', picture: '🔥 Turn On Every AC and Heater', text: 'Run every electrical machine simultaneously at 7:00 PM', isCorrect: false }
    ],
    feedback: 'Civic energy wisdom! Staggering appliance usage prevents local transformer overloads and saves electricity bills!'
  },

  // ==========================================
  // 4. SENIOR / ADULT TIER (Ages 13+) - Ethics & Governance
  // ==========================================
  // Ambulance & Governance
  {
    id: 'senior_vip_protocol_law',
    category: 'ambulance',
    ageTier: 'senior',
    type: 'quiz',
    badgeId: 'lifesaver',
    icon: '🚔',
    pictureEmoji: '🚔 🚫 🚑 ⚖️',
    topic: 'VIP Protocol vs Public Safety',
    scenario: 'A VIP motorcade escort blocks public traffic, leaving multiple ambulances stuck in gridlock.',
    question: 'According to fundamental human rights and traffic law, what takes precedence?',
    rewardXP: 800,
    rewardTime: 35,
    options: [
      { id: 'opt_a', icon: '🚑', picture: '⚖️ Emergency Medical Priority', text: 'Ambulances and emergency response vehicles always have absolute priority over protocol!', isCorrect: true },
      { id: 'opt_b', icon: '🚙', picture: '🚨 VIP Escort Convoys', text: 'Politicians and VIP convoys should block emergency vehicles', isCorrect: false }
    ],
    feedback: 'Constitutional excellence! The right to life guarantees that emergency ambulances supersede all VIP protocols!'
  },
  {
    id: 'senior_ambulance_golden_hour',
    category: 'ambulance',
    ageTier: 'senior',
    type: 'quiz',
    badgeId: 'lifesaver',
    icon: '⏱️',
    pictureEmoji: '⏱️ 🚑 🏥',
    topic: 'The Medical Golden Hour',
    scenario: 'In emergency medicine, the first 60 minutes following a severe traumatic injury is known as what?',
    question: 'Why is traffic clearance for ambulances critically time-sensitive?',
    rewardXP: 800,
    rewardTime: 35,
    options: [
      { id: 'opt_a', icon: '⏱️', picture: '🏥 The Golden Hour: Prevents Irreversible Shock', text: 'The Golden Hour: prompt surgical trauma intervention within 60 minutes prevents irreversible death!', isCorrect: true },
      { id: 'opt_b', icon: '☕', picture: '⏳ Tea Break Time for Doctors', text: 'It allows hospital staff to prepare tea before patient arrival', isCorrect: false }
    ],
    feedback: 'Medical precision! Every minute saved in traffic increases survival probability by over 10%!'
  },

  // Water & Environment
  {
    id: 'senior_water_cartel_hydrant',
    category: 'water',
    ageTier: 'senior',
    type: 'quiz',
    badgeId: 'water_guardian',
    icon: '🌊',
    pictureEmoji: '🌊 🚰 ⚖️',
    topic: 'Karachi Water Rights & Fair Distribution',
    scenario: 'Why does Karachi experience localized water shortages despite receiving water from Keenjhar Lake?',
    question: 'What is the primary structural challenge facing KW&SC?',
    rewardXP: 800,
    rewardTime: 35,
    options: [
      { id: 'opt_a', icon: '⚖️', picture: '💧 Pipeline Distribution & Tanker Cartels', text: 'Illegal commercial hydrants siphoning bulk supply, coupled with outdated unmetered distribution pipelines!', isCorrect: true },
      { id: 'opt_b', icon: '🏞️', picture: '🌧️ No Rainfall', text: 'Karachi has zero municipal water pipelines connected to rivers', isCorrect: false }
    ],
    feedback: 'Profound urban insight! Modernizing metering and eliminating illegal siphon hydrants ensures equal tap water for all!'
  },
  {
    id: 'senior_rain_drainage_nullahs',
    category: 'cleanliness',
    ageTier: 'senior',
    type: 'quiz',
    badgeId: 'clean_green',
    icon: '🌊',
    pictureEmoji: '🌊 🏗️ 🌿',
    topic: 'Urban Drainage & Monsoon Flooding',
    scenario: 'Why does Karachi face severe urban flooding during monsoon downpours?',
    question: 'What is the primary root cause and sustainable solution?',
    rewardXP: 800,
    rewardTime: 35,
    options: [
      { id: 'opt_a', icon: '🌿', picture: '🏗️ Clear Encroached Storm Nullahs', text: 'Clear plastic waste and encroachments from natural nullahs and install permeable surfaces!', isCorrect: true },
      { id: 'opt_b', icon: '🧱', picture: '🏗️ Build Concrete Walls', text: 'Pave all city soil in concrete and dump trash in open drains', isCorrect: false }
    ],
    feedback: 'True urban leadership! Preserving natural drainage channels is vital for Karachi climate resilience!'
  },
  {
    id: 'senior_urban_heat_neem',
    category: 'cleanliness',
    ageTier: 'senior',
    type: 'quiz',
    badgeId: 'green_planter',
    icon: '🌳',
    pictureEmoji: '🌳 🌡️ 🏙️',
    topic: 'Karachi Heatwaves & Urban Foresting',
    scenario: 'Karachi suffers from intense urban heat island effects where concrete traps heat up to 45°C.',
    question: 'Which indigenous trees provide the highest cooling shade and air purification for Karachi?',
    rewardXP: 800,
    rewardTime: 35,
    options: [
      { id: 'opt_a', icon: '🌳', picture: '🌿 Neem, Amaltas, Peepal & Banyan', text: 'Deep-rooted indigenous trees like Neem, Amaltas, and Peepal that thrive in coastal arid soil!', isCorrect: true },
      { id: 'opt_b', icon: '🌵', picture: '🪓 Conocarpus Invasive Trees', text: 'Invasive Conocarpus that causes pollen allergies and destroys underground sewer pipes', isCorrect: false }
    ],
    feedback: 'Eco-visionary! Native Neem trees cool neighborhood microclimates by up to 5°C and provide bird sanctuaries!'
  },

  // Safety & Legal
  {
    id: 'senior_safety_cplc_cctv',
    category: 'safety',
    ageTier: 'senior',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '📹',
    pictureEmoji: '📹 💡 🏘️',
    topic: 'Community Crime Deterrence',
    scenario: 'How can Karachi neighborhood mohalla committees proactively prevent street crime and phone snatching?',
    question: 'What is the most effective community-driven initiative?',
    rewardXP: 800,
    rewardTime: 35,
    options: [
      { id: 'opt_a', icon: '💡', picture: '📹 Street Lighting & Community CCTV', text: 'Install synchronized street illumination, high-resolution perimeter CCTV, and gated neighborhood watch coordination!', isCorrect: true },
      { id: 'opt_b', icon: '🙈', picture: '🌑 Leave Streets Dark', text: 'Leave alleyways unlit and disconnect community surveillance cameras', isCorrect: false }
    ],
    feedback: 'Exemplary civic leadership! Brightly illuminated corridors and community CCTV deter street offenses by over 60%!'
  },
  {
    id: 'senior_safety_glass_dor',
    category: 'safety',
    ageTier: 'senior',
    type: 'quiz',
    badgeId: 'road_safety',
    icon: '🪁',
    pictureEmoji: '🪁 ⚠️ 🏍️',
    topic: 'Banning Chemical & Metallic Kite Dor',
    scenario: 'Chemical and metallic glass-coated kite strings (dor) pose lethal hazards to motorcyclists and commuters.',
    question: 'Why is manufacturing and flying kites with chemical/glass strings banned under Section 144?',
    rewardXP: 800,
    rewardTime: 35,
    options: [
      { id: 'opt_a', icon: '⚠️', picture: '🛑 Lethal Throat Slitting Hazard', text: 'Razor-sharp chemical dor acts like a blade, causing fatal throat injuries to riders and cutting power lines!', isCorrect: true },
      { id: 'opt_b', icon: '🪁', picture: '🌤️ It Just Flies Too High', text: 'The strings are banned because kites block airplane views', isCorrect: false }
    ],
    feedback: 'Life-saving civic stance! Reporting glass dor peddlers saves lives and protects innocent motorcyclists!'
  },

  // Electricity
  {
    id: 'senior_elec_solar_transition',
    category: 'electricity',
    ageTier: 'senior',
    type: 'quiz',
    badgeId: 'power_saver',
    icon: '☀️',
    pictureEmoji: '☀️ ⚡ 🏡',
    topic: 'Clean Renewable Energy & Net-Metering',
    scenario: 'How does adopting rooftop solar photovoltaic net-metering help Karachi electrical infrastructure?',
    question: 'What is the macro civic benefit of solar adoption?',
    rewardXP: 800,
    rewardTime: 35,
    options: [
      { id: 'opt_a', icon: '☀️', picture: '🌱 Relieves Grid Overload & Reduces Carbon', text: 'It supplies clean daytime power to the national grid, reduces transformer stress, and lowers fossil fuel imports!', isCorrect: true },
      { id: 'opt_b', icon: '⚡', picture: '🔥 Overloads Neighborhood Lines', text: 'Solar panels drain electricity from neighbors and increase smog', isCorrect: false }
    ],
    feedback: 'Visionary leadership! Clean solar micro-generation is the ultimate path to sustainable Karachi power reliability!'
  }
];

export function getChallengesByAge(ageTier = 'kids') {
  return EDUCATIONAL_CHALLENGES.filter(c => c.ageTier === ageTier);
}

// Global persistent set of seen challenge IDs
let seenChallengeIds = new Set();
try {
  if (typeof localStorage !== 'undefined') {
    const savedSeen = localStorage.getItem('hole_karachi_seen_challenge_ids');
    if (savedSeen) {
      JSON.parse(savedSeen).forEach(id => seenChallengeIds.add(id));
    }
  }
} catch (e) {}

const lastShownByCategoryAndTier = {};

export function getChallengeByCategoryAndTier(category, ageTier = 'kids') {
  const key = `${category || 'all'}_${ageTier || 'all'}`;

  // 1. Filter candidates matching category and age tier
  let candidates = EDUCATIONAL_CHALLENGES.filter(c => {
    const catMatch = category ? (c.category === category) : true;
    const tierMatch = ageTier ? (c.ageTier === ageTier) : true;
    return catMatch && tierMatch;
  });

  // Fallback if no exact match for this tier
  if (candidates.length === 0 && category) {
    candidates = EDUCATIONAL_CHALLENGES.filter(c => c.category === category);
  }
  if (candidates.length === 0) {
    candidates = EDUCATIONAL_CHALLENGES.filter(c => c.ageTier === ageTier);
    if (candidates.length === 0) {
      candidates = EDUCATIONAL_CHALLENGES;
    }
  }

  // 2. Identify strictly unseen questions
  let unseen = candidates.filter(c => !seenChallengeIds.has(c.id));

  // If all candidates in this subset have been seen, reshuffle cycle!
  if (unseen.length === 0) {
    const lastId = lastShownByCategoryAndTier[key];
    candidates.forEach(c => seenChallengeIds.delete(c.id));
    // Filter again, but strictly exclude the last shown question so it never repeats immediately!
    unseen = candidates.filter(c => c.id !== lastId);
    if (unseen.length === 0) unseen = candidates;
  }

  // Pick from unseen pool
  const selected = unseen[Math.floor(Math.random() * unseen.length)];
  seenChallengeIds.add(selected.id);
  lastShownByCategoryAndTier[key] = selected.id;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hole_karachi_seen_challenge_ids', JSON.stringify(Array.from(seenChallengeIds)));
    }
  } catch (e) {}

  return selected;
}

export function getRandomChallenge(ageTier = 'kids') {
  return getChallengeByCategoryAndTier(null, ageTier);
}
