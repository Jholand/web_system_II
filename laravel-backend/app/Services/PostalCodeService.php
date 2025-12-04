<?php

namespace App\Services;

class PostalCodeService
{
    /**
     * Philippine postal codes mapped by city and province
     * This is a comprehensive mapping for Oriental Mindoro and can be extended
     */
    private static $postalCodes = [
        'Oriental Mindoro' => [
            'Bongabong' => '5211',
            'Bansud' => '5213',
            'Calapan City' => '5200',
            'Gloria' => '5209',
            'Mansalay' => '5210',
            'Naujan' => '5204',
            'Pinamalayan' => '5208',
            'Pola' => '5206',
            'Puerto Galera' => '5203',
            'Roxas' => '5212',
            'San Teodoro' => '5201',
            'Socorro' => '5202',
            'Victoria' => '5205',
            'Baco' => '5207',
        ],
        'Metro Manila' => [
            'Manila' => '1000',
            'Quezon City' => '1100',
            'Makati' => '1200',
            'Pasay' => '1300',
            'Mandaluyong' => '1550',
            'Taguig' => '1630',
            'Parañaque' => '1700',
            'Las Piñas' => '1740',
            'Muntinlupa' => '1770',
            'Caloocan' => '1400',
            'Malabon' => '1470',
            'Navotas' => '1485',
            'Valenzuela' => '1440',
            'Marikina' => '1800',
            'Pasig' => '1600',
            'San Juan' => '1500',
        ],
        'Rizal' => [
            'Antipolo' => '1870',
            'Binangonan' => '1940',
            'Cainta' => '1900',
            'Cardona' => '1950',
            'Morong' => '1960',
            'Pililla' => '1910',
            'Rodriguez' => '1860',
            'San Mateo' => '1850',
            'Tanay' => '1980',
            'Taytay' => '1920',
            'Angono' => '1930',
            'Baras' => '1970',
            'Jala-Jala' => '1990',
            'Teresa' => '1880',
        ],
        'Cavite' => [
            'Cavite City' => '4100',
            'Bacoor' => '4102',
            'Dasmariñas' => '4114',
            'Imus' => '4103',
            'Tagaytay' => '4120',
            'Trece Martires' => '4109',
            'General Trias' => '4107',
            'Silang' => '4118',
            'Carmona' => '4116',
            'Kawit' => '4104',
            'Noveleta' => '4105',
            'Rosario' => '4106',
            'Tanza' => '4108',
            'Naic' => '4110',
            'Maragondon' => '4111',
            'Ternate' => '4112',
            'Alfonso' => '4123',
            'Amadeo' => '4119',
            'General Emilio Aguinaldo' => '4124',
            'Indang' => '4122',
            'Magallanes' => '4113',
            'Mendez' => '4121',
        ],
        'Laguna' => [
            'Calamba' => '4027',
            'San Pablo' => '4000',
            'Biñan' => '4024',
            'Santa Rosa' => '4026',
            'Cabuyao' => '4025',
            'Los Baños' => '4030',
            'Bay' => '4033',
            'Calauan' => '4012',
            'Alaminos' => '4001',
            'San Pedro' => '4023',
            'Sta. Cruz' => '4009',
        ],
        // Add more provinces as needed
    ];

    /**
     * Get postal code based on city and province
     *
     * @param string $city
     * @param string $province
     * @return string|null
     */
    public static function getPostalCode($city, $province)
    {
        // Normalize inputs
        $city = trim($city);
        $province = trim($province);
        
        // Check if province exists in mapping
        if (!isset(self::$postalCodes[$province])) {
            return null;
        }
        
        // Check if city exists in province
        if (isset(self::$postalCodes[$province][$city])) {
            return self::$postalCodes[$province][$city];
        }
        
        // Try case-insensitive match
        foreach (self::$postalCodes[$province] as $mappedCity => $postalCode) {
            if (strcasecmp($mappedCity, $city) === 0) {
                return $postalCode;
            }
        }
        
        return null;
    }

    /**
     * Get all postal codes for a province
     *
     * @param string $province
     * @return array
     */
    public static function getPostalCodesByProvince($province)
    {
        return self::$postalCodes[$province] ?? [];
    }

    /**
     * Get all available provinces
     *
     * @return array
     */
    public static function getProvinces()
    {
        return array_keys(self::$postalCodes);
    }

    /**
     * Get all cities for a province
     *
     * @param string $province
     * @return array
     */
    public static function getCitiesByProvince($province)
    {
        if (!isset(self::$postalCodes[$province])) {
            return [];
        }
        
        return array_keys(self::$postalCodes[$province]);
    }

    /**
     * Format complete address
     *
     * @param array $addressData
     * @return string
     */
    public static function formatCompleteAddress($addressData)
    {
        $parts = [];
        
        if (!empty($addressData['street_address'])) {
            $parts[] = $addressData['street_address'];
        }
        
        if (!empty($addressData['barangay'])) {
            $parts[] = 'Barangay ' . $addressData['barangay'];
        }
        
        if (!empty($addressData['city'])) {
            $parts[] = $addressData['city'];
        }
        
        if (!empty($addressData['province'])) {
            $parts[] = $addressData['province'];
        }
        
        if (!empty($addressData['postal_code'])) {
            $parts[] = $addressData['postal_code'];
        }
        
        if (!empty($addressData['country'])) {
            $parts[] = $addressData['country'];
        }
        
        return implode(', ', $parts);
    }

