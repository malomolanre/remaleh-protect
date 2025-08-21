import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SocialLogin } from '@capgo/capacitor-social-login'

function Root() {
  useEffect(() => {
    if (Capacitor.getPlatform() === 'ios') {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {})
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
      StatusBar.setBackgroundColor({ color: '#21a1ce' }).catch(() => {})

      // Initialize Social Login (Google/Apple) if config is provided
      try {
        const googleClientId = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID
        const useSocial = import.meta.env.VITE_USE_SOCIAL_LOGIN === 'true'
        if (useSocial && (googleClientId)) {
          SocialLogin.initialize({
            google: { iOSClientId: googleClientId },
          }).catch(() => {})
        }
      } catch {}
    }
  }, [])
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)

