# TravelQuest Test Credentials

## Admin Account
- **Email:** `admin@travelquest.com`
- **Password:** `Admin@123`
- **Role:** Administrator
- **Access:** Full system access including admin dashboard, destinations management, user management, etc.

## Test User Account
- **Email:** `user@travelquest.com`
- **Password:** `User@123`
- **Role:** Regular User
- **Access:** User dashboard, map explorer, check-ins, rewards, etc.
- **Starting Points:** 2,450 points
- **Level:** 5

## Login Instructions

1. Navigate to the homepage
2. Click "Login" button
3. Enter one of the credentials above
4. You will be automatically redirected to the appropriate dashboard based on your role

## Security Notes

⚠️ **Important:** These are test credentials for development purposes only. 
- Change the default passwords in production
- Do not use these credentials in a live environment
- The passwords follow the validation rules: minimum 8 characters, mixed case, and numbers

## Error Messages

The system now provides specific error notifications:
- ❌ "No account found with this email address" - Email doesn't exist
- 🔒 "The password you entered is incorrect" - Wrong password
- ⚠️ Account status messages for inactive/suspended/banned accounts
- 🚫 Rate limiting after 5 failed attempts

## Re-seeding

To recreate these accounts if needed:
```bash
cd laravel-backend
php artisan db:seed --class=AdminUserSeeder
```

To seed all database tables:
```bash
php artisan db:seed
```
