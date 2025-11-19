import { VoiceGender } from "../types";

export const speak = (text: string, gender: VoiceGender = VoiceGender.FEMALE) => {
  if (!('speechSynthesis' in window)) return;

  // Cancel previous speech to avoid overlap
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.1; // Slightly faster for sport context
  utterance.pitch = 1.0;
  
  const voices = window.speechSynthesis.getVoices();
  // Simple heuristic to find a male/female voice
  const preferredVoice = voices.find(v => 
    v.name.toLowerCase().includes(gender) || 
    (gender === VoiceGender.FEMALE ? v.name.includes('Google US English') : v.name.includes('Google UK English Male'))
  );

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
};

// Simple mock for recognition if browser doesn't support it seamlessly without interaction
// In a real "Watch" env, this would be a native bridge.
export const startListening = (callback: (text: string) => void) => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn("Speech recognition not supported");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript;
    callback(text);
  };

  recognition.start();
  return recognition;
};