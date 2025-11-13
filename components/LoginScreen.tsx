import React, { useState } from 'react';
import { User, UserTier } from '../types';
import { USERS } from '../constants';
import { Sparkles, UserPlus, LogIn } from 'lucide-react';
import Logo from './ui/Logo';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

// Moved FormInput outside the main component to prevent re-renders from breaking focus.
const FormInput: React.FC<{ type: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ type, placeholder, value, onChange }) => (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    />
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginView) {
      // Simulated login
      if (email.toLowerCase() === USERS.owner.email.toLowerCase()) {
        onLogin(USERS.owner);
      } else {
        // Log in any other user as guest
        onLogin(USERS.free);
      }
    } else {
      // Simulated sign-up
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: name || 'New User',
        email: email,
        tier: UserTier.Free,
        avatar: `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100)}`,
        coins: 10,
      };
      onLogin(newUser);
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center p-4 text-gray-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.3),rgba(255,255,255,0))]"></div>
        <div className="z-10 flex flex-col items-center text-center max-w-md w-full">
            <Logo className="h-24" textColor="text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">Welcome to Axion AI</h1>
            <p className="text-md text-gray-400 mt-2 mb-8">
              {isLoginView ? 'Sign in to continue your journey.' : 'Create an account to begin.'}
            </p>

            <div className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 shadow-2xl">
              <div className="flex border-b border-gray-700 mb-6">
                <button 
                  onClick={() => setIsLoginView(true)}
                  className={`w-1/2 pb-3 font-semibold transition-colors ${isLoginView ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setIsLoginView(false)}
                  className={`w-1/2 pb-3 font-semibold transition-colors ${!isLoginView ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginView && (
                  <FormInput type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
                )}
                <FormInput type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
                <FormInput type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300"
                >
                  {isLoginView ? <><LogIn size={18}/><span>Login</span></> : <><UserPlus size={18}/><span>Create Account</span></>}
                </button>
              </form>
            </div>
            
            <button
                onClick={() => onLogin(USERS.owner)}
                className="group flex items-center justify-center gap-2 text-sm text-yellow-400/70 hover:text-yellow-400 transition-colors duration-300 mt-6"
            >
                <Sparkles size={14} className="transition-transform group-hover:scale-125" />
                Creator Login
            </button>
        </div>
    </div>
  );
};

export default LoginScreen;