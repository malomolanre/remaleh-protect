import React, { useState } from 'react';
import { MessageSquare, Lock, BookOpen, Shield } from 'lucide-react';
import './App.css';
import ScamAnalysis from './components/ScamAnalysis';
import BreachChecker from './components/BreachChecker';
import LearnHub from './components/LearnHub';
import ChatAssistant from './components/ChatAssistant';

function App() {
  const [activeTab, setActiveTab] = useState('check');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm p-4 flex justify-center">
        <img src="/remaleh-logo-full.png" alt="Remaleh" className="h-8 w-auto object-contain" />
      </header>

      <div className="bg-gradient-to-br from-[#21a1ce] to-[#1a80a3] text-white text-center py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Stay Safe in Our Connected World</h1>
        <p className="text-xl">Your Digital Well-Being Is Our Paramount Commitment</p>
      </div>

      {activeTab === 'check' && <ScamAnalysis />}
      {activeTab === 'passwords' && <BreachChecker />}
      {activeTab === 'learn' && <LearnHub />}
      {activeTab === 'help' && <ChatAssistant />}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button
            onClick={() => handleTabChange('check')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === 'check' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
            }`}
          >
            <MessageSquare size={20} />
            <span className="text-xs mt-1">Check that Text</span>
          </button>
          
          <button
            onClick={() => handleTabChange('passwords')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === 'passwords' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
            }`}
          >
            <Lock size={20} />
            <span className="text-xs mt-1">Password Still Safe?</span>
          </button>
          
          <button
            onClick={() => handleTabChange('learn')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === 'learn' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
            }`}
          >
            <BookOpen size={20} />
            <span className="text-xs mt-1">Cyber Sensei</span>
          </button>
          
          <button
            onClick={() => handleTabChange('help')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === 'help' ? 'bg-[#21a1ce] text-white' : 'text-gray-600'
            }`}
          >
            <Shield size={20} />
            <span className="text-xs mt-1">Help Me!</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-6 mt-8">
        <div className="flex items-center justify-center mb-2">
          <Shield className="text-[#21a1ce] mr-2" size={20} />
          <span className="font-medium">Remaleh - Your Digital Guardian</span>
        </div>
        <p className="text-sm text-gray-400">
          Protecting Australian families in the digital world
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Visit our blog at <a href="https://www.remaleh.com.au/blog" className="text-[#21a1ce] hover:underline">remaleh.com.au/blog</a> for more cybersecurity tips
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Copyright © 2025 Remaleh
        </p>
      </footer>
    </div>
  );
}

export default App;

