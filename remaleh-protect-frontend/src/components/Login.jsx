import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, user, isAuthenticated, requestPasswordReset } = useAuth();
  const [infoMsg, setInfoMsg] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  // Watch for authentication changes and redirect accordingly
  useEffect(() => {
    if (isAuthenticated && user && onLoginSuccess) {
      onLoginSuccess();
    }
  }, [isAuthenticated, user, onLoginSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email.trim() || !formData.password.trim()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        // Error is already set in useAuth hook
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img 
            src="/remaleh-logo.png" 
            alt="Remaleh Protect" 
            className="h-12 w-auto"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your digital security dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.email.trim()) {
                      setInfoMsg('Enter your email above, then click reset.');
                      return;
                    }
                    const res = await requestPasswordReset(formData.email.trim());
                    setInfoMsg(res.message || 'If this email exists, a temporary password has been sent.');
                  }}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
            {infoMsg && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                {infoMsg}
              </div>
            )}

            {/* OAuth Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            {/* Google Sign-in */}
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    setOauthLoading(true)
                    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:10000'
                    const resp = await fetch(`${apiBase}/api/auth/oauth/google/start`)
                    if (resp.ok) {
                      const data = await resp.json()
                      if (data.auth_url) window.location.href = data.auth_url
                    } else {
                      setInfoMsg('Google sign-in is not available right now.')
                    }
                  } catch (e) {
                    setInfoMsg('Google sign-in is not available right now.')
                  } finally {
                    setOauthLoading(false)
                  }
                }}
                disabled={oauthLoading}
                className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4 mr-2" />
                Continue with Google
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setOauthLoading(true)
                    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:10000'
                    const resp = await fetch(`${apiBase}/api/auth/oauth/apple/start`)
                    if (resp.ok) {
                      const data = await resp.json()
                      if (data.auth_url) window.location.href = data.auth_url
                    } else {
                      setInfoMsg('Apple sign-in is not available right now.')
                    }
                  } catch (e) {
                    setInfoMsg('Apple sign-in is not available right now.')
                  } finally {
                    setOauthLoading(false)
                  }
                }}
                disabled={oauthLoading}
                className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="currentColor" aria-hidden="true"><path d="M16.365 1.43c0 1.14-.495 2.294-1.293 3.184-.822.914-2.2 1.622-3.364 1.53-.146-1.12.51-2.314 1.315-3.19.823-.892 2.26-1.646 3.342-1.524zM20.66 17.03c-.836 1.93-1.85 3.84-3.338 3.865-1.464.03-1.934-.93-3.607-.93-1.673 0-2.19.9-3.565.96-1.43.06-2.513-2.08-3.36-4.01-1.832-4.038-1.01-9.19 1.288-11.71.85-.94 1.98-1.55 3.168-1.58 1.3-.03 2.52.89 3.603.89 1.085 0 2.4-1.1 4.05-.94.69.03 2.62.28 3.864 2.12-.1.06-2.31 1.35-2.2 4.02.1 3.23 2.84 4.3 2.94 4.35z"/></svg>
                Continue with Apple
              </button>
            </div>
            {infoMsg && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                {infoMsg}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to Remaleh Protect?</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  if (onSwitchToRegister) {
                    onSwitchToRegister();
                  }
                }}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

