import { GoogleGenAI } from "@google/genai";
import { RideData } from "../types";

// Initialize Gemini AI
// NOTE: In a real production app, API keys should be handled via backend proxies.
// We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateRideAnalysis = async (rideData: RideData): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    const prompt = `
      You are Yodha, an enthusiastic AI cycling assistant.
      Analyze this ride data:
      - Duration: ${Math.floor(rideData.duration / 60)} minutes
      - Distance: ${rideData.distance.toFixed(2)} km
      - Max Speed: ${rideData.maxSpeed.toFixed(1)} km/h
      - Calories: ${rideData.calories} kcal
      
      Provide a short, punchy, 1-2 sentence motivational summary and one safety tip for the next ride.
      Keep it under 50 words total. Tone: Energetic, Friendly.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Great ride! Keep pushing your limits.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "Great ride! Data analysis unavailable offline, but you crushed it!";
  }
};

export const askYodha = async (question: string, context: string): Promise<string> => {
  try {
     const model = "gemini-2.5-flash";
     const prompt = `
      System: You are Yodha, a helpful AI for e-bike riders. 
      Context: ${context}
      User Question: ${question}
      
      Answer briefly (max 30 words). If it's a navigation request, pretend you are setting a route.
     `;
     
     const response = await ai.models.generateContent({
        model,
        contents: prompt,
     });
     
     return response.text || "I didn't catch that, rider.";
  } catch (error) {
    return "I'm currently offline. I can only help with basic ride stats right now.";
  }
}