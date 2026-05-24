"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "te";

const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
      chat: "AI Chat",
      stories: "Stories",
      journal: "Journal",
      analytics: "Analytics",
      profile: "Profile Settings",
      notifications: "Alerts",
      about: "About App",
      help: "Help Center",
      logout: "Log Out"
    },
    landing: {
      title: "Find Hope, Comfort & Inner Strength",
      subtitle: "Your premium AI emotional companion designed to listen, motivate, and guide you through life's highs and lows. Completely private, secure, and always here.",
      getStarted: "Begin Your Journey",
      login: "Log In",
      whyUs: "Why Choose HopeBuddy?",
      whyUsDesc: "We provide an emotionally intelligent space that adapts to your needs, whether you want comfort, laughter, or deep inspiration.",
      features: {
        chat: "Emotional AI Chatbot",
        chatDesc: "Talk naturally about any feeling: exam stress, loneliness, anxiety, or relationship struggles. Get smart support.",
        modes: "Intelligent Response Modes",
        modesDesc: "Tailor responses with support, strong motivation, historical fail-to-success tales, or calming guides.",
        journal: "Private Mood Journal",
        journalDesc: "Document your days. Our AI scans sentiment trends and saves entries with total database encryption.",
        gamify: "Interactive Gamification",
        gamifyDesc: "Earn experience points, log daily check-in streaks, and unlock achievements for prioritizing mental health."
      }
    },
    dashboard: {
      welcome: "Welcome back,",
      streak: "Day Streak",
      xp: "XP Level",
      challenge: "Today's Positive Challenge",
      challengePlaceholder: "Spend 5 minutes doing deep breathing or list three things you are grateful for.",
      quote: "Daily Affirmation",
      trackMood: "How are you feeling right now?",
      logMood: "Log Mood",
      moodSaved: "Mood logged! Earned +15 XP",
      moods: {
        sad: "Sad",
        lonely: "Lonely",
        angry: "Angry",
        stressed: "Stressed",
        overthinking: "Overthinking",
        anxiety: "Anxious",
        motivation_loss: "Low Motivation",
        study: "Study Stress"
      },
      badgeTitle: "Recent Badge",
      noBadge: "Start chat to unlock!"
    },
    chat: {
      placeholder: "Speak your mind... 'I failed my exam' or 'I feel alone'...",
      voicePlaceholder: "Listening... speak now",
      modeLabel: "AI Tone Style:",
      modes: {
        auto: "🧠 Auto Intelligent",
        support: "❤️ Comfort & Support",
        motivation: "🔥 High Motivation",
        funny: "⚡ Funny Stories & Jokes",
        historical: "🏛️ Historical Inspiration",
        success: "⭐ Success Stories",
        confidence: "💪 Confidence Booster",
        calm: "🍃 Sleep & Calming",
        friendship: "🤝 Friendly Buddy"
      },
      clear: "Clear Chat",
      safetyAlert: "⚠️ Safety Alert: If you are experiencing serious crisis or thoughts of self-harm, please tap the Help Center tab instantly for contact support hotlines. You are valuable.",
      ttsOn: "Audio Readout Enabled",
      ttsOff: "Audio Readout Disabled"
    },
    stories: {
      title: "Inspiration & Healing Library",
      subtitle: "Read comfort chronicles, humorous failures, and powerful historical comebacks to lift your spirits.",
      genTitle: "AI Interactive Story Generator",
      genSubtitle: "Pick a theme to generate a tailored uplifting story:",
      categories: {
        funny: "Harmless Funny Story",
        motivational: "High Motivation Ascent",
        comeback: "Powerful Comeback Tale",
        historical: "Historical Struggle Story",
        healing: "Emotional Healing Narrative"
      },
      generate: "Generate Story",
      generating: "Generating your inspiration..."
    },
    journal: {
      title: "Your Private Reflection Journal",
      subtitle: "Write freely. All entries are encrypted and private. The AI will detect the emotional tone.",
      newTitle: "Entry Title",
      newContent: "What's on your mind today? Express all your pain, relief, or gratitude...",
      save: "Save Entry",
      saving: "Saving diary entry...",
      noEntries: "No entries yet. Write your first reflection above!",
      detectedMood: "AI Sentiment:"
    },
    analytics: {
      title: "Mood Trends & Analytics",
      subtitle: "Track your emotional fluctuations and consistency scores to understand your mental state.",
      intensityChart: "Emotional Intensity Levels (1-10)",
      distributionChart: "Feelings Distribution Breakdown",
      summary: "Consistency Score",
      summaryDesc: "You logged moods consistently. Excellent job making self-care a habit!"
    },
    settings: {
      title: "Profile & App Customization",
      subtitle: "Change avatars, update primary languages, and manage voice playback.",
      langLabel: "Primary Language",
      avatarLabel: "Select Your Companion Avatar",
      remindersLabel: "Notifications & Reminders",
      sleepReminders: "Enable Night Sleep Reminders",
      dailyReminders: "Enable Daily Positive Affirmation Alerts",
      voiceLabel: "Voice Features",
      voiceEnable: "Enable Text-to-Speech (Audio Reads)",
      save: "Save Preferences",
      success: "Preferences saved successfully!"
    },
    help: {
      title: "Crisis Support & Help Center",
      subtitle: "If you feel hopeless or in extreme pain, please reach out. There are people who want to listen.",
      helplineTitle: "Direct Crisis Helplines",
      helplineDesc: "Available 24/7. Completely confidential.",
      tipsTitle: "Instant Calm Exercises",
      tips: [
        "4-7-8 Breathing: Inhale for 4s, hold for 7s, exhale slowly for 8s.",
        "5-4-3-2-1 Grounding: Look at 5 things, touch 4, hear 3, smell 2, taste 1.",
        "Splash cold water on your face to slow down racing thoughts.",
        "Take a slow glass of water and walk outside for five minutes."
      ]
    }
  },
  te: {
    nav: {
      dashboard: "డాష్‌బోర్డ్",
      chat: "ఏఐ చాట్",
      stories: "కథల గ్రంథాలయం",
      journal: "వ్యక్తిగత డైరీ",
      analytics: "విశ్లేషణలు",
      profile: "ప్రొఫైల్ సెట్టింగ్స్",
      notifications: "అలర్ట్స్",
      about: "యాప్ గురించి",
      help: "సహాయ కేంద్రం",
      logout: "లాగ్ అవుట్"
    },
    landing: {
      title: "ఆశాభావం, ఊరట మరియు ఆత్మవిశ్వాసం పొందండి",
      subtitle: "మీ కష్టసుఖాలలో తోడుగా ఉండేందుకు, మీ మాటలు ఆలకించేందుకు మరియు ధైర్యాన్నిచ్చేందుకు సృష్టించబడిన ప్రీమియం ఏఐ అసిస్టెంట్. పూర్తి సురక్షితం మరియు ప్రైవేట్.",
      getStarted: "మీ ప్రయాణం ప్రారంభించండి",
      login: "లాగిన్ అవ్వండి",
      whyUs: "హోప్ బడ్డీని ఎందుకు ఎంచుకోవాలి?",
      whyUsDesc: "మీకు ఓదార్పు కావాలన్నా, నవ్వు కావాలన్నా, లేదా గొప్ప స్ఫూర్తి కావాలన్నా, మీ మనస్సుకు సరిపోయేలా సమాధానాలిచ్చే వేదిక ఇది.",
      features: {
        chat: "ఎమోషనల్ ఏఐ చాట్‌బాట్",
        chatDesc: "పరీక్షల ఒత్తిడి, ఒంటరితనం, ఆందోళన లేదా సంబంధాల సమస్యలపై స్వేచ్ఛగా మాట్లాడండి. సరైన మద్దతు పొందండి.",
        modes: "విభిన్న రెస్పాన్స్ మోడ్స్",
        modesDesc: "ఓదార్పు మాటలు, బలమైన మోటివేషన్, చారిత్రక విజేతల గాథలు లేదా ధ్యానం వంటి వాటితో ప్రతిస్పందనను అనుకూలీకరించుకోండి.",
        journal: "వ్యక్తిగత డైరీ (జర్నల్)",
        journalDesc: "మీ రోజువారీ అనుభవాలను భద్రపరచుకోండి. మన ఏఐ మీ భావోద్వేగాలను విశ్లేషించి సురక్షితంగా ఉంచుతుంది.",
        gamify: "ఇంటరాక్టివ్ గేమిఫికేషన్",
        gamifyDesc: "మీ మానసిక ఆరోగ్యాన్ని మెరుగుపర్చుకుంటూ పాయింట్లు పొందండి, స్ట్రీక్స్ సాధించండి మరియు విజయాల బ్యాడ్జ్‌లు అన్‌లాక్ చేయండి."
      }
    },
    dashboard: {
      welcome: "తిరిగి స్వాగతం,",
      streak: "రోజువారీ స్ట్రీక్",
      xp: "ఎక్స్‌పీ లెవెల్",
      challenge: "నేటి సానుకూల సవాలు",
      challengePlaceholder: "5 నిమిషాల పాటు ప్రశాంతంగా శ్వాస తీసుకోండి లేదా మీకు సంతోషాన్నిచ్చిన 3 విషయాలను గుర్తుచేసుకోండి.",
      quote: "నేటి సానుకూల వాక్యం",
      trackMood: "ప్రస్తుతం మీ మనసు ఎలా ఉంది?",
      logMood: "మూడ్ నమోదు చేయి",
      moodSaved: "మూడ్ నమోదు విజయవంతం! +15 XP పొందారు",
      moods: {
        sad: "బాధగా ఉంది",
        lonely: "ఒంటరిగా ఉంది",
        angry: "కోపంగా ఉంది",
        stressed: "ఒత్తిడిగా ఉంది",
        overthinking: "ఎక్కువ ఆలోచిస్తున్నాను",
        anxiety: "ఆందోళనగా ఉంది",
        motivation_loss: "నిరుత్సాహంగా ఉంది",
        study: "పరీక్షల ఒత్తిడి"
      },
      badgeTitle: "ఇటీవలి బ్యాడ్జ్",
      noBadge: "చాట్ ప్రారంభించి అన్‌లాక్ చేయండి!"
    },
    chat: {
      placeholder: "మీ మనసులోని భావాలను టైప్ చేయండి... 'నేను పరీక్ష తప్పాను' లేదా 'నాకు ఒంటరిగా ఉంది'...",
      voicePlaceholder: "వింటున్నాను... మాట్లాడండి",
      modeLabel: "ఏఐ సమాధాన శైలి:",
      modes: {
        auto: "🧠 ఆటో ఇంటెలిజెంట్",
        support: "❤️ ఓదార్పు & మద్దతు",
        motivation: "🔥 బలమైన మోటివేషన్",
        funny: "⚡ హాస్య కథలు & జోకులు",
        historical: "🏛️ చారిత్రక స్ఫూర్తి",
        success: "⭐ విజయ గాథలు",
        confidence: "💪 ఆత్మవిశ్వాసం పెంపు",
        calm: "🍃 ప్రశాంతత & నిద్ర",
        friendship: "🤝 స్నేహపూర్వక తోడు"
      },
      clear: "చాట్ క్లియర్ చేయి",
      safetyAlert: "⚠️ రక్షణ హెచ్చరిక: మీరు తీవ్రమైన నిరాశలో ఉన్నట్లయితే లేదా హాని కలిగించుకునే ఆలోచనలు వస్తున్నట్లయితే, దయచేసి సహాయ కేంద్రం పేజీని సందర్శించి సహాయక నంబర్లను సంప్రదించండి. మీ జీవితం చాలా విలువైనది.",
      ttsOn: "వాయిస్ రీడౌట్ ఆన్ అయింది",
      ttsOff: "వాయిస్ రీడౌట్ ఆఫ్ అయింది"
    },
    stories: {
      title: "స్ఫూర్తి మరియు ఓరట ఇచ్చే కథలు",
      subtitle: "మీ మనసును తేలికపరిచే ఓదార్పు కథలు, హాస్య ఉదంతాలు మరియు చారిత్రక విజయ గాథలు చదవండి.",
      genTitle: "ఏఐ కథల సృష్టికర్త",
      genSubtitle: "మీకు కావలసిన అంశాన్ని ఎంచుకుని కొత్త కథను సృష్టించండి:",
      categories: {
        funny: "సరదా హాస్య కథ",
        motivational: "గొప్ప ప్రేరణాత్మక కథ",
        comeback: "ఓటమి నుండి విజయ గాథ",
        historical: "చారిత్రక స్ఫూర్తిదాయక కథ",
        healing: "భావోద్వేగ శాంతి కథ"
      },
      generate: "కథను సృష్టించు",
      generating: "మీ కథ తయారవుతోంది..."
    },
    journal: {
      title: "మీ వ్యక్తిగత రహస్య జర్నల్",
      subtitle: "మీ మనసులోని భావాలను స్వేచ్ఛగా రాయండి. ఇది పూర్తిగా రహస్యంగా మరియు భద్రంగా ఉంచబడుతుంది.",
      newTitle: "జర్నల్ శీర్షిక",
      newContent: "ఈ రోజు మీ మనసులో ఏముంది? బాధలు, ఆనందాలు లేదా కృతజ్ఞతలు పంచుకోండి...",
      save: "జర్నల్ సేవ్ చేయి",
      saving: "సేవ్ అవుతోంది...",
      noEntries: "ఇంకా ఎలాంటి డైరీ రికార్డులు లేవు. పైన మొదటిది రాయండి!",
      detectedMood: "ఏఐ కనుగొన్న భావన:"
    },
    analytics: {
      title: "భావోద్వేగ విశ్లేషణలు",
      subtitle: "మీ మానసిక స్థితిని అర్థం చేసుకోవడానికి మీ భావాల హెచ్చుతగ్గులు మరియు రోజువారీ స్కోరును గమనించండి.",
      intensityChart: "భావోద్వేగ తీవ్రత స్థాయిలు (1-10)",
      distributionChart: "వివిధ రకాల భావోద్వేగాల నిష్పత్తి",
      summary: "రోజువారీ క్రమశిక్షణ స్కోరు",
      summaryDesc: "మీరు మీ మనసును నిరంతరం పర్యవేక్షిస్తున్నారు. మీ మానసిక ఆరోగ్యాన్ని జాగ్రత్తగా చూసుకోవడం చాలా మంచి అలవాటు!"
    },
    settings: {
      title: "ప్రొఫైల్ & యాప్ సెట్టింగ్స్",
      subtitle: "అవతార్ మార్చండి, భాష మార్చండి మరియు వాయిస్ ఫీచర్లను నిర్వహించండి.",
      langLabel: "యాప్ భాష",
      avatarLabel: "మీ ఏఐ తోడుగా ఉండే అవతార్ ఎంచుకోండి",
      remindersLabel: "నోటిఫికేషన్లు & రిమైండర్లు",
      sleepReminders: "రాత్రి నిద్ర అలర్ట్స్ ఆన్ చేయి",
      dailyReminders: "రోజువారీ మోటివేషన్ అలర్ట్స్ ఆన్ చేయి",
      voiceLabel: "వాయిస్ ఫీచర్లు",
      voiceEnable: "ఏఐ సమాధానాలను చదివి వినిపించు (Text-to-Speech)",
      save: "సెట్టింగ్స్ సేవ్ చేయి",
      success: "సెట్టింగ్స్ విజయవంతంగా సేవ్ అయ్యాయి!"
    },
    help: {
      title: "సహాయ కేంద్రం & రక్షణ సమాచారం",
      subtitle: "మీరు తీవ్రమైన నిరాశలో ఉంటే సహాయం కోరడానికి వెనుకాడకండి. మీ మాట వినడానికి సహాయకులు సిద్ధంగా ఉన్నారు.",
      helplineTitle: "సహాయక హెల్ప్‌లైన్లు",
      helplineDesc: "24/7 అందుబాటులో ఉంటాయి. పూర్తి గోప్యంగా ఉంచబడుతుంది.",
      tipsTitle: "ప్రశాంతత కోసం చిన్న వ్యాయామాలు",
      tips: [
        "4-7-8 శ్వాస క్రియ: 4 సెకన్లు శ్వాస పీల్చండి, 7 సెకన్లు ఆపండి, 8 సెకన్ల పాటు నిదానంగా వదలండి.",
        "5-4-3-2-1 గ్రౌండింగ్: మీ చుట్టూ ఉన్న 5 వస్తువులను చూడండి, 4 తాకండి, 3 వినండి, 2 వాసన చూడండి, 1 రుచి చూడండి.",
        "ఆందోళన పెరిగినప్పుడు ముఖంపై చల్లటి నీళ్లు చల్లుకోండి.",
        "ఒక గ్లాసు మంచినీళ్లు తాగి, ఐదు నిమిషాల పాటు బయట నడవండి."
      ]
    }
  }
};

interface LanguageContextType {
  language: Language;
  t: typeof translations.en;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLangState] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("hopebuddy-lang") as Language;
    if (savedLang === "en" || savedLang === "te") {
      setLangState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    localStorage.setItem("hopebuddy-lang", lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
