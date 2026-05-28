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

export interface StoryResult {
  text: string;
  choices: string[];
  stats: { attribute: string; value: number }[];
}

// Crisis / Safety keywords
const SAFETY_KEYWORDS = [
  'die', 'kill myself', 'suicide', 'end my life', 'harm myself', 'cutting myself',
  'chastukunta', 'chavali', 'pranam', 'chachipovalani', 'chachipotha'
];

// Granular intent keyword lists for ChatGPT-style smart intent detection
export type UserIntent = 'greeting' | 'educational' | 'technical_help' | 'emotional_support' | 'casual_chat';

const INTENTS = {
  greeting: [
    'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'how do you do', 
    'how r u', 'how are u', 'how\'s it going', 'how are you doing', 'హాయ్', 'నమస్కారం', 'హలో', 'సుఖమా'
  ],
  technical_help: [
    'reset password', 'forgot password', 'change password', 'reset link', 'password reset', 
    'how to login', 'how to signup', 'how to register', 'login help', 'signup help', 
    'login', 'signup', 'register', 'sign up', 'log in', 'రీసెట్', 'పాస్‌వర్డ్', 'రిసెట్', 'లాగిన్'
  ],
  educational: [
    'what is ai', 'define ai', 'artificial intelligence', 'explain gravity', 'what is gravity', 
    'define happiness', 'what is happiness', 'explain', 'what is', 'define', 'how does', 'why do', 
    'about', 'ఏఐ', 'గురించి', 'వివరించు'
  ],
  emotional_support: [
    'lonely', 'alone', 'no one', 'isolate', 'left out', 'friendless', 'single', 
    'exam', 'fail', 'failed', 'study', 'marks', 'school', 'college', 'test', 'syllabus', 
    'anxious', 'worry', 'panic', 'nervous', 'fear', 'scared', 'shaking', 
    'breakup', 'heartbreak', 'ex', 'boyfriend', 'girlfriend', 'relationship', 'love', 'divorce', 
    'ugly', 'useless', 'worthless', 'stupid', 'fat', 'hate myself', 'no confidence', 
    'give up', 'tired', 'exhaust', 'burn out', 'lazy', 'quit', 'hopeless', 'motivate', 'motivation', 
    'stress', 'pressure', 'tense', 'overwhelm', 'job', 'work', 'office', 'boss', 
    'sad', 'bad', 'cry', 'hurt', 'pain', 'depressed', 'grief', 'miserable',
    'ఒంటరి', 'ఎవరూ', 'తోడు', 'పరీక్ష', 'చదువు', 'ర్యాంకు', 'ఫెయిల్', 'భయం', 'ఆందోళన', 'కంగారు',
    'విడిపోవడం', 'ప్రేమికుడు', 'లవ్', 'బ్రేకప్', 'ప్రేమ', 'అందం', 'నమ్మకం', 'వేస్ట్', 'ధైర్యం లేదు',
    'నిరుత్సాహం', 'ఓపిక లేదు', 'చేయలేను', 'మోటివేషన్', 'ఒత్తిడి', 'టెన్షన్', 'ఉద్యోగం', 'ఆఫీస్',
    'బాధ', 'ఏడుపు', 'ఓటమి'
  ],
  casual_chat: [
    'understand me', 'can you understand', 'do you understand', 'what are you saying', 'what i am asking', 
    'not asking', 'misunderstood', 'misunderstand', 'what do you mean', 'meaning', 'what ur saying', 
    'what you are saying', 'who are you', 'your name', 'what are you', 'thank you', 'thanks', 'bye', 
    'goodbye', 'see you', 'what\'s up', 'what is up', 'sup', 'let\'s chat',
    'ఏమంటున్నావు', 'ఏమిటి', 'నువ్వెవరు', 'నువ్వు ఎవరు', 'ధన్యవాదాలు', 'సరే'
  ]
};


// Local crisis warning response
const SAFETY_RESPONSE = {
  en: `I hear how much pain you are in right now, and I want you to know you are not alone. Please reach out to someone who can support you. You can connect with professionals who care and want to help:
- National Suicide Prevention Lifeline (US): 988 or 1-800-273-8255
- Sneha India Helpline: +91 44 2464 0050
- Vandrevala Foundation: +91 9999 666 555
Please contact a trusted friend, family member, or healthcare provider. Your life has immense value.`,
  te: `మీరు ఎంత బాధపడుతున్నారో నేను అర్థం చేసుకోగలను. దయచేసి ఒంటరిగా బాధపడకండి. మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్న సహాయ కేంద్రాలను సంప్రదించండి:
- స్నేహ ఇండియా హెల్ప్‌లైన్: +91 44 2464 0050
- వండ్రెవాలా ఫౌండేషన్: +91 9999 666 555
- టోల్ ఫ్రీ నెంబర్: 9152987821
దయచేసి మీ స్నేహితులు, కుటుంబ సభ్యులు లేదా వైద్యుల సహాయం తీసుకోండి. మీ జీవితం చాలా విలువైనది.`
};

