# NDPR Toolkit - Consent Management Documentation

## Overview

The NDPR Toolkit provides a flexible, customizable consent management system that can be used in three ways:

1. **Full UI Mode** - Pre-built components with theming
2. **Headless Mode** - State management only, bring your own UI
3. **Hybrid Mode** - Mix of custom and pre-built components

## Installation

```bash
npm install @tantainnovative/ndpr-toolkit
# or
yarn add @tantainnovative/ndpr-toolkit
# or
pnpm add @tantainnovative/ndpr-toolkit
```

## Quick Start

### Basic Implementation

```tsx
import { ConsentManager } from '@tantainnovative/ndpr-toolkit';

function App() {
  return (
    <ConsentManager>
      {/* Your app content */}
    </ConsentManager>
  );
}
```

### Headless Mode

```tsx
import { ConsentManager, useConsent } from '@tantainnovative/ndpr-toolkit';

function App() {
  return (
    <ConsentManager headless>
      <CustomCookieBanner />
      {/* Your app content */}
    </ConsentManager>
  );
}

function CustomCookieBanner() {
  const { hasUserConsented, acceptAll, rejectAll, openSettings } = useConsent();
  
  if (hasUserConsented) return null;
  
  return (
    <div className="your-custom-banner">
      <button onClick={acceptAll}>Accept</button>
      <button onClick={rejectAll}>Reject</button>
      <button onClick={openSettings}>Settings</button>
    </div>
  );
}
```

## Core Concepts

### ConsentManager

The main component that provides consent context to your application.

```tsx
<ConsentManager
  headless={false}              // Enable/disable built-in UI
  onConsentChange={handleChange} // Callback when consent changes
  storageKey="my-consent"       // Custom storage key
  initialConsent={{             // Initial consent state
    analytics: true,
    marketing: false
  }}
>
  {children}
</ConsentManager>
```

### useConsent Hook

Access consent state and actions anywhere in your app.

```tsx
const {
  // State
  hasUserConsented,  // Has the user made a choice?
  consentState,      // Current consent for each category
  showBanner,        // Is banner visible?
  showSettings,      // Is settings modal visible?
  
  // Actions
  acceptAll,         // Accept all categories
  rejectAll,         // Reject non-essential categories
  savePreferences,   // Save custom preferences
  openSettings,      // Show settings modal
  closeSettings,     // Hide settings modal
  updateConsent,     // Update individual category
} = useConsent();
```

## Customization Options

### 1. Render Props Pattern

```tsx
<ConsentManager>
  {({ consents, actions, ui }) => (
    <>
      {!consents.hasUserConsented && (
        <CustomBanner 
          onAccept={actions.acceptAll}
          onReject={actions.rejectAll}
          onSettings={ui.openSettings}
        />
      )}
    </>
  )}
</ConsentManager>
```

### 2. Custom Render Functions

```tsx
<ConsentManager
  renderBanner={({ onAcceptAll, onRejectAll, onOpenSettings }) => (
    <MyCustomBanner
      onAccept={onAcceptAll}
      onDecline={onRejectAll}
      onManage={onOpenSettings}
    />
  )}
  renderSettings={({ consentState, onUpdateConsent, onSave, onClose }) => (
    <MyCustomSettings
      consent={consentState}
      onChange={onUpdateConsent}
      onSave={onSave}
      onCancel={onClose}
    />
  )}
/>
```

### 3. Component Overrides

```tsx
<ConsentManager
  components={{
    Banner: CustomBanner,
    Settings: CustomSettings,
  }}
/>
```

### 4. Unstyled Components

```tsx
import { 
  ConsentBanner, 
  ConsentSettings 
} from '@tantainnovative/ndpr-toolkit/unstyled';

<ConsentBanner unstyled className="my-banner-styles">
  <ConsentBanner.Message>
    We use cookies...
  </ConsentBanner.Message>
  <ConsentBanner.Actions>
    <button>Accept</button>
    <button>Reject</button>
  </ConsentBanner.Actions>
</ConsentBanner>
```

## Advanced Features

### Event-Driven Management

```tsx
import { useConsentManager } from '@tantainnovative/ndpr-toolkit';

function App() {
  const manager = useConsentManager();
  
  useEffect(() => {
    // Subscribe to events
    const unsubscribe = manager.on('consent:accepted', (consents) => {
      console.log('Consents accepted:', consents);
      initializeAnalytics();
    });
    
    manager.on('consent:updated', (consents) => {
      updateServices(consents);
    });
    
    return unsubscribe;
  }, []);
}
```

Available events:
- `consent:accepted` - User accepted all cookies
- `consent:rejected` - User rejected non-essential cookies
- `consent:updated` - Consent preferences changed
- `banner:shown` / `banner:hidden` - Banner visibility changed
- `settings:opened` / `settings:closed` - Settings modal visibility changed

