import React, { useEffect, useState } from 'react';
import { AgentStatus } from '../types';
import { Scan, Globe, Tag, ShoppingBag, IndianRupee, MapPin, CheckCircle2, Loader2 } from 'lucide-react';

interface ProcessingAgentsProps {
  onComplete: () => void;
}

const ProcessingAgents: React.FC<ProcessingAgentsProps> = ({ onComplete }) => {
  const [agents, setAgents] = useState<AgentStatus[]>([
    { id: 'ocr', name: 'Script Recognition', status: 'pending' },
    { id: 'lang', name: 'Language Detector', status: 'pending' },
    { id: 'trans', name: 'Transliteration Engine', status: 'pending' },
    { id: 'entity', name: 'Entity Extraction', status: 'pending' },
    { id: 'price', name: 'Price Intelligence', status: 'pending' },
    { id: 'geo', name: 'Geospatial Verifier', status: 'pending' },
  ]);

  useEffect(() => {
    // Simulate parallel processing visualization
    const intervals: ReturnType<typeof setTimeout>[] = [];

    agents.forEach((agent, index) => {
      // Stagger start times
      const startDelay = index * 300; 
      
      const startTimeout = setTimeout(() => {
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'working' } : a));
        
        // Processing time varies for effect
        const workDuration = 1000 + Math.random() * 1500;
        
        const finishTimeout = setTimeout(() => {
          setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'done' } : a));
        }, workDuration);
        
        intervals.push(finishTimeout);
      }, startDelay);
      
      intervals.push(startTimeout);
    });

    // Fallback cleanup if real analysis finishes faster or slower
    return () => {
      intervals.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIcon = (id: string) => {
    switch(id) {
      case 'ocr': return <Scan size={18} />;
      case 'lang': return <Globe size={18} />;
      case 'trans': return <TypeIcon />;
      case 'entity': return <Tag size={18} />;
      case 'price': return <IndianRupee size={18} />;
      case 'geo': return <MapPin size={18} />;
      default: return <Scan size={18} />;
    }
  };

  const TypeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7"></polyline>
      <line x1="9" y1="20" x2="15" y2="20"></line>
      <line x1="12" y1="4" x2="12" y2="20"></line>
    </svg>
  );

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 animate-pulse">Analyzing Business...</h3>
        <p className="text-sm text-gray-500">Deploying 6 intelligence agents</p>
      </div>
      
      {/* Vertical Stacking: grid-cols-1 ensures vertical layout on all devices including mobile */}
      <div className="grid grid-cols-1 gap-3">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
              agent.status === 'done' 
                ? 'bg-green-50 border-green-200 shadow-sm' 
                : agent.status === 'working'
                  ? 'bg-white border-orange-200 shadow-md scale-105 animate-pulse'
                  : 'bg-gray-50 border-gray-100 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full transition-colors duration-300 ${
                agent.status === 'done' ? 'bg-green-100 text-green-600' : 
                agent.status === 'working' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-400'
              }`}>
                {getIcon(agent.id)}
              </div>
              <span className={`font-medium transition-colors duration-300 ${agent.status === 'done' ? 'text-gray-800' : 'text-gray-600'}`}>
                {agent.name}
              </span>
            </div>
            
            <div>
              {agent.status === 'done' && <CheckCircle2 className="text-green-500" size={20} />}
              {agent.status === 'working' && <Loader2 className="animate-spin text-orange-500" size={20} />}
              {agent.status === 'pending' && <div className="w-2 h-2 rounded-full bg-gray-300" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingAgents;