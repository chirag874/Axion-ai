import React from 'react';
import { User, AppMode, UserTier, PersonalitySettings, PersonalityTone } from '../types';
import { BotMessageSquare, Sparkles, LineChart, LogOut, PanelLeftClose, PanelLeftOpen, Crown, BrainCircuit, Mic } from 'lucide-react';
import Logo from './ui/Logo';

interface SidebarProps {
  currentUser: User;
  currentMode: AppMode;
  setCurrentMode: (mode: AppMode) => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  onUpgradeClick: () => void;
  personalitySettings: PersonalitySettings;
  setPersonalitySettings: (settings: PersonalitySettings) => void;
  themeClasses: {
    borderColor: string;
    accentTextColor: string;
    accentActiveBg: string;
  };
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isSidebarOpen: boolean;
  onClick: () => void;
  themeClasses: { accentTextColor: string; accentActiveBg: string };
  isUpgrade?: boolean;
}> = ({ icon, label, isActive, isSidebarOpen, onClick, themeClasses, isUpgrade = false }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-3 my-1 rounded-lg transition-all duration-200 ease-in-out
      ${isActive
        ? `${themeClasses.accentActiveBg} ${themeClasses.accentTextColor} font-semibold`
        : isUpgrade
        ? `bg-blue-500/10 text-blue-600 hover:bg-blue-500/20`
        : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
      }
      ${!isSidebarOpen && 'justify-center'}
    `}
  >
    {icon}
    <span className={`ml-4 whitespace-nowrap font-semibold transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'}`}>{label}</span>
  </button>
);

const PersonalityControl: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ currentUser, currentMode, setCurrentMode, onLogout, isSidebarOpen, toggleSidebar, onUpgradeClick, personalitySettings, setPersonalitySettings, themeClasses }) => {
  const isOwner = currentUser.tier === UserTier.Owner;
  const ownerClasses = {
    avatarBorder: isOwner ? 'border-yellow-400' : `border-blue-400`,
    profileBg: isOwner ? 'bg-yellow-100/50' : 'bg-gray-100',
  };
  
  const handleSettingsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonalitySettings({
      ...personalitySettings,
      [name]: value,
    });
  };

  return (
    <aside className={`flex-shrink-0 flex flex-col bg-white border-r ${themeClasses.borderColor} transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className={`flex items-center justify-center p-4 h-[65px] border-b ${themeClasses.borderColor}`}>
         <Logo className={`transition-all duration-300 ${isSidebarOpen ? 'h-8' : 'h-10'}`} showText={isSidebarOpen} />
      </div>
      
      <div className="flex-grow p-3 overflow-y-auto">
        <nav className="flex flex-col">
          <NavItem
            icon={<BotMessageSquare size={20} />}
            label="Chat"
            isActive={currentMode === AppMode.Chat}
            onClick={() => setCurrentMode(AppMode.Chat)}
            themeClasses={themeClasses}
            isSidebarOpen={isSidebarOpen}
          />
           <NavItem
            icon={<Mic size={20} />}
            label="Conversation"
            isActive={currentMode === AppMode.Conversation}
            onClick={() => setCurrentMode(AppMode.Conversation)}
            themeClasses={themeClasses}
            isSidebarOpen={isSidebarOpen}
          />
          <NavItem
            icon={<Sparkles size={20} />}
            label="Generate"
            isActive={currentMode === AppMode.Generate}
            onClick={() => setCurrentMode(AppMode.Generate)}
            themeClasses={themeClasses}
            isSidebarOpen={isSidebarOpen}
          />
          <NavItem
            icon={<LineChart size={20} />}
            label="Invest"
            isActive={currentMode === AppMode.Invest}
            onClick={() => setCurrentMode(AppMode.Invest)}
            themeClasses={themeClasses}
            isSidebarOpen={isSidebarOpen}
          />
        </nav>
        
        <div className={`mt-6 pt-4 border-t ${themeClasses.borderColor} space-y-4 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="px-3 flex items-center gap-2 text-gray-700 font-semibold">
                <BrainCircuit size={18} className={themeClasses.accentTextColor}/>
                Personality
            </div>
             <div className="px-3 space-y-4">
                <PersonalityControl label="Tone">
                    <select name="tone" value={personalitySettings.tone} onChange={handleSettingsChange} className={`w-full p-2 mt-1 bg-gray-100 border ${themeClasses.borderColor} rounded-md text-sm`}>
                        {Object.values(PersonalityTone).map(tone => <option key={tone} value={tone}>{tone}</option>)}
                    </select>
                </PersonalityControl>
                 <PersonalityControl label="Emoji Balance">
                    <select name="emojiBalance" value={personalitySettings.emojiBalance} onChange={handleSettingsChange} className={`w-full p-2 mt-1 bg-gray-100 border ${themeClasses.borderColor} rounded-md text-sm`}>
                        <option value="Light">Light</option>
                        <option value="Normal">Normal</option>
                        <option value="Heavy">Heavy</option>
                    </select>
                </PersonalityControl>
                 <PersonalityControl label="Question Frequency">
                    <select name="questionFrequency" value={personalitySettings.questionFrequency} onChange={handleSettingsChange} className={`w-full p-2 mt-1 bg-gray-100 border ${themeClasses.borderColor} rounded-md text-sm`}>
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                    </select>
                </PersonalityControl>
            </div>
        </div>
      </div>

      <div className={`border-t ${themeClasses.borderColor} p-3`}>
          {currentUser.tier === UserTier.Free && (
            <NavItem
                icon={<Crown size={20} />}
                label="Upgrade Plan"
                isActive={false}
                onClick={onUpgradeClick}
                themeClasses={themeClasses}
                isSidebarOpen={isSidebarOpen}
                isUpgrade={true}
            />
          )}

          <div className={`flex items-center p-2 my-2 rounded-lg ${ownerClasses.profileBg} overflow-hidden`}>
            <img src={currentUser.avatar} alt="User Avatar" className={`w-10 h-10 rounded-full border-2 flex-shrink-0 ${ownerClasses.avatarBorder}`} />
            <div className={`ml-3 text-left transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'}`}>
              <h2 className="font-semibold text-sm text-gray-800 truncate">{currentUser.name}</h2>
              <p className={`text-xs font-medium ${isOwner ? themeClasses.accentTextColor : 'text-gray-500'}`}>{currentUser.tier}</p>
            </div>
          </div>
        
         <NavItem
            icon={<LogOut size={20} />}
            label="Logout"
            isActive={false}
            onClick={onLogout}
            themeClasses={{accentTextColor: 'text-red-600', accentActiveBg: 'bg-red-100'}}
            isSidebarOpen={isSidebarOpen}
          />
         <button onClick={toggleSidebar} className={`w-full flex items-center p-3 mt-1 rounded-lg text-gray-500 hover:bg-gray-200 ${!isSidebarOpen && 'justify-center'}`}>
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            <span className={`ml-4 font-semibold whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'}`}>Collapse</span>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;