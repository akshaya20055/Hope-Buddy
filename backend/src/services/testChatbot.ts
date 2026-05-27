import { generateAIResponse } from './aiService.js';

const testCases = [
  { name: 'Playful message - Angry', text: 'getting angry on u', preferredMode: 'auto', language: 'en' },
  { name: 'Greeting How are u', text: 'how are u', preferredMode: 'auto', language: 'en' },
  { name: 'Educational - What is AI', text: 'what is AI', preferredMode: 'auto', language: 'en' },
  { name: 'Emotional support - Feeling sad', text: 'feeling sad', preferredMode: 'auto', language: 'en' },
  { name: 'General Unmatched - API warning check', text: 'tell me about chocolate', preferredMode: 'auto', language: 'en' }
];

async function runTests() {
  console.log('=== STARTING CHATBOT INTENT & STRICT FALLBACK TESTS ===\n');
  
  for (const tc of testCases) {
    console.log(`[Test Case] ${tc.name}`);
    console.log(`User: "${tc.text}"`);
    
    // Clear keys to force local fallback execution strictly
    const originalGemini = process.env.GEMINI_API_KEY;
    const originalOpenAI = process.env.OPENAI_API_KEY;
    process.env.GEMINI_API_KEY = '';
    process.env.OPENAI_API_KEY = '';
    
    const messages = [{ sender: 'user', text: tc.text }];
    const result = await generateAIResponse(messages as any, tc.preferredMode, tc.language as any);
    console.log(`Bot: "${result.text.replace(/\n/g, ' ')}"`);
    console.log(`Detected Mood: ${result.detectedMood} | Tone: ${result.responseMode}`);
    console.log('-------------------------------------------------------\n');
    
    // Restore keys
    process.env.GEMINI_API_KEY = originalGemini;
    process.env.OPENAI_API_KEY = originalOpenAI;
  }
  
  console.log('=== TESTS COMPLETED ===');
}

runTests();
