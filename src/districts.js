/**
 * Pakistan Street Hero - Multi-City & Districts Progression System
 * Defines authentic Pakistani cities (Karachi, Lahore, Islamabad, Quetta)
 * with hyper-local cultures, civic missions, and environmental transformations.
 */

export const DISTRICT_CONFIGS = [
  {
    level: 1,
    id: 'karachi_clifton_dha',
    city: 'Karachi',
    name: 'Karachi: DHA & Clifton Sea View',
    urdu: 'کراچی: ڈی ایچ اے اور کلفٹن سی ویو',
    tagline: 'VIP Convoys, Water Tanker Mafia & Snatchers',
    heroTitle: 'Street Vigilante',
    unlockedTitle: 'Coastal Guardian',
    timeBonus: 65,
    bonusScore: 3500,
    holeRadiusBonus: 0.35,
    speedBonus: 0.8,
    description: 'Protect Clifton citizens and DHA coastal avenues: intercept illegal water tankers, arrest mobile snatchers, and repair broken road craters!',
    missions: [
      {
        id: 'm1_potholes',
        title: 'Repair Road Potholes',
        icon: '🕳️',
        evilType: 'pothole',
        targetCount: 2,
        xpReward: 600,
        description: 'Pave over broken road craters to restore smooth carpet roads on the coastal avenue!',
        benefitText: '🛣️ Smooth Carpet Roads Repaved!'
      },
      {
        id: 'm1_robbers',
        title: 'Catch Mobile Snatcher',
        icon: '📱',
        evilType: 'robber',
        targetCount: 1,
        xpReward: 1000,
        description: 'Chase down and apprehend the armed mobile snatcher escaping down the avenue!',
        benefitText: '📱 Citizen Phone Saved & Street Peace Restored!'
      },
      {
        id: 'm1_tanker',
        title: 'Stop Water Tanker Mafia',
        icon: '🚰',
        evilType: 'tanker',
        targetCount: 1,
        xpReward: 1400,
        description: 'Intercept the illegal tanker truck and restore tap water to PECHS & Clifton residential homes!',
        benefitText: '💧 Overflowing Tap Water Restored to 2,500 Homes!'
      }
    ]
  },
  {
    level: 2,
    id: 'karachi_lyari',
    city: 'Karachi',
    name: 'Karachi: Lyari Football & Culture',
    urdu: 'کراچی: لیاری فٹ بال اور کلچر',
    tagline: 'Bhatta Extortionists, Potholes & Street Peace',
    heroTitle: 'District Cleanser',
    unlockedTitle: 'Lyari Aman Hero',
    timeBonus: 75,
    bonusScore: 5000,
    holeRadiusBonus: 0.40,
    speedBonus: 0.8,
    description: 'Restore peace in Lyari: bust bhatta extortionists waving parchi slips, stop reckless 70cc racers, and repair street craters so children can play football!',
    missions: [
      {
        id: 'm2_bhatta',
        title: 'Bust Bhatta Extortionists',
        icon: '📜',
        evilType: 'bhatta',
        targetCount: 3,
        xpReward: 1200,
        description: 'Stop extortion thugs waving illegal extortion slips at local market shopkeepers!',
        benefitText: '🕊️ Peaceful Open Aman Bazaar Reopened!'
      },
      {
        id: 'm2_potholes',
        title: 'Repair Lyari Street Craters',
        icon: '🕳️',
        evilType: 'pothole',
        targetCount: 2,
        xpReward: 800,
        description: 'Level broken street potholes so youth can safely play street football!',
        benefitText: '⚽ Safe Football Ground & Smooth Streets Created!'
      },
      {
        id: 'm2_racers',
        title: 'Stop Reckless 70cc Racers',
        icon: '🏍️',
        evilType: 'onewheeler',
        targetCount: 3,
        xpReward: 900,
        description: 'Intercept reckless one-wheelers endangering pedestrians on narrow neighborhood roads!',
        benefitText: '🚸 Safe Pedestrian Crossing Restored!'
      },
      {
        id: 'm2_robbers',
        title: 'Apprehend Street Snatchers',
        icon: '🔫',
        evilType: 'robber',
        targetCount: 2,
        xpReward: 1000,
        description: 'Catch mobile snatchers escaping near the neighborhood community center!',
        benefitText: '🛡️ Lyari Neighborhood Safe Zone Established!'
      }
    ]
  },
  {
    level: 3,
    id: 'karachi_saddar_burns',
    city: 'Karachi',
    name: 'Karachi: Saddar & Burns Road',
    urdu: 'کراچی: صدر اور برنز روڈ',
    tagline: 'VIP Protocol Traffic Jams & Edhi Ambulance Escorts',
    heroTitle: 'Bazaar Protector',
    unlockedTitle: 'Heritage Savior',
    timeBonus: 85,
    bonusScore: 7500,
    holeRadiusBonus: 0.45,
    speedBonus: 0.8,
    description: 'Clear the VIP Protocol Prado convoys blocking the Edhi Ambulance, recycle Burns Road food street waste, and stop reckless one-wheelers!',
    missions: [
      {
        id: 'm3_vip',
        title: 'Clear VIP Escorts for Ambulance',
        icon: '🚑',
        evilType: 'vip',
        targetCount: 2,
        xpReward: 2000,
        description: 'Clear VIP Land Cruisers blocking the avenue so the Edhi Ambulance can reach Civil Hospital!',
        benefitText: '🚑 Edhi Ambulance Reaches Civil Hospital Safely!'
      },
      {
        id: 'm3_snatchers',
        title: 'Bust Empress Market Snatchers',
        icon: '📱',
        evilType: 'robber',
        targetCount: 2,
        xpReward: 1200,
        description: 'Protect shoppers and foodies on Burns Road from electronics snatchers!',
        benefitText: '🥙 Peaceful Food Street Walkway!'
      },
      {
        id: 'm3_debris',
        title: 'Recycle Market Debris',
        icon: '🗑️',
        evilType: 'trash',
        targetCount: 4,
        xpReward: 600,
        description: 'Clean up discarded fruit crates and plastic waste outside Empress Market!',
        benefitText: '🌿 Clean Heritage Walkway Restored!'
      }
    ]
  },
  {
    level: 4,
    id: 'lahore_canal_bank',
    city: 'Lahore',
    name: 'Lahore: Androon & Canal Bank',
    urdu: 'لاہور: اندرون لاہور اور کینال روڈ',
    tagline: 'Smog Emitters, Chemical Dor Peddlers & Canal Peace',
    heroTitle: 'Zinda Dil Hero',
    unlockedTitle: 'Lahore City Guardian',
    timeBonus: 95,
    bonusScore: 10000,
    holeRadiusBonus: 0.50,
    speedBonus: 0.85,
    description: 'Enter the heart of Punjab! Catch chemical kite-string (dor) peddlers, impound smoke-spewing smog vehicles along the Canal, and clear VIP convoys!',
    missions: [
      {
        id: 'm4_dor',
        title: 'Bust Chemical Kite-String Peddlers',
        icon: '🪁',
        evilType: 'chinacutting',
        targetCount: 3,
        xpReward: 2200,
        description: 'Confiscate lethal glass/metal coated kite strings endangering bike riders on Mall Road!',
        benefitText: '🕊️ Safe Skies & Protected Motorcyclists!'
      },
      {
        id: 'm4_smog',
        title: 'Impound Black Smog Emitters',
        icon: '🏭',
        evilType: 'tanker',
        targetCount: 2,
        xpReward: 2000,
        description: 'Stop commercial smoke-belching diesel clunkers polluting the Lahore atmosphere!',
        benefitText: '🌤️ Crisp Clean Air & Smog-Free Lahore Skies!'
      },
      {
        id: 'm4_vip',
        title: 'Clear Canal Bank VIP Motorcades',
        icon: '🚨',
        evilType: 'vip',
        targetCount: 2,
        xpReward: 2500,
        description: 'Disband illegal VIP protocol escorts blocking regular commuters along Lahore Canal!',
        benefitText: '🌳 Peaceful Flowering Canal Promenade!'
      }
    ]
  },
  {
    level: 5,
    id: 'islamabad_margalla',
    city: 'Islamabad',
    name: 'Islamabad: F-Sectors & Margalla',
    urdu: 'اسلام آباد: سیکٹرز اور مارگلہ ہلز',
    tagline: 'Midnight Street Racers & Margalla Forest Protection',
    heroTitle: 'Federal Peacekeeper',
    unlockedTitle: 'Margalla Sentinel',
    timeBonus: 105,
    bonusScore: 15000,
    holeRadiusBonus: 0.55,
    speedBonus: 0.85,
    description: 'Patrol the lush green capital! Catch midnight supercar street racers on Constitution Avenue, stop illegal timber logging on Margalla Hills, and remove VIP blockades!',
    missions: [
      {
        id: 'm5_racers',
        title: 'Impound Midnight Street Racers',
        icon: '🏎️',
        evilType: 'onewheeler',
        targetCount: 3,
        xpReward: 3000,
        description: 'Intercept dangerous luxury street racers disturbing the quiet capital avenues!',
        benefitText: '🚦 Disciplined, Safe Federal Avenues!'
      },
      {
        id: 'm5_timber',
        title: 'Stop Margalla Timber Poachers',
        icon: '🌲',
        evilType: 'chinacutting',
        targetCount: 3,
        xpReward: 2500,
        description: 'Protect the Margalla Hills National Park from illegal woodcutters and fire hazards!',
        benefitText: '🌿 Flourishing Green Margalla Foothills!'
      },
      {
        id: 'm5_politicians',
        title: 'Audit Corrupt Protocol VIPs',
        icon: '💼',
        evilType: 'politician',
        targetCount: 3,
        xpReward: 3500,
        description: 'Bring corrupt bureaucrats fleeing with public funds to justice in the capital!',
        benefitText: '🏛️ Transparent Governance & Public Trust Restored!'
      }
    ]
  },
  {
    level: 6,
    id: 'quetta_hanna_valley',
    city: 'Quetta',
    name: 'Quetta: Liaquat Bazaar & Hanna Valley',
    urdu: 'کوئٹہ: لیاقت بازار اور ہنہ ویلی',
    tagline: 'Groundwater Cartels, Bazaar Mafias & Mountain Peace',
    heroTitle: 'Supreme Mountain Champion',
    unlockedTitle: 'Supreme Pakistan Street Hero',
    timeBonus: 120,
    bonusScore: 25000,
    holeRadiusBonus: 0.60,
    speedBonus: 0.9,
    description: 'Reach the rugged mountain valley of Quetta! Shut down illegal groundwater boring cartels, bust bazaar extortionists, and secure sparking electrical poles!',
    missions: [
      {
        id: 'm6_water',
        title: 'Shut Illegal Boring Cartels',
        icon: '💧',
        evilType: 'tanker',
        targetCount: 3,
        xpReward: 4000,
        description: 'Stop commercial cartels depleting Quetta Valley freshwater aquifers!',
        benefitText: '🏔️ Natural Hanna Valley Freshwater Streams Restored!'
      },
      {
        id: 'm6_bazaar',
        title: 'Bust Liaquat Bazaar Extortionists',
        icon: '💰',
        evilType: 'bhatta',
        targetCount: 4,
        xpReward: 3000,
        description: 'Protect dry-fruit merchants and local Pashtun/Balochi traders from bazaar mafias!',
        benefitText: '✨ Vibrant, Safe Liaquat Bazaar Economy!'
      },
      {
        id: 'm6_transformers',
        title: 'Secure Sparking Power Transformers',
        icon: '⚡',
        evilType: 'ke',
        targetCount: 3,
        xpReward: 2500,
        description: 'Disconnect hazardous exposed wires to prevent urban fire outbreaks!',
        benefitText: '💡 Stable Electricity & Safe Mountain City!'
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
