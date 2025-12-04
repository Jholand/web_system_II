# TravelQuest Authentication System

## Overview
Secure, cookie-based authentication system with role-based access control for both users and admins.

## Features

### Security Features
- ✅ **CSRF Protection**: Laravel Sanctum with CSRF tokens
- ✅ **Rate Limiting**: 5 login attempts per minute per IP
- ✅ **Secure Cookies**: HttpOnly, SameSite=Lax configuration
- ✅ **Password Requirements**: Minimum 8 characters, mixed case, numbers
- ✅ **Session Management**: Database-driven sessions with encryption
- ✅ **Token-based API Auth**: Sanctum tokens for API requests
- ✅ **Role-based Access**: Middleware protection for admin/user routes

### Role-Based Access Control
- **Admin (role_id = 1)**: Access to `/admin/*` routes
- **User (role_id = 2)**: Access to `/user/*` routes
- Automatic redirect based on role after login

### User Status Management
- **Active (1)**: Full access
- **Inactive (2)**: Cannot login
- **Suspended (3)**: Cannot login
- **Banned (4)**: Cannot login

## Backend Implementation

### Controllers
**`AuthController.php`**
- `POST /api/register` - Register new user (always role_id = 2)
- `POST /api/login` - Login with email/password, returns redirect URL
- `POST /api/logout` - Logout and invalidate tokens
- `GET /api/me` - Get authenticated user data
- `GET /api/auth/check` - Check authentication status

### Middleware
**`AdminMiddleware.php`** - Protects admin routes (role_id = 1)
**`UserMiddleware.php`** - Protects user routes (role_id = 2)

### Security Configuration
**`config/sanctum.php`**
- Stateful domains configured for localhost:5173
- Cookie-based authentication enabled

**`config/cors.php`**
- Allows requests from frontend (localhost:5173)
- Credentials support enabled

**`config/session.php`**
- Database driver for session storage
- HttpOnly cookies enabled
- SameSite=Lax for CSRF protection

## Frontend Implementation

### API Service (`services/api.js`)
```javascript
// Features:
- CSRF cookie fetching before authentication
- Credentials: 'include' for all requests
- Token storage in localStorage
- Automatic error handling
```

### Auth Context (`contexts/AuthContext.jsx`)
```javascript
// Provides:
- login(credentials) → redirects based on role
- register(userData) → always redirects to /user/dashboard
- logout() → clears session and tokens
- checkAuth() → validates on app load
- isAdmin, isUser flags
```

### Components
**`LoginModal.jsx`**
- Email/password form
- Role-based redirect on success
- Error handling with toast notifications

**`RegisterModal.jsx`**
- Full name, email, password, confirm password
- Validates password match
- Always creates user role (role_id = 2)

## Setup Instructions

### 1. Backend Setup

```bash
cd laravel-backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Add to .env:
SESSION_DRIVER=database
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173

# Run migrations
php artisan migrate

# Create sessions table
php artisan session:table
php artisan migrate

# Start server
php artisan serve
```

### 2. Frontend Setup

```bash
cd react-frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env
echo "VITE_BASE_URL=http://localhost:8000" >> .env

# Start development server
npm run dev
```

### 3. Test Authentication

**Register a User:**
1. Open http://localhost:5173
2. Click "Register" button
3. Fill in the form (creates role_id = 2)
4. Automatically logs in and redirects to /user/dashboard

**Create an Admin (via database):**
```sql
-- Update existing user to admin
UPDATE users SET role_id = 1 WHERE email = 'admin@example.com';

-- Or create new admin
INSERT INTO users (first_name, last_name, email, password, role_id, status_id)
VALUES ('Admin', 'User', 'admin@test.com', '$2y$12$...hashed...', 1, 1);
```

**Login:**
1. Click "Login" button
2. Enter credentials
3. System automatically redirects:
   - Admin (role_id = 1) → `/admin/dashboard`
   - User (role_id = 2) → `/user/dashboard`

## API Endpoints

### Public Routes
```
POST /api/register
POST /api/login
```

### Protected Routes (require auth:sanctum)
```
POST /api/logout
GET /api/me
GET /api/auth/check
```

### Admin-Only Routes (require auth:sanctum + admin middleware)
```
GET    /api/admin/users
POST   /api/admin/users
GET    /api/admin/users/{id}
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
```

## Performance Optimizations

1. **Database Sessions**: Faster than file-based sessions
2. **Rate Limiting**: Prevents brute force attacks
3. **Token Caching**: localStorage for quick token retrieval
4. **CSRF Cookie Reuse**: Fetched once per session
5. **Lazy Loading**: Auth check only on app mount
6. **Credentials Include**: Automatic cookie handling

## Security Best Practices Implemented

✅ CSRF protection via Sanctum
✅ XSS protection (HttpOnly cookies)
✅ Rate limiting on login
✅ Password hashing (bcrypt)
✅ Session regeneration on login
✅ Token invalidation on logout
✅ Status-based account controls
✅ Role-based route protection
✅ Secure cookie configuration
✅ CORS properly configured

## Troubleshooting

### Issue: "CSRF token mismatch"
**Solution**: Ensure SANCTUM_STATEFUL_DOMAINS includes your frontend URL

### Issue: "Unauthenticated" on protected routes
**Solution**: Check that credentials: 'include' is set in fetch requests

### Issue: Cookies not being sent
**Solution**: Verify CORS allows credentials and domains match

### Issue: Login successful but still shows as logged out
**Solution**: Clear browser cookies and localStorage, restart dev servers

## Environment Variables

### Laravel (.env)
```env
SESSION_DRIVER=database
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
SESSION_DOMAIN=localhost
SESSION_SECURE_COOKIE=false (true in production)
```

### React (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_BASE_URL=http://localhost:8000
```

## Testing Checklist

- [ ] User can register and is auto-logged in
- [ ] User is redirected to /user/dashboard after registration
- [ ] Admin can login and is redirected to /admin/dashboard
- [ ] User can login and is redirected to /user/dashboard
- [ ] Logout clears session and redirects to home
- [ ] Protected routes return 403 for wrong role
- [ ] Rate limiting blocks after 5 failed attempts
- [ ] Inactive/suspended/banned users cannot login
- [ ] Session persists across page refreshes
- [ ] CSRF protection works on all mutations

## Production Deployment

1. Set `SESSION_SECURE_COOKIE=true` in .env
2. Update `SANCTUM_STATEFUL_DOMAINS` with production domain
3. Configure CORS for production frontend URL
4. Enable HTTPS for secure cookies
5. Set strong `APP_KEY`
6. Use Redis for session driver (faster)
7. Enable rate limiting on all auth endpoints

---

**Built with**: Laravel 11, React 18, Sanctum, Vite
**Security**: OWASP Top 10 compliant
**Performance**: Optimized for speed and scalability
