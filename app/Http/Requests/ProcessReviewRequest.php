<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcessReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                Rule::in([
                    'published',
                    'hidden',
                    'rejected',
                ]),
            ],

            'moderation_note' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status review wajib dipilih.',
            'status.in' => 'Status review tidak valid.',
            'moderation_note.max' => 'Catatan moderasi maksimal 2000 karakter.',
        ];
    }
}