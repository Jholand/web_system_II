# Navigation & Points Redemption Feature

## Overview
Complete navigation tracking system that allows users to navigate to destinations, track their journey in real-time, and earn points by scanning QR codes upon arrival.

## Features Implemented

### 1. Admin Destination Management
**Location:** `src/pages/admin/AdminMap.jsx`

- **Interactive Map**: Click anywhere on the map to pin new locations
- **Latitude/Longitude Input**: Manually enter or auto-fill coordinates
- **Destination Categories**: Hotels, Agri-Farms, Tourist Spots
- **QR Code Generation**: Unique QR codes generated per location
  - Format: `CATEGORY-NAME-ID` (e.g., `HOTEL-RES-001`)
- **Data Persistence**: All destinations saved to localStorage
  - Key: `travelquest_destinations`
  - Automatically synced between admin and user views

**How to Add Destinations:**
1. Navigate to Admin Dashboard → Map tab
2. Click on the map where you want to add a destination
3. Coordinates auto-fill in the form
4. Fill in name, category, description, and points reward
5. Click "Add Destination"
6. QR code is automatically generated and displayed

### 2. User Navigation System
**Location:** `src/pages/user/MapExplorer.jsx`

#### A. Destination Discovery
- All admin-added destinations appear on user map
- Users can click markers to view destination details
- Shows distance from current location
- Displays points reward, description, and category

#### B. Navigation Tracking
**State Management:**
```javascript
- isNavigating: Boolean - Navigation active status
- navigationDestination: Object - Current destination
- distanceToDestination: Number - Real-time distance in km
- showQRModal: Boolean - Arrival QR modal trigger
- arrivedDestination: Object - Destination upon arrival
```

**Distance Calculation:**
- Uses Haversine formula for accurate GPS distance
- Updates in real-time as user moves
- Tracks distance to destination continuously

**Arrival Detection:**
- Threshold: 50 meters (0.05 km)
- Automatically detects when user arrives
- Stops navigation and triggers QR modal

#### C. Navigation UI Components

**Navigation Tracker Banner:**
- Gradient background with destination info
- Real-time distance display
- "Stop Navigation" button
- "Almost there!" message when within 500m

**Destination Detail Modal:**
- **Far from destination (>100m)**: Shows "Navigate" button
- **Close to destination (≤100m)**: Shows "Scan QR Code" button
- Displays destination stats and description
- Shows distance from current location

**QR Arrival Modal:**
- Auto-opens when user arrives (within 50m)
- Shows destination icon and details
- Displays points to be earned
- "Open QR Scanner" button
- Shows QR code format for reference

### 3. Points Redemption System
**Location:** `src/pages/user/MapExplorer.jsx` → `handleQRScan()`

**Process Flow:**
1. User arrives at destination (within 50m)
2. QR arrival modal automatically opens
3. User clicks "Open QR Scanner"
4. Scans physical QR code at location
5. System validates QR code matches destination
6. Points awarded and saved to localStorage
7. Visit added to user's history
8. Success toast notification

**Data Persistence:**
- **Points**: `localStorage.getItem('travelquest_points')`
- **Visit History**: `localStorage.getItem('travelquest_visits')`

**Visit History Structure:**
```javascript
{
  id: destinationId,
  name: destinationName,
  points: pointsEarned,
  date: timestamp,
  qrCode: scannedQRCode
}
```

## User Flow Example

### Admin Side:
1. Admin opens Dashboard → Map tab
2. Clicks on map at coordinates (14.5995, 120.9842)
3. Form auto-fills: Latitude: 14.599500, Longitude: 120.984200
4. Enters: Name: "Rizal Park", Category: "Tourist Spot", Points: 50
5. Clicks "Add Destination"
6. QR Code generated: `TOURIST-SPOT-RIZ-001`
7. Destination saved to localStorage

### User Side:
1. User opens Map Explorer page
2. Sees "Rizal Park" marker on map (loaded from localStorage)
3. Clicks marker → Destination detail modal opens
4. Sees: 2.3km away, 50 points reward
5. Clicks "Navigate" button
6. Navigation tracker appears: "Navigating to Rizal Park - 2.3 km away"
7. User travels toward destination
8. Distance updates: 1.8km → 1.2km → 0.5km → "Almost there!"
9. User arrives within 50m
10. QR arrival modal auto-opens: "🎉 You've Arrived!"
11. Shows "+50 pts" reward
12. User clicks "Open QR Scanner"
13. Scans QR code at location
14. System validates code matches `TOURIST-SPOT-RIZ-001`
15. 50 points awarded
16. Toast: "Successfully checked in! Earned 50 points!"
17. Visit added to history
18. Navigation ends

## Technical Implementation

### Distance Calculation (Haversine Formula)
```javascript
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};
```

