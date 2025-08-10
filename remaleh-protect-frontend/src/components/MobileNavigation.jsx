import React from 'react';
import { Home, Shield, Users, User, MessageSquare, BookOpen, Settings } from 'lucide-react';

export default function MobileNavigation({ activeTab, setActiveTab, user }) {
  const tabs = [
    { id: 'breach', label: 'Breach', icon: Shield, color: 'text-blue-600' },
    { id: 'scam', label: 'Scam', icon: Shield, color: 'text-red-600' },
    { id: 'threats', label: 'Intel', icon: Home, color: 'text-green-600' },
    { id: 'profile', label: 'Profile', icon: User, color: 'text-purple-600' },
    { id: 'community', label: 'Community', icon: Users, color: 'text-orange-600' },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, color: 'text-indigo-600' },
    { id: 'learn', label: 'Learn', icon: BookOpen, color: 'text-teal-600' },
    ...(user?.is_admin ? [{ id: 'admin', label: 'Admin', icon: Settings, color: 'text-gray-600' }] : [])
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center py-2 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? tab.color : ''}`} />
              <span className={`text-xs font-medium ${isActive ? tab.color : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicators */}
      <div className="h-4 bg-white" />
    </div>
  );
}
