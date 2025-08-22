import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SocialLogin } from '@capgo/capacitor-social-login'

function Root() {
  useEffect(() => {
    const platform = Capacitor.getPlatform()
    if (platform === 'ios' || platform === 'android') {
      // Revert iOS to non-overlay to avoid visual gaps; Android remains non-overlay
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {})
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
      StatusBar.setBackgroundColor({ color: '#21a1ce' }).catch(() => {})
      // Ensure no spacer is applied on iOS when not overlaying
      try {
        if (platform === 'ios') {
          document.documentElement.style.setProperty('--statusbar-offset', '0px')
        }
      } catch {}
      // On Android, EdgeToEdge plugin is native-only; avoid bundling in web build
      if (platform === 'android') {
        try {
          // eslint-disable-next-line no-new-func
          const enableEdgeToEdge = new Function(
            "return import('@capawesome/capacitor-android-edge-to-edge-support').then(m => m.EdgeToEdge.enable())"
          )
          enableEdgeToEdge().catch(() => {})
        } catch {}
      }
      // Expose a CSS var for header spacer so it always starts below status bar
      try {
        // Use a conservative default that works well on most Android devices
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

