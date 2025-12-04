<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRewardRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization is handled by admin middleware
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
            'category_id' => ['required', 'integer', 'exists:destination_categories,category_id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:rewards,slug'],
            'description' => ['required', 'string'],
            'terms_conditions' => ['nullable', 'string'],
            'points_required' => ['required', 'integer', 'min:0'],
            'stock_quantity' => ['required_if:stock_unlimited,false', 'integer', 'min:0'],
            'stock_unlimited' => ['required', 'boolean'],
            'max_redemptions_per_user' => ['required', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'redemption_period_days' => ['required', 'integer', 'min:1', 'max:365'],
            'partner_name' => ['nullable', 'string', 'max:255'],
            'partner_logo_url' => ['nullable', 'url', 'max:500'],
            'partner_contact' => ['nullable', 'string', 'max:255'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'Please select a reward category.',
            'category_id.exists' => 'The selected category does not exist.',
            'points_required.min' => 'Points required must be at least 0.',
            'stock_quantity.required_if' => 'Stock quantity is required when stock is not unlimited.',
            'valid_until.after_or_equal' => 'End date must be after or equal to start date.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Auto-generate slug if not provided
        if (!$this->has('slug') && $this->has('title')) {
            $this->merge(['slug' => \Illuminate\Support\Str::slug($this->title)]);
        }

        // Set defaults
        $defaults = [];
        
        if (!$this->has('is_active')) $defaults['is_active'] = true;
        if (!$this->has('is_featured')) $defaults['is_featured'] = false;
        if (!$this->has('redemption_period_days')) $defaults['redemption_period_days'] = 30;
        if (!$this->has('max_redemptions_per_user')) $defaults['max_redemptions_per_user'] = 1;
        if (!$this->has('stock_unlimited')) $defaults['stock_unlimited'] = false;
        
        if (!empty($defaults)) {
            $this->merge($defaults);
        }

        // Handle boolean conversion for stock_unlimited
        if ($this->has('stock_unlimited')) {
            $value = $this->stock_unlimited;
            if (is_string($value)) {
                $value = strtolower($value) === 'true' || $value === '1';
            }
            $this->merge(['stock_unlimited' => (bool) $value]);
        }

        // If stock unlimited, set quantity to 0
        if ($this->stock_unlimited) {
            $this->merge(['stock_quantity' => 0]);
        }
    }
}
