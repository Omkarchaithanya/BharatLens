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

export const generateBusinessVideo = async (businessName: string, category: string, city: string, summary: string): Promise<string> => {
    // IMPORTANT: Create a new instance to ensure we pick up the latest API Key if user just selected it
    const latestAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `A cinematic, professional commercial shot of a ${category} named "${businessName}" in ${city}, India. ${summary}. High quality, 4k, slow motion, warm lighting, bustling atmosphere.`;
    
    console.log("Generating video with prompt:", prompt);

    let operation = await latestAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });

    console.log("Video generation started...");

    // Poll for completion
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
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

    // Append API Key to the download link as per documentation
    return `${videoUri}&key=${process.env.API_KEY}`;
};