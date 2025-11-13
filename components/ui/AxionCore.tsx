import React from 'react';

type CoreState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking' | 'error';

interface AxionCoreProps {
  state: CoreState;
}

const AxionCore: React.FC<AxionCoreProps> = ({ state }) => {
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';

  return (
    <div className="relative w-full max-w-xs aspect-square">
       <style>{`
        .axion-core-ring {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .axion-spinner {
          animation: spin 20s linear infinite;
        }
        .axion-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
      `}</style>
      <svg viewBox="0 0 200 200" className={`w-full h-full transform transition-transform duration-300 ease-in-out ${isListening ? 'scale-110' : 'scale-100'}`}>
        <defs>
          <radialGradient id="axion-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Glow */}
        <circle cx="100" cy="100" r="80" fill="url(#axion-glow)" className={`axion-core-ring ${isListening ? 'opacity-100' : 'opacity-70'}`} />

        {/* Outer ring */}
        <circle cx="100" cy="100" r="95" fill="none" stroke="#dbeafe" strokeWidth="2" className="axion-spinner" style={{ animationDirection: 'reverse' }} />

        {/* Outer Ticks */}
        <g transform="translate(100, 100)" className="axion-spinner">
          {Array.from({ length: 60 }).map((_, i) => (
            <line
              key={i}
              x1="0" y1="-88"
              x2="0" y2={i % 5 === 0 ? "-95" : "-92"}
              stroke="#93c5fd"
              strokeWidth={i % 5 === 0 ? "1.5" : "1"}
              transform={`rotate(${i * 6})`}
            />
          ))}
        </g>
        
        {/* Speaking indicator ring */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="6"
          className={`axion-core-ring ${isSpeaking ? 'opacity-70 axion-pulse' : 'opacity-0'}`}
          strokeDasharray="10 20"
          strokeLinecap="round"
        />

        {/* Main inner ring */}
        <circle cx="100" cy="100" r="70" fill="none" stroke="#60a5fa" strokeWidth="4" />
        
        {/* Listening indicator segment */}
        <path 
            d="M 100, 30 A 70,70 0 1,1 150,170" 
            fill="none" 
            stroke="#facc15" 
            strokeWidth="4" 
            className={`axion-core-ring ${isListening ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Center Text */}
        <text x="100" y="105" textAnchor="middle" fill="#1e3a8a" fontSize="24" fontWeight="bold" letterSpacing="2" fontFamily="Poppins, sans-serif">
          AXION
        </text>
      </svg>
    </div>
  );
};

export default AxionCore;