### Real-time Tracking (useEffect)
```javascript
useEffect(() => {
  if (isNavigating && navigationDestination && userLocation) {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      navigationDestination.latitude,
      navigationDestination.longitude
    );
    setDistanceToDestination(distance);
    
    // Arrival detection: within 50 meters
    if (distance < 0.05) {
      handleArrival();
    }
  }
}, [isNavigating, navigationDestination, userLocation]);
```

### LocalStorage Structure
```javascript
// Destinations
{
  id: 1,
  name: "Rizal Park",
  category: "tourist spot",
  description: "Historic urban park",
  latitude: 14.5995,
  longitude: 120.9842,
  points: 50,
  qrCode: "TOURIST-SPOT-RIZ-001"
}

// Points (single number)
250

// Visits (array)
[
  {
    id: 1,
    name: "Rizal Park",
    points: 50,
    date: "2024-01-15T10:30:00Z",
    qrCode: "TOURIST-SPOT-RIZ-001"
  }
]
```

## Key Functions

### Admin Functions
- `handleMapClick(e)`: Captures map click, sets coordinates
- `handleAddDestination()`: Validates, generates QR, saves to localStorage
- `generateQRCode(destination)`: Creates unique QR code format

### User Functions
- `handleStartNavigation(destination)`: Initiates tracking
- `handleStopNavigation()`: Cancels navigation
- `handleArrival()`: Triggered at <50m, opens QR modal
- `handleQRScan(scannedCode)`: Validates QR, awards points
- `fetchDestinations()`: Loads from localStorage + mock data

## File Structure
```
src/
├── pages/
│   ├── admin/
│   │   └── AdminMap.jsx           # Destination management with map
│   └── user/
│       └── MapExplorer.jsx        # Navigation & tracking system
├── components/
│   ├── map/
│   │   └── DestinationDetail.jsx  # Shows destination info + Navigate button
│   ├── qr/
│   │   ├── QRScanner.jsx          # Scans QR codes
│   │   └── QRGenerator.jsx        # Generates QR codes for admin
│   └── common/
│       └── Modal.jsx              # Reusable modal (z-index: 9999)
└── contexts/
    └── LocationContext.jsx        # GPS tracking & distance calc
```

## Testing Checklist

### Admin Testing
- [ ] Click map to pin location
- [ ] Coordinates auto-fill correctly
- [ ] Can manually edit latitude/longitude
- [ ] Destination saves to localStorage
- [ ] QR code generates with unique format
- [ ] Can view QR modal with stats

### User Testing
- [ ] Admin-added destinations appear on map
- [ ] Can click marker to view details
- [ ] Distance shows correctly from current location
- [ ] "Navigate" button appears when far (>100m)
- [ ] "Scan QR Code" button appears when close (≤100m)
- [ ] Navigation tracker banner shows correctly
- [ ] Distance updates in real-time
- [ ] "Almost there!" appears at <500m
- [ ] QR modal auto-opens at <50m
- [ ] Can stop navigation mid-journey
- [ ] QR scanner validates code correctly
- [ ] Points awarded and saved
- [ ] Visit added to history
- [ ] Toast notifications appear

## Future Enhancements
1. **Route Visualization**: Draw polyline from user to destination
2. **Turn-by-Turn Directions**: Integrate with routing API
3. **Visit Statistics**: Track most visited destinations
4. **Leaderboard**: Compare points with other users
5. **Streak System**: Bonus points for consecutive daily visits
6. **Photo Check-in**: Upload photos at destinations
7. **Reviews**: Allow users to rate destinations
8. **Offline Mode**: Cache destinations for offline use
9. **Push Notifications**: Alert when near saved destinations
10. **Navigation History**: Track all past routes

## Dependencies
- `react-leaflet`: ^4.x - Map visualization
- `leaflet`: ^1.9.x - Map library
- `qrcode.react`: ^3.x - QR code generation
- `html5-qrcode`: ^2.x - QR code scanning
- `react-hot-toast`: ^2.6.0 - Notifications

## Browser Requirements
- Geolocation API support
- Camera access for QR scanning
- LocalStorage enabled
- Modern browser (Chrome, Firefox, Safari, Edge)

## Known Issues & Solutions

### Issue: Modal hidden behind map
**Solution:** Modal z-index set to z-[9999], map container z-0

### Issue: GPS not updating
**Solution:** LocationContext polling every 5 seconds

### Issue: Arrival not detected
**Solution:** Check threshold is 50m (0.05km), ensure GPS accuracy

### Issue: QR scan fails
**Solution:** Verify QR code format matches destination.qrCode

### Issue: Points not saving
**Solution:** Check localStorage is enabled, not in incognito mode

## Support
For issues or questions, check:
1. Browser console for error messages
2. GPS permission granted
3. Camera permission granted (for QR scanning)
4. LocalStorage not full (check dev tools)
5. Network connection for map tiles
