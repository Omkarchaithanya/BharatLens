import React, { useEffect, useState } from 'react';
import { BusinessData } from '../types';
import { MapPin, Info, Tag, Layers, Share2, Star, Clapperboard, Loader2, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateBusinessVideo } from '../services/geminiService';

interface ResultsViewProps {
  data: BusinessData;
  onReset: () => void;
  locationName?: string;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }
  
  interface Window {
    aistudio?: AIStudio;
  }
}

const ResultsView: React.FC<ResultsViewProps> = ({ data, onReset, locationName }) => {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    // Trigger confetti celebration on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
    
    return () => clearInterval(interval);
  }, []);

  const handleGenerateVideo = async () => {
    try {
        setVideoError(null);
        
        // 1. Check API Key
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
                // Assume success and proceed, or user can click again
            }
        }

        setIsGeneratingVideo(true);
        const uri = await generateBusinessVideo(
            data.businessName, 
            data.category, 
            data.addressContext || locationName || "India", 
            data.summary
        );
        setVideoUri(uri);
    } catch (e: any) {
        console.error("Video Generation Error", e);
        setVideoError("Failed to generate video. " + (e.message || ""));
    } finally {
        setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Main Business Card */}
      <div className="glass-card rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden">
        {/* Decorative Indian Flag Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-500"></div>

        <div className="flex justify-between items-start mb-2 mt-2">
           <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
             {data.category || "Business"}
           </span>
           <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
             <Star size={10} className="text-yellow-400 fill-yellow-400"/> {data.confidence}% Match
           </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-1">
          {data.businessName}
        </h1>
        {data.transliteration && (
            <p className="text-lg text-gray-500 italic mb-3 font-serif">
                "{data.transliteration}"
            </p>
        )}

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <MapPin size={16} className="mr-1 text-green-600" />
          {data.addressContext || locationName || "Unknown Location"}
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-700 leading-relaxed italic">
               <span className="text-2xl mr-1">"</span>
               {data.summary}
               <span className="text-2xl ml-1">"</span>
            </p>
        </div>
      </div>

      {/* Video Generation Section */}
      <div className="mb-6">
        {!videoUri ? (
            <button 
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                    isGeneratingVideo 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-[1.02] shadow-indigo-200'
                }`}
            >
                {isGeneratingVideo ? (
                    <>
                        <Loader2 className="animate-spin" /> Generating Cinematic Video...
                    </>
                ) : (
                    <>
                        <Clapperboard className="fill-white/20" /> Generate Promo Video
                    </>
                )}
            </button>
        ) : (
            <div className="rounded-xl overflow-hidden shadow-lg border-2 border-indigo-100 bg-black">
                <video 
                    src={videoUri} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full aspect-video object-cover"
                />
                <div className="bg-indigo-50 p-2 text-center text-xs text-indigo-700 font-medium">
                    ✨ Generated with Veo 3.1
                </div>
            </div>
        )}
        {videoError && (
            <p className="text-xs text-red-500 text-center mt-2">{videoError}</p>
        )}
      </div>

      {/* Language & Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <span className="text-gray-400 text-xs uppercase font-semibold mb-1">Language</span>
             <span className="text-xl font-bold text-indigo-600">{data.detectedLanguage}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <span className="text-gray-400 text-xs uppercase font-semibold mb-1">Items Found</span>
             <span className="text-xl font-bold text-green-600">{data.products?.length || 0}</span>
        </div>
      </div>

      {/* Products List */}
      {data.products && data.products.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Tag size={16} /> Products & Services
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {data.products.map((product, idx) => (
              <div key={idx} className="px-5 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                   <p className="font-medium text-gray-800">{product.name}</p>
                   {product.category && <p className="text-xs text-gray-400">{product.category}</p>}
                </div>
                {product.price && (
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-sm font-bold">
                        {product.price}
                    </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={onReset}
          className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <Layers size={18} />
          Scan Another
        </button>
        <button 
          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Share2 size={18} />
          Share Info
        </button>
      </div>
      
    </div>
  );
};

export default ResultsView;