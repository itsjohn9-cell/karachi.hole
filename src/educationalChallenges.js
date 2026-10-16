// Karachi Civic Junior Academy: Educational Challenges & Civic Learning System
// Tailored for kids of all age groups with bilingual Urdu & English content

export const AGE_TIERS = {
  junior: {
    id: 'junior',
    name: 'Junior Citizen',
    ageRange: 'Ages 4–7',
    urdu: 'چھوٹے بچّے (۴ تا ۷ سال)',
    icon: '🐣',
    description: 'Visual dilemmas with simple positive actions & colorful cues'
  },
  ranger: {
    id: 'ranger',
    name: 'Karachi Ranger',
    ageRange: 'Ages 8–11',
    urdu: 'اسکول کیڈٹس (۸ تا ۱۱ سال)',
    icon: '🎒',
    description: 'Civic responsibility, public spaces, and urban awareness'
  },
  champion: {
    id: 'champion',
    name: 'Civic Champion',
    ageRange: 'Ages 12+',
    urdu: 'شہری ہیرو (۱۲+ سال)',
    icon: '🏆',
    description: 'Community leadership, environmental protection & city ethics'
  }
};

export const CIVIC_BADGES = [
  {
    id: 'water_guardian',
    name: 'Water Guardian',
    urdu: 'محافظِ آب',
    icon: '🚰',
    color: '#00e5ff',
    desc: 'Learned to stop water wastage and protect Karachi taps'
  },
  {
    id: 'lifesaver',
    name: 'Ambulance Hero',
    urdu: 'جان بچانے والا',
    icon: '🚑',
    color: '#ff1744',
    desc: 'Understands giving right of way to emergency patients'
  },
  {
    id: 'clean_green',
    name: 'Clean Karachi Star',
    urdu: 'صاف و شفاف کراچی',
    icon: '🧹',
    color: '#00e676',
    desc: 'Throws trash in bins and keeps storm drains unchoked'
  },
  {
    id: 'power_saver',
    name: 'Energy Champion',
    urdu: 'توانائی دوست',
    icon: '⚡',
    color: '#ffd700',
    desc: 'Turns off fans & lights to help prevent load shedding'
  },
  {
    id: 'animal_kindness',
    name: 'Kind Companion',
    urdu: 'بے زبانوں کا ہمدرد',
    icon: '🐾',
    color: '#ff80ab',
    desc: 'Provides water bowls and gentle care for street animals'
  },
  {
    id: 'road_safety',
    name: 'Traffic Champion',
    urdu: 'محفوظ ٹریفک چیمپئن',
    icon: '🚦',
    color: '#76ff03',
    desc: 'Respects zebra crossings and helps pedestrians safely cross'
  },
  {
    id: 'smart_citizen',
    name: 'Alert Citizen',
    urdu: 'ہوشیار اور باخبر شہری',
    icon: '👀',
    color: '#e040fb',
    desc: 'Practices street safety and protects personal belongings'
  }
];

