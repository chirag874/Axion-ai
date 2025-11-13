import React, { useState, useMemo, useEffect } from 'react';
import { User, AppMode, UserTier, PersonalitySettings, PersonalityTone, ChatMessage } from './types';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import GenerativeStudio from './components/GenerativeStudio';
import InvestmentAdvisor from './components/InvestmentAdvisor';
import LoginScreen from './components/LoginScreen';
import LoadingScreen from './components/LoadingScreen';
import PricingModal from './components/PricingModal';
import ConversationMode from './components/ConversationMode';
import { USERS } from './constants';


const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.Chat);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [personalitySettings, setPersonalitySettings] = useState<PersonalitySettings>({
    tone: PersonalityTone.Friendly,
    emojiBalance: 'Normal',
    questionFrequency: 'Normal',
  });
  
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
    try {
        const storedHistories = localStorage.getItem('axion-chat-histories');
        return storedHistories ? JSON.parse(storedHistories) : {};
    } catch (error) {
        console.error("Failed to load chat histories:", error);
        return {};
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('axion-chat-histories', JSON.stringify(chatHistories));
    } catch (error) {
        console.error("Failed to save chat histories:", error);
    }
}, [chatHistories]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentMode(AppMode.Chat);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpgrade = (tier: UserTier) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        tier,
        coins: tier === UserTier.High ? 100 : 500,
      });
      setIsPricingModalOpen(false);
    }
  };

  const isOwner = useMemo(() => currentUser?.tier === UserTier.Owner, [currentUser]);

  const themeClasses = {
    bg: isOwner ? 'bg-yellow-50' : 'bg-gray-100',
    mainBg: 'bg-white',
    borderColor: isOwner ? 'border-yellow-300' : 'border-gray-200',
    accentTextColor: isOwner ? 'text-yellow-600' : 'text-blue-600',
    accentBg: isOwner ? 'bg-yellow-500' : 'bg-blue-600',
    accentBgHover: isOwner ? 'hover:bg-yellow-600' : 'hover:bg-blue-700',
    accentActiveBg: isOwner ? 'bg-yellow-100' : 'bg-blue-100',
  };
  
  const currentMessages = useMemo(() => {
    if (!currentUser) return [];
    return chatHistories[currentUser.id] || [];
  }, [currentUser, chatHistories]);

  const handleSetMessages = (messages: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[])) => {
    if (currentUser) {
        setChatHistories(prev => {
            const oldMessages = prev[currentUser.id] || [];
            const newMessages = typeof messages === 'function' ? messages(oldMessages) : messages;
            return {
                ...prev,
                [currentUser.id]: newMessages,
            };
        });
    }
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (currentMode) {
      case AppMode.Chat:
        return <ChatWindow 
                    currentUser={currentUser} 
                    themeClasses={themeClasses} 
                    personalitySettings={personalitySettings}
                    messages={currentMessages}
                    setMessages={handleSetMessages}
                />;
      case AppMode.Generate:
        return <GenerativeStudio currentUser={currentUser} themeClasses={themeClasses} />;
      case AppMode.Invest:
        return <InvestmentAdvisor currentUser={currentUser} themeClasses={themeClasses} />;
      default:
        return <ChatWindow 
                    currentUser={currentUser} 
                    themeClasses={themeClasses} 
                    personalitySettings={personalitySettings}
                    messages={currentMessages}
                    setMessages={handleSetMessages}
                />;
    }
  };
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  
  if (currentMode === AppMode.Conversation) {
    return <ConversationMode onExit={() => setCurrentMode(AppMode.Chat)} />;
  }

  return (
    <div className={`flex h-screen w-full font-sans ${themeClasses.bg} text-gray-800`}>
      <Sidebar
        currentUser={currentUser}
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        onLogout={handleLogout}
        themeClasses={themeClasses}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onUpgradeClick={() => setIsPricingModalOpen(true)}
        personalitySettings={personalitySettings}
        setPersonalitySettings={setPersonalitySettings}
      />
      <main className={`flex-1 flex flex-col p-4 transition-all duration-300 ${isSidebarOpen ? 'ml-0' : '-ml-44'}`}>
        <div className={`flex-1 flex flex-col border rounded-xl shadow-sm overflow-hidden ${themeClasses.mainBg} ${themeClasses.borderColor}`}>
          {renderContent()}
        </div>
      </main>
      <PricingModal 
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onUpgrade={handleUpgrade}
        themeClasses={themeClasses}
      />
    </div>
  );
};

export default App;