# Product Requirements Document (PRD)

## Rasta - Smart Navigation & Location Services App

---

## 1. Executive Summary

**Product Name:** Rasta  
**Version:** 1.0.0  
**Platform:** Android (React Native/Expo)  
**Package:** com.rakeshlord.Rasta

### Overview
Rasta is a feature-rich mobile navigation application that provides real-time location services, route planning, and interactive mapping capabilities. The app combines Google Maps integration with custom features like place search, route visualization, and personalized saved locations.

### Key Value Proposition
- Free, open-source navigation solution
- Google OAuth authentication for personalized experience
- Real-time weather integration
- Advanced map controls including compass mode and multiple map layers
- Offline-capable saved places feature

---

## 2. Product Vision & Goals

### Vision Statement
To provide users with a powerful, privacy-focused navigation app that offers professional-grade mapping features without subscription fees or data tracking.

### Business Goals
1. Deliver a fully functional navigation app for Android users
2. Build user trust through transparent authentication (Clerk)
3. Create a foundation for future monetization through optional premium features
4. Establish a user base of 10,000+ active users in the first 6 months

### Success Metrics
- Daily Active Users (DAU): Target 500+ within 3 months
- Average session duration: 5+ minutes
- Route calculations per user: 3+ per session
- Saved places per user: Average 5+ locations
- User retention rate: 60% after 30 days

---

## 3. Target Audience

### Primary Users
- **Urban Commuters** (Ages 18-45)
  - Need: Daily navigation for work and errands
  - Pain point: Subscription fatigue with premium map apps
  
- **Travelers & Explorers** (Ages 22-55)
  - Need: Discover and save interesting locations
  - Pain point: Data privacy concerns with major platforms

### Secondary Users
- **Delivery Drivers** - Need efficient routing
- **Students** - Cost-conscious navigation needs
- **Privacy-Conscious Users** - Prefer open-source solutions

---

## 4. Core Features & Functionality

### 4.1 Authentication & User Management
**Technology:** Clerk + Google OAuth

#### Features
- ✅ **Google Sign-In Integration**
  - One-tap authentication
  - Secure token caching using expo-secure-store
  - Profile image and name display
  
- ✅ **User Profile**
  - Display user information
  - Sign out functionality
  - Profile picture integration in search bar

#### User Stories
- As a user, I want to sign in with Google so that I can access my saved places across devices
- As a user, I want to see my profile picture in the app so that I feel personalized experience

---

### 4.2 Interactive Map Interface
**Technology:** react-native-maps (Google Maps)

#### Features
- ✅ **Multiple Map Types**
  - Standard view
  - Satellite view
  - Hybrid view
  - Terrain view

- ✅ **Map Controls**
  - Zoom in/out
  - Recenter to user location
  - Compass mode (follows device heading)
  - 3D tilt view

- ✅ **User Location Tracking**
  - Real-time GPS positioning
  - Heading/compass direction
  - Auto-center when near user location
  - Blue location indicator

#### User Stories
- As a user, I want to switch between map types so that I can view terrain or satellite imagery
- As a user, I want the map to rotate based on my phone's direction so that navigation is intuitive
- As a driver, I want to quickly recenter the map to my location when I move it

---

### 4.3 Search & Place Discovery
**Technology:** OpenStreetMap Nominatim API

#### Features
- ✅ **Location Search**
  - Real-time search with debouncing (500ms)
  - Search results with address preview
  - Location icon for each result
  - Maximum 5 results per query

- ✅ **Search Bar**
  - Weather integration with icon
  - Greeting message (Good Morning/Afternoon/Evening)
  - Current date display
  - Profile avatar access
  - Clear search button

- ✅ **Place Selection**
  - Tap to select from results
  - Auto-navigate to selected place
  - Show place marker on map

#### Technical Details
```typescript
API: https://nominatim.openstreetmap.org/search
Method: GET
Parameters:
  - q: search query
  - format: json
  - limit: 5
Headers:
  - User-Agent: FreeMapApp/1.0
```

