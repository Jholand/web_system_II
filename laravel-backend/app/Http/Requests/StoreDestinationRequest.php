<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDestinationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:destination_categories,category_id',
            'description' => 'nullable|string',
            'street_address' => 'nullable|string|max:255',
            'barangay' => 'nullable|string|max:100',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'region' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:500',
            'amenities' => 'nullable|array',
            'amenities.*.name' => 'required_with:amenities|string',
            'amenities.*.icon' => 'nullable|string',
            'points_reward' => 'nullable|integer|min:0',
            'visit_radius' => 'nullable|integer|min:10|max:1000',
            'status' => 'required|in:active,inactive,pending',
            'qr_code' => 'nullable|string|max:255',
            'qr_code_image_url' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Destination name is required',
            'category_id.required' => 'Category is required',
            'category_id.exists' => 'Selected category does not exist',
            'city.required' => 'City is required',
            'province.required' => 'Province is required',
            'region.required' => 'Region is required',
            'latitude.required' => 'Latitude coordinate is required',
            'longitude.required' => 'Longitude coordinate is required',
            'latitude.between' => 'Latitude must be between -90 and 90',
            'longitude.between' => 'Longitude must be between -180 and 180',
        ];
    }
}
