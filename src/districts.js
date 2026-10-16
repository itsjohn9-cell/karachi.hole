export const DISTRICT_CONFIGS = [
  {
    level: 1,
    id: 'tariq_road',
    name: 'Tariq Road & PECHS',
    urdu: 'طرق روڈ و پی ای سی ایچ ایس',
    tagline: 'Street Snatchers & Overflowing Khaddas',
    heroTitle: 'Mohalla Gutter (محلہ گٹر)',
    unlockedTitle: 'Street Vigilante (گلی محافظ)',
    holeRadius: 1.6,
    baseSpeed: 9.5,
    timeBonus: 50,
    bonusScore: 2500,
    description: 'Devour Mobile Snatchers robbing citizens, Shady Gutka peddlers, and road potholes!',
    targets: [
      { type: 'robber', icon: '🔫', name: 'Mobile Snatchers', count: 2, xp: 850 },
      { type: 'gutka', icon: '🛑', name: 'Gutka Peddlers', count: 3, xp: 400 },
      { type: 'pothole', icon: '🕳️', name: 'Broken Road Khaddas', count: 3, xp: 80 },
      { type: 'trash', icon: '🗑️', name: 'Trash & Sewer Pests', count: 6, xp: 25 }
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
    ]
  }
];

export function getDistrictConfig(level) {
  const index = Math.max(0, Math.min(level - 1, DISTRICT_CONFIGS.length - 1));
  return DISTRICT_CONFIGS[index];
}
