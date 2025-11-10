# TravelQuest - Travel Gamification Platform

A comprehensive travel gamification platform with React frontend and Laravel backend. Users explore destinations via GPS-based maps, check in using QR codes, earn points, collect badges, and redeem rewards.

## 🚀 Features

### Admin Panel
- ✅ Dashboard with overview statistics
- ✅ Manage destinations (hotels, agri-farms, tourist spots)
- ✅ Set GPS coordinates for map markers
- ✅ Create and manage badges & rewards
- ✅ View user activity and analytics
- ✅ Generate QR codes for destinations

### End User Features
- ✅ GPS-based map exploration
- ✅ Real-time user location tracking
- ✅ Interactive destination markers
- ✅ QR code check-in system
- ✅ Points and rewards system
- ✅ Digital footprint dashboard
- ✅ Badge collection
- ✅ Review system
- ✅ Souvenir redemption

## 📦 Tech Stack

### Frontend
- React 19
- React Router DOM
- Tailwind CSS v3
- React Leaflet (Maps)
- QRCode.react
- HTML5 QR Scanner
- React Hot Toast

### Backend (Laravel - To be implemented)
- Laravel 11
- MySQL
- JWT Authentication
- RESTful API

## 🛠️ Setup Instructions

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd react-frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your settings:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_DEFAULT_MAP_CENTER_LAT=14.5995
   VITE_DEFAULT_MAP_CENTER_LNG=120.9842
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 📱 Application Structure

```
react-frontend/
├── src/
│   ├── components/
│   │   ├── auth/              # Login, Register, ProtectedRoute
│   │   ├── common/            # Button, Modal, ToastNotification
│   │   ├── dashboard/         # Admin dashboard components
│   │   ├── map/               # MapView component
│   │   └── qr/                # QR Scanner & Generator
│   ├── contexts/
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── LocationContext.jsx # GPS location tracking
│   ├── pages/
│   │   ├── admin/             # Admin pages
│   │   └── user/              # User pages
│   ├── services/
│   │   └── api.js             # API service layer
│   └── App.jsx                # Main app with routing
```

## 🗺️ Routes

### Public Routes
- `/login` - User login
- `/admin/login` - Admin login
- `/register` - User registration

### User Routes (Protected)
- `/map` - Main map explorer
- `/dashboard` - User dashboard with digital footprint

### Admin Routes (Protected, Admin Only)
- `/admin/dashboard` - Admin overview
- `/admin/destinations` - Manage destinations
- `/admin/badges` - Manage badges
- `/admin/rewards` - Manage rewards

## 🔐 Authentication

The app uses JWT token-based authentication stored in localStorage. The AuthContext provides:
- `login(credentials)` - Login user/admin
- `register(userData)` - Register new user
- `logout()` - Logout and clear session
- `isAuthenticated` - Boolean flag
- `isAdmin` - Boolean flag for admin role

## 📍 Location Services

The LocationContext provides GPS functionality:
- Real-time user location tracking
- Distance calculation between points
- Nearby destinations filtering
- Location error handling

## 🎯 User Flow

1. **Registration/Login** → User creates account or logs in
2. **Map Explorer** → GPS shows user location and nearby destinations
3. **Destination Discovery** → Click markers to see details
4. **QR Check-in** → Scan QR code at location to check in
5. **Points Earned** → Receive points for check-ins
6. **Badge Collection** → Unlock badges based on achievements
7. **Reward Redemption** → Exchange points for souvenirs
8. **Digital Footprint** → View travel history and stats

## 🎨 Design Principles

- **Minimalism** - Clean, focused UI with Tailwind CSS
- **Modularity** - Reusable components throughout
- **Responsiveness** - Mobile-first design approach
- **Accessibility** - WCAG compliant interactions
- **Performance** - Optimized rendering and lazy loading

## 📊 Database Schema (Laravel Backend)

### Tables Required

**users**
- id, name, email, password, role, points, created_at, updated_at

**destinations**
- id, title, category, description, latitude, longitude, points, created_at, updated_at

**visits**
- id, user_id, destination_id, points_earned, created_at

**badges**
- id, name, emoji, description, points_required, created_at

**user_badges**
- id, user_id, badge_id, earned_at

**rewards**
- id, title, description, points_cost, destination_id, created_at

**user_rewards**
- id, user_id, reward_id, destination_id, redeemed_at

**reviews**
- id, user_id, visit_id, rating, comment, created_at

## 🔧 API Endpoints

### Authentication
- `POST /api/login` - Login
- `POST /api/register` - Register
- `POST /api/logout` - Logout
- `GET /api/user` - Get current user

### Destinations
- `GET /api/destinations` - List all destinations
- `GET /api/destinations/:id` - Get destination details
- `POST /api/destinations` - Create destination (admin)
- `PUT /api/destinations/:id` - Update destination (admin)
- `DELETE /api/destinations/:id` - Delete destination (admin)
- `GET /api/destinations/:id/qr-code` - Generate QR code

### Check-ins
- `POST /api/visits/check-in` - Check in via QR code
- `GET /api/visits/user/:userId` - Get user's visits

### Badges & Rewards
- `GET /api/badges` - List badges
- `GET /api/rewards` - List rewards
- `POST /api/rewards/redeem` - Redeem reward
- `GET /api/user-rewards/:userId` - Get user's rewards

### Reviews
- `POST /api/visits/:visitId/review` - Leave review

### Analytics
- `GET /api/dashboard/stats` - Admin dashboard stats
- `GET /api/users/:userId/activity` - User activity

## 🚧 Next Steps

1. **Laravel Backend Implementation**
   - Set up Laravel API project
   - Create database migrations
   - Implement authentication
   - Build API endpoints
   - Add validation and middleware

2. **Enhanced Features**
   - Social sharing
   - Leaderboards
   - Friend system
   - Notifications
   - Offline mode
   - Photo uploads

3. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

## 📝 License

MIT License - Feel free to use for your projects

## 👥 Contributors

Built with ❤️ by the TravelQuest Team
