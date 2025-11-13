import React from 'react';
import { UserTier } from '../types';
import { X, CheckCircle, Zap, Star } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: UserTier) => void;
  themeClasses: {
    accentBg: string;
    accentBgHover: string;
  };
}

const TierCard: React.FC<{
  tier: UserTier;
  title: string;
  price: string;
  features: string[];
  icon: React.ReactNode;
  onSelect: () => void;
  themeClasses: { accentBg: string; accentBgHover: string; };
}> = ({ tier, title, price, features, icon, onSelect, themeClasses }) => (
  <div className="flex flex-col border rounded-xl p-6 bg-white shadow-sm hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-3">
      <div className="text-blue-600">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
    <p className="mt-4">
      <span className="text-4xl font-bold text-gray-900">${price}</span>
      <span className="text-gray-500">/ month</span>
    </p>
    <ul className="mt-6 space-y-3 text-gray-600 flex-grow">
      {features.map((feature, i) => (
        <li key={i} className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-500" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onSelect}
      className={`mt-8 w-full py-3 rounded-lg font-semibold text-white transition-colors ${themeClasses.accentBg} ${themeClasses.accentBgHover}`}
    >
      Purchase {title}
    </button>
  </div>
);

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onUpgrade, themeClasses }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-gray-50 rounded-2xl w-full max-w-4xl shadow-2xl transform transition-all duration-300 scale-95 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center border-b">
          <h2 className="text-2xl font-bold text-gray-800">Upgrade Your Axion AI Experience</h2>
          <p className="text-gray-500 mt-1">Unlock advanced features and unleash your creativity.</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <TierCard
                tier={UserTier.High}
                title="High Tier"
                price="10"
                features={["100 Generation Coins", "Priority Access", "Standard Image Models", "Basic Video Generation"]}
                icon={<Zap size={24} />}
                onSelect={() => onUpgrade(UserTier.High)}
                themeClasses={themeClasses}
            />
            <TierCard
                tier={UserTier.Extreme}
                title="Extreme Tier"
                price="25"
                features={["500 Generation Coins", "Highest Priority", "Advanced Image Models", "HD Video Generation", "Beta Feature Access"]}
                icon={<Star size={24} />}
                onSelect={() => onUpgrade(UserTier.Extreme)}
                themeClasses={themeClasses}
            />
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PricingModal;