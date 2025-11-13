import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    textColor?: string;
}

const Logo: React.FC<LogoProps> = ({ className, showText = true, textColor = 'text-gray-800' }) => {
  return (
    <div className={`flex items-center ${className}`}>
        <svg viewBox="0 0 180 120" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logo-a-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#4F89FF" />
                    <stop offset="100%" stopColor="#0D55FF" />
                </linearGradient>
            </defs>
            
            {/* 'A' Icon */}
            <g transform="translate(10, 18) scale(0.6)">
                <path d="M57.5,2.5 L108.8,97.5 L89.2,97.5 L78,75 L32,75 L20.8,97.5 L1.2,97.5 L52.5,2.5 L57.5,2.5 Z M71,62.5 L55,22.5 L39,62.5 L71,62.5 Z" fill="url(#logo-a-gradient)" />
                <path d="M102,40 C91.5,27 75,22 60,25 C45,28 35,38 32,50 C42,42 55,40 65,45 C75,50 82,60 85,70 C95,65 105,55 102,40 Z" fill="#9ca3af" opacity="0.8" />
                <circle cx="98" cy="38" r="6" fill="#4F89FF" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>

            {showText && (
                <g transform="translate(0, 95)">
                    <text x="0" y="0" fontFamily="Poppins, sans-serif" fontSize="24" fontWeight="700" fill={textColor === 'text-white' ? '#FFFFFF' : '#2D3748'}>
                        AXION AI
                    </text>
                    <text x="0" y="20" fontFamily="Poppins, sans-serif" fontSize="10" fontWeight="500" fill={textColor === 'text-white' ? '#E2E8F0' : '#4A5568'} letterSpacing="0.5">
                        INTELLIGENCE, REIMAGINED.
                    </text>
                </g>
            )}
        </svg>
    </div>
  );
};

export default Logo;
