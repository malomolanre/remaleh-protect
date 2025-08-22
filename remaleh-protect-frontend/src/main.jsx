import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SocialLogin } from '@capgo/capacitor-social-login'
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support'

function Root() {
  useEffect(() => {
    const platform = Capacitor.getPlatform()
    if (platform === 'ios' || platform === 'android') {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {})
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
      StatusBar.setBackgroundColor({ color: '#21a1ce' }).catch(() => {})
      if (platform === 'android') {
        EdgeToEdge.enable().catch(() => {})
      }
      // Expose a CSS var for header spacer so it always starts below status bar
      try {
        const offset = (window as any)?.Capacitor?.Plugins?.StatusBar?.getInfo
          ? await (StatusBar as any).getInfo()
          : null
        // Fallback to 24px typical Android status bar height when env() is 0
        const px = 24
        document.documentElement.style.setProperty('--statusbar-offset', `${px}px`)
      } catch {}

      // Initialize Social Login (Google) on iOS if client ID is provided
      if (platform === 'ios') {
        try {
          const googleClientId = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID
          if (googleClientId) {
            SocialLogin.initialize({ google: { iOSClientId: googleClientId } }).then(() => {
              console.log('[SocialLogin] Initialized with iOSClientId')
            }).catch((e) => { console.log('[SocialLogin] init error', e) })
          }
        } catch {}
      }
    }
  }, [])
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)

