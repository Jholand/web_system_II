<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class UpdateBadgeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Add proper authorization logic
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $badgeId = $this->route('badge');

        return [
            'category_id' => ['nullable', 'integer', 'min:1', 'max:255', 'exists:destination_categories,category_id'],
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'slug' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('badges', 'slug')->ignore($badgeId)],
            'description' => ['sometimes', 'required', 'string'],
            'icon' => ['nullable'], // Can be file or string, processed in prepareForValidation
            'color' => ['nullable', 'string', 'max:50', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'requirement_type' => ['sometimes', 'required', Rule::in(['visits', 'points', 'checkins', 'categories', 'custom'])],
            'requirement_value' => ['sometimes', 'required', 'integer', 'min:1'],
            'requirement_details' => ['nullable', 'array'],
            'points_reward' => ['nullable', 'integer', 'min:0'],
            'rarity' => ['nullable', Rule::in(['common', 'uncommon', 'rare', 'epic', 'legendary'])],
            'display_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
            'is_hidden' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Badge name is required.',
            'slug.required' => 'Badge slug is required.',
            'slug.unique' => 'This slug is already taken.',
            'description.required' => 'Badge description is required.',
            'color.regex' => 'Color must be a valid hex color code (e.g., #FF5733).',
            'requirement_type.required' => 'Requirement type is required.',
            'requirement_type.in' => 'Invalid requirement type.',
            'requirement_value.required' => 'Requirement value is required.',
            'requirement_value.min' => 'Requirement value must be at least 1.',
            'category_id.exists' => 'Selected category does not exist.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Don't process file uploads here - handled in controller
        
        // Auto-generate slug if name is provided but slug is not
        if ($this->has('name') && !$this->has('slug')) {
            $this->merge([
                'slug' => \Illuminate\Support\Str::slug($this->name),
            ]);
        }
        
        // Ensure is_active is boolean if provided
        if ($this->has('is_active')) {
            $value = $this->is_active;
            if (is_string($value)) {
                $value = strtolower($value) === 'true' || $value === '1';
            } else if (is_numeric($value)) {
                $value = (int)$value === 1;
            }
            $this->merge(['is_active' => (bool) $value]);
        }
    }
}
