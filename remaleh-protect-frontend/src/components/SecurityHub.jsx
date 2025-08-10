import React from 'react';
import { Shield, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import { MobileCard } from './ui/mobile-card';
import { MobileButton } from './ui/mobile-button';

export default function SecurityHub({ setActiveTab }) {
  const securityTools = [
    {
      id: 'breach',
      title: 'Breach Checker',
      description: 'Check if your accounts have been compromised in data breaches',
      icon: Lock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => setActiveTab('breach')
    },
    {
      id: 'scam',
      title: 'Scam Analysis',
      description: 'Analyze suspicious messages, emails, and links for potential scams',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      action: () => setActiveTab('scam')
    }
  ];

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Security Tools</h1>
        <p className="text-gray-600 text-sm">Choose your security tool to get started</p>
      </div>

      {/* Security Tools Grid */}
      <div className="space-y-3">
        {securityTools.map((tool) => {
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
            onClick={() => setActiveTab('breach')}
            variant="outline"
            size="sm"
            className="flex items-center justify-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>Quick Check</span>
          </MobileButton>
          <MobileButton
            onClick={() => setActiveTab('scam')}
            variant="outline"
            size="sm"
            className="flex items-center justify-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Scan Message</span>
          </MobileButton>
        </div>
      </div>

      {/* Security Tips */}
      <div className="mt-6">
        <MobileCard className="bg-gray-50 border-gray-200">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Security Tip</h3>
            <p className="text-sm text-gray-600">
              Regularly check your accounts for breaches and be cautious of suspicious messages. 
              Use both tools for comprehensive security coverage.
            </p>
          </div>
        </MobileCard>
      </div>
    </div>
  );
}
