import React, { useState } from 'react';
import { Menu, X, Bell, User, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';

export default function MobileHeader({ setActiveTab }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const menuItems = [
    { label: 'Breach Checker', tab: 'breach' },
    { label: 'Scam Analysis', tab: 'scam' },
    { label: 'Threat Intel', tab: 'threats' },
    { label: 'Risk Profile', tab: 'profile' },
    { label: 'Community', tab: 'community' },
    { label: 'AI Assistant', tab: 'chat' },
    { label: 'Learn Hub', tab: 'learn' }
  ];

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setActiveTab('profile');
    } else {
      setActiveTab('login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    window.location.reload();
  };

  return (
    <header className="bg-white shadow-sm border-b md:hidden">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            <img 
              src="/remaleh-logo.png" 
              alt="Remaleh Protect" 
              className="h-8 w-auto mr-2"
            />
            <h1 className="text-lg font-bold text-gray-900">Remaleh Protect</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-5 h-5 text-gray-600" />
            </Button>
            
            {/* Profile/Login Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={handleProfileClick}
              title={isAuthenticated ? 'View Profile' : 'Login'}
            >
              {isAuthenticated ? (
                <User className="w-5 h-5 text-blue-600" />
              ) : (
                <LogIn className="w-5 h-5 text-gray-600" />
              )}
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (setActiveTab) {
                      setActiveTab(item.tab);
                    }
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              
              {/* Authentication Section */}
              <div className="pt-2 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="px-3 py-2">
                    <div className="text-sm text-gray-600 mb-2">
                      Welcome, {user?.first_name || 'User'}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('login');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-blue-600 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('register');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
