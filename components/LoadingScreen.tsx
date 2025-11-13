import React from 'react';
import Logo from './ui/Logo';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-8 font-sans text-gray-200">
      <div className="animate-pulse">
        <Logo className="h-20" textColor="text-white" />
      </div>
      <div className="relative w-64 h-1 bg-gray-800 rounded-full overflow-hidden mt-8">
        <div className="absolute top-0 left-0 h-full bg-blue-500 animate-loading-bar"></div>
      </div>
      <p className="text-sm text-gray-400 mt-6 tracking-widest animate-pulse">
        INITIALIZING AXION AI...
      </p>
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 2.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;