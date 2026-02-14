import React, { useEffect, useState } from 'react';
import { AgentStatus } from '../types';
import { Eye, Globe, MapPin, Clapperboard, BookOpen, Share2, CheckCircle2, Loader2, Circle } from 'lucide-react';

interface AgentOrchestratorProps {
  onComplete: () => void;
}

const AgentOrchestrator: React.FC<AgentOrchestratorProps> = ({ onComplete }) => {
  const [agents, setAgents] = useState<AgentStatus[]>([
    { id: 'vision', name: 'Vision Agent', status: 'pending', progress: 0, message: 'Waiting to analyze...', icon: Eye },
    { id: 'lang', name: 'Language Agent', status: 'pending', progress: 0, message: 'Ready to detect...', icon: Globe },
    { id: 'local', name: 'Localization Agent', status: 'pending', progress: 0, message: 'Locating context...', icon: MapPin },
    { id: 'video', name: 'Video Agent', status: 'pending', progress: 0, message: 'Queued for generation...', icon: Clapperboard },
    { id: 'know', name: 'Knowledge Agent', status: 'pending', progress: 0, message: 'Database standby...', icon: BookOpen },
    { id: 'dist', name: 'Distribution Agent', status: 'pending', progress: 0, message: 'Sharing optimized...', icon: Share2 },
  ]);

  useEffect(() => {
    const totalDuration = 3500; // slightly longer to show off animations
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const overallProgress = Math.min(elapsed / totalDuration, 1);

      setAgents(prev => prev.map((agent, index) => {
        // Stagger agents starting
        const startThreshold = index * 0.1;
        // Each agent takes about 40% of the total time to complete once started
        const endThreshold = startThreshold + 0.4;
        
        let localProgress = 0;
        let status: 'pending' | 'working' | 'done' = 'pending';
        let message = agent.message;

        if (overallProgress < startThreshold) {
            status = 'pending';
            localProgress = 0;
        } else if (overallProgress >= startThreshold && overallProgress < endThreshold) {
            status = 'working';
            // Normalize progress between 0 and 1 for this specific agent's window
            localProgress = (overallProgress - startThreshold) / (endThreshold - startThreshold);
            message = getActiveMessage(agent.id);
        } else {
            status = 'done';
            localProgress = 1;
            message = 'Complete';
        }

        return { ...agent, status, progress: localProgress * 100, message };
      }));

      if (elapsed >= totalDuration + 500) {
        clearInterval(interval);
        onComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  const getActiveMessage = (id: string) => {
    switch(id) {
        case 'vision': return 'Analyzing image...';
        case 'lang': return 'Detecting languages...';
        case 'local': return 'Getting local context...';
        case 'video': return 'Preparing video generation...';
        case 'know': return 'Building database...';
        case 'dist': return 'Optimizing sharing...';
        default: return 'Processing...';
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {agents.map((agent) => {
        const Icon = agent.icon;
        return (
          <div 
            key={agent.id}
            className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
              agent.status === 'done' 
                ? 'bg-green-50 border-green-200' 
                : agent.status === 'working'
                  ? 'bg-white border-orange-300 shadow-lg scale-[1.02]'
                  : 'bg-gray-50 border-gray-100 opacity-70'
            }`}
          >
            {/* Progress Background */}
            {agent.status === 'working' && (
                <div 
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-100" 
                    style={{ width: `${agent.progress}%` }}
                />
            )}

            <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${
                    agent.status === 'done' ? 'bg-green-100 text-green-600' :
                    agent.status === 'working' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-200 text-gray-400'
                }`}>
                    <Icon size={20} />
                </div>
                <div>
                    {agent.status === 'done' && <CheckCircle2 size={20} className="text-green-500" />}
                    {agent.status === 'working' && <Loader2 size={20} className="text-orange-500 animate-spin" />}
                    {agent.status === 'pending' && <Circle size={20} className="text-gray-300" />}
                </div>
            </div>

            <h4 className={`font-semibold text-sm mb-1 ${
                agent.status === 'pending' ? 'text-gray-500' : 'text-gray-800'
            }`}>
                {agent.name}
            </h4>
            <p className="text-xs text-gray-500 truncate">
                {agent.message}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AgentOrchestrator;