// Seeded database for fallbacks
const STORIES_DB = {
  en: {
    historical: [
      "Swami Vivekananda once said: 'Arise, awake, and stop not till the goal is reached.' He faced extreme poverty and hunger, wandering barefoot across India, yet brought Eastern wisdom to the global stage through sheer willpower.",
      "Thomas Edison failed over 1,000 times before successfully inventing the incandescent light bulb. When asked about it, he remarked: 'I have not failed. I've just found 10,000 ways that won't work.' Defeat is just learning.",
      "Dr. APJ Abdul Kalam sold newspapers as a young boy to pay for his school fees. He faced rejection when trying to join the Air Force, but persevered to become India's President and leader of the satellite program."
    ],
    funny: [
      "Here is a little story: A man asked a wise monk, 'Why am I so unlucky?' The monk led him to a lake and said, 'Throw this salt into the water.' The man did. 'How does it taste?' 'Salty and bad,' said the man. The monk then said, 'Now, throw this salt into the ocean.' The man did. 'How does it taste now?' 'Fresh and clean,' said the man. The monk smiled: 'Be like the ocean, not like a cup. Also, you just threw away my kitchen salt, so you owe me five rupees!'"
    ]
  },
  te: {
    historical: [
      "స్వామి వివేకానంద చెప్పారు: 'లేవండి, మేల్కొనండి, గమ్యం చేరేవరకు విశ్రమించకండి.' ఆయన పేదరికం, ఆకలిని అనుభవించినా, ప్రపంచ స్థాయికి ఎదిగారు.",
      "థామస్ ఎడిసన్ బల్బ్ కనుగొనడానికి ముందు 1,000 సార్లు విఫలమయ్యారు. ఆయన చెప్పారు: 'నేను ఓడిపోలేదు, పనిచేయని 1,000 మార్గాలను కనుగొన్నాను.'"
    ],
    funny: [
      "ఒక జోక్: ఒక చీమ ఏనుగును చూసి 'నువ్వు చాలా బరువుగా ఉన్నావు, నా వెనుక కూర్చో నేను మోస్తా' అందట! మన కష్టాలు కూడా ఇంతే, నవ్వుతూ తేలిక చేసుకోండి."
    ]
  }
};

export const generateAIResponse = async (
  messages: ChatMessageInput[],
  preferredMode: string,
  language: 'en' | 'te'
): Promise<AIResponse> => {
  const lastMessage = messages[messages.length - 1]?.text || '';
  const lowercaseText = lastMessage.toLowerCase().trim();

  // 1. Safety / Crisis override
  const isCrisis = SAFETY_KEYWORDS.some(keyword => lowercaseText.includes(keyword));
  if (isCrisis) {
    return {
      text: SAFETY_RESPONSE[language],
      detectedMood: 'depression',
      responseMode: 'support',
      safetyFlagged: true
    };
  }

  // 2. Identify Smart Intent
  let matchedIntent: UserIntent = 'casual_chat';
  if (INTENTS.technical_help.some(keyword => lowercaseText.includes(keyword))) {
    matchedIntent = 'technical_help';
  } else if (INTENTS.educational.some(keyword => lowercaseText.includes(keyword))) {
    matchedIntent = 'educational';
  } else if (INTENTS.emotional_support.some(keyword => lowercaseText.includes(keyword))) {
    matchedIntent = 'emotional_support';
  } else if (INTENTS.greeting.some(keyword => lowercaseText.includes(keyword))) {
    matchedIntent = 'greeting';
  } else if (INTENTS.casual_chat.some(keyword => lowercaseText.includes(keyword))) {
    matchedIntent = 'casual_chat';
  } else {
    // If it ends with ? or contains questions, default to educational for information search. Otherwise casual_chat.
    if (lowercaseText.endsWith('?') || lowercaseText.includes('what') || lowercaseText.includes('how') || lowercaseText.includes('why') || lowercaseText.includes('explain')) {
      matchedIntent = 'educational';
    } else {
      matchedIntent = 'casual_chat';
    }
  }

  // Map Intent to Mood string for database compatibility
  let detectedMood = 'calm';
  if (matchedIntent === 'emotional_support') {
    if (lowercaseText.includes('exam') || lowercaseText.includes('fail') || lowercaseText.includes('study')) detectedMood = 'study';
    else if (lowercaseText.includes('lonely') || lowercaseText.includes('alone')) detectedMood = 'lonely';
    else if (lowercaseText.includes('anxious') || lowercaseText.includes('worry') || lowercaseText.includes('panic')) detectedMood = 'anxiety';
    else if (lowercaseText.includes('breakup') || lowercaseText.includes('heartbreak') || lowercaseText.includes('love')) detectedMood = 'sad';
    else if (lowercaseText.includes('ugly') || lowercaseText.includes('worthless') || lowercaseText.includes('useless') || lowercaseText.includes('hate myself')) detectedMood = 'confidence';
    else if (lowercaseText.includes('give up') || lowercaseText.includes('tired') || lowercaseText.includes('burnout') || lowercaseText.includes('exhausted')) detectedMood = 'motivation_loss';
    else if (lowercaseText.includes('stress') || lowercaseText.includes('pressure')) detectedMood = 'stressed';
    else detectedMood = 'sad';
  }

  // Determine active Response Mode
  let activeMode = preferredMode === 'auto' ? 'support' : preferredMode;
  if (preferredMode === 'auto') {
    if (detectedMood === 'study' || detectedMood === 'motivation_loss') activeMode = 'motivation';
    else if (detectedMood === 'confidence') activeMode = 'confidence';
    else if (detectedMood === 'stressed' || detectedMood === 'anxiety') activeMode = 'calm';
    else if (matchedIntent === 'greeting') activeMode = 'friendship';
    else if (matchedIntent === 'technical_help') activeMode = 'friendship';
    else if (matchedIntent === 'educational') activeMode = 'friendship';
    else if (matchedIntent === 'casual_chat') activeMode = 'friendship';
    else activeMode = 'support';
  }

  const systemPrompt = `You are "HopeBuddy AI", a warm, highly intelligent, and empathetic conversational assistant (GPT-style companion).
User Language: ${language === 'te' ? 'Telugu' : 'English'}. You MUST respond ONLY in this language.
Selected Tone/Mood Preference: ${activeMode} (e.g., support, motivation, calm, friendship). Adapt your tone slightly to this preference if appropriate, but ALWAYS prioritize directly answering the user's specific query first.

Rules of Conversation:
1. DIRECT ANSWER: Always read and directly answer the user's exact question or message. Never ignore the question or provide generic motivational text instead of a real reply.
2. ADAPTIVE CONTEXT & LENGTH:
   - For greetings (e.g., "Hi", "Hello", "How are you?"): Reply with a warm, natural greeting and ask how their day is going. Keep it short and human.
   - For factual/educational questions (e.g., "What is AI?", "Explain gravity"): Provide a clear, detailed, and accurate explanation.
   - For technical/help questions (e.g., "How to login?", "Forgot password"): Provide clear, step-by-step instructions.
   - For emotional distress (e.g., "I feel lonely", "I failed my exam", "I am anxious"): Be highly empathetic, supportive, validating, and offer comforting words or gentle coping exercises. Avoid repeating templates like "I hear sadness in your words", "Historical inspiration", or "Struggles are seeds of resilience" unless genuinely relevant.
   - For casual chit-chat (e.g., "What's up?", "Can you hear me?"): Respond naturally, casually, and keep it short.
3. CONVERSATIONAL MEMORY: Keep track of previous statements. Refer back to details in the history if it makes the conversation flow more naturally.
4. TONE STYLE: Sound human, friendly, and understanding. Never sound robotic. Keep casual answers brief and educational answers appropriately detailed.`;

  // 3. Try OpenAI API if key is available
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const formattedHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...formattedHistory
          ]
        })
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const responseText = data.choices?.[0]?.message?.content;
        if (responseText && responseText.trim().length > 0) {
          return {
            text: responseText,
            detectedMood,
            responseMode: activeMode,
            safetyFlagged: false
          };
        }
      } else {
        const errorText = await response.text();
        console.error('OpenAI API request failed:', response.status, errorText);
      }
    } catch (apiError) {
      console.error('OpenAI API request failed, falling back:', apiError);
    }
  }

  // 4. Try Gemini API if key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      // Format conversation history
      const formattedHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const result = await model.generateContent(
  `${systemPrompt}\n\nUser: ${lastMessage}`
);