### Custom Consent Categories

```tsx
import { createConsentContext } from '@tantainnovative/ndpr-toolkit';

// Define your custom categories
interface MyCategories {
  necessary: boolean;
  performance: boolean;
  targeting: boolean;
  social: boolean;
}

// Create typed context
const { ConsentProvider, useConsent } = createConsentContext<MyCategories>();

// Use in your app
<ConsentProvider
  categories={[
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'performance', name: 'Performance' },
    { id: 'targeting', name: 'Targeting' },
    { id: 'social', name: 'Social Media' },
  ]}
>
  <App />
</ConsentProvider>
```

### Positioning and Animation

```tsx
<ConsentManager
  position="bottom"    // 'top' | 'bottom' | 'center'
  animation="slide"    // 'slide' | 'fade' | 'none'
  fullWidth={true}
  maxWidth="1200px"
  theme={{
    primaryColor: '#3B82F6',
    textColor: '#1F2937',
    backgroundColor: '#FFFFFF',
  }}
/>
```

## Utility Functions

### Cookie Utils

```tsx
import { cookieUtils } from '@tantainnovative/ndpr-toolkit';

// Set a cookie
cookieUtils.set('user_pref', 'dark_mode', 30); // 30 days

// Get a cookie
const pref = cookieUtils.get('user_pref');

// Delete a cookie
cookieUtils.delete('user_pref');
```

### Consent Storage

```tsx
import { consentStorage } from '@tantainnovative/ndpr-toolkit';

// Save consent data
consentStorage.save('consent_key', consentData);

// Load consent data
const data = consentStorage.load('consent_key');

// Remove consent data
consentStorage.remove('consent_key');
```

## Integration Examples

### Google Analytics

```tsx
function App() {
  const { consentState, hasUserConsented } = useConsent();
  
  useEffect(() => {
    if (hasUserConsented) {
      window.gtag?.('consent', 'update', {
        'analytics_storage': consentState.analytics ? 'granted' : 'denied',
        'ad_storage': consentState.marketing ? 'granted' : 'denied',
      });
    }
  }, [hasUserConsented, consentState]);
}
```

### Facebook Pixel

```tsx
function App() {
  const { consentState } = useConsent();
  
  useEffect(() => {
    if (consentState.marketing) {
      // Initialize Facebook Pixel
      fbq('init', 'YOUR_PIXEL_ID');
      fbq('track', 'PageView');
    }
  }, [consentState.marketing]);
}
```

## Best Practices

1. **Always provide a way to change preferences**
   ```tsx
   <button onClick={() => openSettings()}>
     Cookie Preferences
   </button>
   ```

2. **Handle server-side rendering**
   ```tsx
   if (typeof window === 'undefined') {
     return null; // Don't render consent UI on server
   }
   ```

3. **Respect user choices**
   ```tsx
   // Don't initialize tracking until consent is given
   if (consentState.analytics) {
     initializeAnalytics();
   }
   ```

4. **Provide clear information**
   ```tsx
   <ConsentBanner>
     <h3>We value your privacy</h3>
     <p>We use cookies to improve your experience and analyze site usage.</p>
     <a href="/privacy-policy">Learn more</a>
   </ConsentBanner>
   ```

## Migration Guide

### From Built-in UI to Headless

```tsx
// Before
<ConsentManager theme={{ primaryColor: '#000' }}>
  <App />
</ConsentManager>

// After
<ConsentManager headless>
  <CustomBanner />
  <CustomSettings />
  <App />
</ConsentManager>
```

### From Props to Render Props

```tsx
// Before
<ConsentManager onAccept={handleAccept}>
  <App />
</ConsentManager>

// After
<ConsentManager>
  {({ actions }) => {
    useEffect(() => {
      if (actions.acceptAll) {
        handleAccept();
      }
    }, []);
    
    return <App />;
  }}
</ConsentManager>
```

## TypeScript Support

The toolkit is fully typed. Import types as needed:

```tsx
import type { 
  ConsentCategories,
  ConsentState,
  ConsentActions,
  BannerProps,
  SettingsProps 
} from '@tantainnovative/ndpr-toolkit';
```

## Troubleshooting

### Banner not showing
- Check if `hasUserConsented` is already `true` in localStorage
- Clear consent data: `consentStorage.remove('ndpr-consent-set')`

### Styles not applying
- Ensure you're not using `headless` mode with built-in components
- Check if `unstyled` prop is set to `true`

### Consent not persisting
- Verify localStorage is available
- Check if custom `storageKey` is consistent

## Support

For issues and feature requests, please visit our [GitHub repository](https://github.com/tantainnovative/ndpr-toolkit).