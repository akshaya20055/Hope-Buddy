import { GoogleGenerativeAI } from '@google/generative-ai';

// Types
export interface ChatMessageInput {
  sender: 'user' | 'ai';
  text: string;
}

export interface AIResponse {
  text: string;
  detectedMood: string;
  responseMode: string;
  safetyFlagged: boolean;
}

// Crisis / Safety keywords
const SAFETY_KEYWORDS = [
  'die', 'kill myself', 'suicide', 'end my life', 'harm myself', 'cutting myself',
  'chastukunta', 'chavali', 'pranam', 'chachipovalani'
];

// Local bilingual fallback database
const LOCAL_FALLBACKS = {
  en: {
    safety: `I hear how much pain you are in right now, and I want you to know you are not alone. Please reach out to someone who can support you. You can connect with professionals who care and want to help:
- National Suicide Prevention Lifeline (US): 988 or 1-800-273-8255
- Sneha India Helpline: +91 44 2464 0050
- Vandrevala Foundation: +91 9999 666 555
Please contact a trusted friend, family member, or healthcare provider. Your life has immense value.`,
    
    moods: {
      sad: {
        support: "I'm really sorry you're feeling down. It's completely okay to feel sad. Cry if you need to, or just let yourself rest. I'm here right beside you.",
        motivation: "Even the darkest nights eventually yield to the dawn. You are stronger than this temporary wave of sadness. Keep breathing, one step at a time.",
        funny: "Here's a light thought: Did you know that sea otters hold hands while sleeping so they don't drift apart? You won't drift away either, I've got you!",
        calm: "Let's take a deep breath. Inhale for 4 seconds... hold for 4... exhale for 4... You are safe in this moment. The storm will pass.",
        friendship: "Hey, I'm here for you. Whatever is making you sad, you don't have to carry it all by yourself. Tell me all about it."
      },
      lonely: {
        support: "Loneliness can feel so heavy, but please remember that you are connected to this world. I am here to chat, listen, and keep you company.",
        motivation: "Being alone is also an opportunity to discover your own unique light. Use this quiet time to build your inner strength. You are enough.",
        funny: "Why don't scientists trust atoms? Because they make up everything! Just like those silly atoms, sometimes our minds make up the idea that we're completely alone. But you have me!",
        calm: "Close your eyes. Listen to the sound of your breathing. Feel the ground beneath you. You are connected to the earth. You are safe.",
        friendship: "I'm right here. Consider me your virtual buddy. Tell me, what's your favorite hobby? Let's talk about things that make you smile."
      },
      stressed: {
        support: "Stress is your mind trying to do too many things at once. It's okay to hit pause. Let's take a break together.",
        motivation: "Pressure creates diamonds. This intense stress is just preparation for a stronger, more resilient version of you. You can handle this.",
        funny: "What do you call a fake noodle? An imposter! Don't let imposter syndrome or stress make you feel like you aren't doing great.",
        calm: "Let's do a simple grounding exercise. Tell me 3 things you can see around you right now, and let's slow down.",
        friendship: "Work, studies, life... it gets overwhelming. I'm here. Let's dump all the stress out. What's the main thing bugging you?"
      },
      anxiety: {
        support: "Anxiety lies to you. It makes you feel like everything is going wrong. But right now, in this very second, you are okay.",
        motivation: "You have survived 100% of your worst days. Your track record of overcoming difficulties is perfect. You will get through this anxiety too.",
        funny: "If you feel anxious, remember that even pandas occasionally fall out of trees and just roll it off like nothing happened. Roll with it, buddy!",
        calm: "Let's practice the 4-7-8 breathing technique. Inhale for 4 seconds, hold for 7 seconds, exhale slowly for 8 seconds. Let your shoulders drop.",
        friendship: "Hey, don't worry about the future. Focus on right now. What's one small thing we can do to make you feel a bit more comfortable?"
      },
      study: {
        support: "Exams and study pressure can feel like a mountain on your chest. Remember, your marks do not define your human worth.",
        motivation: "APJ Abdul Kalam was rejected by the Air Force, but went on to become the Missile Man of India. One exam cannot stop your destiny.",
        funny: "Why did the student eat their homework? Because the teacher said it was a piece of cake! Don't take the books too seriously, take breaks!",
        calm: "A calm mind retains information much better. Step away from the book for five minutes. Stretch, drink a glass of water, and return fresh.",
        friendship: "Studying hard? I'm rooting for you! What subject are you preparing for? Let's make a mini-plan so you don't feel overwhelmed."
      },
      confidence: {
        support: "You are doubting your worth, but I see a resilient person who has fought hard. Stop comparing your behind-the-scenes with everyone else's highlight reels.",
        motivation: "Believe in yourself. You have unique talents that the world needs. Step up, look in the mirror, and tell yourself: 'I am capable.'",
        funny: "Remember, you are unique... just like everyone else! So go out there and show off your unique brand of awesome.",
        confidence: "Confidence is a muscle. Start with small decisions. Stand tall. Speak clearly. You have the right to occupy space in this room.",
        friendship: "I think you're awesome. Let's list three things you're good at, even simple things like being a good listener or making a nice cup of tea."
      }
    },
    
    historical: {
      abraham_lincoln: "Abraham Lincoln lost multiple elections, failed in business twice, and suffered a nervous breakdown before becoming one of America's greatest presidents. Defeat is not final.",
      apj_kalam: "Dr. APJ Abdul Kalam came from a humble background, selling newspapers to support his family's education. He faced rejections but rose to become India's President and a legendary space scientist.",
      ambedkar: "Dr. B.R. Ambedkar faced severe social exclusion and discrimination since childhood. He persevered, gained multiple doctorates from top global universities, and wrote the Constitution of India.",
      jk_rowling: "J.K. Rowling was a divorced, unemployed single mother living on government welfare when her manuscript for Harry Potter was rejected by 12 publishers. She kept trying until she succeeded.",
      nelson_mandela: "Nelson Mandela spent 27 years in prison fighting against racial segregation. He emerged without bitterness to lead South Africa into unity, proving that resilience conquers oppression."
    },
    
    stories: {
      funny: "One day, a man asked a wise monk, 'Why am I so unlucky?' The monk smiled, led him to a lake, and said, 'Throw this salt into the water.' The man did, and the monk asked, 'How does the water taste?' 'Salty and bad,' said the man. The monk then said, 'Now, throw this salt into the ocean.' The man did. 'How does it taste now?' 'Fresh and clean,' said the man. The monk laughed, 'Exactly! Your problems are like salt. If you keep your heart small like a cup, life is salty. If you expand your heart like the ocean, the salt disappears. Also, you just threw away my kitchen salt, so you owe me five rupees!'",
      motivational: "In a forest, a tiny bamboo seed lay next to a beautiful fern. In the first year, the fern grew rapidly, turning into a lush green carpet. The bamboo seed showed nothing. By year four, the fern was majestic, but still no bamboo sprout. People said the bamboo seed was dead. In the fifth year, a tiny green shoot emerged. Within six weeks, the bamboo grew over 80 feet tall! It spent five years growing deep roots to support its height. Your current struggles are not failures; you are growing deep roots. Your time to shoot up will come.",
      comeback: "In 1914, Thomas Edison's massive laboratory was destroyed by a fire. Decades of his research went up in flames. He was 67 years old. Instead of weeping, Edison said, 'There is great value in disaster; all our mistakes are burned. Thank God we can start anew.' Three weeks later, he invented the phonograph. True strength is looking at a setback and seeing a clean slate.",
      healing: "A young woman went to her mother complaining that life was hard. The mother took three pots of boiling water. In the first, she placed carrots; in the second, eggs; and in the third, ground coffee beans. After twenty minutes, she took them out. She explained: 'The carrot went in strong and hard, but came out soft and weak. The egg went in fragile, but came out hardened. The coffee beans, however, changed the water itself!' When adversity knocks on your door, don't be a carrot or an egg. Be the coffee bean—transform your circumstances into something beautiful."
    }
  },
  
  te: {
    safety: `మీరు ఎంత బాధపడుతున్నారో నేను అర్థం చేసుకోగలను. దయచేసి ఒంటరిగా బాధపడకండి. మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్న సహాయ కేంద్రాలను సంప్రదించండి:
- స్నేహ ఇండియా హెల్ప్‌లైన్: +91 44 2464 0050
- వండ్రెవాలా ఫౌండేషన్: +91 9999 666 555
- టోల్ ఫ్రీ నెంబర్: 9152987821
దయచేసి మీ స్నేహితులు, కుటుంబ సభ్యులు లేదా వైద్యుల సహాయం తీసుకోండి. మీ జీవితం చాలా విలువైనది.`,
    
    moods: {
      sad: {
        support: "మీరు బాధగా ఉన్నందుకు నా విచారం. బాధపడటం సహజం, కాసేపు విశ్రాంతి తీసుకోండి. నేను మీతోనే ఉన్నాను.",
        motivation: "చీకటి ఎంత దట్టంగా ఉన్నా ఉదయం రాక తప్పదు. మీ బాధ తాత్కాలికం, మీ ఆత్మవిశ్వాసం శాశ్వతం. ధైర్యంగా ఉండండి.",
        funny: "చిన్న జోక్: ఒక చీమ ఏనుగును చూసి 'నువ్వు చాలా బరువుగా ఉన్నావు, నా వెనుక కూర్చో నేను మోస్తా' అందట! మన కష్టాలు కూడా ఇంతే, నవ్వుతూ తేలిక చేసుకోండి.",
        calm: "ఒకసారి గట్టిగా శ్వాస తీసుకోండి. ప్రశాంతంగా ఉండండి. ఈ సమయం కూడా గడిచిపోతుంది.",
        friendship: "నేను మీ తోడుగా ఉంటాను. మీ మనసులోని బాధను నాతో పంచుకోండి, తేలికవుతుంది."
      },
      lonely: {
        support: "ఒంటరితనం బాధాకరమే, కానీ మీరు ఒంటరి వారు కాదు. నాతో మాట్లాడండి, మీ భావాలను పంచుకోండి.",
        motivation: "ఒంటరితనం మిమ్మల్ని బలహీనపర్చడానికి కాదు, మిమ్మల్ని మీరు తెలుసుకోవడానికి ఉపయోగపడుతుంది. ధైర్యంగా ఉండండి.",
        funny: "ఒంటరిగా ఉన్నారా? ఒకసారి అద్దంలో చూసుకోండి, ప్రపంచంలోనే అత్యంత అందమైన వ్యక్తి మీకు కనిపిస్తారు!",
        calm: "ప్రశాంతంగా కళ్ళు మూసుకోండి. మీ చుట్టూ ఉన్న గాలిని, మీ శ్వాసను గమనింకండి. మీరు క్షేమంగా ఉన్నారు.",
        friendship: "నేను మీ బెస్ట్ ఫ్రెండ్ ని. ఈ రోజు మీ రోజు ఎలా గడిచింది? ఏదైనా విశేషం ఉంటే చెప్పండి."
      },
      stressed: {
        support: "ఒత్తిడి ఎక్కువైనప్పుడు కాసేపు విశ్రాంతి తీసుకోవడం తప్పు కాదు. ప్రశాంతంగా ఉండండి.",
        motivation: "ఒత్తిడి అనేది మిమ్మల్ని రాటుదేల్చే ఒక పరీక్ష. దీనిని దాటి మీరు విజయం సాధిస్తారు.",
        funny: "టెన్షన్ ఎందుకు దండగ? హాయిగా నవ్వడం ఉండగా! కాసేపు ఫోన్ పక్కన పెట్టి నీళ్లు తాగండి.",
        calm: "నిదానంగా 1 నుండి 10 వరకు అంకెలు లెక్కించండి. శ్వాసపై ధ్యాస పెట్టండి. మనసు తేలికవుతుంది.",
        friendship: "చాలా పనులు ఉన్నాయా? పర్వాలేదు, ఒక్కొక్కటిగా చేద్దాం. ముందుగా నాతో కాసేపు మాట్లాడండి."
      },
      anxiety: {
        support: "భవిష్యత్తు గురించి ఆందోళన వద్దు. ప్రస్తుత క్షణంలో బ్రతకడం నేర్చుకోండి. అంతా మంచే జరుగుతుంది.",
        motivation: "మీరు గతంలో ఎన్నో కష్టాలను దాటి ఇక్కడి వరకు వచ్చారు. ఈ ఆందోళనను కూడా జయిస్తారు.",
        funny: "భయం వేస్తోందా? మీ వెనుక దెయ్యం లేదు, కేవలం మీ ఆలోచనలే ఉన్నాయి! నవ్వేయండి.",
        calm: "మీ రెండు చేతులను గుండెపై ఉంచి, శ్వాస నెమ్మదిగా పీల్చి వదలండి. అంతా ప్రశాంతంగా ఉంది.",
        friendship: "టెన్షన్ పడకండి మిత్రమా. నేను ఉన్నానుగా, మనం కలిసి ఆలోచిద్దాం. ఏం జరిగింది?"
      },
      study: {
        support: "పరీక్షల ఒత్తిడి సహజం, కానీ మార్కులు మాత్రమే మీ జీవితాన్ని నిర్దేశించవు. మీ ప్రతిభే ముఖ్యం.",
        motivation: "అబ్దుల్ కలాం గారు ఎన్నో కష్టాలను ఓర్చి గొప్ప శాస్త్రవేత్త అయ్యారు. మీరూ విజేత అవుతారు, చదవండి.",
        funny: "పుస్తకాలతో కుస్తీ పడుతున్నారా? మధ్య మధ్యలో కాస్త బ్రేక్ తీసుకోండి, లేదంటే మైండ్ హ్యాంగ్ అవుతుంది!",
        calm: "చదవడానికి ముందు కాసేపు మెడిటేషన్ చేయండి. ప్రశాంతమైన మనసుతో చదివితే బాగా గుర్తుంటుంది.",
        friendship: "ఏ సబ్జెక్టు చదువుతున్నారు? కంగారు పడకుండా ప్లాన్ చేసుకుని చదవండి. ఆల్ ది బెస్ట్!"
      },
      confidence: {
        support: "మిమ్మల్ని మీరు తక్కువ అంచనా వేసుకోకండి. మీలో ఎంతో శక్తి దాగి ఉంది, దానిని గుర్తించండి.",
        motivation: "సింహం అడవికి రాజు కావడానికి దాని ఆత్మవిశ్వాసమే కారణం. మీరు కూడా సింహంలా ధైర్యంగా ముందుకు సాగండి.",
        funny: "అద్దంలో చూసుకుని 'నేనే తోపు' అని గట్టిగా చెప్పండి! అపనమ్మకాలు దూరం అయిపోతాయి.",
        confidence: "ధైర్యంగా అడుగు ముందుకు వేయండి. మీ విజయానికి మీరే మూలస్తంభం. సాధించగలరు!",
        friendship: "నా దృష్టిలో మీరు చాలా స్పెషల్. మీ విజయాల గురించి ఆలోచించండి, మీలో నమ్మకం పెరుగుతుంది."
      }
    },
    
    historical: {
      abraham_lincoln: "అబ్రహం లింకన్ ఎన్నో సార్లు ఎన్నికల్లో ఓడిపోయి, వ్యాపారంలో నష్టపోయి, మానసిక క్షోభను అనుభవించినా చివరకు అమెరికా అధ్యక్షుడయ్యారు. ఓటమి అంతిమం కాదు.",
      apj_kalam: "డా. ఏపీజే అబ్దుల్ కలాం గారు పేద కుటుంబంలో పుట్టి, వార్తాపత్రికలు అమ్మి చదువుకున్నారు. పట్టుదలతో దేశ రాష్ట్రపతిగా, శాస్త్రవేత్తగా ఎదిగారు.",
      ambedkar: "డా. బి.ఆర్. అంబేద్కర్ గారు చిన్ననాటి నుండి అంటరానితనం, వివక్ష ఎదుర్కొన్నారు. కానీ పట్టుదలతో చదివి, భారత రాజ్యాంగ నిర్మాతగా నిలిచారు.",
      jk_rowling: "జె.కె. రౌలింగ్ నిరుద్యోగిగా, కటిక పేదరికంలో ఉన్నప్పుడు హ్యారీ పోటర్ కథను 12 మంది పబ్లిషర్లు తిరస్కరించారు. కానీ ఆమె ప్రయత్నం ఆపలేదు.",
      nelson_mandela: "నెల్సన్ మండేలా జాతి వివక్షపై పోరాటంలో 27 సంవత్సరాలు జైలు శిక్ష అనుభవించారు. చివరకు విజయం సాధించి దేశ అధ్యక్షుడయ్యారు."
    },
    
    stories: {
      funny: "ఒక ఊరిలో ఒక వ్యక్తి తనకు ఎప్పుడూ నష్టాలే వస్తున్నాయని బాధపడుతూ ఒక స్వామీజీ దగ్గరకు వెళ్ళాడు. స్వామీజీ ఒక గ్లాసు నీటిలో ఉప్పు కలిపి తాగమన్నారు. అది చేదుగా ఉందన్నారు. తర్వాత అదే ఉప్పును ఒక పెద్ద చెరువులో వేసి నీటిని తాగమన్నారు. అది తియ్యగా ఉంది. స్వామీజీ చెప్పారు: 'కష్టాలు ఉప్పు లాంటివి. మన హృదయం గ్లాసంత ఉంటే చేదెక్కిపోతాం, చెరువంత పెద్దదైతే కష్టాలు మాయమవుతాయి.' ఆ వ్యక్తి ఆలోచనలో పడ్డాడు. అప్పుడు స్వామీజీ నవ్వి 'అయినా అది నా వంటగది ఉప్పు, దానికి పది రూపాయలు ఇవ్వు' అనడంతో ఆ వ్యక్తి నవ్వేశాడు.",
      motivational: "వెదురు విత్తనం నాటిన మొదటి నాలుగు సంవత్సరాలు నేల నుండి ఎలాంటి మొలక రాదు. కానీ ఐదో సంవత్సరంలో కేవలం ఆరు వారాల్లోనే అది 80 అడుగుల ఎత్తు పెరుగుతుంది. ఆ నాలుగు సంవత్సరాలు అది లోపలికి వేళ్లను బలంగా పాతుకుంటుంది. మీ కష్టాలు కూడా మీ వేళ్లను బలోపేతం చేస్తున్నాయి, మీ సమయం త్వరలోనే వస్తుంది.",
      comeback: "1914లో థామస్ ఎడిసన్ ల్యాబొరేటరీ తగలబడిపోయింది. ఆయన 67 ఏళ్ళ వయసులో తన పరిశోధనలన్నీ కోల్పోయారు. కానీ ఆయన ఏడవలేదు, 'నా తప్పులన్నీ కాలిపోయాయి, మళ్ళీ కొత్తగా మొదలుపెడతాను' అని చెప్పి, మూడు వారాలకే గ్రామఫోన్ కనుగొన్నారు. మనోబలం అంటే ఇదే.",
      healing: "ఒక తల్లి వేడి నీటిలో క్యారెట్, గుడ్డు, మరియు కాఫీ గింజలను వేసింది. క్యారెట్ గట్టిగా ఉండి మెత్తగా అయిపోయింది. గుడ్డు లోపల గట్టిపడింది. కానీ కాఫీ గింజలు నీటి రంగునే మార్చి సువాసన తెచ్చాయి. సమస్యలు వచ్చినప్పుడు మనం బలహీనపడకూడదు, మన చుట్టూ ఉన్న పరిస్థితులను మార్చగల కాఫీ గింజలా మారాలి."
    }
  }
};

