# TravelQuest - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser
- (Optional) GPS-enabled device for full experience

### Step 1: Install Dependencies
```bash
cd react-frontend
npm install
```

### Step 2: Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set your API URL
VITE_API_URL=http://localhost:8000/api
```

### Step 3: Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 👤 Default Access

### User Flow
1. Navigate to `/register`
2. Create a new account
3. Login and explore the map at `/map`
4. Scan QR codes to check in (when backend is ready)

### Admin Flow
1. Navigate to `/admin/login`
2. Login with admin credentials (backend setup required)
3. Access admin dashboard at `/admin/dashboard`
4. Manage destinations, badges, and rewards

## 🗺️ Testing Without Backend

The frontend is fully functional for UI/UX testing without the Laravel backend:

- **Map View**: Shows mock destinations on the map
- **GPS Tracking**: Uses your actual device location
- **QR Scanner**: Opens camera and scans QR codes
- **Dashboard**: Displays with sample data

> **Note**: Check-in, points, and data persistence require the Laravel backend API.

## 📦 Project Structure

```
react-frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (Auth, Location)
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   └── App.jsx         # Main app with routing
├── public/             # Static assets
└── package.json        # Dependencies
```

## 🔑 Key Features to Test

### 1. Authentication
- User registration at `/register`
- User login at `/login`
- Admin login at `/admin/login`

### 2. Map Explorer (`/map`)
- View your GPS location (blue marker)
- See nearby destinations (colored markers)
- Click markers for destination details
- Use floating button to open QR scanner

### 3. User Dashboard (`/dashboard`)
- View visit statistics
- Browse digital footprint
- See earned badges
- Check redeemed rewards

### 4. Admin Panel (`/admin/*`)
- Dashboard with overview stats
- Manage destinations (CRUD operations)
- Manage badges and rewards
- Generate QR codes

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌐 Browser Permissions

The app requires these browser permissions:

### Required
- **Location (GPS)**: For map and nearby destinations
  - Browser will prompt on first visit
  - Essential for core functionality

### Optional
- **Camera**: For QR code scanning
  - Only requested when opening scanner
  - Can be denied if not using check-in feature

## 📱 Mobile Testing

### iOS Safari
1. Allow location access when prompted
2. Allow camera access for QR scanning
3. Add to Home Screen for app-like experience

### Android Chrome
1. Enable location services in Settings
2. Grant camera permission when scanning
3. Works in both browser and PWA mode

## 🔧 Common Issues & Solutions

### Map Not Loading
- Check that you have internet connection (for map tiles)
- Verify Leaflet CSS is imported
- Check browser console for errors

### Location Not Working
- Ensure HTTPS in production (required for GPS)
- Check browser permissions
- Try refreshing the page

### QR Scanner Issues
- Grant camera permission
- Ensure good lighting
- Hold steady and focus on QR code
- Check browser compatibility

### API Errors
- Verify `.env` file has correct API URL
- Check that backend server is running
- Inspect network tab in DevTools

## 📚 Next Steps

### For Developers
1. Review `IMPLEMENTATION_SUMMARY.md` for architecture details
2. Check `README_TRAVELQUEST.md` for full documentation
3. Set up Laravel backend (see backend setup guide)
4. Connect API endpoints to live data

### For Designers
1. Customize Tailwind configuration
2. Update color schemes in components
3. Add custom icons and illustrations
4. Enhance animations and transitions

### For Testers
1. Test all user flows
2. Verify mobile responsiveness
3. Check accessibility compliance
4. Report bugs and suggestions

## 🎯 Feature Roadmap

### Phase 1 (Current)
- ✅ User authentication
- ✅ Map exploration
- ✅ QR scanning UI
- ✅ Dashboard views
- ✅ Admin panel

### Phase 2 (With Backend)
- ⏳ Live check-ins
- ⏳ Points accumulation
- ⏳ Badge unlocking
- ⏳ Reward redemption
- ⏳ Review submission

### Phase 3 (Future)
- 🔄 Social features
- 🔄 Photo uploads
- 🔄 Leaderboards
- 🔄 Push notifications
- 🔄 Offline mode

## 💡 Pro Tips

1. **Use Chrome DevTools**
   - Toggle device toolbar for mobile testing
   - Simulate different GPS locations
   - Test offline scenarios

2. **Mock Data**
   - Add sample destinations in admin panel
   - Generate QR codes for testing
   - Create test user accounts

3. **Performance**
   - Map renders efficiently with React Leaflet
   - Components use lazy loading where possible
   - Images optimized for web

4. **Security**
   - Never commit `.env` files
   - Use HTTPS in production
   - Validate all user inputs

## 📞 Support

For issues, questions, or contributions:
1. Check documentation files
2. Review implementation summary
3. Inspect browser console for errors
4. Contact development team

## 🎉 You're All Set!

Your TravelQuest frontend is ready to explore. Start the dev server and begin your adventure!

```bash
npm run dev
```

Happy coding! 🚀
