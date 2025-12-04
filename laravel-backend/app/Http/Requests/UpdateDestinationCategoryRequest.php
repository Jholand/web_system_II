<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDestinationCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Add proper authorization logic if needed
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'category_name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('destination_categories', 'category_name')->ignore($this->route('category'), 'category_id'),
            ],
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ];

        // Icon can be either a file upload or a text string (emoji)
        if ($this->hasFile('icon')) {
            $rules['icon'] = 'nullable|file|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048';
        } else {
            $rules['icon'] = 'nullable|string|max:10';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category_name.required' => 'Category name is required',
            'category_name.unique' => 'This category name already exists',
            'category_name.max' => 'Category name must not exceed 100 characters',
            'description.max' => 'Description must not exceed 500 characters',
        ];
    }
}
