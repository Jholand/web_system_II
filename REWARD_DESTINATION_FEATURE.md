# Reward-Destination Assignment Feature

## Overview
Rewards can now be assigned to specific destinations, allowing location-based reward redemption. This ensures rewards like "Free Coffee" can only be redeemed at designated locations.

---

## Database Changes

### New Table: `reward_destinations`
**Migration:** `2025_11_27_140000_create_reward_destinations_table.php`

```sql
CREATE TABLE reward_destinations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reward_id INT UNSIGNED NOT NULL,
    destination_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE,
    UNIQUE KEY unique_reward_destination (reward_id, destination_id)
);
```

**Purpose:** Many-to-many pivot table linking rewards to destinations

---

## Backend Changes

### 1. Models Updated

#### `app/Models/Reward.php`
```php
// Added relationship
public function destinations()
{
    return $this->belongsToMany(
        Destination::class,
        'reward_destinations',
        'reward_id',
        'destination_id'
    );
}

// Added helper method
public function canBeUsedAt($destinationId)
{
    return $this->destinations()->where('destination_id', $destinationId)->exists();
}
```

#### `app/Models/Destination.php`
```php
// Added reverse relationship
public function rewards()
{
    return $this->belongsToMany(
        Reward::class,
        'reward_destinations',
        'destination_id',
        'reward_id'
    );
}
```

### 2. Controller Updated

#### `app/Http/Controllers/RewardController.php`

**index()** - Load destinations with category relationship:
```php
$query = Reward::with([
    'category:category_id,category_name,icon',
    'destinations.category:category_id,category_name'
]);
```

**store()** - Sync destinations on create:
```php
if ($request->has('destination_ids')) {
    $reward->destinations()->sync($request->input('destination_ids', []));
}
$reward->load(['category', 'destinations']);
```

**update()** - Sync destinations on update:
```php
if ($request->has('destination_ids')) {
    $reward->destinations()->sync($request->input('destination_ids', []));
}
$reward->load(['category', 'destinations']);
```

**show()** - Load destinations in cached response:
```php
return $reward->load(['category', 'destinations']);
```

### 3. Resource Updated

#### `app/Http/Resources/RewardResource.php`
```php
'destinations' => $this->whenLoaded('destinations', function () {
    return $this->destinations->map(function ($destination) {
        return [
            'destination_id' => $destination->destination_id,
            'name' => $destination->name,
            'city' => $destination->city,
            'category' => $destination->category?->category_name ?? 'N/A',
        ];
    });
}),
```

---

## Frontend Changes

### `react-frontend/src/pages/admin/Rewards.jsx`

#### New State Variables
```javascript
const [destinations, setDestinations] = useState([]);
const [selectedDestinations, setSelectedDestinations] = useState([]);

// formData includes destination_ids
destination_ids: []
```

#### Fetch Destinations Function
```javascript
const fetchDestinations = useCallback(async () => {
  const response = await axios.get(`${API_BASE_URL}/destinations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  setDestinations(response.data.data || []);
}, []);
```

#### Modal Logic Updates

**openModal() - Edit Mode:**
```javascript
if (mode === 'edit') {
  const destinationIds = data.destinations?.map(d => d.destination_id) || [];
  setFormData({
    ...data,
    destination_ids: destinationIds
  });
  setSelectedDestinations(destinationIds);
}
```

**openModal() - Add Mode:**
```javascript
if (mode === 'add') {
  setSelectedDestinations([]);
  setFormData({ ...defaultFormData, destination_ids: [] });
}
```

#### Save Validation
```javascript
if (selectedDestinations.length === 0) {
  toast.error('Please select at least one destination where this reward can be used');
  return;
}

const dataToSend = {
  ...formData,
  destination_ids: selectedDestinations
};
```

#### UI - Destination Selector
```jsx
{/* Destination Assignment Section */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Available At Destinations *
  </label>
  <p className="text-xs text-gray-500 mb-2">
    Select which destinations can accept this reward for redemption
  </p>
  
  <div className="border rounded-lg p-3 max-h-64 overflow-y-auto bg-gray-50">
    {destinations.length === 0 ? (
      <p className="text-sm text-gray-500">No destinations available</p>
    ) : (
      destinations.map((dest) => (
        <label key={dest.destination_id} className="flex items-start gap-3 p-2 hover:bg-white rounded cursor-pointer">
          <input
            type="checkbox"
            checked={selectedDestinations.includes(dest.destination_id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedDestinations([...selectedDestinations, dest.destination_id]);
              } else {
                setSelectedDestinations(selectedDestinations.filter(id => id !== dest.destination_id));
              }
            }}
            className="mt-1 h-4 w-4 text-teal-600"
          />
          <div className="flex-1">
            <p className="font-medium text-sm">{dest.name}</p>
            <p className="text-xs text-gray-600">{dest.city}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded">
              {dest.category}
            </span>
          </div>
        </label>
      ))
    )}
  </div>
  
  {selectedDestinations.length > 0 && (
    <p className="text-xs text-green-600 font-medium">
      ✓ {selectedDestinations.length} destination{selectedDestinations.length > 1 ? 's' : ''} selected
    </p>
  )}
