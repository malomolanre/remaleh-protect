import React, { useState, useEffect } from 'react';
import { Users, Flag, Trophy, TrendingUp, Plus, Star } from 'lucide-react';
import { MobileCard } from './ui/mobile-card';
import { MobileButton } from './ui/mobile-button';
import { useAuth } from '../hooks/useAuth';
import { useCommunity } from '../hooks/useCommunity';

export default function CommunityHub({ setActiveTab }) {
  const [activeTab, setActiveTabLocal] = useState('reports');
  const { leaderboard, trendingThreats, loadAllData, isLoading } = useCommunity();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

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
              onClick={() => setActiveTab('community_reports')}
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
                          <div className="font-semibold text-gray-900">{user.username || user.name}</div>
                          <div className="text-xs text-gray-600">{user.reports} reports</div>
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
              {trendingThreats.map((trend, idx) => (
                <MobileCard key={idx} className="border-gray-200">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{trend.threat_type}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Reports: {trend.report_count} • Trend: {trend.trend}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Urgency score: {trend.urgency_score}</span>
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
