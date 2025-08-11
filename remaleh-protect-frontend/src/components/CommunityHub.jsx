import React, { useState, useEffect } from 'react';
import { Users, Flag, Trophy, AlertTriangle, TrendingUp, Plus, Star } from 'lucide-react';
import { MobileCard } from './ui/mobile-card';
import { MobileButton } from './ui/mobile-button';
import { useAuth } from '../hooks/useAuth';

export default function CommunityHub({ setActiveTab }) {
  const [activeTab, setActiveTabLocal] = useState('reports');
  const [scamReports, setScamReports] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [latestScams, setLatestScams] = useState([]);
  const { user, isAuthenticated } = useAuth();

  // Mock data - in real app this would come from API
  useEffect(() => {
    // Mock leaderboard data
    setLeaderboard([
      { id: 1, username: 'SecurityGuard', reports: 47, points: 235, rank: 1 },
      { id: 2, username: 'CyberVigilante', reports: 32, points: 180, rank: 2 },
      { id: 3, username: 'SafeNet', reports: 28, points: 156, rank: 3 },
      { id: 4, username: 'PhishBuster', reports: 25, points: 142, rank: 4 },
      { id: 5, username: 'ScamHunter', reports: 22, points: 128, rank: 5 },
      { id: 6, username: 'DigitalShield', reports: 19, points: 115, rank: 6 },
      { id: 7, username: 'AlertUser', reports: 17, points: 98, rank: 7 },
      { id: 8, username: 'SecureMind', reports: 15, points: 87, rank: 8 },
      { id: 9, username: 'WatchDog', reports: 12, points: 76, rank: 9 },
      { id: 10, username: 'Guardian', reports: 10, points: 65, rank: 10 }
    ]);

    // Mock latest scams data
    setLatestScams([
      { id: 1, title: 'Fake Bank SMS Scam', description: 'SMS claiming to be from major banks asking for account verification', reports: 156, severity: 'high', date: '2024-01-15' },
      { id: 2, title: 'Amazon Prime Renewal Fraud', description: 'Fake emails about Prime membership renewal with suspicious links', reports: 89, severity: 'medium', date: '2024-01-14' },
      { id: 3, title: 'Tax Refund Scam', description: 'Calls claiming to be from IRS about tax refunds', reports: 67, severity: 'high', date: '2024-01-13' },
      { id: 4, title: 'Tech Support Scam', description: 'Pop-up claiming computer is infected, asking for remote access', reports: 45, severity: 'medium', date: '2024-01-12' },
      { id: 5, title: 'Romance Scam', description: 'Fake dating profiles asking for money or gift cards', reports: 34, severity: 'medium', date: '2024-01-11' }
    ]);
  }, []);

  const tabs = [
    { id: 'reports', label: 'Report Scam', icon: Flag },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'latest', label: 'Latest Scams', icon: TrendingUp }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'reports':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report a Scam</h3>
              <p className="text-sm text-gray-600">Help protect others by reporting scams you encounter</p>
            </div>
            
            <MobileCard className="bg-blue-50 border-blue-200">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Flag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Your Reporting Stats</h4>
                    <p className="text-sm text-gray-600">Keep reporting to climb the leaderboard!</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-xs text-gray-600">Reports</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">68</div>
                    <div className="text-xs text-gray-600">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">#15</div>
                    <div className="text-xs text-gray-600">Rank</div>
                  </div>
                </div>
              </div>
            </MobileCard>

            <MobileButton
              onClick={() => {/* TODO: Open scam report form */}}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Report New Scam
            </MobileButton>
          </div>
        );

      case 'leaderboard':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Reporters</h3>
              <p className="text-sm text-gray-600">Community heroes protecting others from scams</p>
            </div>
            
            <div className="space-y-2">
              {leaderboard.map((user, index) => (
                <MobileCard key={user.id} className="border-gray-200">
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : user.rank}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.username}</div>
                          <div className="text-xs text-gray-600">{user.reports} reports • {user.points} points</div>
                        </div>
                      </div>
                      {index < 3 && (
                        <Star className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          </div>
        );

      case 'latest':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Latest Scams</h3>
              <p className="text-sm text-gray-600">Stay informed about current threats</p>
            </div>
            
            <div className="space-y-3">
              {latestScams.map((scam) => (
                <MobileCard key={scam.id} className="border-gray-200">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{scam.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        scam.severity === 'high' ? 'bg-red-100 text-red-800' :
                        scam.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {scam.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{scam.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{scam.reports} reports</span>
                      <span>{scam.date}</span>
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
        <p className="text-sm text-gray-600">Report scams, track threats, and see top reporters</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabLocal(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {renderContent()}

      {/* Community Benefits */}
      <div className="mt-6">
        <MobileCard className="bg-orange-50 border-orange-200">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">🤝 Community Benefits</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Report scams to protect others</li>
              <li>• Earn points and climb the leaderboard</li>
              <li>• Stay updated on latest threats</li>
              <li>• Build a safer digital community</li>
            </ul>
          </div>
        </MobileCard>
      </div>
    </div>
  );
}
