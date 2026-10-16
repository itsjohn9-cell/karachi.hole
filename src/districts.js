/**
 * Karachi Districts & Multi-Mission System
 * Defines 5 progressive Karachi districts with rich multi-mission checklists,
 * civic transformations, and curated targets.
 */

export const DISTRICT_CONFIGS = [
  {
    level: 1,
    id: 'tariq_road',
    name: 'Tariq Road & PECHS',
    urdu: 'طارق روڈ اور پی ای سی ایچ ایس',
    tagline: 'Water Tanker Crisis & Street Snatchers',
    heroTitle: 'Street Vigilante',
    unlockedTitle: 'PECHS Neighborhood Guardian',
    timeBonus: 60,
    bonusScore: 3000,
    description: 'Intercept the illegal Water Tanker Mafia stealing tap water from PECHS homes, catch mobile snatchers, and repair road potholes!',
    missions: [
      {
        id: 'm1_tanker',
        title: 'Stop Water Tanker Mafia',
        icon: '🚰',
        evilType: 'tanker',
        targetCount: 1,
        xpReward: 1400,
        description: 'Intercept the illegal tanker truck and restore tap water to PECHS residential homes!',
        benefitText: '💧 Overflowing Tap Water Restored to 2,500 Homes!'
      },
      {
        id: 'm1_robbers',
        title: 'Catch Mobile Snatchers',
        icon: '📱',
        evilType: 'robber',
        targetCount: 2,
        xpReward: 900,
        description: 'Chase down and apprehend armed thugs escaping through side alleys!',
        benefitText: '📱 Phones Saved & Street Peace Restored!'
      },
      {
        id: 'm1_potholes',
        title: 'Repair Broken Potholes',
        icon: '🕳️',
        evilType: 'pothole',
        targetCount: 3,
        xpReward: 500,
        description: 'Repair dangerous asphalt craters into smooth carpet roads!',
        benefitText: '🛣️ Smooth Carpet Roads Repaved!'
      },
      {
        id: 'm1_gutka',
        title: 'Bust Gutka Peddlers',
        icon: '🛑',
        evilType: 'gutka',
        targetCount: 3,
        xpReward: 600,
        description: 'Stop illicit gutka peddlers selling hazardous substance near school zones!',
        benefitText: '🚰 Clean Public Sabeel Water Station Built!'
      },
      {
        id: 'm1_trash',
        title: 'Clean Up Street Waste',
        icon: '🧹',
        evilType: 'trash',
        targetCount: 4,
        xpReward: 400,
        description: 'Collect overflowing trash bags and transform them into jasmine planters!',
        benefitText: '🌸 Blooming Jasmine Planters Planted!'
      }
    ]
  },
  {
    level: 2,
    id: 'saddar_empress',
    name: 'Saddar Bazaar & Empress Market',
    urdu: 'صدر بازار اور ایمپریس مارکیٹ',
    tagline: 'VIP Protocol Traffic Jams & Extortion Mafias',
    heroTitle: 'District Cleanser',
    unlockedTitle: 'Bazaar Protector',
    timeBonus: 75,
    bonusScore: 5000,
    description: 'Clear the VIP Protocol Prado convoy blocking the Edhi Ambulance, bust bhatta extortionists, and catch reckless street racers!',
    missions: [
      {
        id: 'm2_vip',
        title: 'Clear VIP Escorts for Ambulance',
        icon: '🚑',
        evilType: 'vip',
        targetCount: 2,
        xpReward: 2000,
        description: 'Clear VIP Land Cruisers blocking the avenue so the Edhi Ambulance can reach Civil Hospital!',
        benefitText: '🚑 Edhi Ambulance Reaches Civil Hospital Safely!'
      },
      {
        id: 'm2_bhatta',
        title: 'Bust Bhatta Extortionists',
        icon: '📜',
        evilType: 'bhatta',
        targetCount: 3,
        xpReward: 1200,
        description: 'Stop extortion thugs waving illegal extortion slips at fruit and spice vendors!',
        benefitText: '🕊️ Peaceful Open Aman Bazaar Reopened!'
      },
      {
        id: 'm2_racers',
        title: 'Stop Reckless 70cc Racers',
        icon: '🏍️',
        evilType: 'onewheeler',
        targetCount: 3,
        xpReward: 900,
        description: 'Intercept speeding one-wheelers endangering pedestrians on Preedy Street!',
        benefitText: '🚸 Safe Pedestrian Crossing Restored!'
      },
      {
        id: 'm2_robbers',
        title: 'Apprehend Electronics Snatchers',
        icon: '🔫',
        evilType: 'robber',
        targetCount: 2,
        xpReward: 1000,
        description: 'Catch mobile snatchers escaping near Rainbow Center!',
        benefitText: '🛡️ Electronics Market Safe Zone Established!'
      },
      {
        id: 'm2_debris',
        title: 'Recycle Market Debris',
        icon: '🗑️',
        evilType: 'trash',
        targetCount: 4,
        xpReward: 500,
        description: 'Clean up discarded fruit crates and plastic waste outside Empress Market!',
        benefitText: '🌿 Green Botanical Walkway Created!'
      }
    ]
  },
  {
    level: 3,
    id: 'water_pump_gulshan',
    name: 'Water Pump & Gulshan-e-Iqbal',
    urdu: 'واٹر پمپ اور گلشن اقبال',
    tagline: 'Mega Tanker Cartel & Sparking Power Kundas',
    heroTitle: 'City Water Champion',
    unlockedTitle: 'Civic Commissioner',
    timeBonus: 85,
    bonusScore: 8000,
    description: 'Dismantle the industrial water tanker cartel, disconnect sparking power kundas, and tear down illegal sidewalk encroachment walls!',
    missions: [
      {
        id: 'm3_tankers',
        title: 'Dismantle Tanker Cartel',
        icon: '💧',
        evilType: 'tanker',
        targetCount: 3,
        xpReward: 2500,
        description: 'Stop 3 commercial water tankers siphoning water from the main Gulshan water pumping station!',
        benefitText: '🌊 High-Pressure Freshwater Pumped to 10,000 Homes!'
      },
      {
        id: 'm3_kundas',
        title: 'Remove Sparking Power Kundas',
        icon: '⚡',
        evilType: 'ke',
        targetCount: 3,
        xpReward: 1600,
        description: 'Disconnect dangerous illegal wiring hooked over high-voltage transformers!',
        benefitText: '💡 Clean Solar Microgrid Powers Street Lights!'
      },
      {
        id: 'm3_chinacutting',
        title: 'Tear Down Illegal Encroachment Walls',
        icon: '📐',
        evilType: 'chinacutting',
        targetCount: 2,
        xpReward: 1400,
        description: 'Demolish unauthorized boundary walls encroaching on public footpaths!',
        benefitText: '🌳 Shaded Pedestrian Footpath Reopened!'
      },
      {
        id: 'm3_robbers',
        title: 'Bust University Road Snatchers',
        icon: '🔫',
        evilType: 'robber',
        targetCount: 2,
        xpReward: 1100,
        description: 'Protect Karachi University students from roadside phone snatchers!',
        benefitText: '🎓 Safe Campus Transit Corridor!'
      }
    ]
  },
  {
    level: 4,
    id: 'clifton_sea_view',
    name: 'Clifton & Sea View Coast',
    urdu: 'کلفٹن اور سی ویو کوسٹ',
    tagline: 'Corrupt VIP Convoys & Beachfront Land Grabbers',
    heroTitle: 'Metropolitan Guardian',
    unlockedTitle: 'Karachi Legend',
    timeBonus: 95,
    bonusScore: 12000,
    description: 'Catch corrupt VIP politicians fleeing with offshore briefcases, clear beach motorcades, and reclaim public mangroves!',
    missions: [
      {
        id: 'm4_politicians',
        title: 'Catch Corrupt VIP Politicians',
        icon: '💰',
        evilType: 'politician',
        targetCount: 4,
        xpReward: 3000,
        description: 'Intercept corrupt politicians fleeing toward private jets with offshore money briefcases!',
        benefitText: '🏛️ Millions Recovered for Karachi Public Schools & Hospitals!'
      },
      {
        id: 'm4_vip',
        title: 'Clear Sea View VIP Convoys',
        icon: '🚨',
        evilType: 'vip',
        targetCount: 2,
        xpReward: 2200,
        description: 'Clear arrogant VIP escort fleets blocking citizens from enjoying Sea View beach!',
        benefitText: '🏖️ Free Unrestricted Beachfront Promenade!'
      },
      {
        id: 'm4_encroachment',
        title: 'Evict Mangrove Land Grabbers',
        icon: '📐',
        evilType: 'chinacutting',
        targetCount: 3,
        xpReward: 1800,
        description: 'Stop commercial developers dumping debris into protected coastal mangrove wetlands!',
        benefitText: '🌊 Protected Coastal Mangrove Marine Sanctuary!'
      },
      {
        id: 'm4_tankers',
        title: 'Stop Coastal Water Smugglers',
        icon: '💧',
        evilType: 'tanker',
        targetCount: 2,
        xpReward: 1500,
        description: 'Intercept tankers smuggling desalination water away from coastal fishermen villages!',
        benefitText: '🐟 Freshwater Taps Restored to Fishermen Neighborhoods!'
      }
    ]
  },
  {
    level: 5,
    id: 'mazar_e_quaid_mega',
    name: 'Mazar-e-Quaid Metropolis',
    urdu: 'مزار قائد میٹروپولیس',
    tagline: 'Total City Cleansing & Grand Victory',
    heroTitle: 'Grand City Protector',
    unlockedTitle: 'Supreme Karachi Savior',
    timeBonus: 120,
    bonusScore: 25000,
    description: 'Cleanse all remaining mafias and corrupt cartels to make Karachi the peaceful, thriving City of Lights!',
    missions: [
      {
        id: 'm5_mafia_kings',
        title: 'Arrest Cartel Kingpins',
        icon: '👑',
        evilType: 'politician',
        targetCount: 5,
        xpReward: 5000,
        description: 'Bring the city cartel bosses to justice at the heart of Karachi!',
        benefitText: '🌟 City of Lights Restored in Glory, Justice & Peace!'
      },
      {
        id: 'm5_vip_fleets',
        title: 'Neutralize VIP Motorcades',
        icon: '🚨',
        evilType: 'vip',
        targetCount: 3,
        xpReward: 3000,
        description: 'Disband all VIP protocol escort squads across Mazar-e-Quaid corridors!',
        benefitText: '🚦 Equal Traffic Rules for Every Citizen!'
      },
      {
        id: 'm5_mega_tankers',
        title: 'Free All Municipal Reservoirs',
        icon: '💧',
        evilType: 'tanker',
        targetCount: 3,
        xpReward: 2500,
        description: 'Connect all main water pipelines directly to citizen homes!',
        benefitText: '🚰 24/7 Clean Drinking Water for All 20 Million Karachiites!'
      }
    ]
  }
];

export function getDistrictConfig(level) {
  const index = Math.max(0, Math.min(level - 1, DISTRICT_CONFIGS.length - 1));
  const cfg = DISTRICT_CONFIGS[index];
  // Backward compatibility alias: challenges = missions
  cfg.challenges = cfg.missions;
  return cfg;
}
