import { GoogleGenAI, Type } from "@google/genai";
import { BusinessData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBusinessImage = async (
  imageBase64: string,
  geoContext?: string
): Promise<BusinessData> => {
  const model = "gemini-3-flash-preview"; // Using Flash for speed and vision capabilities

  const prompt = `
    Analyze this image of a business or storefront in India.
    Context: The user is at location: ${geoContext || "Unknown"}.
    
    Tasks:
    1. Identify the Business Name.
    2. Detect the primary language(s) on the board (e.g., Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati).
    3. If the text is in a native script, provide a Transliteration (Roman script) for the business name and key text.
    4. Categorize the business (e.g., Restaurant, Kirana Store, Pharmacy).
    5. Extract any visible Products and Prices.
    6. Look for address clues (city, area) in the text.
    7. Write a short, viral-style summary (1 sentence) about this spot.

    Return the data in strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            businessName: { type: Type.STRING },
            detectedLanguage: { type: Type.STRING, description: "Primary language detected" },
            transliteration: { type: Type.STRING, description: "Romanized version of the main native text" },
            category: { type: Type.STRING },
            confidence: { type: Type.NUMBER, description: "Confidence score 0-100" },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
              },
            },
            addressContext: { type: Type.STRING, description: "City or area inferred from image text" },
            summary: { type: Type.STRING, description: "A catchy 1-sentence summary" },
          },
          required: ["businessName", "detectedLanguage", "category", "summary"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini");
    }

    const data = JSON.parse(response.text) as BusinessData;
    return data;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

export const getCityFromCoords = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `I am at Latitude: ${lat}, Longitude: ${lng} in India. What is the most likely City and State name? Answer with JUST the "City, State". Example: "Mumbai, Maharashtra".`,
    });
    return response.text?.trim() || "Unknown Location";
  } catch (e) {
    return "Location Detected";
  }
};

/**
 * Build a rich, language-aware prompt with audio cues for Veo 3.1
 */
const buildVideoPrompt = (
  businessName: string,
  category: string,
  city: string,
  summary: string,
  detectedLanguage: string
): string => {
  // Language-specific voiceover dialogue (in quotes so Veo generates speech)
  const voiceoverMap: Record<string, string> = {
    'Hindi': `A warm male voice says "नमस्ते! ${businessName} में आपका स्वागत है, ${city} की शान!" in Hindi with a friendly, inviting tone.`,
    'Tamil': `A warm voice says "வணக்கம்! ${businessName} க்கு வரவேற்கிறோம்!" in Tamil with an enthusiastic, welcoming tone.`,
    'Telugu': `A warm voice says "స్వాగతం! ${businessName} కి స్వాగతం!" in Telugu with a cheerful tone.`,
    'Kannada': `A warm voice says "ಸುಸ್ವಾಗತ! ${businessName} ಗೆ ಸ್ವಾಗತ!" in Kannada with a friendly tone.`,
    'Bengali': `A warm voice says "স্বাগতম! ${businessName} এ আপনাকে স্বাগত!" in Bengali with a warm tone.`,
    'Marathi': `A warm voice says "नमस्कार! ${businessName} मध्ये आपले स्वागत आहे!" in Marathi with a friendly tone.`,
    'Gujarati': `A warm voice says "નમસ્તે! ${businessName} માં આપનું સ્વાગત છે!" in Gujarati with a welcoming tone.`,
  };

  const voiceover = voiceoverMap[detectedLanguage]
    || `A warm Indian-accented voice says "Welcome to ${businessName}, the pride of ${city}!" in a friendly, professional tone.`;

  return `A photorealistic, cinematic 8-second commercial for "${businessName}", a ${category} in ${city}, India.

VISUAL: The video opens on the exact storefront shown in the reference image — same signboard, same logo, same colors. The camera holds steady for 2 seconds, then performs a slow, smooth dolly-in toward the shop entrance. At 5 seconds, a gentle pan reveals the products and atmosphere. The final 2 seconds return to a wide establishing shot with the shop name prominently visible.

AUDIO: ${voiceover} The background has the gentle ambient sounds of an Indian market — distant chatter, a bicycle bell, soft traditional music. The overall audio feels warm, inviting, and professional.

STYLE: Documentary-style cinematography with natural lighting, shallow depth of field, and warm color grading. The shop's actual signage, logo, and text must remain clearly visible and accurate throughout. ${summary}

CAMERA: Smooth Steadicam movement, cinematic 24fps, professional shallow depth of field, natural golden-hour lighting.`;
};

export const generateBusinessVideo = async (
  businessName: string,
  category: string,
  city: string,
  summary: string,
  detectedLanguage: string,
  shopImageBase64: string
): Promise<string> => {
  // Create a new instance to ensure we pick up the latest API Key
  const latestAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = buildVideoPrompt(businessName, category, city, summary, detectedLanguage);
  console.log("Generating video with rich prompt:", prompt.substring(0, 200) + "...");

  // Use image-to-video with the shop photo as starting frame + reference asset
  let operation = await latestAi.models.generateVideos({
    model: 'veo-3.1-generate-preview',
    prompt: prompt,
    // Shop image as the starting frame (image-to-video)
    image: {
      imageBytes: shopImageBase64,
      mimeType: 'image/jpeg'
    },
    config: {
      numberOfVideos: 1,
      aspectRatio: '16:9',
      personGeneration: 'allow_adult',
      negativePrompt: 'cartoon, drawing, animation, low quality, blurry text, watermark, generic stock footage',
    }
  });

  console.log("Video generation started (image-to-video with reference images + audio)...");

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await latestAi.operations.getVideosOperation({ operation: operation });
    console.log("Polling video status...");
  }

  if (operation.error) {
    throw new Error(operation.error.message);
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
    throw new Error("No video URI returned");
  }

  return `${videoUri}&key=${process.env.API_KEY}`;
};