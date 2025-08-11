import React from 'react';
import { Shield, AlertTriangle, MessageSquare, BookOpen, Users, Settings } from 'lucide-react';

export default function MobileNavigation({ activeTab, setActiveTab, user }) {
  // Core tabs for mobile - focused on the 5 main features + admin for admin users
  const baseTabs = [
    { id: 'breach', label: 'Breach', icon: Shield, color: 'text-blue-600', description: 'Check' },
    { id: 'scam', label: 'Scam', icon: AlertTriangle, color: 'text-red-600', description: 'Analysis' },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, color: 'text-green-600', description: 'Assistant' },
    { id: 'learn', label: 'Learn', icon: BookOpen, color: 'text-teal-600', description: 'Hub' },
    { id: 'community', label: 'Community', icon: Users, color: 'text-orange-600', description: 'Hub' }
  ];

  // Add admin tab for admin users
  const tabs = user?.is_admin 
    ? [...baseTabs, { id: 'admin', label: 'Admin', icon: Settings, color: 'text-purple-600', description: 'Panel' }]
    : baseTabs;

  const handleTabClick = (tabId) => {
    // Check if user is authenticated for community access
    if (tabId === 'community' && !user) {
      // Could show a login prompt here
      setActiveTab('community');
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center py-2 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title={`${tab.label}: ${tab.description}`}
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
