'use client'

import { usePostHog } from 'posthog-js/react'

export function useAnalytics() {
  const posthog = usePostHog()

  return {
    // Track custom events
    trackEvent: (eventName: string, properties?: Record<string, any>) => {
      posthog?.capture(eventName, properties)
    },

    // Track demo interactions
    trackDemoView: (demoName: string) => {
      posthog?.capture('demo_viewed', {
        demo_name: demoName,
      })
    },

    trackComponentInteraction: (componentName: string, action: string) => {
      posthog?.capture('component_interaction', {
        component: componentName,
        action,
      })
    },

    // Track documentation views
    trackDocView: (docPath: string) => {
      posthog?.capture('documentation_viewed', {
        doc_path: docPath,
      })
    },

    // Track downloads/exports
    trackExport: (exportType: string, format?: string) => {
      posthog?.capture('export_triggered', {
        export_type: exportType,
        format,
      })
    },
  }
}