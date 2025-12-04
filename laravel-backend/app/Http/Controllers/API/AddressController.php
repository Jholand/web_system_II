<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\PostalCodeService;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    /**
     * Get postal code based on city and province
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPostalCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city' => 'required|string',
            'province' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $postalCode = PostalCodeService::getPostalCode(
            $request->city,
            $request->province
        );

        if (!$postalCode) {
            return response()->json([
                'success' => false,
                'message' => 'Postal code not found for the specified city and province'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'city' => $request->city,
                'province' => $request->province,
                'postal_code' => $postalCode
            ]
        ]);
    }

    /**
     * Get address information from GPS coordinates
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAddressFromGPS(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $addressInfo = PostalCodeService::getAddressFromCoordinates(
            $request->latitude,
            $request->longitude
        );

        if (!$addressInfo) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to determine address from coordinates. Please enter address manually.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $addressInfo
        ]);
    }

    /**
     * Get all provinces with their cities and postal codes
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProvinces()
    {
        $provinces = PostalCodeService::getProvinces();
        
        $data = [];
        foreach ($provinces as $province) {
            $data[] = [
                'province' => $province,
                'cities' => PostalCodeService::getPostalCodesByProvince($province)
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Get cities for a specific province
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCitiesByProvince(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'province' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $cities = PostalCodeService::getCitiesByProvince($request->province);

        if (empty($cities)) {
            return response()->json([
                'success' => false,
                'message' => 'Province not found or has no cities mapped'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'province' => $request->province,
                'cities' => $cities
            ]
        ]);
    }

    /**
     * Format a complete address from components
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function formatAddress(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'street_address' => 'nullable|string',
            'barangay' => 'nullable|string',
            'city' => 'required|string',
            'province' => 'required|string',
            'country' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Auto-populate postal code
        $postalCode = PostalCodeService::getPostalCode(
            $request->city,
            $request->province
        );

        $addressData = [
            'street_address' => $request->street_address,
            'barangay' => $request->barangay,
            'city' => $request->city,
            'province' => $request->province,
            'postal_code' => $postalCode,
            'country' => $request->country ?? 'Philippines',
        ];

        $formattedAddress = PostalCodeService::formatCompleteAddress($addressData);

        return response()->json([
            'success' => true,
            'data' => [
                'address_components' => $addressData,
                'formatted_address' => $formattedAddress
            ]
        ]);
    }
}
