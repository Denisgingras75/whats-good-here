import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import posthog from 'posthog-js'
import './index.css'
import App from './App.jsx'

// Initialize PostHog for user analytics
if (import.meta.env.VITE_PUBLIC_POSTHOG_KEY && import.meta.env.PROD) {
  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: true,        // Auto-track page views
    capture_pageleave: true,       // Track when users leave
    autocapture: true,             // Auto-track clicks, form submissions
    session_recording: {
      maskAllInputs: false,        // Don't mask inputs (no sensitive data)
    },
  })
}

// Initialize Sentry for error tracking
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD, // Only track errors in production
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  // Session replay for debugging
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
