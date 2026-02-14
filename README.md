# BharatLens

**AI-Powered Local Business Discovery for India**

BharatLens is a mobile-first web application that allows users to scan any Indian shop's signboard using their phone camera and instantly get detailed business information. It uses Google Gemini 3 Flash Vision to analyze the image, extract the business name, category, products, prices, and detect the language of the signage across 7+ Indian languages with automatic transliteration. The app then generates a photorealistic promotional video using Veo 3.1's image-to-video capability, starting from the actual shop photo with native audio voiceover in the detected language. Built with React, TypeScript, and Firebase, BharatLens bridges the language barrier for India's 63 million small businesses, making local commerce discoverable and accessible to everyone.

## Features

- **Camera Scan** — Point your phone at any shop signboard to instantly analyze it
- **Multi-Language Support** — Detects Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati and more with transliteration
- **AI Business Analysis** — Extracts business name, category, products, prices, and location context using Gemini 3 Flash Vision
- **Photorealistic Video Generation** — Creates promotional videos using Veo 3.1 with the actual shop photo as the starting frame
- **Native Audio** — Language-aware voiceover and ambient Indian market sounds generated natively by Veo 3.1
- **Multi-Agent Architecture** — 6 AI agents (Vision, Language, Localization, Video, Knowledge, Distribution) working in parallel

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| AI Vision | Gemini 3 Flash Preview (multimodal) |
| Video Generation | Veo 3.1 (image-to-video + native audio) |
| Backend | Firebase |
| Styling | Tailwind CSS |

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. Set the `VITE_GEMINI_API_KEY` in `.env` to your Gemini API key
3. Run the app:
   ```
   npm run dev
   ```
4. Open `https://localhost:3000` in your browser

## How It Works

1. **Capture** — User takes a photo of a shop's signboard
2. **Analyze** — Gemini 3 Flash Vision extracts business details and detects the language
3. **Display** — Results shown with business name, transliteration, category, products and prices
4. **Generate Video** — Veo 3.1 creates a cinematic promo video using the shop photo as the first frame, with voiceover in the detected language

## Built For

Google AI Hackathon — showcasing Gemini 3 Flash Vision + Veo 3.1 image-to-video with native audio generation.
