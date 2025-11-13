import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-1.5 px-2">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-delay-150"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-delay-300"></div>
       <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .animate-bounce {
          animation: bounce 1.2s infinite ease-in-out;
        }
        .animate-bounce-delay-150 {
           animation: bounce 1.2s infinite ease-in-out;
           animation-delay: 0.15s;
        }
        .animate-bounce-delay-300 {
           animation: bounce 1.2s infinite ease-in-out;
           animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