const responseText = result.response.text();
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

  // 5. Local fallback engine responses (Dynamic synthesis)
  const getPreviousUserMessage = () => {
    for (let i = messages.length - 2; i >= 0; i--) {
      if (messages[i].sender === 'user') return messages[i].text.toLowerCase().trim();
    }
    return '';
  };

  const getPreviousAiMessage = () => {
    for (let i = messages.length - 2; i >= 0; i--) {
      if (messages[i].sender === 'ai') return messages[i].text.toLowerCase().trim();
    }
    return '';
  };

  let synthesizedText = "";
  const isTe = language === 'te';
  const prevUser = getPreviousUserMessage();
  const prevAi = getPreviousAiMessage();

  if (matchedIntent === 'greeting') {
    if (lowercaseText.includes('how are u') || lowercaseText === 'how are you' || lowercaseText === 'how r u') {
      synthesizedText = isTe 
        ? "నేను బాగున్నాను 😊 మీరు ఎలా ఉన్నారు?" 
        : "I'm doing good 😊 How are you?";
    } else if (lowercaseText.includes('how are you') || lowercaseText.includes('how r u') || lowercaseText.includes('how do you do') || lowercaseText.includes('how\'s it going')) {
      synthesizedText = isTe 
        ? "నేను చాలా బాగున్నాను! 😊 మీరు ఎలా ఉన్నారు?" 
        : "I'm doing well! 😊 How are you?";
    } else {
      synthesizedText = isTe
        ? "హలో! హోప్ బడ్డీకి స్వాగతం. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను? 😊"
        : "Hello! Welcome to HopeBuddy. How can I help you today? 😊";
    }
  } else if (matchedIntent === 'casual_chat') {
    if (lowercaseText.includes('getting angry on u') || lowercaseText.includes('getting angry') || lowercaseText.includes('angry on you') || lowercaseText.includes('angry on u')) {
      synthesizedText = isTe
        ? "అయ్యో 😅 నేను ఏమి చేశాను? మీకు ఎందుకు కోపం వచ్చిందో చెప్పండి."
        : "Oh no 😅 What did I do? Tell me what upset you.";
    } else if (lowercaseText.includes('understand me') || lowercaseText.includes('understand') || lowercaseText.includes('అర్థం')) {
      synthesizedText = isTe
        ? "అవును, నేను మిమ్మల్ని అర్థం చేసుకోగలను. మీకు ఏ విషయాల్లో సహాయం కావాలో చెప్పండి."
        : "Yes, I understand you. Tell me what you’d like help with.";
    } else if (lowercaseText.includes('your name') || lowercaseText.includes('who are you') || lowercaseText.includes('నువ్వెవరు') || lowercaseText.includes('నువ్వు ఎవరు')) {
      synthesizedText = isTe
        ? "నేను హోప్ బడ్డీ ఏఐ (HopeBuddy AI) - మీ స్నేహితుడిగా మరియు సహాయకుడిగా ఉంటాను."
        : "I am HopeBuddy AI, your conversational companion. I'm here to listen and help you track your goals, journals, and moods.";
    } else if (lowercaseText.includes('thank') || lowercaseText.includes('ధన్యవాదాలు')) {
      synthesizedText = isTe
        ? "మీకు సహాయపడినందుకు చాలా సంతోషం! మీ రోజు అద్భుతంగా సాగాలని కోరుకుంటున్నాను."
        : "You're very welcome! I'm glad I could help. What else is on your mind?";
    } else if (lowercaseText.includes('bye') || lowercaseText.includes('goodbye') || lowercaseText.includes('సరే')) {
      synthesizedText = isTe
        ? "సరే, వెళ్లి రండి! జాగ్రత్త. మళ్ళీ ఎప్పుడు కావాలన్నా నాతో మాట్లాడవచ్చు."
        : "Goodbye! Take care. I'll be here whenever you want to talk again.";
    } else if (lowercaseText.includes('what\'s up') || lowercaseText.includes('what is up') || lowercaseText.includes('sup')) {
      synthesizedText = isTe
        ? "ఏమీ లేదు, అంతా బాగుంది! మీ సంగతులు ఏంటి?"
        : "Not much! Just here and ready to help. What's going on with you?";
    } else if (['yes', 'yeah', 'sure', 'ok', 'okay', 'అవును', 'సరే'].includes(lowercaseText)) {
      if (prevAi.includes('on your mind') || prevAi.includes('నాతో పంచుకోండి')) {
        synthesizedText = isTe
          ? "నేను వింటున్నాను. చెప్పండి, ఏమైంది?"
          : "I'm listening. Tell me what's been on your mind.";
      } else {
        synthesizedText = isTe
          ? "సరే! మనం దేని గురించి మాట్లాడుకుందాం?"
          : "Alright! What would you like to discuss next?";
      }
    } else if (['no', 'nay', 'not really', 'వద్దు', 'కాదు'].includes(lowercaseText)) {
      synthesizedText = isTe
        ? "సరే, సమస్య లేదు. మనం సాధారణ విషయాలు మాట్లాడుకుందాం. ఈ రోజు మీ రోజంతా ఎలా గడిచింది?"
        : "No problem at all. We can chat about anything else, or just keep it simple. How was your day overall?";
    } else {
      synthesizedText = isTe
        ? "నేను మీతో మాట్లాడటానికి సిద్ధంగా ఉన్నాను! పూర్తి చాట్ జిపిటి-శైలి సంభాషణల కోసం, దయచేసి .env ఫైల్‌లో మీ GEMINI_API_KEY లేదా OPENAI_API_KEYని కాన్ఫిగర్ చేయండి."
        : "I'm ready to chat! Please configure a GEMINI_API_KEY or OPENAI_API_KEY in the backend/.env file to start natural, dynamic ChatGPT-style conversations for any topic. 😊";
    }
  } else if (matchedIntent === 'educational') {
    if (lowercaseText.includes('what is ai') || lowercaseText.includes('artificial intelligence') || lowercaseText.includes('ఏఐ')) {
      synthesizedText = isTe
        ? "ఏఐ (AI) లేదా ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ అనేది కంప్యూటర్లు మరియు యంత్రాలు మానవులలాగా నేర్చుకోవడానికి, ఆలోచించడానికి మరియు నిర్ణయాలు తీసుకోవడానికి సహాయపడే సాంకేతికత."
        : "AI stands for Artificial Intelligence. It allows machines to learn and solve problems like humans.";
    } else if (lowercaseText.includes('gravity') || lowercaseText.includes('గురుత్వాకర్షణ')) {
      synthesizedText = isTe
        ? "గురుత్వాకర్షణ అనేది విశ్వంలోని వస్తువులను ఒకదానికొకటి లాగే ఒక సహజ శక్తం. భూమి తన గురుత్వాకర్షణ ద్వారా మనలను నేలపై ఉంచుతుంది."
        : "Gravity is a fundamental force of nature that pulls objects toward each other. It keeps our feet on the ground and governs the motion of planets.";
    } else if (lowercaseText.includes('happiness') || lowercaseText.includes('సంతోషం')) {
      synthesizedText = isTe
        ? "సంతోషం అనేది ఆనందం, సంతృప్తి మరియు ప్రశాంతతతో కూడిన మానసిక స్థితి. ఇది మనకు నచ్చిన పనులు చేయడం లేదా ప్రియమైన వారితో గడపడం వల్ల కలుగుతుంది."
        : "Happiness is an emotional state characterized by joy, satisfaction, and contentment. It often comes from meaningful connections, gratitude, or doing things you love.";
    } else if (lowercaseText.includes('hopebuddy') || lowercaseText.includes('hope buddy')) {
      synthesizedText = isTe
        ? "హోప్ బడ్డీ అనేది మీ మానసిక ఆరోగ్యానికి సహాయపడే ఒక ఆప్. ఇది మీ మూడ్ ట్రాక్ చేయడానికి, జర్నల్ రాయడానికి మరియు మీకు తోడుగా ఉండటానికి రూపొందించబడింది."
        : "HopeBuddy is an emotional support and mental wellness companion application. It helps you track your mood, maintain a journal, generate motivational stories, and talk with a supportive assistant.";
    } else {
      synthesizedText = isTe
        ? "నేను మీతో మాట్లాడటానికి సిద్ధంగా ఉన్నాను! పూర్తి చాట్ జిపిటి-శైలి సంభాషణల కోసం, దయచేసి .env ఫైల్‌లో మీ GEMINI_API_KEY లేదా OPENAI_API_KEYని కాన్ఫిగర్ చేయండి."
        : "I'm ready to chat! Please configure a GEMINI_API_KEY or OPENAI_API_KEY in the backend/.env file to start natural, dynamic ChatGPT-style conversations for any topic. 😊";
    }
  } else if (matchedIntent === 'technical_help') {
    if (lowercaseText.includes('login') || lowercaseText.includes('log in') || lowercaseText.includes('లాగిన్')) {
      synthesizedText = isTe
        ? "లాగిన్ అవ్వడానికి:\n1. లాగిన్ స్క్రీన్‌పై మీ ఈమెయిల్ మరియు పాస్‌వర్డ్ టైప్ చేయండి.\n2. 'Log In' బటన్ క్లిక్ చేయండి."
        : "To login: Go to the Login page, enter your registered email address and password, then click 'Log In'.";
    } else if (lowercaseText.includes('reset') || lowercaseText.includes('forgot') || lowercaseText.includes('password') || lowercaseText.includes('రీసెట్') || lowercaseText.includes('పాస్‌వర్డ్')) {
      synthesizedText = isTe
        ? "పాస్‌వర్డ్ రీసెట్ చేయడానికి:\n1. లాగిన్ పేజీలో 'Forgot Password?' లింక్ క్లిక్ చేయండి.\n2. మీ రిజిస్టర్డ్ ఈమెయిల్ ఎంటర్ చేసి రీసెట్ లింక్ పంపమని కోరండి.\n3. మీ ఈమెయిల్ ఇన్‌బాక్స్‌లోని లింక్ ద్వారా కొత్త పాస్‌వర్డ్ సెట్ చేసుకోండి."
        : "To reset your password:\n1. Click 'Forgot Password?' below the login form.\n2. Enter your registered email address and click the submit button.\n3. Check your email inbox for a secure reset link (valid for 1 hour).\n4. Click the link to define a new password.";
    } else if (lowercaseText.includes('signup') || lowercaseText.includes('register') || lowercaseText.includes('sign up') || lowercaseText.includes('రిజిస్టర్')) {
      synthesizedText = isTe
        ? "ఖాతా సృష్టించడానికి:\n1. రిజిస్ట్రేషన్ (Sign Up) పేజీకి వెళ్ళండి.\n2. మీ పేరు, ఈమెయిల్ మరియు బలమైన పాస్‌వర్డ్ నమోదు చేయండి.\n3. 'Sign Up' క్లిక్ చేసి మీ ప్రయాణాన్ని ప్రారంభించండి."
        : "To sign up / register:\n1. Go to the Sign Up page.\n2. Enter your Name, Email address, and a secure password.\n3. Click the 'Sign Up' button to create your account and access your dashboard.";
    } else {
      synthesizedText = isTe
        ? "మీరు ఎదుర్కొంటున్న సాంకేతిక సమస్య గురించి కొంచెం వివరంగా చెప్పండి, నేను దానికి తగిన పరిష్కారం చూపుతాను."
        : "Please describe the technical issue you are experiencing in detail, and I'll guide you through the correct steps to resolve it.";
    }
  } else if (matchedIntent === 'emotional_support') {
    if (lowercaseText.includes('feeling sad') || lowercaseText === 'sad' || lowercaseText.includes('unhappy') || lowercaseText.includes('బాధగా')) {
      synthesizedText = isTe
        ? "మీరు బాధగా ఉన్నందుకు నేను విచారిస్తున్నాను. మీ మనసులో ఉన్నదాన్ని నాతో పంచుకోవాలనుకుంటున్నారా?"
        : "I'm sorry you're feeling sad. Want to talk about what's been on your mind?";
    } else if (lowercaseText.includes('lonely') || lowercaseText.includes('alone') || lowercaseText.includes('ఒంటరి')) {
      synthesizedText = isTe
        ? "మీరు ఒంటరిగా ఉన్నందుకు నేను విచారిస్తున్నాను. నా సహాయం కావాలా? మీ మనసులో ఏముందో నాతో పంచుకోండి."
        : "I’m sorry you’re feeling that way. Want to talk about what’s been on your mind?";
    } else if (lowercaseText.includes('fail') || lowercaseText.includes('exam') || lowercaseText.includes('ఫెయిల్') || lowercaseText.includes('పరీక్ష')) {
      synthesizedText = isTe
        ? "పరీక్షలో ఆశించిన ఫలితం రాలేదా? చాలా బాధగా ఉందని నాకు తెలుసు. కానీ ఇది మీ భవిష్యత్తును నిర్ణయించే చివరి మెట్టు కాదు. మీతో మాట్లాడటానికి నేను సిద్ధంగా ఉన్నాను."
        : "I'm sorry to hear that. Failing an exam is tough and disappointing, but it is just a single step in your journey and doesn't define your intelligence or value. Want to talk about how you're feeling right now?";
    } else if (lowercaseText.includes('anxious') || lowercaseText.includes('panic') || lowercaseText.includes('fear') || lowercaseText.includes('ఆందోళన')) {
      synthesizedText = isTe
        ? "ఆందోళన పడకండి. ఒకసారి నిదానంగా శ్వాస పీల్చండి. ప్రస్తుత క్షణంలో మీరు సురక్షితంగా ఉన్నారు. నాతో మాట్లాడాలని ఉందా?"
        : "I hear you. Take a slow, deep breath. You are safe right now. Would you like to talk about what is causing this worry or try a simple grounding exercise?";
    } else {
      synthesizedText = isTe
        ? "మీరు ఈ కష్ట సమయంలో బాధపడుతున్నందుకు విచారిస్తున్నాను. నేను మీకు తోడుగా ఉంటాను. మీ ఆలోచనలను నాతో స్వేచ్ఛగా పంచుకోండి."
        : "I'm sorry you are going through a difficult time right now. I'm here to support you. Feel free to share whatever you feel comfortable talking about.";
    }
  }

  return {
    text: synthesizedText,
    detectedMood,
    responseMode: activeMode,
    safetyFlagged: false
  };
};