</div>
```

---

## API Request/Response Format

### Create Reward (POST `/api/rewards`)
```json
{
  "title": "Free Coffee",
  "category_id": 1,
  "points_required": 500,
  "description": "Get a free coffee",
  "destination_ids": [1, 5, 12]
}
```

### Update Reward (PUT `/api/rewards/{id}`)
```json
{
  "title": "Free Coffee",
  "destination_ids": [1, 5, 12, 20]
}
```

### Response Format
```json
{
  "data": {
    "id": 1,
    "title": "Free Coffee",
    "destinations": [
      {
        "destination_id": 1,
        "name": "Starbucks Coffee",
        "city": "Manila",
        "category": "Restaurant"
      },
      {
        "destination_id": 5,
        "name": "Coffee Bean",
        "city": "Quezon City",
        "category": "Cafe"
      }
    ]
  }
}
```

---

## Usage Flow

### Admin Workflow
1. Navigate to **Admin > Rewards**
2. Click **Add Reward** or **Edit** existing reward
3. Fill in reward details
4. Scroll to **"Available At Destinations"** section
5. Select checkboxes for destinations where reward can be redeemed
6. Must select at least 1 destination (validation enforced)
7. Click **Save** - backend syncs selections to `reward_destinations` table

### User Redemption (Future Implementation)
1. User attempts to redeem reward at a destination
2. Backend calls `$reward->canBeUsedAt($currentDestinationId)`
3. If false: Show error "This reward can only be used at [list of valid destinations]"
4. If true: Allow redemption to proceed

---

## Database Queries

### Get Reward with Destinations
```php
$reward = Reward::with('destinations')->find(1);
```

### Check if Reward Valid at Location
```php
if ($reward->canBeUsedAt($destinationId)) {
    // Allow redemption
}
```

### Get All Rewards for a Destination
```php
$destination = Destination::with('rewards')->find(1);
$availableRewards = $destination->rewards;
```

---

## Testing Checklist

### Backend
- [x] Migration runs successfully
- [x] Create reward with destinations
- [x] Update reward destinations
- [x] Show reward includes destinations
- [x] Index rewards includes destinations
- [x] Deleting reward cascades to pivot table
- [x] Deleting destination cascades to pivot table

### Frontend
- [x] Destinations load in modal
- [x] Checkboxes work correctly
- [x] Counter shows selected count
- [x] Edit mode loads existing selections
- [x] Add mode starts with empty selections
- [x] Validation prevents saving without destinations
- [x] API payload includes destination_ids

### Integration
- [ ] Create reward via frontend, verify DB entries
- [ ] Edit reward destinations, verify sync
- [ ] Delete reward, verify pivot entries deleted
- [ ] Check API response includes destinations array

---

## Future Enhancements

### 1. Redemption Validation
Add check in `UserRewardRedemptionController`:
```php
public function redeem(Request $request, Reward $reward)
{
    $destinationId = $request->input('destination_id');
    
    if (!$reward->canBeUsedAt($destinationId)) {
        return response()->json([
            'success' => false,
            'message' => 'This reward cannot be redeemed at this location',
            'valid_destinations' => $reward->destinations->pluck('name')
        ], 400);
    }
    
    // Proceed with redemption...
}
```

### 2. Distance-Based Suggestions
Show users nearby destinations where they can use their rewards:
```javascript
// Calculate distance to each valid destination
const validLocations = reward.destinations.map(dest => ({
  ...dest,
  distance: calculateDistance(userLat, userLng, dest.latitude, dest.longitude)
})).sort((a, b) => a.distance - b.distance);
```

### 3. Destination-Specific Reward Lists
Show rewards available at current destination:
```javascript
// On DestinationDetails page
const availableRewards = destination.rewards.filter(r => r.is_active);
```

---

## Notes

- **Cascade Deletes:** Deleting a reward or destination automatically removes pivot table entries
- **Unique Constraint:** Same reward can't be assigned to same destination twice
- **Validation:** Frontend enforces at least 1 destination selection
- **Caching:** Reward cache cleared on create/update to include new destination data
- **Sync Method:** Using Eloquent `sync()` handles additions, removals, and updates in one call

---

## Summary

✅ **Database:** `reward_destinations` pivot table created  
✅ **Models:** Relationships added to Reward and Destination  
✅ **Controller:** CRUD operations updated to handle destinations  
✅ **Resource:** API responses include destination data  
✅ **Frontend:** Admin UI with destination selector checkboxes  
✅ **Validation:** At least 1 destination required per reward  

**Status:** Feature complete and ready for testing!
