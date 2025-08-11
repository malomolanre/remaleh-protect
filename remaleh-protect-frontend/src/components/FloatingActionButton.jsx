import React, { useState } from 'react';
import { Plus, AlertTriangle, MessageSquare, Shield } from 'lucide-react';
import { Button } from './ui/button';

export default function FloatingActionButton({ onAction }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      icon: AlertTriangle,
      label: 'Report Scam',
      action: 'report-scam',
      color: 'bg-red-500 hover:bg-red-600',
      delay: 'delay-100'
    },
    {
      icon: MessageSquare,
      label: 'Ask AI',
      action: 'ask-ai',
      color: 'bg-blue-500 hover:bg-blue-600',
      delay: 'delay-200'
    },
    {
      icon: Shield,
      label: 'Breach Check',
      action: 'breach-check',
      color: 'bg-green-500 hover:bg-green-600',
      delay: 'delay-300'
    }
  ];

  const handleAction = (actionType) => {
    setIsExpanded(false);
    if (onAction) {
      onAction(actionType);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 md:hidden z-40">
      {/* Action Buttons */}
      {isExpanded && (
        <div className="mb-4 space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.action}
                className={`transform transition-all duration-300 ${action.delay} ${
                  isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
              >
                <Button
                  onClick={() => handleAction(action.action)}
                  className={`${action.color} text-white shadow-lg w-12 h-12 rounded-full flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5" />
                </Button>
                <span className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {action.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
      >
        <Plus 
          className={`w-6 h-6 transition-transform duration-300 ${
            isExpanded ? 'rotate-45' : 'rotate-0'
          }`} 
        />
      </Button>
    </div>
  );
}
