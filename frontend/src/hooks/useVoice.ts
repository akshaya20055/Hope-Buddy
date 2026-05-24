"use client";

import { useState, useEffect, useCallback } from "react";

export const useVoice = (language: "en" | "te" = "en") => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        // Map language
        recog.lang = language === "te" ? "te-IN" : "en-US";

        recog.onstart = () => {
          setIsListening(true);
          setTranscript("");
        };

        recog.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setTranscript(resultText);
        };

        recog.onerror = (err: any) => {
          console.error("Speech recognition error:", err);
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        setRecognition(recog);
      }
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Cancel any ongoing speaking
      window.speechSynthesis.cancel();

      const cleanedText = text.replace(/[🏆🎉⭐❤️🔥⚡🏛️💪🍃🤝⚠️]/g, ""); // Strip emojis for smoother speaking
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      
      // Select appropriate language locale
      utterance.lang = language === "te" ? "te-IN" : "en-US";
      
      // Try to find matching voice
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(voice => 
        language === "te" ? voice.lang.includes("te") : voice.lang.includes("en")
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    speechSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  };
};
