<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCheckinRequest extends FormRequest
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
            'destination_id' => ['required', 'integer', 'exists:destinations,destination_id'],
            'checkin_method' => ['required', 'in:qr_code,gps,manual'],
            'qr_code_scanned' => ['required_if:checkin_method,qr_code', 'string', 'max:100'],
            'user_latitude' => ['required', 'numeric', 'between:-90,90'],
            'user_longitude' => ['required', 'numeric', 'between:-180,180'],
            'photo' => ['nullable', 'image', 'max:5120'], // 5MB max
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'destination_id.required' => 'Destination is required for check-in.',
            'destination_id.exists' => 'The selected destination does not exist.',
            'qr_code_scanned.required_if' => 'QR code is required for QR check-in.',
            'user_latitude.required' => 'Location is required for check-in.',
            'user_latitude.between' => 'Invalid latitude value.',
            'user_longitude.between' => 'Invalid longitude value.',
            'photo.max' => 'Photo size must not exceed 5MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert string coordinates to floats
        if ($this->has('user_latitude')) {
            $this->merge([
                'user_latitude' => (float) $this->user_latitude,
            ]);
        }

        if ($this->has('user_longitude')) {
            $this->merge([
                'user_longitude' => (float) $this->user_longitude,
            ]);
        }
    }
}
