# Address and Postal Code Auto-Population System

## Overview
The address system has been updated to automatically populate postal codes based on city and province, and to combine street address and barangay into a single field for easier management.

## Database Changes

### New Column
- **`full_address`**: Automatically combines `street_address` and `barangay` (formatted as "Barangay [name]")

### Existing Columns (Still Available)
- `street_address`: Street name and number
- `barangay`: Barangay name
- `city`: City/Municipality name
- `province`: Province name
- `region`: Region (e.g., "Region IV-B")
- `postal_code`: Auto-populated based on city and province
- `country`: Defaults to "Philippines"

## Automatic Features

### 1. Postal Code Auto-Population
When you create or update a destination with city and province, the postal code is automatically set:

```php
$destination = new Destination();
$destination->city = 'Bongabong';
$destination->province = 'Oriental Mindoro';
$destination->save();
// postal_code is automatically set to '5211'
```

### 2. Full Address Auto-Generation
When you provide street_address and/or barangay, they are automatically combined into `full_address`:

```php
$destination->street_address = 'Purok 3';
$destination->barangay = 'Ipil';
$destination->save();
// full_address is automatically set to "Purok 3, Barangay Ipil"
```

## Supported Postal Codes

### Oriental Mindoro
- **Bongabong**: 5211
- **Calapan City**: 5200
- **Gloria**: 5209
- **Mansalay**: 5210
- **Naujan**: 5204
- **Pinamalayan**: 5208
- **Pola**: 5206
- **Puerto Galera**: 5203
- **Roxas**: 5212
- **San Teodoro**: 5201
- **Socorro**: 5202
- **Victoria**: 5205
- **Baco**: 5207

### Metro Manila, Rizal, Cavite, Laguna
Additional provinces and cities are supported. See `app/Services/PostalCodeService.php` for the complete list.

## API Endpoints

### 1. Get Postal Code
**POST** `/api/address/postal-code`

Get postal code for a specific city and province.

**Request:**
```json
{
  "city": "Bongabong",
  "province": "Oriental Mindoro"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "city": "Bongabong",
    "province": "Oriental Mindoro",
    "postal_code": "5211"
  }
}
```

### 2. Get Address from GPS Coordinates
**POST** `/api/address/from-gps`

Get address information from GPS coordinates (latitude/longitude).

**Request:**
```json
{
  "latitude": 12.74257400,
  "longitude": 121.49007900
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "city": "Bongabong",
    "province": "Oriental Mindoro",
    "postal_code": "5211",
    "region": "Region IV-B",
    "country": "Philippines"
  }
}
```

### 3. Get All Provinces
**GET** `/api/address/provinces`

Get all supported provinces with their cities and postal codes.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "province": "Oriental Mindoro",
      "cities": {
        "Bongabong": "5211",
        "Calapan City": "5200",
        "Gloria": "5209"
        // ... more cities
      }
    }
    // ... more provinces
  ]
}
```

### 4. Get Cities by Province
**POST** `/api/address/cities`

Get all cities for a specific province.

**Request:**
```json
{
  "province": "Oriental Mindoro"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "province": "Oriental Mindoro",
    "cities": [
      "Bongabong",
      "Calapan City",
      "Gloria",
      "Mansalay",
      "Naujan"
      // ... more cities
    ]
  }
}
```

### 5. Format Complete Address
**POST** `/api/address/format`

Format a complete address from components and auto-populate postal code.

**Request:**
```json
{
  "street_address": "Purok 3",
  "barangay": "Ipil",
  "city": "Bongabong",
  "province": "Oriental Mindoro"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address_components": {
      "street_address": "Purok 3",
      "barangay": "Ipil",
      "city": "Bongabong",
      "province": "Oriental Mindoro",
      "postal_code": "5211",
      "country": "Philippines"
    },
    "formatted_address": "Purok 3, Barangay Ipil, Bongabong, Oriental Mindoro, 5211, Philippines"
  }
}
```

## Usage Examples

### Creating a Destination with GPS Coordinates
When a user uses GPS to add a location:

1. **Get address from GPS:**
```javascript
const response = await fetch('/api/address/from-gps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    latitude: 12.74257400,
    longitude: 121.49007900
  })
});

const { data } = await response.json();
// data contains: city, province, postal_code, region, country
```

2. **Create destination with auto-populated data:**
```javascript
const destination = {
  name: "Testingsss",
  street_address: "Purok 3",
  barangay: "Ipil",
  city: data.city,           // "Bongabong"
  province: data.province,   // "Oriental Mindoro"
  region: data.region,       // "Region IV-B"
  postal_code: data.postal_code,  // "5211" - auto-populated
  country: data.country,     // "Philippines"
  latitude: 12.74257400,
  longitude: 121.49007900
};

// When saved, full_address will be auto-generated:
// "Purok 3, Barangay Ipil"
```

### Manual Address Entry
When a user manually enters an address:

1. **Select province** → Get cities for that province
2. **Select city** → Postal code is automatically populated
3. **Enter street address and barangay** → Full address is auto-generated

## Model Usage

### Get Complete Formatted Address
The Destination model has a `complete_address` attribute:

```php
$destination = Destination::find(1);
echo $destination->complete_address;
// Output: "Purok 3, Barangay Ipil, Bongabong, Oriental Mindoro, 5211, Philippines"
```

### Accessing Individual Fields
```php
$destination->street_address;  // "Purok 3"
$destination->barangay;        // "Ipil"
$destination->full_address;    // "Purok 3, Barangay Ipil"
$destination->city;            // "Bongabong"
$destination->province;        // "Oriental Mindoro"
$destination->postal_code;     // "5211"
```

## Adding More Postal Codes

To add more cities and postal codes, edit `app/Services/PostalCodeService.php`:

```php
private static $postalCodes = [
    'Your Province' => [
        'City Name' => 'Postal Code',
        // Add more cities...
    ],
    // Add more provinces...
];
```

## Future Enhancements

### Google Maps Integration (Optional)
For more accurate GPS-to-address conversion, you can integrate Google Maps Geocoding API:

1. Add Google Maps API key to `.env`:
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. Update `PostalCodeService::getAddressFromCoordinates()` to use the API
3. This will provide real-time address lookup for any GPS coordinate

## Benefits

✅ **Automatic Postal Codes**: No need to remember or look up postal codes
✅ **GPS Integration**: Get complete address from GPS coordinates
✅ **Simplified Data Entry**: Combined address field reduces complexity
✅ **Data Consistency**: Standardized address format across all destinations
✅ **Easy Maintenance**: Add new postal codes in one central location

## Example Complete Address

**Input:**
- Street Address: "Purok 3"
- Barangay: "Ipil"
- City: "Bongabong"
- Province: "Oriental Mindoro"

**Auto-Generated:**
- Full Address: "Purok 3, Barangay Ipil"
- Postal Code: "5211"

**Complete Display:**
"Purok 3, Barangay Ipil, Bongabong, Oriental Mindoro, 5211, Philippines"