#### User Stories
- As a user, I want to search for places by name so that I can navigate to them
- As a user, I want to see weather information while searching so that I can plan accordingly
- As a user, I want to clear my search quickly so that I can start a new search

---

### 4.4 Navigation & Routing
**Technology:** OpenStreetMap Routing API + Polyline Decoding

#### Features
- ✅ **Route Calculation**
  - Walking, driving, and cycling modes
  - Distance calculation (km/miles)
  - Duration estimation
  - Step-by-step directions

- ✅ **Route Visualization**
  - Blue polyline on map
  - Start marker (green)
  - End marker (red)
  - Auto-zoom to fit route

- ✅ **Turn-by-Turn Navigation**
  - Step banner with current instruction
  - Distance to next turn
  - Route progress tracking
  - End navigation option

- ✅ **Route Information Panel**
  - Total distance
  - Estimated duration
  - Start/Stop navigation buttons
  - Detailed steps list

#### User Stories
- As a driver, I want to see the entire route on the map so that I can preview my journey
- As a user, I want step-by-step directions so that I don't miss turns
- As a cyclist, I want to choose cycling routes so that I get bike-friendly paths

---

### 4.5 Saved Places
**Technology:** AsyncStorage (Local Persistence)

#### Features
- ✅ **Save Locations**
  - One-tap save from place detail
  - Persistent storage
  - Heart icon indicator

- ✅ **Manage Saved Places**
  - View all saved places
  - Remove saved places
  - Navigate to saved locations

#### User Stories
- As a user, I want to save my favorite places so that I can access them quickly
- As a commuter, I want to save my frequent destinations so that I don't have to search repeatedly

---

### 4.6 Map Layers & Overlays

#### Features
- ✅ **Layer Toggle Sheet**
  - Traffic conditions
  - Road condition alerts
  - Waterlogging areas
  - Overall status view

- ✅ **Layer Visualization**
  - Color-coded indicators
  - Real-time updates
  - Toggle on/off individual layers

#### User Stories
- As a driver, I want to see traffic conditions so that I can avoid congestion
- As a commuter, I want waterlogging alerts during monsoon so that I can plan alternate routes

---

### 4.7 Weather Integration
**Technology:** Open-Meteo API (Free Weather Data)

#### Features
- ✅ **Current Weather Display**
  - Temperature (Celsius)
  - Weather icon (sun, cloud, rain, snow, thunder)
  - Location-based updates

- ✅ **Weather Codes Mapping**
  - Clear sky → Sun icon
  - Cloudy → Cloud icon
  - Rain → Rain cloud icon
  - Snow → Snow cloud icon
  - Thunderstorm → Lightning icon

#### Technical Details
```typescript
API: https://api.open-meteo.com/v1/forecast
Parameters:
  - latitude: user location
  - longitude: user location
  - current_weather: true
```

---

## 5. Technical Architecture

### 5.1 Technology Stack

#### Frontend Framework
- **React Native** 0.81.5
- **Expo SDK** ~54.0.30
- **TypeScript** (Strongly typed)

#### Navigation
- **Expo Router** ~6.0.21 (File-based routing)
- **React Navigation** ^7.1.8

#### State Management
- React Hooks (useState, useEffect, useRef)
- Context API for theme

#### Authentication
- **Clerk** ^2.19.14
- **expo-auth-session** ^7.0.10
- **expo-web-browser** ^15.0.10

#### Maps & Location
- **react-native-maps** 1.20.1
- **expo-location** ~19.0.8
- **react-native-map-clustering** ^4.0.0

#### Data Storage
- **@react-native-async-storage/async-storage** ^2.2.0
- **expo-secure-store** ^15.0.8

#### UI Components
- **@expo/vector-icons** ^15.0.3
- **expo-linear-gradient** ~15.0.8
- **expo-blur** ~15.0.8
- **react-native-svg** 15.12.1

### 5.2 App Structure

