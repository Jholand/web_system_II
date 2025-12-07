# Expired Redemptions Handler

## What It Does

Automatically handles expired reward redemptions by:
1. ✅ Marks redemptions as "expired" when valid_until date passes
2. 📦 **Restores stock quantity** back to the reward
3. 💰 **Refunds points** back to the user
4. 📝 Creates transaction record for the refund

## Files Created

### 1. Command: `HandleExpiredRedemptions.php`
**Location:** `laravel-backend/app/Console/Commands/HandleExpiredRedemptions.php`

**What it does:**
- Finds all active/pending redemptions where `valid_until < now()`
- For each expired redemption:
  - Sets status to 'expired'
  - Increments reward stock_quantity (+1)
  - Decrements total_redeemed (-1)
  - Adds points back to user's total_points
  - Creates UserPointsTransaction record with type 'refunded'

### 2. Scheduler Registration
**Location:** `laravel-backend/routes/console.php`

**Schedule:** Runs automatically every hour
```php
Schedule::command('redemptions:handle-expired')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground();
```

### 3. Manual Run Script
**File:** `handle-expired-redemptions.bat`

**Usage:** Double-click to manually process expired redemptions

## Manual Testing

Run the command manually:
```bash
cd laravel-backend
php artisan redemptions:handle-expired
```

Or double-click: `handle-expired-redemptions.bat`

## Automatic Scheduling

For the scheduler to run automatically, you need ONE of these:

### Option 1: Windows Task Scheduler (Recommended for XAMPP)
1. Open Task Scheduler
2. Create new task: "Laravel Scheduler"
3. Trigger: Every 1 minute
4. Action: Run program
   - Program: `C:\xampp\php\php.exe`
   - Arguments: `artisan schedule:run`
   - Start in: `C:\xampp\htdocs\Jeyeeem's files\web_system_II\laravel-backend`

### Option 2: Manual Cron (For Testing)
Run this every hour manually:
```bash
php artisan redemptions:handle-expired
```

### Option 3: Keep Terminal Open
Run the scheduler in a terminal:
```bash
cd laravel-backend
php artisan schedule:work
```

## Frontend Changes

### OwnerRedemptions.jsx
- Destination field is now **readonly/disabled** when auto-selected
- Shows "First destination auto-selected" for non-redemption-specific destinations
- Shows "Auto-selected - Reward was redeemed for this destination" for locked destinations

## How It Works

### Example Scenario:

1. **User redeems reward** (Dec 8, 1:00 AM)
   - Points deducted: 100
   - Stock quantity: 50 → 49
   - Valid until: Dec 9, 1:00 AM (24 hours)

2. **Redemption expires** (Dec 9, 1:00 AM)
   - Command runs automatically via scheduler

3. **Handler processes it:**
   - Status: active → expired
   - Stock quantity: 49 → 50 (restored)
   - User points: increased by 100 (refunded)
   - Transaction created: "Refund for expired reward: {Reward Title}"

4. **Result:**
   - User gets points back
   - Reward stock available again
   - Transaction history shows refund

## Database Changes

### UserPointsTransaction
New transaction type: `'refunded'`
```php
[
    'transaction_type' => 'refunded',
    'description' => 'Refund for expired reward: {reward title}',
    'reference_type' => 'reward_expiration',
    'reference_id' => {redemption_id}
]
```

## Verification

Check if it's working:

1. **Check for expired redemptions:**
```sql
SELECT * FROM user_reward_redemptions 
WHERE status IN ('active', 'pending') 
AND valid_until < NOW();
```

2. **Run the command:**
```bash
php artisan redemptions:handle-expired
```

3. **Verify results:**
```sql
-- Should now be 'expired'
SELECT status FROM user_reward_redemptions WHERE id = {id};

-- Stock should increase
SELECT stock_quantity FROM rewards WHERE id = {reward_id};

-- User points should increase
SELECT total_points FROM users WHERE id = {user_id};

-- Transaction created
SELECT * FROM user_points_transactions 
WHERE reference_type = 'reward_expiration';
```

## Summary

✅ **Fixed: Readonly destination field** - Can't change auto-selected destination
✅ **Fixed: Expired redemptions restore quantity** - Stock returns when expired
✅ **Fixed: Points refunded** - Users get points back when redemption expires
✅ **Automatic scheduling** - Runs every hour via Laravel scheduler
✅ **Manual option** - Can run `handle-expired-redemptions.bat` anytime

**Important:** For automatic scheduling, set up Windows Task Scheduler as described above!