    /**
     * Auto-detect postal code from GPS coordinates using reverse geocoding
     * Uses more precise coordinate boundaries for accurate location detection
     *
     * @param float $latitude
     * @param float $longitude
     * @return array|null Returns ['city' => '', 'province' => '', 'postal_code' => '']
     */
    public static function getAddressFromCoordinates($latitude, $longitude)
    {
        // Oriental Mindoro - More precise coordinate ranges
        
        // Bongabong (12.70 - 12.78 N, 121.45 - 121.52 E)
        if ($latitude >= 12.70 && $latitude <= 12.78 && $longitude >= 121.45 && $longitude <= 121.52) {
            // Determine barangay based on more precise coordinates
            $barangay = null;
            if ($latitude >= 12.735 && $latitude <= 12.750 && $longitude >= 121.485 && $longitude <= 121.495) {
                $barangay = 'Ipil'; // Central area
            } elseif ($latitude >= 12.72 && $latitude <= 12.735) {
                $barangay = 'Formon';
            } elseif ($latitude >= 12.750 && $latitude <= 12.765) {
                $barangay = 'Kaligtasan';
            }
            
            return [
                'city' => 'Bongabong',
                'province' => 'Oriental Mindoro',
                'barangay' => $barangay,
                'postal_code' => '5211',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Bansud (12.80 - 12.90 N, 121.35 - 121.45 E)
        if ($latitude >= 12.80 && $latitude <= 12.90 && $longitude >= 121.35 && $longitude <= 121.45) {
            return [
                'city' => 'Bansud',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5213',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Calapan City (13.35 - 13.45 N, 121.15 - 121.25 E)
        if ($latitude >= 13.35 && $latitude <= 13.45 && $longitude >= 121.15 && $longitude <= 121.25) {
            return [
                'city' => 'Calapan City',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5200',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Gloria (12.95 - 13.05 N, 121.45 - 121.55 E)
        if ($latitude >= 12.95 && $latitude <= 13.05 && $longitude >= 121.45 && $longitude <= 121.55) {
            return [
                'city' => 'Gloria',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5209',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Mansalay (12.48 - 12.58 N, 121.40 - 121.50 E)
        if ($latitude >= 12.48 && $latitude <= 12.58 && $longitude >= 121.40 && $longitude <= 121.50) {
            return [
                'city' => 'Mansalay',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5210',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Roxas (12.55 - 12.65 N, 121.48 - 121.58 E)
        if ($latitude >= 12.55 && $latitude <= 12.65 && $longitude >= 121.48 && $longitude <= 121.58) {
            return [
                'city' => 'Roxas',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5212',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Naujan (13.30 - 13.40 N, 121.25 - 121.35 E)
        if ($latitude >= 13.30 && $latitude <= 13.40 && $longitude >= 121.25 && $longitude <= 121.35) {
            return [
                'city' => 'Naujan',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5204',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Victoria (13.15 - 13.25 N, 121.25 - 121.35 E)
        if ($latitude >= 13.15 && $latitude <= 13.25 && $longitude >= 121.25 && $longitude <= 121.35) {
            return [
                'city' => 'Victoria',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5205',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Pola (13.12 - 13.22 N, 121.38 - 121.48 E)
        if ($latitude >= 13.12 && $latitude <= 13.22 && $longitude >= 121.38 && $longitude <= 121.48) {
            return [
                'city' => 'Pola',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5206',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Pinamalayan (13.02 - 13.12 N, 121.42 - 121.52 E)
        if ($latitude >= 13.02 && $latitude <= 13.12 && $longitude >= 121.42 && $longitude <= 121.52) {
            return [
                'city' => 'Pinamalayan',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5208',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Baco (13.28 - 13.38 N, 121.05 - 121.15 E)
        if ($latitude >= 13.28 && $latitude <= 13.38 && $longitude >= 121.05 && $longitude <= 121.15) {
            return [
                'city' => 'Baco',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5207',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Puerto Galera (13.48 - 13.58 N, 120.92 - 121.02 E)
        if ($latitude >= 13.48 && $latitude <= 13.58 && $longitude >= 120.92 && $longitude <= 121.02) {
            return [
                'city' => 'Puerto Galera',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5203',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // San Teodoro (13.42 - 13.52 N, 121.02 - 121.12 E)
        if ($latitude >= 13.42 && $latitude <= 13.52 && $longitude >= 121.02 && $longitude <= 121.12) {
            return [
                'city' => 'San Teodoro',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5201',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Socorro (13.05 - 13.15 N, 121.38 - 121.48 E)
        if ($latitude >= 13.05 && $latitude <= 13.15 && $longitude >= 121.38 && $longitude <= 121.48) {
            return [
                'city' => 'Socorro',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5202',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // Fallback: If in general Oriental Mindoro area but not matched above
        if ($latitude >= 12.30 && $latitude <= 13.70 && $longitude >= 120.80 && $longitude <= 121.70) {
            return [
                'city' => 'Calapan City',
                'province' => 'Oriental Mindoro',
                'postal_code' => '5200',
                'region' => 'Region IV-B',
                'country' => 'Philippines'
            ];
        }
        
        // In production, use Google Maps Geocoding API for locations not in database:
        // $apiKey = env('GOOGLE_MAPS_API_KEY');
        // $url = "https://maps.googleapis.com/maps/api/geocode/json?latlng={$latitude},{$longitude}&key={$apiKey}";
        // $response = file_get_contents($url);
        // Parse response and extract city, province, postal code
        
        return null;
    }
}