```
app/
├── (auth)/
│   ├── _layout.tsx          # Auth routing wrapper
│   ├── sign-in.tsx          # Google OAuth sign-in
│   └── sign-up.tsx          # Registration screen
├── (tabs)/
│   ├── _layout.tsx          # Bottom tab navigation
│   ├── index.tsx            # Home/Map screen
│   ├── explore.tsx          # Explore saved places
│   └── profile.tsx          # User profile
├── _layout.tsx              # Root layout with Clerk provider
├── index.tsx                # Entry redirect logic
└── modal.tsx                # Generic modal

components/
├── KolkataMap.tsx           # Main map component
├── SearchBar.tsx            # Search with weather
├── MapControls.tsx          # Zoom, center, compass buttons
├── PlaceDetailSheet.tsx     # Place info bottom sheet
├── RouteInfoSheet.tsx       # Route details panel
├── MapLayersSheet.tsx       # Layer toggles
├── StepBanner.tsx           # Navigation step display
└── SignOutButton.tsx        # Logout button

services/
├── storage.ts               # AsyncStorage helpers
utils/
├── cache.ts                 # Clerk token cache
├── tomtom.ts                # Routing API integration
└── weather.ts               # Weather API helpers

data/
├── kolkataPlaces.ts         # Sample places data
└── mapStyles.ts             # Custom map styles
```

### 5.3 Key Algorithms & Logic

#### Route Calculation
```typescript
1. User selects destination
2. Get user's current location
3. Call OpenRouteService API with:
   - Start coordinates
   - End coordinates
   - Profile (car/bike/foot)
4. Decode polyline response
5. Calculate distance and duration
6. Parse turn-by-turn steps
7. Display route on map
```

#### Location Centering Logic
```typescript
1. Compare map center with user location
2. If difference < 0.0001 degrees (~10m):
   - Set isCentered = true
   - Enable compass mode option
3. If user pans map:
   - Set isCentered = false
   - Disable compass mode
```

#### Search Debouncing
```typescript
1. User types in search box
2. Clear existing timeout
3. If query > 2 characters:
   - Set 500ms timeout
   - After timeout, call Nominatim API
4. Display results in dropdown
5. Clear results if query < 3 chars
```

---

## 6. User Interface & Experience

### 6.1 Screen Flow

```
App Launch
    ↓
Check Auth State
    ↓
├─ Not Signed In → Sign-In Screen (Google OAuth)
    ↓
├─ Signed In → Home Screen (Map View)
    ↓
Home Screen Options:
├─ Search Places → Results List → Select Place → Place Detail Sheet
├─ Start Navigation → Route Display → Turn-by-Turn Navigation
├─ View Profile → Profile Screen → Sign Out
├─ Toggle Layers → Layer Selection Sheet
└─ Map Controls → Zoom/Center/Compass
```

### 6.2 Design Principles

1. **Minimalist Interface**
   - Clean search bar overlay
   - Bottom sheets for details
   - Floating action buttons

2. **Gesture-First**
   - Pinch to zoom
   - Drag to pan
   - Tap to select places

3. **Context-Aware**
   - Weather in search bar
   - Time-based greetings
   - Location-specific information

4. **Accessible**
   - High contrast icons
   - Clear button labels
   - Touch-friendly sizes (min 44px)

### 6.3 Color Scheme

```typescript
Primary Colors:
- Primary Blue: #4285f4 (Google Blue)
- Text Primary: #202124 (Dark gray)
- Text Secondary: #5f6368 (Medium gray)
- Text Tertiary: #70757a (Light gray)

Map Colors:
- Route Line: #4285f4 (Blue)
- Start Marker: #34A853 (Green)
- End Marker: #EA4335 (Red)
- User Location: #4285f4 (Blue)

Background:
- White: #FFFFFF
- Light Gray: #F1F3F4
- Border: #E8EAED
```

---

## 7. APIs & External Services

### 7.1 Authentication
**Service:** Clerk  
**Endpoints:**
- OAuth: `https://clerk.rakeshlord.Rasta.com/`
- Callback: `rasta://oauth-callback`

