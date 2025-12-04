<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRewardRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization is handled by admin middleware, always return true here
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rewardId = $this->route('reward')?->id ?? $this->route('reward');

        return [
            'category_id' => ['sometimes', 'integer', 'exists:destination_categories,category_id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:rewards,slug,' . $rewardId],
            'description' => ['sometimes', 'string'],
            'terms_conditions' => ['nullable', 'string'],
            'points_required' => ['sometimes', 'integer', 'min:0'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
            'stock_unlimited' => ['sometimes', 'boolean'],
            'max_redemptions_per_user' => ['sometimes', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'redemption_period_days' => ['sometimes', 'integer', 'min:1', 'max:365'],
            'partner_name' => ['nullable', 'string', 'max:255'],
            'partner_logo_url' => ['nullable', 'url', 'max:500'],
            'partner_contact' => ['nullable', 'string', 'max:255'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Auto-generate slug if title updated but slug not provided
        if ($this->has('title') && !$this->has('slug')) {
            $this->merge(['slug' => \Illuminate\Support\Str::slug($this->title)]);
        }

        // Handle boolean conversion
        if ($this->has('stock_unlimited')) {
            $value = $this->stock_unlimited;
            if (is_string($value)) {
                $value = strtolower($value) === 'true' || $value === '1';
            }
            $this->merge(['stock_unlimited' => (bool) $value]);
        }

        // If stock unlimited, set quantity to 0
        if ($this->has('stock_unlimited') && $this->stock_unlimited) {
            $this->merge(['stock_quantity' => 0]);
        }
    }
}
