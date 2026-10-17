/**
 * Karachi Street Action - Interactive Citizen Dialogue System
 * Culturally authentic, bilingual conversations with local Karachi citizens,
 * street vendors, public service workers, elders, and youth.
 */

export const CITIZEN_DIALOGUES = {
  uncle_shamim: {
    id: 'uncle_shamim',
    name: 'Uncle Shamim',
    urduName: 'انکل شمیم (چائے والے)',
    role: 'Traditional Chai Dhaba Master',
    neighborhood: 'Burns Road Food Street',
    avatarEmoji: '☕',
    avatarColor: '#d84315',
    dialogue: {
      greetingEn: "Assalam-o-Alaikum, Beta! Running hard in this Karachi heat? Have a sip of hot doodh patti chai on the house!",
      greetingUrdu: "السلام علیکم بیٹا! اتنی گرمی میں گشت؟ آؤ کڑک دودھ پتی چائے کا گھونٹ پیو!",
      greetingRoman: "Assalam-o-Alaikum beta! Garam doodh patti chai peeo!",
      choices: [
        {
          id: 'c1',
          textEn: "Thank you Uncle! Any news about street problems around here?",
          textUrdu: "شکریہ انکل! علاقے میں کیا مسائل چل رہے ہیں؟",
          responseEn: "Listen carefully: some illegal water tankers were siphoning freshwater lines down Tariq Road, and there are deep potholes slowing traffic. Report them to KMC and stay safe!",
          responseUrdu: "طارق روڈ پر غیر قانونی ٹینکر پانی چوری کر رہے تھے اور گہرے گڑھے ہیں۔ کے ایم سی کو بتاؤ اور محفوظ رہو!",
          civicTip: "💡 Road craters damage vehicles and delay ambulances; always report broken infrastructure!",
          xpBonus: 80
        },
        {
          id: 'c2',
          textEn: "How long have you been brewing tea on Burns Road?",
          textUrdu: "آپ کتنے سالوں سے یہاں چائے بنا رہے ہیں؟",
          responseEn: "Over 35 years! Karachi's heart beats on Burns Road. When our streets are clean and peaceful, everyone's business thrives!",
          responseUrdu: "پینتیس سال سے! جب ہماری سڑکیں صاف اور پرامن ہوتی ہیں تو سب کی روزی میں برکت ہوتی ہے!",
          civicTip: "🌿 Throwing trash in green municipal bins prevents drain choking during monsoon downpours!",
          xpBonus: 60
        }
      ]
    }
  },

  baji_fatima: {
    id: 'baji_fatima',
    name: 'Baji Fatima',
    urduName: 'باجی فاطمہ (محلہ بزرگ)',
    role: 'PECHS Neighborhood Elder & Community Mother',
    neighborhood: 'PECHS Block 2',
    avatarEmoji: '🧕',
    avatarColor: '#2e7d32',
    dialogue: {
      greetingEn: "Jeetay raho, beta! May Allah protect our city's youth! We were praying for someone to stop the water tanker mafia extortion!",
      greetingUrdu: "جیتے رہو بیٹا! اللہ ہمارے نوجوانوں کو سلامت رکھے۔ ہم دعا کر رہے تھے کہ کوئی پانی چوری مافیا کو روکے!",
      greetingRoman: "Jeetay raho beta! Tanker mafia se hamari جان چھڑاؤ!",
      choices: [
        {
          id: 'c1',
          textEn: "Did tap water return to your home after we cleared the tanker?",
          textUrdu: "کیا ٹینکر رکنے کے بعد آپ کے گھر پانی آیا؟",
          responseEn: "Yes, Alhamdullilah! Sweet municipal water is flowing into our underground water tank again! May you live long!",
          responseUrdu: "الحمدللہ! میٹھا سرکاری پانی ہمارے ٹینک میں دوبارہ بھر رہا ہے۔ اللہ تمہیں لمبی زندگی دے!",
          civicTip: "💧 Turning off leaking courtyard taps saves over 20 liters of freshwater daily for Karachi homes!",
          xpBonus: 100
        },
        {
          id: 'c2',
          textEn: "How can neighborhood residents help protect street safety?",
          textUrdu: "محلے کے لوگ سڑکوں کو محفوظ بنانے کے لیے کیا کریں؟",
          responseEn: "Work together! Keep bright lights outside your boundary gates, coordinate with mohalla watchmen, and watch out for schoolchildren!",
          responseUrdu: "مل جل کر کام کرو! گلیوں میں لائٹیں روشن رکھو اور بچوں کا خیال رکھو!",
          civicTip: "📹 Illuminated street corners and community solidarity deter petty theft by over 60%!",
          xpBonus: 75
        }
      ]
    }
  },

  ustad_kareem: {
    id: 'ustad_kareem',
    name: 'Ustad Kareem',
    urduName: 'استاد کریم (رکشہ ڈرائیور)',
    role: 'Karachi Auto-Rickshaw Captain',
    neighborhood: 'Saddar Bazaar Corridor',
    avatarEmoji: '🛺',
    avatarColor: '#fbc02d',
    dialogue: {
      greetingEn: "Arey Hero sahab! Meter down hai! Where do you want to ride in Karachi? Saddar traffic is intense today!",
      greetingUrdu: "ارے ہیرو صاحب! میٹر ڈاؤن ہے۔ صدر میں آج بڑا ٹریفک جام ہے!",
      greetingRoman: "Hero sahab! Saddar traffic jam se ambulance nikalwao!",
      choices: [
        {
          id: 'c1',
          textEn: "What causes the worst traffic jams in Saddar?",
          textUrdu: "صدر میں سب سے زیادہ ٹریفک کیوں پھنستی ہے؟",
          responseEn: "VIP protocol convoys and double parking! When big Land Cruisers block lanes, even Edhi ambulances get trapped with critical patients!",
          responseUrdu: "وی آئی پی پروٹوکول اور ڈبل پارکنگ! جب بڑی گاڑیاں راستہ روکتی ہیں تو ایمبولینس بھی پھنس جاتی ہے!",
          civicTip: "🚑 Emergency ambulances with sirens ALWAYS have 100% legal right of way over protocol convoys!",
          xpBonus: 90
        },
        {
          id: 'c2',
          textEn: "Any tips for driving safely around Karachi roads?",
          textUrdu: "کراچی کی سڑکوں پر حفاظت سے چلنے کا کوئی مشورہ؟",
          responseEn: "Always signal before turning, never one-wheel on motorbikes, and never block pedestrian zebra crossings!",
          responseUrdu: "موڑ کا اشارہ دو، ون ویلنگ مت کرو اور زیبرا کراسنگ پر مت رکو!",
          civicTip: "🚸 Stopping behind pedestrian zebra lines allows students and elders to cross safely!",
          xpBonus: 70
        }
      ]
    }
  },

  inspector_farooq: {
    id: 'inspector_farooq',
    name: 'Sub-Inspector Farooq',
    urduName: 'سب انسپکٹر فاروق',
    role: 'Karachi Traffic Police Officer',
    neighborhood: 'Shahrah-e-Faisal Expressway',
    avatarEmoji: '👮',
    avatarColor: '#1565c0',
    dialogue: {
      greetingEn: "Patrol Officer Farooq reporting! Thank you for maintaining civic order on Karachi avenues, citizen hero!",
      greetingUrdu: "ٹریفک پولیس حاضر ہے! کراچی کی شاہراہوں پر نظم و ضبط قائم رکھنے پر شکریہ!",
      greetingRoman: "Patrol Officer Farooq! Safe driving saves lives!",
      choices: [
        {
          id: 'c1',
          textEn: "Officer, how do we stop reckless one-wheelers?",
          textUrdu: "افسر، ون ویلنگ اور تیز رفتاری کو کیسے روکیں؟",
          responseEn: "We strictly impound bikes and educate parents. Wearing a certified helmet reduces fatal trauma risk by 70%. Never risk life for cheap thrills!",
          responseUrdu: "ہم چالان کرتے ہیں۔ ہیلمٹ پہننے سے سر کی چوٹ کا خطرہ ستر فیصد کم ہو جاتا ہے!",
          civicTip: "🪖 Certified safety helmets with secure chin straps are mandatory for rider and passenger safety!",
          xpBonus: 85
        },
        {
          id: 'c2',
          textEn: "What number should citizens call in emergency?",
          textUrdu: "ہنگامی صورت میں شہری کس نمبر پر رابطہ کریں؟",
          responseEn: "Call Madadgar 15 immediately for rapid police dispatch, and CPLC 1102 for mobile IMEI blocking!",
          responseUrdu: "فوری پولیس مدد کے لیے 15 ڈائل کریں اور موبائل بلاکنگ کے لیے سی پی ایل سی 1102!",
          civicTip: "📞 Madadgar 15 is Karachi Police 24/7 dedicated helpline for rapid assistance!",
          xpBonus: 80
        }
      ]
    }
  },

  dr_alvi: {
    id: 'dr_alvi',
    name: 'Dr. Zainab Alvi',
    urduName: 'ڈاکٹر زینب علوی',
    role: 'Civil Hospital Emergency Trauma Specialist',
    neighborhood: 'Emergency Corridor',
    avatarEmoji: '🩺',
    avatarColor: '#00897b',
    dialogue: {
      greetingEn: "Doctor Alvi here! Every single second counts when an ambulance is rushing a critical patient to Civil Hospital emergency!",
      greetingUrdu: "ڈاکٹر علوی بات کر رہی ہوں۔ جب ایمبولینس ہسپتال آ رہی ہو تو ہر سیکنڈ قیمتی ہوتا ہے!",
      greetingRoman: "Dr. Alvi here! Thank you for clearing the emergency corridor!",
      choices: [
        {
          id: 'c1',
          textEn: "How can citizens help ambulances reach the hospital in time?",
          textUrdu: "شہری ایمبولینس کو بروقت ہسپتال پہنچانے میں کیسے مدد کریں؟",
          responseEn: "The moment you hear sirens, safely merge to the left curb to create an emergency center lane. That golden minute saves a beating heart!",
          responseUrdu: "جیسے ہی سائرن سنو، بائیں طرف ہٹ کر راستہ دو۔ وہ ایک منٹ مریض کی جان بچا لیتا ہے!",
          civicTip: "🚨 Creating an emergency rescue corridor saves lives every single day across Karachi!",
          xpBonus: 100
        }
      ]
    }
  }
};

export function getDialogueById(citizenId) {
  return CITIZEN_DIALOGUES[citizenId] || CITIZEN_DIALOGUES.uncle_shamim;
}

export const dialogueSystem = {
  getDialogueById,
  CITIZEN_DIALOGUES
};
