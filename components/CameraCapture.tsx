import React, { useRef, useEffect, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Prefer back camera
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Convert to base64 jpeg
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        // Clean base64 string for API (remove data:image/jpeg;base64,)
        const rawBase64 = imageData.split(',')[1];
        onCapture(rawBase64);
        
        // Stop stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white p-2 bg-gray-800 rounded-full bg-opacity-50 z-50 hover:bg-opacity-70"
      >
        <X size={24} />
      </button>

      {error ? (
        <div className="text-white p-4 text-center">
          <p className="mb-4 text-red-400">{error}</p>
          <button onClick={onClose} className="px-4 py-2 bg-white text-black rounded-lg">
            Close Camera
          </button>
        </div>
      ) : (
        <>
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Overlay Grid for Professional Feel */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
               <div className="w-full h-full border-[1px] border-white/20 grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-white/20"></div>
                  <div className="border-r border-white/20"></div>
                  <div></div>
               </div>
            </div>
            
            {/* Viewfinder Corners */}
            <div className="absolute w-64 h-64 border-2 border-transparent">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
            </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center pb-safe">
            <button
              onClick={handleCapture}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-green-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
              <div className="relative w-20 h-20 bg-white rounded-full border-4 border-gray-200 flex items-center justify-center shadow-2xl">
                <div className="w-16 h-16 bg-gray-100 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <Camera className="text-gray-800" size={32} />
                </div>
              </div>
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
};

export default CameraCapture;