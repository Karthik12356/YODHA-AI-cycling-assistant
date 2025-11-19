import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, VoiceGender } from '../types';
import { speak, startListening } from '../services/voiceService';
import { askYodha } from '../services/geminiService';

interface AssistantProps {
  isOnline: boolean;
  onRideControl: (action: 'PAUSE' | 'RESUME') => void;
}

const Assistant: React.FC<AssistantProps> = ({ isOnline, onRideControl }) => {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'yodha', text: isOnline ? "Hi! I'm Yodha. How can I help?" : "I'm offline, but tracking your ride.", timestamp: Date.now() }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleVoiceCommand = async () => {
    setIsListening(true);
    // Mocking voice trigger for demo purposes if permissions fail
    const recognition = startListening(async (text) => {
      setIsListening(false);
      addMessage('user', text);
      
      const lowerText = text.toLowerCase();

      // Process Command
      if (lowerText.includes("pause") || lowerText.includes("stop ride")) {
        onRideControl('PAUSE');
        respond("Pausing the ride.");
      } else if (lowerText.includes("resume") || lowerText.includes("start ride") || lowerText.includes("continue")) {
        onRideControl('RESUME');
        respond("Resuming tracking.");
      } else if (lowerText.includes("introduce") || lowerText.includes("who are you")) {
        respond("I am Yodha, your intelligent e-cycle co-pilot. I monitor your speed, navigate your route, and ensure your safety.");
      } else if (lowerText.includes("speed")) {
        const reply = "You are cruising at a good pace.";
        respond(reply);
      } else if (lowerText.includes("battery")) {
        const reply = "Battery is stable at 85%.";
        respond(reply);
      } else if (isOnline) {
        // AI Fallback
        const reply = await askYodha(text, "User is currently riding an e-bike.");
        respond(reply);
      } else {
        respond("Sorry, I can't access the cloud right now.");
      }
    });

    if (!recognition) {
        // Fallback for no speech support in dev env
        setTimeout(() => setIsListening(false), 2000);
    }
  };

  const addMessage = (sender: 'user' | 'yodha', text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender, text, timestamp: Date.now() }]);
  };

  const respond = (text: string) => {
    addMessage('yodha', text);
    speak(text, VoiceGender.FEMALE);
  };

  return (
    <div className="w-full h-full flex flex-col bg-black p-4 relative">
      <div className="flex-1 overflow-y-auto mb-16 space-y-3 pt-6">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-2 rounded-lg text-xs ${
              msg.sender === 'user' 
                ? 'bg-neon-blue/20 text-neon-blue rounded-tr-none' 
                : 'bg-gray-800 text-white rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Trigger */}
      <button 
        onClick={handleVoiceCommand}
        className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
          isListening 
            ? 'bg-neon-red/20 border-neon-red animate-pulse' 
            : 'bg-neon-blue/10 border-neon-blue'
        }`}
      >
        {isListening ? (
            <div className="w-6 h-6 bg-neon-red rounded-sm" /> // Stop Icon
        ) : (
            <svg className="w-8 h-8 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        )}
      </button>
    </div>
  );
};

export default Assistant;