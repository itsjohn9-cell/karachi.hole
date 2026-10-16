export const DISTRICT_CONFIGS = [
  {
    level: 1,
    id: 'tariq_road',
    name: 'Tariq Road & PECHS',
    urdu: 'طرق روڈ و پی ای سی ایچ ایس',
    tagline: 'Water Tanker Crisis & Street Snatchers',
    heroTitle: 'Mohalla Gutter (محلہ گٹر)',
    unlockedTitle: 'Street Vigilante (گلی محافظ)',
    holeRadius: 1.6,
    baseSpeed: 9.5,
    timeBonus: 50,
    bonusScore: 2500,
    description: 'Devour the illegal Water Tanker Mafia stealing tap water from PECHS homes, catch mobile snatchers, and repair road potholes!',
    targets: [
      { type: 'tanker', icon: '🚰', name: 'Water Tanker Mafia', count: 1, xp: 1400 },
      { type: 'robber', icon: '🔫', name: 'Mobile Snatchers', count: 2, xp: 850 },
      { type: 'gutka', icon: '🛑', name: 'Gutka Peddlers', count: 3, xp: 400 },
      { type: 'pothole', icon: '🕳️', name: 'Broken Road Khaddas', count: 3, xp: 80 },
      { type: 'trash', icon: '🗑️', name: 'Trash & Sewer Pests', count: 6, xp: 25 }
    ],
    challenges: [
      {
        id: 'tanker_water',
        title: 'Water Tanker Extortion & Dry Homes',
        urdu: 'پانی بحران و ٹینکر مافیا کا خاتمہ',
        icon: '🚰',
        evilType: 'tanker',
        targetCount: 1,
        xpReward: 1400,
        description: 'Devour the Water Tanker Mafia siphoning water from PECHS residential homes!',
        benefitText: '🏠 2 Homes Hydrated with Overflowing Taps!'
      },
      {
        id: 'mobile_snatchers',
        title: 'Armed Mobile Snatchers Standoff',
        urdu: 'اسٹریٹ کرائم و ڈکیتی کا خاتمہ',
        icon: '📱',
        evilType: 'robber',
        targetCount: 2,
        xpReward: 900,
        description: 'Devour armed thugs cornering innocent students to save phones!',
        benefitText: '📱 Phones Saved + Street Peace Restored!'
      },
      {
        id: 'road_potholes',
        title: 'Lethal Road Potholes',
        urdu: 'خطرناک گڑھوں کی مرمت',
        icon: '🕳️',
        evilType: 'pothole',
        targetCount: 3,
        xpReward: 500,
        description: 'Devour open broken asphalt craters to repave into carpet roads!',
        benefitText: '🛣️ Smooth Carpet Roads Repaired!'
      }
    ]
  },
  {
    level: 2,
    id: 'saddar_empress',
    name: 'Saddar & Empress Market',
    urdu: 'صدر و ایمپریس مارکیٹ',
    tagline: 'VIP Protocol Traffic Jams & Bhatta Mafias',
    heroTitle: 'District Cleanser (ضلعی کلینر)',
    unlockedTitle: 'Bazaar Protector (بازار کا محافظ)',
    holeRadius: 2.8,
    baseSpeed: 10.0,
    timeBonus: 60,
    bonusScore: 4500,
    description: 'Free stuck traffic by devouring VIP Protocol Prado convoys, Bhatta extortionists & reckless racers!',
    targets: [
      { type: 'vip', icon: '🚨', name: 'VIP Protocol Convoys', count: 2, xp: 1600 },
      { type: 'robber', icon: '🔫', name: 'Armed Dakoo Gangs', count: 2, xp: 850 },
      { type: 'bhatta', icon: '📜', name: 'Bhatta Parchi Extortion', count: 3, xp: 700 },
      { type: 'onewheeler', icon: '🏍️', name: 'Reckless One-Wheelers', count: 3, xp: 500 },
      { type: 'trash', icon: '🗑️', name: 'Market Debris', count: 4, xp: 25 }
    ],
    challenges: [
      {
        id: 'vip_ambulance',
        title: 'VIP Protocol Gridlock & Ambulance',
        urdu: 'وی آئی پی پروٹوکول و ایمبولینس راستہ',
        icon: '🚑',
        evilType: 'vip',
        targetCount: 2,
        xpReward: 2000,
        description: 'Devour VIP Land Cruisers blocking the road for Edhi Ambulance!',
        benefitText: '🚑 Edhi Ambulance Reaches Civil Hospital Safely!'
      },
      {
        id: 'bhatta_bazaar',
        title: 'Bhatta Extortion Gang at Market',
        urdu: 'بھتہ خوروں سے بازار کی آزادی',
        icon: '📜',
        evilType: 'bhatta',
        targetCount: 3,
        xpReward: 1200,
        description: 'Devour extortion thugs waving parchi slips at shopkeepers!',
        benefitText: '🕊️ Peaceful Aman Bazaar Reopened!'
      },
      {
        id: 'onewheeler_racers',
        title: 'Reckless Silencer-less Racers',
        urdu: 'خطرناک ون ویلنگ کا خاتمہ',
        icon: '🏍️',
        evilType: 'onewheeler',
        targetCount: 3,
        xpReward: 900,
        description: 'Devour speeding one-wheelers endangering pedestrians!',
        benefitText: '🚸 Safe Pedestrian Transit Zone Restored!'
      }
    ]
  },
  {
    level: 3,
    id: 'water_pump_gulshan',
    name: 'Water Pump & Gulshan-e-Iqbal',
    urdu: 'واٹر پمپ و گلشنِ اقبال',
    tagline: 'Tanker Mafia Extortion & Sparking Kundas',
    heroTitle: 'Water Hero (پانی کا مسیحا)',
    unlockedTitle: 'Civic Commissioner (صفائی کمشنر)',
    holeRadius: 4.5,
    baseSpeed: 10.5,
    timeBonus: 70,
    bonusScore: 7500,
    description: 'Devour illegal Water Tanker Mafias (restoring fresh geysers for thirsty residents) & chop sparking K-Electric transformers!',
    targets: [
      { type: 'tanker', icon: '💧', name: 'Water Tanker Mafias', count: 3, xp: 1400 },
      { type: 'ke', icon: '⚡', name: 'Sparking K-Electric Kundas', count: 3, xp: 750 },
      { type: 'chinacutting', icon: '📐', name: 'China-Cutting Encroachers', count: 2, xp: 650 },
      { type: 'vip', icon: '🚨', name: 'VIP Protocol Escorts', count: 2, xp: 1600 },
      { type: 'robber', icon: '🔫', name: 'Street Robbers', count: 2, xp: 850 }
    ],
    challenges: [
      {
        id: 'tanker_gulshan',
        title: 'Water Tanker Cartel & Dry Blocks',
        urdu: 'ٹینکر مافیا سے گلشن کے نلکے بحال',
        icon: '💧',
        evilType: 'tanker',
        targetCount: 3,
        xpReward: 2500,
        description: 'Devour 3 illegal water tankers to restore municipal water lines!',
        benefitText: '🌊 6 Homes Hydrated with Freshwater Fountains!'
      },
      {
        id: 'ke_kundas',
        title: 'High-Voltage K-Electric Kundas',
        urdu: 'کنڈہ مافیا و لوڈ شیڈنگ کا خاتمہ',
        icon: '⚡',
        evilType: 'ke',
        targetCount: 3,
        xpReward: 1500,
        description: 'Devour dangerous illegal kundas causing sparks & load shedding!',
        benefitText: '💡 Clean Solar Microgrid Restores Electricity!'
      },
      {
        id: 'chinacutting_footpath',
        title: 'China-Cutting Encroachment Walls',
        urdu: 'چائنا کٹنگ سے عوامی راستے آزاد',
        icon: '📐',
        evilType: 'chinacutting',
        targetCount: 2,
        xpReward: 1200,
        description: 'Demolish illegal walls built over public footpaths!',
        benefitText: '🌳 Public Green Promenade Restored!'
      }
    ]
  },
  {
    level: 4,
    id: 'clifton_sea_view',
    name: 'Clifton & Sea View Coast',
    urdu: 'کلفٹن و سی ویو ساحل',
    tagline: 'Corrupt Politicians & Coastal Encroachments',
    heroTitle: 'Metropolitan Guardian (شہرِ قائد کا رکھوالا)',
    unlockedTitle: 'Karachi Legend (کراچی کا فخر)',
    holeRadius: 7.2,
    baseSpeed: 11.0,
    timeBonus: 80,
    bonusScore: 12000,
    description: 'Catch corrupt Pakistani Politicians fleeing with offshore briefcases & demolish illegal coastal China-Cutting land grabbers!',
    targets: [
      { type: 'politician', icon: '💰', name: 'Corrupt VIP Politicians', count: 4, xp: 600 },
      { type: 'vip', icon: '🚨', name: 'Speeding VIP Escort Fleets', count: 2, xp: 1600 },
      { type: 'tanker', icon: '💧', name: 'Illegal Coastal Tankers', count: 2, xp: 1400 },
      { type: 'chinacutting', icon: '📐', name: 'Beachfront Land Grabbers', count: 3, xp: 650 },
      { type: 'ke', icon: '⚡', name: 'Overloaded High-Tension Kundas', count: 2, xp: 750 }
    ],
    challenges: [
      {
        id: 'politicians_loot',
        title: 'Corrupt Politicians Offshore Loot',
        urdu: 'کرپٹ سیاستدانوں کا احتساب',
        icon: '💰',
        evilType: 'politician',
        targetCount: 4,
        xpReward: 3000,
        description: 'Catch corrupt VIPs fleeing with public money briefcases!',
        benefitText: '🏛️ Millions Recovered for Public Welfare!'
      },
      {
        id: 'vip_convoy_coast',
        title: 'Beachfront VIP Motorcades',
        urdu: 'ساحل پر پروٹوکول کلچر کا خاتمہ',
        icon: '🚨',
        evilType: 'vip',
        targetCount: 2,
        xpReward: 2200,
        description: 'Clear VIP escorts blocking access to Sea View beach!',
        benefitText: '🏖️ Free Unrestricted Beach Promenade!'
      },
      {
        id: 'beach_encroachment',
        title: 'Coastal Land Grabbers',
        urdu: 'ساحلی چائنا کٹنگ کا خاتمہ',
        icon: '📐',
        evilType: 'chinacutting',
        targetCount: 3,
        xpReward: 1800,
        description: 'Devour coastal encroachment cartels occupying mangroves!',
        benefitText: '🌊 Protected Coastal Mangrove Ecosystem!'
      }
    ]
  },
  {
    level: 5,
    id: 'mazar_e_quaid_mega',
    name: 'Mazar-e-Quaid Metropolis',
    urdu: 'مزارِ قائد عظیم میٹروپولس',
    tagline: 'Total City Cleansing • Quaid’s Dream Fulfilled',
    heroTitle: 'MAZAR MEGA VOID (قائد اعظم کا خواب)',
    unlockedTitle: 'Supreme Karachi Savior',
    holeRadius: 12.5,
    baseSpeed: 11.5,
    timeBonus: 99,
    bonusScore: 25000,
    description: 'Cleanse all remaining mafias, convoys, and corrupt VIPs to make Karachi the peaceful City of Lights!',
    targets: [
      { type: 'politician', icon: '💰', name: 'Foreign Asset Politicians', count: 6, xp: 600 },
      { type: 'vip', icon: '🚨', name: 'VIP Motorcade Squads', count: 3, xp: 1600 },
      { type: 'tanker', icon: '💧', name: 'Water Tanker Cartels', count: 3, xp: 1400 },
      { type: 'bhatta', icon: '📜', name: 'Bhatta Extortion Kings', count: 3, xp: 700 },
      { type: 'robber', icon: '🔫', name: 'Last Armed Snatchers', count: 3, xp: 850 }
    ],
    challenges: [
      {
        id: 'mega_cleansing',
        title: 'Metropolis Mafia Eradication',
        urdu: 'قائد اعظم کے پرامن کراچی کی بحالی',
        icon: '⭐',
        evilType: 'politician',
        targetCount: 6,
        xpReward: 5000,
        description: 'Cleanse all remaining corrupt VIPs and cartels to fulfill Quaid’s dream!',
        benefitText: '🌟 Quaid’s Dream City of Lights Realized!'
      }
    ]
  }
];

export function getDistrictConfig(level) {
  const index = Math.max(0, Math.min(level - 1, DISTRICT_CONFIGS.length - 1));
  return DISTRICT_CONFIGS[index];
}
