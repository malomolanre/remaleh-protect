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

      // Initialize Social Login (Google/Apple) if IDs are provided
      try {
        const cfg = {}
        const providers = []
        const googleIos = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID
        const googleWeb = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || import.meta.env.VITE_GOOGLE_ANDROID_WEB_CLIENT_ID
        // Configure Google with any available IDs (plugin tolerates extra fields)
        if (googleIos || googleWeb) {
          cfg.google = {}
          if (googleIos) cfg.google.iOSClientId = googleIos
          if (googleWeb) {
            cfg.google.webClientId = googleWeb
            cfg.google.clientId = googleWeb
          }
          // Default scopes to ensure profile/email access
          cfg.google.scopes = ['profile', 'email']
          providers.push('google')
        }
        // Apple can be initialized on both platforms when Service ID flow is used
        const appleClientId = import.meta.env.VITE_APPLE_SERVICE_ID
        const appleRedirect = import.meta.env.VITE_APPLE_REDIRECT_URI
        if (appleClientId && appleRedirect) {
          cfg.apple = { clientId: appleClientId, redirectUri: appleRedirect, scopes: ['email', 'name'] }
          providers.push('apple')
        }
        if (providers.length) {
          const initPayload = { ...cfg, providers }
          console.log('[SocialLogin] Init payload providers:', providers, 'googleCfg:', cfg.google ? Object.keys(cfg.google) : 'none', 'apple:', !!cfg.apple)
          SocialLogin.initialize(initPayload).then(() => {
            console.log('[SocialLogin] Initialized with providers:', providers)
          }).catch((e) => { console.log('[SocialLogin] init error', e) })
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

