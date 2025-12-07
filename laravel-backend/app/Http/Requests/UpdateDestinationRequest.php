<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDestinationRequest extends FormRequest
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
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:destination_categories,category_id',
            'description' => 'nullable|string',
            'street_address' => 'nullable|string|max:255',
            'barangay' => 'nullable|string|max:100',
            'city' => 'sometimes|required|string|max:100',
            'province' => 'sometimes|required|string|max:100',
            'region' => 'sometimes|required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:500',
            'amenities' => 'nullable|array',
            'amenities.*.name' => 'required_with:amenities|string',
            'amenities.*.icon' => 'nullable|string',
            'points_reward' => 'nullable|integer|min:0',
            'visit_radius' => 'nullable|integer|min:10|max:1000',
            'status' => 'sometimes|required|in:active,inactive,pending',
            'qr_code' => 'nullable|string|max:255',
            'qr_code_image_url' => 'nullable|string|max:500',
            'owner_id' => 'nullable|exists:users,id',
        ];
    }
}