export const EDUCATIONAL_CHALLENGES = [
  // ==========================================
  // JUNIOR TIER (Ages 4-7)
  // ==========================================
  {
    id: 'junior_water_tap',
    category: 'water',
    ageTier: 'junior',
    badgeId: 'water_guardian',
    icon: '🚰',
    topic: 'Water Conservation / پانی کی بچت',
    scenario: 'You are brushing your teeth and notice the tap is running freely!',
    scenarioUrdu: 'آپ دانت صاف کر رہے ہیں اور نلکا کھلا بہہ رہا ہے!',
    question: 'What is the kindest thing to do for Karachi?',
    questionUrdu: 'کراچی کے لیے سب سے اچھا کام کیا ہے؟',
    options: [
      {
        id: 'opt_a',
        icon: '🚰',
        text: 'Turn the tap off tightly while brushing!',
        textUrdu: 'نل فوراً بند کریں تاکہ پانی محفوظ رہے!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🌊',
        text: 'Leave it running and let clean water spill away',
        textUrdu: 'نل کھلا چھوڑ دیں اور پانی بہنے دیں',
        isCorrect: false
      }
    ],
    explanation: 'Shabash! Closing the tap saves over 6 liters of clean water every time. Karachi needs every drop!',
    explanationUrdu: 'شاباش! نل بند رکھنے سے ہر بار ۶ لیٹر پانی بچتا ہے۔ پانی اللہ کی عظیم نعمت ہے!',
    rewardXP: 500,
    rewardTime: 20
  },
  {
    id: 'junior_trash_bin',
    category: 'cleanliness',
    ageTier: 'junior',
    badgeId: 'clean_green',
    icon: '🗑️',
    topic: 'Clean Streets / صاف گلیاں',
    scenario: 'You just finished a delicious packet of chips or juice box in the park.',
    scenarioUrdu: 'آپ نے پارک میں چپس یا جوس کا ڈبہ ختم کیا۔',
    question: 'Where should the empty wrapper go?',
    questionUrdu: 'خالی ریپر کہاں پھینکنا چاہیے؟',
    options: [
      {
        id: 'opt_a',
        icon: '🗑️',
        text: 'Throw it inside the nearest green trash bin!',
        textUrdu: 'قریبی کوڑے دان (ڈسٹ بن) کے اندر پھینکیں!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🚯',
        text: 'Drop it on the road or into the open gutter',
        textUrdu: 'سڑک یا کھلے نالے میں پھینک دیں',
        isCorrect: false
      }
    ],
    explanation: 'Wonderful! When trash goes into the bin, street gutters don’t choke and our city stays clean and healthy!',
    explanationUrdu: 'بہت خوب! کوڑے دان میں کچرا ڈالنے سے گٹر بند نہیں ہوتے اور بیماریاں نہیں پھیلتی!',
    rewardXP: 500,
    rewardTime: 20
  },
  {
    id: 'junior_thirsty_cat',
    category: 'animals',
    ageTier: 'junior',
    badgeId: 'animal_kindness',
    icon: '🐾',
    topic: 'Kindness to Animals / بے زبان جانوروں پر رحم',
    scenario: 'On a hot sunny Karachi afternoon, a little street kitten looks tired and thirsty.',
    scenarioUrdu: 'گرمی کی دوپہر میں ایک چھوٹی بلی پیاسی نظر آ رہی ہے۔',
    question: 'How can you show kindness to this animal?',
    questionUrdu: 'آپ اس بے زبان پر کیسے رحم کر سکتے ہیں؟',
    options: [
      {
        id: 'opt_a',
        icon: '🥣',
        text: 'Place a small bowl of clean fresh water in the shade!',
        textUrdu: 'سائے میں پانی کا صاف پیالہ رکھ دیں!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🏃',
        text: 'Throw a pebble or scare it away',
        textUrdu: 'پتھر ماریں یا بھگا دیں',
        isCorrect: false
      }
    ],
    explanation: 'Kind heart! Prophet Muhammad (PBUH) taught us to be merciful to all animals. You earned a Kindness Medal!',
    explanationUrdu: 'جزاک اللہ! جانوروں پر رحم کرنا عظیم نیکی ہے۔ اس سے دعائیں ملتی ہیں!',
    rewardXP: 500,
    rewardTime: 20
  },
  {
    id: 'junior_save_light',
    category: 'electricity',
    ageTier: 'junior',
    badgeId: 'power_saver',
    icon: '💡',
    topic: 'Saving Electricity / بجلی کی بچت',
    scenario: 'You are running out to play cricket in the street with your friends.',
    scenarioUrdu: 'آپ دوستوں کے ساتھ گلی میں کرکٹ کھیلنے جا رہے ہیں۔',
    question: 'What should you do before closing the room door?',
    questionUrdu: 'کمرے کا دروازہ بند کرنے سے پہلے کیا کریں گے؟',
    options: [
      {
        id: 'opt_a',
        icon: '💡',
        text: 'Switch off the room light, TV, and fan!',
        textUrdu: 'کمرے کی بتی، ٹی وی اور پنکھا بند کریں گے!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '⚡',
        text: 'Leave all lights and AC running in empty room',
        textUrdu: 'خالی کمرے میں سب کچھ چلتا چھوڑ دیں گے',
        isCorrect: false
      }
    ],
    explanation: 'Brilliant! Saving electricity prevents city power tripping and helps your parents save electricity bills!',
    explanationUrdu: 'شاباش! بجلی بچانے سے لوڈ شیڈنگ کم ہوتی ہے اور بل بھی کم آتا ہے!',
    rewardXP: 500,
    rewardTime: 20
  },

  // ==========================================
  // RANGER TIER (Ages 8-11)
  // ==========================================
  {
    id: 'ranger_ambulance_priority',
    category: 'ambulance',
    ageTier: 'ranger',
    badgeId: 'lifesaver',
    icon: '🚑',
    topic: 'Emergency Right of Way / ایمبولینس کو فوری راستہ',
    scenario: 'Traffic is heavy near Saddar signal, and an Edhi ambulance siren is wailing behind.',
    scenarioUrdu: 'صدر سگنل پر رش ہے اور پیچھے ایدھی ایمبولینس کا سائرن بج رہا ہے۔',
    question: 'What is our moral and legal duty as citizens?',
    questionUrdu: 'ایک اچھے شہری کا اخلاقی اور قانونی فرض کیا ہے؟',
    options: [
      {
        id: 'opt_a',
        icon: '🚑',
        text: 'Slow down, steer left safely, and clear an open lane!',
        textUrdu: 'گاڑی بائیں کر کے ایمبولینس کے لیے راستہ کھولیں!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🚗',
        text: 'Stay in the middle or race ahead to keep your spot',
        textUrdu: 'راستہ روکے رکھیں یا ایمبولینس کے آگے ریس لگائیں',
        isCorrect: false
      }
    ],
    explanation: 'Life Saver! A single minute saved can save a human life in an emergency. Never block an ambulance!',
    explanationUrdu: 'آپ نے جان بچائی! ایمبولینس کا ایک ایک سیکنڈ قیمتی ہوتا ہے۔ راستہ دینا زندگی بچانے کے برابر ہے!',
    rewardXP: 600,
    rewardTime: 25
  },
  {
    id: 'ranger_water_tanker_mafia',
    category: 'water',
    ageTier: 'ranger',
    badgeId: 'water_guardian',
    icon: '💧',
    topic: 'Water Supply Justice / پانی کا منصفانہ حق',
    scenario: 'Commercial tankers are illegally siphoning fresh water from the government neighborhood main line.',
    scenarioUrdu: 'کچھ لوگ سرکاری لائن سے غیر قانونی پانی چوری کر کے مہنگے داموں بیچ رہے ہیں۔',
    question: 'Why does illegal water pumping hurt our city?',
    questionUrdu: 'پانی کی غیر قانونی چوری سے ہمارے محلے کو کیا نقصان ہوتا ہے؟',
    options: [
      {
        id: 'opt_a',
        icon: '🚱',
        text: 'It starves nearby family homes and school taps of clean water!',
        textUrdu: 'اس سے غریب شہریوں اور اسکولوں کا پانی بند ہو جاتا ہے!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🚰',
        text: 'It helps clean the underground pipes faster',
        textUrdu: 'اس سے پائپ جلدی صاف ہوتے ہیں',
        isCorrect: false
      }
    ],
    explanation: 'Accurate! Water is a shared human right. Stopping water extortion ensures all homes receive equitable tap water.',
    explanationUrdu: 'بالکل درست! پانی سب کا بنیادی حق ہے۔ چوری روکنے سے ہر گھر کے نل میں پانی آئے گا!',
    rewardXP: 600,
    rewardTime: 25
  },
  {
    id: 'ranger_zebra_crossing',
    category: 'traffic',
    ageTier: 'ranger',
    badgeId: 'road_safety',
    icon: '🚦',
    topic: 'Zebra Crossings & Pedestrian Safety / زیبرا کراسنگ کا احترام',
    scenario: 'School children and an elder are waiting to cross at a painted white zebra crossing.',
    scenarioUrdu: 'اسکول کے بچے اور بزرگ سڑک پر زیبرا کراسنگ کے پاس کھڑے ہیں۔',
    question: 'What must drivers and bike riders do before the crossing?',
    questionUrdu: 'موٹر سائیکل اور گاڑی والوں کو کیا کرنا چاہیے؟',
    options: [
      {
        id: 'opt_a',
        icon: '🛑',
        text: 'Stop before the white stop line and let them walk across!',
        textUrdu: 'سٹاپ لائن سے پہلے گاڑی روک کر انہیں محفوظ گزرنے دیں!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🏎️',
        text: 'Honk loudly and weave around the pedestrians quickly',
        textUrdu: 'زور سے ہارن بجائیں اور لوگوں کے درمیان سے تیزی سے نکل جائیں',
        isCorrect: false
      }
    ],
    explanation: 'Awesome! Pedestrians always have the right of way at zebra crossings. Safety builds an educated society.',
    explanationUrdu: 'شاندار! پیدل چلنے والوں کو عزت اور تحفظ دینا مہذب قوم کی نشانی ہے!',
    rewardXP: 600,
    rewardTime: 25
  },
  {
    id: 'ranger_kunda_safety',
    category: 'electricity',
    ageTier: 'ranger',
    badgeId: 'power_saver',
    icon: '⚡',
    topic: 'Electrical Kunda Hazards / غیر قانونی کنڈوں کے خطرات',
    scenario: 'You see raw open wires hooked onto the overhead pole wire without a proper meter.',
    scenarioUrdu: 'آپ نے دیکھا کہ بجلی کے کھمبے پر تاریں لٹکا کر کنڈا ڈالا گیا ہے۔',
    question: 'Why are illegal kundas dangerous during Karachi monsoon rains?',
    questionUrdu: 'بارشوں میں کھلے کنڈے شہریوں کے لیے کیوں خطرناک ہیں؟',
    options: [
      {
        id: 'opt_a',
        icon: '⚠️',
        text: 'They can electrocute water puddles and ignite transformer fires!',
        textUrdu: 'بارش کے پانی میں کرنٹ آ سکتا ہے اور آگ لگ سکتی ہے!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '💡',
        text: 'They make the pole stronger against rainstorms',
        textUrdu: 'اس سے کھمبے کو طاقت ملتی ہے',
        isCorrect: false
      }
    ],
    explanation: 'Vital awareness! Unmetered kundas cause severe electrocutions and fire outbreaks. Legal connections save lives.',
    explanationUrdu: 'انتہائی اہم! ننگے تاروں سے کرنٹ لگنے کا جان لیوا خطرہ ہوتا ہے۔ قانونی میٹر ہی محفوظ حل ہے!',
    rewardXP: 600,
    rewardTime: 25
  },

  // ==========================================
  // CHAMPION TIER (Ages 12+)
  // ==========================================
  {
    id: 'champ_ocean_plastics',
    category: 'cleanliness',
    ageTier: 'champion',
    badgeId: 'clean_green',
    icon: '🌊',
    topic: 'Arabian Sea Marine Conservation / ساحل اور سمندر کا تحفظ',
    scenario: 'Plastic shopping bags tossed in storm nullahs eventually wash into Clifton Beach and Sea View.',
    scenarioUrdu: 'نالوں میں پھینکی جانے والی پلاسٹک کی تھیلیاں سمندر اور کلفٹن کے ساحل پر چلی جاتی ہیں۔',
    question: 'What is the devastating consequence on Arabian Sea marine wildlife?',
    questionUrdu: 'اس سے سمندری حیات (مچھلیوں اور کچھووں) کو کیا خطرہ ہوتا ہے؟',
    options: [
      {
        id: 'opt_a',
        icon: '🐢',
        text: 'Sea turtles and fish ingest toxic plastics and choke fatally!',
        textUrdu: 'کچھوے اور مچھلیاں پلاسٹک نگل کر بیمار ہو کر مر جاتے ہیں!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🌊',
        text: 'Plastics turn into clean sand after a few sunny days',
        textUrdu: 'پلاسٹک پانی میں گھل کر قدرتی ریت بن جاتا ہے',
        isCorrect: false
      }
    ],
    explanation: 'Champion insight! Single-use plastic persists for 400+ years. Using cloth bags and binning plastics preserves our coastal ecology.',
    explanationUrdu: 'بہترین شعور! پلاسٹک سینکڑوں سال ختم نہیں ہوتا۔ کپڑے کے تھیلے استعمال کر کے ہم سمندر کو بچا سکتے ہیں!',
    rewardXP: 750,
    rewardTime: 30
  },
  {
    id: 'champ_phone_snatching_prevention',
    category: 'safety',
    ageTier: 'champion',
    badgeId: 'smart_citizen',
    icon: '📱',
    topic: 'Street Smartness & Crime Deterrence / سڑکوں پر ہوشیاری اور حفاظت',
    scenario: 'You are waiting at a busy bus stop on University Road after evening classes.',
    scenarioUrdu: 'شام کے وقت آپ یونیورسٹی روڈ پر بس سٹاپ پر کھڑے ہیں۔',
    question: 'What is the smartest self-defense habit against opportunistic street snatchers?',
    questionUrdu: 'موبائل چھیننے والوں سے بچاؤ کا سب سے عقل مندانہ طریقہ کیا ہے؟',
    options: [
      {
        id: 'opt_a',
        icon: '👀',
        text: 'Keep phone concealed in zippered pocket and stay aware of your surroundings!',
        textUrdu: 'موبائل جیب کے اندر رکھیں اور اپنے اردگرد کے ماحول سے باخبر رہیں!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🎧',
        text: 'Wear noise-canceling headphones and text while looking down into the dark',
        textUrdu: 'کانوں میں ہیڈفون لگا کر اندھیرے میں فون میں مگن رہیں',
        isCorrect: false
      }
    ],
    explanation: 'Smart thinking! Situational awareness deters 90% of opportunistic street criminals. Staying alert keeps youth safe.',
    explanationUrdu: 'بہترین حکمت عملی! الرٹ رہنے والے شہریوں کو نشانہ بنانا آسان نہیں ہوتا۔ ہوشیار رہیں، محفوظ رہیں!',
    rewardXP: 750,
    rewardTime: 30
  },
  {
    id: 'champ_urban_heat_trees',
    category: 'cleanliness',
    ageTier: 'champion',
    badgeId: 'clean_green',
    icon: '🌳',
    topic: 'Combatting Urban Heat Islands / کراچی میں شجرکاری کی اہمیت',
    scenario: 'Karachi experiences intense June heatwaves due to concrete roads trapping solar heat.',
    scenarioUrdu: 'کراچی میں کنکریٹ کی عمارتوں کی وجہ سے شدید ہیٹ ویو اور گرمی کا سامنا کرنا پڑتا ہے۔',
    question: 'Which civic action creates permanent cooling and oxygen for our future?',
    questionUrdu: 'ہماری آنے والی نسلوں کے لیے شہر کو ٹھنڈا رکھنے کا بہترین پائیدار عمل کیا ہے؟',
    options: [
      {
        id: 'opt_a',
        icon: '🌳',
        text: 'Plant indigenous deep-root trees like Neem, Peepal, and Gulmohar!',
        textUrdu: 'نیم، پیپل اور گل مہر جیسے مقامی گھنے درخت لگائیں!',
        isCorrect: true
      },
      {
        id: 'opt_b',
        icon: '🏗️',
        text: 'Cut down existing roadside trees to build more parking lots',
        textUrdu: 'درخت کاٹ کر مزید کنکریٹ بچھا دیں',
        isCorrect: false
      }
    ],
    explanation: 'Visionary Citizen! Neem trees can drop local street temperatures by 4°C to 7°C naturally and bring back singing birds.',
    explanationUrdu: 'شاندار بصیرت! ایک گھنا نیم کا درخت قدرتی ائیرکنڈیشنر کی طرح درجہ حرارت کم کرتا ہے اور پرندوں کو واپس لاتا ہے!',
    rewardXP: 750,
    rewardTime: 30
  }
];

// Helper methods for retrieving tailored challenges
export function getChallengesByTier(ageTier = 'junior') {
  return EDUCATIONAL_CHALLENGES.filter(c => c.ageTier === ageTier);
}

export function getChallengeByCategoryAndTier(category, ageTier = 'junior') {
  const matching = EDUCATIONAL_CHALLENGES.filter(
    c => c.ageTier === ageTier && (c.category === category || !category)
  );
  if (matching.length > 0) {
    return matching[Math.floor(Math.random() * matching.length)];
  }
  // Fallback to any challenge in this tier
  const tierChallenges = getChallengesByTier(ageTier);
  return tierChallenges[Math.floor(Math.random() * tierChallenges.length)];
}

export function getRandomChallenge(ageTier = 'junior', excludeIds = []) {
  const available = EDUCATIONAL_CHALLENGES.filter(
    c => c.ageTier === ageTier && !excludeIds.includes(c.id)
  );
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  // Reset if all seen
  const allTier = getChallengesByTier(ageTier);
  return allTier[Math.floor(Math.random() * allTier.length)];
}
