import React from 'react';
import { Users, MessageSquare, Flag, Bot, ArrowRight } from 'lucide-react';
import { MobileCard } from './ui/mobile-card';
import { MobileButton } from './ui/mobile-button';

export default function CommunityHub({ setActiveTab }) {
  const communityTools = [
    {
      id: 'community',
      title: 'Community Reports',
      description: 'Report threats and view community-reported security issues',
      icon: Flag,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: () => setActiveTab('community')
    },
    {
      id: 'chat',
      title: 'AI Assistant',
      description: 'Get help and answers from our AI security expert',
      icon: Bot,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      action: () => setActiveTab('chat')
    }
  ];

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-orange-100 rounded-full">
            <Users className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Community Hub</h1>
        <p className="text-gray-600 text-sm">Connect with the community and get AI assistance</p>
      </div>

      {/* Community Tools Grid */}
      <div className="space-y-3">
        {communityTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <MobileCard key={tool.id} className={`${tool.bgColor} border-0`}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-white`}>
                      <Icon className={`w-6 h-6 ${tool.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{tool.title}</h3>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                    </div>
                  </div>
                  <MobileButton
                    onClick={tool.action}
                    variant="ghost"
                    size="sm"
                    className="p-2"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </MobileButton>
                </div>
              </div>
            </MobileCard>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <MobileButton
            onClick={() => setActiveTab('community')}
            variant="outline"
            size="sm"
            className="flex items-center justify-center space-x-2"
          >
            <Flag className="w-4 h-4" />
            <span>Report Issue</span>
          </MobileButton>
          <MobileButton
            onClick={() => setActiveTab('chat')}
            variant="outline"
            size="sm"
            className="flex items-center justify-center space-x-2"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI</span>
          </MobileButton>
        </div>
      </div>

      {/* Community Benefits */}
      <div className="mt-6">
        <MobileCard className="bg-orange-50 border-orange-200">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">🤝 Community Benefits</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Report and track security threats</li>
              <li>• Learn from community experiences</li>
              <li>• Get instant AI assistance</li>
              <li>• Stay updated on security trends</li>
            </ul>
          </div>
        </MobileCard>
      </div>
    </div>
  );
}