**Configuration:**
- Publishable Key: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- OAuth Provider: Google
- Token Storage: expo-secure-store

### 7.2 Maps & Location
**Service:** Google Maps (via react-native-maps)  
**API Key:** `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

**Features Used:**
- Map display
- Markers
- Polylines
- User location
- Geocoding

### 7.3 Place Search
**Service:** OpenStreetMap Nominatim  
**Endpoint:** `https://nominatim.openstreetmap.org/search`  
**Rate Limit:** 1 request/second  
**Free:** Yes  
**Attribution Required:** Yes

### 7.4 Routing
**Service:** OpenRouteService (recommended) or GraphHopper  
**Features:**
- Turn-by-turn directions
- Multiple transport modes
- Distance & duration
- Polyline encoding

### 7.5 Weather
**Service:** Open-Meteo  
**Endpoint:** `https://api.open-meteo.com/v1/forecast`  
**Free:** Yes  
**Rate Limit:** Generous  
**Data:**
- Current temperature
- Weather codes
- Location-based

---

## 8. Data Models

### 8.1 Place
```typescript
interface Place {
  id: string;              // Unique identifier
  name: string;            // Place name
  address: string;         // Full address
  latitude: number;        // GPS coordinate
  longitude: number;       // GPS coordinate
  category: string;        // "Attraction" | "Restaurant" | etc.
}
```

### 8.2 Route Info
```typescript
interface RouteInfo {
  distance: number;        // Kilometers
  duration: number;        // Minutes
  steps?: RouteStep[];     // Turn-by-turn
}

interface RouteStep {
  instruction: string;     // "Turn left on Main St"
  distance: number;        // Distance to next step
  duration: number;        // Time to next step
}
```

### 8.3 User Location
```typescript
interface LocationObject {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}
```

### 8.4 Weather Data
```typescript
interface WeatherData {
  temp: number;            // Celsius
  code: number;            // WMO weather code
}
```

---

## 9. Security & Privacy

### 9.1 Authentication Security
- OAuth tokens stored in secure-store (encrypted)
- No passwords stored on device
- Session management via Clerk
- Auto-logout on token expiration

### 9.2 Location Privacy
- Location permission requested explicitly
- Only accessed when app is in use
- No location history stored on servers
- User can revoke permissions anytime

### 9.3 Data Storage
- Local storage only (AsyncStorage)
- No cloud sync (privacy-first)
- Saved places encrypted
- Clear cache on sign-out

### 9.4 API Keys
- Google Maps key restricted to package name
- Clerk keys environment-specific
- API keys in .env (not in version control)

---

## 10. Performance Optimization

### 10.1 Map Performance
- Lazy loading of map tiles
- Debounced region change updates
- Marker clustering for multiple points
- Optimized polyline rendering

### 10.2 Search Performance
- 500ms debounce on search
- Cancel previous API calls
- Limit results to 5
- Cache recent searches

### 10.3 Location Updates
- Throttled heading updates (500ms)
- Conditional compass mode rendering
- Efficient ref usage for real-time data

### 10.4 Bundle Size
- Code splitting via Expo Router
- Lazy load bottom sheets
- Optimize images (WebP)
- Tree-shaking unused code

---

## 11. Testing Strategy

### 11.1 Unit Tests
- API helper functions
- Routing calculations
- Storage operations
- Data transformations

### 11.2 Integration Tests
- Authentication flow
- Search → Place selection
- Route calculation → Display
- Save/Remove places

### 11.3 E2E Tests
- Sign in with Google
- Search and navigate
- Start turn-by-turn navigation
- Profile management

### 11.4 Device Testing
- Android 8.0+ devices
- Various screen sizes
- GPS accuracy testing
- Network conditions (3G/4G/WiFi)

---

## 12. Deployment & Distribution

### 12.1 Build Configuration
- **Development:** `npx expo start`
- **Android APK:** `cd android && ./gradlew assembleRelease`
- **Build Output:** `android/app/build/outputs/apk/release/app-release.apk`

