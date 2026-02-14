import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Menu, Zap } from 'lucide-react';
import CameraCapture from './components/CameraCapture';
import AgentOrchestrator from './components/AgentOrchestrator';
import ResultsView from './components/ResultsView';
import { analyzeBusinessImage, getCityFromCoords } from './services/geminiService';
import { getCurrentLocation } from './services/locationService';
import { AnalysisStage, BusinessData, GeoLocation } from './types';

const App: React.FC = () => {
  const [stage, setStage] = useState<AnalysisStage>(AnalysisStage.IDLE);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<BusinessData | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [city, setCity] = useState<string>("Locating...");

  useEffect(() => {
    // Initialize location on mount
    const initLocation = async () => {
      try {
        const loc = await getCurrentLocation();
        setLocation(loc);
        if (loc.lat && loc.lng) {
          const detectedCity = await getCityFromCoords(loc.lat, loc.lng);
          setCity(detectedCity);
        } else if (loc.error) {
          setCity("Location Unavailable");
        }
      } catch (e) {
        console.error("Location error", e);
        setCity("India");
      }
    };
    initLocation();
  }, []);

  const handleCapture = async (base64Image: string) => {
    setCapturedImage(base64Image);
    setStage(AnalysisStage.PROCESSING);

    try {
      // Start the analysis concurrently with the UI showing processing
      // We pass the location context to Gemini for better accuracy
      const locationContext = city !== "Locating..." ? city : "India";

      // Delay slightly to let the "Agents" UI show up for at least a few seconds for effect
      const [data] = await Promise.all([
        analyzeBusinessImage(base64Image, locationContext),
        new Promise(resolve => setTimeout(resolve, 3800)) // Match Orchestrator duration approx
      ]);

      setAnalysisResult(data);
      setStage(AnalysisStage.COMPLETE);
    } catch (error) {
      console.error("Analysis failed", error);
      setStage(AnalysisStage.ERROR);
    }
  };

  const resetApp = () => {
    setStage(AnalysisStage.IDLE);
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FFF5E6] via-white to-[#E6F4EA]">
      {/* Background Flag Gradient Mesh (Subtle) */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-200/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-green-200/20 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/70 border-b border-white/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 via-white to-green-600 flex items-center justify-center shadow-md">
            <Zap size={18} className="text-gray-800 fill-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Bharat<span className="text-orange-600">Lens</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white/80 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
          <MapPin size={14} className="text-green-600" />
          <span className="max-w-[100px] truncate">{city}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 px-4 pb-10 max-w-lg mx-auto min-h-screen flex flex-col">

        {stage === AnalysisStage.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">

            <div className="relative">
              <div className="absolute inset-0 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse-ring"></div>
              <div className="relative w-48 h-48 bg-gradient-to-br from-orange-100 to-green-100 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                <img
                  src="https://picsum.photos/400/400?grayscale"
                  alt="Demo"
                  className="w-full h-full object-cover rounded-full opacity-50 mix-blend-overlay"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={64} className="text-gray-700 opacity-80" />
                </div>
              </div>
            </div>

            <div className="space-y-2 max-w-xs">
              <h2 className="text-3xl font-bold text-gray-800">
                Scan Local Business
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Point your camera at any shop board to get instant details, prices, and translations in
                <span className="font-semibold text-orange-600 mx-1">7+ Indian languages</span>.
              </p>
            </div>

            <button
              onClick={() => setStage(AnalysisStage.CAPTURING)}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <Camera className="text-orange-400" />
              Open Camera
            </button>

            <div className="flex gap-4 text-xs text-gray-400 uppercase tracking-widest">
              <span>Hindi</span> • <span>Tamil</span> • <span>Kannada</span> • <span>Telugu</span> • <span>More</span>
            </div>
          </div>
        )}

        {stage === AnalysisStage.CAPTURING && (
          <CameraCapture
            onCapture={handleCapture}
            onClose={() => setStage(AnalysisStage.IDLE)}
          />
        )}

        {stage === AnalysisStage.PROCESSING && (
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Show captured image thumbnail */}
            {capturedImage && (
              <div className="w-24 h-24 mb-8 rounded-xl overflow-hidden border-4 border-white shadow-lg relative">
                <img src={`data:image/jpeg;base64,${capturedImage}`} className="w-full h-full object-cover" alt="Captured" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            )}
            <AgentOrchestrator onComplete={() => { }} />
          </div>
        )}

        {stage === AnalysisStage.COMPLETE && analysisResult && (
          <ResultsView
            data={analysisResult}
            onReset={resetApp}
            locationName={city}
            capturedImage={capturedImage}
          />
        )}

        {stage === AnalysisStage.ERROR && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Zap size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Analysis Failed</h3>
            <p className="text-gray-500 mb-6">We couldn't read the image clearly. Please try moving closer to the signboard.</p>
            <button
              onClick={resetApp}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800"
            >
              Try Again
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;