export const generateStory = async (
  category: string,
  language: 'en' | 'te',
  choice?: string,
  history?: string
): Promise<StoryResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      
      let prompt = `You are "HopeBuddy Storyteller", an expert writer of highly inspiring, interactive, choose-your-own-adventure short stories.
Language: ${language === 'te' ? 'Telugu' : 'English'}. Respond ONLY in this language.
Theme style: ${category}.
`;

      if (choice && history) {
        prompt += `This is a continuation of the user's interactive journey.
Previous Story Chapters:
"${history}"

The user decided to take the action/choice: "${choice}".
Write the next chapter (1-2 paragraphs) of this story resolving their decision with hope and resilience.
`;
      } else {
        prompt += `Write the opening chapter (2 paragraphs) of an inspiring adventure story about overcoming a huge obstacle related to this theme.
`;
      }

      prompt += `
Generate exactly two dynamic and relevant choice options for what the protagonist should do next.
Also, assign two mental attribute boosts (e.g. Resilience, Hope, Clarity, Calmness, Focus, Self-Belief) with value points (+10 to +25) that this chapter inspires.

Format your response strictly as a JSON object with this exact structure:
{
  "text": "The story/chapter content text here...",
  "choices": ["Next Step Option 1", "Next Step Option 2"],
  "stats": [
    {"attribute": "Attribute1", "value": 15},
    {"attribute": "Attribute2", "value": 20}
  ]
}
Ensure choices are short (max 8 words) and in the appropriate language (${language === 'te' ? 'Telugu' : 'English'}).
Do not wrap your response in markdown code blocks like \`\`\`json. Return pure JSON.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      // Clean up markdown blocks if model added them
      const cleanJSON = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJSON);
      if (parsed.text) {
        return {
          text: parsed.text,
          choices: parsed.choices || [],
          stats: parsed.stats || []
        };
      }
    } catch (apiError) {
      console.error('Gemini Storytelling failed, falling back to local database:', apiError);
    }
  }

  // --- LOCAL FALLBACK INTERACTIVE ENGINE ---
  const stories = STORIES_DB[language] || STORIES_DB['en'];

  // Case A: Continuing the adventure locally
  if (choice && history) {
    const isTe = language === 'te';
    const text = isTe 
      ? `మీరు ఎంచుకున్న మార్గం: "${choice}".\n\nఈ సవాలుతో కూడిన నిర్ణయం మీలో అద్భుతమైన ఆత్మవిశ్వాసాన్ని నింపింది. మనస్ఫూర్తిగా ప్రయత్నిస్తే ఏ అడ్డంకినైనా దాటవచ్చునని మీరు గ్రహించారు. ఈ ప్రయాణం మీ భావాలను ప్రశాంతపరిచింది.`
      : `You chose to: "${choice}".\n\nEmbracing this choice proved that growth lies in taking bold, conscious steps. Although the path is gradual, you feel a renewed sense of purpose and clarity. You are transforming your setbacks into stepping stones.`;
      
    const choices = isTe 
      ? ["కొత్త ప్రయాణాన్ని ప్రారంభించండి", "గ్రంథాలయానికి తిరిగి వెళ్ళండి"]
      : ["Embark on a new journey", "Return to library"];
      
    const stats = [
      { attribute: isTe ? "ధైర్యం (Courage)" : "Courage", value: 20 },
      { attribute: isTe ? "జ్ఞానం (Wisdom)" : "Wisdom", value: 15 }
    ];

    return { text, choices, stats };
  }

  // Case B: Opening chapter locally
  let storyText = "";
  let choices: string[] = [];
  let stats: { attribute: string; value: number }[] = [];

  const isTe = language === 'te';

  if (category === 'funny') {
    const list = stories.funny || STORIES_DB['en'].funny;
    storyText = list[Math.floor(Math.random() * list.length)];
    choices = isTe 
      ? ["నవ్వుతూ ముందుకు సాగండి", "ఈ కథను స్నేహితుడితో పంచుకోండి"]
      : ["Smile and move forward", "Share this laugh with a friend"];
    stats = [
      { attribute: isTe ? "ఆనందం (Joy)" : "Joy", value: 20 },
      { attribute: isTe ? "ప్రశాంతత (Clarity)" : "Lightness", value: 15 }
    ];
  } else if (category === 'historical' || category === 'motivational') {
    const list = stories.historical || STORIES_DB['en'].historical;
    storyText = list[Math.floor(Math.random() * list.length)];
    choices = isTe 
      ? ["కలాం గారి స్ఫూర్తిని అనుసరించండి", "నా పట్టుదలను పెంచుకుంటాను"]
      : ["Emulate their resilience", "Increase my daily dedication"];
    stats = [
      { attribute: isTe ? "పట్టుదల (Resilience)" : "Resilience", value: 25 },
      { attribute: isTe ? "సంకల్పం (Determination)" : "Determination", value: 20 }
    ];
  } else {
    // Default healing / comeback stories fallback
    const fallbackNarratives = isTe 
      ? [
          "ఒక తల్లి వేడి నీటిలో క్యారెట్, గుడ్డు, మరియు కాఫీ గింజలను వేసింది. క్యారెట్ గట్టిగా ఉండి మెత్తగా అయిపోయింది. గుడ్డు లోపల గట్టిపడింది. కానీ కాఫీ గింజలు నీటి రంగునే మార్చి సువాసన తెచ్చాయి. సమస్యలు వచ్చినప్పుడు మనం బలహీనపడకూడదు, మన చుట్టూ ఉన్న పరిస్థితులను మార్చగల కాఫీ గింజలా మారాలి.",
          "వెదురు విత్తనం నాటిన మొదటి నాలుగు సంవత్సరాలు నేల నుండి ఎలాంటి మొలక రాదు. కానీ ఐదో సంవత్సరంలో కేవలం ఆరు వారాల్లోనే అది 80 అడుగుల ఎత్తు పెరుగుతుంది. ఆ నాలుగు సంవత్సరాలు అది లోపలికి వేళ్లను బలంగా పాతుకుంటుంది. మీ కష్టాలు కూడా మీ వేళ్లను బలోపేతం చేస్తున్నాయి, మీ సమయం త్వరలోనే వస్తుంది."
        ]
      : [
          "A young woman went to her mother complaining that life was hard. The mother took three pots of boiling water. In the first, she placed carrots; in the second, eggs; and in the third, ground coffee beans. After twenty minutes, she took them out. She explained: 'The carrot went in strong and hard, but came out soft and weak. The egg went in fragile, but came out hardened. The coffee beans, however, changed the water itself!' When adversity knocks, transform your circumstances.",
          "In a forest, a tiny bamboo seed lay next to a beautiful fern. In the first year, the fern grew rapidly, turning into a lush green carpet. The bamboo seed showed nothing. By year four, the fern was majestic, but still no bamboo sprout. In the fifth year, a tiny shoot emerged, growing 80 feet tall in weeks! It spent years growing deep roots. Your struggles are root-building times."
        ];
    storyText = fallbackNarratives[Math.floor(Math.random() * fallbackNarratives.length)];
    choices = isTe 
      ? ["పరిస్థితులను కాఫీ గింజలా మార్చండి", "నా మూలాలను బలోపేతం చేసుకుంటాను"]
      : ["Transform like coffee beans", "Strengthen my inner roots"];
    stats = [
      { attribute: isTe ? "ఆత్మవిశ్వాసం (Self-Belief)" : "Self-Belief", value: 20 },
      { attribute: isTe ? "ప్రశాంతత (Calmness)" : "Calmness", value: 15 }
    ];
  }

  return { text: storyText, choices, stats };
};