### 12.2 Release Channels
- **Alpha:** Internal testing
- **Beta:** TestFlight/Play Store Beta
- **Production:** Play Store public release

### 12.3 Version Management
- Semantic versioning (1.0.0)
- Build number auto-increment
- Changelog maintenance

### 12.4 Distribution
- **Primary:** Google Play Store
- **Secondary:** APK download (website)
- **Future:** F-Droid (open-source store)

---

## 13. Roadmap & Future Enhancements

### Phase 1 (Current - v1.0.0)
✅ Core navigation features  
✅ Google authentication  
✅ Basic map controls  
✅ Place search  
✅ Saved places  

### Phase 2 (v1.1.0 - Q2 2026)
- 🔲 Offline maps download
- 🔲 Voice-guided navigation
- 🔲 Speed limit warnings
- 🔲 Multi-stop routing
- 🔲 Share location feature

### Phase 3 (v1.2.0 - Q3 2026)
- 🔲 Public transport integration
- 🔲 Real-time traffic alerts
- 🔲 Parking availability
- 🔲 EV charging stations
- 🔲 AR navigation mode

### Phase 4 (v2.0.0 - Q4 2026)
- 🔲 iOS version
- 🔲 Social features (share routes)
- 🔲 Community-reported incidents
- 🔲 Business listings integration
- 🔲 Premium features (ad-free)

---

## 14. Monetization Strategy (Future)

### Free Tier (Current)
- All core navigation features
- Unlimited searches
- Saved places
- Map layers

### Premium Tier (Planned - $2.99/month)
- Ad-free experience
- Offline maps (unlimited)
- Advanced route planning
- Priority support
- Cloud sync across devices

### Business Model Options
1. **Freemium:** Free with optional premium
2. **B2B:** API access for businesses
3. **Partnerships:** Local business integrations
4. **Donations:** Open-source support model

---

## 15. Support & Maintenance

### 15.1 User Support Channels
- In-app feedback form
- Email: support@rasta.app
- GitHub Issues (for technical users)
- FAQ/Help Center

### 15.2 Monitoring
- Crash reporting (Sentry)
- Analytics (privacy-friendly)
- Performance metrics
- API usage tracking

### 15.3 Update Schedule
- Security patches: As needed
- Bug fixes: Bi-weekly
- Feature updates: Monthly
- Major releases: Quarterly

---

## 16. Legal & Compliance

### 16.1 Terms of Service
- User agreement
- Acceptable use policy
- Service availability disclaimer

### 16.2 Privacy Policy
- Data collection disclosure
- Third-party services
- User rights (GDPR compliant)
- Data deletion process

### 16.3 Attributions
- OpenStreetMap data license
- Open-Meteo API credit
- React Native & Expo licenses
- Icon attributions

### 16.4 Permissions
- **Location:** Navigation and search
- **Internet:** Map tiles and search
- **Storage:** Saved places

---

## 17. Appendix

### A. Glossary
- **POI:** Point of Interest
- **OSM:** OpenStreetMap
- **OAuth:** Open Authorization
- **APK:** Android Package Kit
- **GPS:** Global Positioning System
- **API:** Application Programming Interface

### B. References
- [React Native Maps Docs](https://github.com/react-native-maps/react-native-maps)
- [Expo Location API](https://docs.expo.dev/versions/latest/sdk/location/)
- [Clerk Authentication](https://clerk.dev/docs)
- [OpenStreetMap Nominatim](https://nominatim.org/release-docs/develop/api/Search/)
- [Open-Meteo Weather API](https://open-meteo.com/en/docs)

### C. Change Log
**Version 1.0.0 (December 2025)**
- Initial release
- Core navigation features
- Google authentication
- Map controls and layers
- Place search and routing

---

## 18. Contact Information

**Product Owner:** Rakesh  
**Package:** com.rakeshlord.Rasta  
**Repository:** (Private)  
**Status:** Active Development  

---

*This PRD is a living document and will be updated as the product evolves.*

**Last Updated:** December 25, 2025  
**Document Version:** 1.0