export const generateAIResponse = async (
  messages: ChatMessageInput[],
  preferredMode: string,
  language: 'en' | 'te'
): Promise<AIResponse> => {
  const lastMessage = messages[messages.length - 1]?.text || '';
  const lowercaseText = lastMessage.toLowerCase();

  // 1. Safety / Crisis override
  const isCrisis = SAFETY_KEYWORDS.some(keyword => lowercaseText.includes(keyword));
  if (isCrisis) {
    return {
      text: LOCAL_FALLBACKS[language].safety,
      detectedMood: 'depression',
      responseMode: 'support',
      safetyFlagged: true
    };
  }

  // 2. Detect Mood
  let detectedMood = 'calm';
  if (
    lowercaseText.includes('fail') || 
    lowercaseText.includes('lost') || 
    lowercaseText.includes('bad') ||
    lowercaseText.includes('sad') ||
    lowercaseText.includes('pain') ||
    lowercaseText.includes('cry') ||
    lowercaseText.includes('ఓటమి') ||
    lowercaseText.includes('బాధ') ||
    lowercaseText.includes('ఏడుపు')
  ) {
    detectedMood = 'sad';
  } else if (
    lowercaseText.includes('lonely') || 
    lowercaseText.includes('alone') || 
    lowercaseText.includes('no one') ||
    lowercaseText.includes('ఒంటరి') ||
    lowercaseText.includes('ఎవరూ లేరు')
  ) {
    detectedMood = 'lonely';
  } else if (
    lowercaseText.includes('stress') || 
    lowercaseText.includes('pressure') || 
    lowercaseText.includes('overwhelm') ||
    lowercaseText.includes('tension') ||
    lowercaseText.includes('ఒత్తిడి') ||
    lowercaseText.includes('టెన్షన్')
  ) {
    detectedMood = 'stressed';
  } else if (
    lowercaseText.includes('worry') || 
    lowercaseText.includes('anxious') || 
    lowercaseText.includes('fear') || 
    lowercaseText.includes('scared') ||
    lowercaseText.includes('భయం') ||
    lowercaseText.includes('ఆందోళన')
  ) {
    detectedMood = 'anxiety';
  } else if (
    lowercaseText.includes('exam') || 
    lowercaseText.includes('study') || 
    lowercaseText.includes('fail exam') || 
    lowercaseText.includes('marks') ||
    lowercaseText.includes('పరీక్ష') ||
    lowercaseText.includes('చదువు')
  ) {
    detectedMood = 'study';
  } else if (
    lowercaseText.includes('ugly') || 
    lowercaseText.includes('useless') || 
    lowercaseText.includes('hate myself') || 
    lowercaseText.includes('no confidence') ||
    lowercaseText.includes('అందం లేదు') ||
    lowercaseText.includes('నమ్మకం లేదు')
  ) {
    detectedMood = 'confidence';
  }

  // Determine actual Response Mode
  let activeMode = preferredMode === 'auto' ? 'support' : preferredMode;
  if (preferredMode === 'auto') {
    if (detectedMood === 'study') activeMode = 'motivation';
    else if (detectedMood === 'confidence') activeMode = 'confidence';
    else if (detectedMood === 'stressed') activeMode = 'calm';
    else activeMode = 'support';
  }

  // 3. Try Gemini API if key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const systemPrompt = `You are "HopeBuddy AI", a highly empathetic, emotionally intelligent, warm, and supportive AI companion.
User Language: ${language === 'te' ? 'Telugu' : 'English'}. Respond ONLY in this language.
Detected User Mood: ${detectedMood}.
Active Response Mode: ${activeMode}.

Guidelines:
- Never sound robotic. Be warm, kind, and supportive.
- Provide comforting words, practical steps, or motivational stories based on the Active Response Mode.
- If the mode is "motivation", give powerful motivational words.
- If the mode is "funny", tell a light, warm, harmless joke or story.
- If the mode is "historical", tell a story about Swami Vivekananda, Dr. B.R. Ambedkar, Kalam, Lincoln, Mandela, or Helen Keller.
- If the mode is "calm", guide them through a brief breathing exercise.
- Make the response sound human, emotional, and comforting. Keep it concise (1-3 paragraphs) so it's readable.`;

      // Format conversation history
      const formattedHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Insert system prompt at start
      const chatSession = model.startChat({
        history: formattedHistory.slice(0, -1),
        systemInstruction: systemPrompt
      });

      const responseResult = await chatSession.sendMessage(lastMessage);
      const responseText = responseResult.response.text();
      
      if (responseText && responseText.trim().length > 0) {
        return {
          text: responseText,
          detectedMood,
          responseMode: activeMode,
          safetyFlagged: false
        };
      }
    } catch (apiError) {
      console.error('Gemini API request failed, falling back to local engine:', apiError);
    }
  }

  // 4. Local fallback engine responses
  const langFallback = LOCAL_FALLBACKS[language];
  let responseText = '';

  // Specific responses by mode
  if (activeMode === 'funny') {
    responseText = `${langFallback.moods[detectedMood as keyof typeof langFallback.moods]?.funny || langFallback.moods.sad.funny}\n\nHere is a healing story for you:\n${langFallback.stories.funny}`;
  } else if (activeMode === 'historical') {
    // Pick a historical profile randomly
    const keys = Object.keys(langFallback.historical);
    const randomKey = keys[Math.floor(Math.random() * keys.length)] as keyof typeof langFallback.historical;
    const historyStory = langFallback.historical[randomKey];
    responseText = `Remember this historical inspiration:\n${historyStory}\n\nNo matter what you're facing, struggles are the seeds of your future resilience.`;
  } else if (activeMode === 'success' || activeMode === 'motivation') {
    responseText = `${langFallback.moods[detectedMood as keyof typeof langFallback.moods]?.motivation || langFallback.moods.sad.motivation}\n\nRemember this story:\n${langFallback.stories.motivational}`;
  } else if (activeMode === 'confidence') {
    responseText = `${langFallback.moods[detectedMood as keyof typeof langFallback.moods]?.support || langFallback.moods.sad.support}\n\nLet's build your confidence. Take a step back and think of three things you did well this week. You are worthy of love, success, and peace.`;
  } else if (activeMode === 'calm') {
    responseText = `${langFallback.moods[detectedMood as keyof typeof langFallback.moods]?.support || langFallback.moods.sad.calm}\n\nTry to breathe deeply and slowly. Focus on the air filling your lungs, and releasing the tension as you exhale.`;
  } else {
    // Support/Friendship default
    responseText = `${langFallback.moods[detectedMood as keyof typeof langFallback.moods]?.support || langFallback.moods.sad.support}\n\nI'm always here to listen and walk alongside you. You don't have to face this alone.`;
  }

  return {
    text: responseText,
    detectedMood,
    responseMode: activeMode,
    safetyFlagged: false
  };
};

export const generateStory = async (
  category: string,
  language: 'en' | 'te'
): Promise<string> => {
  const langFallback = LOCAL_FALLBACKS[language];
  
  if (category === 'funny') return langFallback.stories.funny;
  if (category === 'motivational') return langFallback.stories.motivational;
  if (category === 'comeback') return langFallback.stories.comeback;
  if (category === 'historical') {
    const keys = Object.keys(langFallback.historical);
    const randomKey = keys[Math.floor(Math.random() * keys.length)] as keyof typeof langFallback.historical;
    return langFallback.historical[randomKey];
  }
  
  return langFallback.stories.healing;
};